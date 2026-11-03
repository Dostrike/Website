import type { Mark, PracticeBoard } from '../utils/practiceEngine';

export type GuideExercise = {
  id: string;
  title: string;
  board: PracticeBoard;
  player: Mark;
  answers: number[];
  prompt: string;
  explanation: string;
};
export const guideExercises: GuideExercise[] = [
  { id: 'win-first', title: '1. Win before defending', board: ['X','X','','O','O','','','',''], player: 'X', answers: [2], prompt: 'X to move. Both sides threaten a row. Choose the move that ends the round now.', explanation: 'Square 3 completes X’s top row immediately. Blocking at 6 misses that win; O never gets a turn after X completes three.' },
  { id: 'forced-block', title: '2. Find the forced block', board: ['O','O','','X','','','','','X'], player: 'X', answers: [2], prompt: 'X to move. There is no immediate X win. Which square prevents O winning on the next move?', explanation: 'Square 3 blocks O’s top row. Every other available choice lets O finish at 3. Taking the centre does not answer that immediate threat.' },
  { id: 'defensive-fork', title: '3. Stop a threat and create two', board: ['X','','O','','O','','','','X'], player: 'X', answers: [6], prompt: 'X to move. Block O’s diagonal while creating two winning points of your own.', explanation: 'Square 7 blocks O’s 3–5–7 diagonal and creates X threats at 4 and 8. O cannot stop both and has no immediate win, so X can finish next turn.' },
  { id: 'opposite-corners', title: '4. Defend opposite corners', board: ['X','','','','O','','','','X'], player: 'O', answers: [1,3,5,7], prompt: 'O to move. Choose a square that can preserve a draw against perfect replies. There are four correct choices.', explanation: 'Any edge — 2, 4, 6 or 8 — can preserve a draw with correct later play. Taking a free corner at 3 or 7 allows X to force a win. A saving move still requires accurate replies afterwards.' },
];
export function exercisesForGuide(slug: string): GuideExercise[] {
  if (slug === 'complete-tic-tac-toe-strategy-guide') return guideExercises;
  if (slug === 'tic-tac-toe-education-teaching-resource') return guideExercises.slice(0, 2);
  return [];
}
