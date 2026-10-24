import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const text = await fs.readFile('src/components/StrategyPractice.tsx', 'utf8');
const source = ts.createSourceFile('StrategyPractice.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let lessons;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'lessons') lessons = JSON.parse(JSON.stringify(vm.runInNewContext(node.initializer.getText(source))));
  ts.forEachChild(node, visit);
}
visit(source);
const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const wins = (board, player) => lines.some(line => line.every(square => board[square] === player));
const next = (board, move, player) => board.map((square, index) => index === move ? player : square);
const threats = (board, player) => board.flatMap((square, index) => !square && wins(next(board, index, player), player) ? [index] : []);
function score(board, player) {
  if (wins(board, 'X')) return 1;
  if (wins(board, 'O')) return -1;
  const options = board.flatMap((square, index) => !square ? [score(next(board, index, player), player === 'X' ? 'O' : 'X')] : []);
  if (!options.length) return 0;
  return player === 'X' ? Math.max(...options) : Math.min(...options);
}
assert.equal(lessons.length, 3);
for (const lesson of lessons) {
  assert.equal(lesson.board.filter(x => x === 'X').length, lesson.board.filter(x => x === 'O').length);
  assert.equal(lesson.board[lesson.answer], '');
  assert(!wins(lesson.board, 'X') && !wins(lesson.board, 'O'));
  const chosen = score(next(lesson.board, lesson.answer, 'X'), 'O');
  const alternatives = lesson.board.flatMap((square, index) => !square ? [score(next(lesson.board, index, 'X'), 'O')] : []);
  assert.equal(chosen, Math.max(...alternatives));
}
assert(wins(next(lessons[0].board, lessons[0].answer, 'X'), 'X'));
assert.deepEqual(threats(lessons[1].board, 'O'), [lessons[1].answer]);
assert.equal(threats(next(lessons[2].board, lessons[2].answer, 'X'), 'X').length, 2);
assert.equal(threats(next(lessons[2].board, lessons[2].answer, 'X'), 'O').length, 0);
console.log('Three practice positions verified: legal turns, optimal answers, immediate win, forced block, and defensive fork.');
