import {
  blockHasMove,
  blockTray,
  newBlockFit,
  playBlockFit,
  validBlockMove,
} from "./blockFitEngine";
import type { BlockGame, BlockMove } from "./blockFitEngine";

export type BlockAction =
  | ({ type: "place" } & BlockMove)
  | { type: "swap" }
  | { type: "revive"; anchor: number }
  | { type: "undo" }
  | { type: "finish" };
export type BlockRound = {
  id: string;
  seed: string;
  day: string | null;
  game: BlockGame;
  actions: BlockAction[];
  undoFrames: BlockGame[];
  assisted: boolean;
  swapUsed: boolean;
  reviveUsed: boolean;
  finished: boolean;
};
export type BlockRevivePreview = {
  cells: number[];
  cleared: number[];
  board: number[];
  canMove: boolean;
};
export const blockSaveKey = "dostrike-block-fit-session-v1";
export const BLOCK_SAVE_ACTION_LIMIT = 5000;
const MAX_SAVE_LENGTH = 1_000_000;
export function validBlockDay(day: unknown): day is string {
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(`${day}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day
  );
}
export const dailyBlockSeed = (day: string) => {
  if (!validBlockDay(day)) throw Error("Invalid Block Fit day");
  return `dostrike-block-fit:daily:v1:${day}`;
};
function validIdentity(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 100 &&
    value.trim() === value
  );
}
export function newBlockRound(
  id: string,
  seed: string,
  day: string | null = null,
): BlockRound {
  if (
    !validIdentity(id) ||
    !validIdentity(seed) ||
    (day !== null && (!validBlockDay(day) || seed !== dailyBlockSeed(day)))
  )
    throw Error("Invalid Block Fit identity");
  return {
    id,
    seed,
    day,
    game: newBlockFit(seed),
    actions: [],
    undoFrames: [],
    assisted: false,
    swapUsed: false,
    reviveUsed: false,
    finished: false,
  };
}
/** Swapping preserves used slots and the ordinary tray stream/index. */
export function previewBlockSwap(round: BlockRound): (number | null)[] | null {
  if (round.finished || round.swapUsed) return null;
  const replacements = blockTray(`swap-v1:${round.seed}`, round.game.trayIndex);
  return round.game.tray.map((shape, slot) =>
    shape === null ? null : replacements[slot],
  );
}
/** A revive region is clipped at the right/bottom; empty/non-recovering previews cannot commit. */
export function previewBlockRevive(
  round: BlockRound,
  anchor: number,
): BlockRevivePreview | null {
  if (
    round.finished ||
    round.reviveUsed ||
    !round.game.over ||
    !Number.isInteger(anchor) ||
    anchor < 0 ||
    anchor >= 64
  )
    return null;
  const r = Math.floor(anchor / 8),
    c = anchor % 8,
    cells: number[] = [];
  for (let y = r; y < Math.min(8, r + 3); y++)
    for (let x = c; x < Math.min(8, c + 3); x++) cells.push(y * 8 + x);
  const cleared = cells.filter((cell) => round.game.board[cell] !== 0),
    board = [...round.game.board];
  for (const cell of cells) board[cell] = 0;
  return {
    cells,
    cleared,
    board,
    canMove: blockHasMove(board, round.game.tray),
  };
}
export function validBlockAction(value: unknown): value is BlockAction {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const a = value as Record<string, unknown>;
  if (a.type === "place")
    return (
      Object.keys(a).length === 3 &&
      validBlockMove({ slot: a.slot, anchor: a.anchor })
    );
  if (a.type === "revive")
    return (
      Object.keys(a).length === 2 &&
      Number.isInteger(a.anchor) &&
      (a.anchor as number) >= 0 &&
      (a.anchor as number) < 64
    );
  return (
    Object.keys(a).length === 1 &&
    ["swap", "undo", "finish"].includes(a.type as string)
  );
}
export const canUndoBlockRound = (round: BlockRound) =>
  !round.finished && round.undoFrames.length > 0;
export function actBlockRound(
  round: BlockRound,
  action: BlockAction,
): BlockRound {
  if (round.finished || !validBlockAction(action)) return round;
  const current = round.game;
  let game = current,
    frames = round.undoFrames,
    assisted = round.assisted;
  let swapUsed = round.swapUsed,
    reviveUsed = round.reviveUsed,
    finished = false;
  switch (action.type) {
    case "place": {
      game = playBlockFit(current, {
        slot: action.slot,
        anchor: action.anchor,
      });
      if (game === current) return round;
      frames = [...frames, current];
      break;
    }
    case "swap": {
      const tray = previewBlockSwap(round);
      if (!tray) return round;
      game = { ...current, tray, over: !blockHasMove(current.board, tray) };
      frames = [...frames, current];
      assisted = true;
      swapUsed = true;
      break;
    }
    case "revive": {
      const preview = previewBlockRevive(round, action.anchor);
      if (!preview?.cleared.length || !preview.canMove) return round;
      game = { ...current, board: preview.board, over: false };
      frames = [...frames, current];
      assisted = true;
      reviveUsed = true;
      break;
    }
    case "undo": {
      if (!canUndoBlockRound(round)) return round;
      game = frames[frames.length - 1];
      frames = frames.slice(0, -1);
      assisted = true;
      // Helper allowances are one per attempt, even if their board effect is undone.
      break;
    }
    case "finish": {
      if (!current.over) return round;
      finished = true;
      break;
    }
  }
  const clean: BlockAction =
    action.type === "place"
      ? { type: "place", slot: action.slot, anchor: action.anchor }
      : action.type === "revive"
        ? { type: "revive", anchor: action.anchor }
        : { type: action.type };
  return {
    ...round,
    game,
    actions: [...round.actions, clean],
    undoFrames: frames,
    assisted,
    swapUsed,
    reviveUsed,
    finished,
  };
}
export function replayBlockRound(
  id: string,
  seed: string,
  day: string | null,
  actions: unknown,
): BlockRound | null {
  if (!Array.isArray(actions) || actions.length > BLOCK_SAVE_ACTION_LIMIT)
    return null;
  try {
    let round = newBlockRound(id, seed, day);
    for (const action of actions) {
      if (!validBlockAction(action)) return null;
      const next = actBlockRound(round, action);
      if (next === round) return null;
      round = next;
    }
    return round;
  } catch {
    return null;
  }
}
export function restartBlockRound(round: BlockRound, id: string): BlockRound {
  if (id === round.id) throw Error("Restart needs a new attempt identity");
  return newBlockRound(id, round.seed, round.day);
}
export function encodeBlockRound(round: BlockRound): string {
  return JSON.stringify({
    version: 1,
    id: round.id,
    seed: round.seed,
    day: round.day,
    actions: round.actions,
  });
}
export function decodeBlockRound(raw: unknown): BlockRound | null {
  if (typeof raw !== "string" || raw.length > MAX_SAVE_LENGTH) return null;
  try {
    const v = JSON.parse(raw);
    if (!v || v.version !== 1 || (v.day !== null && !validBlockDay(v.day)))
      return null;
    return replayBlockRound(v.id, v.seed, v.day, v.actions);
  } catch {
    return null;
  }
}
export function readBlockRound(
  storage?: Pick<Storage, "getItem">,
): BlockRound | null {
  try {
    return decodeBlockRound((storage ?? localStorage).getItem(blockSaveKey));
  } catch {
    return null;
  }
}
export function writeBlockRound(
  round: BlockRound,
  storage?: Pick<Storage, "setItem">,
): boolean {
  try {
    if (round.actions.length > BLOCK_SAVE_ACTION_LIMIT) return false;
    const raw = encodeBlockRound(round);
    if (raw.length > MAX_SAVE_LENGTH) return false;
    (storage ?? localStorage).setItem(blockSaveKey, raw);
    return true;
  } catch {
    return false;
  }
}
export function blockInitialRound(
  navigation: unknown,
  saved = readBlockRound(),
): BlockRound | null {
  const carry = decodeBlockRound(navigation);
  if (!carry) return saved;
  if (saved?.id === carry.id && saved.actions.length >= carry.actions.length)
    return saved;
  return carry;
}
