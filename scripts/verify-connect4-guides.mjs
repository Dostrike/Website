import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
const cache = {},
  storage = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache[file]) return cache[file];
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      console,
      localStorage: {
        getItem: (k) => storage.get(k) ?? null,
        setItem: (k, v) => storage.set(k, v),
      },
      require: (p) => load(path.resolve(path.dirname(file), p) + ".ts"),
    },
  );
  return (cache[file] = exports);
}
const { Connect4Logic: e } = load("src/utils/connect4Logic.ts");
const { Connect4Stats: stats } = load("src/utils/gameStats.ts");
const fixtures = JSON.parse(
  fs.readFileSync("src/data/connect4Lessons.json", "utf8"),
);
const lines = [];
for (let r = 0; r < 6; r++)
  for (let c = 0; c < 7; c++)
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ]) {
      if (
        r + 3 * dr >= 0 &&
        r + 3 * dr < 6 &&
        c + 3 * dc >= 0 &&
        c + 3 * dc < 7
      )
        lines.push(
          Array.from({ length: 4 }, (_, i) => (r + i * dr) * 7 + c + i * dc),
        );
    }
assert.equal(lines.length, 69);
const counts = Array.from({ length: 7 }, (_, c) =>
  lines.reduce((n, line) => n + line.filter((i) => i % 7 === c).length, 0),
);
assert.deepEqual(counts, [24, 36, 48, 60, 48, 36, 24]);
const winner = (b) => {
  for (const line of lines)
    if (b[line[0]] && line.every((i) => b[i] === b[line[0]])) return b[line[0]];
  return 0;
};
function drop(b, c, p) {
  const a = [...b];
  for (let r = 5; r >= 0; r--)
    if (!a[r * 7 + c]) {
      a[r * 7 + c] = p;
      return a;
    }
  return null;
}
const flat = (s) =>
  Array.from(s.board.flat()).map((x) =>
    x === "RED" ? 1 : x === "YELLOW" ? 2 : 0,
  );
const rows = (b) =>
  Array.from({ length: 6 }, (_, r) =>
    b
      .slice(r * 7, r * 7 + 7)
      .map((x) => ".RY"[x])
      .join(""),
  );
let compared = 0,
  leaves = 0;
function replay(moves) {
  let b = Array(42).fill(0),
    s = e.createInitialGameState();
  for (const [i, column] of moves.entries()) {
    assert.equal(winner(b), 0, "No moves after a win");
    assert(b.includes(0));
    assert(Number.isInteger(column) && column >= 1 && column <= 7);
    const next = drop(b, column - 1, 1 + (i % 2));
    assert(next, "No full-column move");
    b = next;
    s = e.makeMove(s, column - 1);
    assert.deepEqual(flat(s), b);
    assert.equal(
      s.winner,
      winner(b) === 1 ? "RED" : winner(b) === 2 ? "YELLOW" : null,
    );
    assert.equal(
      s.gameStatus,
      winner(b) ? "WIN" : b.includes(0) ? "PLAYING" : "DRAW",
    );
    compared++;
  }
  return { b, s };
}
const memo = new Map();
function solve(b, p) {
  const w = winner(b);
  if (w) return w === p ? 1 : -1;
  if (!b.includes(0)) return 0;
  const key = b.join("") + p;
  if (memo.has(key)) return memo.get(key);
  const value = Math.max(
    ...Array.from({ length: 7 }, (_, c) => drop(b, c, p))
      .filter(Boolean)
      .map((a) => -solve(a, 3 - p)),
  );
  memo.set(key, value);
  return value;
}
// Independent bitboard evaluator and a full unpruned game tree, with engine
// comparison at every edge. No production AI or memoised answer is reused.
function bitWin(b, p) {
  let bits = 0n;
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 7; c++)
      if (b[r * 7 + c] === p) bits |= 1n << BigInt(c * 7 + 5 - r);
  for (const shift of [1n, 7n, 6n, 8n]) {
    const pairs = bits & (bits >> shift);
    if (pairs & (pairs >> (2n * shift))) return true;
  }
  return false;
}
function exhaust(s, p) {
  const b = flat(s),
    w = bitWin(b, 1) ? 1 : bitWin(b, 2) ? 2 : 0;
  assert.equal(w, winner(b));
  assert.equal(s.gameStatus, w ? "WIN" : b.includes(0) ? "PLAYING" : "DRAW");
  if (w || !b.includes(0)) {
    leaves++;
    return w ? (w === p ? 1 : -1) : 0;
  }
  let best = -1;
  for (let c = 0; c < 7; c++)
    if (!b[c]) {
      const child = e.makeMove(s, c);
      assert.deepEqual(flat(child), drop(b, c, p));
      compared++;
      best = Math.max(best, -exhaust(child, 3 - p));
    }
  return best;
}
for (const f of fixtures) {
  const { b, s } = replay(f.moves);
  assert.deepEqual(rows(b), f.rows);
  if (f.scope === "endgame") {
    assert.equal(f.moves.length, 34);
    const values = {};
    for (let c = 0; c < 7; c++)
      if (!b[c]) {
        values[c + 1] = -solve(drop(b, c, 1), 2);
        assert.equal(values[c + 1], -exhaust(e.makeMove(s, c), 2));
      }
    assert.deepEqual(values, f.outcomes);
  }
}
let { b } = replay([1, 7, 2, 7, 3, 7]);
assert.equal(winner(drop(b, 3, 1)), 1);
assert.equal(winner(drop(b, 6, 2)), 2);
({ b } = replay([3, 7, 4, 7, 2]));
assert.equal(winner(b), 0);
for (let c = 0; c < 7; c++)
  if (!b[c]) {
    const yellow = drop(b, c, 2);
    assert.equal(winner(yellow), 0);
    assert(
      [0, 4].some((d) => {
        const red = drop(yellow, d, 1);
        return red && winner(red) === 1;
      }),
    );
  }
({ b } = replay([1, 2, 2, 3, 3, 7, 3, 7]));
assert([35, 29, 23].every((i) => b[i] === 1));
assert.equal(b[17], 0);
assert.equal(drop(b, 3, 1)[38], 1);
assert.equal(drop(b, 3, 1)[17], 0);
const draw = fixtures.find((f) => f.id === "saving-draw"),
  loss = fixtures.find((f) => f.id === "forced-loss");
const complete = replay([...draw.moves, 3, 4, 5, 7, 7, 7, 7, 7]);
assert.equal(complete.s.gameStatus, "DRAW");
const drawBad = replay([...draw.moves, 7, 7]);
assert.equal(drawBad.s.winner, "YELLOW");
assert([24,25,26,27].every(i=>drawBad.b[i]===2));
const blocked = replay([...loss.moves, 4]);
assert.equal(winner(blocked.b), 0);
assert.equal(solve(blocked.b, 2), 1);
for (let i = 0; i < 4; i++) stats.recordGame("win", "PVP");
for (let i = 0; i < 4; i++) stats.recordGame("loss", "PVP");
for (let i = 0; i < 2; i++) stats.recordGame("draw", "PVP");
assert.equal(stats.getWinRate(), 40);
stats.recordGame("draw", "PVP");
assert.equal(stats.getWinRate(), 36);
const articleSource = fs.readFileSync("src/data/articles.ts", "utf8");
for (const f of [draw, loss])
  assert(
    articleSource.includes(f.moves.join(", ")),
    "Published transcript must match fixture",
  );
assert(articleSource.includes("24, 36, 48, 60, 48, 36, 24"));
assert(articleSource.includes("3, 4, 5, 7, 7, 7, 7, 7"));
console.log(
  `Connect4 guide checks passed:69 geometric lines, four legal diagrams, ${compared} engine/reference edges, ${leaves} exhaustive ending leaves, independent bitboard outcomes, fork/support/win-first/draw continuation and real stats40%→36%.`,
);
