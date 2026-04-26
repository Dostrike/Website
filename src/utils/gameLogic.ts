import { Player, GameStatus, Difficulty, GameMode, Board, Position, GameState } from '../types/game';

export class GameLogic {
  static makeMove(gameState: GameState, row: number, col: number, gameMode: GameMode): GameState {
    if (gameState.board[row][col] !== null || gameState.gameStatus !== GameStatus.PLAYING) {
      return gameState;
    }

    const newBoard = gameState.board.map((boardRow, r) =>
      boardRow.map((cell, c) => (r === row && c === col ? gameState.currentPlayer : cell))
    );

    const { status, winner, winningLine } = this.checkGameStatus(newBoard);

    return {
      ...gameState,
      board: newBoard,
      currentPlayer: this.getOppositePlayer(gameState.currentPlayer),
      gameStatus: status,
      winner,
      winningLine,
      isAiTurn: gameMode === GameMode.AI ? !gameState.isAiTurn : false
    };
  }

  static getAiMove(gameState: GameState): Position | null {
    if (!gameState.difficulty) return null;

    switch (gameState.difficulty) {
      case Difficulty.EASY:
        return this.getEasyMove(gameState.board);
      case Difficulty.MEDIUM:
        return this.getMediumMove(gameState.board, gameState.currentPlayer);
      case Difficulty.HARD:
        return this.getHardMove(gameState.board, gameState.currentPlayer);
      default:
        return null;
    }
  }

  private static getEasyMove(board: Board): Position | null {
    const emptyCells = this.getEmptyCells(board);
    if (emptyCells.length === 0) return null;

    // 70% random, 30% strategic
    if (Math.random() < 0.7) {
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else {
      return this.getBestMove(board, Player.O) || emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
  }

  private static getMediumMove(board: Board, aiPlayer: Player): Position | null {
    // Try to win first
    const winningMove = this.getWinningMove(board, aiPlayer);
    if (winningMove) return winningMove;

    // Try to block opponent from winning
    const blockingMove = this.getWinningMove(board, this.getOppositePlayer(aiPlayer));
    if (blockingMove) return blockingMove;

    // Take center if available
    if (board[1][1] === null) return [1, 1];

    // Take corners
    const corners: Position[] = [[0, 0], [0, 2], [2, 0], [2, 2]];
    const availableCorners = corners.filter(([r, c]) => board[r][c] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Take any available position
    const emptyCells = this.getEmptyCells(board);
    return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
  }

  private static getHardMove(board: Board, aiPlayer: Player): Position | null {
    return this.getBestMove(board, aiPlayer);
  }

  private static getBestMove(board: Board, player: Player): Position | null {
    let bestScore = -Infinity;
    let bestMove: Position | null = null;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === null) {
          const newBoard = board.map((row, r) =>
            row.map((cell, c) => (r === i && c === j ? player : cell))
          );

          const score = this.minimax(newBoard, 0, false, player, -Infinity, Infinity);
          if (score > bestScore) {
            bestScore = score;
            bestMove = [i, j];
          }
        }
      }
    }

    return bestMove;
  }

  private static minimax(
    board: Board,
    depth: number,
    isMaximizing: boolean,
    aiPlayer: Player,
    alpha: number,
    beta: number
  ): number {
    const { status, winner } = this.checkGameStatus(board);

    if (status === GameStatus.GAME_OVER) {
      if (winner === aiPlayer) return 10 - depth;
      if (winner === this.getOppositePlayer(aiPlayer)) return depth - 10;
      return 0;
    }

    if (status === GameStatus.DRAW) return 0;

    let newAlpha = alpha;
    let newBeta = beta;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === null) {
            const newBoard = board.map((row, r) =>
              row.map((cell, c) => (r === i && c === j ? aiPlayer : cell))
            );

                         const evaluation = this.minimax(newBoard, depth + 1, false, aiPlayer, newAlpha, newBeta);
             maxEval = Math.max(maxEval, evaluation);
             newAlpha = Math.max(newAlpha, evaluation);

            if (newBeta <= newAlpha) break;
          }
        }
        if (newBeta <= newAlpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === null) {
            const newBoard = board.map((row, r) =>
              row.map((cell, c) => (r === i && c === j ? this.getOppositePlayer(aiPlayer) : cell))
            );

                         const evaluation = this.minimax(newBoard, depth + 1, true, aiPlayer, newAlpha, newBeta);
             minEval = Math.min(minEval, evaluation);
             newBeta = Math.min(newBeta, evaluation);

            if (newBeta <= newAlpha) break;
          }
        }
        if (newBeta <= newAlpha) break;
      }
      return minEval;
    }
  }

  private static getWinningMove(board: Board, player: Player): Position | null {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === null) {
          const testBoard = board.map((row, r) =>
            row.map((cell, c) => (r === i && c === j ? player : cell))
          );

          const { status, winner } = this.checkGameStatus(testBoard);
          if (status === GameStatus.GAME_OVER && winner === player) {
            return [i, j];
          }
        }
      }
    }
    return null;
  }

  static getEmptyCells(board: Board): Position[] {
    const emptyCells: Position[] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === null) {
          emptyCells.push([i, j]);
        }
      }
    }
    return emptyCells;
  }

  static checkGameStatus(board: Board): {
    status: GameStatus;
    winner: Player | null;
    winningLine: Position[] | null;
  } {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
        return {
          status: GameStatus.GAME_OVER,
          winner: board[i][0],
          winningLine: [[i, 0], [i, 1], [i, 2]]
        };
      }
    }

    // Check columns
    for (let j = 0; j < 3; j++) {
      if (board[0][j] && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
        return {
          status: GameStatus.GAME_OVER,
          winner: board[0][j],
          winningLine: [[0, j], [1, j], [2, j]]
        };
      }
    }

    // Check diagonals
    if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      return {
        status: GameStatus.GAME_OVER,
        winner: board[0][0],
        winningLine: [[0, 0], [1, 1], [2, 2]]
      };
    }

    if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      return {
        status: GameStatus.GAME_OVER,
        winner: board[0][2],
        winningLine: [[0, 2], [1, 1], [2, 0]]
      };
    }

    // Check for draw
    const isFull = board.every(row => row.every(cell => cell !== null));
    if (isFull) {
      return {
        status: GameStatus.DRAW,
        winner: null,
        winningLine: null
      };
    }

    return {
      status: GameStatus.PLAYING,
      winner: null,
      winningLine: null
    };
  }

  static getOppositePlayer(player: Player): Player {
    return player === Player.X ? Player.O : Player.X;
  }

  static createInitialGameState(): GameState {
    return {
      board: Array(3).fill(null).map(() => Array(3).fill(null)),
      currentPlayer: Player.X,
      gameStatus: GameStatus.PLAYING,
      winner: null,
      winningLine: null,
      isAiTurn: false,
      difficulty: null,
      score: {
        playerWins: 0,
        aiWins: 0,
        draws: 0,
        player1Wins: 0,
        player2Wins: 0
      },
      player1Name: 'Player 1',
      player2Name: 'Player 2',
      gameMode: GameMode.AI,
      gameStarter: Player.X
    };
  }
} 