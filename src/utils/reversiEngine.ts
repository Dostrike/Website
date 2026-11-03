/** Independent 8x8 Reversi. Passes are explicit -1 entries in replay history. */
export type ReversiColour = "black" | "white";
export type ReversiCell = ReversiColour | null;
export type ReversiDifficulty = "easy" | "medium" | "hard";
export type ReversiState = {
  board: ReversiCell[];
  turn: ReversiColour;
  moves: number[];
  lastFlipped: number[];
  passed: ReversiColour | null;
  over: boolean;
  winner: ReversiColour | "draw" | null;
};
const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];
export const oppositeReversi = (colour: ReversiColour): ReversiColour =>
  colour === "black" ? "white" : "black";
export function reversiCounts(board: readonly ReversiCell[]) {
  return {
    black: board.filter((cell) => cell === "black").length,
    white: board.filter((cell) => cell === "white").length,
    empty: board.filter((cell) => cell === null).length,
  };
}
export function reversiFlips(
  board: readonly ReversiCell[],
  index: number,
  colour: ReversiColour,
): number[] {
  if (!Number.isInteger(index) || index < 0 || index >= 64 || board[index])
    return [];
  const row = Math.floor(index / 8),
    col = index % 8,
    opponent = oppositeReversi(colour);
  const flips: number[] = [];
  for (const [dr, dc] of directions) {
    let r = row + dr,
      c = col + dc;
    const line: number[] = [];
    while (
      r >= 0 &&
      r < 8 &&
      c >= 0 &&
      c < 8 &&
      board[r * 8 + c] === opponent
    ) {
      line.push(r * 8 + c);
      r += dr;
      c += dc;
    }
    if (
      line.length &&
      r >= 0 &&
      r < 8 &&
      c >= 0 &&
      c < 8 &&
      board[r * 8 + c] === colour
    )
      flips.push(...line);
  }
  return flips;
}
export function reversiLegalMoves(
  board: readonly ReversiCell[],
  colour: ReversiColour,
): number[] {
  return board.flatMap((cell, index) =>
    !cell && reversiFlips(board, index, colour).length ? [index] : [],
  );
}
function withOutcome(state: ReversiState): ReversiState {
  if (
    reversiLegalMoves(state.board, "black").length ||
    reversiLegalMoves(state.board, "white").length
  )
    return state;
  const count = reversiCounts(state.board);
  return {
    ...state,
    over: true,
    winner:
      count.black === count.white
        ? "draw"
        : count.black > count.white
          ? "black"
          : "white",
  };
}
export function newReversi(): ReversiState {
  const board: ReversiCell[] = Array(64).fill(null);
  board[27] = "white";
  board[28] = "black";
  board[35] = "black";
  board[36] = "white";
  return {
    board,
    turn: "black",
    moves: [],
    lastFlipped: [],
    passed: null,
    over: false,
    winner: null,
  };
}
export function playReversi(state: ReversiState, index: number): ReversiState {
  if (state.over) return state;
  const flips = reversiFlips(state.board, index, state.turn);
  if (!flips.length) return state;
  const board = [...state.board];
  board[index] = state.turn;
  for (const point of flips) board[point] = state.turn;
  return withOutcome({
    board,
    turn: oppositeReversi(state.turn),
    moves: [...state.moves, index],
    lastFlipped: flips,
    passed: null,
    over: false,
    winner: null,
  });
}
export function passReversi(state: ReversiState): ReversiState {
  if (state.over || reversiLegalMoves(state.board, state.turn).length)
    return state;
  if (!reversiLegalMoves(state.board, oppositeReversi(state.turn)).length)
    return withOutcome(state);
  return {
    ...state,
    turn: oppositeReversi(state.turn),
    moves: [...state.moves, -1],
    passed: state.turn,
  };
}
export function replayReversi(moves: readonly number[]): ReversiState {
  if (moves.length > 120) throw new Error("Invalid Reversi history");
  let state = newReversi();
  for (const index of moves) {
    const next = index === -1 ? passReversi(state) : playReversi(state, index);
    if (next === state) throw new Error("Invalid Reversi history");
    state = next;
  }
  return state;
}
/** Return the prefix before the last placement by this side; pass entries also change whose turn it is. */
export function reversiUndoIndex(
  moves: readonly number[],
  side: ReversiColour | null,
  minimum = 0,
): number {
  for (let index = moves.length - 1; index >= minimum; index--) {
    if (
      moves[index] !== -1 &&
      (side === null || (index % 2 === 0 ? "black" : "white") === side)
    )
      return index;
  }
  return -1;
}
const weights = [
  120, -25, 18, 8, 8, 18, -25, 120, -25, -45, -3, -3, -3, -3, -45, -25, 18, -3,
  6, 3, 3, 6, -3, 18, 8, -3, 3, 3, 3, 3, -3, 8, 8, -3, 3, 3, 3, 3, -3, 8, 18,
  -3, 6, 3, 3, 6, -3, 18, -25, -45, -3, -3, -3, -3, -45, -25, 120, -25, 18, 8,
  8, 18, -25, 120,
];
function positionScore(state: ReversiState, colour: ReversiColour): number {
  const opponent = oppositeReversi(colour),
    count = reversiCounts(state.board);
  const difference = count[colour] - count[opponent];
  if (state.over)
    return difference === 0 ? 0 : Math.sign(difference) * 100000 + difference;
  const position = state.board.reduce<number>(
    (score, cell, index) =>
      score +
      (cell === colour
        ? weights[index]
        : cell === opponent
          ? -weights[index]
          : 0),
    0,
  );
  const mobility =
    reversiLegalMoves(state.board, colour).length -
    reversiLegalMoves(state.board, opponent).length;
  return position + mobility * 8 + difference * (count.empty < 16 ? 5 : 0.2);
}
/** Bounded iterative-deepening minimax; no perfect-play or calibrated-rating claim. */
export function chooseReversiMove(
  state: ReversiState,
  difficulty: ReversiDifficulty,
  random: () => number = Math.random,
): number | null {
  if (state.over) return null;
  const legal = reversiLegalMoves(state.board, state.turn);
  if (!legal.length) return null;
  if (difficulty === "easy")
    return legal[
      Math.min(
        legal.length - 1,
        Math.max(0, Math.floor(random() * legal.length)),
      )
    ];
  const ordered = (position: ReversiState) =>
    reversiLegalMoves(position.board, position.turn).sort(
      (a, b) => weights[b] - weights[a] || a - b,
    );
  const root = ordered(state),
    colour = state.turn;
  let nodes = 0,
    best = root[0];
  const budget = difficulty === "medium" ? 2000 : 12000;
  const exhausted = {};
  function search(
    position: ReversiState,
    depth: number,
    alpha: number,
    beta: number,
  ): number {
    if (++nodes > budget) throw exhausted;
    if (position.over || depth === 0) return positionScore(position, colour);
    const choices = ordered(position);
    if (!choices.length)
      return search(passReversi(position), depth, alpha, beta);
    const maximizing = position.turn === colour;
    let value = maximizing ? -Infinity : Infinity;
    for (const move of choices) {
      const score = search(playReversi(position, move), depth - 1, alpha, beta);
      value = maximizing ? Math.max(value, score) : Math.min(value, score);
      if (maximizing) alpha = Math.max(alpha, value);
      else beta = Math.min(beta, value);
      if (beta <= alpha) break;
    }
    return value;
  }
  const maxDepth =
    difficulty === "medium" ? 2 : reversiCounts(state.board).empty <= 8 ? 8 : 4;
  for (let depth = 1; depth <= maxDepth; depth++) {
    let candidate = root[0],
      value = -Infinity;
    try {
      for (const move of root) {
        const score = search(
          playReversi(state, move),
          depth - 1,
          value,
          Infinity,
        );
        if (score > value) {
          value = score;
          candidate = move;
        }
      }
      best = candidate;
    } catch (error) {
      if (error !== exhausted) throw error;
      break;
    }
  }
  return best;
}
/** A reproducible website opening, not an app-parity puzzle or a unique-answer claim. */
export function reversiDaily(date: string): ReversiState {
  let seed = 2166136261;
  for (const char of date)
    seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  let state = newReversi();
  for (let opening = 0; opening < 6; opening++) {
    const legal = reversiLegalMoves(state.board, state.turn).filter((move) => {
      const next = playReversi(state, move);
      return !next.over && reversiLegalMoves(next.board, next.turn).length > 0;
    });
    if (!legal.length) return replayReversi([19, 18, 17, 9, 1, 0]);
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    state = playReversi(state, legal[seed % legal.length]);
  }
  return state;
}
