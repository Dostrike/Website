export type Connect4Player = 'RED' | 'YELLOW';
export type Connect4Cell = Connect4Player | null;
export type Connect4Board = Connect4Cell[][]; // 6 rows x 7 columns
export type Connect4Position = [number, number]; // [row, col]

export enum Connect4GameStatus {
  PLAYING = 'PLAYING',
  WIN = 'WIN',
  DRAW = 'DRAW',
}

export interface Connect4GameState {
  board: Connect4Board;
  currentPlayer: Connect4Player;
  gameStatus: Connect4GameStatus;
  winner: Connect4Player | null;
  winningLine: Connect4Position[] | null;
} 