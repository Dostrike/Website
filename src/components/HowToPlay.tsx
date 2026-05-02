import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BackToPortal from './BackToPortal';

const HowToPlay: React.FC = () => (
  <>
    <Helmet>
      <title>How to Play Tic-Tac-Toe, Connect 4 & Memory | DoStrike</title>
      <meta
        name="description"
        content="Official how-to-play guides for DoStrike: Tic-Tac-Toe rules and tactics, Connect 4 gravity and four-in-a-row wins, Memory matching game tips and difficulty levels."
      />
      <link rel="canonical" href="https://dostrike.com/how-to-play" />
    </Helmet>
    <div
      className="container"
      style={{
        maxWidth: 800,
        margin: '40px auto',
        background: 'var(--surface)',
        color: 'var(--text)',
        padding: '32px 24px',
        boxShadow: '0 4px 16px rgba(30,136,229,0.07)',
        borderRadius: 10,
      }}
    >
      <BackToPortal />
      <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '0.75em', fontWeight: 700 }}>
        How to play on DoStrike
      </h1>
      <p style={{ fontSize: '1.1em', color: 'var(--text)', marginBottom: '1.5em', lineHeight: 1.6 }}>
        Clear rules for every game on this site. Jump to a section or open the matching setup screen when you are ready to play.
      </p>

      <nav aria-label="On this page" style={{ marginBottom: '2em', padding: '1rem 1.25rem', background: 'var(--background)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <strong style={{ display: 'block', marginBottom: '0.75em', color: 'var(--secondary)' }}>On this page</strong>
        <ul style={{ margin: 0, paddingLeft: '1.25em', lineHeight: 1.8 }}>
          <li>
            <a href="#tic-tac-toe" style={{ color: 'var(--primary)' }}>
              Tic-Tac-Toe
            </a>
          </li>
          <li>
            <a href="#connect-4" style={{ color: 'var(--primary)' }}>
              Connect 4
            </a>
          </li>
          <li>
            <a href="#memory" style={{ color: 'var(--primary)' }}>
              Memory game
            </a>
          </li>
        </ul>
      </nav>

      <section id="tic-tac-toe" style={{ scrollMarginTop: '1rem' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.35em', margin: '1.5em 0 0.5em', fontWeight: 600 }}>Tic-Tac-Toe</h2>
        <p style={{ lineHeight: 1.7 }}>
          Two players take turns on a <strong>3×3</strong> grid. One uses <strong>X</strong>, the other <strong>O</strong>. The first to place <strong>three in a row</strong>{' '}
          (horizontal, vertical, or diagonal) wins. If every cell is filled with no winner, the game is a <strong>draw</strong>.
        </p>
        <h3 style={{ color: 'var(--secondary)', fontSize: '1.1em', margin: '1.25em 0 0.5em', fontWeight: 600 }}>Setup</h3>
        <ul style={{ lineHeight: 1.7 }}>
          <li>Use a single 3×3 board.</li>
          <li>Agree who plays X (traditionally first) and who plays O.</li>
          <li>Alternate turns; each move must go into an empty cell.</li>
        </ul>
        <h3 style={{ color: 'var(--secondary)', fontSize: '1.1em', margin: '1.25em 0 0.5em', fontWeight: 600 }}>Quick tactics</h3>
        <ul style={{ lineHeight: 1.7 }}>
          <li>
            <strong>Center control:</strong> the middle square joins the most winning lines—fight for it when it fits your plan.
          </li>
          <li>
            <strong>Threats first:</strong> block any opponent line that would win on their next move before building your own trap.
          </li>
          <li>
            <strong>Forks:</strong> create two winning threats at once so your opponent can only block one.
          </li>
        </ul>
        <p style={{ marginTop: '1.25em', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Go deeper on our{' '}
          <Link to="/blog" style={{ color: 'var(--primary)' }}>
            strategy blog
          </Link>{' '}
          (openings, forks, draws).{' '}
          <Link to="/tictactoe-setup" style={{ color: 'var(--primary)' }}>
            Start Tic-Tac-Toe setup
          </Link>{' '}
          or jump straight to the{' '}
          <Link to="/tictactoe" style={{ color: 'var(--primary)' }}>
            classic board
          </Link>
          .
        </p>
      </section>

      <section id="connect-4" style={{ scrollMarginTop: '1rem' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.35em', margin: '2em 0 0.5em', fontWeight: 600 }}>Connect 4</h2>
        <p style={{ lineHeight: 1.7 }}>
          Two players drop discs into a vertical grid—on DoStrike the board is <strong>7 columns × 6 rows</strong>. Gravity pulls discs to the{' '}
          <strong>lowest free cell</strong> in the chosen column. The first player to create a straight line of <strong>four of their own discs</strong>{' '}
          (horizontal, vertical, or diagonal) wins. If the grid fills with no four-in-a-row, the game is a draw.
        </p>
        <h3 style={{ color: 'var(--secondary)', fontSize: '1.1em', margin: '1.25em 0 0.5em', fontWeight: 600 }}>How a turn works</h3>
        <ol style={{ lineHeight: 1.7 }}>
          <li>Choose a column that still has empty space.</li>
          <li>Your disc falls to the lowest available slot in that column.</li>
          <li>Watch for immediate wins or blocks—Connect 4 punishes missed defenses quickly.</li>
        </ol>
        <h3 style={{ color: 'var(--secondary)', fontSize: '1.1em', margin: '1.25em 0 0.5em', fontWeight: 600 }}>Beginner priorities</h3>
        <ul style={{ lineHeight: 1.7 }}>
          <li>
            <strong>Central columns:</strong> they participate in more potential four-in-a-row lines than edge columns.
          </li>
          <li>
            <strong>Playable cells:</strong> a diagonal or horizontal threat only matters if the winning cell can actually land when you need it—think gravity.
          </li>
          <li>
            <strong>Plan two plies:</strong> ask what your opponent&apos;s best reply is before you commit.
          </li>
        </ul>
        <p style={{ marginTop: '1.25em', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Follow the{' '}
          <Link to="/blog/connect4-strategy-blueprint" style={{ color: 'var(--primary)' }}>
            Connect 4 strategy blueprint
          </Link>{' '}
          and{' '}
          <Link to="/blog/connect4-endgame-guide" style={{ color: 'var(--primary)' }}>
            endgame guide
          </Link>
          .{' '}
          <Link to="/connect4-setup" style={{ color: 'var(--primary)' }}>
            Open Connect 4 setup
          </Link>{' '}
          to choose human vs human or AI difficulty.
        </p>
      </section>

      <section id="memory" style={{ scrollMarginTop: '1rem' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.35em', margin: '2em 0 0.5em', fontWeight: 600 }}>Memory (matching pairs)</h2>
        <p style={{ lineHeight: 1.7 }}>
          Cards start face-down. Each turn you flip <strong>two</strong> cards:
        </p>
        <ul style={{ lineHeight: 1.7 }}>
          <li>If they show the <strong>same symbol</strong>, they stay revealed (or leave the board) and you gain a pair.</li>
          <li>If they differ, they flip back—remember positions for later turns.</li>
        </ul>
        <p style={{ lineHeight: 1.7 }}>
          The round ends when <strong>every pair</strong> is found. On DoStrike you can switch <strong>Easy / Medium / Hard</strong> layouts—the harder presets use more pairs and a wider grid. Track moves and time to beat your personal bests.
        </p>
        <h3 style={{ color: 'var(--secondary)', fontSize: '1.1em', margin: '1.25em 0 0.5em', fontWeight: 600 }}>Practical tips</h3>
        <ul style={{ lineHeight: 1.7 }}>
          <li>
            <strong>Scan in order:</strong> move left-to-right, top-to-bottom so you never skip unknown cards randomly.
          </li>
          <li>
            <strong>Zones:</strong> mentally quarter the grid—remember “which quadrant held which icon”.
          </li>
          <li>
            <strong>Accuracy before speed:</strong> fewer mistaken repeats lowers your move count automatically.
          </li>
        </ul>
        <p style={{ marginTop: '1.25em', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Train with our{' '}
          <Link to="/blog/memory-game-improvement-guide" style={{ color: 'var(--primary)' }}>
            Memory improvement guide
          </Link>{' '}
          and{' '}
          <Link to="/blog/memory-game-advanced-drills" style={{ color: 'var(--primary)' }}>
            advanced drills
          </Link>
          .{' '}
          <Link to="/memory" style={{ color: 'var(--primary)' }}>
            Play Memory now
          </Link>
          .
        </p>
      </section>

      <p style={{ marginTop: '2.5em', paddingTop: '1.5em', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.95em', lineHeight: 1.6 }}>
        Policies and contact:{' '}
        <Link to="/faq" style={{ color: 'var(--primary)' }}>
          FAQ
        </Link>
        ,{' '}
        <Link to="/contact" style={{ color: 'var(--primary)' }}>
          Contact
        </Link>
        ,{' '}
        <Link to="/privacy" style={{ color: 'var(--primary)' }}>
          Privacy
        </Link>
        .
      </p>
    </div>
  </>
);

export default HowToPlay;
