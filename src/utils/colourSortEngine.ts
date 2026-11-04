/** Original four-unit maximal-pour puzzle. Tubes are ordered bottom to top. */
export type ColourBoard = number[][];
export type ColourMove = { from: number; to: number };
export type ColourPuzzle = {
  seed: string;
  colours: number;
  board: ColourBoard;
  solution: ColourMove[];
};
export type ColourState = {
  puzzle: ColourPuzzle;
  board: ColourBoard;
  moves: ColourMove[];
  solved: boolean;
};
const clone = (b: readonly (readonly number[])[]): ColourBoard =>
  b.map((t) => [...t]);
const key = (b: readonly (readonly number[])[]) => JSON.stringify(b);
const canonical = (b: ColourBoard) =>
  b
    .map((t) => t.join(","))
    .sort()
    .join("|");
function validShape(b: readonly (readonly number[])[]): boolean {
  return (
    Array.isArray(b) &&
    b.length >= 2 &&
    b.length <= 9 &&
    b.every(
      (t) =>
        Array.isArray(t) &&
        t.length <= 4 &&
        t.every((c) => Number.isInteger(c) && c >= 1 && c <= 7),
    )
  );
}
export function validColourInventory(b: ColourBoard, colours: number): boolean {
  if (
    ![3, 5, 7].includes(colours) ||
    !validShape(b) ||
    b.length !== colours + 2
  )
    return false;
  const counts = Array(colours).fill(0);
  for (const t of b)
    for (const c of t) {
      if (c > colours) return false;
      counts[c - 1]++;
    }
  return counts.every((n) => n === 4);
}
export function colourSolved(b: readonly (readonly number[])[]): boolean {
  return (
    validShape(b) &&
    b.some((t) => t.length > 0) &&
    b.every((t) => !t.length || (t.length === 4 && t.every((c) => c === t[0])))
  );
}
export function pourColour(
  input: readonly (readonly number[])[],
  from: number,
  to: number,
): { board: ColourBoard; amount: number; colour: number } | null {
  if (
    !validShape(input) ||
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= input.length ||
    to >= input.length
  )
    return null;
  const source = input[from],
    target = input[to];
  if (!source.length || target.length === 4) return null;
  const colour = source[source.length - 1];
  if (target.length && target[target.length - 1] !== colour) return null;
  let run = 1;
  while (run < source.length && source[source.length - 1 - run] === colour)
    run++;
  const amount = Math.min(run, 4 - target.length),
    board = clone(input);
  board[from].splice(-amount);
  board[to].push(...Array(amount).fill(colour));
  return { board, amount, colour };
}
export function colourMoves(b: ColourBoard): ColourMove[] {
  const moves: ColourMove[] = [];
  b.forEach((_, from) =>
    b.forEach((_, to) => {
      if (pourColour(b, from, to)) moves.push({ from, to });
    }),
  );
  return moves;
}
export function replayColourSolution(
  board: ColourBoard,
  moves: readonly ColourMove[],
): ColourBoard {
  if (!validShape(board) || !Array.isArray(moves) || moves.length > 20000)
    throw Error("Invalid colour replay");
  let b = clone(board);
  for (const move of moves) {
    const next = move && pourColour(b, move.from, move.to);
    if (!next) throw Error("Illegal colour pour");
    b = next.board;
  }
  return b;
}
export function generateColourPuzzle(
  seed: string,
  colours: number,
): ColourPuzzle {
  if (
    typeof seed !== "string" ||
    !seed ||
    seed.length > 200 ||
    ![3, 5, 7].includes(colours)
  )
    throw Error("Invalid colour seed/size");
  let rng = 2166136261;
  for (const c of seed) rng = Math.imul(rng ^ c.charCodeAt(0), 16777619) >>> 0;
  const random = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng / 4294967296;
  };
  const steps = colours === 3 ? 24 : colours === 5 ? 48 : 72;
  for (let attempt = 0; attempt < 8; attempt++) {
    let board: ColourBoard = [
      ...Array.from({ length: colours }, (_, c) => Array(4).fill(c + 1)),
      [],
      [],
    ];
    const seen = new Set([canonical(board)]),
      reverse: ColourMove[] = [];
    for (let step = 0; step < steps; step++) {
      const empty = board.findIndex((t) => !t.length);
      const candidates: {
        board: ColourBoard;
        inverses: ColourMove[];
        weight: number;
      }[] = [];
      // Reverse three pours: park a segment, exchange an equal segment, refill.
      // Accept each individual inverse through the real forward rules. Every macro
      // ends with the same two empty tubes and all colour tubes full.
      board.forEach((tube, from) =>
        board.forEach((target, to) => {
          if (
            from === to ||
            tube.length !== 4 ||
            target.length !== 4 ||
            tube[3] === target[3]
          )
            return;
          for (let count = 1; count <= 3; count++) {
            let proposed = clone(board);
            const inverses: ColourMove[] = [];
            let valid = true;
            for (const [source, destination] of [
              [from, empty],
              [to, from],
              [empty, to],
            ]) {
              const before = proposed;
              const c = before[source][before[source].length - 1];
              if (
                before[source].length < count ||
                before[source].slice(-count).some((v) => v !== c)
              ) {
                valid = false;
                break;
              }
              proposed = clone(before);
              proposed[source].splice(-count);
              proposed[destination].push(...Array(count).fill(c));
              const restored = pourColour(proposed, destination, source);
              if (!restored || key(restored.board) !== key(before)) {
                valid = false;
                break;
              }
              inverses.push({ from: destination, to: source });
            }
            if (!valid || seen.has(canonical(proposed))) continue;
            const newlyMixed =
              Number(tube.every((c) => c === tube[0])) +
              Number(target.every((c) => c === target[0]));
            candidates.push({
              board: proposed,
              inverses,
              weight: 1 + newlyMixed * 5,
            });
          }
        }),
      );
      if (!candidates.length) break;
      let draw = random() * candidates.reduce((n, v) => n + v.weight, 0);
      const selected =
        candidates.find((v) => (draw -= v.weight) < 0) ||
        candidates[candidates.length - 1];
      board = selected.board;
      seen.add(canonical(board));
      reverse.push(...selected.inverses);
    }
    const solution = reverse.reverse();
    // Every accepted reverse step has a real forward inverse; check the whole witness too.
    if (
      solution.length >= 3 &&
      board.filter((t) => new Set(t).size > 1).length === colours &&
      !colourSolved(board) &&
      validColourInventory(board, colours) &&
      colourSolved(replayColourSolution(board, solution))
    )
      return { seed, colours, board, solution };
  }
  throw Error(
    "No verified mixed puzzle found within the generation budget. Try another seed.",
  );
}
export function newColourState(puzzle: ColourPuzzle): ColourState {
  if (
    !validColourInventory(puzzle.board, puzzle.colours) ||
    colourSolved(puzzle.board) ||
    !colourSolved(replayColourSolution(puzzle.board, puzzle.solution))
  )
    throw Error("Unverified colour puzzle");
  return { puzzle, board: clone(puzzle.board), moves: [], solved: false };
}
export function playColour(s: ColourState, move: ColourMove): ColourState {
  if (s.solved) return s;
  const next = pourColour(s.board, move.from, move.to);
  return next
    ? {
        ...s,
        board: next.board,
        moves: [...s.moves, { from: move.from, to: move.to }],
        solved: colourSolved(next.board),
      }
    : s;
}
export function replayColour(
  puzzle: ColourPuzzle,
  moves: readonly ColourMove[],
): ColourState {
  if (!Array.isArray(moves) || moves.length > 20000)
    throw Error("Invalid colour history");
  let state = newColourState(puzzle);
  for (const move of moves) {
    if (!move || !Number.isInteger(move.from) || !Number.isInteger(move.to))
      throw Error("Invalid move");
    const next = playColour(state, move);
    if (next === state) throw Error("Illegal or post-solve pour");
    state = next;
  }
  return state;
}
export function undoColour(s: ColourState): ColourState {
  return s.moves.length ? replayColour(s.puzzle, s.moves.slice(0, -1)) : s;
}
/** A certificate-backed hint only for a board actually on its known solution path. */
export function colourHint(s: ColourState): ColourMove | null {
  if (s.solved) return null;
  let board = s.puzzle.board;
  for (const move of s.puzzle.solution) {
    if (key(board) === key(s.board)) return { ...move };
    const next = pourColour(board, move.from, move.to);
    if (!next) return null;
    board = next.board;
  }
  return null;
}
