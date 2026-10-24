import { useEffect, useMemo, useState } from 'react';
import { afterMove, analyzeMoves, bestMoves, dailyPuzzle, localDateKey, opposite, previousDateKey } from '../utils/practiceEngine';

type Progress = { date: string; attempts: number; solved: boolean; revealed: boolean; streak: number; total: number; lastSolved: string };
const storageKey = 'dostrike-daily-v1';
const fresh = (date: string): Progress => ({ date, attempts: 0, solved: false, revealed: false, streak: 0, total: 0, lastSolved: '' });
function load(date: string): Progress {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!data || typeof data.date !== 'string' || !Number.isSafeInteger(data.total) || data.total < 0 || !Number.isSafeInteger(data.streak) || data.streak < 0 || typeof data.lastSolved !== 'string') return fresh(date);
    const record = { ...fresh(date), total: data.total, streak: data.lastSolved === previousDateKey(date) || data.lastSolved === date ? data.streak : 0, lastSolved: data.lastSolved };
    return data.date === date ? { ...record, attempts: Number.isSafeInteger(data.attempts) && data.attempts >= 0 ? data.attempts : 0, solved: data.solved === true, revealed: data.revealed === true } : record;
  } catch { return fresh(date); }
}
export default function DailyChallenge() {
  const [date, setDate] = useState(localDateKey);
  const [progress, setProgress] = useState<Progress>(() => fresh(localDateKey()));
  const [choice, setChoice] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  const puzzle = useMemo(() => dailyPuzzle(date), [date]);
  const moves = useMemo(() => analyzeMoves(puzzle.board, puzzle.player), [puzzle]);
  const answers = useMemo(() => bestMoves(puzzle.board, puzzle.player), [puzzle]);
  const finished = progress.solved || progress.revealed;
  useEffect(() => {
    setProgress(load(date)); setChoice(null); setReady(true);
    const refresh = () => {
      const current = localDateKey();
      if (current !== date) { setReady(false); setDate(current); }
    };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [date]);
  const update = (next: Progress) => {
    setProgress(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setSaved(true); } catch { setSaved(false); }
  };
  const choose = (index: number) => {
    if (!ready || finished || puzzle.board[index]) return;
    setChoice(index);
    const solved = answers.includes(index);
    update({ ...progress, attempts: progress.attempts + 1, solved,
      ...(solved ? { total: progress.total + 1, streak: progress.lastSolved === previousDateKey(date) ? progress.streak + 1 : 1, lastSolved: date } : {}) });
  };
  const example = answers[0];
  const selected = moves.find(move => move.index === choice);
  const replies = choice !== null && !answers.includes(choice) ? analyzeMoves(afterMove(puzzle.board, choice, puzzle.player), opposite(puzzle.player)) : [];
  const bestReply = replies.length ? replies.reduce((best, move) => move.score > best.score ? move : best).index : null;
  return <section className="daily-challenge" aria-labelledby="daily-title">
    <p className="daily-eyebrow">Daily strategy challenge · {date}</p>
    <h2 id="daily-title">{puzzle.topic}</h2>
    <p>You play <strong>{puzzle.player}</strong>. Find a winning move, or preserve a draw when no win is available. If several moves win, choose the fastest win.</p>
    <div className="daily-progress" aria-label="Your saved progress"><span><strong>{progress.streak}</strong> day streak</span><span><strong>{progress.total}</strong> {progress.total === 1 ? 'day' : 'days'} solved</span><span><strong>{progress.attempts}</strong> {progress.attempts === 1 ? 'attempt' : 'attempts'} today</span></div>
    <div className="practice-board" role="group" aria-label={`Daily puzzle board. ${puzzle.player} to move.`}>
      {puzzle.board.map((mark, index) => {
        const shownAnswer = finished && index === (progress.solved && choice !== null ? choice : example);
        return <button key={`${date}-${index}`} disabled={!ready || Boolean(mark) || finished} className={shownAnswer ? 'practice-answer' : ''} aria-label={`Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: ${mark || (shownAnswer ? `${puzzle.player}, solution` : 'empty')}`} onClick={() => choose(index)}>{mark || (shownAnswer ? puzzle.player : '')}</button>;
      })}
    </div>
    <div aria-live="polite">
      {finished ? <><h3>{progress.solved ? 'Solved — nicely read' : 'Solution explained'}</h3><p>{puzzle.explanation}</p><p>{answers.length > 1 ? `${answers.length} moves share the best result.` : 'This position has one best move.'} The highlighted square shows {answers.length > 1 ? 'one example' : 'the solution'}.</p><p>{progress.solved ? 'Your result is saved. Come back tomorrow for the next position.' : 'Revealing the solution does not count toward your streak. Use the lessons below to keep practicing.'}</p></> : choice !== null && <p>Try again. {selected && selected.score < 0 ? 'That move allows a forced loss.' : 'There is a stronger move in this position.'} {bestReply !== null && `The opponent’s best reply is row ${Math.floor(bestReply / 3) + 1}, column ${bestReply % 3 + 1}.`}</p>}
    </div>
    {!finished && <button disabled={!ready} onClick={() => update({ ...progress, revealed: true })}>Reveal today’s solution</button>}
    <p className="daily-note">The daily position rotates through our puzzle collection, including reflected and rotated boards. It changes at midnight on your device. Progress is stored only in this browser; clearing browser data resets it.{!saved && ' Your browser could not save progress; this session still works.'}</p>
  </section>;
}
