import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const exports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/utils/reversiEngine.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  { exports },
);
const {
  newReversi,
  reversiFlips,
  reversiLegalMoves,
  playReversi,
  passReversi,
  replayReversi,
  reversiCounts,
  chooseReversiMove,
  reversiDaily,
  reversiUndoIndex,
} = exports;
const plain = (value) => JSON.parse(JSON.stringify(value));
const coordinate = (point) =>
  "ABCDEFGH".indexOf(point[0]) + (Number(point[1]) - 1) * 8;
const initial = newReversi();
assert.deepEqual(plain(reversiCounts(initial.board)), {
  black: 2,
  white: 2,
  empty: 60,
});
assert.deepEqual(
  plain(reversiLegalMoves(initial.board, "black")),
  [19, 26, 37, 44],
);
// World Othello Federation sample: Black C4, then White may choose C3, E3 or C5.
const first = playReversi(initial, coordinate("C4"));
assert.deepEqual(plain(reversiCounts(first.board)), {
  black: 4,
  white: 1,
  empty: 59,
});
assert.deepEqual(plain(reversiLegalMoves(first.board, "white")), [
  coordinate("C3"),
  coordinate("E3"),
  coordinate("C5"),
]);
assert.equal(initial.board[26], null);
assert.equal(passReversi(initial), initial);
for (const index of [-2, 64, 2.5, NaN, 27, 0])
  assert.equal(playReversi(initial, index), initial);
// All eight rays must flip, but disconnected lines and row wrapping must not.
const rays = Array(64).fill(null),
  centre = 27;
for (const [dr, dc] of [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]) {
  rays[(3 + dr) * 8 + 3 + dc] = "white";
  rays[(3 + dr * 2) * 8 + 3 + dc * 2] = "black";
}
assert.equal(reversiFlips(rays, centre, "black").length, 8);
const lesson = Array(64).fill(null);
lesson[26] = "white";
lesson[19] = "white";
lesson[25] = "black";
lesson[11] = "black";
assert.deepEqual(
  plain(reversiFlips(lesson, 27, "black").sort((a, b) => a - b)),
  [19, 26],
);
const wrap = Array(64).fill(null);
wrap[7] = "white";
wrap[8] = "black";
assert.equal(reversiFlips(wrap, 6, "black").length, 0);
const blocked = Array(64).fill(null);
blocked[1] = "black";
blocked[2] = "white";
blocked[3] = "black";
assert.equal(reversiFlips(blocked, 0, "black").length, 0);
// A legal last placement can end a game with many empty squares.
const early = { ...newReversi(), board: Array(64).fill(null) };
early.board[0] = "black";
early.board[1] = "white";
const ended = playReversi(early, 2);
assert.equal(ended.over, true);
assert.equal(ended.winner, "black");
assert.equal(reversiCounts(ended.board).empty, 61);
assert.equal(playReversi(ended, 3), ended);
assert.equal(passReversi(ended), ended);
// Pass is mandatory when only the other side can play.
const passState = {
  ...newReversi(),
  board: Array(64).fill("black"),
  turn: "white",
};
passState.board[0] = null;
passState.board[1] = "white";
assert.equal(reversiLegalMoves(passState.board, "white").length, 0);
assert.deepEqual(plain(reversiLegalMoves(passState.board, "black")), [0]);
const passed = passReversi(passState);
assert.equal(passed.turn, "black");
assert.equal(passed.passed, "white");
assert.equal(passed.moves[0], -1);
assert.equal(playReversi(passed, 0).winner, "black");
const drawBoard = Array.from({ length: 64 }, (_, i) =>
  i % 2 ? "white" : "black",
);
const drawn = passReversi({ ...newReversi(), board: drawBoard });
assert.equal(drawn.over, true);
assert.equal(drawn.winner, "draw");
assert.throws(() => replayReversi([-1]));
assert.throws(() => replayReversi([0]));
assert.throws(() => replayReversi([26, 26]));
let forcedPasses = 0,
  maxTime = 0;
for (let game = 0; game < 9; game++) {
  let state = newReversi();
  const level = ["easy", "medium", "hard"][game % 3];
  let randomSeed = game + 1;
  for (let turn = 0; turn < 120 && !state.over; turn++) {
    const before = JSON.stringify(state);
    const legal = reversiLegalMoves(state.board, state.turn);
    if (!legal.length) {
      assert.equal(chooseReversiMove(state, level), null);
      state = passReversi(state);
      forcedPasses++;
      continue;
    }
    const started = performance.now();
    const move = chooseReversiMove(state, level, () => {
      randomSeed = (Math.imul(randomSeed, 1664525) + 1013904223) >>> 0;
      return randomSeed / 4294967296;
    });
    maxTime = Math.max(maxTime, performance.now() - started);
    assert(legal.includes(move));
    assert.equal(JSON.stringify(state), before, "AI must not mutate the board");
    const next = playReversi(state, move);
    assert.equal(
      reversiCounts(next.board).empty,
      reversiCounts(state.board).empty - 1,
    );
    state = next;
  }
  assert(state.over);
  assert.equal(chooseReversiMove(state, level), null);
  assert.equal(
    JSON.stringify(replayReversi(state.moves)),
    JSON.stringify(state),
  );
  for (const side of ["black", "white"]) {
    const cut = reversiUndoIndex(state.moves, side);
    assert(cut >= 0);
    const previous = replayReversi(state.moves.slice(0, cut));
    assert.equal(previous.turn, side);
    assert.notEqual(state.moves[cut], -1);
  }
}
for (let fixture = 1; fixture <= 24; fixture++) {
  let state = newReversi(),
    seed = fixture * 827;
  while (!state.over) {
    const legal = reversiLegalMoves(state.board, state.turn);
    if (!legal.length) {
      state = passReversi(state);
      forcedPasses++;
    } else {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      state = playReversi(state, legal[seed % legal.length]);
    }
  }
  assert.equal(
    JSON.stringify(replayReversi(state.moves)),
    JSON.stringify(state),
  );
  for (const side of ["black", "white"]) {
    const cut = reversiUndoIndex(state.moves, side);
    assert(cut >= 0);
    const previous = replayReversi(state.moves.slice(0, cut));
    assert.equal(previous.turn, side);
    assert.notEqual(state.moves[cut], -1);
  }
}
assert(
  forcedPasses > 0,
  "Complete replay fixtures must exercise genuine forced passes",
);
for (let day = 1; day <= 64; day++) {
  const key = `2026-fixture-${day}`;
  const state = reversiDaily(key);
  assert.equal(state.over, false);
  assert.equal(state.moves.length, 6);
  assert.equal(reversiUndoIndex(state.moves, "black", 6), -1);
  assert.equal(state.turn, "black");
  assert(reversiLegalMoves(state.board, "black").length > 0);
  assert.equal(JSON.stringify(state), JSON.stringify(reversiDaily(key)));
  assert.equal(
    JSON.stringify(replayReversi(state.moves)),
    JSON.stringify(state),
  );
}
console.log(
  `Reversi passed: official opening/reply, eight rays, edges, mandatory passes, early end, draw, invalid actions, immutable replay, 64 daily openings and nine complete AI plus 24 random replay games (${forcedPasses} passes; slowest AI call ${Math.round(maxTime)}ms).`,
);
