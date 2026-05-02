import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaPlay, FaRobot, FaUsers, FaPalette, FaChartBar, FaLink } from 'react-icons/fa';
import BackToPortal from './BackToPortal';
import { socket } from '../socket';
import { useEffect } from 'react';

type JoinRoomResponse = {
  success: boolean;
  message?: string;
};

const GAME_MODES = [
  { key: 'AI', label: 'vs AI', icon: <FaRobot /> },
  { key: 'PVP', label: 'Player vs Player', icon: <FaUsers /> },
  { key: 'PRIVATE', label: 'Private Room', icon: <FaLink /> },
];
const DIFFICULTIES = [
  { key: 'EASY', label: 'Easy', emoji: '😃' },
  { key: 'MEDIUM', label: 'Medium', emoji: '😎' },
  { key: 'HARD', label: 'Hard', emoji: '🤖' },
];

const TicTacToeSetup: React.FC = () => {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState('AI');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const waitingRef = useRef(false);
  const createRoomTimeoutRef = useRef<number | null>(null);
  const joinRoomTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    waitingRef.current = waiting;
  }, [waiting]);

  useEffect(() => {
    return () => {
      if (createRoomTimeoutRef.current) {
        window.clearTimeout(createRoomTimeoutRef.current);
      }
      if (joinRoomTimeoutRef.current) {
        window.clearTimeout(joinRoomTimeoutRef.current);
      }
    };
  }, []);

  // Socket connection status
  useEffect(() => {
    const handleConnect = () => {
      console.log('[SETUP] Socket connected');
      setIsConnected(true);
      setError('');
    };

    const handleDisconnect = () => {
      console.log('[SETUP] Socket disconnected');
      setIsConnected(false);
      setError('Connection lost. Please refresh the page.');
      setWaiting(false);
    };

    const handleConnectError = (error: Error) => {
      console.log('[SETUP] Socket connection error:', error);
      setIsConnected(false);
      setError('Failed to connect to server. Please check if the server is running.');
      setWaiting(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Check initial connection status
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  // Socket.IO event handlers
  useEffect(() => {
    socket.off('startGame');
    socket.on('startGame', ({ roomId }: { roomId: string }) => {
      console.log('[SETUP] Game starting with roomId:', roomId);
      setWaiting(false);
      localStorage.setItem('tictactoeRoom', roomId);
      navigate('/tictactoe-private', { state: { roomId, isPrivate: true } });
    });
    socket.off('opponentLeft');
    socket.on('opponentLeft', () => {
      console.log('[SETUP] Opponent left the room');
      setError('Opponent left the room.');
      setWaiting(false);
      setRoomId('');
    });
    return () => {
      socket.off('startGame');
      socket.off('opponentLeft');
    };
  }, [navigate]);

  useEffect(() => {
    const socketWithOnAny = socket as unknown as { onAny?: (cb: (event: string, ...args: unknown[]) => void) => void };
    socketWithOnAny.onAny?.((event: string, ...args: unknown[]) => console.log('[SETUP SOCKET EVENT]', event, args));
    console.log('[SETUP SOCKET] socket.id:', socket.id);
  }, []);

  const handleStartGame = () => {
    localStorage.setItem('gameSettings', JSON.stringify({
      gameMode,
      difficulty,
      player1Name,
      player2Name
    }));
    
    // Navigate to different routes based on game mode
    if (gameMode === 'PRIVATE') {
      // Private room games use the PrivateTicTacToe component
      navigate('/tictactoe-private', { state: { roomId, isPrivate: true } });
    } else {
      // AI and Player vs Player use the regular GameScreen
      navigate('/tictactoe');
    }
  };

  // Private room logic
  const handleCreateRoom = () => {
    if (!isConnected) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }

    setWaiting(true);
    setError('');
    console.log('[SETUP] Creating room...');
    if (createRoomTimeoutRef.current) {
      window.clearTimeout(createRoomTimeoutRef.current);
    }
    
    socket.emit('createRoom', (id: string) => {
      console.log('[SETUP] Room created with ID:', id);
      setRoomId(id);
      setWaiting(false);
      if (createRoomTimeoutRef.current) {
        window.clearTimeout(createRoomTimeoutRef.current);
        createRoomTimeoutRef.current = null;
      }
    });

    // Add timeout in case callback never comes
    createRoomTimeoutRef.current = window.setTimeout(() => {
      if (waitingRef.current) {
        console.log('[SETUP] Room creation timeout');
        setError('Room creation timed out. Please try again.');
        setWaiting(false);
      }
      createRoomTimeoutRef.current = null;
    }, 5000);
  };

  const handleJoinRoom = () => {
    if (!isConnected) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }

    if (!joinRoomId.trim()) {
      setError('Please enter a room code.');
      return;
    }

    setWaiting(true);
    setError('');
    console.log('[SETUP] Joining room:', joinRoomId.trim().toUpperCase());
    if (joinRoomTimeoutRef.current) {
      window.clearTimeout(joinRoomTimeoutRef.current);
    }
    
    socket.emit('joinRoom', joinRoomId.trim().toUpperCase(), (res: JoinRoomResponse) => {
      console.log('[SETUP] Join room response:', res);
      if (res.success) {
        setRoomId(joinRoomId.trim().toUpperCase());
        setWaiting(false);
      } else {
        setError(res.message || 'Failed to join room.');
        setWaiting(false);
      }
      if (joinRoomTimeoutRef.current) {
        window.clearTimeout(joinRoomTimeoutRef.current);
        joinRoomTimeoutRef.current = null;
      }
    });

    // Add timeout in case callback never comes
    joinRoomTimeoutRef.current = window.setTimeout(() => {
      if (waitingRef.current) {
        console.log('[SETUP] Join room timeout');
        setError('Join room timed out. Please try again.');
        setWaiting(false);
      }
      joinRoomTimeoutRef.current = null;
    }, 5000);
  };

  return (
    <>
      <Helmet>
        <title>Tic-Tac-Toe Setup - DoStrike Gaming Portal</title>
        <meta name="description" content="Configure your Tic-Tac-Toe game settings. Choose AI or Player vs Player mode, difficulty level, and player names." />
        <link rel="canonical" href="https://dostrike.com/tictactoe-setup" />
      </Helmet>
      <div className="home-screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
        {/* Header */}
        <div style={{ padding: '24px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <BackToPortal variant="inline" />
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', margin: '0 0 4px 0' }}>
                Tic-Tac-Toe
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--text)', opacity: 0.7, margin: 0 }}>
                Configure your game settings
              </p>
            </div>
            <div style={{ width: '120px' }}></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '40px 20px', background: 'var(--background)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
              
              {/* About Tic-Tac-Toe Card */}
              <div style={{
                background: 'var(--surface)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid var(--border)'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)', margin: '0 0 24px 0' }}>
                  About Tic-Tac-Toe
                </h2>
                
                {/* Game Board Preview */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4px',
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 24px auto',
                  background: 'var(--border)',
                  padding: '4px',
                  borderRadius: '8px'
                }}>
                  {['X', '', 'O', '', 'O', '', 'X', '', ''].map((cell, index) => (
                    <div key={index} style={{
                      background: 'var(--background)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: '700',
                      color: cell === 'X' ? '#e53e3e' : '#3182ce'
                    }}>
                      {cell}
                    </div>
                  ))}
                </div>
                
                <p style={{ fontSize: '16px', color: 'var(--text)', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                  The classic strategy game where you need to get three in a row. Challenge the AI or play against a friend!
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)' }}>
                    <FaRobot style={{ color: 'var(--primary)' }} />
                    <span>Play against AI with multiple difficulty levels</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)' }}>
                    <FaUsers style={{ color: 'var(--primary)' }} />
                    <span>Player vs Player mode for local multiplayer</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)' }}>
                    <FaPalette style={{ color: 'var(--primary)' }} />
                    <span>Beautiful themes and smooth animations</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)' }}>
                    <FaChartBar style={{ color: 'var(--primary)' }} />
                    <span>Score tracking and game statistics</span>
                  </div>
                </div>
              </div>

              {/* Game Settings Card */}
              <div style={{
                background: 'var(--surface)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid var(--border)'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)', margin: '0 0 24px 0' }}>
                  Game Settings
                </h2>

                {/* Game Mode */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>
                    Game Mode
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {GAME_MODES.map((mode) => (
                      <label key={mode.key} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: gameMode === mode.key ? 'var(--primary)' : 'var(--background)',
                        color: gameMode === mode.key ? 'white' : 'var(--text)',
                        border: `2px solid ${gameMode === mode.key ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                        <input
                          type="radio"
                          name="gameMode"
                          value={mode.key}
                          checked={gameMode === mode.key}
                          onChange={(e) => setGameMode(e.target.value)}
                          style={{ display: 'none' }}
                        />
                        {mode.icon}
                        <span style={{ fontWeight: '500' }}>{mode.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* AI Difficulty (only show for AI mode) */}
                {gameMode === 'AI' && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>
                      AI Difficulty
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {DIFFICULTIES.map((diff) => (
                        <button
                          key={diff.key}
                          onClick={() => setDifficulty(diff.key)}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            background: difficulty === diff.key ? 'var(--primary)' : 'var(--background)',
                            color: difficulty === diff.key ? 'white' : 'var(--text)',
                            border: `2px solid ${difficulty === diff.key ? 'var(--primary)' : 'var(--border)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontSize: '16px', marginBottom: '4px' }}>{diff.emoji}</div>
                          {diff.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Player Names */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>
                    Player Names
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="text"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      placeholder="Player 1"
                      style={{
                        padding: '12px 16px',
                        border: '2px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: 'var(--background)',
                        color: 'var(--text)',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      placeholder="Player 2"
                      style={{
                        padding: '12px 16px',
                        border: '2px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: 'var(--background)',
                        color: 'var(--text)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Private Room Section */}
                {gameMode === 'PRIVATE' && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>
                      Room Code
                    </label>
                    
                    {/* Connection Status */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '12px',
                      padding: '8px 12px',
                      background: isConnected ? '#d4edda' : '#f8d7da',
                      color: isConnected ? '#155724' : '#721c24',
                      border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isConnected ? '#28a745' : '#dc3545'
                      }}></div>
                      {isConnected ? 'Connected to server' : 'Not connected to server'}
                    </div>
                    {!roomId ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                          onClick={handleCreateRoom}
                          disabled={waiting || !isConnected}
                          style={{
                            padding: '12px 16px',
                            background: !isConnected ? 'var(--border)' : 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: (waiting || !isConnected) ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            opacity: (waiting || !isConnected) ? 0.6 : 1
                          }}
                        >
                          {!isConnected ? 'Server Offline' : waiting ? 'Creating Room...' : 'Create New Room'}
                        </button>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={joinRoomId}
                            onChange={(e) => setJoinRoomId(e.target.value)}
                            placeholder="Enter room code"
                            style={{
                              flex: 1,
                              padding: '12px 16px',
                              border: '2px solid var(--border)',
                              borderRadius: '8px',
                              fontSize: '16px',
                              background: 'var(--background)',
                              color: 'var(--text)',
                              outline: 'none'
                            }}
                          />
                          <button
                            onClick={handleJoinRoom}
                            disabled={waiting || !joinRoomId.trim() || !isConnected}
                            style={{
                              padding: '12px 16px',
                              background: !isConnected ? 'var(--border)' : 'var(--secondary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: (waiting || !joinRoomId.trim() || !isConnected) ? 'not-allowed' : 'pointer',
                              fontSize: '16px',
                              fontWeight: '600',
                              opacity: (waiting || !joinRoomId.trim() || !isConnected) ? 0.6 : 1
                            }}
                          >
                            {!isConnected ? 'Offline' : 'Join'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '16px',
                        background: 'var(--background)',
                        border: '2px solid var(--primary)',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}>
                          Room Code:
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '2px' }}>
                          {roomId}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.7, marginTop: '8px' }}>
                          Share this code with your friend
                        </div>
                      </div>
                    )}
                    {error && (
                      <div style={{
                        padding: '12px 16px',
                        background: '#fed7d7',
                        color: '#c53030',
                        border: '1px solid #feb2b2',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginTop: '12px'
                      }}>
                        {error}
                      </div>
                    )}
                  </div>
                )}

                {/* Start Game Button */}
                <button
                  onClick={handleStartGame}
                  disabled={gameMode === 'PRIVATE' && !roomId}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: gameMode === 'PRIVATE' && !roomId ? 'var(--border)' : 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: gameMode === 'PRIVATE' && !roomId ? 'not-allowed' : 'pointer',
                    fontSize: '18px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    opacity: gameMode === 'PRIVATE' && !roomId ? 0.6 : 1
                  }}
                >
                  <FaPlay />
                  Start Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicTacToeSetup;
