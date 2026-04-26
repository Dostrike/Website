import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaRocket, FaGamepad, FaUsers, FaTrophy } from 'react-icons/fa';
import './GamingPortal.css';

const GamingPortal: React.FC = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      description: 'Classic 3x3 grid game. Get three in a row to win!',
      players: '1-2 Players',
      difficulty: 'Easy - Hard',
      visual: '❌⭕',
      available: true,
      route: '/tictactoe-setup',
      badge: 'Popular'
    },
    {
      id: 'connect4',
      name: 'Connect 4',
      description: 'Drop checkers to get four in a row!',
      players: '1-2 Players',
      difficulty: 'Medium',
      visual: '🔴🟡',
      available: true,
      route: '/connect4-setup',
      badge: 'Trending'
    },
    {
      id: 'memory',
      name: 'Memory Game',
      description: 'Test your memory with card matching!',
      players: '1 Player',
      difficulty: 'Medium',
      visual: '❓❓',
      available: true,
      route: '/memory'
    }
  ];

  const gameGuides = [
    {
      title: 'Tic-Tac-Toe quick strategy',
      summary: 'Control the center first, then create double-threats (forks) while blocking your opponent.',
      link: '/how-to-play',
      linkLabel: 'Read how to play'
    },
    {
      title: 'Connect 4 winning basics',
      summary: 'Play toward the center columns and think 2 moves ahead to set up diagonal threats.',
      link: '/connect4-setup',
      linkLabel: 'Play Connect 4'
    },
    {
      title: 'Memory game improvement',
      summary: 'Use board zones and repeat patterns to remember positions and reduce total moves.',
      link: '/memory',
      linkLabel: 'Play Memory Game'
    }
  ];

  const strategyPreview = [
    {
      title: 'Take center control early',
      detail: 'In Tic-Tac-Toe, the center creates the most winning lines and helps you defend efficiently.',
      link: '/how-to-play'
    },
    {
      title: 'Think in two-move patterns',
      detail: 'In Connect 4, plan your next move and your opponent response before dropping a disc.',
      link: '/connect4-setup'
    },
    {
      title: 'Use repeatable memory anchors',
      detail: 'In Memory Game, scan in zones and pair by location pattern, not by random guessing.',
      link: '/memory'
    }
  ];

  const features = [
    {
      icon: <FaGamepad />,
      title: 'Multiple Games',
      description: 'Wide variety of classic and modern games.'
    },
    {
      icon: <FaUsers />,
      title: 'Private Rooms',
      description: 'Create rooms and invite friends to play.'
    },
    {
      icon: <FaTrophy />,
      title: 'Competitive',
      description: 'Track scores and compete with others.'
    }
  ];

  const handleGameClick = (game: typeof games[0]) => {
    if (game.available) {
      navigate(game.route);
    }
  };


  return (
    <>
      <Helmet>
        <title>DoStrike Gaming Portal - Your Ultimate Destination for Online Multiplayer Games</title>
        <meta name="description" content="Play classic games, create private rooms, and challenge friends on DoStrike Gaming Portal. Multiple games including Tic Tac Toe, Connect 4, Memory Game, and more!" />
      </Helmet>
      
      <div className="gaming-portal">
        {/* Header */}
        <header className="portal-header">
          <div className="header-content">
            <div className="header-top">
              <h1 className="portal-title">
                <FaRocket className="rocket-icon" />
                DoStrike Gaming Portal
              </h1>
            </div>
            <p className="portal-subtitle">
              Play simple games, sharpen your mind, and challenge friends in quick private matches.
            </p>
            <div className="hero-cta-row">
              <a className="hero-primary-cta" href="#games-start">Start Playing</a>
              <a className="hero-secondary-cta" href="/how-to-play">Learn Strategy</a>
            </div>
            <div className="header-stats">
              <div className="header-stat">
                <strong>3</strong>
                <span>Live Games</span>
              </div>
              <div className="header-stat">
                <strong>Private Rooms</strong>
                <span>Friend Matches</span>
              </div>
              <div className="header-stat">
                <strong>Free</strong>
                <span>No Signup Needed</span>
              </div>
            </div>
            <div className="header-features">
              <div className="feature-item">
                <FaGamepad />
                <span>Multiple Games</span>
              </div>
              <div className="feature-item">
                <FaUsers />
                <span>Private Rooms</span>
              </div>
              <div className="feature-item">
                <FaTrophy />
                <span>Play with Friends</span>
              </div>
            </div>
          </div>
        </header>

        {/* Choose Your Game Section */}
        <section className="games-section" id="games-start">
          <h2 className="section-title">Choose Your Game</h2>
          <div className="games-grid">
            {games.map((game) => (
              <div 
                key={game.id} 
                className="game-card"
                onClick={() => handleGameClick(game)}
              >
                {game.badge && <span className="game-badge">{game.badge}</span>}
                <div className="game-visual">{game.visual}</div>
                <h3 className="game-name">{game.name}</h3>
                <p className="game-description">{game.description}</p>
                <div className="game-details">
                  <span className="game-players">{game.players}</span>
                  <span className="game-difficulty">{game.difficulty}</span>
                </div>
                <button className="play-button">Play Now</button>
              </div>
            ))}
          </div>
        </section>

        {/* Editorial Section */}
        <section className="content-section">
          <h2 className="section-title">Play, Learn, Improve</h2>
          <div className="content-grid">
            <article className="content-card">
              <h3>What makes DoStrike different?</h3>
              <p>
                DoStrike Gaming Portal is built for players who want quick, fun gameplay without sacrificing strategy.
                Every game here focuses on clear rules, fast rounds, and practical skill-building.
              </p>
              <p>
                You can jump into solo practice against AI, play private rounds with friends, and use our guides to
                improve your decisions. We keep the experience lightweight, readable, and mobile-friendly.
              </p>
            </article>
            <article className="content-card">
              <h3>How to get better fast</h3>
              <ul>
                <li>Start with short sessions and focus on one game pattern at a time.</li>
                <li>Review losses to spot repeated mistakes and improve your next match.</li>
                <li>Use private matches to test tactics against friends in a low-pressure setting.</li>
              </ul>
              <a href="/blog" className="text-link">Explore strategy articles</a>
            </article>
          </div>
        </section>

        {/* Quick Guides */}
        <section className="guides-section">
          <h2 className="section-title">Quick Game Guides</h2>
          <div className="guides-grid">
            {gameGuides.map((guide) => (
              <article key={guide.title} className="guide-card">
                <h3>{guide.title}</h3>
                <p>{guide.summary}</p>
                <a href={guide.link} className="text-link">{guide.linkLabel}</a>
              </article>
            ))}
          </div>
        </section>

        {/* Strategy Preview */}
        <section className="strategy-preview-section">
          <h2 className="section-title">Strategy Preview</h2>
          <p className="strategy-preview-subtitle">
            Short tactical ideas you can apply immediately in your next game.
          </p>
          <div className="strategy-preview-grid">
            {strategyPreview.map((item) => (
              <article key={item.title} className="strategy-preview-card">
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <a href={item.link} className="text-link">Try this now</a>
              </article>
            ))}
          </div>
        </section>

        {/* Why Choose DoStrike Section */}
        <section className="features-section">
          <h2 className="section-title">Why Choose DoStrike?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Section */}
        <section className="trust-section">
          <h2 className="section-title">Trust & Transparency</h2>
          <div className="trust-grid">
            <div className="trust-card">
              <h3>Contact</h3>
              <p>Email: <a href="mailto:dostrike0@gmail.com">dostrike0@gmail.com</a></p>
              <p>Address: Eastwood, NSW, Australia</p>
            </div>
            <div className="trust-card">
              <h3>Policies</h3>
              <p><a href="/privacy">Privacy Policy</a></p>
              <p><a href="/terms">Terms of Service</a></p>
              <p><a href="/cookies">Cookie Policy</a></p>
            </div>
            <div className="trust-card">
              <h3>Content</h3>
              <p>Original strategy guides and playable games.</p>
              <p>Updated gameplay pages and editorial resources.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="portal-footer">
          <nav className="footer-nav">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/blog">Blog</a>
            <a href="/contact">Contact</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/faq">FAQ</a>
            <a href="/terms">Terms of Service</a>
            <a href="/cookies">Cookie Policy</a>
            <a href="/how-to-play">How to Play</a>
          </nav>
        </footer>
      </div>
    </>
  );
};

export default GamingPortal; 