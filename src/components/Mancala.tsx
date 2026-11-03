import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  mancalaDaily,
  mancalaLegalMoves,
  mancalaOwner,
  mancalaPitNumber,
  mancalaPits,
  mancalaStore,
  mancalaUndoIndex,
  newMancala,
  playMancala,
  replayMancala,
  type MancalaDifficulty,
  type MancalaSide,
  type MancalaState,
} from "../utils/mancalaEngine";
import {
  currentMancalaStreak,
  readMancalaProgress,
  recordMancalaResult,
  writeMancalaProgress,
} from "../utils/mancalaProgress";
import "./BoardGame.css";
import "./Mancala.css";
type Settings = {
  mode: "computer" | "local";
  difficulty: MancalaDifficulty;
  seeds: 3 | 4 | 5 | 6;
  start: "first" | "second";
  confirm: boolean;
  daily: boolean;
};
const defaults: Settings = {
  mode: "computer",
  difficulty: "medium",
  seeds: 4,
  start: "first",
  confirm: true,
  daily: false,
};
const sessionKey = "dostrike-mancala-session-v1";
const dateKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const newId = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
function readSettings(value: unknown): Settings {
  const data = value as Partial<Settings> | null;
  if (data?.daily === true)
    return { ...defaults, difficulty: "hard", daily: true };
  return {
    mode: data?.mode === "local" ? "local" : "computer",
    difficulty:
      data?.difficulty === "easy" || data?.difficulty === "hard"
        ? data.difficulty
        : "medium",
    seeds:
      data?.seeds === 3 || data?.seeds === 5 || data?.seeds === 6
        ? data.seeds
        : 4,
    start: data?.start === "second" ? "second" : "first",
    confirm: data?.confirm !== false,
    daily: false,
  };
}
const initialFor = (settings: Settings, day: string) =>
  settings.daily
    ? mancalaDaily(day)
    : newMancala(settings.seeds, settings.start === "first" ? 0 : 1);
function loadSession() {
  try {
    const value = JSON.parse(localStorage.getItem(sessionKey) || "null");
    if (
      !value ||
      typeof value.id !== "string" ||
      !value.id ||
      value.id.length > 100 ||
      !Array.isArray(value.moves) ||
      !value.moves.length ||
      value.moves.length > 2000 ||
      typeof value.day !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value.day)
    )
      return null;
    const settings = readSettings(value.settings),
      game = replayMancala(initialFor(settings, value.day), value.moves);
    if (game.over) return null;
    return { settings, game, day: value.day, id: value.id };
  } catch {
    return null;
  }
}
export default function Mancala() {
  const location = useLocation(),
    navigate = useNavigate(),
    isSetup = location.pathname.replace(/\/+$/, "") === "/mancala-setup";
  const [initial] = useState(loadSession),
    [saved, setSaved] = useState(loadSession);
  const [settings, setSettings] = useState<Settings>(
      () => initial?.settings || readSettings(location.state),
    ),
    [day, setDay] = useState(() => initial?.day || dateKey()),
    [roundId, setRoundId] = useState(() => initial?.id || newId());
  const [game, setGame] = useState(
      () => initial?.game || initialFor(settings, day),
    ),
    [progress, setProgress] = useState(readMancalaProgress);
  const [preview, setPreview] = useState<number | null>(null),
    [focus, setFocus] = useState(() => (game.turn === 0 ? 0 : 12)),
    [hintRequested, setHintRequested] = useState(false),
    [notice, setNotice] = useState("");
  const cells = useRef<(HTMLButtonElement | null)[]>([]),
    recorded = useRef<string | null>(null);
  const base = useMemo(() => initialFor(settings, day), [settings, day]),
    legal = useMemo(() => mancalaLegalMoves(game), [game]);
  const undoIndex = useMemo(
    () =>
      mancalaUndoIndex(base, game.moves, settings.mode === "local" ? null : 0),
    [base, game.moves, settings.mode],
  );
  const projected = useMemo(
    () => (preview === null ? null : playMancala(game, preview)),
    [game, preview],
  );
  const thinking =
      !game.over && settings.mode === "computer" && game.turn === 1,
    busy = thinking || hintRequested;
  const sideName = useCallback(
    (side: MancalaSide) =>
      settings.mode === "computer"
        ? side === 0
          ? "You"
          : "Computer"
        : side === 0
          ? "South"
          : "North",
    [settings.mode],
  );
  const result =
    game.winner === "draw"
      ? "A draw."
      : game.winner !== null
        ? `${sideName(game.winner)} ${settings.mode === "computer" && game.winner === 0 ? "win" : "wins"}.`
        : "";
  const describe = useCallback(
    (state: MancalaState) => {
      const last = state.last;
      if (!last) return "";
      return `${sideName(last.actor)} sowed pit ${mancalaPitNumber(last.pit)}.${last.captured ? ` Captured ${last.captured} seeds.` : ""}${last.extraTurn ? " Last seed in the store: another turn." : ""}${state.over ? ` Remaining seeds banked: South ${last.swept[0]}, North ${last.swept[1]}.` : ""}`;
    },
    [sideName],
  );
  const status = game.over
    ? `${result} ${sideName(0)} ${game.board[6]}, ${sideName(1)} ${game.board[13]}.`
    : hintRequested
      ? "Finding a sowing suggestion…"
      : `${game.last?.extraTurn ? "Extra turn. " : ""}${thinking ? "Computer is thinking…" : `${sideName(game.turn)} to sow.`}`;
  useEffect(() => {
    if (isSetup) return;
    try {
      localStorage.setItem("dostrike-last-pick", "mancala");
      if (game.over || !game.moves.length) localStorage.removeItem(sessionKey);
      else
        localStorage.setItem(
          sessionKey,
          JSON.stringify({ id: roundId, settings, day, moves: game.moves }),
        );
    } catch {
      /* Optional storage. */
    }
  }, [game, settings, day, roundId, isSetup]);
  useEffect(() => {
    if (isSetup) {
      setSaved(loadSession());
      setProgress(readMancalaProgress());
    }
  }, [isSetup]);
  useEffect(() => {
    if (isSetup || !game.over || recorded.current === roundId) return;
    recorded.current = roundId;
    const next = recordMancalaResult(readMancalaProgress(), {
      id: roundId,
      mode: settings.mode,
      difficulty: settings.difficulty,
      human: 0,
      stores: [game.board[6], game.board[13]],
      dailyDay: settings.daily ? day : undefined,
      today: dateKey(),
    });
    setProgress(next);
    writeMancalaProgress(next);
  }, [game, isSetup, roundId, settings, day]);
  useEffect(() => {
    if (isSetup || game.over || (!thinking && !hintRequested)) return;
    let cancelled = false,
      settled = false,
      worker: Worker | null = null,
      timeout: number | undefined;
    const finish = (move: number | null, failed = false) => {
      if (cancelled || settled) return;
      settled = true;
      window.clearTimeout(timeout);
      if (thinking) {
        const choice = move !== null && legal.includes(move) ? move : legal[0];
        if (choice !== undefined) {
          const next = playMancala(game, choice);
          setGame((current) => (current === game ? next : current));
          setPreview(null);
          setNotice(
            failed
              ? "Computer search was unavailable; it used a legal fallback sow."
              : describe(next),
          );
        }
      } else if (move !== null && legal.includes(move)) {
        setPreview(move);
        cells.current[move]?.focus();
        setNotice(
          `Suggested pit ${mancalaPitNumber(move)}. This is a bounded search suggestion, not a guaranteed win.`,
        );
      } else
        setNotice(
          "Search is unavailable. You can still choose any non-empty pit on your side.",
        );
      setHintRequested(false);
      worker?.terminate();
    };
    const launch = window.setTimeout(
      () => {
        try {
          worker = new Worker(
            new URL("../workers/mancala.worker.ts", import.meta.url),
            { type: "module" },
          );
          worker.onmessage = (event) => finish(event.data.move);
          worker.onerror = () => finish(null, true);
          timeout = window.setTimeout(() => finish(null, true), 5000);
          worker.postMessage({
            game,
            difficulty: thinking ? settings.difficulty : "hard",
          });
        } catch {
          finish(null, true);
        }
      },
      thinking ? 300 : 0,
    );
    return () => {
      cancelled = true;
      window.clearTimeout(launch);
      window.clearTimeout(timeout);
      worker?.terminate();
    };
    // Each search captures this exact immutable board; cleanup cancels superseded work.
  }, [
    game,
    isSetup,
    thinking,
    hintRequested,
    settings.difficulty,
    legal,
    describe,
  ]);
  const start = (daily = false) => {
    const next = daily
        ? { ...defaults, difficulty: "hard" as const, daily: true }
        : { ...settings, daily: false },
      today = dateKey();
    try {
      localStorage.removeItem(sessionKey);
    } catch {
      /* Optional storage. */
    }
    setSettings(next);
    setDay(today);
    setRoundId(newId());
    setGame(initialFor(next, today));
    setPreview(null);
    setHintRequested(false);
    setNotice("");
    setFocus(next.start === "first" ? 0 : 12);
    navigate("/mancala", { state: next });
  };
  const reset = () => {
    setRoundId(newId());
    setGame(base);
    setPreview(null);
    setHintRequested(false);
    setNotice("");
    setFocus(base.turn === 0 ? 0 : 12);
  };
  const place = (pit: number) => {
    if (busy || game.over || !legal.includes(pit)) return;
    const next = playMancala(game, pit);
    setGame(next);
    setPreview(null);
    setNotice(describe(next));
  };
  const activate = (pit: number) => {
    if (busy || game.over || !legal.includes(pit)) return;
    if (settings.confirm && preview !== pit) {
      const next = playMancala(game, pit);
      setPreview(pit);
      setNotice(
        `Preview pit ${mancalaPitNumber(pit)}. ${next.last?.captured ? `Captures ${next.last.captured} seeds. ` : ""}${next.over ? "This sow ends the game. " : next.last?.extraTurn ? "Ends in your store for another turn. " : ""}Your store would hold ${next.board[mancalaStore(game.turn)]}. Select again or use Sow to confirm.`,
      );
    } else place(pit);
  };
  const pebbles = (count: number) =>
    Array.from({ length: Math.min(count, 12) }, (_, index) => (
      <i
        key={index}
        style={{
          left: `${20 + ((index * 29) % 64)}%`,
          top: `${20 + ((index * 37) % 57)}%`,
        }}
      />
    ));
  const pitButton = (pit: number) => {
    const owner = mancalaOwner(pit) as MancalaSide,
      count = game.board[pit],
      canPlay = legal.includes(pit),
      last = game.last,
      landing = projected?.last?.landing;
    return (
      <button
        type="button"
        key={pit}
        ref={(element) => {
          cells.current[pit] = element;
        }}
        className={`mancala-pit ${owner === 0 ? "south-pit" : "north-pit"} ${canPlay && !game.over ? "is-playable" : ""} ${preview === pit ? "is-preview" : ""} ${last?.pit === pit ? "was-sown" : ""} ${landing === pit ? "is-landing" : ""}`}
        tabIndex={focus === pit ? 0 : -1}
        aria-label={`${settings.mode === "computer" && owner === 0 ? "Your" : sideName(owner)} pit ${mancalaPitNumber(pit)}, ${count} ${count === 1 ? "seed" : "seeds"}${canPlay && !game.over ? ", playable" : ""}${preview === pit ? ", selected preview" : ""}`}
        aria-disabled={!canPlay || busy || game.over}
        onFocus={() => setFocus(pit)}
        onClick={() => activate(pit)}
        onKeyDown={(event) => {
          const phone = window.matchMedia("(max-width:760px)").matches,
            number = mancalaPitNumber(pit),
            next = phone
              ? {
                  ArrowDown: number + (owner === 0 ? 1 : -1),
                  ArrowUp: number + (owner === 0 ? -1 : 1),
                }
              : {
                  ArrowRight: number + (owner === 0 ? 1 : -1),
                  ArrowLeft: number + (owner === 0 ? -1 : 1),
                };
          let target: number | undefined;
          if (event.key in next) {
            const n = next[event.key as keyof typeof next];
            if (n !== undefined && n >= 1 && n <= 6)
              target = owner === 0 ? n - 1 : n + 6;
          } else if (
            (phone &&
              ((owner === 0 && event.key === "ArrowRight") ||
                (owner === 1 && event.key === "ArrowLeft"))) ||
            (!phone &&
              ((owner === 0 && event.key === "ArrowUp") ||
                (owner === 1 && event.key === "ArrowDown")))
          )
            target = 12 - pit;
          else if (event.key === "Home") target = owner === 0 ? 0 : 12;
          else if (event.key === "End") target = owner === 0 ? 5 : 7;
          if (
            event.key.startsWith("Arrow") ||
            event.key === "Home" ||
            event.key === "End"
          )
            event.preventDefault();
          if (target !== undefined) cells.current[target]?.focus();
        }}
      >
        <span className="mancala-pit-label">
          {settings.mode === "computer" && owner === 0
            ? "Your"
            : sideName(owner)}{" "}
          {mancalaPitNumber(pit)}
        </span>
        <span className="mancala-seeds" aria-hidden="true">
          {pebbles(count)}
        </span>
        <strong aria-hidden="true">{count}</strong>
      </button>
    );
  };
  const store = (side: MancalaSide) => (
    <div
      role="group"
      className={`mancala-store store-${side === 0 ? "south" : "north"} ${projected?.last?.landing === mancalaStore(side) ? "is-landing" : ""}`}
      aria-label={`${sideName(side)} store, ${game.board[mancalaStore(side)]} seeds`}
    >
      <span>
        {settings.mode === "computer" && side === 0 ? "Your" : sideName(side)}{" "}
        store
      </span>
      <div className="mancala-seeds" aria-hidden="true">
        {pebbles(game.board[mancalaStore(side)])}
      </div>
      <strong>{game.board[mancalaStore(side)]}</strong>
    </div>
  );
  return (
    <main className="board-game-page">
      <Helmet>
        <title>
          {isSetup
            ? "Mancala — Sow, Capture and Play Again | DoStrike"
            : "Mancala game | DoStrike"}
        </title>
        <meta
          name="description"
          content="Play free Kalah Mancala with 3 to 6 seeds per pit. Choose computer or two-player play, preview captures and extra turns, and try a symmetric daily board."
        />
        <link
          rel="canonical"
          href={`https://dostrike.com/${isSetup ? "mancala-setup" : "mancala"}`}
        />
        {!isSetup && <meta name="robots" content="noindex" />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "DoStrike Mancala",
            applicationCategory: "GameApplication",
            operatingSystem: "Any",
            url: "https://dostrike.com/mancala-setup",
            isAccessibleForFree: true,
          })}
        </script>
      </Helmet>
      <div className="board-game-top">
        <Link to="/">← All games</Link>
        <Link to="/blog/mancala-extra-turns-captures-and-counting">
          Learn the patterns ↗
        </Link>
      </div>
      <header className="board-game-heading">
        <p className="board-game-eyebrow">
          COUNT THE SEEDS. FIND ANOTHER TURN.
        </p>
        <h1>Mancala</h1>
        <p>
          A handful of seeds. A board full of choices.
          <br />
          Play Kalah with captures and extra turns.
        </p>
      </header>
      {isSetup ? (
        <>
          {saved && (
            <section className="board-game-continue">
              <div>
                <strong>Your board is waiting.</strong>
                <p>
                  {saved.game.moves.length}{" "}
                  {saved.game.moves.length === 1 ? "sow" : "sows"} played ·{" "}
                  {saved.settings.daily
                    ? `Daily ${saved.day}`
                    : `${saved.settings.seeds} seeds per pit`}
                </p>
              </div>
              <button
                onClick={() => {
                  setSettings(saved.settings);
                  setDay(saved.day);
                  setRoundId(saved.id);
                  setGame(saved.game);
                  setFocus(saved.game.turn === 0 ? 0 : 12);
                  setPreview(null);
                  setHintRequested(false);
                  setNotice("Round continued.");
                  navigate("/mancala", { state: saved.settings });
                }}
              >
                Continue round →
              </button>
            </section>
          )}
          <section
            className="board-game-setup"
            aria-labelledby="mancala-setup-title"
          >
            <h2 id="mancala-setup-title">Set your board.</h2>
            <fieldset>
              <legend>Who’s playing?</legend>
              <div className="board-game-options">
                {(["computer", "local"] as const).map((mode) => (
                  <button
                    key={mode}
                    aria-pressed={settings.mode === mode}
                    onClick={() => setSettings({ ...settings, mode })}
                  >
                    {mode === "computer" ? "Play the computer" : "Two players"}
                  </button>
                ))}
              </div>
            </fieldset>
            {settings.mode === "computer" && (
              <fieldset>
                <legend>Choose your challenge</legend>
                <div className="board-game-options">
                  {(["easy", "medium", "hard"] as const).map((difficulty) => (
                    <button
                      key={difficulty}
                      aria-pressed={settings.difficulty === difficulty}
                      onClick={() => setSettings({ ...settings, difficulty })}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
                <p>
                  {settings.difficulty === "easy"
                    ? "A short look ahead with occasional random legal sows."
                    : settings.difficulty === "medium"
                      ? "Searches up to four turn changes; an extra turn keeps the search going."
                      : "Searches up to eight turn changes within a fixed budget. Challenging, not perfect."}
                </p>
              </fieldset>
            )}
            <fieldset>
              <legend>Starting seeds in every pit</legend>
              <div className="board-game-options">
                {([3, 4, 5, 6] as const).map((seeds) => (
                  <button
                    key={seeds}
                    aria-label={`${seeds} seeds per pit`}
                    aria-pressed={settings.seeds === seeds}
                    onClick={() => setSettings({ ...settings, seeds })}
                  >
                    {seeds}
                  </button>
                ))}
              </div>
              <p>{settings.seeds * 12} seeds total. Stores start empty.</p>
            </fieldset>
            <fieldset>
              <legend>
                {settings.mode === "computer"
                  ? "When do you play?"
                  : "Who starts?"}
              </legend>
              <div className="board-game-options">
                <button
                  aria-pressed={settings.start === "first"}
                  onClick={() => setSettings({ ...settings, start: "first" })}
                >
                  {settings.mode === "computer" ? "You first" : "South first"}
                </button>
                <button
                  aria-pressed={settings.start === "second"}
                  onClick={() => setSettings({ ...settings, start: "second" })}
                >
                  {settings.mode === "computer"
                    ? "Computer first"
                    : "North first"}
                </button>
              </div>
            </fieldset>
            <label className="board-game-check">
              <input
                type="checkbox"
                checked={settings.confirm}
                onChange={(event) =>
                  setSettings({ ...settings, confirm: event.target.checked })
                }
              />
              Preview the last seed before sowing
            </label>
            <p className="mancala-variant-note">
              Capture rule: the last seed must land in your own empty pit, and
              the opposite pit must contain seeds. No empty capture.
            </p>
            <button className="board-game-primary" onClick={() => start()}>
              Start playing ↗
            </button>
            <p className="board-game-small">
              Free hints and undo. No account needed.
            </p>
          </section>
          <section className="board-game-daily">
            <div>
              <p className="board-game-eyebrow">TODAY’S BOARD · {dateKey()}</p>
              <h2>
                {progress.lastDailyWin === dateKey()
                  ? "Today’s board completed."
                  : "Same seeds. Different decisions."}
              </h2>
              <p>
                48 seeds dealt unevenly, with the same pattern from each side’s
                perspective. You play first against Hard. A full game, not a
                single-answer puzzle.
              </p>
              <p>
                Daily streak: {currentMancalaStreak(progress, dateKey())} ·
                Best: {progress.bestDailyStreak}
              </p>
            </div>
            <button onClick={() => start(true)}>Play today’s board →</button>
          </section>
        </>
      ) : (
        <section className="mancala-play" aria-label="Mancala game">
          <div className="board-game-match-info">
            <span>
              {settings.daily
                ? `Daily board · ${day}`
                : `${settings.seeds} seeds per pit · ${settings.mode === "local" ? "Two players" : `${settings.difficulty} computer · you play South`}`}
            </span>
            <Link to="/mancala-setup">Change setup</Link>
          </div>
          <p
            className="board-game-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {status}
          </p>
          <div className="mancala-score-summary">
            <span>
              {sideName(0)} store <strong>{game.board[6]}</strong>
            </span>
            <span>
              {sideName(1)} store <strong>{game.board[13]}</strong>
            </span>
          </div>
          <p className="board-game-board-help" id="mancala-board-help">
            <span className="mancala-wide-help">
              South sows along the bottom row towards the right store; North
              sows along the top row towards the left store.{" "}
            </span>
            <span className="mancala-phone-help">
              South sows down the left column to the bottom store; North sows up
              the right column to the top store.{" "}
            </span>
            Skip the other store. Arrow keys inspect pits; Enter selects
            {settings.confirm ? " and confirms" : ""}. Counts are exact; pebbles
            are illustrative.
          </p>
          <div
            className="mancala-board"
            role="group"
            aria-label="Kalah board with two rows of six pits and two stores"
            aria-describedby="mancala-board-help"
          >
            {store(1)}
            <div
              className="mancala-pits pits-north"
              role="group"
              aria-label={`${sideName(1)} pits`}
            >
              {[12, 11, 10, 9, 8, 7].map(pitButton)}
            </div>
            <div
              className="mancala-pits pits-south"
              role="group"
              aria-label={`${sideName(0)} pits`}
            >
              {mancalaPits(0).map(pitButton)}
            </div>
            {store(0)}
          </div>
          <div className="board-game-actions">
            {!game.over && (
              <>
                <button
                  className="board-game-primary"
                  disabled={preview === null || busy}
                  onClick={() => preview !== null && place(preview)}
                >
                  {preview === null
                    ? "Select a non-empty pit"
                    : `Sow pit ${mancalaPitNumber(preview)}`}
                </button>
                <button
                  disabled={undoIndex < 0}
                  onClick={() => {
                    setGame(
                      replayMancala(base, game.moves.slice(0, undoIndex)),
                    );
                    setPreview(null);
                    setHintRequested(false);
                    setNotice(
                      "Returned to before your last decision, including later extra turns.",
                    );
                  }}
                >
                  Undo
                </button>
                <button disabled={busy} onClick={() => setHintRequested(true)}>
                  Suggest a move
                </button>
              </>
            )}
            <button onClick={reset}>
              {game.over ? "Play again" : "Restart"}
            </button>
          </div>
          <p className="board-game-notice" role="status">
            {notice}
          </p>
          {game.over && (
            <div className="board-game-result">
              <h2>{result} The seeds are counted.</h2>
              <p>
                {sideName(0)} {game.board[6]} · {sideName(1)} {game.board[13]}.
                The remaining pit seeds have been banked. Try another board, or
                review which sow produced a capture or an extra turn.
              </p>
              <Link to="/blog/mancala-extra-turns-captures-and-counting">
                Learn the counting patterns →
              </Link>
            </div>
          )}
        </section>
      )}
      <section className="board-game-records">
        <h2>Your Mancala records</h2>
        <p>
          Completed computer games on this browser, including all seed settings,
          daily boards and free assistance. Local two-player games:{" "}
          {progress.localGames}. Records are casual, with no account or
          cross-device sync.
        </p>
        <div>
          {(["easy", "medium", "hard"] as const).map((level) => {
            const record = progress.levels[level];
            return (
              <p key={level}>
                <strong>{level}</strong>
                <span>
                  {record.wins} {record.wins === 1 ? "win" : "wins"} ·{" "}
                  {record.losses} {record.losses === 1 ? "loss" : "losses"} ·{" "}
                  {record.draws} {record.draws === 1 ? "draw" : "draws"}
                  <br />
                  Win streak {record.streak} · Best {record.bestStreak}
                  <br />
                  Best winning margin:{" "}
                  {record.wins ? `${record.bestMargin} seeds` : "—"}
                </span>
              </p>
            );
          })}
        </div>
      </section>
      <section
        className="board-game-rules"
        aria-labelledby="mancala-rules-title"
      >
        <h2 id="mancala-rules-title">How to play Kalah Mancala</h2>
        <ol>
          <li>
            Choose a non-empty pit on your side. Pick up all its seeds and place
            one in each next pit, counter-clockwise, including your own store
            and skipping the other store.
          </li>
          <li>
            If your last seed lands in your store, play again unless the game
            has ended.
          </li>
          <li>
            If your last seed lands in your own empty pit and the opposite pit
            has seeds, move both the last seed and all opposite seeds into your
            store. If the opposite pit is empty, the last seed stays in its pit.
          </li>
          <li>
            When either side’s six pits are empty, both sides bank any seeds
            left in their own pits. The larger store wins; equal stores draw.
          </li>
        </ol>
        <p>
          There is no relay sowing or opening swap. Medium and Hard search
          within fixed budgets; extra turns do not consume a turn-change depth.
          The daily is generated for this website. Only daily wins completed on
          the board’s own date advance the local daily streak.
        </p>
        <Link to="/blog/mancala-extra-turns-captures-and-counting">
          See worked extra-turn and capture examples →
        </Link>
      </section>
    </main>
  );
}
