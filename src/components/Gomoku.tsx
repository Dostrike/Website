import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { chooseGomokuMove, gomokuDaily, newGomoku, playGomoku, replayGomoku, type GomokuDifficulty, type Stone } from '../utils/gomokuEngine';
import './Gomoku.css';

type Settings = { mode: 'computer' | 'local'; difficulty: GomokuDifficulty; side: Stone; confirm: boolean; daily: boolean };
type RecordEntry = { wins: number; losses: number; draws: number };
type Records = Record<GomokuDifficulty, RecordEntry>;
const defaults: Settings = { mode: 'computer', difficulty: 'medium', side: 'black', confirm: true, daily: false };
const dateKey = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; };
const coordinate = (index: number) => `${'ABCDEFGHIJKLMNO'[index % 15]}${15 - Math.floor(index / 15)}`;
function loadRecords(): Records {
  const result: Records = { easy: { wins: 0, losses: 0, draws: 0 }, medium: { wins: 0, losses: 0, draws: 0 }, hard: { wins: 0, losses: 0, draws: 0 } };
  try {
    const stored = JSON.parse(localStorage.getItem('dostrike-gomoku-records-v1') || 'null');
    for (const level of ['easy', 'medium', 'hard'] as const) for (const key of ['wins', 'losses', 'draws'] as const) {
      if (Number.isSafeInteger(stored?.[level]?.[key]) && stored[level][key] >= 0) result[level][key] = stored[level][key];
    }
  } catch { /* Records are optional. */ }
  return result;
}
function readSettings(value: unknown): Settings {
  const data = value as Partial<Settings> | null;
  if (data?.daily) return { ...defaults, difficulty: 'hard', daily: true };
  return { mode: data?.mode === 'local' ? 'local' : 'computer', difficulty: data?.difficulty === 'easy' || data?.difficulty === 'hard' ? data.difficulty : 'medium', side: data?.side === 'white' ? 'white' : 'black', confirm: data?.confirm !== false, daily: false };
}
function loadSession() {
  try {
    const value = JSON.parse(localStorage.getItem('dostrike-gomoku-session-v1') || 'null');
    if (!value || !Array.isArray(value.moves) || value.moves.length === 0 || value.moves.length > 225 || typeof value.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.day)) return null;
    const game = replayGomoku(value.moves);
    if (game.winner || game.draw) return null;
    return { game, settings: readSettings(value.settings), day: value.day };
  } catch { return null; }
}
export default function Gomoku() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSetup = location.pathname === '/gomoku-setup';
  const [saved, setSaved] = useState(loadSession);
  const [initial] = useState(() => location.state ? null : loadSession());
  const [settings, setSettings] = useState<Settings>(() => initial?.settings || readSettings(location.state));
  const [day, setDay] = useState(() => initial?.day || dateKey());
  const [game, setGame] = useState(() => initial?.game || (settings.daily ? gomokuDaily(day) : newGomoku()));
  const [focus, setFocus] = useState(112);
  const [preview, setPreview] = useState<number | null>(null);
  const [records, setRecords] = useState(loadRecords);
  const [notice, setNotice] = useState('');
  const [dailyWon, setDailyWon] = useState(() => { try { return JSON.parse(localStorage.getItem('dostrike-gomoku-daily-v1') || 'null')?.lastWon || ''; } catch { return ''; } });
  const boardScroll = useRef<HTMLDivElement>(null);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const counted = useRef(false);
  const initialBoardFocus = useRef(false);
  const ended = Boolean(game.winner || game.draw);
  const thinking = !ended && settings.mode === 'computer' && game.turn !== settings.side;
  const status = game.winner ? `${game.winner === 'black' ? 'Black' : 'White'} wins${settings.mode === 'computer' ? game.winner === settings.side ? ' — nicely played!' : ' — the computer takes this round.' : '.'}` : game.draw ? 'The board is full. This round is a draw.' : thinking ? 'Computer is thinking…' : `${game.turn === 'black' ? 'Black' : 'White'} to move${settings.mode === 'computer' ? ' — your turn.' : '.'}`;
  const reset = () => {
    counted.current = false;
    setGame(settings.daily ? gomokuDaily(day) : newGomoku());
    setPreview(null); setFocus(112); setNotice('');
  };
  useEffect(() => {
    if (isSetup) return;
    try { localStorage.setItem('dostrike-last-pick', 'gomoku'); } catch { /* Optional preference. */ }
    if (!initialBoardFocus.current) {
      initialBoardFocus.current = true;
      const scroll = boardScroll.current;
      if (scroll) scroll.scrollLeft = (scroll.scrollWidth - scroll.clientWidth) / 2;
    }
  }, [isSetup]);
  useEffect(() => {
    if (isSetup) return;
    try {
      if (ended || game.moves.length === 0) localStorage.removeItem('dostrike-gomoku-session-v1');
      else localStorage.setItem('dostrike-gomoku-session-v1', JSON.stringify({ moves: game.moves, settings, day }));
    } catch { /* Continuing works only when browser storage is available. */ }
  }, [game, settings, day, ended, isSetup]);
  useEffect(() => {
    if (isSetup) setSaved(loadSession());
  }, [isSetup]);
  useEffect(() => {
    if (isSetup || !thinking) return;
    const timer = window.setTimeout(() => {
      const index = chooseGomokuMove(game, settings.difficulty);
      if (index !== null) setGame(current => current === game ? playGomoku(current, index) : current);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [game, isSetup, thinking, settings.difficulty]);
  useEffect(() => {
    if (isSetup || !ended || counted.current || settings.mode !== 'computer') return;
    counted.current = true;
    const next = loadRecords();
    next[settings.difficulty][game.draw ? 'draws' : game.winner === settings.side ? 'wins' : 'losses']++;
    setRecords(next);
    try { localStorage.setItem('dostrike-gomoku-records-v1', JSON.stringify(next)); } catch { /* Play remains available. */ }
    if (settings.daily && game.winner === 'black') {
      setDailyWon(day);
      try { localStorage.setItem('dostrike-gomoku-daily-v1', JSON.stringify({ lastWon: day })); } catch { /* Optional record. */ }
    }
  }, [ended, game.draw, game.winner, settings.mode, settings.difficulty, settings.side, settings.daily, day, isSetup]);
  const place = (index: number) => {
    if (thinking || ended || game.board[index]) return;
    setGame(current => playGomoku(current, index)); setPreview(null); setNotice('');
  };
  const activate = (index: number) => {
    if (thinking || ended || game.board[index]) return;
    if (settings.confirm && preview !== index) { setPreview(index); setNotice(`${coordinate(index)} selected. Place stone to confirm, or select another intersection.`); }
    else place(index);
  };
  const undo = () => {
    if (ended || game.moves.length <= (settings.daily ? 4 : 0)) return;
    const count = settings.mode === 'local' || thinking ? 1 : 2;
    const remaining = Math.max(settings.daily ? 4 : 0, game.moves.length - count);
    setGame(replayGomoku(game.moves.slice(0, remaining))); setPreview(null); setNotice('Move taken back.');
  };
  const start = (daily = false) => {
    const next = daily ? { ...defaults, difficulty: 'hard' as const, daily: true } : { ...settings, daily: false };
    const today = dateKey(); setDay(today);
    setSettings(next); counted.current = false; initialBoardFocus.current = false;
    setGame(daily ? gomokuDaily(today) : newGomoku()); setPreview(null); setNotice('');
    navigate('/gomoku', { state: next });
  };
  return <main className="gomoku-page">
    <Helmet><title>{isSetup ? 'Gomoku — Play Five in a Row Free | DoStrike' : 'Gomoku game | DoStrike'}</title><meta name="description" content="Play freestyle Gomoku on a 15 by 15 board. Challenge three computer levels or a friend, learn five-in-a-row tactics, and try a daily opening." /><link rel="canonical" href={`https://dostrike.com/${isSetup ? 'gomoku-setup' : 'gomoku'}`} />{!isSetup && <meta name="robots" content="noindex" />}<script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "DoStrike Gomoku", applicationCategory: "GameApplication", operatingSystem: "Any", url: "https://dostrike.com/gomoku-setup", isAccessibleForFree: true, description: "Freestyle five-in-a-row on a 15 by 15 board, with local two-player and three heuristic computer levels." })}</script></Helmet>
    <div className="gomoku-top"><Link to="/">← All games</Link><Link to="/blog/gomoku-threats-and-open-fours">Learn the patterns ↗</Link></div>
    <header className="gomoku-heading"><p className="gomoku-eyebrow">FIVE STONES. ONE GOOD PLAN.</p><h1>Gomoku</h1><p>Simple to learn. Room to think.<br />Build a line of five before your opponent does.</p></header>
    {isSetup ? <>
      {saved && <section className="gomoku-continue"><div><strong>Your board is waiting.</strong><p>{saved.game.moves.length} {saved.game.moves.length === 1 ? 'stone' : 'stones'} played · {saved.settings.daily ? `Opening from ${saved.day}` : saved.settings.mode === 'local' ? 'Two players' : `${saved.settings.difficulty} computer`}</p></div><button onClick={() => { setSettings(saved.settings); setDay(saved.day); setGame(saved.game); counted.current = false; initialBoardFocus.current = false; setPreview(null); setNotice('Round continued.'); navigate('/gomoku', { state: saved.settings }); }}>Continue round →</button></section>}
      <section className="gomoku-setup" aria-labelledby="setup-title"><h2 id="setup-title">Make your first move.</h2>
        <fieldset><legend>Who’s playing?</legend><div className="gomoku-options">{(['computer','local'] as const).map(mode => <button key={mode} aria-pressed={settings.mode === mode} onClick={() => setSettings({ ...settings, mode })}>{mode === 'computer' ? 'Play the computer' : 'Two players'}</button>)}</div></fieldset>
        {settings.mode === 'computer' && <><fieldset><legend>Choose your challenge</legend><div className="gomoku-options">{(['easy','medium','hard'] as const).map(difficulty => <button key={difficulty} aria-pressed={settings.difficulty === difficulty} onClick={() => setSettings({ ...settings, difficulty })}>{difficulty}</button>)}</div><p>{settings.difficulty === 'easy' ? 'A varied opponent. Still spots immediate wins and blocks.' : settings.difficulty === 'medium' ? 'Balances building its own lines with blocking yours.' : 'Also checks your strongest immediate reply. Challenging, but beatable.'}</p></fieldset><fieldset><legend>Your stones</legend><div className="gomoku-options">{(['black','white'] as const).map(side => <button key={side} aria-pressed={settings.side === side} onClick={() => setSettings({ ...settings, side })}>{side}{side === 'black' ? ' · first move' : ' · second move'}</button>)}</div></fieldset></>}
        <label className="gomoku-check"><input type="checkbox" checked={settings.confirm} onChange={event => setSettings({ ...settings, confirm: event.target.checked })} />Preview before placing a stone</label>
        <button className="gomoku-primary" onClick={() => start()}>Start playing ↗</button><p className="gomoku-small">Free to play. No account. No downloads.</p>
      </section>
      <section className="gomoku-daily"><div><p className="gomoku-eyebrow">TODAY’S OPENING · {dateKey()}</p><h2>{dailyWon === dateKey() ? 'Today’s opening completed.' : 'A different starting point.'}</h2><p>Four stones are already down. Play Black against Hard and find your own route to five. The opening changes each local calendar day.</p></div><button onClick={() => start(true)}>Play today’s opening →</button></section>
    </> : <section className="gomoku-play" aria-label="Gomoku game">
      <div className="gomoku-match-info"><span>{settings.daily ? `Daily opening · ${day}` : settings.mode === 'local' ? 'Two players · same device' : `${settings.difficulty} computer · you play ${settings.side}`}</span><Link to="/gomoku-setup">Change setup</Link></div>
      <p className="gomoku-status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
      <p className="gomoku-small">Move {game.moves.length + (ended ? 0 : 1)}{game.moves.length > 0 ? ` · Last stone: ${coordinate(game.moves[game.moves.length-1])}` : ' · Black starts'} · Five or more in a row wins</p>
      <p id="gomoku-board-help" className="gomoku-board-help">On a phone, scroll the board to see the edges. Keyboard: arrow keys move; Enter selects{settings.confirm ? ', then Enter again places' : ' and places'}. Coordinates run A–O and 15–1.</p>
      <div ref={boardScroll} className="gomoku-board-scroll" tabIndex={0} role="region" aria-label="Scrollable Gomoku board" aria-describedby="gomoku-board-help"><div className="gomoku-board" role="grid" aria-label="15 by 15 Gomoku board" aria-rowcount={15} aria-colcount={15}>{Array.from({ length: 15 }, (_, row) => <div role="row" key={row}>{Array.from({ length: 15 }, (_, column) => {
        const index = row * 15 + column, stone = game.board[index];
        return <button type="button" role="gridcell" aria-rowindex={row+1} aria-colindex={column+1} key={index} ref={element => { cells.current[index] = element; }} tabIndex={focus === index ? 0 : -1} aria-label={`${coordinate(index)}, ${stone || (preview === index ? `${game.turn} preview` : 'empty')}${game.winningLine.includes(index) ? ', winning line' : ''}${game.moves[game.moves.length-1] === index ? ', last move' : ''}`} aria-disabled={Boolean(stone || ended || thinking)} className={`gomoku-point ${stone ? `stone-${stone}` : ''} ${preview === index ? `preview-${game.turn}` : ''} ${game.winningLine.includes(index) ? 'is-winning' : ''} ${game.moves[game.moves.length-1] === index ? 'is-last' : ''}`} onFocus={() => setFocus(index)} onClick={() => activate(index)} onKeyDown={event => {
          const keys: Record<string, number> = { ArrowLeft: column > 0 ? index-1 : index, ArrowRight: column < 14 ? index+1 : index, ArrowUp: row > 0 ? index-15 : index, ArrowDown: row < 14 ? index+15 : index, Home: row*15, End: row*15+14 };
          if (event.key in keys) { event.preventDefault(); cells.current[keys[event.key]]?.focus(); }
        }}><span aria-hidden="true" className="gomoku-stone" />{(row === 0 || column === 0) && <small aria-hidden="true">{row === 0 ? 'ABCDEFGHIJKLMNO'[column] : 15-row}</small>}</button>;
      })}</div>)}</div></div>
      <div className="gomoku-actions">{!ended && <><button className="gomoku-primary" disabled={preview === null || thinking} onClick={() => preview !== null && place(preview)}>{preview === null ? 'Select an intersection' : `Place at ${coordinate(preview)}`}</button><button disabled={game.moves.length <= (settings.daily ? 4 : settings.mode === 'computer' && settings.side === 'white' ? 1 : 0)} onClick={undo}>Undo</button><button disabled={thinking} onClick={() => { const hint = chooseGomokuMove(game, 'hard'); if (hint !== null) { setPreview(hint); cells.current[hint]?.focus(); setNotice(`Suggested point: ${coordinate(hint)}. A heuristic suggestion, not a guaranteed winning move.`); } }}>Suggest a move</button></>}<button onClick={reset}>{ended ? 'Play again' : 'Restart'}</button></div>
      <p className="gomoku-notice" role="status">{notice}</p>
      {ended && <div className="gomoku-result"><h2>{game.winner ? 'Follow the winning line.' : 'Every point played.'}</h2><p>{game.winner ? `The highlighted stones connect ${game.winningLine.length} in a row. Before your next round, look for the move that left this line open.` : 'Neither player made five. Try a fresh board and look for threats with two open ends.'}</p><Link to="/blog/gomoku-threats-and-open-fours">Learn open fours and forced blocks →</Link></div>}
    </section>}
    <section className="gomoku-records"><h2>Your computer games</h2><p>Completed rounds on this browser. Hints and undo are free; these casual records include assisted games and daily openings.</p><div>{(['easy','medium','hard'] as const).map(level => <p key={level}><strong>{level}</strong><span>{records[level].wins} {records[level].wins === 1 ? 'win' : 'wins'} · {records[level].losses} {records[level].losses === 1 ? 'loss' : 'losses'} · {records[level].draws} {records[level].draws === 1 ? 'draw' : 'draws'}</span></p>)}</div></section>
    <section className="gomoku-rules" aria-labelledby="gomoku-rules-title"><h2 id="gomoku-rules-title">How to play freestyle Gomoku</h2><ol><li>Black places the first stone. Players take turns placing one stone on an empty intersection.</li><li>Connect five or more of your stones horizontally, vertically or diagonally. A full board without a winning line is a draw.</li><li>This is freestyle: there are no forbidden moves or special opening swaps. Six in a row also wins.</li><li>Check for an immediate win first, then an opponent’s four. Build threats with open ends to make blocking harder.</li></ol><p>The computer uses pattern scoring. Hard also evaluates your strongest immediate reply; none of the levels is claimed to play perfectly. The daily opening is generated for this website and may differ from the apps.</p><Link to="/blog/gomoku-threats-and-open-fours">Try three worked strategy examples →</Link></section>
  </main>;
}
