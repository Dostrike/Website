import { useState } from 'react';
import { exercisesForGuide, type GuideExercise } from '../data/guideExercises';
import './GuideExercises.css';

function Exercise({ exercise }: { exercise: GuideExercise }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const solved = choice !== null && exercise.answers.includes(choice);
  const showAnswer = solved || revealed;
  const feedback = showAnswer ? `${solved ? 'Correct. ' : 'Answer revealed. '}${exercise.explanation}` : choice === null ? 'Choose an empty square. You can retry as often as you like.' : `Square ${choice+1} does not solve this exercise. Try another empty square, or reveal the explanation.`;
  return <section className="guide-exercise" aria-labelledby={`exercise-${exercise.id}`}>
    <h3 id={`exercise-${exercise.id}`}>{exercise.title}</h3><p>{exercise.prompt}</p>
    <div className="guide-exercise-board" role="group" aria-label={`${exercise.title}: top row squares 1 to 3, middle row 4 to 6, bottom row 7 to 9`}>{exercise.board.map((mark, index) => <button key={index} aria-label={`Square ${index+1}, ${mark || 'empty'}${choice === index ? ', selected' : ''}${showAnswer && exercise.answers.includes(index) ? ', correct answer' : ''}`} aria-pressed={choice === index} disabled={Boolean(mark)} className={`${mark === 'X' ? 'lesson-x' : mark === 'O' ? 'lesson-o' : ''} ${showAnswer && exercise.answers.includes(index) ? 'lesson-answer' : ''} ${choice === index && !solved ? 'lesson-retry' : ''}`} onClick={() => { setChoice(index); setRevealed(false); }}><small aria-hidden="true">{index+1}</small><span aria-hidden="true">{mark || (choice === index ? exercise.player : '')}</span></button>)}</div>
    <p className="guide-exercise-feedback" role="status" aria-live="polite" aria-atomic="true">{feedback}</p>
    <div className="guide-exercise-actions"><button onClick={() => { setChoice(null); setRevealed(false); }}>Reset this board</button><button onClick={() => { setChoice(null); setRevealed(true); }}>Reveal explanation</button></div>
  </section>;
}
export default function GuideExercises({ slug }: { slug: string }) {
  const exercises = exercisesForGuide(slug);
  if (!exercises.length) return null;
  return <section className="guide-exercises" aria-labelledby="guide-exercises-title"><h2 id="guide-exercises-title">Try the positions</h2><p>Read the marks, explain your choice and select an empty square. These are single-move exercises, not a continuing game. Every listed answer is checked against the standard-board solver. Keyboard users can Tab between available squares and press Enter or Space.</p>{exercises.map(exercise => <Exercise key={`${slug}-${exercise.id}`} exercise={exercise} />)}</section>;
}
