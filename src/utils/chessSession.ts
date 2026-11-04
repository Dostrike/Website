import {
  CHESS_MAX_PLIES,
  CHESS_START,
  chessHash,
  chessPly,
  chessPlyKey,
  dailyChess,
  newChess,
  playChess,
  replayChess,
} from "./chessEngine";
import type { ChessColor, ChessPly, ChessState } from "./chessEngine";
import type { ChessLevel } from "./chessAI";
import type { ChessWorkerRequest } from "../workers/chess.worker";
export type ChessSettings = {
  mode: "computer" | "local";
  human: ChessColor;
  level: ChessLevel;
};
export type ChessRound = {
  id: string;
  day: string | null;
  settings: ChessSettings;
  assisted: boolean;
  game: ChessState;
};
export const chessSaveKey = "dostrike-chess-session-v1";
export function validChessSettings(value: unknown): value is ChessSettings {
  const v = value as ChessSettings;
  return (
    !!v &&
    ["computer", "local"].includes(v.mode) &&
    ["w", "b"].includes(v.human) &&
    ["easy", "medium", "hard"].includes(v.level)
  );
}
export function validChessDay(day: unknown): day is string {
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(`${day}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day
  );
}
export function newChessRound(
  settings: ChessSettings,
  id: string,
  day: string | null = null,
): ChessRound {
  if (
    !validChessSettings(settings) ||
    typeof id !== "string" ||
    !id ||
    id.length > 100 ||
    (day !== null && !validChessDay(day))
  )
    throw Error("Invalid Chess round");
  if (
    day !== null &&
    (settings.mode !== "computer" ||
      settings.human !== "w" ||
      settings.level !== "hard")
  )
    throw Error("Invalid Chess daily settings");
  return {
    id,
    day,
    settings: {
      mode: settings.mode,
      human: settings.human,
      level: settings.level,
    },
    assisted: false,
    game: day ? dailyChess(`dostrike-chess:daily:v1:${day}`) : newChess(),
  };
}
export const chessFloor = (round: ChessRound) => (round.day ? 6 : 0);
export function moveChessRound(round: ChessRound, move: ChessPly): ChessRound {
  const game = playChess(round.game, move);
  return game ? { ...round, game } : round;
}
function undoIndex(round: ChessRound): number | null {
  if (round.game.result || round.game.moves.length <= chessFloor(round))
    return null;
  if (round.settings.mode === "local") return round.game.moves.length - 1;
  for (
    let index = round.game.moves.length - 1;
    index >= chessFloor(round);
    index--
  )
    if ((index % 2 === 0 ? "w" : "b") === round.settings.human) return index;
  return null;
}
export const canUndoChessRound = (round: ChessRound) =>
  undoIndex(round) !== null;
export function undoChessRound(round: ChessRound): ChessRound {
  const index = undoIndex(round);
  if (index === null) return round;
  const game = replayChess(round.game.moves.slice(0, index));
  if (!game) throw Error("Invalid Chess history");
  return { ...round, assisted: true, game };
}
export const assistChessRound = (round: ChessRound): ChessRound =>
  round.assisted ? round : { ...round, assisted: true };
export function restartChessRound(round: ChessRound, id: string): ChessRound {
  if (id === round.id) throw Error("Restart requires a new attempt identity");
  return newChessRound(round.settings, id, round.day);
}
export const chessPositionKey = (round: ChessRound) =>
  `${round.id}:${round.day || "practice"}:${round.settings.mode}:${round.settings.human}:${round.settings.level}:${round.game.moves.map(chessPlyKey).join(",")}`;
export function chessReplyMatches(
  round: ChessRound,
  requestId: number,
  expectedId: number,
  positionKey: string,
): boolean {
  return (
    Number.isSafeInteger(requestId) &&
    requestId > 0 &&
    requestId === expectedId &&
    positionKey === chessPositionKey(round) &&
    round.game.result === null
  );
}
export function makeChessRequest(
  round: ChessRound,
  requestId: number,
  hint = false,
): ChessWorkerRequest {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || round.game.result)
    throw Error("Invalid Chess request identity");
  const positionKey = chessPositionKey(round);
  const decisionKey = round.day
    ? `${round.day}:${round.settings.level}:${round.game.moves.map(chessPlyKey).join(",")}`
    : positionKey;
  return {
    requestId,
    positionKey,
    position: {
      initialFen: CHESS_START,
      moves: round.game.moves.map(chessPly),
    },
    level: hint ? "hard" : round.settings.level,
    seed: chessHash(`dostrike-chess:decision:v1:${decisionKey}`),
  };
}
export function encodeChessRound(round: ChessRound): string {
  return JSON.stringify({
    version: 1,
    id: round.id,
    day: round.day,
    settings: round.settings,
    assisted: round.assisted,
    moves: round.game.moves.map(chessPly),
  });
}
export function decodeChessRound(text: string): ChessRound | null {
  try {
    if (text.length > 2000000) return null;
    const v = JSON.parse(text);
    if (
      v?.version !== 1 ||
      typeof v.assisted !== "boolean" ||
      (v.day !== null && typeof v.day !== "string") ||
      !Array.isArray(v.moves) ||
      v.moves.length > CHESS_MAX_PLIES ||
      Object.prototype.hasOwnProperty.call(v, "initialFen")
    )
      return null;
    const initial = newChessRound(v.settings, v.id, v.day);
    if (
      v.moves.length < chessFloor(initial) ||
      initial.game.moves.some(
        (move, i) =>
          !v.moves[i] || chessPlyKey(move) !== chessPlyKey(v.moves[i]),
      )
    )
      return null;
    const game = replayChess(v.moves);
    return game ? { ...initial, assisted: v.assisted, game } : null;
  } catch {
    return null;
  }
}
export function readChessRound(): ChessRound | null {
  try {
    return decodeChessRound(localStorage.getItem(chessSaveKey) || "null");
  } catch {
    return null;
  }
}
export function chessInitialRound(
  navigation: unknown,
  saved: ChessRound | null = readChessRound(),
): ChessRound | null {
  const carried =
    typeof navigation === "string" ? decodeChessRound(navigation) : null;
  return carried && saved?.id !== carried.id ? carried : saved || carried;
}
export function writeChessRound(round: ChessRound): boolean {
  try {
    localStorage.setItem(chessSaveKey, encodeChessRound(round));
    return true;
  } catch {
    return false;
  }
}
