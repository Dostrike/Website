import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { PieceSymbol, Square } from "chess.js";
import { chessPlyKey, playChess, validChessPly } from "../utils/chessEngine";
import type {
  ChessColor,
  ChessPly,
  ChessPromotion,
} from "../utils/chessEngine";
import {
  assistChessRound,
  canUndoChessRound,
  chessFloor,
  chessInitialRound,
  chessReplyMatches,
  encodeChessRound,
  makeChessRequest,
  moveChessRound,
  newChessRound,
  readChessRound,
  restartChessRound,
  undoChessRound,
  writeChessRound,
} from "../utils/chessSession";
import type { ChessRound, ChessSettings } from "../utils/chessSession";
import {
  chessStreak,
  readChessRecords,
  recordChessResult,
  writeChessRecords,
} from "../utils/chessRecords";
import type { ChessWorkerReply } from "../workers/chess.worker";
import "./BoardGame.css";
import "./ChessGame.css";
const defaults: ChessSettings = {
  mode: "computer",
  human: "w",
  level: "medium",
};
const colorName = (color: ChessColor) => (color === "w" ? "White" : "Black");
const pieceName: Record<PieceSymbol, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};
const drawName = {
  checkmate: "Checkmate",
  stalemate: "Stalemate",
  material: "Recognized material draw",
  threefold: "Automatic threefold draw",
  "fifty-move": "Automatic fifty-move draw",
};
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const humanTurn = (round: ChessRound) =>
  !round.game.result &&
  (round.settings.mode === "local" || round.game.turn === round.settings.human);
/** Original code-native silhouettes; no external artwork or fonts required. */
function ChessPiece({
  piece,
  color,
}: {
  piece: PieceSymbol;
  color: ChessColor;
}) {
  return (
    <svg
      viewBox="0 0 40 44"
      className={`chess-piece piece-${color}`}
      aria-hidden="true"
      focusable="false"
      strokeWidth="1.7"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {piece === "p" && (
        <>
          <circle cx="20" cy="10" r="6" />
          <path d="M15 18h10l-2 6 5 10H12l5-10Z" />
        </>
      )}
      {piece === "r" && (
        <path d="M9 6h5v6h4V6h4v6h4V6h5v11l-5 4 3 13H11l3-13-5-4Z" />
      )}
      {piece === "n" && (
        <>
          <path d="m12 34 3-12-7 2 3-9L22 6l7 4 3 9-5 7 3 8Z" />
          <path d="m15 11 2-7 5 2" />
          <circle className="chess-eye" cx="23" cy="14" r="1.4" />
        </>
      )}
      {piece === "b" && (
        <>
          <path d="M20 3c-10 7-12 13-4 17l-4 14h16l-4-14c8-4 6-10-4-17Z" />
          <path className="chess-cut" d="m23 7-7 8" />
        </>
      )}
      {piece === "q" && (
        <>
          <circle cx="10" cy="7" r="2.5" />
          <circle cx="20" cy="4" r="2.5" />
          <circle cx="30" cy="7" r="2.5" />
          <path d="m10 12 6 5 4-8 4 8 6-5-4 12H14Z" />
          <path d="m15 25-4 9h18l-4-9Z" />
        </>
      )}
      {piece === "k" && (
        <>
          <path d="M18 2h4v5h5v4h-5v6h-4v-6h-5V7h5Z" />
          <path d="M11 19h18l-4 15H15Z" />
        </>
      )}
      <path d="M10 35h20l3 6H7Z" />
    </svg>
  );
}
export default function ChessGame() {
  const location = useLocation(),
    navigate = useNavigate();
  const setup = location.pathname.replace(/\/+$/, "") === "/chess-setup";
  const [round, setRoundState] = useState<ChessRound>(
    () =>
      chessInitialRound(location.state?.chessRound) ||
      newChessRound(defaults, crypto.randomUUID()),
  );
  const roundRef = useRef(round);
  roundRef.current = round;
  const [settings, setSettings] = useState<ChessSettings>(round.settings),
    [saved, setSaved] = useState(readChessRound),
    [records, setRecords] = useState(readChessRecords);
  const [orientation, setOrientation] = useState<ChessColor>(
      round.settings.human,
    ),
    [focus, setFocus] = useState<Square>(
      round.settings.human === "w" ? "e2" : "e7",
    );
  const [source, setSource] = useState<Square | null>(null),
    [target, setTarget] = useState<Square | null>(null),
    [promotion, setPromotion] = useState<ChessPromotion | null>(null);
  const [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [paused, setPaused] = useState(false),
    [storageError, setStorageError] = useState(false);
  const worker = useRef<Worker | null>(null),
    sequence = useRef(0),
    lastHint = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null),
    revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttons = useRef<Partial<Record<Square, HTMLButtonElement | null>>>({});
  const squares = useMemo(() => {
    const order = Array.from(
      { length: 64 },
      (_, i) => `${"abcdefgh"[i % 8]}${8 - Math.floor(i / 8)}` as Square,
    );
    return orientation === "w" ? order : order.reverse();
  }, [orientation]);
  const board = useMemo(
    () =>
      new Map(
        round.game.board
          .filter((man) => man !== null)
          .map((man) => [man!.square, man!]),
      ),
    [round.game.board],
  );
  const candidates =
    source && target
      ? round.game.legal.filter(
          (move) => move.from === source && move.to === target,
        )
      : [];
  const needsPromotion = candidates.some((move) => !!move.promotion);
  const chosen = candidates.find((move) =>
    needsPromotion ? move.promotion === promotion : !move.promotion,
  );
  const preview = useMemo(
    () =>
      chosen
        ? playChess(round.game, {
            from: chosen.from,
            to: chosen.to,
            ...(chosen.promotion ? { promotion: chosen.promotion } : {}),
          })
        : null,
    [round.game, chosen],
  );
  const destinations = new Set(
    source
      ? round.game.legal
          .filter((move) => move.from === source)
          .map((move) => move.to)
      : [],
  );
  const lastMove = round.game.moves[round.game.moves.length - 1];
  function setRound(next: ChessRound) {
    roundRef.current = next;
    setRoundState(next);
  }
  function clearSelection() {
    setSource(null);
    setTarget(null);
    setPromotion(null);
  }
  function stop(update = true) {
    sequence.current++;
    worker.current?.terminate();
    worker.current = null;
    if (timeout.current) clearTimeout(timeout.current);
    if (revealTimer.current) clearTimeout(revealTimer.current);
    timeout.current = null;
    revealTimer.current = null;
    if (update) setBusy(false);
  }
  function begin(nextSettings: ChessSettings, day: string | null = null) {
    stop();
    const next = newChessRound(nextSettings, crypto.randomUUID(), day);
    setRound(next);
    clearSelection();
    setPaused(false);
    setError("");
    setOrientation(nextSettings.human);
    setFocus(nextSettings.human === "w" ? "e2" : "e7");
    writeChessRound(next);
    navigate("/chess", { state: { chessRound: encodeChessRound(next) } });
  }
  function describe(before: ChessRound, next: ChessRound) {
    const move = next.game.moves[next.game.moves.length - 1],
      san = next.game.san[next.game.san.length - 1];
    return `${colorName(before.game.turn)} played ${san}, ${move.from} to ${move.to}${move.promotion ? `, promoting to ${pieceName[move.promotion]}` : ""}. ${next.game.result ? drawName[next.game.result.reason] + "." : `${colorName(next.game.turn)} to move${next.game.check ? ", in check" : ""}.`}`;
  }
  function commit(move: ChessPly) {
    const current = roundRef.current;
    if (!humanTurn(current) || busy) return;
    const next = moveChessRound(current, move);
    if (next === current) {
      setNotice("That move is unavailable. Select a legal destination.");
      return;
    }
    stop();
    setRound(next);
    clearSelection();
    setPaused(false);
    setError("");
    setNotice(describe(current, next));
  }
  function select(square: Square) {
    const current = roundRef.current;
    if (!humanTurn(current) || busy) return;
    const man = current.game.board.find((man) => man?.square === square);
    if (man?.color === current.game.turn) {
      if (source === square && !target) {
        clearSelection();
        setNotice("Selection cancelled. No move made.");
      } else {
        setSource(square);
        setTarget(null);
        setPromotion(null);
        setNotice(
          `${colorName(man.color)} ${pieceName[man.piece]} on ${square}. Choose a marked legal destination.`,
        );
      }
      return;
    }
    if (!source) {
      setNotice("Select one of the moving side’s pieces first.");
      return;
    }
    const legal = current.game.legal.filter(
      (move) => move.from === source && move.to === square,
    );
    if (!legal.length) {
      setNotice(
        `${source} to ${square} is not a legal move. Choose a marked destination or another piece.`,
      );
      return;
    }
    const promoted = legal.some((move) => !!move.promotion);
    const move = legal.find((move) =>
      promoted ? move.promotion === promotion : !move.promotion,
    );
    if (target === square && move) {
      commit(move);
      return;
    }
    setTarget(square);
    setPromotion(null);
    setNotice(
      promoted
        ? `Promotion on ${square}: choose queen, rook, bishop or knight, then confirm. Nothing has moved yet.`
        : `Preview ${legal[0].san}. Confirm to move, or Escape to cancel.`,
    );
  }
  function search(hint = false) {
    const current = roundRef.current;
    if (
      current.game.result ||
      (hint
        ? !humanTurn(current)
        : current.settings.mode !== "computer" || humanTurn(current))
    )
      return;
    stop();
    clearSelection();
    lastHint.current = hint;
    setBusy(true);
    setError("");
    const request = makeChessRequest(current, sequence.current, hint);
    let w: Worker;
    const fail = (message: string) => {
      if (worker.current !== w) return;
      stop();
      setPaused(true);
      setError(message);
    };
    try {
      w = new Worker(new URL("../workers/chess.worker.ts", import.meta.url), {
        type: "module",
      });
    } catch {
      setBusy(false);
      setPaused(true);
      setError("Chess worker could not start. Retry or return to setup.");
      return;
    }
    worker.current = w;
    timeout.current = setTimeout(
      () => fail("Computer response timed out. Retry or undo to continue."),
      4000,
    );
    w.onerror = () =>
      fail("Computer response failed. Retry or return to setup.");
    w.onmessage = (event: MessageEvent<ChessWorkerReply>) => {
      const reply = event.data;
      revealTimer.current = setTimeout(() => {
        const now = roundRef.current;
        if (
          worker.current !== w ||
          !chessReplyMatches(
            now,
            reply.requestId,
            sequence.current,
            reply.positionKey,
          )
        )
          return;
        const move = reply.choice?.move;
        if (
          reply.error ||
          !validChessPly(move) ||
          !now.game.legal.some(
            (legal) => chessPlyKey(legal) === chessPlyKey(move),
          )
        ) {
          fail(reply.error || "No legal move was returned. Retry the search.");
          return;
        }
        stop();
        setPaused(false);
        if (hint) {
          setRound(assistChessRound(now));
          setSource(move.from);
          setTarget(move.to);
          setPromotion(move.promotion || null);
          setFocus(move.to);
          setNotice(
            `Hint: ${move.from} to ${move.to}${move.promotion ? `, ${pieceName[move.promotion]} promotion` : ""}. ${reply.choice!.reason} Confirm or change the suggestion. Round marked assisted.`,
          );
          buttons.current[move.to]?.focus();
        } else {
          const next = moveChessRound(now, move);
          setRound(next);
          clearSelection();
          setNotice(describe(now, next));
        }
      }, 300);
    };
    w.postMessage(request);
  }
  useEffect(() => {
    if (setup) {
      stop();
      setSettings(roundRef.current.settings);
      setSaved(readChessRound());
      setRecords(readChessRecords());
    }
  }, [setup]);
  useEffect(() => () => stop(false), []);
  useEffect(() => {
    if (location.state?.chessRound)
      navigate(location.pathname, { replace: true, state: null });
  }, [location.state?.chessRound]);
  useEffect(() => {
    if (
      !setup &&
      !round.game.result &&
      round.settings.mode === "computer" &&
      !humanTurn(round) &&
      !busy &&
      !paused
    )
      search();
  }, [setup, round, busy, paused]);
  useEffect(() => {
    if (setup) return;
    const savedOK = writeChessRound(round),
      next = recordChessResult(readChessRecords(), round, today());
    setRecords(next);
    const recordsOK = writeChessRecords(next);
    setStorageError(!savedOK || !recordsOK);
    try {
      localStorage.setItem("dostrike-last-pick", "chess");
    } catch {
      /* Optional preference. */
    }
  }, [setup, round]);
  function key(event: KeyboardEvent<HTMLButtonElement>, square: Square) {
    if (event.key === "Escape") {
      clearSelection();
      setNotice("Preview cancelled. No move made.");
      return;
    }
    const index = squares.indexOf(square);
    let next = index;
    if (event.key === "ArrowLeft") next = index % 8 ? index - 1 : index;
    else if (event.key === "ArrowRight")
      next = index % 8 < 7 ? index + 1 : index;
    else if (event.key === "ArrowUp") next = Math.max(0, index - 8);
    else if (event.key === "ArrowDown") next = Math.min(63, index + 8);
    else if (event.key === "Home")
      next = event.ctrlKey ? 0 : index - (index % 8);
    else if (event.key === "End")
      next = event.ctrlKey ? 63 : index - (index % 8) + 7;
    else return;
    event.preventDefault();
    setFocus(squares[next]);
    buttons.current[squares[next]]?.focus();
  }
  function restart() {
    stop();
    const next = restartChessRound(roundRef.current, crypto.randomUUID());
    setRound(next);
    clearSelection();
    setError("");
    setPaused(false);
    setNotice("New attempt from the same opening. White moves first.");
  }
  const result = round.game.result;
  return (
    <main
      className={`board-game-page chess-page ${setup ? "" : "chess-playing"}`}
    >
      <Helmet>
        <title>
          {setup ? "Chess: choose your side and think ahead" : "Chess game"} |
          DoStrike
        </title>
        <meta
          name="description"
          content="Play untimed Chess with three bounded computer levels or a friend. Choose either colour, preview moves, select promotions, save a round and try the daily opening."
        />
        <link
          rel="canonical"
          href={`https://dostrike.com${setup ? "/chess-setup" : "/chess"}`}
        />
        {!setup && <meta name="robots" content="noindex,follow" />}
      </Helmet>
      <div className="board-game-top">
        <Link to="/" onClick={() => stop()}>
          ← All games
        </Link>
        <Link
          to="/blog/chess-checks-promotion-and-draws"
          onClick={() => stop()}
        >
          Learn checks and choices ↗
        </Link>
      </div>
      <header className="board-game-heading">
        <span className="board-game-eyebrow">
          SEE THE THREAT. CHOOSE THE REPLY.
        </span>
        <h1>Chess</h1>
        <p>
          A familiar board.
          <br />A fresh position to understand.
        </p>
      </header>
      {setup ? (
        <section className="board-game-setup" aria-label="Chess setup">
          {saved && (
            <div className="chess-saved">
              <h2>A round is saved here</h2>
              <p>
                {saved.day ? `Daily ${saved.day}` : saved.settings.mode} ·{" "}
                {saved.game.san.length} plies ·{" "}
                {saved.game.result
                  ? drawName[saved.game.result.reason]
                  : `${colorName(saved.game.turn)} to move`}
              </p>
              <button
                onClick={() => {
                  stop();
                  setRound(saved);
                  clearSelection();
                  setOrientation(saved.settings.human);
                  setPaused(false);
                  setError("");
                  navigate("/chess", {
                    state: { chessRound: encodeChessRound(saved) },
                  });
                }}
              >
                Continue saved round
              </button>
            </div>
          )}
          <h2>Choose your game</h2>
          <fieldset>
            <legend>Play mode</legend>
            <div className="chess-options">
              {(["computer", "local"] as const).map((mode) => (
                <button
                  key={mode}
                  aria-pressed={settings.mode === mode}
                  onClick={() => setSettings({ ...settings, mode })}
                >
                  {mode === "computer" ? "Computer" : "Local two-player"}
                </button>
              ))}
            </div>
          </fieldset>
          {settings.mode === "computer" && (
            <>
              <fieldset>
                <legend>Computer level</legend>
                <div className="chess-options">
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <button
                      key={level}
                      aria-pressed={settings.level === level}
                      onClick={() => setSettings({ ...settings, level })}
                    >
                      {level[0].toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>Your colour · White moves first</legend>
                <div className="chess-options">
                  {(["w", "b"] as const).map((human) => (
                    <button
                      key={human}
                      aria-pressed={settings.human === human}
                      onClick={() => setSettings({ ...settings, human })}
                    >
                      You are {colorName(human)}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <p>
            Untimed play. Castling, en passant and all four promotions are
            included. Hard uses bounded search, not perfect play or an Elo
            rating.
          </p>
          <p>
            Casual automatic draws: threefold repetition, 50 moves by each side
            without a pawn move or capture, stalemate and recognized material
            cases. These early automatic draws differ from FIDE tournament
            claims.
          </p>
          <button
            className="board-game-primary"
            onClick={() => begin(settings)}
          >
            Start Chess
          </button>
          <div className="chess-daily">
            <h2>Today’s opening</h2>
            <p>
              {today()} · six legal quiet opening plies, then you play White
              against Hard. It is a full game, not a unique-answer puzzle or a
              promised balanced position. Win on the opening’s date to advance
              your browser streak; assisted wins are labelled and included.
            </p>
            <p>
              Current streak {chessStreak(records, today())} · best{" "}
              {records.bestStreak}
            </p>
            <button
              onClick={() =>
                begin({ mode: "computer", human: "w", level: "hard" }, today())
              }
            >
              Play daily opening
            </button>
          </div>
        </section>
      ) : (
        <section aria-label="Chess game">
          <div className="chess-topline">
            <span>
              {round.day ? `Daily ${round.day}` : round.settings.mode} ·{" "}
              {round.settings.mode === "computer"
                ? `${round.settings.level}, you ${colorName(round.settings.human)}`
                : "both players here"}{" "}
              · {round.assisted ? "Assisted" : "Unassisted"}
            </span>
            <Link to="/chess-setup" onClick={() => stop()}>
              Change setup
            </Link>
          </div>
          <div className="chess-status" aria-live="polite">
            <strong>
              {result
                ? result.winner === "draw"
                  ? drawName[result.reason]
                  : `${colorName(result.winner)} wins by checkmate`
                : busy
                  ? "Thinking…"
                  : `${colorName(round.game.turn)} to move${round.game.check ? " · Check" : ""}`}
            </strong>
            <span>
              {colorName(orientation)} at the bottom · untimed
              {round.day ? " · six-ply opening protected from Undo" : ""}
            </span>
          </div>
          <p id="chess-help">
            Select a piece, then a marked destination. Activate that destination
            again or use Confirm move. Promotion needs an explicit piece choice.
            Arrows move visually; Enter/Space select, Escape cancels. The board
            scrolls inside its frame on small screens.
          </p>
          <div
            className="chess-scroll"
            role="region"
            aria-label="Scrollable Chess board"
          >
            <div
              className="chess-board"
              role="group"
              aria-label="Chess board"
              aria-describedby="chess-help"
            >
              <span aria-hidden="true" />
              {squares.slice(0, 8).map((square) => (
                <span
                  className="chess-axis"
                  key={`file-${square}`}
                  aria-hidden="true"
                >
                  {square[0]}
                </span>
              ))}
              {squares.map((square, index) => {
                const man = board.get(square),
                  dark =
                    (square.charCodeAt(0) - 97 + Number(square[1])) % 2 === 1;
                const check =
                  round.game.check &&
                  man?.piece === "k" &&
                  man.color === round.game.turn;
                return (
                  <span key={square} className="chess-square-entry">
                    {index % 8 === 0 && (
                      <span
                        className="chess-axis chess-rank"
                        aria-hidden="true"
                      >
                        {square[1]}
                      </span>
                    )}
                    <button
                      type="button"
                      ref={(el) => {
                        buttons.current[square] = el;
                      }}
                      tabIndex={focus === square ? 0 : -1}
                      className={`chess-square ${dark ? "square-dark" : "square-light"} ${source === square ? "is-source" : ""} ${target === square ? "is-target" : ""} ${destinations.has(square) ? "is-legal" : ""} ${check ? "in-check" : ""} ${lastMove && (lastMove.from === square || lastMove.to === square) ? "last-move" : ""}`}
                      aria-label={`${square}: ${man ? `${colorName(man.color)} ${pieceName[man.piece]}` : "empty"}${destinations.has(square) ? ", legal destination" : ""}${check ? ", in check" : ""}`}
                      aria-pressed={source === square || target === square}
                      aria-disabled={!humanTurn(round) || busy}
                      onFocus={() => setFocus(square)}
                      onClick={() => select(square)}
                      onKeyDown={(event) => key(event, square)}
                    >
                      {man && (
                        <ChessPiece piece={man.piece} color={man.color} />
                      )}
                      <span
                        className="chess-cell-coordinate"
                        aria-hidden="true"
                      >
                        {square}
                      </span>
                      {destinations.has(square) && (
                        <span
                          className={`chess-destination ${man ? "capture" : ""}`}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
          {source && (
            <div className="chess-preview">
              <p>
                {target
                  ? chosen
                    ? `Preview ${chosen.san} · ${source} → ${target}${chosen.promotion ? ` · ${pieceName[chosen.promotion]}` : ""}`
                    : `Promotion ${source} → ${target}: choose a piece below.`
                  : `Selected ${source}. Choose a marked legal destination.`}
              </p>
              {needsPromotion && (
                <div
                  role="group"
                  aria-label="Promotion choice"
                  className="chess-promotions"
                >
                  {(["q", "r", "b", "n"] as const).map((piece) => (
                    <button
                      key={piece}
                      aria-pressed={promotion === piece}
                      onClick={() => {
                        setPromotion(piece);
                        setNotice(
                          `${pieceName[piece]} selected. Confirm to promote; the board is unchanged until then.`,
                        );
                      }}
                    >
                      <ChessPiece piece={piece} color={round.game.turn} />
                      <span>
                        {pieceName[piece][0].toUpperCase() +
                          pieceName[piece].slice(1)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {preview?.result && (
                <p>
                  Preview outcome: {drawName[preview.result.reason]}
                  {preview.result.winner !== "draw"
                    ? ` for ${colorName(preview.result.winner)}`
                    : ""}
                  .
                </p>
              )}
              {chosen && (
                <button
                  className="board-game-primary"
                  disabled={!humanTurn(round) || busy}
                  onClick={() =>
                    commit({
                      from: chosen.from,
                      to: chosen.to,
                      ...(chosen.promotion
                        ? { promotion: chosen.promotion }
                        : {}),
                    })
                  }
                >
                  Confirm move
                </button>
              )}
              <button
                onClick={() => {
                  clearSelection();
                  setNotice("Preview cancelled. No move made.");
                }}
              >
                Cancel selection
              </button>
            </div>
          )}
          <p role="status" className="chess-notice">
            {notice}
          </p>
          {error && (
            <div className="chess-error">
              <p role="alert">{error}</p>
              <button onClick={() => search(lastHint.current)}>
                Retry search
              </button>
            </div>
          )}
          <div className="board-game-actions">
            <button
              disabled={!canUndoChessRound(round)}
              onClick={() => {
                stop();
                setRound(undoChessRound(roundRef.current));
                clearSelection();
                setPaused(false);
                setError("");
                setNotice(
                  "Returned to the previous decision. Round marked assisted.",
                );
              }}
            >
              Undo (assisted)
            </button>
            <button
              disabled={!humanTurn(round) || busy}
              onClick={() => search(true)}
            >
              Hint (assisted)
            </button>
            {busy && (
              <button
                onClick={() => {
                  stop();
                  setPaused(true);
                  setNotice("Search cancelled. No suggestion applied.");
                }}
              >
                Cancel search
              </button>
            )}
            {paused && !busy && !humanTurn(round) && !result && !error && (
              <button onClick={() => setPaused(false)}>
                Continue computer
              </button>
            )}
            <button
              onClick={() => {
                setOrientation(orientation === "w" ? "b" : "w");
                clearSelection();
                setNotice(
                  "Board flipped. Algebraic coordinates keep their true names.",
                );
              }}
            >
              Flip board
            </button>
            <button onClick={restart}>Restart round</button>
          </div>
          {result && (
            <div className="board-game-result">
              <h2>
                {result.winner === "draw"
                  ? drawName[result.reason]
                  : `${colorName(result.winner)} wins`}
              </h2>
              <p>
                {result.winner !== "draw" ? "Checkmate. " : ""}
                {round.assisted ? "Assisted" : "Unassisted"} ·{" "}
                {round.game.moves.length - chessFloor(round)} played plies
                {round.day ? " beyond the opening" : ""}. Undo is closed after
                completion. Recent attempt IDs avoid duplicate records on
                reload.
              </p>
              <button onClick={restart}>Play again</button>
            </div>
          )}
          <details className="chess-history">
            <summary>Move history ({round.game.san.length} plies)</summary>
            <ol>
              {round.game.san.map((san, index) => (
                <li key={index}>
                  {Math.floor(index / 2) + 1}
                  {index % 2 ? "…" : "."} {index % 2 ? "Black" : "White"} ·{" "}
                  {san}
                  {round.day && index < 6 ? " · daily opening" : ""}
                </li>
              ))}
            </ol>
          </details>
        </section>
      )}
      {storageError && (
        <p role="alert">
          Browser storage is unavailable. Play works now, but progress and
          records may not survive leaving.
        </p>
      )}
      <section className="board-game-records">
        <h2>Your Chess records</h2>
        {Object.entries(records.rows).length ? (
          Object.entries(records.rows).map(([group, row]) => (
            <p key={group}>
              {group === "local"
                ? `Local · White wins ${row.whiteWins}, Black wins ${row.blackWins}`
                : `${group.split(":")[1]}, you ${colorName(group.split(":")[2] as ChessColor)} · wins ${row.wins} (${row.cleanWins} unassisted, ${row.assistedWins} assisted), losses ${row.losses}`}{" "}
              · draws {row.draws} · {row.games} completed · {row.assisted}{" "}
              assisted.
            </p>
          ))
        ) : (
          <p>No completed Chess rounds in this browser yet.</p>
        )}
        <p>
          Local White/Black outcomes are separate from computer wins. Colour and
          level have separate rows. Hints and Undo mark assistance. The most
          recent 128 completed attempt IDs prevent reload duplicates.
          Browser-only records, no account, rating or leaderboard.
        </p>
      </section>
      <section className="board-game-rules">
        <h2>Check the king. Choose the reply.</h2>
        <p>
          White moves first. Keep your own king safe; a checked king needs a
          legal reply. Checkmate wins, while stalemate draws. Castling requires
          retained rights and safe empty transit squares; en passant is
          available only immediately after the relevant double pawn move. Choose
          queen, rook, bishop or knight when a pawn promotes.
        </p>
        <p>
          This casual version automatically draws at threefold repetition, 50
          moves by each side without a pawn move or capture, stalemate and
          recognized insufficient-material cases. These early automatic draws
          differ from FIDE tournament claim procedures. The material check does
          not solve every possible dead position.
        </p>
        <p>
          Move legality uses{" "}
          <a href="https://github.com/jhlywa/chess.js/tree/v1.4.0">
            chess.js 1.4.0
          </a>{" "}
          by Jeff Hlywa, under{" "}
          <a href="/licenses/chess-js-1.4.0.txt">
            BSD-2-Clause; read the licence notice
          </a>
          . DoStrike supplies the interface, bounded opponents, saved rounds and
          worked explanations. No perfect-play or Elo claim.
        </p>
        <Link
          to="/blog/chess-checks-promotion-and-draws"
          onClick={() => stop()}
        >
          Explore a position where a rook promotion beats a queen →
        </Link>
      </section>
    </main>
  );
}
