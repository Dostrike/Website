import React from 'react';

const FAQ: React.FC = () => (
  <div className="container" style={{ maxWidth: 800, margin: '40px auto', background: 'var(--surface)', color: 'var(--text)', padding: '32px 24px', boxShadow: '0 4px 16px rgba(30,136,229,0.07)', borderRadius: 10 }}>
    <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '1em' }}>Frequently Asked Questions (FAQ)</h1>
    <div style={{ marginBottom: '1.5em' }}>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>How do you win at Tic-Tac-Toe?</h2>
      <p>
        The key to winning Tic-Tac-Toe is to control the center, block your opponent’s moves, and create multiple opportunities to win (forks). If both players play optimally, the game will always end in a draw.
      </p>
    </div>
    <div style={{ marginBottom: '1.5em' }}>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>What is the history of Tic-Tac-Toe?</h2>
      <p>
        Tic-Tac-Toe, also known as Noughts and Crosses, has origins dating back to ancient Egypt and Rome. The modern version became popular in the 19th and 20th centuries as a simple pencil-and-paper game.
      </p>
    </div>
    <div style={{ marginBottom: '1.5em' }}>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>Can I play against the computer?</h2>
      <p>
        Yes! Our game offers an AI opponent with multiple difficulty levels. You can also play against a friend in Player vs Player mode.
      </p>
    </div>
    <div style={{ marginBottom: '1.5em' }}>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>Is this site free to use?</h2>
      <p>
        Absolutely! Ultimate Tic-Tac-Toe is free to play. You can enjoy all features without any cost.
      </p>
    </div>
    <div style={{ marginBottom: '1.5em' }}>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>How can I contact the developer?</h2>
      <p>
        You can reach out via the <a href="/contact" style={{ color: 'var(--primary)' }}>Contact</a> page or email dostrike0@gmail.com.
      </p>
    </div>
  </div>
);

export default FAQ; 