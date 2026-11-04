import type { ChessRound } from "./chessSession";
import { validChessDay } from "./chessSession";
export type ChessRecordRow = {
  games: number;
  assisted: number;
  wins: number;
  losses: number;
  draws: number;
  cleanWins: number;
  assistedWins: number;
  whiteWins: number;
  blackWins: number;
};
export type ChessRecords = {
  rows: Record<string, ChessRecordRow>;
  recent: string[];
  lastDaily: string | null;
  streak: number;
  bestStreak: number;
};
export const chessRecordsKey = "dostrike-chess-records-v1";
export const emptyChessRecords = (): ChessRecords => ({
  rows: {},
  recent: [],
  lastDaily: null,
  streak: 0,
  bestStreak: 0,
});
const emptyRow = (): ChessRecordRow => ({
  games: 0,
  assisted: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  cleanWins: 0,
  assistedWins: 0,
  whiteWins: 0,
  blackWins: 0,
});
export const chessRecordGroup = (round: ChessRound) =>
  round.settings.mode === "local"
    ? "local"
    : `computer:${round.settings.level}:${round.settings.human}`;
function previousDay(day: string): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
export const chessStreak = (records: ChessRecords, today: string) =>
  validChessDay(today) &&
  (records.lastDaily === today || records.lastDaily === previousDay(today))
    ? records.streak
    : 0;
export function recordChessResult(
  records: ChessRecords,
  round: ChessRound,
  today: string,
): ChessRecords {
  if (!round.game.result || records.recent.includes(round.id)) return records;
  const group = chessRecordGroup(round),
    row = { ...(records.rows[group] || emptyRow()) };
  row.games++;
  row.assisted += Number(round.assisted);
  if (round.game.result.winner === "draw") row.draws++;
  else if (round.settings.mode === "local") {
    if (round.game.result.winner === "w") row.whiteWins++;
    else row.blackWins++;
  } else if (round.game.result.winner === round.settings.human) {
    row.wins++;
    if (round.assisted) row.assistedWins++;
    else row.cleanWins++;
  } else row.losses++;
  const next: ChessRecords = {
    ...records,
    rows: { ...records.rows, [group]: row },
    recent: [...records.recent, round.id].slice(-128),
  };
  if (
    validChessDay(today) &&
    round.day === today &&
    round.settings.mode === "computer" &&
    round.game.result.winner === round.settings.human &&
    records.lastDaily !== today
  ) {
    next.lastDaily = today;
    next.streak =
      records.lastDaily === previousDay(today) ? records.streak + 1 : 1;
    next.bestStreak = Math.max(records.bestStreak, next.streak);
  }
  return next;
}
export function readChessRecords(): ChessRecords {
  const records = emptyChessRecords();
  try {
    const v = JSON.parse(localStorage.getItem(chessRecordsKey) || "null");
    if (v?.rows && typeof v.rows === "object")
      for (const [group, value] of Object.entries(v.rows)) {
        if (!/^(local|computer:(easy|medium|hard):[wb])$/.test(group)) continue;
        const row = value as ChessRecordRow;
        if (
          row &&
          Object.keys(emptyRow()).every(
            (k) =>
              Number.isSafeInteger(row[k as keyof ChessRecordRow]) &&
              row[k as keyof ChessRecordRow] >= 0,
          ) &&
          row.games ===
            row.wins + row.losses + row.draws + row.whiteWins + row.blackWins &&
          row.assisted <= row.games &&
          row.cleanWins + row.assistedWins === row.wins &&
          row.assistedWins <= row.assisted &&
          row.cleanWins <= row.games - row.assisted &&
          (group === "local"
            ? row.wins + row.losses === 0
            : row.whiteWins + row.blackWins === 0)
        )
          records.rows[group] = Object.fromEntries(
            Object.keys(emptyRow()).map((k) => [
              k,
              row[k as keyof ChessRecordRow],
            ]),
          ) as ChessRecordRow;
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
      validChessDay(v?.lastDaily) &&
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
    /* Optional browser records. */
  }
  return records;
}
export function writeChessRecords(records: ChessRecords): boolean {
  try {
    localStorage.setItem(chessRecordsKey, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}
