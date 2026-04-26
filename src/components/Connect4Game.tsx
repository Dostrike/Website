import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Connect4Logic } from '../utils/connect4Logic';
import { Connect4AI, AIDifficulty } from '../utils/connect4AI';
import { soundEffects } from '../utils/soundEffects';
import { Connect4Stats } from '../utils/gameStats';
import { ThemeManager, CONNECT4_THEMES } from '../utils/themes';
import { Connect4Player, Connect4GameStatus, Connect4GameState } from '../types/connect4';
import Connect4Board from './Connect4Board';
import { FaPlay, FaTrophy, FaChartLine, FaUndo, FaPalette } from 'react-icons/fa';
import './GameScreen.css';

// Simple confetti burst
function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    const confetti: { x: number; y: number; vx: number; vy: number; color: string; r: number; }[] = [];
    const colors = ['#e53935', '#fbc02d', '#1976d2', '#43a047', '#ffb300'];
    for (let i = 0; i < 60; i++) {
      confetti.push({
        x: W / 2,
        y: H / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -8 - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        r: Math.random() * 6 + 4,
      });
    }
    let running = true;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (const c of confetti) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
        ctx.fillStyle = c.color;
        ctx.fill();
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.18;
        c.vx *= 0.98;
        c.r *= 0.995;
      }
      if (running && confetti.some(c => c.y < H && c.r > 1)) {
        requestAnimationFrame(draw);
      } else {
        if (ctx) ctx.clearRect(0, 0, W, H);
      }
    }
    draw();
    return () => { running = false; if (ctx) ctx.clearRect(0, 0, W, H); };
  }, [trigger]);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 2000 }} />;
}

const Connect4Game: React.FC = () => {
  const navigate = useNavigate();
  // Load player names and settings from localStorage
  const settings = (() => {
    try {
      return JSON.parse(localStorage.getItem('connect4Settings') || '{}');
    } catch {
      return {};
    }
  })();
  const player1Name = settings.player1Name || 'Player 1';
  const player2Name = settings.gameMode === 'AI' ? 'AI' : (settings.player2Name || 'Player 2');
  const gameMode = settings.gameMode || 'AI';

  const [gameState, setGameState] = useState<Connect4GameState>(Connect4Logic.createInitialGameState());
  const [showModal, setShowModal] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [starter, setStarter] = useState<Connect4Player>('RED');
  const [falling, setFalling] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [gameStats, setGameStats] = useState(() => Connect4Stats.loadStats());
  const [gameHistory, setGameHistory] = useState<Connect4GameState[]>([Connect4Logic.createInitialGameState()]);
  const [currentTheme, setCurrentTheme] = useState(() => ThemeManager.loadSavedTheme());
  const [ai] = useState(() => gameMode === 'AI' ? new Connect4AI(settings.difficulty as AIDifficulty, 'YELLOW') : null);

  // Handle AI's turn when it's the first move
  useEffect(() => {
    if (gameMode === 'AI' && gameState.currentPlayer === 'YELLOW' && gameHistory.length === 1) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        if (ai) {
          const aiMove = ai.getBestMove(gameState);
          soundEffects.playChipDrop();
          const aiState = Connect4Logic.makeMove(gameState, aiMove);
          setGameState(aiState);
          setGameHistory(prev => [...prev, aiState]);
          setAiThinking(false);
          
          if (aiState.gameStatus !== Connect4GameStatus.PLAYING) {
            const result = aiState.gameStatus === Connect4GameStatus.WIN ? 'loss' : 'draw';
            const updatedStats = Connect4Stats.recordGame(result, 'AI', settings.difficulty);
            setGameStats(updatedStats);
            
            setTimeout(() => {
              setShowModal(true);
              if (aiState.gameStatus === Connect4GameStatus.WIN) {
                setConfetti(true);
                soundEffects.playWin();
              } else if (aiState.gameStatus === Connect4GameStatus.DRAW) {
                soundEffects.playDraw();
              }
            }, 1000);
          }
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameHistory.length, ai, gameMode, settings.difficulty]);

  const handleColumnClick = (col: number) => {
    if (gameState.gameStatus !== Connect4GameStatus.PLAYING || aiThinking) return;
    
    // Play chip drop sound
    soundEffects.playChipDrop();
    
    const newState = Connect4Logic.makeMove(gameState, col);
    setGameState(newState);
    
    // Add to history for undo functionality
    setGameHistory(prev => [...prev, newState]);
    
    if (newState.gameStatus !== Connect4GameStatus.PLAYING) {
      // Record game result
      let result: 'win' | 'loss' | 'draw';
      if (newState.gameStatus === Connect4GameStatus.WIN) {
        result = newState.winner === 'RED' ? 'win' : 'loss';
      } else {
        result = 'draw';
      }
      const updatedStats = Connect4Stats.recordGame(result, gameMode as 'AI' | 'PVP', settings.difficulty);
      setGameStats(updatedStats);
      
      setTimeout(() => {
        setShowModal(true);
        if (newState.gameStatus === Connect4GameStatus.WIN) {
          setConfetti(true);
          soundEffects.playWin();
        } else if (newState.gameStatus === Connect4GameStatus.DRAW) {
          soundEffects.playDraw();
        }
      }, 1000); // 1s delay for win highlight
    } else if (gameMode === 'AI' && newState.currentPlayer === 'YELLOW' && ai) {
      // AI's turn
      setAiThinking(true);
      setTimeout(() => {
        const aiMove = ai.getBestMove(newState);
        soundEffects.playChipDrop(); // AI chip drop sound
        const aiState = Connect4Logic.makeMove(newState, aiMove);
        setGameState(aiState);
        setAiThinking(false);
        
        // Add AI move to history
        setGameHistory(prev => [...prev, aiState]);
        
        if (aiState.gameStatus !== Connect4GameStatus.PLAYING) {
          // Record AI game result
          let result: 'win' | 'loss' | 'draw';
          if (aiState.gameStatus === Connect4GameStatus.WIN) {
            result = aiState.winner === 'RED' ? 'win' : 'loss';
          } else {
            result = 'draw';
          }
          const updatedStats = Connect4Stats.recordGame(result, 'AI', settings.difficulty);
          setGameStats(updatedStats);
          
          setTimeout(() => {
            setShowModal(true);
            if (aiState.gameStatus === Connect4GameStatus.WIN) {
              setConfetti(true);
              soundEffects.playWin();
            } else if (aiState.gameStatus === Connect4GameStatus.DRAW) {
              soundEffects.playDraw();
            }
          }, 1000);
        }
      }, 800); // AI thinking delay
    }
  };

  const handlePlayAgain = () => {
    soundEffects.playClick();
    setShowModal(false);
    setConfetti(false);
    setFalling(true);
    // Alternate starter
    setStarter(prev => (prev === 'RED' ? 'YELLOW' : 'RED'));
  };
  const handleFallOutEnd = () => {
    setFalling(false);
    const newGameState = { ...Connect4Logic.createInitialGameState(), currentPlayer: starter };
    setGameState(newGameState);
    setGameHistory([newGameState]); // Reset history for new game
  };
  
  const handleUndo = () => {
    if (gameHistory.length <= 1 || gameState.gameStatus !== Connect4GameStatus.PLAYING || aiThinking) return;
    
    soundEffects.playClick();
    
    // For AI mode, we need to undo both player and AI moves
    let newHistoryLength = gameHistory.length - 1;
    if (gameMode === 'AI' && gameHistory.length > 2) {
      // Undo AI move too if it was the last move
      const lastState = gameHistory[gameHistory.length - 1];
      const secondLastState = gameHistory[gameHistory.length - 2];
      if (lastState.currentPlayer === 'RED' && secondLastState.currentPlayer === 'YELLOW') {
        newHistoryLength = gameHistory.length - 2; // Undo both AI and player moves
      }
    }
    
    const newHistory = gameHistory.slice(0, newHistoryLength);
    const previousState = newHistory[newHistory.length - 1];
    
    setGameHistory(newHistory);
    setGameState(previousState);
  };

  const handleReturnToPortal = () => {
    navigate('/');
  };

  // Handle AI thinking indicator in UI
  const getPlayerDisplayName = (player: Connect4Player) => {
    if (player === 'RED') return player1Name;
    if (player === 'YELLOW' && gameMode === 'AI') {
      return aiThinking ? 'AI Thinking...' : 'AI';
    }
    return player2Name;
  };

  // Only allow human to play on their turn
  const isHumanTurn = gameMode === 'PVP' || (gameMode === 'AI' && gameState.currentPlayer === 'RED');

  // Player pill style
  const playerPill = (player: Connect4Player, active: boolean, name: string) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 22px',
      borderRadius: 999,
      background: active ? (player === 'RED' ? 'linear-gradient(90deg, #e53935 0%, #ff8a80 100%)' : 'linear-gradient(90deg, #fbc02d 0%, #fff59d 100%)') : 'var(--surface)',
      color: active ? 'white' : 'var(--text)',
      fontWeight: 700,
      fontSize: 'clamp(0.9rem, 2.8vw, 1.08rem)',
      boxShadow: active ? (player === 'RED' ? '0 0 16px 2px #e53935aa' : '0 0 16px 2px #fbc02daa') : '0 1px 6px rgba(60,80,180,0.08)',
      border: active ? (player === 'RED' ? '2.5px solid #e53935' : '2.5px solid #fbc02d') : '2.5px solid var(--border)',
      transition: 'all 0.2s',
      minWidth: 'clamp(120px, 40vw, 160px)',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: player === 'RED' ? 'radial-gradient(circle at 30% 30%, #ff8a80 0%, #e53935 70%, #b71c1c 100%)' : 'radial-gradient(circle at 30% 30%, #fff59d 0%, #fbc02d 70%, #f57c00 100%)', boxShadow: '0 1px 6px rgba(60,80,180,0.10)', border: '2px solid #fff6' }} />
      <span>{name}</span>
      {active && <span style={{ marginLeft: 10, background: 'rgba(255,255,255,0.18)', color: '#fff', borderRadius: 8, padding: '2px 10px', fontWeight: 800, fontSize: '0.98em', boxShadow: '0 1px 6px #fff3' }}>Your Turn</span>}
    </div>
  );

  const gameAnnouncement =
    gameState.gameStatus === Connect4GameStatus.WIN
      ? `${gameState.winner === 'RED' ? player1Name : player2Name} wins`
      : gameState.gameStatus === Connect4GameStatus.DRAW
      ? "Game ended in a draw"
      : `${getPlayerDisplayName(gameState.currentPlayer)} turn`;

  return (
    <div className="game-screen" style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <ConfettiBurst trigger={confetti} />
      <div aria-live="polite" className="sr-only">{gameAnnouncement}</div>
      {/* Game Area Card */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 28,
        boxShadow: '0 8px 32px rgba(60,80,180,0.10)',
        padding: '36px 32px 32px 32px',
        maxWidth: 520,
        width: '100%',
        margin: '48px 0 0 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}>
        {/* Pills Row */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
          gap: 8,
          flexWrap: 'wrap',
        }}>
          {playerPill('RED', gameState.currentPlayer === 'RED' && gameState.gameStatus === Connect4GameStatus.PLAYING, player1Name)}
          {playerPill('YELLOW', gameState.currentPlayer === 'YELLOW' && gameState.gameStatus === Connect4GameStatus.PLAYING, getPlayerDisplayName('YELLOW'))}
        </div>
        {/* Board */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Connect4Board
            board={gameState.board}
            currentPlayer={gameState.currentPlayer}
            gameStatus={gameState.gameStatus}
            winningLine={gameState.winningLine}
            onColumnClick={isHumanTurn ? handleColumnClick : () => {}}
            disabled={gameState.gameStatus !== Connect4GameStatus.PLAYING || falling || !isHumanTurn}
            falling={falling}
            onFallOutEnd={handleFallOutEnd}
          />
        </div>
        {/* Action Buttons */}
        <div style={{ marginTop: 24, width: '100%', display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handlePlayAgain}
            aria-label="Start a new game"
            style={{
              padding: '14px 36px',
              borderRadius: 14,
              background: 'linear-gradient(90deg, #1976d2 0%, #43e97b 100%)',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.1em',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(67,233,123,0.13)',
              marginTop: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <FaPlay style={{ marginRight: 10 }} /> New Game
          </button>
          <button
            onClick={handleUndo}
            disabled={gameHistory.length <= 1 || gameState.gameStatus !== Connect4GameStatus.PLAYING || aiThinking}
            aria-label="Undo last move"
            style={{
              padding: '14px 20px',
              borderRadius: 14,
              background: gameHistory.length > 1 && gameState.gameStatus === Connect4GameStatus.PLAYING && !aiThinking ? 'var(--surface)' : '#f5f5f5',
              color: gameHistory.length > 1 && gameState.gameStatus === Connect4GameStatus.PLAYING && !aiThinking ? 'var(--primary)' : '#999',
              fontWeight: 800,
              fontSize: '1.1em',
              border: `2px solid ${gameHistory.length > 1 && gameState.gameStatus === Connect4GameStatus.PLAYING && !aiThinking ? 'var(--primary)' : '#ccc'}`,
              cursor: gameHistory.length > 1 && gameState.gameStatus === Connect4GameStatus.PLAYING && !aiThinking ? 'pointer' : 'not-allowed',
              marginTop: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <FaUndo style={{ marginRight: 8 }} /> Undo
          </button>
          <button
            onClick={() => setShowStats(true)}
            aria-label="Open game statistics"
            style={{
              padding: '14px 20px',
              borderRadius: 14,
              background: 'var(--surface)',
              color: 'var(--primary)',
              fontWeight: 800,
              fontSize: '1.1em',
              border: '2px solid var(--primary)',
              cursor: 'pointer',
              marginTop: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <FaChartLine style={{ marginRight: 8 }} /> Stats
          </button>
          <button
            onClick={() => setShowThemes(true)}
            aria-label="Open theme selector"
            style={{
              padding: '14px 20px',
              borderRadius: 14,
              background: 'var(--surface)',
              color: 'var(--primary)',
              fontWeight: 800,
              fontSize: '1.1em',
              border: '2px solid var(--primary)',
              cursor: 'pointer',
              marginTop: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <FaPalette style={{ marginRight: 8 }} /> Themes
          </button>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="c4-modal-overlay">
          <div className="c4-modal" role="dialog" aria-modal="true" aria-label="Game result">
            {gameState.gameStatus === Connect4GameStatus.WIN && gameState.winner && (
              <>
                <h2 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '2em', marginBottom: 16 }}>{(gameState.winner === 'RED' ? player1Name : player2Name)} Wins!</h2>
                <div className="c4-modal-winner" style={{ background: gameState.winner === 'RED' ? 'radial-gradient(circle at 30% 30%, #ff8a80 0%, #e53935 70%, #b71c1c 100%)' : 'radial-gradient(circle at 30% 30%, #fff59d 0%, #fbc02d 70%, #f57c00 100%)' }} />
              </>
            )}
            {gameState.gameStatus === Connect4GameStatus.DRAW && (
              <h2 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '2em', marginBottom: 16 }}>It's a Draw!</h2>
            )}
            <div className="c4-modal-actions">
              <button
                onClick={handlePlayAgain}
                aria-label="Play again"
                style={{
                  padding: '16px 0',
                  borderRadius: 14,
                  background: 'linear-gradient(90deg, #1976d2 0%, #43e97b 100%)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.2em',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(67,233,123,0.13)',
                  marginTop: 8,
                  width: 180,
                  transition: 'all 0.2s ease'
                }}
              >
                <FaPlay style={{ marginRight: 10 }} /> Play Again
              </button>
              <button
                onClick={handleReturnToPortal}
                aria-label="Back to main menu"
                style={{
                  padding: '16px 0',
                  borderRadius: 14,
                  background: 'var(--surface)',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '1.2em',
                  border: '2px solid var(--primary)',
                  cursor: 'pointer',
                  marginTop: 8,
                  width: 180,
                  transition: 'all 0.2s ease'
                }}
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Statistics Modal */}
      {showStats && (
        <div className="c4-modal-overlay">
          <div className="c4-modal" role="dialog" aria-modal="true" aria-label="Game statistics" style={{ maxWidth: 500, width: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <FaTrophy style={{ color: '#ffd600', fontSize: '1.5em' }} />
              <h2 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.8em', margin: 0 }}>Game Statistics</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'var(--background)', padding: 16, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '2em', fontWeight: 800, color: 'var(--primary)' }}>{gameStats.totalGames}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Total Games</div>
              </div>
              <div style={{ background: 'var(--background)', padding: 16, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '2em', fontWeight: 800, color: '#43a047' }}>{Connect4Stats.getWinRate()}%</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Win Rate</div>
              </div>
              <div style={{ background: 'var(--background)', padding: 16, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '2em', fontWeight: 800, color: '#e53935' }}>{gameStats.wins}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Wins</div>
              </div>
              <div style={{ background: 'var(--background)', padding: 16, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '2em', fontWeight: 800, color: '#fbc02d' }}>{gameStats.bestWinStreak}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Best Streak</div>
              </div>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: 12, fontSize: '1.2em' }}>vs AI Performance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {(['easy', 'medium', 'hard'] as const).map(difficulty => {
                  const stats = gameStats.gamesVsAI[difficulty];
                  const total = stats.wins + stats.losses + stats.draws;
                  const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;
                  return (
                    <div key={difficulty} style={{ background: 'var(--background)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, textTransform: 'capitalize', marginBottom: 4 }}>{difficulty}</div>
                      <div style={{ fontSize: '1.2em', fontWeight: 800, color: winRate >= 50 ? '#43a047' : '#e53935' }}>{winRate}%</div>
                      <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>{total} games</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="c4-modal-actions">
              <button
                onClick={() => setShowStats(false)}
                aria-label="Close statistics"
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: 'var(--primary)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1em',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all statistics?')) {
                    Connect4Stats.resetStats();
                    setGameStats(Connect4Stats.loadStats());
                  }
                }}
                aria-label="Reset statistics"
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: 'transparent',
                  color: '#e53935',
                  fontWeight: 700,
                  fontSize: '1em',
                  border: '2px solid #e53935',
                  cursor: 'pointer',
                  marginLeft: 12,
                  transition: 'all 0.2s ease'
                }}
              >
                Reset Stats
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Theme Selection Modal */}
      {showThemes && (
        <div className="c4-modal-overlay">
          <div className="c4-modal" role="dialog" aria-modal="true" aria-label="Choose board theme" style={{ maxWidth: 600, width: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <FaPalette style={{ color: 'var(--primary)', fontSize: '1.5em' }} />
              <h2 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.8em', margin: 0 }}>Choose Theme</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
              {CONNECT4_THEMES.map(theme => (
                <div
                  key={theme.id}
                  onClick={() => {
                    const newTheme = ThemeManager.setTheme(theme.id);
                    setCurrentTheme(newTheme);
                    soundEffects.playClick();
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${theme.name} theme`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const newTheme = ThemeManager.setTheme(theme.id);
                      setCurrentTheme(newTheme);
                      soundEffects.playClick();
                    }
                  }}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: currentTheme.id === theme.id ? '3px solid var(--primary)' : '2px solid var(--border)',
                    background: 'var(--background)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {/* Theme Preview */}
                  <div style={{
                    width: '100%',
                    height: 80,
                    borderRadius: 8,
                    background: theme.colors.background,
                    marginBottom: 12,
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      gap: 4
                    }}>
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: theme.colors.player1.gradient,
                        boxShadow: theme.colors.player1.shadow
                      }} />
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: theme.colors.player2.gradient,
                        boxShadow: theme.colors.player2.shadow
                      }} />
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1em', marginBottom: 4, color: 'var(--text)' }}>
                      {theme.name}
                    </div>
                    <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                      {theme.description}
                    </div>
                  </div>
                  
                  {currentTheme.id === theme.id && (
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8em',
                      fontWeight: 800
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="c4-modal-actions">
              <button
                onClick={() => setShowThemes(false)}
                aria-label="Done choosing theme"
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: 'var(--primary)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1em',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connect4Game; 