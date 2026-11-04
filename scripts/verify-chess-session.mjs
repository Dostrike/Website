import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createRequire } from "node:module";
import { Chess } from "chess.js";
const nativeRequire = createRequire(import.meta.url),
  modules = {},
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
      require: (p) =>
        p.startsWith("./") ? load(p.slice(2)) : nativeRequire(p),
    },
  );
  return (modules[name] = exports);
}
const e = load("chessEngine"),
  s = load("chessSession"),
  r = load("chessRecords"),
  plain = (v) => JSON.parse(JSON.stringify(v));
const settings = { mode: "computer", human: "w", level: "hard" };
const commands = (text) => {
  const c = new Chess();
  return text.split(" ").map((san) => e.chessPly(c.move(san)));
};
const games = [
  commands("e4 e5 Bc4 Nc6 Qh5 Nf6 Qxf7#"),
  commands("f3 e5 g4 Qh4#"),
  commands("Nf3 Nf6 Ng1 Ng8 Nf3 Nf6 Ng1 Ng8"),
];
let completed = 0,
  saves = 0,
  undos = 0,
  paired = 0;
let records = r.emptyChessRecords(),
  whiteWin;
for (const mode of ["computer", "local"])
  for (const human of ["w", "b"])
    for (const level of ["easy", "medium", "hard"])
      for (let g = 0; g < games.length; g++) {
        let round = s.newChessRound(
          { mode, human, level },
          `${mode}:${human}:${level}:${g}`,
        );
        assert.equal(s.canUndoChessRound(round), false);
        for (const move of games[g]) {
          const before = JSON.stringify(round),
            next = s.moveChessRound(round, move);
          assert.notEqual(next, round);
          assert.equal(JSON.stringify(round), before);
          round = next;
          assert.deepEqual(
            plain(s.decodeChessRound(s.encodeChessRound(round))),
            plain(round),
          );
          assert(s.writeChessRound(round));
          assert.deepEqual(plain(s.readChessRound()), plain(round));
          saves++;
          const history = round.game.moves;
          if (!round.game.result) {
            const lastHuman = history.findLastIndex(
              (_, i) => (i % 2 === 0 ? "w" : "b") === human,
            );
            const index = mode === "local" ? history.length - 1 : lastHuman;
            assert.equal(s.canUndoChessRound(round), index >= 0);
            const undone = s.undoChessRound(round);
            if (index < 0) assert.equal(undone, round);
            else {
              assert.deepEqual(
                plain(undone.game),
                plain(e.replayChess(history.slice(0, index))),
              );
              assert(undone.assisted);
              assert(s.decodeChessRound(s.encodeChessRound(undone)).assisted);
              let redone = undone;
              for (const step of history.slice(index))
                redone = s.moveChessRound(redone, step);
              assert.deepEqual(plain(redone.game), plain(round.game));
              undos++;
              if (history.length - index === 2) paired++;
            }
          }
        }
        assert(round.game.result);
        assert.equal(s.undoChessRound(round), round);
        assert.equal(s.canUndoChessRound(round), false);
        assert.equal(s.moveChessRound(round, { from: "a2", to: "a3" }), round);
        assert.throws(() => s.makeChessRequest(round, 1));
        const added = r.recordChessResult(records, round, "2026-11-05");
        assert.equal(
          added.rows[r.chessRecordGroup(round)].games,
          (records.rows[r.chessRecordGroup(round)]?.games || 0) + 1,
        );
        assert.equal(
          r.recordChessResult(
            added,
            s.decodeChessRound(s.encodeChessRound(round)),
            "2026-11-05",
          ),
          added,
        );
        records = added;
        completed++;
        if (
          round.game.result.winner === "w" &&
          human === "w" &&
          mode === "computer"
        )
          whiteWin = round;
      }
assert.equal(records.rows.local.games, 18);
assert.equal(records.rows.local.wins + records.rows.local.losses, 0);
assert.equal(
  records.rows.local.whiteWins +
    records.rows.local.blackWins +
    records.rows.local.draws,
  18,
);
assert(r.writeChessRecords(records));
assert.deepEqual(plain(r.readChessRecords()), plain(records));
const assistedWin = s.assistChessRound({ ...whiteWin, id: "assisted-win" });
const assistedRecords = r.recordChessResult(
  r.emptyChessRecords(),
  assistedWin,
  "2026-11-05",
);
assert.equal(assistedRecords.rows["computer:hard:w"].assistedWins, 1);
assert.equal(assistedRecords.rows["computer:hard:w"].cleanWins, 0);

// Own legal cooperative fixtures test records/date semantics; not the strength of the Hard opponent.
const fixtures = JSON.parse(
  fs.readFileSync("scripts/fixtures/chess-daily-rounds.json", "utf8"),
);
const daily = new Map();
for (const fixture of fixtures) {
  let round = s.newChessRound(settings, `daily-${fixture.day}`, fixture.day);
  assert.equal(s.chessFloor(round), 6);
  assert.equal(round.game.turn, "w");
  assert.equal(s.undoChessRound(round), round);
  assert.deepEqual(plain(round.game.moves), fixture.moves.slice(0, 6));
  for (const move of fixture.moves.slice(6)) {
    const next = s.moveChessRound(round, move);
    assert.notEqual(next, round);
    round = next;
    if (!round.game.result) {
      const undone = s.undoChessRound(round);
      assert(undone.game.moves.length >= 6 && undone.game.turn === "w");
      undos++;
      if (round.game.moves.length - undone.game.moves.length === 2) paired++;
    }
  }
  assert.equal(round.game.result.winner, fixture.winner);
  assert.deepEqual(
    plain(s.decodeChessRound(s.encodeChessRound(round))),
    plain(round),
  );
  daily.set(fixture.day, round);
  completed++;
}
let dailyRecords = r.recordChessResult(
  r.emptyChessRecords(),
  daily.get("2026-11-05"),
  "2026-11-05",
);
assert.equal(dailyRecords.streak, 1);
dailyRecords = r.recordChessResult(
  dailyRecords,
  { ...daily.get("2026-11-05"), id: "daily-repeat", assisted: true },
  "2026-11-05",
);
assert.equal(dailyRecords.streak, 1);
assert.equal(dailyRecords.rows["computer:hard:w"].cleanWins, 1);
assert.equal(dailyRecords.rows["computer:hard:w"].assistedWins, 1);
dailyRecords = r.recordChessResult(
  dailyRecords,
  daily.get("2026-11-06"),
  "2026-11-06",
);
assert.equal(dailyRecords.streak, 2);
assert.equal(dailyRecords.bestStreak, 2);
dailyRecords = r.recordChessResult(
  dailyRecords,
  daily.get("2026-11-07"),
  "2026-11-07",
);
assert.equal(dailyRecords.lastDaily, "2026-11-06");
dailyRecords = r.recordChessResult(
  dailyRecords,
  daily.get("2026-11-08"),
  "2026-11-08",
);
assert.equal(dailyRecords.lastDaily, "2026-11-06"); // A draw is a result, not a daily win.
assert.equal(r.chessStreak(dailyRecords, "2026-11-07"), 2);
assert.equal(r.chessStreak(dailyRecords, "2026-11-08"), 0);
dailyRecords = r.recordChessResult(
  dailyRecords,
  daily.get("2026-11-09"),
  "2026-11-09",
);
assert.equal(dailyRecords.streak, 1);
assert.equal(dailyRecords.bestStreak, 2);
const expired = r.recordChessResult(
  r.emptyChessRecords(),
  daily.get("2026-11-05"),
  "2026-11-06",
);
assert.equal(expired.lastDaily, null);
assert.equal(expired.rows["computer:hard:w"].wins, 1);
let leap = r.recordChessResult(
  r.emptyChessRecords(),
  daily.get("2024-02-29"),
  "2024-02-29",
);
leap = r.recordChessResult(leap, daily.get("2024-03-01"), "2024-03-01");
assert.equal(leap.streak, 2);
assert.equal(r.chessStreak(leap, "2024-03-02"), 2);
assert.equal(r.chessStreak(leap, "2024-03-03"), 0);
const oldRestart = s.restartChessRound(
  daily.get("2026-11-05"),
  "restart-old-daily",
);
assert.equal(oldRestart.day, "2026-11-05");
assert.equal(oldRestart.game.moves.length, 6);
assert.deepEqual(
  plain(oldRestart.game),
  plain(s.newChessRound(settings, "same-opening", "2026-11-05").game),
);
const firstDaily = s.newChessRound(settings, "first-daily", "2026-11-05"),
  secondDaily = s.newChessRound(settings, "second-daily", "2026-11-05");
assert.equal(
  s.makeChessRequest(firstDaily, 1).seed,
  s.makeChessRequest(secondDaily, 1).seed,
);
assert.notEqual(
  s.makeChessRequest(firstDaily, 1).positionKey,
  s.makeChessRequest(secondDaily, 1).positionKey,
);

const ongoing = s.newChessRound(settings, "basic"),
  encoded = JSON.parse(s.encodeChessRound(ongoing));
assert.equal(r.recordChessResult(records, ongoing, "2026-11-05"), records);
assert.equal(s.moveChessRound(ongoing, { from: "a7", to: "a6" }), ongoing);
assert.throws(() => s.restartChessRound(ongoing, "basic"));
const fresh = s.restartChessRound(s.assistChessRound(ongoing), "fresh");
assert.equal(fresh.assisted, false);
assert.equal(fresh.game.moves.length, 0);
for (const value of [
  null,
  {},
  { ...encoded, version: 2 },
  { ...encoded, id: "" },
  { ...encoded, id: "a".repeat(101) },
  { ...encoded, assisted: 1 },
  { ...encoded, day: undefined },
  { ...encoded, day: "2026-02-30" },
  { ...encoded, settings: { ...settings, human: "x" } },
  { ...encoded, settings: { ...settings, level: "perfect" } },
  { ...encoded, initialFen: e.CHESS_START },
  { ...encoded, moves: [null] },
  { ...encoded, moves: [{ from: "e2", to: "e5" }] },
  { ...encoded, moves: [...games[1], { from: "a2", to: "a3" }] },
  { ...encoded, moves: Array(20001).fill({ from: "a2", to: "a3" }) },
])
  assert.equal(s.decodeChessRound(JSON.stringify(value)), null);
assert.equal(s.decodeChessRound("["), null);
assert.equal(s.decodeChessRound(" ".repeat(2000001)), null);
assert.deepEqual(
  plain(
    s.decodeChessRound(
      JSON.stringify({
        ...encoded,
        fen: "fake",
        result: { winner: "b" },
        turn: "b",
      }),
    ),
  ),
  plain(ongoing),
);
const dailySaved = JSON.parse(s.encodeChessRound(firstDaily));
for (const value of [
  { ...dailySaved, day: "2026-11-06" },
  { ...dailySaved, moves: dailySaved.moves.slice(0, -1) },
  { ...dailySaved, moves: games[0] },
  { ...dailySaved, settings: { ...settings, human: "b" } },
  { ...dailySaved, settings: { ...settings, mode: "local" } },
  { ...dailySaved, settings: { ...settings, level: "easy" } },
])
  assert.equal(s.decodeChessRound(JSON.stringify(value)), null);
for (const day of [
  "2026-02-29",
  "2026-02-30",
  "2026-13-01",
  "",
  null,
  undefined,
])
  assert.equal(s.validChessDay(day), false);
assert(s.validChessDay("2024-02-29"));

const replies = [],
  self = { postMessage: (value) => replies.push(value) },
  workerExports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/workers/chess.worker.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  {
    self,
    exports: workerExports,
    Date,
    require: (p) =>
      p.startsWith("../utils/") ? load(p.split("/").at(-1)) : nativeRequire(p),
  },
);
const request = s.makeChessRequest(
  { ...ongoing, settings: { ...settings, level: "easy" } },
  7,
);
assert(workerExports.validChessRequest(request));
self.onmessage({ data: plain(request) });
assert.equal(replies[0].requestId, 7);
assert.equal(replies[0].positionKey, request.positionKey);
assert(
  ongoing.game.legal.some(
    (m) => e.chessPlyKey(m) === e.chessPlyKey(replies[0].choice.move),
  ),
);
assert.deepEqual(Object.keys(request.position).sort(), ["initialFen", "moves"]);
assert.equal(
  s.makeChessRequest(
    { ...ongoing, settings: { ...settings, level: "easy" } },
    8,
    true,
  ).level,
  "hard",
);
const key = s.chessPositionKey(ongoing);
assert(s.chessReplyMatches(ongoing, 4, 4, key));
assert.equal(s.chessReplyMatches(ongoing, 3, 4, key), false);
assert.equal(s.chessReplyMatches(ongoing, 4, 5, key), false);
assert.equal(s.chessReplyMatches(fresh, 4, 4, key), false);
const moved = s.moveChessRound(ongoing, { from: "e2", to: "e4" });
assert.equal(s.chessReplyMatches(moved, 4, 4, key), false);
assert.equal(s.chessPositionKey(s.undoChessRound(moved)), key);
assert.equal(s.chessReplyMatches(s.undoChessRound(moved), 4, 5, key), false);
assert.equal(
  s.chessReplyMatches(whiteWin, 4, 4, s.chessPositionKey(whiteWin)),
  false,
);
assert.equal(
  s.chessReplyMatches(
    { ...ongoing, settings: { ...settings, human: "b" } },
    4,
    4,
    key,
  ),
  false,
);
for (const invalid of [
  null,
  {},
  { ...request, options: { maxTimeMs: 100000 } },
  { ...request, seed: -1 },
  { ...request, requestId: 0 },
  { ...request, positionKey: "x".repeat(160001) },
  { ...request, position: { ...request.position, fen: "cached-authority" } },
  { ...request, position: { ...request.position, moves: new Array(3) } },
]) {
  assert.equal(workerExports.validChessRequest(invalid), false);
  self.onmessage({ data: invalid });
  assert.equal(replies.at(-1).requestId, 0);
  assert(replies.at(-1).error);
}
const illegal = {
  ...request,
  position: { initialFen: e.CHESS_START, moves: [{ from: "e2", to: "e5" }] },
};
assert(workerExports.validChessRequest(illegal));
self.onmessage({ data: illegal });
assert.equal(replies.at(-1).requestId, request.requestId);
assert(replies.at(-1).error);

let bounded = r.emptyChessRecords();
for (let i = 0; i < 140; i++)
  bounded = r.recordChessResult(
    bounded,
    { ...whiteWin, id: `round-${i}` },
    "2026-11-05",
  );
assert.equal(bounded.recent.length, 128);
assert.equal(bounded.recent[0], "round-12");
assert.equal(
  r.recordChessResult(bounded, { ...whiteWin, id: "round-139" }, "2026-11-05"),
  bounded,
);
const row = records.rows.local;
for (const bad of [
  { rows: { local: { ...row, wins: 1, cleanWins: 1, games: row.games + 1 } } },
  { rows: { "computer:hard:w": row } },
  { rows: { local: { ...row, assisted: row.games + 1 } } },
  { rows: { local: { ...row, games: -1 } } },
  { rows: { local: null } },
]) {
  stored.set(r.chessRecordsKey, JSON.stringify(bad));
  assert.deepEqual(plain(r.readChessRecords().rows), {});
}
stored.set(
  r.chessRecordsKey,
  JSON.stringify({
    rows: {},
    lastDaily: "2026-02-30",
    streak: 2,
    bestStreak: 2,
  }),
);
assert.deepEqual(plain(r.readChessRecords()), plain(r.emptyChessRecords()));
stored.set(r.chessRecordsKey, "{");
assert.deepEqual(plain(r.readChessRecords()), plain(r.emptyChessRecords()));
blocked = true;
assert.equal(s.readChessRound(), null);
assert.equal(s.writeChessRound(ongoing), false);
assert.deepEqual(
  plain(s.chessInitialRound(s.encodeChessRound(ongoing))),
  plain(ongoing),
);
assert.equal(s.chessInitialRound("bad"), null);
assert.deepEqual(
  plain(s.chessInitialRound(s.encodeChessRound(ongoing), moved)),
  plain(moved),
);
assert.deepEqual(
  plain(s.chessInitialRound(s.encodeChessRound(fresh), moved)),
  plain(fresh),
);
assert.equal(r.writeChessRecords(records), false);
assert.deepEqual(plain(r.readChessRecords()), plain(r.emptyChessRecords()));
console.log(
  JSON.stringify({
    completedRounds: completed,
    exactSaves: saves,
    undoCases: undos,
    pairedUndos: paired,
    dailyFixtures: fixtures.length,
    dailyFixturePlies: fixtures.reduce((sum, f) => sum + f.moves.length, 0),
    daily:
      "legal cooperative win/loss/draw, same/consecutive/leap/expired/gap dates, regenerated prefix and Undo floor",
    worker:
      "executed module, full history, malformed and stale paths; browser cancellation not yet tested",
    storage:
      "malformed/local separation/reload dedupe/blocked/navigation carry pass",
  }),
);
