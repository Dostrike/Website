
import { Score, GameMode } from '../types/game';
import './ScoreBoard.css';

interface ScoreBoardProps {
  score: Score;
  gameMode: GameMode;
  player1Name: string;
  player2Name: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, gameMode, player1Name, player2Name }) => {
  const totalGames = gameMode === GameMode.AI 
    ? score.playerWins + score.aiWins + score.draws
    : score.player1Wins + score.player2Wins + score.draws;

  const getWinRate = (wins: number) => {
    if (totalGames === 0) return 0;
    return Math.round((wins / totalGames) * 100);
  };

  return (
    <div className="score-board card">
      <h2 className="score-title">Score Board</h2>
      
      {gameMode === GameMode.AI ? (
        <div className="score-content">
          <div className="score-row">
            <div className="score-player">
              <span className="player-icon">👤</span>
              <span className="player-name">{player1Name}</span>
            </div>
            <div className="score-stats">
              <span className="score-wins">{score.playerWins}</span>
              <span className="score-rate">({getWinRate(score.playerWins)}%)</span>
            </div>
          </div>
          
          <div className="score-row">
            <div className="score-player">
              <span className="player-icon">🤖</span>
              <span className="player-name">AI</span>
            </div>
            <div className="score-stats">
              <span className="score-wins">{score.aiWins}</span>
              <span className="score-rate">({getWinRate(score.aiWins)}%)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="score-content">
          <div className="score-row">
            <div className="score-player">
              <span className="player-icon">👤</span>
              <span className="player-name">{player1Name}</span>
            </div>
            <div className="score-stats">
              <span className="score-wins">{score.player1Wins}</span>
              <span className="score-rate">({getWinRate(score.player1Wins)}%)</span>
            </div>
          </div>
          
          <div className="score-row">
            <div className="score-player">
              <span className="player-icon">👤</span>
              <span className="player-name">{player2Name}</span>
            </div>
            <div className="score-stats">
              <span className="score-wins">{score.player2Wins}</span>
              <span className="score-rate">({getWinRate(score.player2Wins)}%)</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="score-row draws">
        <div className="score-player">
          <span className="player-icon">🤝</span>
          <span className="player-name">Draws</span>
        </div>
        <div className="score-stats">
          <span className="score-wins">{score.draws}</span>
          <span className="score-rate">({getWinRate(score.draws)}%)</span>
        </div>
      </div>
      
      <div className="total-games">
        <span>Total Games: {totalGames}</span>
      </div>
    </div>
  );
};

export default ScoreBoard; 