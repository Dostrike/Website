# Connect 4 interaction regression fixture

Run `npm run dev -- --host 127.0.0.1`, choose **A friend** in `/connect4-setup`, then open `/scripts/fixtures/connect4-interaction.html` on that dev origin. This mounts the actual game under StrictMode; it is not imported by the production app or copied into the production build.

The visible timing selector forces a 450ms pending drop, an immediate drop, or the device preference. It does not modify OS settings. For the Undo regression, place columns 1 and 2, begin column 3 and Undo before 450ms. After the deadline only Red in column 1 must remain. For Restart, begin a drop and Restart before the deadline; the board must remain empty afterward. Also check both immediate and native timing. Timing measurements must show the action happened before the deadline; an instant native preference cannot prove delayed cancellation.

Use the normal game for complete rounds, full columns, computer replies, paired Undo, phone scrolling and keyboard selection. Keep these observations distinct from model tests and physical-device testing.
