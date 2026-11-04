import type { DotsRound } from "./dotsAndBoxesSession";
export type DotsRecordRow = {
  games: number;
  assisted: number;
  wins: number;
  losses: number;
  draws: number;
  aWins: number;
  bWins: number;
};
export type DotsRecords = {
  rows: Record<string, DotsRecordRow>;
  recent: string[];
  lastDaily: string | null;
  streak: number;
  bestStreak: number;
};
export const emptyDotsRecords = (): DotsRecords => ({
  rows: {},
  recent: [],
  lastDaily: null,
  streak: 0,
  bestStreak: 0,
});
const emptyRow = (): DotsRecordRow => ({
  games: 0,
  assisted: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  aWins: 0,
  bWins: 0,
});
const key = "dostrike-dots-and-boxes-records-v1";
export const dotsRecordGroup = (r: DotsRound) =>
  r.settings.mode === "local"
    ? `${r.settings.size}:local`
    : `${r.settings.size}:computer:${r.settings.level}:${r.settings.human}`;
const previous = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
};
export const dotsStreak = (r: DotsRecords, today: string) =>
  r.lastDaily === today || r.lastDaily === previous(today) ? r.streak : 0;
export function recordDotsResult(
  records: DotsRecords,
  round: DotsRound,
  today: string,
): DotsRecords {
  if (round.game.result === null || records.recent.includes(round.id))
    return records;
  const group = dotsRecordGroup(round),
    row = { ...(records.rows[group] || emptyRow()) };
  row.games++;
  row.assisted += Number(round.assisted);
  if (round.game.result === "draw") row.draws++;
  else if (round.settings.mode === "local") {
    if (round.game.result === 1) row.aWins++;
    else row.bWins++;
  } else if (round.game.result === round.settings.human) row.wins++;
  else row.losses++;
  const next = {
    ...records,
    rows: { ...records.rows, [group]: row },
    recent: [...records.recent, round.id].slice(-128),
  };
  if (
    round.day === today &&
    round.settings.mode === "computer" &&
    round.game.result === round.settings.human &&
    records.lastDaily !== today
  ) {
    next.lastDaily = today;
    next.streak =
      records.lastDaily === previous(today) ? records.streak + 1 : 1;
    next.bestStreak = Math.max(records.bestStreak, next.streak);
  }
  return next;
}
export function readDotsRecords(): DotsRecords {
  const r = emptyDotsRecords();
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    if (v?.rows && typeof v.rows === "object")
      for (const [group, value] of Object.entries(v.rows)) {
        if (!/^[234]:(local|computer:(easy|medium|hard):[12])$/.test(group))
          continue;
        const row = value as DotsRecordRow;
        if (
          row &&
          Object.keys(emptyRow()).every(
            (k) =>
              Number.isSafeInteger(row[k as keyof DotsRecordRow]) &&
              row[k as keyof DotsRecordRow] >= 0,
          ) &&
          row.games ===
            row.wins + row.losses + row.draws + row.aWins + row.bWins &&
          row.assisted <= row.games &&
          (group.endsWith(":local")
            ? row.wins + row.losses === 0
            : row.aWins + row.bWins === 0)
        ) {
          r.rows[group] = {
            games: row.games,
            assisted: row.assisted,
            wins: row.wins,
            losses: row.losses,
            draws: row.draws,
            aWins: row.aWins,
            bWins: row.bWins,
          };
        }
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
    /* Optional browser records. */
  }
  return r;
}
export function writeDotsRecords(r: DotsRecords) {
  try {
    localStorage.setItem(key, JSON.stringify(r));
  } catch {
    /* Optional browser storage. */
  }
}
