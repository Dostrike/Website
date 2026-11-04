import {
  generateSudoku,
  sudokuComplete,
  type SudokuLevel,
  type SudokuPuzzle,
} from "./sudokuEngine";
export type SudokuFrame = { values: number[]; notes: number[][] };
export type SudokuRound = SudokuFrame & {
  id: string;
  puzzle: SudokuPuzzle;
  day: string | null;
  assisted: boolean;
  history: SudokuFrame[];
};
export const sudokuSessionKey = "dostrike-sudoku-session-v1";
export function newSudokuRound(
  puzzle: SudokuPuzzle,
  id: string,
  day: string | null = null,
): SudokuRound {
  return {
    id,
    puzzle,
    day,
    assisted: false,
    values: puzzle.givens.slice(),
    notes: Array.from({ length: 81 }, () => []),
    history: [],
  };
}
export function editSudoku(
  round: SudokuRound,
  index: number,
  digit: number,
  note = false,
): SudokuRound {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= 81 ||
    !Number.isInteger(digit) ||
    digit < 0 ||
    digit > 9 ||
    round.puzzle.givens[index] ||
    sudokuRoundComplete(round)
  )
    return round;
  const values = round.values.slice(),
    notes = round.notes.map((n) => n.slice());
  if (note && digit) {
    if (values[index]) return round;
    notes[index] = notes[index].includes(digit)
      ? notes[index].filter((n) => n !== digit)
      : [...notes[index], digit].sort();
  } else {
    if (values[index] === digit && !notes[index].length) return round;
    values[index] = digit;
    notes[index] = [];
  }
  return {
    ...round,
    values,
    notes,
    history: [
      ...round.history,
      {
        values: round.values.slice(),
        notes: round.notes.map((n) => n.slice()),
      },
    ].slice(-300),
  };
}
export function undoSudoku(round: SudokuRound): SudokuRound {
  const last = round.history[round.history.length - 1];
  return last
    ? {
        ...round,
        values: last.values.slice(),
        notes: last.notes.map((n) => n.slice()),
        history: round.history.slice(0, -1),
      }
    : round;
}
export function sudokuRoundComplete(r: SudokuRound) {
  return (
    r.puzzle.givens.every((n, i) => !n || r.values[i] === n) &&
    sudokuComplete(r.values)
  );
}
function frame(value: unknown, puzzle: SudokuPuzzle): boolean {
  const f = value as SudokuFrame | null;
  return (
    !!f &&
    Array.isArray(f.values) &&
    f.values.length === 81 &&
    f.values.every(
      (n, i) =>
        Number.isInteger(n) &&
        n >= 0 &&
        n <= 9 &&
        (!puzzle.givens[i] || n === puzzle.givens[i]),
    ) &&
    Array.isArray(f.notes) &&
    f.notes.length === 81 &&
    f.notes.every(
      (ns, i) =>
        Array.isArray(ns) &&
        ns.length <= 9 &&
        new Set(ns).size === ns.length &&
        ns.every((n) => Number.isInteger(n) && n >= 1 && n <= 9) &&
        (!f.values[i] || ns.length === 0),
    )
  );
}
export function encodeSudokuRound(r: SudokuRound): string {
  return JSON.stringify({
    version: 1,
    id: r.id,
    seed: r.puzzle.seed,
    level: r.puzzle.level,
    day: r.day,
    assisted: r.assisted,
    values: r.values,
    notes: r.notes,
    history: r.history,
  });
}
export function decodeSudokuRound(text: string): SudokuRound | null {
  try {
    const v = JSON.parse(text);
    if (
      v?.version !== 1 ||
      typeof v.id !== "string" ||
      !v.id ||
      v.id.length > 100 ||
      typeof v.seed !== "string" ||
      !v.seed ||
      v.seed.length > 200 ||
      !["easy", "medium", "hard"].includes(v.level) ||
      typeof v.assisted !== "boolean" ||
      (v.day !== null &&
        (typeof v.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v.day))) ||
      !Array.isArray(v.history) ||
      v.history.length > 300
    )
      return null;
    if (v.day !== null && (v.seed !== `daily:${v.day}` || v.level !== "medium"))
      return null;
    const puzzle = generateSudoku(v.seed, v.level as SudokuLevel);
    if (!frame(v, puzzle) || !v.history.every((f: unknown) => frame(f, puzzle)))
      return null;
    const r: SudokuRound = {
      id: v.id,
      puzzle,
      day: v.day,
      assisted: v.assisted,
      values: v.values,
      notes: v.notes,
      history: v.history,
    };
    return sudokuRoundComplete(r) ? null : r;
  } catch {
    return null;
  }
}
export function readSudokuRound(): SudokuRound | null {
  try {
    return decodeSudokuRound(localStorage.getItem(sudokuSessionKey) || "null");
  } catch {
    return null;
  }
}
