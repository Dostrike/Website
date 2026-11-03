/** Freestyle Gomoku: Black starts; a line of five or more wins. */
export const GOMOKU_SIZE = 15;
export type Stone = 'black' | 'white';
export type GomokuCell = Stone | null;
export type GomokuState = {
  board: GomokuCell[];
  moves: number[];
  turn: Stone;
  winner: Stone | null;
  winningLine: number[];
  draw: boolean;
};
export const otherStone = (stone: Stone): Stone => stone === 'black' ? 'white' : 'black';
export function newGomoku(): GomokuState {
  return { board: Array<GomokuCell>(225).fill(null), moves: [], turn: 'black', winner: null, winningLine: [], draw: false };
}

export function gomokuLine(board: readonly GomokuCell[], index: number): number[] {
  const stone = board[index];
  if (!stone) return [];
  const row = Math.floor(index / GOMOKU_SIZE);
  const column = index % GOMOKU_SIZE;
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const line = [index];
    for (const sign of [-1, 1]) {
      for (let step = 1; step < GOMOKU_SIZE; step++) {
        const r = row + dr * step * sign;
        const c = column + dc * step * sign;
        if (r < 0 || c < 0 || r >= GOMOKU_SIZE || c >= GOMOKU_SIZE || board[r * GOMOKU_SIZE + c] !== stone) break;
        line.push(r * GOMOKU_SIZE + c);
      }
    }
    if (line.length >= 5) return line.sort((a, b) => a - b);
  }
  return [];
}

/** Returns the original state for illegal or post-result moves. */
export function playGomoku(state: GomokuState, index: number): GomokuState {
  if (!Number.isInteger(index) || index < 0 || index >= 225 || state.board[index] || state.winner || state.draw) return state;
  const board = [...state.board];
  board[index] = state.turn;
  const winningLine = gomokuLine(board, index);
  const moves = [...state.moves, index];
  return { board, moves, turn: otherStone(state.turn), winner: winningLine.length ? state.turn : null, winningLine, draw: !winningLine.length && moves.length === 225 };
}

export function replayGomoku(moves: readonly number[]): GomokuState {
  let state = newGomoku();
  for (const move of moves) {
    const next = playGomoku(state, move);
    if (next === state) throw new Error('Invalid Gomoku history');
    state = next;
  }
  return state;
}

export type GomokuDifficulty = 'easy' | 'medium' | 'hard';
function candidates(board: readonly GomokuCell[]): number[] {
  const choices = new Set<number>();
  board.forEach((stone, index) => {
    if (!stone) return;
    const row = Math.floor(index / 15), col = index % 15;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < 15 && c >= 0 && c < 15 && !board[r * 15 + c]) choices.add(r * 15 + c);
    }
  });
  return choices.size ? [...choices] : board[112] ? [] : [112];
}

function attackScore(board: readonly GomokuCell[], index: number, stone: Stone): number {
  const row = Math.floor(index / 15), col = index % 15;
  let score = 0, threats = 0;
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    let count = 1, open = 0;
    for (const sign of [-1, 1]) {
      let r = row + dr * sign, c = col + dc * sign;
      while (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r * 15 + c] === stone) {
        count++; r += dr * sign; c += dc * sign;
      }
      if (r >= 0 && r < 15 && c >= 0 && c < 15 && !board[r * 15 + c]) open++;
    }
    if (count >= 5) return 1000000;
    if (count === 4 && open === 2) { score += 60000; threats++; }
    else if (count === 4 && open === 1) { score += 9000; threats++; }
    else if (count === 3 && open === 2) { score += 4500; threats++; }
    else if (count === 3 && open === 1) score += 150;
    else if (count === 2 && open === 2) score += 100;
    else if (count === 2 && open === 1) score += 15;
    else if (open) score += open;
  }
  return score + (threats >= 2 ? 12000 : 0);
}

/** Heuristic opponent, not a solved-game claim. Hard checks the opponent's best immediate reply. */
export function chooseGomokuMove(state: GomokuState, difficulty: GomokuDifficulty, random: () => number = Math.random): number | null {
  if (state.winner || state.draw) return null;
  const points = candidates(state.board);
  const opponent = otherStone(state.turn);
  const ranked = points.map(index => ({ index, attack: attackScore(state.board, index, state.turn), defence: attackScore(state.board, index, opponent) }));
  const win = ranked.find(point => point.attack >= 1000000);
  if (win) return win.index;
  const block = ranked.find(point => point.defence >= 1000000);
  if (block) return block.index;
  const centrality = (index: number) => 14 - Math.abs(Math.floor(index / 15) - 7) - Math.abs(index % 15 - 7);
  ranked.sort((a, b) => (b.attack + b.defence * 1.1 + centrality(b.index)) - (a.attack + a.defence * 1.1 + centrality(a.index)) || a.index - b.index);
  if (!ranked.length) return null;
  if (difficulty === 'easy') return ranked[Math.min(4, ranked.length - 1, Math.max(0, Math.floor(random() * Math.min(5, ranked.length))))].index;
  if (difficulty === 'medium') return ranked[0].index;
  let best = ranked[0].index, bestScore = -Infinity;
  for (const point of ranked.slice(0, 12)) {
    const next = playGomoku(state, point.index);
    const reply = candidates(next.board).reduce((maximum, index) => Math.max(maximum, attackScore(next.board, index, opponent)), 0);
    const score = point.attack + point.defence * 1.1 - reply * 1.3 + centrality(point.index);
    if (score > bestScore) { bestScore = score; best = point.index; }
  }
  return best;
}

/** Website daily opening, based on local calendar date; not claimed to match the apps. */
export function gomokuDaily(date: string): GomokuState {
  let seed = 2166136261;
  for (const char of date) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const moves = [112];
  while (moves.length < 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const index = (5 + seed % 5) * 15 + 5 + (seed >>> 8) % 5;
    if (!moves.includes(index)) moves.push(index);
  }
  return replayGomoku(moves);
}
