import assert from 'node:assert/strict';
import { io } from 'socket.io-client';

const endpoint = process.argv[2] || 'http://localhost:4000';
const clients = [];
const event = (socket, name) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { socket.off(name, done); reject(new Error(`Timed out: ${name}`)); }, 15000);
  function done(value) { clearTimeout(timer); resolve(value); }
  socket.once(name, done);
});
const ack = (socket, name, ...args) => socket.timeout(15000).emitWithAck(name, ...args);
async function connect() {
  const socket = io(endpoint, { autoConnect: false, reconnection: false, timeout: 15000 });
  clients.push(socket);
  const connected = event(socket, 'connect');
  socket.connect();
  await connected;
  return socket;
}
let room;
try {
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'TicTacToe Realtime Server Running');
  const a = await connect();
  const b = await connect();
  room = await ack(a, 'createRoom');
  assert.match(room, /^[A-Z0-9]{6}$/);
  const startedA = event(a, 'startGame');
  const startedB = event(b, 'startGame');
  assert.equal((await ack(b, 'joinRoom', room)).success, true);
  await Promise.all([startedA, startedB]);
  assert.equal((await ack(a, 'getPlayerInfo', room)).symbol, 'X');
  assert.equal((await ack(b, 'getPlayerInfo', room)).symbol, 'O');
  assert.equal((await ack(a, 'checkRoomStatus', room)).playerCount, 2);
  const received = event(b, 'opponentMove');
  a.emit('makeMove', { roomId: room, move: 4 });
  assert.equal(await received, 4);
  const waiting = event(a, 'waitingForNewGame');
  a.emit('requestNewGame', room);
  await waiting;
  const rematchA = event(a, 'newGameRequested');
  const rematchB = event(b, 'newGameRequested');
  b.emit('requestNewGame', room);
  await Promise.all([rematchA, rematchB]);
  const left = event(a, 'opponentLeft');
  b.emit('leaveRoom', room);
  await left;
  assert.equal((await ack(a, 'checkRoomStatus', room)).playerCount, 1);
  a.emit('leaveRoom', room);
  assert.equal((await ack(a, 'checkRoomStatus', room)).playerCount, 0);
  console.log(`Realtime verification passed: HTTP, two-player join/roles, move relay, rematch and room cleanup (${endpoint}).`);
} finally {
  for (const socket of clients) {
    if (room && socket.connected) socket.emit('leaveRoom', room);
    socket.disconnect();
  }
}
