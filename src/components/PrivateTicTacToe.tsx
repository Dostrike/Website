import ResultMark from './ResultMark';
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BackToPortal from "./BackToPortal";
import { socket } from "../socket";
import "./GameScreen.css";
import "./MatchGame.css";
import "./GameBoard.css";

interface GameState {
  board: (string | null)[][];
  currentPlayer: "X" | "O";
  gameStatus: "PLAYING" | "WIN" | "DRAW";
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
    board: Array(3)
      .fill(null)
      .map(() => Array(3).fill(null)),
    currentPlayer: "X",
    gameStatus: "PLAYING",
    winner: null,
  });

  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState("");
  const [gameStats, setGameStats] = useState<GameStats>({
    wins: 0,
    losses: 0,
    draws: 0,
  });
  const eventListenersSetup = useRef(false);
  const lifecycle = useRef(0);
  const playerSymbolRef = useRef<"X" | "O" | null>(null);
  const gameNumberRef = useRef(0); // Track game number for alternating first turns
  const [isNewGameRequested, setIsNewGameRequested] = useState(false);
  const [readyCount, setReadyCount] = useState(0);

  // Safety mechanism: clear waiting state if it persists too long
  useEffect(() => {
    if (isNewGameRequested) {
      const timeoutId = setTimeout(() => {
        console.log(
          "[PRIVATE GAME] Safety timeout: clearing waiting state after 30 seconds",
        );
        setIsNewGameRequested(false);
      }, 30000);

      return () => clearTimeout(timeoutId);
    }
  }, [isNewGameRequested]);

  useEffect(() => {
    const generation = ++lifecycle.current;
    console.log(
      "[PRIVATE GAME] useEffect triggered with roomId:",
      roomId,
      "isPrivate:",
      isPrivate,
    );
    if (!roomId || !isPrivate) {
      console.log(
        "[PRIVATE GAME] Missing roomId or isPrivate, navigating to setup",
      );
      navigate("/tictactoe-setup");
      return;
    }

    // Only set up event listeners once globally
    if (!eventListenersSetup.current) {
      console.log("[PRIVATE GAME] Setting up global event listeners");

      // Listen for opponent moves
      socket.on(
        "opponentMove",
        (move: { row: number; col: number; symbol: string }) => {
          console.log("[PRIVATE GAME] Opponent move:", move);
          setGameState((prev) => {
            const newBoard = [...prev.board];
            newBoard[move.row][move.col] = move.symbol;

            // Determine the next player
            const nextPlayer = move.symbol === "X" ? "O" : "X";

            const newGameState = {
              ...prev,
              board: newBoard,
              currentPlayer: nextPlayer as "X" | "O",
            };

            // Check for win/draw
            const gameStatus = checkGameStatus(newBoard, move.symbol);
            if (gameStatus === "WIN") {
              newGameState.gameStatus = "WIN";
              newGameState.winner = move.symbol;
              updateGameStats("WIN", move.symbol);
            } else if (gameStatus === "DRAW") {
              newGameState.gameStatus = "DRAW";
              newGameState.winner = null;
              updateGameStats("DRAW", null);
            }

            return newGameState;
          });

          // The opponent just moved, so now it should be this player's turn
          const nextPlayer = move.symbol === "X" ? "O" : "X";
          const shouldBeMyTurn = playerSymbolRef.current === nextPlayer;
          console.log(
            "[PRIVATE GAME] Opponent moved, setting isMyTurn to:",
            shouldBeMyTurn,
            "for player:",
            playerSymbolRef.current,
            "next player:",
            nextPlayer,
          );
          setIsMyTurn(shouldBeMyTurn);

          // Additional check to ensure turn is set correctly
          if (shouldBeMyTurn) {
            console.log("[PRIVATE GAME] ✅ It is now my turn to play");
          } else {
            console.log("[PRIVATE GAME] ❌ It is not my turn to play");
          }
        },
      );

      // Listen for opponent leaving
      socket.on("opponentLeft", () => {
        console.log("[PRIVATE GAME] Opponent left");
        setError(
          "Opponent left the game. You can start a new game or return to the portal.",
        );
        setOpponentConnected(false);
        setGameStarted(false);
        setIsMyTurn(false);
      });

      // Listen for players' ready state during rematch
      socket.on(
        "playersReadyState",
        ({
          roomId: gameRoomId,
          readyPlayers,
        }: {
          roomId: string;
          readyPlayers: string[];
        }) => {
          console.log("[PRIVATE GAME] playersReadyState:", {
            gameRoomId,
            readyPlayers,
          });
          setReadyCount(Array.isArray(readyPlayers) ? readyPlayers.length : 0);
        },
      );

      // Listen for waiting for new game
      socket.on(
        "waitingForNewGame",
        ({
          roomId: gameRoomId,
          waitingPlayer,
          readyPlayers,
        }: {
          roomId: string;
          waitingPlayer: string;
          readyPlayers: string[];
        }) => {
          console.log(
            "[PRIVATE GAME] Received waitingForNewGame event for room:",
            gameRoomId,
          );
          console.log(
            "[PRIVATE GAME] Waiting player:",
            waitingPlayer,
            "Ready players:",
            readyPlayers,
          );

          // If this player is not the one waiting, show a message that opponent is waiting
          if (waitingPlayer !== socket.id) {
            setError("Opponent is ready. Click New Game to start.");
          }
        },
      );

      // Listen for new game requests from opponent
      socket.on(
        "newGameRequested",
        ({ roomId: gameRoomId }: { roomId: string }) => {
          console.log(
            "[PRIVATE GAME] Received newGameRequested event for room:",
            gameRoomId,
          );
          setIsNewGameRequested(false);
          console.log("[PRIVATE GAME] Cleared waiting state for new game");
          gameNumberRef.current += 1;
          console.log(
            "[PRIVATE GAME] Incremented game number to:",
            gameNumberRef.current,
          );
          const firstPlayer = gameNumberRef.current % 2 === 0 ? "X" : "O";
          console.log(
            "[PRIVATE GAME] First player for this game:",
            firstPlayer,
          );
          const newGameState = {
            board: Array(3)
              .fill(null)
              .map(() => Array(3).fill(null)),
            currentPlayer: firstPlayer as "X" | "O",
            gameStatus: "PLAYING" as const,
            winner: null,
          };
          setGameState(newGameState);
          console.log(
            "[PRIVATE GAME] Reset game state with first player:",
            firstPlayer,
          );
          const shouldBeMyTurn = playerSymbolRef.current === firstPlayer;
          setIsMyTurn(shouldBeMyTurn);
          console.log(
            "[PRIVATE GAME] Set isMyTurn to:",
            shouldBeMyTurn,
            "for player:",
            playerSymbolRef.current,
          );
          setError("");
          setReadyCount(0);
        },
      );

      // Listen for game start
      socket.on("startGame", ({ roomId: gameRoomId }: { roomId: string }) => {
        console.log("[PRIVATE GAME] Game starting in room:", gameRoomId);
        console.log(
          "[PRIVATE GAME] Current player symbol:",
          playerSymbolRef.current,
        );
        setGameStarted(true);
        setOpponentConnected(true);
        setError("");

        // Initialize game number for first game (X goes first)
        gameNumberRef.current = 0;

        // Make sure X goes first for the first game
        const shouldBeMyTurn = playerSymbolRef.current === "X";
        console.log(
          "[PRIVATE GAME] Setting isMyTurn to:",
          shouldBeMyTurn,
          "for player:",
          playerSymbolRef.current,
        );
        setIsMyTurn(shouldBeMyTurn);

        // Also update the game state to ensure currentPlayer is set correctly
        setGameState((prev) => ({
          ...prev,
          currentPlayer: "X" as "X" | "O",
        }));
      });

      eventListenersSetup.current = true;
    }

    // Get initial player info and check if game should start
    socket.emit("getPlayerInfo", roomId, (info: { symbol: "X" | "O" }) => {
      console.log("[PRIVATE GAME] Received player info:", info);
      setPlayerSymbol(info.symbol);
      playerSymbolRef.current = info.symbol;
      console.log("[PRIVATE GAME] Set playerSymbolRef to:", info.symbol);
      setIsMyTurn(info.symbol === "X");
      console.log("[PRIVATE GAME] Set isMyTurn to:", info.symbol === "X");

      // Check if both players are in the room
      socket.emit(
        "checkRoomStatus",
        roomId,
        (status: { playerCount: number }) => {
          console.log("[PRIVATE GAME] Room status check:", status);
          if (status.playerCount >= 2) {
            console.log("[PRIVATE GAME] Both players connected, starting game");
            setGameStarted(true);
            setOpponentConnected(true);
            setError("");

            // Initialize game number for first game (X goes first)
            gameNumberRef.current = 0;

            // Make sure X goes first for the first game
            const shouldBeMyTurn = playerSymbolRef.current === "X";
            console.log(
              "[PRIVATE GAME] Setting isMyTurn to:",
              shouldBeMyTurn,
              "for player:",
              playerSymbolRef.current,
            );
            setIsMyTurn(shouldBeMyTurn);
          }
        },
      );
    });

    // Immediate status check
    const initialCheck = setTimeout(() => {
      if (!gameStarted && roomId) {
        console.log("[PRIVATE GAME] Immediate status check for room:", roomId);
        socket.emit(
          "checkRoomStatus",
          roomId,
          (status: { playerCount: number }) => {
            console.log("[PRIVATE GAME] Immediate check result:", status);
            if (status.playerCount >= 2) {
              console.log(
                "[PRIVATE GAME] Both players found in immediate check, starting game",
              );
              setGameStarted(true);
              setOpponentConnected(true);
              setError("");

              // Initialize game number for first game (X goes first)
              gameNumberRef.current = 0;

              // Make sure X goes first for the first game
              const shouldBeMyTurn = playerSymbolRef.current === "X";
              console.log(
                "[PRIVATE GAME] Immediate check - Setting isMyTurn to:",
                shouldBeMyTurn,
                "for player:",
                playerSymbolRef.current,
              );
              setIsMyTurn(shouldBeMyTurn);
            }
          },
        );
      }
    }, 100);

    // Removed periodic status check - it was causing turn management issues
    // The game will start when both players are connected via the immediate check above

    return () => {
      clearTimeout(initialCheck);
      [
        "opponentMove",
        "opponentLeft",
        "playersReadyState",
        "waitingForNewGame",
        "newGameRequested",
        "startGame",
      ].forEach((event) => socket.off(event));
      eventListenersSetup.current = false;
      // Keep React's development effect replay from leaving a newly joined room.
      queueMicrotask(() => {
        if (lifecycle.current === generation) socket.emit("leaveRoom", roomId);
      });
    };
  }, [roomId, isPrivate, navigate]); // Removed playerSymbol to prevent re-runs

  // Add a useEffect to monitor currentPlayer changes and update isMyTurn accordingly
  useEffect(() => {
    if (gameStarted && playerSymbolRef.current) {
      const shouldBeMyTurn =
        gameState.currentPlayer === playerSymbolRef.current;
      console.log(
        "[PRIVATE GAME] Current player changed to:",
        gameState.currentPlayer,
        "my symbol:",
        playerSymbolRef.current,
        "should be my turn:",
        shouldBeMyTurn,
      );
      setIsMyTurn(shouldBeMyTurn);
    }
  }, [gameState.currentPlayer, gameStarted]);

  const checkGameStatus = (
    board: (string | null)[][],
    lastMove: string,
  ): "PLAYING" | "WIN" | "DRAW" => {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (
        board[i][0] === lastMove &&
        board[i][1] === lastMove &&
        board[i][2] === lastMove
      ) {
        return "WIN";
      }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
      if (
        board[0][i] === lastMove &&
        board[1][i] === lastMove &&
        board[2][i] === lastMove
      ) {
        return "WIN";
      }
    }

    // Check diagonals
    if (
      board[0][0] === lastMove &&
      board[1][1] === lastMove &&
      board[2][2] === lastMove
    ) {
      return "WIN";
    }
    if (
      board[0][2] === lastMove &&
      board[1][1] === lastMove &&
      board[2][0] === lastMove
    ) {
      return "WIN";
    }

    // Check for draw
    if (board.every((row) => row.every((cell) => cell !== null))) {
      return "DRAW";
    }

    return "PLAYING";
  };

  const updateGameStats = (
    gameStatus: "WIN" | "DRAW",
    winner: string | null,
  ) => {
    setGameStats((prev) => {
      if (gameStatus === "DRAW") {
        return { ...prev, draws: prev.draws + 1 };
      } else if (gameStatus === "WIN") {
        if (winner === playerSymbolRef.current) {
          return { ...prev, wins: prev.wins + 1 };
        } else {
          return { ...prev, losses: prev.losses + 1 };
        }
      }
      return prev;
    });
  };

  const getWinnerLabel = () => {
    if (!gameState.winner) return "";
    return gameState.winner === playerSymbolRef.current
      ? "You win!"
      : "Opponent wins!";
  };

  const handleCellClick = (row: number, col: number) => {
    console.log("[PRIVATE GAME] Cell clicked:", row, col);
    console.log("[PRIVATE GAME] isMyTurn:", isMyTurn);
    console.log("[PRIVATE GAME] playerSymbol:", playerSymbolRef.current);
    console.log("[PRIVATE GAME] gameStatus:", gameState.gameStatus);
    console.log(
      "[PRIVATE GAME] cell is empty:",
      gameState.board[row][col] === null,
    );
    console.log("[PRIVATE GAME] currentPlayer:", gameState.currentPlayer);
    console.log("[PRIVATE GAME] isNewGameRequested:", isNewGameRequested);

    if (
      !isMyTurn ||
      gameState.board[row][col] !== null ||
      gameState.gameStatus !== "PLAYING" ||
      isNewGameRequested
    ) {
      console.log(
        "[PRIVATE GAME] Move blocked - isMyTurn:",
        isMyTurn,
        "cell empty:",
        gameState.board[row][col] === null,
        "gameStatus:",
        gameState.gameStatus,
        "isNewGameRequested:",
        isNewGameRequested,
      );
      if (!isMyTurn) {
        console.log("[PRIVATE GAME] ❌ Move blocked because it is not my turn");
      }
      if (gameState.board[row][col] !== null) {
        console.log("[PRIVATE GAME] ❌ Move blocked because cell is not empty");
      }
      if (gameState.gameStatus !== "PLAYING") {
        console.log(
          "[PRIVATE GAME] ❌ Move blocked because game is not in PLAYING status",
        );
      }
      if (isNewGameRequested) {
        console.log(
          "[PRIVATE GAME] ❌ Move blocked because waiting for new game",
        );
      }
      return;
    }

    const currentPlayerSymbol = playerSymbolRef.current;
    if (!currentPlayerSymbol) {
      console.log("[PRIVATE GAME] No player symbol set");
      return;
    }

    console.log(
      "[PRIVATE GAME] ✅ Making move for player:",
      currentPlayerSymbol,
    );

    const newBoard = gameState.board.map((r) => [...r]);
    newBoard[row][col] = currentPlayerSymbol;

    const newGameStatus = checkGameStatus(newBoard, currentPlayerSymbol);
    const newWinner = newGameStatus === "WIN" ? currentPlayerSymbol : null;

    // Determine the next player
    const nextPlayer = currentPlayerSymbol === "X" ? "O" : "X";

    const newGameState = {
      ...gameState,
      board: newBoard,
      currentPlayer: nextPlayer as "X" | "O",
      gameStatus: newGameStatus,
      winner: newWinner,
    };

    setGameState(newGameState);
    setIsMyTurn(false); // It's no longer my turn after I make a move

    // Update stats if game ended
    if (newGameStatus !== "PLAYING") {
      updateGameStats(newGameStatus, newWinner);
    }

    // Send move to opponent
    socket.emit("makeMove", {
      roomId,
      move: { row, col, symbol: currentPlayerSymbol },
    });
  };

  const handleNewGame = () => {
    if (isNewGameRequested) return; // Prevent duplicate requests
    console.log("[PRIVATE GAME] Requesting new game...");
    setIsNewGameRequested(true);
    setReadyCount(1);
    setError("");
    socket.emit("requestNewGame", roomId);
  };

  if (!roomId || !isPrivate)
    return (
      <main className="container reading-page">
        <h1>Your private game</h1>
        <p>Create a room or enter a friend’s code to start an online match.</p>
        <Link className="ds-button ds-button-primary" to="/tictactoe-setup">
          Set up a private room →
        </Link>
      </main>
    );
  return (
    <main className="match-game private-match">
      <Helmet>
        <title>Private Tic-Tac-Toe - DoStrike Gaming Portal</title>
        <meta
          name="description"
          content="Play Tic-Tac-Toe with friends in a private room."
        />
        <meta name="robots" content="noindex" />
      </Helmet>
      <nav className="match-top" aria-label="Game navigation">
        <BackToPortal variant="inline" />
        <span className="room-label">Room {roomId}</span>
      </nav>
      <header className="match-heading">
        <p className="match-eyebrow">A FRIEND. A FRESH BOARD.</p>
        <h1>Tic-Tac-Toe</h1>
        <p>A private online game. Three in a row wins.</p>
      </header>
      <section className="match-score" aria-label="Players">
        <div className={isMyTurn ? "is-current" : ""}>
          <span className="match-mark">{playerSymbol || "—"}</span>
          <strong>You</strong>
        </div>
        <div className={!isMyTurn && gameStarted ? "is-current" : ""}>
          <span className="match-mark">{playerSymbol === "X" ? "O" : "X"}</span>
          <strong>
            {opponentConnected ? "Your friend" : "Waiting for friend"}
          </strong>
        </div>
      </section>
      <div className="match-turn" role="status">
        {!gameStarted
          ? "Waiting for your friend to join…"
          : isNewGameRequested
            ? `Rematch: ${readyCount}/2 ready`
            : gameState.gameStatus === "PLAYING"
              ? isMyTurn
                ? "Your move"
                : "Your friend’s move"
              : gameState.gameStatus === "WIN"
                ? getWinnerLabel()
                : "A draw. Go again?"}
      </div>
      <div className="game-board">
        <div className="board-grid">
          {gameState.board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                className="board-cell"
                aria-label={`Row ${r + 1}, column ${c + 1}: ${cell || "empty"}`}
                onClick={() => handleCellClick(r, c)}
                disabled={
                  !isMyTurn ||
                  cell !== null ||
                  gameState.gameStatus !== "PLAYING" ||
                  isNewGameRequested
                }
              >
                <span className={`cell-symbol ${cell?.toLowerCase() || ""}`}>
                  {cell}
                </span>
              </button>
            )),
          )}
        </div>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {gameState.gameStatus !== "PLAYING" && (
        <section className="match-result" aria-label="Round result" data-outcome={gameState.gameStatus === "DRAW" ? "draw" : gameState.winner === playerSymbol ? "win" : "loss"}>
          <ResultMark outcome={gameState.gameStatus === "DRAW" ? "draw" : gameState.winner === playerSymbol ? "win" : "loss"} />
          <h2>
            {gameState.gameStatus === "WIN"
              ? getWinnerLabel()
              : "Evenly matched."}
          </h2>
          <p>
            {isNewGameRequested
              ? "Your friend needs to request a rematch too. The board resets when both players are ready."
              : "Play another round with your friend. Both players choose rematch to begin."}
          </p>
          <button
            className="match-primary"
            onClick={handleNewGame}
            disabled={isNewGameRequested}
          >
            {isNewGameRequested
              ? `Waiting for friend · ${readyCount}/2 ready`
              : "Request a rematch →"}
          </button>
        </section>
      )}
      <details className="match-details">
        <summary>Round statistics</summary>
        <div className="private-stats">
          <span>{gameStats.wins} wins</span>
          <span>{gameStats.losses} losses</span>
          <span>{gameStats.draws} draws</span>
        </div>
      </details>
    </main>
  );
};
export default PrivateTicTacToe;
