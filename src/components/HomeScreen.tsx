import { useState } from 'react';
import { GameMode, Difficulty } from '../types/game';
import './HomeScreen.css';
import AdSenseAd from './AdSenseAd';

interface HomeScreenProps {
  onStartGame: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.AI);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');

  const handleStartGame = () => {
    // Store game settings in localStorage for the game screen
    localStorage.setItem('gameSettings', JSON.stringify({
      gameMode,
      difficulty,
      player1Name,
      player2Name
    }));
    onStartGame();
  };

  return (
    <div className="home-screen">
      <div className="container">
        <div className="home-content">
          <div className="home-header">
            <h1 className="home-title">TicTacToe</h1>
            <p className="home-subtitle">Play the classic game with AI or friends</p>
          </div>

          <div className="game-options card">
            <h2 className="options-title">Game Options</h2>
            
            <div className="option-group">
              <label className="option-label">Game Mode</label>
              <div className="option-buttons">
                <button
                  className={`option-button ${gameMode === GameMode.AI ? 'active' : ''}`}
                  onClick={() => setGameMode(GameMode.AI)}
                >
                  <span className="option-icon">🤖</span>
                  vs AI
                </button>
                <button
                  className={`option-button ${gameMode === GameMode.PVP ? 'active' : ''}`}
                  onClick={() => setGameMode(GameMode.PVP)}
                >
                  <span className="option-icon">👥</span>
                  vs Player
                </button>
              </div>
            </div>

            {gameMode === GameMode.AI && (
              <div className="option-group">
                <label className="option-label">AI Difficulty</label>
                <div className="option-buttons">
                  <button
                    className={`option-button ${difficulty === Difficulty.EASY ? 'active' : ''}`}
                    onClick={() => setDifficulty(Difficulty.EASY)}
                  >
                    Easy
                  </button>
                  <button
                    className={`option-button ${difficulty === Difficulty.MEDIUM ? 'active' : ''}`}
                    onClick={() => setDifficulty(Difficulty.MEDIUM)}
                  >
                    Medium
                  </button>
                  <button
                    className={`option-button ${difficulty === Difficulty.HARD ? 'active' : ''}`}
                    onClick={() => setDifficulty(Difficulty.HARD)}
                  >
                    Hard
                  </button>
                </div>
              </div>
            )}

            {gameMode === GameMode.PVP && (
              <div className="player-names">
                <div className="input-group">
                  <label className="input-label">Player 1 Name</label>
                  <input
                    type="text"
                    className="name-input"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder="Enter Player 1 name"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Player 2 Name</label>
                  <input
                    type="text"
                    className="name-input"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    placeholder="Enter Player 2 name"
                  />
                </div>
              </div>
            )}

            <button className="start-button btn" onClick={handleStartGame}>
              Start Game
            </button>
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <AdSenseAd slot="8488726421" style={{ display: 'block', width: '100%', minHeight: 90 }} />
            </div>
          </div>

          <div className="features">
            <h3>Features</h3>
            <ul className="features-list">
              <li>🎮 Multiple difficulty levels</li>
              <li>🎨 Beautiful themes</li>
              <li>📱 Responsive design</li>
              <li>🏆 Score tracking</li>
              <li>⚡ Fast gameplay</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen; 
