/** Original classic 9x9 Sudoku generation and validation. Zero means empty. */
export type SudokuLevel = "easy" | "medium" | "hard";
export type SudokuPuzzle = {
  givens: number[];
  solution: number[];
  seed: string;
  level: SudokuLevel;
};
export const sudokuUnits: number[][] = [
  ...Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => r * 9 + c),
  ),
  ...Array.from({ length: 9 }, (_, c) =>
    Array.from({ length: 9 }, (_, r) => r * 9 + c),
  ),
  ...Array.from({ length: 9 }, (_, b) =>
    Array.from(
      { length: 9 },
      (_, n) =>
        (Math.floor(b / 3) * 3 + Math.floor(n / 3)) * 9 + (b % 3) * 3 + (n % 3),
    ),
  ),
];
const peers = Array.from({ length: 81 }, (_, i) =>
  [...new Set(sudokuUnits.filter((u) => u.includes(i)).flat())].filter(
    (n) => n !== i,
  ),
);
const valid = (board: readonly number[]) =>
  board.length === 81 &&
  board.every((n) => Number.isInteger(n) && n >= 0 && n <= 9);
export function sudokuConflicts(board: readonly number[]): number[] {
  if (!valid(board)) throw Error("Invalid board");
  const result = new Set<number>();
  for (const u of sudokuUnits)
    for (const i of u)
      if (board[i] && u.some((j) => j !== i && board[j] === board[i]))
        result.add(i);
  return [...result].sort((a, b) => a - b);
}
export function sudokuCandidates(
  board: readonly number[],
  index: number,
): number[] {
  if (!valid(board) || !Number.isInteger(index) || index < 0 || index >= 81)
    throw Error("Invalid cell");
  if (board[index]) return [];
  const used = new Set(peers[index].map((i) => board[i]));
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !used.has(n));
}
export function sudokuComplete(board: readonly number[]): boolean {
  return (
    valid(board) &&
    board.every((n) => n > 0) &&
    sudokuConflicts(board).length === 0
  );
}
function options(board: readonly number[], index: number): number[] {
  const used = new Set(peers[index].map((i) => board[i]));
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !used.has(n));
}
/** Exact search, bounded explicitly. Exceeding the bound throws; never means unique. */
export function countSudokuSolutions(
  input: readonly number[],
  limit = 2,
  budget = 200000,
): number {
  if (
    !valid(input) ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    !Number.isSafeInteger(budget) ||
    budget < 1
  )
    throw Error("Invalid search");
  if (sudokuConflicts(input).length) return 0;
  const board = input.slice();
  let nodes = 0,
    count = 0;
  function search() {
    if (++nodes > budget) throw Error("Sudoku search budget exceeded");
    let cell = -1,
      choices: number[] = [];
    for (let i = 0; i < 81; i++)
      if (!board[i]) {
        const current = options(board, i);
        if (!current.length) return;
        if (cell < 0 || current.length < choices.length) {
          cell = i;
          choices = current;
          if (current.length === 1) break;
        }
      }
    if (cell < 0) {
      count++;
      return;
    }
    for (const n of choices) {
      board[cell] = n;
      search();
      if (count >= limit) break;
    }
    board[cell] = 0;
  }
  search();
  return count;
}
function rngFor(seed: string) {
  let state = 2166136261;
  for (const ch of seed)
    state = Math.imul(state ^ ch.charCodeAt(0), 16777619) >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
function shuffle<T>(array: T[], rng: () => number): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
export function generateSudoku(
  seed: string,
  level: SudokuLevel = "medium",
): SudokuPuzzle {
  if (
    typeof seed !== "string" ||
    !seed ||
    seed.length > 200 ||
    !["easy", "medium", "hard"].includes(level)
  )
    throw Error("Invalid generator options");
  const rng = rngFor(`${seed}:${level}`),
    solution = Array(81).fill(0) as number[];
  let nodes = 0;
  function fill(): boolean {
    if (++nodes > 200000) throw Error("Sudoku generation budget exceeded");
    let cell = -1,
      choices: number[] = [];
    for (let i = 0; i < 81; i++)
      if (!solution[i]) {
        const possible = options(solution, i);
        if (!possible.length) return false;
        if (cell < 0 || possible.length < choices.length) {
          cell = i;
          choices = possible;
          if (possible.length === 1) break;
        }
      }
    if (cell < 0) return true;
    for (const n of shuffle(choices, rng)) {
      solution[cell] = n;
      if (fill()) return true;
    }
    solution[cell] = 0;
    return false;
  }
  if (!fill()) throw Error("Unable to generate solution");
  const givens = solution.slice(),
    target = { easy: 42, medium: 35, hard: 29 }[level];
  let count = 81;
  for (const cell of shuffle(
    Array.from({ length: 81 }, (_, i) => i),
    rng,
  )) {
    if (count <= target) break;
    const old = givens[cell];
    givens[cell] = 0;
    let unique = false;
    try {
      unique = countSudokuSolutions(givens, 2, 60000) === 1;
    } catch {
      /* Keep the clue if uniqueness could not be proven within budget. */
    }
    if (unique) count--;
    else givens[cell] = old;
  }
  return { givens, solution, seed, level };
}
export type SudokuHint = {
  index: number;
  digit: number;
  technique: "single-candidate" | "only-place";
  unit: number[];
};
/** Explain an actual single; never present an answer reveal as a logical deduction. */
export function sudokuLogicalHint(board: readonly number[]): SudokuHint | null {
  if (!valid(board)) throw Error("Invalid board");
  if (sudokuConflicts(board).length) return null;
  const candidates = board.map((n, i) => (n ? [] : options(board, i)));
  for (let i = 0; i < 81; i++)
    if (candidates[i].length === 1)
      return {
        index: i,
        digit: candidates[i][0],
        technique: "single-candidate",
        unit: [],
      };
  for (const unit of sudokuUnits)
    for (let n = 1; n <= 9; n++) {
      if (unit.some((i) => board[i] === n)) continue;
      const places = unit.filter((i) => candidates[i].includes(n));
      if (places.length === 1)
        return {
          index: places[0],
          digit: n,
          technique: "only-place",
          unit: unit.slice(),
        };
    }
  return null;
}
