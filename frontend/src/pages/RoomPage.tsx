import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { GenreSelection } from '../components/GenereSelection';
import { MovieCard } from '../components/MovieCard';
import { Match } from '../components/Match';
import { io, Socket } from 'socket.io-client';

const API_KEY = '71f7f6476134395a903c744cc11d6073'; // Replace with your TMDB API key
const socket: Socket = io('http://localhost:5001');
const genreMap: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Science Fiction': 878,
  'TV Movie': 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [genre, setGenre] = useState<string | null>(null);
  const [movies, setMovies] = useState<{ title: string; year: number; platforms?: string[] }[]>([]);
  const [currentMovie, setCurrentMovie] = useState<number>(0);
  const [matchedMovie, setMatchedMovie] = useState<{ title: string; platforms: string[] } | null>(null);

  useEffect(() => {
    socket.emit('joinRoom', roomId);

    socket.on('swipeUpdate', (data: any) => {
      if (data.matched) {
        setMatchedMovie(data.movie);
      }
    });

    return () => {
      socket.off('swipeUpdate');
    };
  }, [roomId]);
  const getGenreId = (selectedGenre: string): number => {
    return genreMap[selectedGenre] ; // Return null if the genre is not found
  };
  const handleSelectGenre = async (selectedGenre: string) => {
    setGenre(selectedGenre);
    const genreId = getGenreId(selectedGenre); // Implement this function to map genre name to TMDB genre ID
    const fetchedMovies = await fetchMoviesByGenre(genreId);
    

    // Fetch platform availability for each movie
    const moviesWithPlatforms = await Promise.all(fetchedMovies.map(async (movie: any) => {
      const platforms = await fetchMoviePlatforms(movie.imdb_id);
      console.log(platforms)
      return { title: movie.title, year: new Date(movie.release_date).getFullYear(), platforms };
    }));

    setMovies(moviesWithPlatforms);
  };

  const handleSwipe = (direction: 'right' | 'left') => {
    if (direction === 'right') {
      socket.emit('swipe', { roomId, direction, movie: movies[currentMovie] });
    }
    if (currentMovie < movies.length - 1) {
      setCurrentMovie((prev) => prev + 1);
    }
  };

  return (
    <div className="p-4">
      {!genre ? (
        <GenreSelection onSelectGenre={handleSelectGenre} />
      ) : matchedMovie ? (
        <Match matchedMovie={matchedMovie} />
      ) : (
        <MovieCard movie={movies[currentMovie]} onSwipe={handleSwipe} />
      )}
    </div>
  );
};

const fetchMoviesByGenre = async (genreId: number) => {
  try {
    // First, fetch movies by genre
    const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
      params: {
        api_key: API_KEY,
        with_genres: genreId,
        sort_by: 'release_date.desc',
      }
    });

    const movies = response.data.results;

    // Fetch external IDs (IMDb ID) for each movie
    const moviesWithExternalIds = await Promise.all(movies.map(async (movie: any) => {
      const externalIds = await fetchExternalIds(movie.id); // Fetch IMDb ID and other external IDs
      return {
        ...movie,
        imdb_id: externalIds.imdb_id, // Append IMDb ID to movie data
        external_ids: externalIds
      };
    }));
    console.log(moviesWithExternalIds,'gvfu')
    return moviesWithExternalIds;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

// Function to fetch external IDs (like IMDb ID) for a specific movie
const fetchExternalIds = async (movieId: number) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/external_ids`, {
      params: {
        api_key: API_KEY
      }
    });
    
    return response.data; // This will contain external IDs, including IMDb ID

  } catch (error) {
    console.error('Error fetching external IDs:', error);
    return {};
  }
};

const fetchMoviePlatforms = async (imdbId: string) => {
  try {
    const response = await axios.get(`https://api.reelgood.com/v1.0/content/lookup/movie`, {
      params: {
        id: "tt27550022",  // Pass IMDb ID
       id_type:"IMDB"    // Use appropriate region
      }
    });

    // Assuming Reelgood returns streaming services
    const platforms = response.data.streaming_services.map((service: any) => service.name);
    return platforms;
  } catch (error) {
    console.error('Error fetching movie platforms:', error);
    return [];
  }
};

