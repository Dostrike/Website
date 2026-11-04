import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
const modules = new Map();
function load(file) {
  const resolved=path.resolve(file); if(modules.has(resolved))return modules.get(resolved);
  const exports={};modules.set(resolved,exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(resolved,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>{assert(name.startsWith('.'));return load(path.resolve(path.dirname(resolved),name+'.ts'));}});
  return exports;
}
const {articles,getArticleBySlug}=load('src/data/articles.ts');
const {articleRedirects}=load('src/data/articleRedirects.ts');
const {guideExercises,exercisesForGuide}=load('src/data/guideExercises.ts');
const {bestMoves,analyzeMoves,afterMove,winner}=load('src/utils/practiceEngine.ts');
const {Connect4Logic}=load('src/utils/connect4Logic.ts');
let connect4=Connect4Logic.createInitialGameState();
for(const column of [0,6,1,6,2,6])connect4=Connect4Logic.makeMove(connect4,column);
const winningDrop=Connect4Logic.makeMove(connect4,3);
assert.equal(winningDrop.winner,'RED');
assert.equal(Connect4Logic.makeMove(winningDrop,6),winningDrop,'A winning drop ends the round before the opponent replies');
assert.equal(Connect4Logic.makeMove(connect4,6).winner,null,'Blocking instead does not take the available win');
const reachable=new Set();
function visit(board,player){const key=board.map(cell=>cell||'-').join('')+player;if(reachable.has(key))return;reachable.add(key);if(winner(board))return;board.forEach((cell,index)=>{if(!cell)visit(afterMove(board,index,player),player==='X'?'O':'X');});}
visit(Array(9).fill(''),'X');
for(const exercise of guideExercises){
  assert(reachable.has(exercise.board.map(cell=>cell||'-').join('')+exercise.player),`Unreachable lesson ${exercise.id}`);
  assert.equal(JSON.stringify([...exercise.answers].sort()),JSON.stringify([...bestMoves(exercise.board,exercise.player)].sort()),`Inaccurate answer set for ${exercise.id}`);
}
assert.equal(winner(afterMove(guideExercises[0].board,2,'X')),'X');
assert.equal(winner(afterMove(guideExercises[0].board,5,'X')),null);
assert(analyzeMoves(Array(9).fill(''),'X').every(move=>move.score===0),'All first moves can preserve a draw');
const centre=afterMove(Array(9).fill(''),4,'X');
assert.equal(JSON.stringify(bestMoves(centre,'O')),JSON.stringify([0,2,6,8]));
assert.equal(JSON.stringify(bestMoves(afterMove(Array(9).fill(''),0,'X'),'O')),JSON.stringify([4]));
assert.equal(exercisesForGuide('complete-tic-tac-toe-strategy-guide').length,4);
assert.equal(exercisesForGuide('tic-tac-toe-education-teaching-resource').length,2);
assert.equal(exercisesForGuide('minimax-algorithm-tic-tac-toe').length,0);
const netlify=fs.readFileSync('netlify.toml','utf8');
for(const [old,destination] of Object.entries(articleRedirects)){
  assert.equal(getArticleBySlug(old),undefined);
  const target=getArticleBySlug(destination);assert(target,`Missing destination ${destination}`);
  assert.equal(target.updated, ['memory-game-advanced-drills','psychology-tic-tac-toe-decision-making','famous-tic-tac-toe-games','fun-facts-tic-tac-toe'].includes(old) ? '2026-11-04' : '2026-11-03');
  assert(!Object.hasOwn(articleRedirects,destination),'Redirect chain');
  for(const suffix of ['','/']){
    const block=netlify.split('[[redirects]]').find(block=>block.includes(`from = "/blog/${old}${suffix}"`));
    assert(block,`Missing host redirect ${old}${suffix}`);assert(block.includes(`to = "/blog/${destination}/"`));assert(block.includes('status = 301'));assert(block.includes('force = true'));
  }
}
const sitemap=fs.readFileSync('public/sitemap.xml','utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
assert.equal(new Set(urls).size,urls.length);
for(const article of articles)assert(urls.includes(`https://dostrike.com/blog/${article.slug}`),`Guide missing from sitemap ${article.slug}`);
for(const name of ['sitemap.xml','sitemap_index.xml','sitemap.txt','urls.txt']){
  const content=fs.readFileSync('public/'+name,'utf8');
  for(const retired of Object.keys(articleRedirects))assert(!content.includes('/blog/'+retired),`Retired URL in ${name}`);
  const actual=name.endsWith('.xml')?[...content.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]):content.trim().split(/\r?\n/);
  assert.equal(JSON.stringify(actual),JSON.stringify(urls),`Sitemap drift ${name}`);
}
console.log(`Verified ${guideExercises.length} solver-checked lesson positions, opening claims, ${Object.keys(articleRedirects).length} direct permanent redirects, ${articles.length} retained guides and synchronized sitemaps.`);
