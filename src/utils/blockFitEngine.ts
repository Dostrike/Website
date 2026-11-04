/** Original fixed-orientation block-placement rules; no external game code or assets. */
export const BLOCK_SIDE = 8;
export const BLOCK_SHAPES = [
  { id: "single", cells: [[0, 0]] },
  {
    id: "pair-across",
    cells: [
      [0, 0],
      [0, 1],
    ],
  },
  {
    id: "pair-down",
    cells: [
      [0, 0],
      [1, 0],
    ],
  },
  {
    id: "three-across",
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
  },
  {
    id: "three-down",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
  },
  {
    id: "elbow-se",
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: "elbow-ne",
    cells: [
      [0, 0],
      [0, 1],
      [1, 0],
    ],
  },
  {
    id: "elbow-nw",
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
    ],
  },
  {
    id: "elbow-sw",
    cells: [
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: "square",
    cells: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: "four-across",
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  },
  {
    id: "four-down",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
  },
  {
    id: "tee-down",
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 1],
    ],
  },
  {
    id: "tee-up",
    cells: [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  },
  {
    id: "step-east",
    cells: [
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: "step-west",
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  },
  {
    id: "five-across",
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  },
  {
    id: "five-down",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ],
  },
  {
    id: "cross",
    cells: [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 1],
    ],
  },
  {
    id: "cup",
    cells: [
      [0, 0],
      [0, 2],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  },
] as const;
export type BlockMove = { slot: number; anchor: number };
export type BlockPreview = {
  board: number[];
  placed: number[];
  rows: number[];
  columns: number[];
  cleared: number[];
  combo: number;
  points: number;
};
export type BlockGame = {
  seed: string;
  board: number[];
  tray: (number | null)[];
  trayIndex: number;
  score: number;
  combo: number;
  over: boolean;
  moves: BlockMove[];
};
function validSide(side: number) {
  return Number.isInteger(side) && side >= 1 && side <= BLOCK_SIDE;
}
export function validBlockBoard(board: readonly number[], side = BLOCK_SIDE) {
  return (
    validSide(side) &&
    Array.isArray(board) &&
    board.length === side * side &&
    Array.from(board).every(
      (n) => Number.isInteger(n) && n >= 0 && n <= BLOCK_SHAPES.length,
    )
  );
}
/** The anchor is the bounding box's top-left, even for shapes missing that cell. */
export function blockCells(
  shape: number,
  anchor: number,
  side = BLOCK_SIDE,
): number[] | null {
  if (
    !validSide(side) ||
    !Number.isInteger(shape) ||
    shape < 0 ||
    shape >= BLOCK_SHAPES.length ||
    !Number.isInteger(anchor) ||
    anchor < 0 ||
    anchor >= side * side
  )
    return null;
  const row = Math.floor(anchor / side),
    col = anchor % side;
  const cells: number[] = [];
  for (const [dr, dc] of BLOCK_SHAPES[shape].cells) {
    if (row + dr >= side || col + dc >= side) return null;
    cells.push((row + dr) * side + col + dc);
  }
  return cells;
}
export function blockAnchors(
  board: readonly number[],
  shape: number,
  side = BLOCK_SIDE,
): number[] {
  if (!validBlockBoard(board, side)) return [];
  const anchors: number[] = [];
  for (let anchor = 0; anchor < board.length; anchor++) {
    const cells = blockCells(shape, anchor, side);
    if (cells && cells.every((cell) => board[cell] === 0)) anchors.push(anchor);
  }
  return anchors;
}
export function previewBlock(
  board: readonly number[],
  shape: number,
  anchor: number,
  combo: number,
  side = BLOCK_SIDE,
): BlockPreview | null {
  if (
    !validBlockBoard(board, side) ||
    !Number.isInteger(combo) ||
    combo < 0 ||
    combo > 5
  )
    return null;
  const placed = blockCells(shape, anchor, side);
  if (!placed || placed.some((cell) => board[cell] !== 0)) return null;
  const next = [...board];
  for (const cell of placed) next[cell] = shape + 1;
  const rows: number[] = [],
    columns: number[] = [];
  for (let n = 0; n < side; n++) {
    if (next.slice(n * side, (n + 1) * side).every(Boolean)) rows.push(n);
    if (
      Array.from({ length: side }, (_, r) => next[r * side + n]).every(Boolean)
    )
      columns.push(n);
  }
  const cleared = next.flatMap((_, cell) =>
    rows.includes(Math.floor(cell / side)) || columns.includes(cell % side)
      ? [cell]
      : [],
  );
  for (const cell of cleared) next[cell] = 0;
  const lines = rows.length + columns.length;
  const nextCombo = lines ? Math.min(5, combo + 1) : 0;
  return {
    board: next,
    placed,
    rows,
    columns,
    cleared,
    combo: nextCombo,
    points: placed.length + 10 * lines * nextCombo,
  };
}
function hash(seed: string): number {
  let value = 2166136261;
  for (let i = 0; i < seed.length; i++)
    value = Math.imul(value ^ seed.charCodeAt(i), 16777619);
  return value >>> 0;
}
function validSeed(seed: unknown): seed is string {
  return typeof seed === "string" && seed.length > 0 && seed.length <= 128;
}
/** v1 tray stream is independent of board, score and attempt identity. */
export function blockTray(seed: string, index: number): number[] {
  if (!validSeed(seed) || !Number.isSafeInteger(index) || index < 0)
    throw new Error("Invalid Block Fit stream identity");
  let rng = hash(JSON.stringify(["dostrike-block-fit:v1", seed, index]));
  const random = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng / 4294967296;
  };
  const maxCells = index < 4 ? 3 : index < 12 ? 4 : 5;
  const pool = BLOCK_SHAPES.flatMap((shape, i) =>
    i && shape.cells.length <= maxCells ? [i] : [],
  );
  const tray = [
    0,
    pool[Math.floor(random() * pool.length)],
    pool[Math.floor(random() * pool.length)],
  ];
  for (let i = 2; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [tray[i], tray[j]] = [tray[j], tray[i]];
  }
  return tray;
}
export function blockHasMove(
  board: readonly number[],
  tray: readonly (number | null)[],
  side = BLOCK_SIDE,
): boolean {
  if (
    !validBlockBoard(board, side) ||
    !Array.isArray(tray) ||
    tray.length !== 3 ||
    !Array.from(tray).every(
      (shape) =>
        shape === null ||
        (Number.isInteger(shape) && shape >= 0 && shape < BLOCK_SHAPES.length),
    )
  )
    return false;
  return tray.some(
    (shape) => shape !== null && blockAnchors(board, shape, side).length > 0,
  );
}
export function newBlockFit(seed: string): BlockGame {
  return {
    seed,
    board: Array(BLOCK_SIDE * BLOCK_SIDE).fill(0),
    tray: blockTray(seed, 0),
    trayIndex: 0,
    score: 0,
    combo: 0,
    over: false,
    moves: [],
  };
}
export function validBlockMove(move: unknown): move is BlockMove {
  if (!move || typeof move !== "object" || Array.isArray(move)) return false;
  const m = move as Record<string, unknown>;
  return (
    Object.keys(m).length === 2 &&
    Number.isInteger(m.slot) &&
    (m.slot as number) >= 0 &&
    (m.slot as number) < 3 &&
    Number.isInteger(m.anchor) &&
    (m.anchor as number) >= 0 &&
    (m.anchor as number) < 64
  );
}
/** Only replay-generated positions should enter this transition. */
export function playBlockFit(game: BlockGame, move: BlockMove): BlockGame {
  if (game.over || !validBlockMove(move)) return game;
  const shape = game.tray[move.slot];
  if (shape === null || shape === undefined) return game;
  const preview = previewBlock(game.board, shape, move.anchor, game.combo);
  if (!preview) return game;
  let tray = [...game.tray],
    trayIndex = game.trayIndex;
  tray[move.slot] = null;
  if (tray.every((shape) => shape === null))
    tray = blockTray(game.seed, ++trayIndex);
  return {
    ...game,
    board: preview.board,
    tray,
    trayIndex,
    combo: preview.combo,
    score: game.score + preview.points,
    over: !blockHasMove(preview.board, tray),
    moves: [...game.moves, { slot: move.slot, anchor: move.anchor }],
  };
}
export function replayBlockFit(seed: string, moves: unknown): BlockGame | null {
  if (!validSeed(seed) || !Array.isArray(moves) || moves.length > 20000)
    return null;
  let game = newBlockFit(seed);
  for (const move of moves) {
    if (!validBlockMove(move)) return null;
    const next = playBlockFit(game, move);
    if (next === game) return null;
    game = next;
  }
  return game;
}
export function undoBlockFit(game: BlockGame): BlockGame | null {
  return game.moves.length
    ? replayBlockFit(game.seed, game.moves.slice(0, -1))
    : null;
}
