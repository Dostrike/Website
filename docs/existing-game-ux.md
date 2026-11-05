# Existing-game experience and AdSense readiness

Scope confirmed November5,2026: improve the existing15 games; no further game additions. Preserve the current visual identity, original rules, record keys and working saved games. Make changes because an observed problem warrants them, not to show activity.

## Experience standard

- Keep the shared cream/green palette, readable text, visible keyboard focus and clear primary/secondary actions. Use consistent navigation and spacing without forcing every board into the same geometry.
- Make setup, player/challenge choice, current turn or puzzle goal, preview/confirmation where supported, restart/Undo, assistance and local-record scope understandable. Keep implementation details out of the main player flow.
- Use44px navigation/control targets where practical, internal board scrolling when a useful board cannot fit, and no horizontal page overflow. This is our design target, not a claimed Google approval rule or universal accessibility certification.
- Preserve enough board space on phones: multi-row action panels must not float over the playing surface. Confirm pointer/keyboard actions after changing layout.
- Verify phone320px, tablet768px and desktop1280px painted layouts, then selected real interactions and live publication. These are browser viewport checks, not physical-device or every-browser certification. Assess landscape, zoom, larger boards and non-default settings separately.

## First measured pass — November5

Used the homepage's real Quick play action for all15 titles in an isolated localhost production preview. Some games continued existing synthetic saved rounds; this was an entry/layout audit, not15 newly completed games. Baseline and final measurements are under E:/Web App/review-evidence/device-ui-*-2026-11-05.json.

Observed shared header links around21–23px high and footer targets32px high. Shared phone action panels occupied108–231px and remained sticky, including setup controls using the same class. Updated header/lobby/footer/game-back targets to44px and returned phone action panels to normal document flow. Preserved the existing sticky turn-status treatment and every board's geometry/rules.

After the change,45 painted game-entry/viewport combinations have no horizontal page overflow relative to the actual document client width, no undersized targets in the measured shared navigation selectors, and no sticky board-game action panels. A real phone-sized Block Fit placement/confirmation/Undo restores the exact64 board labels; keyboard Tab reaches a44px navigation link with a3px focus outline. No observed console warnings/errors in that interaction. Initial measurements taken immediately after resizing briefly mixed old styles with the new viewport; painted-frame captures resolved those false overflow readings. Do not log them as persistent defects.

Published9796586 verified on Netlify November5 at7:46PM. Public main and all21 CSS files exactly match the tested build; all50 live pages/9 retired mappings pass. Real live320px header targets44px and ordinary-flow actions verified with client/scroll width305px. Proof E:/Web App/review-evidence/shared-ui-phone-live-2026-11-05.png. This completes the shared foundation pass, not the remaining per-game/deeper-state backlog below.

## Prioritized remaining work

1. Connect4 phone controls and pending-move repair completed November5:44px cells (formerly29px), contained labelled scrolling, numbered columns and visible keyboard selection. Position-change/Restart cancellation fixes an actually reproduced stale drop after Undo. Protected computer opening/paired Undo, first-to-two results, natural42-move draw/full columns and reduced-motion timing pass. Final d5af5a9 published at8:28PM in1m12s; exact live assets match. Actual live320px round, column7 keyboard reveal and drop/Undo restore all42 empty labels; page/client305px. Phone/tablet/desktop/landscape evidence is browser-based, not physical-touch/every-browser/zoom certification. Proof E:/Web App/review-evidence/connect4-phone-live-2026-11-05.jpg. Source details and regression fixture are logged in revenue-progress.md. Do not repeat this completed fix because older notes say pending.
2. Per-game visual/flow pass: start with the three older games, then compare the newer board/puzzle groups. Review status/action hierarchy, headings, readable help, confirmations, errors, focus order and restart/continue semantics. Preserve useful differences and checked mechanics; no speculative full redesign.
3. Extend responsive evidence to narrow landscape, browser zoom, larger/custom boards and active/result/error states. The45 entry checks do not establish all of these.
4. Homepage keyboard skip/navigation consistency and per-game navigation labels remain candidates to inspect. Do not call them remediated by the target-size change.
5. Review readiness after meaningful fixes: verify crawlable useful content, publisher information, actual links/games, no deceptive navigation and truthful records/feature claims. Use evidence, not a game/article/traffic quota. Request review only with explicit user authorization at action time.

## Actual AdSense checklist — November5

The signed-in site screen shows Needs attention / Low value content and ads.txt Authorized. Expanded ownership section shows the completed check. Opening the account activation checklist shows PAYMENTS: Your profile is complete; ADS: Ads settings confirmed; SITES: You need to fix some things. The generic add-payment/connect-site banner does not establish a missing payment profile. No payment details, legal terms, ad settings, fixed-issues declaration or review request changed. A complete profile is not a claim that every future identity/PIN/payment requirement has been satisfied. Retain the site-detail tab for the next required check.

Official guidance read November5: https://support.google.com/adsense/answer/10015918?hl=en emphasizes original useful content, clear accurate navigation and cross-browser presentation. https://support.google.com/adsense/answer/7402253?hl=en distinguishes account setup from later activation tasks. These support the quality work; they do not guarantee approval. Ads remain disabled until approval and consent/placement gates are explicitly verified. Screenshot E:/Web App/review-evidence/adsense-activation-checklist-2026-11-05.png records the actual checklist.
