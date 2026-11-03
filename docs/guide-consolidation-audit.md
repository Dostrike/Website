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
