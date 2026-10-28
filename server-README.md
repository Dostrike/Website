# Tic-Tac-Toe Real-time Server

This is the real-time server for the Tic-Tac-Toe private room functionality.

## Features
- Socket.IO real-time communication
- Private room management
- Player turn management
- Game state synchronization

## Deployment
This server is designed to be deployed on Render.com for the live Tic-Tac-Toe game.

Use the `Dostrike/Website` repository, branch `main`, repository root. The
`Dostrike/TicTacToe` repository is Android-only and cannot build this Node service.

- Build command: `npm ci --omit=dev --ignore-scripts`
- Start command: `npm start`
- Public endpoint: `https://tictactoe-3u6g.onrender.com`

The backend needs no Vite build or Playwright browser installation. Ignoring
install scripts skips the frontend's Playwright postinstall step. Do not use
these backend install flags for the Netlify frontend build.

Render currently connects through the public Git repository URL because its
GitHub integration only lists the Android repository. Auto-deploy is unavailable
for that source mode. Manually deploy a tested backend commit after server
changes; ordinary frontend or documentation changes need no backend deploy.

## Verification

Start the local server with `node realtime-server.js`, then run
`node scripts/verify-realtime.mjs`. To verify the deployed service, run
`node scripts/verify-realtime.mjs https://tictactoe-3u6g.onrender.com`.
This uses a fresh private room and checks HTTP, connection, roles, move relay,
rematch readiness and room cleanup. Clients disconnect even if a check fails.
Free instances can take more than 50 seconds to wake after inactivity; do not
use repeated pings to keep them awake.

## Environment Variables
- `PORT`: Server port (default: 4000)
