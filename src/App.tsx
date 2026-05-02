import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import GamingPortal from './components/GamingPortal';
import TicTacToeSetup from './components/TicTacToeSetup';
import Connect4Setup from './components/Connect4Setup';
import Connect4Game from './components/Connect4Game';
import MemoryGame from './components/MemoryGame';
import GameScreen from './components/GameScreen';
import PrivateTicTacToe from './components/PrivateTicTacToe';
import HomeScreen from './components/HomeScreen';
import About from './components/About';
import Blog from './components/Blog';
import Article from './components/Article';
import Contact from './components/Contact';
import PrivacyPolicy from './components/PrivacyPolicy';
import FAQ from './components/FAQ';
import TermsOfService from './components/TermsOfService';
import CookiePolicy from './components/CookiePolicy';
import EditorialDisclosure from './components/EditorialDisclosure';
import HowToPlay from './components/HowToPlay';
import CookieConsent from './components/CookieConsent';
import './App.css';


// Wrapper components for legacy components that need props
const HomeScreenWrapper = () => {
  const handleStartGame = () => {
    // Navigate to the new gaming portal
    window.location.href = '/';
  };

  return (
        <HomeScreen 
          onStartGame={handleStartGame}
        />
  );
};

const GameScreenWrapper = () => {
  const handleBackToHome = () => {
    // Navigate back to the gaming portal
    window.location.href = '/';
  };

  return (
        <GameScreen 
          onBackToHome={handleBackToHome}
        />
  );
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Main Portal */}
              <Route path="/" element={<GamingPortal />} />
              
              {/* Game Routes */}
              <Route path="/tictactoe-setup" element={<TicTacToeSetup />} />
              <Route path="/connect4-setup" element={<Connect4Setup />} />
              <Route path="/memory" element={<MemoryGame />} />
              <Route path="/tictactoe" element={<GameScreenWrapper />} />
              <Route path="/tictactoe-private" element={<PrivateTicTacToe />} />
              <Route path="/connect4" element={<Connect4Game />} />
              
              {/* Legacy Routes (for backward compatibility) */}
              <Route path="/home" element={<HomeScreenWrapper />} />
              <Route path="/game" element={<GameScreenWrapper />} />
              
              {/* Static Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<Article />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/editorial" element={<EditorialDisclosure />} />
              <Route path="/how-to-play" element={<HowToPlay />} />
            </Routes>
            <CookieConsent />
      </div>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App; 