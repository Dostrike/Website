import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Connect4Logic } from "../utils/connect4Logic";
import { Connect4AI, type AIDifficulty } from "../utils/connect4AI";
import { Connect4Stats } from "../utils/gameStats";
import {
  Connect4GameStatus,
  type Connect4GameState,
  type Connect4Player,
} from "../types/connect4";
import Connect4Board from "./Connect4Board";
import "./MatchGame.css";
import "./Connect4Game.css";

function loadSettings() {
  try {
    const s =
      JSON.parse(localStorage.getItem("connect4Settings") || "{}") || {};
    return {
      mode: s.gameMode === "PVP" ? ("PVP" as const) : ("AI" as const),
      difficulty: (["EASY", "MEDIUM", "HARD"].includes(s.difficulty)
        ? s.difficulty
        : "MEDIUM") as AIDifficulty,
      first:
        typeof s.player1Name === "string" && s.player1Name.trim()
          ? s.player1Name.slice(0, 40)
          : "You",
      second:
        typeof s.player2Name === "string" && s.player2Name.trim()
          ? s.player2Name.slice(0, 40)
          : "Player 2",
    };
  } catch {
    return {
      mode: "AI" as const,
      difficulty: "MEDIUM" as AIDifficulty,
      first: "You",
      second: "Player 2",
    };
  }
}
export default function Connect4Game() {
  const [settings] = useState(loadSettings);
  const [history, setHistory] = useState<Connect4GameState[]>([
    Connect4Logic.createInitialGameState(),
  ]);
  const [completed, setCompleted] = useState({ RED: 0, YELLOW: 0, draws: 0 });
  const [starter, setStarter] = useState<Connect4Player>("RED");
  const [boardKey, setBoardKey] = useState(0);
  const [stats, setStats] = useState(() => Connect4Stats.loadStats());
  const recorded = useRef<Connect4GameState | null>(null);
  const game = history[history.length - 1];
  const ended = game.gameStatus !== Connect4GameStatus.PLAYING;
  const isAi = settings.mode === "AI";
  const thinking = isAi && game.currentPlayer === "YELLOW" && !ended;
  const second = isAi ? "Computer" : settings.second;
  const firstWins = completed.RED + (game.winner === "RED" ? 1 : 0);
  const secondWins = completed.YELLOW + (game.winner === "YELLOW" ? 1 : 0);
  const matchOver = firstWins >= 2 || secondWins >= 2;
  const currentName = game.currentPlayer === "RED" ? settings.first : second;
  const winnerName = game.winner === "RED" ? settings.first : second;
  const round = completed.RED + completed.YELLOW + completed.draws + 1;
  useEffect(() => {
    if (!thinking) return;
    const timer = window.setTimeout(() => {
      const ai = new Connect4AI(settings.difficulty, "YELLOW");
      const next = Connect4Logic.makeMove(game, ai.getBestMove(game));
      setHistory((current) =>
        current[current.length - 1] === game ? [...current, next] : current,
      );
    }, 550);
    return () => window.clearTimeout(timer);
  }, [game, thinking, settings.difficulty]);
  useEffect(() => {
    if (!ended || recorded.current === game) return;
    recorded.current = game;
    setStats(
      Connect4Stats.recordGame(
        game.winner === "RED"
          ? "win"
          : game.winner === "YELLOW"
            ? "loss"
            : "draw",
        settings.mode,
        settings.difficulty,
      ),
    );
  }, [game, ended, settings]);
  const choose = (column: number) =>
    setHistory((current) => {
      const previous = current[current.length - 1];
      if (
        previous.gameStatus !== Connect4GameStatus.PLAYING ||
        (isAi && previous.currentPlayer === "YELLOW")
      )
        return current;
      const next = Connect4Logic.makeMove(previous, column);
      return next === previous ? current : [...current, next];
    });
  const restart = () => {
    window.scrollTo(0, 0);
    const nextStarter = ended
      ? starter === "RED"
        ? "YELLOW"
        : "RED"
      : starter;
    if (ended)
      setCompleted(
        matchOver
          ? { RED: 0, YELLOW: 0, draws: 0 }
          : {
              RED: firstWins,
              YELLOW: secondWins,
              draws:
                completed.draws +
                (game.gameStatus === Connect4GameStatus.DRAW ? 1 : 0),
            },
      );
    setStarter(nextStarter);
    setHistory([
      { ...Connect4Logic.createInitialGameState(), currentPlayer: nextStarter },
    ]);
    setBoardKey((key) => key + 1);
  };
  const undo = () =>
    setHistory((current) =>
      current.slice(0, Math.max(1, current.length - (isAi ? 2 : 1))),
    );
  const resultTitle =
    game.gameStatus === Connect4GameStatus.DRAW
      ? "A draw. Go again?"
      : `${winnerName} ${winnerName.toLowerCase() === "you" ? (matchOver ? "take the match" : "win this round") : matchOver ? "takes the match" : "wins this round"}!`;
  return (
    <main className="match-game connect4-match">
      <Helmet>
        <title>Connect 4 game | DoStrike</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <nav className="match-top" aria-label="Game navigation">
        <Link to="/">← Game lobby</Link>
        <Link to="/connect4-setup">Change opponent</Link>
      </nav>
      <header className="match-heading">
        <p className="match-eyebrow">THINK ONE MOVE AHEAD</p>
        <h1>Connect 4</h1>
        <p>First to two wins. Draws replay. Take turns starting each round.</p>
      </header>
      <section className="match-score" aria-label="Match score">
        {[
          { name: settings.first, color: "RED", wins: firstWins },
          { name: second, color: "YELLOW", wins: secondWins },
        ].map((player) => (
          <div
            key={player.color}
            className={
              game.currentPlayer === player.color && !ended ? "is-current" : ""
            }
          >
            <span
              className={`player-disc disc-${player.color.toLowerCase()}`}
              aria-label={player.color.toLowerCase() + " discs"}
            />
            <strong>{player.name}</strong>
            <span
              className="match-pips"
              aria-label={`${player.wins} of 2 wins`}
            >
              {[0, 1].map((i) => (
                <i key={i} className={player.wins > i ? "is-filled" : ""} />
              ))}
            </span>
          </div>
        ))}
      </section>
      <div className="match-turn" role="status">
        {ended
          ? `Round ${round} complete`
          : thinking
            ? "Computer is thinking…"
            : currentName.toLowerCase() === "you"
              ? "Your move"
              : `${currentName}’s move`}
        <span>
          {isAi
            ? `${settings.difficulty.toLowerCase()} computer`
            : "Local two-player match"}
        </span>
      </div>
      <div className="connect4-board-area">
        <Connect4Board
          key={boardKey}
          board={game.board}
          currentPlayer={game.currentPlayer}
          gameStatus={game.gameStatus}
          winningLine={game.winningLine}
          onColumnClick={choose}
          disabled={ended || thinking}
        />
      </div>
      {ended ? (
        <section className="match-result" aria-label="Round result">
          <p className="match-eyebrow">
            {matchOver ? "MATCH COMPLETE" : "ROUND COMPLETE"}
          </p>
          <h2>{resultTitle}</h2>
          <p>
            {matchOver
              ? "A fresh match starts at zero. Ready for a rematch?"
              : `${firstWins}–${secondWins} in the match. ${starter === "RED" ? second : settings.first} starts the next round.`}
          </p>
          <button className="match-primary" onClick={restart}>
            {matchOver ? "Start another match" : "Play next round"} →
          </button>
          <div className="match-next">
            <Link to="/blog/connect4-strategy-blueprint">
              Build a stronger threat
            </Link>
            <Link to="/memory">Try Memory ↗</Link>
          </div>
        </section>
      ) : (
        <>
          <p className="board-help">
            Choose a column to drop a disc. Connect four to win.
          </p>
          <div className="match-controls">
            <button onClick={undo} disabled={history.length <= 1 || thinking}>
              Undo move
            </button>
            <button onClick={restart}>Restart round</button>
          </div>
        </>
      )}
      <details className="match-details">
        <summary>Your round statistics</summary>
        <p className="stats-note">
          Saved on this device. Results are from {settings.first}’s side.
        </p>
        <div className="compact-stats">
          <span>
            <strong>{stats.totalGames}</strong>Rounds
          </span>
          <span>
            <strong>{stats.wins}</strong>Wins
          </span>
          <span>
            <strong>{stats.draws}</strong>Draws
          </span>
          <span>
            <strong>{stats.bestWinStreak}</strong>Best streak
          </span>
        </div>
      </details>
      <details className="match-details">
        <summary>How to play & strategy tips</summary>
        <p>
          Drop a disc into any open column. It falls to the lowest empty space.
          Four in a row horizontally, vertically or diagonally wins. On a
          keyboard, focus the board, choose a column with the arrow keys and
          press Enter.
        </p>
        <Link to="/blog/connect4-strategy-blueprint">
          Read the Connect 4 strategy guide →
        </Link>
      </details>
    </main>
  );
}
