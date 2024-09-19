import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:5001');

export const Chat: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.emit('joinRoom', roomId);

    socket.on('receiveMessage', (msg: string) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [roomId]);

  const sendMessage = () => {
    socket.emit('sendMessage', { roomId, message });
    setMessages((prevMessages) => [...prevMessages, message]);
    setMessage('');
  };

  return (
    <div className="p-4">
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2"
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white p-2">Send</button>
    </div>
  );
};
