// import express from 'express';
// import http from 'http';
// import { Server, Socket } from 'socket.io';

import { Socket } from "socket.io";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// interface Room {
//   users: number;
//   rightSwipes: Record<string, string[]>; // Maps socket ID to array of swiped movie titles
//   usersInRoom: Set<string>; // Track socket IDs in the room
// }

// let rooms: Record<string, Room> = {};

// // Socket connection handler
// io.on('connection', (socket: Socket) => {
//   const socketId = socket.id;
//   console.log(`New connection established. Socket ID: ${socketId}`);

//   // Join room event
//   socket.on('joinRoom', (roomId: string) => {
//     console.log(`Socket ${socketId} is attempting to join room: ${roomId}`);

//     // Initialize room if not already created
//     if (!rooms[roomId]) {
//       rooms[roomId] = {
//         users: 0,
//         rightSwipes: {},
//         usersInRoom: new Set(),
//       };
//       console.log(`Room ${roomId} created`);
//     }

//     socket.join(roomId);
//     rooms[roomId].users += 1;
//     rooms[roomId].usersInRoom.add(socketId);
//     console.log(`Socket ${socketId} joined room: ${roomId}`);
//     console.log(`Total users in room ${roomId}: ${rooms[roomId].users}`);

//     // Initialize user's swipes if not already present
//     if (!rooms[roomId].rightSwipes[socketId]) {
//       rooms[roomId].rightSwipes[socketId] = [];
//     }

//     // Emit current room data to update the number of users
//     io.to(roomId).emit('roomData', { users: rooms[roomId].users });

//     // Handle right swipes from clients
//     socket.on('swipe', (data: { roomId: string; direction: 'right' | 'left'; movie: { title: string } }) => {
//       const { roomId, direction, movie } = data;

//       // If swipe is right, store the swiped movie for that user
//       if (direction === 'right') {
//         rooms[roomId].rightSwipes[socketId].push(movie.title);
//         console.log(`User ${socketId} in room ${roomId} swiped right on movie: ${movie.title}`);

//         // Check if all users have swiped right on the same movie
//         const commonMovies = findCommonMovies(rooms[roomId].rightSwipes);
//         if (commonMovies.length > 0) {
//           const matchedMovie = commonMovies[0]; // The first common movie
//           console.log(`All users in room ${roomId} swiped right on: ${matchedMovie}`);
//           io.to(roomId).emit('swipeUpdate', { matched: true, movie: matchedMovie });
//         }
//       }
//     });

//     // Play and pause events
//     socket.on('playMovie', (roomId) => {
//       console.log(`Play event received in room ${roomId} from user ${socketId}`);
//       io.to(roomId).emit('playSync');
//     });

//     socket.on('pauseMovie', (roomId) => {
//       console.log(`Pause event received in room ${roomId} from user ${socketId}`);
//       io.to(roomId).emit('pauseSync');
//     });

//     // Handle seeking event
//     socket.on('seekMovie', (data: { roomId: string; time: number }) => {
//       console.log(`Seek event received from user ${socketId} in room ${data.roomId}, new time: ${data.time}`);
//       io.to(data.roomId).emit('seekSync', { time: data.time });
//     });

//     // Handle time update event
//     socket.on('timeUpdate', (data: { roomId: string; time: number }) => {
//       console.log(`Time update event received from user ${socketId} in room ${data.roomId}, current time: ${data.time}`);
//       io.to(data.roomId).emit('timeSync', { time: data.time });
//     });

//     // Disconnect event
//     socket.on('disconnect', () => {
//       console.log(`Socket ${socketId} disconnected from room ${roomId}`);

//       rooms[roomId].users -= 1;
//       rooms[roomId].usersInRoom.delete(socketId);
//       delete rooms[roomId].rightSwipes[socketId];

//       // Emit updated room data
//       io.to(roomId).emit('roomData', { users: rooms[roomId].users });

//       console.log(`Total users in room ${roomId} after disconnect: ${rooms[roomId].users}`);

//       if (rooms[roomId].users === 0) {
//         delete rooms[roomId];
//         console.log(`Room ${roomId} deleted as no users are left`);
//       }
//     });
//   });
// });

// // Utility function to find common movies
// const findCommonMovies = (rightSwipes: Record<string, string[]>): string[] => {
//   const allMovies = Object.values(rightSwipes);
//   if (allMovies.length === 0) return [];

//   // Find intersection of all users' right-swiped movies
//   return allMovies.reduce((acc, swipes) => acc.filter((movie) => swipes.includes(movie)));
// };

// server.listen(5001, () => {
//   console.log('Server running on port 5001');
// });


const express = require("express");
const fetch = require("node-fetch");
const http = require("http");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const PLAY = "PLAY";
const SEEKED = "SEEKED";
const PAUSE = "PAUSE";

io.on("connection", async (socket:Socket) => {
  const room = socket.handshake.query.room ?? "Public";
  const ip = socket.handshake.headers["x-forwarded-for"];
  const res = await fetch(`http://ip-api.com/json/${ip}`);
  const { city, region, countryCode } = await res.json();
  const user = ip
    ? `${ip} (${[city, region, countryCode].join(", ")})`
    : uuidv4();

  socket.join(room);

  console.log(`User: ${user} joined room: ${room}`);

  socket.on(PLAY, () => socket.to(room).emit(PLAY));
  socket.on(SEEKED, (time) => socket.to(room).emit(SEEKED, time));
  socket.on(PAUSE, () => socket.to(room).emit(PAUSE));

  socket.on("disconnect", () => {
    console.log(`User: ${user} left from: ${room}`);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});