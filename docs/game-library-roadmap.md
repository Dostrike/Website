# Game library and content roadmap

Started 2026-11-03. User authorized expanding the library and consolidating overlapping guides following the Low value content rejection. This supersedes the earlier approval backlog that deferred all new games until approval.

## Outcome and boundaries

Build toward 20 additional, distinct games, released in small tested batches. This is a product roadmap, not an AdSense quota or approval guarantee. Keep the existing three games working. Ads remain disabled until the account explicitly shows approval and consent/placement checks are complete. Do not resubmit merely because a game count has been reached.

## First release

Pilot Gomoku using existing React, theme, navigation and accessibility conventions. Implement the supplied game specifications without claiming Android code parity. The supplied ZIP contains 12 design/planning documents and no engine code or assets. The user has no Android source and authorized original web implementations from the specifications. Exact app AI, RNG, content-bank or daily parity is therefore not a release promise. Gomoku uses the documented freestyle 15×15 rules. This supersedes the initial source-access dependency.

Implement a pure rules engine first (legal moves, wins, draws, restart), then the playable board, keyboard interaction, clear turn/result feedback and replay. Verify board size and rule variant from the supplied specifications. Add a useful rules/strategy page with worked board positions derived from the actual engine. Include complete local two-player and independently tested computer play; daily openings are website-generated and do not claim app parity. Publish when complete and tested, not as a placeholder.

## Proposed release order

These are sequencing candidates, not commitments to unverified app features. Revisit after the pilot and specification audit.

1. Gomoku, Reversi, Mancala, Checkers: finish one at a time; make variants explicit.
2. Sudoku, Minesweeper, Slide Merge, Colour Sort: deterministic puzzle rules, valid starting states and useful difficulty choices.
3. Dots and Boxes, Sea Battle, Chess: larger rules/AI/accessibility burden; reserve extra validation.
4. Block Fit, Bloom Match, Bubble Drift, Mahjong Tiles, Solitaire: inspect the supplied rules and verify any required assets first; verify solvability and touch controls where relevant.
5. Letter Lock, Word Shuffle, Word Search, Balloon Words: verify word-list licensing, suitability and generator quality before publication.

## Content consolidation

Original inventory: 21 guides; Gomoku added one. The targeted consolidation now retains 17 guides after retiring five overlapping entries. Preserve the three reviewed site-specific guides explaining the actual AI, exhaustive draw check and completed-round review.

First audit group: opening moves, never-lose advice, advanced tactics, pattern playbook and complete strategy guide. Compare actual content and preserve useful distinct material in one strong strategy destination before removing any page. Second group: the two teaching/education guides. Compare the two Memory guides for distinct practical exercises rather than merging by title alone.

For every retired URL: explicit permanent redirect, updated internal links and sitemap, no conflicting prerendered page, and live verification. Preserve useful search landing pages when they serve a distinct purpose. Check historical/factual claims against sources; remove unsupported filler rather than inflating word counts. Correct any current no-ad claims against actual disabled/enabled services, with truthful wording rather than a promise that ads will never appear.

## Shared experience

Reuse the current theme and components incrementally. Every game needs a discoverable entry, rules before play, clear controls, visible focus, keyboard/touch support, status announcements, restart and honest local-record behavior. Add shared components only when two implementations demonstrate the same need. Do not rebuild the site framework as a prerequisite.

## Release gate

- Rules tests cover wins, draws, illegal actions, boundaries and resets; puzzle tests cover generator validity where applicable.
- Lint, production build and static route verification pass.
- Browser check desktop and narrow mobile; complete a game, restart and use keyboard controls.
- Rules/learning content matches the implementation; canonical metadata, sitemap, links and redirects pass.
- Push tested changes through GitHub/Netlify and verify the published release. No backend deployment for frontend-only work.
- Log actual shipped evidence and remaining defects. Track search discovery with Search Console; do not claim engagement/revenue changes without measurements.

## AdSense checkpoint

Last confirmed November 3: Needs attention / Low value content; ads.txt Authorized. Reassess the finished pilot, consolidated content and subsequent releases against the stated rejection. Google controls approval. Review readiness depends on demonstrated usefulness and a complete site, not finishing all 20 titles.

## First release evidence — 2026-11-03

Gomoku is published at /gomoku-setup. Code release 866e845 plus trailing-slash correction f6805e5. Engine tests, existing game regressions, lint/build/static checks, mobile browser checks and a completed public keyboard game passed; live assets match the tested build and all 38 public pages pass HTTP checks. Save/continue, three heuristic levels, local two-player, free assistance, browser records, a website-generated daily opening and original worked guide are included. This completes the pilot, not the full 20-game objective. Next: guide consolidation and Reversi.

## Consolidation release evidence — 2026-11-03

Published df8a726: two rewritten strategy/teaching destinations with playable verified exercises; five retired URLs permanently redirect; all sitemap formats agree and exclude runtime/noindex routes. All 32 public-page checks and ten slash-variant redirect checks passed live; published assets match the tested build. Memory-guide overlap and remaining factual claims need separate review. Next game: Reversi, using docs/reversi-implementation-brief.md.

## Reversi release evidence — 2026-11-03

Published f4c8605 at /reversi-setup: complete independent 8×8 rules, compulsory passes, three bounded worker opponents, either colour/local two-player, preview/keyboard/hints/undo, move history, save/continue, casual records and a six-placement website daily. Original worked guide and navigation are published. Local complete games, 33 engine games with genuine passes, storage/reload regressions, lint/build and all 34 public-page live checks passed; production worker, save/reload and undo verified interactively. Gomoku reload restoration is corrected with existing records retained. Two additional games shipped; eighteen remain. Next: Mancala. Remaining content factual/overlap audits remain in the backlog.

## Mancala release evidence — 2026-11-04

Published 0c80795 at /mancala-setup/: independent 3–6 seed Kalah, captures/extra turns/sweeps, three cancellable worker opponents, either starting side/local play, preview/hints/undo, saved rounds, detailed local records and symmetric website daily. Original guide examples match engine fixtures. Twelve complete AI games, completed phone/local and desktop/computer browser rounds, date/storage tests, existing Gomoku/Reversi regressions, lint/build and all 36 live-page checks passed. Exact live assets, production worker/hint, save/reload and undo verified. Three additional games shipped; seventeen remain. Six games and nineteen guides total. Next: Checkers using docs/checkers-implementation-brief.md; broad content factual audits remain open.

## Checkers release evidence — 2026-11-04

Published c3983af at /checkers-setup/: independent English draughts with compulsory complete jump paths, short kings, promotion stop, blocked losses and explicit automatic draws; three cancellable worker opponents, either colour/local play, keyboard/touch controls, complete-route preview, hints/undo/history, save/continue, daily and browser records. Engine fixtures plus six complete AI/random games, complete local and daily computer browser games, storage/outcome tests, lint/build and all 38 live page checks passed. Production worker, rotated Light play, reload and undo verified. Four additional games shipped; sixteen remain. Seven games and twenty guides total. Next wave: Sudoku, Minesweeper, Slide Merge, Colour Sort. Define independently testable web specifications where Android-only source references are unavailable.

## Sudoku release evidence — 2026-11-04

Published bd7be3a at /sudoku-setup/: independently generated unique-solution classic boards, honest clue-density settings, cancellable worker, notes/keyboard/conflicts/undo, regenerated-identity saves, explained singles and separately labelled reveals, assisted/unassisted records and Medium daily.36 boards independently checked for uniqueness; session/outcome/guide fixtures, completed browser solve, phone checks, lint/build and all40 live pages passed. Production worker, notes/reload/undo and only-place hint verified. Five additions shipped; fifteen remain. Eight games and21 guides total. Next: Minesweeper using docs/minesweeper-implementation-brief.md, with bounded independently checked no-guess generation. Remaining broad factual/overlap audits stay open.
