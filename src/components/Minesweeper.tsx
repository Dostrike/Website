import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  playMines,
  validMineSettings,
  type MineSettings,
  type MineAction,
} from "../utils/minesweeperEngine";
import {
  readMineSave,
  mineSaveKey,
  restoreMineRound,
  encodeMineRound,
  recoverMineRound,
  safeMineReveal,
  type MineSave,
  type MineRound,
} from "../utils/minesweeperSession";
import {
  readMineRecords,
  writeMineRecords,
  recordMineResult,
  mineStreak,
} from "../utils/minesweeperRecords";
import "./BoardGame.css";
import "./Minesweeper.css";
type Request = {
  id: string;
  seed: string;
  settings: MineSettings;
  first: number | null;
  day: string | null;
  save?: MineSave;
};
const presets = {
  Beginner: { width: 9, height: 9, mines: 10 },
  Intermediate: { width: 16, height: 16, mines: 40 },
  Expert: { width: 16, height: 30, mines: 99 },
};
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fresh = (settings: MineSettings, daily = false): Request => {
  const id = crypto.randomUUID(),
    day = daily ? today() : null;
  return {
    id,
    seed: day ? `daily:${day}` : id,
    settings: daily ? { ...presets.Intermediate, noGuess: true } : settings,
    first: daily ? 0 : null,
    day,
  };
};
const defaults = { ...presets.Beginner, noGuess: true };
export default function Minesweeper() {
  const location = useLocation(),
    navigate = useNavigate(),
    setup = location.pathname.replace(/\/+$/, "") === "/minesweeper-setup";
  const [loaded] = useState(readMineSave),
    [saved, setSaved] = useState(readMineSave),
    [request, setRequest] = useState<Request>(() =>
      loaded
        ? { ...loaded, save: loaded }
        : (location.state as Request | null) || fresh(defaults),
    ),
    [round, setRound] = useState<MineRound | null>(null);
  const [settings, setSettings] = useState<MineSettings>(defaults),
    [preset, setPreset] = useState("Beginner"),
    [flagMode, setFlagMode] = useState(false),
    [focus, setFocus] = useState(0),
    [notice, setNotice] = useState(""),
    [failure, setFailure] = useState(""),
    [records, setRecords] = useState(readMineRecords),
    [cellSize, setCellSize] = useState(44);
  const cells = useRef<(HTMLButtonElement | null)[]>([]),
    recorded = useRef(""),
    hold = useRef<number | undefined>(),
    ignoreClick = useRef<number | null>(null),
    touchPointer = useRef(false);
  const active = round?.state,
    boardSettings = round?.settings || request.settings,
    busy = !setup && !round && request.first !== null && !failure;
  const finish = useCallback((r: MineRound) => {
    if (recorded.current === r.id) return;
    recorded.current = r.id;
    const next = recordMineResult(
      readMineRecords(),
      r.id,
      r.state.won,
      r.assisted,
      r.day,
      today(),
    );
    setRecords(next);
    writeMineRecords(next);
    setRound({ ...r, finalized: true });
  }, []);
  useEffect(() => {
    if (setup) {
      setSaved(readMineSave());
      setRecords(readMineRecords());
    }
  }, [setup]);
  useEffect(() => {
    if (setup || round || request.first === null) return;
    let cancelled = false,
      worker: Worker | null = null;
    setFailure("");
    const timeout = window.setTimeout(() => {
      worker?.terminate();
      if (!cancelled)
        setFailure(
          "A proven board was not ready within 20 seconds. Retry with a new seed or choose a smaller board.",
        );
    }, 20000);
    try {
      worker = new Worker(
        new URL("../workers/minesweeper.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.onmessage = (e) => {
        if (cancelled) return;
        window.clearTimeout(timeout);
        if (e.data.board) {
          try {
            const save = request.save || {
              id: request.id,
              seed: request.seed,
              settings: request.settings,
              first: request.first!,
              day: request.day,
              actions: [],
              assisted: false,
              recovered: false,
              finalized: false,
            };
            setRound(restoreMineRound(save, e.data.board));
            setNotice(
              request.save
                ? "Saved round restored."
                : request.settings.noGuess
                  ? "No-guess proof passed. Clear every safe cell."
                  : "Random board ready. Some positions may require a guess.",
            );
          } catch {
            setFailure(
              "The saved action history could not be restored. Choose a new board.",
            );
          }
        } else setFailure(e.data.error || "Generation failed.");
        worker?.terminate();
      };
      worker.onerror = () => {
        if (!cancelled) {
          window.clearTimeout(timeout);
          setFailure("Generation worker unavailable. Please retry.");
        }
        worker?.terminate();
      };
      worker.postMessage({
        settings: request.settings,
        seed: request.seed,
        first: request.first,
      });
    } catch {
      window.clearTimeout(timeout);
      setFailure("Generation worker unavailable. Please retry.");
    }
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      worker?.terminate();
    };
  }, [setup, round, request]);
  useEffect(() => {
    if (setup || !round) return;
    try {
      localStorage.setItem("dostrike-last-pick", "minesweeper");
      if (round.finalized || round.state.won)
        localStorage.removeItem(mineSaveKey);
      else localStorage.setItem(mineSaveKey, encodeMineRound(round));
    } catch {
      /* Optional storage. */
    }
  }, [setup, round]);
  useEffect(() => {
    if (!setup && round?.state.won && !round.finalized) finish(round);
  }, [round, setup, finish]);
  useEffect(() => () => window.clearTimeout(hold.current), []);
  function start(next: Request) {
    if (round?.state.over && !round.finalized) finish(round);
    try {
      localStorage.removeItem(mineSaveKey);
    } catch {
      /* Optional storage. */
    }
    setRound(null);
    setRequest(next);
    setFailure("");
    setNotice("");
    setFocus(0);
    setFlagMode(false);
    navigate("/minesweeper", { state: next });
  }
  function act(index: number, type?: MineAction["type"]) {
    if (!round) {
      if (busy || failure) return;
      setRequest({ ...request, first: index });
      return;
    }
    if (round.state.over) return;
    const action: MineAction = {
      index,
      type:
        type ||
        (flagMode ? "flag" : round.state.revealed[index] ? "chord" : "reveal"),
    };
    const next = playMines(round.state, action);
    if (next === round.state) {
      setNotice(
        action.type === "chord"
          ? "To chord, flag exactly as many neighbours as the revealed number. Incorrect flags can cause a loss."
          : "That action does not change this cell.",
      );
      return;
    }
    setRound({ ...round, state: next });
    setNotice(
      next.over
        ? next.won
          ? "Every safe cell is clear."
          : "A mine was revealed. You may use one assisted second chance if available."
        : action.type === "flag"
          ? "Flag toggled. Flags are your assertions, not a mine check."
          : `${next.revealed.filter(Boolean).length} cells revealed.`,
    );
  }
  const revealed = active?.revealed.filter(Boolean).length || 0,
    flags = active?.flags.filter(Boolean).length || 0;
  return (
    <main className="board-game-page mines-page">
      <Helmet>
        <title>
          {setup
            ? "Minesweeper: proven no-guess boards and daily play"
            : "Minesweeper game"}{" "}
          | DoStrike
        </title>
        <meta
          name="description"
          content="Play Minesweeper with first-click safe openings, verified no-guess boards, flags and chording. Beginner to Expert, custom boards, assisted helpers and daily play."
        />
        <link
          rel="canonical"
          href={`https://dostrike.com${setup ? "/minesweeper-setup" : "/minesweeper"}`}
        />
        <meta name="robots" content={setup ? "index,follow" : "noindex"} />
      </Helmet>
      <div className="mines-topline">
        <Link to="/">← All games</Link>
        <Link to="/blog/minesweeper-safe-moves-flags-and-subsets">
          Learn the patterns ↗
        </Link>
      </div>
      <header className="board-game-heading">
        <p className="board-game-eyebrow">
          COUNT THE NEIGHBOURS. CLEAR THE DOUBT.
        </p>
        <h1>Minesweeper</h1>
        <p>Find the safe ground, one deduction at a time.</p>
      </header>
      {setup ? (
        <>
          <section className="board-game-setup">
            <h2>Choose your field.</h2>
            {saved && (
              <button
                onClick={() => {
                  setRound(null);
                  setRequest({ ...saved, save: saved });
                  setFailure("");
                  navigate("/minesweeper", {
                    state: { ...saved, save: saved },
                  });
                }}
              >
                Continue round →
              </button>
            )}
            <fieldset>
              <legend>Board size</legend>
              {[...Object.keys(presets), "Custom"].map((p) => (
                <button
                  key={p}
                  aria-pressed={preset === p}
                  onClick={() => {
                    setPreset(p);
                    if (p !== "Custom")
                      setSettings({
                        ...presets[p as keyof typeof presets],
                        noGuess: settings.noGuess,
                      });
                  }}
                >
                  {p}
                </button>
              ))}
            </fieldset>
            {preset === "Custom" && (
              <div className="mines-custom">
                {(["width", "height", "mines"] as const).map((k) => (
                  <label key={k}>
                    {k}
                    <input
                      aria-label={`Custom ${k}`}
                      type="number"
                      min={k === "mines" ? 1 : 5}
                      max={k === "mines" ? 210 : 30}
                      value={settings[k]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          [k]: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            )}
            <label className="mines-no-guess">
              <input
                type="checkbox"
                checked={settings.noGuess}
                onChange={(e) =>
                  setSettings({ ...settings, noGuess: e.target.checked })
                }
              />
              Prove no guessing required
            </label>
            <p>
              {settings.width} columns × {settings.height} rows ·{" "}
              {settings.mines} mines.{" "}
              {settings.noGuess
                ? "A visible-information solver must clear the board from your first reveal using single-number and subset deductions. Generation is bounded; if proof fails, choose a new seed."
                : "Random boards may require guesses. Your first reveal still opens a safe area."}
            </p>
            {!validMineSettings(settings) && (
              <p role="alert">
                Use 5–30 cells per side, at most 600 cells, and mines from 1 to
                35% of cells.
              </p>
            )}
            <button
              className="board-game-primary"
              disabled={!validMineSettings(settings)}
              onClick={() => start(fresh(settings))}
            >
              Start playing ↗
            </button>
            <p>
              First reveal and its neighbours are mine-free. No timer or payment
              gates.
            </p>
          </section>
          <section className="board-game-daily">
            <p className="board-game-eyebrow">TODAY’S BOARD · {today()}</p>
            <h2>The same opening. Your own deductions.</h2>
            <p>
              Intermediate 16×16, 40 mines, proven no-guess. Opens row1 column1
              for everyone. Generation may take a few seconds.
            </p>
            <p>
              Daily streak {mineStreak(records, today())} · Best {records.best}
            </p>
            <button
              onClick={() =>
                start(fresh({ ...presets.Intermediate, noGuess: true }, true))
              }
            >
              Play today’s board →
            </button>
          </section>
        </>
      ) : (
        <section aria-label="Minesweeper game">
          <div className="board-game-match-info">
            <span>
              {round?.day || request.day
                ? `Daily · ${round?.day || request.day}`
                : `${boardSettings.width} × ${boardSettings.height} · ${boardSettings.mines} mines`}
            </span>
            <Link to="/minesweeper-setup">Change setup</Link>
          </div>
          <h2 className="mines-status" role="status">
            {failure
              ? "Board unavailable"
              : busy
                ? "Generating and checking the proof…"
                : !round
                  ? "Choose your first reveal"
                  : active?.over
                    ? active.won
                      ? "All safe cells cleared."
                      : "Mine hit."
                    : `${revealed} safe cells cleared · ${boardSettings.mines - flags} flags remaining`}
          </h2>
          <p className="mines-help">
            Dig or Flag mode; F toggles a flag, C chords a number. Arrows move.
            Right-click or long-press flags. Scroll large boards; adjust cell
            size below.
          </p>
          {failure ? (
            <div role="alert">
              <p>{failure}</p>
              {!request.day && (
                <button onClick={() => start(fresh(request.settings))}>
                  Try a new seed
                </button>
              )}
              <Link to="/minesweeper-setup">Choose another board</Link>
            </div>
          ) : (
            <>
              <div className="mines-scroll">
                <div
                  className="mines-board"
                  role="group"
                  aria-label="Minesweeper field"
                  style={
                    {
                      "--mine-cell": `${cellSize}px`,
                      gridTemplateColumns: `repeat(${boardSettings.width},var(--mine-cell))`,
                      width: `calc(${boardSettings.width} * var(--mine-cell))`,
                    } as CSSProperties
                  }
                >
                  {Array.from(
                    { length: boardSettings.width * boardSettings.height },
                    (_, i) => {
                      const opened = !!active?.revealed[i],
                        flagged = !!active?.flags[i],
                        mine = !!active?.board.mines[i] && !!active.over,
                        number = opened ? active!.board.numbers[i] : null;
                      return (
                        <button
                          key={i}
                          ref={(el) => {
                            cells.current[i] = el;
                          }}
                          tabIndex={focus === i ? 0 : -1}
                          aria-disabled={busy || !!active?.over}
                          className={`mine-cell ${opened ? "opened" : ""} ${flagged ? "flagged" : ""} ${mine ? "mine" : ""} ${active?.hit === i ? "hit" : ""} number-${number}`}
                          aria-label={`Row ${Math.floor(i / boardSettings.width) + 1}, column ${(i % boardSettings.width) + 1}, ${mine ? "mine" : flagged ? "flagged" : opened ? `${number} adjacent mines` : "covered"}`}
                          onFocus={() => setFocus(i)}
                          onClick={() => {
                            if (ignoreClick.current === i) {
                              ignoreClick.current = null;
                              return;
                            }
                            act(i);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            window.clearTimeout(hold.current);
                            if (ignoreClick.current === i) return;
                            if (round) act(i, "flag");
                            if (touchPointer.current) ignoreClick.current = i;
                          }}
                          onPointerDown={(e) => {
                            touchPointer.current = e.pointerType === "touch";
                            ignoreClick.current = null;
                            if (
                              e.pointerType === "touch" &&
                              round &&
                              !active?.over
                            ) {
                              window.clearTimeout(hold.current);
                              ignoreClick.current = null;
                              hold.current = window.setTimeout(() => {
                                ignoreClick.current = i;
                                act(i, "flag");
                              }, 500);
                            }
                          }}
                          onPointerUp={() => window.clearTimeout(hold.current)}
                          onPointerCancel={() =>
                            window.clearTimeout(hold.current)
                          }
                          onPointerLeave={() =>
                            window.clearTimeout(hold.current)
                          }
                          onKeyDown={(e) => {
                            const steps: Record<string, number> = {
                              ArrowLeft: -1,
                              ArrowRight: 1,
                              ArrowUp: -boardSettings.width,
                              ArrowDown: boardSettings.width,
                            };
                            if (steps[e.key] !== undefined) {
                              e.preventDefault();
                              const next = Math.max(
                                0,
                                Math.min(
                                  boardSettings.width * boardSettings.height -
                                    1,
                                  i + steps[e.key],
                                ),
                              );
                              setFocus(next);
                              cells.current[next]?.focus();
                            } else if (e.key.toLowerCase() === "f") {
                              e.preventDefault();
                              if (round) act(i, "flag");
                            } else if (e.key.toLowerCase() === "c") {
                              e.preventDefault();
                              if (round) act(i, "chord");
                            }
                          }}
                        >
                          {mine ? (
                            "✹"
                          ) : flagged ? (
                            "⚑"
                          ) : opened ? (
                            number || ""
                          ) : (
                            <span className="mine-covered" aria-hidden="true">
                              ·
                            </span>
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
              <div className="board-game-actions">
                <button
                  aria-pressed={flagMode}
                  disabled={!round || !!active?.over}
                  onClick={() => setFlagMode(!flagMode)}
                >
                  {flagMode ? "Flag mode" : "Dig mode"}
                </button>
                <button
                  disabled={!round || !!active?.over}
                  onClick={() => {
                    if (!round) return;
                    const i = safeMineReveal(round);
                    if (i === null) {
                      setNotice(
                        "No unflagged safe cell is available. Review your flags.",
                      );
                      return;
                    }
                    setRound({
                      ...round,
                      assisted: true,
                      state: playMines(round.state, {
                        type: "reveal",
                        index: i,
                      }),
                    });
                    setFocus(i);
                    cells.current[i]?.focus();
                    setNotice(
                      "Guaranteed-safe cell revealed using the mine map. Assisted round.",
                    );
                  }}
                >
                  Safe reveal (assisted)
                </button>
                <button
                  onClick={() => start(fresh(boardSettings, !!request.day))}
                >
                  New board
                </button>
              </div>
              <label className="mines-size">
                Cell size
                <select
                  aria-label="Cell size"
                  value={cellSize}
                  onChange={(e) => setCellSize(Number(e.target.value))}
                >
                  <option value="36">Compact 36px</option>
                  <option value="44">Standard 44px</option>
                  <option value="56">Large 56px</option>
                </select>
              </label>
              <p role="status">{notice}</p>
              <p className="mines-proof">
                {round
                  ? round.state.board.certified
                    ? "No-guess proof passed for this opening using single-number and subset deductions."
                    : "Random board: no no-guess certification."
                  : "Mine placement waits for your first reveal."}
              </p>
              {active?.over && round && (
                <div className="board-game-result">
                  <h2>
                    {active.won ? "Field cleared." : "A mine was revealed."}
                  </h2>
                  {!active.won && !round.finalized && !round.recovered ? (
                    <>
                      <p>
                        This loss is waiting for your choice. One second chance
                        restores the entire last action, including a chord. It
                        marks the round assisted.
                      </p>
                      <button
                        onClick={() => {
                          setRound(recoverMineRound(round));
                          setNotice(
                            "Last action restored. Second chance used; assisted round.",
                          );
                        }}
                      >
                        Take second chance (assisted)
                      </button>
                      <button onClick={() => finish(round)}>
                        Finish round
                      </button>
                    </>
                  ) : !active.won && !round.finalized ? (
                    <button onClick={() => finish(round)}>Finish round</button>
                  ) : (
                    <p>
                      {round.assisted ? "Assisted" : "Unassisted"}{" "}
                      {active.won ? "win" : "loss"} recorded locally.
                    </p>
                  )}
                  <Link to="/blog/minesweeper-safe-moves-flags-and-subsets">
                    Review the deduction patterns →
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      )}
      <section className="board-game-records">
        <h2>Your Minesweeper records</h2>
        <p>
          Wins {records.wins} · Losses {records.losses} · Unassisted wins{" "}
          {records.unassistedWins} · Assisted wins {records.assistedWins}. All
          board sizes and random/proven modes included. Losses count after
          Finish round or choosing a new board. Browser-only records; no timer
          record collected.
        </p>
      </section>
      <section className="board-game-rules">
        <h2>Read the neighbours</h2>
        <p>
          A number counts mines in the eight neighbouring cells, including
          diagonals. Reveal every safe cell to win; flags are your assertions.
          Chording reveals unflagged neighbours when the flag count matches the
          number. Incorrect flags can therefore reveal a mine.
        </p>
        <p>
          No-guess certification proves a completion from the generated opening
          using single-number and subset rules. It does not stop you making a
          mistaken flag or reveal. Safe reveal uses hidden mine information and
          is labelled assisted. One second chance restores the full losing
          action. Daily wins advance the local streak only on that board’s date.
        </p>
        <Link to="/blog/minesweeper-safe-moves-flags-and-subsets">
          See verified deduction examples →
        </Link>
      </section>
    </main>
  );
}
