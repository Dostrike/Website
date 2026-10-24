// Materially revised guides. Dates describe these edits, not the original publication.
export const reviewedGuides: Record<string, { title: string; excerpt: string; content: string }> = {
  'minimax-algorithm-tic-tac-toe': {
    title: 'How DoStrike’s Tic-Tac-Toe AI chooses a move',
    excerpt: 'Follow an actual board position through wins, blocks and minimax. Learn what Easy, Medium and Hard do in DoStrike, and why perfect play can still end in a draw.',
    content: `
DoStrike’s three Tic-Tac-Toe difficulty settings use different decision rules. Understanding those rules makes practice more useful: a win against Easy does not test the same skill as a draw against Hard. This guide describes the implementation in our browser game, rather than treating every computer opponent as an identical black box.

## Start with a position you can check

Read each group of three squares as a row: X X empty / O O empty / empty empty empty. It is X’s turn. The top-right square completes X’s row and wins immediately. Blocking O on the middle-right would miss that win. A search algorithm should recognize that the game ends as soon as a winning line is completed; it must not let O move afterwards.

Now consider O O empty / X empty empty / X empty empty. X cannot win this turn. The top-right square is a forced block because every other move lets O complete the top row. The attractive center square is the wrong choice here. These two positions explain why checking your own win comes before blocking, and blocking comes before positional preferences.

## What the three difficulty settings do

- **Easy:** the implementation selects a random empty square 70% of the time. Otherwise it uses a search move. Random choices can accidentally be strong, so Easy does not guarantee that every game is winnable.
- **Medium:** it first looks for an immediate win, then an immediate block. If neither exists, it prefers the center, then an available corner, then another empty square. It does not search every future reply at each turn, so it can miss forks.
- **Hard:** it evaluates candidate moves using minimax with alpha–beta pruning. It searches future replies until a win, loss or draw, rather than assigning a fixed preference to the center.

## Follow minimax one reply at a time

For each empty square, the search temporarily places the computer’s mark there. If this finishes the game, the position receives a terminal score. Otherwise the search tries the opponent’s replies. On the opponent’s turn it keeps the lowest score for the computer, because the opponent is assumed to choose a strong reply. On the computer’s next turn it keeps the highest score. The process continues until it reaches a finished board.

DoStrike’s scoring uses 10 minus depth for a computer win, depth minus 10 for a loss, and zero for a draw. The depth adjustment prefers a quicker win when multiple winning continuations exist. These numbers are search scores, not percentages or predictions about a particular human player.

Suppose a candidate move has two opponent replies: one eventually gives the computer a win and the other forces a draw. That candidate is valued as a draw. The computer cannot assume the opponent will choose the losing reply. This is the key distinction between planning a trap and finding a forced win.

## Why pruning does not mean guessing

Alpha–beta pruning stops exploring a branch once the search has enough information to know that it cannot improve the current decision. It preserves the minimax outcome; it does not mean randomly skipping awkward positions. Tic-Tac-Toe’s small board makes a full search practical, while larger games often need additional limits and evaluation methods.

## A draw can be the right result

From the empty standard 3×3 board, correct play by both players leads to a draw. Hard cannot force a win against every legal sequence of good replies. If you repeatedly draw after blocking threats and preventing forks, that is successful defense. A single draw against Easy or Medium does not prove perfect play, because a weaker opponent may have missed opportunities too.

## Turn the explanation into practice

Use the Strategy Practice page to try the two positions above and a third position that combines defense with a fork. Before each click, say which line you are completing or blocking. Then start a full game on Medium and look for threats that its center-and-corner preferences overlook. Move to Hard when you want to test whether your defense survives a search opponent.

You can inspect the public implementation in the DoStrike Website repository, in src/utils/gameLogic.ts. The descriptions here refer to that implementation; they are not claims about every Tic-Tac-Toe app.
`,
  },
  'future-tic-tac-toe-ai-vr-innovation': {
    title: 'What a useful Tic-Tac-Toe learning tool should explain',
    excerpt: 'A practical design guide: show the threatened line, explain forks, distinguish random opponents from search, and measure mistakes instead of promising learning outcomes.',
    content: `
A Tic-Tac-Toe learning tool is useful when a player can explain a decision after using it. Adding a futuristic setting does not automatically teach strategy. For a nine-square game, the most valuable feedback can be small: identify the line a player overlooked and let them try again.

## Explain the decision, not just the result

Consider X X empty / O O empty / empty empty empty, with X to play. A message saying “good move” after choosing top-right gives little guidance. A better explanation says that X completes the top row immediately, and therefore does not need to block O’s middle row. That tells the reader what to check on a different board.

For an incorrect choice, feedback should identify the missed threat without pretending that the player lacks ability. “O can finish the top row next turn” is actionable. A score or an animation alone does not explain how to improve the next decision.

## Use positions with a clear teaching purpose

Our Strategy Practice page presents three positions in sequence: take a win, stop an immediate loss, then block and create a fork at the same time. The last position is X empty O / empty O empty / empty empty X. X plays bottom-left, blocking O’s diagonal while threatening both the left column and bottom row. O cannot defend both squares in one move.

The point of the sequence is to make a player name the threatened lines. It is a practice exercise, not evidence of a measured improvement in memory, intelligence or school performance.

## Be precise about computer opponents

An opponent that sometimes picks a random move behaves differently from one that searches all replies. Difficulty labels should explain that difference. DoStrike’s Easy setting uses random choices most of the time. Medium checks immediate wins and blocks, then prefers center and corners. Hard searches with minimax. We do not describe these settings as a system that detects emotions or automatically diagnoses a player’s ability.

A future adaptive mode could choose exercises based on missed threats, but it would need a clear explanation of what is measured and where those records are saved. This is a possible design, not a feature currently offered by DoStrike.

## Keep feedback usable on a phone

Each square needs a readable label and a large target. Feedback should remain visible long enough to read, and a visitor should be able to reveal an explanation without a timer. A keyboard user needs to reach empty squares and choose them without a mouse. Motion and visual effects should support the lesson rather than cover the board.

## Measure a narrow, observable skill

For a personal practice session, count missed immediate wins or missed blocks across several games. Record the position and check the relevant line. This is more useful than treating an isolated win as proof that an exercise worked. Opponent randomness, repeated positions and familiarity can all influence results.

If you want to suggest an exercise for DoStrike, send the nine squares, whose turn it is, the proposed move and the reason through our Contact page. A reproducible position lets us discuss the actual tactic without making unsupported claims about technology or learning outcomes.
`,
  },
};
