import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { pourColour, colourMoves } from "../utils/colourSortEngine";
import {
  readColourRound,
  encodeColourRound,
  colourSaveKey,
  moveColourRound,
  undoColourRound,
  hintColourRound,
} from "../utils/colourSortSession";
import type { ColourRound } from "../utils/colourSortSession";
import {
  readColourRecords,
  writeColourRecords,
  recordColourResult,
  colourStreak,
} from "../utils/colourSortRecords";
import "./BoardGame.css";
import "./ColourSort.css";
const names = ["Coral", "Blue", "Gold", "Violet", "Green", "Rose", "Teal"];
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export default function ColourSort() {
  const location = useLocation(),
    navigate = useNavigate(),
    setup = location.pathname.replace(/\/+$/, "") === "/colour-sort-setup";
  const [round, setRound] = useState<ColourRound | null>(readColourRound),
    [size, setSize] = useState(3),
    [saved, setSaved] = useState(readColourRound),
    [records, setRecords] = useState(readColourRecords);
  const [source, setSource] = useState<number | null>(null),
    [destination, setDestination] = useState<number | null>(null),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const worker = useRef<Worker | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    initial = useRef(false),
    tubeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  function stop() {
    worker.current?.terminate();
    worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }
  function generate(
    colours: number,
    daily = false,
    seedOverride?: string,
    dayOverride?: string,
  ) {
    stop();
    setBusy(true);
    setError("");
    setNotice("");
    setSource(null);
    setDestination(null);
    const id = crypto.randomUUID(),
      day = daily ? dayOverride || today() : null,
      seed = seedOverride || (day ? `daily:${day}` : id);
    let w: Worker;
    try {
      w = new Worker(
        new URL("../workers/colourSort.worker.ts", import.meta.url),
        { type: "module" },
      );
    } catch {
      setBusy(false);
      setError(
        "Puzzle worker could not start in this browser. Try reloading or another browser.",
      );
      return;
    }
    worker.current = w;
    const fail = (message: string) => {
      stop();
      setBusy(false);
      setError(message);
    };
    timer.current = setTimeout(
      () => fail("Generation exceeded its time budget. Try another board."),
      10000,
    );
    w.onerror = () => fail("Puzzle worker failed. Please try another board.");
    w.onmessage = (
      e: MessageEvent<{ round?: ColourRound; error?: string }>,
    ) => {
      if (worker.current !== w) return;
      if (!e.data.round) {
        fail(e.data.error || "No verified puzzle found. Try another board.");
        return;
      }
      const next = e.data.round;
      stop();
      setRound(next);
      setBusy(false);
      try {
        localStorage.setItem(colourSaveKey, encodeColourRound(next));
      } catch {
        /* Optional. */
      }
      navigate("/colour-sort");
    };
    w.postMessage({ seed, colours, id, day });
  }
  useEffect(() => {
    if (setup) {
      setSaved(readColourRound());
      setRecords(readColourRecords());
    } else if (!round && !initial.current) {
      initial.current = true;
      generate(3);
    }
  }, [setup]);
  useEffect(
    () => () => {
      stop();
      initial.current = false;
    },
    [],
  );
  useEffect(() => {
    if (setup || !round) return;
    try {
      localStorage.setItem("dostrike-last-pick", "colour-sort");
      localStorage.setItem(colourSaveKey, encodeColourRound(round));
    } catch {
      /* Optional. */
    }
    const next = recordColourResult(readColourRecords(), round, today());
    writeColourRecords(next);
    setRecords(next);
  }, [setup, round]);
  const preview =
    round && source !== null && destination !== null
      ? pourColour(round.game.board, source, destination)
      : null;
  function choose(index: number) {
    if (!round || round.game.solved) return;
    if (source === null) {
      if (!round.game.board[index].length) {
        setNotice("Choose a nonempty source tube.");
        return;
      }
      setSource(index);
      setDestination(null);
      setNotice(`Tube ${index + 1} selected. Choose a destination.`);
    } else if (index === source) {
      setSource(null);
      setDestination(null);
      setNotice("Selection cancelled.");
    } else {
      setDestination(index);
      const p = pourColour(round.game.board, source, index);
      setNotice(
        p
          ? `Preview: pour ${p.amount} of colour ${p.colour} (${names[p.colour - 1]}) from tube ${source + 1} to ${index + 1}. Confirm to commit.`
          : "That pour is illegal: choose an empty tube or the same top colour with free space.",
      );
    }
  }
  function confirm() {
    if (!round || source === null || destination === null || !preview) return;
    setRound(moveColourRound(round, { from: source, to: destination }));
    setNotice(
      `Poured ${preview.amount} of colour ${preview.colour} from tube ${source + 1} to ${destination + 1}.`,
    );
    tubeRefs.current[destination]?.focus();
    setSource(null);
    setDestination(null);
  }
  const stuck =
    round && !round.game.solved && !colourMoves(round.game.board).length;
  return (
    <main className="board-game-page colour-page">
      <Helmet>
        <title>
          {setup
            ? "Colour Sort: verified tube puzzles and daily play"
            : "Colour Sort game"}{" "}
          | DoStrike
        </title>
        <meta
          name="description"
          content="Sort numbered colours into matching tubes. Play reproducibly solvable puzzles with preview, keyboard controls, exact undo, saved rounds and a shared daily."
        />
        <link
          rel="canonical"
          href={`https://dostrike.com${setup ? "/colour-sort-setup" : "/colour-sort"}`}
        />
        {!setup && <meta name="robots" content="noindex" />}
      </Helmet>
      <div className="board-game-top">
        <Link to="/">← All games</Link>
        <Link to="/blog/colour-sort-runs-space-and-recovery">
          Learn the pours ↗
        </Link>
      </div>
      <header className="board-game-heading">
        <p className="board-game-eyebrow">ONE COLOUR. A LITTLE ROOM TO MOVE.</p>
        <h1>Colour Sort</h1>
        <p>
          Sort the tubes.
          <br />
          Leave yourself a way back.
        </p>
      </header>
      {setup && !busy && (
        <>
          <section className="board-game-setup">
            <h2>Make room for the next pour.</h2>
            {saved && (
              <button
                className="board-game-primary"
                onClick={() => {
                  setRound(saved);
                  setSource(null);
                  setDestination(null);
                  navigate("/colour-sort");
                }}
              >
                Continue saved puzzle →
              </button>
            )}
            <fieldset>
              <legend>How many colours?</legend>
              <div className="board-game-actions">
                {[3, 5, 7].map((n) => (
                  <button
                    key={n}
                    aria-pressed={size === n}
                    onClick={() => setSize(n)}
                  >
                    {n} colours
                  </button>
                ))}
              </div>
            </fieldset>
            <p>
              Four units per tube, two empty tubes. These are board sizes, not
              guaranteed difficulty ratings. Every starting board has a verified
              solution.
            </p>
            <button
              className="board-game-primary"
              onClick={() => generate(size)}
            >
              Start sorting ↗
            </button>
            <p>
              Preview before committing. Undo and certificate-backed hints are
              free and labelled assisted.
            </p>
          </section>
          <section className="board-game-daily">
            <p className="board-game-eyebrow">TODAY’S BOARD · {today()}</p>
            <h2>The same tubes. Your own solution.</h2>
            <p>
              A date-seeded five-colour puzzle. Solve on its date to advance
              your local streak. Streak {colourStreak(records, today())} · best{" "}
              {records.bestStreak}.
            </p>
            <button onClick={() => generate(5, true)}>
              Play today’s board →
            </button>
          </section>
        </>
      )}
      {busy && (
        <section className="board-game-setup" aria-busy="true">
          <h2>Checking a solvable board…</h2>
          <p role="status">
            Generating a seeded puzzle and replaying its solution certificate.
          </p>
          <button
            onClick={() => {
              stop();
              setBusy(false);
              setError(
                "Generation cancelled. Choose another puzzle when ready.",
              );
            }}
          >
            Cancel generation
          </button>
        </section>
      )}
      {error && (
        <section className="board-game-setup">
          <p role="alert">{error}</p>
          <button onClick={() => generate(size)}>Try a fresh puzzle</button>
          <Link to="/colour-sort-setup">Choose setup</Link>
        </section>
      )}
      {!setup && !busy && round && (
        <section aria-label="Colour Sort game">
          <div className="colour-topline">
            <span>
              {round.day
                ? `Daily · ${round.day}`
                : `${round.game.puzzle.colours} colours`}
              {round.assisted ? " · Assisted" : ""}
            </span>
            <Link to="/colour-sort-setup">Change setup</Link>
          </div>
          <p className="colour-score">
            {round.game.moves.length} pours ·{" "}
            {round.game.solved
              ? "Sorted!"
              : source === null
                ? "Choose a source tube."
                : "Choose a destination, then confirm."}
          </p>
          <p id="colour-help">
            Tubes are listed bottom to top. Numbers identify colours. Tab
            between tubes; Enter or Space selects. Arrow keys move focus. Escape
            cancels; Enter on a previewed destination confirms.
          </p>
          <div
            className="colour-tubes"
            role="group"
            aria-label="Colour tubes"
            aria-describedby="colour-help"
          >
            {round.game.board.map((tube, i) => (
              <button
                key={i}
                ref={(el) => {
                  tubeRefs.current[i] = el;
                }}
                className={`colour-tube ${source === i ? "is-source" : ""} ${destination === i ? "is-destination" : ""}`}
                aria-pressed={source === i || destination === i}
                aria-label={`Tube ${i + 1}, bottom to top: ${tube.length ? tube.map((c) => `${c} ${names[c - 1]}`).join(", ") : "empty"}. ${4 - tube.length} spaces.`}
                disabled={round.game.solved}
                onClick={() => choose(i)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSource(null);
                    setDestination(null);
                    setNotice("Selection cancelled.");
                  } else if (
                    [
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                    tubeRefs.current[
                      (i +
                        (["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 1) +
                        round.game.board.length) %
                        round.game.board.length
                    ]?.focus();
                  } else if (
                    e.key === "Enter" &&
                    destination === i &&
                    preview
                  ) {
                    e.preventDefault();
                    confirm();
                  }
                }}
              >
                <span className="colour-vessel" aria-hidden="true">
                  {[3, 2, 1, 0].map((level) => (
                    <span
                      key={level}
                      className={`colour-unit colour-${tube[level] || 0}`}
                    >
                      {tube[level] || ""}
                    </span>
                  ))}
                </span>
                <span className="colour-tube-number" aria-hidden="true">
                  Tube {i + 1}
                </span>
              </button>
            ))}
          </div>
          <p role="status" className="colour-notice">
            {notice}
          </p>
          {preview && (
            <div className="colour-preview">
              <p>
                Pour {preview.amount} of colour {preview.colour}: tube{" "}
                {source! + 1} → {destination! + 1}.
              </p>
              <button className="board-game-primary" onClick={confirm}>
                Confirm pour
              </button>
            </div>
          )}
          <div className="board-game-actions">
            <button
              disabled={source === null}
              onClick={() => {
                setSource(null);
                setDestination(null);
                setNotice("Selection cancelled.");
              }}
            >
              Cancel selection
            </button>
            <button
              disabled={!round.game.moves.length || round.game.solved}
              onClick={() => {
                setRound(undoColourRound(round));
                setSource(null);
                setDestination(null);
                setNotice("Previous board restored. This attempt is assisted.");
              }}
            >
              Undo (assisted)
            </button>
            <button
              disabled={round.game.solved}
              onClick={() => {
                const result = hintColourRound(round);
                setRound(result.round);
                if (result.move) {
                  setSource(result.move.from);
                  setDestination(result.move.to);
                  setNotice(
                    `Verified path hint: tube ${result.move.from + 1} to ${result.move.to + 1}. Confirm to pour. Attempt marked assisted.`,
                  );
                } else {
                  setSource(null);
                  setDestination(null);
                  setNotice(
                    "This board is outside the verified path. No hint is available here. Undo or restart to return to that path.",
                  );
                }
              }}
            >
              Show path hint (assisted)
            </button>
          </div>
          {stuck && (
            <p role="status">
              No legal pours remain. Undo or restart; your original puzzle has a
              verified solution.
            </p>
          )}
          {round.game.solved && (
            <div className="board-game-result">
              <h2>Every colour has a home.</h2>
              <p>
                Solved in {round.game.moves.length} pours ·{" "}
                {round.assisted ? "Assisted" : "Unassisted"}. Counted once for
                this attempt. Undo is closed after completion; restart creates a
                new attempt.
              </p>
            </div>
          )}
          <div className="board-game-actions">
            <button
              onClick={() =>
                generate(
                  round.game.puzzle.colours,
                  !!round.day,
                  round.game.puzzle.seed,
                  round.day || undefined,
                )
              }
            >
              Restart this puzzle
            </button>
            <button onClick={() => generate(round.game.puzzle.colours)}>
              New puzzle
            </button>
          </div>
        </section>
      )}
      <section className="board-game-records">
        <h2>Your Colour Sort records</h2>
        {[3, 5, 7].map((n) => (
          <p key={n}>
            {n} colours: {records.sizes[n].solves} solves ·{" "}
            {records.sizes[n].unassisted} unassisted ·{" "}
            {records.sizes[n].assisted} assisted · best unassisted{" "}
            {records.sizes[n].bestUnassisted ?? "—"} pours.
          </p>
        ))}
        <p>
          Recorded at completion, once per attempt; a restart is a new attempt.
          Bests compare different generated boards of the same size, not a
          leaderboard or shortest-solution claim. Browser-only records and saves
          can be lost when storage is cleared or unavailable.
        </p>
      </section>
      <section className="board-game-rules">
        <h2>Read the top. Keep some space.</h2>
        <p>
          A pour moves the largest possible run of one top colour into an empty
          tube or onto that same colour, up to four units. You cannot choose a
          smaller pour unless the destination’s remaining capacity limits it.
          Win with full single-colour tubes and two empties.
        </p>
        <p>
          Starting boards are reverse-generated, with every inverse verified
          under the actual forward rules and the full solution replayed. This
          proves a solution exists, not that every legal choice stays solvable
          or that the stored path is shortest. Hints only work on a board
          matching that verified path; undo and hints mark assistance.
        </p>
        <Link to="/blog/colour-sort-runs-space-and-recovery">
          Try the worked pour examples →
        </Link>
      </section>
    </main>
  );
}
