import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  SEA_LENGTHS,
  SEA_SHIP_NAMES,
  generateSeaFleet,
  placeSeaShip,
  seaCoordinate,
  seaKnowledge,
  seaShipCells,
  validSeaFleet,
  validSeaCell,
} from "../utils/seaBattleEngine";
import type {
  SeaAxis,
  SeaFleet,
  SeaMark,
  SeaPlayer,
  SeaShipId,
} from "../utils/seaBattleEngine";
import {
  assistSeaRound,
  canUndoSeaRound,
  makeSeaRequest,
  moveSeaRound,
  newSeaRound,
  readSeaRound,
  restartSeaRound,
  seaDailyFleet,
  seaReplyMatches,
  undoSeaRound,
  writeSeaRound,
  encodeSeaRound,
  seaInitialRound,
} from "../utils/seaBattleSession";
import type { SeaRound, SeaSettings } from "../utils/seaBattleSession";
import {
  readSeaRecords,
  recordSeaResult,
  seaStreak,
  writeSeaRecords,
} from "../utils/seaBattleRecords";
import type { SeaWorkerReply } from "../workers/seaBattle.worker";
import "./BoardGame.css";
import "./SeaBattle.css";
const defaults: SeaSettings = { mode: "computer", human: 1, level: "medium" };
const player = (p: number) => (p === 1 ? "A" : "B");
const freshSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export default function SeaBattle() {
  const location = useLocation(),
    navigate = useNavigate();
  const setup = location.pathname.replace(/\/+$/, "") === "/sea-battle-setup";
  const [round, setRoundState] = useState<SeaRound | null>(() =>
    seaInitialRound(location.state?.seaBattle),
  );
  const roundRef = useRef(round);
  roundRef.current = round;
  const [settings, setSettings] = useState<SeaSettings>(
    round?.settings || defaults,
  );
  const [saved, setSaved] = useState(readSeaRound),
    [records, setRecords] = useState(readSeaRecords);
  const [phase, setPhase] = useState<"options" | "placement" | "play">(
    setup ? "options" : round ? "play" : "placement",
  );
  const [drafts, setDrafts] = useState<[SeaFleet, SeaFleet]>([[], []]);
  const [placing, setPlacing] = useState<SeaPlayer>(1),
    [pendingDay, setPendingDay] = useState<string | null>(null);
  const [ship, setShip] = useState<SeaShipId>(0),
    [axis, setAxis] = useState<SeaAxis>("horizontal");
  const [selected, setSelected] = useState<number | null>(null),
    [focus, setFocus] = useState(0);
  const [handoff, setHandoff] = useState<SeaPlayer | null>(
    round?.settings.mode === "local" && !round.game.winner
      ? round.game.turn
      : null,
  );
  const [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false),
    [paused, setPaused] = useState(false),
    [review, setReview] = useState(false);
  const worker = useRef<Worker | null>(null),
    sequence = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null),
    revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  function setRound(next: SeaRound) {
    roundRef.current = next;
    setRoundState(next);
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
  function prepare(next: SeaSettings, day: string | null = null) {
    stop();
    setSettings(next);
    setPendingDay(day);
    setDrafts([[], []]);
    setPlacing(next.mode === "computer" ? next.human : 1);
    setPhase("placement");
    setHandoff(next.mode === "local" ? 1 : null);
    setShip(0);
    setAxis("horizontal");
    setSelected(null);
    setFocus(0);
    setPaused(false);
    setError("");
    setReview(false);
    setNotice("Place all five ships. Touching is allowed; overlap is not.");
  }
  function goSetup() {
    stop();
    setPhase("options");
    setHandoff(null);
    setSaved(readSeaRound());
  }
  function startBattle() {
    if (!validSeaFleet(drafts[placing - 1])) return;
    if (settings.mode === "local" && placing === 1) {
      setPlacing(2);
      setHandoff(2);
      setShip(0);
      setSelected(null);
      setFocus(0);
      setNotice("A’s fleet is ready. Pass the device to B.");
      return;
    }
    try {
      const fleetA =
        settings.mode === "computer" && settings.human === 2
          ? generateSeaFleet(freshSeed())
          : drafts[0];
      const fleetB =
        settings.mode === "computer" && settings.human === 1
          ? pendingDay
            ? seaDailyFleet(pendingDay)
            : generateSeaFleet(freshSeed())
          : drafts[1];
      const next = newSeaRound(
        settings,
        crypto.randomUUID(),
        fleetA,
        fleetB,
        pendingDay,
      );
      stop();
      setRound(next);
      setPhase("play");
      setHandoff(settings.mode === "local" ? 1 : null);
      setSelected(null);
      setFocus(0);
      setPaused(false);
      setReview(false);
      setNotice("Battle ready. A fires first; every shot passes the turn.");
      writeSeaRound(next);
      navigate("/sea-battle", { state: { seaBattle: encodeSeaRound(next) } });
    } catch {
      setError(
        "The fleet could not be prepared. Try auto-place or arrange again.",
      );
    }
  }
  function describe(next: SeaRound) {
    const shot = next.game.history[next.game.history.length - 1];
    return `${player(shot.player)} fired at ${seaCoordinate(shot.cell)}: ${shot.result === "sunk" ? `${SEA_SHIP_NAMES[shot.sunk!]} sunk` : shot.result}. ${next.game.winner ? `${player(next.game.winner)} wins.` : `${player(next.game.turn)} fires next, even after a hit.`}`;
  }
  function search(hint = false) {
    const current = roundRef.current;
    if (!current || current.game.winner) return;
    stop();
    setBusy(true);
    setError("");
    setSelected(null);
    const request = makeSeaRequest(current, sequence.current, hint);
    let w: Worker;
    const fail = (message: string) => {
      if (worker.current !== w) return;
      stop();
      setPaused(true);
      setError(message);
    };
    try {
      w = new Worker(
        new URL("../workers/seaBattle.worker.ts", import.meta.url),
        { type: "module" },
      );
    } catch {
      setBusy(false);
      setPaused(true);
      setError("Computer worker could not start. Retry or return to setup.");
      return;
    }
    worker.current = w;
    timeout.current = setTimeout(
      () => fail("Computer response timed out. Retry or undo to continue."),
      3000,
    );
    w.onerror = () =>
      fail("Computer response failed. Retry or return to setup.");
    w.onmessage = (event: MessageEvent<SeaWorkerReply>) => {
      const reply = event.data;
      // Brief presentation window keeps thinking feedback calm and allows cancellation.
      revealTimer.current = setTimeout(() => {
        const now = roundRef.current;
        if (
          worker.current !== w ||
          !now ||
          !seaReplyMatches(
            now,
            reply.requestId,
            sequence.current,
            reply.positionKey,
          )
        )
          return;
        if (reply.error || !reply.choice) {
          fail(
            reply.error || "No unused target was returned. Retry the search.",
          );
          return;
        }
        if (
          !validSeaCell(reply.choice.cell) ||
          seaKnowledge(now.game, now.game.turn).marks[reply.choice.cell] !==
            "unknown"
        ) {
          fail("The suggested coordinate is unavailable. Retry the search.");
          return;
        }
        stop();
        setPaused(false);
        if (hint) {
          setRound(assistSeaRound(now));
          setSelected(reply.choice.cell);
          setFocus(reply.choice.cell);
          setNotice(
            `Suggested target ${seaCoordinate(reply.choice.cell)}. ${reply.choice.reason} Confirm to fire. Round marked assisted.`,
          );
          cells.current[reply.choice.cell]?.focus();
        } else {
          const next = moveSeaRound(now, now.game.turn, reply.choice.cell);
          setRound(next);
          setNotice(describe(next));
        }
      }, 400);
    };
    // Strict payload builder sends public observations, never fleets or placement seeds.
    w.postMessage(request);
  }
  useEffect(() => {
    if (setup) {
      stop();
      setSaved(readSeaRound());
      setRecords(readSeaRecords());
    }
  }, [setup]);
  useEffect(() => () => stop(false), []);
  useEffect(() => {
    if (location.state?.seaBattle)
      navigate(location.pathname, { replace: true, state: null });
  }, [location.state?.seaBattle]);
  useEffect(() => {
    if (
      !setup &&
      phase === "play" &&
      round &&
      !round.game.winner &&
      round.settings.mode === "computer" &&
      round.game.turn !== round.settings.human &&
      !busy &&
      !paused
    )
      search();
  }, [setup, phase, round, busy, paused]);
  useEffect(() => {
    if (setup || phase !== "play" || !round) return;
    const savedOK = writeSeaRound(round);
    try {
      localStorage.setItem("dostrike-last-pick", "sea-battle");
    } catch {
      /* Optional preference. */
    }
    const next = recordSeaResult(readSeaRecords(), round, today());
    setRecords(next);
    setStorageError(!savedOK || !writeSeaRecords(next));
  }, [setup, phase, round]);
  function key(event: KeyboardEvent<HTMLButtonElement>, cell: number) {
    if (event.key === "Escape") {
      setSelected(null);
      setNotice("Preview cancelled. Nothing changed.");
      return;
    }
    let next = cell;
    if (event.key === "ArrowLeft") next = cell % 10 ? cell - 1 : cell;
    else if (event.key === "ArrowRight") next = cell % 10 < 9 ? cell + 1 : cell;
    else if (event.key === "ArrowUp") next = Math.max(0, cell - 10);
    else if (event.key === "ArrowDown") next = Math.min(99, cell + 10);
    else if (event.key === "Home")
      next = event.ctrlKey ? 0 : cell - (cell % 10);
    else if (event.key === "End")
      next = event.ctrlKey ? 99 : cell - (cell % 10) + 9;
    else return;
    event.preventDefault();
    setFocus(next);
    cells.current[next]?.focus();
  }
  function place(cell: number) {
    const next = placeSeaShip(drafts[placing - 1], { ship, start: cell, axis });
    if (!next) {
      setSelected(cell);
      setNotice(
        "That placement crosses the boundary or overlaps a ship. Rotate or choose another start.",
      );
      return;
    }
    if (selected !== cell) {
      setSelected(cell);
      setNotice(
        `Preview ${SEA_SHIP_NAMES[ship]} from ${seaCoordinate(cell)}, ${axis}. Confirm to place.`,
      );
      return;
    }
    setDrafts((previous) => {
      const result: [SeaFleet, SeaFleet] = [...previous];
      result[placing - 1] = next;
      return result;
    });
    const unplaced = SEA_LENGTHS.findIndex(
      (_, id) => !next.some((p) => p.ship === id),
    );
    if (unplaced >= 0) setShip(unplaced as SeaShipId);
    setSelected(null);
    setNotice(
      "Ship placed. Select a placed ship to reposition it, or complete the remaining fleet.",
    );
  }
  const viewer = round
    ? round.settings.mode === "computer"
      ? round.settings.human
      : round.game.turn
    : 1;
  const canAct =
    !!round &&
    phase === "play" &&
    !handoff &&
    !round.game.winner &&
    (round.settings.mode === "local" ||
      round.game.turn === round.settings.human);
  function shoot(cell: number) {
    if (!round || !canAct || busy) return;
    if (seaKnowledge(round.game, viewer).marks[cell] !== "unknown") {
      setNotice(
        "That coordinate was already fired on. Choose an unused target.",
      );
      return;
    }
    if (selected !== cell) {
      setSelected(cell);
      setNotice(
        `Aim at ${seaCoordinate(cell)}. Confirm to fire; its outcome is hidden.`,
      );
      return;
    }
    stop();
    const next = moveSeaRound(round, round.game.turn, cell);
    if (next === round) return;
    setRound(next);
    setSelected(null);
    setError("");
    setPaused(false);
    setNotice(describe(next));
    if (next.settings.mode === "local" && !next.game.winner)
      setHandoff(next.game.turn);
  }
  function restart() {
    if (!round) return;
    stop();
    const next = restartSeaRound(round, crypto.randomUUID());
    setRound(next);
    setSelected(null);
    setFocus(0);
    setReview(false);
    setPaused(false);
    setError("");
    setHandoff(next.settings.mode === "local" ? 1 : null);
    setNotice("Same fleets, new attempt. A fires first.");
  }
  const draft = drafts[placing - 1];
  const candidate =
    selected === null
      ? null
      : placeSeaShip(draft, { ship, start: selected, axis });
  const previewCells =
    candidate && selected !== null
      ? seaShipCells({ ship, start: selected, axis })!
      : [];
  const attack = round ? seaKnowledge(round.game, viewer) : null;
  const incoming = round
    ? seaKnowledge(round.game, viewer === 1 ? 2 : 1)
    : null;
  const own = (cell: number) =>
    round?.game.fleets[viewer - 1].find((p) => seaShipCells(p)!.includes(cell));
  const reviewed = (cell: number) =>
    review && round?.game.winner
      ? round.game.fleets[viewer === 1 ? 1 : 0].find((p) =>
          seaShipCells(p)!.includes(cell),
        )
      : undefined;
  const axes = (
    <>
      <span aria-hidden="true" />
      {Array.from({ length: 10 }, (_, c) => (
        <span className="sea-axis" key={c} aria-hidden="true">
          {c + 1}
        </span>
      ))}
    </>
  );
  function markSymbol(mark: SeaMark) {
    return mark === "miss"
      ? "○"
      : mark === "hit"
        ? "×"
        : mark === "sunk"
          ? "■"
          : "";
  }
  return (
    <main
      className={`board-game-page sea-page ${!setup && phase === "play" ? "sea-playing" : ""}`}
    >
      <Helmet>
        <title>
          {setup
            ? "Sea Battle: place a fleet and read the search"
            : "Sea Battle game"}{" "}
          | DoStrike
        </title>
        <meta
          name="description"
          content="Play Sea Battle with hidden fleets, three computer levels or local handoffs. Place five ships, alternate shots, save a battle and try the date-seeded challenge."
        />
        <link
          rel="canonical"
          href={`https://dostrike.com${setup ? "/sea-battle-setup" : "/sea-battle"}`}
        />
        {!setup && <meta name="robots" content="noindex,follow" />}
      </Helmet>
      <div className="board-game-topbar">
        <Link to="/" onClick={() => stop()}>
          ← All games
        </Link>
        <Link
          to="/blog/sea-battle-hidden-fleets-and-search"
          onClick={() => stop()}
        >
          Learn fleet search ↗
        </Link>
      </div>
      <header className="board-game-heading">
        <span className="board-game-eyebrow">
          A COORDINATE. A CLUE. A NEW DIRECTION.
        </span>
        <h1>Sea Battle</h1>
        <p>
          Hide your fleet.
          <br />
          Learn from every shot.
        </p>
      </header>
      {setup && phase === "options" ? (
        <section className="board-game-setup" aria-label="Sea Battle setup">
          {saved && (
            <div className="sea-saved">
              <h2>A battle is saved here</h2>
              <p>
                {saved.game.history.length} shots ·{" "}
                {saved.day ? `Daily ${saved.day}` : saved.settings.mode} ·{" "}
                {saved.game.winner
                  ? "completed"
                  : `${player(saved.game.turn)} to fire`}
              </p>
              <button
                onClick={() => {
                  stop();
                  setRound(saved);
                  setSettings(saved.settings);
                  setPhase("play");
                  setSelected(null);
                  setReview(false);
                  setPaused(false);
                  setError("");
                  setHandoff(
                    saved.settings.mode === "local" && !saved.game.winner
                      ? saved.game.turn
                      : null,
                  );
                  navigate("/sea-battle");
                }}
              >
                Continue saved battle
              </button>
            </div>
          )}
          <h2>Choose your opponent</h2>
          <fieldset>
            <legend>Play mode</legend>
            <div className="sea-options">
              {(["computer", "local"] as const).map((mode) => (
                <button
                  key={mode}
                  aria-pressed={settings.mode === mode}
                  onClick={() => setSettings({ ...settings, mode })}
                >
                  {mode === "computer" ? "Computer" : "Local handoffs"}
                </button>
              ))}
            </div>
          </fieldset>
          {settings.mode === "computer" && (
            <>
              <fieldset>
                <legend>Computer level</legend>
                <div className="sea-options">
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
                <legend>Your side · A fires first</legend>
                <div className="sea-options">
                  {([1, 2] as const).map((human) => (
                    <button
                      key={human}
                      aria-pressed={settings.human === human}
                      onClick={() => setSettings({ ...settings, human })}
                    >
                      You are {player(human)}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <p>
            10 × 10 · five ships · touching allowed · one shot per turn, even on
            a hit. Computer choices use only observed shots and sunk ships. Hard
            counts compatible single-ship placements; it is not perfect play.
          </p>
          {settings.mode === "local" && (
            <p>
              Pass the device behind a handoff screen. Only the incoming player
              presses Ready. Browser storage and code can still be inspected;
              this is casual on-device privacy.
            </p>
          )}
          <button
            className="board-game-primary"
            onClick={() => prepare(settings)}
          >
            Arrange your fleet
          </button>
          <div className="sea-daily">
            <h2>Today’s hidden fleet</h2>
            <p>
              {today()} · You are A against Hard. The opponent fleet repeats for
              the date; your own placement is free. This is a reproducible
              challenge, not a unique puzzle or shared leaderboard. Winning
              today advances your browser streak, including assisted wins.
            </p>
            <p>
              Current streak {seaStreak(records, today())} · best{" "}
              {records.bestStreak}
            </p>
            <button
              onClick={() =>
                prepare({ mode: "computer", human: 1, level: "hard" }, today())
              }
            >
              Arrange daily fleet
            </button>
          </div>
        </section>
      ) : handoff ? (
        <section
          className="board-game-setup sea-handoff"
          aria-label="Private handoff"
        >
          <h2>Pass to {player(handoff)}</h2>
          <p>
            The previous board is hidden. Only {player(handoff)} should
            continue.
          </p>
          {notice && <p>{notice}</p>}
          <button
            className="board-game-primary"
            onClick={() => {
              setHandoff(null);
              setNotice(`Ready for ${player(handoff)}.`);
            }}
          >
            Ready, I am {player(handoff)}
          </button>
          <Link to="/sea-battle-setup" onClick={goSetup}>
            Return to setup
          </Link>
        </section>
      ) : phase === "placement" ? (
        <section aria-label="Arrange Sea Battle fleet">
          <div className="sea-topline">
            <span>
              {pendingDay ? `Daily ${pendingDay}` : "New battle"} · place{" "}
              {player(placing)}’s fleet
            </span>
            <Link to="/sea-battle-setup" onClick={goSetup}>
              Change setup
            </Link>
          </div>
          <h2>Your ocean · place five ships</h2>
          <p id="sea-place-help">
            Select a ship, then its starting coordinate. Enter or Space previews
            and confirms; Escape cancels. Arrows move between cells; Home/End
            move within a row. Ships may touch. The board scrolls inside its
            frame.
          </p>
          <div className="sea-fleet-list">
            {SEA_LENGTHS.map((length, id) => {
              const p = draft.find((p) => p.ship === id);
              return (
                <button
                  key={id}
                  aria-pressed={ship === id}
                  onClick={() => {
                    setShip(id as SeaShipId);
                    setSelected(null);
                  }}
                >
                  {SEA_SHIP_NAMES[id]} · {length} ·{" "}
                  {p ? `${seaCoordinate(p.start)} ${p.axis}` : "not placed"}
                </button>
              );
            })}
          </div>
          <div className="board-game-actions">
            <button
              onClick={() => {
                setAxis(axis === "horizontal" ? "vertical" : "horizontal");
                setNotice(
                  "Orientation changed. Check the preview before confirming.",
                );
              }}
            >
              Rotate · {axis}
            </button>
            <button
              onClick={() => {
                try {
                  const fleet = generateSeaFleet(freshSeed());
                  setDrafts((old) => {
                    const next: [SeaFleet, SeaFleet] = [...old];
                    next[placing - 1] = fleet;
                    return next;
                  });
                  setSelected(null);
                  setNotice(
                    "All five ships auto-placed. You can reposition any ship before starting.",
                  );
                } catch {
                  setError(
                    "Auto-place could not finish. Retry or place manually.",
                  );
                }
              }}
            >
              Auto-place fleet
            </button>
            <button
              onClick={() => {
                setDrafts((old) => {
                  const next: [SeaFleet, SeaFleet] = [...old];
                  next[placing - 1] = [];
                  return next;
                });
                setShip(0);
                setSelected(null);
              }}
            >
              Clear fleet
            </button>
          </div>
          <div
            className="sea-scroll"
            role="region"
            aria-label="Scrollable placement ocean"
          >
            <div
              className="sea-grid"
              role="group"
              aria-label={`${player(placing)} placement ocean`}
              aria-describedby="sea-place-help"
            >
              {axes}
              {Array.from({ length: 100 }, (_, cell) => {
                const p = draft.find((p) => seaShipCells(p)!.includes(cell));
                return (
                  <span className="sea-grid-entry" key={cell}>
                    {cell % 10 === 0 && (
                      <span className="sea-axis sea-row" aria-hidden="true">
                        {String.fromCharCode(65 + Math.floor(cell / 10))}
                      </span>
                    )}
                    <button
                      ref={(el) => {
                        cells.current[cell] = el;
                      }}
                      tabIndex={focus === cell ? 0 : -1}
                      className={`sea-cell ${p ? "has-ship" : ""} ${previewCells.includes(cell) ? "is-preview" : ""} ${selected === cell && !candidate ? "is-invalid" : ""}`}
                      aria-label={`Place at ${seaCoordinate(cell)}: ${p ? SEA_SHIP_NAMES[p.ship] : "water"}`}
                      aria-pressed={selected === cell}
                      onFocus={() => setFocus(cell)}
                      onKeyDown={(event) => key(event, cell)}
                      onClick={() => place(cell)}
                    >
                      {p ? p.ship + 1 : "·"}
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
          {selected !== null && (
            <div className="sea-preview">
              <p>
                {candidate
                  ? `${SEA_SHIP_NAMES[ship]} at ${seaCoordinate(selected)}, ${axis}`
                  : "Invalid placement: boundary or overlap."}
              </p>
              <button disabled={!candidate} onClick={() => place(selected)}>
                Confirm placement
              </button>
              <button
                onClick={() => {
                  setSelected(null);
                  setNotice("Placement preview cancelled.");
                }}
              >
                Cancel preview
              </button>
            </div>
          )}
          <p role="status" className="sea-notice">
            {notice}
          </p>
          {error && <p role="alert">{error}</p>}
          <div className="sea-start">
            <p>
              {draft.length} of 5 ships placed · 17 occupied cells when
              complete.
            </p>
            <button
              className="board-game-primary"
              disabled={!validSeaFleet(draft)}
              onClick={startBattle}
            >
              {settings.mode === "local" && placing === 1
                ? "Hide A’s fleet and pass to B"
                : "Start battle"}
            </button>
          </div>
        </section>
      ) : round && attack && incoming ? (
        <section aria-label="Sea Battle game">
          <div className="sea-topline">
            <span>
              {round.day ? `Daily ${round.day}` : round.settings.mode} ·{" "}
              {round.settings.mode === "computer"
                ? `${round.settings.level} · you ${player(viewer)}`
                : `${player(viewer)}’s view`}{" "}
              · {round.assisted ? "Assisted" : "Unassisted"}
            </span>
            <Link to="/sea-battle-setup" onClick={goSetup}>
              Change setup
            </Link>
          </div>
          <div className="sea-score" aria-live="polite">
            <strong>
              {round.game.winner
                ? `${player(round.game.winner)} wins`
                : busy
                  ? "Thinking…"
                  : `${player(round.game.turn)} to fire`}
            </strong>
            <span>
              Enemy ships sunk {attack.sunk.length}/5 · Your ships sunk{" "}
              {incoming.sunk.length}/5
            </span>
          </div>
          <p id="sea-fire-help">
            Aim on the attack map, then confirm the same coordinate or use
            Confirm shot. Escape cancels. Arrows explore cells; Home/End move
            within a row. Every shot passes the turn, including a hit.
          </p>
          <div className="sea-boards">
            <section className="sea-panel">
              <h2>
                Attack map ·{" "}
                {review && round.game.winner
                  ? "completed fleet review"
                  : "opponent hidden"}
              </h2>
              <p>○ miss · × hit · ■ sunk · blank untried</p>
              <div
                className="sea-scroll"
                role="region"
                aria-label="Scrollable attack map"
              >
                <div
                  className="sea-grid"
                  role="group"
                  aria-label="Sea Battle attack map"
                  aria-describedby="sea-fire-help"
                >
                  {axes}
                  {attack.marks.map((mark, cell) => {
                    const visible = reviewed(cell);
                    return (
                      <span className="sea-grid-entry" key={cell}>
                        {cell % 10 === 0 && (
                          <span className="sea-axis sea-row" aria-hidden="true">
                            {String.fromCharCode(65 + Math.floor(cell / 10))}
                          </span>
                        )}
                        <button
                          ref={(el) => {
                            cells.current[cell] = el;
                          }}
                          tabIndex={focus === cell ? 0 : -1}
                          className={`sea-cell mark-${mark} ${selected === cell ? "is-preview" : ""} ${visible ? "has-ship" : ""}`}
                          aria-label={`Target ${seaCoordinate(cell)}: ${mark}${visible ? `, reviewed ${SEA_SHIP_NAMES[visible.ship]}` : ""}`}
                          aria-disabled={!canAct || busy || mark !== "unknown"}
                          aria-pressed={selected === cell}
                          onFocus={() => setFocus(cell)}
                          onKeyDown={(event) => key(event, cell)}
                          onClick={() => shoot(cell)}
                        >
                          {markSymbol(mark) ||
                            (visible ? visible.ship + 1 : "")}
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </section>
            <section className="sea-panel">
              <h2>Your ocean · {player(viewer)}</h2>
              <p>
                Numbers identify your ships; shot symbols show incoming fire.
              </p>
              <div
                className="sea-scroll"
                role="region"
                aria-label="Scrollable own ocean"
              >
                <div
                  className="sea-grid"
                  role="group"
                  aria-label="Sea Battle own ocean"
                >
                  {axes}
                  {incoming.marks.map((mark, cell) => {
                    const p = own(cell);
                    return (
                      <span className="sea-grid-entry" key={cell}>
                        {cell % 10 === 0 && (
                          <span className="sea-axis sea-row" aria-hidden="true">
                            {String.fromCharCode(65 + Math.floor(cell / 10))}
                          </span>
                        )}
                        <span
                          className={`sea-cell sea-ocean mark-${mark} ${p ? "has-ship" : ""}`}
                          role="img"
                          aria-label={`Own ${seaCoordinate(cell)}: ${p ? SEA_SHIP_NAMES[p.ship] : "water"}, ${mark === "unknown" ? "not fired on" : mark}`}
                        >
                          {markSymbol(mark) || (p ? p.ship + 1 : "")}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
          {selected !== null && (
            <div className="sea-preview">
              <p>
                Target {seaCoordinate(selected)} · the outcome remains hidden
                until you fire.
              </p>
              <button
                className="board-game-primary"
                disabled={!canAct || busy}
                onClick={() => shoot(selected)}
              >
                Confirm shot
              </button>
              <button
                onClick={() => {
                  setSelected(null);
                  setNotice("Shot preview cancelled. No shot fired.");
                }}
              >
                Cancel preview
              </button>
            </div>
          )}
          <p role="status" className="sea-notice">
            {notice}
          </p>
          {error && (
            <div className="sea-error">
              <p role="alert">{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setPaused(false);
                  if (canAct) search(true);
                }}
              >
                Retry search
              </button>
            </div>
          )}
          <div className="board-game-actions">
            <button
              disabled={!canUndoSeaRound(round)}
              onClick={() => {
                stop();
                const next = undoSeaRound(round);
                setRound(next);
                setSelected(null);
                setPaused(false);
                setError("");
                setNotice(
                  "Returned to the previous decision. Round marked assisted.",
                );
                if (next.settings.mode === "local") setHandoff(next.game.turn);
              }}
            >
              Undo (assisted)
            </button>
            <button disabled={!canAct || busy} onClick={() => search(true)}>
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
            {paused && !busy && !canAct && !round.game.winner && !error && (
              <button onClick={() => setPaused(false)}>
                Continue computer
              </button>
            )}
            <button onClick={restart}>Restart same fleets</button>
          </div>
          {round.game.winner && (
            <div className="board-game-result">
              <h2>
                {round.settings.mode === "computer"
                  ? round.game.winner === round.settings.human
                    ? "You sank the fleet"
                    : "Your fleet was sunk"
                  : `${player(round.game.winner)} wins`}
              </h2>
              <p>
                {round.game.history.length} total shots ·{" "}
                {round.assisted ? "Assisted" : "Unassisted"}. Undo is closed.
                Recent completed attempts are counted once in this browser.
              </p>
              <button onClick={() => setReview(!review)}>
                {review ? "Hide fleet review" : "Review completed fleets"}
              </button>
              <button onClick={restart}>Play same fleets again</button>
            </div>
          )}
          <details className="sea-history">
            <summary>Shot history ({round.game.history.length})</summary>
            <ol>
              {round.game.history.map((shot, i) => (
                <li key={i}>
                  {player(shot.player)} · {seaCoordinate(shot.cell)} ·{" "}
                  {shot.result}
                  {shot.sunk !== null ? ` ${SEA_SHIP_NAMES[shot.sunk]}` : ""}
                </li>
              ))}
            </ol>
          </details>
        </section>
      ) : null}
      {storageError && (
        <p role="alert">
          Browser storage is unavailable. This battle works now, but saving and
          records may not survive leaving.
        </p>
      )}
      {!handoff && ((setup && phase === "options") || phase === "play") && (
        <section className="board-game-records">
          <h2>Your Sea Battle records</h2>
          {Object.entries(records.rows).length ? (
            Object.entries(records.rows).map(([group, row]) => (
              <p key={group}>
                {group === "local"
                  ? `Local · A wins ${row.aWins}, B wins ${row.bWins}`
                  : `${group.split(":")[1]} · you ${player(Number(group.split(":")[2]))} · wins ${row.wins} (${row.cleanWins} unassisted, ${row.assistedWins} assisted), losses ${row.losses}`}{" "}
                · {row.games} completed · {row.assisted} assisted.
              </p>
            ))
          ) : (
            <p>No completed battles in this browser yet.</p>
          )}
          <p>
            Local A/B results stay separate from computer wins. Hints and Undo
            mark assistance. Records remember the most recent 128 completed
            attempt IDs to avoid reload duplicates. Browser-only, editable
            storage; no account or leaderboard.
          </p>
        </section>
      )}
      {!handoff && (
        <section className="board-game-rules">
          <h2>One shot. Then listen.</h2>
          <p>
            Place five straight ships of lengths 5, 4, 3, 3 and 2. They may
            touch but cannot overlap or leave the 10 × 10 board. A starts. Fire
            once at an unused coordinate and pass the turn, even after a hit. A
            ship sinks when all its cells are hit; the first player to sink all
            five wins.
          </p>
          <p>
            This version reveals ship identity only when sunk. There is no Salvo
            or automatic water marking. Computer and hint choices see only
            observed shots and sunk ships. A saved battle contains both fleets
            on this device, so this is casual play without an anti-cheat claim.
          </p>
          <Link
            to="/blog/sea-battle-hidden-fleets-and-search"
            onClick={() => stop()}
          >
            Work through a verified search example →
          </Link>
        </section>
      )}
    </main>
  );
}
