# Dostrike Website

This repository contains the website frontend and related Node scripts used for deployment.

The Android app has been moved to a separate repository:
- `https://github.com/Dostrike/TicTacToe`

## Tech Stack

- React
- TypeScript
- Vite
- Node.js scripts for supporting services

## Local Development

### Prerequisites

- Node.js 18+ recommended
- npm

### Install and Run

```bash
npm install
npm run dev
```

App runs on the local Vite URL shown in terminal.

## Production Build

```bash
npm run build
```

Output directory:
- `dist`

## Netlify Configuration

- Build command: `npm run build`
- Publish directory: `dist`

The redirect rules are configured in `netlify.toml`.

## Common Scripts

- `npm run dev` - start local dev server
- `npm run build` - create production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint