import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;
const ROOMS = {}; // { roomId: { players: [socketId, ...], state: ..., ready: { [socketId]: boolean } } }

function generateRoomId() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('createRoom', (cb) => {
    let roomId;
    do { roomId = generateRoomId(); } while (ROOMS[roomId]);
    ROOMS[roomId] = { players: [socket.id], state: null, ready: {} };
    socket.join(roomId);
    console.log('[SERVER] Room created:', roomId, 'by:', socket.id);
    console.log('[SERVER] Current rooms:', Object.keys(ROOMS));
    cb(roomId);
  });

  socket.on('joinRoom', (roomId, cb) => {
    console.log(`[SERVER] Player ${socket.id} trying to join room: ${roomId}`);
    let room = ROOMS[roomId];
    if (!room) {
      // Create room with provided ID on-the-fly (helps after server restarts)
      ROOMS[roomId] = { players: [socket.id], state: null, ready: {} };
      socket.join(roomId);
      console.log('[SERVER] Room created on join:', roomId, 'by:', socket.id);
      cb && cb({ success: true, created: true });
      return;
    }
    if (room.players.length >= 2 && !room.players.includes(socket.id)) {
      console.log(`[SERVER] Join failed - room full`);
      cb && cb({ success: false, message: 'Room full.' });
      return;
    }
    if (!room.players.includes(socket.id)) {
      room.players.push(socket.id);
    }
    // Clear any stale ready flags when a player (re)joins
    room.ready = {};
    socket.join(roomId);
    console.log('[SERVER] Player joined room:', roomId, 'player:', socket.id);
    console.log(`[SERVER] Room ${roomId} now has ${room.players.length} players:`, room.players);
    cb && cb({ success: true, created: false });
    // If both players are present, ensure game is marked started on clients
    if (room.players.length >= 2) {
      io.to(roomId).emit('startGame', { roomId });
    }
  });

  socket.on('getPlayerInfo', (roomId, cb) => {
    const room = ROOMS[roomId];
    if (!room) {
      cb({ symbol: 'X' }); // Default to X if room not found
      return;
    }
    const playerIndex = room.players.indexOf(socket.id);
    const symbol = playerIndex === 0 ? 'X' : 'O';
    cb({ symbol });
  });

  socket.on('getPlayerRole', (roomId) => {
    const room = ROOMS[roomId];
    console.log('[SERVER] getPlayerRole', { roomId, socketId: socket.id, found: !!(room && room.roles && room.roles[socket.id]) });
    if (room && room.roles && room.roles[socket.id]) {
      io.to(socket.id).emit('playerRole', room.roles[socket.id]);
    }
  });

  socket.on('checkRoomStatus', (roomId, cb) => {
    console.log(`[SERVER] Checking status for room: ${roomId}`);
    console.log(`[SERVER] Available rooms:`, Object.keys(ROOMS));
    const room = ROOMS[roomId];
    if (!room) {
      console.log(`[SERVER] Room ${roomId} not found`);
      cb({ playerCount: 0 });
      return;
    }
    console.log(`[SERVER] Room ${roomId} found with ${room.players.length} players:`, room.players);
    cb({ playerCount: room.players.length });
  });

  socket.on('leaveRoom', (roomId) => {
    console.log(`Player ${socket.id} manually leaving room ${roomId}`);
    const room = ROOMS[roomId];
    if (room && room.players.includes(socket.id)) {
      // Remove player
      room.players = room.players.filter(id => id !== socket.id);
      if (room.ready) {
        delete room.ready[socket.id];
      }
      socket.leave(roomId);
      
      // Notify remaining players that opponent left
      if (room.players.length > 0) {
        console.log(`Notifying remaining players in room ${roomId} that opponent left`);
        io.to(roomId).emit('opponentLeft');
      }
      
      // Clean up empty rooms
      if (room.players.length === 0) {
        console.log(`Deleting empty room ${roomId}`);
        delete ROOMS[roomId];
      }
    }
  });

  socket.on('makeMove', ({ roomId, move }) => {
    socket.to(roomId).emit('opponentMove', move);
  });

  socket.on('requestNewGame', (roomId) => {
    console.log(`[SERVER] Player ${socket.id} requested new game in room: ${roomId}`);
    const room = ROOMS[roomId];
    if (room && room.players.includes(socket.id)) {
      // Initialize ready state if it doesn't exist
      if (!room.ready) room.ready = {};
      
      // Mark this player as ready for new game
      room.ready[socket.id] = true;
      console.log(`[SERVER] Player ${socket.id} ready for new game. Ready players:`, room.ready, 'Players:', room.players);
      
      // Broadcast current ready state to both players
      const readyPlayers = Object.keys(room.ready);
      io.to(roomId).emit('playersReadyState', { roomId, readyPlayers });

      // Check if both players are ready (robust against socket ID mismatch)
      const readyCount = readyPlayers.length;
      const playerCount = room.players.length;
      const bothReady = playerCount >= 2 && readyCount >= 2;
      if (bothReady) {
        console.log(`[SERVER] Both players ready, starting new game in room: ${roomId}`);
        // Reset ready state
        room.ready = {};
        // Emit newGameRequested to start the new game
        io.to(roomId).emit('newGameRequested', { roomId });
      } else {
        console.log(`[SERVER] Waiting for other player to be ready. Current ready state:`, room.ready);
        // Notify players that someone is waiting for new game
        io.to(roomId).emit('waitingForNewGame', { 
          roomId, 
          waitingPlayer: socket.id,
          readyPlayers: Object.keys(room.ready)
        });
      }
    } else {
      console.log(`[SERVER] Room not found or player not in room: ${roomId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    for (const [roomId, room] of Object.entries(ROOMS)) {
      if (room.players.includes(socket.id)) {
        console.log(`Player ${socket.id} left room ${roomId}`);
        // Remove player
        room.players = room.players.filter(id => id !== socket.id);
        if (room.ready) {
          delete room.ready[socket.id];
        }
        
        // Notify remaining players that opponent left
        if (room.players.length > 0) {
          console.log(`Notifying remaining players in room ${roomId} that opponent left`);
          io.to(roomId).emit('opponentLeft');
        }
        
        // Clean up empty rooms
        if (room.players.length === 0) {
          console.log(`Deleting empty room ${roomId}`);
          delete ROOMS[roomId];
        }
      }
    }
  });
});

app.get('/', (req, res) => {
  res.send('TicTacToe Realtime Server Running');
});

server.listen(PORT, () => {
  console.log(`Realtime server listening on port ${PORT}`);
}); 