import React from 'react';

interface MovieCardProps {
  movie: {
    title: string;
    year: number;
  };
  onSwipe: (direction: 'right' | 'left') => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSwipe }) => {
  return (
    <div className="p-4">
      <h3>{movie.title}</h3>
      <p>{movie.year}</p>
      <button onClick={() => onSwipe('right')} className="bg-green-500 text-white p-2">Swipe Right</button>
      <button onClick={() => onSwipe('left')} className="bg-red-500 text-white p-2">Swipe Left</button>
    </div>
  );
};
