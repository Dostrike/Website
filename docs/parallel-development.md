# Production and development workflow

Authorized November6,2026.

Production: `main` in `E:/Web App/dostirke-web`. Keep the existing fifteen games available. Publish justified tested bug fixes, accessibility improvements and useful corrections through the existing GitHub/Netlify flow. Preserve working records and unrelated work. No new-game imports, routes, cards or placeholders on main while review is pending.

Development: local `development/post-approval` in `E:/Web App/dostrike-next`. Implement the remaining eight games one complete, independently tested game at a time using current briefs and original web assets. Commit milestones locally. Do not push this branch remotely until Netlify branch-deployment behavior is verified safe; do not change hosting settings just to create activity. Never deploy frontend/branch work to Render.

Bring useful production fixes into development with an inspected merge of main; preserve new development work and resolve conflicts deliberately. Never merge development into main as a way to publish a production fix. If development produces a standalone fix useful to the existing live games, review and selectively port only that fix, with appropriate tests.

Actual AdSense approval is required before new games can reach production. Approval does not imply that unfinished or failing games should ship. Review each completed release for rules, licences, deterministic/replay behavior where applicable, original explanations, responsive controls, accessibility and compatibility with existing records. Run lint, build/static and relevant game checks, then publish a small tested release and verify live assets/routes. Keep pending work on development. No automatic bulk merge.

AdSense was submitted November6 and confirmed Getting ready / Review requested; do not resubmit pending review. Ads remain disabled until explicit approval plus consent/placement checks. Routine monitoring stays once per Sydney day and does not require disturbing development. Maintain dated progress in each worktree's documentation and the development backlog; report only actual completed results or material issues. Scheduling is execution-dependent, not nonstop operation.
