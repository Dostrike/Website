export enum Player {
  X = 'X',
  O = 'O'
}

export enum GameStatus {
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  DRAW = 'DRAW'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum GameMode {
  AI = 'AI',
  PVP = 'PVP'
}

export enum GameTheme {
  CLASSIC = 'CLASSIC',
  OCEAN = 'OCEAN',
  SUNSET = 'SUNSET',
  FOREST = 'FOREST',
  MIDNIGHT = 'MIDNIGHT',
  NEON = 'NEON',
  PASTEL = 'PASTEL'
}

export interface Score {
  playerWins: number;
  aiWins: number;
  draws: number;
  player1Wins: number;
  player2Wins: number;
}

export interface GameState {
  board: (Player | null)[][];
  currentPlayer: Player;
  gameStatus: GameStatus;
  winner: Player | null;
  winningLine: [number, number][] | null;
  isAiTurn: boolean;
  difficulty: Difficulty | null;
  score: Score;
  player1Name: string;
  player2Name: string;
  gameMode: GameMode;
  gameStarter: Player;
}

export type Board = (Player | null)[][];
export type Position = [number, number]; 