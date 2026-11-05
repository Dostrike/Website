import React, { useState, useRef, useEffect } from "react";
import type {
  Connect4Board,
  Connect4Player,
  Connect4Position,
} from "../types/connect4";
import { Connect4GameStatus } from "../types/connect4";
import "./Connect4Board.css";

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
  const moveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardElement = useRef<HTMLDivElement>(null);
  const inputMode = useRef<"pointer" | "keyboard">("pointer");
  useEffect(() => {
    // Undo or any other position change invalidates a pending visual move.
    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    moveTimeout.current = null;
    shakeTimeout.current = null;
    setAnimating(false);
    setDroppingDisc(null);
    setShakeCol(null);
    return () => {
      if (moveTimeout.current) clearTimeout(moveTimeout.current);
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    };
  }, [board]);
  useEffect(() => {
    if (hoverCol === null) return;
    const cell = boardElement.current?.querySelector<HTMLElement>(
      `[data-column="${hoverCol}"]`,
    );
    const frame = boardElement.current?.parentElement;
    if (!cell || !frame) return;
    const reveal = () => {
      const target = cell.getBoundingClientRect(),
        visible = frame.getBoundingClientRect();
      // Reveal the chosen column without moving the document vertically.
      if (target.left < visible.left + 8)
        frame.scrollLeft -= visible.left + 8 - target.left;
      else if (target.right > visible.right - 8)
        frame.scrollLeft += target.right - visible.right + 8;
    };
    reveal();
    window.addEventListener("resize", reveal);
    return () => window.removeEventListener("resize", reveal);
  }, [hoverCol]);

  // Handle column click with shake for full columns
  const handleColumnClick = (col: number) => {
    if (disabled || animating || gameStatus !== "PLAYING") return;
    if (board[0][col] !== null) {
      setShakeCol(col);
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
      shakeTimeout.current = setTimeout(() => setShakeCol(null), 500);
      return;
    }
    const row = getDropRow(board, col);
    if (row === null) return;
    setDroppingDisc({ col, row, player: currentPlayer });
    setAnimating(true);
    // Reduced motion commits without waiting for the decorative drop.
    const duration = Number.parseFloat(
      boardElement.current
        ? getComputedStyle(boardElement.current).getPropertyValue(
            "--c4-drop-duration",
          )
        : "450",
    );
    moveTimeout.current = setTimeout(
      () => {
        setAnimating(false);
        setDroppingDisc(null);
        moveTimeout.current = null;
        onColumnClick(col);
      },
      Number.isFinite(duration) ? Math.max(0, duration) : 450,
    );
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || animating || gameStatus !== "PLAYING") return;
    inputMode.current = "keyboard";
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "Escape",
        "Enter",
        " ",
      ].includes(e.key)
    )
      e.preventDefault();
    if (hoverCol === null) setHoverCol(0);
    if (e.key === "ArrowLeft") {
      setHoverCol((prev) => (prev === null ? 0 : (prev + COLS - 1) % COLS));
    } else if (e.key === "ArrowRight") {
      setHoverCol((prev) => (prev === null ? 0 : (prev + 1) % COLS));
    } else if (e.key === "Home") {
      setHoverCol(0);
    } else if (e.key === "End") {
      setHoverCol(COLS - 1);
    } else if (e.key === "Escape") {
      setHoverCol(null);
    } else if (e.key === "Enter" || e.key === " ") {
      handleColumnClick(hoverCol ?? 0);
    }
  };

  // Render dropping disc animation
  const renderDroppingDisc = () => {
    if (!droppingDisc) return null;
    const { col, row, player } = droppingDisc;
    // Calculate drop distance (in cells)
    return (
      <div
        className={`c4-disc-drop-anim ${player.toLowerCase()}`}
        style={{
          left: `calc(14px + ${col} * (var(--c4-cell-size, 44px) + 6px))`,
          // Animate from top to the cell
          top: 0,
          height: `calc(14px + ${row + 1} * var(--c4-cell-size, 44px) + ${row} * 6px - 2.5px)`,
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
      fallTimeoutRef.current = setTimeout(
        () => {
          onFallOutEnd();
        },
        500 + 80 * (COLS - 1),
      );
    }
    return () => {
      if (fallTimeoutRef.current) clearTimeout(fallTimeoutRef.current);
    };
  }, [falling, onFallOutEnd]);

  return (
    <div
      className="c4-board-wrapper"
      ref={boardElement}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="application"
      aria-label={
        gameStatus !== "PLAYING"
          ? "Connect 4 board. Round complete."
          : `Connect 4 board. ${currentPlayer}'s turn.${hoverCol === null ? "" : ` Column ${hoverCol + 1}${board[0][hoverCol] ? " is full" : " selected"}.`} Use left and right arrows or Home and End to choose a column, then press Enter to drop.`
      }
    >
      <p className="c4-scroll-note">Scroll inside this board ↔</p>
      <div className="c4-column-labels" aria-hidden="true">
        {Array.from({ length: COLS }, (_, col) => (
          <span key={col} className={hoverCol === col ? "is-selected" : ""}>
            {col + 1}
          </span>
        ))}
      </div>
      <div
        className="c4-board-grid"
        style={{ position: "relative", margin: "0 auto" }}
      >
        {renderDroppingDisc()}
        {board.map((row, rowIdx) => (
          <div className="c4-board-row" key={rowIdx}>
            {row.map((cell, colIdx) => {
              const topEmptyRow = getDropRow(board, colIdx) ?? -1;
              // Preview disc logic: strictly based on cell emptiness and topmost empty cell, regardless of player color
              const isPreview =
                hoverCol === colIdx &&
                gameStatus === "PLAYING" &&
                !animating &&
                !disabled &&
                topEmptyRow !== -1 &&
                rowIdx === topEmptyRow &&
                cell === null;
              // Add shake animation to the cell if this column is being shaken
              const shake = shakeCol === colIdx ? " shake" : "";
              return (
                <div
                  key={colIdx}
                  data-column={colIdx}
                  className={`c4-cell${cell ? " " + cell.toLowerCase() : ""}${isWinningCell(rowIdx, colIdx) ? " winning" : ""}${winningLine && !isWinningCell(rowIdx, colIdx) ? " faded" : ""}${hoverCol === colIdx && cell === null ? ` c4-col-hover ${currentPlayer.toLowerCase()}` : ""}${shake}`}
                  aria-label={
                    cell
                      ? `${cell} disc at row ${rowIdx + 1} column ${colIdx + 1}`
                      : `Empty slot at row ${rowIdx + 1} column ${colIdx + 1}`
                  }
                  style={{
                    opacity:
                      winningLine && !isWinningCell(rowIdx, colIdx) ? 0.5 : 1,
                  }}
                  onPointerMove={() => {
                    inputMode.current = "pointer";
                    setHoverCol(colIdx);
                  }}
                  onMouseEnter={() => {
                    if (inputMode.current === "pointer") setHoverCol(colIdx);
                  }}
                  onMouseLeave={() => {
                    if (inputMode.current === "pointer") setHoverCol(null);
                  }}
                  onClick={() => {
                    inputMode.current = "pointer";
                    setHoverCol(colIdx);
                    handleColumnClick(colIdx);
                  }}
                  role="gridcell"
                  tabIndex={-1}
                >
                  {cell &&
                    (!droppingDisc ||
                      droppingDisc.row !== rowIdx ||
                      droppingDisc.col !== colIdx) && (
                      <div
                        className={`c4-disc ${cell.toLowerCase()}${falling ? " falling" : ""}`}
                        style={
                          falling ? { animationDelay: `${colIdx * 80}ms` } : {}
                        }
                      />
                    )}
                  {/* Enhanced preview disc with bounce */}
                  {isPreview && (
                    <div
                      className={`c4-disc ${currentPlayer.toLowerCase()} preview bounce`}
                      style={{
                        opacity: 0.92,
                        border: "3px solid #43e97b",
                        boxShadow:
                          "0 0 16px 4px #43e97b55, 0 2px 12px #1976d255, 0 0 0 6px rgba(255,255,255,0.10)",
                      }}
                    />
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
