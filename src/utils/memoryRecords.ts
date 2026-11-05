export type MemoryDifficulty = "EASY" | "MEDIUM" | "HARD";
export type DifficultyStats = { gamesPlayed: number; wins: number; bestMoves: number | null; bestTime: number | null };
export type MemoryStats = Record<MemoryDifficulty, DifficultyStats>;
export const MEMORY_STATS_KEY = "memoryGameStats";
type RecordStorage = Pick<Storage, "getItem" | "setItem">;
const count = (value: unknown): number | null => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
export function normalizeMemoryStats(value: unknown): MemoryStats {
  const root = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const result = {} as MemoryStats;
  for (const level of ["EASY", "MEDIUM", "HARD"] as const) {
    const raw = root[level];
    const item = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
    result[level] = { gamesPlayed: count(item.gamesPlayed) ?? 0, wins: count(item.wins) ?? 0, bestMoves: count(item.bestMoves), bestTime: count(item.bestTime) };
  }
  return result;
}
export function loadMemoryStats(storage?: RecordStorage): { stats: MemoryStats; available: boolean } {
  try {
    const raw = (storage ?? localStorage).getItem(MEMORY_STATS_KEY);
    let value: unknown = null;
    try { value = raw ? JSON.parse(raw) : null; } catch { /* Recover malformed records without blocking play. */ }
    return { stats: normalizeMemoryStats(value), available: true };
  } catch { return { stats: normalizeMemoryStats(null), available: false }; }
}
export function saveMemoryStats(stats: MemoryStats, storage?: RecordStorage): boolean {
  try { (storage ?? localStorage).setItem(MEMORY_STATS_KEY, JSON.stringify(normalizeMemoryStats(stats))); return true; }
  catch { return false; }
}
