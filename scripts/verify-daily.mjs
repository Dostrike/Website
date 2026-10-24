import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const source = await fs.readFile('src/utils/practiceEngine.ts', 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
vm.runInNewContext(code, { exports, Map, Date, Number, String, Math, Array });
const { evaluatePosition, winner, afterMove, opposite, analyzeMoves, dailyPuzzle, dailyPuzzles, bestMoves, previousDateKey } = exports;
assert.equal(evaluatePosition(Array(9).fill(''), 'X'), 0, 'Perfect play from an empty board must draw');
assert.equal(previousDateKey('2026-03-01'), '2026-02-28');
assert.equal(previousDateKey('2024-03-01'), '2024-02-29');
assert.equal(previousDateKey('2026-01-01'), '2025-12-31');
assert.deepEqual(Array.from(bestMoves(dailyPuzzles[3].board, 'O')), [1, 3, 5, 7]);
const seen = new Set();
let terminal = 0;
function visit(board, player) {
  const key = board.map(cell => cell || '-').join('');
  if (seen.has(key)) return;
  seen.add(key);
  if (winner(board) || board.every(Boolean)) { terminal++; return; }
  const before = board.join('|');
  const moves = analyzeMoves(board, player);
  assert.equal(moves.length, board.filter(cell => !cell).length);
  assert.equal(evaluatePosition(board, player), Math.max(...moves.map(move => move.score)));
  assert.equal(board.join('|'), before, 'Analysis must not mutate a game board');
  for (const move of moves) visit(afterMove(board, move.index, player), opposite(player));
}
visit(Array(9).fill(''), 'X');
assert.equal(seen.size, 5478, 'Count every reachable board, stopping at the first win');
assert.equal(terminal, 958);
// Exercise all 32 combinations of scenario, rotation and reflection, over two cycles.
for (let offset = 0; offset < 64; offset++) {
  const key = new Date(Date.UTC(2026, 9, 1 + offset)).toISOString().slice(0, 10);
  const puzzle = dailyPuzzle(key);
  assert(!winner(puzzle.board));
  assert.equal(puzzle.board.filter(cell => cell === 'X').length - puzzle.board.filter(cell => cell === 'O').length, puzzle.player === 'X' ? 0 : 1);
  assert(bestMoves(puzzle.board, puzzle.player).length > 0);
  assert(evaluatePosition(puzzle.board, puzzle.player) >= 0, `Daily puzzle must be defensible: ${key}`);
  assert.equal(JSON.stringify(puzzle), JSON.stringify(dailyPuzzle(key)), 'The same date must select the same board');
}
console.log(`Verified solver across ${seen.size} reachable boards (${terminal} terminal), empty-board draw, four valid edge defenses, date boundaries, and 64 daily selections.`);
