import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaGamepad, FaArrowLeft, FaPlay, FaRobot, FaUsers, FaPalette, FaChartBar } from 'react-icons/fa';

const GAME_MODES = [
  { key: 'AI', label: 'vs AI', icon: <FaRobot /> },
  { key: 'PVP', label: 'Player vs Player', icon: <FaUsers /> },
];
const DIFFICULTIES = [
  { key: 'EASY', label: 'Easy', emoji: '😃' },
  { key: 'MEDIUM', label: 'Medium', emoji: '😎' },
  { key: 'HARD', label: 'Hard', emoji: '🤖' },
];

const Connect4Setup: React.FC = () => {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState('AI');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');

  const handleStartGame = () => {
    localStorage.setItem('connect4Settings', JSON.stringify({
      gameMode,
      difficulty,
      player1Name,
      player2Name
    }));
    navigate('/connect4');
  };

  const handleBackToPortal = () => {
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Connect 4 Setup - DoStrike Gaming Portal</title>
        <meta name="description" content="Configure your Connect 4 game settings. Choose AI or Player vs Player mode, difficulty level, and player names." />
        <link rel="canonical" href="https://dostrike.com/connect4-setup" />
      </Helmet>
      <div className="home-screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
        {/* Header */}
        <div style={{ 
          padding: '24px 20px', 
          background: 'var(--surface)', 
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            maxWidth: 1200, 
            margin: '0 auto', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button 
                onClick={handleBackToPortal}
                style={{
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 20px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.95em',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(30,136,229,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,136,229,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(30,136,229,0.3)';
                }}
              >
                <FaArrowLeft /> Back to Portal
              </button>
              <div>
                <h1 style={{ color: 'var(--primary)', fontSize: '2.2em', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FaGamepad />
                  Connect 4
                </h1>
                <p style={{ color: 'var(--text)', margin: '4px 0 0 0', fontSize: '1.1em', opacity: 0.8 }}>
                  Configure your game settings
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: 1000, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
            {/* About Card */}
            <div style={{
              background: 'var(--surface)',
              borderRadius: 20,
              padding: 32,
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              textAlign: 'center'
            }}>
              {/* Connect 4 Visual Cover */}
              <div style={{
                width: '100%',
                height: 300,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
              }}>
                {/* Connect 4 Board Illustration */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gridTemplateRows: 'repeat(6, 1fr)',
                  gap: 6,
                  width: 180,
                  height: 150
                }}>
                  {Array.from({ length: 42 }, (_, i) => (
                    <div key={i} style={{
                      background: i % 7 === 2 || i % 7 === 4 ? 'rgba(255,235,59,0.85)' : i % 7 === 3 ? 'rgba(229,57,53,0.85)' : 'rgba(255,255,255,0.18)',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2em',
                      fontWeight: 'bold',
                      color: 'white',
                      backdropFilter: 'blur(10px)'
                    }}>
                      {''}
                    </div>
                  ))}
                </div>
              </div>
              <h2 style={{ color: 'var(--primary)', fontSize: '2em', fontWeight: 800, margin: '0 0 16px 0' }}>
                About Connect 4
              </h2>
              <p style={{ color: 'var(--text)', lineHeight: 1.7, margin: '0 0 24px 0', fontSize: '1.1em', opacity: 0.9 }}>
                The classic vertical strategy game. Drop your discs and be the first to get four in a row to win!
              </p>
              <div style={{ textAlign: 'left' }}>
                <ul style={{ color: 'var(--text)', margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                  <li style={{ marginBottom: 8 }}><FaRobot style={{ marginRight: 8 }} /> Play against AI with multiple difficulty levels</li>
                  <li style={{ marginBottom: 8 }}><FaUsers style={{ marginRight: 8 }} /> Player vs Player mode for local multiplayer</li>
                  <li style={{ marginBottom: 8 }}><FaPalette style={{ marginRight: 8 }} /> Beautiful themes and smooth animations</li>
                  <li style={{ marginBottom: 8 }}><FaChartBar style={{ marginRight: 8 }} /> Score tracking and game statistics</li>
                </ul>
              </div>
            </div>
            {/* Game Setup Options */}
            <div style={{
              background: 'var(--surface)',
              borderRadius: 20,
              padding: 32,
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              height: 'fit-content'
            }}>
              <h2 style={{ color: 'var(--primary)', fontSize: '2em', fontWeight: 800, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                ⚙️ Game Settings
              </h2>
              {/* Game Mode */}
              <div className="option-group" style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', marginBottom: 16, fontWeight: 700, color: 'var(--text)', fontSize: '1.1em' }}>
                  Game Mode
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {GAME_MODES.map(mode => (
                    <button
                      key={mode.key}
                      onClick={() => setGameMode(mode.key)}
                      style={{
                        flex: 1,
                        padding: '16px 20px',
                        border: gameMode === mode.key ? '2px solid var(--primary)' : '2px solid var(--border)',
                        borderRadius: 12,
                        background: gameMode === mode.key ? 'var(--primary)' : 'var(--surface)',
                        color: gameMode === mode.key ? 'white' : 'var(--text)',
                        cursor: 'pointer',
                        fontSize: '1em',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {mode.icon}
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* AI Difficulty */}
              {gameMode === 'AI' && (
                <div className="option-group" style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', marginBottom: 16, fontWeight: 700, color: 'var(--text)', fontSize: '1.1em' }}>
                    AI Difficulty
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {DIFFICULTIES.map(diff => (
                      <button
                        key={diff.key}
                        onClick={() => setDifficulty(diff.key)}
                        style={{
                          flex: 1,
                          padding: '14px 0',
                          border: difficulty === diff.key ? '2px solid var(--primary)' : '2px solid var(--border)',
                          borderRadius: 12,
                          background: difficulty === diff.key ? 'var(--primary)' : 'var(--surface)',
                          color: difficulty === diff.key ? 'white' : 'var(--text)',
                          cursor: 'pointer',
                          fontSize: '1em',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '1.2em' }}>{diff.emoji}</span>
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Player Names */}
              <div className="option-group" style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', marginBottom: 16, fontWeight: 700, color: 'var(--text)', fontSize: '1.1em' }}>
                  Player Names
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    type="text"
                    value={player1Name}
                    onChange={e => setPlayer1Name(e.target.value)}
                    placeholder="Player 1"
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      border: '2px solid var(--border)',
                      borderRadius: 12,
                      fontSize: '1em',
                      fontWeight: 500,
                      color: 'var(--text)',
                      background: 'var(--background)',
                      outline: 'none',
                      transition: 'border 0.2s'
                    }}
                  />
                  <input
                    type="text"
                    value={player2Name}
                    onChange={e => setPlayer2Name(e.target.value)}
                    placeholder={gameMode === 'AI' ? 'AI' : 'Player 2'}
                    disabled={gameMode === 'AI'}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      border: '2px solid var(--border)',
                      borderRadius: 12,
                      fontSize: '1em',
                      fontWeight: 500,
                      color: 'var(--text)',
                      background: 'var(--background)',
                      outline: 'none',
                      transition: 'border 0.2s',
                      opacity: gameMode === 'AI' ? 0.6 : 1
                    }}
                  />
                </div>
              </div>
              {/* Start Game Button */}
              <button
                onClick={handleStartGame}
                style={{
                  width: '100%',
                  padding: '18px 0',
                  borderRadius: 14,
                  background: 'linear-gradient(90deg, #1976d2 0%, #43e97b 100%)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.2em',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(67,233,123,0.13)',
                  marginTop: 8,
                  transition: 'all 0.2s ease'
                }}
              >
                <FaPlay style={{ marginRight: 10 }} /> Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Connect4Setup; 