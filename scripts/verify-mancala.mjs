import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
const exports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/utils/mancalaEngine.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  { exports },
);
const {
  newMancala,
  mancalaPosition,
  mancalaTotal,
  mancalaPits,
  mancalaLegalMoves,
  playMancala,
  replayMancala,
  mancalaUndoIndex,
  chooseMancalaMove,
  mancalaDaily,
} = exports;
const plain = (value) => JSON.parse(JSON.stringify(value));
for (const seeds of [3, 4, 5, 6])
  assert.equal(mancalaTotal(newMancala(seeds).board), 12 * seeds);
for (const invalid of [0, 2, 7, 4.5]) assert.throws(() => newMancala(invalid));
const initial = newMancala();
for (const pit of [-1, 14, 6, 13, 7, 1.5, NaN])
  assert.equal(playMancala(initial, pit), initial);
const extra = playMancala(initial, 2);
assert.equal(extra.turn, 0);
assert.equal(extra.last.extraTurn, true);
assert.equal(extra.board[6], 1);
assert.equal(initial.board[2], 4);
const capture = mancalaPosition([1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 5, 1, 0]);
const captured = playMancala(capture, 0);
assert.equal(captured.last.captured, 6);
assert.equal(captured.board[6], 6);
assert.equal(captured.board[1], 0);
assert.equal(captured.board[11], 0);
const noOpposite = mancalaPosition([1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0]);
const uncaptured = playMancala(noOpposite, 0);
assert.equal(uncaptured.last.captured, 0);
assert.equal(uncaptured.board[1], 1);
const long = mancalaPosition([26, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0]);
const lapped = playMancala(long, 0);
assert.equal(lapped.last.path.length, 26);
assert(!lapped.last.path.includes(13));
assert.equal(lapped.board[13], 0);
assert(lapped.last.path.filter((pit) => pit === 6).length === 2);
assert.equal(mancalaTotal(lapped.board), mancalaTotal(long.board));
const north = mancalaPosition([1, 1, 1, 1, 1, 1, 0, 26, 1, 1, 1, 1, 1, 0], 1);
assert(!playMancala(north, 7).last.path.includes(6));
const ending = mancalaPosition([0, 0, 0, 0, 0, 1, 20, 1, 1, 1, 1, 1, 1, 21]);
const ended = playMancala(ending, 5);
assert.equal(ended.over, true);
assert.equal(ended.winner, 1);
assert.equal(ended.board[13], 27);
assert.equal(ended.last.extraTurn, false);
assert.deepEqual(plain(ended.last.swept), [0, 6]);
assert.equal(playMancala(ended, 7), ended);
const draw = mancalaPosition([0, 0, 0, 0, 0, 1, 23, 1, 1, 1, 1, 1, 1, 18]);
assert.equal(playMancala(draw, 5).winner, "draw");
assert.throws(() => replayMancala(initial, [6]));
assert.throws(() => replayMancala(initial, [2, 7]));
const chain = replayMancala(initial, [2, 5]);
assert.equal(mancalaUndoIndex(initial, chain.moves, 0), 1);
assert.equal(mancalaUndoIndex(initial, chain.moves, 1), -1);
let captures = 0,
  extras = 0,
  maxTime = 0;
for (let game = 0; game < 12; game++) {
  const seeds = 3 + (game % 4),
    start = newMancala(seeds, game % 2),
    total = mancalaTotal(start.board);
  let state = start,
    seed = game + 1;
  for (let turn = 0; turn < 500 && !state.over; turn++) {
    const difficulty = game < 4 ? "easy" : game < 8 ? "medium" : "hard";
    const before = JSON.stringify(state),
      started = performance.now();
    const move = chooseMancalaMove(state, difficulty, () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    });
    maxTime = Math.max(maxTime, performance.now() - started);
    assert(mancalaLegalMoves(state).includes(move));
    assert.equal(JSON.stringify(state), before);
    const next = playMancala(state, move);
    assert.equal(mancalaTotal(next.board), total);
    assert(
      next.board.every((value) => Number.isSafeInteger(value) && value >= 0),
    );
    if (next.last.captured) captures++;
    if (next.last.extraTurn) extras++;
    state = next;
  }
  assert(state.over, "Game must finish within test bound");
  assert.equal(state.board[6] + state.board[13], total);
  assert.equal(chooseMancalaMove(state, "hard"), null);
  assert.equal(
    JSON.stringify(replayMancala(start, state.moves)),
    JSON.stringify(state),
  );
  for (const side of [0, 1]) {
    const index = mancalaUndoIndex(start, state.moves, side);
    if (index >= 0)
      assert.equal(
        replayMancala(start, state.moves.slice(0, index)).turn,
        side,
      );
  }
}
for (let day = 1; day <= 64; day++) {
  const key = `2026-fixture-${day}`,
    daily = mancalaDaily(key);
  assert.equal(daily.over, false);
  assert.equal(daily.turn, 0);
  assert.equal(mancalaTotal(daily.board), 48);
  assert.deepEqual(
    plain(mancalaPits(0).map((pit) => daily.board[pit])),
    plain(mancalaPits(1).map((pit) => daily.board[pit])),
  );
  assert(!mancalaPits(0).every((pit) => daily.board[pit] === 4));
  assert.equal(JSON.stringify(daily), JSON.stringify(mancalaDaily(key)));
}
console.log(
  `Kalah passed: 3–6 seed setup, extra turns, non-empty capture/no-empty variant, both skipped stores, multi-laps, terminal sweep/draw, immutable replay/undo, 64 symmetric daily starts and twelve complete AI games (${captures} captures, ${extras} extra turns; slowest search ${Math.round(maxTime)}ms).`,
);
