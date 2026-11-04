import { validBlockDay } from "./blockFitSession";
import type { BlockRound } from "./blockFitSession";
export type BlockScoreRow = {
  games: number;
  assisted: number;
  cleanBest: number | null;
  assistedBest: number | null;
};
export type BlockRecords = {
  classic: BlockScoreRow;
  daily: BlockScoreRow;
  days: Record<string, BlockScoreRow>;
  recent: string[];
};
export const blockRecordsKey = "dostrike-block-fit-records-v1";
export const emptyBlockRow = (): BlockScoreRow => ({
  games: 0,
  assisted: 0,
  cleanBest: null,
  assistedBest: null,
});
export const emptyBlockRecords = (): BlockRecords => ({
  classic: emptyBlockRow(),
  daily: emptyBlockRow(),
  days: {},
  recent: [],
});
const nonnegative = (n: unknown): n is number =>
  Number.isSafeInteger(n) && (n as number) >= 0;
function validRow(value: unknown): value is BlockScoreRow {
  const row = value as BlockScoreRow;
  return (
    !!row &&
    nonnegative(row.games) &&
    nonnegative(row.assisted) &&
    row.assisted <= row.games &&
    (row.assisted === 0
      ? row.assistedBest === null
      : nonnegative(row.assistedBest)) &&
    (row.games === row.assisted
      ? row.cleanBest === null
      : nonnegative(row.cleanBest))
  );
}
const copyRow = (r: BlockScoreRow): BlockScoreRow => ({
  games: r.games,
  assisted: r.assisted,
  cleanBest: r.cleanBest,
  assistedBest: r.assistedBest,
});
function addScore(
  row: BlockScoreRow,
  score: number,
  assisted: boolean,
): BlockScoreRow {
  return {
    games: row.games + 1,
    assisted: row.assisted + Number(assisted),
    cleanBest: assisted ? row.cleanBest : Math.max(row.cleanBest ?? 0, score),
    assistedBest: assisted
      ? Math.max(row.assistedBest ?? 0, score)
      : row.assistedBest,
  };
}
export function recordBlockResult(
  records: BlockRecords,
  round: BlockRound,
): BlockRecords {
  if (
    !round.finished ||
    !round.game.over ||
    records.recent.includes(round.id) ||
    !nonnegative(round.game.score)
  )
    return records;
  const next: BlockRecords = {
    ...records,
    days: { ...records.days },
    recent: [...records.recent, round.id].slice(-128),
  };
  if (round.day === null)
    next.classic = addScore(records.classic, round.game.score, round.assisted);
  else {
    if (!validBlockDay(round.day)) return records;
    next.daily = addScore(records.daily, round.game.score, round.assisted);
    next.days[round.day] = addScore(
      records.days[round.day] ?? emptyBlockRow(),
      round.game.score,
      round.assisted,
    );
    // Older daily runs stay on their original date; no fabricated win/streak or today's result.
    next.days = Object.fromEntries(
      Object.entries(next.days)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-90),
    );
  }
  return next;
}
export function decodeBlockRecords(raw: unknown): BlockRecords {
  const records = emptyBlockRecords();
  if (typeof raw !== "string" || raw.length > 200_000) return records;
  try {
    const v = JSON.parse(raw);
    if (!v || v.version !== 1) return records;
    if (validRow(v.classic)) records.classic = copyRow(v.classic);
    if (validRow(v.daily)) records.daily = copyRow(v.daily);
    if (v.days && typeof v.days === "object" && !Array.isArray(v.days)) {
      const accepted = Object.entries(v.days).filter(
        ([day, row]) => validBlockDay(day) && validRow(row),
      ) as [string, BlockScoreRow][];
      records.days = Object.fromEntries(
        accepted
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-90)
          .map(([day, row]) => [day, copyRow(row)]),
      );
      const rows = Object.values(records.days);
      const totalGames = rows.reduce((n, row) => n + row.games, 0);
      const totalAssisted = rows.reduce((n, row) => n + row.assisted, 0);
      if (
        totalGames > records.daily.games ||
        totalAssisted > records.daily.assisted ||
        totalGames - totalAssisted >
          records.daily.games - records.daily.assisted ||
        rows.some(
          (row) =>
            (row.cleanBest !== null &&
              (records.daily.cleanBest === null ||
                row.cleanBest > records.daily.cleanBest)) ||
            (row.assistedBest !== null &&
              (records.daily.assistedBest === null ||
                row.assistedBest > records.daily.assistedBest)),
        )
      )
        records.days = {};
    }
    if (Array.isArray(v.recent))
      records.recent = [
        ...new Set<string>(
          v.recent.filter(
            (id: unknown) =>
              typeof id === "string" && id.length > 0 && id.length <= 100,
          ),
        ),
      ].slice(-128);
  } catch {
    /* Invalid/blocked records never prevent a game. */
  }
  return records;
}
export function encodeBlockRecords(records: BlockRecords): string {
  return JSON.stringify({ version: 1, ...records });
}
export function readBlockRecords(
  storage?: Pick<Storage, "getItem">,
): BlockRecords {
  try {
    return decodeBlockRecords(
      (storage ?? localStorage).getItem(blockRecordsKey),
    );
  } catch {
    return emptyBlockRecords();
  }
}
export function writeBlockRecords(
  records: BlockRecords,
  storage?: Pick<Storage, "setItem">,
): boolean {
  try {
    const raw = encodeBlockRecords(records);
    if (raw.length > 200_000) return false;
    (storage ?? localStorage).setItem(blockRecordsKey, raw);
    return true;
  } catch {
    return false;
  }
}
