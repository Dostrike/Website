import React, { useState, useRef, useEffect } from 'react';
import type { Connect4Board, Connect4Player, Connect4Position } from '../types/connect4';
import { Connect4GameStatus } from '../types/connect4';
import './Connect4Board.css';

interface Connect4BoardProps {
  board: Connect4Board;
  currentPlayer: Connect4Player;
  gameStatus: Connect4GameStatus;
  winningLine: Connect4Position[] | null;
  onColumnClick: (col: number) => void;
  disabled?: boolean;
  falling?: boolean;
  onFallOutEnd?: () => void;
}

const COLS = 7;
const ROWS = 6;

// Helper to find the row where a disc would land in a column
function getDropRow(board: Connect4Board, col: number): number | null {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === null) return row;
  }
  return null;
}


const Connect4Board: React.FC<Connect4BoardProps> = ({
  board,
  currentPlayer,
  gameStatus,
  winningLine,
  onColumnClick,
  disabled = false,
  falling = false,
  onFallOutEnd,
}) => {
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [droppingDisc, setDroppingDisc] = useState<{
    col: number;
    row: number;
    player: Connect4Player;
  } | null>(null);

  // ...existing code...

  // Check if a cell is part of the winning line
  const isWinningCell = (row: number, col: number) => {
    return winningLine?.some(([r, c]) => r === row && c === col) || false;
  };

  // Shake state for columns
  const [shakeCol, setShakeCol] = useState<number | null>(null);

  // Handle column click with shake for full columns
  const handleColumnClick = (col: number) => {
    if (disabled || animating || gameStatus !== 'PLAYING') return;
    if (board[0][col] !== null) {
      setShakeCol(col);
      setTimeout(() => setShakeCol(null), 500);
      return;
    }
    const row = getDropRow(board, col);
    if (row === null) return;
    setDroppingDisc({ col, row, player: currentPlayer });
    setAnimating(true);
    // Animation duration matches CSS (0.45s)
    setTimeout(() => {
      setAnimating(false);
      setDroppingDisc(null);
      onColumnClick(col);
    }, 450);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || animating || gameStatus !== 'PLAYING') return;
    if (hoverCol === null) setHoverCol(0);
    if (e.key === 'ArrowLeft') {
      setHoverCol((prev) => prev === null ? 0 : (prev + COLS - 1) % COLS);
    } else if (e.key === 'ArrowRight') {
      setHoverCol((prev) => prev === null ? 0 : (prev + 1) % COLS);
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (hoverCol !== null) handleColumnClick(hoverCol);
    }
  };

  // Render dropping disc animation
  const renderDroppingDisc = () => {
    if (!droppingDisc) return null;
    const { col, row, player } = droppingDisc;
    // Calculate drop distance (in cells)
    const dropDistance = row + 1;
    return (
      <div
        className={`c4-disc-drop-anim ${player.toLowerCase()}`}
        style={{
          left: `calc(${col} * (var(--c4-cell-size, 48px) + 6px))`,
          // Animate from top to the cell
          top: 0,
          height: `calc(${dropDistance} * (var(--c4-cell-size, 48px) + 6px))`,
          zIndex: 10,
        }}
        aria-hidden="true"
      >
        <div className={`c4-disc ${player.toLowerCase()}`} />
      </div>
    );
  };

  // Track when all fall animations are done
  const fallTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (falling && onFallOutEnd) {
      // Duration: 0.5s + 0.08s * (COLS-1)
      fallTimeoutRef.current = setTimeout(() => {
        onFallOutEnd();
      }, 500 + 80 * (COLS - 1));
    }
    return () => { if (fallTimeoutRef.current) clearTimeout(fallTimeoutRef.current); };
  }, [falling, onFallOutEnd]);

  return (
    <div
      className="c4-board-wrapper"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Connect 4 game board"
      style={{ outline: 'none', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* ...existing code... */}
      <div className="c4-board-grid" style={{ position: 'relative', margin: '0 auto' }}>
        {renderDroppingDisc()}
        {board.map((row, rowIdx) => (
          <div className="c4-board-row" key={rowIdx}>
            {row.map((cell, colIdx) => {
              const topEmptyRow = board.findIndex(r => r[colIdx] === null);
              // Preview disc logic: strictly based on cell emptiness and topmost empty cell, regardless of player color
              const isPreview =
                hoverCol === colIdx &&
                gameStatus === 'PLAYING' &&
                !animating &&
                topEmptyRow !== -1 &&
                rowIdx === topEmptyRow &&
                cell === null;
              // Add shake animation to the cell if this column is being shaken
              const shake = shakeCol === colIdx ? ' shake' : '';
              return (
                <div
                  key={colIdx}
                  className={`c4-cell${cell ? ' ' + cell.toLowerCase() : ''}${isWinningCell(rowIdx, colIdx) ? ' winning' : ''}${winningLine && !isWinningCell(rowIdx, colIdx) ? ' faded' : ''}${hoverCol === colIdx && cell === null ? ` c4-col-hover ${currentPlayer.toLowerCase()}` : ''}${shake}`}
                  aria-label={cell ? `${cell} disc` : 'empty'}
                  style={{ opacity: winningLine && !isWinningCell(rowIdx, colIdx) ? 0.5 : 1 }}
                  onMouseEnter={() => setHoverCol(colIdx)}
                  onMouseLeave={() => setHoverCol(null)}
                  onClick={() => handleColumnClick(colIdx)}
                  role="button"
                  tabIndex={-1}
                >
                  {cell && (!droppingDisc || droppingDisc.row !== rowIdx || droppingDisc.col !== colIdx) && (
                    <div
                      className={`c4-disc ${cell.toLowerCase()}${falling ? ' falling' : ''}`}
                      style={falling ? { animationDelay: `${colIdx * 80}ms` } : {}}
                    />
                  )}
                  {/* Enhanced preview disc with bounce */}
                  {isPreview && (
                    <div className={`c4-disc ${currentPlayer.toLowerCase()} preview bounce`} style={{ opacity: 0.92, border: '3px solid #43e97b', boxShadow: '0 0 16px 4px #43e97b55, 0 2px 12px #1976d255, 0 0 0 6px rgba(255,255,255,0.10)' }} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Connect4Board; 