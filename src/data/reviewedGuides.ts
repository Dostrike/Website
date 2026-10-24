// Materially revised guides. Dates describe these edits, not the original publication.
export const reviewedGuides: Record<string, { title: string; excerpt: string; content: string }> = {
  'mathematical-proof-tic-tac-toe-draw': {
    title: 'Why perfect Tic-Tac-Toe is a draw: an exhaustive check you can reproduce',
    excerpt: 'Explore all 5,478 reachable boards with a small solver. See why an empty board evaluates to a draw, how legal positions are counted, and what the result does and does not prove.',
    content: `
“Perfect play leads to a draw” is a claim about every possible reply, not a claim about how a few people played. To check it, we can enumerate the standard game and evaluate each position from the end backwards. DoStrike now includes an inspectable solver for its daily strategy puzzles and a verification script that performs this check.

## State the rules before counting

The board has nine squares. X moves first, then X and O alternate. A move fills exactly one empty square. A player wins by completing a row, column or diagonal of three marks. The game stops immediately after a win; no later moves are legal. If all squares fill without a winning line, the game is a draw.

These rules matter. Continuing to place marks after a win produces boards that cannot occur in a real game. Counting every assignment of X, O or empty to nine squares also includes positions with impossible turn counts. Neither method gives the number of reachable game positions.

## Enumerate positions from the empty board

Start with nine empty squares and X to move. For every legal empty square, create the board after X plays, then explore O’s replies. Repeat until the game ends. Store each board in a set so that reaching the same arrangement through a different move order does not count it twice.

Our verification script finds **5,478 distinct reachable boards**, including the empty board. **958 are terminal boards**: a winning line has been completed or the board is full. Rotations and reflections are counted separately here. We are counting board arrangements, not distinct move sequences; two different games can arrive at the same arrangement.

## Evaluate the terminal boards first

From the perspective of the player whose move we are evaluating, a win is positive, a loss is negative and a draw is zero. For an unfinished board, try every legal move. Evaluate the resulting position for the opponent, reverse the sign, and choose the highest result. The sign reversal makes the opponent choose their strongest reply rather than cooperate with a trap.

For example, if one move permits an opponent to force a draw and another permits an opponent to force a win, choose the drawing move. The presence of one tempting opponent mistake does not make a move a forced win. Every opponent reply must be accounted for.

DoStrike’s practice solver also prefers quicker wins and, when all moves lose, a longer defense. This affects which losing or winning move is selected, but the meaning of zero remains a draw. The source function is evaluatePosition in src/utils/practiceEngine.ts.

## What happens at the empty board?

The empty board evaluates to **zero**. Because the solver checks every legal move and reply through the terminal positions, this means X cannot force a win against correct defense, and O cannot force a win against correct play by X. Both players can preserve a draw under the stated rules.

This does not mean every opening reply is safe. A player can still choose a move that changes a drawable position into a forced loss. Nor does it say that every mid-game board is a draw: the daily challenge deliberately includes positions with forced wins and positions that require accurate defense.

## Reproduce the check

In the public DoStrike Website repository, install the project dependencies and run **node scripts/verify-daily.mjs** from the repository folder. The script checks the empty-board result, the 5,478-position count, the 958 terminal positions, legal move counts and the fact that analyzing a board does not mutate it. It also validates the daily puzzle rotations and date boundaries.

The code and the count depend on the rules above. A four-by-four board, a different line length or allowing moves after a win would be a different game requiring a different check. Treat this as a reproducible exhaustive argument for standard 3×3 Tic-Tac-Toe, rather than evidence about larger games.

## Practice the distinction between a threat and a forced win

Open Strategy Practice and compare the immediate-win puzzle with the opposite-corners defense. In the first, one move ends the game. In the second, O must choose an edge to preserve a draw. Before looking at the explanation, ask which reply your opponent would choose if they were trying their hardest to defeat your plan. That is the question the solver answers at every branch.
`,
  },
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
    title: 'Review your Tic-Tac-Toe round: find the move that changed the result',
    excerpt: 'Replay your actual DoStrike round, spot a missed block, and compare a stronger move. See a worked example and understand what perfect-play analysis can tell you.',
    content: `
A Tic-Tac-Toe learning tool is useful when a player can explain a decision after using it. DoStrike now offers a review of each completed computer or local two-player round. Open “Review this round” beneath the result to replay the positions that actually occurred, rather than studying an unrelated example.

## A missed block from an actual playable sequence

Try this sequence against Hard: play X in top-left, let O take the center, then play X in bottom-right. Hard replies at top-middle. The position is X O empty / empty O empty / empty empty X, with X to move.

The urgent square is bottom-middle. O already has top-middle and center, so any move that fails to win immediately or stop that column allows O to finish it. Choosing bottom-left may look like a fork because X would threaten the left column and bottom row, but O wins at bottom-middle before either threat matters.

If you choose bottom-left and lose, the round review starts at X’s fifth move. The dotted square shows bottom-left, the move played. Reveal the explanation to outline bottom-middle, a move that keeps a draw available with correct replies. Count O’s two marks in the middle column before looking at X’s possible attacks.

## How to read the review

Use the previous and next buttons to move through the round. Each diagram shows the position before the selected turn, with the move played marked separately. “Explain this move” reveals one strongest suggestion and why the available result matters. There may be other equally strong squares.

In a computer game, the review initially selects the first human turn that gave up an available win or draw. In local two-player play, it checks both players. If no turn gave up an available result, it says so. A win is not proof that every earlier move was strong: an opponent may have missed a reply.

The solver assumes perfect replies. It distinguishes a forced win, an available draw, and a forced loss; it cannot predict a human’s next choice or a random Easy move. A forced-loss position cannot always be rescued. The review does not blame a later move for a loss that was already unavoidable.

Round positions are held in the current game session. Starting the next round clears that review, and the positions are not uploaded to a review server. If you want to study a position later, write down its nine squares and whose turn it was.

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
