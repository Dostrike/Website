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
    { exports, require: (p) => load(p.replace("./", "")) },
  );
  return (modules[name] = exports);
}
const e = load("seaBattleEngine"),
  ai = load("seaBattleAI");
const plain = (value) => JSON.parse(JSON.stringify(value));
const lengths = [5, 4, 3, 3, 2];
// Independent geometry walks row/column coordinates, never engine cell helpers.
function referenceCells(p) {
  if (
    !p ||
    !Number.isInteger(p.ship) ||
    p.ship < 0 ||
    p.ship > 4 ||
    !Number.isInteger(p.start) ||
    p.start < 0 ||
    p.start > 99 ||
    !["horizontal", "vertical"].includes(p.axis)
  )
    return null;
  let row = Math.floor(p.start / 10),
    column = p.start % 10;
  const cells = [];
  for (let i = 0; i < lengths[p.ship]; i++) {
    if (row > 9 || column > 9) return null;
    cells.push(row * 10 + column);
    if (p.axis === "horizontal") column++;
    else row++;
  }
  return cells;
}
function validReference(fleet, complete = true) {
  if (
    !Array.isArray(fleet) ||
    fleet.length > 5 ||
    (complete && fleet.length !== 5)
  )
    return false;
  const ids = new Set(),
    cells = new Set();
  for (const p of fleet) {
    const occupied = referenceCells(p);
    if (!occupied || ids.has(p.ship) || occupied.some((c) => cells.has(c)))
      return false;
    ids.add(p.ship);
    occupied.forEach((c) => cells.add(c));
  }
  return true;
}
let geometry = 0;
for (let ship = -1; ship <= 5; ship++)
  for (let start = -11; start <= 110; start++)
    for (const axis of ["horizontal", "vertical", "diagonal"]) {
      const p = { ship, start, axis };
      assert.deepEqual(plain(e.seaShipCells(p)), referenceCells(p));
      geometry++;
    }
for (const p of [
  null,
  {},
  { ship: 0, start: 0.1, axis: "horizontal" },
  { ship: 1, start: NaN, axis: "vertical" },
  { ship: "0", start: 0, axis: "horizontal" },
])
  assert.equal(e.seaShipCells(p), null);
assert.equal(e.seaCoordinate(0), "A1");
assert.equal(e.seaCoordinate(9), "A10");
assert.equal(e.seaCoordinate(99), "J10");
for (const cell of [-1, 100, 1.1, NaN, "1"])
  assert.throws(() => e.seaCoordinate(cell));
const unique = new Set();
for (let seed = 0; seed < 500; seed++) {
  const fleet = e.generateSeaFleet(seed);
  assert(validReference(fleet));
  assert.equal(new Set(fleet.flatMap(referenceCells)).size, 17);
  assert.deepEqual(plain(fleet), plain(e.generateSeaFleet(seed)));
  unique.add(JSON.stringify(fleet));
}
assert.equal(unique.size, 500);
for (const seed of [-1, 0x100000000, NaN, Infinity, 1.5, "1"])
  assert.throws(() => e.generateSeaFleet(seed));
const touching = lengths.map((_, ship) => ({
  ship,
  start: ship * 10,
  axis: "horizontal",
}));
assert(validReference(touching));
assert(e.validSeaFleet(touching));
let partial = [];
for (const placement of touching) {
  partial = e.placeSeaShip(partial, placement);
  assert(partial && e.validSeaFleet(partial, false));
}
const moved = e.placeSeaShip(partial, {
  ship: 0,
  start: 95,
  axis: "horizontal",
});
assert(moved && moved.length === 5 && moved[0].start === 95);
assert.equal(
  e.placeSeaShip(partial, { ship: 0, start: 10, axis: "horizontal" }),
  null,
);
assert.equal(partial[0].start, 0);
for (const fleet of [
  null,
  [],
  [...touching, touching[0]],
  [touching[0], ...touching.slice(0, 4)],
  touching.map((p) => (p.ship === 4 ? { ...p, start: 0 } : p)),
  new Array(5),
]) {
  assert.equal(e.validSeaFleet(fleet), false);
  assert.throws(() => e.newSea(fleet, touching));
}
for (let a = 0; a < 100; a++)
  for (let b = 0; b < 100; b++) {
    const fleet = [
      { ship: 0, start: a, axis: "horizontal" },
      { ship: 1, start: b, axis: "vertical" },
    ];
    assert.equal(e.validSeaFleet(fleet, false), validReference(fleet, false));
  }

function referenceView(fleet, shots) {
  const marks = Array(100).fill("unknown"),
    sunk = [];
  for (const cell of shots)
    marks[cell] = fleet.some((p) => referenceCells(p).includes(cell))
      ? "hit"
      : "miss";
  for (const p of fleet) {
    const cells = referenceCells(p);
    if (cells.every((c) => shots.includes(c))) {
      cells.forEach((c) => (marks[c] = "sunk"));
      sunk.push({ ship: p.ship, length: cells.length, cells });
    }
  }
  return { marks, sunk: sunk.sort((a, b) => a.ship - b.ship) };
}
// Exact guide fixtures: a hit switches turns, final segment sinks, adjacent ships stay unresolved.
let fixture = e.newSea(touching, touching);
const input = plain(fixture);
touching[0].start = 95;
assert.deepEqual(plain(fixture), input); // New state owns its input fleets.
touching[0].start = 0;
fixture = e.playSea(fixture, 1, 0);
assert.equal(fixture.turn, 2);
assert.equal(fixture.history[0].result, "hit");
assert.equal(fixture.history[0].sunk, null);
assert.deepEqual(
  plain(e.seaKnowledge(fixture, 1)),
  referenceView(touching, [0]),
);
fixture = e.playSea(fixture, 2, 99);
assert.equal(fixture.turn, 1);
assert.equal(fixture.history[1].result, "miss");
fixture = e.playSea(fixture, 1, 10);
assert.equal(e.seaKnowledge(fixture, 1).sunk.length, 0); // Adjacent hits are on different ships.
for (const [player, cell] of [
  [1, 2],
  [2, 99],
  [2, -1],
  [2, 100],
  [2, NaN],
  [2, 1.5],
]) {
  const before = JSON.stringify(fixture);
  assert.equal(e.playSea(fixture, player, cell), null);
  assert.equal(JSON.stringify(fixture), before);
}
const sinking = e.replaySea(touching, touching, [
  { player: 1, cell: 0 },
  { player: 2, cell: 99 },
  { player: 1, cell: 10 },
  { player: 2, cell: 98 },
  { player: 1, cell: 1 },
  { player: 2, cell: 97 },
  { player: 1, cell: 2 },
  { player: 2, cell: 96 },
  { player: 1, cell: 3 },
  { player: 2, cell: 95 },
  { player: 1, cell: 4 },
]);
assert(sinking);
assert.equal(sinking.turn, 2);
assert.equal(sinking.history.at(-1).result, "sunk");
assert.equal(sinking.history.at(-1).sunk, 0);
assert.equal(e.seaKnowledge(sinking, 1).marks[10], "hit");
assert.deepEqual(
  plain(e.seaKnowledge(sinking, 1).sunk[0].cells),
  [0, 1, 2, 3, 4],
);
assert.deepEqual(
  plain(e.seaShipCells({ ship: 0, start: 46, axis: "vertical" })),
  [46, 56, 66, 76, 86],
);
assert.equal(e.seaShipCells({ ship: 0, start: 46, axis: "horizontal" }), null);
// Public-knowledge validation includes sparse arrays, forbidden hidden fields and malformed sunk lines.
const empty = { marks: Array(100).fill("unknown"), sunk: [] };
assert(e.validSeaKnowledge(empty));
for (const value of [
  null,
  {},
  { marks: new Array(100), sunk: [] },
  { ...empty, fleet: touching },
  { marks: Array(99).fill("unknown"), sunk: [] },
  { ...empty, sunk: [{ ship: 4, length: 2, cells: [9, 10] }] },
  { ...empty, marks: Array(100).fill("sunk") },
]) {
  assert.equal(e.validSeaKnowledge(value), false);
  assert.throws(() => ai.chooseSeaShot(value, "hard", 1));
}
assert.throws(() => ai.chooseSeaShot(empty, "perfect", 1));
assert.throws(() => ai.chooseSeaShot(empty, "easy", -1));

// Distinct hidden layouts with identical actual observed transcripts must produce identical choices.
const other = e.generateSeaFleet(943);
assert.notDeepEqual(plain(other), touching);
let hiddenA = e.newSea(touching, touching),
  hiddenB = e.newSea(touching, other);
const commonWater = Array.from({ length: 100 }, (_, i) => i).filter(
  (cell) =>
    ![...touching, ...other].some((p) => referenceCells(p).includes(cell)),
);
for (const cell of commonWater.slice(0, 9)) {
  hiddenA = e.playSea(hiddenA, 1, cell);
  hiddenB = e.playSea(hiddenB, 1, cell);
  const answer = 99 - (hiddenA.history.length - 1) / 2;
  hiddenA = e.playSea(hiddenA, 2, answer);
  hiddenB = e.playSea(hiddenB, 2, answer);
  const first = e.seaKnowledge(hiddenA, 1),
    second = e.seaKnowledge(hiddenB, 1);
  assert.deepEqual(plain(first), plain(second));
  assert.deepEqual(Object.keys(first).sort(), ["marks", "sunk"]);
  for (const level of ["easy", "medium", "hard"])
    for (let seed = 0; seed < 12; seed++)
      assert.deepEqual(
        plain(ai.chooseSeaShot(first, level, seed)),
        plain(ai.chooseSeaShot(second, level, seed)),
      );
}
// A second pair shares observed hits and a sunk ship, while an unhit ship is relocated.
const relocated = touching.map((p) =>
  p.ship === 4 ? { ...p, start: 95 } : { ...p },
);
let hitA = e.newSea(touching, touching),
  hitB = e.newSea(touching, relocated);
for (const cell of [0, 10, 1, 2, 3, 4, 11, 12, 13]) {
  hitA = e.playSea(hitA, 1, cell);
  hitB = e.playSea(hitB, 1, cell);
  const first = e.seaKnowledge(hitA, 1),
    second = e.seaKnowledge(hitB, 1);
  assert.deepEqual(plain(first), plain(second));
  for (const level of ["easy", "medium", "hard"])
    for (let seed = 0; seed < 12; seed++)
      assert.deepEqual(
        plain(ai.chooseSeaShot(first, level, seed)),
        plain(ai.chooseSeaShot(second, level, seed)),
      );
  const answer = 99 - (hitA.history.length - 1) / 2;
  hitA = e.playSea(hitA, 2, answer);
  hitB = e.playSea(hitB, 2, answer);
}
// Independent Hard evaluator enumerates row/column segments without engine geometry.
function referenceHard(view) {
  const hunt = Array(100).fill(0),
    target = Array(100).fill(0);
  for (let ship = 0; ship < 5; ship++) {
    if (view.sunk.some((p) => p.ship === ship)) continue;
    for (let row = 0; row < 10; row++)
      for (let column = 0; column < 10; column++)
        for (const [dr, dc] of [
          [1, 0],
          [0, 1],
        ]) {
          const line = Array.from({ length: lengths[ship] }, (_, i) => [
            row + dr * i,
            column + dc * i,
          ]);
          if (line.some(([r, c]) => r >= 10 || c >= 10)) continue;
          const cells = line.map(([r, c]) => r * 10 + c);
          if (cells.some((c) => ["miss", "sunk"].includes(view.marks[c])))
            continue;
          const hits = cells.filter((c) => view.marks[c] === "hit").length;
          for (const c of cells)
            if (view.marks[c] === "unknown") {
              hunt[c]++;
              target[c] += hits * hits;
            }
        }
  }
  const unknown = view.marks.flatMap((mark, c) =>
    mark === "unknown" ? [c] : [],
  );
  const score = unknown.some((c) => target[c]) ? target : hunt;
  const maximum = Math.max(...unknown.map((c) => score[c]));
  return unknown.filter((c) => score[c] === maximum);
}
// Original teaching fixture: E5 hit, D5/E4 misses; only E6/F5 maximize this heuristic.
const densityFixture = { marks: Array(100).fill("unknown"), sunk: [] };
densityFixture.marks[44] = "hit";
densityFixture.marks[34] = "miss";
densityFixture.marks[43] = "miss";
const teachingFleet = touching.map((p) =>
  p.ship === 0 ? { ...p, start: 44 } : { ...p },
);
const teachingRound = e.replaySea(touching, teachingFleet, [
  { player: 1, cell: 44 },
  { player: 2, cell: 99 },
  { player: 1, cell: 34 },
  { player: 2, cell: 98 },
  { player: 1, cell: 43 },
]);
assert(teachingRound);
assert.deepEqual(plain(e.seaKnowledge(teachingRound, 1)), densityFixture);
assert.deepEqual(referenceHard(densityFixture), [45, 54]);
for (let seed = 0; seed < 50; seed++)
  assert(
    [45, 54].includes(ai.chooseSeaShot(densityFixture, "hard", seed).cell),
  );
let completed = 0,
  shotsChecked = 0,
  sunkChecked = 0,
  hardChecked = 0,
  winsA = 0,
  winsB = 0;
for (let round = 0; round < 90; round++) {
  const fleets = [
    plain(e.generateSeaFleet(round * 2 + 1000)),
    plain(e.generateSeaFleet(round * 2 + 1001)),
  ];
  let state = e.newSea(...fleets);
  const shots = [[], []];
  let expectedTurn = 1,
    expectedWinner = null;
  while (!state.winner) {
    assert(state.history.length < 199);
    assert.equal(state.turn, expectedTurn);
    const player = state.turn,
      target = fleets[player === 1 ? 1 : 0],
      level = ["easy", "medium", "hard"][(round + player) % 3];
    const view = e.seaKnowledge(state, player),
      viewBefore = JSON.stringify(view),
      before = JSON.stringify(state);
    assert(e.validSeaKnowledge(view));
    assert.deepEqual(plain(view), referenceView(target, shots[player - 1]));
    const decision = ai.chooseSeaShot(
      view,
      level,
      (round * 200 + state.history.length) >>> 0,
    );
    assert(decision && view.marks[decision.cell] === "unknown");
    assert(decision.examined <= 1000);
    assert.equal(JSON.stringify(view), viewBefore);
    if (level === "hard") {
      assert(referenceHard(view).includes(decision.cell));
      hardChecked++;
    }
    shots[player - 1].push(decision.cell);
    const ship = target.find((p) => referenceCells(p).includes(decision.cell));
    const sunk =
      ship && referenceCells(ship).every((c) => shots[player - 1].includes(c))
        ? ship.ship
        : null;
    const result = sunk !== null ? "sunk" : ship ? "hit" : "miss";
    expectedWinner = target.every((p) =>
      referenceCells(p).every((c) => shots[player - 1].includes(c)),
    )
      ? player
      : null;
    const next = e.playSea(state, player, decision.cell);
    assert(next);
    assert.equal(JSON.stringify(state), before);
    assert.deepEqual(plain(next.history.at(-1)), {
      player,
      cell: decision.cell,
      result,
      sunk,
    });
    assert.equal(next.winner, expectedWinner);
    expectedTurn = expectedWinner ?? (player === 1 ? 2 : 1);
    assert.equal(next.turn, expectedTurn);
    if (sunk !== null) sunkChecked++;
    for (const side of [1, 2]) {
      const knowledge = e.seaKnowledge(next, side);
      assert(e.validSeaKnowledge(knowledge));
      assert.deepEqual(
        plain(knowledge),
        referenceView(fleets[side === 1 ? 1 : 0], shots[side - 1]),
      );
    }
    state = next;
    shotsChecked++;
  }
  completed++;
  if (state.winner === 1) winsA++;
  else winsB++;
  assert.equal(e.seaKnowledge(state, state.winner).sunk.length, 5);
  for (const level of ["easy", "medium", "hard"])
    assert.equal(
      ai.chooseSeaShot(e.seaKnowledge(state, state.winner), level, 0),
      null,
    );
  assert.equal(e.playSea(state, state.turn, 0), null);
  assert.deepEqual(plain(e.replaySea(...fleets, state.history)), plain(state));
  assert.equal(
    e.replaySea(...fleets, [
      ...state.history,
      { player: state.turn, cell: 99 },
    ]),
    null,
  );
  assert.equal(e.replaySea(...fleets, [{ player: 2, cell: 99 }]), null);
  assert.equal(
    e.replaySea(...fleets, [
      { player: 1, cell: 99 },
      { player: 2, cell: 99 },
      { player: 1, cell: 99 },
    ]),
    null,
  );
}
assert(winsA && winsB);
console.log(
  JSON.stringify({
    geometry,
    partialFleetPairs: 10000,
    reproducibleFleets: unique.size,
    completed,
    shotsChecked,
    sunkChecked,
    hardChecked,
    winsA,
    winsB,
    hiddenLayoutInvariance:
      "18 observed prefixes including hits/sinks × 3 levels × 12 seeds",
  }),
);
