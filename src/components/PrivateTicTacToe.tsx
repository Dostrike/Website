import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft, FaUser, FaUserFriends, FaTrophy, FaChartBar, FaSpinner } from 'react-icons/fa';
import { socket } from '../socket';
import './GameScreen.css';

interface GameState {
  board: (string | null)[][];
  currentPlayer: 'X' | 'O';
  gameStatus: 'PLAYING' | 'WIN' | 'DRAW';
  winner: string | null;
}

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
}

const PrivateTicTacToe: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, isPrivate } = location.state || {};
  
  const [gameState, setGameState] = useState<GameState>({
    board: Array(3).fill(null).map(() => Array(3).fill(null)),
    currentPlayer: 'X',
    gameStatus: 'PLAYING',
    winner: null
  });
  
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  const [gameStats, setGameStats] = useState<GameStats>({ wins: 0, losses: 0, draws: 0 });
  const eventListenersSetup = useRef(false);
  const playerSymbolRef = useRef<'X' | 'O' | null>(null);
  const gameNumberRef = useRef(0); // Track game number for alternating first turns
  const [isNewGameRequested, setIsNewGameRequested] = useState(false);
  const [readyCount, setReadyCount] = useState(0);

  // Safety mechanism: clear waiting state if it persists too long
  useEffect(() => {
    if (isNewGameRequested) {
      const timeoutId = setTimeout(() => {
        console.log('[PRIVATE GAME] Safety timeout: clearing waiting state after 30 seconds');
        setIsNewGameRequested(false);
      }, 30000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isNewGameRequested]);

  useEffect(() => {
    console.log('[PRIVATE GAME] useEffect triggered with roomId:', roomId, 'isPrivate:', isPrivate);
    if (!roomId || !isPrivate) {
      console.log('[PRIVATE GAME] Missing roomId or isPrivate, navigating to setup');
      navigate('/tictactoe-setup');
      return;
    }

    // Only set up event listeners once globally
    if (!eventListenersSetup.current) {
      console.log('[PRIVATE GAME] Setting up global event listeners');
      
      // Listen for opponent moves
      socket.on('opponentMove', (move: { row: number; col: number; symbol: string }) => {
        console.log('[PRIVATE GAME] Opponent move:', move);
        setGameState(prev => {
          const newBoard = [...prev.board];
          newBoard[move.row][move.col] = move.symbol;
          
          // Determine the next player
          const nextPlayer = move.symbol === 'X' ? 'O' : 'X';
          
          const newGameState = {
            ...prev,
            board: newBoard,
            currentPlayer: nextPlayer as 'X' | 'O'
          };
          
          // Check for win/draw
          const gameStatus = checkGameStatus(newBoard, move.symbol);
          if (gameStatus === 'WIN') {
            newGameState.gameStatus = 'WIN';
            newGameState.winner = move.symbol;
            updateGameStats('WIN', move.symbol);
          } else if (gameStatus === 'DRAW') {
            newGameState.gameStatus = 'DRAW';
            newGameState.winner = null;
            updateGameStats('DRAW', null);
          }
          
          return newGameState;
        });
        
        // The opponent just moved, so now it should be this player's turn
        const nextPlayer = move.symbol === 'X' ? 'O' : 'X';
        const shouldBeMyTurn = playerSymbolRef.current === nextPlayer;
        console.log('[PRIVATE GAME] Opponent moved, setting isMyTurn to:', shouldBeMyTurn, 'for player:', playerSymbolRef.current, 'next player:', nextPlayer);
        setIsMyTurn(shouldBeMyTurn);
        
        // Additional check to ensure turn is set correctly
        if (shouldBeMyTurn) {
          console.log('[PRIVATE GAME] ✅ It is now my turn to play');
        } else {
          console.log('[PRIVATE GAME] ❌ It is not my turn to play');
        }
      });

      // Listen for opponent leaving
      socket.on('opponentLeft', () => {
        console.log('[PRIVATE GAME] Opponent left');
        setError('Opponent left the game. You can start a new game or return to the portal.');
        setOpponentConnected(false);
        setGameStarted(false);
        setIsMyTurn(false);
      });

      // Listen for players' ready state during rematch
      socket.on('playersReadyState', ({ roomId: gameRoomId, readyPlayers }: { roomId: string, readyPlayers: string[] }) => {
        console.log('[PRIVATE GAME] playersReadyState:', { gameRoomId, readyPlayers });
        setReadyCount(Array.isArray(readyPlayers) ? readyPlayers.length : 0);
      });

      // Listen for waiting for new game
      socket.on('waitingForNewGame', ({ roomId: gameRoomId, waitingPlayer, readyPlayers }: { roomId: string, waitingPlayer: string, readyPlayers: string[] }) => {
        console.log('[PRIVATE GAME] Received waitingForNewGame event for room:', gameRoomId);
        console.log('[PRIVATE GAME] Waiting player:', waitingPlayer, 'Ready players:', readyPlayers);
        
        // If this player is not the one waiting, show a message that opponent is waiting
        if (waitingPlayer !== socket.id) {
          setError('Opponent is ready. Click New Game to start.');
        }
      });

      // Listen for new game requests from opponent
      socket.on('newGameRequested', ({ roomId: gameRoomId }: { roomId: string }) => {
        console.log('[PRIVATE GAME] Received newGameRequested event for room:', gameRoomId);
        setIsNewGameRequested(false);
        console.log('[PRIVATE GAME] Cleared waiting state for new game');
        gameNumberRef.current += 1;
        console.log('[PRIVATE GAME] Incremented game number to:', gameNumberRef.current);
        const firstPlayer = gameNumberRef.current % 2 === 0 ? 'X' : 'O';
        console.log('[PRIVATE GAME] First player for this game:', firstPlayer);
        const newGameState = {
          board: Array(3).fill(null).map(() => Array(3).fill(null)),
          currentPlayer: firstPlayer as 'X' | 'O',
          gameStatus: 'PLAYING' as const,
          winner: null
        };
        setGameState(newGameState);
        console.log('[PRIVATE GAME] Reset game state with first player:', firstPlayer);
        const shouldBeMyTurn = playerSymbolRef.current === firstPlayer;
        setIsMyTurn(shouldBeMyTurn);
        console.log('[PRIVATE GAME] Set isMyTurn to:', shouldBeMyTurn, 'for player:', playerSymbolRef.current);
        setError('');
        setReadyCount(0);
      });

      // Listen for game start
      socket.on('startGame', ({ roomId: gameRoomId }: { roomId: string }) => {
        console.log('[PRIVATE GAME] Game starting in room:', gameRoomId);
        console.log('[PRIVATE GAME] Current player symbol:', playerSymbolRef.current);
        setGameStarted(true);
        setOpponentConnected(true);
        setError('');
        
        // Initialize game number for first game (X goes first)
        gameNumberRef.current = 0;
        
        // Make sure X goes first for the first game
        const shouldBeMyTurn = playerSymbolRef.current === 'X';
        console.log('[PRIVATE GAME] Setting isMyTurn to:', shouldBeMyTurn, 'for player:', playerSymbolRef.current);
        setIsMyTurn(shouldBeMyTurn);
        
        // Also update the game state to ensure currentPlayer is set correctly
        setGameState(prev => ({
          ...prev,
          currentPlayer: 'X' as 'X' | 'O'
        }));
      });
      
      eventListenersSetup.current = true;
    }

    // Get initial player info and check if game should start
    socket.emit('getPlayerInfo', roomId, (info: { symbol: 'X' | 'O' }) => {
      console.log('[PRIVATE GAME] Received player info:', info);
      setPlayerSymbol(info.symbol);
      playerSymbolRef.current = info.symbol;
      console.log('[PRIVATE GAME] Set playerSymbolRef to:', info.symbol);
      setIsMyTurn(info.symbol === 'X');
      console.log('[PRIVATE GAME] Set isMyTurn to:', info.symbol === 'X');
      
      // Check if both players are in the room
      socket.emit('checkRoomStatus', roomId, (status: { playerCount: number }) => {
        console.log('[PRIVATE GAME] Room status check:', status);
        if (status.playerCount >= 2) {
          console.log('[PRIVATE GAME] Both players connected, starting game');
          setGameStarted(true);
          setOpponentConnected(true);
          setError('');
          
          // Initialize game number for first game (X goes first)
          gameNumberRef.current = 0;
          
          // Make sure X goes first for the first game
          const shouldBeMyTurn = playerSymbolRef.current === 'X';
          console.log('[PRIVATE GAME] Setting isMyTurn to:', shouldBeMyTurn, 'for player:', playerSymbolRef.current);
          setIsMyTurn(shouldBeMyTurn);
        }
      });
    });

    // Immediate status check
    setTimeout(() => {
      if (!gameStarted && roomId) {
        console.log('[PRIVATE GAME] Immediate status check for room:', roomId);
        socket.emit('checkRoomStatus', roomId, (status: { playerCount: number }) => {
          console.log('[PRIVATE GAME] Immediate check result:', status);
          if (status.playerCount >= 2) {
            console.log('[PRIVATE GAME] Both players found in immediate check, starting game');
            setGameStarted(true);
            setOpponentConnected(true);
            setError('');
            
            // Initialize game number for first game (X goes first)
            gameNumberRef.current = 0;
            
            // Make sure X goes first for the first game
            const shouldBeMyTurn = playerSymbolRef.current === 'X';
            console.log('[PRIVATE GAME] Immediate check - Setting isMyTurn to:', shouldBeMyTurn, 'for player:', playerSymbolRef.current);
            setIsMyTurn(shouldBeMyTurn);
          }
        });
      }
    }, 100);

    // Removed periodic status check - it was causing turn management issues
    // The game will start when both players are connected via the immediate check above

    return () => {
      // Cleanup - no interval to clear anymore
    };
  }, [roomId, isPrivate, navigate]); // Removed playerSymbol to prevent re-runs

  // Add a useEffect to monitor currentPlayer changes and update isMyTurn accordingly
  useEffect(() => {
    if (gameStarted && playerSymbolRef.current) {
      const shouldBeMyTurn = gameState.currentPlayer === playerSymbolRef.current;
      console.log('[PRIVATE GAME] Current player changed to:', gameState.currentPlayer, 'my symbol:', playerSymbolRef.current, 'should be my turn:', shouldBeMyTurn);
      setIsMyTurn(shouldBeMyTurn);
    }
  }, [gameState.currentPlayer, gameStarted]);

  const checkGameStatus = (board: (string | null)[][], lastMove: string): 'PLAYING' | 'WIN' | 'DRAW' => {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] === lastMove && board[i][1] === lastMove && board[i][2] === lastMove) {
        return 'WIN';
      }
    }
    
    // Check columns
    for (let i = 0; i < 3; i++) {
      if (board[0][i] === lastMove && board[1][i] === lastMove && board[2][i] === lastMove) {
        return 'WIN';
      }
    }
    
    // Check diagonals
    if (board[0][0] === lastMove && board[1][1] === lastMove && board[2][2] === lastMove) {
      return 'WIN';
    }
    if (board[0][2] === lastMove && board[1][1] === lastMove && board[2][0] === lastMove) {
      return 'WIN';
    }
    
    // Check for draw
    if (board.every(row => row.every(cell => cell !== null))) {
      return 'DRAW';
    }
    
    return 'PLAYING';
  };

  const updateGameStats = (gameStatus: 'WIN' | 'DRAW', winner: string | null) => {
    setGameStats(prev => {
      if (gameStatus === 'DRAW') {
        return { ...prev, draws: prev.draws + 1 };
      } else if (gameStatus === 'WIN') {
        if (winner === playerSymbol) {
          return { ...prev, wins: prev.wins + 1 };
        } else {
          return { ...prev, losses: prev.losses + 1 };
        }
      }
      return prev;
    });
  };

  const handleCellClick = (row: number, col: number) => {
    console.log('[PRIVATE GAME] Cell clicked:', row, col);
    console.log('[PRIVATE GAME] isMyTurn:', isMyTurn);
    console.log('[PRIVATE GAME] playerSymbol:', playerSymbolRef.current);
    console.log('[PRIVATE GAME] gameStatus:', gameState.gameStatus);
    console.log('[PRIVATE GAME] cell is empty:', gameState.board[row][col] === null);
    console.log('[PRIVATE GAME] currentPlayer:', gameState.currentPlayer);
    console.log('[PRIVATE GAME] isNewGameRequested:', isNewGameRequested);
    
    if (!isMyTurn || gameState.board[row][col] !== null || gameState.gameStatus !== 'PLAYING' || isNewGameRequested) {
      console.log('[PRIVATE GAME] Move blocked - isMyTurn:', isMyTurn, 'cell empty:', gameState.board[row][col] === null, 'gameStatus:', gameState.gameStatus, 'isNewGameRequested:', isNewGameRequested);
      if (!isMyTurn) {
        console.log('[PRIVATE GAME] ❌ Move blocked because it is not my turn');
      }
      if (gameState.board[row][col] !== null) {
        console.log('[PRIVATE GAME] ❌ Move blocked because cell is not empty');
      }
      if (gameState.gameStatus !== 'PLAYING') {
        console.log('[PRIVATE GAME] ❌ Move blocked because game is not in PLAYING status');
      }
      if (isNewGameRequested) {
        console.log('[PRIVATE GAME] ❌ Move blocked because waiting for new game');
      }
      return;
    }

    const currentPlayerSymbol = playerSymbolRef.current;
    if (!currentPlayerSymbol) {
      console.log('[PRIVATE GAME] No player symbol set');
      return;
    }

    console.log('[PRIVATE GAME] ✅ Making move for player:', currentPlayerSymbol);

    const newBoard = gameState.board.map(r => [...r]);
    newBoard[row][col] = currentPlayerSymbol;
    
    const newGameStatus = checkGameStatus(newBoard, currentPlayerSymbol);
    const newWinner = newGameStatus === 'WIN' ? currentPlayerSymbol : null;
    
    // Determine the next player
    const nextPlayer = currentPlayerSymbol === 'X' ? 'O' : 'X';
    
    const newGameState = {
      ...gameState,
      board: newBoard,
      currentPlayer: nextPlayer as 'X' | 'O',
      gameStatus: newGameStatus,
      winner: newWinner
    };
    
    setGameState(newGameState);
    setIsMyTurn(false); // It's no longer my turn after I make a move
    
    // Update stats if game ended
    if (newGameStatus !== 'PLAYING') {
      updateGameStats(newGameStatus, newWinner);
    }
    
    // Send move to opponent
    socket.emit('makeMove', {
      roomId,
      move: { row, col, symbol: currentPlayerSymbol }
    });
  };

  const handleBackToPortal = () => {
    // Properly disconnect from the room before leaving
    if (roomId) {
      console.log('[PRIVATE GAME] Leaving room:', roomId);
      socket.emit('leaveRoom', roomId);
    }
    navigate('/');
  };

  const handleNewGame = () => {
    if (isNewGameRequested) return; // Prevent duplicate requests
    console.log('[PRIVATE GAME] Requesting new game...');
    setIsNewGameRequested(true);
    setReadyCount(1);
    setError('');
    socket.emit('requestNewGame', roomId);
  };

  if (!roomId || !isPrivate) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Private Tic-Tac-Toe - DoStrike Gaming Portal</title>
        <meta name="description" content="Play Tic-Tac-Toe with friends in a private room." />
      </Helmet>
      
      <div className="game-screen" style={{ minHeight: '100vh', background: 'var(--background)' }}>
        {/* Header */}
        <div style={{ padding: '20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={handleBackToPortal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <FaArrowLeft />
              Back to Portal
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)', margin: '0 0 4px 0' }}>
                Private Tic-Tac-Toe
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.7, margin: 0 }}>
                Room: {roomId}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUser style={{ color: playerSymbol === 'X' ? '#e53e3e' : '#3182ce' }} />
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>
                  You: {playerSymbol || '...'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUserFriends style={{ color: opponentConnected ? '#28a745' : '#dc3545' }} />
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>
                  {opponentConnected ? 'Opponent Connected' : 'Waiting for opponent...'}
                </span>
              </div>
              {gameState.gameStatus !== 'PLAYING' && isNewGameRequested && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '999px',
                  color: 'var(--text)'
                }}>
                  <FaSpinner className="spin" />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Rematch: {readyCount}/2 ready</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div style={{ flex: 1, padding: '40px 20px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
            
            {/* Main Game Area */}
            <div style={{ textAlign: 'center' }}>
              
              {/* Game Status */}
              <div style={{ marginBottom: '32px' }}>
                {!gameStarted ? (
                  <div style={{ fontSize: '18px', color: 'var(--text)' }}>
                    Waiting for opponent to join...
                  </div>
                ) : isNewGameRequested ? (
                  <div style={{ fontSize: '16px', color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '999px' }}>
                    <FaSpinner className="spin" />
                    Waiting for opponent... {readyCount}/2 ready
                  </div>
                ) : gameState.gameStatus === 'PLAYING' ? (
                  <div style={{ fontSize: '18px', color: 'var(--text)' }}>
                    {isMyTurn ? 'Your turn' : "Opponent's turn"}
                  </div>
                ) : (
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                    {gameState.gameStatus === 'WIN' ? `${gameState.winner} wins!` : 'It\'s a draw!'}
                  </div>
                )}
              </div>

              {/* Game Board */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                maxWidth: '300px',
                margin: '0 auto 32px auto',
                background: 'var(--border)',
                padding: '8px',
                borderRadius: '12px'
              }}>
                {gameState.board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      disabled={!isMyTurn || cell !== null || gameState.gameStatus !== 'PLAYING' || isNewGameRequested}
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--surface)',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '32px',
                        fontWeight: '700',
                        color: cell === 'X' ? '#e53e3e' : '#3182ce',
                        cursor: (isMyTurn && cell === null && gameState.gameStatus === 'PLAYING' && !isNewGameRequested) ? 'pointer' : 'not-allowed',
                        opacity: (isMyTurn && cell === null && gameState.gameStatus === 'PLAYING' && !isNewGameRequested) ? 1 : 0.8,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {cell}
                    </button>
                  ))
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  padding: '12px 16px',
                  background: '#fed7d7',
                  color: '#c53030',
                  border: '1px solid #feb2b2',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {error}
                </div>
              )}

              {/* New Game Button */}
              {gameState.gameStatus !== 'PLAYING' && (
                <button
                  onClick={handleNewGame}
                  disabled={isNewGameRequested}
                  style={{
                    padding: '12px 24px',
                    background: isNewGameRequested ? '#888' : 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isNewGameRequested ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginRight: '12px',
                    opacity: isNewGameRequested ? 0.7 : 1
                  }}
                >
                  New Game
                </button>
              )}
            </div>

            {/* Game Stats Sidebar */}
            <div style={{
              background: 'var(--surface)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid var(--border)',
              height: 'fit-content'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: 'var(--text)', 
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaChartBar style={{ color: 'var(--primary)' }} />
                Game Statistics
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#d4edda',
                  borderRadius: '8px',
                  color: '#155724'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaTrophy style={{ color: '#28a745' }} />
                    Wins
                  </span>
                  <span style={{ fontWeight: '600' }}>{gameStats.wins}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#f8d7da',
                  borderRadius: '8px',
                  color: '#721c24'
                }}>
                  <span>Losses</span>
                  <span style={{ fontWeight: '600' }}>{gameStats.losses}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#fff3cd',
                  borderRadius: '8px',
                  color: '#856404'
                }}>
                  <span>Draws</span>
                  <span style={{ fontWeight: '600' }}>{gameStats.draws}</span>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: 'var(--background)', 
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--text)',
                opacity: 0.8
              }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Current Game:</strong>
                </div>
                <div>Status: {gameState.gameStatus}</div>
                <div>Turn: {gameState.currentPlayer}</div>
                {gameState.winner && <div>Winner: {gameState.winner}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivateTicTacToe; 