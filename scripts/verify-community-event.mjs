import assert from "node:assert/strict";
import fs from "node:fs";
const source = fs.readFileSync("src/data/articles.ts", "utf8");
const start = source.indexOf(
  "slug: 'tic-tac-toe-tournaments-community-building'",
);
const guide = source.slice(start, source.indexOf("\n  {", start));
// Read the actual published fixture claims and verify their coverage, rather than a second copy.
const rounds = [
  ...guide.matchAll(/- Round (\d): ([A-D])–([A-D]); ([A-D])–([A-D])\./g),
].map((m) => [
  Number(m[1]),
  [
    [m[2], m[3]],
    [m[4], m[5]],
  ],
]);
assert.equal(rounds.length, 3);
const pairs = new Set(),
  starts = Object.fromEntries(
    "ABCD".split("").map((p) => [p, { x: 0, o: 0, games: 0 }]),
  );
for (const [round, matches] of rounds) {
  assert(round >= 1 && round <= 3);
  assert.equal(new Set(matches.flat()).size, 4);
  for (const pair of matches) {
    const key = [...pair].sort().join("");
    assert(!pairs.has(key));
    pairs.add(key);
    for (const order of [pair, [...pair].reverse()]) {
      starts[order[0]].x++;
      starts[order[1]].o++;
      starts[order[0]].games++;
      starts[order[1]].games++;
    }
  }
}
assert.deepEqual([...pairs].sort(), ["AB", "AC", "AD", "BC", "BD", "CD"]);
for (const player of "ABCD")
  assert.deepEqual(starts[player], { x: 3, o: 3, games: 6 });
const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
function finish(moves) {
  const board = Array(9).fill(null);
  let outcome = null;
  moves.forEach((cell, index) => {
    assert.equal(outcome, null);
    assert.equal(board[cell], null);
    const p = index % 2 ? "O" : "X";
    board[cell] = p;
    outcome = lines.some((line) => line.every((c) => board[c] === p))
      ? p
      : board.every(Boolean)
        ? "draw"
        : null;
  });
  assert(outcome);
  return outcome;
}
const outcomes = {
  X: finish([0, 3, 1, 4, 2]),
  O: finish([0, 3, 1, 4, 8, 5]),
  draw: finish([0, 1, 2, 4, 3, 5, 7, 6, 8]),
};
const plan = [
  [
    ["A", "D"],
    ["X", "draw"],
  ],
  [
    ["B", "C"],
    ["draw", "draw"],
  ],
  [
    ["A", "C"],
    ["draw", "X"],
  ],
  [
    ["D", "B"],
    ["X", "X"],
  ],
  [
    ["A", "B"],
    ["draw", "draw"],
  ],
  [
    ["C", "D"],
    ["X", "O"],
  ],
];
const points = { A: 0, B: 0, C: 0, D: 0 };
const ledger = [
  ...guide.matchAll(/Pair points ([A-D]) ([\d.]+), ([A-D]) ([\d.]+)\./g),
];
assert.equal(ledger.length, plan.length);
const stated = { A: 0, B: 0, C: 0, D: 0 };
ledger.forEach((m, index) => {
  assert.deepEqual([m[1], m[3]], plan[index][0]);
  assert.equal(Number(m[2]) + Number(m[4]), 2);
  stated[m[1]] += Number(m[2]);
  stated[m[3]] += Number(m[4]);
});
for (const [pair, boards] of plan)
  boards.forEach((result, game) => {
    const [x, o] = game === 0 ? pair : [...pair].reverse(),
      outcome = outcomes[result];
    if (outcome === "draw") {
      points[x] += 0.5;
      points[o] += 0.5;
    } else points[outcome === "X" ? x : o]++;
  });
assert.deepEqual(points, { A: 3, B: 3, C: 4.5, D: 1.5 });
assert.deepEqual(stated, points);
assert.equal(
  Object.values(points).reduce((sum, n) => sum + n),
  12,
);
assert(
  guide.includes("C finishes on 4.5 points; A and B have 3 each; D has 1.5."),
);
assert(
  guide.includes(
    "DoStrike does not provide event registration, a tournament bracket, a standings table or a tournament clock.",
  ),
);
assert(!guide.includes("VR Tournaments"));
assert(guide.includes('The website normally presents a first-to-two-wins match and says that draws replay.'));
// The same rotation construction gives independently checked sizes without claiming a site feature.
for (const n of [4, 6, 8]) {
  let rotation = Array.from({ length: n }, (_, i) => i);
  const seen = new Set();
  for (let r = 0; r < n - 1; r++) {
    const used = new Set();
    for (let i = 0; i < n / 2; i++) {
      const pair = [rotation[i], rotation[n - 1 - i]];
      pair.forEach((p) => {
        assert(!used.has(p));
        used.add(p);
      });
      const key = [...pair].sort((a, b) => a - b).join(":");
      assert(!seen.has(key));
      seen.add(key);
    }
    rotation = [rotation[0], rotation[n - 1], ...rotation.slice(1, -1)];
  }
  assert.equal(seen.size, (n * (n - 1)) / 2);
}
console.log(
  "Community guide verified:3 rounds/6 pairs/12 legal boards, balanced starts, worked standings/points conservation and4/6/8-player rotation coverage.",
);
