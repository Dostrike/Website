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

## Advertising and release verification

AdSense ownership is declared with the publisher meta tag in `index.html` and `public/ads.txt`.
Optional ad requests are disabled by default. Set `VITE_ADS_ENABLED=true` in the build
environment only after site approval and after publishing and testing Google's certified
consent messaging (AdSense Privacy & messaging) for applicable visitors. The local cookie
preference banner alone is not a certified CMP.

Run `npm run build`, `npm run lint`, then `node scripts/verify-site.mjs` before deployment.
Run `node scripts/verify-practice.mjs` and `node scripts/verify-daily.mjs` when changing puzzles
or the practice engine. The latter enumerates all 5,478 legal boards and validates daily puzzle
rotations and date boundaries. The daily challenge uses the visitor's local calendar date and
saves progress only in that browser; it does not create an account or send results to a server.
`node scripts/inspect-live.mjs` checks the public deployment. Netlify serves prerendered
route directories and returns `404.html` with HTTP 404 for unknown URLs. Keep every public
route in `scripts/prerender.mjs`; its sitemap is generated from that route list and the articles.
