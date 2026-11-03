import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  newReversi,
  passReversi,
  playReversi,
  replayReversi,
  reversiCounts,
  reversiDaily,
  reversiFlips,
  reversiLegalMoves,
  reversiUndoIndex,
  type ReversiColour,
  type ReversiDifficulty,
} from "../utils/reversiEngine";
import { readGameRecords, writeGameRecords } from "../utils/localGameRecords";
import "./BoardGame.css";
import "./Reversi.css";

type Settings = {
  mode: "computer" | "local";
  difficulty: ReversiDifficulty;
  side: ReversiColour;
  confirm: boolean;
  daily: boolean;
};
const defaults: Settings = {
  mode: "computer",
  difficulty: "medium",
  side: "black",
  confirm: true,
  daily: false,
};
const recordsKey = "dostrike-reversi-records-v1",
  sessionKey = "dostrike-reversi-session-v1";
const dateKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const pointName = (index: number) =>
  `${"ABCDEFGH"[index % 8]}${Math.floor(index / 8) + 1}`;
const colourName = (colour: ReversiColour) =>
  colour === "black" ? "Black" : "White";
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
    side: data?.side === "white" ? "white" : "black",
    confirm: data?.confirm !== false,
    daily: false,
  };
}
function loadSession() {
  try {
    const value = JSON.parse(localStorage.getItem(sessionKey) || "null");
    if (
      !value ||
      !Array.isArray(value.moves) ||
      value.moves.length === 0 ||
      value.moves.length > 120 ||
      typeof value.day !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value.day)
    )
      return null;
    const settings = readSettings(value.settings),
      game = replayReversi(value.moves);
    if (game.over) return null;
    if (settings.daily) {
      const opening = reversiDaily(value.day).moves;
      if (
        JSON.stringify(game.moves.slice(0, opening.length)) !==
        JSON.stringify(opening)
      )
        return null;
    }
    return { game, settings, day: value.day };
  } catch {
    return null;
  }
}
export default function Reversi() {
  const location = useLocation(),
    navigate = useNavigate();
  const isSetup = location.pathname.replace(/\/+$/, "") === "/reversi-setup";
  const [initial] = useState(loadSession);
  const [saved, setSaved] = useState(loadSession);
  const [settings, setSettings] = useState<Settings>(
    () => initial?.settings || readSettings(location.state),
  );
  const [day, setDay] = useState(() => initial?.day || dateKey());
  const [game, setGame] = useState(
    () => initial?.game || (settings.daily ? reversiDaily(day) : newReversi()),
  );
  const [records, setRecords] = useState(() => readGameRecords(recordsKey));
  const [preview, setPreview] = useState<number | null>(null),
    [focus, setFocus] = useState(19);
  const [hintRequested, setHintRequested] = useState(false),
    [notice, setNotice] = useState("");
  const [dailyWon, setDailyWon] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("dostrike-reversi-daily-v1") || "null")
          ?.lastWon || ""
      );
    } catch {
      return "";
    }
  });
  const cells = useRef<(HTMLButtonElement | null)[]>([]),
    counted = useRef(false);
  const legal = useMemo(
    () => reversiLegalMoves(game.board, game.turn),
    [game.board, game.turn],
  );
  const baseMoves = useMemo(
    () => (settings.daily ? reversiDaily(day).moves.length : 0),
    [settings.daily, day],
  );
  const counts = reversiCounts(game.board),
    mustPass = !game.over && !legal.length;
  const thinking =
    !game.over && settings.mode === "computer" && game.turn !== settings.side;
  const busy = thinking || mustPass || hintRequested;
  const flips =
    preview === null ? [] : reversiFlips(game.board, preview, game.turn);
  const lastMove = [...game.moves].reverse().find((move) => move !== -1);
  const undoIndex = reversiUndoIndex(
    game.moves,
    settings.mode === "local" ? null : settings.side,
    baseMoves,
  );
  const result =
    game.winner === "draw"
      ? "A draw."
      : game.winner
        ? `${colourName(game.winner)} wins.`
        : "";
  const status = game.over
    ? `${result} Black ${counts.black}, White ${counts.white}.`
    : mustPass
      ? `${colourName(game.turn)} has no legal move. Passing automatically…`
      : hintRequested
        ? "Finding a move suggestion…"
        : `${game.passed ? `${colourName(game.passed)} passed. ` : ""}${thinking ? "Computer is thinking…" : `${colourName(game.turn)} to move${settings.mode === "computer" ? " — your turn." : "."}`}`;
  useEffect(() => {
    if (isSetup) return;
    try {
      localStorage.setItem("dostrike-last-pick", "reversi");
      if (game.over || game.moves.length === 0)
        localStorage.removeItem(sessionKey);
      else
        localStorage.setItem(
          sessionKey,
          JSON.stringify({ moves: game.moves, settings, day }),
        );
    } catch {
      /* Play works without storage. */
    }
  }, [game, settings, day, isSetup]);
  useEffect(() => {
    if (isSetup) setSaved(loadSession());
  }, [isSetup]);
  useEffect(() => {
    if (isSetup || !mustPass) return;
    const timer = window.setTimeout(
      () =>
        setGame((current) =>
          current === game ? passReversi(current) : current,
        ),
      650,
    );
    return () => window.clearTimeout(timer);
  }, [game, isSetup, mustPass]);
  useEffect(() => {
    if (isSetup || game.over || mustPass || (!thinking && !hintRequested))
      return;
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
        if (choice !== undefined)
          setGame((current) =>
            current === game ? playReversi(current, choice) : current,
          );
        if (failed)
          setNotice(
            "Computer search was unavailable, so it used a legal fallback move.",
          );
      } else if (move !== null && legal.includes(move)) {
        setPreview(move);
        cells.current[move]?.focus();
        setNotice(
          `Suggested point: ${pointName(move)}. This is a bounded search suggestion, not a guaranteed winning move.`,
        );
      } else
        setNotice(
          "Move search is unavailable. You can still choose any marked legal square.",
        );
      setHintRequested(false);
      worker?.terminate();
    };
    const launch = window.setTimeout(
      () => {
        try {
          worker = new Worker(
            new URL("../workers/reversi.worker.ts", import.meta.url),
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
      thinking ? 250 : 0,
    );
    return () => {
      cancelled = true;
      window.clearTimeout(launch);
      window.clearTimeout(timeout);
      worker?.terminate();
    };
  }, [
    game,
    isSetup,
    mustPass,
    thinking,
    hintRequested,
    settings.difficulty,
    legal,
  ]);
  useEffect(() => {
    if (
      isSetup ||
      !game.over ||
      counted.current ||
      settings.mode !== "computer"
    )
      return;
    counted.current = true;
    const next = readGameRecords(recordsKey);
    next[settings.difficulty][
      game.winner === "draw"
        ? "draws"
        : game.winner === settings.side
          ? "wins"
          : "losses"
    ]++;
    setRecords(next);
    writeGameRecords(recordsKey, next);
    if (settings.daily && game.winner === "black") {
      setDailyWon(day);
      try {
        localStorage.setItem(
          "dostrike-reversi-daily-v1",
          JSON.stringify({ lastWon: day }),
        );
      } catch {
        /* Optional record. */
      }
    }
  }, [game.over, game.winner, isSetup, settings, day]);
  const reset = () => {
    counted.current = false;
    setHintRequested(false);
    setPreview(null);
    setNotice("");
    setGame(settings.daily ? reversiDaily(day) : newReversi());
    setFocus(19);
  };
  const place = (index: number) => {
    if (busy || game.over || !legal.includes(index)) return;
    setGame((current) => playReversi(current, index));
    setPreview(null);
    setNotice("");
  };
  const activate = (index: number) => {
    if (busy || game.over || !legal.includes(index)) return;
    if (settings.confirm && preview !== index) {
      setPreview(index);
      const count = reversiFlips(game.board, index, game.turn).length;
      setNotice(
        `${pointName(index)} selected. Flips ${count} ${count === 1 ? "disc" : "discs"}. Select it again or use Place to confirm.`,
      );
    } else place(index);
  };
  const start = (daily = false) => {
    try {
      localStorage.removeItem(sessionKey);
    } catch {
      /* Optional persistence. */
    }
    const today = dateKey(),
      next = daily
        ? { ...defaults, difficulty: "hard" as const, daily: true }
        : { ...settings, daily: false };
    setDay(today);
    setSettings(next);
    setHintRequested(false);
    setGame(daily ? reversiDaily(today) : newReversi());
    setPreview(null);
    setNotice("");
    counted.current = false;
    navigate("/reversi", { state: next });
  };
  return (
    <main className="board-game-page">
      <Helmet>
        <title>
          {isSetup
            ? "Reversi — Play, Flip and Think Ahead | DoStrike"
            : "Reversi game | DoStrike"}
        </title>
        <meta
          name="description"
          content="Play free Reversi against three computer levels or a friend. Learn legal flips, automatic passes and corner tactics on an accessible 8 by 8 board."
        />
        <link
          rel="canonical"
          href={`https://dostrike.com/${isSetup ? "reversi-setup" : "reversi"}`}
        />
        {!isSetup && <meta name="robots" content="noindex" />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "DoStrike Reversi",
            applicationCategory: "GameApplication",
            operatingSystem: "Any",
            url: "https://dostrike.com/reversi-setup",
            isAccessibleForFree: true,
          })}
        </script>
      </Helmet>
      <div className="board-game-top">
        <Link to="/">← All games</Link>
        <Link to="/blog/reversi-legal-moves-corners-and-passes">
          Learn the patterns ↗
        </Link>
      </div>
      <header className="board-game-heading">
        <p className="board-game-eyebrow">EVERY MOVE CHANGES THE BOARD.</p>
        <h1>Reversi</h1>
        <p>
          Find a legal move. Flip the line.
          <br />
          Keep your options open until the final count.
        </p>
      </header>
      {isSetup ? (
        <>
          {saved && (
            <section className="board-game-continue">
              <div>
                <strong>Your board is waiting.</strong>
                <p>
                  {saved.game.moves.filter((move) => move !== -1).length}{" "}
                  {saved.game.moves.filter((move) => move !== -1).length === 1
                    ? "placement"
                    : "placements"}{" "}
                  ·{" "}
                  {saved.settings.daily
                    ? `Opening from ${saved.day}`
                    : saved.settings.mode === "local"
                      ? "Two players"
                      : `${saved.settings.difficulty} computer`}
                </p>
              </div>
              <button
                onClick={() => {
                  setSettings(saved.settings);
                  setDay(saved.day);
                  setGame(saved.game);
                  setHintRequested(false);
                  setPreview(null);
                  setNotice("Round continued.");
                  counted.current = false;
                  navigate("/reversi", { state: saved.settings });
                }}
              >
                Continue round →
              </button>
            </section>
          )}
          <section
            className="board-game-setup"
            aria-labelledby="reversi-setup-title"
          >
            <h2 id="reversi-setup-title">Choose your next opponent.</h2>
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
              <>
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
                      ? "Varies its choices among legal moves. A forgiving place to learn flips."
                      : settings.difficulty === "medium"
                        ? "Looks up to two placements ahead, considering position and mobility."
                        : "Looks up to four placements ahead, deeper in short endgames, within a fixed search budget. Beatable, not perfect."}
                  </p>
                </fieldset>
                <fieldset>
                  <legend>Your discs</legend>
                  <div className="board-game-options">
                    {(["black", "white"] as const).map((side) => (
                      <button
                        key={side}
                        aria-pressed={settings.side === side}
                        onClick={() => setSettings({ ...settings, side })}
                      >
                        {colourName(side)} ·{" "}
                        {side === "black" ? "first" : "second"}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            <label className="board-game-check">
              <input
                type="checkbox"
                checked={settings.confirm}
                onChange={(event) =>
                  setSettings({ ...settings, confirm: event.target.checked })
                }
              />
              Preview flips before placing
            </label>
            <button className="board-game-primary" onClick={() => start()}>
              Start playing ↗
            </button>
            <p className="board-game-small">
              Free to play. No account. Legal moves are marked.
            </p>
          </section>
          <section className="board-game-daily">
            <div>
              <p className="board-game-eyebrow">
                TODAY’S OPENING · {dateKey()}
              </p>
              <h2>
                {dailyWon === dateKey()
                  ? "Today’s opening completed."
                  : "Start from a different position."}
              </h2>
              <p>
                Six opening placements are played for you. Take Black against
                Hard. This is a full game, not a puzzle with one prescribed
                answer.
              </p>
            </div>
            <button onClick={() => start(true)}>Play today’s opening →</button>
          </section>
        </>
      ) : (
        <section className="reversi-play" aria-label="Reversi game">
          <div className="board-game-match-info">
            <span>
              {settings.daily
                ? `Daily opening · ${day}`
                : settings.mode === "local"
                  ? "Two players · same device"
                  : `${settings.difficulty} computer · you play ${settings.side}`}
            </span>
            <Link to="/reversi-setup">Change setup</Link>
          </div>
          <p
            className="board-game-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {status}
          </p>
          <div className="reversi-scores" aria-label="Disc counts">
            <div
              className={
                game.turn === "black" && !game.over ? "is-current" : ""
              }
            >
              <span
                className="reversi-score-disc black-disc"
                aria-hidden="true"
              />
              <span>
                Black<strong>{counts.black}</strong>
              </span>
            </div>
            <div
              className={
                game.turn === "white" && !game.over ? "is-current" : ""
              }
            >
              <span
                className="reversi-score-disc white-disc"
                aria-hidden="true"
              />
              <span>
                White<strong>{counts.white}</strong>
              </span>
            </div>
          </div>
          <p id="reversi-help" className="board-game-board-help">
            {game.over
              ? "The game ends when neither colour can move. Empty squares do not count for either side."
              : `${legal.length} legal ${legal.length === 1 ? "move" : "moves"}. Ringed squares can flip a line. Arrow keys move; Enter selects${settings.confirm ? " and confirms" : ""}. On narrow screens, scroll the board for its edges.`}
          </p>
          <div
            className="reversi-scroll"
            tabIndex={0}
            role="region"
            aria-label="Scrollable Reversi board"
            aria-describedby="reversi-help"
          >
            <div
              className="reversi-board"
              role="grid"
              aria-label="8 by 8 Reversi board; A1 at top left"
              aria-rowcount={8}
              aria-colcount={8}
            >
              {Array.from({ length: 8 }, (_, row) => (
                <div role="row" key={row}>
                  {Array.from({ length: 8 }, (_, column) => {
                    const index = row * 8 + column,
                      disc = game.board[index],
                      isLegal = legal.includes(index),
                      flipCount = isLegal
                        ? reversiFlips(game.board, index, game.turn).length
                        : 0;
                    return (
                      <button
                        role="gridcell"
                        type="button"
                        key={index}
                        ref={(element) => {
                          cells.current[index] = element;
                        }}
                        tabIndex={focus === index ? 0 : -1}
                        aria-rowindex={row + 1}
                        aria-colindex={column + 1}
                        aria-label={`${pointName(index)}, ${disc || "empty"}${isLegal && !game.over ? `, legal, flips ${flipCount}` : ""}${preview === index ? ", preview" : ""}${lastMove === index ? ", last placement" : ""}${game.lastFlipped.includes(index) ? ", just flipped" : ""}`}
                        aria-disabled={Boolean(!isLegal || busy || game.over)}
                        className={`reversi-cell ${disc ? `disc-${disc}` : ""} ${isLegal && !game.over ? "is-legal" : ""} ${preview === index ? `preview-${game.turn}` : ""} ${flips.includes(index) ? "will-flip" : ""} ${game.lastFlipped.includes(index) ? "was-flipped" : ""} ${lastMove === index ? "is-last" : ""}`}
                        onFocus={() => setFocus(index)}
                        onClick={() => activate(index)}
                        onKeyDown={(event) => {
                          const keys: Record<string, number> = {
                            ArrowLeft: column > 0 ? index - 1 : index,
                            ArrowRight: column < 7 ? index + 1 : index,
                            ArrowUp: row > 0 ? index - 8 : index,
                            ArrowDown: row < 7 ? index + 8 : index,
                            Home: row * 8,
                            End: row * 8 + 7,
                          };
                          if (event.key in keys) {
                            event.preventDefault();
                            cells.current[keys[event.key]]?.focus();
                          }
                        }}
                      >
                        <small aria-hidden="true">{pointName(index)}</small>
                        <span className="reversi-disc" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
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
                    ? "Select a legal square"
                    : `Place at ${pointName(preview)}`}
                </button>
                <button
                  disabled={undoIndex < 0}
                  onClick={() => {
                    if (undoIndex < 0) return;
                    setGame(replayReversi(game.moves.slice(0, undoIndex)));
                    setHintRequested(false);
                    setPreview(null);
                    setNotice("Returned to before your last placement.");
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
              <h2>{result} Count the final board.</h2>
              <p>
                Black {counts.black} · White {counts.white} · {counts.empty}{" "}
                empty. Neither side has a legal placement. Disc counts during
                the game can change quickly; the final count decides the result.
              </p>
              <Link to="/blog/reversi-legal-moves-corners-and-passes">
                Review legal flips, corners and passes →
              </Link>
            </div>
          )}
          {game.moves.length > 0 && (
            <details className="reversi-history">
              <summary>
                Move history · {game.moves.filter((move) => move !== -1).length}{" "}
                {game.moves.filter((move) => move !== -1).length === 1
                  ? "placement"
                  : "placements"}
              </summary>
              <ol>
                {game.moves.map((move, index) => (
                  <li key={index}>
                    {index % 2 === 0 ? "Black" : "White"}{" "}
                    {move === -1 ? "passed" : pointName(move)}
                    {index < baseMoves ? " · daily opening" : ""}
                  </li>
                ))}
              </ol>
            </details>
          )}
        </section>
      )}
      <section className="board-game-records">
        <h2>Your computer games</h2>
        <p>
          Completed games on this browser. Hints and undo are free; casual
          records include assisted games and daily openings. No cross-device
          sync.
        </p>
        <div>
          {(["easy", "medium", "hard"] as const).map((level) => (
            <p key={level}>
              <strong>{level}</strong>
              <span>
                {records[level].wins}{" "}
                {records[level].wins === 1 ? "win" : "wins"} ·{" "}
                {records[level].losses}{" "}
                {records[level].losses === 1 ? "loss" : "losses"} ·{" "}
                {records[level].draws}{" "}
                {records[level].draws === 1 ? "draw" : "draws"}
              </span>
            </p>
          ))}
        </div>
      </section>
      <section
        className="board-game-rules"
        aria-labelledby="reversi-rules-title"
      >
        <h2 id="reversi-rules-title">How to play Reversi</h2>
        <ol>
          <li>
            Start with four centre discs on an 8 by 8 board. Black plays first.
          </li>
          <li>
            Place on an empty square that traps at least one unbroken line of
            opposing discs between your new disc and one already on the board.
            Horizontal, vertical and diagonal lines count.
          </li>
          <li>
            All discs directly trapped by that placement flip. Flips do not
            cause further chain reactions.
          </li>
          <li>
            If a colour has no legal move, it passes automatically. You cannot
            choose to pass when a legal move is available.
          </li>
          <li>
            When neither side can move, compare actual disc counts. The larger
            count wins; equal counts draw. A game can finish before all squares
            are filled.
          </li>
        </ol>
        <p>
          Medium and Hard use bounded search with positional and mobility
          heuristics. Their search runs separately from the interface so restart
          and navigation remain available. These are original web opponents, not
          a promise of app parity or perfect play.
        </p>
        <Link to="/blog/reversi-legal-moves-corners-and-passes">
          Read worked examples before your next game →
        </Link>
      </section>
    </main>
  );
}
