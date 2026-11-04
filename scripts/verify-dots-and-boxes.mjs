import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const modules = {};
function load(name) {
  if (modules[name]) return modules[name];
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(`src/utils/${name}.ts`, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, Date, require: (p) => load(p.replace("./", "")) },
  );
  return (modules[name] = exports);
}
const e = load("dotsAndBoxesEngine"),
  ai = load("dotsAndBoxesAI"),
  plain = (x) => JSON.parse(JSON.stringify(x));
// Independent reference uses geometric endpoint pairs, not the engine's box-index formula.
const coords = (n, id) => {
  let index = 0;
  for (let r = 0; r <= n; r++)
    for (let c = 0; c < n; c++) {
      if (index++ === id)
        return [
          [r, c],
          [r, c + 1],
        ];
    }
  for (let r = 0; r < n; r++)
    for (let c = 0; c <= n; c++) {
      if (index++ === id)
        return [
          [r, c],
          [r + 1, c],
        ];
    }
};
const key = (points) =>
  points
    .map((p) => p.join(","))
    .sort()
    .join("|");
function closed(n, edges) {
  const drawn = new Set(
      edges.flatMap((v, id) => (v ? [key(coords(n, id))] : [])),
    ),
    boxes = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const corners = [
        [r, c],
        [r, c + 1],
        [r + 1, c + 1],
        [r + 1, c],
      ];
      if (corners.every((p, i) => drawn.has(key([p, corners[(i + 1) % 4]]))))
        boxes.push(r * n + c);
    }
  return boxes;
}
let subsetMoves = 0;
for (let mask = 0; mask < 4096; mask++) {
  const edges = Array.from({ length: 12 }, (_, i) => !!(mask & (1 << i)));
  assert.deepEqual(plain(e.completedDotsBoxes(2, edges)), closed(2, edges));
  for (let id = 0; id < 12; id++)
    if (!edges[id]) {
      const b = edges.slice();
      b[id] = true;
      const before = closed(2, edges),
        after = closed(2, b);
      assert(
        after.length - before.length >= 0 && after.length - before.length <= 2,
      );
      subsetMoves++;
    }
}
for (const n of [2, 3, 4])
  for (let id = 0; id < e.dotsEdgeCount(n); id++) {
    const edge = e.dotsEdge(n, id),
      p = coords(n, id);
    assert.deepEqual(
      plain([edge.from, edge.to]),
      p.map(([row, column]) => ({ row, column })),
    );
    assert.equal(e.dotsEdgeBetween(n, edge.from, edge.to), id);
    assert.equal(e.dotsEdgeBetween(n, edge.to, edge.from), id);
  }
assert.equal(
  e.dotsEdgeBetween(2, { row: 0, column: 0 }, { row: 1, column: 1 }),
  null,
);
assert.equal(
  e.dotsEdgeBetween(2, { row: 0, column: 0 }, { row: 0, column: 2 }),
  null,
);
assert.equal(
  e.dotsEdgeBetween(2, { row: -1, column: 0 }, { row: 0, column: 0 }),
  null,
);
let games = 0,
  doubleCaptures = 0,
  draws = 0,
  retained = 0;
let rng = 1;
const rand = () => (rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0);
const ends = [];
for (const n of [2, 3, 4])
  for (let sample = 0; sample < 40; sample++) {
    let s = e.newDots(n);
    assert.equal(s.edges.length, 2 * n * (n + 1));
    while (s.result === null) {
      const legal = e.legalDotsEdges(s),
        edge = legal[rand() % legal.length],
        before = JSON.stringify(s),
        next = e.playDots(s, edge);
      assert.equal(JSON.stringify(s), before);
      const captures = closed(n, next.edges).filter((box) => !s.boxes[box]);
      assert.deepEqual(plain(next.captured), captures);
      assert.equal(next.turn, captures.length ? s.turn : s.turn === 1 ? 2 : 1);
      assert.equal(
        next.scores[s.turn - 1],
        s.scores[s.turn - 1] + captures.length,
      );
      assert.equal(
        next.scores.reduce((a, b) => a + b, 0),
        closed(n, next.edges).length,
      );
      assert.equal(e.playDots(next, edge), next);
      assert.deepEqual(plain(e.undoDots(next)), plain(s));
      assert.deepEqual(plain(e.replayDots(n, next.history)), plain(next));
      if (captures.length === 2) doubleCaptures++;
      if (captures.length) retained++;
      if (
        legal.length === 8 &&
        ends.filter((item) => item.size === n).length < 8
      )
        ends.push(s);
      s = next;
    }
    assert.equal(s.scores[0] + s.scores[1], n * n);
    assert(s.edges.every(Boolean));
    assert.equal(s.history.length, 2 * n * (n + 1));
    assert.equal(e.playDots(s, 0), s);
    assert.equal(
      s.result,
      s.scores[0] === s.scores[1] ? "draw" : s.scores[0] > s.scores[1] ? 1 : 2,
    );
    if (s.result === "draw") draws++;
    games++;
  }
assert(doubleCaptures > 0);
assert(draws > 0);
assert(retained > 0);
// Separate exhaustive future score difference, independent of game ownership/history/search.
function solve(n, edges, turn, root, memo = new Map()) {
  const k = edges.map((v) => (v ? 1 : 0)).join("") + turn;
  if (memo.has(k)) return memo.get(k);
  let best = turn === root ? -Infinity : Infinity;
  const before = closed(n, edges).length;
  let any = false;
  for (let edge = 0; edge < edges.length; edge++)
    if (!edges[edge]) {
      any = true;
      const b = edges.slice();
      b[edge] = true;
      const captures = closed(n, b).length - before,
        nextTurn = captures ? turn : turn === 1 ? 2 : 1,
        value =
          (turn === root ? 1 : -1) * captures +
          solve(n, b, nextTurn, root, memo);
      best = turn === root ? Math.max(best, value) : Math.min(best, value);
    }
  if (!any) best = 0;
  memo.set(k, best);
  return best;
}
for (const s of ends) {
  const root = s.turn,
    current = s.scores[root - 1] - s.scores[root === 1 ? 1 : 0],
    expected = solve(s.size, s.edges, root, root);
  const choice = ai.chooseDotsMove(s, "hard", 1, {
    nodes: 200000,
    ms: 20000,
    depth: 8,
  });
  assert(
    choice.exact,
    JSON.stringify({
      size: s.size,
      remaining: e.legalDotsEdges(s).length,
      choice,
      history: s.history,
    }),
  );
  assert.equal(choice.value, (current + expected) * 1000);
  const child = e.playDots(s, choice.edge),
    gain = child.captured.length + solve(s.size, child.edges, child.turn, root);
  assert.equal(gain, expected);
}
// A legal double-cross fixture: declining a one-box capture wins more later.
const control = e.replayDots(
  3,
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19],
);
const controlHard = ai.chooseDotsMove(control, "hard"),
  controlMedium = ai.chooseDotsMove(control, "medium");
assert.equal(control.turn, 1);
assert.deepEqual(plain(control.scores), [3, 1]);
assert.equal(controlHard.edge, 0);
assert(controlHard.exact);
assert.equal(controlHard.value, 3000);
assert.equal(e.playDots(control, controlHard.edge).captured.length, 0);
assert.equal(controlMedium.edge, 13);
assert.equal(e.playDots(control, 13).captured.length, 1);
assert.equal(solve(3, control.edges, 1, 1), 1);
const greedyChild = e.playDots(control, 13);
assert.equal(
  greedyChild.captured.length +
    solve(3, greedyChild.edges, greedyChild.turn, 1),
  -1,
);
let aiGames = 0;
for (const size of [2, 3, 4])
  for (const level of ["easy", "medium", "hard"]) {
    let s = e.newDots(size);
    while (s.result === null) {
      const choice = ai.chooseDotsMove(s, level, rand(), {
        nodes: 3000,
        ms: 40,
        depth: 4,
      });
      assert(e.legalDotsEdges(s).includes(choice.edge));
      const before = s;
      s = e.playDots(s, choice.edge);
      assert.notEqual(s, before);
    }
    assert.equal(s.scores[0] + s.scores[1], size * size);
    aiGames++;
  }
for (let i = 0; i < 100; i++) {
  const s = e.dotsDaily(`daily:${i}`);
  assert.equal(s.history.length, 8);
  assert.equal(s.turn, 1);
  assert.equal(s.scores[0] + s.scores[1], 0);
  assert.equal(s.result, null);
  assert.deepEqual(plain(s), plain(e.dotsDaily(`daily:${i}`)));
}
const start = e.newDots(4);
const fallback = ai.chooseDotsMove(start, "hard", 1, { nodes: 1, ms: 1 });
assert(e.legalDotsEdges(start).includes(fallback.edge));
assert(!fallback.exact);
assert.equal(fallback.depth, 0);
assert.throws(() => e.replayDots(2, [0, 0]));
assert.throws(() => e.replayDots(2, [100]));
assert.equal(e.playDots(start, -1), start);
console.log(
  `Dots and Boxes:4096 subsets/${subsetMoves} missing-edge checks,${games} full reference games,${doubleCaptures} double captures,${draws} draws,${ends.length} independent exhaustive endgames across all sizes, a verified capture-declining control fixture,${aiGames} bounded AI games,100 deterministic daily prefixes and legal fallback passed.`,
);
