# Reversi implementation brief

Prepared 2026-11-03 after the Gomoku and guide-consolidation releases. The supplied ZIP references Reversi but provides no engine, content bank or detailed per-game implementation. The user authorized original web implementations; do not claim Android parity.

## Rules baseline

Checked the [World Othello Federation rules](https://worldothello.org/about/about-othello/othello-rules/official-rules/english) on 2026-11-03. Use a standard 8×8 four-disc opening with Black first. A placement must enclose at least one contiguous opponent line, and every line enclosed by that placement flips. A player without a legal placement passes; a player with a legal placement cannot pass. End when neither colour can move, even if empty squares remain, and compare actual disc counts. Do not imply tournament clocks, affiliation or a branded Othello product.

## Delivery

- Pure independent rules engine with explicit pass handling, terminal counts, immutable moves and replay.
- Computer Easy/Medium/Hard, either colour, same-device two-player, reliable cancellation/reset/undo. Describe actual search limits rather than claiming perfect play or app difficulty parity.
- Consistent setup/play/result experience using current site styles; keyboard board navigation, legal-move and flip feedback, screen-reader announcements and large touch targets.
- Browser save/continue, casual records with assistance disclosed, and a reproducible website daily opening if it passes validity checks. No new server or account.
- Original worked strategy examples verified against the engine. Teach legal placement and compulsory passes before heuristic advice such as corner preference.
- Test all eight flip directions, boundaries, illegal moves, forced passes, early end, draws, replay, legal AI choices, complete games and reference opening/reply cases from the official rules. Browser-check a complete game and mobile layout, publish via GitHub/Netlify, verify actual live setup including trailing slash, and keep ads disabled.
