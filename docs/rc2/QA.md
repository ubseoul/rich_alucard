# RC2 Build 2 QA
Set `RA_PLAYWRIGHT_PATH` (playwright-core dir) and `RA_CHROMIUM_PATH` (chrome.exe), then:
- `node tools/rc2/fresh_path.mjs` — fresh save -> START -> intro -> throne fight -> bedroom (fails if the bedroom is never reached)
- `node tools/rc2/sweep.mjs 360,390,430` — title / bedroom / phone / purchase / adventure / combat / property / minigame -> `C:/ra/shots/sweep`
- `node tools/rc2/money_shots.mjs 390` — cash chip, bag + tag rip, bed items, result card, day summary
- `node tools/rc2/enemyfx_shots.mjs <out> [enemy,..]` — freeze-frames every enemy move's attack FX
- `node tools/rc2/audit_unfinished.mjs` / `analyze_all.mjs` — the data behind UNFINISHED_AUDIT.md
- `tools/tests/rc2/rc2_feel.test.mjs` runs inside `npm test`.
Set `window.RA_NO_HARD_PIXEL=true` before load to compare against the original (soft) art.
