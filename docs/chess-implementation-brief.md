# Chess implementation brief

Prepared November 5, 2026, while verifying the Sea Battle publication. Next complete roadmap game, not a public placeholder. Preserve the thirteen-game release and all record keys. Ads remain disabled. No Android source or parity is available.

## Evidence and dependency choice

Primary rules: https://handbook.fide.com/chapter/e012023 . Web extraction timed out; a bounded direct download succeeded at E:/Web App/review-evidence/chess-fide-source-2026-11-05.html. Relevant rule/glossary text was checked: threefold repetition and fifty-move draws are claim-based under tournament rules; fivefold repetition and seventy-five moves are automatic, with checkmate taking precedence. This distinction must not disappear behind a library's game-over helper.

Use a maintained legal-move library rather than rushing a new special-move engine. Official https://jhlywa.github.io/chess.js/ documentation and https://github.com/jhlywa/chess.js/blob/master/LICENSE checked November5; npm registry reports chess.js1.4.0, BSD-2-Clause, integrity sha512-BBJgrrtKQOzFLonR0l+k64A98NLemPwNsCskwb+29bRwobUa4iTm51E1kwGPbWXAcfdDa18nad6vpPPKPWarqw== . This is BSD-2-Clause, not MIT. Pin the reviewed version, retain the required notices/disclaimer in distributed materials, and inspect the actual installed source/tests before integrating it. No dependency has been installed by this brief. Do not force unrelated upgrades or deploy a frontend dependency change to Render.

The library supplies move legality, not an opponent or UI. DoStrike authors the wrapper, AI, sessions, interactions and worked guide, and credits the dependency honestly. Never call the entire rules engine independently authored by DoStrike. Documentation describes automatic game-over helpers for repetition/material/fifty-move cases; verify exact behavior in the pinned source before using them.

## Explicit casual web rules

Untimed standard starting arrangement, White first; computer or local two-player, human may choose either colour. Include legal castling, en passant, all four promotion choices, check, checkmate and stalemate. No king capture. No Chess960, online matchmaking, ratings, opening database, clock or tournament-arbiter claim in this release.

Choose and visibly explain casual automatic draws at threefold repetition, fifty moves by each side without a pawn move or capture, stalemate and the library's recognized insufficient-material cases. This deliberately ends some games earlier than FIDE tournament procedure; do not describe those early automatic draws as the FIDE claim process. Preserve checkmate precedence. Do not claim a general solution to every possible dead position from a material-count helper. Verify pawn/capture clock resets and repetition identity including castling/en-passant rights. No arbitrary move-limit result masquerading as a chess rule.

## Engine adapter and search

Store initial identity plus the complete legal from/to/promotion transcript. Rebuild legality, clocks, repetition, SAN and results from replay. A FEN alone is insufficient to recover repetition history. Imported arbitrary FEN/PGN is optional future scope; do not introduce it before normal save validation works. Saves reject malformed settings/dates/identities, illegal moves and moves after completion. Completed results freeze Undo; restart needs a new attempt ID.

Original bounded computer: Easy seeded legal choice; Medium shallow material/position search; Hard iterative alpha-beta with finite node/time limits and legal fallback. No Elo, perfect-play or Stockfish equivalence claim. Use actual side-to-move, terminal mate/stalemate/draw before static evaluation, and all legal evasions when in check. If adding quiescence, never stand pat while in check. Avoid transposition reuse that ignores repetition history or halfmove-clock state; omitting the cache is safer than incorrect draw values. Do not copy copyrighted evaluation tables or assets. Worker receives replayable full position/history; every stop/undo/restart/navigation invalidates request ID and terminates stale work.

Computer Undo returns before the latest human move, removing any computer answer. No initial-computer-only Undo before the human acts. Hint/Undo mark sticky assistance. Records distinguish colour, level, local White/Black results and assisted/unassisted wins; recent-ID completion dedupe and storage failure messaging follow the existing games. A daily may choose a validated legal website-generated opening prefix and fixed opponent/side; it is a full game, not a unique-answer puzzle or promised balanced position. Regenerate the exact opening/date and preserve its Undo floor and original-date streak semantics.

## Interaction and original learning value

Reuse the theme and compact play hierarchy. Show coordinates, turn, check/result, last move and SAN history. Choosing a piece shows legal destinations; preview and explicit confirmation precede moving. Promotion presents Queen/Rook/Bishop/Knight choices before commitment, with cancel returning to the untouched position. Never silently auto-queen. Keyboard arrows/Enter/Space/Escape, readable piece-and-square labels, colour-independent markers and44px targets. Rotate the board for human Black while retaining true algebraic labels; phone boards scroll internally rather than shrinking targets. Own SVG/code-native or properly licensed pieces with visible side distinction.

Original guide must demonstrate concrete engine-verified check-versus-mate/stalemate, castling restrictions, a pinned en-passant rejection and promotion choice. Explain the actual casual draw convention and bounded AI. Prefer one useful worked destination over extra thin articles. Setup/guide indexable, runtime noindex/excluded; navigation/metadata/sitemap aliases and actual direct trailing-slash runtime must work.

## Validation and release gate

Before UI publication, check pinned library integrity/licence and adapter fixtures against primary rules and independent reference positions/counts. Verify known perft vectors from the upstream test sources before asserting exact golden values; do not invent counts or merely compare the adapter to itself. Cover castling rights lost after king/rook move or rook capture, attacked transit squares, pinned en passant, all underpromotions, checkmate/stalemate, material cases and exact repetition/clock boundaries. Test undo/replay restores rights and history. Full computer games must genuinely terminate; a test ceiling may report unfinished games but must not manufacture a draw.

Complete browser games in local and computer modes/both colours, real worker cancel/retry/stale safety, promotion cancellation, keyboard/pointer,320px containment, reload/Undo/records/daily and blocked storage paths. Lint/build/prerender/static/guide/live checks and exact deployed assets precede counting the eleventh addition. No public card, title or readiness claim until it is a complete tested release. Remaining community/tournament and partial Connect4 content audits remain separate work.
