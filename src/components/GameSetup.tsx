import { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  game: "Tic-Tac-Toe" | "Connect 4";
  mode: string;
  onMode: (mode: string) => void;
  difficulty: string;
  onDifficulty: (level: string) => void;
  firstName: string;
  secondName: string;
  onFirstName: (name: string) => void;
  onSecondName: (name: string) => void;
  onStart: () => void;
  privateRoom?: ReactNode;
};
export default function GameSetup(p: Props) {
  const isTtt = p.game === "Tic-Tac-Toe";
  return (
    <main className="setup-page">
      <div className="page-intro">
        <p className="eyebrow">
          {isTtt ? "THE QUICK REMATCH" : "THINK ONE MOVE AHEAD"}
        </p>
        <h1>{p.game}</h1>
        <p>
          {p.mode === "PRIVATE"
            ? "One private room. Two friends. A fresh board."
            : isTtt
              ? "Three in a row. First to two wins. Make the next round yours."
              : "Four in a row. One good plan. Make the next round yours."}
        </p>
      </div>
      <div className="setup-layout">
        <section className="setup-panel" aria-label="Game settings">
          <fieldset>
            <legend>Who’s playing?</legend>
            <div className="setup-options">
              {[
                { key: "AI", label: "Computer", note: "A solo challenge" },
                { key: "PVP", label: "A friend", note: "On the same screen" },
                ...(isTtt
                  ? [
                      {
                        key: "PRIVATE",
                        label: "Online friend",
                        note: "Share a private room",
                      },
                    ]
                  : []),
              ].map((mode) => (
                <label
                  key={mode.key}
                  className={`setup-option ${p.mode === mode.key ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="gameMode"
                    value={mode.key}
                    checked={p.mode === mode.key}
                    onChange={() => p.onMode(mode.key)}
                  />
                  <span>
                    <strong>{mode.label}</strong>
                    <small>{mode.note}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {p.mode === "AI" && (
            <fieldset>
              <legend>Choose your challenge</legend>
              <div className="difficulty-options">
                {[
                  { key: "EASY", label: "Easy", note: "Find your feet" },
                  { key: "MEDIUM", label: "Medium", note: "A fair challenge" },
                  {
                    key: "HARD",
                    label: "Hard",
                    note: isTtt ? "Perfect defence" : "Plan further ahead",
                  },
                ].map((level) => (
                  <button
                    type="button"
                    key={level.key}
                    aria-pressed={p.difficulty === level.key}
                    onClick={() => p.onDifficulty(level.key)}
                  >
                    <strong>{level.label}</strong>
                    <small>{level.note}</small>
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {p.mode !== "PRIVATE" && (
            <fieldset>
              <legend>
                {p.mode === "AI" ? "What should we call you?" : "Player names"}
              </legend>
              <div className="setup-names">
                <label>
                  {p.mode === "AI" ? "Your name" : "Player 1"}
                  <input
                    maxLength={40}
                    value={p.firstName}
                    onChange={(e) => p.onFirstName(e.target.value)}
                    placeholder={p.mode === "AI" ? "You" : "Player 1"}
                  />
                </label>
                {p.mode === "PVP" && (
                  <label>
                    Player 2
                    <input
                      maxLength={40}
                      value={p.secondName}
                      onChange={(e) => p.onSecondName(e.target.value)}
                      placeholder="Player 2"
                    />
                  </label>
                )}
              </div>
            </fieldset>
          )}
          {p.mode === "PRIVATE" ? (
            p.privateRoom
          ) : (
            <button
              className="ds-button ds-button-primary setup-start"
              onClick={p.onStart}
            >
              Let’s play <span aria-hidden="true">↗</span>
            </button>
          )}
        </section>
        <aside className="setup-note">
          <div
            className={`setup-art ${isTtt ? "setup-art-ttt" : "setup-art-c4"}`}
            aria-hidden="true"
          >
            {isTtt
              ? ["X", "", "O", "", "X", "", "O", "", "X"].map((v, i) => (
                  <span key={i}>{v}</span>
                ))
              : Array.from({ length: 28 }, (_, i) => (
                  <span
                    key={i}
                    className={
                      i > 14 && i % 3 === 0
                        ? "disc-coral"
                        : i > 19
                          ? "disc-gold"
                          : ""
                    }
                  />
                ))}
          </div>
          <p className="eyebrow">A GOOD ROUND STARTS HERE</p>
          <h2>
            {isTtt
              ? "Easy to start. Room to improve."
              : "Build the threat they miss."}
          </h2>
          <p>
            {isTtt
              ? p.mode === "PRIVATE"
                ? "Share a room code to play online. Both players request a rematch to start the next round, and take turns going first."
                : "X starts each round. Watch for wins, blocks and forks. Draws keep the match alive."
              : "Discs fall to the lowest empty space. Connect four horizontally, vertically or diagonally."}
          </p>
          <Link to={isTtt ? "/practice" : "/blog/connect4-strategy-blueprint"}>
            {isTtt ? "Practice a pattern" : "Explore the strategy"} →
          </Link>
          <Link to="/how-to-play">Read the rules →</Link>
        </aside>
      </div>
    </main>
  );
}
