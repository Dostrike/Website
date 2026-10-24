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
const types = load('src/types/game.ts');
const { GameLogic } = load('src/utils/gameLogic.ts');
const text = fs.readFileSync('src/components/MatchGame.tsx', 'utf8');
const source = ts.createSourceFile('MatchGame.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const functions = source.statements.filter(node => ts.isFunctionDeclaration(node) && ['scoreRound', 'loadSettings'].includes(node.name?.text)).map(node => node.getText(source)).join('\n');
let stored = null;
let blocked = false;
const exports = {};
vm.runInNewContext(ts.transpileModule(functions + '\nexports.scoreRound = scoreRound; exports.loadSettings = loadSettings;', { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { ...types, exports, localStorage: { getItem() { if (blocked) throw new Error('Storage unavailable'); return stored; } } });
const { scoreRound, loadSettings } = exports;
function play(mode, cells) {
  let game = { ...GameLogic.createInitialGameState(), gameMode: mode };
  for (const cell of cells) game = scoreRound(GameLogic.makeMove(game, Math.floor(cell / 3), cell % 3, mode));
  return game;
}
const xWin = [0, 3, 1, 4, 2];
const oWin = [0, 3, 1, 4, 8, 5];
assert.equal(play(types.GameMode.PVP, xWin).score.player1Wins, 1);
assert.equal(play(types.GameMode.PVP, oWin).score.player2Wins, 1);
assert.equal(play(types.GameMode.AI, xWin).score.playerWins, 1);
assert.equal(play(types.GameMode.AI, oWin).score.aiWins, 1);
const draw = play(types.GameMode.PVP, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
assert.equal(draw.gameStatus, types.GameStatus.DRAW);
assert.equal(draw.score.draws, 1);
assert.equal(draw.score.player1Wins + draw.score.player2Wins, 0);
assert.equal(loadSettings(), null);
stored = '{broken'; assert.equal(loadSettings(), null);
stored = JSON.stringify({ gameMode: 'PRIVATE' }); assert.equal(loadSettings(), null);
stored = JSON.stringify({ gameMode: 'AI', difficulty: 'EXTREME', player1Name: 'A'.repeat(100) });
assert.equal(loadSettings().difficulty, types.Difficulty.MEDIUM);
assert.equal(loadSettings().player1Name.length, 40);
blocked = true; assert.equal(loadSettings(), null);
console.log('Verified local/AI scoring, draws, invalid settings, name limits and unavailable storage.');
