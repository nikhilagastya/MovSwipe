"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
let rooms = {};
// Socket connection handler
io.on('connection', (socket) => {
    socket.on('playMovie', (roomId) => {
        io.to(roomId).emit('playSync');
    });
    socket.on('pauseMovie', (roomId) => {
        io.to(roomId).emit('pauseSync');
    });
    socket.on('joinRoom', (roomId) => {
        const socketId = socket.id;
        socket.join(roomId);
        // Initialize room if not already created
        if (!rooms[roomId]) {
            rooms[roomId] = {
                users: 0,
                rightSwipes: {},
                usersInRoom: new Set(),
            };
        }
        rooms[roomId].users += 1;
        rooms[roomId].usersInRoom.add(socketId); // Add user to the room
        // console.log(rooms[roomId].usersInRoom)
        // Initialize user's swipes if not already present
        if (!rooms[roomId].rightSwipes[socketId]) {
            rooms[roomId].rightSwipes[socketId] = [];
        }
        // Emit current room data to update the number of users
        io.to(roomId).emit('roomData', { users: rooms[roomId].users });
        // Handle right swipes from clients
        socket.on('swipe', (data) => {
            const { roomId, direction, movie } = data;
            // If swipe is right, store the swiped movie for that user
            if (direction === 'right') {
                rooms[roomId].rightSwipes[socketId].push(movie.title);
                // Check if all users have swiped right on the same movie
                const commonMovies = findCommonMovies(rooms[roomId].rightSwipes);
                if (commonMovies.length > 0) {
                    console.log(commonMovies[0]);
                    const matchedMovie = commonMovies[0]; // The first common movie
                    io.to(roomId).emit('swipeUpdate', { matched: true, movie: matchedMovie });
                }
            }
        });
        socket.on('disconnect', () => {
            rooms[roomId].users -= 1;
            rooms[roomId].usersInRoom.delete(socketId);
            delete rooms[roomId].rightSwipes[socketId];
            // Emit updated room data
            io.to(roomId).emit('roomData', { users: rooms[roomId].users });
            if (rooms[roomId].users === 0) {
                delete rooms[roomId];
            }
        });
    });
});
// Utility function to find common movies
const findCommonMovies = (rightSwipes) => {
    const allMovies = Object.values(rightSwipes);
    if (allMovies.length === 0)
        return [];
    // Find intersection of all users' right-swiped movies
    return allMovies.reduce((acc, swipes) => acc.filter(movie => swipes.includes(movie)));
};
server.listen(5001, () => {
    console.log('Server running on port 5001');
});
