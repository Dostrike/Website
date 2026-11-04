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
