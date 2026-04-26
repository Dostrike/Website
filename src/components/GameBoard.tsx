
import { Player, Position } from '../types/game';
import './GameBoard.css';

interface GameBoardProps {
  board: (Player | null)[][];
  winningLine: Position[] | null;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, winningLine, onCellClick, disabled }) => {
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
              className={`board-cell ${isWinningCell(rowIndex, colIndex) ? 'winning' : ''}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={disabled || cell !== null}
              aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
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