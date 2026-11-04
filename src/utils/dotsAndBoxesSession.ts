import { newDots, dotsDaily, replayDots, playDots } from "./dotsAndBoxesEngine";
import type { DotsState, DotsPlayer } from "./dotsAndBoxesEngine";
import type { DotsLevel } from "./dotsAndBoxesAI";
export type DotsSettings = {
  size: number;
  mode: "computer" | "local";
  human: DotsPlayer;
  level: DotsLevel;
};
export type DotsRound = {
  id: string;
  day: string | null;
  settings: DotsSettings;
  assisted: boolean;
  game: DotsState;
};
export const dotsSaveKey = "dostrike-dots-and-boxes-session-v1";
export function validDotsSettings(value: unknown): value is DotsSettings {
  const v = value as DotsSettings;
  return (
    !!v &&
    [2, 3, 4].includes(v.size) &&
    ["computer", "local"].includes(v.mode) &&
    [1, 2].includes(v.human) &&
    ["easy", "medium", "hard"].includes(v.level)
  );
}
function validDay(day: string) {
  const date = new Date(`${day}T12:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === day
  );
}
export function newDotsRound(
  settings: DotsSettings,
  id: string,
  day: string | null = null,
): DotsRound {
  if (
    !validDotsSettings(settings) ||
    typeof id !== "string" ||
    !id ||
    id.length > 100 ||
    (day !== null && (typeof day !== "string" || !validDay(day)))
  )
    throw Error("Invalid Dots round");
  if (
    day !== null &&
    (settings.size !== 3 ||
      settings.mode !== "computer" ||
      settings.human !== 1 ||
      settings.level !== "hard")
  )
    throw Error("Invalid daily settings");
  return {
    id,
    day,
    settings: { ...settings },
    assisted: false,
    game: day ? dotsDaily(`daily:${day}`) : newDots(settings.size),
  };
}
export const dotsFloor = (round: DotsRound) => (round.day ? 8 : 0);
export function moveDotsRound(round: DotsRound, edge: number): DotsRound {
  const game = playDots(round.game, edge);
  return game === round.game ? round : { ...round, game };
}
function undoIndex(round: DotsRound): number | null {
  if (
    round.game.result !== null ||
    round.game.history.length <= dotsFloor(round)
  )
    return null;
  if (round.settings.mode === "local") return round.game.history.length - 1;
  let state = newDots(round.settings.size),
    last: number | null = null;
  round.game.history.forEach((edge, index) => {
    if (index >= dotsFloor(round) && state.turn === round.settings.human)
      last = index;
    state = playDots(state, edge);
  });
  return last;
}
export function canUndoDotsRound(round: DotsRound) {
  return undoIndex(round) !== null;
}
export function undoDotsRound(round: DotsRound): DotsRound {
  const index = undoIndex(round);
  return index === null
    ? round
    : {
        ...round,
        assisted: true,
        game: replayDots(
          round.settings.size,
          round.game.history.slice(0, index),
        ),
      };
}
export const assistDotsRound = (round: DotsRound): DotsRound =>
  round.assisted ? round : { ...round, assisted: true };
export const dotsPositionKey = (round: DotsRound) =>
  `${round.id}:${round.settings.size}:${round.settings.mode}:${round.settings.human}:${round.settings.level}:${round.game.history.join(",")}`;
export function dotsReplyMatches(
  round: DotsRound,
  requestId: number,
  expectedId: number,
  positionKey: string,
) {
  return (
    requestId === expectedId &&
    positionKey === dotsPositionKey(round) &&
    round.game.result === null
  );
}
export function encodeDotsRound(round: DotsRound) {
  return JSON.stringify({
    version: 1,
    id: round.id,
    day: round.day,
    settings: round.settings,
    assisted: round.assisted,
    moves: round.game.history,
  });
}
export function decodeDotsRound(text: string): DotsRound | null {
  try {
    const v = JSON.parse(text);
    if (
      v?.version !== 1 ||
      typeof v.assisted !== "boolean" ||
      (v.day !== null && typeof v.day !== "string")
    )
      return null;
    const initial = newDotsRound(v.settings, v.id, v.day);
    if (
      !Array.isArray(v.moves) ||
      v.moves.length < dotsFloor(initial) ||
      initial.game.history.some((edge, index) => v.moves[index] !== edge)
    )
      return null;
    return {
      ...initial,
      assisted: v.assisted,
      game: replayDots(initial.settings.size, v.moves),
    };
  } catch {
    return null;
  }
}
export function readDotsRound(): DotsRound | null {
  try {
    return decodeDotsRound(localStorage.getItem(dotsSaveKey) || "null");
  } catch {
    return null;
  }
}
