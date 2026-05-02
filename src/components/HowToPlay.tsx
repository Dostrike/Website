import React from 'react';
import { Helmet } from 'react-helmet-async';
import BackToPortal from './BackToPortal';

const HowToPlay: React.FC = () => (
  <>
    <Helmet>
      <title>How to Play Tic-Tac-Toe - Ultimate Guide</title>
      <meta name="description" content="Learn how to play Tic-Tac-Toe with step-by-step instructions, rules, tips, and strategies. Master the classic game!" />
      <link rel="canonical" href="https://dostrike.com/how-to-play" />
    </Helmet>
    <div className="container" style={{ maxWidth: 800, margin: '40px auto', background: 'var(--surface)', color: 'var(--text)', padding: '32px 24px', boxShadow: '0 4px 16px rgba(30,136,229,0.07)', borderRadius: 10 }}>
      <BackToPortal />
      <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '1em', fontWeight: 700 }}>How to Play Tic-Tac-Toe</h1>
      <p style={{ fontSize: '1.1em', color: 'var(--text)', marginBottom: '2em', lineHeight: 1.6 }}>
        Tic-Tac-Toe is a simple yet strategic game for two players. The goal is to be the first to get three of your marks in a row—horizontally, vertically, or diagonally—on a 3x3 grid.
      </p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Game Setup</h2>
      <ul>
        <li>The game is played on a 3x3 grid.</li>
        <li>One player is X, the other is O.</li>
        <li>Players take turns placing their mark in an empty cell.</li>
      </ul>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>How to Play</h2>
      <ol>
        <li>Decide who goes first (usually X).</li>
        <li>Players alternate turns, placing their mark (X or O) in an empty cell.</li>
        <li>The first player to get three in a row (horizontally, vertically, or diagonally) wins.</li>
        <li>If all cells are filled and no one has three in a row, the game is a draw.</li>
      </ol>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Example Board</h2>
      <pre style={{ background: 'var(--background)', padding: '1em', borderRadius: 8, fontSize: '1.1em', marginBottom: '1.5em' }}>
{` X | O | X
---+---+---
 O | X |  
---+---+---
   |   | O`}
      </pre>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Tips & Strategies</h2>
      <ul>
        <li>Take the center if you can—it gives you the most options.</li>
        <li>Try to create two winning opportunities at once (a fork).</li>
        <li>Block your opponent’s winning moves.</li>
        <li>If you can’t win, play for a draw.</li>
      </ul>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Variations</h2>
      <p>Try playing on larger grids, or with different rules for a new challenge!</p>
      <p style={{ marginTop: '2em', color: 'var(--text-muted)' }}>
        Want to practice? Play a game on our <a href="/tictactoe" style={{ color: 'var(--primary)' }}>interactive board</a>!
      </p>
    </div>
  </>
);

export default HowToPlay; 