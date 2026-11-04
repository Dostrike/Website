import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { SlideDirection } from "../utils/slideMergeEngine";
import {
  newSlideRound,
  readSlideRound,
  moveSlideRound,
  undoSlideRound,
  encodeSlideRound,
  slideSaveKey,
} from "../utils/slideMergeSession";
import {
  readSlideRecords,
  recordSlideProgress,
  writeSlideRecords,
  slideStreak,
} from "../utils/slideMergeRecords";
import "./BoardGame.css";
import "./SlideMerge.css";

type Start = { seed: string; id: string; day: string | null };
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fresh = (daily = false): Start => {
  const id = crypto.randomUUID(),
    day = daily ? today() : null;
  return { id, seed: day ? `daily:${day}` : id, day };
};

export default function SlideMerge() {
  const location = useLocation(),
    navigate = useNavigate();
  const setup = location.pathname.replace(/\/+$/, "") === "/slide-merge-setup";
  const [round, setRound] = useState(() => {
    const saved = readSlideRound();
    if (saved) return saved;
    const start = (location.state as Start | null) || fresh();
    return newSlideRound(start.seed, start.id, start.day);
  });
  const [saved, setSaved] = useState(readSlideRound);
  const [records, setRecords] = useState(readSlideRecords);
  const [notice, setNotice] = useState("");
  const board = useRef<HTMLDivElement | null>(null);
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);
  const paused = round.game.won && !round.game.continued && !round.game.over;
  useEffect(() => {
    if (setup) {
      setSaved(readSlideRound());
      setRecords(readSlideRecords());
    }
  }, [setup]);
  useEffect(() => {
    if (!setup) board.current?.focus({ preventScroll: true });
  }, [setup]);
  useEffect(() => {
    if (setup) return;
    try {
      localStorage.setItem("dostrike-last-pick", "slide-merge");
      localStorage.setItem(slideSaveKey, encodeSlideRound(round));
    } catch {
      /* Optional persistence. */
    }
    const next = recordSlideProgress(readSlideRecords(), {
      id: round.id,
      played: round.played,
      target: round.reachedTarget,
      assisted: round.assisted,
      score: round.bestScore,
      tile: round.bestTile,
      day: round.day,
      today: today(),
    });
    setRecords(next);
    writeSlideRecords(next);
  }, [setup, round]);
  function start(next: Start) {
    try {
      localStorage.removeItem(slideSaveKey);
    } catch {
      /* Optional storage. */
    }
    setRound(newSlideRound(next.seed, next.id, next.day));
    setNotice("New board ready.");
    pointer.current = null;
    navigate("/slide-merge", { state: next });
  }
  function move(direction: SlideDirection) {
    const next = moveSlideRound(round, direction);
    if (next === round) {
      setNotice(
        round.game.over
          ? "No moves remain. Undo or start another board."
          : paused
            ? "Choose Continue to play beyond 2048, or undo."
            : "No tiles moved. No tile spawned and the random stream did not advance.",
      );
      return;
    }
    setRound(next);
    const spawn = next.game.lastSpawn!;
    setNotice(
      `${direction}. ${next.game.lastMerged.length ? `Pairs merged: ${next.game.lastMerged.length}. ` : ""}Score ${next.game.score}. New ${spawn.value} at row ${Math.floor(spawn.index / 4) + 1}, column ${(spawn.index % 4) + 1}.`,
    );
  }
  const status = round.game.over
    ? `No moves remain. Score ${round.game.score}.`
    : paused
      ? "2048 reached. Choose Continue or Undo."
      : `Score ${round.game.score} · largest tile ${Math.max(...round.game.board)}`;
  return (
    <main className="board-game-page slide-page">
      <Helmet>
        <title>
          {setup
            ? "Slide Merge: classic number sliding and daily boards"
            : "Slide Merge game"}{" "}
          | DoStrike
        </title>
        <meta
          name="description"
          content="Slide and merge equal numbers on a 4 by 4 board. Reach 2048, keep playing, undo without rerolling spawns and save your daily or regular round."
        />
        <link
          rel="canonical"
          href={`https://dostrike.com${setup ? "/slide-merge-setup" : "/slide-merge"}`}
        />
        <meta name="robots" content={setup ? "index,follow" : "noindex"} />
      </Helmet>
      <div className="slide-topline">
        <Link to="/">← All games</Link>
        <Link to="/blog/slide-merge-pairs-space-and-undo">
          Learn the patterns ↗
        </Link>
      </div>
      <header className="board-game-heading">
        <p className="board-game-eyebrow">
          MAKE A LITTLE SPACE. BUILD SOMETHING BIGGER.
        </p>
        <h1>Slide Merge</h1>
        <p>
          A familiar number puzzle.
          <br />
          One more space can change the board.
        </p>
      </header>
      {setup ? (
        <>
          <section className="board-game-setup">
            <h2>Start small. Keep building.</h2>
            {saved && (
              <button
                onClick={() => {
                  setRound(saved);
                  setNotice("Saved board restored.");
                  navigate("/slide-merge");
                }}
              >
                Resume round →
              </button>
            )}
            <p>
              Classic 4×4. Equal neighbouring tiles merge once per move. Merged
              values add to your score. Reach 2048, then choose whether to
              continue.
            </p>
            <button
              className="board-game-primary"
              onClick={() => start(fresh())}
            >
              Start playing ↗
            </button>
            <p>
              Free undo restores the exact spawn stream and marks the round
              assisted. No account or timer.
            </p>
          </section>
          <section className="board-game-daily">
            <p className="board-game-eyebrow">TODAY’S BOARD · {today()}</p>
            <h2>The same start. Your own path.</h2>
            <p>
              A date-seeded initial board and random stream. Your moves shape
              what follows. Reach 2048 today to advance the local streak; it is
              not a single-answer puzzle or a guaranteed win.
            </p>
            <p>
              Daily streak {slideStreak(records, today())} · Best{" "}
              {records.bestStreak}
            </p>
            <button onClick={() => start(fresh(true))}>
              Play today’s board →
            </button>
          </section>
        </>
      ) : (
        <section aria-label="Slide Merge game">
          <div className="board-game-match-info">
            <span>
              {round.day ? `Daily · ${round.day}` : "Classic 4×4"}
              {round.assisted ? " · assisted" : ""}
            </span>
            <Link to="/slide-merge-setup">Change setup</Link>
          </div>
          <h2 className="slide-status" role="status">
            {status}
          </h2>
          <div className="slide-scores">
            <span>
              Score<strong>{round.game.score}</strong>
            </span>
            <span>
              Browser best
              <strong>{Math.max(records.bestScore, round.bestScore)}</strong>
            </span>
          </div>
          <p id="slide-help">
            Focus the board for arrows or WASD. Swipe on the board, or use the
            direction buttons. Equal tiles merge once per move.
          </p>
          {paused && (
            <button
              className="slide-continue board-game-primary"
              onClick={() => {
                setRound(moveSlideRound(round, "continue"));
                setNotice(
                  "Continuing beyond 2048. This remains the same round.",
                );
                board.current?.focus();
              }}
            >
              Continue beyond 2048
            </button>
          )}
          <div
            ref={board}
            className="slide-board"
            role="group"
            tabIndex={0}
            aria-label="Slide Merge board"
            aria-describedby="slide-help"
            onKeyDown={(e) => {
              if (e.altKey || e.ctrlKey || e.metaKey) return;
              const dirs: Record<string, SlideDirection> = {
                arrowleft: "left",
                arrowright: "right",
                arrowup: "up",
                arrowdown: "down",
                a: "left",
                d: "right",
                w: "up",
                s: "down",
              };
              const direction = dirs[e.key.toLowerCase()];
              if (direction) {
                e.preventDefault();
                move(direction);
              }
            }}
            onPointerDown={(e) => {
              pointer.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
              e.currentTarget.setPointerCapture(e.pointerId);
              e.currentTarget.focus();
            }}
            onPointerUp={(e) => {
              const origin = pointer.current;
              pointer.current = null;
              if (!origin || origin.id !== e.pointerId) return;
              const dx = e.clientX - origin.x,
                dy = e.clientY - origin.y;
              if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
              move(
                Math.abs(dx) >= Math.abs(dy)
                  ? dx > 0
                    ? "right"
                    : "left"
                  : dy > 0
                    ? "down"
                    : "up",
              );
            }}
            onPointerCancel={() => {
              pointer.current = null;
            }}
          >
            {round.game.board.map((value, i) => (
              <div
                key={i}
                role="img"
                aria-label={`Row ${Math.floor(i / 4) + 1}, column ${(i % 4) + 1}, ${value || "empty"}`}
                className={`slide-tile ${value ? "filled" : ""} value-${value <= 2048 ? value : "high"} ${round.game.lastMerged.includes(i) ? "merged" : ""} ${round.game.lastSpawn?.index === i ? "spawned" : ""}`}
              >
                <span aria-hidden="true">{value || ""}</span>
              </div>
            ))}
          </div>
          <div
            className="slide-directions"
            role="group"
            aria-label="Move tiles"
          >
            {(["up", "left", "down", "right"] as const).map((direction) => (
              <button
                key={direction}
                aria-label={`Move ${direction}`}
                className={`direction-${direction}`}
                disabled={round.game.over || paused}
                onClick={() => {
                  move(direction);
                  board.current?.focus();
                }}
              >
                <span aria-hidden="true">
                  {{ up: "↑", left: "←", down: "↓", right: "→" }[direction]}
                </span>
              </button>
            ))}
          </div>
          <div className="board-game-actions">
            <button
              disabled={!round.game.actions.length}
              onClick={() => {
                setRound(undoSlideRound(round));
                setNotice(
                  "Previous board, score and random stream restored. Repeating that move gives the same spawn. Round marked assisted.",
                );
                board.current?.focus();
              }}
            >
              Undo (assisted)
            </button>
            <button onClick={() => start(fresh())}>New board</button>
            {round.day && (
              <button onClick={() => start(fresh(true))}>Restart daily</button>
            )}
          </div>
          <p role="status">{notice}</p>
          {round.game.over && (
            <div className="board-game-result">
              <h2>
                {round.reachedTarget
                  ? "A 2048 round, finished."
                  : "No space left to slide."}
              </h2>
              <p>
                Score {round.game.score}; largest tile on this board{" "}
                {Math.max(...round.game.board)}. Your best score and largest
                tile reached earlier in the round remain recorded even after
                undo.
              </p>
              <button onClick={() => start(fresh())}>Play again</button>
              <Link to="/blog/slide-merge-pairs-space-and-undo">
                Review the space-and-pairs examples →
              </Link>
            </div>
          )}
        </section>
      )}
      <section className="board-game-records">
        <h2>Your Slide Merge records</h2>
        <p>
          Rounds played {records.rounds} · 2048 targets {records.targets} ·
          Unassisted targets {records.unassistedTargets} · Assisted targets{" "}
          {records.assistedTargets}
        </p>
        <p>
          Best score {records.bestScore} · Largest tile{" "}
          {records.bestTile || "—"}. A round counts after its first valid slide.
          Reaching 2048 counts once; continuing does not create a second round.
          Undo marks the whole round assisted, including an earlier target.
          Browser-only; no competitive ranking.
        </p>
      </section>
      <section className="board-game-rules">
        <h2>Make pairs. Keep space.</h2>
        <p>
          Every move slides all tiles to one edge. Equal neighbours merge in
          pairs, and a newly merged tile cannot merge again during that same
          move. Each changed board then receives one 2 or 4 tile; a move that
          changes nothing does not spawn or consume randomness.
        </p>
        <p>
          Two starting tiles and future spawns use a seeded stream: 2 has 90%
          weighting and 4 has 10%. Undo restores that stream. A full board is
          not over if a matching neighbouring pair can still merge. Reaching
          2048 is a milestone, with an explicit option to continue.
        </p>
        <p>
          The daily shares an initial board and random stream, not a required
          move sequence. Only targets reached on that board’s date advance the
          local streak. Stored progress can be lost if browser storage is
          cleared or unavailable.
        </p>
        <Link to="/blog/slide-merge-pairs-space-and-undo">
          Try the worked merge examples →
        </Link>
      </section>
    </main>
  );
}
