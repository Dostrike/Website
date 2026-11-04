# Block Fit implementation brief

Prepared November 5, 2026 while the tested Chess release builds. Next original web implementation; no public placeholder or Android parity. Source specification reviewed directly in the user's ZIP, `untitled folder/new-games.md`, Block Fit section. It contains design guidance, not an engine or assets. Preserve existing games, browser keys and disabled ads.

## Explicit web rules

Use an8×8 board, three-piece tray and a fixed documented pool of normalized polyomino offsets, one to five cells. Shapes do not rotate or reflect during play. A piece's selected anchor is its top-left bounding-box cell. A legal placement stays inside the board and overlaps no occupied cell. Confirm the complete ghost before committing. Pieces may be used in any tray order; only after all three are used does a new tray arrive. Empty tray slots cannot be reused.

Compute every full row and full column on the board after placement, then clear their union simultaneously. A crossing cell clears once, although its row and column count as two lines. Do not clear rows first and accidentally erase evidence of a completed column. Proposed visible scoring: one point per placed cell, plus10×number of completed lines×combo. First clearing placement has combo1; subsequent consecutive clearing placements increment it up to5. A placement clearing no line resets combo to0. A multi-line clear earns its line count at the current combo, without inventing additional consecutive placements. Check worked score examples independently before publication.

Game over means none of the remaining tray pieces has any legal anchor. A failed preview is not game over. There is no winning target or forced score ceiling. Classic and Daily are score games, not certified-solvable puzzles.

## Resolve the specification's fairness/sequence tension

The ZIP asks both for a fixed daily sequence and for at least one fitting piece whenever any shape can fit. Do not silently generate different daily trays from different boards. Use an original, explicit generator convention: every tray contains one single-cell piece, plus two shapes from the documented pool; seeded slot order varies. Difficulty weights may depend on tray index, never score or board contents. The entire tray stream is therefore independent of player choices. A single-cell shape fits whenever any board cell is empty, which also covers every position where any pool shape could fit. This guarantees one initial usable tray piece, not that all three can be placed or that the game is always recoverable. After that anchor is used, the other two can still trap the player.

Test the guarantee over independent occupancy masks and confirm byte-identical daily trays across distinct boards, scores and attempt IDs at the same stream index. Version the generator and seed scheme before publication. Classic seed is chosen once per attempt; daily seed derives from the original local date. Restart reproduces its stream with a new attempt identity. Never change an old daily's date or promise an equal-condition leaderboard after allowing assistance.

## Helpers and honest records

All helpers are free and clearly labelled; no ad gate. Undo restores the exact board, tray-use bits, score/combo and generator index, including across replenishment, and marks assistance. One optional tray swap per attempt replaces only unused pieces using a separate deterministic helper stream and marks assistance; it must not secretly advance the normal sequence. Define whether partial tray slots remain used and show the exact replacement before confirmation. A once-per-attempt revive may clear a chosen clipped3×3 region only after game over, with preview, clear count and explicit confirmation; it marks assistance and does not award points for removed cells. If omitted from initial scope, do not advertise it.

Records distinguish mode, date and assistance. Show actual best score and completed attempts, not invented wins or streaks for an endless game. Finishing a run records once using recent attempt IDs; reload and helper previews do not complete it. Do not freeze a recoverable run before an available revive is explicitly accepted or declined. Keep date boundaries, restart identity and result dedupe testable.

## Engine, sessions and interaction

Start with pure geometry, placement, simultaneous clears, score, tray generator, fit search and terminal logic. Independently enumerate every anchor for every shape; use a separate row/column reference and exhaustive small-board analogue, plus randomized8×8 masks. Check duplicate/malformed/disconnected shape definitions, boundaries, overlap, all three slot orders, crossed clears, combo resets/cap and helper/generator restoration. Replay sessions from a seed and legal ordered actions; derived board/score/terminal fields have no authority. Validate actual calendar dates and original daily identity, malformed/blocked storage, bounded input sizes and navigation carry. Preserve legal play if persistence is unavailable.

Reuse the current theme. Own code-native blocks, with a pattern/shape marker in addition to colour. Select a tray piece, then a board anchor, inspect occupied cells and clearing rows/columns, then confirm. Keyboard arrows, Enter/Space/Escape and at least44px controls; phone scrolling stays inside the board. Pointer drag may supplement selection but must have the same deterministic preview/confirm path and an accessible alternative. No physical-touch claim without hardware evidence. Optional sound starts off and motion respects reduced-motion preferences. No copied product art, names, sounds or celebration.

An original guide should work through simultaneous row/column clearing, exact combo arithmetic and a piece-order counterexample with independently verified coordinates. Explain why the single-cell guarantee does not certify a whole tray solution. Add setup/rules, actual runtime, homepage, filters, help, practice/daily entry, source credit and metadata only when complete. Runtime stays noindex and excluded from sitemaps.

## Release gate

Independent engine/generator/session/score fixtures; actual browser natural game over, helper boundaries and dedupe, full keyboard/pointer play,320px containment, exact reload/Undo across replenishment and original daily sequence. Test any worker's real cancellation/stale replies if a bounded hint search is added; no unbounded solver or perfect-play claim. Lint, production build/prerender, static/guide checks, GitHub/Netlify publication, exact live assets and real trailing-slash interactive routes must pass before counting the next addition. No backend deployment or AdSense declaration. Further source research should address actual factual claims; generic genre inspiration is not permission to copy another product.
