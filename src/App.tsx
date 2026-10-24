import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import GamingPortal from './components/GamingPortal';
import CookieConsent from './components/CookieConsent';
import NotFound from './components/NotFound';
import SiteNavigation from './components/SiteNavigation';
import './App.css';
import PageBoundary from './components/PageBoundary';

const TicTacToeSetup = lazy(() => import('./components/TicTacToeSetup'));
const Connect4Setup = lazy(() => import('./components/Connect4Setup'));
const Connect4Game = lazy(() => import('./components/Connect4Game'));
const MemoryGame = lazy(() => import('./components/MemoryGame'));
const GameScreen = lazy(() => import('./components/GameScreen'));
const PrivateTicTacToe = lazy(() => import('./components/PrivateTicTacToe'));
const HomeScreen = lazy(() => import('./components/HomeScreen'));
const About = lazy(() => import('./components/About'));
const Blog = lazy(() => import('./components/Blog'));
const Article = lazy(() => import('./components/Article'));
const Contact = lazy(() => import('./components/Contact'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const FAQ = lazy(() => import('./components/FAQ'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const CookiePolicy = lazy(() => import('./components/CookiePolicy'));
const EditorialDisclosure = lazy(() => import('./components/EditorialDisclosure'));
const HowToPlay = lazy(() => import('./components/HowToPlay'));
const StrategyPractice = lazy(() => import('./components/StrategyPractice'));


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
        <><Helmet><title>Tic-Tac-Toe game | DoStrike</title><meta name="robots" content="noindex" /></Helmet><GameScreen
          onBackToHome={handleBackToHome}
        /></>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <div className="app">
            <PageBoundary><Suspense fallback={<p role="status" style={{ padding: 32 }}>Loading your game or guide…</p>}>
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
              <Route path="/practice" element={<StrategyPractice />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense></PageBoundary>
            <SiteNavigation />
            <CookieConsent />
      </div>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
