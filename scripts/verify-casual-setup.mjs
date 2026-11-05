import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/casualSetup.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports});
const {prepareCasualSetup,resolveCasualSetup,normalizeCasualSettings}=exports;const plain=x=>JSON.parse(JSON.stringify(x));let checks=0;
for(const game of ['tictactoe','connect4'])for(const mode of ['AI','PVP'])for(const difficulty of ['EASY','MEDIUM','HARD']){
 let stored=null;const input={gameMode:mode,difficulty,player1Name:' First ',player2Name:' Second '};const storage={setItem:(key,value)=>{assert.equal(key,game==='tictactoe'?'gameSettings':'connect4Settings');stored=value;},getItem:()=>stored};
 const handoff=prepareCasualSetup(game,input,storage);assert.equal(handoff.saved,true);assert.equal(handoff.settings.player1Name,'First');assert.deepEqual(plain(resolveCasualSetup(game,null,storage).settings),plain(handoff.settings));
 const denied={setItem(){throw Error('quota');},getItem:()=>JSON.stringify({gameMode:'AI',difficulty:'EASY',player1Name:'Stale',player2Name:'Stale'})};const transient=prepareCasualSetup(game,input,denied);assert.equal(transient.saved,false);assert.deepEqual(plain(resolveCasualSetup(game,{casualSetup:transient},denied).settings),plain(handoff.settings));assert.equal(input.player1Name,' First ');checks++;
 for(const invalid of [null,{}, {...transient,version:2},{...transient,game:game==='tictactoe'?'connect4':'tictactoe'},{...transient,saved:'false'},{...transient,settings:{...input,gameMode:'PRIVATE'}},{...transient,settings:{...input,difficulty:'OTHER'}}]){assert.equal(resolveCasualSetup(game,{casualSetup:invalid},denied),null);checks++;}
}
for(const invalid of [null,[],false,{gameMode:'PRIVATE'},{gameMode:'AI',difficulty:'BAD',player1Name:'A',player2Name:'B'}]){assert.equal(prepareCasualSetup('tictactoe',invalid),null);checks++;}
assert.equal(resolveCasualSetup('connect4',null,{getItem(){throw Error('blocked');}}),null);assert.equal(resolveCasualSetup('connect4',null,{getItem:()=>'{broken'}),null);assert.equal(prepareCasualSetup('connect4',{gameMode:'PVP',difficulty:'HARD',player1Name:'W'.repeat(50),player2Name:' '}).settings.player1Name.length,40);assert.equal(normalizeCasualSettings({gameMode:'AI'}).difficulty,'MEDIUM');checks+=4;
console.log(`Casual setup handoff checks passed: ${checks} normal reload, denied-write, stale-precedence, malformed/cross-game, key/name and unavailable-storage cases.`);

// Execute actual setup handlers with a controlled adapter, without room traffic.
let handlerChecks=0;
for(const file of ["Connect4Setup", "TicTacToeSetup"]){
 const source=fs.readFileSync(`src/components/${file}.tsx`,"utf8");const start=source.indexOf("  const handleStartGame = () => {");const end=source.indexOf("\n  };",start)+6;assert(start>=0&&end>start);
 for(const gameMode of ["AI","PVP"])for(const denied of [false,true]){
  let navigation=null;
  vm.runInNewContext(source.slice(start,end)+";handleStartGame();",{prepareCasualSetup,gameMode,difficulty:"HARD",player1Name:" ChosenA ",player2Name:"ChosenB",roomId:"PRIVATE_FIXTURE",setupStorage:{setItem(){if(denied)throw Error("quota");}},navigate:(path,options)=>{navigation={path,options};}});
  assert.equal(navigation.path,file==="Connect4Setup"?"/connect4":"/tictactoe");assert.equal(navigation.options.state.casualSetup.settings.gameMode,gameMode);assert.equal(navigation.options.state.casualSetup.settings.player1Name,"ChosenA");assert.equal(navigation.options.state.casualSetup.saved,!denied);handlerChecks++;
 }
 if(file==="TicTacToeSetup"){
  let navigation=null;vm.runInNewContext(source.slice(start,end)+";handleStartGame();",{gameMode:"PRIVATE",roomId:"PRIVATE_FIXTURE",navigate:(path,options)=>{navigation={path,options};}});assert.equal(navigation.path,"/tictactoe-private");assert.deepEqual(plain(navigation.options.state),{roomId:"PRIVATE_FIXTURE",isPrivate:true});handlerChecks++;
 }
}
console.log(`Actual setup handlers passed ${handlerChecks} local/computer/denied/normal/private-routing cases without contacting players.`);
