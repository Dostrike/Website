import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { dotsEdge, playDots, newDots } from "../utils/dotsAndBoxesEngine";
import {
  newDotsRound,
  readDotsRound,
  encodeDotsRound,
  dotsSaveKey,
  moveDotsRound,
  undoDotsRound,
  canUndoDotsRound,
  assistDotsRound,
  dotsPositionKey,
  dotsReplyMatches,
  dotsFloor,
} from "../utils/dotsAndBoxesSession";
import type { DotsRound, DotsSettings } from "../utils/dotsAndBoxesSession";
import {
  readDotsRecords,
  writeDotsRecords,
  recordDotsResult,
  dotsStreak,
} from "../utils/dotsAndBoxesRecords";
import type { DotsWorkerReply } from "../workers/dotsAndBoxes.worker";
import "./BoardGame.css";
import "./DotsAndBoxes.css";
const defaults: DotsSettings = {
  size: 3,
  mode: "computer",
  human: 1,
  level: "medium",
};
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const player = (p: number) => (p === 1 ? "A" : "B");
function edgeLabel(size: number, id: number) {
  const edge = dotsEdge(size, id)!;
  return `${edge.orientation} edge from row ${edge.from.row + 1}, column ${edge.from.column + 1} to row ${edge.to.row + 1}, column ${edge.to.column + 1}`;
}
export default function DotsAndBoxes() {
  const location = useLocation(),
    navigate = useNavigate(),
    setup = location.pathname.replace(/\/+$/, "") === "/dots-and-boxes-setup";
  const [round, setRoundState] = useState<DotsRound>(
    () => readDotsRound() || newDotsRound(defaults, crypto.randomUUID()),
  );
  const roundRef = useRef(round);
  roundRef.current = round;
  const [settings, setSettings] = useState<DotsSettings>(round.settings),
    [saved, setSaved] = useState(readDotsRound),
    [records, setRecords] = useState(readDotsRecords);
  const [selected, setSelected] = useState<number | null>(null),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [paused, setPaused] = useState(false),
    [error, setError] = useState("");
  const worker = useRef<Worker | null>(null),
    sequence = useRef(0),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    edgesRef = useRef<(HTMLButtonElement | null)[]>([]);
  const canAct =
    round.game.result === null &&
    (round.settings.mode === "local" ||
      round.game.turn === round.settings.human);
  function setRound(next: DotsRound) {
    roundRef.current = next;
    setRoundState(next);
  }
  function stop(update = true) {
    sequence.current++;
    worker.current?.terminate();
    worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (update) setBusy(false);
  }
  function begin(nextSettings: DotsSettings, day: string | null = null) {
    stop();
    const next = newDotsRound(nextSettings, crypto.randomUUID(), day);
    setRound(next);
    setSelected(null);
    setPaused(false);
    setError("");
    setNotice("New round ready. A starts.");
    try {
      localStorage.setItem(dotsSaveKey, encodeDotsRound(next));
    } catch {
      /* Optional storage. */
    }
    navigate("/dots-and-boxes");
  }
  function describeMove(before: DotsRound, next: DotsRound, edge: number) {
    const count = next.game.captured.length;
    return `${player(before.game.turn)} drew the ${edgeLabel(next.settings.size, edge)}. ${count ? `${count} ${count === 1 ? "box" : "boxes"} claimed. ${next.game.result === null ? "Same player moves again." : ""}` : `${player(next.game.turn)} moves next.`}`;
  }
  function search(kind: "move" | "hint") {
    stop();
    const current = roundRef.current,
      requestId = sequence.current,
      key = dotsPositionKey(current);
    setBusy(true);
    setError("");
    setSelected(null);
    let w: Worker;
    const fail = (message: string) => {
      if (worker.current !== w) return;
      stop();
      setPaused(true);
      setError(message);
    };
    try {
      w = new Worker(
        new URL("../workers/dotsAndBoxes.worker.ts", import.meta.url),
        { type: "module" },
      );
    } catch {
      setBusy(false);
      setPaused(true);
      setError(
        "Computer worker could not start. Reload or try another browser.",
      );
      return;
    }
    worker.current = w;
    timer.current = setTimeout(
      () =>
        fail(
          "Computer search exceeded its time budget. Retry or undo to continue.",
        ),
      3000,
    );
    w.onerror = () =>
      fail("Computer search failed. Retry or choose another game.");
    w.onmessage = (event: MessageEvent<DotsWorkerReply>) => {
      const reply = event.data,
        now = roundRef.current;
      if (
        worker.current !== w ||
        !dotsReplyMatches(
          now,
          reply.requestId,
          sequence.current,
          reply.positionKey,
        )
      )
        return;
      if (
        reply.error ||
        reply.choice?.edge === null ||
        reply.choice?.edge === undefined
      ) {
        fail(reply.error || "No legal computer choice was returned.");
        return;
      }
      const edge = reply.choice.edge,
        next = moveDotsRound(now, edge);
      if (next === now) {
        fail("Computer returned an unavailable edge. Retry the search.");
        return;
      }
      stop();
      setPaused(false);
      if (kind === "hint") {
        setRound(assistDotsRound(now));
        setSelected(edge);
        setNotice(
          `Hint: ${edgeLabel(now.settings.size, edge)}. ${reply.choice.reason} Confirm to draw. Round marked assisted.`,
        );
        edgesRef.current[edge]?.focus();
      } else {
        setRound(next);
        setNotice(describeMove(now, next, edge));
      }
    };
    let seed = 2166136261;
    for (const c of key)
      seed = Math.imul(seed ^ c.charCodeAt(0), 16777619) >>> 0;
    w.postMessage({
      requestId,
      positionKey: key,
      state: current.game,
      level: kind === "hint" ? "hard" : current.settings.level,
      seed,
    });
  }
  useEffect(() => {
    if (setup) {
      stop();
      setSettings(roundRef.current.settings);
      setSaved(readDotsRound());
      setRecords(readDotsRecords());
    }
  }, [setup]);
  useEffect(() => () => stop(false), []);
  useEffect(() => {
    if (
      !setup &&
      round.game.result === null &&
      round.settings.mode === "computer" &&
      round.game.turn !== round.settings.human &&
      !busy &&
      !paused
    )
      search("move");
  }, [setup, round, busy, paused]);
  useEffect(() => {
    if (setup) return;
    try {
      localStorage.setItem("dostrike-last-pick", "dots-and-boxes");
      localStorage.setItem(dotsSaveKey, encodeDotsRound(round));
    } catch {
      /* Optional. */
    }
    const next = recordDotsResult(readDotsRecords(), round, today());
    writeDotsRecords(next);
    setRecords(next);
  }, [setup, round]);
  function select(edge: number) {
    if (round.game.edges[edge]) {
      setNotice(
        `That edge already belongs to ${player(round.game.edges[edge])}.`,
      );
      return;
    }
    if (!canAct || busy) return;
    if (selected === edge) {
      commit(edge);
      return;
    }
    setSelected(edge);
    const next = playDots(round.game, edge);
    setNotice(
      `Preview: ${edgeLabel(round.settings.size, edge)}. ${next.captured.length} boxes would be claimed. ${next.captured.length ? "This keeps the turn." : "This passes the turn."} Confirm to draw.`,
    );
  }
  function commit(edge: number) {
    if (!canAct || busy || round.game.edges[edge]) return;
    stop();
    const next = moveDotsRound(round, edge);
    if (next === round) return;
    setRound(next);
    setSelected(null);
    setPaused(false);
    setError("");
    setNotice(describeMove(round, next, edge));
  }
  function focusDirection(id: number, key: string) {
    const here = dotsEdge(round.settings.size, id)!,
      hx = (here.from.column + here.to.column) / 2,
      hy = (here.from.row + here.to.row) / 2;
    const direction =
      key === "ArrowLeft"
        ? [-1, 0]
        : key === "ArrowRight"
          ? [1, 0]
          : key === "ArrowUp"
            ? [0, -1]
            : [0, 1];
    let closest = id,
      best = Infinity;
    round.game.edges.forEach((_, other) => {
      const e = dotsEdge(round.settings.size, other)!,
        dx = (e.from.column + e.to.column) / 2 - hx,
        dy = (e.from.row + e.to.row) / 2 - hy,
        forward = dx * direction[0] + dy * direction[1];
      if (forward <= 0) return;
      const sideways = Math.abs(dx * direction[1] - dy * direction[0]),
        distance = forward + sideways * 3;
      if (distance < best) {
        best = distance;
        closest = other;
      }
    });
    edgesRef.current[closest]?.focus();
  }
  const history = useMemo(() => {
    let state = newDots(round.settings.size);
    return round.game.history.map((edge, index) => {
      const p = state.turn;
      state = playDots(state, edge);
      return `${index + 1}. ${index < dotsFloor(round) ? "Opening · " : ""}${player(p)} · ${edgeLabel(state.size, edge)}${state.captured.length ? ` · claimed ${state.captured.length}, kept turn` : ""}`;
    });
  }, [round]);
  const preview = selected !== null ? playDots(round.game, selected) : null,
    n = round.settings.size;
  const result =
    round.game.result === "draw"
      ? "A shared result."
      : round.settings.mode === "computer"
        ? round.game.result === round.settings.human
          ? "You claimed the board."
          : "The computer claimed the board."
        : `Player ${player(round.game.result || 1)} claimed the board.`;
  return (
    <main className="board-game-page dots-page">
      <Helmet>
        <title>
          {setup
            ? "Dots and Boxes: extra turns and thoughtful play"
            : "Dots and Boxes game"}{" "}
          | DoStrike
        </title>
        <meta
          name="description"
          content="Play Dots and Boxes with a friend or three bounded computer levels. Claim squares, keep extra turns, preview edges, save a round or try the daily opening."
        />
        <link
          rel="canonical"
          href={`https://dostrike.com${setup ? "/dots-and-boxes-setup" : "/dots-and-boxes"}`}
        />
        {!setup && <meta name="robots" content="noindex" />}
      </Helmet>
      <div className="board-game-top">
        <Link to="/" onClick={() => stop()}>
          ← All games
        </Link>
        <Link
          to="/blog/dots-and-boxes-extra-turns-and-control"
          onClick={() => stop()}
        >
          Learn turns and control ↗
        </Link>
      </div>
      <header className="board-game-heading">
        <p className="board-game-eyebrow">
          DRAW A LINE. KEEP THE NEXT MOVE IN MIND.
        </p>
        <h1>Dots and Boxes</h1>
        <p>
          One edge can change
          <br />
          who gets the next turn.
        </p>
      </header>
      {setup ? (
        <>
          <section className="board-game-setup">
            <h2>Make your board.</h2>
            {saved && (
              <button
                className="board-game-primary"
                onClick={() => {
                  stop();
                  setRound(saved);
                  setSelected(null);
                  setPaused(false);
                  setError("");
                  setNotice("Saved round restored.");
                  navigate("/dots-and-boxes");
                }}
              >
                Continue saved round →
              </button>
            )}
            <fieldset>
              <legend>Boxes per side</legend>
              <div className="dots-options">
                {[2, 3, 4].map((size) => (
                  <button
                    key={size}
                    aria-pressed={settings.size === size}
                    onClick={() => setSettings({ ...settings, size })}
                  >
                    {size} × {size} boxes
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Opponent</legend>
              <div className="dots-options">
                {(["computer", "local"] as const).map((mode) => (
                  <button
                    key={mode}
                    aria-pressed={settings.mode === mode}
                    onClick={() => setSettings({ ...settings, mode })}
                  >
                    {mode === "computer" ? "Computer" : "Two players here"}
                  </button>
                ))}
              </div>
            </fieldset>
            {settings.mode === "computer" && (
              <>
                <fieldset>
                  <legend>Your side · A always starts</legend>
                  <div className="dots-options">
                    {([1, 2] as const).map((human) => (
                      <button
                        key={human}
                        aria-pressed={settings.human === human}
                        onClick={() => setSettings({ ...settings, human })}
                      >
                        Play as {player(human)}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Computer level</legend>
                  <div className="dots-options">
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
              </>
            )}
            <p>
              {settings.size} × {settings.size} boxes use {settings.size + 1} ×{" "}
              {settings.size + 1} dots. Closing a box keeps your turn. Three
              computer levels use bounded search and heuristics; none promises
              perfect play.
            </p>
            <button
              className="board-game-primary"
              onClick={() => begin(settings)}
            >
              Start drawing ↗
            </button>
          </section>
          <section className="board-game-daily">
            <p className="board-game-eyebrow">TODAY’S OPENING · {today()}</p>
            <h2>Eight edges. Your next decision.</h2>
            <p>
              A legal 3 × 3-box opening with no claimed boxes. Play A against
              Hard. This is a full game, not a single-answer puzzle. Streak{" "}
              {dotsStreak(records, today())} · best {records.bestStreak}.
            </p>
            <button
              onClick={() =>
                begin(
                  { size: 3, mode: "computer", human: 1, level: "hard" },
                  today(),
                )
              }
            >
              Play today’s opening →
            </button>
          </section>
        </>
      ) : (
        <section aria-label="Dots and Boxes game">
          <div className="dots-topline">
            <span>
              {round.day ? `Daily · ${round.day}` : `${n} × ${n} boxes`} ·{" "}
              {round.settings.mode === "local"
                ? "Local two-player"
                : `${round.settings.level} · you are ${player(round.settings.human)}`}
              {round.assisted ? " · Assisted" : ""}
            </span>
            <Link to="/dots-and-boxes-setup" onClick={() => stop()}>
              Change setup
            </Link>
          </div>
          <div className="dots-score" aria-live="polite">
            <span>
              A <strong>{round.game.scores[0]}</strong>
            </span>
            <span>
              {round.game.result !== null
                ? "Round complete"
                : busy
                  ? "Thinking…"
                  : `${player(round.game.turn)} to move`}
            </span>
            <span>
              B <strong>{round.game.scores[1]}</strong>
            </span>
          </div>
          <p id="dots-help">
            Tab or arrows explore edges. Enter or Space previews, then confirms
            the same edge. Escape cancels. Dashed edges are available; A/B
            badges mark drawn edges. Large boards scroll inside their frame.
          </p>
          <div
            className="dots-scroll"
            role="region"
            aria-label="Scrollable dots board"
          >
            <div
              className="dots-board"
              role="group"
              aria-label="Dots and Boxes board"
              aria-describedby="dots-help"
              style={{ width: n * 96 + 56, height: n * 96 + 56 }}
            >
              {Array.from({ length: (n + 1) ** 2 }, (_, i) => (
                <span
                  className="dots-point"
                  key={`p${i}`}
                  style={{
                    left: 28 + (i % (n + 1)) * 96,
                    top: 28 + Math.floor(i / (n + 1)) * 96,
                  }}
                  aria-hidden="true"
                />
              ))}
              {Array.from({ length: n + 1 }, (_, i) => (
                <span
                  key={`c${i}`}
                  className="dots-axis"
                  style={{ left: 28 + i * 96, top: 3 }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
              ))}
              {Array.from({ length: n + 1 }, (_, i) => (
                <span
                  key={`r${i}`}
                  className="dots-axis"
                  style={{ left: 4, top: 28 + i * 96 }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
              ))}
              {round.game.boxes.map((owner, box) => (
                <span
                  key={`b${box}`}
                  role="img"
                  aria-label={`Box row ${Math.floor(box / n) + 1}, column ${(box % n) + 1}: ${owner ? `claimed by ${player(owner)}` : "unclaimed"}`}
                  className={`dots-box owner-${owner} ${round.game.captured.includes(box) ? "just-claimed" : ""}`}
                  style={{
                    left: 28 + (box % n) * 96 + 48,
                    top: 28 + Math.floor(box / n) * 96 + 48,
                  }}
                >
                  {owner ? player(owner) : ""}
                </span>
              ))}
              {round.game.edges.map((owner, id) => {
                const e = dotsEdge(n, id)!,
                  x = 28 + (e.from.column + e.to.column) * 48,
                  y = 28 + (e.from.row + e.to.row) * 48;
                return (
                  <button
                    type="button"
                    key={id}
                    ref={(el) => {
                      edgesRef.current[id] = el;
                    }}
                    className={`dots-edge ${e.orientation} owner-${owner} ${selected === id ? "is-preview" : ""}`}
                    style={{ left: x, top: y }}
                    aria-label={`${edgeLabel(n, id)}: ${owner ? `drawn by ${player(owner)}` : "available"}`}
                    aria-disabled={!!owner || !canAct || busy}
                    aria-pressed={selected === id}
                    onClick={() => select(id)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setSelected(null);
                        setNotice("Preview cancelled. No edge drawn.");
                      } else if (
                        [
                          "ArrowLeft",
                          "ArrowRight",
                          "ArrowUp",
                          "ArrowDown",
                        ].includes(event.key)
                      ) {
                        event.preventDefault();
                        focusDirection(id, event.key);
                      }
                    }}
                  >
                    <span className="dots-line" aria-hidden="true" />
                    {owner > 0 && (
                      <span className="dots-owner" aria-hidden="true">
                        {player(owner)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {selected !== null && preview !== round.game && preview && (
            <div className="dots-preview">
              <p>
                {edgeLabel(n, selected)} · claims {preview.captured.length}{" "}
                {preview.captured.length === 1 ? "box" : "boxes"}.
              </p>
              <button
                className="board-game-primary"
                disabled={!canAct || busy}
                onClick={() => commit(selected)}
              >
                Confirm edge
              </button>
              <button
                onClick={() => {
                  setSelected(null);
                  setNotice("Preview cancelled.");
                }}
              >
                Cancel preview
              </button>
            </div>
          )}
          <p role="status" className="dots-notice">
            {notice}
          </p>
          {error && (
            <div className="dots-error">
              <p role="alert">{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setPaused(false);
                  if (canAct) search("hint");
                }}
              >
                Retry search
              </button>
            </div>
          )}
          <div className="board-game-actions">
            <button
              disabled={!canUndoDotsRound(round)}
              onClick={() => {
                stop();
                setRound(undoDotsRound(round));
                setSelected(null);
                setError("");
                setPaused(false);
                setNotice(
                  "Returned to the previous human decision. Round marked assisted.",
                );
              }}
            >
              Undo (assisted)
            </button>
            <button
              disabled={!canAct || busy || round.game.result !== null}
              onClick={() => search("hint")}
            >
              Hint (assisted)
            </button>
            {busy && (
              <button
                onClick={() => {
                  stop();
                  setPaused(true);
                  setNotice("Search cancelled. Retry when ready.");
                }}
              >
                Cancel search
              </button>
            )}
            {paused &&
              !busy &&
              !canAct &&
              round.game.result === null &&
              !error && (
                <button onClick={() => setPaused(false)}>
                  Continue computer
                </button>
              )}
            <button onClick={() => begin(round.settings, round.day)}>
              Restart round
            </button>
          </div>
          {round.game.result !== null && (
            <div className="board-game-result">
              <h2>{result}</h2>
              <p>
                A {round.game.scores[0]} · B {round.game.scores[1]} ·{" "}
                {round.assisted ? "Assisted" : "Unassisted"}. Counted once for
                this completed attempt. Undo is closed after completion.
              </p>
              <button onClick={() => begin(round.settings, round.day)}>
                Play again
              </button>
            </div>
          )}
          <details className="dots-history">
            <summary>Edge history ({round.game.history.length})</summary>
            <ol>
              {history.map((entry, i) => (
                <li key={i}>{entry}</li>
              ))}
            </ol>
          </details>
        </section>
      )}
      <section className="board-game-records">
        <h2>Your Dots and Boxes records</h2>
        {Object.keys(records.rows).length ? (
          Object.entries(records.rows).map(([group, row]) => {
            const [size, mode, level, human] = group.split(":");
            return (
              <p key={group}>
                {size} × {size} ·{" "}
                {mode === "local"
                  ? "local"
                  : `${level}, you ${player(Number(human))}`}{" "}
                · {row.games} completed ·{" "}
                {mode === "local"
                  ? `A wins ${row.aWins}, B wins ${row.bWins}`
                  : `wins ${row.wins}, losses ${row.losses}`}{" "}
                · draws {row.draws} · assisted {row.assisted}.
              </p>
            );
          })
        ) : (
          <p>No completed rounds in this browser yet.</p>
        )}
        <p>
          Local A/B results are separate from computer wins. Sizes, levels and
          your side have separate records. Assistance counts include hints and
          undo. Daily streaks require a win on the opening’s date. Browser-only
          storage; no account or leaderboard.
        </p>
      </section>
      <section className="board-game-rules">
        <h2>Keep the turn. Consider the handover.</h2>
        <p>
          Draw one unused horizontal or vertical unit edge. Claim any box whose
          fourth side you complete and keep your turn. A shared edge can claim
          two boxes, but does not bank two extra moves. A non-capture passes the
          turn. More boxes wins; equal counts draw.
        </p>
        <p>
          Hints and computer choices respect extra turns. Hard uses a bounded
          search, with an exact small-ending result only when that search
          actually finishes. Taking an immediate box can be legal without being
          the best choice.
        </p>
        <Link
          to="/blog/dots-and-boxes-extra-turns-and-control"
          onClick={() => stop()}
        >
          Explore a verified capture-versus-control example →
        </Link>
      </section>
    </main>
  );
}
