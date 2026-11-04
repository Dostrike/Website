export type MineRecords = {
  wins: number;
  losses: number;
  assistedWins: number;
  unassistedWins: number;
  lastDaily: string | null;
  streak: number;
  best: number;
  ids: string[];
};
const key = "dostrike-minesweeper-records-v1";
export const emptyMineRecords = (): MineRecords => ({
  wins: 0,
  losses: 0,
  assistedWins: 0,
  unassistedWins: 0,
  lastDaily: null,
  streak: 0,
  best: 0,
  ids: [],
});
export function readMineRecords(): MineRecords {
  const r = emptyMineRecords();
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    for (const k of [
      "wins",
      "losses",
      "assistedWins",
      "unassistedWins",
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
    /* Optional persistence. */
  }
  return r;
}
const previous = (day: string) => {
  const [y, m, d] = day.split("-").map(Number),
    v = new Date(Date.UTC(y, m - 1, d - 1));
  return `${v.getUTCFullYear()}-${String(v.getUTCMonth() + 1).padStart(2, "0")}-${String(v.getUTCDate()).padStart(2, "0")}`;
};
export const mineStreak = (r: MineRecords, day: string) =>
  r.lastDaily === day || r.lastDaily === previous(day) ? r.streak : 0;
export function recordMineResult(
  r: MineRecords,
  id: string,
  won: boolean,
  assisted: boolean,
  day: string | null,
  today: string,
): MineRecords {
  if (r.ids.includes(id)) return r;
  const next = {
    ...r,
    wins: r.wins + (won ? 1 : 0),
    losses: r.losses + (won ? 0 : 1),
    assistedWins: r.assistedWins + (won && assisted ? 1 : 0),
    unassistedWins: r.unassistedWins + (won && !assisted ? 1 : 0),
    ids: [...r.ids, id].slice(-128),
  };
  if (won && day === today && r.lastDaily !== today) {
    next.lastDaily = today;
    next.streak = r.lastDaily === previous(today) ? r.streak + 1 : 1;
    next.best = Math.max(r.best, next.streak);
  }
  return next;
}
export function writeMineRecords(r: MineRecords) {
  try {
    localStorage.setItem(key, JSON.stringify(r));
  } catch {
    /* Optional persistence. */
  }
}
