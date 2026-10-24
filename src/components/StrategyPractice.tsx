import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './StrategyPractice.css';

const lessons = [
  {
    title: '1. Take the win before defending',
    board: ['X', 'X', '', 'O', 'O', '', '', '', ''], answer: 2,
    prompt: 'X to move. Both players threaten a row. Which square should X choose?',
    explanation: 'Play the top-right square. X completes the top row immediately, so O never gets another turn. Blocking the middle-right square misses a win. Check for your own winning move before searching for a defensive move.',
    exercise: 'In your next game, pause before every move and scan all eight winning lines. Ask whether you can finish one now.',
  },
  {
    title: '2. Recognize the forced block',
    board: ['O', 'O', '', 'X', '', '', 'X', '', ''], answer: 2,
    prompt: 'X to move. There is no immediate X win. Where must X play to keep the game alive?',
    explanation: 'Play top-right to stop O completing the top row. Taking the center looks attractive, but O would win on the very next move. A strong-looking square cannot compensate for ignoring an immediate threat.',
    exercise: 'After checking your own wins, pretend it is your opponent’s turn. Find every square that would let them win in one move.',
  },
  {
    title: '3. Defend and create a fork',
    board: ['X', '', 'O', '', 'O', '', '', '', 'X'], answer: 6,
    prompt: 'X to move. Find the move that blocks O’s diagonal and creates two winning threats.',
    explanation: 'Play bottom-left. This blocks O’s top-right–center–bottom-left diagonal. X now threatens middle-left (the left column) and bottom-middle (the bottom row). O can block only one, so X wins on the following turn. This is a fork: two separate threats created by one move.',
    exercise: 'Name both winning squares after creating a fork. If you can name only one, you have made a single threat, not a fork.',
  },
];

export default function StrategyPractice() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const lesson = lessons[lessonIndex];
  const solved = choice === lesson.answer;
  const showExplanation = solved || revealed;
  return <main className="practice-page">
    <Helmet>
      <title>Tic-Tac-Toe Strategy Practice: Wins, Blocks & Forks | DoStrike</title>
      <meta name="description" content="Solve three playable Tic-Tac-Toe positions. Choose a move, get feedback, and learn why immediate wins, forced blocks and forks matter." />
      <link rel="canonical" href="https://dostrike.com/practice" />
    </Helmet>
    <nav aria-label="Practice navigation"><Link to="/">Home</Link> · <Link to="/blog">Strategy guides</Link> · <Link to="/how-to-play">Game rules</Link></nav>
    <h1>Find the next move</h1>
    <p>Practice the decisions that change a Tic-Tac-Toe game. These three positions use standard rules: X starts, players alternate, and three marks in a row win. You play X in every puzzle. There is no timer; explain your move to yourself before choosing.</p>
    <div className="practice-tabs" role="group" aria-label="Choose a lesson">
      {lessons.map((item, index) => <button key={item.title} aria-pressed={index === lessonIndex} onClick={() => { setLessonIndex(index); setChoice(null); setRevealed(false); }}>{item.title}</button>)}
    </div>
    <section aria-labelledby="lesson-title">
      <h2 id="lesson-title">{lesson.title}</h2><p>{lesson.prompt}</p>
      <div className="practice-board" role="group" aria-label="Tic-Tac-Toe puzzle board, rows read from top to bottom">
        {lesson.board.map((mark, index) => <button key={index} disabled={Boolean(mark) || showExplanation} aria-label={`Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: ${mark || 'empty'}`} className={showExplanation && index === lesson.answer ? 'practice-answer' : ''} onClick={() => setChoice(index)}>{mark || (showExplanation && index === lesson.answer ? 'X' : '')}</button>)}
      </div>
      <div aria-live="polite" className="practice-feedback">
        {choice !== null && !showExplanation && <p>Look again. {lessonIndex === 0 ? 'Can X finish a row immediately?' : 'Which line could O finish on the next turn?'} Try another empty square.</p>}
        {showExplanation && <><h3>{solved ? 'Correct — here is why' : 'The move explained'}</h3><p>{lesson.explanation}</p><p><strong>Try this in a game:</strong> {lesson.exercise}</p></>}
      </div>
      {!showExplanation && <button className="practice-reveal" onClick={() => setRevealed(true)}>Show the move and explanation</button>}
    </section>
    <section><h2>A repeatable move checklist</h2>
      <ol><li>Can I win immediately? Take that move.</li><li>Can my opponent win immediately? Block it if I cannot win first.</li><li>Can I create two winning threats at once? Check that I am not allowing an immediate loss.</li><li>If there is no forced move, look for ways to prevent an opponent’s fork before choosing a useful center or corner.</li></ol>
      <p>This is a learning checklist, not a complete solver. Some positions require looking further ahead, and perfect play from both sides on an empty standard board leads to a draw. Winning these puzzles teaches specific patterns; it does not mean every position is winnable.</p>
      <p><Link to="/tictactoe-setup">Put the checklist into practice in Tic-Tac-Toe</Link>, or <Link to="/blog/minimax-algorithm-tic-tac-toe">read how minimax evaluates future replies</Link>.</p>
    </section>
    <footer><Link to="/about">About DoStrike</Link> · <Link to="/contact">Suggest a correction</Link> · <Link to="/privacy">Privacy</Link> · <Link to="/editorial">Editorial standards</Link></footer>
  </main>;
}
