# Game library and content roadmap

Started 2026-11-03. User authorized expanding the library and consolidating overlapping guides following the Low value content rejection. This supersedes the earlier approval backlog that deferred all new games until approval.

## Current scope override — 2026-11-06: isolated development reopened

The user authorized regular tested bug fixes, accessibility improvements and useful content corrections on the live site, and reopened new-game work on a separate development branch while AdSense review is pending. Production remains fifteen games. Build the eight remaining roadmap additions only in local branch `development/post-approval`, separate worktree `E:/Web App/dostrike-next`. Do not add their routes/cards/content to production main or merge them while review is pending. Main's E:/Web App/dostirke-web stays dedicated to tested existing-site fixes and monitoring.

Develop complete tested releases on the branch, starting with Bloom Match using its existing brief, then Bubble Drift, Mahjong Tiles, Solitaire, Letter Lock, Word Shuffle, Word Search and Balloon Words. Verify word-list licences before word games. Approval is a release gate, not proof that all accumulated work is ready: merge only completed independently checked releases after actual AdSense approval, compatibility/mobile/accessibility review and live verification. Ads have their separate approval/consent/placement gate. No automatic bulk merge or new-game quantity promise.

The development branch stays local for now, matching the request to publish after approval and avoiding unknown hosting branch-preview behavior. Before any remote feature push, verify that it cannot alter production or create an unintended public deployment. Keep changes committed locally; do not confuse local branch commits with publication. See docs/parallel-development.md. This supersedes the November5 stop only for isolated development; live expansion remains closed pending verified approval.

## Historical scope override — 2026-11-05

The user instructed: complete the work underway and stop adding more games. The expansion is now closed at15 playable games (twelve additions completed). The remaining eight proposed additions, including Bloom Match, are deferred indefinitely and must not start without a new explicit user request. Existing briefs are historical planning material, not authorization to continue expansion. Finish the underway Connect4 guide corrections and publication checks, then focus authorized maintenance and AdSense readiness on the existing site. This instruction supersedes all older next-game and twenty-addition sequencing notes below. It does not pause daily monitoring or justified improvements to existing games/content.

Connect4 corrections are now complete in8aafa7c. The user subsequently prioritized making the existing games better and visually consistent across devices while working on AdSense verification. Current measured work, acceptance criteria and remaining per-game/device checks are in docs/existing-game-ux.md. Do not revive the old expansion sequence.

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

## Minesweeper release evidence — 2026-11-04

Published5bbe8aa at /minesweeper-setup/: own first-area-safe generator, certified no-guess single/subset solver, bounded cancellable worker, presets/custom, keyboard/flag/chord, scroll/cell sizes, saved rounds, explicit assisted safe reveal/one recovery, deferred loss finalization and daily records.24 independently checked certificates, guide/session fixtures, completed Beginner/daily/assisted browser games, losses/recovery, mobile checks, lint/build and all42 live pages passed. Production proof worker/daily/reload/helper verified. Six additions shipped; fourteen remain. Nine games and22 guides total. Before the next game, remediate unsupported claims found in older psychology/history/facts articles. Keep the overall goal active.

## Second consolidation release evidence — 2026-11-04

Published b412acb: removed unsupported psychology claims, consolidated famous/facts entries into sourced history and reproducible mathematical material, and preserved reflection as an actual replay exercise. Added explicit revision dates, primary-source links and executable255,168-history enumeration.8 retired URLs redirect directly in both slash forms. All39 live pages and aliases pass; published assets match; public redirects/source links/sections and query/fragment preservation verified.9 games remain unchanged;19 guides retained. This is targeted remediation, not a claim that every remaining article has passed a factual audit. Keep the overall goal active and continue Slide Merge.

## Slide Merge and Memory remediation — 2026-11-04
Published bec7d95 adds Slide Merge, followed by fa36ad8 Memory consolidation and metadata correction. Exact final live assets,40 public pages and9 direct retired mappings verified. Slide Merge independent625-row/32-full-game tests, session records, completed browser round, keyboard/pointer/mobile/save/undo/daily checks passed. Memory guides now form one actual-rules/location exercise and ledger; unsupported outcome/fatigue claims removed with advanced-drills permanently redirected. Ten games/19 guides remain. Seven additions complete; thirteen remain. Next Colour Sort using docs/colour-sort-implementation-brief.md; remaining variations/community/Connect4 factual audits open. Goal active, hourly fallback; no claim of uninterrupted execution or AdSense approval.

## Colour Sort release evidence — 2026-11-04
Published79f24c4: independent maximal-run tube puzzles, verified reverse certificates, numbered3/5/7-colour boards and two empties, cancellable worker, preview/confirmation, keyboard/pointer controls, exact undo/save/restart, honest on-path hints, size/assistance records and5-colour daily.961 independent pour cases,180 seeded puzzles/2091 reference witness moves, session/record/guide tests and complete browser solves across all sizes passed. Mobile320px containment and fresh direct-route startup verified. Exact live main/game/worker/guide assets and42 public pages/9 direct mappings pass. Eleven total games/20 guides, eight additions complete/twelve remain. Source/app parity unclaimed; ads disabled. Goal active; next targeted variants-guide correction, then Dots and Boxes.

## Dots and Boxes release evidence — 2026-11-05
Published02e480c at /dots-and-boxes-setup/: independent2/3/4-box boards, exact extra turns/double captures, local and three bounded computer levels, both human sides, cancellable worker, preview/keyboard/pointer controls, paired Undo, replayed saves, honest records and eight-edge daily.4096 edge subsets/24576 independent move cases,120 reference games,24 exhaustive small endings,120 session rounds/186 paired undos and actual browser complete games passed.320px internal scrolling keeps all targets at least44px without overlap. Original worked guide covers tested single/double captures and a specific capture-declining control position. Final lint/build/static and all44 live pages/9 redirect mappings pass; exact deployed assets and production worker/hint/reload/Undo verified.12 games/21 guides, nine additions complete/eleven remain. Variants correctiondc7cb5b is also published. Next Sea Battle, then Chess; remaining factual audits stay open. Ads disabled; no Render deployment or review declaration.

## Sea Battle implementation checkpoint — 2026-11-05 (not public)
Original brief, fleet/shot engine, public-information-only bounded opponents, replayed sessions, paired Undo, records/daily and worker protocol are implemented and independently checked.2562 geometry cases/10000 partial-fleet pairs/500 generated fleets,90 complete reference games and48 session rounds pass; both winners,18 hidden-layout-invariant prefixes,1440 paired undos and actual daily boundaries covered. Official source download recovered; explicit web rule differences documented. No public card/route yet and no tenth shipped addition counted. Next accessible placement/attack/ocean UI, real worker lifecycle/privacy handoffs, original worked guide and full tested publication. Existing12 games remain published; see docs/sea-battle-implementation-brief.md and revenue log for evidence and limits.

## Sea Battle release evidence — 2026-11-05
Published037a714 plus bundled-width correction8290d43 at /sea-battle-setup/: five-ship hidden fleets, manual/auto placement, alternating shots, public-only three-level computer, local private handoffs, cancellable hints/worker, paired Undo, replayed saves/records and date-seeded daily. Complete browser local/Easy-as-B/Hard-daily-as-A battles, worker cancel/stale/retry, exact reload/Undo and native pointer on320px internally scrolled44px targets pass. Original checked coordinate/sinking/touching/density guide, navigation and accurate card-derived homepage count included. Final lint/build/static/guide and46 live pages/9 mappings pass; exact live assets, production worker/hint/save/Undo and both full514px desktop frames verified.13 games/22 guides; ten additions complete/ten remain. Next Chess using docs/chess-implementation-brief.md, including explicit casual draw rules and review of BSD-2-Clause chess.js1.4.0 before adding it. Ads disabled; no review declaration or Render action.

## Chess release evidence — 2026-11-05
Published8798e90 at /chess-setup/: credited pinned chess.js1.4.0 legal moves with original adapter/bounded opponents/sessions/UI, both colours and local play, explicit promotion/cancel, castling/en passant, full-history saves/repetition, clear casual automatic-draw policy, cancellable worker/hints, paired Undo, records and six-ply daily. Existing independent perft/rule/session fixtures pass; actual local mate/repetition, every promotion/both colours, assisted Easy computer checkmates as Black94plies and White45plies, worker cancellation/stale/Undo, keyboard/native pointer/320px52px targets pass. Production daily/worker/save/paired Undo and exact live main/game/worker/guide assets verified. All48 public pages/9 mappings pass;23 guides/14 games, eleven additions complete/nine remain. Screenshot in revenue log. Next Block Fit using docs/block-fit-implementation-brief.md and the actual uploaded specification; no placeholder. Partial Connect4 audit remains open; community remediationbb1d2db is already published. Ads disabled; no account declaration or backend deploy.

## Block Fit release evidence — 2026-11-05
Published98fe15c at /block-fit-setup/: original20-shape8×8 rules, simultaneous clears/exact combos, fixed daily streams, accessible preview/confirm, saved runs/Undo, free once-per-attempt assisted swap/revive, explicit natural-finish decision and clean/assisted scores. Independent geometry/subset/reference games/session/records fixtures pass; actual clean Classic50/assisted Daily64 and production clean Classic44 completed naturally, helpers/finish/dedupe/exact reload/refill Undo/native pointer/320px44px targets verified. Original worked guide has a tested reachable square/elbow counterexample and matching read-only diagram. All50 public pages/9 mappings pass; live game/main/article/data bytes exactly match build and real published daily/save/Undo/navigation work. Screenshot in revenue log.15 games/24 guides, twelve additions complete/eight remain. Ads disabled; no account/backend changes. Next address evidenced partial Connect4 and targeted advisory findings, then Bloom Match using docs/bloom-match-implementation-brief.md; no placeholder or app parity/calibration claim.

## Chess model checkpoint — 2026-11-05 (not a public game)
Pinned/credited BSD-2-Clause chess.js1.4.0; original adapter/AI/session/records/daily/worker protocol implemented.7 upstream perft vectors/936492 leaves,341 independent king-safety cases, all special-move/draw fixtures,60 daily prefixes and3 naturally completed bounded self-play games pass.43 session rounds/228 exact saves/130 paired Undos and actual legal daily/records/storage/protocol boundaries pass. No component/card/route yet; browser lifecycle and full release gates remain. Do not count the eleventh addition or claim the third-party move generator was authored by DoStrike. Next component/promotion/rotated controls/worker integration and worked guide. Community guide rewrite separately prepared; partial Connect4 audit remains open. Overall scope unfinished, ads disabled.

Community rewrite is now published and verified inbb1d2db: explicit four-person house schedule, checked per-board scoring, shared ties, honest site limitations and actual local-setup CTA. All46 live pages/9 mappings and exact assets pass; dates and320px containment verified. No new game or page-count increment. Continue Chess UI from its tested models; partial Connect4 factual audit remains open.
