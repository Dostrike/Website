import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
const exports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/utils/checkersEngine.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  { exports },
);
const {
  newCheckers,
  checkersPosition,
  checkersLegal,
  playCheckers,
  replayCheckers,
  chooseCheckers,
  checkersDaily,
} = exports;
const plain = (x) => JSON.parse(JSON.stringify(x));
const dark = (king = false) => ({ side: "dark", king }),
  light = (king = false) => ({ side: "light", king });
const position = (pieces, turn = "dark", quiet = 0) => {
  const b = Array(64).fill(null);
  for (const [i, p] of pieces) b[i] = p;
  return checkersPosition(b, turn, quiet);
};
const initial = newCheckers();
assert.equal(initial.board.filter(Boolean).length, 24);
assert.equal(checkersLegal(initial.board, "dark").length, 7);
for (const path of [
  [40, 49],
  [40, 24],
  [40, 33, 26],
  [-1, 0],
  [40, 40],
  [40, NaN],
])
  assert.equal(playCheckers(initial, path), initial);
const forced = position([
  [40, dark()],
  [44, dark()],
  [33, light()],
  [19, light()],
  [7, light()],
]);
assert.deepEqual(
  plain(checkersLegal(forced.board, "dark").map((m) => m.path)),
  [[40, 26, 12]],
);
assert.equal(playCheckers(forced, [40, 26]), forced);
assert.equal(playCheckers(forced, [44, 35]), forced);
const jumped = playCheckers(forced, [40, 26, 12]);
assert.equal(jumped.board[33], null);
assert.equal(jumped.board[19], null);
assert.equal(forced.board[33].side, "light");
// Two branches, unequal lengths: no longest-capture obligation.
const branch = position([
  [42, dark()],
  [33, light()],
  [35, light()],
  [21, light()],
  [7, light()],
]);
assert.deepEqual(
  plain(checkersLegal(branch.board, "dark").map((m) => m.path)),
  [
    [42, 24],
    [42, 28, 14],
  ],
);
// Crowning ends this turn, although the new king would have a reverse jump.
const promotion = position([
  [17, dark()],
  [10, light()],
  [12, light()],
  [55, light()],
]);
assert.deepEqual(
  plain(checkersLegal(promotion.board, "dark").map((m) => m.path)),
  [[17, 3]],
);
const crowned = playCheckers(promotion, [17, 3]);
assert.equal(crowned.board[3].king, true);
assert.equal(crowned.board[12].side, "light");
assert.equal(crowned.turn, "light");
const king = position([
  [26, dark(true)],
  [55, light()],
]);
assert.equal(checkersLegal(king.board, "dark").length, 4);
const backward = position([
  [26, dark()],
  [33, light()],
  [55, light()],
]);
assert(!checkersLegal(backward.board, "dark").some((m) => m.path.at(-1) > 26));
assert.equal(
  position(
    [
      [62, dark(true)],
      [55, light()],
    ],
    "light",
  ).winner,
  "dark",
);
const last = position([
  [26, dark()],
  [17, light()],
]);
assert.equal(playCheckers(last, [26, 8]).winner, "dark");
assert.equal(
  position(
    [
      [26, dark(true)],
      [55, light(true)],
    ],
    "dark",
    80,
  ).winner,
  "draw",
);
const quiet = position(
  [
    [26, dark(true)],
    [55, light(true)],
  ],
  "dark",
  79,
);
assert.equal(playCheckers(quiet, [26, 17]).winner, "draw");
const man = position(
  [
    [26, dark()],
    [55, light(true)],
  ],
  "dark",
  79,
);
assert.equal(playCheckers(man, [26, 17]).quiet, 0);
const cycle = position([
  [40, dark(true)],
  [23, light(true)],
]);
const repeated = replayCheckers(cycle, [
  [40, 33],
  [23, 30],
  [33, 40],
  [30, 23],
  [40, 33],
  [23, 30],
  [33, 40],
  [30, 23],
]);
assert.equal(repeated.winner, "draw");
assert.equal(playCheckers(repeated, [40, 33]), repeated);
assert.throws(() =>
  replayCheckers(initial, [
    [40, 33],
    [40, 33],
  ]),
);
let captures = 0,
  kings = 0,
  maxMs = 0;
for (let n = 0; n < 6; n++) {
  let state = newCheckers();
  let seed = n + 1;
  const rng = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 400 && !state.over; i++) {
    const legal = checkersLegal(state.board, state.turn),
      before = JSON.stringify(state),
      start = performance.now();
    const move =
      n < 2
        ? chooseCheckers(state, n === 0 ? "medium" : "hard", rng)
        : legal[Math.floor(rng() * legal.length)];
    maxMs = Math.max(maxMs, performance.now() - start);
    assert(move);
    captures += move.captures.length;
    const next = playCheckers(state, move.path);
    assert.notEqual(next, state);
    assert.equal(JSON.stringify(state), before);
    state = next;
  }
  assert(state.over, `game ${n} unfinished`);
  kings += state.board.filter((p) => p?.king).length;
  assert.deepEqual(
    plain(replayCheckers(newCheckers(), state.moves)),
    plain(state),
  );
}
for (let n = 1; n <= 64; n++) {
  const day = `2026-${n > 31 ? "12" : "11"}-${String(((n - 1) % 28) + 1).padStart(2, "0")}`;
  const daily = checkersDaily(day);
  assert.equal(daily.moves.length, 8);
  assert.equal(daily.turn, "dark");
  assert(!daily.over);
  assert.deepEqual(plain(daily), plain(checkersDaily(day)));
}
console.log(
  `Checkers passed: compulsory complete/branch captures, promotion stop, king directions, blocked/captured loss, 80-half-move/reset/repetition draws, immutable replay, daily starts and six completed AI/random games (${captures} captures, ${kings} surviving kings, slowest choice ${Math.round(maxMs)}ms).`,
);
