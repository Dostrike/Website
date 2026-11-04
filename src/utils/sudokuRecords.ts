export type SudokuRecords = {
  solves: number;
  assisted: number;
  unassisted: number;
  lastDaily: string | null;
  streak: number;
  best: number;
  ids: string[];
};
const key = "dostrike-sudoku-records-v1";
export const emptySudokuRecords = (): SudokuRecords => ({
  solves: 0,
  assisted: 0,
  unassisted: 0,
  lastDaily: null,
  streak: 0,
  best: 0,
  ids: [],
});
export function readSudokuRecords(): SudokuRecords {
  const r = emptySudokuRecords();
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    for (const k of [
      "solves",
      "assisted",
      "unassisted",
      "streak",
      "best",
    ] as const)
      if (Number.isSafeInteger(v?.[k]) && v[k] >= 0) r[k] = v[k];
    if (
      typeof v?.lastDaily === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(v.lastDaily)
    )
      r.lastDaily = v.lastDaily;
    if (Array.isArray(v?.ids))
      r.ids = v.ids
        .filter((s: unknown) => typeof s === "string" && s.length <= 100)
        .slice(-128);
  } catch {
    /* Optional storage. */
  }
  return r;
}
function previous(day: string) {
  const [y, m, d] = day.split("-").map(Number),
    date = new Date(Date.UTC(y, m - 1, d - 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
export function sudokuStreak(r: SudokuRecords, today: string) {
  return r.lastDaily === today || r.lastDaily === previous(today)
    ? r.streak
    : 0;
}
export function recordSudoku(
  r: SudokuRecords,
  id: string,
  assisted: boolean,
  day: string | null,
  today: string,
): SudokuRecords {
  if (r.ids.includes(id)) return r;
  const next = {
    ...r,
    solves: r.solves + 1,
    assisted: r.assisted + (assisted ? 1 : 0),
    unassisted: r.unassisted + (assisted ? 0 : 1),
    ids: [...r.ids, id].slice(-128),
  };
  if (day === today && r.lastDaily !== today) {
    next.streak = r.lastDaily === previous(today) ? r.streak + 1 : 1;
    next.best = Math.max(r.best, next.streak);
    next.lastDaily = today;
  }
  return next;
}
export function writeSudokuRecords(r: SudokuRecords) {
  try {
    localStorage.setItem(key, JSON.stringify(r));
  } catch {
    /* Optional storage. */
  }
}
