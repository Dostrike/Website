# Dots and Boxes web implementation brief

Started November 4, 2026, after the verified Colour Sort release. Original web implementation; no Android engine or asset parity is available. Preserve the eleven existing games and browser record keys. Ads stay disabled.

## Rules and representation

Primary rules checked November4: Cambridge NRICH, https://nrich.maths.org/games/put-yourself-box . Also read the original researcher's account at https://math.berkeley.edu/~berlek/cgt/dots.html for the extra-move implication; do not claim its advanced theory is implemented without tests.

Use rectangular arrays of horizontally/vertically adjacent dots. Each action draws one unused unit edge, never a diagonal or a jump. Closing a square claims it and keeps the mover's turn; a shared edge can close two squares and awards both, with one next action rather than banked turn credits. A non-capturing move changes sides. When every box is claimed, compare box counts; equal scores draw. Stop after the final edge.

Offer square boards of2×2,3×3 and4×4 **boxes** (3×3,4×4 and5×5 dots), distinguishing boxes from dots throughout the UI. Counts:12/24/40 edges and4/9/16 boxes. Player A starts. Computer or local two-player; human may choose either side. Separate horizontal and vertical edge coordinates or one stable indexed edge list with explicit endpoint labels. Keep box ownership, scores, turn, exact move history and terminal result consistent.

## Computer, undo and daily

Three honestly bounded levels: Easy legal seeded choice, Medium capture/safe-edge evaluation, Hard bounded extra-turn-aware search that can sometimes decline a small capture to preserve control. Define and test node/time limits and a legal fallback; do not call it perfect. Search evaluates actual turn retention rather than negating on every action. Move ordering and evaluation must be inspectable; avoid claiming all advanced chain theory is solved.

Computer and hint search run in a cancellable worker, with stale-result identity checks and a visible failure/retry path. Assistance flags survive save/reload. In local play Undo removes one edge; in computer play it returns to the previous human decision, handling a whole extra-turn computer capture sequence. Never let a still-running worker place a move into an undone/restarted round. Preview confirmation before committing is the default; cancel without consuming a turn.

The website daily is a reproducible3×3-box opening with eight legal non-capturing edges, no claimed boxes and A to move. Validate that generated prefix, then finish a full game against Hard as A. Do not claim a unique next answer or app parity. Saved rounds regenerate the initial identity and replay legal history, including extra turns. Completed results deduplicate by attempt ID, distinguish local/computer/assistance and size; daily wins only advance a browser streak on their original local date. Local results must not be reported as wins against the computer.

## Interface and explanation

Reuse BoardGame theme, readable score/turn/result, history, Save/Continue and direct runtime/noindex routes. Drawn edges show A/B ownership through labels and colour; claimed boxes have a visible letter. Empty edges need44px pointer targets without overlapping adjacent targets, keyboard arrow focus, Enter preview/confirmation and Escape cancel. Use a large-cell internally scrolling board on phones when needed; do not shrink targets to fit. Number rows/columns and announce endpoints, captures, kept turn and score. Respect reduced motion.

Original worked guide must demonstrate an immediate box, a shared edge closing two, why capturing keeps the turn and a concrete chain/control position checked against the actual engine/search. Clearly separate an available capture from a claim that greedy capture always wins. Cite rule sources concisely; own fixtures and analysis supply the original value.

## Required evidence before publication

Independent edge-to-box reference checks every edge subset on2×2 boxes, missing/duplicate/diagonal rejection, shared double capture, retained/switched turn, scoring, terminal draws/wins and immutability. Complete seeded games across sizes and opponents; compare small endgame search with separate exhaustive evaluation. Test both human sides, undo across computer extra turns, daily prefix, save identity, blocked/malformed storage, record/daily deduplication and stale worker cancellation.

Complete local and computer browser rounds, keyboard and narrow-screen controls, worker hints/cancel, restart/reload and final result records. Lint, production build/prerender, guide/static/sitemap checks; publish through GitHub/Netlify and compare exact live assets and real trailing-slash routes. No Render backend deploy. Count the ninth addition only after live verification.
