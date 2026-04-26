export interface Connect4Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    boardGradient: string;
    cellBackground: string;
    player1: {
      gradient: string;
      shadow: string;
      border: string;
    };
    player2: {
      gradient: string;
      shadow: string;
      border: string;
    };
    winningGlow: string;
    winningGlowSecondary: string;
  };
}

export const CONNECT4_THEMES: Connect4Theme[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Vibrant red vs golden yellow',
    colors: {
      background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
      boardGradient: 'linear-gradient(135deg, #1976d2 60%, #5e35b1 100%)',
      cellBackground: 'rgba(255,255,255,0.28)',
      player1: {
        gradient: 'radial-gradient(circle at 30% 30%, #ff5252 0%, #d32f2f 70%, #b71c1c 100%)',
        shadow: '0 3px 18px 0 rgba(211,47,47,0.25), 0 2px 4px 0 rgba(211,47,47,0.15)',
        border: '#ffebee66'
      },
      player2: {
        gradient: 'radial-gradient(circle at 30% 30%, #ffeb3b 0%, #ffc107 70%, #ff8f00 100%)',
        shadow: '0 3px 18px 0 rgba(255,193,7,0.25), 0 2px 4px 0 rgba(255,193,7,0.15)',
        border: '#fffde766'
      },
      winningGlow: '#ffeb3b',
      winningGlowSecondary: '#ffff72'
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Bright teal vs vibrant coral',
    colors: {
      background: 'linear-gradient(135deg, #e0f7fa 0%, #e0f2f1 100%)',
      boardGradient: 'linear-gradient(135deg, #006064 60%, #004d40 100%)',
      cellBackground: 'rgba(255,255,255,0.2)',
      player1: {
        gradient: 'radial-gradient(circle at 30% 30%, #4dd0e1 0%, #00bcd4 70%, #00acc1 100%)',
        shadow: '0 3px 18px 0 rgba(0,188,212,0.35), 0 2px 4px 0 rgba(0,188,212,0.2)',
        border: '#b2ebf2'
      },
      player2: {
        gradient: 'radial-gradient(circle at 30% 30%, #ff8a65 0%, #ff5722 70%, #f4511e 100%)',
        shadow: '0 3px 18px 0 rgba(255,87,34,0.35), 0 2px 4px 0 rgba(255,87,34,0.2)',
        border: '#ffccbc'
      },
      winningGlow: '#18ffff',
      winningGlowSecondary: '#84ffff'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Vibes',
    description: 'Warm amber vs deep purple',
    colors: {
      background: 'linear-gradient(135deg, #2c3e50 0%, #4a148c 100%)',
      boardGradient: 'linear-gradient(135deg, #e65100 60%, #880e4f 100%)',
      cellBackground: 'rgba(255,255,255,0.15)',
      player1: {
        gradient: 'radial-gradient(circle at 30% 30%, #ffd54f 0%, #ffb300 70%, #ff8f00 100%)',
        shadow: '0 0 15px 5px rgba(255, 179, 0, 0.3), 0 0 30px 15px rgba(255, 179, 0, 0.15)',
        border: '#fff176'
      },
      player2: {
        gradient: 'radial-gradient(circle at 30% 30%, #ce93d8 0%, #ab47bc 70%, #8e24aa 100%)',
        shadow: '0 0 15px 5px rgba(171, 71, 188, 0.3), 0 0 30px 15px rgba(171, 71, 188, 0.15)',
        border: '#e1bee7'
      },
      winningGlow: '#ffd600',
      winningGlowSecondary: '#ffff56'
    }
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Vibrant green vs warm brown',
    colors: {
      background: 'linear-gradient(135deg, #1b5e20 0%, #3e2723 100%)',
      boardGradient: 'linear-gradient(135deg, #1b5e20 60%, #3e2723 100%)',
      cellBackground: 'rgba(255,255,255,0.15)',
      player1: {
        gradient: 'radial-gradient(circle at 30% 30%, #76ff03 0%, #64dd17 70%, #2e7d32 100%)',
        shadow: '0 0 15px 5px rgba(100, 221, 23, 0.3), 0 0 30px 15px rgba(100, 221, 23, 0.15)',
        border: '#ccff90'
      },
      player2: {
        gradient: 'radial-gradient(circle at 30% 30%, #ffab91 0%, #ff8a65 70%, #f4511e 100%)',
        shadow: '0 0 15px 5px rgba(244, 81, 30, 0.3), 0 0 30px 15px rgba(244, 81, 30, 0.15)',
        border: '#ffccbc'
      },
      winningGlow: '#76ff03',
      winningGlowSecondary: '#b9f6ca'
    }
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    description: 'Electric cyan vs hot pink',
    colors: {
      background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3d 100%)',
      boardGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      cellBackground: 'rgba(255,255,255,0.1)',
      player1: {
        gradient: 'radial-gradient(circle at 30% 30%, #00f2fe 0%, #00d2ff 50%, #00a8ff 100%)',
        shadow: '0 0 15px 5px rgba(0, 242, 254, 0.4), 0 0 30px 15px rgba(0, 242, 254, 0.2)',
        border: '#00f2fe99'
      },
      player2: {
        gradient: 'radial-gradient(circle at 30% 30%, #ff6b6b 0%, #ff2d75 50%, #d100d1 100%)',
        shadow: '0 0 15px 5px rgba(255, 45, 117, 0.4), 0 0 30px 15px rgba(255, 45, 117, 0.2)',
        border: '#ff2d7599'
      },
      winningGlow: '#00ff9d',
      winningGlowSecondary: '#00ffcc'
    }
  }
];

export class ThemeManager {
  private static STORAGE_KEY = 'connect4Theme';
  private static currentTheme: Connect4Theme = CONNECT4_THEMES[0];

  static getCurrentTheme(): Connect4Theme {
    return this.currentTheme;
  }

  static setTheme(themeId: string): Connect4Theme {
    const theme = CONNECT4_THEMES.find(t => t.id === themeId) || CONNECT4_THEMES[0];
    this.currentTheme = theme;
    this.saveTheme(themeId);
    this.applyThemeToCSS(theme);
    return theme;
  }

  static loadSavedTheme(): Connect4Theme {
    try {
      const savedThemeId = localStorage.getItem(this.STORAGE_KEY);
      if (savedThemeId) {
        const theme = CONNECT4_THEMES.find(t => t.id === savedThemeId);
        if (theme) {
          this.currentTheme = theme;
          this.applyThemeToCSS(theme);
          return theme;
        }
      }
    } catch (e) {
      console.warn('Could not load saved theme:', e);
    }
    
    // Default theme
    this.applyThemeToCSS(this.currentTheme);
    return this.currentTheme;
  }

  private static saveTheme(themeId: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, themeId);
    } catch (e) {
      console.warn('Could not save theme:', e);
    }
  }

  private static applyThemeToCSS(theme: Connect4Theme): void {
    // Apply theme colors to CSS custom properties
    const root = document.documentElement;
    
    // Board wrapper background
    root.style.setProperty('--c4-board-bg', theme.colors.background);
    root.style.setProperty('--c4-board-gradient', theme.colors.boardGradient);
    root.style.setProperty('--c4-cell-bg', theme.colors.cellBackground);
    
    // Player colors
    root.style.setProperty('--c4-player1-gradient', theme.colors.player1.gradient);
    root.style.setProperty('--c4-player1-shadow', theme.colors.player1.shadow);
    root.style.setProperty('--c4-player1-border', theme.colors.player1.border);
    
    root.style.setProperty('--c4-player2-gradient', theme.colors.player2.gradient);
    root.style.setProperty('--c4-player2-shadow', theme.colors.player2.shadow);
    root.style.setProperty('--c4-player2-border', theme.colors.player2.border);
    
    // Winning effects
    root.style.setProperty('--c4-winning-glow', theme.colors.winningGlow);
    root.style.setProperty('--c4-winning-glow-secondary', theme.colors.winningGlowSecondary);
  }

  static getAllThemes(): Connect4Theme[] {
    return CONNECT4_THEMES;
  }
}
