import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import GameSetup from "./GameSetup";
export default function Connect4Setup() {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState("AI");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [player1Name, setPlayer1Name] = useState("You");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const handleStartGame = () => {
    localStorage.setItem(
      "connect4Settings",
      JSON.stringify({
        gameMode,
        difficulty,
        player1Name: player1Name.trim() || "You",
        player2Name: player2Name.trim() || "Player 2",
      }),
    );
    navigate("/connect4");
  };
  return (
    <>
      <Helmet>
        <title>Connect 4 Setup - DoStrike Gaming Portal</title>
        <meta
          name="description"
          content="Choose a computer difficulty or a local two-player match, set player names, and start playing Connect 4 on DoStrike."
        />
        <link rel="canonical" href="https://dostrike.com/connect4-setup" />
      </Helmet>
      <GameSetup
        game="Connect 4"
        mode={gameMode}
        onMode={setGameMode}
        difficulty={difficulty}
        onDifficulty={setDifficulty}
        firstName={player1Name}
        secondName={player2Name}
        onFirstName={setPlayer1Name}
        onSecondName={setPlayer2Name}
        onStart={handleStartGame}
      />
    </>
  );
}
