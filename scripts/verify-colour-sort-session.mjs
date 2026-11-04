import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
const modules = {};
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
    { exports, Date, require: (p) => load(p.replace("./", "")) },
  );
  return (modules[name] = exports);
}
const e = load("colourSortEngine"),
  s = load("colourSortSession"),
  plain = (x) => JSON.parse(JSON.stringify(x));
for (const colours of [3, 5, 7]) {
  const initial = s.newColourRound(
    `session:${colours}`,
    colours,
    `id:${colours}`,
  );
  let round = initial;
  for (const move of initial.game.puzzle.solution) {
    assert.deepEqual(plain(e.colourHint(round.game)), plain(move));
    const hinted = s.hintColourRound(round);
    assert(hinted.round.assisted);
    assert(!round.assisted);
    const next = s.moveColourRound(round, move);
    assert.notEqual(next, round);
    assert.deepEqual(
      plain(s.decodeColourRound(s.encodeColourRound(next))),
      plain(next),
    );
    const undone = s.undoColourRound(next);
    assert(undone.assisted);
    assert.deepEqual(plain(undone.game), plain(round.game));
    assert.deepEqual(
      plain(s.moveColourRound(undone, move).game),
      plain(next.game),
    );
    round = next;
  }
  assert(round.game.solved);
  assert.equal(e.colourHint(round.game), null);
  assert.equal(s.hintColourRound(round).round, round);
  const invalid = JSON.parse(s.encodeColourRound(initial));
  for (const mutate of [
    (v) => (v.id = ""),
    (v) => (v.colours = 4),
    (v) => (v.moves = [{ from: 0, to: 0 }]),
    (v) => (v.moves = [{ from: "0", to: 1 }]),
    (v) => (v.assisted = "yes"),
    (v) => (v.seed = ""),
    (v) => (v.day = "2026-11-04"),
  ]) {
    const v = structuredClone(invalid);
    mutate(v);
    assert.equal(s.decodeColourRound(JSON.stringify(v)), null);
  }
  // Find an actual legal deviation not occurring on the certificate path.
  let visited = [initial.game];
  let offPath = null;
  for (let depth = 0; depth < 4 && !offPath; depth++) {
    const next = [];
    for (const state of visited) {
      for (const move of e.colourMoves(state.board)) {
        const child = e.playColour(state, move);
        if (!child.solved && !e.colourHint(child)) {
          offPath = child;
          break;
        }
        next.push(child);
      }
      if (offPath) break;
    }
    visited = next.slice(0, 100);
  }
  assert(offPath, "Test must exercise a legal board outside the known path");
  const offRound = { ...initial, game: offPath };
  const noHint = s.hintColourRound(offRound);
  assert.equal(noHint.move, null);
  assert.equal(noHint.round, offRound);
}
const daily = s.newColourRound("daily:2026-11-04", 5, "daily", "2026-11-04");
assert.deepEqual(
  plain(s.decodeColourRound(s.encodeColourRound(daily))),
  plain(daily),
);
assert.throws(() => s.newColourRound("daily:2026-02-30", 5, "x", "2026-02-30"));
assert.throws(() => s.newColourRound("daily:2026-11-04", 3, "x", "2026-11-04"));
assert.throws(() => s.newColourRound("other", 5, "x", "2026-11-04"));
console.log(
  "Colour Sort sessions: regenerated saves, exact undo/redo, sticky assistance, certificate-only hints, real off-path refusal, malformed/illegal saves, complete rounds and daily identity pass.",
);
