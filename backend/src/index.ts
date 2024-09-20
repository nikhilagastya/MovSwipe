import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

interface Room {
  users: number;
  rightSwipes: Record<string, string[]>; // Maps socket ID to array of swiped movie titles
  usersInRoom: Set<string>; // Track socket IDs in the room
}

let rooms: Record<string, Room> = {};

// Socket connection handler
io.on('connection', (socket: Socket) => {
  console.log(`New connection established. Socket ID: ${socket.id}`);

  // Join room event

  socket.on('joinRoom', (roomId: string) => {
    const socketId = socket.id;
    console.log(`Socket ${socketId} is attempting to join room: ${roomId}`);

    socket.join(roomId);

    // Initialize room if not already created
    console.log(rooms[roomId], "to check if the room is available")
    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: 0,
        rightSwipes: {},
        usersInRoom: new Set(),
      };
      console.log(`Room ${roomId} created`);
    }

    rooms[roomId].users += 1;
    rooms[roomId].usersInRoom.add(socketId);
    console.log(`Socket ${socketId} joined room: ${roomId}`);
    console.log(`Total users in room ${roomId}: ${rooms[roomId].users}`);

    // Initialize user's swipes if not already present
    if (!rooms[roomId].rightSwipes[socketId]) {
      rooms[roomId].rightSwipes[socketId] = [];
    }

    // Emit current room data to update the number of users
    io.to(roomId).emit('roomData', { users: rooms[roomId].users });

    // Handle right swipes from clients
    socket.on('swipe', (data: { roomId: string; direction: 'right' | 'left'; movie: { title: string } }) => {
      const { roomId, direction, movie } = data;

      // If swipe is right, store the swiped movie for that user
      if (direction === 'right') {
        rooms[roomId].rightSwipes[socketId].push(movie.title);
        console.log(`User ${socketId} in room ${roomId} swiped right on movie: ${movie.title}`);

        // Check if all users have swiped right on the same movie
        const commonMovies = findCommonMovies(rooms[roomId].rightSwipes);
        if (commonMovies.length > 0) {
          const matchedMovie = commonMovies[0]; // The first common movie
          console.log(`All users in room ${roomId} swiped right on: ${matchedMovie}`);
          io.to(roomId).emit('swipeUpdate', { matched: true, movie: matchedMovie });
        }
      }
    });

    // Play and pause events
    socket.on('playMovie', (roomId) => {
      console.log(`Play event received in room ${roomId} from user ${socketId}`);
      io.to(roomId).emit('playSync');
    });

    socket.on('pauseMovie', (roomId) => {
      console.log(`Pause event received in room ${roomId} from user ${socketId}`);
      io.to(roomId).emit('pauseSync');
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`Socket ${socketId} disconnected from room ${roomId}`);

      rooms[roomId].users -= 1;
      rooms[roomId].usersInRoom.delete(socketId);
      delete rooms[roomId].rightSwipes[socketId];

      // Emit updated room data
      io.to(roomId).emit('roomData', { users: rooms[roomId].users });

      console.log(`Total users in room ${roomId} after disconnect: ${rooms[roomId].users}`);

      if (rooms[roomId].users === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted as no users are left`);
      }
    });
  });
});

// Utility function to find common movies
const findCommonMovies = (rightSwipes: Record<string, string[]>): string[] => {
  const allMovies = Object.values(rightSwipes);
  if (allMovies.length === 0) return [];

  // Find intersection of all users' right-swiped movies
  return allMovies.reduce((acc, swipes) => acc.filter((movie) => swipes.includes(movie)));
};

server.listen(5001, () => {
  console.log('Server running on port 5001');
});
