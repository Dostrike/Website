export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  bestWinStreak: number;
  gamesVsAI: {
    easy: { wins: number; losses: number; draws: number };
    medium: { wins: number; losses: number; draws: number };
    hard: { wins: number; losses: number; draws: number };
  };
  gamesVsPVP: {
    wins: number;
    losses: number;
    draws: number;
  };
}

export class Connect4Stats {
  private static STORAGE_KEY = 'connect4Stats';

  static getDefaultStats(): GameStats {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winStreak: 0,
      bestWinStreak: 0,
      gamesVsAI: {
        easy: { wins: 0, losses: 0, draws: 0 },
        medium: { wins: 0, losses: 0, draws: 0 },
        hard: { wins: 0, losses: 0, draws: 0 }
      },
      gamesVsPVP: {
        wins: 0,
        losses: 0,
        draws: 0
      }
    };
  }

  static loadStats(): GameStats {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new fields
        return { ...this.getDefaultStats(), ...parsed };
      }
    } catch (e) {
      console.warn('Could not load game stats:', e);
    }
    return this.getDefaultStats();
  }

  static saveStats(stats: GameStats): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Could not save game stats:', e);
    }
  }

  static recordGame(
    result: 'win' | 'loss' | 'draw',
    gameMode: 'AI' | 'PVP',
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  ): GameStats {
    const stats = this.loadStats();
    
    // Update overall stats
    stats.totalGames++;
    
    if (result === 'win') {
      stats.wins++;
      stats.winStreak++;
      stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.winStreak);
    } else {
      stats.winStreak = 0;
      if (result === 'loss') {
        stats.losses++;
      } else {
        stats.draws++;
      }
    }

    // Update mode-specific stats
    if (gameMode === 'AI' && difficulty) {
      const difficultyStats = stats.gamesVsAI[difficulty.toLowerCase() as keyof typeof stats.gamesVsAI];
      if (result === 'win') difficultyStats.wins++;
      else if (result === 'loss') difficultyStats.losses++;
      else difficultyStats.draws++;
    } else if (gameMode === 'PVP') {
      if (result === 'win') stats.gamesVsPVP.wins++;
      else if (result === 'loss') stats.gamesVsPVP.losses++;
      else stats.gamesVsPVP.draws++;
    }

    this.saveStats(stats);
    return stats;
  }

  static getWinRate(): number {
    const stats = this.loadStats();
    if (stats.totalGames === 0) return 0;
    return Math.round((stats.wins / stats.totalGames) * 100);
  }

  static resetStats(): void {
    this.saveStats(this.getDefaultStats());
  }
}
