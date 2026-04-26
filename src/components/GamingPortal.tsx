import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaRocket, FaGamepad, FaUsers, FaTrophy, FaEnvelope } from 'react-icons/fa';
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
      route: '/tictactoe-setup'
    },
    {
      id: 'connect4',
      name: 'Connect 4',
      description: 'Drop checkers to get four in a row!',
      players: '1-2 Players',
      difficulty: 'Medium',
      visual: '🔴🟡',
      available: true,
      route: '/connect4-setup'
    },
    {
      id: 'rockpaperscissors',
      name: 'Rock Paper Scissors',
      description: 'Classic hand game. Best of 3 rounds wins!',
      players: '2 Players',
      difficulty: 'Easy',
      visual: '✊✋',
      available: true,
      route: '/rockpaperscissors'
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
    },
    {
      id: 'wordguessing',
      name: 'Word Guessing',
      description: 'Guess the hidden word letter by letter!',
      players: '1-4 Players',
      difficulty: 'Easy - Hard',
      visual: 'W O R ? ?',
      available: false,
      route: '/wordguessing'
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
              Your ultimate destination for online multiplayer games. Play classic games, create private rooms, and challenge friends!
            </p>
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
        <section className="games-section">
          <h2 className="section-title">Choose Your Game</h2>
          <div className="games-grid">
            {games.map((game) => (
              <div 
                key={game.id} 
                className={`game-card ${!game.available ? 'coming-soon' : ''}`}
                onClick={() => handleGameClick(game)}
              >
                <div className="game-visual">{game.visual}</div>
                <h3 className="game-name">{game.name}</h3>
                <p className="game-description">{game.description}</p>
                <div className="game-details">
                  <span className="game-players">{game.players}</span>
                  <span className="game-difficulty">{game.difficulty}</span>
                </div>
                {game.available ? (
                  <button className="play-button">Play Now</button>
                ) : (
                  <div className="coming-soon-badge">Coming Soon</div>
                )}
              </div>
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

        {/* Newsletter Section */}
        <section className="newsletter-section">
          <h2 className="newsletter-title">Stay Updated with Tic-Tac-Toe Strategy</h2>
          <p className="newsletter-description">
            Get the latest strategy tips, game variations, and community updates delivered to your inbox!
          </p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="newsletter-input"
            />
            <button className="newsletter-button">
              <FaEnvelope />
              Subscribe
            </button>
          </div>
          <p className="newsletter-privacy">
            We respect your privacy. Unsubscribe at any time.
          </p>
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