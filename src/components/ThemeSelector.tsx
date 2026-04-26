import { useState } from 'react';
import { GameTheme } from '../types/game';
import './ThemeSelector.css';

interface ThemeSelectorProps {
  currentTheme: GameTheme;
  onThemeChange: (theme: GameTheme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: GameTheme.CLASSIC, name: 'Classic', icon: '🎯' },
    { value: GameTheme.OCEAN, name: 'Ocean', icon: '🌊' },
    { value: GameTheme.SUNSET, name: 'Sunset', icon: '🌅' },
    { value: GameTheme.FOREST, name: 'Forest', icon: '🌲' },
    { value: GameTheme.MIDNIGHT, name: 'Midnight', icon: '🌙' },
    { value: GameTheme.NEON, name: 'Neon', icon: '✨' },
    { value: GameTheme.PASTEL, name: 'Pastel', icon: '🌸' }
  ];

  const currentThemeData = themes.find(theme => theme.value === currentTheme);

  const handleThemeSelect = (theme: GameTheme) => {
    onThemeChange(theme);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector-container">
      <button
        className="theme-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select theme"
      >
        <span className="theme-icon">{currentThemeData?.icon}</span>
        <span className="theme-name">{currentThemeData?.name}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          {themes.map((theme) => (
            <button
              key={theme.value}
              className={`theme-option ${currentTheme === theme.value ? 'active' : ''}`}
              onClick={() => handleThemeSelect(theme.value)}
            >
              <span className="theme-icon">{theme.icon}</span>
              <span className="theme-name">{theme.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector; 