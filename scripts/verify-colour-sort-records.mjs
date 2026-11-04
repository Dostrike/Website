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
const s = load("colourSortSession"),
  e = load("colourSortEngine"),
  r = load("colourSortRecords");
for (const size of [3, 5, 7]) {
  const round = s.newColourRound("records:" + size, size, "record:" + size),
    won = {
      ...round,
      game: e.replayColour(round.game.puzzle, round.game.puzzle.solution),
    },
    base = r.emptyColourRecords();
  assert.equal(r.recordColourResult(base, round, "2026-11-04"), base);
  const next = r.recordColourResult(base, won, "2026-11-04");
  assert.equal(base.sizes[size].solves, 0);
  assert.equal(next.sizes[size].solves, 1);
  assert.equal(next.sizes[size].unassisted, 1);
  assert.equal(next.sizes[size].bestUnassisted, won.game.moves.length);
  assert.equal(r.recordColourResult(next, won, "2026-11-04"), next);
  const assisted = r.recordColourResult(
    next,
    { ...won, id: "assisted:" + size, assisted: true },
    "2026-11-04",
  );
  assert.equal(assisted.sizes[size].assisted, 1);
  assert.equal(assisted.sizes[size].bestUnassisted, won.game.moves.length);
}
let daily = s.newColourRound("daily:2026-11-04", 5, "daily-one", "2026-11-04");
daily = {
  ...daily,
  assisted: true,
  game: e.replayColour(daily.game.puzzle, daily.game.puzzle.solution),
};
const first = r.recordColourResult(r.emptyColourRecords(), daily, "2026-11-04");
assert.equal(first.streak, 1);
assert.equal(
  r.recordColourResult(first, { ...daily, id: "daily-repeat" }, "2026-11-04")
    .streak,
  1,
);
assert.equal(
  r.recordColourResult(r.emptyColourRecords(), daily, "2026-11-05").streak,
  0,
);
assert.equal(r.colourStreak(first, "2026-11-06"), 0);
const tomorrow = { ...daily, id: "tomorrow", day: "2026-11-05" };
assert.equal(r.recordColourResult(first, tomorrow, "2026-11-05").streak, 2);
const missing = JSON.parse(s.encodeColourRound(daily));
delete missing.day;
assert.equal(s.decodeColourRound(JSON.stringify(missing)), null);
console.log(
  "Colour Sort records: unsolved exclusion, first-completion deduplication, size separation, immutable counters, assisted exclusion from bests, same-day repeat and expired/consecutive streak rules passed.",
);
