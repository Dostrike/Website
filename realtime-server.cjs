const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;
const ROOMS = {}; // { roomId: { players: [socketId, ...], roles: {socketId: 'X'|'O'}, state: ..., ready: { [socketId]: boolean } } }

function generateRoomId() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

io.on('connection', (socket) => {
  socket.on('createRoom', (cb) => {
    let roomId;
    do { roomId = generateRoomId(); } while (ROOMS[roomId]);
    ROOMS[roomId] = { players: [socket.id], roles: { [socket.id]: 'X' }, state: null, ready: {} };
    socket.join(roomId);
    socket.emit('playerRole', 'X');
    cb(roomId);
  });

  socket.on('joinRoom', (roomId, cb) => {
    const room = ROOMS[roomId];
    if (!room || room.players.length >= 2) {
      cb({ success: false, message: 'Room not found or full.' });
      return;
    }
    room.players.push(socket.id);
    room.roles[socket.id] = 'O';
    room.ready = {};
    socket.join(roomId);
    // Emit playerRole to both players
    room.players.forEach(sid => {
      const role = room.roles[sid];
      io.to(sid).emit('playerRole', role);
    });
    cb({ success: true });
    // Notify both players to start, include roles
    io.to(roomId).emit('startGame', { roomId, roles: room.roles });
    // Emit playerRole to both players again in startGame
    room.players.forEach(sid => {
      const role = room.roles[sid];
      io.to(sid).emit('playerRole', role);
    });
  });

  // Rematch/Ready system
  socket.on('rematchRequest', (roomId) => {
    const room = ROOMS[roomId];
    if (!room) return;
    if (!room.ready) room.ready = {};
    room.ready[socket.id] = true;
    // Check if both players are ready (robust against socket ID mismatch)
    if (room.players.length >= 2 && Object.keys(room.ready || {}).length >= 2) {
      // Reset ready state
      room.ready = {};
      io.to(roomId).emit('startNewGame');
    } else {
      // Notify both players of current ready state (optional)
      io.to(roomId).emit('rematchWaiting', { ready: room.ready });
    }
  });

  // New game request system
  socket.on('requestNewGame', (roomId) => {
    console.log(`[SERVER] Player ${socket.id} requested new game in room: ${roomId}`);
    const room = ROOMS[roomId];
    if (room && room.players.includes(socket.id)) {
      // Initialize ready state if it doesn't exist
      if (!room.ready) room.ready = {};
      
      // Mark this player as ready for new game
      room.ready[socket.id] = true;
      console.log(`[SERVER] Player ${socket.id} ready for new game. Ready players:`, room.ready, 'Players:', room.players);
      
      // Check if both players are ready
      const readyPlayers = Object.keys(room.ready);
      io.to(roomId).emit('playersReadyState', { roomId, readyPlayers });
      if (room.players.length >= 2 && readyPlayers.length >= 2) {
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

  socket.on('makeMove', ({ roomId, move }) => {
    socket.to(roomId).emit('opponentMove', move);
  });

  socket.on('getPlayerRole', (roomId) => {
    const room = ROOMS[roomId];
    console.log('[SERVER] getPlayerRole', { roomId, socketId: socket.id, found: !!(room && room.roles[socket.id]) });
    if (room && room.roles[socket.id]) {
      io.to(socket.id).emit('playerRole', room.roles[socket.id]);
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
      delete room.roles[socket.id];
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

  socket.on('disconnect', () => {
    for (const [roomId, room] of Object.entries(ROOMS)) {
      if (room.players.includes(socket.id)) {
        // Remove player
        room.players = room.players.filter(id => id !== socket.id);
        if (room.ready) delete room.ready[socket.id];
        delete room.roles[socket.id];
        io.to(roomId).emit('opponentLeft');
        if (room.players.length === 0) delete ROOMS[roomId];
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