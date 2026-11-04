import assert from 'node:assert/strict';
// The paper guide is not a new runtime mode. Independently check its geometry.
const lineKey=points=>points.map(p=>p.join(',')).sort().join('|');
const planar=[];
for(let n=1;n<=4;n++){planar.push(Array.from({length:4},(_,i)=>[n,i+1]));planar.push(Array.from({length:4},(_,i)=>[i+1,n]));}
planar.push([[1,1],[2,2],[3,3],[4,4]],[[1,4],[2,3],[3,2],[4,1]]);
assert.equal(new Set(planar.map(lineKey)).size,10);
const points=[];for(let z=1;z<=3;z++)for(let r=1;r<=3;r++)for(let c=1;c<=3;c++)points.push([z,r,c]);
const directional=new Set();
for(const start of points)for(let dz=-1;dz<=1;dz++)for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
 if(!dz&&!dr&&!dc)continue;
 const line=[0,1,2].map(t=>start.map((v,i)=>v+t*[dz,dr,dc][i]));
 if(line.every(p=>p.every(v=>v>=1&&v<=3)))directional.add(lineKey(line));
}
// Separate midpoint test over every unordered three-cell combination.
const midpoint=new Set();
for(let a=0;a<27;a++)for(let b=a+1;b<27;b++)for(let c=b+1;c<27;c++){
 const p=[points[a],points[b],points[c]];
 if([0,1,2].some(m=>{const ends=[0,1,2].filter(i=>i!==m);return [0,1,2].every(i=>p[m][i]*2===p[ends[0]][i]+p[ends[1]][i]);}))midpoint.add(lineKey(p));
}
assert.deepEqual([...directional].sort(),[...midpoint].sort());assert.equal(midpoint.size,49);
assert(midpoint.has(lineKey([[1,1,1],[2,2,2],[3,3,3]])));
assert(midpoint.has(lineKey([[1,2,3],[2,2,3],[3,2,3]])));
assert(!midpoint.has(lineKey([[1,1,1],[2,2,2],[3,3,2]])));
const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const winner=b=>lines.find(l=>b[l[0]]&&l.every(i=>b[i]===b[l[0]]));
const board=Array(9).fill(null);[0,3,1,6].forEach((cell,i)=>{assert.equal(board[cell],null);board[cell]=i%2?'O':'X';assert(!winner(board));});board[2]='X';assert.deepEqual(winner(board),[0,1,2]);
const shared=Array(9).fill(null);shared[0]='X';shared[1]='X';assert(!winner(shared));shared[2]='O';assert(!winner(shared));shared[2]='X';assert.deepEqual(winner(shared),[0,1,2]);
console.log('Paper variants:10 planar lines;49 cube lines by independent direction/midpoint enumeration; legal avoid-three opening and shared-symbol completion examples pass. No perfect-strategy or online-variant claim.');
