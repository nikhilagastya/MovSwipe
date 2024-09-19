import React from 'react';

interface MatchProps {
  matchedMovie: {
    title: string;
    platforms: string[];
  };
}

export const Match: React.FC<MatchProps> = ({ matchedMovie }) => {
  return (
    <div className="p-4">
      <h3>Matched Movie: {matchedMovie.title}</h3>
      <ul>
        {/* {matchedMovie.platforms.map((platform) => (
          <li key={platform}>{platform}</li>
        ))} */}
        {matchedMovie.title}
      </ul>
    </div>
  );
};
