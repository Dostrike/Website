import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const exports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/utils/blockFitEngine.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  { exports },
);
const {
  BLOCK_SHAPES: shapes,
  blockCells,
  blockAnchors,
  previewBlock,
  blockTray,
  blockHasMove,
  newBlockFit,
  playBlockFit,
  replayBlockFit,
  undoBlockFit,
  validBlockMove,
  validBlockBoard,
} = exports;
const plain = (value) => JSON.parse(JSON.stringify(value));
function geometry(shape, anchor, side) {
  const top = Math.floor(anchor / side),
    left = anchor % side;
  if (!Number.isInteger(anchor) || anchor < 0 || anchor >= side * side)
    return null;
  const points = Array.from(shapes[shape].cells, ([y, x]) => [
    top + y,
    left + x,
  ]);
  return points.every(([y, x]) => y >= 0 && x >= 0 && y < side && x < side)
    ? points.map(([y, x]) => y * side + x)
    : null;
}
// Separate occupied-coordinate set and line-union reference, without production helpers.
function reference(board, shape, anchor, combo, side) {
  const cells = geometry(shape, anchor, side);
  if (!cells || cells.some((i) => board[i])) return null;
  const occupied = new Set(board.flatMap((n, i) => (n ? [i] : [])));
  for (const i of cells) occupied.add(i);
  const rows = [],
    columns = [],
    clear = new Set();
  for (let line = 0; line < side; line++) {
    const row = [],
      col = [];
    for (let n = 0; n < side; n++) {
      row.push(line * side + n);
      col.push(n * side + line);
    }
    if (row.every((i) => occupied.has(i))) {
      rows.push(line);
      for (const i of row) clear.add(i);
    }
    if (col.every((i) => occupied.has(i))) {
      columns.push(line);
      for (const i of col) clear.add(i);
    }
  }
  for (const i of clear) occupied.delete(i);
  const lines = rows.length + columns.length;
  const multiplier = lines === 0 ? 0 : Math.min(combo + 1, 5);
  return {
    occupied,
    rows,
    columns,
    clear,
    points: cells.length + 10 * lines * multiplier,
    combo: multiplier,
  };
}
const ids = new Set(),
  geometries = new Set();
for (const shape of shapes) {
  assert(!ids.has(shape.id));
  ids.add(shape.id);
  assert(shape.cells.length >= 1 && shape.cells.length <= 5);
  const keys = new Set(shape.cells.map(([r, c]) => `${r}:${c}`));
  assert.equal(keys.size, shape.cells.length);
  assert.equal(Math.min(...shape.cells.map((c) => c[0])), 0);
  assert.equal(Math.min(...shape.cells.map((c) => c[1])), 0);
  const seen = new Set([JSON.stringify(shape.cells[0])]),
    queue = [shape.cells[0]];
  while (queue.length) {
    const [r, c] = queue.pop();
    for (const [y, x] of [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ]) {
      const key = JSON.stringify([y, x]);
      if (keys.has(`${y}:${x}`) && !seen.has(key)) {
        seen.add(key);
        queue.push([y, x]);
      }
    }
  }
  assert.equal(seen.size, shape.cells.length, `Disconnected ${shape.id}`);
  const canonical = [...keys].sort().join("|");
  assert(!geometries.has(canonical), `Duplicate fixed orientation ${shape.id}`);
  geometries.add(canonical);
}
let geometryCases = 0,
  subsetCases = 0,
  legalCases = 0;
for (let side = 1; side <= 8; side++)
  for (let shape = 0; shape < shapes.length; shape++) {
    for (let anchor = -1; anchor <= side * side; anchor++) {
      assert.deepEqual(
        plain(blockCells(shape, anchor, side)),
        geometry(shape, anchor, side),
      );
      geometryCases++;
    }
  }
for (let mask = 0; mask < 512; mask++) {
  const board = Array.from({ length: 9 }, (_, i) =>
    mask & (1 << i) ? (i % shapes.length) + 1 : 0,
  );
  for (let shape = 0; shape < shapes.length; shape++) {
    const anchors = [];
    for (let anchor = 0; anchor < 9; anchor++) {
      const combo = mask % 6,
        expected = reference(board, shape, anchor, combo, 3);
      const before = JSON.stringify(board),
        actual = previewBlock(board, shape, anchor, combo, 3);
      assert.equal(JSON.stringify(board), before, "Preview mutated input");
      assert.equal(actual !== null, expected !== null);
      if (expected) {
        anchors.push(anchor);
        legalCases++;
        assert.deepEqual(
          actual.board.flatMap((n, i) => (n ? [i] : [])).join(","),
          [...expected.occupied].sort((a, b) => a - b).join(","),
        );
        assert.equal(actual.points, expected.points);
        assert.equal(actual.combo, expected.combo);
        assert.deepEqual(plain(actual.rows), expected.rows);
        assert.deepEqual(plain(actual.columns), expected.columns);
        assert.deepEqual(
          plain(actual.cleared),
          [...expected.clear].sort((a, b) => a - b),
        );
      }
      subsetCases++;
    }
    assert.deepEqual(plain(blockAnchors(board, shape, 3)), anchors);
  }
}
const crossing = Array(64).fill(0);
for (let n = 0; n < 8; n++) {
  crossing[3 * 8 + n] = 2;
  crossing[n * 8 + 4] = 3;
}
crossing[28] = 0;
for (let combo = 0; combo <= 5; combo++) {
  const p = previewBlock(crossing, 0, 28, combo);
  assert.equal(p.cleared.length, 15);
  assert.equal(p.board.filter(Boolean).length, 0);
  assert.equal(p.points, 1 + 20 * Math.min(5, combo + 1));
  assert.equal(p.combo, Math.min(5, combo + 1));
  assert.equal(previewBlock(p.board, 0, 0, p.combo).combo, 0);
}
assert.equal(previewBlock(Array(64).fill(0), 1, 7, 0), null, "No row wrapping");
assert.equal(blockCells(-1, 0), null);
assert.equal(blockCells(shapes.length, 0), null);
assert.equal(blockCells(0, 0.5), null);
assert.equal(blockCells(0, 0, 9), null);
assert.equal(validBlockBoard([0]), false);
assert.equal(validBlockBoard(Array(64)), false, "Reject sparse boards");
assert.equal(blockHasMove(Array(64).fill(0), [0, undefined, null]), false);
assert.equal(blockHasMove(Array(64).fill(0), Array(3)), false);
assert.equal(validBlockBoard(Array(64).fill(NaN)), false);
assert.equal(previewBlock(Array(64).fill(0), 0, 0, 6), null);
assert.equal(blockHasMove(Array(64).fill(0), [null, null, null]), false);
assert.equal(blockHasMove(Array(64).fill(1), [0, null, null]), false);
for (const move of [
  null,
  [],
  { slot: 3, anchor: 0 },
  { slot: 0, anchor: -1 },
  { slot: 0, anchor: 64 },
  { slot: 0, anchor: 0, score: 1000 },
])
  assert(!validBlockMove(move));
let rng = 714;
const random = (n) => {
  rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
  return Math.floor((rng / 4294967296) * n);
};
const singleSlots = new Set();
// Versioned stream regression vectors, independent of wall time or attempt IDs.
assert.deepEqual(
  [0, 3, 4, 11, 12, 40].map((index) =>
    plain(blockTray("daily:2026-11-05", index)),
  ),
  [
    [7, 0, 6],
    [8, 0, 4],
    [8, 14, 0],
    [7, 12, 0],
    [1, 0, 7],
    [4, 0, 12],
  ],
);
for (const order of [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
]) {
  let game = newBlockFit("slot-orders");
  for (const slot of order) {
    const anchor = Array.from({ length: 64 }, (_, i) => i).find((a) =>
      reference(game.board, game.tray[slot], a, game.combo, 8),
    );
    assert.notEqual(anchor, undefined);
    const next = playBlockFit(game, { slot, anchor });
    assert.notEqual(next, game);
    if (next.trayIndex === 0)
      assert.equal(
        playBlockFit(next, { slot, anchor: 63 }),
        next,
        "Used slot cannot be replayed",
      );
    game = next;
  }
  assert.equal(game.trayIndex, 1);
  assert.deepEqual(plain(game.tray), plain(blockTray(game.seed, 1)));
}
for (let n = 0; n < 300; n++) {
  const board = Array.from({ length: 64 }, () =>
    random(100) < n % 101 ? random(shapes.length) + 1 : 0,
  );
  const shape = random(shapes.length),
    anchors = [];
  for (let anchor = 0; anchor < 64; anchor++) {
    const ref = reference(board, shape, anchor, n % 6, 8),
      p = previewBlock(board, shape, anchor, n % 6);
    if (!ref) {
      assert.equal(p, null);
      continue;
    }
    anchors.push(anchor);
    assert.equal(p.points, ref.points);
    assert.equal(p.combo, ref.combo);
    assert.equal(
      p.board.flatMap((v, i) => (v ? [i] : [])).join(","),
      [...ref.occupied].sort((a, b) => a - b).join(","),
    );
  }
  assert.deepEqual(plain(blockAnchors(board, shape)), anchors);
  for (let index = 0; index < 30; index++) {
    const tray = blockTray(`seed-${n}`, index);
    assert.equal(tray.length, 3);
    assert.equal(tray.filter((i) => i === 0).length, 1);
    singleSlots.add(tray.indexOf(0));
    assert.deepEqual(plain(tray), plain(blockTray(`seed-${n}`, index)));
    assert(
      tray.every(
        (s) => shapes[s].cells.length <= (index < 4 ? 3 : index < 12 ? 4 : 5),
      ),
    );
    assert.equal(
      blockHasMove(board, tray),
      board.includes(0),
      "Single-cell tray anchor guarantee",
    );
  }
}
assert.equal(singleSlots.size, 3);
assert.throws(() => blockTray("", 0));
assert.throws(() => blockTray("seed", -1));
assert.throws(() => blockTray("seed", 0.5));
assert.throws(() => blockTray("x".repeat(129), 0));
let moves = 0,
  replenishments = 0,
  clears = 0;
for (let n = 0; n < 100; n++) {
  const seed = `complete-${n}`;
  let game = newBlockFit(seed);
  assert.deepEqual(plain(game), plain(newBlockFit(seed)));
  for (let step = 0; step < 2000 && !game.over; step++) {
    const legal = [];
    for (let slot = 0; slot < 3; slot++)
      if (game.tray[slot] !== null) {
        for (let anchor = 0; anchor < 64; anchor++)
          if (reference(game.board, game.tray[slot], anchor, game.combo, 8))
            legal.push({ slot, anchor });
      }
    assert(legal.length);
    const move = legal[random(legal.length)];
    const ref = reference(
      game.board,
      game.tray[move.slot],
      move.anchor,
      game.combo,
      8,
    );
    const before = JSON.stringify(game),
      next = playBlockFit(game, move);
    assert.notEqual(next, game);
    assert.equal(JSON.stringify(game), before);
    assert.equal(next.score, game.score + ref.points);
    assert.equal(next.combo, ref.combo);
    assert.equal(
      next.board.flatMap((v, i) => (v ? [i] : [])).join(","),
      [...ref.occupied].sort((a, b) => a - b).join(","),
    );
    assert.deepEqual(plain(undoBlockFit(next)), plain(game));
    assert.deepEqual(
      plain(playBlockFit(undoBlockFit(next), move)),
      plain(next),
    );
    assert.deepEqual(plain(replayBlockFit(seed, next.moves)), plain(next));
    assert.equal(next.trayIndex, Math.floor(next.moves.length / 3));
    if (next.trayIndex !== game.trayIndex) {
      replenishments++;
      assert.deepEqual(
        plain(next.tray),
        plain(blockTray(seed, next.trayIndex)),
      );
    } else assert.equal(next.tray[move.slot], null);
    if (ref.clear.size) clears++;
    const expectedOver = next.tray.every(
      (s) =>
        s === null ||
        !Array.from({ length: 64 }, (_, a) =>
          reference(next.board, s, a, next.combo, 8),
        ).some(Boolean),
    );
    assert.equal(next.over, expectedOver);
    game = next;
    moves++;
  }
  assert(
    game.over,
    "Bounded random simulation must naturally finish, not manufacture a result",
  );
  assert.equal(playBlockFit(game, { slot: 0, anchor: 0 }), game);
  assert.equal(
    replayBlockFit(seed, [...game.moves, { slot: 0, anchor: 0 }]),
    null,
  );
}
assert.equal(replayBlockFit("seed", [{ slot: 0, anchor: 0, board: [] }]), null);
assert.equal(replayBlockFit("", []), null);
assert.equal(replayBlockFit("seed", null), null);
assert.equal(undoBlockFit(newBlockFit("seed")), null);
console.log(
  `Block Fit passed: ${shapes.length} distinct connected fixed shapes; ${geometryCases} geometry cases;512 small-board subsets/${subsetCases} move cases (${legalCases} legal);300 independent8×8 masks;9000 deterministic trays/single-cell guarantees;100 natural full games/${moves} moves/${replenishments} tray refills/${clears} clearing placements; exact immutable replay/Undo and malformed-input boundaries.`,
);
