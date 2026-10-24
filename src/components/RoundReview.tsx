import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewRound, reviewExplanation } from '../utils/roundReview';
import './RoundReview.css';

const squareName = (index: number) => `row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}`;
export default function RoundReview({ moves, computerGame }: { moves: number[]; computerGame: boolean }) {
  const review = useMemo(() => reviewRound(moves), [moves]);
  const firstMiss = review.findIndex(move => (!computerGame || move.player === 'X') && move.missedOutcome);
  const [step, setStep] = useState(firstMiss >= 0 ? firstMiss : 0);
  const [showBest, setShowBest] = useState(false);
  if (!review.length) return null;
  const move = review[step];
  const best = move.best[0];
  const changeStep = (next: number) => { setStep(next); setShowBest(false); };
  return <details className="match-details round-review"><summary>Review this round</summary><p className="review-intro">Your actual moves, with an explanation of the position before each turn.{firstMiss >= 0 ? ` The first change was move ${firstMiss + 1}, where ${computerGame ? 'you gave up an available result' : 'the available result changed'}.` : ' No move gave up an available win or draw' + (computerGame ? ' on your turns.' : '.') }</p>
    <div className="review-steps"><button onClick={() => changeStep(step - 1)} disabled={step === 0} aria-label="Review previous move">←</button><strong>Move {step + 1} of {review.length} · {move.player} to play</strong><button onClick={() => changeStep(step + 1)} disabled={step === review.length - 1} aria-label="Review next move">→</button></div>
    <div className="review-board" role="img" aria-label={`Position before move ${step + 1}. ${move.board.map((mark,index) => `${squareName(index)}: ${mark || 'empty'}`).join('; ')}. ${move.player} chose ${squareName(move.played)}.${showBest ? ` Strongest suggested square: ${squareName(best)}.` : ''}`}>
      {move.board.map((mark,index) => <span key={index} aria-hidden="true" className={`${index === move.played ? 'review-chosen' : ''} ${showBest && index === best ? 'review-best' : ''} ${mark === 'X' ? 'review-x' : 'review-o'}`}>{mark || (index === move.played ? <small>{move.player}<i>played</i></small> : '')}</span>)}
    </div>
    <p>{move.player} chose {squareName(move.played)}. The dotted square marks the move played.</p>
    <button className="review-reveal" aria-expanded={showBest} onClick={() => setShowBest(value => !value)}>{showBest ? 'Hide explanation' : 'Explain this move'}</button>
    {showBest && <div className="review-explanation" role="status"><p><strong>Strongest suggestion: {squareName(best)}.</strong> {reviewExplanation(move)}</p><p>Other moves may be equally strong. This analysis assumes perfect replies; it does not predict what a human or an easier computer will do.</p><Link to="/practice">Practice wins, blocks and forks →</Link></div>}
  </details>;
}
