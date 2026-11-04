import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { performance } from "node:perf_hooks";
const exports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/utils/colourSortEngine.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  { exports },
);
const e = exports,
  plain = (x) => JSON.parse(JSON.stringify(x));
// Independent unit-at-a-time reference, rather than reusing the run-length implementation.
function reference(b, from, to) {
  if (from === to || !b[from]?.length || !b[to] || b[to].length === 4)
    return null;
  const c = b[from].at(-1);
  if (b[to].length && b[to].at(-1) !== c) return null;
  const out = b.map((t) => t.slice());
  let count = 0;
  while (out[from].at(-1) === c && out[to].length < 4) {
    out[to].push(out[from].pop());
    count++;
  }
  return { board: out, amount: count, colour: c };
}
const tubes = [[]];
for (let len = 1; len <= 4; len++)
  for (let bits = 0; bits < 2 ** len; bits++)
    tubes.push(Array.from({ length: len }, (_, i) => 1 + ((bits >> i) & 1)));
let cases = 0;
for (const a of tubes)
  for (const b of tubes) {
    const input = [a, b],
      before = JSON.stringify(input);
    assert.deepEqual(plain(e.pourColour(input, 0, 1)), reference(input, 0, 1));
    assert.equal(JSON.stringify(input), before);
    cases++;
  }
assert.deepEqual(
  plain(
    e.pourColour(
      [
        [2, 1, 1, 1],
        [1, 1, 1],
      ],
      0,
      1,
    ),
  ),
  {
    board: [
      [2, 1, 1],
      [1, 1, 1, 1],
    ],
    amount: 1,
    colour: 1,
  },
);
assert.equal(e.pourColour([[1], []], 0, 0), null);
assert.equal(e.pourColour([[1], []], -1, 1), null);
assert.equal(e.pourColour([[8], []], 0, 1), null);
assert(!e.colourSolved([[1, 1], []]));
assert(!e.colourSolved([[], []]));
assert(e.colourSolved([[1, 1, 1, 1], [], []]));
assert(!e.colourSolved([[1, 1, 1, 2], []]));
let count = 0,
  steps = 0,
  slowest = 0,
  minWitness = Infinity,
  maxWitness = 0,
  mixedMin = Infinity;
for (const colours of [3, 5, 7])
  for (let n = 0; n < 60; n++) {
    const seed = `colour-proof:${colours}:${n}`,
      start = performance.now(),
      p = e.generateColourPuzzle(seed, colours);
    slowest = Math.max(slowest, performance.now() - start);
    assert(e.validColourInventory(p.board, colours));
    assert(!e.colourSolved(p.board));
    assert.deepEqual(plain(p), plain(e.generateColourPuzzle(seed, colours)));
    const original = JSON.stringify(p);
    let board = plain(p.board),
      state = e.newColourState(p);
    const inventory = (b) => b.flat().sort((a, b) => a - b);
    const mixed = p.board.filter((t) => new Set(t).size > 1).length;
    mixedMin = Math.min(mixedMin, mixed);
    assert.equal(mixed, colours, "Every full colour tube must be mixed");
    assert.equal(
      p.board.filter((t) => !t.length).length,
      2,
      "Retain two empty tubes",
    );
    for (const move of p.solution) {
      const expected = reference(board, move.from, move.to);
      assert(expected, "Certificate contains illegal reference move");
      assert.deepEqual(inventory(expected.board), inventory(board));
      const next = e.playColour(state, move);
      assert.notEqual(next, state);
      assert.deepEqual(plain(next.board), expected.board);
      assert.deepEqual(plain(e.undoColour(next)), plain(state));
      board = expected.board;
      state = next;
      steps++;
    }
    assert(e.colourSolved(board));
    assert(
      board.every(
        (t) => !t.length || (t.length === 4 && t.every((c) => c === t[0])),
      ),
      "Reference replay must end in full single-colour tubes",
    );
    assert(state.solved);
    assert.equal(e.playColour(state, { from: 0, to: 1 }), state);
    assert.equal(JSON.stringify(p), original);
    assert.deepEqual(plain(e.replayColour(p, p.solution)), plain(state));
    assert.throws(() => e.replayColour(p, [{ from: 0, to: 0 }]));
    assert.throws(() => e.replayColour(p, [...p.solution, { from: 0, to: 1 }]));
    minWitness = Math.min(minWitness, p.solution.length);
    maxWitness = Math.max(maxWitness, p.solution.length);
    count++;
  }
assert.throws(() => e.generateColourPuzzle("", 3));
assert.throws(() => e.generateColourPuzzle("x", 4));
assert(!e.validColourInventory([[1, 1, 1, 1], [], [], [], []], 3));
console.log(
  `Colour Sort: ${cases} independent pour cases; ${count} deterministic solvable puzzles, ${steps} witness moves, witness lengths ${minWitness}–${maxWitness}, minimum mixed tubes ${mixedMin}, slowest generation ${Math.round(slowest)}ms. Conservation, exact undo/replay, illegal actions and post-solve rejection pass.`,
);
