# Game library and content roadmap

Started 2026-11-03. User authorized expanding the library and consolidating overlapping guides following the Low value content rejection. This supersedes the earlier approval backlog that deferred all new games until approval.

## Outcome and boundaries

Build toward 20 additional, distinct games, released in small tested batches. This is a product roadmap, not an AdSense quota or approval guarantee. Keep the existing three games working. Ads remain disabled until the account explicitly shows approval and consent/placement checks are complete. Do not resubmit merely because a game count has been reached.

## First release

Pilot Gomoku using existing React, theme, navigation and accessibility conventions. Implement the supplied game specifications without claiming Android code parity. The supplied ZIP contains 12 design/planning documents and no engine code or assets. The user has no Android source and authorized original web implementations from the specifications. Exact app AI, RNG, content-bank or daily parity is therefore not a release promise. Gomoku uses the documented freestyle 15×15 rules. This supersedes the initial source-access dependency.

Implement a pure rules engine first (legal moves, wins, draws, restart), then the playable board, keyboard interaction, clear turn/result feedback and replay. Verify board size and rule variant from source. Add a useful rules/strategy page with worked board positions derived from the actual engine. Start with complete local two-player play; only promise AI or daily parity after source inspection establishes a testable implementation scope. Publish when complete and tested, not as a placeholder.

## Proposed release order

These are sequencing candidates, not commitments to unverified app features. Revisit after the pilot and source audit.

1. Gomoku, Reversi, Mancala, Checkers: finish one at a time; make variants explicit.
2. Sudoku, Minesweeper, Slide Merge, Colour Sort: deterministic puzzle rules, valid starting states and useful difficulty choices.
3. Dots and Boxes, Sea Battle, Chess: larger rules/AI/accessibility burden; reserve extra validation.
4. Block Fit, Bloom Match, Bubble Drift, Mahjong Tiles, Solitaire: inspect actual app rules/assets first; verify solvability and touch controls where relevant.
5. Letter Lock, Word Shuffle, Word Search, Balloon Words: verify word-list licensing, suitability and generator quality before publication.

## Content consolidation

Current inventory: 21 guides. Preserve the three reviewed site-specific guides explaining the actual AI, exhaustive draw check and completed-round review.

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
