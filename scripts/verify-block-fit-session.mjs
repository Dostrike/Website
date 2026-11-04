import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
const cache = new Map();
function load(file) {
  const name = path.resolve(file);
  if (cache.has(name)) return cache.get(name);
  const exports = {};
  cache.set(name, exports);
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(name, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      require: (ref) => load(path.resolve(path.dirname(name), ref + ".ts")),
    },
  );
  return exports;
}
const engine = load("src/utils/blockFitEngine.ts");
const session = load("src/utils/blockFitSession.ts");
const records = load("src/utils/blockFitRecords.ts");
const { blockAnchors, blockHasMove } = engine;
const {
  newBlockRound,
  actBlockRound,
  previewBlockSwap,
  previewBlockRevive,
  replayBlockRound,
  encodeBlockRound,
  decodeBlockRound,
  restartBlockRound,
  validBlockDay,
  dailyBlockSeed,
  canUndoBlockRound,
  blockInitialRound,
  readBlockRound,
  writeBlockRound,
  blockSaveKey,
  BLOCK_SAVE_ACTION_LIMIT,
} = session;
const {
  emptyBlockRecords,
  recordBlockResult,
  encodeBlockRecords,
  decodeBlockRecords,
  readBlockRecords,
  writeBlockRecords,
  blockRecordsKey,
} = records;
const plain = (v) => JSON.parse(JSON.stringify(v));
const same = (a, b, message) => assert.deepEqual(plain(a), plain(b), message);
const memory = () => {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
  };
};
function placements(round) {
  return Array.from(round.game.tray).flatMap((shape, slot) =>
    shape === null
      ? []
      : Array.from(blockAnchors(round.game.board, shape), (anchor) => ({
          type: "place",
          slot,
          anchor,
        })),
  );
}
let rng = 3341;
const choose = (n) => {
  rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
  return Math.floor((rng / 4294967296) * n);
};
let placed = 0,
  reloads = 0,
  undos = 0,
  refills = 0,
  swapRecoveries = 0,
  reviveRecoveries = 0;
function complete(round, verify = false) {
  for (let step = 0; step < 2000 && !round.game.over; step++) {
    const options = placements(round);
    assert(options.length);
    const action = options[choose(options.length)],
      before = JSON.stringify(round),
      next = actBlockRound(round, action);
    assert.notEqual(next, round);
    assert.equal(JSON.stringify(round), before);
    if (verify) {
      same(decodeBlockRound(encodeBlockRound(next)), next);
      reloads++;
      same(replayBlockRound(next.id, next.seed, next.day, next.actions), next);
      const undone = actBlockRound(next, { type: "undo" });
      same(undone.game, round.game);
      assert(undone.assisted);
      assert.equal(undone.actions.at(-1).type, "undo");
      undos++;
      const redone = actBlockRound(undone, action);
      same(redone.game, next.game);
      same(decodeBlockRound(encodeBlockRound(redone)), redone);
      reloads++;
    }
    if (next.game.trayIndex > round.game.trayIndex) refills++;
    round = next;
    placed++;
  }
  assert(round.game.over, "A natural no-piece-fits state is required");
  assert.equal(
    round.finished,
    false,
    "Helper decision must precede completion",
  );
  return round;
}
assert(validBlockDay("2024-02-29"));
assert(!validBlockDay("2026-02-29"));
assert(!validBlockDay("2026-11-31"));
assert(!validBlockDay("2026-1-05"));
assert(!validBlockDay("not-a-date"));
assert.throws(() => newBlockRound("", "seed"));
assert.throws(() => newBlockRound("id", ""));
assert.throws(() => newBlockRound("id", "x".repeat(101)));
assert.throws(() => newBlockRound("id", "ordinary", "2026-11-05"));
assert.throws(() => dailyBlockSeed("2026-02-29"));
let results = emptyBlockRecords();
const completed = [];
for (let n = 0; n < 36; n++) {
  const day = n % 2 ? null : `2026-11-${String((n % 28) + 1).padStart(2, "0")}`;
  const seed = day ? dailyBlockSeed(day) : `classic-${n}`;
  let round = newBlockRound(`round-${n}`, seed, day);
  assert.equal(canUndoBlockRound(round), false);
  assert.equal(actBlockRound(round, { type: "finish" }), round);
  assert.equal(previewBlockRevive(round, 0), null);
  if (n % 5 === 0) {
    const one = placements(round)[0];
    round = actBlockRound(round, one);
    const before = JSON.stringify(round),
      swap = previewBlockSwap(round);
    assert.equal(JSON.stringify(round), before, "Preview consumed a helper");
    for (let slot = 0; slot < 3; slot++)
      if (round.game.tray[slot] === null) assert.equal(swap[slot], null);
    const swapped = actBlockRound(round, { type: "swap" });
    assert(swapped.assisted && swapped.swapUsed);
    assert.equal(swapped.game.trayIndex, round.game.trayIndex);
    assert.equal(swapped.game.score, round.game.score);
    assert.equal(swapped.game.combo, round.game.combo);
    same(swapped.game.moves, round.game.moves);
    const undoSwap = actBlockRound(swapped, { type: "undo" });
    same(undoSwap.game, round.game);
    assert(
      undoSwap.swapUsed && undoSwap.assisted,
      "Undo cannot refund an attempt helper",
    );
    assert.equal(previewBlockSwap(undoSwap), null);
    assert.equal(actBlockRound(undoSwap, { type: "swap" }), undoSwap);
    same(decodeBlockRound(encodeBlockRound(undoSwap)), undoSwap);
    round = undoSwap;
  }
  round = complete(round, true);
  const before = JSON.stringify(round);
  let firstRevive = null;
  for (let anchor = 0; anchor < 64; anchor++) {
    const p = previewBlockRevive(round, anchor);
    assert(p);
    const r = Math.floor(anchor / 8),
      c = anchor % 8;
    const cells = [];
    for (let y = r; y < 8 && y < r + 3; y++)
      for (let x = c; x < 8 && x < c + 3; x++) cells.push(y * 8 + x);
    same(p.cells, cells);
    same(
      p.cleared,
      cells.filter((i) => round.game.board[i]),
    );
    const expected = Array.from(round.game.board);
    for (const i of cells) expected[i] = 0;
    same(p.board, expected);
    assert.equal(p.canMove, blockHasMove(expected, round.game.tray));
    if (p.canMove && p.cleared.length && firstRevive === null)
      firstRevive = anchor;
    if (!p.canMove || !p.cleared.length)
      assert.equal(actBlockRound(round, { type: "revive", anchor }), round);
  }
  assert.equal(
    JSON.stringify(round),
    before,
    "Revive previews changed the run",
  );
  const corner = previewBlockRevive(round, 63);
  same(corner.cells, [63]);
  if (n % 5 === 1 && firstRevive !== null) {
    const preview = previewBlockRevive(round, firstRevive),
      revived = actBlockRound(round, { type: "revive", anchor: firstRevive });
    assert(revived.reviveUsed && revived.assisted && !revived.game.over);
    same(revived.game.board, preview.board);
    assert.equal(revived.game.score, round.game.score);
    assert.equal(revived.game.combo, round.game.combo);
    assert.equal(revived.game.trayIndex, round.game.trayIndex);
    same(revived.game.tray, round.game.tray);
    const undone = actBlockRound(revived, { type: "undo" });
    same(undone.game, round.game);
    assert(undone.reviveUsed && undone.assisted);
    assert.equal(
      actBlockRound(undone, { type: "revive", anchor: firstRevive }),
      undone,
    );
    same(decodeBlockRound(encodeBlockRound(undone)), undone);
    // Undo of the preceding placement remains available; its assistance stays sticky.
    const earlier = actBlockRound(undone, { type: "undo" });
    assert(!earlier.game.over && earlier.reviveUsed);
    round = complete(earlier, true);
    reviveRecoveries++;
  } else if (n % 5 === 2 && !round.swapUsed) {
    const swapped = actBlockRound(round, { type: "swap" });
    assert(swapped.swapUsed && swapped.assisted);
    if (!swapped.game.over) swapRecoveries++;
    round = complete(swapped, true);
  }
  assert.equal(
    recordBlockResult(results, round),
    results,
    "No premature score while a recovery decision is pending",
  );
  const finished = actBlockRound(round, { type: "finish" });
  assert(finished.finished && finished.game.over);
  assert.equal(canUndoBlockRound(finished), false);
  for (const action of [
    { type: "undo" },
    { type: "swap" },
    { type: "revive", anchor: 0 },
    { type: "place", slot: 0, anchor: 0 },
    { type: "finish" },
  ])
    assert.equal(actBlockRound(finished, action), finished);
  same(decodeBlockRound(encodeBlockRound(finished)), finished);
  reloads++;
  const altered = JSON.parse(encodeBlockRound(finished));
  Object.assign(altered, {
    game: { score: 999999, board: [] },
    assisted: false,
    swapUsed: false,
    reviveUsed: false,
    finished: false,
    undoFrames: [{}],
  });
  same(
    decodeBlockRound(JSON.stringify(altered)),
    finished,
    "Derived fields have no authority",
  );
  const nextRecords = recordBlockResult(results, finished);
  assert.notEqual(nextRecords, results);
  assert.equal(recordBlockResult(nextRecords, finished), nextRecords);
  same(decodeBlockRecords(encodeBlockRecords(nextRecords)), nextRecords);
  if (day) assert(nextRecords.days[day]);
  const restart = restartBlockRound(finished, `${finished.id}-restart`);
  same(restart.game, newBlockRound("other-id", seed, day).game);
  assert(
    !restart.assisted &&
      !restart.swapUsed &&
      !restart.reviveUsed &&
      !restart.finished,
  );
  assert.equal(restart.day, day);
  assert.throws(() => restartBlockRound(finished, finished.id));
  results = nextRecords;
  completed.push(finished);
}
assert(swapRecoveries > 0 && reviveRecoveries > 0);
assert.equal(results.classic.games, 18);
assert.equal(results.daily.games, 18);
assert.equal(results.classic.cleanBest !== null, true);
assert.equal(results.daily.cleanBest !== null, true);
assert.equal(results.classic.assistedBest !== null, true);
assert.equal(results.daily.assistedBest !== null, true);
// Real earlier-date challenges stay on their original date, even if finished later.
for (const day of ["2024-02-29", "2026-11-04", "2026-11-05", "2026-11-06"]) {
  const round = actBlockRound(
    complete(newBlockRound(`dated-${day}`, dailyBlockSeed(day), day)),
    { type: "finish" },
  );
  const before = Object.keys(results.days),
    next = recordBlockResult(results, round);
  assert.equal(next.days[day].games, (results.days[day]?.games ?? 0) + 1);
  assert.equal(
    next.days[day][round.assisted ? "assistedBest" : "cleanBest"],
    Math.max(results.days[day]?.cleanBest ?? 0, round.game.score),
  );
  for (const other of before)
    if (other !== day) same(next.days[other], results.days[other]);
  assert.equal(restartBlockRound(round, `restart-${day}`).day, day);
  results = next;
}
const source = completed[0],
  base = newBlockRound("navigation", "carry");
const carry = actBlockRound(base, placements(base)[0]),
  later = actBlockRound(carry, placements(carry)[0]);
same(blockInitialRound(encodeBlockRound(carry), source), carry);
same(blockInitialRound(encodeBlockRound(base), later), later);
same(blockInitialRound("bad", source), source);
const store = memory();
assert(writeBlockRound(carry, store));
same(readBlockRound(store), carry);
assert(writeBlockRecords(results, store));
same(readBlockRecords(store), results);
assert(store.getItem(blockSaveKey));
assert(store.getItem(blockRecordsKey));
const blocked = {
  getItem() {
    throw Error("blocked");
  },
  setItem() {
    throw Error("blocked");
  },
};
assert.equal(readBlockRound(blocked), null);
assert.equal(writeBlockRound(carry, blocked), false);
same(readBlockRecords(blocked), emptyBlockRecords());
assert.equal(writeBlockRecords(results, blocked), false);
same(
  blockInitialRound(encodeBlockRound(carry), readBlockRound(blocked)),
  carry,
);
const raw = JSON.parse(encodeBlockRound(source));
for (const change of [
  { day: "2026-02-29" },
  { day: "2026-11-05", seed: "wrong-daily" },
  { day: undefined },
  { seed: "" },
  { id: "" },
  { actions: [null] },
  { actions: [{ type: "undo" }] },
  { actions: [{ type: "finish" }] },
  { actions: [{ type: "place", slot: 4, anchor: 0 }] },
  { actions: [{ type: "swap", board: [] }] },
])
  assert.equal(decodeBlockRound(JSON.stringify({ ...raw, ...change })), null);
assert.equal(decodeBlockRound("x".repeat(1_000_001)), null);
assert.equal(decodeBlockRound("bad"), null);
// A long active game can continue beyond persistence's explicit safety ceiling, without a fabricated game-over result.
let long = newBlockRound("long", "long");
const placement = placements(long)[0];
for (let i = 0; i < BLOCK_SAVE_ACTION_LIMIT / 2; i++) {
  long = actBlockRound(long, placement);
  long = actBlockRound(long, { type: "undo" });
}
assert.equal(long.actions.length, BLOCK_SAVE_ACTION_LIMIT);
same(decodeBlockRound(encodeBlockRound(long)), long);
assert(writeBlockRound(long, store));
const savedLong = store.getItem(blockSaveKey);
long = actBlockRound(long, placement);
assert.equal(long.actions.length, BLOCK_SAVE_ACTION_LIMIT + 1);
assert(!long.game.over);
assert.equal(writeBlockRound(long, store), false);
assert.equal(store.getItem(blockSaveKey), savedLong);
assert.equal(decodeBlockRound(encodeBlockRound(long)), null);
let many = emptyBlockRecords();
for (let i = 0; i < 132; i++) {
  const real = replayBlockRound(
    `dedupe-${i}`,
    source.seed,
    source.day,
    source.actions,
  );
  assert(real?.finished);
  many = recordBlockResult(many, real);
}
assert.equal(many.recent.length, 128);
assert.equal(many.recent[0], "dedupe-4");
assert.equal(
  recordBlockResult(
    many,
    replayBlockRound("dedupe-131", source.seed, source.day, source.actions),
  ),
  many,
);
const invalidRecords = JSON.parse(encodeBlockRecords(results));
invalidRecords.classic.assisted = invalidRecords.classic.games + 1;
same(
  decodeBlockRecords(JSON.stringify(invalidRecords)).classic,
  emptyBlockRecords().classic,
);
same(decodeBlockRecords("{bad"), emptyBlockRecords());
same(decodeBlockRecords(null), emptyBlockRecords());
const corruptDays = JSON.parse(encodeBlockRecords(results));
corruptDays.days["2026-12-01"] = {
  games: results.daily.games + 1,
  assisted: 0,
  cleanBest: 999999,
  assistedBest: null,
};
same(decodeBlockRecords(JSON.stringify(corruptDays)).days, {});
const dateFixture = {
  version: 1,
  classic: emptyBlockRecords().classic,
  daily: { games: 95, assisted: 0, cleanBest: 10, assistedBest: null },
  days: {},
  recent: [],
};
for (let i = 0; i < 95; i++) {
  const d = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
  dateFixture.days[d] = {
    games: 1,
    assisted: 0,
    cleanBest: 10,
    assistedBest: null,
  };
}
const retained = decodeBlockRecords(JSON.stringify(dateFixture));
assert.equal(Object.keys(retained.days).length, 90);
assert.equal(Object.keys(retained.days)[0], "2026-01-06");
assert.equal(retained.daily.games, 95);
assert.equal(
  writeBlockRecords({ ...results, recent: ["x".repeat(200001)] }, store),
  false,
);
assert.equal(encodeBlockRecords(results).includes('"wins"'), false);
console.log(
  `Block Fit sessions passed:36 full rounds plus4 actual date challenges;${placed} placements/${refills} refills;${reloads} exact reloads/${undos} Undo checks;${swapRecoveries} natural swap recoveries/${reviveRecoveries} revive+Undo branches; helper preview/one-per-attempt/score boundaries; finishing/dedupe/restart/original daily dates;128-ID records; blocked storage/navigation carry and5000-action persistence ceiling.`,
);
