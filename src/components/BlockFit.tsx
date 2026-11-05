import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BLOCK_SHAPES,
  blockAnchors,
  blockCells,
  blockHasMove,
  previewBlock,
} from "../utils/blockFitEngine";
import {
  actBlockRound,
  blockInitialRound,
  canUndoBlockRound,
  dailyBlockSeed,
  encodeBlockRound,
  newBlockRound,
  previewBlockRevive,
  previewBlockSwap,
  readBlockRound,
  restartBlockRound,
  writeBlockRound,
} from "../utils/blockFitSession";
import type { BlockAction, BlockRound } from "../utils/blockFitSession";
import {
  readBlockRecords,
  recordBlockResult,
  writeBlockRecords,
} from "../utils/blockFitRecords";
import type { BlockScoreRow } from "../utils/blockFitRecords";
import "./BoardGame.css";
import "./BlockFit.css";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const coord = (i: number) =>
  `row ${Math.floor(i / 8) + 1} column ${(i % 8) + 1}`;
const shapeNames = [
  "Single",
  "Pair across",
  "Pair down",
  "Three across",
  "Three down",
  "Southeast elbow",
  "Northeast elbow",
  "Northwest elbow",
  "Southwest elbow",
  "Square",
  "Four across",
  "Four down",
  "T down",
  "T up",
  "Step east",
  "Step west",
  "Five across",
  "Five down",
  "Cross",
  "Cup",
];
const shapeName = (shape: number) => shapeNames[shape];
function MiniPiece({ shape }: { shape: number }) {
  const cells = BLOCK_SHAPES[shape].cells,
    width = Math.max(...cells.map((c) => c[1])) + 1,
    height = Math.max(...cells.map((c) => c[0])) + 1;
  return (
    <span
      className="block-mini"
      aria-hidden="true"
      style={{
        gridTemplateColumns: `repeat(${width}, 20px)`,
        gridTemplateRows: `repeat(${height}, 20px)`,
      }}
    >
      {Array.from({ length: width * height }, (_, i) => (
        <i
          key={i}
          className={
            cells.some(([r, c]) => r * width + c === i)
              ? `block-ink-${shape % 5}`
              : "block-gap"
          }
        >
          {cells.some(([r, c]) => r * width + c === i) ? shape + 1 : ""}
        </i>
      ))}
    </span>
  );
}
const scoreText = (r: BlockScoreRow) =>
  `${r.games} completed · clean best ${r.cleanBest ?? "—"} · assisted best ${r.assistedBest ?? "—"} · ${r.assisted} assisted`;
export default function BlockFit() {
  const location = useLocation(),
    navigate = useNavigate(),
    setup = location.pathname.replace(/\/+$/, "") === "/block-fit-setup";
  const [round, setRound] = useState<BlockRound>(
    () =>
      blockInitialRound(location.state?.blockRound) ??
      newBlockRound(crypto.randomUUID(), crypto.randomUUID()),
  );
  const [saved, setSaved] = useState(readBlockRound),
    [records, setRecords] = useState(readBlockRecords);
  const recordRef = useRef(records);
  recordRef.current = records;
  const [slot, setSlot] = useState<number | null>(null),
    [anchor, setAnchor] = useState<number | null>(null),
    [phase, setPhase] = useState<"place" | "swap" | "revive">("place");
  const [focus, setFocus] = useState(0),
    [notice, setNotice] = useState(""),
    [storageError, setStorageError] = useState(false);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const shape = slot === null ? null : round.game.tray[slot];
  const legal = useMemo(
    () =>
      new Set(
        shape === null || shape === undefined
          ? []
          : blockAnchors(round.game.board, shape),
      ),
    [round.game.board, shape],
  );
  const placement = useMemo(
    () =>
      phase === "place" &&
      shape !== null &&
      shape !== undefined &&
      anchor !== null
        ? previewBlock(round.game.board, shape, anchor, round.game.combo)
        : null,
    [phase, shape, anchor, round.game],
  );
  const ghost =
    phase === "place" &&
    shape !== null &&
    shape !== undefined &&
    anchor !== null
      ? (blockCells(shape, anchor) ?? [])
      : [];
  const revive =
    phase === "revive" && anchor !== null
      ? previewBlockRevive(round, anchor)
      : null;
  const swapped = phase === "swap" ? previewBlockSwap(round) : null;
  const reviveAvailable = useMemo(
    () =>
      round.game.over &&
      !round.reviveUsed &&
      !round.finished &&
      Array.from({ length: 64 }, (_, i) => previewBlockRevive(round, i)).some(
        (p) => p && p.cleared.length && p.canMove,
      ),
    [round],
  );
  const cleared = new Set(placement?.cleared ?? revive?.cleared ?? []),
    ghosts = new Set(ghost),
    region = new Set(revive?.cells ?? []);
  function clearPreview() {
    setAnchor(null);
    setPhase("place");
  }
  function begin(day: string | null = null) {
    const next = newBlockRound(
      crypto.randomUUID(),
      day ? dailyBlockSeed(day) : crypto.randomUUID(),
      day,
    );
    writeBlockRound(next);
    setRound(next);
    setSlot(null);
    clearPreview();
    setNotice("");
    navigate("/block-fit", { state: { blockRound: encodeBlockRound(next) } });
  }
  function act(action: BlockAction) {
    const next = actBlockRound(round, action);
    if (next === round) {
      setNotice("That action is unavailable. Nothing changed.");
      return;
    }
    const points = next.game.score - round.game.score;
    setRound(next);
    setSlot(null);
    clearPreview();
    setNotice(
      action.type === "place"
        ? `Placed at ${coord(action.anchor)}. +${points} points${next.game.combo ? ` · clearing combo ${next.game.combo}` : ""}.${next.game.over ? " No remaining piece fits. Choose recovery or finish your score." : " Choose the next piece."}`
        : action.type === "undo"
          ? "Previous board restored. Assisted; used helper allowances stay consumed."
          : action.type === "swap"
            ? "Unused pieces replaced. Score, combo and ordinary tray index unchanged. Assisted."
            : action.type === "revive"
              ? "Selected area cleared without points. A piece fits again. Assisted."
              : "Run finished and score recorded here. Undo is closed.",
    );
  }
  function choose(nextSlot: number) {
    const s = round.game.tray[nextSlot];
    if (s === null || round.finished || round.game.over) return;
    setSlot(nextSlot);
    setPhase("place");
    setAnchor(null);
    const first = blockAnchors(round.game.board, s)[0];
    if (first !== undefined) {
      setFocus(first);
      buttons.current[first]?.focus();
    }
    setNotice(
      `Piece ${nextSlot + 1}: ${shapeName(s)}. Choose a bounding-box anchor; shapes never rotate. ${first === undefined ? "This piece has no legal anchor; try another piece." : "Marked anchors are legal."}`,
    );
  }
  function select(cell: number) {
    if (round.finished || phase === "swap") return;
    if (phase === "revive") {
      const p = previewBlockRevive(round, cell);
      if (anchor === cell && p?.cleared.length && p.canMove)
        act({ type: "revive", anchor: cell });
      else {
        setAnchor(cell);
        setNotice(
          "Revive preview only. Confirm to clear a recoverable area; Escape cancels.",
        );
      }
      return;
    }
    if (round.game.over) {
      setNotice(
        "No piece fits. Choose Undo, an available recovery helper, or finish the score.",
      );
      return;
    }
    if (shape === null || shape === undefined || slot === null) {
      setNotice("Choose an unused tray piece first.");
      return;
    }
    const p = previewBlock(round.game.board, shape, cell, round.game.combo);
    if (anchor === cell && p) act({ type: "place", slot, anchor: cell });
    else {
      setAnchor(cell);
      setNotice(
        p
          ? `Preview only: ${p.rows.length + p.columns.length} lines, +${p.points} points. Confirm or activate this anchor again.`
          : "This anchor overlaps a block or crosses the boundary. No piece used; choose another anchor.",
      );
    }
  }
  function key(event: KeyboardEvent<HTMLButtonElement>, cell: number) {
    if (event.key === "Escape") {
      clearPreview();
      setNotice("Preview cancelled. Nothing used or scored.");
      return;
    }
    let next = cell;
    if (event.key === "ArrowLeft") next = cell % 8 ? cell - 1 : cell;
    else if (event.key === "ArrowRight") next = cell % 8 < 7 ? cell + 1 : cell;
    else if (event.key === "ArrowUp") next = cell >= 8 ? cell - 8 : cell;
    else if (event.key === "ArrowDown") next = cell < 56 ? cell + 8 : cell;
    else if (event.key === "Home") next = event.ctrlKey ? 0 : cell - (cell % 8);
    else if (event.key === "End")
      next = event.ctrlKey ? 63 : cell - (cell % 8) + 7;
    else return;
    event.preventDefault();
    setFocus(next);
    buttons.current[next]?.focus();
  }
  useEffect(() => {
    if (setup) {
      setSaved(readBlockRound());
      setRecords(readBlockRecords());
    }
  }, [setup]);
  useEffect(() => {
    if (location.state?.blockRound)
      navigate(location.pathname, { replace: true, state: null });
  }, [location.state?.blockRound]);
  useEffect(() => {
    if (setup) return;
    const savedOK = writeBlockRound(round),
      next = recordBlockResult(recordRef.current, round);
    recordRef.current = next;
    setRecords(next);
    const recordsOK = writeBlockRecords(next);
    setStorageError(!savedOK || !recordsOK);
    try {
      localStorage.setItem("dostrike-last-pick", "block-fit");
    } catch {
      /* Optional preference. */
    }
  }, [setup, round]);
  return (
    <main
      className={`board-game-page block-page ${setup ? "" : "block-playing"}`}
    >
      <Helmet>
        <title>
          {setup ? "Block Fit: place, clear and make space" : "Block Fit game"}{" "}
          | DoStrike
        </title>
        <meta
          name="description"
          content="Fit fixed shapes on an 8 by 8 board, clear rows and columns together, and build a combo. Preview placements, save your run and try the daily piece stream."
        />
        <link
          rel="canonical"
          href={`https://dostrike.com${setup ? "/block-fit-setup" : "/block-fit"}`}
        />
        {!setup && <meta name="robots" content="noindex,follow" />}
      </Helmet>
      <div className="board-game-top">
        <Link to="/">← All games</Link>
        <Link to="/blog/block-fit-piece-order-lines-and-combos">
          Learn piece order and clears ↗
        </Link>
      </div>
      <header className="board-game-heading">
        <span className="board-game-eyebrow">
          MAKE ROOM FOR THE NEXT SHAPE.
        </span>
        <h1>Block Fit</h1>
        <p>
          Three pieces.
          <br />A little space to think.
        </p>
      </header>
      {setup ? (
        <section className="board-game-setup" aria-label="Block Fit setup">
          {saved && (
            <div className="block-saved">
              <h2>A run is saved here</h2>
              <p>
                {saved.day ? `Daily ${saved.day}` : "Classic"} · score{" "}
                {saved.game.score} ·{" "}
                {saved.finished
                  ? "finished"
                  : saved.game.over
                    ? "recovery decision pending"
                    : "in progress"}{" "}
                · {saved.assisted ? "assisted" : "clean"}
              </p>
              <button
                onClick={() =>
                  navigate("/block-fit", {
                    state: { blockRound: encodeBlockRound(saved) },
                  })
                }
              >
                Continue saved run
              </button>
            </div>
          )}
          <h2>Your next clear starts here</h2>
          <p>
            Place fixed shapes on an 8 by 8 grid. Use all three tray pieces in
            any order, then receive another tray. Full rows and columns clear
            simultaneously; shapes never rotate.
          </p>
          <p>
            Score one point per placed cell, plus 10 × lines × clearing combo.
            Consecutive clearing placements raise the combo to five; a
            non-clearing placement resets it.
          </p>
          <button className="board-game-primary" onClick={() => begin()}>
            Start Classic
          </button>
          <div className="block-daily">
            <h2>Today’s piece stream</h2>
            <p>
              {today()} · the same ordinary trays in the same order, independent
              of your board or score. Every fresh tray has one single-cell
              piece; it does not guarantee the whole tray fits. This is a score
              challenge, not a certified solution or leaderboard.
            </p>
            <p>
              {records.days[today()]
                ? scoreText(records.days[today()])
                : "No completed score for this date in this browser."}
            </p>
            <button onClick={() => begin(today())}>Play daily stream</button>
          </div>
        </section>
      ) : (
        <section aria-label="Block Fit game">
          <div className="block-topline">
            <span>
              {round.day ? `Daily ${round.day}` : "Classic"} ·{" "}
              {round.assisted ? "Assisted" : "Clean"}
            </span>
            <Link to="/block-fit-setup">Change setup</Link>
          </div>
          <div className="block-status" aria-live="polite">
            <strong>Score {round.game.score}</strong>
            <span>
              Combo {round.game.combo} / 5 · tray {round.game.trayIndex + 1} ·{" "}
              {round.finished
                ? "Finished"
                : round.game.over
                  ? "No remaining piece fits"
                  : "Choose a piece and anchor"}
            </span>
          </div>
          <div
            className="block-tray"
            role="group"
            aria-label="Three-piece tray"
          >
            {round.game.tray.map((s, i) => (
              <button
                key={i}
                className="block-piece-choice"
                data-block-slot={i}
                aria-pressed={slot === i && phase === "place"}
                disabled={s === null || round.finished || round.game.over}
                onClick={() => choose(i)}
                aria-label={`Piece ${i + 1}: ${s === null ? "used" : `${shapeName(s)}, ${BLOCK_SHAPES[s].cells.length} ${s === 0 ? "cell" : "cells"}`}`}
              >
                <strong>Piece {i + 1}</strong>
                {s === null ? (
                  <span className="block-used">Used ✓</span>
                ) : (
                  <>
                    <MiniPiece shape={s} />
                    <span>
                      {shapeName(s)} · {BLOCK_SHAPES[s].cells.length}{" "}
                      {s === 0 ? "cell" : "cells"}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
          <p id="block-help">
            Select a tray piece, then its bounding-box top-left anchor on the
            board—even if that corner of the shape is empty. Preview, then
            confirm or activate the anchor again. Arrows move, Enter/Space
            select, Escape cancels. Scroll inside the board on a phone.
          </p>
          <div
            className="block-scroll"
            role="region"
            aria-label="Scrollable Block Fit board"
          >
            <div
              className="block-board"
              role="group"
              aria-label="Block Fit board"
              aria-describedby="block-help"
            >
              <span />
              {Array.from({ length: 8 }, (_, i) => (
                <span key={`c${i}`} className="block-axis" aria-hidden="true">
                  {i + 1}
                </span>
              ))}
              {round.game.board.map((value, i) => (
                <span className="block-entry" key={i}>
                  {i % 8 === 0 && (
                    <span className="block-axis block-rank" aria-hidden="true">
                      {Math.floor(i / 8) + 1}
                    </span>
                  )}
                  <button
                    type="button"
                    ref={(el) => {
                      buttons.current[i] = el;
                    }}
                    tabIndex={focus === i ? 0 : -1}
                    className={`block-cell ${value ? "occupied" : ""} ${ghosts.has(i) ? (placement ? "ghost-legal" : "ghost-bad") : ""} ${cleared.has(i) ? "will-clear" : ""} ${region.has(i) ? "revive-region" : ""} ${anchor === i ? "is-anchor" : ""}`}
                    aria-label={`${coord(i)}: ${value ? `block ${value}` : "empty"}${phase === "place" && legal.has(i) ? ", legal anchor" : ""}${cleared.has(i) ? ", would clear" : ""}`}
                    aria-pressed={anchor === i}
                    aria-disabled={round.finished}
                    onFocus={() => setFocus(i)}
                    onClick={() => select(i)}
                    onKeyDown={(e) => key(e, i)}
                  >
                    {value > 0 && (
                      <span
                        className={`block-tile block-ink-${(value - 1) % 5}`}
                      >
                        {value}
                      </span>
                    )}
                    {ghosts.has(i) && !value && (
                      <span className="block-ghost" aria-hidden="true">
                        +
                      </span>
                    )}
                    {cleared.has(i) && (
                      <span className="block-clear-symbol" aria-hidden="true">
                        −
                      </span>
                    )}
                    {!value &&
                      !ghosts.has(i) &&
                      phase === "place" &&
                      legal.has(i) && (
                        <span className="block-anchor-dot" aria-hidden="true">
                          ·
                        </span>
                      )}
                  </button>
                </span>
              ))}
            </div>
          </div>
          {(anchor !== null || phase === "swap" || phase === "revive") &&
            !round.finished && (
              <div className="block-preview" aria-label="Action preview">
                {phase === "place" &&
                  (placement ? (
                    <>
                      <h2>Placement preview</h2>
                      <p>
                        {coord(anchor!)} · {placement.placed.length} cells ·
                        rows{" "}
                        {placement.rows.map((r) => r + 1).join(", ") || "none"}{" "}
                        · columns{" "}
                        {placement.columns.map((c) => c + 1).join(", ") ||
                          "none"}
                        . Clear {placement.cleared.length} distinct cells; +
                        {placement.points} points. Next combo {placement.combo}.
                      </p>
                      <button
                        className="board-game-primary"
                        onClick={() =>
                          act({ type: "place", slot: slot!, anchor: anchor! })
                        }
                      >
                        Confirm placement
                      </button>
                    </>
                  ) : (
                    <p>
                      This anchor overlaps an occupied cell or crosses the
                      boundary. The tray and score are unchanged.
                    </p>
                  ))}
                {phase === "swap" && swapped && (
                  <>
                    <h2>Swap preview · assisted</h2>
                    <p>
                      Replace unused slots only. Used slots, score, combo and
                      normal tray index stay unchanged. One swap per attempt; it
                      may repeat a shape.
                    </p>
                    <div className="block-swap-pieces">
                      {swapped.map((s, i) => (
                        <div key={i}>
                          <strong>Piece {i + 1}</strong>
                          {s === null ? (
                            <span>Already used</span>
                          ) : (
                            <>
                              <MiniPiece shape={s} />
                              <span>{shapeName(s)}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <p>
                      {blockHasMove(round.game.board, swapped)
                        ? "At least one replacement fits now; completing the tray is not guaranteed."
                        : "No replacement fits this board. You can cancel without using the swap."}
                    </p>
                    <button onClick={() => act({ type: "swap" })}>
                      Confirm swap
                    </button>
                  </>
                )}
                {phase === "revive" && (
                  <>
                    <h2>Revive preview · assisted</h2>
                    <p>
                      Choose the top-left of a 3 by 3 area. It clips at the
                      right or bottom edge. Remove occupied cells without
                      points; one revive per attempt.
                    </p>
                    {revive ? (
                      <>
                        <p>
                          {coord(anchor!)} · area {revive.cells.length} cells ·
                          remove {revive.cleared.length} blocks.{" "}
                          {revive.canMove
                            ? "A remaining piece will fit."
                            : "This area would not restore a legal placement."}
                        </p>
                        <button
                          disabled={!revive.cleared.length || !revive.canMove}
                          onClick={() =>
                            act({ type: "revive", anchor: anchor! })
                          }
                        >
                          Confirm revive
                        </button>
                      </>
                    ) : (
                      <p>Select an area on the board to inspect it.</p>
                    )}
                  </>
                )}
                <button
                  onClick={() => {
                    clearPreview();
                    setNotice("Preview cancelled. Nothing used or scored.");
                  }}
                >
                  Cancel preview
                </button>
              </div>
            )}
          <p role="status" className="block-notice">
            {notice}
          </p>
          <div className="board-game-actions">
            <button
              disabled={!canUndoBlockRound(round)}
              onClick={() => act({ type: "undo" })}
            >
              Undo (assisted)
            </button>
            <button
              disabled={round.finished || round.swapUsed}
              onClick={() => {
                setPhase("swap");
                setAnchor(null);
              }}
            >
              Preview swap (assisted)
            </button>
            <button
              disabled={!reviveAvailable}
              onClick={() => {
                setPhase("revive");
                setAnchor(null);
                setSlot(null);
              }}
            >
              Preview revive (assisted)
            </button>
            <button
              onClick={() => {
                const next = restartBlockRound(round, crypto.randomUUID());
                setRound(next);
                setSlot(null);
                clearPreview();
                setNotice(
                  "New attempt on the same original stream. Score and helper allowances reset.",
                );
              }}
            >
              Restart same stream
            </button>
          </div>
          {round.game.over && (
            <div className="board-game-result">
              <h2>
                {round.finished
                  ? `Finished: ${round.game.score} points`
                  : "No remaining piece fits"}
              </h2>
              <p>
                {round.finished
                  ? "Score saved in this browser when storage is available. Undo is closed; reloading does not count this recent attempt twice."
                  : "The run has naturally reached no legal placement. Before saving the score, you may Undo or preview an available free recovery helper. These mark assistance. Used helper allowances remain consumed even after Undo."}
              </p>
              {!round.finished && (
                <button
                  className="board-game-primary"
                  onClick={() => act({ type: "finish" })}
                >
                  Finish and save score
                </button>
              )}
            </div>
          )}
          <details className="block-history">
            <summary>Action history ({round.actions.length})</summary>
            <ol start={Math.max(1, round.actions.length - 99)}>
              {round.actions.slice(-100).map((a, i) => (
                <li key={i}>
                  {a.type === "place"
                    ? `Piece ${a.slot + 1} at ${coord(a.anchor)}`
                    : a.type === "revive"
                      ? `Revive at ${coord(a.anchor)}`
                      : a.type}
                </li>
              ))}
            </ol>
            {round.actions.length > 100 && (
              <p>Showing the most recent 100 actions.</p>
            )}
          </details>
        </section>
      )}
      {storageError && (
        <p role="alert">
          Persistence is unavailable or this run exceeds the save safety limit.
          You can keep playing, but the latest progress or records may not
          survive leaving.
        </p>
      )}
      <section className="board-game-records">
        <h2>Your Block Fit scores</h2>
        <p>Classic · {scoreText(records.classic)}</p>
        <p>Daily · {scoreText(records.daily)}</p>
        <p>
          Browser-only scores, separated by assistance. No win count, streak,
          account or leaderboard. Recent 128 attempt IDs prevent duplicate
          finishes; the latest 90 challenge dates are retained. Older daily
          finishes belong to their original date.
        </p>
        {Object.keys(records.days).length > 0 && (
          <details>
            <summary>Daily scores by original date</summary>
            {Object.entries(records.days)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([day, row]) => (
                <p key={day}>
                  {day} · {scoreText(row)}
                </p>
              ))}
          </details>
        )}
      </section>
      <section className="board-game-rules">
        <h2>Clear together. Keep the next shape in mind.</h2>
        <p>
          Place fixed one-to-five-cell shapes without overlap or rotation. Use
          every tray slot before replenishment. Complete rows and columns clear
          simultaneously; a crossing cell clears once but its two lines both
          score. Every placement earns its cell count, plus 10 × completed lines
          × combo. A clearing placement raises the consecutive combo up to five;
          a non-clear resets it.
        </p>
        <p>
          Every ordinary tray has one single-cell shape and two other pieces,
          chosen from a versioned seeded stream. This guarantees one fitting
          piece when an empty cell exists, not a solution for the whole tray.
          Early trays use smaller shapes; the full pool unlocks by tray index,
          independently of score or board.
        </p>
        <p>
          Undo and the once-per-attempt free swap/revive mark assistance.
          Previewing or cancelling does not. Undo restores the latest board
          effect, but never refunds a used helper. No remaining piece fits means
          choose recovery or explicitly finish/save the score; after finishing,
          Undo closes. There are no ad gates.
        </p>
        <Link to="/blog/block-fit-piece-order-lines-and-combos">
          Compare a reachable elbow-first trap with the square-first clear →
        </Link>
      </section>
    </main>
  );
}
