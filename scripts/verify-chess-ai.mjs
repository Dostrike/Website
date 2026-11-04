import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createRequire } from "node:module";
import { Chess } from "chess.js";
const nativeRequire = createRequire(import.meta.url),
  modules = {};
function load(name) {
  if (modules[name]) return modules[name];
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(`src/utils/${name}.ts`, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      Date,
      require: (p) =>
        p.startsWith("./") ? load(p.slice(2)) : nativeRequire(p),
    },
  );
  return (modules[name] = exports);
}
const e = load("chessEngine"),
  ai = load("chessAI");
const cases = [
  { levels: ["medium", "easy"], initial: e.newChess(), seed: 23 },
  { levels: ["easy", "hard"], initial: e.newChess(), seed: 317 },
  {
    levels: ["medium", "hard"],
    initial: e.dailyChess("selfplay-verification"),
    seed: 911,
  },
];
const results = [];
for (const test of cases) {
  let state = test.initial;
  const reference = new Chess(state.initialFen);
  for (const move of state.moves) reference.move(move);
  const initial = state.moves.length;
  // Small deterministic verification budget exercises the same bounded algorithm;
  // it is not the default UI budget and does not establish opponent strength.
  for (let ply = 0; ply < 600 && !state.result; ply++) {
    const before = JSON.stringify(state);
    const choice = ai.chooseChessMove(
      state,
      test.levels[state.turn === "w" ? 0 : 1],
      test.seed + ply,
      { maxNodes: 300, maxDepth: 2, maxTimeMs: 10000 },
    );
    assert.equal(JSON.stringify(state), before);
    assert(
      choice.move &&
        state.legal.some(
          (move) => e.chessPlyKey(move) === e.chessPlyKey(choice.move),
        ),
    );
    assert(choice.nodes <= 300);
    reference.move(choice.move);
    state = e.playChess(state, choice.move);
    assert(state);
    assert.equal(state.fen, reference.fen());
    assert.equal(!!state.result, reference.isGameOver());
  }
  assert(
    state.result,
    `Unfinished self-play after600plies; no draw manufactured for ${test.levels}`,
  );
  const resumed = e.replayChess(state.moves, state.initialFen);
  assert.equal(resumed.result.reason, state.result.reason);
  results.push({
    levels: test.levels,
    plies: state.moves.length - initial,
    outcome: state.result,
  });
  console.log(JSON.stringify(results[results.length - 1]));
}
const began = Date.now(),
  hard = ai.chooseChessMove(e.newChess(), "hard", 100);
assert(hard.nodes <= 60000 && hard.depth <= 4 && hard.move);
console.log(
  JSON.stringify({
    completeSelfPlayGames: results.length,
    verificationNodes: 300,
    defaultHardSample: {
      elapsedMs: Date.now() - began,
      nodes: hard.nodes,
      depth: hard.depth,
      budgetHit: hard.budgetHit,
    },
    note: "Observed runtime sample only; bounded self-play is not an Elo or perfect-play claim.",
  }),
);
