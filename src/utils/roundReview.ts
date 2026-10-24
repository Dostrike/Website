import { analyzeMoves, afterMove, opposite, winner, type Mark, type PracticeBoard } from './practiceEngine';

export type ReviewedMove = { board: PracticeBoard; player: Mark; played: number; best: number[]; bestScore: number; playedScore: number; missedOutcome: boolean };
export function reviewRound(moves: number[]): ReviewedMove[] {
  let board: PracticeBoard = Array(9).fill('');
  let player: Mark = 'X';
  return moves.map(played => {
    if (!Number.isInteger(played) || played < 0 || played > 8 || board[played] || winner(board)) throw new Error('Invalid round history');
    const options = analyzeMoves(board, player);
    const bestScore = Math.max(...options.map(move => move.score));
    const playedScore = options.find(move => move.index === played)!.score;
    const move = { board, player, played, best: options.filter(option => option.score === bestScore).map(option => option.index), bestScore, playedScore, missedOutcome: Math.sign(playedScore) < Math.sign(bestScore) };
    board = afterMove(board, played, player);
    player = opposite(player);
    return move;
  });
}

export function reviewExplanation(move: ReviewedMove): string {
  if (move.bestScore === 9 && move.playedScore !== 9) return 'There was a win in one move. Finish your own line before defending or building a new threat.';
  if (move.missedOutcome && move.playedScore < 0) return 'This move allowed a forced loss. The outlined alternative could have kept a draw or win available with correct replies.';
  if (move.missedOutcome) return 'A forced win was available here. This move gave up that advantage; the outlined alternative keeps it with correct replies.';
  if (move.bestScore < 0) return 'This position was already a forced loss against perfect play. The strongest reply delays it, but cannot guarantee a save.';
  if (move.playedScore > 0) return 'This move keeps a forced win available with correct follow-up play.';
  return 'This move keeps a draw available against perfect replies. A draw is the best possible result from this position.';
}
