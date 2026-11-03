import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/gomokuEngine.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports });
const { newGomoku, playGomoku, replayGomoku, gomokuLine, chooseGomokuMove, gomokuDaily } = exports;
let state = newGomoku();
assert.equal(state.board.length, 225);
assert.equal(state.turn, 'black');
for (const index of [-1, 225, 1.5, NaN]) assert.equal(playGomoku(state, index), state);
const moved = playGomoku(state, 112);
assert.equal(state.board[112], null);
assert.equal(moved.turn, 'white');
assert.equal(playGomoku(moved, 112), moved);
for (const [start, step] of [[30, 1], [2, 15], [0, 16], [14, 14]]) {
  const board = Array(225).fill(null);
  for (let i = 0; i < 5; i++) board[start + step * i] = 'black';
  assert.equal(gomokuLine(board, start + step * 2).length, 5);
}
const edge = Array(225).fill(null);
for (const i of [13,14,15,16,17]) edge[i] = 'black';
assert.equal(gomokuLine(edge, 15).length, 0, 'Do not wrap rows');
const overline = Array(225).fill(null);
for (let i = 0; i < 6; i++) overline[90 + i] = 'white';
assert.equal(gomokuLine(overline, 92).length, 6);
state = replayGomoku([0,15,1,16,2,17,3,18,4]);
assert.equal(state.winner, 'black');
assert.equal(playGomoku(state, 20), state);
assert.throws(() => replayGomoku([1,1]));
assert.throws(() => replayGomoku([0,15,1,16,2,17,3,18,4,20]));
for (const difficulty of ['easy','medium','hard']) {
  const win = replayGomoku([0,15,1,16,2,17,3,30]);
  assert.equal(chooseGomokuMove(win, difficulty, () => 0), 4);
  const block = replayGomoku([30,0,32,1,45,2,47,3]);
  assert.equal(chooseGomokuMove(block, difficulty, () => 0), 4);
  assert.equal(chooseGomokuMove(newGomoku(), difficulty), 112);
}
const full = Array.from({ length: 225 }, (_, index) => (Math.floor(Math.floor(index/15)/2) + index%15)%2 ? 'black' : 'white');
for (let i = 0; i < 225; i++) assert.equal(gomokuLine(full, i).length, 0);
const nearlyFull = { board: full.slice(), moves: Array.from({ length: 224 }, (_, i) => i), turn: 'black', winner: null, winningLine: [], draw: false };
nearlyFull.board[224] = null;
assert.equal(playGomoku(nearlyFull, 224).draw, true);
// The worked guide examples must agree with the engine.
const indexOf = point => (15-Number(point.slice(1)))*15+'ABCDEFGHIJKLMNO'.indexOf(point[0]);
for (const finish of ['C8','H8']) {
  const board = Array(225).fill(null);
  for (const point of ['D8','E8','F8','G8',finish]) board[indexOf(point)] = 'black';
  assert.equal(gomokuLine(board, indexOf(finish)).length, 5);
}
for (const finish of ['D8','I8']) {
  const board = Array(225).fill(null);
  for (const point of ['E8','F8','G8','H8',finish]) board[indexOf(point)] = 'black';
  assert.equal(gomokuLine(board, indexOf(finish)).length, 5);
}
const daily = gomokuDaily('2026-11-03');
assert.equal(JSON.stringify(daily), JSON.stringify(gomokuDaily('2026-11-03')));
assert.equal(daily.moves.length, 4);
assert.equal(daily.turn, 'black');
const start = performance.now();
for (let game = 0; game < 8; game++) {
  state = gomokuDaily(`2026-11-${String(game + 1).padStart(2,'0')}`);
  for (let turn = 0; turn < 225 && !state.winner && !state.draw; turn++) {
    const move = chooseGomokuMove(state, turn % 2 ? 'medium' : 'hard');
    assert.notEqual(move, null);
    const next = playGomoku(state, move);
    assert.notEqual(next, state);
    state = next;
  }
  assert(state.winner || state.draw);
}
console.log(`Gomoku: four directions, edges, overlines, illegal/post-result moves, immutable replay, tactical AI, daily determinism and eight complete AI games passed (${Math.round(performance.now()-start)}ms).`);

