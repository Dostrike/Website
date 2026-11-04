import {
  generateSeaFleet,
  newSea,
  playSea,
  replaySea,
  seaKnowledge,
} from "./seaBattleEngine";
import type { SeaFleet, SeaPlayer, SeaState } from "./seaBattleEngine";
import type { SeaLevel } from "./seaBattleAI";
import type { SeaWorkerRequest } from "../workers/seaBattle.worker";
export type SeaSettings = {
  mode: "computer" | "local";
  human: SeaPlayer;
  level: SeaLevel;
};
export type SeaRound = {
  id: string;
  day: string | null;
  settings: SeaSettings;
  assisted: boolean;
  game: SeaState;
};
export const seaSaveKey = "dostrike-sea-battle-session-v1";
export function validSeaSettings(value: unknown): value is SeaSettings {
  const v = value as SeaSettings;
  return (
    !!v &&
    ["computer", "local"].includes(v.mode) &&
    [1, 2].includes(v.human) &&
    ["easy", "medium", "hard"].includes(v.level)
  );
}
export function validSeaDay(day: unknown): day is string {
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(`${day}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day
  );
}
export function seaHash(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++)
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return hash >>> 0;
}
export function seaDailyFleet(day: string): SeaFleet {
  if (!validSeaDay(day)) throw Error("Invalid Sea Battle daily date");
  return generateSeaFleet(seaHash(`sea-battle:daily-fleet:v1:${day}`));
}
const fleetKey = (fleet: SeaFleet) =>
  JSON.stringify(
    fleet
      .map((p) => ({ ship: p.ship, start: p.start, axis: p.axis }))
      .sort((a, b) => a.ship - b.ship),
  );
export function newSeaRound(
  settings: SeaSettings,
  id: string,
  fleetA: SeaFleet,
  fleetB: SeaFleet,
  day: string | null = null,
): SeaRound {
  if (
    !validSeaSettings(settings) ||
    typeof id !== "string" ||
    !id ||
    id.length > 100 ||
    (day !== null && !validSeaDay(day))
  )
    throw Error("Invalid Sea Battle round");
  const game = newSea(fleetA, fleetB);
  if (
    day !== null &&
    (settings.mode !== "computer" ||
      settings.human !== 1 ||
      settings.level !== "hard" ||
      fleetKey(game.fleets[1]) !== fleetKey(seaDailyFleet(day)))
  )
    throw Error("Daily fleet or settings do not match the date");
  return {
    id,
    day,
    settings: {
      mode: settings.mode,
      human: settings.human,
      level: settings.level,
    },
    assisted: false,
    game,
  };
}
export function moveSeaRound(
  round: SeaRound,
  player: SeaPlayer,
  cell: number,
): SeaRound {
  const game = playSea(round.game, player, cell);
  return game ? { ...round, game } : round;
}
function undoIndex(round: SeaRound): number | null {
  if (round.game.winner || !round.game.history.length) return null;
  if (round.settings.mode === "local") return round.game.history.length - 1;
  for (let i = round.game.history.length - 1; i >= 0; i--)
    if (round.game.history[i].player === round.settings.human) return i;
  return null;
}
export const canUndoSeaRound = (round: SeaRound) => undoIndex(round) !== null;
export function undoSeaRound(round: SeaRound): SeaRound {
  const index = undoIndex(round);
  if (index === null) return round;
  const game = replaySea(
    ...round.game.fleets,
    round.game.history.slice(0, index),
  );
  if (!game) throw Error("Invalid Sea Battle history");
  return { ...round, assisted: true, game };
}
export const assistSeaRound = (round: SeaRound): SeaRound =>
  round.assisted ? round : { ...round, assisted: true };
export function restartSeaRound(round: SeaRound, id: string): SeaRound {
  if (id === round.id) throw Error("Restart requires a new attempt identity");
  return newSeaRound(round.settings, id, ...round.game.fleets, round.day);
}
/** Contains public identity/settings/transcript only, never a hidden fleet. */
export const seaPositionKey = (round: SeaRound) =>
  `${round.id}:${round.day || "practice"}:${round.settings.mode}:${round.settings.human}:${round.settings.level}:${round.game.history.map((s) => `${s.player}.${s.cell}`).join(",")}`;
export function seaReplyMatches(
  round: SeaRound,
  requestId: number,
  expectedId: number,
  positionKey: string,
): boolean {
  return (
    Number.isSafeInteger(requestId) &&
    requestId > 0 &&
    requestId === expectedId &&
    positionKey === seaPositionKey(round) &&
    round.game.winner === null
  );
}
export function makeSeaRequest(
  round: SeaRound,
  requestId: number,
  hint = false,
): SeaWorkerRequest {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || round.game.winner)
    throw Error("Invalid Sea Battle request identity");
  const positionKey = seaPositionKey(round);
  // Neither placement seed nor fleet is an input to decision randomness.
  const seed = seaHash(`sea-battle:decision:v1:${positionKey}`);
  return {
    requestId,
    positionKey,
    knowledge: seaKnowledge(round.game, round.game.turn),
    level: hint ? "hard" : round.settings.level,
    seed,
  };
}
export function encodeSeaRound(round: SeaRound): string {
  return JSON.stringify({
    version: 1,
    id: round.id,
    day: round.day,
    settings: round.settings,
    assisted: round.assisted,
    fleets: round.game.fleets,
    shots: round.game.history.map(({ player, cell }) => ({ player, cell })),
  });
}
export function decodeSeaRound(text: string): SeaRound | null {
  try {
    if (text.length > 40000) return null;
    const v = JSON.parse(text);
    if (
      v?.version !== 1 ||
      typeof v.assisted !== "boolean" ||
      (v.day !== null && typeof v.day !== "string") ||
      !Array.isArray(v.fleets) ||
      v.fleets.length !== 2 ||
      !Array.isArray(v.shots) ||
      v.shots.length > 199
    )
      return null;
    const initial = newSeaRound(
      v.settings,
      v.id,
      v.fleets[0],
      v.fleets[1],
      v.day,
    );
    const game = replaySea(...initial.game.fleets, v.shots);
    return game ? { ...initial, assisted: v.assisted, game } : null;
  } catch {
    return null;
  }
}
export function readSeaRound(): SeaRound | null {
  try {
    return decodeSeaRound(localStorage.getItem(seaSaveKey) || "null");
  } catch {
    return null;
  }
}
export function writeSeaRound(round: SeaRound): boolean {
  try {
    localStorage.setItem(seaSaveKey, encodeSeaRound(round));
    return true;
  } catch {
    return false;
  }
}
