import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const modules = {},
  stored = new Map();
let blocked = false;
const storage = {
  getItem: (key) => {
    if (blocked) throw Error("Blocked");
    return stored.get(key) || null;
  },
  setItem: (key, value) => {
    if (blocked) throw Error("Blocked");
    stored.set(key, value);
  },
};
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
    {
      exports,
      Date,
      localStorage: storage,
      require: (p) => load(p.split("/").at(-1)),
    },
  );
  return (modules[name] = exports);
}
const e = load("seaBattleEngine"),
  ai = load("seaBattleAI"),
  s = load("seaBattleSession"),
  r = load("seaBattleRecords");
const plain = (value) => JSON.parse(JSON.stringify(value));
const fleetA = e.generateSeaFleet(107),
  fleetB = e.generateSeaFleet(108);
const settings = { mode: "computer", human: 1, level: "hard" };
const basic = () => s.newSeaRound(settings, "basic", fleetA, fleetB);
let rounds = 0,
  undoChecks = 0,
  pairedUndos = 0,
  exactSaves = 0;
const winners = new Set();
let records = r.emptySeaRecords();
for (const mode of ["local", "computer"])
  for (const human of [1, 2])
    for (const level of ["easy", "medium", "hard"])
      for (let seed = 0; seed < 4; seed++) {
        let round = s.newSeaRound(
          { mode, human, level },
          `${mode}:${human}:${level}:${seed}`,
          e.generateSeaFleet(seed * 2 + 300),
          e.generateSeaFleet(seed * 2 + 301),
        );
        assert.equal(s.canUndoSeaRound(round), false);
        assert.equal(s.undoSeaRound(round), round);
        while (!round.game.winner) {
          const player = round.game.turn,
            request = s.makeSeaRequest(round, 3);
          assert.deepEqual(Object.keys(request).sort(), [
            "knowledge",
            "level",
            "positionKey",
            "requestId",
            "seed",
          ]);
          assert.equal("fleets" in request, false);
          assert.equal("state" in request, false);
          assert.equal("fleetSeed" in request, false);
          assert.deepEqual(
            plain(request.knowledge),
            plain(e.seaKnowledge(round.game, player)),
          );
          const choice = ai.chooseSeaShot(
            request.knowledge,
            level,
            request.seed,
          );
          assert(choice);
          const before = JSON.stringify(round);
          const moved = s.moveSeaRound(round, player, choice.cell);
          assert.notEqual(moved, round);
          assert.equal(JSON.stringify(round), before);
          round = moved;
          if (round.game.history.length % 11 === 0) {
            assert.deepEqual(
              plain(s.decodeSeaRound(s.encodeSeaRound(round))),
              plain(round),
            );
            assert(s.writeSeaRound(round));
            assert.deepEqual(plain(s.readSeaRound()), plain(round));
            exactSaves++;
          }
          if (!round.game.winner) {
            const history = round.game.history;
            const expectedIndex =
              mode === "local"
                ? history.length - 1
                : history.findLastIndex((shot) => shot.player === human);
            assert.equal(s.canUndoSeaRound(round), expectedIndex !== -1);
            const undone = s.undoSeaRound(round);
            if (expectedIndex < 0) assert.equal(undone, round);
            else {
              assert.equal(undone.assisted, true);
              assert.deepEqual(
                plain(undone.game),
                plain(
                  e.replaySea(
                    ...round.game.fleets,
                    history.slice(0, expectedIndex),
                  ),
                ),
              );
              assert.equal(
                undone.game.turn,
                mode === "computer" ? human : history.at(-1).player,
              );
              // Branch by replaying exactly the undone shots; retain sticky assistance.
              let branched = undone;
              for (const shot of history.slice(expectedIndex))
                branched = s.moveSeaRound(branched, shot.player, shot.cell);
              assert.deepEqual(plain(branched.game), plain(round.game));
              assert.equal(branched.assisted, true);
              undoChecks++;
              if (history.length - expectedIndex === 2) pairedUndos++;
            }
          }
        }
        winners.add(round.game.winner);
        const completed = s.decodeSeaRound(s.encodeSeaRound(round));
        assert.deepEqual(plain(completed), plain(round));
        assert.equal(s.undoSeaRound(round), round);
        assert.equal(s.canUndoSeaRound(round), false);
        assert.throws(() => s.makeSeaRequest(round, 1));
        const added = r.recordSeaResult(records, round, "2026-11-05");
        assert.equal(
          added.rows[r.seaRecordGroup(round)].games,
          (records.rows[r.seaRecordGroup(round)]?.games || 0) + 1,
        );
        assert.equal(r.recordSeaResult(added, completed, "2026-11-05"), added);
        records = added;
        rounds++;
      }
assert.equal(winners.size, 2);
assert.equal(records.rows.local.games, 24);
assert.equal(records.rows.local.wins + records.rows.local.losses, 0);
assert.equal(records.rows.local.aWins + records.rows.local.bWins, 24);
assert(r.writeSeaRecords(records));
assert.deepEqual(plain(r.readSeaRecords()), plain(records));
const ongoing = basic();
assert.equal(r.recordSeaResult(records, ongoing, "2026-11-05"), records);
assert.equal(s.moveSeaRound(ongoing, 2, 10), ongoing);
const assisted = s.assistSeaRound(ongoing);
assert(assisted.assisted);
assert.equal(s.assistSeaRound(assisted), assisted);
assert(s.decodeSeaRound(s.encodeSeaRound(assisted)).assisted);
assert.throws(() => s.restartSeaRound(ongoing, "basic"));
const restarted = s.restartSeaRound(assisted, "fresh");
assert.equal(restarted.id, "fresh");
assert.equal(restarted.assisted, false);
assert.equal(restarted.game.history.length, 0);
assert.deepEqual(plain(restarted.game.fleets), plain(ongoing.game.fleets));

const raw = JSON.parse(s.encodeSeaRound(ongoing));
const bad = [
  null,
  {},
  { ...raw, version: 2 },
  { ...raw, id: "" },
  { ...raw, id: "a".repeat(101) },
  { ...raw, assisted: 1 },
  { ...raw, day: undefined },
  { ...raw, day: "2026-02-30" },
  { ...raw, settings: { ...settings, level: "perfect" } },
  { ...raw, settings: { ...settings, human: 0 } },
  { ...raw, fleets: [fleetA] },
  { ...raw, fleets: [[], fleetB] },
  { ...raw, shots: [{ player: 2, cell: 0 }] },
  { ...raw, shots: [{ player: 1, cell: 100 }] },
  { ...raw, shots: [{ player: 1, cell: 1.2 }] },
  { ...raw, shots: [null] },
  {
    ...raw,
    shots: [
      { player: 1, cell: 0 },
      { player: 2, cell: 0 },
      { player: 1, cell: 0 },
    ],
  },
  { ...raw, shots: Array(200).fill({ player: 1, cell: 0 }) },
];
for (const v of bad) assert.equal(s.decodeSeaRound(JSON.stringify(v)), null);
assert.equal(s.decodeSeaRound("["), null);
assert.equal(s.decodeSeaRound(" ".repeat(40001)), null);
// Derived saved fields have no authority; the fleet and legal shots recreate everything.
assert.deepEqual(
  plain(
    s.decodeSeaRound(
      JSON.stringify({ ...raw, winner: 2, turn: 2, damage: 17 }),
    ),
  ),
  plain(ongoing),
);
for (const day of [
  "2026-02-30",
  "2026-13-01",
  "2026-00-12",
  "2026-1-01",
  "",
  null,
  undefined,
])
  assert.equal(s.validSeaDay(day), false);
assert(s.validSeaDay("2024-02-29"));
assert.equal(s.validSeaDay("2026-02-29"), false);

function daily(day, id, win = true, assisted = false) {
  let round = s.newSeaRound(settings, id, fleetA, s.seaDailyFleet(day), day);
  const occupied = round.game.fleets.map((f) => f.flatMap(e.seaShipCells));
  const water = occupied.map((cells) =>
    Array.from({ length: 100 }, (_, c) => c).filter((c) => !cells.includes(c)),
  );
  const choices = win ? [occupied[1], water[0]] : [water[1], occupied[0]];
  const index = [0, 0];
  while (!round.game.winner) {
    const p = round.game.turn;
    round = s.moveSeaRound(round, p, choices[p - 1][index[p - 1]++]);
  }
  assert.equal(round.game.winner, win ? 1 : 2);
  return assisted ? s.assistSeaRound(round) : round;
}
const today = daily("2026-11-05", "daily-today");
const dailyFirst = s.restartSeaRound(today, "daily-first"),
  dailySecond = s.restartSeaRound(today, "daily-second");
assert.notEqual(
  s.makeSeaRequest(dailyFirst, 1).positionKey,
  s.makeSeaRequest(dailySecond, 1).positionKey,
);
assert.equal(
  s.makeSeaRequest(dailyFirst, 1).seed,
  s.makeSeaRequest(dailySecond, 1).seed,
);
let dailyRecords = r.recordSeaResult(r.emptySeaRecords(), today, "2026-11-05");
assert.equal(dailyRecords.streak, 1);
assert.equal(dailyRecords.rows["computer:hard:1"].cleanWins, 1);
const repeat = daily("2026-11-05", "daily-repeat", true, true);
dailyRecords = r.recordSeaResult(dailyRecords, repeat, "2026-11-05");
assert.equal(dailyRecords.streak, 1);
assert.equal(dailyRecords.rows["computer:hard:1"].assistedWins, 1);
const tomorrow = daily("2026-11-06", "daily-tomorrow");
dailyRecords = r.recordSeaResult(dailyRecords, tomorrow, "2026-11-06");
assert.equal(dailyRecords.streak, 2);
assert.equal(dailyRecords.bestStreak, 2);
assert.equal(r.seaStreak(dailyRecords, "2026-11-07"), 2);
assert.equal(r.seaStreak(dailyRecords, "2026-11-08"), 0);
assert.equal(
  r.seaStreak({ ...dailyRecords, lastDaily: "2024-02-29" }, "2024-03-01"),
  2,
);
assert.equal(
  r.seaStreak({ ...dailyRecords, lastDaily: "2026-02-28" }, "2026-03-01"),
  2,
);
const lost = daily("2026-11-07", "daily-lost", false);
dailyRecords = r.recordSeaResult(dailyRecords, lost, "2026-11-07");
assert.equal(dailyRecords.lastDaily, "2026-11-06");
const late = daily("2026-11-07", "daily-expired");
dailyRecords = r.recordSeaResult(dailyRecords, late, "2026-11-08");
assert.equal(dailyRecords.lastDaily, "2026-11-06");
const afterGap = daily("2026-11-09", "daily-after-gap");
dailyRecords = r.recordSeaResult(dailyRecords, afterGap, "2026-11-09");
assert.equal(dailyRecords.streak, 1);
assert.equal(dailyRecords.bestStreak, 2);
const savedDaily = JSON.parse(s.encodeSeaRound(today));
assert.deepEqual(
  plain(s.decodeSeaRound(JSON.stringify(savedDaily))),
  plain(today),
);
assert.equal(
  s.decodeSeaRound(JSON.stringify({ ...savedDaily, day: "2026-11-06" })),
  null,
);
assert.equal(
  s.decodeSeaRound(JSON.stringify({ ...savedDaily, fleets: [fleetA, fleetB] })),
  null,
);
assert.equal(
  s.decodeSeaRound(
    JSON.stringify({ ...savedDaily, settings: { ...settings, human: 2 } }),
  ),
  null,
);
const oldRestart = s.restartSeaRound(today, "old-restart");
assert.equal(oldRestart.day, "2026-11-05");
assert.deepEqual(
  plain(oldRestart.game.fleets[1]),
  plain(s.seaDailyFleet("2026-11-05")),
);
assert.equal(oldRestart.game.history.length, 0);

// Actual worker module runs against a synthetic self; no browser/API or hidden-state argument.
const workerExports = {},
  replies = [];
const self = { postMessage: (reply) => replies.push(reply) };
vm.runInNewContext(
  ts.transpileModule(
    fs.readFileSync("src/workers/seaBattle.worker.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText,
  { self, exports: workerExports, require: (p) => load(p.split("/").at(-1)) },
);
const request = s.makeSeaRequest(ongoing, 7),
  key = s.seaPositionKey(ongoing);
assert(workerExports.validSeaRequest(request));
self.onmessage({ data: plain(request) });
assert.equal(replies.length, 1);
assert.equal(replies[0].requestId, 7);
assert.equal(replies[0].positionKey, key);
assert.equal(request.knowledge.marks[replies[0].choice.cell], "unknown");
assert(s.seaReplyMatches(ongoing, 7, 7, key));
assert.equal(s.seaReplyMatches(ongoing, 6, 7, key), false);
assert.equal(s.seaReplyMatches(ongoing, 7, 8, key), false);
assert.equal(s.seaReplyMatches(restarted, 7, 7, key), false);
const moved = s.moveSeaRound(ongoing, 1, replies[0].choice.cell);
assert.equal(s.seaReplyMatches(moved, 7, 7, key), false);
const undone = s.undoSeaRound(moved);
assert.equal(s.seaPositionKey(undone), key);
assert.equal(s.seaReplyMatches(undone, 7, 8, key), false); // UI must advance sequence on Undo even when position recurs.
assert.equal(s.seaReplyMatches(today, 7, 7, s.seaPositionKey(today)), false);
for (const invalid of [
  null,
  {},
  { ...request, state: ongoing.game },
  { ...request, seed: -1 },
  { ...request, requestId: 0 },
  { ...request, positionKey: "x".repeat(4097) },
  { ...request, knowledge: { ...request.knowledge, fleet: fleetB } },
]) {
  assert.equal(workerExports.validSeaRequest(invalid), false);
  self.onmessage({ data: invalid });
  assert.equal(replies.at(-1).requestId, 0);
  assert(replies.at(-1).error);
  assert.equal(replies.at(-1).choice, undefined);
}
const hiddenOther = fleetB.map((p) => ({ ...p }));
// Same round identity/transcript but a completely different legal opponent fleet.
const alternative = s.newSeaRound(
  settings,
  "basic",
  fleetA,
  e.generateSeaFleet(8789),
);
assert.notDeepEqual(plain(alternative.game.fleets[1]), plain(hiddenOther));
assert.deepEqual(plain(s.makeSeaRequest(alternative, 7)), plain(request));
assert.deepEqual(Object.keys(request.knowledge).sort(), ["marks", "sunk"]);
const easy = s.newSeaRound(
  { ...settings, level: "easy" },
  "easy-hint",
  fleetA,
  fleetB,
);
assert.equal(s.makeSeaRequest(easy, 1).level, "easy");
assert.equal(s.makeSeaRequest(easy, 2, true).level, "hard");
let bounded = r.emptySeaRecords();
for (let i = 0; i < 140; i++)
  bounded = r.recordSeaResult(
    bounded,
    { ...today, id: `dedupe-${i}` },
    "2026-11-05",
  );
assert.equal(bounded.recent.length, 128);
assert.equal(bounded.recent[0], "dedupe-12");
assert.equal(
  r.recordSeaResult(bounded, { ...today, id: "dedupe-139" }, "2026-11-05"),
  bounded,
);

// Storage corruption must not introduce computer wins into a local result row.
const row = records.rows.local;
for (const malformed of [
  { rows: { local: { ...row, wins: 1, cleanWins: 1, games: row.games + 1 } } },
  { rows: { "computer:hard:1": { ...row, wins: 0 } } },
  { rows: { local: { ...row, assisted: row.games + 1 } } },
  { rows: { local: { ...row, games: -1 } } },
  { rows: { local: null } },
]) {
  stored.set(r.seaRecordsKey, JSON.stringify(malformed));
  assert.deepEqual(plain(r.readSeaRecords().rows), {});
}
stored.set(
  r.seaRecordsKey,
  JSON.stringify({
    rows: {},
    lastDaily: "2026-02-30",
    streak: 8,
    bestStreak: 8,
  }),
);
assert.deepEqual(plain(r.readSeaRecords()), plain(r.emptySeaRecords()));
stored.set(r.seaRecordsKey, "{");
assert.deepEqual(plain(r.readSeaRecords()), plain(r.emptySeaRecords()));
blocked = true;
assert.deepEqual(
  plain(s.seaInitialRound(s.encodeSeaRound(ongoing))),
  plain(ongoing),
);
assert.equal(s.seaInitialRound("invalid"), null);
assert.deepEqual(
  plain(s.seaInitialRound(s.encodeSeaRound(ongoing), moved)),
  plain(moved),
);
assert.deepEqual(
  plain(s.seaInitialRound(s.encodeSeaRound(restarted), moved)),
  plain(restarted),
);
assert.equal(s.readSeaRound(), null);
assert.equal(s.writeSeaRound(ongoing), false);
assert.deepEqual(plain(r.readSeaRecords()), plain(r.emptySeaRecords()));
assert.equal(r.writeSeaRecords(records), false);
console.log(
  JSON.stringify({
    completedRounds: rounds,
    exactSaves,
    undoChecks,
    pairedUndos,
    daily: "actual wins/loss/assistance/repeat/consecutive/expired/gap/restart",
    worker:
      "executed public-only payload, hidden-layout equality, malformed input and stale matching",
    storage: "malformed, mixed local/computer and blocked paths pass",
  }),
);
