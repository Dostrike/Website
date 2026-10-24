import type { CSSProperties } from 'react';

export default function ResultMark({ outcome }: { outcome: 'win' | 'draw' | 'loss' }) {
  return <div className={`result-mark result-mark-${outcome}`} aria-hidden="true">
    {outcome === 'win' ? <svg viewBox="0 0 48 48" fill="none"><path d="M15 9h18v10c0 8-4 12-9 12s-9-4-9-12V9Z" fill="currentColor" /><path d="M15 12H8v5c0 6 4 9 9 9m16-14h7v5c0 6-4 9-9 9M24 31v8m-8 1h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg> : <span>{outcome === 'draw' ? '=' : '↗'}</span>}
    {outcome === 'win' && <div className="result-sparks">{Array.from({length:6},(_,i)=><i key={i} style={{'--spark':i} as CSSProperties} />)}</div>}
  </div>;
}
