import {
  chessFromHistory,
  chessHash,
  chessOutcome,
  chessPly,
  chessPlyKey,
  chessRandom,
} from "./chessEngine";
import type { ChessColor, ChessPly, ChessPosition } from "./chessEngine";
import type { Chess, Move, PieceSymbol } from "chess.js";
export type ChessLevel = "easy" | "medium" | "hard";
export type ChessChoice = {
  move: ChessPly | null;
  nodes: number;
  depth: number;
  score: number;
  budgetHit: boolean;
  reason: string;
};
export type ChessSearchOptions = {
  maxNodes?: number;
  maxTimeMs?: number;
  maxDepth?: number;
};
const values: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};
/** Computed material/geometry terms, no copied evaluation tables. */
export function evaluateChess(chess: Chess, root: ChessColor): number {
  const pieces = chess
    .board()
    .flat()
    .filter((man) => man !== null);
  const nonPawnMaterial = pieces.reduce(
    (sum, man) => sum + (man!.type === "p" ? 0 : values[man!.type]),
    0,
  );
  let white = 0;
  for (const man of pieces) {
    const file = man!.square.charCodeAt(0) - 97,
      rank = Number(man!.square[1]) - 1;
    const center = 7 - Math.abs(file - 3.5) - Math.abs(rank - 3.5);
    const advance = man!.color === "w" ? rank - 1 : 6 - rank;
    const position =
      man!.type === "p"
        ? 7 * advance + 2 * center
        : man!.type === "n" || man!.type === "b"
          ? 9 * center
          : man!.type === "k"
            ? (nonPawnMaterial > 2600 ? -5 : 8) * center
            : 2 * center;
    white += (man!.color === "w" ? 1 : -1) * (values[man!.type] + position);
  }
  return root === "w" ? white : -white;
}
function ordered(moves: Move[], seed: number): Move[] {
  const priority = (move: Move) =>
    (move.san.endsWith("#") ? 100000 : 0) +
    (move.captured ? values[move.captured] * 10 - values[move.piece] : 0) +
    (move.promotion ? values[move.promotion] : 0) +
    (move.flags.includes("k") || move.flags.includes("q") ? 30 : 0);
  return [...moves].sort(
    (a, b) =>
      priority(b) - priority(a) ||
      chessHash(`${seed}:${chessPlyKey(a)}`) -
        chessHash(`${seed}:${chessPlyKey(b)}`),
  );
}
/** Bounded search, with full repetition history and no FEN-only transposition cache. */
export function chooseChessMove(
  position: ChessPosition,
  level: ChessLevel,
  seed: number,
  options: ChessSearchOptions = {},
): ChessChoice {
  const began = Date.now(),
    random = chessRandom(seed);
  if (!["easy", "medium", "hard"].includes(level))
    throw Error("Invalid chess level");
  const maxNodes = options.maxNodes ?? (level === "hard" ? 60000 : 12000);
  const maxTimeMs = options.maxTimeMs ?? (level === "hard" ? 700 : 200);
  const maxDepth = options.maxDepth ?? (level === "hard" ? 4 : 2);
  if (
    !Number.isInteger(maxNodes) ||
    maxNodes < 1 ||
    maxNodes > 200000 ||
    !Number.isInteger(maxTimeMs) ||
    maxTimeMs < 1 ||
    maxTimeMs > 10000 ||
    !Number.isInteger(maxDepth) ||
    maxDepth < 1 ||
    maxDepth > 6
  )
    throw Error("Invalid chess search budget");
  const chess = chessFromHistory(position),
    root = chess.turn(),
    legal = chess.moves({ verbose: true });
  const result = chessOutcome(chess, legal);
  if (result)
    return {
      move: null,
      nodes: 0,
      depth: 0,
      score:
        result.winner === "draw"
          ? 0
          : result.winner === root
            ? 100000
            : -100000,
      budgetHit: false,
      reason: `Position complete: ${result.reason}.`,
    };
  if (level === "easy")
    return {
      move: chessPly(legal[Math.floor(random() * legal.length)]),
      nodes: 0,
      depth: 0,
      score: 0,
      budgetHit: false,
      reason: "Seeded choice among legal moves; no strength rating is implied.",
    };
  const deadline = began + maxTimeMs,
    stop = Symbol("budget");
  let nodes = 0,
    depthDone = 0,
    budgetHit = false;
  const roots = ordered(legal, seed);
  let best = chessPly(roots[0]),
    bestScore = evaluateChess(chess, root);
  function search(
    depth: number,
    alpha: number,
    beta: number,
    ply: number,
  ): number {
    if (nodes >= maxNodes || Date.now() >= deadline) throw stop;
    nodes++;
    const moves = chess.moves({ verbose: true }),
      outcome = chessOutcome(chess, moves);
    if (outcome)
      return outcome.winner === "draw"
        ? 0
        : outcome.winner === root
          ? 100000 - ply
          : -100000 + ply;
    if (!depth) return evaluateChess(chess, root);
    const maximize = chess.turn() === root;
    let score = maximize ? -Infinity : Infinity;
    for (const move of ordered(moves, seed)) {
      chess.move(chessPly(move));
      let child: number;
      try {
        child = search(depth - 1, alpha, beta, ply + 1);
      } finally {
        chess.undo();
      }
      score = maximize ? Math.max(score, child) : Math.min(score, child);
      if (maximize) alpha = Math.max(alpha, score);
      else beta = Math.min(beta, score);
      if (alpha >= beta) break;
    }
    return score;
  }
  for (let depth = 1; depth <= maxDepth; depth++) {
    let candidate = best,
      score = -Infinity,
      alpha = -Infinity;
    try {
      for (const move of roots) {
        chess.move(chessPly(move));
        let child: number;
        try {
          child = search(depth - 1, alpha, Infinity, 1);
        } finally {
          chess.undo();
        }
        if (child > score) {
          score = child;
          candidate = chessPly(move);
        }
        alpha = Math.max(alpha, score);
      }
      best = candidate;
      bestScore = score;
      depthDone = depth;
      // A mate on this immediate move is conclusive; deeper horizons are not a perfect-play claim.
      if (score === 99999) break;
    } catch (error) {
      if (error !== stop) throw error;
      budgetHit = true;
      break;
    }
  }
  return {
    move: best,
    nodes,
    depth: depthDone,
    score: bestScore,
    budgetHit,
    reason: depthDone
      ? `Completed depth ${depthDone} within bounded search${budgetHit ? "; budget stopped the next iteration" : ""}. Evaluation is not a winning guarantee.`
      : "Budget reached before a full depth completed; using a legal ordered fallback.",
  };
}
