import { reviewedGuides } from './reviewedGuides';

export interface Article {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
  updated?: string;
}

export const articles: Article[] = [
  {
    title: 'Chess: checks, promotion choices and the draws we actually play',
    excerpt: 'Work through a mating attack, a pinned en-passant capture and a promotion where a rook keeps the game alive. Learn the exact casual draw rules used on this website.',
    slug: 'chess-checks-promotion-and-draws',
    date: '2026-11-05', readTime: '5 min read', category: 'Chess',
    content: `
## Read the square before the move

White moves first from the standard arrangement. Files run a to h and ranks 1 to 8. A square keeps its name when you flip the board: e2 is still e2 with Black at the bottom. Select a piece to mark its legal destinations, select a destination to preview, then confirm. Arrows move visually around the displayed board; Enter or Space selects, and Escape cancels the selection.

Pawns move forward into empty squares, with a two-square option from their starting rank when both squares are clear, and capture one square diagonally forward. Knights jump in an L. Bishops follow diagonals, rooks follow ranks or files, and queens combine those sliding directions. Sliding pieces cannot pass through another piece. Kings move one square, subject to safety. You never capture the opposing king: a legal move must leave your own king safe.

The preview describes the resulting move, check or outcome without changing the saved position. Promotion needs an explicit Queen, Rook, Bishop or Knight choice; selecting the destination alone never silently chooses a queen. On narrow screens the board scrolls inside its frame so the square controls remain large.

## Check is a question; mate has no answer

From the normal start, play e4, e5, Bc4, Nc6, Qh5, Nf6, Qxf7#. In this cooperative example, the final queen capture on f7 checks the king on e8. White’s bishop on c4 protects that queen along c4–d5–e6–f7. Black cannot capture it with the king, block the adjacent queen’s attack or move to a safe square. The legal-move list is empty while the king is attacked, so this is checkmate and White wins.

The sequence demonstrates a pattern, not a forced opening win: Black could choose different replies before the final move. A checking move on its own is not necessarily mate. The interface reports Check while legal answers remain, and a checkmated king stays on the board.

Stalemate also has no legal move, but the king is not attacked. It is a draw here. The distinction is easy to miss when a player has very few pieces, so the next example deliberately makes it visible.

## A promotion where the queen ends the game in a draw

Set up this paper position: White king c6 and pawn c7, Black king a7, with White to move and no other pieces. You cannot import this position into the website; it is a separate worked example checked by the same rules adapter and a dedicated test.

Promote the pawn on c8 to a queen. Black’s king on a7 is not in check. Its possible neighbouring squares are a6, b6, b7, a8 and b8. The queen controls a6 on a diagonal and a8 and b8 along rank 8. White’s king controls b6 and b7. With no legal reply and no check, Black is stalemated.

Choose a rook on c8 instead. The rook still controls a8 and b8, but does not attack a6 diagonally. Black can play Ka6, so the game continues. The reflected Black-pawn example is tested too. A larger piece is not always the right promotion when your goal is to keep playing for a win.

Queen, rook, bishop and knight all remain selectable when legally promoting in a normal game. Cancelling the preview leaves the pawn untouched. Underpromotion does not promise a win: the actual position and subsequent replies still decide the result.

## Castling needs a safe route

White’s kingside castle moves the king e1 to g1 and rook h1 to f1 in one move. Both pieces must retain their castling rights, the intervening squares must be clear, and the king cannot start in check, cross attacked f1 or finish on attacked g1. Moving the king or that rook away and back does not restore the right.

Queenside castling moves the king e1 to c1 and rook a1 to d1. The spaces between them must be empty, including b1. The king’s safety test concerns e1, d1 and c1; an attack on b1 alone does not prohibit castling. Black has the corresponding rank-8 moves. Rook capture and replayed history are included in the rights checks.

## En passant can be geometrically possible and still illegal

Consider Black king a8, Black rook e8 and Black pawn d5, with White king e1 and White pawn e5. Assume Black has just advanced d7 to d5 in one move. The en-passant destination is d6, available only on the immediate reply.

White’s pawn is on the right rank and next to d5, but e5xd6 en passant is illegal in this position. It would remove White’s pawn from the e-file and remove the pawn on d5, leaving the rook on e8 with an open line to the White king on e1. A special capture cannot override king safety. This pinned-pawn rejection is one of the adapter’s regression fixtures.

## Know the website’s draw policy

DoStrike uses untimed casual play. It automatically ends a game at stalemate, recognized insufficient-material cases, a third occurrence of a repetition position, or fifty moves by each side without a pawn move or capture. Checkmate takes precedence when the final move also reaches a clock boundary. A material helper does not recognize every theoretically dead position; we do not claim complete dead-position adjudication.

For a simple repetition, play Nf3, Nf6, Ng1, Ng8 twice from the starting position. The initial arrangement has then occurred three times with the same player to move and relevant rights intact. The website declares a draw immediately. The save retains the full move transcript because a final board diagram or FEN alone would lose this history.

These early automatic repetition and fifty-move draws differ from FIDE’s tournament claim procedure. There is no claim button, clock, arbiter, rating or online Chess matchmaking in this release. Local play shares the device; computer play offers either colour.

## Search, assistance and saved openings

Easy chooses a seeded legal move. Medium and Hard use original bounded search and evaluation, retaining completed search iterations and a legal fallback when the budget ends. Hard is not perfect, Elo rated or a substitute for a dedicated analysis engine. Hints use the bounded Hard search, so a suggested move is an idea to inspect rather than proof of optimal play.

A delivered usable hint or Undo marks the round assisted. Cancelling search before a suggestion arrives does not. Computer Undo returns to before your most recent move and removes the computer answer too; it cannot remove an initial White computer move before you have acted as Black. Completed results close Undo. Restart creates a new attempt, and recent completion IDs prevent reloads from counting that same result twice.

The daily supplies six reproducible quiet legal opening plies, then a full game as White against Hard. Those six plies cannot be undone. It is not a unique-solution puzzle or a promised balanced opening. Only winning on its original local date advances the browser streak; assisted wins are included and labelled. Reload restores the transcript, and restarting an older daily preserves its date.

Records distinguish local White/Black outcomes and computer level and human colour, including assisted wins. Saves and records belong to this browser. When storage is blocked, play can continue but persistence is reported as unavailable. Legal move generation comes from chess.js 1.4.0 under BSD-2-Clause; DoStrike supplies the adapter, opponent, sessions, interface and these worked examples.
`
  },
  {
    title: 'Sea Battle: hidden fleets, hits and honest search',
    excerpt: 'Use a checked coordinate example to distinguish a hit from a sunk ship, avoid treating touching ships as one, and understand what the computer’s search scores actually mean.',
    slug: 'sea-battle-hidden-fleets-and-search',
    date: '2026-11-05', readTime: '4 min read', category: 'Sea Battle',
    content: `
## Arrange a fleet you can read

DoStrike’s ocean has rows A to J and columns 1 to 10. The five ships have lengths 5, 4, 3, 3 and 2. Each occupies a straight horizontal or vertical segment. Touching is allowed; overlapping and crossing the boundary are not. There is no diagonal placement.

The placement checklist names each ship and shows its length. Select one, select a starting coordinate, then confirm the preview. Rotate changes the direction. Selecting an already placed ship lets you reposition it; the old position is replaced only when the new placement is legal and confirmed. Auto-place fills the fleet but leaves it editable before battle.

For example, a length-five Flagship starting at E5 horizontally occupies E5, E6, E7, E8 and E9. Starting it at E7 horizontally would run past column 10 and is rejected. Rotate at E7 instead and it occupies E7, F7, G7, H7 and I7, provided those cells do not overlap another ship.

## A hit passes the turn

A fires first. Each player fires one shot at an unused coordinate, then hands over, even after a hit. There is no Salvo or bonus turn. A ship sinks when all its occupied cells have been hit. Sinking the final opposing ship ends the battle immediately, without an answering shot.

Take a Flagship on A1 to A5. A shot at A1 reports hit; it does not disclose the other four cells. The other player fires next. Later hits at A2, A3 and A4 still leave that ship afloat. Only the hit at A5 sinks it, revealing its identity and complete occupied segment.

This web version reports only hit or miss before sinking. Some physical editions announce the ship’s identity on every hit. The distinction matters: a hit on its own does not tell you which remaining length you found. The rules here also permit adjacent ships and do not automatically mark water around a sunk one.

## Adjacent hits can belong to different ships

Place a Flagship horizontally on A1 to A5 and a Cruiser horizontally on B1 to B4. The ships touch along their sides, which is legal here. Hits at A1 and B1 are adjacent but belong to different ships.

You cannot conclude that a vertical ship continues from A1 through B1. A useful hypothesis is still a hypothesis. Once the Flagship sinks, A1 to A5 become known sunk cells, while the hit at B1 remains unresolved until its own ship sinks. The computer keeps that distinction rather than merging every touching hit into a single supposed ship.

## A worked search position: E5, D5 and E4

Consider an otherwise untried attack map with E5 hit and D5 and E4 marked as misses. No ship has sunk yet. One legal hidden arrangement puts the Flagship horizontally from E5 to E9; the example does not assume that you know this arrangement during play.

DoStrike’s Hard heuristic examines each still-afloat ship separately. It rejects straight candidate placements that cross a known miss or sunk cell. If a placement contains an unresolved hit, it contributes to a target score for its untried cells; placements covering more hits receive greater weight. Other ships may touch, so this is not a proof that every nearby hit belongs to that placement.

In this position, the misses block continuation upward from E5 and leftward from E5. The independent evaluator and actual computer agree that E6 and F5 have the two maximal target scores. Either can be suggested, with seeded tie-breaking. Firing at F5 could still miss in the legal horizontal-Flagship arrangement above. A maximal score is not a guarantee of a hit.

These are counts of individually compatible placements, not a calibrated probability over all legal complete fleets. The heuristic does not enumerate every joint arrangement or claim perfect play. The worked result is checked against a separate row-and-column evaluator, alongside complete games and layouts with touching ships.

## Know what the computer is allowed to see

Easy selects a seeded unused coordinate. Medium tries untried orthogonal neighbours of unresolved hits, then hunts a checkerboard before falling back to other cells. Hard uses the placement-count heuristic described above. Its work is bounded by the fixed board and fleet, rather than an unbounded search.

Computer and hint requests contain observed marks and fully sunk ships only. They do not contain unhit positions, an unsunk ship’s identity or the fleet-generation seed. Tests construct different hidden fleets with identical observed transcripts, including hits and sinks, and require identical decisions for the same level and decision seed.

A returned hint previews a target and marks the battle assisted. It does not reveal whether that shot will hit. Cancelling before a usable suggestion arrives changes neither shots nor assistance. Undo also marks assistance. Against the computer it returns to your previous decision by removing your shot and any answer; it cannot undo the initial computer shot before you have acted. Completed results close Undo.

## Save, replay and pass the device

Saved battles rebuild their state from validated fleets and the legal ordered shot transcript. Restart keeps those fleets and the original daily date but creates a new attempt. Records distinguish local A/B results from computer wins, separate levels and your side, and show assisted and unassisted wins. The most recent 128 completed attempt IDs are remembered to prevent reload duplicates.

Local play uses deliberate handoff screens between placements and shots. The outgoing board is removed before the next player presses Ready. This supports casual shared-device play; both fleets still exist in browser memory and saved storage, so it is not an anti-cheat or secure multiplayer system. Completed battles offer an explicit fleet-review option.

On a phone the two boards scroll inside their frames, keeping cell targets large. Arrow keys explore a board, Home and End move within a row, and Enter or Space selects and confirms. Escape cancels a preview without firing. Miss, hit and sunk symbols supplement colour.

## What the daily repeats

The daily fixes the opponent fleet from your local date and uses Hard with you as A. You choose your own placement, so it is a reproducible challenge rather than a unique-answer puzzle or equal-condition leaderboard. Only a win on that challenge’s original date advances the browser streak; assisted wins are included and labelled. Restarting an old daily does not move it to today.

Progress and records depend on this browser’s storage. Clearing it removes the local history; blocked or unavailable storage is reported while play remains possible. No account, cross-device record or guaranteed winning strategy is implied.
`
  },
  {
    title: 'Dots and Boxes: extra turns, double captures and control',
    excerpt: 'Worked positions explain why a capture keeps the turn, how one edge can claim two boxes, and when declining an immediate box improves the final score.',
    slug: 'dots-and-boxes-extra-turns-and-control',
    date: '2026-11-05', readTime: '4 min read', category: 'Dots and Boxes',
    content: `
## Count boxes, not dots

DoStrike’s size selector counts boxes per side. A 2 by 2-box board has 3 by 3 dots and 12 possible unit edges. The other choices are 3 by 3 boxes with 24 edges, and 4 by 4 boxes with 40. Every line joins adjacent dots horizontally or vertically; diagonals, jumps and drawing over an existing edge are unavailable.

Player A starts. The player who draws the fourth side of a box claims it and moves again. A non-capturing edge passes the turn. When all boxes are claimed, the larger count wins; equal totals draw. You can choose either side against the computer or share the device locally.

## One box: the fourth edge decides ownership

Consider the top-left box on a 2 by 2-box board. Its corners are the dots at rows 1 and 2, columns 1 and 2. If its top, left and right edges are drawn but the bottom is open, drawing that bottom edge claims it.

The earlier edge colours do not determine ownership of the box. A can claim it by finishing its fourth edge even if B drew the first three. A then has the next action. If A next draws an edge that completes no box, the turn passes to B.

## Two boxes: one shared edge

Take the two neighbouring boxes in the top row. Draw their top and bottom edges and the two outside vertical edges, leaving only the central shared vertical edge missing. Both boxes now have three sides.

The shared edge runs from row 1 column 2 to row 2 column 2. Drawing it claims both boxes for the mover and adds two points. The mover takes another action, but does not bank two future turns. A subsequent non-capture still hands over immediately.

The preview shows how many boxes an edge would claim before you commit. Use it to check the shared-edge example rather than assuming every capture is worth one.

## A legal capture can give away control

Here is a reproducible 3 by 3-box ending, checked with an independent exhaustive solver. Number the dots from row 1 to 4 and column 1 to 4. All unit edges are drawn except these six:

- The top horizontal edge from row 1 column 1 to row 1 column 2.
- The vertical edge from row 1 column 2 to row 2 column 2.
- Each of the four vertical edges connecting row 3 to row 4, at columns 1, 2, 3 and 4.

Four boxes have already been claimed: A has three and B one. It is A’s turn. The two unclaimed boxes at the top form one region; the three bottom-row boxes form another.

A can take an immediate box by drawing the missing upper shared vertical edge. With best replies thereafter, the resulting final score is A 5, B 4.

Alternatively A can draw the missing top horizontal edge. That captures nothing and passes the turn. With best continuation, A can finish 6 to 3 instead. The move offers the remaining top pair while preserving access to the bottom region later.

DoStrike’s Medium capture heuristic takes the immediate vertical capture in this fixture. Hard completes an exact six-edge ending search and chooses the horizontal handover. The comparison establishes this position’s score difference, not a rule that every sacrifice is good or that every chain should be handled the same way.

## What the three computer levels actually do

Easy chooses a seeded legal edge. Medium prefers an immediate capture, then fewer unclaimed three-sided boxes. Hard searches with the actual player to move at each node, so a capture does not incorrectly switch the simulated side.

Hard has finite time and node budgets. Small endings use memoized future-score search; a position is labelled solved only when the requested remaining search actually finishes. If the budget expires, the game uses a legal bounded choice or fallback and does not call it perfect. The hint explanation distinguishes a finished ending from a limited lookahead.

Hints are suggestions, not enforced moves. Requesting one that returns a usable edge marks the round assisted. It previews the edge so you can inspect the proposed capture and then confirm or cancel. Undo also marks assistance, and that flag survives reload.

## Keep a readable history

Every drawn edge is listed with its endpoints and mover. In local play Undo removes one edge. Against the computer it returns to the previous human decision, removing the computer’s intervening extra-turn sequence as well as your latest placement. It cannot undo an opening computer move before you have acted.

Saved rounds replay their legal history. Restart begins a new attempt from the same opening. Completed results are counted once, and Undo closes after completion. Local A/B results stay separate from wins against the computer; board size, level and your side also have separate browser records. No leaderboard or cross-device account is implied.

## Daily openings and phone controls

The daily uses your local date to generate eight legal non-capturing edges on a 3 by 3-box board. No boxes are claimed and A moves next. You play A against Hard to finish a full game. It is not a single-answer puzzle, and only a win on its original date advances the local streak.

Tab and arrows explore edge controls. Enter or Space previews an available edge; activating that same edge again confirms it. Escape cancels without drawing. The separate Confirm edge button is also available. Edge labels state their exact endpoints and owner, and box letters make ownership readable without colour alone.

Larger boards scroll within their frame on a phone. Their targets remain large rather than shrinking every line to fit. Cancel search stops a running computer or hint request; retry or undo can continue from the actual saved position. Records and progress depend on browser storage being available and can disappear when it is cleared.
`
  },
  {
    title: 'Colour Sort: top runs, empty space and recovery',
    excerpt: 'Worked pour fragments explain maximal runs, capacity limits and why a legal move is not a solution guarantee. Learn what DoStrike’s verified path hints can actually tell you.',
    slug: 'colour-sort-runs-space-and-recovery',
    date: '2026-11-04', readTime: '4 min read', category: 'Colour Sort',
    content: `
## Read from the bottom to the top

Each tube holds four units. A number identifies a colour even when two shades are hard to distinguish: 1 is Coral, 2 Blue, 3 Gold, 4 Violet, 5 Green, 6 Rose and 7 Teal. The visual board puts the top unit at the top of the vessel; the accessible tube label lists its contents from bottom to top.

You can pour only the contiguous top run of one colour. The destination must be empty or have the same top colour, with space remaining. A move transfers as much of that run as fits. The game does not let you choose an arbitrary smaller amount.

The following fragments describe two tubes, not a complete generated puzzle. Brackets list units bottom to top; an empty pair of brackets means an empty tube.

## Example 1: move the whole available run

Let tube A contain [1, 2, 2] and tube B be empty. A pour from A to B transfers both top 2 units. The result is A [1] and B [2, 2]. It is one pour, not two moves, because the identical top units form one run.

The 1 underneath remains in A. You cannot skip the 2 units to pour that buried 1 first. Before selecting a destination, predict both the transfer amount and which colour becomes exposed in the source.

## Example 2: capacity limits a run

Now A is [1, 2, 2, 2] and B is [2, 2, 2]. B has one free slot, so the legal pour transfers one 2. A becomes [1, 2, 2] and B becomes [2, 2, 2, 2]. The destination is complete, but the 1 in A remains covered.

This is a permitted partial pour because capacity imposes it. Pouring from that same source into an empty tube would move all three top 2 units instead. Both cases are checked against a separate unit-at-a-time reference in the engine tests.

## Example 3: a matching colour lower down is insufficient

With A [1, 2] and B [1], A cannot pour into B. Their top colours are 2 and 1. The fact that A also contains a buried 1 does not make the move legal. A full destination rejects a pour even if its top matches.

Choose a source and destination to see the actual preview. Confirm commits the pour. Choosing the source again or using Cancel selection clears it. With the keyboard, Tab or arrows move between tubes, Enter selects, Escape cancels, and Enter on a previewed destination confirms. The separate Confirm pour button is also available.

## Empty space is a resource

Every initial board has two empty tubes and four units of every included colour. Moving a uniform tube into an empty one can be legal while changing little about the arrangement. Collecting one colour may also expose a useful new top, or occupy space you later need for another colour.

Inspect the newly exposed tops before committing. A legal local action is not proof that the resulting puzzle remains solvable. If no legal pours remain, undo or restart. Undo restores the previous board and marks the attempt assisted; it does not shuffle the contents.

The win condition requires every nonempty tube to be full and single-colour. A collection of short single-colour tubes is not yet sorted. Conservation of the four units per colour leaves two empty tubes at completion.

## What the verified path proves

DoStrike generates its own seeded starting boards from sorted tubes using reversible segment exchanges. Each individual reverse step is accepted only when a legal forward maximal pour returns exactly to its predecessor. It then replays the complete forward witness before exposing the puzzle.

All initial full tubes must be mixed, and two tubes remain empty. Generation uses a finite attempt budget and a cancellable worker. It can report that a verified puzzle was not found rather than silently presenting an unchecked board. The 3, 5 and 7 colour settings describe size, not a human difficulty rating.

The stored witness establishes that at least one solution exists. It does not establish the fewest pours or a solution for every position you might reach. Show path hint checks whether your current exact board lies on that known path. If so, it previews a verified next move and marks assistance. If not, it honestly reports no hint. Undo or restart can return to the path; the hint does not run a general solver for an arbitrary deviation.

## Resume, restart and compare records honestly

Saved rounds regenerate their puzzle from its seed and replay the legal move history. They do not trust an arbitrary saved board. Hint assistance and undo remain marked after reload. Restart restores the same starting tubes as a new attempt; New puzzle requests another seed.

The five-colour daily uses your local date. Only a solve on that board’s date advances its browser streak, at most once per date. Restarting an older saved daily preserves its original puzzle and date, so it cannot advance today’s streak.

Solves are counted once at completion, separately by size and assistance. Undo closes after completion; restart begins another attempt. The best unassisted pour count compares different generated puzzles of that size. It is a personal browser record, not an optimal-solution certificate or leaderboard. Storage can be cleared or unavailable, and there is no cross-device account.
`
  },
  {
    title: 'Slide Merge: pairs, space and an honest undo',
    excerpt: 'Compare worked rows before the random spawn, learn why a newly merged tile cannot merge twice, and use undo without rerolling the next tile.',
    slug: 'slide-merge-pairs-space-and-undo',
    date: '2026-11-04', readTime: '4 min read', category: 'Slide Merge',
    content: `
## Read the row before you slide

Slide Merge moves every tile toward the chosen edge of a 4 by 4 board. Equal neighbours combine in pairs. The merged value adds to your score, and that new tile cannot merge again during the same move. A changed board then receives one new tile: 2 has 90% weighting and 4 has 10%.

These examples describe the slide before that new tile appears. Zero means an empty cell. Keeping those stages separate makes your prediction checkable instead of blaming a random spawn for a mistaken merge.

## Example 1: four equal tiles

Take the row 2, 2, 2, 2. Sliding left produces 4, 4, 0, 0 and adds 8 points. The two new 4 tiles stay separate during this move. They can combine on a later move if they remain adjacent along its direction.

Sliding right instead produces 0, 0, 4, 4, also scoring 8. Predict the occupied cells as well as the total score. Two moves can have the same immediate reward while leaving different space for the rest of your board.

## Example 2: resist the extra merge

Now start with 2, 2, 4, 0. A left slide gives 4, 4, 0, 0 and adds 4 points. It does not give 8, 0, 0, 0: the newly created 4 has already participated in a merge this turn.

For 2, 2, 4, 4, the same slide gives 4, 8, 0, 0 and adds 12. Two original pairs merge independently. These row results are executable fixtures in the engine verification script, including vertical and reversed-direction checks.

Try writing the expected row and score before moving. Then compare with the game’s merge notice. The new spawn is announced separately with its row, column and value.

## Space is useful, but a corner is not a guarantee

An empty cell allows tiles to compress and gives the next spawn somewhere to go. A row of alternating unequal values may occupy the same space while offering no immediate pair. Before choosing a high-scoring move, inspect what can move on the following turn.

Keeping larger tiles near one edge or corner can help you organise a sequence. Treat that as a planning heuristic, not a rule that guarantees 2048. A forced move or new tile can disrupt it. Compare two candidate directions: which leaves compatible values near each other, and which blocks a small tile behind a larger one?

A full board is not automatically finished. If two orthogonal neighbours match, a merge is available. A full board with no equal horizontal or vertical neighbours has no legal slide. Diagonal matches alone cannot save it.

## Undo restores the experiment

DoStrike saves the seeded random stream along with the board and score. Undo restores the previous state. Repeating that same move gives the same spawn; it is not a way to keep rerolling until a preferred tile appears. Choosing a different direction changes the available empty cells, so the same stream need not put a tile in the same coordinate.

Undo marks the whole round assisted. That label survives reload and also applies to an earlier 2048 milestone. Your best score and largest tile reached during the round remain in your browser records even if you later undo them. The current board score can therefore be lower than your recorded best.

## A milestone and a daily stream

Reaching 2048 pauses play. Choose Continue beyond 2048 to keep going or use Undo. Continuing does not start another round or count a second target. A round counts after its first valid slide; pressing a direction that changes nothing consumes neither a spawn nor a move.

The daily uses your local calendar date to share an initial board and random stream. It is an open-ended game, not a uniquely solvable puzzle or a promise that every strategy wins. Only a target reached on its board’s date advances the local daily streak. Assistance is counted separately; there is no competitive ranking or cross-device account.

## Controls and a useful replay

Focus the board and use arrows or WASD. Direction buttons and swipes offer the same four actions. Your saved round, including a finished board, can be resumed; Undo remains available when moves run out. Start another board when you want a separate attempt.

After a loss, look for the earlier move that reduced your options. Undo it, predict the next two rows before sliding, and compare an alternative. The useful question is whether your prediction matches the rules and leaves room for another pair. A higher score on one attempt alone does not prove a stronger strategy.
`
  },
  {
    title: 'Minesweeper: safe moves, flags and subset deductions',
    excerpt: 'Worked neighbour-count and subset examples explain safe reveals, why an incorrect flag can make a chord dangerous, and what DoStrike’s no-guess proof actually covers.',
    slug: 'minesweeper-safe-moves-flags-and-subsets',
    date: '2026-11-04', readTime: '4 min read', category: 'Minesweeper',
    content: `
## Count the neighbours, including diagonals

A revealed number tells you how many mines lie in the eight cells touching it, including corners. At an edge there are fewer neighbours. Your goal is to reveal every safe cell; placing all flags is not itself the win condition.

DoStrike waits until your first reveal to place mines. That cell and its neighbours are excluded, so the opening reveals an area with zero neighbouring mines. The date-keyed daily instead uses one disclosed starting cell, row 1 column 1, so everyone gets the same opening for that date.

## Example 1: account for the remaining mines

Consider the top-left cell, row 1 column 1. It has only three neighbours: row 1 column 2, row 2 column 1 and row 2 column 2.

If it reads 3 and all three neighbours remain covered, all three must be mines. This is the all-mine version of a single-number deduction: the number of mines still required equals the number of unknown neighbours.

Now suppose it reads 1, and you have already established that row 2 column 2 is a mine. The other two neighbours must be safe. The required mine is fully accounted for, so zero mines remain in those unknown cells.

The word established matters. A flag is your assertion. Simply placing one beside a 1 does not make the other cells safe if the flag is wrong.

## Example 2: compare overlapping groups

This is a position from an original generated 9 by 9 field, verified by the same proof checker used in the game. The first two columns of rows 1 to 4 have been revealed, and there are no flags.

- Row 1 column 2 reads 1. Its only unknown neighbours are row 1 column 3 and row 2 column 3.
- Row 2 column 2 also reads 1. Its unknown neighbours are those same two cells plus row 3 column 3.

Call the shared pair A. The larger group is A plus the third cell. Both groups must contain exactly one mine, so adding the third cell contributes no additional mine. Row 3 column 3 is safe.

This is a subset deduction. Subtract both the cells and the remaining mine counts of a smaller group from a larger group that contains it. If the difference needs zero mines, its cells are safe. If it needs as many mines as there are cells, all are mines. Do not subtract arbitrary overlapping groups when neither fully contains the other.

## Chording is a shortcut, not a correctness check

Clicking a revealed number in Dig mode, or pressing C on it, attempts to open its unflagged neighbours when the adjacent flag count equals that number. The game checks the count, not whether you put those flags on the real mines.

For a concrete risk, let the top-left 1 have a mine at row 2 column 2. If you incorrectly flag row 1 column 2 instead, the flag count still matches 1. A chord opens the unflagged mine and loses the round. This fixture is tested along with correct-flag chording.

Review the reasoning behind your flags before chording. It saves clicks after a sound deduction; it does not replace one.

## What no-guess certification means

The default generator runs a solver from the chosen safe opening. The decision function receives only revealed numbers and established flags. It uses single-number and subset deductions; the hidden mine map resolves reveals and checks the resulting proof, rather than choosing the solver’s next move.

A board receives the no-guess label only when that process clears every safe cell. Generation runs in a cancellable worker with finite attempts and a time limit. If proof is unavailable, the interface reports a failure and offers another seed or board choice. It does not quietly relabel an unproven random board.

Certification demonstrates that a logical completion exists from this opening using those rules. It does not prevent you making an incorrect deduction, and it does not promise that every position will be easy to recognise. If you switch certification off, random boards can require guessing; the safe opening still applies.

## Assistance and the second chance

Safe reveal deliberately uses the hidden mine map to open an unflagged safe cell. It is labelled assisted. The single second chance after a mine hit restores the whole losing action, including every cell opened by a chord, and also marks the round assisted.

After the first loss, choose that second chance or Finish round. A loss is not counted while that choice is pending. Finishing it, or choosing a new board, records the result once. If you recover and later win, the result is one assisted win. A second recovery is unavailable. Assistance remains marked after saving and reloading.

## Choose a field that fits your screen

Beginner is 9 columns by 9 rows with 10 mines. Intermediate is 16 by 16 with 40. Expert uses 16 columns by 30 rows with 99, keeping the long direction vertical. Custom fields are bounded to usable dimensions and mine density, and generation can still fail to find a proof in budget.

Use Dig or Flag mode on touch screens. Right-click or long-press a cell to flag; F toggles a flag with the keyboard, arrows inspect cells, and C chords. Large fields scroll in both directions. The cell-size selector offers 36, 44 and 56 pixels so you can choose compact or larger targets.

The daily is an Intermediate certified board keyed to your local calendar date. Only wins completed on that board’s date advance the local streak. Records combine board sizes and random/proven modes, with assisted wins counted separately. They stay in this browser, without an account or cross-device sync. No time-based record is collected.
`
  },

  {
    title: 'Sudoku: candidates, singles and useful pencil notes',
    excerpt: 'Two engine-checked examples distinguish a cell with one candidate from a digit with only one place, and explain how notes, hints and answer reveals work on DoStrike.',
    slug: 'sudoku-candidates-singles-and-pencil-notes',
    date: '2026-11-04', readTime: '4 min read', category: 'Sudoku',
    content: `
## Start with the three units

In classic Sudoku, each row, column and 3 by 3 box must contain each digit from 1 to 9 once. A unit is one of those nine-cell groups. Fixed clues stay put; fill the other cells by combining the restrictions from all three units they belong to.

DoStrike generates its own boards and checks that each has exactly one solution. The generator removes a clue only after an exact search proves uniqueness within its work budget. If that proof does not finish in budget, the clue stays. This is separate from a claim about how difficult a human will find the puzzle.

## Example 1: one candidate in a cell

Imagine a completed valid row reading 5, 3, 4, 6, 7, 8, 9, 1, 2, with only its first cell erased. The row already contains every digit except 5, so that cell must be 5. Its column and box must agree as well.

The game calls this a single-candidate deduction: after checking the row, column and box, only one possible digit remains in that cell. Pencil in possibilities first if that helps you see which numbers have been excluded. A small candidate set is a possibility list, not a promise that your previous entries were all correct.

## Example 2: one place for a digit

Here is an original generated position. Zero means empty; rows are shown from top to bottom.

- Row 1: 0 1 6 0 3 9 0 0 2
- Row 2: 0 9 0 2 0 0 5 1 8
- Row 3: 5 0 2 8 0 0 9 0 0
- Row 4: 0 0 0 6 0 2 0 9 0
- Row 5: 0 0 3 0 0 4 0 0 0
- Row 6: 9 0 0 0 1 0 0 8 0
- Row 7: 0 0 0 0 0 0 0 6 0
- Row 8: 0 0 9 0 0 0 1 0 5
- Row 9: 0 6 1 0 2 0 0 0 0

The candidates at row 1, column 4 are 4, 5 and 7. It is not a single-candidate cell. Instead, scan where 5 can go across row 1.

Column 1 already has a 5 in row 3. Column 7 already has a 5 in row 2. The top-right box already has that same row-2 5, which also excludes row 1, column 8. Row 1, column 4 is the only remaining place for 5 in the row, so place 5 there.

That is an only-place deduction, often called a hidden single: focus on one digit in a unit, rather than one cell’s complete list. The game highlights the relevant unit and explains which of the two checks it used. These examples are verified against the implementation, not decorative diagrams.

## Make notes work for you

Select an empty editable cell, turn Notes on and choose a digit to toggle its pencil mark. A filled cell cannot contain notes. Entering a value clears that cell’s marks, and Undo restores both the previous value and its previous notes.

Notes on other cells are manual. When a new value rules out a pencil mark elsewhere, remove it yourself; the interface does not silently tidy every peer cell. Try recording only the possibilities you have actually checked. More marks are not always more useful.

A duplicate creates a visible exclamation mark as well as a colour change, and the cell’s accessible label says conflict. Those marks check immediate row/column/box duplication. An entry can still be wrong without creating an immediate duplicate, so an unmarked cell is not an answer check.

## Hints explain; reveals disclose

Explain a single first checks for conflicting entries, then looks for a supported deduction. If no single-candidate or only-place move is available, it says so instead of inventing an explanation. You may need a different technique.

Check candidates, explained hints and explicit answer reveals mark the solve as assisted. An answer reveal fills the selected editable cell from the known solution and is labelled as a reveal; it is not presented as a logical deduction. Asking for a hint also checks whether current entries disagree with that solution before offering a deduction. Undo does not erase the assisted status.

There is no timer, forced mistake limit, payment or ad gate. The goal is to understand the next step and finish a valid board.

## Understand the labels and the daily

Easy, Medium and Hard target 42, 35 and 29 clues. Sometimes more clues remain to preserve a unique solution. The setup calls these clue-density settings and the game shows the actual count. They are not calibrated ratings of the techniques required; fewer clues alone do not establish a harder human puzzle.

The daily is a website-generated Medium board keyed to the local calendar date. It has one verified solution. Finish it on that date to advance the browser-local streak; an older saved daily remains playable but does not backdate a streak.

Progress and assisted/unassisted solve counts stay on this browser, without a shared account. Clearing browser data removes them. A reload restores the puzzle, values, notes and undo history; only the most recent 300 edit states are retained. No solving-time record is collected.
`
  },

  {
    title: 'Checkers: compulsory captures, complete jumps and kings',
    excerpt: 'Worked English draughts positions explain why a quiet move can be illegal, when you may choose a shorter capture, and why crowning ends a chain.',
    slug: 'checkers-captures-kings-and-complete-jumps',
    date: '2026-11-04', readTime: '4 min read', category: 'Checkers',
    content: `
## Know the variant before choosing a move

DoStrike plays English draughts on an 8 by 8 board. Dark starts. Men move one square diagonally forward and capture forward over an adjacent opponent into the empty square beyond. Kings move or jump in both diagonal directions, one step or one adjacent opponent at a time. They do not fly across several empty squares.

Our coordinates keep A1 at the lower left when Dark is at the bottom. Choosing Light turns the view, while square names stay attached to the board. A star marks a king. The ring around a piece means it has a legal move; when a capture is available, quiet moves disappear for every piece on that side.

## Example 1: the whole side must respect a capture

Use this counting position: Dark men on A3 and E3; Light men on B4, D6 and H8. All other squares are empty. Dark to move.

A3 must jump over B4 to C5. From C5, the same man must jump over D6 to E7. The legal complete route is A3 → C5 → E7, capturing two pieces. A3 → C5 alone is incomplete. E3 → D4 is also illegal, even though its destination is empty: a different piece on the same side can capture.

The interface lets you choose a piece and preview a whole route before confirming. Read the complete move buttons when several paths are possible. Undo removes a whole turn, so it never strands you halfway through a capture.

## Example 2: you need not take the most pieces

Now put a Dark man on C3, with Light men on B4, D4, F6 and H8. Dark has two complete choices: C3 → A5 takes B4; C3 → E5 → G7 takes D4 and F6.

Both routes are legal. English draughts requires completion of the chain you choose, but does not require the route that captures the most pieces. Compare the resulting positions as well as the immediate material. A longer jump can leave a piece exposed; a shorter one can preserve an important square. Neither is always better simply because of its length.

## Example 3: a new king stops for this turn

Put a Dark man on B6 and Light men on C7, E7 and H2. Dark jumps B6 → D8, taking C7. Reaching the far row crowns the man. The turn ends immediately.

Although a king on D8 could jump backward over E7 to F6, it cannot do that as part of its crowning turn. Light moves next. This differs from variants where promotion can extend a chain, so check the rule instead of relying on a household version.

## Winning is about legal moves

You win when the other side has no legal move, either because its pieces are gone or because all remaining pieces are blocked. Piece totals alone do not decide the result. For example, a Light man on H2 cannot move when its only forward destination G1 is occupied by a Dark king; if those are the only pieces and Light is to move, Dark has won.

The records therefore use the actual game result. A winning piece margin is only a descriptive statistic, not the rule used to award the win.

## Draws and the progress counter

This casual browser implementation automatically draws on the third occurrence of the same board with the same side to move. It also draws after 80 consecutive individual turns with no capture and no man moving: 40 moves by each side. Any man move resets that counter, even when it does not promote. A capture also resets it. A position where the next side has no legal move is a loss before the draw check.

The published federation rules describe referee claims for these draws. Automatic adjudication is a practical adaptation for this untimed browser game; tournament clocks, touch-move penalties and arbiter procedures are not simulated.

## Computer play, hints and daily openings

Easy, Medium and Hard use bounded searches up to 2, 4 and 7 complete moves, with material and positional evaluation. Easy sometimes selects a random legal move. The levels are not calibrated ratings and no perfect-play or guaranteed-win claim is made. Hints use the Hard search; computer work runs in a cancellable worker. Restart and navigation cancel pending work.

The daily is a website-generated position after eight legal moves, with Dark to move against Hard. It is a full game with many possible continuations. It does not promise a single puzzle answer or the phone app’s exact opening.

Unfinished rounds and casual records stay in your browser. Completed games include free hints, undo and daily openings. A daily win advances the local streak only when completed on that board’s own date. Clearing browser data removes those records; there is no cross-device account sync.
`
  },

  {
    title: 'Mancala: count extra turns, captures and the final sweep',
    excerpt: 'Three worked Kalah examples explain the last seed, a six-seed capture and why an extra turn does not override the end of the game.',
    slug: 'mancala-extra-turns-captures-and-counting',
    date: '2026-11-03',
    readTime: '4 min read',
    category: 'Mancala',
    content: `
## Know which Mancala you are playing

Mancala names a family of sowing games. DoStrike uses Kalah: six pits per side, one store per player, counter-clockwise sowing and extra turns when the last seed lands in your own store. You can start with 3, 4, 5 or 6 seeds in each pit. We use no empty capture: a capture requires seeds in the opposite pit. There is no relay sowing or opening swap.

Your pits are numbered 1 to 6 in sowing order, ending at your store. On a wide screen your store is at the right of your row. On a phone your pits run down the left to your bottom store, then the route continues up the other side. The opponent’s store is always skipped.

The numeric counts are exact. Drawn pebbles are an illustration, with a limited number shown so a full pit remains readable. Use the count rather than trying to count the artwork.

## Example 1: count the last seed, not just the starting pit

In a normal four-seed opening, your pit 3 has four seeds. Sowing it puts one in pit 4, one in pit 5, one in pit 6 and one in your store. The final seed is in your store, so you play again.

The important calculation is the number of drops to your store. With a different starting seed count, the same pit can finish elsewhere. For example, pit 3 with three seeds ends at pit 6, not the store. Do not memorise “always pit 3” independently of the count.

Preview a pit in DoStrike before confirming. The interface identifies the last landing place and tells you whether that sow would give another turn. An extra turn is useful, but it does not prove that a particular opening is the best against all replies.

## Example 2: the empty pit must belong to you

Consider a counting diagram where your pit 1 contains one seed, your pit 2 is empty, and the opposite pit — North pit 5 when you are South — contains five. You also have seeds elsewhere, and the opponent has other non-empty pits, so neither side is about to finish.

Sow pit 1. Its one seed lands in your empty pit 2. You bank that seed plus the five opposite seeds: six captured seeds go into your store, and both pits become empty.

Now change only the opposite pit to empty. In this version, there is no capture. The last seed stays in your pit 2. Some household Mancala rules bank even that single seed; that is not the variant implemented here.

Ending in an opponent’s empty pit also does not capture. Check both the ownership of the landing pit and the opposite count before choosing a move for a capture.

## Example 3: the sweep can end an apparent extra turn

Imagine South’s only pit seed is one seed in pit 6. South has 20 in its store. North has one seed in each of its six pits and 21 in its store. There are 48 seeds altogether.

South sows pit 6 into its store, reaching 21. Normally a last seed in the store would earn another turn. But South now has no seeds in any pit, so the game ends immediately. North banks its remaining six seeds and finishes on 27, winning 27–21.

This example is why the final count matters more than the words “extra turn.” Before clearing your last pit, count the seeds that the other side would bank. The game handles the sweep automatically and reports the collected amounts.

## Longer sows: skip the other store on every lap

A pit can hold enough seeds to travel around the board more than once. Continue one seed at a time, including your store and skipping the other store on every circuit. The starting pit becomes empty when you pick up its seeds; it can receive a seed again on a later lap.

Do not stop and pick up the contents of a pit where the last seed lands. That would be a relay-sowing variation, not this Kalah game.

## Understand the computer and free assistance

Easy uses a short search with occasional random legal choices. Medium searches up to four turn changes, and Hard up to eight, within fixed node budgets. Extra turns keep the search at the same turn-change depth. The opponents evaluate banked seeds and the remaining position; they are not claimed to play perfectly or to have a calibrated rating.

Hints use the Hard search, and undo returns to before your most recent decision, including later computer extra turns. If you had two extra turns of your own, undo removes the latest decision rather than every choice from that entire run. Search happens in a cancellable worker so navigation and restart remain usable.

## Records and a daily board

The daily starts with 48 seeds allocated unevenly, using the same six-pit pattern from each player’s perspective. You go first against Hard. It is a full game with many legal continuations, not a puzzle with one required answer, and it does not promise the phone app’s exact board.

Completed computer games contribute to browser-local wins, losses, draws, win streaks and the largest winning margin. Local two-player games have a separate count. Free hints and undo, every starting seed setting and daily boards are included in these casual records; they are not a competitive leaderboard.

A win completed on the daily board’s own calendar date advances the local daily streak at most once that day. You can continue an older saved game, but winning it later does not backdate a streak. Clearing browser data or using another device can remove the local record.

For your next round, use a small routine: predict the final drop, check for a capture, and count a possible sweep. Then confirm the sow and compare your prediction with what happened.
    `
  },
  {
    title: 'Reversi: legal flips, corners and the turn you must pass',
    excerpt: 'Work through the first move, a two-direction flip and a forced-pass diagram. Learn why disc count matters at the end, not as an early score to chase.',
    slug: 'reversi-legal-moves-corners-and-passes',
    date: '2026-11-03',
    readTime: '4 min read',
    category: 'Reversi',
    content: `
## Start with a legal line

DoStrike Reversi uses an 8 by 8 board with four discs in the centre. Black moves first. The grid uses columns A–H and rows 1–8, with A1 at the top left. A legal placement traps an unbroken line of opposing discs between your new disc and one already showing your colour. Lines may run horizontally, vertically or diagonally. Every line directly trapped by the placement flips.

The score you see during play is the current number of discs, not a lead that cannot be overturned. The final count decides the result. That makes finding a useful legal placement more important than flipping the largest number immediately.

## Example 1: why C4 is legal in the opening

The initial White discs are D4 and E5; Black has E4 and D5. Black may open at C4, D3, E6 or F5. Consider C4: the new Black disc and the existing Black disc at E4 enclose White’s D4. D4 flips to Black. The board now has four Black discs and one White disc.

After that C4 opening, White may play C3, E3 or C5. Placing White at C3 encloses D4 on the diagonal ending at E5, so D4 flips back. A disc can change colour repeatedly; it never moves to another square.

The game highlights legal empty squares. Preview mode shows which discs would flip before you confirm, so you can trace the actual line instead of guessing from the colour of a nearby disc.

## Example 2: one move can flip several directions

For a line-reading exercise, imagine an empty D4. White occupies C4 and D3; Black occupies B4 and D2. Other squares in those two lines are empty. Black can place at D4 and flip both C4, along the row towards B4, and D3, along the column towards D2.

This is an isolated teaching diagram, not a complete opening position. Its purpose is to check that you examine every direction through the placed disc. You must flip all directly enclosed lines; you cannot choose to keep one White. A disc flipped in this way does not create another wave of flips elsewhere on the board.

## Example 3: a pass is a rule, not a resignation

Imagine a nearly full diagram: A1 is empty, B1 is White, and every other square is Black. White has no legal placement. It must pass. Black can then play A1, enclosing B1 against C1, and finish with all 64 discs.

That diagram illustrates why passing does not end the game by itself. If the other colour can move, it continues. In an actual game, a colour might have to pass more than once on separate turns. DoStrike handles compulsory passes automatically and records them in the move history. You cannot pass voluntarily when a legal placement exists.

## The board does not have to fill up

A game ends when neither colour has a legal move. There can still be empty squares. DoStrike compares the Black and White discs actually on the board; unfilled squares are not awarded to either side. Equal counts are a draw.

After a result, compare the two counts and check the remaining empty squares. This is a more useful explanation than assuming the person who passed first lost, or waiting for all 64 squares to be occupied.

## Corners and mobility: useful ideas, with limits

Once captured, a corner cannot be enclosed from beyond the board, so it cannot be flipped. A legal corner is often valuable. Squares next to an empty corner deserve care: they can give an opponent the line needed to take it.

Mobility means the choices a colour has available. Before a move, ask what legal replies you are offering. Flipping many discs can sometimes increase the opponent’s choices, so do not treat a large early count as a guaranteed advantage. Corner preference and mobility are heuristics, not proofs that a particular move wins.

## What DoStrike’s computer is doing

Easy varies its choices among legal placements. Medium searches up to two placements ahead. Hard searches up to four, or deeper in short endgames, within a fixed node budget. Both stronger levels consider positional weights and the difference in legal choices. A search can stop before its maximum depth; no level is claimed to play perfectly or to have a calibrated competitive rating.

Move suggestions use the Hard search. Hints and undo are free. Against the computer, undo returns to before your last placement and removes the later replies and passes. Browser records include assisted games and daily openings, so they are casual personal records rather than a competitive table.

## A different starting point each day

The website’s daily opening plays six valid placements before you take Black against Hard. It is a complete game, not a unique-answer tactic. The opening follows your local calendar date and is generated for this website; app parity is not promised.

Try a normal opening first, then the daily. In each game, use preview to name the enclosed lines before placing. After a surprising turn, inspect the move history and find whether a pass or a multi-direction flip changed who had the next useful choice.
    `
  },
  {
    title: 'Gomoku: open fours, forced blocks and the move that comes first',
    excerpt: 'Three concrete board examples explain when to win, when to block and why a line with two open ends is so dangerous.',
    slug: 'gomoku-threats-and-open-fours',
    date: '2026-11-03',
    readTime: '4 min read',
    category: 'Gomoku',
    content: `
## Start with the rules this board actually uses

DoStrike plays freestyle Gomoku on 15 by 15 intersections. Black starts, stones never move, and five or more connected stones win. Horizontal, vertical and both diagonal lines count. There are no forbidden double-threes, overline penalties or opening-swap rules in this version. A full board without five is a draw.

Coordinates on the board run A to O from left to right, with row 15 at the top and row 1 at the bottom. H8 is the centre. The examples below use those coordinates so you can inspect the same patterns in a two-player game.

## Example 1: a win takes priority over a block

Imagine Black has D8, E8, F8 and G8. White has D10, E10, F10 and G10. All other intersections in these two rows are empty. Black is to move.

Black should place at C8 or H8: either move completes five and ends the game immediately. Blocking White at C10 or H10 wastes the winning turn. The opponent never gets a reply after a completed five.

This is why every DoStrike computer difficulty checks for an immediate winning move before it checks for a block. Practise that scan yourself: before choosing an attractive attack, ask whether a line can already be finished.

## Example 2: closing one end changes the defence

Black has D8, E8, F8 and G8. White already occupies C8. White is to move, and has no immediate win elsewhere. H8 is empty.

White must play H8. C8 has already closed the left end, so H8 is Black’s only immediate winning point on that row. A distant plan cannot help if Black can end the round next turn.

Now remove White’s stone from C8. Black’s four is open at both ends: C8 and H8 each complete five. If White has no immediate win, one blocking stone cannot stop both points. Open fours are therefore much stronger than fours with only one open end.

## Example 3: turn an open three into an open four

Black has E8, F8 and G8. D8, H8 and I8 are empty. Black is to move; suppose White has no immediate win or forcing threat elsewhere.

Playing H8 creates E8–H8, four consecutive Black stones with D8 and I8 both empty. White can block one end but not both. Black then completes five at the other end.

The qualification matters: do not follow this pattern blindly while White has a winning move. Local patterns help you compare plans, but the entire board still determines which move works.

## Check diagonals before you commit

A diagonal can hide in plain sight. E5, F6, G7 and H8 belong to one rising diagonal; D4 and I9 extend its ends. A stone at an edge may remove one of those ends altogether. Count actual connected stones and empty endpoints, rather than treating every four as equally strong.

Before placing, scan four directions through your intended point. Then perform the same scan for your opponent. Preview mode lets you select an intersection before committing, which helps avoid an accidental placement on a crowded phone board.

## What the computer levels mean

All three levels take an available immediate win and block an immediate loss when they can. Easy varies its choice among highly scored points. Medium balances its own connected patterns with defensive patterns. Hard also checks the opponent’s strongest immediate reply among nearby points. These are heuristic opponents, not a claim of perfect Gomoku play or formally calibrated player ratings.

Hints use the same Hard heuristic. They can help you find a candidate, but they do not prove that a position is won. Undo and suggestions are free. Browser records include assisted games and are casual personal records, not a competitive leaderboard.

## A useful way to review your next round

After the result, trace the highlighted winning line. Identify its two endpoints one turn before the final stone. Could the losing player have blocked a single winning point, or had an open four already made that too late? Then play another round focusing on that earlier decision.

The daily opening offers four date-selected stones before you take Black against Hard. Its purpose is a different starting situation, not a guaranteed tactical puzzle with one correct move. It changes with your local calendar date and is generated for this website; identical app boards are not promised.
    `
  },
  {
    title: 'The Unbeatable Strategy: A Deep Dive into the Minimax Algorithm for Tic-Tac-Toe',
    excerpt: 'Discover how the Minimax algorithm makes Tic-Tac-Toe unwinnable for a perfect player. Learn the basics of game theory and how AI can always force a draw or win.',
    slug: 'minimax-algorithm-tic-tac-toe',
    date: '2024-01-15',
    readTime: '11 min read',
    category: 'Strategy',
    content: `
Tic-Tac-Toe looks trivial, but “playing perfectly” is a precise mathematical idea. Minimax is the classic algorithm that evaluates positions by assuming both sides respond optimally from every future board onward. That assumption turns fuzzy intuition into something you can code—and it explains why strong AI feels stubbornly fair.

## What Minimax Actually Optimizes

Minimax assumes your opponent always chooses the reply that hurts you most after your move. Your move is scored by how bad that worst-case reply can get. Picking the move with the **best worst-case outcome** is conservative by design: it trades flashy gambits for reliability.

Scores are arbitrary as long as they stay consistent: common choices are +1 for a win, 0 for a draw, −1 for a loss from the mover’s perspective (sometimes flipped per recursion depth—implementations vary).

### Step-by-step mental model

1. List legal moves from the current board.
2. For each candidate move, build the resulting board.
3. Recursively evaluate that board **with roles swapped**, until someone wins or the grid fills.
4. Backpropagate scores so each player picks extrema at their ply (max for you, min for them).

That recursion is exactly “if I go here, what happens when they punish me hardest?”

## Alpha–Beta Pruning (Why Real Engines Feel Fast)

Naive minimax touches every branch. Alpha–beta pruning skips subtrees that cannot change the final decision once an opponent already has a refutation line at least as strong as another branch you explored.

On a 3×3 grid you barely notice the savings—there are only tens of thousands of nodes before symmetry reductions—but on larger games pruning becomes mandatory. Understanding pruning clarifies why minimax scales poorly on Chess or Go unless paired with heuristics.

## Perfect Play Means Draw (Usually)

Standard Tic-Tac-Toe with optimal responses ends in a draw. Minimax exposes why “getting lucky” evaporates once threats are consistently blocked and forks prevented.

Against imperfect humans you win when they violate optimal sequences—typically by handing you two simultaneous threats or ignoring an immediate loss.

## Limits and Pedagogy

Minimax assumes perfect opponent modeling and clean terminal scoring—fine here, brittle in noisy environments.

Pedagogically it connects three fields:

- **Combinatorial search:** systematic exploration instead of vibes.
- **Game theory:** rational adversaries.
- **AI foundations:** heuristic evaluation functions appear next when trees explode.

Try playing against strong AI while verbally answering each turn: “Do I have a win in one? Does my opponent? Am I enabling a fork?” Minimax formalizes those checks exhaustively.

## Conclusion

Minimax is not magic—it is bookkeeping for pessimistic optimism: maximize your outcome assuming competent opposition.

Implement it once on paper or in code and you’ll carry that adversarial mindset into Connect Four patterns or larger searches later.

Finally: enjoy forcing draws against stubborn bots—that outcome *is* mastery for classic Noughts and Crosses.
    `
  },
  {
    title: 'Five paper Tic-Tac-Toe variants with rules you can check',
    excerpt: 'Exact house rules and worked positions for a larger grid, a three-layer board, avoid-three, shared symbols and Ultimate routing. These are paper activities, separate from DoStrike’s playable modes.',
    slug: 'tic-tac-toe-variations',
    date: '2024-01-10', updated: '2026-11-04', readTime: '4 min read', category: 'Game Variants',
    content: `
## Choose the rules before the first mark

These five activities are for paper or a board you draw yourself. DoStrike’s classic Tic-Tac-Toe game does not switch into these variants. The definitions below specify the version to play; other groups may use different house rules. Do not carry the classic game’s perfect-play draw result over to a different ruleset without checking it.

For each activity, write down the board, legal action, winning condition and draw rule. Stop as soon as the stated result occurs. The examples are rule checks, not claims of an unbeatable strategy or measured learning benefit.

## 1. Four in a row on a 4 by 4 grid

Draw sixteen cells. X starts, players alternate placing their own mark in one empty cell, and the first complete straight line of four wins. Only the four rows, four columns and two corner-to-corner diagonals qualify: ten lines in total. A full board with no line draws.

A diagonal of three is not enough. For a concrete check, X at row 1 column 1, row 2 column 2 and row 3 column 3 still needs row 4 column 4 to complete that diagonal. If the fourth point contains O, those three X marks do not win.

This is a deliberately fixed four-on-four activity. Moving to five rows or choosing a different target length changes the rules again; it is not just a larger drawing of this same game. For a playable larger-board alternative on DoStrike, Gomoku has its own explicit fifteen-by-fifteen freestyle rules.

## 2. Three layers, one straight line

Draw three 3 by 3 grids and label their layers 1, 2 and 3. Give every cell a layer, row and column, each from 1 to 3. X starts, turns alternate, and three own marks in a straight line through this three-dimensional grid win. A full grid with no line draws.

Define straight precisely: moving from the first point to the second must use the same coordinate step as moving from the second to the third. Each step component is -1, 0 or 1, and at least one changes. All three points must stay inside the grid. That includes lines within a layer, vertical pillars and diagonals through more than one layer.

For example, (1,1,1), (2,2,2), (3,3,3) form a line. Replacing the last point with (3,3,2) breaks it: the column step changes. A pillar such as (1,2,3), (2,2,3), (3,2,3) also qualifies.

There are 49 distinct winning lines under this definition, counting a line and its reverse only once. The accompanying verification enumerates them two ways and checks both examples. This is a geometric count, not a claim about which player can force a win.

## 3. Avoid three on the classic grid

Use a 3 by 3 grid, own symbols and alternating turns starting with X. The player who completes a line of three own marks loses immediately. If all cells fill without a line, call it a draw. This is the avoid-three convention used for this activity; do not apply the ordinary win announcement.

Try this legal opening using numbered cells 1 to 9, row by row: X at 1, O at 4, X at 2, O at 7. It is X’s turn. Putting X at 3 completes the top row and loses under this rule. It would win in classic play. The same visible pattern can demand a different choice when the objective changes.

Before making a move, name every line it would complete. That is a concrete check you can discuss after the round; it does not require claims about psychological pressure or a particular training schedule.

## 4. Shared symbols: a wild-style house game

Use a 3 by 3 grid, but let either player place either X or O on each turn. Players still alternate, and each turn fills one empty cell. The mover who completes a line of three identical symbols wins, regardless of who placed the earlier symbols. A full board with no such line draws.

Call the players A and B rather than assigning one permanently to X. If A places X at cell 1 and B places X at cell 2, A can win by putting X at cell 3. A could instead put O there, which would not complete the top row. Those choices are distinct legal actions, not a hidden-information mechanism.

This section defines one shared-symbol activity explicitly rather than asserting that every game called Wild has identical conventions. All previous moves are visible. Uncertainty about what your opponent will choose does not make their previous moves secret.

## 5. Ultimate: the small square sends the next move

Draw nine small 3 by 3 boards in a larger 3 by 3 arrangement. X starts anywhere. After that, the position of the small square just marked determines the opponent’s next small board. Winning a small board is not what selects that destination.

For this activity, close a small board when it is won or filled. A tied board belongs to neither side. If the required destination is closed, choose any open board. Win by claiming three small boards in a macro row, column or diagonal; if all boards close without that, draw.

Routing check: a move in the bottom-left small square sends the opponent to the bottom-left board, even when the move occurred on the top-right board. The outer location and inner location have different jobs. Write both before moving so you can check the next destination without guessing.

Ben Orlin’s linked account explains this routing idea. The closed-board and neutral-tie convention above is stated explicitly for this activity; agree on it before playing.

## Compare one changed rule at a time

After a round, record the exact position and whose turn it was. Explain one legal move and its result under the chosen rules. Compare it with classic play only where the action makes sense in both games.

A useful note is specific: cell 3 completes my own top row, so it loses in avoid-three. A vague claim that larger boards always teach better planning is not something this activity establishes. Keep your paper rules beside the board, and use DoStrike’s classic game and solver-checked strategy exercises when you want to return to its implemented rules.
`
  },
  {
    title: 'OXO and EDSAC: a documented early computer board',
    excerpt: 'What Cambridge’s archive actually records about OXO, where that evidence stops, and how to explore the rules and search behind DoStrike’s own Tic-Tac-Toe engine.',
    slug: 'history-of-tic-tac-toe',
    date: '2024-01-05', updated: '2026-11-04', readTime: '3 min read', category: 'History',
    content: `
## Start with a documented example

Cambridge’s EDSAC99 simulator project lists OXO among its original example programs, attributing the noughts-and-crosses game to A. S. Douglas in 1952. That is a concrete reference a reader can inspect, rather than an unnamed story about an early computer demonstration.

The list distinguishes original programs from modern examples supplied for the simulator. An example shown by a modern simulator is not automatically a newly discovered original program; check the attribution attached to the specific item.

## A display with another everyday purpose

The Computer Laboratory’s historical chronology contains notes by David Wheeler with additional material by David Hartley. It describes an EDSAC monitor that displayed the contents of a selected delay line and says it was also used unofficially for noughts and crosses. The notes describe its usual purpose as watching changing numerical data.

The same chronology records a telephone dial as a way to supply data during a program run and select stored material for diagnostics. That general equipment note alone does not establish every detail of OXO’s playing interface. This account does not turn it into a claim about exactly which keys or dial settings a player used.

The chronology identifies itself as draft retrospective notes. It is valuable institutional evidence, with that limitation made visible.

## What this history does not establish

These sources support a specific early computing example. They do not, by themselves, prove an ancient origin for today’s exact rules, or settle which project deserves the label first video game. Similar-looking grids, a display experiment and a complete playable program are different kinds of evidence.

The useful question is narrower: what did a particular program accept as a move, how did it show a board, and what rules did it enforce? Answering that requires evidence about that implementation. A familiar board shape is a starting point for investigation, not a substitute for it.

## Explore a modern implementation you can inspect

DoStrike implements the standard nine-square game: X starts, turns alternate, a completed line of three ends the round immediately, and a full board without a winner draws. These are statements about this website’s rules; they are not claims of operation-for-operation similarity to OXO.

The site’s Hard computer evaluates continuations with minimax. Easy and Medium use different policies. An opponent’s result therefore depends on its actual move-selection rules, not simply on being a computer. The AI guide explains those policies against the code used here.

For a reproducible experiment, start a local two-player round, make a move, and name every line that either player could finish on the next turn. Complete the round and open its review. Compare the result of the move played with a reply that preserves a better outcome. You are examining a specific decision, rather than treating one win as evidence of a general learning benefit.

## Keep boards and games separate when counting

A board arrangement can be reached through more than one move order. The exhaustive draw guide distinguishes reachable arrangements from complete legal histories, stops immediately at a win, and links the check that produces the reported counts. Rotations and reflections are counted separately unless stated otherwise.

That gives the historical curiosity a practical next step: inspect a program’s rules, reproduce a small result and be clear about what was counted. The archive sources below provide the historical reference; DoStrike’s implementation links support the modern experiment.
`
  },
  {
    title: 'A Mathematical Proof: Why a Perfect Tic-Tac-Toe Game Always Ends in a Draw',
    excerpt: 'Explore the math behind Tic-Tac-Toe and see why, with perfect play, neither player can win. Includes a step-by-step proof and game tree analysis.',
    slug: 'mathematical-proof-tic-tac-toe-draw',
    date: '2023-12-28',
    readTime: '11 min read',
    category: 'Mathematics',
    content: `
People call Tic-Tac-Toe “solved” because optimal play produces a predictable outcome: with best moves from both sides, **neither player can force a win** on the standard 3×3 board—the game draws.

That claim is stronger than folklore. It rests on exhaustive analysis of legal move sequences (the *game tree*) and on strategy-stealing style arguments familiar from combinatorial game theory.

## Counting Games and Positions

Academic summaries often cite **255,168 distinct complete games** when symmetries are not quotiented out. That headline number is less important than the idea: branches are finite, outcomes are discrete {X wins, O wins, draw}, and there is no hidden randomness—so every position has a definite *value* under perfect play.

Symmetry reductions (rotate/reflect the square) shrink the mental load for humans proving small lemmas, while computers happily brute-force the full enumeration.

## Strategy-Stealing Intuition (Why a First-Move Win Is Suspect)

Assume—contradiction style—that the second player possessed a universal winning plan. The first player could “steal” it by making a harmless move that never hurts (on this tiny board the formal version is subtler), then follow the alleged second-player strategy—classic impossibility sketch why many impartial or symmetric games tilt toward draws or first-player preserves at most an advantage.

While the full rigorous line is board-specific, the pedagogical payoff is enormous: students see *global* counting arguments, not local heuristics only.

## Exhaustive Verification Today

Modern code can label every reachable board as win/lose/draw in milliseconds. The empirical output is blunt: **no line exists where X forces three-in-a-row against perfect O**, and symmetrically **O cannot steal a win if X opens centrally and both follow threat tables**.

Therefore practice against perfect engines always collapses to draws—your only wins arise from opponent errors (missed blocks, fork blindness, edge openings that high-level tables punish).

## Classroom-Friendly Proof Steps (Handwaving Minus Code)

1. Fix standard win lines (rows, columns, diagonals).
2. Argue taking center cannot be worse than alternatives for X (symmetry-breaking cases enumerated).
3. For each forced O reply class, show X’s continuations cannot create unavoidable double threat without O’s cooperation.
4. Conclude terminal leaves are draws or stalemates.

Students can dramatize step 3 with laminated move trees for the first four plies—concrete anchor before symbolic trees.

## Why It Still Matters Pedagogically

Finite deterministic games illustrate **backward induction**: label end states, propagate values upward, pick extrema per turn order. That blueprint later appears in economics, cybersecurity duels, and robust AI evaluation.

Even if you never formalize lemmas, believing the draw theorem explains why hustler “unbeatable tricks” evaporate versus alert youth who simply block—mathematics stole the romance, not the fun.

## Try It Yourself

Play our AI at its strongest setting: if you never miss a forced block, you’ll feel the asymptote—**wins imply your opponent slipped**, not that the board hid a secret tactic.

Enjoy the serenity of provable fairness: tiny grid, gigantic lesson in honest limits.
    `
  },
  {
    title: "Tic-Tac-Toe strategy: win, block, then look for forks",
    excerpt: "A practical strategy guide with four playable, solver-checked positions: immediate wins, forced blocks, forks and opposite-corner defence.",
    slug: 'complete-tic-tac-toe-strategy-guide',
    date: '2024-01-20',
    updated: '2026-11-03',
    readTime: '1 min read',
    category: 'Tic-Tac-Toe',
    content: `
## Use a decision order, not a slogan

On DoStrike’s standard board, X starts, players alternate, and three marks in a row end the round immediately. A full board without a line is a draw. The useful question is not whether you prefer the centre or a corner: it is what the current board lets each player do.

Before placing a mark, work through this order:

1. Can I complete three now? Take that win: the opponent never gets another move.
2. If I cannot win now, can the opponent complete three on their next turn? Block that threat if a saving move exists.
3. Can I create a fork, or must I stop one? Compare the actual follow-up moves, not just how promising a square looks.
4. If there is no forcing tactic, choose a move that keeps a draw or win available against the opponent’s best reply.

Earlier overlapping versions of our guides placed blocking before winning. This revision corrects that order. If both players threaten a line, completing your own line ends the game; blocking instead can throw away the win.

## Read the board with square numbers

For the examples and playable boards below, number the top row 1, 2, 3; the middle row 4, 5, 6; and the bottom row 7, 8, 9. A winning line is one of the three rows, three columns or two diagonals. There are eight lines to scan.

## Position 1: finish before you defend

X occupies squares 1 and 2. O occupies 4 and 5. All other squares are empty, and X is to move.

Square 3 wins immediately along the top row. Square 6 would block O’s middle row but miss the available win. This position is a useful reminder that seeing an opponent’s threat is not the same thing as choosing the right priority. Try both choices on the first board below and compare the explanation.

## Position 2: the block really is forced

O occupies 1 and 2. X occupies 4 and 9. X is to move. X has no immediate winning line, so square 3 is the only move that avoids an immediate loss.

Taking the centre might look sensible in isolation, but O would then finish the top row. After blocking, reassess the new board; a necessary defensive move does not mean you should stop looking for attacks.

## Position 3: a defensive move can create a fork

X occupies 1 and 9. O occupies 3 and 5. X must answer O’s diagonal through 3, 5 and 7.

Playing 7 does two jobs. It stops that diagonal and gives X threats at 4 (the left column) and 8 (the bottom row). O has no immediate win and cannot cover both points with one move. X can finish on the following turn.

That is a fork: two distinct winning squares after one move. Two marks that merely look active do not establish a fork. Name both finishing squares before deciding you have one.

## Position 4: the centre is not a complete defence

X occupies opposite corners 1 and 9; O occupies 5. O is to move. A corner reply at 3 or 7 allows X to create a fork. The four edges, 2, 4, 6 and 8, can each preserve a draw with correct later replies.

For example, after O chooses 2, X has to watch the middle column. The edge creates a threat that changes what X can safely do next. Preventing a fork can require a forcing move, rather than simply occupying a square where the fork might appear.

## Openings: useful defaults, with limits

An empty board has three kinds of square under rotation and reflection: centre, corner and edge. They are not all geometrically equivalent. Our solver evaluates all nine first moves as draws against perfect replies, so an edge opening is not automatically a lost position.

The centre is a convenient beginner’s default because it participates in four winning lines; a corner participates in three and an edge in two. Those counts describe geometry, not a promise of victory. If X starts in the centre, O should choose a corner. If X starts in a corner, O should take the centre to preserve a draw against perfect play. Continue checking tactics after that first reply.

## Practise the explanation, not just the answer

Use the four boards below without a timer. Choose a move, read why it works, then identify the opponent’s next threat. There can be more than one correct move: the opposite-corner defence accepts all four saving edges. The exercises use the same exact standard-board solver as DoStrike’s daily challenge.

After a normal Tic-Tac-Toe round, open the move review. Inspect the board before the missed win or saving reply. The review evaluates best possible responses; it does not predict that a human opponent would necessarily find them.

A short routine is enough: solve one position, play a round, inspect one decision and replay. Count missed wins and missed blocks separately. These are personal practice observations, not an online ranking or proof of a learning benefit.

## What to expect against the computer

Hard uses the solved standard-board strategy, so accurate play from both sides ends in a draw. You do not need to manufacture a risky attack just to avoid another draw. Lower levels are useful for noticing opportunities, but beating them does not demonstrate that every move you made was safe.

The goal of this guide is a repeatable decision process: take the win, stop a real threat, check the fork, and explain what the next player can do.
    `
  },
  {
    title: "Teach Tic-Tac-Toe: a 15-minute lesson with playable examples",
    excerpt: "A practical lesson for parents and teachers: introduce winning lines, compare an immediate win with a forced block, and ask learners to explain a move.",
    slug: 'tic-tac-toe-education-teaching-resource',
    date: '2024-01-18',
    updated: '2026-11-03',
    readTime: '1 min read',
    category: 'Education',
    content: `
## A small lesson with a concrete objective

Use this lesson to practise explaining a decision on a standard 3 by 3 board. The observable objective is simple: the learner can name a winning line and explain whether a move wins now or blocks an immediate loss. This is a suggested activity, not a claim that Tic-Tac-Toe produces measured academic or social improvements.

You need two players and either paper with nine counters or DoStrike’s local two-player mode. No account or timer is required. The browser’s complete match ends when one player wins two rounds; for this lesson, pause after an individual round to discuss its moves.

## Minutes 0–3: name what counts as a win

Show the three rows, three columns and two diagonals. Ask the learner to point to each: there are eight winning lines. Explain that X moves first and players alternate, placing only on empty squares. Three in a row ends a round; filling the board without a line is a draw.

For square numbers, read left to right: 1–3 at the top, 4–6 in the middle, 7–9 at the bottom. Let the learner describe a location aloud, point or use the keyboard. Larger paper counters can be more comfortable than a screen for some learners.

## Minutes 3–7: compare winning and blocking

First use the playable board below with X in 1 and 2 and O in 4 and 5. Ask: “Can X finish three on this turn?” The answer is 3. Even though O threatens square 6, the round ends as soon as X completes the top row. Winning now comes before blocking.

Then use the second board: O is in 1 and 2; X is in 4 and 9. Ask: “Does X have a win now? If not, what would O do next?” X must choose 3 to stop O’s top row. Have the learner explain why taking 5 does not solve that problem.

Use the same questions each time rather than praising a guess: “Which three squares form the line?” and “Whose next turn are we considering?” Reveal the answer if the learner wants help, then retry without a penalty.

## Minutes 7–12: play, stop and explain

Play one or two rounds together. Before each placement, let the current player complete a sentence: “I choose this square because…” A useful answer identifies an immediate win, a specific threat or a planned follow-up. A vague answer such as “corners are good” is an invitation to examine the board, not a reason to mark the move wrong.

Ask a partner to describe the other player’s strongest reply. Keep coaching suggestions between turns and avoid moving a learner’s piece for them. A learner can also observe a round and point out a line, or use the same board without competition.

## Minutes 12–15: record one decision

Choose one round to review. On DoStrike, open its move review before starting the next round. On paper, redraw the position one move before the decisive threat. Ask what could have been done differently.

A short exit response can use three statements:

1. The winning or threatened line was ___.
2. The important move was ___ because ___.
3. Next round I will check ___ before placing.

Treat a draw as a completed outcome, not a failed attempt to win. Rotate who plays X when starting another activity; do not assume player labels make the roles alternate automatically in the current match.

## Adapt the activity without changing what you measure

For an introduction, discuss only rows before adding columns and diagonals. For a more experienced learner, use the strategy guide’s fork example: ask them to name two separate winning squares after one move. For a reader who prefers pictures, point to the lines instead of requiring written sentences. These are optional teaching choices; adapt them to the person rather than assuming a fixed age band.

A language activity can ask learners to describe a move in a complete sentence. A subject-review variation can put questions in paper squares, but that changes how squares are earned and is not a mode implemented by DoStrike. Agree on the altered rules before playing.

## If you collect class results, state the limits

You can record the number of rounds, who played first and whether each ended in an X win, O win or draw. State the actual sample and how opponents chose moves. A class’s observed result frequency is not the universal probability of winning Tic-Tac-Toe; it depends on the players and their decisions. Do not compare learners as though a few game outcomes measure a general ability.

The two boards below provide reproducible examples for the lesson. They are checked by the game solver, work without a time limit and allow you to retry or reveal an explanation.
    `
  },
  {
    title: 'A four-player Tic-Tac-Toe meet-up: fixtures, fair starts and scoring',
    excerpt: 'A concrete optional house format: three rounds, two boards per pairing, balanced X/O starts and a checked worked standings example. Keep shared ties without an endless sudden-death loop.',
    slug: 'tic-tac-toe-tournaments-community-building',
    date: '2024-01-12', updated: '2026-11-05',
    readTime: '4 min read', category: 'Community',
    content: `
## An optional house format, not a hosted event

This is a small plan for four people using paper or a shared local game board. It is not an official tournament rulebook or an announcement of a DoStrike event. DoStrike does not provide event registration, a tournament bracket, a standings table or a tournament clock. Keep the fixtures and results yourself.

The point is to give everyone equal opponents and equal first-player opportunities. It does not make Tic-Tac-Toe a game with a guaranteed decisive result: careful play can draw. A finished draw is a valid result, not an unfinished match that must be replayed until someone loses.

## Three rounds, six pairings

Call the four players A, B, C and D. Each pairing consists of two separate boards. The first named player takes X on board one; swap X and O for board two. Use these fixtures:

- Round 1: A–D; B–C.
- Round 2: A–C; D–B.
- Round 3: A–B; C–D.

Each round has two disjoint pairings, so two boards can run at the same time. Finish both games of a pairing before moving to the next round. If you have only one board, play the pairings in sequence; the schedule still works without promising a particular duration.

There are six different pairs and two games per pair, for 12 completed boards in total. Each person meets all three others, plays six games, and starts as X three times and O three times. Those counts are checked by the accompanying fixture verifier.

## Agree the scoring before starting

Use the usual 3 by 3 board: X starts, then players alternate marking one empty square. A line of three across a row, column or diagonal wins and stops the board immediately. A full board without a winning line draws. Do not continue marking after a win.

For this optional event, award one point for a win, half a point for a draw and zero for a loss. Score each board separately and add both to the pairing total. Two draws therefore give one point to each person. A win and a draw give the same person 1.5 points and the opponent 0.5. Splitting two wins gives one each.

A draw does not give either person a win in their browser record. The event standings are a separate handwritten ledger. Never add computer practice results to the event score.

## A complete worked ledger

Here is one possible set of results in fixture order. Each listed outcome can occur in a legal completed board; the verifier also checks that every board distributes exactly one point.

- A–D: A wins the first board and draws the second. Pair points A 1.5, D 0.5.
- B–C: both boards draw. Pair points B 1, C 1.
- A–C: the first board draws; C wins the second as X. Pair points A 0.5, C 1.5.
- D–B: D wins the first board as X; B wins the second as X. Pair points D 1, B 1.
- A–B: both boards draw. Pair points A 1, B 1.
- C–D: C wins once as X and once as O. Pair points C 2, D 0.

C finishes on 4.5 points; A and B have 3 each; D has 1.5. The total is 12, matching the number of boards. This conservation check catches a common ledger mistake: awarding a full point to each player for a draw.

## Shared places are a valid finish

The suggested house policy is to share a placing when totals tie. In the worked example A and B share second. Decide that before the first board so a later tie does not trigger an improvised advantage for one player.

The plain sum of opponents’ final points cannot separate A and B here. Each met all three others, and both sums are 12 minus 3, or 9. That observation concerns this simple unweighted calculation, not every possible weighted tie-break system.

If the group wants an extra challenge, you can agree to one more two-board pairing with starts swapped. Set a finite end to that activity and keep the shared placing if both totals still tie. Repeated sudden death is not a guaranteed way to find a winner in a game that can draw under careful play.

## Use the local board without inventing site features

Open Tic-Tac-Toe setup and choose **A friend**, described as **On the same screen**. Assign the first named player to X and the other to O. Record the completed board, return to setup, then swap those assignments before the pairing’s second board. Start a fresh board from setup each time.

The website normally presents a first-to-two-wins match and says that draws replay. This optional event scores individual boards, including draws, instead. Do not discard a drawn board or use the website’s match winner as the event result. Keep the separate ledger above. DoStrike’s saved preferences and game records belong to the browser; they are not a multi-player event database.

Use paper if everyone needs to see a permanent score sheet together. If a move is disputed, reconstruct it from agreed notes when possible; otherwise follow the replacement-board policy you agreed before play. This optional format does not impose a tournament clock or penalties that the website cannot enforce.

## End with a board, not a promise

After the fixtures, choose one actual position to discuss. Ask whether the next player had an immediate win, needed to block, or could create two threats. Keep the exercise separate from the event points. The strategy guide and practice board can help check the position; they do not guarantee attendance, learning gains or a growing community.

The useful result of this plan is a complete, auditable set of games with balanced starts. There is no need to add registration systems, publicity campaigns, VR equipment or regional-event claims to run this four-person version.
`
  },
  {
    title: 'The Future of Tic-Tac-Toe: AI, Virtual Reality, and Educational Innovation',
    excerpt: 'Explore the exciting future of Tic-Tac-Toe as technology advances. Discover how AI, VR, and educational innovations are transforming this classic game.',
    slug: 'future-tic-tac-toe-ai-vr-innovation',
    date: '2024-01-10',
    readTime: '16 min read',
    category: 'Technology',
    content: `
Tic-Tac-Toe, despite being one of the oldest games in human history, is experiencing a renaissance through modern technology. This exploration examines how artificial intelligence, virtual reality, and educational innovations are transforming this classic game and creating new possibilities for learning, entertainment, and human-computer interaction.

## Artificial Intelligence and Machine Learning

### Advanced AI Opponents
Modern AI systems can play Tic-Tac-Toe perfectly, but the real innovation lies in creating AI that adapts to human skill levels and provides educational value.

**Adaptive Difficulty Systems:** AI can now analyze a player's skill level and adjust its playing strength accordingly, providing an optimal learning experience.

**Learning Analytics:** AI systems can track player progress, identify learning patterns, and provide personalized feedback and recommendations.

**Emotional Intelligence:** Future AI systems may be able to recognize player frustration or confusion and adjust their behavior to provide better support.

### AI as a Teaching Tool
Artificial intelligence is revolutionizing how Tic-Tac-Toe is used in education.

**Personalized Learning:** AI can create customized learning paths based on individual student needs and learning styles.

**Real-Time Feedback:** AI systems can provide immediate feedback on moves, explaining why certain choices are better than others.

**Progress Tracking:** Advanced analytics can track long-term learning progress and identify areas for improvement.

### AI Research Applications
Tic-Tac-Toe serves as an ideal platform for AI research and development.

**Algorithm Development:** The game's simplicity makes it perfect for testing new AI algorithms and approaches.

**Human-AI Interaction:** Researchers use Tic-Tac-Toe to study how humans interact with AI systems and develop better interfaces.

**Ethical AI:** The game provides a safe environment for exploring AI ethics and decision-making transparency.

## Virtual Reality and Augmented Reality

### Immersive Gaming Experiences
Virtual reality is creating entirely new ways to experience Tic-Tac-Toe.

**3D Game Boards:** VR allows players to interact with three-dimensional game boards, adding depth and spatial awareness to gameplay.

**Environmental Immersion:** Players can play Tic-Tac-Toe in virtual environments, from peaceful gardens to futuristic spaceships.

**Multiplayer VR:** Virtual reality enables players from around the world to meet and play in shared virtual spaces.

### Educational VR Applications
Virtual reality is transforming how Tic-Tac-Toe is used in education.

**Interactive Learning Environments:** Students can learn game theory and strategy in immersive, interactive environments.

**Spatial Learning:** VR helps students understand spatial relationships and geometric concepts through hands-on experience.

**Collaborative Learning:** Multiple students can work together in virtual spaces to solve problems and learn strategies.

### Augmented Reality Enhancements
Augmented reality adds digital overlays to the physical world, creating new possibilities for Tic-Tac-Toe.

**AR Game Boards:** Physical game boards can be enhanced with digital information, animations, and interactive elements.

**Real-World Integration:** AR can integrate Tic-Tac-Toe into real-world environments, such as classrooms, parks, or public spaces.

**Accessibility Features:** AR can provide visual and audio enhancements for players with disabilities.

## Educational Innovation

### Gamification and Learning
Modern educational approaches are using Tic-Tac-Toe to teach a wide range of subjects.

**Cross-Curricular Integration:** The game is being used to teach mathematics, computer science, psychology, and even language arts.

**Competency-Based Learning:** Students can demonstrate mastery of concepts through gameplay and strategic thinking.

**Social Learning:** Collaborative gameplay helps develop communication, teamwork, and social skills.

### Adaptive Learning Systems
Technology is enabling personalized learning experiences that adapt to individual needs.

**Learning Analytics:** Systems can track student progress and provide targeted interventions and support.

**Differentiated Instruction:** Technology allows for different learning paths based on individual strengths and weaknesses.

**Continuous Assessment:** Ongoing assessment through gameplay provides real-time feedback on learning progress.

### Global Learning Communities
Technology is connecting learners around the world through Tic-Tac-Toe.

**International Competitions:** Online platforms enable students from different countries to compete and learn together.

**Cultural Exchange:** Players can learn about different cultures and perspectives through international gameplay.

**Language Learning:** Tic-Tac-Toe can be used to teach languages through gameplay and interaction.

## Mobile Technology and Accessibility

### Mobile Gaming Innovation
Mobile devices are creating new possibilities for Tic-Tac-Toe gameplay.

**Touch Interfaces:** Touch screens provide intuitive and accessible ways to interact with the game.

**Location-Based Gaming:** Mobile technology enables location-based Tic-Tac-Toe experiences and competitions.

**Social Integration:** Mobile apps can integrate with social media and messaging platforms for enhanced social interaction.

### Accessibility Advances
Technology is making Tic-Tac-Toe more accessible to players with disabilities.

**Voice Control:** Voice-activated systems allow players with mobility impairments to play independently.

**Audio Feedback:** Audio cues and descriptions help visually impaired players understand game states and make moves.

**Customizable Interfaces:** Players can customize game interfaces to meet their specific needs and preferences.

## Blockchain and Digital Ownership

### Digital Collectibles
Blockchain technology is enabling new forms of digital ownership and collectibles.

**NFT Game Boards:** Unique digital game boards can be created and traded as non-fungible tokens.

**Achievement Tokens:** Players can earn and trade tokens representing achievements and milestones.

**Community Governance:** Blockchain can enable community governance of Tic-Tac-Toe platforms and tournaments.

### Decentralized Gaming
Blockchain technology is enabling decentralized gaming platforms and communities.

**Player-Owned Platforms:** Players can own and govern gaming platforms through decentralized organizations.

**Transparent Competition:** Blockchain provides transparent and verifiable records of game outcomes and achievements.

**Cross-Platform Integration:** Blockchain enables seamless integration between different gaming platforms and communities.

## Internet of Things (IoT) Integration

### Smart Game Boards
IoT technology is creating intelligent, connected game boards.

**Sensors and Feedback:** Smart boards can provide haptic feedback and track player interactions.

**Environmental Adaptation:** Boards can adapt to lighting, temperature, and other environmental conditions.

**Health Monitoring:** IoT-enabled boards can monitor player health metrics during gameplay.

### Connected Learning Environments
IoT is creating connected learning environments that enhance educational experiences.

**Classroom Integration:** Smart boards can integrate with classroom management systems and learning platforms.

**Data Collection:** IoT devices can collect detailed data on learning patterns and outcomes.

**Personalized Environments:** Learning environments can adapt to individual student needs and preferences.

## Ethical Considerations and Challenges

### Privacy and Data Protection
As technology advances, privacy and data protection become increasingly important.

**Data Collection:** Clear policies and consent mechanisms are needed for data collection and use.

**Data Security:** Robust security measures are required to protect player data and privacy.

**Transparency:** Players need clear information about how their data is used and protected.

### Digital Divide
Technology advances must be accessible to all players, regardless of economic or geographic circumstances.

**Affordability:** Technology solutions must be affordable and accessible to diverse populations.

**Infrastructure:** Adequate infrastructure is needed to support advanced technology applications.

**Digital Literacy:** Education and training are needed to ensure all players can benefit from technological advances.

### Addiction and Screen Time
As games become more engaging, concerns about addiction and excessive screen time increase.

**Healthy Gaming Habits:** Platforms should promote healthy gaming habits and provide tools for managing screen time.

**Parental Controls:** Parents need tools to monitor and control their children's gaming activities.

**Educational Balance:** Technology should enhance rather than replace traditional learning methods.

## Conclusion

The future of Tic-Tac-Toe is bright and full of possibilities. Technology is transforming this classic game into a powerful tool for learning, entertainment, and human connection. From advanced AI systems to immersive virtual reality experiences, the innovations on the horizon promise to make Tic-Tac-Toe more engaging, educational, and accessible than ever before.

However, as we embrace these technological advances, we must remain mindful of the ethical considerations and challenges they present. Privacy, accessibility, and responsible use of technology must remain priorities as we develop new applications and platforms.

The key to success lies in balancing innovation with accessibility, ensuring that the benefits of new technology are available to all players, regardless of their circumstances. By focusing on education, community building, and responsible development, we can ensure that Tic-Tac-Toe continues to bring joy, learning, and connection to people around the world for generations to come.

The future is not just about making Tic-Tac-Toe more technologically advanced—it's about using technology to make the game more meaningful, educational, and accessible to everyone. Whether through AI-powered learning systems, immersive virtual reality experiences, or global online communities, the goal remains the same: to bring people together through the shared joy of strategic thinking and friendly competition.

As we look to the future, let us remember that technology is a tool to enhance human experience, not replace it. The most successful applications of technology to Tic-Tac-Toe will be those that strengthen human connections, enhance learning, and make the game more accessible and enjoyable for everyone.
    `
  },
  {
    title: 'Connect 4 Strategy Blueprint: Control the Center, Build Threats, and Avoid Common Traps',
    excerpt: 'A practical Connect 4 guide that covers openings, mid-game plans, defensive priorities, and endgame conversion. Learn how to win more consistently against humans and AI.',
    slug: 'connect4-strategy-blueprint',
    date: '2026-04-26',
    updated: '2026-11-03',
    readTime: '11 min read',
    category: 'Strategy',
    content: `
Connect 4 looks simple, but strong play comes from planning two and three turns ahead while controlling key columns. If you rely only on immediate moves, you will miss winning sequences and fall into avoidable traps.

## Why the Center Matters

The center columns (especially column 4 in a 7-column board) participate in more possible four-in-a-row lines than edge columns. That means center control gives you:

- More attacking options
- Better defensive flexibility
- Higher chance to create forks (two threats at once)

If two moves are equally safe, the center-side move is usually stronger.

## Opening Rules That Win Games

### 1) Start near the middle
Opening in the center gives long-term initiative. If center is occupied, choose the closest inside column before moving outward.

### 2) Avoid random edge stacking early
Edge stacks can become useful later, but early edge-heavy play often gives up tempo and board influence.

### 3) Respect parity and move order
The same shape can be winning or losing depending on whose turn it is. Always ask: "If I play this, what is my opponent's best response immediately?"

## Mid-Game Planning: Build Layers, Not Single Moves

Strong mid-game play is about preparing future threats while keeping your position safe.

### Build vertically with support
A potential horizontal or diagonal win is only real if the target cell is playable (supported from below). Many players see lines that are not yet physically reachable.

### Create forcing sequences
A forcing sequence is when your move demands a block. Chain enough forcing moves and your opponent eventually runs out of answers.

### Prefer dual-purpose moves
The best move often improves your attack and blocks or limits the opponent.

## Defense: What to Block First

### Priority 1: Immediate loss prevention
First check whether you can complete four now: a winning drop ends the round immediately. If you have no immediate win and the opponent does, block that threat if a saving move exists. Do not ignore it for a setup move.

### Priority 2: Fork prevention
If they can create two threats with one move, prevent that shape before it appears.

### Priority 3: Center denial
If no urgent threat exists, reduce their center influence.

## Common Mistakes (and Fixes)

### Mistake: Tunnel vision on one line
Fix: Scan the board left-to-right for all opponent threats before choosing your move.

### Mistake: Ignoring playable-cell logic
Fix: Confirm the target winning cell is actually playable this turn.

### Mistake: Over-attacking when behind
Fix: Stabilize first, then transition into counterplay.

### Mistake: Late-game panic moves
Fix: Slow down in endgame. One accurate defensive move can flip a losing game into a draw.

## Endgame Conversion

When the board gets crowded:

- Re-evaluate every column for immediate tactical shots.
- Prefer moves that preserve multiple defensive answers.
- Convert advantage by forcing predictable blocks.

If you are ahead, do not rush. If you are behind, look for drawing resources by removing your opponent's fork potential.

## Practical Training Routine

Use this 15-minute routine:

1. Play 2 short games focusing only on center control.
2. Play 2 games where your only objective is preventing forks.
3. Review 1 lost game and identify the first move where you stopped planning ahead.

Consistency beats memorizing one magic opening.

## Final Takeaway

To improve quickly in Connect 4:
- Control center space
- Build supported threats
- Defend immediate losses first
- Think in forcing sequences, not isolated moves

That combination beats most casual opponents and gives you a stable foundation against stronger players and AI.
    `
  },
  {
    title: 'Memory: keep a card map and check your next pair',
    excerpt: 'A worked card-location example, the actual 6/8/10-pair rules, and a simple mistake ledger help you review a round without promised memory or speed gains.',
    slug: 'memory-game-improvement-guide',
    date: '2026-04-26', updated: '2026-11-04', readTime: '4 min read', category: 'Memory',
    content: `
## Know what the board records

DoStrike Memory offers Easy with 6 pairs, Medium with 8 and Hard with 10. Every symbol appears on two cards. Reveal two different cards to make an attempt. A matching pair disappears; a mismatch turns face down again before you can choose another pair.

The move count increases after the second card of an attempt, whether or not you matched. Revealing the first card alone does not add a move. Six pairs require at least six attempts, but that is a lower bound with every pair already known or fortunate guesses, not a realistic promise for an unseen shuffled board.

The timer starts on your first reveal and includes the time spent watching match and mismatch feedback. It stops when the last matching pair has been removed. It is a casual browser timer, not a precision or competitive benchmark. Restarting or changing difficulty creates a new shuffled board and resets its counters.

## Give each place a stable name

Easy and Medium use four columns; Hard uses five. Describe locations as row and column, counted from the top left. Cards keep their original grid slots when matched cards disappear. Empty spaces therefore help preserve your map rather than shifting later cards into new positions.

Choose one scan direction, such as left to right within each row. That is a way to keep track of which cards you have inspected, not a proven optimal strategy for every player. When you leave the scan to collect a known pair, remember where to resume.

## Worked example: use what the mismatch taught you

Imagine an Easy board where you have already seen a moon at row 1 column 2 and a rocket at row 2 column 1. They were a mismatch and are now face down.

You reveal an unknown card at row 3 column 4 and see a moon. If your earlier location is correct, choose row 1 column 2 as the second card. You can predict the match before clicking. Opening another unknown card instead would spend this opportunity gathering information rather than collecting the known pair.

After collecting those moons, the rocket still belongs to row 2 column 1. The missing moon slots do not change that coordinate. If a later first reveal is a rocket, you have another predicted pair available.

If you cannot actually recall the location, mark that uncertainty in your review. A remembered symbol without a reliable place is not a known pair. Guessing and getting lucky is a different event from predicting both locations correctly.

## A useful second card when the match is unknown

Suppose your first reveal is a planet and you have never seen its partner. Choosing a card you already know is a rocket cannot make that particular pair match, assuming your map is correct. An uninspected card might be the partner and also gives you new information if it is not.

That is a local decision under the stated knowledge, not a claim that one scan order minimises all expected moves. A mismatch still teaches two locations. Before the cards close, repeat those places once if that helps you keep track of them.

## Turn the old drills into one small experiment

Choose a single focus for one round: keep a consistent scan, say a short location cue, or avoid reopening a known mismatch. These are optional methods to try, not prescribed chunk sizes or a promise of general memory improvement.

After the round, write down the difficulty, total attempts and one concrete error. For example: I saw both moons but chose the wrong row for the second. On another round, try a clearer row-and-column cue and see whether that kind of error recurs.

You can keep a small ledger with columns for the difficulty, move count, elapsed time and repeated-known-mismatch errors. The game displays moves and time; you must tally the error category yourself. It does not upload or analyse that ledger. Do not count a first-time mismatch as a forgotten known pair.

Compare like-sized boards, and remember that each shuffle changes the information available and the luck of the opening. A lower score on a later board does not by itself establish that the method caused it. Stop or take a break whenever you prefer; no age-based or fatigue-training schedule is required.

## Read personal records carefully

Best move count and best time are stored separately for each difficulty in this browser. They may come from different completed rounds. A fast round need not have the fewest attempts. The page's Boards cleared counter counts cleared boards; it does not give you an abandon-inclusive win rate.

The New personal best message refers to an improved move count in this version. Use the displayed numbers to compare times. Records are local, with no account, cross-device sync or leaderboard. Reload starts a new board rather than restoring an unfinished Memory round, while completed records remain when storage is available.

Use this game to practise remembering this board and reviewing specific choices. These exercises do not demonstrate health benefits, general cognitive transfer, guaranteed weekly gains or a particular learning outcome.
`
  },
  {
    title: 'Connect 4 Endgame Guide: Convert Winning Positions and Save Lost Boards',
    excerpt: 'Learn practical Connect 4 endgame technique: forcing lines, block priorities, parity awareness, and draw-saving defense under pressure.',
    slug: 'connect4-endgame-guide',
    date: '2026-05-01',
    updated: '2026-11-03',
    readTime: '10 min read',
    category: 'Strategy',
    content: `
Many players improve in the opening but still throw winning games in the last 8-12 moves. Endgame skill is what turns good positions into consistent results.

## Endgame Objective

In Connect 4 endgames, your goal is not "play a good move." Your goal is:

- Force a sequence the opponent must answer
- Limit their counterplay choices
- Convert advantage without giving tactical shots

When behind, the goal changes to:
- Remove fork threats
- Force predictable blocks
- Hold for a draw if a win is gone

## First Endgame Checklist

Before every move in a crowded board:

1. Do I have an immediate win?
2. Does the opponent have an immediate win?
3. Can either side create a two-threat fork next turn?
4. Which move keeps the most safe replies available?

This checklist prevents panic blunders.

## Forcing Line Basics

A forcing line is a sequence where each move demands a response.

### Why it works
If you keep asking one clear tactical question each turn, your opponent has no time to build their own attack.

### Practical pattern
- Create one must-block threat.
- After the block, play a second threat that improves your structure.
- Repeat until the final winning drop appears.

Do not break a forcing line for a "nice-looking" move unless it wins immediately.

## Block Priority in Tight Positions

### Priority 1: Direct win prevention
Take an immediate winning drop first, because it ends the round before the opponent can reply. If you cannot win now, block an immediate loss if a saving move exists.

### Priority 2: Fork denial
If opponent can create two winning threats with one move, prevent that square now.

### Priority 3: Central control
If no urgent tactics exist, deny central columns to reduce their line options.

This order keeps defense disciplined.

## Parity Awareness (Simple Version)

In late boards, the row a threat lands on matters. Some threats become reachable for one side first because of move order.

Simple practical rule:
- If a key winning cell is one move away but opponent reaches it first, treat that line as unsafe and switch plans.

You do not need advanced math to benefit from parity awareness. Just track who reaches critical cells first.

## Common Endgame Throw Patterns

### Throw 1: Ignoring opponent's one-move win while building your own setup
Fix: Immediate threats always come first.

### Throw 2: Playing the only move that reduces your own safe replies
Fix: Prefer moves that preserve multiple defensive answers.

### Throw 3: Rushing when ahead
Fix: If you are winning, force the board. Do not gamble.

### Throw 4: Resigning mentally in bad positions
Fix: Many "lost" boards can still be drawn by removing fork squares and forcing blocks.

## How to Save a Worse Position

If you are behind:
- Identify the opponent's best winning route.
- Spend moves removing the entry points of that route.
- Force them into single-line attacks.
- Trade activity for safety until no direct conversion remains.

Saving half-points (draws) improves long-term win rate over many games.

## 15-Minute Endgame Training Plan

1. Play one full game focused only on endgame checklist discipline.
2. Replay a previous loss from move 24 onward and find first tactical miss.
3. Play one game where your goal is "no immediate threat misses."

Track:
- Missed immediate wins
- Missed immediate blocks
- Games converted from winning positions
- Draws saved from worse positions

## Final Takeaway

To get stronger in Connect 4 endgames:
- Use a strict tactical checklist
- Build and maintain forcing lines
- Defend by priority, not emotion
- Preserve safe replies when under pressure

Endgame discipline turns unstable games into reliable results against both humans and AI.
    `
  },
  {
    title: 'DoStrike Portal Guide: Games, Difficulty Settings, and Where to Learn Next',
    excerpt: 'A clear tour of dostrike.com: which game fits your goal, how AI and difficulty options work, and the best articles to read first.',
    slug: 'dostrike-portal-player-guide',
    date: '2026-05-01',
    updated: '2026-11-05',
    readTime: '11 min read',
    category: 'Guides',
    content: `
## Pick a game for the break you have

DoStrike currently offers fourteen free browser games. You do not need an account to play. The homepage cards take you to a quick game or to the setup choices; the Guides page has game filters and a text search. Game records and optional preferences are stored on the browser you use, not in a shared account.

## Tic-Tac-Toe: a quick round with a useful review

Choose a computer level or two players on the same device. A match ends when one player wins two rounds; drawn rounds do not award a win. X starts each round in this version. A separate private-room mode lets you invite someone using a room code; it is not public matchmaking.

After a completed local or computer round, open its move review before moving on. The review reconstructs the actual positions and compares available moves against best possible replies. It is useful for locating a missed win, saving block or fork. It does not prove which move another person would have played.

Start with the consolidated Tic-Tac-Toe strategy guide. Its four playable boards teach this order: win now, block an immediate loss if you have no win, then evaluate forks and other replies. The AI explainer and draw-proof guide cover the underlying implementation separately.

## Connect 4: a different kind of threat

Choose a computer opponent or a local two-player match. Discs fall to the lowest empty point in a column, so an attractive empty square is not necessarily playable yet. Four connected discs horizontally, vertically or diagonally win a round.

Use the strategy blueprint for supported threats and the endgame guide for tight positions. In either case, check for your own immediate win before a defensive drop. A move that completes four ends the round, even when the opponent also had a threat.

## Memory: practise places as well as symbols

Pick a difficulty, reveal cards in pairs and find every match. The larger boards contain more pairs to remember. Keep a steady scan, and use a mismatch to record two locations rather than immediately guessing again.

The improvement guide introduces a repeatable scanning method; the same guide offers a small mistake ledger for reviewing your own attempts. Browser bests are personal records. A faster time or lower move count in one attempt is not evidence of a general improvement in memory.

## Gomoku: a bigger board and a saved round

Gomoku uses a 15 by 15 board. Black goes first and five or more connected stones win. Choose three heuristic computer levels, play either colour or share the device with a friend. Freestyle rules mean there are no forbidden double-threes or opening swaps.

Preview confirmation helps avoid accidental placements. Intersections stay large on a phone; scroll within the board to reach the edges. Arrow keys move between points, and Enter selects and confirms. Free undo and move suggestions are available during play. These are casual assisted games; records include that assistance.

An unfinished round can be continued from Gomoku setup when browser storage is available. Its guide works through open fours and forced blocks using the board’s coordinates. The computer is not claimed to play perfectly.

## Reversi: count the discs at the end

Start with four central discs and find an empty square that encloses a line of opposing discs. Every directly enclosed line flips. The game shows legal placements, previews flips, handles compulsory passes and keeps a readable move history. Choose a computer level or play locally with a friend.

The larger final count wins when neither colour can move, even if empty squares remain. An early lead is not permanent. Use the Reversi guide for worked legal-move and pass examples; the daily opening gives a different legal position after six placements.

## Mancala: count the last seed

Play Kalah with 3–6 seeds in each of six pits per side. Sow counter-clockwise, skip the other store and earn another turn by finishing in your own store. A last seed in your own empty pit captures only when the opposite pit contains seeds. The empty-side sweep ends the game and banks remaining pit seeds.

Preview a sow before committing. The phone layout turns vertically to keep pits large. A worker runs the computer and hints, and saved rounds can be continued. The daily is a symmetric 48-seed distribution; browser records include assisted games and all seed settings.

## Checkers: follow the complete capture

English draughts requires a capture when one is available. Choose any complete jump chain; it does not have to be the longest. Men move and capture forward, short kings can also go backward, and crowning ends the turn. A player with no legal move loses. This version automatically draws at threefold repetition or forty moves each without a capture or a man move.

Choose a computer level and colour, or share the board locally. Preview the complete route before confirming. The capture guide demonstrates promotion and alternative jumps; saved rounds, hints and assisted undo support a closer review.

## Sudoku: compare the candidates

Fill rows, columns and 3 by 3 boxes with digits 1–9. Every generated board is checked for a unique solution. Clue-density settings are disclosed as generation targets, rather than guaranteed human difficulty ratings. Pencil notes, keyboard entry and undo let you work at your own pace.

The guide distinguishes a cell with one candidate from a digit with only one place in a unit. Explained singles and explicit answer reveals are separate assisted tools. Daily boards use the Medium clue target; local solve records distinguish assistance.

## Minesweeper: establish the flags

Reveal every safe cell using the neighbouring mine counts. The opening area is safe, and default fields require a complete single-number/subset proof before receiving the no-guess label. Generation has a finite budget and may honestly report that no proven board was found.

Beginner, Intermediate, Expert and bounded Custom fields support flags, keyboard controls and scrolling. A chord trusts your flag count, so incorrect flags can lose. Guaranteed-safe reveals and one recovery are explicitly assisted. The guide works through that risk and an actual subset deduction.

## Slide Merge: make room for another pair

Slide a 4 by 4 number board with arrows, WASD, swipes or direction buttons. Equal tiles merge once per move. Changed boards receive a new tile; no-op directions do not. Reach 2048, then explicitly choose whether to continue. A full board can still move when neighbouring tiles match.

Undo restores the previous board, score and random stream, marks the round assisted and does not reroll a repeated move. Records retain the best score and tile reached earlier in the round. The guide gives concrete before-spawn rows so you can check a prediction without confusing the merge with the new tile.

## Colour Sort: predict the top run

Sort four-unit numbered colours into full single-colour tubes. Choose 3, 5 or 7 colours plus two empty tubes. These settings describe size, not a guaranteed human difficulty. Select source and destination, inspect the maximal-pour preview and confirm; arrows, Enter, Escape and pointer controls share the same actions.

Every generated starting board is checked against a full forward solution witness. Undo marks assistance. Path hints only work when your exact board matches that witness; after a deviation they can honestly be unavailable. Saved puzzles replay their moves, and local records separate assisted solves from unassisted bests. The guide demonstrates whole runs, capacity-limited transfers and illegal mismatches.

## Chess: read a legal reply

Choose either colour against a bounded computer opponent or play locally. Legal destinations and move previews support careful decisions; every promotion asks which piece you want. The game includes castling and en passant, complete move history, saved rounds and a date-seeded opening. Its casual automatic repetition and fifty-move draws are explained on setup rather than presented as tournament claim procedure.

## Sea Battle: learn from hidden information

Arrange five ships on a 10 by 10 ocean, then alternate single shots even after a hit. The attack map keeps unsunk enemy positions hidden, while your own ocean shows incoming fire. Computer choices use public shot information; local play uses deliberate handoff screens. Try the date-seeded opponent fleet or continue a saved battle.

## Dots and Boxes: consider who moves again

Choose 2, 3 or 4 boxes per side, a computer level or a local opponent. A starts; in computer play you may choose either side. One edge can close two boxes, and any capture retains the turn. More boxes wins, with equal totals drawing. The guide contrasts a tempting capture with an engine-checked handover.

Preview and confirm edges with pointer or keyboard, scroll internally on a phone, save a round and inspect edge history. Computer Undo returns to the previous human decision, including any intervening extra-turn sequence, and marks assistance. The daily has eight legal noncapturing edges on a three-box-per-side board, then continues against Hard as A. It has no unique prescribed answer.

## Daily formats, with different goals

The practice page has a daily Tic-Tac-Toe position with solver-checked saving or winning moves. Its progress and streak are local to your browser and local calendar date. It also links to the newer games’ daily formats. Checkers offers a legal opening, Sudoku a unique-solution board, Minesweeper a proven Intermediate field Slide Merge a shared initial board and random stream, and Colour Sort a verified five-colour tube puzzle. Their goals differ; none is a claim of parity with an unavailable phone-app source.

Gomoku’s daily starts with four placed stones and continues as a full game against Hard. It has no single prescribed answer. The website generates this opening; matching a phone app’s daily is not promised.

## Finding help and understanding storage

Rules, contact details and policies are linked in the footer. Use the contact page to report a problem, including the game and what you expected to happen. Do not send account passwords or private room conversations.

Records can disappear when browser storage is cleared, unavailable or used on another device. There is no cross-device progress sync. Optional ad requests remain disabled while advertising is being prepared; consult the current privacy and editorial disclosures for service details rather than assuming a permanent ad-free promise.
    `
  }
].map(article => {
  const revision = reviewedGuides[article.slug];
  const reviewed = { ...article, ...revision, ...(revision ? { updated: revision.updated || '2026-10-24' } : {}) };
  return { ...reviewed, readTime: `${Math.max(1, Math.ceil(reviewed.content.trim().split(/\s+/).length / 200))} min read` };
});

export const getArticleBySlug = (slug: string): Article | undefined => {
  return articles.find(article => article.slug === slug);
};
