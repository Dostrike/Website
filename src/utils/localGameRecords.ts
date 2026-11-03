export type LocalGameLevel = "easy" | "medium" | "hard";
export type LocalGameRecords = Record<
  LocalGameLevel,
  { wins: number; losses: number; draws: number }
>;
/** Browser-only casual records. Reject malformed counts and tolerate unavailable storage. */
export function readGameRecords(key: string): LocalGameRecords {
  const result: LocalGameRecords = {
    easy: { wins: 0, losses: 0, draws: 0 },
    medium: { wins: 0, losses: 0, draws: 0 },
    hard: { wins: 0, losses: 0, draws: 0 },
  };
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    for (const level of ["easy", "medium", "hard"] as const)
      for (const field of ["wins", "losses", "draws"] as const) {
        if (
          Number.isSafeInteger(value?.[level]?.[field]) &&
          value[level][field] >= 0
        )
          result[level][field] = value[level][field];
      }
  } catch {
    /* Games still work without persistent records. */
  }
  return result;
}
export function writeGameRecords(key: string, records: LocalGameRecords): void {
  try {
    localStorage.setItem(key, JSON.stringify(records));
  } catch {
    /* Optional persistence. */
  }
}
