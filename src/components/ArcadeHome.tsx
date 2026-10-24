import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './ArcadeHome.css';

const games = [
  { id: 'tictactoe', title: 'Tic-Tac-Toe', label: 'The quick rematch', description: 'Play the computer or a friend. After each round, replay your moves and learn from a missed win or block.', players: 'Solo or 2 players', route: '/tictactoe-setup', action: 'Choose your opponent' },
  { id: 'connect4', title: 'Connect 4', label: 'Think one move ahead', description: 'Drop a disc, build a threat, and watch the diagonals. Choose a computer opponent or a local two-player match.', players: 'Solo or 2 players', route: '/connect4-setup', action: 'Choose your difficulty' },
  { id: 'memory', title: 'Memory', label: 'Chase your personal best', description: 'Find every pair with fewer moves. Start with six pairs, then take on a bigger board when you are ready.', players: 'Solo · 3 difficulty levels', route: '/memory', action: 'How to improve', guide: '/blog/memory-game-improvement-guide' },
];
function GamePreview({ game }: { game: string }) {
  if (game === 'tictactoe') return <div className="lobby-preview lobby-preview-ttt" aria-hidden="true"><div className="lobby-mini-ttt">{['X', '', 'O', '', 'X', '', 'O', '', 'X'].map((mark, index) => <span key={index} className={mark === 'O' ? 'is-o' : ''}>{mark}</span>)}</div><span className="preview-sticker">Your move.</span></div>;
  if (game === 'connect4') return <div className="lobby-preview lobby-preview-c4" aria-hidden="true"><div className="lobby-mini-c4">{Array.from({ length: 42 }, (_, index) => <span key={index} className={index > 20 && index % 3 === 0 ? 'is-coral' : index > 25 && index % 2 === 0 ? 'is-gold' : ''} />)}</div><span className="preview-sticker">Connect the dots.</span></div>;
  return <div className="lobby-preview lobby-preview-memory" aria-hidden="true"><div className="lobby-mini-memory">{['✦', '?', '●', '?', '✦', '?'].map((mark, index) => <span key={index} className={mark === '?' ? 'is-hidden' : ''}>{mark}</span>)}</div><span className="preview-sticker">Seen this one?</span></div>;
}
export default function ArcadeHome() {
  const navigate = useNavigate();
  const [lastPick, setLastPick] = useState('');
  const [daily, setDaily] = useState({ streak: 0, solved: false });
  useEffect(() => {
    try {
      setLastPick(localStorage.getItem('dostrike-last-pick') || '');
      const progress = JSON.parse(localStorage.getItem('dostrike-daily-v1') || 'null');
      const now = new Date();
      const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const previous = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      if (progress && Number.isSafeInteger(progress.streak) && progress.streak >= 0) setDaily({ streak: progress.lastSolved === key || progress.lastSolved === previous ? progress.streak : 0, solved: progress.date === key && progress.solved === true });
    } catch { /* Play remains available without browser storage. */ }
  }, []);
  const remember = (id: string) => { try { localStorage.setItem('dostrike-last-pick', id); } catch { /* Optional preference. */ } };
  const quickPlay = (id: string) => {
    remember(id);
    if (id === 'memory') { navigate('/memory'); return; }
    try {
      localStorage.setItem(id === 'connect4' ? 'connect4Settings' : 'gameSettings', JSON.stringify({ gameMode: 'AI', difficulty: 'MEDIUM', player1Name: 'You', player2Name: 'Computer' }));
      navigate(id === 'connect4' ? '/connect4' : '/tictactoe');
    } catch { navigate(id === 'connect4' ? '/connect4-setup' : '/tictactoe-setup'); }
  };
  const returning = games.find(game => game.id === lastPick);
  return <main className="arcade-home">
    <Helmet><title>DoStrike — Quick Games, Daily Challenges & Rematches</title><meta name="description" content="Jump into Tic-Tac-Toe, Connect 4 or Memory. Play free, solve a daily strategy challenge, and chase your next personal best. No account needed." /><link rel="canonical" href="https://dostrike.com/" /></Helmet>
    <nav className="lobby-nav" aria-label="Main navigation"><a className="lobby-brand" href="/" aria-label="DoStrike home"><span aria-hidden="true">d.</span>dostrike</a><div><a href="#games-start">Games</a><a href="/practice">Daily challenge</a><a href="/blog">Guides</a></div><a className="lobby-nav-friend" href="/tictactoe-setup">Play with a friend ↗</a></nav>
    <div className="lobby-shell">
      <section className="lobby-hero" aria-labelledby="lobby-title">
        <div className="lobby-hero-copy"><p className="lobby-eyebrow">A LITTLE BREAK. A GOOD CHALLENGE.</p><h1 id="lobby-title">Small games.<br /><em>Big rematches.</em></h1><p>Put your next move to the test. Three familiar games, a daily brain-teaser, and plenty of reasons to say “one more round.” Free, with no account needed.</p><div className="lobby-hero-actions"><button className="lobby-button lobby-button-coral" onClick={() => quickPlay('tictactoe')}>Play Tic-Tac-Toe <span aria-hidden="true">↗</span></button><a href="#games-start">Browse games ↓</a></div></div>
        <a className="lobby-daily" href="/practice"><div className="lobby-daily-top"><span>THE DAILY MOVE</span><span aria-hidden="true">↗</span></div><div className="lobby-daily-marks" aria-hidden="true"><span>×</span><span>○</span><span>?</span></div><h2>{daily.solved ? 'Nicely played.' : 'One board.\nOne good move.'}</h2><p>{daily.solved ? 'You solved today’s challenge. Keep practicing the patterns, then come back for tomorrow’s position.' : 'Spot the winning move or save the draw. A small strategy challenge that changes each day.'}</p><div className="lobby-daily-bottom"><strong>{daily.solved ? 'Practice more' : 'Take the challenge'} →</strong><span>{daily.streak > 0 ? `${daily.streak} day streak` : 'Start your streak'}</span></div></a>
      </section>
      {returning && <section className="lobby-return" aria-label="Your last game"><div><span className="lobby-eyebrow">YOUR LAST PICK</span><h2>Back for more {returning.title}?</h2><p>{lastPick === 'memory' ? 'Start a fresh board and see whether you can clear it in fewer moves.' : 'Start a fresh round with a medium computer opponent.'}</p></div><button className="lobby-button lobby-button-ink" onClick={() => quickPlay(returning.id)}>Play again ↗</button></section>}
      <section className="lobby-library" id="games-start" aria-labelledby="games-title"><div className="lobby-section-heading"><div><p className="lobby-eyebrow">PICK UP. PLAY. REPEAT.</p><h2 id="games-title">Find your next game.</h2></div><a href="/how-to-play">New here? Learn the rules ↗</a></div><div className="lobby-games">{games.map(game => <article className="lobby-game" key={game.id}><a href={game.route} aria-label={`Configure ${game.title}`} onClick={() => remember(game.id)}><GamePreview game={game.id} /></a><div className="lobby-game-copy"><p className="lobby-eyebrow">{game.label}</p><h3>{game.title}</h3><p>{game.description}</p><span className="lobby-game-meta">{game.players}</span><button className="lobby-button lobby-button-ink" onClick={() => quickPlay(game.id)}>Quick play <span aria-hidden="true">↗</span></button><p className="lobby-quick-note">{game.id === 'memory' ? 'Starts with 8 pairs' : 'Starts against the medium computer'}</p><a className="lobby-secondary-link" href={game.guide || game.route} onClick={() => { if (!game.guide) remember(game.id); }}>{game.action} →</a></div></article>)}</div></section>
      <section className="lobby-learning" aria-labelledby="learning-title"><div><p className="lobby-eyebrow">MAKE THE NEXT ROUND YOURS</p><h2 id="learning-title">A better move<br />starts with a pattern.</h2><p>Missed a block? Fell for a fork? Learn the idea, try it on a board, then jump back into a game. Our guides connect the rules to moves you can actually use.</p><a href="/practice" className="lobby-button lobby-button-ink">Practice the patterns ↗</a></div><div className="lobby-guide-list"><a href="/blog/how-to-never-lose-tic-tac-toe"><span>01 / TIC-TAC-TOE</span><h3>See the threat before it happens.</h3><p>Learn when to win, when to block, and how to recognize a fork.</p><strong>Read the strategy →</strong></a><a href="/blog/connect4-strategy-blueprint"><span>02 / CONNECT 4</span><h3>Build a threat they can’t ignore.</h3><p>Think about gravity, center control and your opponent’s next reply.</p><strong>Plan your next move →</strong></a><a href="/blog/memory-game-improvement-guide"><span>03 / MEMORY</span><h3>Remember places, not just pictures.</h3><p>Try a steady scanning pattern and start reducing unnecessary guesses.</p><strong>Find your rhythm →</strong></a></div></section>
      <section className="lobby-about"><strong>Made for the joy of a good round.</strong><p>DoStrike is an independent game portal with playable classics and original strategy guides. Play solo or locally with a friend; Tic-Tac-Toe also supports online private rooms. Game preferences and daily progress stay in your browser.</p><a href="/about">Meet DoStrike →</a><a href="/contact">Send feedback →</a></section>
    </div>
  </main>;
}
