/** DoStrike adapter; move legality is provided by BSD-2-Clause chess.js 1.4.0. */
import { Chess, DEFAULT_POSITION } from "chess.js";
import type { Color, Move, PieceSymbol, Square } from "chess.js";
export type ChessColor = Color;
export type ChessPromotion = "q" | "r" | "b" | "n";
export type ChessPly = { from: Square; to: Square; promotion?: ChessPromotion };
export type ChessLegal = ChessPly & {
  san: string;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  flags: string;
};
export type ChessMan = {
  square: Square;
  color: ChessColor;
  piece: PieceSymbol;
};
export type ChessResult = {
  winner: ChessColor | "draw";
  reason: "checkmate" | "stalemate" | "material" | "threefold" | "fifty-move";
};
export type ChessPosition = { initialFen: string; moves: ChessPly[] };
export type ChessState = ChessPosition & {
  fen: string;
  turn: ChessColor;
  board: (ChessMan | null)[];
  legal: ChessLegal[];
  san: string[];
  check: boolean;
  result: ChessResult | null;
};
export const CHESS_START = DEFAULT_POSITION;
export const CHESS_MAX_PLIES = 20000;
export const chessPlyKey = (move: Pick<Move, "from" | "to" | "promotion">) =>
  `${move.from}${move.to}${move.promotion || ""}`;
export function validChessPly(value: unknown): value is ChessPly {
  if (!value || typeof value !== "object") return false;
  const p = value as ChessPly;
  return (
    Object.keys(p).every((key) => ["from", "to", "promotion"].includes(key)) &&
    typeof p.from === "string" &&
    /^[a-h][1-8]$/.test(p.from) &&
    typeof p.to === "string" &&
    /^[a-h][1-8]$/.test(p.to) &&
    p.from !== p.to &&
    (!Object.prototype.hasOwnProperty.call(p, "promotion") ||
      ["q", "r", "b", "n"].includes(p.promotion!))
  );
}
export const chessPly = (
  move: Pick<Move, "from" | "to" | "promotion">,
): ChessPly => ({
  from: move.from,
  to: move.to,
  ...(move.promotion ? { promotion: move.promotion as ChessPromotion } : {}),
});
/** Casual automatic draws, deliberately distinct from FIDE's claim procedure. */
export function chessOutcome(
  chess: Chess,
  legal: readonly Move[] = chess.moves({ verbose: true }),
): ChessResult | null {
  if (!legal.length)
    return chess.inCheck()
      ? { winner: chess.turn() === "w" ? "b" : "w", reason: "checkmate" }
      : { winner: "draw", reason: "stalemate" };
  if (chess.isInsufficientMaterial())
    return { winner: "draw", reason: "material" };
  if (chess.isThreefoldRepetition())
    return { winner: "draw", reason: "threefold" };
  if (chess.isDrawByFiftyMoves())
    return { winner: "draw", reason: "fifty-move" };
  return null;
}
/** Full history is required for repetition. Custom initial FENs are for checked fixtures, not user imports. */
export function chessFromHistory(position: ChessPosition): Chess {
  if (
    !position ||
    typeof position.initialFen !== "string" ||
    position.initialFen.length > 160 ||
    !Array.isArray(position.moves) ||
    position.moves.length > CHESS_MAX_PLIES
  )
    throw Error("Invalid chess position");
  const chess = new Chess(position.initialFen);
  for (const move of position.moves) {
    if (!validChessPly(move) || chessOutcome(chess))
      throw Error("Illegal or post-result chess move");
    chess.move(chessPly(move));
  }
  return chess;
}
function snapshot(
  chess: Chess,
  initialFen: string,
  moves: readonly ChessPly[],
): ChessState {
  const legal = chess.moves({ verbose: true });
  const result = chessOutcome(chess, legal);
  return {
    initialFen,
    moves: moves.map(chessPly),
    fen: chess.fen(),
    turn: chess.turn(),
    board: chess
      .board()
      .flat()
      .map((man) =>
        man ? { square: man.square, color: man.color, piece: man.type } : null,
      ),
    legal: result
      ? []
      : legal.map((move) => ({
          ...chessPly(move),
          san: move.san,
          piece: move.piece,
          ...(move.captured ? { captured: move.captured } : {}),
          flags: move.flags,
        })),
    san: chess.history(),
    check: chess.inCheck(),
    result,
  };
}
export function newChess(initialFen = CHESS_START): ChessState {
  const chess = new Chess(initialFen);
  return snapshot(chess, chess.fen({ forceEnpassantSquare: true }), []);
}
export function replayChess(
  moves: readonly ChessPly[],
  initialFen = CHESS_START,
): ChessState | null {
  try {
    const chess = chessFromHistory({ initialFen, moves: moves as ChessPly[] });
    return snapshot(chess, initialFen, moves);
  } catch {
    return null;
  }
}
export function playChess(
  state: ChessState,
  move: ChessPly,
): ChessState | null {
  if (
    state.result ||
    !validChessPly(move) ||
    !state.legal.some((legal) => chessPlyKey(legal) === chessPlyKey(move))
  )
    return null;
  try {
    const chess = chessFromHistory(state);
    chess.move(chessPly(move));
    return snapshot(chess, state.initialFen, [...state.moves, chessPly(move)]);
  } catch {
    return null;
  }
}
export function undoChess(state: ChessState, count = 1): ChessState | null {
  if (!Number.isInteger(count) || count < 1 || count > state.moves.length)
    return null;
  return replayChess(state.moves.slice(0, -count), state.initialFen);
}
export function chessHash(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++)
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return hash >>> 0;
}
export function chessRandom(seed: number): () => number {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw Error("Invalid chess seed");
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(value ^ (value >>> 15), value | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
/** Six legal non-capturing, non-checking website-generated plies, then White moves. */
export function dailyChess(seed: string): ChessState {
  if (typeof seed !== "string" || !seed || seed.length > 128)
    throw Error("Invalid chess opening seed");
  const chess = new Chess(),
    random = chessRandom(chessHash(seed)),
    moves: ChessPly[] = [];
  for (let i = 0; i < 6; i++) {
    const choices = chess
      .moves({ verbose: true })
      .filter(
        (move) =>
          !move.captured &&
          !move.promotion &&
          ["p", "n", "b"].includes(move.piece),
      )
      .filter((move) => {
        chess.move(chessPly(move));
        const quiet = !chess.inCheck() && !chessOutcome(chess);
        chess.undo();
        return quiet;
      })
      .sort((a, b) => chessPlyKey(a).localeCompare(chessPlyKey(b)));
    if (!choices.length) throw Error("Quiet opening could not be generated");
    const move = chessPly(choices[Math.floor(random() * choices.length)]);
    chess.move(move);
    moves.push(move);
  }
  return snapshot(chess, CHESS_START, moves);
}
