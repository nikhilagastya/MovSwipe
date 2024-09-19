import React from 'react';

interface GenreSelectionProps {
  onSelectGenre: (genre: string) => void;
}

const genres = ['Action', 'Comedy', 'Drama', 'Thriller'];

export const GenreSelection: React.FC<GenreSelectionProps> = ({ onSelectGenre }) => {
  return (
    <div className="p-4">
      <h2>Select Genre</h2>
      <ul>
        {genres.map((genre) => (
          <li key={genre}>
            <button onClick={() => onSelectGenre(genre)} className="bg-gray-500 text-white p-2">{genre}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};


