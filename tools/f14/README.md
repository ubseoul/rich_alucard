# F14-A — FCPB WHOLE-GAME QA HARNESS (infrastructure only)

Reusable automated QA infrastructure for eventual **FCPB convergence**. It reads the game, never edits it, and never
owns UX/UI — **Claude is the sole final UX/UI owner**. Missing fragment content is reported as `PENDING_FRAGMENT`, never
as a failure.

## Commands

```bash
# static validation + browser traversal against a built artifact
npm run build
node tools/f14/run.mjs --dist dist --out reports/f14

# a served deployment
node tools/f14/run.mjs --url https://example/ --out reports/f14

# only some routes, skip a triaged known issue, more/fewer simulated days, final-mode placeholders, leak range
node tools/f14/run.mjs --dist dist --only IF1.phone,F01 --exclude IF1.minigame.owambe_collection --days 28 --final --leak-range "$BASE..HEAD" --json

# prove the detector: copies dist, deletes an asset, injects a page error, expects a failure + bundle
node tools/f14/induce-failure.mjs --dist dist --out work/f14-induced
```

Exit codes: `0` PASS (or browser `SKIPPED` without `--require-browser`), `1` FAIL, `2` usage/environment.
Writes `report.json` (and `reports/f14/bundles/<route>.<viewport>.<fingerprint>.json`) to the output directory.

Playwright is discovered exactly like `tools/if1/browser-smoke.mjs` (`RA_PLAYWRIGHT_PATH`, then
`work/browser_deps/node_modules/playwright-core`, then `playwright-core`/`playwright`). If it is unavailable the browser
half is reported **SKIPPED** — never a silent pass. With `--require-browser` a skip is fatal.

## Route registry

Fragments submit meaningful browser success paths as `tools/f14/routes/<FRAGMENT>.json`. `tools/f14/routes/_expected.json`
declares the campaign routes the mission names (F01 SHOWDOWN, F02 ARMORY/RANGE DAY, F03 M9/M10, F04 WAR ROOM, F05 TRAP,
F06 RAINMAKER). A declaration is `PENDING_FRAGMENT` until the fragment file replaces the same `id` with `AUTHORIZED`
steps — a missing route is never a failure.

```json
{
  "id": "F01.showdown.success", "fragment": "F01", "title": "SHOWDOWN — success path",
  "kind": "success", "status": "AUTHORIZED", "flag": "F01.showdown",
  "steps": [
    {"action": "goto", "url": "/"},
    {"action": "eval", "script": "()=>{RAState.patch('life.world.day',12);}", "saveAs": "seed"},
    {"action": "click", "selector": "#checkPhone"},
    {"action": "waitFor", "expression": "()=>RAPhone.isOpen()", "timeout": 10000},
    {"action": "screenshot", "name": "showdown"}
  ],
  "assertions": [{"expression": "()=>RALife.flag('showdownWon')", "equals": true, "message": "SHOWDOWN resolved"}],
  "backout": {"steps": [{"action": "choice", "index": -1}], "assertions": [{"expression": "()=>RAScenes.current()==='bedroom'", "equals": true, "message": "clean return"}]}
}
```

Actions: `goto`, `reload`, `wait`, `waitFor`, `click`, `tap`, `choice`, `eval`, `record`, `snapshot`, `screenshot`,
`expect`. A route's `flag` is applied through the DEV URL session (`?dev=1&ff=…`) so it survives reloads. Kinds mapping
to checklist items: `mission`/`success`, `mechanic`, `failure`, `retreat`, and routes with `backout` feed the
retreat/backout item.

## Checklist statuses

`AUTOMATED` (the harness decides), `MANUAL` (human sign-off), `PENDING_FRAGMENT` (not merged — reported, not failed).
The FCPB Definition of Done is encoded in `tools/f14/checklist.mjs`:

| check | kind |
|---|---|
| authorized-missions, mechanics-reachable, authored-failures, retreat, browser-routes, feature-flag-matrix | AUTOMATED (routes / flags) |
| persistence, migration-reload, no-starvation | AUTOMATED (browser / headless) |
| asset-integrity, authored-audio, mobile-viewports, phone-placement-hook, leak-scan | AUTOMATED |
| placeholder-final-mode | AUTOMATED (advisory until `--final`) |
| no-p0-p1 | MANUAL |

## Reproduction bundles

Every failed run writes a compact, deterministic package: commit SHA, branch, release id, feature flags, seed, viewport,
current day/state, the save snapshot, console errors, page errors, network 404s, unhandled rejections, the failed
assertion, screenshots and the route/action history. `fingerprint` is stable across wall-clock differences. String
values are redacted against an optional private denylist (`--denylist`), the output is re-scanned, and a surviving
sealed hit aborts the write — **no SEALED text ever lands in a public artifact**, and a hit is reported by rule index
and JSON path only.

## Capability map

| # | Capability | Where |
|---|---|---|
| 1 | whole-game browser traversal | `browser.mjs`, `executor.mjs`, `routes/*.json` |
| 2 | save/reload checkpoints | `harness.mjs` (`persistenceSuite`) |
| 3 | mobile viewport matrix (360/390/430 + desktop) | `config.mjs`, `browser.mjs` (`viewportFindings`) |
| 4 | feature-flag matrix | `harness.mjs` (`flagMatrixSuite`) + `browser.mjs` (`?dev=1&ff=`) + route `flag` |
| 5 | persistence verification | `harness.mjs`, `collect.mjs` |
| 6 | console-error capture | `browser.mjs` listeners |
| 7 | missing-asset detection | `assets.mjs` |
| 8 | missing-audio detection | `audio.mjs` |
| 9 | dead-link / dead-phone-app detection | `collect.mjs` |
| 10 | progression softlock detection | `collect.mjs` (`detectSoftlock`) |
| 11 | duplicate-resolution detection | `collect.mjs` |
| 12 | backout/retry validation | `executor.mjs`, `collect.mjs` |
| 13 | SEALED leak scan integration | `harness.mjs` → `tools/leak-check.mjs` |
| 14 | screenshot capture | `browser.mjs` |
| 15 | deterministic reproduction bundles | `bundle.mjs` |

## Tests

`node tools/run-tests.mjs --fragment f14` (also runs inside `npm test`) covers deterministic reproduction, screenshot
generation, viewport switching, route registration, `PENDING_FRAGMENT` handling, save snapshot capture, failure bundle
generation, leak-check invocation, missing asset/audio reporting, and the executor.

## Single-owner surfaces

This tree adds only `tools/f14/**`, `tools/tests/f14/**` and its docs. It does **not** edit `js/**`, `index.html`,
`package.json` or any integration-owner-only surface. Wiring an `npm run qa:fcpb` script is left to the integration
owner.
