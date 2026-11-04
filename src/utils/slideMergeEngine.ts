/** Independent 4x4 sliding-number game. Replays include explicit continuation after reaching 2048. */
export type SlideDirection = "left" | "right" | "up" | "down";
export type SlideAction = SlideDirection | "continue";
export type SlideSpawn = { index: number; value: number };
export type SlideState = {
  seed: string;
  board: number[];
  rng: number;
  score: number;
  won: boolean;
  continued: boolean;
  over: boolean;
  actions: SlideAction[];
  lastSpawn: SlideSpawn | null;
  lastMerged: number[];
};
const directions: SlideDirection[] = ["left", "right", "up", "down"];
const validBoard = (b: readonly number[]) =>
  b.length === 16 &&
  b.every(
    (n) =>
      n === 0 ||
      (Number.isSafeInteger(n) && n >= 2 && Number.isInteger(Math.log2(n))),
  );
const seedNumber = (seed: string) => {
  let n = 2166136261;
  for (const c of seed) n = Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0;
  return n;
};
const nextRandom = (rng: number) =>
  (Math.imul(rng, 1664525) + 1013904223) >>> 0;
export function slideCanMove(board: readonly number[]): boolean {
  if (!validBoard(board)) return false;
  if (board.includes(0) && board.some(Boolean)) return true;
  for (let i = 0; i < 16; i++)
    if (
      board[i] &&
      ((i % 4 < 3 && board[i] === board[i + 1]) ||
        (i < 12 && board[i] === board[i + 4]))
    )
      return true;
  return false;
}
export function shiftSlideBoard(
  input: readonly number[],
  direction: SlideDirection,
): { board: number[]; score: number; changed: boolean; merged: number[] } {
  if (!validBoard(input) || !directions.includes(direction))
    throw Error("Invalid slide position");
  const board = input.slice(),
    merged: number[] = [];
  let score = 0;
  for (let line = 0; line < 4; line++) {
    const indices = Array.from({ length: 4 }, (_, n) =>
        direction === "left"
          ? line * 4 + n
          : direction === "right"
            ? line * 4 + 3 - n
            : direction === "up"
              ? n * 4 + line
              : (3 - n) * 4 + line,
      ),
      values = indices.map((i) => input[i]).filter(Boolean),
      out: number[] = [];
    for (let i = 0; i < values.length; i++) {
      if (i + 1 < values.length && values[i] === values[i + 1]) {
        const value = values[i] * 2;
        if (!Number.isSafeInteger(value))
          throw Error("Tile exceeds safe integer range");
        merged.push(indices[out.length]);
        out.push(value);
        score += value;
        i++;
      } else out.push(values[i]);
    }
    while (out.length < 4) out.push(0);
    indices.forEach((index, n) => {
      board[index] = out[n];
    });
  }
  return {
    board,
    score,
    changed: board.some((v, i) => v !== input[i]),
    merged,
  };
}
export function spawnSlideTile(
  input: readonly number[],
  rng: number,
): { board: number[]; rng: number; spawn: SlideSpawn | null } {
  if (
    !validBoard(input) ||
    !Number.isInteger(rng) ||
    rng < 0 ||
    rng > 4294967295
  )
    throw Error("Invalid spawn");
  const board = input.slice(),
    empty = board.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
  if (!empty.length) return { board, rng, spawn: null };
  const valueRandom = nextRandom(rng),
    positionRandom = nextRandom(valueRandom),
    value = valueRandom / 4294967296 < 0.9 ? 2 : 4,
    index = empty[Math.floor((positionRandom / 4294967296) * empty.length)];
  board[index] = value;
  return { board, rng: positionRandom, spawn: { index, value } };
}
export function slidePosition(
  board: readonly number[],
  seed = "fixture",
  score = 0,
): SlideState {
  if (
    !validBoard(board) ||
    typeof seed !== "string" ||
    !seed ||
    seed.length > 200 ||
    !Number.isSafeInteger(score) ||
    score < 0
  )
    throw Error("Invalid position");
  return {
    seed,
    board: board.slice(),
    rng: seedNumber(seed),
    score,
    won: board.some((v) => v >= 2048),
    continued: false,
    over: !slideCanMove(board),
    actions: [],
    lastSpawn: null,
    lastMerged: [],
  };
}
export function newSlideMerge(seed: string): SlideState {
  const initial = slidePosition(Array(16).fill(0), seed),
    one = spawnSlideTile(initial.board, initial.rng),
    two = spawnSlideTile(one.board, one.rng);
  return {
    ...initial,
    board: two.board,
    rng: two.rng,
    over: false,
    lastSpawn: two.spawn,
  };
}
export function playSlideMerge(s: SlideState, action: SlideAction): SlideState {
  if (s.over) return s;
  if (action === "continue")
    return s.won && !s.continued
      ? {
          ...s,
          continued: true,
          actions: [...s.actions, action],
          lastMerged: [],
          lastSpawn: null,
        }
      : s;
  if ((s.won && !s.continued) || !directions.includes(action)) return s;
  const shifted = shiftSlideBoard(s.board, action);
  if (!shifted.changed) return s;
  const next = spawnSlideTile(shifted.board, s.rng),
    score = s.score + shifted.score;
  if (!Number.isSafeInteger(score))
    throw Error("Score exceeds safe integer range");
  return {
    ...s,
    board: next.board,
    rng: next.rng,
    score,
    won: s.won || next.board.some((v) => v >= 2048),
    over: !slideCanMove(next.board),
    actions: [...s.actions, action],
    lastSpawn: next.spawn,
    lastMerged: shifted.merged,
  };
}
export function replaySlideMerge(
  seed: string,
  actions: readonly SlideAction[],
): SlideState {
  if (!Array.isArray(actions) || actions.length > 50000)
    throw Error("Invalid slide history");
  let s = newSlideMerge(seed);
  for (const action of actions) {
    if (action !== "continue" && !directions.includes(action))
      throw Error("Unknown action");
    const next = playSlideMerge(s, action);
    if (next === s) throw Error("Illegal slide history");
    s = next;
  }
  return s;
}
export function undoSlideMerge(s: SlideState): SlideState {
  if (!s.actions.length) return s;
  let end = s.actions.length;
  if (s.actions[end - 1] === "continue") end--;
  if (!end) return s;
  return replaySlideMerge(s.seed, s.actions.slice(0, end - 1));
}
