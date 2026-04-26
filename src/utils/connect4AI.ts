import { Connect4Board, Connect4Player, Connect4GameState } from '../types/connect4';
import { Connect4Logic } from './connect4Logic';

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export class Connect4AI {
  private difficulty: AIDifficulty;
  private player: Connect4Player;
  private opponent: Connect4Player;

  constructor(difficulty: AIDifficulty, aiPlayer: Connect4Player = 'YELLOW') {
    this.difficulty = difficulty;
    this.player = aiPlayer;
    this.opponent = aiPlayer === 'YELLOW' ? 'RED' : 'YELLOW';
  }

  /**
   * Get the best move for the AI based on difficulty level
   */
  getBestMove(gameState: Connect4GameState): number {
    const validMoves = this.getValidMoves(gameState.board);
    if (validMoves.length === 0) return 0;

    switch (this.difficulty) {
      case 'EASY':
        return this.getRandomMove(validMoves);
      case 'MEDIUM':
        return this.getMediumMove(gameState, validMoves);
      case 'HARD':
        return this.getHardMove(gameState, validMoves);
      default:
        return this.getRandomMove(validMoves);
    }
  }

  /**
   * Get all valid column moves
   */
  private getValidMoves(board: Connect4Board): number[] {
    const validMoves: number[] = [];
    for (let col = 0; col < Connect4Logic.COLS; col++) {
      if (Connect4Logic.getValidRow(board, col) !== null) {
        validMoves.push(col);
      }
    }
    return validMoves;
  }

  /**
   * Easy AI: Random moves
   */
  private getRandomMove(validMoves: number[]): number {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  /**
   * Medium AI: Block opponent wins, try to win, otherwise random
   */
  private getMediumMove(gameState: Connect4GameState, validMoves: number[]): number {
    // 1. Check if AI can win
    for (const col of validMoves) {
      const testState = Connect4Logic.makeMove(gameState, col);
      if (testState.winner === this.player) {
        return col;
      }
    }

    // 2. Check if need to block opponent win
    for (const col of validMoves) {
      // Simulate opponent move
      const tempState = { ...gameState, currentPlayer: this.opponent };
      const testState = Connect4Logic.makeMove(tempState, col);
      if (testState.winner === this.opponent) {
        return col; // Block this winning move
      }
    }

    // 3. Prefer center columns
    const centerCols = validMoves.filter(col => col >= 2 && col <= 4);
    if (centerCols.length > 0) {
      return centerCols[Math.floor(Math.random() * centerCols.length)];
    }

    // 4. Random move
    return this.getRandomMove(validMoves);
  }

  /**
   * Hard AI: Minimax algorithm with alpha-beta pruning
   */
  private getHardMove(gameState: Connect4GameState, validMoves: number[]): number {
    let bestMove = validMoves[0];
    let bestScore = -Infinity;

    for (const col of validMoves) {
      const testState = Connect4Logic.makeMove(gameState, col);
      const score = this.minimax(testState, 5, -Infinity, Infinity, false);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = col;
      }
    }

    return bestMove;
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   */
  private minimax(
    gameState: Connect4GameState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    // Terminal conditions
    if (gameState.winner === this.player) return 1000 + depth;
    if (gameState.winner === this.opponent) return -1000 - depth;
    if (gameState.gameStatus !== 'PLAYING' || depth === 0) {
      return this.evaluateBoard(gameState.board);
    }

    const validMoves = this.getValidMoves(gameState.board);
    
    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const col of validMoves) {
        const testState = Connect4Logic.makeMove(gameState, col);
        const score = this.minimax(testState, depth - 1, alpha, beta, false);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const col of validMoves) {
        const testState = Connect4Logic.makeMove(gameState, col);
        const score = this.minimax(testState, depth - 1, alpha, beta, true);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minScore;
    }
  }

  /**
   * Evaluate board position for AI
   */
  private evaluateBoard(board: Connect4Board): number {
    let score = 0;

    // Center column preference
    const centerCol = 3;
    for (let row = 0; row < Connect4Logic.ROWS; row++) {
      if (board[row][centerCol] === this.player) score += 3;
      if (board[row][centerCol] === this.opponent) score -= 3;
    }

    // Evaluate all possible 4-in-a-row windows
    score += this.evaluateWindows(board);

    return score;
  }

  /**
   * Evaluate all possible 4-cell windows
   */
  private evaluateWindows(board: Connect4Board): number {
    let score = 0;

    // Horizontal windows
    for (let row = 0; row < Connect4Logic.ROWS; row++) {
      for (let col = 0; col < Connect4Logic.COLS - 3; col++) {
        const window = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
        score += this.evaluateWindow(window);
      }
    }

    // Vertical windows
    for (let col = 0; col < Connect4Logic.COLS; col++) {
      for (let row = 0; row < Connect4Logic.ROWS - 3; row++) {
        const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
        score += this.evaluateWindow(window);
      }
    }

    // Diagonal windows (positive slope)
    for (let row = 0; row < Connect4Logic.ROWS - 3; row++) {
      for (let col = 0; col < Connect4Logic.COLS - 3; col++) {
        const window = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
        score += this.evaluateWindow(window);
      }
    }

    // Diagonal windows (negative slope)
    for (let row = 3; row < Connect4Logic.ROWS; row++) {
      for (let col = 0; col < Connect4Logic.COLS - 3; col++) {
        const window = [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3]];
        score += this.evaluateWindow(window);
      }
    }

    return score;
  }

  /**
   * Evaluate a 4-cell window
   */
  private evaluateWindow(window: (Connect4Player | null)[]): number {
    let score = 0;
    const aiCount = window.filter(cell => cell === this.player).length;
    const opponentCount = window.filter(cell => cell === this.opponent).length;
    const emptyCount = window.filter(cell => cell === null).length;

    if (aiCount === 4) score += 100;
    else if (aiCount === 3 && emptyCount === 1) score += 10;
    else if (aiCount === 2 && emptyCount === 2) score += 2;

    if (opponentCount === 3 && emptyCount === 1) score -= 80;
    else if (opponentCount === 2 && emptyCount === 2) score -= 2;

    return score;
  }
}
