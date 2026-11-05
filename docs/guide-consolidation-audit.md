# Guide consolidation audit — 2026-11-03

Read the actual current article content, including runtime reviewed-guide overrides. This audit identifies a substantive correction, not just fewer URLs.

## Strategy group: consolidate into complete-tic-tac-toe-strategy-guide

Candidate retired URLs: tic-tac-toe-opening-moves, how-to-never-lose-tic-tac-toe, advanced-tactics-tic-tac-toe, tic-tac-toe-pattern-playbook. All repeat opening preferences, threat scanning, forks and review drills. Preserve those useful topics in one concrete worked guide.

Material correctness issue: several current articles tell players to block a loss before taking an immediate win. That priority is wrong when both exist: completing three ends the round before the opponent can reply. Replace it with win, block, then evaluate forks/defences. The existing verified practice first position demonstrates this directly.

Other corrections: opening equivalence under symmetry is overstated (centre, corner and edge are distinct symmetry classes); centre is a useful default, not the sole move preserving a draw. Avoid claims about rankings, clocks or visual assistance the website does not implement. Replace generic intimidation/psychological-pressure advice with board-based reasoning.

Keep separate reviewed AI implementation, exhaustive draw verification and actual-round review guides: they explain different working tools and are not interchangeable with a strategy tutorial. Preserve distinct history/variation content unless a separate factual audit justifies changes.

## Teaching group

teaching-kids-tic-tac-toe and tic-tac-toe-education-teaching-resource overlap in narrated threats, reasoning and reflection. Merge into one concrete teaching resource with timed optional activities and actual board examples. Do not claim measured cognitive/social benefits without evidence. Outcome-frequency activities must state the player policy/sample; raw game outcomes do not establish an unconditional probability of winning.

## Required implementation

Rewrite destinations before retiring sources. Move useful topics, add verified positions, remove unsupported filler and update editorial dates accurately. Add explicit permanent host redirects before the Netlify 404 fallback and matching client-side redirects for in-app navigation. Update all internal links, sitemap and prerender source so retired pages are not published as competing 200s. Verify live status/location and absence of redirect chains. Keep the original routes mapped so bookmarks continue working.

## Implementation — 2026-11-03

Rewrote both destinations and added playable solver-checked examples. Removed the five retired article entries, added explicit permanent Netlify redirects for slash/no-slash variants and matching client redirects, updated internal links and synchronized all sitemap formats. Also corrected the same immediate-win priority in Connect 4 guides and replaced stale portal guidance with actual game features. Preserve the three reviewed implementation/draw/replay guides. Local build/tests/browser checks pass; live publication evidence belongs in revenue-progress.md. A separate review of the two Memory guides and remaining history/factual claims remains open rather than assumed complete.

## Factual audit and second consolidation — 2026-11-04

Read the actual unreviewed history/famous/facts/psychology copy and the three runtime reviewed-guide overrides before editing. Concrete deficiencies: unsourced numeric psychology 'Research Finding' statements; unsupported business/brain-health transfer and age-band claims; generic historical/classroom stories; ancient-grid assertions without evidence of exact rules. The material duplicated useful topics already covered more concretely elsewhere.

- Retire psychology-tic-tac-toe-decision-making directly to the actual completed-round review at future-tic-tac-toe-ai-vr-innovation. Preserve neutral reflection as a specific prediction-before-analysis exercise; remove numerical/medical/transfer claims rather than inventing citations.
- Retire famous-tic-tac-toe-games directly to history-of-tic-tac-toe. Rewrite history around two inspectable Cambridge sources, making their retrospective/draft status clear. Sources checked November4: https://www.cl.cam.ac.uk/events/EDSAC99/simulators/india/examples.html and https://www.cl.cam.ac.uk/relics/chron.html . Do not claim exact OXO controls, ancient continuity or first-video-game status from these sources.
- Retire fun-facts-tic-tac-toe directly to the exhaustive draw/count guide. Preserve useful255,168-history statistic only with an executable enumeration:131,184 X wins,77,904 O wins,46,080 draws. Explain why histories differ from5,478 reachable boards/958 terminal boards, and why counts do not establish a player-policy win probability.
- All three destinations receive actual November4 revision dates. Extend reviewed-guide metadata to support explicit dates while preserving the original October24 dates for unchanged revisions. Keep existing November3 strategy/teaching dates.

Added slash/no-slash forced301s and client mappings preserving query/fragment. No redirect chains. Updated all sitemap formats and removed retired article entries. Local counts now19 guides/39 indexable pages,8 retired-guide redirects in both slash forms. Existing9 games unchanged. Solver/count/guide/static checks and browser redirect/source-link checks passed; live publication remains to verify. This targeted audit does not certify every remaining older article.

## Memory audit findings — 2026-11-04 (remediation not yet published)
Read both complete Memory guides and MemoryGame.tsx before deciding scope. The two guides repeat zoning/anchors/scan-order/mistake logs. Unsupported outcome claims include a noticeable week-long move/time improvement, fatigue thresholds for adults/children and broad verbal-memory benefits. Advanced drills also prescribe faster pacing without evidence and a symbol-only drill unsupported by the random whole-board UI.

Consolidate useful material into memory-game-improvement-guide: actual6/8/10-pair rules, one move per two-card attempt, fixed card coordinates after matched buttons disappear, timer beginning on first reveal and browser bests per level; a concrete known-pair versus unknown-card worked example; optional prediction/scan/mismatch ledger as experiments without promised outcomes. Distinguish tracking performance in this game from general memory improvement. Preserve the old advanced-drills URL with direct host/client redirects, update all aliases/internal links and verify before publication. No health or age prescriptions needed. Do not claim this audit already remediated the live pages.

## Variants audit findings — 2026-11-04 (not yet remediated)
Read current tic-tac-toe-variations after Colour Sort publication. Concrete errors: Ultimate destination described as controlled by a micro-board victory instead of the position of the last small-square move; Wild misleadingly described as imperfect information despite visible deterministic play, and its win condition is ambiguous.3D/large-grid descriptions omit concrete line definitions; unsupported tournament popularity/learning/visualisation claims add filler. Preserve distinct optional paper-variant value by rewriting exact rules and worked moves, clearly separated from the website’s actually implemented games; do not imply unsupported online variant modes.

Primary teaching account opened November4: https://mathwithbaddrawings.com/2013/06/16/ultimate-tic-tac-toe/ by Ben Orlin. It explicitly routes the opponent according to the last selected small square and discusses already-won and tied subboards. If using this account, state the chosen closed/tied-board convention, distinguish a house-rule adaptation, and limit source-derived text appropriately. A focused Berkeley search did not establish Wild rules; do not cite an unrelated GamesCrafters page as support. Remaining community/tournaments/Connect4 review is still open. No live article change claimed from this audit note.

## Variants correction verified — November5
Published dc7cb5b supersedes the earlier pending finding: explicit paper-only rules, corrected inner-square Ultimate routing, stated closed/neutral-tie convention and a clearly defined shared-symbol house game. Unsupported imperfect-information/popularity/learning claims removed. Independent geometric/position examples pass; exact live main/article/data assets and42 pages verified. No redirect or page-count change. Primary routing link confirmed publicly. Remaining community/tournaments and partial Connect4 work remains open.

## Community guide remediation prepared — November5
Actual source read: generic tournament/marketing/VR boilerplate offered no usable fixture or standings example. Distinct optional paper-event value is preserved in place with a concrete balanced four-person schedule, per-board scoring and legal outcome ledger, explicit house scope and absent site-feature disclosures. Clarified that the actual site uses first-to-two/draws-replay matches, whereas the optional event counts individual drawn boards and requires a separate ledger. No hosted event or guaranteed community/learning outcome claimed. verify-community-event.mjs parses source fixtures and score claims, checks12 legal boards/point conservation/start balance and rotation coverage for4/6/8. Browser CTA reaches actual local setup. Full publication/live proof pending; partial Connect4 factual audit is still open.

## Community remediation verified live — November5
Publishedbb1d2db supersedes that pending note. Exact live main/article/data assets match the build, all46 pages/9 retired mappings pass, and public browser verifies retained URL/dates, three rounds, six worked ledger entries, honest scope, local-setup CTA and executable verification link.320px page containment passes; proof E:/Web App/review-evidence/community-guide-live-2026-11-05.png. Guide count stays22. Partial Connect4 audit remains the open factual-review item; do not call every guide audited.

## Remaining Connect4 findings — November5 (not yet remediated)

Read both full current article entries, connect4-strategy-blueprint and connect4-endgame-guide, plus the actual game, board and statistics implementation. The November3 immediate-win priority correction is present in the defense subsection; preserve it. The strategy summary still inconsistently says to defend immediate losses first. Replace unsupported claims about beating most casual opponents or improving quickly with reproducible positions rather than promised outcomes.

The endgame guide says draws save half-points and improve long-term win rate. Actual website matches are first to two wins, draws award no win and replay, and browser win rate is wins divided by completed rounds. A draw is not half a match point or an automatic win-rate improvement. Advice to replay a previous loss from move24 must be an explicitly optional paper-transcript exercise: the actual Connect4 interface has transient in-round Undo, not a completed-round review/import tool. Distinguish a visible immediate threat from a mathematically forced loss; do not claim a proven losing position can be drawn under best play merely by defending once.

Preserve the two URLs only with distinct useful content: strategy should explain gravity, currently playable threats and win-before-block with reachable moves; endgames should use independently solved small remaining positions, precise optimal-play outcome definitions and actual match semantics. Vague parity slogans need concrete support/tempo conditions, not a universal shortcut. Do not infer learning/retention benefits without measurements or merge by title alone.

Primary classic rules read November5: https://www.hasbro.com/common/documents/dad2614d1c4311ddbd0b0800200c9a66/DE3C8F8050569047F5AA9FBB9F16909B.pdf . This supports alternating disc drops and horizontal/vertical/diagonal four-in-a-row, not the website's match scoring, statistics or AI strength. Any original geometry/solver claims must be independently computed and checked before publication. No content change or audit-closure claim at this checkpoint.
