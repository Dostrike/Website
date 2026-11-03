/** Independent English draughts. A history entry is one complete move/jump chain. */
export type CheckersSide = "dark" | "light";
export type CheckersPiece = { side: CheckersSide; king: boolean };
export type CheckersMove = { path: number[]; captures: number[] };
export type CheckersState = {
  board: (CheckersPiece | null)[];
  turn: CheckersSide;
  moves: number[][];
  quiet: number;
  positions: string[];
  over: boolean;
  winner: CheckersSide | "draw" | null;
};
export const otherCheckers = (s: CheckersSide): CheckersSide =>
  s === "dark" ? "light" : "dark";
const inside = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
const crownRow = (s: CheckersSide) => (s === "dark" ? 0 : 7);
const directions = (p: CheckersPiece) =>
  p.king ? [-1, 1] : [p.side === "dark" ? -1 : 1];
export const checkersSquare = (i: number) =>
  `${"ABCDEFGH"[i % 8]}${8 - Math.floor(i / 8)}`;
const key = (board: readonly (CheckersPiece | null)[], turn: CheckersSide) =>
  turn +
  ":" +
  board
    .map((p) =>
      p ? (p.side === "dark" ? (p.king ? "D" : "d") : p.king ? "L" : "l") : ".",
    )
    .join("");
export function checkersLegal(
  board: readonly (CheckersPiece | null)[],
  side: CheckersSide,
): CheckersMove[] {
  const jumps: CheckersMove[] = [];
  function chain(
    at: number,
    p: CheckersPiece,
    path: number[],
    captures: number[],
    occupied: readonly (CheckersPiece | null)[],
  ) {
    let continued = false;
    for (const dr of directions(p))
      for (const dc of [-1, 1]) {
        const r = Math.floor(at / 8),
          c = at % 8,
          nr = r + 2 * dr,
          nc = c + 2 * dc;
        if (!inside(nr, nc)) continue;
        const mid = (r + dr) * 8 + c + dc,
          to = nr * 8 + nc;
        if (
          occupied[to] ||
          occupied[mid]?.side !== otherCheckers(side) ||
          captures.includes(mid)
        )
          continue;
        continued = true;
        // Keep captured pieces as blockers until the complete turn ends.
        const next = occupied.slice();
        next[at] = null;
        next[to] = p;
        const route = [...path, to],
          taken = [...captures, mid];
        if (!p.king && nr === crownRow(side))
          jumps.push({ path: route, captures: taken });
        else chain(to, p, route, taken, next);
      }
    if (!continued && captures.length) jumps.push({ path, captures });
  }
  for (let i = 0; i < 64; i++)
    if (board[i]?.side === side) chain(i, board[i]!, [i], [], board);
  if (jumps.length) return jumps;
  const quiet: CheckersMove[] = [];
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (p?.side !== side) continue;
    for (const dr of directions(p))
      for (const dc of [-1, 1]) {
        const r = Math.floor(i / 8) + dr,
          c = (i % 8) + dc;
        if (inside(r, c) && !board[r * 8 + c])
          quiet.push({ path: [i, r * 8 + c], captures: [] });
      }
  }
  return quiet;
}
function settle(s: CheckersState): CheckersState {
  if (!checkersLegal(s.board, s.turn).length)
    return { ...s, over: true, winner: otherCheckers(s.turn) };
  const current = key(s.board, s.turn);
  if (s.quiet >= 80 || s.positions.filter((p) => p === current).length >= 3)
    return { ...s, over: true, winner: "draw" };
  return s;
}
export function checkersPosition(
  board: readonly (CheckersPiece | null)[],
  turn: CheckersSide = "dark",
  quiet = 0,
): CheckersState {
  if (
    board.length !== 64 ||
    !["dark", "light"].includes(turn) ||
    !Number.isInteger(quiet) ||
    quiet < 0 ||
    quiet > 80
  )
    throw Error("Invalid position");
  const counts = { dark: 0, light: 0 };
  board.forEach((p, i) => {
    if (!p) return;
    if (
      !["dark", "light"].includes(p.side) ||
      typeof p.king !== "boolean" ||
      (Math.floor(i / 8) + (i % 8)) % 2 !== 1 ||
      (!p.king && Math.floor(i / 8) === crownRow(p.side))
    )
      throw Error("Invalid piece");
    counts[p.side]++;
  });
  if (counts.dark > 12 || counts.light > 12) throw Error("Too many pieces");
  const copy = board.map((p) => (p ? { ...p } : null));
  return settle({
    board: copy,
    turn,
    moves: [],
    quiet,
    positions: [key(copy, turn)],
    over: false,
    winner: null,
  });
}
export function newCheckers(): CheckersState {
  return checkersPosition(
    Array.from({ length: 64 }, (_, i) =>
      (Math.floor(i / 8) + (i % 8)) % 2 !== 1 || (i >= 24 && i < 40)
        ? null
        : { side: i < 24 ? "light" : "dark", king: false },
    ),
  );
}
const samePath = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);
export function playCheckers(
  s: CheckersState,
  path: readonly number[],
): CheckersState {
  if (s.over) return s;
  const move = checkersLegal(s.board, s.turn).find((m) =>
    samePath(m.path, path),
  );
  if (!move) return s;
  const board = s.board.slice(),
    from = path[0],
    to = path[path.length - 1],
    piece = s.board[from]!;
  board[from] = null;
  for (const i of move.captures) board[i] = null;
  board[to] = {
    ...piece,
    king: piece.king || Math.floor(to / 8) === crownRow(piece.side),
  };
  const turn = otherCheckers(s.turn),
    quiet = move.captures.length || !piece.king ? 0 : s.quiet + 1;
  // Repetition before the latest irreversible move cannot recur.
  const positions =
    quiet === 0 ? [key(board, turn)] : [...s.positions, key(board, turn)];
  return settle({
    board,
    turn,
    moves: [...s.moves, [...path]],
    quiet,
    positions,
    over: false,
    winner: null,
  });
}
export function replayCheckers(
  initial: CheckersState,
  moves: readonly (readonly number[])[],
): CheckersState {
  if (!Array.isArray(moves) || moves.length > 4000)
    throw Error("Invalid history");
  let s = initial;
  for (const path of moves) {
    if (!Array.isArray(path)) throw Error("Invalid move");
    const next = playCheckers(s, path);
    if (next === s) throw Error("Illegal history");
    s = next;
  }
  return s;
}
export function checkersCounts(board: readonly (CheckersPiece | null)[]) {
  return {
    dark: board.filter((p) => p?.side === "dark").length,
    light: board.filter((p) => p?.side === "light").length,
  };
}
export function chooseCheckers(
  s: CheckersState,
  level: "easy" | "medium" | "hard",
  random = Math.random,
): CheckersMove | null {
  if (s.over) return null;
  const legal = checkersLegal(s.board, s.turn);
  if (level === "easy" && random() < 0.25)
    return legal[Math.floor(random() * legal.length) % legal.length];
  const root = s.turn,
    maxDepth = { easy: 2, medium: 4, hard: 7 }[level],
    budget = { easy: 2000, medium: 12000, hard: 50000 }[level];
  let nodes = 0;
  function score(p: CheckersState): number {
    if (p.over)
      return p.winner === "draw" ? 0 : p.winner === root ? 100000 : -100000;
    return p.board.reduce((v, piece, i) => {
      if (!piece) return v;
      const row = Math.floor(i / 8),
        col = i % 8;
      const advance = piece.side === "dark" ? 7 - row : row;
      const value = piece.king
        ? 160
        : 100 + advance * 4 + (advance === 0 ? 8 : 0);
      const center = row >= 2 && row <= 5 && col >= 2 && col <= 5 ? 6 : 0;
      return v + (piece.side === root ? 1 : -1) * (value + center);
    }, 0);
  }
  const exhausted = {};
  function search(
    p: CheckersState,
    depth: number,
    alpha: number,
    beta: number,
  ): number {
    if (++nodes > budget) throw exhausted;
    if (p.over || depth === 0) return score(p);
    const maximize = p.turn === root;
    let best = maximize ? -Infinity : Infinity;
    for (const move of checkersLegal(p.board, p.turn)) {
      const value = search(playCheckers(p, move.path), depth - 1, alpha, beta);
      best = maximize ? Math.max(best, value) : Math.min(best, value);
      if (maximize) alpha = Math.max(alpha, best);
      else beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let chosen = legal[0];
  for (let depth = 1; depth <= maxDepth; depth++) {
    let best = -Infinity,
      candidate = chosen;
    try {
      for (const move of legal) {
        const value = search(
          playCheckers(s, move.path),
          depth - 1,
          best,
          Infinity,
        );
        if (value > best) {
          best = value;
          candidate = move;
        }
      }
      chosen = candidate;
    } catch (e) {
      if (e !== exhausted) throw e;
      break;
    }
  }
  return chosen;
}
export function checkersDaily(day: string): CheckersState {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw Error("Invalid date");
  let seed = 2166136261;
  for (const ch of day)
    seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let attempt = 0; attempt < 32; attempt++) {
    let s = newCheckers();
    for (let i = 0; i < 8 && !s.over; i++) {
      const legal = checkersLegal(s.board, s.turn);
      s = playCheckers(s, legal[Math.floor(random() * legal.length)].path);
    }
    if (!s.over && s.turn === "dark") return s;
  }
  throw Error("Daily generation failed");
}
