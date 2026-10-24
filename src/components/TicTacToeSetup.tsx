import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import GameSetup from "./GameSetup";
import { socket } from "../socket";
import { useEffect } from "react";

type JoinRoomResponse = {
  success: boolean;
  message?: string;
};

const TicTacToeSetup: React.FC = () => {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState("AI");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [player1Name, setPlayer1Name] = useState("You");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");
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
      console.log("[SETUP] Socket connected");
      setIsConnected(true);
      setError("");
    };

    const handleDisconnect = () => {
      console.log("[SETUP] Socket disconnected");
      setIsConnected(false);
      setError("Connection lost. Please refresh the page.");
      setWaiting(false);
    };

    const handleConnectError = (error: Error) => {
      console.log("[SETUP] Socket connection error:", error);
      setIsConnected(false);
      setError(
        "Failed to connect to server. Please check if the server is running.",
      );
      setWaiting(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Check initial connection status
    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  // Socket.IO event handlers
  useEffect(() => {
    socket.off("startGame");
    socket.on("startGame", ({ roomId }: { roomId: string }) => {
      console.log("[SETUP] Game starting with roomId:", roomId);
      setWaiting(false);
      localStorage.setItem("tictactoeRoom", roomId);
      navigate("/tictactoe-private", { state: { roomId, isPrivate: true } });
    });
    socket.off("opponentLeft");
    socket.on("opponentLeft", () => {
      console.log("[SETUP] Opponent left the room");
      setError("Opponent left the room.");
      setWaiting(false);
      setRoomId("");
    });
    return () => {
      socket.off("startGame");
      socket.off("opponentLeft");
    };
  }, [navigate]);

  useEffect(() => {
    const socketWithOnAny = socket as unknown as {
      onAny?: (cb: (event: string, ...args: unknown[]) => void) => void;
    };
    socketWithOnAny.onAny?.((event: string, ...args: unknown[]) =>
      console.log("[SETUP SOCKET EVENT]", event, args),
    );
    console.log("[SETUP SOCKET] socket.id:", socket.id);
  }, []);

  const handleStartGame = () => {
    localStorage.setItem(
      "gameSettings",
      JSON.stringify({
        gameMode,
        difficulty,
        player1Name: player1Name.trim() || "You",
        player2Name: player2Name.trim() || "Player 2",
      }),
    );

    // Navigate to different routes based on game mode
    if (gameMode === "PRIVATE") {
      // Private room games use the PrivateTicTacToe component
      navigate("/tictactoe-private", { state: { roomId, isPrivate: true } });
    } else {
      // AI and Player vs Player use the regular GameScreen
      navigate("/tictactoe");
    }
  };

  // Private room logic
  const handleCreateRoom = () => {
    if (!isConnected) {
      setError("Not connected to server. Please refresh the page.");
      return;
    }

    setWaiting(true);
    setError("");
    console.log("[SETUP] Creating room...");
    if (createRoomTimeoutRef.current) {
      window.clearTimeout(createRoomTimeoutRef.current);
    }

    socket.emit("createRoom", (id: string) => {
      console.log("[SETUP] Room created with ID:", id);
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
        console.log("[SETUP] Room creation timeout");
        setError("Room creation timed out. Please try again.");
        setWaiting(false);
      }
      createRoomTimeoutRef.current = null;
    }, 5000);
  };

  const handleJoinRoom = () => {
    if (!isConnected) {
      setError("Not connected to server. Please refresh the page.");
      return;
    }

    if (!joinRoomId.trim()) {
      setError("Please enter a room code.");
      return;
    }

    setWaiting(true);
    setError("");
    console.log("[SETUP] Joining room:", joinRoomId.trim().toUpperCase());
    if (joinRoomTimeoutRef.current) {
      window.clearTimeout(joinRoomTimeoutRef.current);
    }

    socket.emit(
      "joinRoom",
      joinRoomId.trim().toUpperCase(),
      (res: JoinRoomResponse) => {
        console.log("[SETUP] Join room response:", res);
        if (res.success) {
          setRoomId(joinRoomId.trim().toUpperCase());
          setWaiting(false);
        } else {
          setError(res.message || "Failed to join room.");
          setWaiting(false);
        }
        if (joinRoomTimeoutRef.current) {
          window.clearTimeout(joinRoomTimeoutRef.current);
          joinRoomTimeoutRef.current = null;
        }
      },
    );

    // Add timeout in case callback never comes
    joinRoomTimeoutRef.current = window.setTimeout(() => {
      if (waitingRef.current) {
        console.log("[SETUP] Join room timeout");
        setError("Join room timed out. Please try again.");
        setWaiting(false);
      }
      joinRoomTimeoutRef.current = null;
    }, 5000);
  };

  return (
    <>
      <Helmet>
        <title>Tic-Tac-Toe Setup - DoStrike Gaming Portal</title>
        <meta
          name="description"
          content="Choose a computer challenge, a local two-player match, or a private online room for Tic-Tac-Toe on DoStrike."
        />
        <link rel="canonical" href="https://dostrike.com/tictactoe-setup" />
      </Helmet>
      <GameSetup
        game="Tic-Tac-Toe"
        mode={gameMode}
        onMode={setGameMode}
        difficulty={difficulty}
        onDifficulty={setDifficulty}
        firstName={player1Name}
        secondName={player2Name}
        onFirstName={setPlayer1Name}
        onSecondName={setPlayer2Name}
        onStart={handleStartGame}
        privateRoom={
          <section className="room-setup" aria-label="Private room">
            <p className="room-connection" role="status">
              {isConnected
                ? "Online play is ready."
                : "Connecting to online play… You can still play the computer or a friend on this screen."}
            </p>
            {!roomId ? (
              <>
                <button
                  className="ds-button ds-button-primary"
                  onClick={handleCreateRoom}
                  disabled={waiting || !isConnected}
                >
                  {waiting ? "Please wait…" : "Create a private room"}
                </button>
                <div className="room-divider">or join a friend</div>
                <label className="room-code-label">
                  Room code
                  <input
                    value={joinRoomId}
                    onChange={(e) =>
                      setJoinRoomId(e.target.value.toUpperCase())
                    }
                    placeholder="Enter room code"
                    maxLength={12}
                  />
                </label>
                <button
                  className="ds-button"
                  onClick={handleJoinRoom}
                  disabled={waiting || !joinRoomId.trim() || !isConnected}
                >
                  Join room →
                </button>
              </>
            ) : (
              <div className="room-ready">
                <p>Share this code with your friend</p>
                <strong>{roomId}</strong>
                <p>The game starts when they join. Keep this page open.</p>
              </div>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </section>
        }
      />
    </>
  );
};
export default TicTacToeSetup;
