import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';
const exports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/memoryRecords.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports});
const {loadMemoryStats,saveMemoryStats,normalizeMemoryStats,MEMORY_STATS_KEY}=exports;
const plain=x=>JSON.parse(JSON.stringify(x));
const defaults=plain(normalizeMemoryStats(null));
let checks=0;
for(const value of [null,[],false,0,'bad',{EASY:null},{EASY:[]},{EASY:{wins:'invalid',bestTime:-1}},{HARD:{gamesPlayed:Infinity,wins:NaN,bestMoves:1.5}}]){
 const record=plain(normalizeMemoryStats(value));assert.deepEqual(record,defaults);checks++;
}
const legacy={EASY:{gamesPlayed:3,wins:3,bestMoves:8,bestTime:42},MEDIUM:{gamesPlayed:2,wins:2,bestMoves:12,bestTime:63},HARD:{gamesPlayed:1,wins:1,bestMoves:20,bestTime:90}};
const original=JSON.stringify(legacy);assert.deepEqual(plain(normalizeMemoryStats(legacy)),legacy);assert.equal(JSON.stringify(legacy),original);checks+=2;
let saved=null;const storage={getItem:key=>{assert.equal(key,'memoryGameStats');return original;},setItem:(key,value)=>{assert.equal(key,MEMORY_STATS_KEY);saved=value;}};
assert.deepEqual(plain(loadMemoryStats(storage).stats),legacy);assert.equal(saveMemoryStats(legacy,storage),true);assert.deepEqual(JSON.parse(saved),legacy);checks+=3;
assert.equal(saveMemoryStats(legacy,{setItem(){throw Error('quota');}}),false);
assert.equal(loadMemoryStats({getItem(){throw Error('blocked');}}).available,false);
assert.deepEqual(plain(loadMemoryStats({getItem:()=>'{broken'}).stats),defaults);
assert.deepEqual(plain(loadMemoryStats({getItem:()=>'{"EASY":null}'}).stats),defaults);
assert.equal(loadMemoryStats().available,false);assert.equal(saveMemoryStats(legacy),false);checks+=6;
const partial=plain(normalizeMemoryStats({EASY:{wins:2,bestTime:0},HARD:legacy.HARD}));assert.equal(partial.EASY.wins,2);assert.equal(partial.EASY.bestTime,0);assert.deepEqual(partial.HARD,legacy.HARD);checks+=3;
console.log(`Memory records checks passed: ${checks} malformed/legacy/partial/read-denied/write-denied/round-trip/unavailable-storage cases; key and input preserved.`);
