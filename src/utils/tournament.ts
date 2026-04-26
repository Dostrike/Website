export type TournamentMode = 'SINGLE' | 'BEST_OF_3' | 'BEST_OF_5' | 'BEST_OF_7';

export interface TournamentState {
  mode: TournamentMode;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  currentGame: number;
  isComplete: boolean;
  winner: 'PLAYER1' | 'PLAYER2' | 'DRAW' | null;
}

export class TournamentManager {
  static createTournament(mode: TournamentMode): TournamentState {
    return {
      mode,
      player1Wins: 0,
      player2Wins: 0,
      draws: 0,
      currentGame: 1,
      isComplete: false,
      winner: null
    };
  }

  static recordGameResult(
    tournament: TournamentState,
    result: 'PLAYER1_WIN' | 'PLAYER2_WIN' | 'DRAW'
  ): TournamentState {
    const newTournament = { ...tournament };

    // Record the result
    if (result === 'PLAYER1_WIN') {
      newTournament.player1Wins++;
    } else if (result === 'PLAYER2_WIN') {
      newTournament.player2Wins++;
    } else {
      newTournament.draws++;
    }

    newTournament.currentGame++;

    // Check if tournament is complete
    const requiredWins = this.getRequiredWins(tournament.mode);
    
    if (newTournament.player1Wins >= requiredWins) {
      newTournament.isComplete = true;
      newTournament.winner = 'PLAYER1';
    } else if (newTournament.player2Wins >= requiredWins) {
      newTournament.isComplete = true;
      newTournament.winner = 'PLAYER2';
    } else if (tournament.mode === 'SINGLE') {
      // Single game mode
      newTournament.isComplete = true;
      if (result === 'DRAW') {
        newTournament.winner = 'DRAW';
      }
    }

    return newTournament;
  }

  static getRequiredWins(mode: TournamentMode): number {
    switch (mode) {
      case 'SINGLE': return 1;
      case 'BEST_OF_3': return 2;
      case 'BEST_OF_5': return 3;
      case 'BEST_OF_7': return 4;
      default: return 1;
    }
  }

  static getMaxGames(mode: TournamentMode): number {
    switch (mode) {
      case 'SINGLE': return 1;
      case 'BEST_OF_3': return 3;
      case 'BEST_OF_5': return 5;
      case 'BEST_OF_7': return 7;
      default: return 1;
    }
  }

  static getTournamentProgress(tournament: TournamentState): {
    gamesPlayed: number;
    maxGames: number;
    progress: number;
    status: string;
  } {
    const gamesPlayed = tournament.player1Wins + tournament.player2Wins + tournament.draws;
    const maxGames = this.getMaxGames(tournament.mode);
    const progress = (gamesPlayed / maxGames) * 100;
    
    let status = '';
    if (tournament.isComplete) {
      if (tournament.winner === 'PLAYER1') {
        status = 'Player 1 Wins Tournament!';
      } else if (tournament.winner === 'PLAYER2') {
        status = 'Player 2 Wins Tournament!';
      } else {
        status = 'Tournament Draw!';
      }
    } else {
      const requiredWins = this.getRequiredWins(tournament.mode);
      status = `Game ${gamesPlayed + 1} - First to ${requiredWins} wins`;
    }

    return {
      gamesPlayed,
      maxGames,
      progress,
      status
    };
  }

  static canContinue(tournament: TournamentState): boolean {
    return !tournament.isComplete;
  }

  static getScoreDisplay(tournament: TournamentState): string {
    return `${tournament.player1Wins} - ${tournament.player2Wins}`;
  }
}
