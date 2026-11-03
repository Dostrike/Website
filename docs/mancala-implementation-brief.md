# Mancala implementation brief

Prepared 2026-11-03 after Reversi publication. Source: the user-provided ZIP, new-games.md / Mancala section. No Android code is available; implement original web rules and opponents without app-parity claims.

## Supplied requirements

- Kalah: six pits per side, selectable 3–6 initial seeds per pit and a store at each player's right. Sow counter-clockwise, skipping the other store. Ending in your store gives another turn. Ending in your own empty pit can capture it and the opposite pit; when either side empties, bank the remaining seeds and compare stores.
- Computer Easy/Medium/Hard, play first or second, and same-device two-player.
- Supplied AI design: alpha-beta with nominal 1/4/8-ply levels; extra turns do not consume a ply. Easy sometimes chooses a random legal pit. Verify search budgets/performance and measure actual strength before making superiority claims; do not claim operation-for-operation app AI parity.
- Wooden board, pebble/count feedback, large interactive pits. Portrait layout turns the board so the player's pits remain large and the player's store is at the bottom; wide layout uses a horizontal board.
- Free undo and hint while web ads are disabled. Local records, including outcome/streak/margin and two-player count, should be honest about assisted games and browser-only persistence.
- Website daily: 48 seeds with the same uneven allocation on both sides, human first against Hard. Validate legal nonterminal starts, total seeds and reproducibility. Do not call it a unique-answer puzzle or promise the app's exact generated board.
- Accessible labels include side, pit number and count. Keyboard controls, visible focus, turn/extra-turn/capture announcements, restart/undo cleanup and saved-game restoration.

## Clarify in implementation

Explicitly document the chosen capture rule when the opposite pit is empty; verify a primary rule source rather than hiding a variant difference. Use real playable fixtures for capture, extra turns, skipping the opposite store, multiple laps, empty-side sweep, draw, terminal actions and seed conservation. Undo must restore actual prior human decisions despite extra turns, not assume alternating placements. A bounded worker can keep deeper search cancellable, following Reversi's successful pattern. Reuse BoardGame.css/localGameRecords where appropriate while preserving existing games.

Publish only with engine and relevant regression checks, desktop/phone complete-game tests, correct metadata/sitemaps, live slash-route/worker verification and ads disabled. The twenty-game roadmap is a product target, not an AdSense approval threshold.

## Rules decision and validation — 2026-11-03

Implemented the non-empty-opposite capture variant. Primary rules source checked November 3: Pekař et al., *Review of Kalah Game Research and the Proposition of a Novel Heuristic–Deterministic Algorithm Compared to Tree-Search Solutions and Human Decision-Making* (2020), section 3.1, author university copy: https://publikace.k.utb.cz/bitstream/handle/10563/1009973/Fulltext_1009973.pdf?sequence=1 . This explicitly distinguishes empty capture. The playable rules and guide state the choice.

All three original worked guide examples are covered by engine fixtures: four-seed pit-3 extra turn, six-seed capture versus no-empty capture, and terminal sweep overriding another turn. Twelve full AI games exercise captures, extra turns and conservation; 64 generated daily openings are symmetric and total 48. AI levels are bounded search choices, not calibrated ratings or perfect-play claims. Opponents and hints use cancellable workers; the independent progress reducer handles date boundaries, duplicate result IDs and blocked storage.
