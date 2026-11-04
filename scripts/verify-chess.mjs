import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createRequire } from "node:module";
import { Chess } from "chess.js";
const nativeRequire = createRequire(import.meta.url),
  modules = {};
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
      require: (p) =>
        p.startsWith("./") ? load(p.slice(2)) : nativeRequire(p),
    },
  );
  return (modules[name] = exports);
}
const e = load("chessEngine"),
  ai = load("chessAI"),
  plain = (v) => JSON.parse(JSON.stringify(v));
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
assert.equal(lock.packages["node_modules/chess.js"].version, "1.4.0");
assert.equal(lock.packages["node_modules/chess.js"].license, "BSD-2-Clause");
assert.equal(
  lock.packages["node_modules/chess.js"].integrity,
  "sha512-BBJgrrtKQOzFLonR0l+k64A98NLemPwNsCskwb+29bRwobUa4iTm51E1kwGPbWXAcfdDa18nad6vpPPKPWarqw==",
);
assert.equal(
  fs
    .readFileSync("public/licenses/chess-js-1.4.0.txt", "utf8")
    .replace(/\r\n/g, "\n"),
  fs
    .readFileSync("node_modules/chess.js/LICENSE", "utf8")
    .replace(/\r\n/g, "\n"),
);
const ply = (text) => ({
  from: text.slice(0, 2),
  to: text.slice(2, 4),
  ...(text[4] ? { promotion: text[4] } : {}),
});
function sequence(text, fen = e.CHESS_START) {
  const game = new Chess(fen),
    moves = [];
  for (const san of text.split(/\s+/).filter(Boolean))
    moves.push(e.chessPly(game.move(san)));
  const state = e.replayChess(moves, fen);
  assert(state, text);
  return state;
}
// Golden vectors read from the tagged upstream primary test source, not invented counts.
// https://github.com/jhlywa/chess.js/blob/v1.4.0/__tests__/perft.test.ts
const vectors = [
  [e.CHESS_START, 4, 197281],
  [
    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1",
    3,
    97862,
  ],
  ["8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1", 4, 43238],
  [
    "r2q1rk1/pP1p2pp/Q4n2/bbp1p3/Np6/1B3NBn/pPPP1PPP/R3K2R b KQ - 0 1",
    4,
    422333,
  ],
  ["rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", 3, 62379],
  [
    "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10",
    3,
    89890,
  ],
  ["rnbqkbnr/p3pppp/2p5/1pPp4/3P4/8/PP2PPPP/RNBQKBNR w KQkq b6 0 4", 3, 23509],
];
for (const [fen, depth, expected] of vectors)
  assert.equal(new Chess(fen).perft(depth), expected);
const start = e.newChess();
assert.equal(start.board.filter(Boolean).length, 32);
assert.equal(start.legal.length, 20);
const expectedOpening = ["b1a3", "b1c3", "g1f3", "g1h3"];
for (const file of "abcdefgh")
  expectedOpening.push(`${file}2${file}3`, `${file}2${file}4`);
assert.deepEqual(start.legal.map(e.chessPlyKey).sort(), expectedOpening.sort());
let depthTwo = 0;
for (const move of start.legal) {
  const before = JSON.stringify(start),
    next = e.playChess(start, e.chessPly(move));
  assert(next);
  assert.equal(JSON.stringify(start), before);
  depthTwo += next.legal.length;
  assert.deepEqual(plain(e.undoChess(next)), plain(start));
}
assert.equal(depthTwo, 400); // Each of the 20 initial moves permits all 20 initial Black moves.
for (const move of [
  null,
  {},
  ply("e2e5"),
  ply("e1e2"),
  ply("a7a6"),
  { from: "e2", to: "e4", promotion: "q" },
  { from: "e2", to: "e4", promotion: "k" },
  { from: "a0", to: "a1" },
  { from: "a2", to: "a2" },
  { from: "e2", to: "e4", promotion: undefined },
  { from: "e2", to: "e4", extra: true },
])
  assert.equal(e.playChess(start, move), null);
assert.equal(e.replayChess([ply("e2e5")]), null);
assert.equal(e.replayChess([null]), null);
assert.equal(e.replayChess(new Array(3)), null);
assert.throws(() => e.newChess("not a FEN"));

const castleFen = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
const castles = e.newChess(castleFen);
assert(castles.legal.some((m) => e.chessPlyKey(m) === "e1g1"));
assert(castles.legal.some((m) => e.chessPlyKey(m) === "e1c1"));
const castled = e.playChess(castles, ply("e1g1"));
assert(
  castled.board.some(
    (p) => p?.square === "g1" && p.piece === "k" && p.color === "w",
  ),
);
assert(
  castled.board.some(
    (p) => p?.square === "f1" && p.piece === "r" && p.color === "w",
  ),
);
assert.deepEqual(e.chessFromHistory(castled).getCastlingRights("w"), {
  k: false,
  q: false,
});
assert.deepEqual(plain(e.undoChess(castled)), plain(castles));
const rookReturned = sequence("Rh2 Ra7 Rh1 Ra8", castleFen);
assert(!rookReturned.legal.some((m) => e.chessPlyKey(m) === "e1g1"));
assert(rookReturned.legal.some((m) => e.chessPlyKey(m) === "e1c1"));
assert.deepEqual(e.chessFromHistory(rookReturned).getCastlingRights("b"), {
  k: true,
  q: false,
});
const rookCaptured = sequence("Bxa1", "4k3/8/8/8/8/8/1b6/R3K2R b KQ - 0 1");
assert.deepEqual(e.chessFromHistory(rookCaptured).getCastlingRights("w"), {
  k: true,
  q: false,
});
for (const fen of [
  "4kr2/8/8/8/8/8/8/R3K2R w KQ - 0 1",
  "4k1r1/8/8/8/8/8/8/R3K2R w KQ - 0 1",
  "k3r3/8/8/8/8/8/8/R3K2R w KQ - 0 1",
])
  assert.equal(e.playChess(e.newChess(fen), ply("e1g1")), null);
const pinnedEP = e.newChess("k3r3/8/8/3pP3/8/8/8/4K3 w - d6 0 1");
assert.equal(e.playChess(pinnedEP, ply("e5d6")), null);
const freeEP = e.newChess("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1");
const capturedEP = e.playChess(freeEP, ply("e5d6"));
assert(
  capturedEP &&
    capturedEP.board.some(
      (p) => p?.square === "d6" && p.color === "w" && p.piece === "p",
    ),
);
assert.equal(
  capturedEP.board.some((p) => p?.square === "d5"),
  false,
);
assert.deepEqual(plain(e.undoChess(capturedEP)), plain(freeEP));
const expiredEP = sequence("e4 a6 e5 d5 Nf3 a5");
assert.equal(e.playChess(expiredEP, ply("e5d6")), null);

// Original underpromotion teaching fixture: Q stalemates; R leaves a legal game.
const promotion = e.newChess("8/k1P5/2K5/8/8/8/8/8 w - - 0 1");
assert.equal(e.playChess(promotion, ply("c7c8")), null); // No implicit auto-queen.
const promoted = {};
for (const piece of ["q", "r", "b", "n"]) {
  const state = e.playChess(promotion, ply(`c7c8${piece}`));
  assert(state);
  assert(
    state.board.some((man) => man?.square === "c8" && man.piece === piece),
  );
  promoted[piece] = state;
}
assert.equal(promoted.q.result.reason, "stalemate");
assert.equal(promoted.r.result, null);
assert.equal(promoted.b.result.reason, "material");
assert.equal(promoted.n.result.reason, "material");
const blackPromotion = e.newChess("8/8/8/8/8/2k5/K1p5/8 b - - 0 1");
for (const piece of ["q", "r", "b", "n"])
  assert(e.playChess(blackPromotion, ply(`c2c1${piece}`)));
assert.equal(
  e.playChess(blackPromotion, ply("c2c1q")).result.reason,
  "stalemate",
);
assert.equal(e.playChess(blackPromotion, ply("c2c1r")).result, null);
// A promotion is also reachable in nine plies from the normal start for later browser QA.
const normalPromotion = sequence("a4 Nc6 a5 b6 axb6 h6 b7 h5");
assert.equal(
  normalPromotion.legal.filter((m) => m.from === "b7" && m.to === "b8").length,
  4,
);
for (const piece of ["q", "r", "b", "n"])
  assert(e.playChess(normalPromotion, ply(`b7b8${piece}`)));
const normalBlackPromotion = sequence("Nc3 a5 b3 a4 h3 axb3 h4 b2 h5");
assert.equal(
  normalBlackPromotion.legal.filter((m) => m.from === "b2" && m.to === "b1")
    .length,
  4,
);

const whiteMate = sequence("e4 e5 Bc4 Nc6 Qh5 Nf6 Qxf7#");
const blackMate = sequence("f3 e5 g4 Qh4#");
assert.deepEqual(plain(whiteMate.result), { winner: "w", reason: "checkmate" });
assert.deepEqual(plain(blackMate.result), { winner: "b", reason: "checkmate" });
assert(whiteMate.check && blackMate.check);
assert.equal(e.playChess(blackMate, ply("a2a3")), null);
assert.equal(e.replayChess([...blackMate.moves, ply("a2a3")]), null);
const onlyCheck = e.newChess("4k3/8/8/8/8/8/8/K3R3 b - - 0 1");
assert(onlyCheck.check && !onlyCheck.result && onlyCheck.legal.length > 0);
const repeated = sequence("Nf3 Nf6 Ng1 Ng8 Nf3 Nf6 Ng1 Ng8");
assert.equal(repeated.result.reason, "threefold");
assert.equal(e.newChess(repeated.fen).result, null); // FEN alone omits the repetition history.
assert.equal(e.replayChess([...repeated.moves, ply("e2e4")]), null);
assert.equal(e.undoChess(repeated).result, null);
const rightsDiffer = sequence("Ke2 Ke7 Ke1 Ke8 Ke2 Ke7 Ke1 Ke8", castleFen);
assert.equal(rightsDiffer.result, null); // Same pieces, but the initial castling rights make a distinct position.
// Both kings on e2/e7 with no castling rights first occurs at ply2, then6 and10.
const rightsThreefold = sequence(
  "Ke2 Ke7 Ke1 Ke8 Ke2 Ke7 Ke1 Ke8 Ke2 Ke7",
  castleFen,
);
assert.equal(rightsThreefold.result.reason, "threefold");
assert.equal(
  e.replayChess([...rightsThreefold.moves, ply("e2e1")], castleFen),
  null,
);
const fifty = e.playChess(
  e.newChess("7k/8/8/8/8/8/R7/K7 w - - 99 50"),
  ply("a2a3"),
);
assert.equal(fifty.result.reason, "fifty-move");
assert.equal(
  e.playChess(e.newChess("7k/8/8/8/8/8/P7/7K w - - 99 50"), ply("a2a3")).result,
  null,
);
assert.equal(
  e.playChess(e.newChess("7k/8/8/8/8/p7/R7/K7 w - - 99 50"), ply("a2a3"))
    .result,
  null,
);
const hundredMate = e.playChess(
  e.newChess("7k/5Q2/6K1/8/8/8/8/8 w - - 99 50"),
  ply("f7g7"),
);
assert.equal(hundredMate.fen.split(" ")[4], "100");
assert.equal(hundredMate.result.reason, "checkmate");

// Independent attack geometry checks the adapter's resulting king safety, not library attack methods.
function attacked(board, square, color) {
  const file = (s) => s.charCodeAt(0) - 97,
    rank = (s) => Number(s[1]) - 1;
  const occupied = new Map(board.filter(Boolean).map((p) => [p.square, p]));
  for (const p of board.filter((p) => p?.color === color)) {
    const df = file(square) - file(p.square),
      dr = rank(square) - rank(p.square);
    if (
      p.piece === "p" &&
      Math.abs(df) === 1 &&
      dr === (color === "w" ? 1 : -1)
    )
      return true;
    if (p.piece === "n" && Math.abs(df) * Math.abs(dr) === 2) return true;
    if (p.piece === "k" && Math.max(Math.abs(df), Math.abs(dr)) === 1)
      return true;
    const diagonal = Math.abs(df) === Math.abs(dr),
      straight = !df || !dr;
    if (!(
      (p.piece === "b" && diagonal) ||
      (p.piece === "r" && straight) ||
      (p.piece === "q" && (diagonal || straight))
    ))
      continue;
    let f = file(p.square) + Math.sign(df),
      r = rank(p.square) + Math.sign(dr),
      blocked = false;
    while (f !== file(square) || r !== rank(square)) {
      if (occupied.has(`${String.fromCharCode(97 + f)}${r + 1}`)) {
        blocked = true;
        break;
      }
      f += Math.sign(df);
      r += Math.sign(dr);
    }
    if (!blocked) return true;
  }
  return false;
}
let safety = 0;
for (const state of [
  start,
  castles,
  pinnedEP,
  freeEP,
  promotion,
  blackPromotion,
  onlyCheck,
  ...Array.from({ length: 10 }, (_, seed) =>
    e.dailyChess(`daily-fixture-${seed}`),
  ),
])
  for (const move of state.legal) {
    const next = e.playChess(state, e.chessPly(move));
    assert(next);
    const king = next.board.find(
      (p) => p?.piece === "k" && p.color === state.turn,
    );
    assert(
      king &&
        !attacked(next.board, king.square, state.turn === "w" ? "b" : "w"),
      e.chessPlyKey(move),
    );
    safety++;
  }
let dailyCount = 0;
for (let seed = 0; seed < 60; seed++) {
  const state = e.dailyChess(`day-${seed}`),
    raw = new Chess();
  assert.equal(state.moves.length, 6);
  assert.equal(state.turn, "w");
  assert.equal(state.result, null);
  for (const move of state.moves) {
    const made = raw.move(move);
    assert(!made.captured && !raw.inCheck());
  }
  assert.deepEqual(plain(e.dailyChess(`day-${seed}`)), plain(state));
  assert.deepEqual(plain(e.replayChess(state.moves)), plain(state));
  dailyCount++;
}

const budgets = { maxNodes: 20000, maxTimeMs: 10000, maxDepth: 2 };
for (const state of [
  promotion,
  blackPromotion,
  e.newChess("7k/5Q2/6K1/8/8/8/8/8 w - - 0 1"),
  e.newChess("8/8/8/8/8/6k1/5q2/7K b - - 0 1"),
]) {
  for (const level of ["medium", "hard"]) {
    const before = JSON.stringify(state),
      choice = ai.chooseChessMove(state, level, 913, budgets);
    assert(
      choice.move &&
        state.legal.some(
          (m) => e.chessPlyKey(m) === e.chessPlyKey(choice.move),
        ),
    );
    assert.equal(JSON.stringify(state), before);
    const after = e.playChess(state, choice.move);
    if (state === promotion || state === blackPromotion)
      assert.equal(choice.move.promotion, "r");
    else assert.equal(after.result?.reason, "checkmate");
    assert.deepEqual(
      plain(ai.chooseChessMove(state, level, 913, budgets)),
      plain(choice),
    );
  }
}
for (const level of ["easy", "medium", "hard"])
  assert.equal(ai.chooseChessMove(whiteMate, level, 1).move, null);
const fallback = ai.chooseChessMove(start, "hard", 77, {
  maxNodes: 1,
  maxTimeMs: 10000,
  maxDepth: 4,
});
assert.equal(fallback.nodes, 1);
assert.equal(fallback.depth, 0);
assert(fallback.budgetHit);
assert(
  start.legal.some((m) => e.chessPlyKey(m) === e.chessPlyKey(fallback.move)),
);
for (const options of [{ maxNodes: 0 }, { maxTimeMs: 0 }, { maxDepth: 7 }])
  assert.throws(() => ai.chooseChessMove(start, "hard", 1, options));
assert.throws(() => ai.chooseChessMove(start, "perfect", 1));
assert.throws(() => ai.chooseChessMove(start, "easy", -1));
console.log(
  JSON.stringify({
    upstreamPerftVectors: vectors.length,
    upstreamLeaves: vectors.reduce((s, v) => s + v[2], 0),
    adapterOpeningReplies: depthTwo,
    independentKingSafety: safety,
    reproducibleDailyPrefixes: dailyCount,
    specialRules:
      "castling rights/transit, en passant/pin/expiry, four promotions, mate/stalemate, threefold/rights, fifty/reset/mate precedence",
    AI: "both-colour mate choices, rook underpromotion over stalemate, immutable deterministic completed search and bounded fallback",
  }),
);
