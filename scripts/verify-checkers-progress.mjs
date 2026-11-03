import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
let data = null;
const exports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/utils/checkersProgress.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  {
    exports,
    Date,
    localStorage: {
      getItem: () => data,
      setItem: (_, v) => {
        data = v;
      },
    },
  },
);
const {
  emptyCheckersProgress,
  recordCheckersResult,
  readCheckersProgress,
  writeCheckersProgress,
  currentCheckersStreak,
} = exports;
const event = {
  id: "one",
  mode: "computer",
  difficulty: "hard",
  human: "dark",
  counts: { dark: 1, light: 1 },
  winner: "dark",
  today: "2026-11-04",
  dailyDay: "2026-11-04",
};
const initial = emptyCheckersProgress(),
  won = recordCheckersResult(initial, event);
assert.equal(won.levels.hard.wins, 1);
assert.equal(won.levels.hard.bestMargin, 0);
assert.equal(initial.levels.hard.wins, 0);
assert.equal(recordCheckersResult(won, event), won);
assert.equal(won.dailyStreak, 1);
const draw = recordCheckersResult(won, {
  ...event,
  id: "two",
  winner: "draw",
  counts: { dark: 3, light: 1 },
});
assert.equal(draw.levels.hard.draws, 1);
assert.equal(draw.levels.hard.streak, 0);
const lost = recordCheckersResult(draw, {
  ...event,
  id: "three",
  winner: "light",
  counts: { dark: 2, light: 1 },
});
assert.equal(lost.levels.hard.losses, 1);
const light = recordCheckersResult(lost, {
  ...event,
  id: "four",
  human: "light",
  winner: "light",
  counts: { dark: 0, light: 4 },
  today: "2026-11-05",
  dailyDay: "2026-11-05",
});
assert.equal(light.levels.hard.bestMargin, 4);
assert.equal(light.dailyStreak, 2);
assert.equal(currentCheckersStreak(light, "2026-11-07"), 0);
assert.equal(
  recordCheckersResult(light, { ...event, id: "local", mode: "local" })
    .localGames,
  1,
);
writeCheckersProgress(light);
assert.equal(readCheckersProgress().levels.hard.wins, 2);
data = "{broken";
assert.equal(readCheckersProgress().levels.hard.wins, 0);
console.log(
  "Checkers records passed: actual winner over piece counts, blocked-win zero margin, immutable outcomes/dedupe, daily dates, local count and storage.",
);
