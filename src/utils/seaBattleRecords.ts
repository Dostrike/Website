import type { SeaRound } from "./seaBattleSession";
import { validSeaDay } from "./seaBattleSession";
export type SeaRecordRow = {
  games: number;
  assisted: number;
  wins: number;
  losses: number;
  cleanWins: number;
  assistedWins: number;
  aWins: number;
  bWins: number;
};
export type SeaRecords = {
  rows: Record<string, SeaRecordRow>;
  recent: string[];
  lastDaily: string | null;
  streak: number;
  bestStreak: number;
};
export const seaRecordsKey = "dostrike-sea-battle-records-v1";
export const emptySeaRecords = (): SeaRecords => ({
  rows: {},
  recent: [],
  lastDaily: null,
  streak: 0,
  bestStreak: 0,
});
const emptyRow = (): SeaRecordRow => ({
  games: 0,
  assisted: 0,
  wins: 0,
  losses: 0,
  cleanWins: 0,
  assistedWins: 0,
  aWins: 0,
  bWins: 0,
});
export const seaRecordGroup = (round: SeaRound) =>
  round.settings.mode === "local"
    ? "local"
    : `computer:${round.settings.level}:${round.settings.human}`;
function previousDay(day: string): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
export const seaStreak = (records: SeaRecords, today: string) =>
  validSeaDay(today) &&
  (records.lastDaily === today || records.lastDaily === previousDay(today))
    ? records.streak
    : 0;
export function recordSeaResult(
  records: SeaRecords,
  round: SeaRound,
  today: string,
): SeaRecords {
  if (!round.game.winner || records.recent.includes(round.id)) return records;
  const group = seaRecordGroup(round),
    row = { ...(records.rows[group] || emptyRow()) };
  row.games++;
  row.assisted += Number(round.assisted);
  if (round.settings.mode === "local") {
    if (round.game.winner === 1) row.aWins++;
    else row.bWins++;
  } else if (round.game.winner === round.settings.human) {
    row.wins++;
    if (round.assisted) row.assistedWins++;
    else row.cleanWins++;
  } else row.losses++;
  const next: SeaRecords = {
    ...records,
    rows: { ...records.rows, [group]: row },
    recent: [...records.recent, round.id].slice(-128),
  };
  if (
    validSeaDay(today) &&
    round.day === today &&
    round.settings.mode === "computer" &&
    round.game.winner === round.settings.human &&
    records.lastDaily !== today
  ) {
    next.lastDaily = today;
    next.streak =
      records.lastDaily === previousDay(today) ? records.streak + 1 : 1;
    next.bestStreak = Math.max(records.bestStreak, next.streak);
  }
  return next;
}
export function readSeaRecords(): SeaRecords {
  const records = emptySeaRecords();
  try {
    const v = JSON.parse(localStorage.getItem(seaRecordsKey) || "null");
    if (v?.rows && typeof v.rows === "object")
      for (const [group, value] of Object.entries(v.rows)) {
        if (!/^(local|computer:(easy|medium|hard):[12])$/.test(group)) continue;
        const row = value as SeaRecordRow;
        if (
          row &&
          Object.keys(emptyRow()).every(
            (k) =>
              Number.isSafeInteger(row[k as keyof SeaRecordRow]) &&
              row[k as keyof SeaRecordRow] >= 0,
          ) &&
          row.games === row.wins + row.losses + row.aWins + row.bWins &&
          row.assisted <= row.games &&
          row.cleanWins + row.assistedWins === row.wins &&
          row.assistedWins <= row.assisted &&
          row.cleanWins <= row.games - row.assisted &&
          (group === "local"
            ? row.wins + row.losses === 0
            : row.aWins + row.bWins === 0)
        )
          records.rows[group] = Object.fromEntries(
            Object.keys(emptyRow()).map((k) => [
              k,
              row[k as keyof SeaRecordRow],
            ]),
          ) as SeaRecordRow;
      }
    if (Array.isArray(v?.recent))
      records.recent = [
        ...new Set<string>(
          v.recent.filter(
            (id: unknown) =>
              typeof id === "string" && id.length > 0 && id.length <= 100,
          ),
        ),
      ].slice(-128);
    if (
      validSeaDay(v?.lastDaily) &&
      Number.isSafeInteger(v.streak) &&
      v.streak > 0 &&
      Number.isSafeInteger(v.bestStreak) &&
      v.bestStreak >= v.streak
    ) {
      records.lastDaily = v.lastDaily;
      records.streak = v.streak;
      records.bestStreak = v.bestStreak;
    } else if (
      v?.lastDaily === null &&
      v.streak === 0 &&
      Number.isSafeInteger(v.bestStreak) &&
      v.bestStreak >= 0
    )
      records.bestStreak = v.bestStreak;
  } catch {
    /* Browser records are optional. */
  }
  return records;
}
export function writeSeaRecords(records: SeaRecords): boolean {
  try {
    localStorage.setItem(seaRecordsKey, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}
