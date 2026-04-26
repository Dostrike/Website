# TicTacToe Web App

A beautiful, modern TicTacToe game built with React, TypeScript, and Vite. Play against AI with multiple difficulty levels or challenge your friends in player vs player mode.

## 🎮 Features

- **Multiple Game Modes**: Play against AI or challenge friends
- **AI Difficulty Levels**: Easy, Medium, and Hard with intelligent gameplay
- **Beautiful Themes**: 7 different color themes to choose from
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Score Tracking**: Keep track of wins, losses, and draws
- **Smooth Animations**: Enjoy fluid gameplay with beautiful animations
- **Modern UI**: Clean, intuitive interface with excellent UX

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tictactoe-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 🌐 Deployment

This web app can be easily deployed to various platforms:

### GitHub Pages

1. Build the project: `npm run build`
2. Push the `dist` folder to a GitHub repository
3. Enable GitHub Pages in repository settings

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

## 🎨 Themes

The app includes 7 beautiful themes:

- **Classic**: Blue and white theme
- **Ocean**: Cyan and teal colors
- **Sunset**: Orange and warm tones
- **Forest**: Green and nature-inspired
- **Midnight**: Dark purple theme
- **Neon**: Bright pink and black
- **Pastel**: Soft yellow and gentle colors

## 🧠 AI Difficulty Levels

- **Easy**: 70% random moves, 30% strategic
- **Medium**: Blocks opponent wins, takes center and corners
- **Hard**: Unbeatable AI using minimax algorithm with alpha-beta pruning

## 🛠️ Tech Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **CSS3**: Modern styling with CSS variables and animations
- **Local Storage**: Persistent score tracking

## 📱 Responsive Design

The app is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🎯 Game Rules

1. Players take turns placing X and O on the 3x3 grid
2. First player to get 3 in a row (horizontally, vertically, or diagonally) wins
3. If all cells are filled without a winner, it's a draw
4. In AI mode, you always play as X and go first

## 🔧 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── GameBoard.tsx   # Game board component
│   ├── GameScreen.tsx  # Main game screen
│   ├── HomeScreen.tsx  # Home screen with options
│   ├── ScoreBoard.tsx  # Score display
│   └── ThemeSelector.tsx # Theme picker
├── types/              # TypeScript type definitions
│   └── game.ts
├── utils/              # Game logic utilities
│   └── gameLogic.ts
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by the classic TicTacToe game
- Built with modern web technologies
- Designed for optimal user experience

---

Enjoy playing TicTacToe! 🎮 