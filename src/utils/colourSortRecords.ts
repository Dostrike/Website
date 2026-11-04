import type { ColourRound } from "./colourSortSession";
type SizeRecords = {
  solves: number;
  assisted: number;
  unassisted: number;
  bestUnassisted: number | null;
};
export type ColourRecords = {
  sizes: Record<string, SizeRecords>;
  recent: string[];
  lastDaily: string | null;
  streak: number;
  bestStreak: number;
};
const key = "dostrike-colour-sort-records-v1";
export const emptyColourRecords = (): ColourRecords => ({
  sizes: Object.fromEntries(
    [3, 5, 7].map((n) => [
      n,
      { solves: 0, assisted: 0, unassisted: 0, bestUnassisted: null },
    ]),
  ),
  recent: [],
  lastDaily: null,
  streak: 0,
  bestStreak: 0,
});
const previous = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
};
export const colourStreak = (r: ColourRecords, today: string) =>
  r.lastDaily === today || r.lastDaily === previous(today) ? r.streak : 0;
export function recordColourResult(
  r: ColourRecords,
  round: ColourRound,
  today: string,
): ColourRecords {
  if (!round.game.solved || r.recent.includes(round.id)) return r;
  const size = round.game.puzzle.colours,
    old = r.sizes[size];
  const best = round.assisted
    ? old.bestUnassisted
    : Math.min(old.bestUnassisted ?? Infinity, round.game.moves.length);
  const next = {
    ...r,
    sizes: {
      ...r.sizes,
      [size]: {
        solves: old.solves + 1,
        assisted: old.assisted + Number(round.assisted),
        unassisted: old.unassisted + Number(!round.assisted),
        bestUnassisted: best,
      },
    },
    recent: [...r.recent, round.id].slice(-128),
  };
  if (round.day === today && r.lastDaily !== today) {
    next.lastDaily = today;
    next.streak = r.lastDaily === previous(today) ? r.streak + 1 : 1;
    next.bestStreak = Math.max(r.bestStreak, next.streak);
  }
  return next;
}
export function readColourRecords(): ColourRecords {
  const r = emptyColourRecords();
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    for (const size of [3, 5, 7]) {
      const row = v?.sizes?.[size];
      if (!row) continue;
      if (
        ["solves", "assisted", "unassisted"].every(
          (k) => Number.isSafeInteger(row[k]) && row[k] >= 0,
        ) &&
        row.solves === row.assisted + row.unassisted &&
        (row.bestUnassisted === null ||
          (Number.isSafeInteger(row.bestUnassisted) && row.bestUnassisted > 0))
      )
        r.sizes[size] = { ...row };
    }
    if (Array.isArray(v?.recent))
      r.recent = v.recent
        .filter(
          (id: unknown) =>
            typeof id === "string" && id.length > 0 && id.length <= 100,
        )
        .slice(-128);
    if (
      typeof v?.lastDaily === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(v.lastDaily)
    )
      r.lastDaily = v.lastDaily;
    if (Number.isSafeInteger(v?.streak) && v.streak >= 0) r.streak = v.streak;
    if (Number.isSafeInteger(v?.bestStreak) && v.bestStreak >= r.streak)
      r.bestStreak = v.bestStreak;
  } catch {
    /* Optional browser storage. */
  }
  return r;
}
export function writeColourRecords(r: ColourRecords) {
  try {
    localStorage.setItem(key, JSON.stringify(r));
  } catch {
    /* Optional browser storage. */
  }
}
