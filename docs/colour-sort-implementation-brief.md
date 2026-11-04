# Colour Sort web implementation brief

Started 2026-11-04. Original web implementation; the uploaded planning ZIP does not supply an Android engine. Do not claim app rules, seeds or difficulty parity. Reuse the current DoStrike theme and accessible controls.

## Exact rules

- Tubes hold four units, ordered bottom to top. A move pours the maximum contiguous top run of one colour into a different tube that is empty or has that same top colour, limited by its free capacity. A full destination, empty source or different destination colour is illegal. A partial pour is allowed only when destination capacity limits it.
- Win when every nonempty tube is full and monochrome, with exactly four units of each colour conserved. Empty tubes are permitted. No timer, life system, purchase or ad gate.
- Use 3, 5 and 7 colours plus two empty tubes as honest size settings, not guaranteed human difficulty ratings. Distinct colours also have stable numbers/short labels; do not require colour perception alone.
- Select a source, then a destination; preview the exact pour before confirming. Keyboard tube buttons, explicit cancel, clear status and focus; touch targets at least44px with responsive wrapping. Free undo restores the previous board and marks the attempt assisted. Restart returns to its original board. Saved moves replay from regenerated identity; a solved round counts once. Browser-only records distinguish assisted/unassisted solves and puzzle sizes.

## Reproducible solvability

Generate from sorted full tubes using bounded seeded reverse operations. A reverse operation may put a top segment above a different colour, but accept it only when the actual forward maximal-pour engine can return exactly to its predecessor. Save those inverse forward moves in reverse order as a witness, and independently replay the full witness before exposing a puzzle. Reject a candidate if its board is already solved or the full witness fails. Avoid trivial exchanges/visited states where feasible and disclose a finite generation budget with an honest failure state.

This proves that a solution exists, not that the witness is shortest, that every move remains solvable or that a size is easy for a person. A website daily uses a date seed and fixed size. A hint may disclose the next witness move only while the player is on that known path, or use a bounded search that honestly reports no result. Do not present an arbitrary witness step as legal advice after the player deviates. Undo and any solution reveal mark assistance. Prefer a complete reliable core over an unverified hint feature.

## Release evidence

Independent legal-pour reference fixtures cover full/empty/mismatched tubes, maximal runs, capacity-limited pours, no-op rejection, immutability, conservation and solved criteria. Generate many seeds per size; a separate replay verifies each reverse certificate. Test session identity/history, undo/reset, record deduplication and daily boundaries. Complete keyboard and pointer/touch-control browser solves, save/reload, narrow layout and source/destination cancellation. Original guide must use actual fixture boards and explain why a locally legal pour can still obstruct a solution.

Lint/build/prerender/static pages, synchronized sitemaps, live asset verification and actual trailing-slash routes are release gates. Publish complete playable content only. Preserve the ten existing games and disabled ads. No Render deploy for frontend-only changes.

## Engine evidence — November4
The initial reverse random walk could trap too early and was replaced with verified three-step segment exchanges. Each macro parks a top segment, exchanges an equal segment and refills the parked colour, checking each forward inverse. Every exposed board has all full colour tubes mixed and retains two empties.180 sampled seeds pass independent full certificate replay and961 reference pour fixtures; no human-difficulty or optimal-length claim. Session/hint tests pass regenerated identity, exact undo, malformed saves and off-path hint refusal. UI/records/release checks remain outstanding.
