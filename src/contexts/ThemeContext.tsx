import React, { createContext, useContext, useEffect, ReactNode } from 'react';

type Theme = 'classic' | 'ocean' | 'sunset' | 'forest' | 'midnight' | 'neon' | 'pastel';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Fixed game-pleasing theme - no theme switching
  const currentTheme: Theme = 'ocean'; // Clean, modern blue theme perfect for gaming

  useEffect(() => {
    // Apply the fixed theme on mount
    applyTheme(currentTheme);
  }, []);

  const applyTheme = (theme: Theme) => {
    // Remove all existing theme classes
    document.body.classList.remove('theme-classic', 'theme-ocean', 'theme-sunset', 'theme-forest', 'theme-midnight', 'theme-neon', 'theme-pastel');
    // Add the fixed theme class
    document.body.classList.add(`theme-${theme}`);
  };

  // No-op function since we don't allow theme switching
  const setTheme = () => {};

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 