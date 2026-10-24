export type Mark = 'X' | 'O';
export type PracticeBoard = Array<Mark | ''>;
const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const cache = new Map<string, number>();
export const opposite = (player: Mark): Mark => player === 'X' ? 'O' : 'X';
export const winner = (board: PracticeBoard): Mark | null => {
  for (const [a, b, c] of lines) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a] as Mark;
  return null;
};
export const afterMove = (board: PracticeBoard, index: number, player: Mark): PracticeBoard => board.map((cell, square) => square === index ? player : cell);
// Negamax: each player chooses their best reply. Distance favors quicker wins.
export function evaluatePosition(board: PracticeBoard, player: Mark): number {
  const won = winner(board);
  if (won) return won === player ? 10 : -10;
  if (board.every(Boolean)) return 0;
  const key = board.map(cell => cell || '-').join('') + player;
  const remembered = cache.get(key);
  if (remembered !== undefined) return remembered;
  const value = Math.max(...analyzeMoves(board, player).map(move => move.score));
  cache.set(key, value);
  return value;
}
export function analyzeMoves(board: PracticeBoard, player: Mark): Array<{ index: number; score: number }> {
  if (winner(board) || board.every(Boolean)) return [];
  return board.flatMap((cell, index) => {
    if (cell) return [];
    const reply = -evaluatePosition(afterMove(board, index, player), opposite(player));
    return [{ index, score: reply > 0 ? reply - 1 : reply < 0 ? reply + 1 : 0 }];
  });
}
export const bestMoves = (board: PracticeBoard, player: Mark): number[] => {
  const moves = analyzeMoves(board, player);
  const best = Math.max(...moves.map(move => move.score));
  return moves.filter(move => move.score === best).map(move => move.index);
};
export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function previousDateKey(key: string): string {
  const [year, month, day] = key.split('-').map(Number);
  return localDateKey(new Date(year, month - 1, day - 1));
}
export const dailyPuzzles: Array<{ board: PracticeBoard; player: Mark; topic: string; explanation: string }> = [
  { board: ['X', 'X', '', 'O', 'O', '', '', '', ''], player: 'X', topic: 'Win before defending', explanation: 'Complete your own three-in-a-row first. The game ends immediately, so the other player cannot finish their threatened line.' },
  { board: ['O', 'O', '', 'X', '', '', '', '', 'X'], player: 'X', topic: 'Find the forced block', explanation: 'The opponent has two marks on an open line. Fill its remaining square: choosing a promising center or corner instead would allow an immediate loss. After blocking, keep scanning for your own threats; defense can become an attack.' },
  { board: ['X', '', 'O', '', 'O', '', '', '', 'X'], player: 'X', topic: 'Turn defense into a fork', explanation: 'Block the opponent’s diagonal while creating two threats of your own. After this move, the opponent cannot stop both of your winning squares.' },
  { board: ['X', '', '', '', 'O', '', '', '', 'X'], player: 'O', topic: 'Defend opposite corners', explanation: 'Choose an edge. With X in opposite corners and O in the center, choosing another corner allows X to create a fork. There are four equally strong edge moves; each can preserve a draw with correct replies.' },
];
export function dailyPuzzle(key: string) {
  const [year, month, date] = key.split('-').map(Number);
  const day = Math.floor(Date.UTC(year, month - 1, date) / 86400000);
  const puzzle = dailyPuzzles[((day % dailyPuzzles.length) + dailyPuzzles.length) % dailyPuzzles.length];
  const rotation = ((Math.floor(day / dailyPuzzles.length) % 4) + 4) % 4;
  const reflected = Math.floor(day / 16) % 2 !== 0;
  const board: PracticeBoard = Array(9).fill('');
  puzzle.board.forEach((cell, index) => {
    let row = Math.floor(index / 3), col = index % 3;
    if (reflected) col = 2 - col;
    for (let turn = 0; turn < rotation; turn++) [row, col] = [col, 2 - row];
    board[row * 3 + col] = cell;
  });
  return { ...puzzle, board };
}
