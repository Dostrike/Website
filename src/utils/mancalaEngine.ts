/** Kalah with six pits per side; capture requires a non-empty opposite pit. */
export type MancalaSide = 0 | 1;
export type MancalaDifficulty = "easy" | "medium" | "hard";
export type MancalaMove = {
  actor: MancalaSide;
  pit: number;
  landing: number;
  path: number[];
  captured: number;
  extraTurn: boolean;
  swept: [number, number];
};
export type MancalaState = {
  board: number[];
  turn: MancalaSide;
  moves: number[];
  last: MancalaMove | null;
  over: boolean;
  winner: MancalaSide | "draw" | null;
};
export const mancalaStore = (side: MancalaSide) => (side === 0 ? 6 : 13);
export const mancalaPits = (side: MancalaSide) =>
  side === 0 ? [0, 1, 2, 3, 4, 5] : [7, 8, 9, 10, 11, 12];
export const mancalaOwner = (pit: number): MancalaSide | null =>
  pit >= 0 && pit < 6 ? 0 : pit >= 7 && pit < 13 ? 1 : null;
export const mancalaPitNumber = (pit: number) => (pit < 6 ? pit + 1 : pit - 6);
export const mancalaTotal = (board: readonly number[]) =>
  board.reduce((sum, value) => sum + value, 0);
function finish(state: MancalaState): MancalaState {
  const remaining: [number, number] = [
    mancalaPits(0).reduce((sum, pit) => sum + state.board[pit], 0),
    mancalaPits(1).reduce((sum, pit) => sum + state.board[pit], 0),
  ];
  if (remaining[0] && remaining[1]) return state;
  const board = [...state.board];
  for (const side of [0, 1] as const) {
    board[mancalaStore(side)] += remaining[side];
    for (const pit of mancalaPits(side)) board[pit] = 0;
  }
  return {
    ...state,
    board,
    over: true,
    winner: board[6] === board[13] ? "draw" : board[6] > board[13] ? 0 : 1,
    last: state.last
      ? { ...state.last, extraTurn: false, swept: remaining }
      : null,
  };
}
export function mancalaPosition(
  board: readonly number[],
  turn: MancalaSide = 0,
): MancalaState {
  if (
    board.length !== 14 ||
    board.some((value) => !Number.isSafeInteger(value) || value < 0) ||
    mancalaTotal(board) > 72 ||
    (turn !== 0 && turn !== 1)
  )
    throw new Error("Invalid Kalah position");
  return finish({
    board: [...board],
    turn,
    moves: [],
    last: null,
    over: false,
    winner: null,
  });
}
export function newMancala(seeds = 4, first: MancalaSide = 0): MancalaState {
  if (!Number.isInteger(seeds) || seeds < 3 || seeds > 6)
    throw new Error("Choose 3 to 6 seeds");
  const board = Array<number>(14).fill(seeds);
  board[6] = 0;
  board[13] = 0;
  return mancalaPosition(board, first);
}
export function mancalaLegalMoves(state: MancalaState): number[] {
  return state.over
    ? []
    : mancalaPits(state.turn).filter((pit) => state.board[pit] > 0);
}
export function playMancala(state: MancalaState, pit: number): MancalaState {
  if (
    state.over ||
    !Number.isInteger(pit) ||
    mancalaOwner(pit) !== state.turn ||
    state.board[pit] === 0
  )
    return state;
  const actor = state.turn,
    store = mancalaStore(actor),
    skip = mancalaStore(actor === 0 ? 1 : 0),
    board = [...state.board],
    path: number[] = [];
  let seeds = board[pit],
    landing = pit;
  board[pit] = 0;
  while (seeds > 0) {
    landing = (landing + 1) % 14;
    if (landing === skip) continue;
    board[landing]++;
    path.push(landing);
    seeds--;
  }
  let captured = 0;
  if (
    mancalaOwner(landing) === actor &&
    board[landing] === 1 &&
    board[12 - landing] > 0
  ) {
    captured = board[12 - landing] + 1;
    board[store] += captured;
    board[landing] = 0;
    board[12 - landing] = 0;
  }
  const extraTurn = landing === store;
  return finish({
    board,
    turn: extraTurn ? actor : actor === 0 ? 1 : 0,
    moves: [...state.moves, pit],
    last: { actor, pit, landing, path, captured, extraTurn, swept: [0, 0] },
    over: false,
    winner: null,
  });
}
export function replayMancala(
  initial: MancalaState,
  moves: readonly number[],
): MancalaState {
  if (initial.moves.length || moves.length > 2000)
    throw new Error("Invalid Kalah history");
  let state = initial;
  for (const pit of moves) {
    const next = playMancala(state, pit);
    if (next === state) throw new Error("Invalid Kalah history");
    state = next;
  }
  return state;
}
/** Extra turns require replaying the actors; move-number parity is not sufficient. */
export function mancalaUndoIndex(
  initial: MancalaState,
  moves: readonly number[],
  side: MancalaSide | null,
): number {
  if (side === null) return moves.length - 1;
  let state = initial,
    index = -1;
  for (let current = 0; current < moves.length; current++) {
    if (state.turn === side) index = current;
    state = playMancala(state, moves[current]);
  }
  return index;
}
function score(state: MancalaState, side: MancalaSide): number {
  const other = side === 0 ? 1 : 0,
    difference =
      state.board[mancalaStore(side)] - state.board[mancalaStore(other)];
  if (state.over)
    return difference === 0 ? 0 : Math.sign(difference) * 100000 + difference;
  const ownSeeds = mancalaPits(side).reduce(
      (sum, pit) => sum + state.board[pit],
      0,
    ),
    otherSeeds = mancalaPits(other).reduce(
      (sum, pit) => sum + state.board[pit],
      0,
    );
  return (
    difference * 10 +
    (ownSeeds - otherSeeds) * 0.4 +
    mancalaPits(side).filter((pit) => state.board[pit] > 0).length -
    mancalaPits(other).filter((pit) => state.board[pit] > 0).length
  );
}
/** Bounded iterative deepening: nominal 1/4/8 turn changes; extra turns keep depth. */
export function chooseMancalaMove(
  state: MancalaState,
  difficulty: MancalaDifficulty,
  random: () => number = Math.random,
): number | null {
  const legal = mancalaLegalMoves(state);
  if (!legal.length) return null;
  if (difficulty === "easy" && random() < 1 / 3)
    return legal[
      Math.min(
        legal.length - 1,
        Math.max(0, Math.floor(random() * legal.length)),
      )
    ];
  const side = state.turn,
    budget =
      difficulty === "easy" ? 2000 : difficulty === "medium" ? 8000 : 35000,
    maximum = difficulty === "easy" ? 1 : difficulty === "medium" ? 4 : 8;
  const ordered = (position: MancalaState) =>
    mancalaLegalMoves(position)
      .map((pit) => ({ pit, next: playMancala(position, pit) }))
      .sort(
        (a, b) =>
          (b.next.last?.extraTurn ? 20 : 0) +
            (b.next.last?.captured || 0) * 3 +
            b.next.board[mancalaStore(position.turn)] -
            ((a.next.last?.extraTurn ? 20 : 0) +
              (a.next.last?.captured || 0) * 3 +
              a.next.board[mancalaStore(position.turn)]) || a.pit - b.pit,
      );
  const root = ordered(state),
    exhausted = {};
  let nodes = 0,
    best = root[0].pit;
  function search(
    position: MancalaState,
    depth: number,
    alpha: number,
    beta: number,
  ): number {
    if (++nodes > budget) throw exhausted;
    if (position.over || depth === 0) return score(position, side);
    const maximizing = position.turn === side;
    let value = maximizing ? -Infinity : Infinity;
    for (const { next } of ordered(position)) {
      const child = search(
        next,
        depth - (next.turn === position.turn && !next.over ? 0 : 1),
        alpha,
        beta,
      );
      value = maximizing ? Math.max(value, child) : Math.min(value, child);
      if (maximizing) alpha = Math.max(alpha, value);
      else beta = Math.min(beta, value);
      if (beta <= alpha) break;
    }
    return value;
  }
  for (let depth = 1; depth <= maximum; depth++) {
    let candidate = root[0].pit,
      value = -Infinity;
    try {
      for (const { pit, next } of root) {
        const result = search(
          next,
          depth - (next.turn === state.turn && !next.over ? 0 : 1),
          value,
          Infinity,
        );
        if (result > value) {
          value = result;
          candidate = pit;
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
export function mancalaDaily(date: string): MancalaState {
  let seed = 2166136261;
  for (const char of date)
    seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const allocation = [1, 1, 1, 1, 1, 1];
  for (let count = 0; count < 18; count++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    allocation[seed % 6]++;
  }
  if (allocation.every((value) => value === 4)) {
    allocation[0]++;
    allocation[1]--;
  }
  return mancalaPosition([...allocation, 0, ...allocation, 0], 0);
}
