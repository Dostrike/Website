import {
  validMineSettings,
  replayMines,
  type MineSettings,
  type MineAction,
  type MineBoard,
  type MineState,
} from "./minesweeperEngine";
export type MineSave = {
  id: string;
  seed: string;
  settings: MineSettings;
  first: number;
  day: string | null;
  actions: MineAction[];
  assisted: boolean;
  recovered: boolean;
  finalized: boolean;
};
export type MineRound = MineSave & { state: MineState };
export const mineSaveKey = "dostrike-minesweeper-session-v1";
export function decodeMineSave(text: string): MineSave | null {
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
      !validMineSettings(v.settings) ||
      !Number.isInteger(v.first) ||
      v.first < 0 ||
      v.first >= v.settings.width * v.settings.height ||
      !Array.isArray(v.actions) ||
      v.actions.length > 10000 ||
      !v.actions.every(
        (a: MineAction) =>
          a &&
          ["reveal", "flag", "chord"].includes(a.type) &&
          Number.isInteger(a.index) &&
          a.index >= 0 &&
          a.index < v.settings.width * v.settings.height,
      ) ||
      typeof v.assisted !== "boolean" ||
      typeof v.recovered !== "boolean" ||
      typeof v.finalized !== "boolean" ||
      (v.recovered && !v.assisted) ||
      (v.day !== null &&
        (typeof v.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v.day)))
    )
      return null;
    if (
      v.day !== null &&
      (v.seed !== `daily:${v.day}` ||
        v.settings.width !== 16 ||
        v.settings.height !== 16 ||
        v.settings.mines !== 40 ||
        !v.settings.noGuess ||
        v.first !== 0)
    )
      return null;
    return {
      id: v.id,
      seed: v.seed,
      settings: v.settings,
      first: v.first,
      day: v.day,
      actions: v.actions,
      assisted: v.assisted,
      recovered: v.recovered,
      finalized: v.finalized,
    };
  } catch {
    return null;
  }
}
export function restoreMineRound(save: MineSave, board: MineBoard): MineRound {
  if (
    board.seed !== save.seed ||
    board.first !== save.first ||
    (["width", "height", "mines", "noGuess"] as const).some(key => board.settings[key] !== save.settings[key])
  )
    throw Error("Puzzle identity mismatch");
  const state = replayMines(board, save.actions);
  if (save.finalized && !state.over) throw Error("Invalid finalized round");
  return { ...save, state };
}
export function encodeMineRound(r: MineRound) {
  return JSON.stringify({
    version: 1,
    id: r.id,
    seed: r.seed,
    settings: r.settings,
    first: r.first,
    day: r.day,
    actions: r.state.actions,
    assisted: r.assisted,
    recovered: r.recovered,
    finalized: r.finalized,
  });
}
export function readMineSave() {
  try {
    return decodeMineSave(localStorage.getItem(mineSaveKey) || "null");
  } catch {
    return null;
  }
}
export function recoverMineRound(r: MineRound): MineRound {
  if (
    !r.state.over ||
    r.state.won ||
    r.recovered ||
    r.finalized ||
    !r.state.actions.length
  )
    return r;
  return {
    ...r,
    assisted: true,
    recovered: true,
    state: replayMines(r.state.board, r.state.actions.slice(0, -1)),
  };
}
export function safeMineReveal(r: MineRound): number | null {
  if (r.state.over) return null;
  const i = r.state.revealed.findIndex(
    (v, i) => !v && !r.state.flags[i] && !r.state.board.mines[i],
  );
  return i < 0 ? null : i;
}
