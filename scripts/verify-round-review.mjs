import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
const modules = new Map();
function load(file) {
  const resolved = path.resolve(file);
  if (modules.has(resolved)) return modules.get(resolved);
  const exports = {};
  modules.set(resolved, exports);
  const code = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, require: name => { assert(name.startsWith('.')); return load(path.resolve(path.dirname(resolved), name + '.ts')); } });
  return exports;
}

const { reviewRound, reviewExplanation } = load('src/utils/roundReview.ts');
const { winner } = load('src/utils/practiceEngine.ts');
const missedWin = reviewRound([0,3,1,4,8,5]);
assert.equal(missedWin.length, 6);
assert.equal(missedWin[4].player, 'X');
assert.equal(missedWin[4].missedOutcome, true);
assert.equal(missedWin[4].best[0], 2);
assert.match(reviewExplanation(missedWin[4]), /win in one move/);
const block = reviewRound([0,4,8,1,6,7])[4];
assert.equal(block.missedOutcome, true);
assert.equal(block.best[0], 7);
assert.equal(block.board[6], '');
assert.match(reviewExplanation(block), /forced loss/);
const perfectDraw = reviewRound([0,4,8,1,7,6,2,5,3]);
assert.equal(perfectDraw.length, 9);
assert(perfectDraw.every(move => !move.missedOutcome));
assert.equal(winner(perfectDraw[8].board), null);
assert.equal(perfectDraw[0].board.filter(Boolean).length, 0);
assert.equal(perfectDraw[8].board.filter(Boolean).length, 8);
for (const moves of [[0,0], [9], [-1], [1.5], [0,3,1,4,2,5]]) assert.throws(() => reviewRound(moves), /Invalid round history/);
assert.equal(reviewRound([]).length, 0);
console.log('Verified actual-round replay, missed wins, forced blocks, perfect-play draw, immutable snapshots and invalid histories.');
