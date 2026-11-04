import {
  generateColourPuzzle,
  newColourState,
  replayColour,
  playColour,
  undoColour,
  colourHint,
} from "./colourSortEngine";
import type { ColourMove, ColourState } from "./colourSortEngine";
export const colourSaveKey = "dostrike-colour-sort-session-v1";
export type ColourRound = {
  id: string;
  day: string | null;
  assisted: boolean;
  game: ColourState;
};
function validDay(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(`${day}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day
  );
}
export function newColourRound(
  seed: string,
  colours: number,
  id: string,
  day: string | null = null,
): ColourRound {
  if (
    typeof id !== "string" ||
    !id ||
    id.length > 100 ||
    (day !== null &&
      (!validDay(day) || seed !== `daily:${day}` || colours !== 5))
  )
    throw Error("Invalid colour round identity");
  return {
    id,
    day,
    assisted: false,
    game: newColourState(generateColourPuzzle(seed, colours)),
  };
}
export function moveColourRound(
  round: ColourRound,
  move: ColourMove,
): ColourRound {
  const game = playColour(round.game, move);
  return game === round.game ? round : { ...round, game };
}
export function undoColourRound(round: ColourRound): ColourRound {
  const game = undoColour(round.game);
  return game === round.game ? round : { ...round, game, assisted: true };
}
export function hintColourRound(round: ColourRound): {
  round: ColourRound;
  move: ColourMove | null;
} {
  const move = colourHint(round.game);
  return { round: move ? { ...round, assisted: true } : round, move };
}
export function encodeColourRound(round: ColourRound): string {
  return JSON.stringify({
    version: 1,
    id: round.id,
    day: round.day,
    assisted: round.assisted,
    seed: round.game.puzzle.seed,
    colours: round.game.puzzle.colours,
    moves: round.game.moves,
  });
}
export function decodeColourRound(text: string): ColourRound | null {
  try {
    const v = JSON.parse(text);
    if (v?.version !== 1 || typeof v.assisted !== "boolean") return null;
    const initial = newColourRound(v.seed, v.colours, v.id, v.day);
    return {
      ...initial,
      assisted: v.assisted,
      game: replayColour(initial.game.puzzle, v.moves),
    };
  } catch {
    return null;
  }
}
export function readColourRound(): ColourRound | null {
  try {
    return decodeColourRound(localStorage.getItem(colourSaveKey) || "null");
  } catch {
    return null;
  }
}
