import {
  newSlideMerge,
  replaySlideMerge,
  playSlideMerge,
  undoSlideMerge,
  type SlideState,
  type SlideAction,
} from "./slideMergeEngine";
export type SlideRound = {
  id: string;
  day: string | null;
  assisted: boolean;
  played: boolean;
  reachedTarget: boolean;
  bestScore: number;
  bestTile: number;
  game: SlideState;
};
export const slideSaveKey = "dostrike-slide-merge-session-v1";
export function newSlideRound(
  seed: string,
  id: string,
  day: string | null = null,
): SlideRound {
  const game = newSlideMerge(seed);
  return {
    id,
    day,
    assisted: false,
    played: false,
    reachedTarget: false,
    bestScore: 0,
    bestTile: Math.max(...game.board),
    game,
  };
}
export function moveSlideRound(r: SlideRound, action: SlideAction): SlideRound {
  const game = playSlideMerge(r.game, action);
  return game === r.game
    ? r
    : {
        ...r,
        game,
        played: r.played || action !== "continue",
        reachedTarget: r.reachedTarget || game.won,
        bestScore: Math.max(r.bestScore, game.score),
        bestTile: Math.max(r.bestTile, ...game.board),
      };
}
export function undoSlideRound(r: SlideRound): SlideRound {
  const game = undoSlideMerge(r.game);
  return game === r.game ? r : { ...r, game, assisted: true };
}
export function encodeSlideRound(r: SlideRound) {
  return JSON.stringify({
    version: 1,
    id: r.id,
    day: r.day,
    assisted: r.assisted,
    played: r.played,
    reachedTarget: r.reachedTarget,
    bestScore: r.bestScore,
    bestTile: r.bestTile,
    seed: r.game.seed,
    actions: r.game.actions,
  });
}
export function decodeSlideRound(text: string): SlideRound | null {
  try {
    const v = JSON.parse(text);
    if (
      v?.version !== 1 ||
      typeof v.id !== "string" ||
      !v.id ||
      v.id.length > 100 ||
      typeof v.seed !== "string" ||
      !v.seed ||
      v.seed.length > 200 ||
      typeof v.assisted !== "boolean" ||
      typeof v.played !== "boolean" ||
      typeof v.reachedTarget !== "boolean" ||
      !Number.isSafeInteger(v.bestScore) ||
      v.bestScore < 0 ||
      !Number.isSafeInteger(v.bestTile) ||
      v.bestTile < 2 ||
      !Number.isInteger(Math.log2(v.bestTile)) ||
      (v.day !== null &&
        (typeof v.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v.day))) ||
      (v.day !== null && v.seed !== `daily:${v.day}`)
    )
      return null;
    const game = replaySlideMerge(v.seed, v.actions);
    if (
      v.bestScore < game.score ||
      v.bestTile < Math.max(...game.board) ||
      v.reachedTarget !== v.bestTile >= 2048 ||
      (game.actions.length && !v.played)
    )
      return null;
    return {
      id: v.id,
      day: v.day,
      assisted: v.assisted,
      played: v.played,
      reachedTarget: v.reachedTarget,
      bestScore: v.bestScore,
      bestTile: v.bestTile,
      game,
    };
  } catch {
    return null;
  }
}
export function readSlideRound() {
  try {
    return decodeSlideRound(localStorage.getItem(slideSaveKey) || "null");
  } catch {
    return null;
  }
}
