import { useState, useEffect } from 'react';
import { GameState, Player, GameMode, Difficulty } from '../types/game';
import { GameLogic } from '../utils/gameLogic';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import './GameScreen.css';

interface GameScreenProps {
  onBackToHome: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onBackToHome }) => {
  const [nextStarter, setNextStarter] = useState<'human' | 'ai'>('human');
  const [gameState, setGameState] = useState<GameState>(() => {
    // Use nextStarter to determine who starts the first game
    const isHumanStarting = true; // Always human for very first game
    const initial = GameLogic.createInitialGameState();
    return {
      ...initial,
      currentPlayer: isHumanStarting ? Player.X : Player.O,
      isAiTurn: !isHumanStarting,
    };
  });
  const [gameSettings, setGameSettings] = useState<{
    gameMode: GameMode;
    difficulty: Difficulty;
    player1Name: string;
    player2Name: string;
  } | null>(null);

  // Ensure game always starts with Player.X and isAiTurn false
  useEffect(() => {
    const settings = localStorage.getItem('gameSettings');
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      setGameSettings(parsedSettings);
      setGameState(prevState => {
        const isHumanStarting = nextStarter === 'human';
        return {
          ...prevState,
          gameMode: parsedSettings.gameMode,
          difficulty: parsedSettings.gameMode === GameMode.AI ? parsedSettings.difficulty : null,
          player1Name: parsedSettings.player1Name,
          player2Name: parsedSettings.player2Name,
          currentPlayer: isHumanStarting ? Player.X : Player.O,
          isAiTurn: !isHumanStarting,
        };
      });
    }
    // Alternate for next round
    setNextStarter(prev => (prev === 'human' ? 'ai' : 'human'));
  }, []);

  useEffect(() => {
    // Handle AI turn
    if (gameState.gameMode === GameMode.AI &&
        gameState.isAiTurn &&
        gameState.gameStatus === 'PLAYING') {
      const timer = setTimeout(() => {
        const aiMove = GameLogic.getAiMove(gameState);
        if (aiMove) {
          const [row, col] = aiMove;
          const newGameState = GameLogic.makeMove(gameState, row, col, gameState.gameMode);
          setGameState(newGameState);

          // Update score if game ended
          if (newGameState.gameStatus !== 'PLAYING') {
            updateScore(newGameState);
          }
        }
      }, 500); // Small delay for better UX

      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const handleCellClick = (row: number, col: number) => {
    if (gameState.gameStatus !== 'PLAYING' || 
        (gameState.gameMode === GameMode.AI && gameState.isAiTurn)) {
      return;
    }

    const newGameState = GameLogic.makeMove(gameState, row, col, gameState.gameMode);
    setGameState(newGameState);

    // Update score if game ended
    if (newGameState.gameStatus !== 'PLAYING') {
      updateScore(newGameState);
    }
  };

  const updateScore = (finalGameState: GameState) => {
    setGameState(prevState => {
      const newScore = { ...prevState.score };
      
      if (finalGameState.gameStatus === 'DRAW') {
        newScore.draws += 1;
      } else if (finalGameState.winner) {
        if (finalGameState.gameMode === GameMode.AI) {
          if (finalGameState.winner === Player.X) {
            newScore.playerWins += 1;
          } else {
            newScore.aiWins += 1;
          }
        } else {
          if (finalGameState.winner === Player.X) {
            newScore.player1Wins += 1;
          } else {
            newScore.player2Wins += 1;
          }
        }
      }
      
      return {
        ...prevState,
        score: newScore
      };
    });
  };

  const handleNewGame = () => {
    // Determine who starts this round
    const isHumanStarting = nextStarter === 'human';
    setGameState(prevState => ({
      ...GameLogic.createInitialGameState(),
      gameMode: prevState.gameMode,
      difficulty: prevState.difficulty,
      player1Name: prevState.player1Name,
      player2Name: prevState.player2Name,
      score: prevState.score,
      currentPlayer: isHumanStarting ? Player.X : Player.O,
      isAiTurn: !isHumanStarting,
    }));
    // Alternate for next round
    setNextStarter(isHumanStarting ? 'ai' : 'human');
  };

  const getCurrentPlayerName = () => {
    if (gameState.gameMode === GameMode.AI) {
      return gameState.currentPlayer === Player.X ? gameState.player1Name : 'AI';
    } else {
      return gameState.currentPlayer === Player.X ? gameState.player1Name : gameState.player2Name;
    }
  };

  const getGameStatusMessage = () => {
    if (gameState.gameStatus === 'PLAYING') {
      return `${getCurrentPlayerName()}'s turn`;
    } else if (gameState.gameStatus === 'DRAW') {
      return "It's a draw!";
    } else if (gameState.winner) {
      const winnerName = gameState.gameMode === GameMode.AI
        ? (gameState.winner === Player.X ? gameState.player1Name : 'AI')
        : (gameState.winner === Player.X ? gameState.player1Name : gameState.player2Name);
      return `${winnerName} wins!`;
    }
    return '';
  };

  if (!gameSettings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-screen">
      <div className="game-header">
        <button className="back-button btn btn-secondary" onClick={onBackToHome}>
          ← Back to Menu
        </button>
      </div>

      <div className="container">
        <div className="game-content">
          <div className="game-info">
            <h1 className="game-title">TicTacToe</h1>
            <div className="game-status">
              <p className="status-message">{getGameStatusMessage()}</p>
              {gameState.gameMode === GameMode.AI && gameState.difficulty && (
                <p className="difficulty-info">Difficulty: {gameState.difficulty}</p>
              )}
            </div>
          </div>

          <div className="game-main">
            <GameBoard
              board={gameState.board}
              winningLine={gameState.winningLine}
              onCellClick={handleCellClick}
              disabled={gameState.gameStatus !== 'PLAYING' || 
                       (gameState.gameMode === GameMode.AI && gameState.isAiTurn)}
            />

            <div className="game-controls">
              <button className="new-game-button btn" onClick={handleNewGame}>
                New Game
              </button>
            </div>
          </div>

          <ScoreBoard
            score={gameState.score}
            gameMode={gameState.gameMode}
            player1Name={gameState.player1Name}
            player2Name={gameState.player2Name}
          />
        </div>
      </div>
    </div>
  );
};

export default GameScreen; 