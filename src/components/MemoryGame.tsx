import React, { useState, useEffect, useRef } from "react";
import "./MemoryGame.css";
import { FaRocket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const symbols = ["🚀", "🪐", "👾", "🌟", "🛰️", "🌙", "🛸", "☄️", "🌌", "🔭"];

type MemoryDifficulty = "EASY" | "MEDIUM" | "HARD";

const MEMORY_LEVELS: Record<MemoryDifficulty, { label: string; pairs: number; columns: number }> = {
  EASY: { label: "Easy", pairs: 6, columns: 4 },
  MEDIUM: { label: "Medium", pairs: 8, columns: 4 },
  HARD: { label: "Hard", pairs: 10, columns: 5 }
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
  HARD: { gamesPlayed: 0, wins: 0, bestMoves: null, bestTime: null }
});

const loadStats = (): MemoryStats => {
  try {
    const stored = localStorage.getItem(MEMORY_STATS_KEY);
    if (!stored) return createDefaultStats();
    const parsed = JSON.parse(stored) as Partial<MemoryStats>;
    return {
      ...createDefaultStats(),
      ...parsed
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
    if (gameStarted && !showModal) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStarted, showModal]);

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
              : card
          )
        );
        trackTimeout(() => {
          setCards((prev) =>
            prev.filter((card) => card.id !== firstId && card.id !== secondId)
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
          : card
      )
    );

    trackTimeout(() => {
      setCards((prev) =>
        prev.map((card) =>
          card.id === firstId || card.id === secondId
            ? { ...card, flipped: false, mismatched: false }
            : card
        )
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
        setStats((prev) => {
          const current = prev[difficulty];
          const updated: MemoryStats = {
            ...prev,
            [difficulty]: {
              gamesPlayed: current.gamesPlayed + 1,
              wins: current.wins + 1,
              bestMoves: current.bestMoves === null ? moves : Math.min(current.bestMoves, moves),
              bestTime: current.bestTime === null ? timer : Math.min(current.bestTime, timer)
            }
          };
          saveStats(updated);
          return updated;
        });
      }
      trackTimeout(() => setShowModal(true), 500);
    }
  }, [cards, gameStarted, difficulty, moves, timer]);

  const handleCardClick = (idx: number) => {
    if (isBusy || cards[idx].flipped || cards[idx].removing || flippedIndices.length === 2) return;
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
      }))
    );
    setMoves(0);
    setFlippedIndices([]);
    setIsBusy(false);
    setTimer(0);
    setGameStarted(false);
    setShowModal(false);
  };

  const totalPairs = MEMORY_LEVELS[difficulty].pairs;
  const boardColumns = MEMORY_LEVELS[difficulty].columns;
  const pairsFound = (totalPairs * 2 - cards.length) / 2;
  const currentStats = stats[difficulty];
  const currentWinRate = currentStats.gamesPlayed === 0
    ? 0
    : Math.round((currentStats.wins / currentStats.gamesPlayed) * 100);
  const formatTime = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

  return (
    <div className="memory-game-bg">
      {/* Portal Header */}
      <div className="memory-game-header">
        <div className="memory-game-logo"><FaRocket style={{ color: '#ff6b35', fontSize: '1.5em' }} /> DoStrike Gaming Portal</div>
        <button className="memory-game-private-btn" onClick={() => navigate('/')}><FaRocket /> Back to Portal</button>
      </div>
      <div>
        <h2 className="memory-game-title">Memory Game</h2>
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
        <div className="memory-game-info" style={{ gap: '2.5rem' }}>
          <span>Moves: {moves}</span>
          <span>Pairs: {pairsFound} / {totalPairs}</span>
          <span>Time: {formatTime(timer)}</span>
        </div>
        <div className="memory-stats-row">
          <span>Best Moves ({MEMORY_LEVELS[difficulty].label}): {currentStats.bestMoves ?? "-"}</span>
          <span>Best Time: {currentStats.bestTime !== null ? formatTime(currentStats.bestTime) : "-"}</span>
          <span>Win Rate: {currentWinRate}%</span>
        </div>
        <div
          className="memory-game-board"
          style={{
            gridTemplateColumns: `repeat(${boardColumns}, 1fr)`,
            gap: '18px',
            background: 'rgba(255,255,255,0.85)',
            boxShadow: '0 4px 32px rgba(30,136,229,0.10)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            margin: '0 auto 2rem auto',
            maxWidth: boardColumns === 5 ? 640 : 520
          }}
        >
          {cards.map((card, idx) => (
            <button
              key={card.id}
              className={`memory-card${card.flipped ? " flipped" : ""}${card.removing ? " removing" : ""}${card.mismatched ? " mismatched" : ""}`}
              onClick={() => handleCardClick(idx)}
              disabled={card.flipped || card.removing || isBusy}
              aria-label={card.flipped ? `Revealed card ${card.symbol}` : "Hidden card"}
              style={{
                pointerEvents: card.removing ? 'none' : undefined,
                opacity: card.removing ? 0 : 1,
                transition: 'opacity 0.4s',
                boxShadow: card.flipped ? '0 6px 24px rgba(30,136,229,0.18)' : '0 2px 8px rgba(30,136,229,0.10)',
                border: card.flipped ? '2px solid #ff6b35' : '2px solid transparent',
                background: 'none',
                outline: 'none',
                position: 'relative',
                zIndex: card.flipped ? 2 : 1
              }}
            >
              <div className="memory-card-inner">
                <div className="memory-card-front" style={{
                  background: 'linear-gradient(135deg, #fff 60%, #e3e8f0 100%)',
                  color: '#222',
                  fontSize: '2.2rem',
                  fontWeight: 700,
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px rgba(30,136,229,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  {card.flipped ? card.symbol : null}
                </div>
                <div className="memory-card-back" style={{
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                  color: '#fff',
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}><FaRocket style={{ fontSize: '2em' }} /></div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="memory-game-modal-btn" onClick={() => resetGame()}>Restart</button>
        </div>
      </div>
      {/* End Game Modal */}
      {showModal && (
        <div className="memory-game-modal">
          <div className="memory-game-modal-content" role="dialog" aria-modal="true" aria-label="Memory game results">
            <div className="memory-game-modal-title">Congratulations!</div>
            <div className="memory-game-modal-stats">
              You found all pairs!<br />
              Moves: <b>{moves}</b><br />
              Time: <b>{formatTime(timer)}</b><br />
              Best ({MEMORY_LEVELS[difficulty].label}):{" "}
              <b>{currentStats.bestMoves ?? "-"} moves / {currentStats.bestTime !== null ? formatTime(currentStats.bestTime) : "-"}</b>
            </div>
            <div className="memory-game-modal-btns">
              <button className="memory-game-modal-btn" onClick={() => resetGame()}>Play Again</button>
              <button className="memory-game-modal-btn" onClick={() => navigate("/")}>Back to Portal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
