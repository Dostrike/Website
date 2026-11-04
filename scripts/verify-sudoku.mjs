import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';import vm from 'node:vm';
const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/sudokuEngine.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports});
const {sudokuUnits,sudokuConflicts,sudokuCandidates,sudokuComplete,countSudokuSolutions,generateSudoku,sudokuLogicalHint}=exports;
const plain=x=>JSON.parse(JSON.stringify(x));
const puzzle='530070000600195000098000060800060003400803001700020006060000280000419005000080079'.split('').map(Number);
const solution='534678912672195348198342567859761423426853791713924856961537284287419635345286179'.split('').map(Number);
assert(sudokuComplete(solution));assert(!sudokuComplete(puzzle));assert.equal(countSudokuSolutions(puzzle),1);assert.equal(countSudokuSolutions(Array(81).fill(0)),2);
const wrong=puzzle.slice();wrong[2]=5;assert(sudokuConflicts(wrong).includes(0));assert(sudokuConflicts(wrong).includes(2));assert.equal(countSudokuSolutions(wrong),0);assert.equal(sudokuLogicalHint(wrong),null);
assert.throws(()=>sudokuCandidates(puzzle,-1));assert.throws(()=>countSudokuSolutions([0]));assert.throws(()=>countSudokuSolutions(Array(81).fill(0),2,1));
const one=solution.slice();one[0]=0;assert.deepEqual(plain(sudokuCandidates(one,0)),[5]);assert.equal(sudokuLogicalHint(one).technique,'single-candidate');assert.equal(sudokuLogicalHint(one).digit,5);
// Independent bit-mask solver checks uniqueness rather than trusting the generator's counter.
function independent(input){const b=input.slice(),rows=Array(9).fill(0),cols=Array(9).fill(0),boxes=Array(9).fill(0);let found=0;
 for(let i=0;i<81;i++)if(b[i]){const r=Math.floor(i/9),c=i%9,box=Math.floor(r/3)*3+Math.floor(c/3),bit=1<<b[i];if((rows[r]|cols[c]|boxes[box])&bit)return 0;rows[r]|=bit;cols[c]|=bit;boxes[box]|=bit;}
 function visit(){let index=-1,mask=0,min=10;for(let i=0;i<81;i++)if(!b[i]){const r=Math.floor(i/9),c=i%9,box=Math.floor(r/3)*3+Math.floor(c/3),m=1022&~(rows[r]|cols[c]|boxes[box]);let count=0;for(let bit=m;bit;bit&=bit-1)count++;if(!count)return;if(count<min){index=i;mask=m;min=count;if(count===1)break;}}if(index<0){found++;return;}const r=Math.floor(index/9),c=index%9,box=Math.floor(r/3)*3+Math.floor(c/3);for(let n=1;n<=9;n++)if(mask&(1<<n)){const bit=1<<n;b[index]=n;rows[r]|=bit;cols[c]|=bit;boxes[box]|=bit;visit();rows[r]^=bit;cols[c]^=bit;boxes[box]^=bit;if(found>=2)break;}b[index]=0;}visit();return found;
}
let maxMs=0,hidden=0,singles=0;const boards=new Set();
for(const level of ['easy','medium','hard'])for(let n=0;n<12;n++){
 const seed=`2026-11-${String(n+4).padStart(2,'0')}`,start=performance.now(),p=generateSudoku(seed,level);maxMs=Math.max(maxMs,performance.now()-start);
 assert(sudokuComplete(p.solution));assert(p.givens.every((v,i)=>v===0||v===p.solution[i]));assert.equal(independent(p.givens),1);assert.equal(countSudokuSolutions(p.givens),1);assert(p.givens.filter(Boolean).length>={easy:42,medium:35,hard:29}[level]);assert(p.givens.filter(Boolean).length<50);
 assert.deepEqual(plain(p),plain(generateSudoku(seed,level)));boards.add(p.solution.join(''));
 const work=p.givens.slice();for(let step=0;step<81;step++){const hint=sudokuLogicalHint(work);if(!hint)break;assert.equal(hint.digit,p.solution[hint.index]);assert.equal(work[hint.index],0);if(hint.technique==='only-place'){hidden++;assert.equal(hint.unit.filter(i=>sudokuCandidates(work,i).includes(hint.digit)).length,1);}else singles++;work[hint.index]=hint.digit;}
}
assert(hidden>0);assert(singles>0);assert(boards.size>30);assert.equal(JSON.stringify(puzzle),'['+'530070000600195000098000060800060003400803001700020006060000280000419005000080079'.split('').join(',')+']');assert.equal(sudokuUnits.length,27);
console.log(`Sudoku passed: independent uniqueness verification for 36 reproducible generated boards, valid solutions/givens, conflicts, zero/multiple/unique solution cases, bounded search, ${singles} actual single-candidate and ${hidden} only-place deductions. Slowest generator ${Math.round(maxMs)}ms.`);
