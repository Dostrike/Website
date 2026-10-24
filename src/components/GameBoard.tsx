
import { Player, Position } from '../types/game';
import './GameBoard.css';

interface GameBoardProps {
  board: (Player | null)[][];
  winningLine: Position[] | null;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
  hint?: Position | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, winningLine, onCellClick, disabled, hint }) => {
  const isWinningCell = (row: number, col: number) => {
    return winningLine?.some(([r, c]) => r === row && c === col) || false;
  };

  const getCellContent = (player: Player | null) => {
    if (!player) return null;
    return (
      <span className={`cell-symbol ${player.toLowerCase()}`}>
        {player}
      </span>
    );
  };

  return (
    <div className="game-board">
      <div className="board-grid">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`board-cell ${isWinningCell(rowIndex, colIndex) ? 'winning' : ''} ${hint?.[0] === rowIndex && hint?.[1] === colIndex ? 'hinted' : ''}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={disabled || cell !== null}
              aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}: ${cell || 'empty'}`}
            >
              {getCellContent(cell)}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default GameBoard;
