import io from "socket.io-client";

// Use deployed server URL in production, localhost in development
const serverUrl = import.meta.env.PROD 
  ? 'https://tictactoe-3u6g.onrender.com'
  : 'http://localhost:4000';

export const socket = io(serverUrl); 