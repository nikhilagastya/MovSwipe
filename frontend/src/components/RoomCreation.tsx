import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:5001');

export const RoomCreation: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
    const navigate=useNavigate();
  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 8);
    setRoomId(id);
    socket.emit('createRoom', id);
    setIsJoined(true);
    navigate(`/room/${id}`)
    
  };

  const joinRoom = (id: string) => {
    setRoomId(id);
    socket.emit('joinRoom', id);
    setIsJoined(true);
    navigate(`/room/${id}`)
  };

  return (
    <div className="p-4">
      {!isJoined ? (
        <div>
          <button onClick={createRoom} className="bg-blue-500 text-white p-2">Create Room</button>
          <input
            type="text"
            placeholder="Enter Room ID"
            onChange={(e) => setRoomId(e.target.value)}
            className="p-2 border"
          />
          <button onClick={() => joinRoom(roomId)} className="bg-green-500 text-white p-2">Join Room</button>
        </div>
      ) : (
        <div>Room ID: {roomId}</div>
      )}
    </div>
  );
};
