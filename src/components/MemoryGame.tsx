import ResultMark from './ResultMark';
import React, { useState, useEffect, useRef } from "react";
import "./MemoryGame.css";
import "./MatchGame.css";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const symbols = ["🚀", "🪐", "👾", "🌟", "🛰️", "🌙", "🛸", "☄️", "🌌", "🔭"];

type MemoryDifficulty = "EASY" | "MEDIUM" | "HARD";

const MEMORY_LEVELS: Record<
  MemoryDifficulty,
  { label: string; pairs: number; columns: number }
> = {
  EASY: { label: "Easy", pairs: 6, columns: 4 },
  MEDIUM: { label: "Medium", pairs: 8, columns: 4 },
  HARD: { label: "Hard", pairs: 10, columns: 5 },
};

type DifficultyStats = {
  gamesPlayed: number;
  wins: number;
  bestMoves: number | null;
  bestTime: number | null;
};

type MemoryStats = Record<MemoryDifficulty, DifficultyStats>;

const MEMORY_STATS_KEY = "memoryGameStats";

const createDefaultStats = (): MemoryStats => ({
  EASY: { gamesPlayed: 0, wins: 0, bestMoves: null, bestTime: null },
  MEDIUM: { gamesPlayed: 0, wins: 0, bestMoves: null, bestTime: null },
  HARD: { gamesPlayed: 0, wins: 0, bestMoves: null, bestTime: null },
});

const loadStats = (): MemoryStats => {
  try {
    const stored = localStorage.getItem(MEMORY_STATS_KEY);
    if (!stored) return createDefaultStats();
    const parsed = JSON.parse(stored) as Partial<MemoryStats>;
    return {
      ...createDefaultStats(),
      ...parsed,
    };
  } catch {
    return createDefaultStats();
  }
};

const saveStats = (stats: MemoryStats) => {
  localStorage.setItem(MEMORY_STATS_KEY, JSON.stringify(stats));
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface Card {
  id: number;
  symbol: string;
  flipped: boolean;
  removing: boolean;
  mismatched?: boolean;
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [personalBest, setPersonalBest] = useState(false);
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>("MEDIUM");
  const [stats, setStats] = useState<MemoryStats>(() => loadStats());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTimeoutsRef = useRef<number[]>([]);
  const hasRecordedWinRef = useRef(false);
  const navigate = useNavigate();

  const trackTimeout = (callback: () => void, delay: number) => {
    const timeoutId = window.setTimeout(callback, delay);
    pendingTimeoutsRef.current.push(timeoutId);
    return timeoutId;
  };

  const clearPendingTimeouts = () => {
    pendingTimeoutsRef.current.forEach(window.clearTimeout);
    pendingTimeoutsRef.current = [];
  };

  // Initialize cards
  useEffect(() => {
    resetGame("MEDIUM");
    return () => {
      clearPendingTimeouts();
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !showModal && cards.length > 0) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, showModal, cards.length === 0]);

  // Card flip/match logic
  useEffect(() => {
    if (flippedIndices.length !== 2) return;

    const [firstIndex, secondIndex] = flippedIndices;
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];
    if (!firstCard || !secondCard) {
      setFlippedIndices([]);
      setIsBusy(false);
      return;
    }

    const firstId = firstCard.id;
    const secondId = secondCard.id;
    const isMatch = firstCard.symbol === secondCard.symbol;

    setIsBusy(true);
    setMoves((m) => m + 1); // Only increment after a pair attempt

    if (isMatch) {
      // Matched: pulse, then remove by card id (safe even if list changes)
      trackTimeout(() => {
        setCards((prev) =>
          prev.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, removing: true }
              : card,
          ),
        );
        trackTimeout(() => {
          setCards((prev) =>
            prev.filter((card) => card.id !== firstId && card.id !== secondId),
          );
          setFlippedIndices([]);
          setIsBusy(false);
        }, 400);
      }, 600);
      return;
    }

    // Mismatched: shake, then flip both back
    setCards((prev) =>
      prev.map((card) =>
        card.id === firstId || card.id === secondId
          ? { ...card, mismatched: true }
          : card,
      ),
    );

    trackTimeout(() => {
      setCards((prev) =>
        prev.map((card) =>
          card.id === firstId || card.id === secondId
            ? { ...card, flipped: false, mismatched: false }
            : card,
        ),
      );
      setFlippedIndices([]);
      setIsBusy(false);
    }, 1100);
  }, [flippedIndices]);

  // End game modal
  useEffect(() => {
    if (cards.length === 0 && gameStarted) {
      if (!hasRecordedWinRef.current) {
        hasRecordedWinRef.current = true;
        setPersonalBest(
          stats[difficulty].bestMoves === null ||
            moves < (stats[difficulty].bestMoves as number),
        );
        setStats((prev) => {
          const current = prev[difficulty];
          const updated: MemoryStats = {
            ...prev,
            [difficulty]: {
              gamesPlayed: current.gamesPlayed + 1,
              wins: current.wins + 1,
              bestMoves:
                current.bestMoves === null
                  ? moves
                  : Math.min(current.bestMoves, moves),
              bestTime:
                current.bestTime === null
                  ? timer
                  : Math.min(current.bestTime, timer),
            },
          };
          saveStats(updated);
          return updated;
        });
      }
      trackTimeout(() => setShowModal(true), 500);
    }
  }, [cards, gameStarted, difficulty, moves, timer]);

  const handleCardClick = (idx: number) => {
    if (
      isBusy ||
      cards[idx].flipped ||
      cards[idx].removing ||
      flippedIndices.length === 2
    )
      return;
    if (!gameStarted) setGameStarted(true);
    // If one card is already flipped, flip the second and trigger evaluation
    if (flippedIndices.length === 1) {
      const newCards = [...cards];
      newCards[idx].flipped = true;
      setCards(newCards);
      setFlippedIndices([flippedIndices[0], idx]);
    } else {
      // Flip the first card and wait for the second
      const newCards = [...cards];
      newCards[idx].flipped = true;
      setCards(newCards);
      setFlippedIndices([idx]);
    }
  };

  const resetGame = (nextDifficulty: MemoryDifficulty = difficulty) => {
    window.scrollTo(0, 0);
    clearPendingTimeouts();
    hasRecordedWinRef.current = false;
    const { pairs } = MEMORY_LEVELS[nextDifficulty];
    const selectedSymbols = shuffle(symbols).slice(0, pairs);
    const doubled = [...selectedSymbols, ...selectedSymbols];
    const shuffled = shuffle(doubled);
    setDifficulty(nextDifficulty);
    setCards(
      shuffled.map((symbol, idx) => ({
        id: idx,
        symbol,
        flipped: false,
        removing: false,
        mismatched: false,
      })),
    );
    setMoves(0);
    setFlippedIndices([]);
    setIsBusy(false);
    setTimer(0);
    setGameStarted(false);
    setShowModal(false);
    setPersonalBest(false);
  };

  const totalPairs = MEMORY_LEVELS[difficulty].pairs;
  const boardColumns = MEMORY_LEVELS[difficulty].columns;
  const pairsFound = (totalPairs * 2 - cards.length) / 2;
  const currentStats = stats[difficulty];
  const formatTime = (t: number) =>
    `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

  return (
    <>
      <Helmet>
        <title>Memory Game - DoStrike Gaming Portal</title>
        <meta
          name="description"
          content="Play the DoStrike Memory card-matching game with easy, medium, and hard layouts. Track your best time and moves."
        />
        <link rel="canonical" href="https://dostrike.com/memory" />
      </Helmet>
      <main className="memory-game-bg">
        <nav className="match-top" aria-label="Game navigation">
          <Link to="/">← Game lobby</Link>
          <Link to="/blog/memory-game-improvement-guide">Strategy guide</Link>
        </nav>
        <div>
          <header className="match-heading">
            <p className="match-eyebrow">CHASE YOUR PERSONAL BEST</p>
            <h1 className="memory-game-title">Memory</h1>
            <p className="memory-round-goal">
              Match every pair. Make fewer guesses. Beat your best.
            </p>
          </header>
          <div className="memory-difficulty-row">
            {(Object.keys(MEMORY_LEVELS) as MemoryDifficulty[]).map((level) => (
              <button
                key={level}
                className={`memory-difficulty-btn${difficulty === level ? " active" : ""}`}
                onClick={() => resetGame(level)}
                aria-label={`Switch to ${MEMORY_LEVELS[level].label} difficulty`}
                aria-pressed={difficulty === level}
              >
                {MEMORY_LEVELS[level].label}
              </button>
            ))}
          </div>
          <div className="memory-game-info" style={{ gap: "2.5rem" }}>
            <span>Moves: {moves}</span>
            <span>
              Pairs: {pairsFound} / {totalPairs}
            </span>
            <span>Time: {formatTime(timer)}</span>
          </div>
          <div
            className="memory-game-board"
            hidden={showModal}
            style={{
              gridTemplateColumns: `repeat(${boardColumns}, 1fr)`,
              gridTemplateRows: `repeat(${Math.ceil((totalPairs * 2) / boardColumns)}, var(--memory-card-height))`,
              maxWidth: boardColumns === 5 ? 520 : 440,
            }}
          >
            {cards.map((card, idx) => (
              <button
                key={card.id}
                className={`memory-card${card.flipped ? " flipped" : ""}${card.removing ? " removing" : ""}${card.mismatched ? " mismatched" : ""}`}
                onClick={() => handleCardClick(idx)}
                disabled={card.flipped || card.removing || isBusy}
                aria-label={
                  card.flipped
                    ? `Revealed card ${card.symbol}`
                    : `Hidden card ${card.id + 1}`
                }
                style={{
                  gridColumn: (card.id % boardColumns) + 1,
                  gridRow: Math.floor(card.id / boardColumns) + 1,
                  pointerEvents: card.removing ? "none" : undefined,
                  opacity: card.removing ? 0 : 1,
                  transition: "opacity 0.4s",
                  boxShadow: card.flipped
                    ? "0 6px 24px rgba(30,136,229,0.18)"
                    : "0 2px 8px rgba(30,136,229,0.10)",
                  border: card.flipped
                    ? "2px solid #ff6b35"
                    : "2px solid transparent",
                  background: "none",
                  outline: "none",
                  position: "relative",
                  zIndex: card.flipped ? 2 : 1,
                }}
              >
                <div className="memory-card-inner" aria-hidden="true">
                  <div className="memory-card-front">
                    <span className="memory-card-emblem">d.</span>
                  </div>
                  <div className="memory-card-back">{card.symbol}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="memory-restart" hidden={showModal}>
            <button
              className="memory-game-modal-btn"
              onClick={() => resetGame()}
            >
              Restart
            </button>
          </div>
          {/* Round result */}
          {showModal && (
            <div className="memory-game-modal">
              <div
                className="memory-game-modal-content"
                role="region"
                aria-label="Memory game results"
                aria-live="polite"
              >
                <ResultMark outcome="win" />
              <h2 className="memory-game-modal-title">
                  {personalBest ? "New personal best!" : "Board cleared!"}
                </h2>
                <div className="memory-game-modal-stats">
                  You found all pairs!
                  <br />
                  Moves: <b>{moves}</b>
                  <br />
                  Time: <b>{formatTime(timer)}</b>
                  <br />
                  Best ({MEMORY_LEVELS[difficulty].label}):{" "}
                  <b>
                    {currentStats.bestMoves ?? "-"} moves /{" "}
                    {currentStats.bestTime !== null
                      ? formatTime(currentStats.bestTime)
                      : "-"}
                  </b>
                  <p style={{ marginTop: 12 }}>
                    {moves === totalPairs
                      ? "A perfect clear: one move for every pair."
                      : `${Math.round((totalPairs / moves) * 100)}% pair efficiency. Remember one more location next round to reduce guesses.`}
                  </p>
                </div>
                <div className="memory-game-modal-btns">
                  <button
                    className="memory-game-modal-btn"
                    onClick={() => resetGame()}
                  >
                    Play Again
                  </button>
                  {difficulty !== "HARD" && (
                    <button
                      className="memory-game-modal-btn"
                      onClick={() =>
                        resetGame(difficulty === "EASY" ? "MEDIUM" : "HARD")
                      }
                    >
                      Try{" "}
                      {difficulty === "EASY"
                        ? "Medium · 8 pairs"
                        : "Hard · 10 pairs"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="memory-game-modal-btn"
                    onClick={() => navigate("/")}
                  >
                    Back to home
                  </button>
                </div>
              </div>
            </div>
          )}
          <details className="memory-rules" aria-label="How to play Memory">
            <summary>How to play &amp; strategy tips</summary>
            <p>
              Turn over two cards to find a matching pair. Matched cards fade
              away; a mismatch turns back over. Clear every pair to finish. Each
              two-card attempt counts as one move.
            </p>
            <p>
              Easy uses 6 pairs, Medium 8, and Hard 10. Start with Easy and use
              a steady left-to-right scan so you can remember where each symbol
              appeared. Your best moves and times are saved on this device.
            </p>
            <a href="/blog/memory-game-improvement-guide">
              Read the Memory practice guide
            </a>
          </details>

          <details className="memory-records">
            <summary>Your personal records</summary>{" "}
            <div className="memory-stats-row">
              <span>
                Best Moves ({MEMORY_LEVELS[difficulty].label}):{" "}
                {currentStats.bestMoves ?? "-"}
              </span>
              <span>
                Best Time:{" "}
                {currentStats.bestTime !== null
                  ? formatTime(currentStats.bestTime)
                  : "-"}
              </span>
              <span>Boards cleared: {currentStats.wins}</span>
            </div>
          </details>
        </div>
      </main>
    </>
  );
};

export default MemoryGame;
