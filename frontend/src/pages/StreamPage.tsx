import React from 'react';
import { useParams } from 'react-router-dom';
import { StreamingRoom } from '../components/StreamingRoom';
import { Chat } from '../components/Chat';

export const StreamPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full flex">
        <StreamingRoom roomId={roomId!} streamingUrl={'https://www.netflix.com/watch/81637260'} />
        <Chat roomId={roomId!} />
      </div>
    </div>
  );
};
