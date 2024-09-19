import React, { useState } from 'react';
import { RoomCreation } from '../components/RoomCreation';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string>('');

  const handleRoomCreation = (id: string) => {
    setRoomId(id);
    navigate(`/room/${id}`);
  };

  const handleRoomJoin = (id: string) => {
    setRoomId(id);
    navigate(`/room/${id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Movie Match</h1>
      <RoomCreation  />
    </div>
  );
};
