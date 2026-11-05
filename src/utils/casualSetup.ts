export type CasualGame = "tictactoe" | "connect4";
export type CasualSettings = { gameMode: "AI" | "PVP"; difficulty: "EASY" | "MEDIUM" | "HARD"; player1Name: string; player2Name: string };
export type CasualHandoff = { version: 1; game: CasualGame; settings: CasualSettings; saved: boolean };
type SetupStorage = Pick<Storage, "getItem" | "setItem">;
const keys = { tictactoe: "gameSettings", connect4: "connect4Settings" };
const object = (value: unknown): Record<string, unknown> | null => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
export function normalizeCasualSettings(value: unknown, strict = false): CasualSettings | null {
  const s = object(value);
  if (!s || (s.gameMode !== "AI" && s.gameMode !== "PVP")) return null;
  const validDifficulty = s.difficulty === "EASY" || s.difficulty === "MEDIUM" || s.difficulty === "HARD";
  if (strict && (!validDifficulty || typeof s.player1Name !== "string" || typeof s.player2Name !== "string")) return null;
  const name = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value.trim().slice(0, 40) : fallback;
  return { gameMode: s.gameMode, difficulty: validDifficulty ? s.difficulty as CasualSettings["difficulty"] : "MEDIUM", player1Name: name(s.player1Name, "You"), player2Name: name(s.player2Name, "Player 2") };
}
export function prepareCasualSetup(game: CasualGame, value: unknown, storage?: SetupStorage): CasualHandoff | null {
  const settings = normalizeCasualSettings(value, true);
  if (!settings) return null;
  let saved = false;
  try { (storage ?? localStorage).setItem(keys[game], JSON.stringify(settings)); saved = true; } catch { /* The validated handoff can still start play. */ }
  return { version: 1, game, settings, saved };
}
export function resolveCasualSetup(game: CasualGame, routeState: unknown, storage?: SetupStorage): { settings: CasualSettings; saved: boolean } | null {
  const route = object(routeState);
  // A present but invalid handoff must never resurrect stale stored choices.
  if (route && Object.prototype.hasOwnProperty.call(route, "casualSetup")) {
    const handoff = object(route.casualSetup);
    if (!handoff || handoff.version !== 1 || handoff.game !== game || typeof handoff.saved !== "boolean") return null;
    const settings = normalizeCasualSettings(handoff.settings, true);
    return settings ? { settings, saved: handoff.saved } : null;
  }
  try {
    const settings = normalizeCasualSettings(JSON.parse((storage ?? localStorage).getItem(keys[game]) ?? "null"));
    return settings ? { settings, saved: true } : null;
  } catch { return null; }
}
