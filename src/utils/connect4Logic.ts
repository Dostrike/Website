import { Connect4Player, Connect4Board, Connect4GameState, Connect4GameStatus, Connect4Position } from '../types/connect4';

export class Connect4Logic {
  static ROWS = 6;
  static COLS = 7;

  static createInitialGameState(): Connect4GameState {
    return {
      board: Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(null)),
      currentPlayer: 'RED',
      gameStatus: Connect4GameStatus.PLAYING,
      winner: null,
      winningLine: null,
    };
  }

  static getValidRow(board: Connect4Board, col: number): number | null {
    for (let row = this.ROWS - 1; row >= 0; row--) {
      if (board[row][col] === null) return row;
    }
    return null;
  }

  static makeMove(state: Connect4GameState, col: number): Connect4GameState {
    if (state.gameStatus !== Connect4GameStatus.PLAYING) return state;
    const row = this.getValidRow(state.board, col);
    if (row === null) return state;
    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = state.currentPlayer;
    const { status, winner, winningLine } = this.checkGameStatus(newBoard, row, col, state.currentPlayer);
    return {
      board: newBoard,
      currentPlayer: state.currentPlayer === 'RED' ? 'YELLOW' : 'RED',
      gameStatus: status,
      winner,
      winningLine,
    };
  }

  static checkGameStatus(board: Connect4Board, lastRow: number, lastCol: number, player: Connect4Player): {
    status: Connect4GameStatus;
    winner: Connect4Player | null;
    winningLine: Connect4Position[] | null;
  } {
    // Directions: [rowDelta, colDelta]
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
    ];
    for (const [dr, dc] of directions) {
      let count = 1;
      let line: Connect4Position[] = [[lastRow, lastCol]];
      // Check one direction
      for (let step = 1; step < 4; step++) {
        const r = lastRow + dr * step;
        const c = lastCol + dc * step;
        if (r < 0 || r >= this.ROWS || c < 0 || c >= this.COLS) break;
        if (board[r][c] === player) {
          count++;
          line.push([r, c]);
        } else break;
      }
      // Check opposite direction
      for (let step = 1; step < 4; step++) {
        const r = lastRow - dr * step;
        const c = lastCol - dc * step;
        if (r < 0 || r >= this.ROWS || c < 0 || c >= this.COLS) break;
        if (board[r][c] === player) {
          count++;
          line.unshift([r, c]);
        } else break;
      }
      if (count >= 4) {
        return {
          status: Connect4GameStatus.WIN,
          winner: player,
          winningLine: line,
        };
      }
    }
    // Check for draw
    const isDraw = board[0].every(cell => cell !== null);
    if (isDraw) {
      return {
        status: Connect4GameStatus.DRAW,
        winner: null,
        winningLine: null,
      };
    }
    return {
      status: Connect4GameStatus.PLAYING,
      winner: null,
      winningLine: null,
    };
  }
} 