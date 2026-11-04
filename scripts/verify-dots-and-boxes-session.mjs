import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const modules = {};
const storage = new Map();
let blocked = false;
const localStorage = {
  getItem: (key) => {
    if (blocked) throw Error("blocked");
    return storage.get(key) || null;
  },
  setItem: (key, value) => {
    if (blocked) throw Error("blocked");
    storage.set(key, value);
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
    { exports, Date, localStorage, require: (p) => load(p.replace("./", "")) },
  );
  return (modules[name] = exports);
}
const e = load("dotsAndBoxesEngine"),
  s = load("dotsAndBoxesSession"),
  r = load("dotsAndBoxesRecords"),
  plain = (x) => JSON.parse(JSON.stringify(x));
let rng = 2,
  seeded = () => (rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0),
  fullRounds = 0,
  extraTurnUndos = 0;
const outcomes = [];
for (const size of [2, 3, 4])
  for (const mode of ["computer", "local"])
    for (const human of [1, 2])
      for (let sample = 0; sample < 10; sample++) {
        let round = s.newDotsRound(
          { size, mode, human, level: "hard" },
          `${size}:${mode}:${human}:${sample}`,
        );
        const initial = round;
        let lastHuman = null;
        while (round.game.result === null) {
          const before = round,
            turn = round.game.turn;
          if (mode === "computer" && turn === human)
            lastHuman = round.game.history.length;
          const legal = e.legalDotsEdges(round.game),
            edge = legal[seeded() % legal.length];
          round = s.moveDotsRound(round, edge);
          assert.deepEqual(
            plain(s.decodeDotsRound(s.encodeDotsRound(round))),
            plain(round),
          );
          assert.equal(before.assisted, false);
          if (round.game.result === null) {
            const undo = s.undoDotsRound(round);
            if (mode === "local") {
              assert.deepEqual(plain(undo.game), plain(before.game));
              assert(undo.assisted);
            } else if (lastHuman === null) {
              assert.equal(undo, round);
            } else {
              assert(undo.assisted);
              assert.equal(undo.game.turn, human);
              assert.deepEqual(
                plain(undo.game),
                plain(
                  e.replayDots(size, round.game.history.slice(0, lastHuman)),
                ),
              );
              if (round.game.history.length - lastHuman > 2) extraTurnUndos++;
            }
          }
        }
        assert.equal(
          s.undoDotsRound(round),
          round,
          "Results freeze Undo; restart creates a separate attempt",
        );
        assert(!s.canUndoDotsRound(round));
        outcomes.push(round);
        fullRounds++;
        const base = r.emptyDotsRecords(),
          next = r.recordDotsResult(base, round, "2026-11-05"),
          group = r.dotsRecordGroup(round);
        assert.equal(Object.keys(base.rows).length, 0);
        assert.equal(next.rows[group].games, 1);
        assert.equal(r.recordDotsResult(next, round, "2026-11-05"), next);
        if (mode === "local") {
          assert.equal(next.rows[group].wins + next.rows[group].losses, 0);
          assert.equal(
            next.rows[group].aWins +
              next.rows[group].bWins +
              next.rows[group].draws,
            1,
          );
        } else {
          assert.equal(next.rows[group].aWins + next.rows[group].bWins, 0);
          assert.equal(
            next.rows[group].wins,
            Number(round.game.result === human),
          );
        }
        const assisted = r.recordDotsResult(
          next,
          { ...round, id: round.id + ":assisted", assisted: true },
          "2026-11-05",
        );
        assert.equal(assisted.rows[group].assisted, 1);
        assert.equal(assisted.rows[group].games, 2);
        assert.equal(r.recordDotsResult(base, initial, "2026-11-05"), base);
      }
assert(extraTurnUndos > 0);
const settings = { size: 3, mode: "computer", human: 1, level: "hard" },
  daily = s.newDotsRound(settings, "daily", "2026-11-05");
assert.equal(s.dotsFloor(daily), 8);
assert.equal(s.undoDotsRound(daily), daily);
let progressed = s.moveDotsRound(daily, e.legalDotsEdges(daily.game)[0]);
const undone = s.undoDotsRound(progressed);
assert.deepEqual(plain(undone.game), plain(daily.game));
assert(undone.assisted);
assert(s.decodeDotsRound(s.encodeDotsRound(undone)).assisted);
const v = JSON.parse(s.encodeDotsRound(progressed));
for (const mutate of [
  (x) => delete x.day,
  (x) => (x.id = ""),
  (x) => (x.day = "2026-02-30"),
  (x) => (x.settings.human = 2),
  (x) => (x.settings.mode = "local"),
  (x) => (x.settings.level = "easy"),
  (x) => (x.moves = []),
  (x) => (x.moves[0] = x.moves[1]),
  (x) => x.moves.push(x.moves[0]),
  (x) => (x.assisted = "yes"),
]) {
  const bad = structuredClone(v);
  mutate(bad);
  assert.equal(s.decodeDotsRound(JSON.stringify(bad)), null);
}
assert.throws(() => s.newDotsRound(settings, "x", "2026-02-30"));
const position = s.dotsPositionKey(progressed);
assert(s.dotsReplyMatches(progressed, 10, 10, position));
assert(!s.dotsReplyMatches(progressed, 9, 10, position));
assert(!s.dotsReplyMatches(undone, 10, 10, position));
assert(!s.dotsReplyMatches({ ...progressed, id: "restart" }, 10, 10, position));
assert(
  !s.dotsReplyMatches(
    { ...progressed, settings: { ...settings, level: "easy" } },
    10,
    10,
    position,
  ),
);
// Daily win/date accounting uses a real regenerated daily and legal complete play.
let dailyWin = null;
for (let attempt = 0; attempt < 200 && !dailyWin; attempt++) {
  let round = s.newDotsRound(settings, "daily:" + attempt, "2026-11-05");
  while (round.game.result === null) {
    const legal = e.legalDotsEdges(round.game);
    round = s.moveDotsRound(round, legal[seeded() % legal.length]);
  }
  if (round.game.result === 1) dailyWin = round;
}
assert(dailyWin);
const first = r.recordDotsResult(r.emptyDotsRecords(), dailyWin, "2026-11-05");
assert.equal(first.streak, 1);
assert.equal(
  r.recordDotsResult(first, { ...dailyWin, id: "repeat" }, "2026-11-05").streak,
  1,
);
assert.equal(
  r.recordDotsResult(r.emptyDotsRecords(), dailyWin, "2026-11-06").streak,
  0,
);
assert.equal(r.dotsStreak(first, "2026-11-07"), 0);
let nextDayWin = null,
  nextDayLoss = null;
for (
  let attempt = 0;
  attempt < 200 && (!nextDayWin || !nextDayLoss);
  attempt++
) {
  let round = s.newDotsRound(settings, "next-day:" + attempt, "2026-11-06");
  while (round.game.result === null) {
    const legal = e.legalDotsEdges(round.game);
    round = s.moveDotsRound(round, legal[seeded() % legal.length]);
  }
  if (round.game.result === 1) nextDayWin = round;
  else nextDayLoss = round;
}
assert(nextDayWin);
assert(nextDayLoss);
assert.equal(r.recordDotsResult(first, nextDayWin, "2026-11-06").streak, 2);
assert.equal(r.recordDotsResult(first, nextDayLoss, "2026-11-06").streak, 1);
storage.set(
  "dostrike-dots-and-boxes-records-v1",
  JSON.stringify({
    rows: {
      "2:local": {
        games: 1,
        assisted: 0,
        wins: 1,
        losses: 0,
        draws: 0,
        aWins: 0,
        bWins: 0,
      },
    },
  }),
);
assert.deepEqual(plain(r.readDotsRecords().rows), {});
storage.set(s.dotsSaveKey, s.encodeDotsRound(progressed));
assert.deepEqual(plain(s.readDotsRound()), plain(progressed));
storage.set(s.dotsSaveKey, "bad JSON");
assert.equal(s.readDotsRound(), null);
r.writeDotsRecords(first);
assert.deepEqual(plain(r.readDotsRecords()), plain(first));
blocked = true;
assert.equal(s.readDotsRound(), null);
assert.deepEqual(plain(r.readDotsRecords()), plain(r.emptyDotsRecords()));
r.writeDotsRecords(first);
console.log(
  `Dots sessions/records:${fullRounds} full rounds,${extraTurnUndos} extra-turn paired undos, both human sides/local separation, regenerated daily/save validation, malformed/blocked storage, completion dedupe and stale reply rejection passed.`,
);
