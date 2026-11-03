import type { CheckersSide } from "./checkersEngine";
type CheckersDifficulty = "easy" | "medium" | "hard";
export type CheckersLevelRecord = {
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  bestStreak: number;
  bestMargin: number;
};
export type CheckersProgress = {
  version: 1;
  levels: Record<CheckersDifficulty, CheckersLevelRecord>;
  localGames: number;
  lastDailyWin: string | null;
  dailyStreak: number;
  bestDailyStreak: number;
  recentIds: string[];
};
export const checkersProgressKey = "dostrike-checkers-records-v1";
export function emptyCheckersProgress(): CheckersProgress {
  const record = () => ({
    wins: 0,
    losses: 0,
    draws: 0,
    streak: 0,
    bestStreak: 0,
    bestMargin: 0,
  });
  return {
    version: 1,
    levels: { easy: record(), medium: record(), hard: record() },
    localGames: 0,
    lastDailyWin: null,
    dailyStreak: 0,
    bestDailyStreak: 0,
    recentIds: [],
  };
}
export function readCheckersProgress(): CheckersProgress {
  const result = emptyCheckersProgress();
  try {
    const value = JSON.parse(
      localStorage.getItem(checkersProgressKey) || "null",
    );
    if (value?.version !== 1) return result;
    for (const level of ["easy", "medium", "hard"] as const)
      for (const field of [
        "wins",
        "losses",
        "draws",
        "streak",
        "bestStreak",
        "bestMargin",
      ] as const) {
        const count = value?.levels?.[level]?.[field];
        if (
          Number.isSafeInteger(count) &&
          count >= 0 &&
          (field !== "bestMargin" || count <= 12)
        )
          result.levels[level][field] = count;
      }
    for (const field of [
      "localGames",
      "dailyStreak",
      "bestDailyStreak",
    ] as const) {
      if (Number.isSafeInteger(value[field]) && value[field] >= 0)
        result[field] = value[field];
    }
    if (
      typeof value.lastDailyWin === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value.lastDailyWin)
    )
      result.lastDailyWin = value.lastDailyWin;
    if (Array.isArray(value.recentIds))
      result.recentIds = value.recentIds
        .slice(-128)
        .filter((id: unknown) => typeof id === "string" && id.length <= 100);
  } catch {
    /* Progress is optional. */
  }
  return result;
}
export function writeCheckersProgress(progress: CheckersProgress): void {
  try {
    localStorage.setItem(checkersProgressKey, JSON.stringify(progress));
  } catch {
    /* Play remains available. */
  }
}
export function previousCheckersDate(key: string): string {
  const [year, month, day] = key.split("-").map(Number),
    date = new Date(Date.UTC(year, month - 1, day - 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
export function currentCheckersStreak(
  progress: CheckersProgress,
  today: string,
): number {
  return progress.lastDailyWin === today ||
    progress.lastDailyWin === previousCheckersDate(today)
    ? progress.dailyStreak
    : 0;
}
export function recordCheckersResult(
  progress: CheckersProgress,
  event: {
    id: string;
    mode: "computer" | "local";
    difficulty: CheckersDifficulty;
    human: CheckersSide;
    counts: { dark: number; light: number };
    winner: CheckersSide | "draw";
    dailyDay?: string;
    today: string;
  },
): CheckersProgress {
  if (progress.recentIds.includes(event.id)) return progress;
  const next: CheckersProgress = {
    ...progress,
    levels: {
      easy: { ...progress.levels.easy },
      medium: { ...progress.levels.medium },
      hard: { ...progress.levels.hard },
    },
    recentIds: [...progress.recentIds, event.id].slice(-128),
  };
  if (event.mode === "local") {
    next.localGames++;
    return next;
  }
  const margin = Math.max(
      0,
      event.counts[event.human] -
        event.counts[event.human === "dark" ? "light" : "dark"],
    ),
    record = next.levels[event.difficulty];
  if (event.winner === event.human) {
    record.wins++;
    record.streak++;
    record.bestStreak = Math.max(record.bestStreak, record.streak);
    record.bestMargin = Math.max(record.bestMargin, margin);
  } else {
    record[event.winner === "draw" ? "draws" : "losses"]++;
    record.streak = 0;
  }
  if (
    event.winner === event.human &&
    event.dailyDay === event.today &&
    next.lastDailyWin !== event.today
  ) {
    next.dailyStreak =
      next.lastDailyWin === previousCheckersDate(event.today)
        ? next.dailyStreak + 1
        : 1;
    next.lastDailyWin = event.today;
    next.bestDailyStreak = Math.max(next.bestDailyStreak, next.dailyStreak);
  }
  return next;
}
