/** Independent Minesweeper. Logical deductions receive visible numbers, never the mine map. */
export type MineSettings = {
  width: number;
  height: number;
  mines: number;
  noGuess: boolean;
};
export type MineConstraint = { cells: number[]; mines: number };
export type MineDeduction = {
  kind: "safe" | "mine";
  cells: number[];
  rule: "single" | "subset";
  premises: MineConstraint[];
};
export type MineBoard = {
  settings: MineSettings;
  seed: string;
  first: number;
  mines: boolean[];
  numbers: number[];
  certified: boolean;
};
export type MineAction = { type: "reveal" | "flag" | "chord"; index: number };
export type MineState = {
  board: MineBoard;
  revealed: boolean[];
  flags: boolean[];
  over: boolean;
  won: boolean;
  hit: number | null;
  actions: MineAction[];
};
export function validMineSettings(s: MineSettings) {
  return (
    !!s &&
    Number.isInteger(s.width) &&
    Number.isInteger(s.height) &&
    s.width >= 5 &&
    s.height >= 5 &&
    s.width <= 30 &&
    s.height <= 30 &&
    s.width * s.height <= 600 &&
    Number.isInteger(s.mines) &&
    s.mines >= 1 &&
    s.mines <= Math.floor(s.width * s.height * 0.35) &&
    s.mines <= s.width * s.height - 9 &&
    typeof s.noGuess === "boolean"
  );
}
export function mineNeighbours(
  index: number,
  width: number,
  height: number,
): number[] {
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const r = Math.floor(index / width) + dr,
        c = (index % width) + dc;
      if ((dr || dc) && r >= 0 && r < height && c >= 0 && c < width)
        out.push(r * width + c);
    }
  return out;
}
const indexValid = (i: number, n: number) =>
  Number.isInteger(i) && i >= 0 && i < n;
/** Pure public-information inference. Invalid or inconsistent constraints produce no hint. */
export function deduceMines(
  visible: readonly (number | null)[],
  flags: readonly boolean[],
  width: number,
  height: number,
): MineDeduction | null {
  if (visible.length !== width * height || flags.length !== visible.length)
    return null;
  const constraints: MineConstraint[] = [];
  for (let i = 0; i < visible.length; i++)
    if (visible[i] !== null) {
      const number = visible[i]!;
      if (!Number.isInteger(number) || number < 0 || number > 8) return null;
      const neighbours = mineNeighbours(i, width, height),
        cells = neighbours.filter((j) => visible[j] === null && !flags[j]),
        mines = number - neighbours.filter((j) => flags[j]).length;
      if (mines < 0 || mines > cells.length) return null;
      if (cells.length)
        constraints.push({ cells: cells.sort((a, b) => a - b), mines });
    }
  for (const p of constraints) {
    if (p.mines === 0 || p.mines === p.cells.length)
      return {
        kind: p.mines === 0 ? "safe" : "mine",
        cells: p.cells.slice(),
        rule: "single",
        premises: [p],
      };
  }
  for (let i = 0; i < constraints.length; i++)
    for (let j = 0; j < constraints.length; j++) {
      if (i === j) continue;
      const a = constraints[i],
        b = constraints[j];
      if (
        a.cells.length >= b.cells.length ||
        !a.cells.every((c) => b.cells.includes(c))
      )
        continue;
      const cells = b.cells.filter((c) => !a.cells.includes(c)),
        mines = b.mines - a.mines;
      if (mines === 0 || mines === cells.length)
        return {
          kind: mines === 0 ? "safe" : "mine",
          cells,
          rule: "subset",
          premises: [a, b],
        };
    }
  return null;
}
function flood(
  board: MineBoard,
  revealed: boolean[],
  flags: readonly boolean[],
  starts: readonly number[],
): number | null {
  const stack = [...starts];
  let hit: number | null = null;
  while (stack.length) {
    const i = stack.pop()!;
    if (revealed[i] || flags[i]) continue;
    revealed[i] = true;
    if (board.mines[i]) {
      hit ??= i;
      continue;
    }
    if (board.numbers[i] === 0)
      for (const j of mineNeighbours(
        i,
        board.settings.width,
        board.settings.height,
      ))
        if (!revealed[j] && !flags[j]) stack.push(j);
  }
  return hit;
}
export function mineVisible(state: MineState): (number | null)[] {
  return state.revealed.map((r, i) =>
    r && !state.board.mines[i] ? state.board.numbers[i] : null,
  );
}
export function newMineState(board: MineBoard): MineState {
  const revealed = Array(board.mines.length).fill(false) as boolean[],
    flags = revealed.slice();
  flood(board, revealed, flags, [board.first]);
  return {
    board,
    revealed,
    flags,
    over:
      revealed.filter(Boolean).length ===
      revealed.length - board.settings.mines,
    won:
      revealed.filter(Boolean).length ===
      revealed.length - board.settings.mines,
    hit: null,
    actions: [],
  };
}
export function playMines(s: MineState, a: MineAction): MineState {
  if (
    s.over ||
    !indexValid(a.index, s.revealed.length) ||
    !["reveal", "flag", "chord"].includes(a.type)
  )
    return s;
  const revealed = s.revealed.slice(),
    flags = s.flags.slice();
  let hit: number | null = null;
  if (a.type === "flag") {
    if (revealed[a.index]) return s;
    flags[a.index] = !flags[a.index];
  } else if (a.type === "reveal") {
    if (revealed[a.index] || flags[a.index]) return s;
    hit = flood(s.board, revealed, flags, [a.index]);
  } else {
    if (!revealed[a.index] || s.board.numbers[a.index] === 0) return s;
    const around = mineNeighbours(
      a.index,
      s.board.settings.width,
      s.board.settings.height,
    );
    if (around.filter((i) => flags[i]).length !== s.board.numbers[a.index])
      return s;
    const targets = around.filter((i) => !revealed[i] && !flags[i]);
    if (!targets.length) return s;
    hit = flood(s.board, revealed, flags, targets);
  }
  const won =
    hit === null &&
    revealed.filter(Boolean).length ===
      revealed.length - s.board.settings.mines;
  return {
    ...s,
    revealed,
    flags,
    hit,
    won,
    over: hit !== null || won,
    actions: [...s.actions, { ...a }],
  };
}
export function replayMines(
  board: MineBoard,
  actions: readonly MineAction[],
): MineState {
  if (!Array.isArray(actions) || actions.length > 10000)
    throw Error("Invalid history");
  let s = newMineState(board);
  for (const a of actions) {
    if (!a || typeof a !== "object") throw Error("Invalid action");
    const next = playMines(s, a);
    if (next === s) throw Error("Illegal action history");
    s = next;
  }
  return s;
}
/** Proof run: choose actions exclusively from deduceMines; map only resolves safe reveals. */
export function proveMineBoard(board: MineBoard): {
  solved: boolean;
  steps: MineDeduction[];
} {
  let s = newMineState(board);
  const steps: MineDeduction[] = [];
  for (let n = 0; n < board.mines.length && !s.over; n++) {
    const d = deduceMines(
      mineVisible(s),
      s.flags,
      board.settings.width,
      board.settings.height,
    );
    if (!d) break;
    steps.push(d);
    for (const i of d.cells) {
      if (d.kind === "mine") {
        if (!board.mines[i]) throw Error("Unsound mine deduction");
        s = playMines(s, { type: "flag", index: i });
      } else {
        if (board.mines[i]) throw Error("Unsound safe deduction");
        s = playMines(s, { type: "reveal", index: i });
      }
    }
  }
  return { solved: s.won, steps };
}
export function generateMineBoard(
  settings: MineSettings,
  seed: string,
  first: number,
  maxAttempts = 256,
): MineBoard {
  if (
    !validMineSettings(settings) ||
    typeof seed !== "string" ||
    !seed ||
    seed.length > 200 ||
    !indexValid(first, settings.width * settings.height) ||
    !Number.isInteger(maxAttempts) ||
    maxAttempts < 1 ||
    maxAttempts > 1000
  )
    throw Error("Invalid board options");
  let rng = 2166136261;
  for (const ch of `${seed}:${settings.width}:${settings.height}:${settings.mines}:${first}`)
    rng = Math.imul(rng ^ ch.charCodeAt(0), 16777619) >>> 0;
  const random = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng / 4294967296;
  };
  const excluded = new Set([
      first,
      ...mineNeighbours(first, settings.width, settings.height),
    ]),
    available = Array.from(
      { length: settings.width * settings.height },
      (_, i) => i,
    ).filter((i) => !excluded.has(i));
  if (settings.mines > available.length)
    throw Error("Not enough room for safe opening");
  for (
    let attempt = 0;
    attempt < (settings.noGuess ? maxAttempts : 1);
    attempt++
  ) {
    const positions = available.slice();
    for (let i = 0; i < settings.mines; i++) {
      const j = i + Math.floor(random() * (positions.length - i));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    const mines = Array(settings.width * settings.height).fill(
      false,
    ) as boolean[];
    positions.slice(0, settings.mines).forEach((i) => {
      mines[i] = true;
    });
    const numbers = mines.map(
      (_, i) =>
        mineNeighbours(i, settings.width, settings.height).filter(
          (j) => mines[j],
        ).length,
    );
    const board: MineBoard = {
      settings: { ...settings },
      seed,
      first,
      mines,
      numbers,
      certified: false,
    };
    if (!settings.noGuess) return board;
    if (proveMineBoard(board).solved) return { ...board, certified: true };
  }
  throw Error(
    "No board proven solvable within the attempt limit. Retry or choose a new seed.",
  );
}
