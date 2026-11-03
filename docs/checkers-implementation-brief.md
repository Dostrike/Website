# Checkers implementation brief

Prepared 2026-11-04 from the user-supplied new-games.md specification after Mancala publication. Independent web implementation; Android code/assets are unavailable and exact app parity is not promised.

## Rules baseline

Primary source checked November 4: WCDF, Rules of Draughts (Checkers), sections 1.15–1.21 and 1.30–1.32, https://wcdf.net/rules/rules_of_checkers_english.pdf . Use English draughts on 8×8: twelve pieces per side, Dark moves first, men move/capture forward only, short kings move/capture both ways. Captures are compulsory globally. When alternatives exist, any complete capture path is legal; do not require the longest. Continue a jump chain with the same piece, but crowning a man ends its turn immediately. Do not allow a captured piece to be jumped twice. No legal moves loses, including blocked positions.

Draw policy must be explicit: automatically adjudicate the third occurrence of the same position with the same side to move, and 80 consecutive half-moves with neither capture nor a man move (40 moves by each side). This adapts referee-claim rules to a casual browser game; do not claim tournament administration parity. A man move resets this counter even without promotion. A terminal loss from no legal move takes priority. Validate before exposing a setup route.

## Supplied product requirements

- Computer Easy/Medium/Hard, choose Dark/Light with board oriented to human; same-device two-player. Nominal alpha-beta depths 2/4/7, material men100/kings160 plus position, Easy random legal move one-quarter of time. Fixed worker budgets, cancellation and honest fallback. Measure levels across paired reproducible games before making comparative strength claims; no guaranteed win or rating claim.
- Choose a movable piece, then destinations; show compulsory capture choices, full multi-jump path and distinguish kings by shape/label. Offer an accessible list of complete legal moves to disambiguate paths that share an endpoint. Keyboard board navigation and clear turn/capture/promotion/result announcements; touch targets and mobile containment.
- Free hints/undo while ads are disabled. Undo a complete human decision with later computer reply, never leave a partial jump. Save/replay validates entire capture paths, promotion and draw counters. Stable result IDs prevent duplicate records; per-difficulty outcome/streak/margin, local games, daily streak remain browser-only and include assistance.
- Deterministic website daily after eight complete legal moves, Dark to play against Hard. Validate nonterminal starts and enough pieces/mobility; generator can retry deterministically if a path ends early. Do not promise the app's board or a unique puzzle answer.
- Original worked guide grounded in engine fixtures: compulsory capture versus quiet move, branching chain, promotion ending a chain, blocked loss and 80-half-move draw. Setup/guide indexable, runtime noindex outside sitemap. Existing six games and records preserved.

## Release gate

Pure immutable engine fixtures first: standard seven opening moves, edges, backward-man rejection, king directions, global compulsory capture, optional unequal-length paths, complete-chain requirement, promotion stop, captured-piece tracking, blocked/captured loss, draw reset/repetition and legal replay. Complete random and AI games, daily generation, storage/cancellation and browser complete games. Lint/build/static checks; publish only complete UI and guide, then verify exact live assets, trailing slash setup, production worker, save/undo and responsive controls. No backend change or AdSense declaration is required.
