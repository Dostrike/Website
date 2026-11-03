import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
let stored = null,
  failRead = false,
  failWrite = false;
const localStorage = {
  getItem: () => {
    if (failRead) throw new Error("blocked");
    return stored;
  },
  setItem: (_key, value) => {
    if (failWrite) throw new Error("blocked");
    stored = value;
  },
};
const exports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/utils/localGameRecords.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports, localStorage },
);
const { readGameRecords, writeGameRecords } = exports;
const clean = readGameRecords("test");
assert.equal(clean.medium.wins, 0);
clean.medium.wins = 3;
assert.equal(readGameRecords("test").medium.wins, 0);
writeGameRecords("test", clean);
assert.equal(readGameRecords("test").medium.wins, 3);
stored = JSON.stringify({
  easy: { wins: 4, losses: -1, draws: "9" },
  hard: { wins: 9007199254740992, losses: 1, draws: 2 },
});
const valid = readGameRecords("test");
assert.equal(valid.easy.wins, 4);
assert.equal(valid.easy.losses, 0);
assert.equal(valid.easy.draws, 0);
assert.equal(valid.hard.wins, 0);
assert.equal(valid.hard.losses, 1);
stored = "{bad";
assert.equal(readGameRecords("test").easy.wins, 0);
failRead = true;
assert.equal(readGameRecords("test").hard.draws, 0);
failWrite = true;
assert.doesNotThrow(() => writeGameRecords("test", clean));
console.log(
  "Browser records: independent defaults, valid counts, malformed/unsafe values and blocked read/write storage passed.",
);
