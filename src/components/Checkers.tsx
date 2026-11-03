import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  newCheckers,
  checkersDaily,
  checkersLegal,
  checkersSquare,
  checkersCounts,
  playCheckers,
  replayCheckers,
  otherCheckers,
  type CheckersSide,
  type CheckersState,
  type CheckersMove,
} from "../utils/checkersEngine";
import {
  readCheckersProgress,
  writeCheckersProgress,
  recordCheckersResult,
  currentCheckersStreak,
} from "../utils/checkersProgress";
import "./BoardGame.css";
import "./Checkers.css";
type Settings = {
  mode: "computer" | "local";
  human: CheckersSide;
  level: "easy" | "medium" | "hard";
  daily: boolean;
};
const defaults: Settings = {
  mode: "computer",
  human: "dark",
  level: "medium",
  daily: false,
};
const sessionKey = "dostrike-checkers-session-v1";
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const initialFor = (s: Settings, day: string) =>
  s.daily ? checkersDaily(day) : newCheckers();
function load() {
  try {
    const v = JSON.parse(localStorage.getItem(sessionKey) || "null");
    if (
      !v ||
      typeof v.id !== "string" ||
      !v.id ||
      v.id.length > 100 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(v.day) ||
      !Array.isArray(v.moves) ||
      !v.moves.length ||
      v.moves.length > 4000
    )
      return null;
    const raw = v.settings;
    if (
      !raw ||
      !["local", "computer"].includes(raw.mode) ||
      !["dark", "light"].includes(raw.human) ||
      !["easy", "medium", "hard"].includes(raw.level) ||
      typeof raw.daily !== "boolean"
    )
      return null;
    const settings: Settings = raw.daily
      ? { ...defaults, daily: true, level: "hard" }
      : raw;
    const initial = initialFor(settings, v.day);
    const game = replayCheckers(initial, v.moves);
    if (game.over) return null;
    return { id: v.id as string, day: v.day as string, settings, game };
  } catch {
    return null;
  }
}
const id = () => crypto.randomUUID();
export default function Checkers() {
  const location = useLocation(),
    navigate = useNavigate(),
    setup = location.pathname.replace(/\/+$/, "") === "/checkers-setup";
  const [loaded] = useState(load),
    [saved, setSaved] = useState(load);
  const [settings, setSettings] = useState<Settings>(
      loaded?.settings || (location.state as Settings | null) || defaults,
    ),
    [day, setDay] = useState(loaded?.day || today()),
    [round, setRound] = useState(loaded?.id || id);
  const [game, setGame] = useState<CheckersState>(
      () =>
        loaded?.game ||
        initialFor((location.state as Settings | null) || defaults, today()),
    ),
    [selected, setSelected] = useState<number | null>(null),
    [preview, setPreview] = useState<CheckersMove | null>(null),
    [hint, setHint] = useState(false),
    [notice, setNotice] = useState(""),
    [focus, setFocus] = useState(40),
    [progress, setProgress] = useState(readCheckersProgress);
  const recorded = useRef(""),
    cells = useRef<(HTMLButtonElement | null)[]>([]);
  const initial = useMemo(() => initialFor(settings, day), [settings, day]);
  const legal = useMemo(
    () => (game.over ? [] : checkersLegal(game.board, game.turn)),
    [game],
  );
  const thinking =
    !game.over && settings.mode === "computer" && game.turn !== settings.human;
  const rotated = settings.mode === "computer" && settings.human === "light";
  const indexes = Array.from({ length: 64 }, (_, i) => (rotated ? 63 - i : i));
  const options = legal.filter((m) => m.path[0] === selected);
  const counts = checkersCounts(game.board);
  const name = (s: CheckersSide) => (s === "dark" ? "Dark" : "Light");
  const moveText = (m: CheckersMove) =>
    m.path.map(checkersSquare).join(m.captures.length ? " → " : " – ") +
    (m.captures.length ? ` (capture ${m.captures.length})` : "");
  const apply = (m: CheckersMove) => {
    const next = playCheckers(game, m.path);
    if (next === game) return;
    setGame(next);
    setSelected(null);
    setPreview(null);
    setHint(false);
    const from = game.board[m.path[0]]!,
      to = next.board[m.path[m.path.length - 1]!];
    setNotice(
      `${name(game.turn)}: ${moveText(m)}.${!from.king && to?.king ? " Crowned a king." : ""}`,
    );
  };
  useEffect(() => {
    if (setup) {
      setSaved(load());
      setProgress(readCheckersProgress());
    }
  }, [setup]);
  useEffect(() => {
    if (setup) return;
    try {
      localStorage.setItem("dostrike-last-pick", "checkers");
      if (game.over || !game.moves.length) localStorage.removeItem(sessionKey);
      else
        localStorage.setItem(
          sessionKey,
          JSON.stringify({
            id: round,
            day,
            settings,
            moves: game.moves.slice(initial.moves.length),
          }),
        );
    } catch {
      /* Optional persistence. */
    }
  }, [game, setup, round, day, settings, initial]);
  useEffect(() => {
    if (setup || !game.over || !game.winner || recorded.current === round)
      return;
    recorded.current = round;
    const next = recordCheckersResult(readCheckersProgress(), {
      id: round,
      mode: settings.mode,
      difficulty: settings.level,
      human: settings.human,
      counts: checkersCounts(game.board),
      winner: game.winner,
      today: today(),
      dailyDay: settings.daily ? day : undefined,
    });
    setProgress(next);
    writeCheckersProgress(next);
  }, [game, setup, round, settings, day]);
  useEffect(() => {
    if (setup || game.over || (!thinking && !hint)) return;
    let cancelled = false,
      settled = false,
      worker: Worker | null = null,
      timeout: number | undefined;
    const finish = (move: CheckersMove | null, failed = false) => {
      if (cancelled || settled) return;
      settled = true;
      window.clearTimeout(timeout);
      const valid =
        move &&
        legal.find(
          (m) =>
            m.path.length === move.path.length &&
            m.path.every((v, i) => v === move.path[i]),
        );
      const chosen = valid || legal[0];
      if (thinking && chosen) {
        setGame((current) =>
          current === game ? playCheckers(game, chosen.path) : current,
        );
        setSelected(null);
        setPreview(null);
        setNotice(
          failed
            ? "Computer search unavailable; played a legal fallback move."
            : `Computer: ${chosen.path.map(checkersSquare).join(" → ")}${chosen.captures.length ? `; captured ${chosen.captures.length}` : ""}.`,
        );
      } else if (valid) {
        setSelected(valid.path[0]);
        setPreview(valid);
        setFocus(valid.path[0]);
        cells.current[valid.path[0]]?.focus();
        setNotice(
          "Suggested complete move. Bounded search does not guarantee a win.",
        );
      } else
        setNotice("Hint unavailable. You can still choose any legal move.");
      setHint(false);
      worker?.terminate();
    };
    const launch = window.setTimeout(
      () => {
        try {
          worker = new Worker(
            new URL("../workers/checkers.worker.ts", import.meta.url),
            { type: "module" },
          );
          worker.onmessage = (e) => finish(e.data.move);
          worker.onerror = () => finish(null, true);
          timeout = window.setTimeout(() => finish(null, true), 8000);
          worker.postMessage({
            game,
            difficulty: thinking ? settings.level : "hard",
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
  }, [game, thinking, hint, setup, legal, settings.level]);
  function start(next: Settings) {
    setSettings(next);
    setDay(today());
    setRound(id());
    const board = initialFor(next, today());
    setGame(board);
    setSelected(null);
    setPreview(null);
    setHint(false);
    setNotice("");
    setFocus(next.mode === "computer" && next.human === "light" ? 23 : 40);
    try {
      localStorage.removeItem(sessionKey);
    } catch {
      /* Optional storage. */
    }
    navigate("/checkers", { state: next });
  }
  function undo() {
    if (thinking || hint) return;
    const moves = game.moves.slice(initial.moves.length);
    if (!moves.length) return;
    let remove = moves.length - 1;
    if (settings.mode === "computer") {
      while (
        remove >= 0 &&
        (remove % 2 === 0 ? initial.turn : otherCheckers(initial.turn)) !==
          settings.human
      )
        remove--;
      if (remove < 0) return;
    }
    setGame(replayCheckers(initial, moves.slice(0, remove)));
    setSelected(null);
    setPreview(null);
    setHint(false);
    setNotice("Returned to before your last complete move.");
  }
  function chooseSquare(index: number) {
    if (game.over || thinking || hint) return;
    const destinations = options.filter(
      (m) => m.path[m.path.length - 1] === index,
    );
    if (destinations.length === 1) {
      setPreview(destinations[0]);
      setNotice("Preview the complete route, then confirm.");
      return;
    }
    if (destinations.length > 1) {
      setNotice(
        "More than one jump route reaches this square. Choose a complete route below.",
      );
      return;
    }
    if (legal.some((m) => m.path[0] === index)) {
      setSelected(index);
      setPreview(null);
      setNotice("Choose a destination or a complete move below.");
    }
  }
  const history = game.moves.slice(initial.moves.length),
    last = game.moves[game.moves.length - 1] || [];
  const status = game.over
    ? game.winner === "draw"
      ? "Draw."
      : `${name(game.winner as CheckersSide)} wins.`
    : thinking
      ? "Computer is thinking…"
      : hint
        ? "Finding a suggestion…"
        : `${name(game.turn)} to move.${legal[0]?.captures.length ? " Capture required." : ""}`;
  return (
    <main className="board-game-page checkers-page">
      <Helmet>
        <title>
          {setup
            ? "Checkers: English draughts, computer or two players"
            : "Checkers game"}{" "}
          | DoStrike
        </title>
        <meta
          name="description"
          content="Play English draughts with compulsory captures, complete jump chains and short kings. Three computer levels, two-player play, free hints and a daily board."
        />
        <link
          rel="canonical"
          href={`https://dostrike.com${setup ? "/checkers-setup" : "/checkers"}`}
        />
        <meta name="robots" content={setup ? "index,follow" : "noindex"} />
      </Helmet>
      <div className="board-game-topline">
        <Link to="/">← All games</Link>
        <Link to="/blog/checkers-captures-kings-and-complete-jumps">
          Learn the patterns ↗
        </Link>
      </div>
      <header className="board-game-heading">
        <p className="board-game-eyebrow">SEE THE JUMP. FOLLOW IT THROUGH.</p>
        <h1>Checkers</h1>
        <p>
          One move can take the long way round.
          <br />
          English draughts with complete capture chains.
        </p>
      </header>
      {setup ? (
        <>
          <section className="board-game-setup">
            <h2>Choose your side.</h2>
            {saved && (
              <button
                onClick={() => {
                  setSettings(saved.settings);
                  setDay(saved.day);
                  setRound(saved.id);
                  setGame(saved.game);
                  setSelected(null);
                  setPreview(null);
                  setNotice("Saved round restored.");
                  navigate("/checkers");
                }}
              >
                Continue round →
              </button>
            )}
            <fieldset>
              <legend>Who’s playing?</legend>
              {(["computer", "local"] as const).map((mode) => (
                <button
                  key={mode}
                  aria-pressed={settings.mode === mode}
                  onClick={() =>
                    setSettings({ ...settings, mode, daily: false })
                  }
                >
                  {mode === "computer" ? "Play the computer" : "Two players"}
                </button>
              ))}
            </fieldset>
            {settings.mode === "computer" && (
              <>
                <fieldset>
                  <legend>Choose your challenge</legend>
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <button
                      key={level}
                      aria-pressed={settings.level === level}
                      onClick={() =>
                        setSettings({ ...settings, level, daily: false })
                      }
                    >
                      {level}
                    </button>
                  ))}
                  <p>
                    Bounded searches up to 2, 4 or 7 complete moves. No rating
                    or perfect-play claim.
                  </p>
                </fieldset>
                <fieldset>
                  <legend>Your side</legend>
                  {(["dark", "light"] as const).map((human) => (
                    <button
                      key={human}
                      aria-pressed={settings.human === human}
                      onClick={() =>
                        setSettings({ ...settings, human, daily: false })
                      }
                    >
                      {name(human)}
                    </button>
                  ))}
                  <p>Dark moves first. The board turns to your side.</p>
                </fieldset>
              </>
            )}
            <p>
              Captures are compulsory. Complete the chosen chain; crowning ends
              that turn.
            </p>
            <button
              className="board-game-primary"
              onClick={() => start({ ...settings, daily: false })}
            >
              Start playing ↗
            </button>
            <p>Free hints and undo. No account needed.</p>
          </section>
          <section className="board-game-daily">
            <p className="board-game-eyebrow">TODAY’S BOARD · {today()}</p>
            <h2>Eight moves in. Your turn.</h2>
            <p>
              A legal website-generated opening. Play Dark against Hard; a full
              game with many continuations.
            </p>
            <p>
              Daily streak {currentCheckersStreak(progress, today())} · Best{" "}
              {progress.bestDailyStreak}
            </p>
            <button
              onClick={() => start({ ...defaults, level: "hard", daily: true })}
            >
              Play today’s board →
            </button>
          </section>
        </>
      ) : (
        <section className="checkers-play" aria-label="Checkers game">
          <div className="board-game-match-info">
            <span>
              {settings.daily
                ? `Daily · ${day}`
                : settings.mode === "local"
                  ? "Two players"
                  : `${settings.level} computer · you play ${name(settings.human)}`}
            </span>
            <Link to="/checkers-setup">Change setup</Link>
          </div>
          <h2 role="status">{status}</h2>
          <p className="checkers-count">
            Dark {counts.dark} · Light {counts.light}
          </p>
          <p id="checkers-help">
            Choose a ringed piece, then a destination. Confirm a complete route
            below. Arrow keys inspect squares; Enter selects. ★ marks a king.
            The board can scroll on small screens.
          </p>
          <div className="checkers-scroll">
            <div
              className="checkers-board"
              role="group"
              aria-label="English draughts board"
              aria-describedby="checkers-help"
            >
              {indexes.map((index) => {
                const p = game.board[index],
                  playable = (Math.floor(index / 8) + (index % 8)) % 2 === 1,
                  movable = legal.some((m) => m.path[0] === index),
                  destination = options.some(
                    (m) => m.path[m.path.length - 1] === index,
                  );
                return (
                  <button
                    key={index}
                    ref={(el) => {
                      cells.current[index] = el;
                    }}
                    className={`checkers-cell ${playable ? "playable" : ""} ${movable && !thinking ? "movable" : ""} ${selected === index ? "selected" : ""} ${destination ? "destination" : ""} ${last.includes(index) ? "last" : ""} ${preview?.path.includes(index) ? "preview" : ""}`}
                    aria-label={`${checkersSquare(index)}, ${p ? `${name(p.side)} ${p.king ? "king" : "piece"}` : "empty"}${movable ? ", can move" : ""}${destination ? ", destination" : ""}`}
                    tabIndex={focus === index ? 0 : -1}
                    onFocus={() => setFocus(index)}
                    onClick={() => chooseSquare(index)}
                    onKeyDown={(e) => {
                      const step = {
                        ArrowLeft: -1,
                        ArrowRight: 1,
                        ArrowUp: -8,
                        ArrowDown: 8,
                      }[e.key];
                      if (step !== undefined) {
                        e.preventDefault();
                        const visual = indexes.indexOf(index);
                        const next = Math.max(0, Math.min(63, visual + step));
                        setFocus(indexes[next]);
                        cells.current[indexes[next]]?.focus();
                      } else if (e.key === "Escape") {
                        setSelected(null);
                        setPreview(null);
                      }
                    }}
                  >
                    <small aria-hidden="true">{checkersSquare(index)}</small>
                    {p && (
                      <span
                        aria-hidden="true"
                        className={`checkers-piece ${p.side}`}
                      >
                        {p.king ? "★" : ""}
                      </span>
                    )}
                    {!p && destination && (
                      <span aria-hidden="true" className="checkers-target">
                        •
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {!game.over && (
            <>
              <div className="board-game-actions">
                <button
                  className="board-game-primary"
                  disabled={!preview || thinking || hint}
                  onClick={() => preview && apply(preview)}
                >
                  {preview
                    ? `Confirm ${preview.path.map(checkersSquare).join(" → ")}`
                    : "Select a piece and destination"}
                </button>
                <button
                  disabled={!history.length || thinking || hint}
                  onClick={undo}
                >
                  Undo
                </button>
                <button
                  disabled={thinking || hint}
                  onClick={() => setHint(true)}
                >
                  Suggest a move
                </button>
                <button onClick={() => start(settings)}>Restart</button>
              </div>
              <div
                className="checkers-routes"
                aria-label="Complete legal moves"
              >
                {options.map((m, i) => (
                  <button
                    key={i}
                    aria-pressed={preview === m}
                    onClick={() => setPreview(m)}
                    disabled={thinking || hint}
                  >
                    {moveText(m)}
                  </button>
                ))}
              </div>
            </>
          )}
          <p role="status">{notice}</p>
          {game.over && (
            <div className="board-game-result">
              <h2>{status}</h2>
              <p>
                {game.winner === "draw"
                  ? "Threefold repetition or 40 moves per side without capture or a man move."
                  : "The other side has no legal move."}{" "}
                Dark {counts.dark} · Light {counts.light} pieces remain.
              </p>
              <button onClick={() => start(settings)}>Play again</button>
              <Link to="/blog/checkers-captures-kings-and-complete-jumps">
                Review the patterns →
              </Link>
            </div>
          )}
          <details>
            <summary>Move history ({history.length})</summary>
            <ol>
              {history.map((path, i) => (
                <li key={i}>{path.map(checkersSquare).join(" → ")}</li>
              ))}
            </ol>
          </details>
        </section>
      )}
      <section className="board-game-records">
        <h2>Your Checkers records</h2>
        <p>
          Completed games on this browser, including daily boards and free
          assistance. Local games: {progress.localGames}. No account or
          cross-device sync.
        </p>
        <div>
          {(["easy", "medium", "hard"] as const).map((level) => {
            const r = progress.levels[level];
            return (
              <p key={level}>
                <strong>{level}</strong>
                <span>
                  {r.wins} W · {r.losses} L · {r.draws} D<br />
                  Win streak {r.streak} · Best {r.bestStreak}
                  <br />
                  Best winning piece margin {r.bestMargin}
                </span>
              </p>
            );
          })}
        </div>
      </section>
      <section className="board-game-rules">
        <h2>How English draughts works</h2>
        <ol>
          <li>
            Men move and capture diagonally forward. Kings move one square or
            jump an adjacent piece in either diagonal direction; they do not
            fly.
          </li>
          <li>
            If any capture exists, you must capture. Choose any complete chain,
            even if another takes more pieces. A man reaching the far row
            becomes a king and stops for that turn.
          </li>
          <li>
            No legal move loses, even with pieces remaining. This casual game
            automatically draws on the third matching position with the same
            turn, or after 40 moves by each side without capture or a man move.
          </li>
        </ol>
        <p>
          Hints use bounded Hard search. Undo removes your last full decision
          and any later computer reply. Daily wins count toward the streak only
          when completed on that board’s date.
        </p>
        <Link to="/blog/checkers-captures-kings-and-complete-jumps">
          See worked capture and crowning examples →
        </Link>
      </section>
    </main>
  );
}
