import ResultMark from './ResultMark';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Difficulty,
  GameMode,
  GameStatus,
  type GameState,
  Player,
  type Position,
} from "../types/game";
import { GameLogic } from "../utils/gameLogic";
import { bestMoves } from "../utils/practiceEngine";
import GameBoard from "./GameBoard";
import ScoreBoard from "./ScoreBoard";
import "./GameScreen.css";
import "./MatchGame.css";

type Settings = {
  gameMode: GameMode;
  difficulty: Difficulty;
  player1Name: string;
  player2Name: string;
};
function loadSettings(): Settings | null {
  try {
    const value = JSON.parse(localStorage.getItem("gameSettings") || "null");
    if (!value || ![GameMode.AI, GameMode.PVP].includes(value.gameMode))
      return null;
    return {
      gameMode: value.gameMode,
      difficulty: Object.values(Difficulty).includes(value.difficulty)
        ? value.difficulty
        : Difficulty.MEDIUM,
      player1Name:
        typeof value.player1Name === "string" && value.player1Name.trim()
          ? value.player1Name.slice(0, 40)
          : "You",
      player2Name:
        typeof value.player2Name === "string" && value.player2Name.trim()
          ? value.player2Name.slice(0, 40)
          : "Player 2",
    };
  } catch {
    return null;
  }
}
function scoreRound(next: GameState): GameState {
  if (next.gameStatus === GameStatus.PLAYING) return next;
  const score = { ...next.score };
  if (next.gameStatus === GameStatus.DRAW) score.draws++;
  else if (next.gameMode === GameMode.AI) {
    if (next.winner === Player.X) score.playerWins++;
    else score.aiWins++;
  } else if (next.winner === Player.X) score.player1Wins++;
  else score.player2Wins++;
  return { ...next, score };
}
export default function MatchGame({
  onBackToHome,
}: {
  onBackToHome: () => void;
}) {
  const [settings] = useState(loadSettings);
  const [game, setGame] = useState<GameState>(() => ({
    ...GameLogic.createInitialGameState(),
    ...(settings
      ? {
          ...settings,
          difficulty:
            settings.gameMode === GameMode.AI ? settings.difficulty : null,
        }
      : {}),
  }));
  const [hint, setHint] = useState<Position | null>(null);
  const isAi = game.gameMode === GameMode.AI;
  const firstWins = isAi ? game.score.playerWins : game.score.player1Wins;
  const secondWins = isAi ? game.score.aiWins : game.score.player2Wins;
  const secondName = isAi ? "Computer" : game.player2Name;
  const ended = game.gameStatus !== GameStatus.PLAYING;
  const matchOver = firstWins >= 2 || secondWins >= 2;
  const round = Math.max(
    1,
    firstWins + secondWins + game.score.draws + (ended ? 0 : 1),
  );
  const currentName =
    game.currentPlayer === Player.X ? game.player1Name : secondName;
  const resultName = game.winner === Player.X ? game.player1Name : secondName;
  const resultIsYou = resultName.trim().toLowerCase() === "you";
  const resultTitle =
    game.gameStatus === GameStatus.DRAW
      ? "A draw. Go again?"
      : `${resultName} ${matchOver ? (resultIsYou ? "take the match" : "takes the match") : resultIsYou ? "win this round" : "wins this round"}!`;
  useEffect(() => {
    setHint(null);
  }, [game.board]);
  useEffect(() => {
    if (!isAi || !game.isAiTurn || ended) return;
    const timer = window.setTimeout(() => {
      const move = GameLogic.getAiMove(game);
      if (!move) return;
      const next = scoreRound(
        GameLogic.makeMove(game, move[0], move[1], game.gameMode),
      );
      setGame((current) => (current === game ? next : current));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [game, isAi, ended]);
  const choose = (row: number, column: number) => {
    setGame((current) => {
      if (
        current.gameStatus !== GameStatus.PLAYING ||
        (current.gameMode === GameMode.AI && current.isAiTurn)
      )
        return current;
      const next = GameLogic.makeMove(current, row, column, current.gameMode);
      return next === current ? current : scoreRound(next);
    });
  };
  const playAgain = () => {
    window.scrollTo(0, 0);
    setHint(null);
    setGame((current) => ({
      ...GameLogic.createInitialGameState(),
      gameMode: current.gameMode,
      difficulty: current.difficulty,
      player1Name: current.player1Name,
      player2Name: current.player2Name,
      score: matchOver
        ? GameLogic.createInitialGameState().score
        : current.score,
    }));
  };
  const showHint = () => {
    const index = bestMoves(
      game.board.flat().map((cell) => cell || ""),
      game.currentPlayer,
    )[0];
    if (index !== undefined) setHint([Math.floor(index / 3), index % 3]);
  };
  if (!settings)
    return (
      <main
        className="container"
        style={{ maxWidth: 700, margin: "40px auto", padding: 24 }}
      >
        <h1>Choose your Tic-Tac-Toe game</h1>
        <p>Pick a computer opponent or a local two-player match.</p>
        <Link to="/tictactoe-setup">Set up a game</Link>
      </main>
    );
  return (
    <main className="game-screen match-game">
      <nav className="match-top" aria-label="Game navigation">
        <button onClick={onBackToHome}>← Game lobby</button>
        <Link to="/tictactoe-setup">Change opponent</Link>
      </nav>
      <header className="match-heading">
        <p className="match-eyebrow">THE QUICK REMATCH</p>
        <h1>Tic-Tac-Toe</h1>
        <p>First to two wins. Draws replay. X starts each round.</p>
      </header>
      <section className="match-score" aria-label="Match score">
        {[
          { name: game.player1Name, mark: "X", wins: firstWins },
          { name: secondName, mark: "O", wins: secondWins },
        ].map((player) => (
          <div
            key={player.mark}
            className={
              game.currentPlayer === player.mark && !ended ? "is-current" : ""
            }
          >
            <span className={`match-mark mark-${player.mark.toLowerCase()}`}>
              {player.mark}
            </span>
            <strong>{player.name}</strong>
            <span
              className="match-pips"
              aria-label={`${player.wins} of 2 wins`}
            >
              {[0, 1].map((index) => (
                <i
                  key={index}
                  className={player.wins > index ? "is-filled" : ""}
                />
              ))}
            </span>
          </div>
        ))}
      </section>
      <div className="match-turn" role="status">
        {ended
          ? `Round ${round} complete`
          : game.isAiTurn && isAi
            ? "Computer is thinking…"
            : currentName.trim().toLowerCase() === "you"
              ? "Your move"
              : `${currentName}’s move`}
        <span>
          {isAi
            ? `${game.difficulty?.toLowerCase()} computer`
            : "Local two-player match"}
        </span>
      </div>
      <GameBoard
        board={game.board}
        winningLine={game.winningLine}
        onCellClick={choose}
        disabled={ended || (isAi && game.isAiTurn)}
        hint={hint}
      />
      {ended ? (
        <section className="match-result" aria-label="Round result" data-outcome={game.gameStatus === GameStatus.DRAW ? "draw" : isAi && game.winner === Player.O ? "loss" : "win"}>
          <ResultMark outcome={game.gameStatus === GameStatus.DRAW ? "draw" : isAi && game.winner === Player.O ? "loss" : "win"} />
          <p className="match-eyebrow">
            {matchOver
              ? "MATCH COMPLETE"
              : game.gameStatus === GameStatus.DRAW
                ? "EVENLY MATCHED"
                : "ROUND COMPLETE"}
          </p>
          <h2>{resultTitle}</h2>
          <p>
            {matchOver
              ? "Another match, a new opponent, or a different game? Your next round is one click away."
              : game.gameStatus === GameStatus.DRAW
                ? "Neither player found a way through. Keep the match score and try a fresh board."
                : `${firstWins}–${secondWins} in the match. ${isAi && game.winner === Player.O ? "Watch for immediate wins and blocks before building a fork." : "Keep the momentum going: two wins takes the match."}`}
          </p>
          <button className="match-primary" onClick={playAgain}>
            {matchOver ? "Start another match" : "Play next round"} →
          </button>
          <div className="match-next">
            <Link to="/practice">Practice a winning pattern</Link>
            <Link to="/connect4-setup">Try Connect 4 ↗</Link>
          </div>
        </section>
      ) : (
        <div className="match-controls">
          <button onClick={showHint} disabled={isAi && game.isAiTurn}>
            Show a hint
          </button>
          <button onClick={playAgain}>Restart round</button>
        </div>
      )}
      {hint && !ended && (
        <p className="match-hint" aria-live="polite">
          Try row {hint[0] + 1}, column {hint[1] + 1}. The outlined square
          preserves your best available outcome.{" "}
          <Link to="/practice">Learn the pattern →</Link>
        </p>
      )}
      <details className="match-details">
        <summary>Round statistics</summary>
        <ScoreBoard
          score={game.score}
          gameMode={game.gameMode}
          player1Name={game.player1Name}
          player2Name={secondName}
        />
      </details>
    </main>
  );
}
