import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:5001');

export const StreamingRoom: React.FC<{ roomId: string; streamingUrl: string }> = ({ roomId, streamingUrl }) => {

  const handlePause = () => {
    socket.emit('pauseMovie', roomId);
  };

  const handlePlay = () => {
    socket.emit('playMovie', roomId);
  };

  socket.on('pauseSync', () => {
    // Pause the movie - you cannot control Netflix, but this is where sync logic can go
  });

  socket.on('playSync', () => {
    // Play the movie - you cannot control Netflix, but this is where sync logic can go
  });

  useEffect(() => {
    socket.emit('joinStreamingRoom', roomId);

    return () => {
      socket.off('pauseSync');
      socket.off('playSync');
    };
  }, [roomId]);

  const redirectToPlatform = () => {
    const netflixLink = `${streamingUrl}?roomId=${roomId}`;
    window.open(netflixLink, '_blank');
  };

  return (
    <div className="relative h-screen">
      {/* Overlay with custom controls */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10 bg-black bg-opacity-50">
        <button onClick={handlePause} className="bg-yellow-500 text-white p-2 m-2">Pause</button>
        <button onClick={handlePlay} className="bg-green-500 text-white p-2 m-2">Play</button>
      </div>

      {/* Redirect to the external platform */}
      <div className="absolute bottom-4 left-4">
        <button onClick={redirectToPlatform} className="bg-blue-500 text-white p-2">Open Netflix/Prime</button>
      </div>
    </div>
  );
};
