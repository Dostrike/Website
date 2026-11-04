import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  sudokuCandidates,
  sudokuConflicts,
  sudokuLogicalHint,
  type SudokuHint,
  type SudokuLevel,
} from "../utils/sudokuEngine";
import {
  editSudoku,
  undoSudoku,
  newSudokuRound,
  readSudokuRound,
  encodeSudokuRound,
  sudokuSessionKey,
  sudokuRoundComplete,
  type SudokuRound,
} from "../utils/sudokuSession";
import {
  readSudokuRecords,
  recordSudoku,
  writeSudokuRecords,
  sudokuStreak,
} from "../utils/sudokuRecords";
import "./BoardGame.css";
import "./Sudoku.css";
type Request = {
  seed: string;
  level: SudokuLevel;
  day: string | null;
  id: string;
};
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fresh = (level: SudokuLevel = "medium", daily = false): Request => {
  const id = crypto.randomUUID(),
    day = daily ? today() : null;
  return {
    seed: day ? `daily:${day}` : id,
    level: day ? "medium" : level,
    day,
    id,
  };
};
export default function Sudoku() {
  const location = useLocation(),
    navigate = useNavigate(),
    setup = location.pathname.replace(/\/+$/, "") === "/sudoku-setup";
  const [loaded] = useState(readSudokuRound),
    [saved, setSaved] = useState(readSudokuRound),
    [round, setRound] = useState<SudokuRound | null>(loaded),
    [request, setRequest] = useState<Request>(
      () => (location.state as Request | null) || fresh(),
    );
  const [level, setLevel] = useState<SudokuLevel>("medium"),
    [selected, setSelected] = useState(0),
    [notesMode, setNotesMode] = useState(false),
    [hint, setHint] = useState<SudokuHint | null>(null),
    [notice, setNotice] = useState(""),
    [failure, setFailure] = useState(""),
    [records, setRecords] = useState(readSudokuRecords);
  const cells = useRef<(HTMLButtonElement | null)[]>([]),
    recorded = useRef("");
  const complete = !!round && sudokuRoundComplete(round),
    conflicts = useMemo(
      () => (round ? sudokuConflicts(round.values) : []),
      [round],
    );
  useEffect(() => {
    if (setup) {
      setSaved(readSudokuRound());
      setRecords(readSudokuRecords());
    }
  }, [setup]);
  useEffect(() => {
    if (setup || round) return;
    let cancelled = false,
      worker: Worker | null = null;
    setFailure("");
    const timeout = window.setTimeout(() => {
      worker?.terminate();
      if (!cancelled)
        setFailure(
          "Generation timed out. Please retry or choose another puzzle.",
        );
    }, 10000);
    try {
      worker = new Worker(
        new URL("../workers/sudoku.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.onmessage = (e) => {
        if (cancelled) return;
        window.clearTimeout(timeout);
        if (e.data.puzzle) {
          setRound(newSudokuRound(e.data.puzzle, request.id, request.day));
          setNotice("Your unique-solution board is ready.");
        } else setFailure(e.data.error || "Generation failed. Please retry.");
        worker?.terminate();
      };
      worker.onerror = () => {
        if (!cancelled) {
          window.clearTimeout(timeout);
          setFailure("Generation worker unavailable. Please retry.");
        }
        worker?.terminate();
      };
      worker.postMessage({ seed: request.seed, level: request.level });
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
      localStorage.setItem("dostrike-last-pick", "sudoku");
      if (complete) localStorage.removeItem(sudokuSessionKey);
      else localStorage.setItem(sudokuSessionKey, encodeSudokuRound(round));
    } catch {
      /* Play remains available. */
    }
  }, [setup, round, complete]);
  useEffect(() => {
    if (setup || !complete || !round || recorded.current === round.id) return;
    recorded.current = round.id;
    const next = recordSudoku(
      readSudokuRecords(),
      round.id,
      round.assisted,
      round.day,
      today(),
    );
    setRecords(next);
    writeSudokuRecords(next);
  }, [complete, round, setup]);
  function start(next: Request) {
    try {
      localStorage.removeItem(sudokuSessionKey);
    } catch {
      /* Optional storage. */
    }
    setRound(null);
    setRequest(next);
    setHint(null);
    setNotice("");
    setFailure("");
    setSelected(0);
    setNotesMode(false);
    navigate("/sudoku", { state: next });
  }
  function enter(digit: number) {
    if (!round || complete) return;
    const next = editSudoku(round, selected, digit, notesMode);
    setRound(next);
    setHint(null);
    if (next === round)
      setNotice(
        round.puzzle.givens[selected]
          ? "That digit is a fixed clue. Choose an empty or editable cell."
          : "No change.",
      );
    else
      setNotice(
        `${notesMode && digit ? "Note" : "Value"} ${digit || "cleared"} at row ${Math.floor(selected / 9) + 1}, column ${(selected % 9) + 1}.`,
      );
  }
  function askHint() {
    if (!round || complete) return;
    setRound({ ...round, assisted: true });
    setHint(null);
    if (conflicts.length) {
      setNotice(
        "Correct the marked duplicate entries before asking for a deduction.",
      );
      return;
    }
    if (round.values.some((v, i) => v && v !== round.puzzle.solution[i])) {
      setNotice(
        "At least one current entry disagrees with this puzzle’s solution. Clear uncertain entries before a logical hint, or select an editable cell for an explicit answer reveal.",
      );
      return;
    }
    const next = sudokuLogicalHint(round.values);
    setHint(next);
    if (!next) {
      setNotice(
        "No single-candidate or only-place deduction is available. Try another technique, or select a cell and explicitly reveal its answer.",
      );
      return;
    }
    setSelected(next.index);
    cells.current[next.index]?.focus();
    const unit = next.unit.length
      ? next.unit.every(
          (i) => Math.floor(i / 9) === Math.floor(next.unit[0] / 9),
        )
        ? "row"
        : next.unit.every((i) => i % 9 === next.unit[0] % 9)
          ? "column"
          : "box"
      : "";
    setNotice(
      next.technique === "single-candidate"
        ? `Row ${Math.floor(next.index / 9) + 1}, column ${(next.index % 9) + 1}: ${next.digit} is the only candidate left after checking its row, column and box.`
        : `Only place: ${next.digit} can go in only this cell within the highlighted ${unit}.`,
    );
  }
  const chosen = round?.values[selected] || 0,
    candidates =
      round && !chosen ? sudokuCandidates(round.values, selected) : [];
  return (
    <main className="board-game-page sudoku-page">
      <Helmet>
        <title>
          {setup
            ? "Sudoku: unique puzzles, notes and daily play"
            : "Sudoku game"}{" "}
          | DoStrike
        </title>
        <meta
          name="description"
          content="Play independently generated classic Sudoku with a verified unique solution. Use pencil notes, free undo and explained single hints, or solve the daily board."
        />
        <link
          rel="canonical"
          href={`https://dostrike.com${setup ? "/sudoku-setup" : "/sudoku"}`}
        />
        <meta name="robots" content={setup ? "index,follow" : "noindex"} />
      </Helmet>
      <div className="board-game-topline">
        <Link to="/">← All games</Link>
        <Link to="/blog/sudoku-candidates-singles-and-pencil-notes">
          Learn the patterns ↗
        </Link>
      </div>
      <header className="board-game-heading">
        <p className="board-game-eyebrow">ONE CELL. NINE POSSIBILITIES.</p>
        <h1>Sudoku</h1>
        <p>
          Make room for the only number that fits.
          <br />A unique solution, at your pace.
        </p>
      </header>
      {setup ? (
        <>
          <section className="board-game-setup">
            <h2>Choose your board.</h2>
            {saved && (
              <button
                onClick={() => {
                  setRound(saved);
                  setNotice("Saved puzzle restored.");
                  navigate("/sudoku");
                }}
              >
                Continue puzzle →
              </button>
            )}
            <fieldset>
              <legend>Clue density</legend>
              {(["easy", "medium", "hard"] as const).map((l) => (
                <button
                  key={l}
                  aria-pressed={level === l}
                  onClick={() => setLevel(l)}
                >
                  {l}
                </button>
              ))}
            </fieldset>
            <p>
              Targets: Easy 42, Medium 35, Hard 29 clues. Actual counts may be
              higher to preserve uniqueness. These labels describe clue density,
              not a calibrated technique rating.
            </p>
            <button
              className="board-game-primary"
              onClick={() => start(fresh(level))}
            >
              Start puzzle ↗
            </button>
            <p>
              Free notes, undo and explained hints. No timer or mistake limit.
            </p>
          </section>
          <section className="board-game-daily">
            <p className="board-game-eyebrow">TODAY’S BOARD · {today()}</p>
            <h2>A fresh place to start.</h2>
            <p>
              One website-generated Medium board for today, with exactly one
              solution.
            </p>
            <p>
              Daily streak {sudokuStreak(records, today())} · Best{" "}
              {records.best}
            </p>
            <button onClick={() => start(fresh("medium", true))}>
              Play today’s board →
            </button>
          </section>
        </>
      ) : !round ? (
        <section className="sudoku-loading">
          <p role="status">
            {failure || "Generating and verifying your unique-solution puzzle…"}
          </p>
          <button
            onClick={() => setRequest({ ...request, id: crypto.randomUUID() })}
          >
            Retry generation
          </button>
          <Link to="/sudoku-setup">Choose another board</Link>
        </section>
      ) : (
        <section aria-label="Sudoku game">
          <div className="board-game-match-info">
            <span>
              {round.day
                ? `Daily · ${round.day}`
                : `${round.puzzle.level} · ${round.puzzle.givens.filter(Boolean).length} clues`}
            </span>
            <Link to="/sudoku-setup">Change setup</Link>
          </div>
          <h2 className="sudoku-status" role="status">
            {complete
              ? "Puzzle complete. Every unit checks out."
              : `${round.values.filter(Boolean).length} of 81 filled${conflicts.length ? ` · ${conflicts.length} conflicting cells` : ""}`}
          </h2>
          <p id="sudoku-help">
            Choose a cell; enter 1–9 or use the keypad. Arrows move; Delete
            clears. ! marks a duplicate. Scroll the board on small screens.
          </p>
          <div className="sudoku-scroll">
            <div
              className="sudoku-board"
              role="group"
              aria-label="Sudoku board"
              aria-describedby="sudoku-help"
            >
              {round.values.map((value, i) => (
                <button
                  key={i}
                  ref={(el) => {
                    cells.current[i] = el;
                  }}
                  tabIndex={selected === i ? 0 : -1}
                  aria-label={`Row ${Math.floor(i / 9) + 1}, column ${(i % 9) + 1}, ${value || "empty"}${round.puzzle.givens[i] ? ", fixed clue" : ""}${round.notes[i].length ? `, notes ${round.notes[i].join(", ")}` : ""}${conflicts.includes(i) ? ", conflict" : ""}`}
                  aria-invalid={conflicts.includes(i) || undefined}
                  className={`sudoku-cell ${round.puzzle.givens[i] ? "given" : ""} ${selected === i ? "selected" : ""} ${conflicts.includes(i) ? "conflict" : ""} ${hint?.unit.includes(i) ? "hint-unit" : ""} ${i % 3 === 2 ? "box-right" : ""} ${Math.floor(i / 9) % 3 === 2 ? "box-bottom" : ""}`}
                  onFocus={() => setSelected(i)}
                  onClick={() => setSelected(i)}
                  onKeyDown={(e) => {
                    const steps: Record<string, number> = {
                      ArrowLeft: -1,
                      ArrowRight: 1,
                      ArrowUp: -9,
                      ArrowDown: 9,
                    };
                    if (steps[e.key] !== undefined) {
                      e.preventDefault();
                      const next = Math.max(0, Math.min(80, i + steps[e.key]));
                      setSelected(next);
                      cells.current[next]?.focus();
                    } else if (/^[1-9]$/.test(e.key)) {
                      e.preventDefault();
                      enter(Number(e.key));
                    } else if (["Delete", "Backspace", "0"].includes(e.key)) {
                      e.preventDefault();
                      enter(0);
                    }
                  }}
                >
                  {value ? (
                    <span>{value}</span>
                  ) : (
                    <span className="sudoku-notes" aria-hidden="true">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <small key={n}>
                          {round.notes[i].includes(n) ? n : ""}
                        </small>
                      ))}
                    </span>
                  )}
                  {conflicts.includes(i) && <b aria-hidden="true">!</b>}
                </button>
              ))}
            </div>
          </div>
          {!complete ? (
            <>
              <div
                className="sudoku-keypad"
                role="group"
                aria-label="Enter a digit"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    aria-label={`${notesMode ? "Toggle note" : "Enter"} ${n}`}
                    disabled={!!round.puzzle.givens[selected]}
                    onClick={() => enter(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="board-game-actions">
                <button
                  aria-pressed={notesMode}
                  onClick={() => setNotesMode(!notesMode)}
                >
                  Notes {notesMode ? "on" : "off"}
                </button>
                <button
                  disabled={!!round.puzzle.givens[selected]}
                  onClick={() => enter(0)}
                >
                  Erase
                </button>
                <button
                  disabled={!round.history.length}
                  onClick={() => {
                    setRound(undoSudoku(round));
                    setHint(null);
                    setNotice("Previous values and notes restored.");
                  }}
                >
                  Undo
                </button>
                <button onClick={askHint}>Explain a single</button>
                <button
                  onClick={() =>
                    start({
                      ...request,
                      seed: round.puzzle.seed,
                      level: round.puzzle.level,
                      day: round.day,
                      id: crypto.randomUUID(),
                    })
                  }
                >
                  Restart puzzle
                </button>
              </div>
              <p className="sudoku-selection">
                Row {Math.floor(selected / 9) + 1}, column {(selected % 9) + 1}
                {round.puzzle.givens[selected]
                  ? " · fixed clue"
                  : chosen
                    ? ` · entered ${chosen}`
                    : " · editable"}
                . Candidate lists are free assistance and count as assisted when
                requested below.
              </p>
              <button
                className="sudoku-assistance"
                onClick={() => {
                  setRound({ ...round, assisted: true });
                  setNotice(
                    `Current candidates for selected cell: ${candidates.join(", ") || "none"}. Candidates follow your current entries, not a check against the answer.`,
                  );
                }}
              >
                Check candidates (assisted)
              </button>
              <p role="status">{notice}</p>
              {hint && (
                <button
                  onClick={() => {
                    setRound({
                      ...editSudoku(round, hint.index, hint.digit),
                      assisted: true,
                    });
                    setHint(null);
                    setNotice("Explained digit placed.");
                  }}
                >
                  Place explained {hint.digit}
                </button>
              )}
              <details className="sudoku-reveal">
                <summary>Need an explicit answer reveal?</summary>
                <p>
                  This fills the selected editable cell from the known solution.
                  It is assistance, not a logical explanation.
                </p>
                <button
                  disabled={!!round.puzzle.givens[selected]}
                  onClick={() => {
                    setRound({
                      ...editSudoku(
                        round,
                        selected,
                        round.puzzle.solution[selected],
                      ),
                      assisted: true,
                    });
                    setHint(null);
                    setNotice(
                      "Selected answer revealed. This solve is marked assisted.",
                    );
                  }}
                >
                  Reveal selected answer (assisted)
                </button>
              </details>
            </>
          ) : (
            <div className="board-game-result">
              <h2>Well solved.</h2>
              <p>
                {round.assisted ? "Assisted solve" : "Unassisted solve"}{" "}
                recorded locally.{" "}
                {round.day && round.day !== today()
                  ? "This older daily does not advance today’s streak."
                  : ""}
              </p>
              <button onClick={() => start(fresh(round.puzzle.level))}>
                Play another puzzle
              </button>
              <Link to="/blog/sudoku-candidates-singles-and-pencil-notes">
                Review the solving patterns →
              </Link>
            </div>
          )}
        </section>
      )}
      <section className="board-game-records">
        <h2>Your Sudoku records</h2>
        <p>
          {records.solves} solved · {records.unassisted} unassisted ·{" "}
          {records.assisted} assisted. Browser-only, including free hints,
          candidate checks and answer reveals. Clearing browser data removes
          progress. No timer-based record is collected.
        </p>
      </section>
      <section className="board-game-rules">
        <h2>How classic Sudoku works</h2>
        <p>
          Fill each row, column and 3×3 box with digits 1–9 exactly once. Fixed
          clues stay in place. Each generated puzzle has one verified solution.
          Notes are your own marks and are not automatically cleaned when you
          edit another cell.
        </p>
        <p>
          Explain a single checks for a cell with one candidate or a digit with
          one available place in a unit. If neither is available, it says so.
          Free answer reveals are labelled separately. Records include
          assistance honestly; there are no competitive rankings.
        </p>
        <Link to="/blog/sudoku-candidates-singles-and-pencil-notes">
          Try the worked single examples →
        </Link>
      </section>
    </main>
  );
}
