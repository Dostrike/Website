import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
const exports = {};
let stored = null,
  blocked = false;
const localStorage = {
  getItem: () => {
    if (blocked) throw new Error("blocked");
    return stored;
  },
  setItem: (_key, value) => {
    if (blocked) throw new Error("blocked");
    stored = value;
  },
};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/utils/mancalaProgress.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  { exports, localStorage },
);
const {
  emptyMancalaProgress,
  readMancalaProgress,
  writeMancalaProgress,
  recordMancalaResult,
  currentMancalaStreak,
  previousMancalaDate,
} = exports;
let progress = emptyMancalaProgress();
const first = {
  id: "first",
  mode: "computer",
  difficulty: "hard",
  human: 0,
  stores: [30, 18],
  dailyDay: "2026-11-03",
  today: "2026-11-03",
};
let next = recordMancalaResult(progress, first);
assert.equal(progress.levels.hard.wins, 0);
assert.equal(next.levels.hard.wins, 1);
assert.equal(next.levels.hard.bestMargin, 12);
assert.equal(next.dailyStreak, 1);
assert.equal(recordMancalaResult(next, first), next);
next = recordMancalaResult(next, { ...first, id: "same-day" });
assert.equal(next.dailyStreak, 1);
assert.equal(next.levels.hard.streak, 2);
next = recordMancalaResult(next, {
  ...first,
  id: "next-day",
  today: "2026-11-04",
  dailyDay: "2026-11-04",
});
assert.equal(next.dailyStreak, 2);
assert.equal(currentMancalaStreak(next, "2026-11-05"), 2);
assert.equal(currentMancalaStreak(next, "2026-11-06"), 0);
next = recordMancalaResult(next, {
  ...first,
  id: "old-save",
  dailyDay: "2026-11-01",
  today: "2026-11-05",
});
assert.equal(next.lastDailyWin, "2026-11-04");
next = recordMancalaResult(next, { ...first, id: "loss", stores: [18, 30] });
assert.equal(next.levels.hard.streak, 0);
assert.equal(next.levels.hard.bestStreak, 4);
next = recordMancalaResult(next, { ...first, id: "local", mode: "local" });
assert.equal(next.localGames, 1);
assert.equal(next.levels.hard.wins, 4);
assert.equal(previousMancalaDate("2026-01-01"), "2025-12-31");
assert.equal(previousMancalaDate("2024-03-01"), "2024-02-29");
writeMancalaProgress(next);
assert.equal(readMancalaProgress().levels.hard.wins, 4);
stored = "{invalid";
assert.equal(readMancalaProgress().localGames, 0);
blocked = true;
assert.equal(readMancalaProgress().dailyStreak, 0);
assert.doesNotThrow(() => writeMancalaProgress(next));
console.log(
  "Mancala progress passed: immutable wins/losses/streaks/margin, local games, duplicate result IDs, same/next/missed dates, old daily saves, leap/year boundaries and blocked/malformed storage.",
);
