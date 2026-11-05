import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BackToPortal from "./BackToPortal";

const HowToPlay: React.FC = () => (
  <>
    <Helmet>
      <title>DoStrike Game Rules & Strategy Tips | DoStrike</title>
      <meta
        name="description"
        content="Official how-to-play guides for DoStrike: Reversi flips and mandatory passes, Gomoku five-in-a-row rules, Tic-Tac-Toe rules and tactics, Connect 4 gravity and four-in-a-row wins, Memory matching game tips and difficulty levels."
      />
      <link rel="canonical" href="https://dostrike.com/how-to-play" />
    </Helmet>
    <div
      className="container reading-page"
      style={{
        maxWidth: 800,
        margin: "40px auto",
        background: "var(--surface)",
        color: "var(--text)",
        padding: "32px 24px",
        boxShadow: "0 4px 16px rgba(30,136,229,0.07)",
        borderRadius: 10,
      }}
    >
      <BackToPortal />
      <h1
        style={{
          color: "var(--primary)",
          fontSize: "2em",
          marginBottom: "0.75em",
          fontWeight: 700,
        }}
      >
        How to play on DoStrike
      </h1>
      <p
        style={{
          fontSize: "1.1em",
          color: "var(--text)",
          marginBottom: "1.5em",
          lineHeight: 1.6,
        }}
      >
        Clear rules for every game on this site. Jump to a section or open the
        matching setup screen when you are ready to play.
      </p>

      <nav
        aria-label="On this page"
        style={{
          marginBottom: "2em",
          padding: "1rem 1.25rem",
          background: "var(--background)",
          borderRadius: 8,
          border: "1px solid var(--border)",
        }}
      >
        <strong
          style={{
            display: "block",
            marginBottom: "0.75em",
            color: "var(--secondary)",
          }}
        >
          On this page
        </strong>
        <ul style={{ margin: 0, paddingLeft: "1.25em", lineHeight: 1.8 }}>
          <li>
            <a href="#tic-tac-toe" style={{ color: "var(--primary)" }}>
              Tic-Tac-Toe
            </a>
          </li>
          <li>
            <a href="#connect-4" style={{ color: "var(--primary)" }}>
              Connect 4
            </a>
          </li>
          <li>
            <a href="#memory" style={{ color: "var(--primary)" }}>
              Memory game
            </a>
          </li>
        </ul>
      </nav>

      <section id="tic-tac-toe" style={{ scrollMarginTop: "1rem" }}>
        <h2
          style={{
            color: "var(--secondary)",
            fontSize: "1.35em",
            margin: "1.5em 0 0.5em",
            fontWeight: 600,
          }}
        >
          Tic-Tac-Toe
        </h2>
        <p style={{ lineHeight: 1.7 }}>
          Two players take turns on a <strong>3×3</strong> grid. One uses{" "}
          <strong>X</strong>, the other <strong>O</strong>. The first to place{" "}
          <strong>three in a row</strong> (horizontal, vertical, or diagonal)
          wins. If every cell is filled with no winner, the game is a{" "}
          <strong>draw</strong>.
        </p>
        <h3
          style={{
            color: "var(--secondary)",
            fontSize: "1.1em",
            margin: "1.25em 0 0.5em",
            fontWeight: 600,
          }}
        >
          Setup
        </h3>
        <ul style={{ lineHeight: 1.7 }}>
          <li>Use a single 3×3 board.</li>
          <li>Agree who plays X (traditionally first) and who plays O.</li>
          <li>Alternate turns; each move must go into an empty cell.</li>
        </ul>
        <h3
          style={{
            color: "var(--secondary)",
            fontSize: "1.1em",
            margin: "1.25em 0 0.5em",
            fontWeight: 600,
          }}
        >
          Quick tactics
        </h3>
        <ul style={{ lineHeight: 1.7 }}>
          <li>
            <strong>Center control:</strong> the middle square joins the most
            winning lines—fight for it when it fits your plan.
          </li>
          <li>
            <strong>Wins, then threats:</strong> take an immediate win if one is
            available. Otherwise block any opponent line that would win on their
            next move before building your own trap.
          </li>
          <li>
            <strong>Forks:</strong> create two winning threats at once so your
            opponent can only block one.
          </li>
        </ul>
        <p
          style={{
            marginTop: "1.25em",
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}
        >
          Go deeper on our{" "}
          <Link to="/blog" style={{ color: "var(--primary)" }}>
            strategy blog
          </Link>{" "}
          (openings, forks, draws).{" "}
          <Link to="/tictactoe-setup" style={{ color: "var(--primary)" }}>
            Start Tic-Tac-Toe setup
          </Link>{" "}
          or jump straight to the{" "}
          <Link to="/tictactoe" style={{ color: "var(--primary)" }}>
            classic board
          </Link>
          .
        </p>
      </section>

      <section id="connect-4" style={{ scrollMarginTop: "1rem" }}>
        <h2
          style={{
            color: "var(--secondary)",
            fontSize: "1.35em",
            margin: "2em 0 0.5em",
            fontWeight: 600,
          }}
        >
          Connect 4
        </h2>
        <p style={{ lineHeight: 1.7 }}>
          Two players drop discs into a vertical grid—on DoStrike the board is{" "}
          <strong>7 columns × 6 rows</strong>. Gravity pulls discs to the{" "}
          <strong>lowest free cell</strong> in the chosen column. The first
          player to create a straight line of{" "}
          <strong>four of their own discs</strong> (horizontal, vertical, or
          diagonal) wins. If the grid fills with no four-in-a-row, the game is a
          draw.
        </p>
        <h3
          style={{
            color: "var(--secondary)",
            fontSize: "1.1em",
            margin: "1.25em 0 0.5em",
            fontWeight: 600,
          }}
        >
          How a turn works
        </h3>
        <ol style={{ lineHeight: 1.7 }}>
          <li>Choose a column that still has empty space.</li>
          <li>Your disc falls to the lowest available slot in that column.</li>
          <li>
            Watch for immediate wins or blocks—Connect 4 punishes missed
            defenses quickly.
          </li>
        </ol>
        <h3
          style={{
            color: "var(--secondary)",
            fontSize: "1.1em",
            margin: "1.25em 0 0.5em",
            fontWeight: 600,
          }}
        >
          Beginner priorities
        </h3>
        <ul style={{ lineHeight: 1.7 }}>
          <li>
            <strong>Central columns:</strong> they participate in more potential
            four-in-a-row lines than edge columns.
          </li>
          <li>
            <strong>Playable cells:</strong> a diagonal or horizontal threat
            only matters if the winning cell can actually land when you need
            it—think gravity.
          </li>
          <li>
            <strong>Plan two plies:</strong> ask what your opponent&apos;s best
            reply is before you commit.
          </li>
        </ul>
        <p
          style={{
            marginTop: "1.25em",
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}
        >
          Follow the{" "}
          <Link
            to="/blog/connect4-strategy-blueprint"
            style={{ color: "var(--primary)" }}
          >
            Connect 4 strategy blueprint
          </Link>{" "}
          and{" "}
          <Link
            to="/blog/connect4-endgame-guide"
            style={{ color: "var(--primary)" }}
          >
            endgame guide
          </Link>
          .{" "}
          <Link to="/connect4-setup" style={{ color: "var(--primary)" }}>
            Open Connect 4 setup
          </Link>{" "}
          to choose human vs human or AI difficulty.
        </p>
      </section>

      <section id="memory" style={{ scrollMarginTop: "1rem" }}>
        <h2
          style={{
            color: "var(--secondary)",
            fontSize: "1.35em",
            margin: "2em 0 0.5em",
            fontWeight: 600,
          }}
        >
          Memory (matching pairs)
        </h2>
        <p style={{ lineHeight: 1.7 }}>
          Cards start face-down. Each turn you flip <strong>two</strong> cards:
        </p>
        <ul style={{ lineHeight: 1.7 }}>
          <li>
            If they show the <strong>same symbol</strong>, they stay revealed
            (or leave the board) and you gain a pair.
          </li>
          <li>
            If they differ, they flip back—remember positions for later turns.
          </li>
        </ul>
        <p style={{ lineHeight: 1.7 }}>
          The round ends when <strong>every pair</strong> is found. On DoStrike
          you can switch <strong>Easy / Medium / Hard</strong> layouts—the
          harder presets use more pairs and a wider grid. Track moves and time
          to beat your personal bests.
        </p>
        <h3
          style={{
            color: "var(--secondary)",
            fontSize: "1.1em",
            margin: "1.25em 0 0.5em",
            fontWeight: 600,
          }}
        >
          Practical tips
        </h3>
        <ul style={{ lineHeight: 1.7 }}>
          <li>
            <strong>Scan in order:</strong> move left-to-right, top-to-bottom so
            you never skip unknown cards randomly.
          </li>
          <li>
            <strong>Zones:</strong> mentally quarter the grid—remember “which
            quadrant held which icon”.
          </li>
          <li>
            <strong>Accuracy before speed:</strong> fewer mistaken repeats
            lowers your move count automatically.
          </li>
        </ul>
        <p
          style={{
            marginTop: "1.25em",
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}
        >
          Try a worked location example and a small mistake ledger in our{" "}
          <Link
            to="/blog/memory-game-improvement-guide"
            style={{ color: "var(--primary)" }}
          >
            Memory improvement guide
          </Link>
          .{" "}
          <Link to="/memory" style={{ color: "var(--primary)" }}>
            Play Memory now
          </Link>
          .
        </p>
      </section>

      <section style={{ marginTop: "2em" }}>
        <h2>Block Fit: place before you clear</h2><p>Choose a fixed tray piece, then its bounding-box top-left anchor, preview and confirm. Use all three before the next tray arrives. Full rows and columns clear together; crossing cells clear once. Score placed cells plus 10 × lines × consecutive clearing combo, capped at five. A non-clear resets the combo. Undo, swap and revive are free and assisted; no remaining piece fits leads to a recovery choice or explicit Finish and save score.</p><p><Link to="/block-fit-setup">Play Block Fit →</Link></p><h2>Chess: protect the king, choose the promotion</h2><p>White starts. Select a piece and a legal destination, then confirm. Promotion requires choosing Queen, Rook, Bishop or Knight. Check must be answered; checkmate loses, while having no legal move without check is stalemate. This casual version automatically draws on threefold repetition, 50 moves by each side without a pawn move or capture, and recognized material cases; these early automatic draws differ from FIDE claims. Flip the board without changing its algebraic coordinates.</p><p><Link to="/chess-setup">Play Chess →</Link>{" · "}<Link to="/blog/chess-checks-promotion-and-draws">Work through checks and choices →</Link></p><h2>Sea Battle: hide, fire, listen</h2><p>Arrange five straight ships on a 10 by 10 ocean. Ships may touch but cannot overlap. Fire once at an unused coordinate, then pass the turn even after a hit. A ship’s identity is revealed only when sunk. Use preview/confirmation, arrows and internal board scrolling. Local play hides each outgoing board behind a handoff screen.</p><p><Link to="/sea-battle-setup">Play Sea Battle →</Link></p><h2>Dots and Boxes: claim the fourth side</h2><p>Draw one unused horizontal or vertical edge between adjacent dots. Closing one or two boxes claims them and keeps your turn; drawing no box passes the turn. More boxes wins. Preview and confirm edges, use arrows/Enter/Escape, and scroll larger boards without shrinking the controls. Undo and hints are labelled assisted.</p><p><Link to="/dots-and-boxes-setup">Play Dots and Boxes →</Link></p><h2>Colour Sort: pour the top run</h2><p>Select a source and an empty or matching-top destination, then confirm the preview. The maximal top run pours up to four-unit capacity. Sort every colour into one full tube. Numbered colours, keyboard controls, saved rounds and assisted undo support careful play; hints only apply to a matching board on the verified solution path.</p><p><Link to="/colour-sort-setup">Play Colour Sort →</Link></p><h2>Slide Merge: pairs need space</h2><p>Slide all tiles with arrows, WASD, direction buttons or a swipe. Equal tiles merge once per move; changed boards spawn a 2 or 4. Reach 2048, then choose whether to continue. Undo restores the same random stream and marks the round assisted. The daily shares a seed, not a guaranteed winning sequence.</p><p><Link to="/slide-merge-setup">Play Slide Merge →</Link></p><h2>Minesweeper: read the neighbours</h2><p>A number counts adjacent mines, including diagonals. Reveal every safe cell to win. Flags are your assertions; chording opens unflagged neighbours when the flag count matches. Wrong flags can cause a loss. Default no-guess fields are logically certified from the opening; safe reveals and one second chance are labelled assisted.</p><p><Link to="/minesweeper-setup">Play Minesweeper →</Link></p><h2>Sudoku: one of each</h2><p>Fill every row, column and 3 by 3 box with digits 1–9 exactly once. Fixed clues are protected. Pencil notes are manual, undo restores notes and values, and explained singles are separate from explicit answer reveals. Each generated board has a verified unique solution.</p><p><Link to="/sudoku-setup">Play Sudoku →</Link></p><h2>Checkers: complete the jump</h2><p>English draughts uses forward-moving men and short kings. Captures are compulsory; choose any complete chain. Crowning ends that turn. No legal move loses. Threefold repetition or 40 moves each without capture or a man move automatically draws.</p><p><Link to="/checkers-setup">Play Checkers →</Link></p><h2>Mancala: sow and count</h2><p>This Kalah version has six pits per side and a store. Sow counter-clockwise, including your own store but skipping the other store. A last seed in your store gives another turn unless the game has ended. A last seed in your own empty pit captures it and the opposite seeds only when the opposite pit is non-empty. When a side empties, remaining seeds are banked and the larger store wins.</p><p><Link to="/mancala-setup">Set your Mancala board →</Link>{" · "}<Link to="/blog/mancala-extra-turns-captures-and-counting">Learn extra turns and captures →</Link></p>
        <h2>Reversi: flip the line</h2>
        <p>Black starts on an 8 by 8 board with four centre discs. Place on an empty square that encloses at least one line of opposing discs; all directly enclosed lines flip. A colour with no legal move passes automatically. When neither colour can move, the larger disc count wins, even if the board has empty squares.</p>
        <p><Link to="/reversi-setup">Choose your Reversi game →</Link>{" · "}<Link to="/blog/reversi-legal-moves-corners-and-passes">Learn legal flips and passes →</Link></p>
        <h2>Gomoku: five in a row</h2>
        <p>Place stones on a 15 by 15 board. Black goes first. Five or more connected stones horizontally, vertically or diagonally win. This freestyle version has no forbidden moves. Play a friend on the same device or choose from three computer levels.</p>
        <p>Preview a point before placing, or use the arrow keys and Enter. On phones, scroll the board to reach the edges. Hints and undo are free.</p>
        <Link to="/gomoku-setup">Choose your Gomoku game →</Link>{" · "}<Link to="/blog/gomoku-threats-and-open-fours">Learn open fours and forced blocks →</Link>
      </section>
      <p
        style={{
          marginTop: "2.5em",
          paddingTop: "1.5em",
          borderTop: "1px solid var(--border)",
          color: "var(--text-muted)",
          fontSize: "0.95em",
          lineHeight: 1.6,
        }}
      >
        Policies and contact:{" "}
        <Link to="/faq" style={{ color: "var(--primary)" }}>
          FAQ
        </Link>
        ,{" "}
        <Link to="/contact" style={{ color: "var(--primary)" }}>
          Contact
        </Link>
        ,{" "}
        <Link to="/privacy" style={{ color: "var(--primary)" }}>
          Privacy
        </Link>
        .
      </p>
    </div>
  </>
);

export default HowToPlay;
