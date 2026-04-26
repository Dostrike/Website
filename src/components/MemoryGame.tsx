import React, { useState, useEffect, useRef } from "react";
import "./MemoryGame.css";
import { FaRocket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const symbols = ["🚀", "🪐", "👾", "🌟", "🛰️", "🌙", "🛸", "☄️"];

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Initialize cards
  useEffect(() => {
    resetGame();
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
    if (flippedIndices.length === 2) {
      setIsBusy(true);
      const [i, j] = flippedIndices;
      const newCards = [...cards];
      if (newCards[i].symbol === newCards[j].symbol) {
        // Matched: pulse, then remove
        setTimeout(() => {
          setCards((prev) => prev.map((c, idx) =>
            idx === i || idx === j ? { ...c, removing: true } : c
          ));
          setTimeout(() => {
            setCards((prev) => prev.filter((_, idx) => idx !== i && idx !== j));
            setFlippedIndices([]);
            setIsBusy(false);
          }, 400); // fade out duration
        }, 600); // pulse duration
      } else {
        // Mismatched: shake, then flip back
        newCards[i].mismatched = true;
        newCards[j].mismatched = true;
        setCards(newCards);
        setTimeout(() => {
          newCards[i].flipped = false;
          newCards[j].flipped = false;
          newCards[i].mismatched = false;
          newCards[j].mismatched = false;
          setCards([...newCards]);
          setFlippedIndices([]);
          setIsBusy(false);
        }, 1100);
      }
      setMoves((m) => m + 1); // Only increment after a pair attempt
    }
  }, [flippedIndices, cards]);

  // End game modal
  useEffect(() => {
    if (cards.length === 0 && gameStarted) {
      setTimeout(() => setShowModal(true), 500);
    }
  }, [cards, gameStarted]);

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

  const resetGame = () => {
    const doubled = [...symbols, ...symbols];
    const shuffled = shuffle(doubled);
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

  const pairsFound = (16 - cards.length) / 2;
  const totalPairs = 8;
  const formatTime = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

  return (
    <div className="memory-game-bg">
      {/* Portal Header */}
      <div className="memory-game-header">
        <div className="memory-game-logo"><FaRocket style={{ color: '#ff6b35', fontSize: '1.5em' }} /> DoStrike Gaming Portal</div>
        <button className="memory-game-private-btn" onClick={() => navigate('/rooms')}><FaRocket /> Private Rooms</button>
      </div>
      <div>
        <h2 className="memory-game-title">Memory Game</h2>
        <div className="memory-game-info" style={{ gap: '2.5rem' }}>
          <span>Moves: {moves}</span>
          <span>Pairs: {pairsFound} / {totalPairs}</span>
          <span>Time: {formatTime(timer)}</span>
        </div>
        <div className="memory-game-board" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: '18px', background: 'rgba(255,255,255,0.85)', boxShadow: '0 4px 32px rgba(30,136,229,0.10)', borderRadius: '20px', padding: '2.5rem 2rem', margin: '0 auto 2rem auto', maxWidth: 520 }}>
          {cards.map((card, idx) => (
            <button
              key={card.id}
              className={`memory-card${card.flipped ? " flipped" : ""}${card.removing ? " removing" : ""}${card.mismatched ? " mismatched" : ""}`}
              onClick={() => handleCardClick(idx)}
              disabled={card.flipped || card.removing || isBusy}
              aria-label={card.flipped ? card.symbol : "Hidden card"}
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
          <button className="memory-game-modal-btn" onClick={resetGame}>Restart</button>
        </div>
      </div>
      {/* End Game Modal */}
      {showModal && (
        <div className="memory-game-modal">
          <div className="memory-game-modal-content">
            <div className="memory-game-modal-title">Congratulations!</div>
            <div className="memory-game-modal-stats">
              You found all pairs!<br />
              Moves: <b>{moves}</b><br />
              Time: <b>{formatTime(timer)}</b>
            </div>
            <div className="memory-game-modal-btns">
              <button className="memory-game-modal-btn" onClick={resetGame}>Play Again</button>
              <button className="memory-game-modal-btn" onClick={() => navigate("/")}>Back to Portal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
