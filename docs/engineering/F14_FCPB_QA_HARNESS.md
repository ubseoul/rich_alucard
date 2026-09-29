# F14-A — FCPB WHOLE-GAME QA HARNESS (engineering record)

Fragment `UBE_PORTAL_F14_FCPB_QA_HARNESS` · branch `frag/f14-fcpb-qa-harness/001` ·
base `integration/ube-portal` / IF-1 v1.0 `101a394b5fa9c41ec089bc7022ee86ff43f5f31c` (tag `if1-v1.0`).

**Infrastructure only.** It integrates no unfinished fragment, changes no gameplay, invents no content, and owns no
UX/UI (Claude is the sole final UX/UI owner). Missing fragment content is `PENDING_FRAGMENT`, never a failure.

## 1. Scope

A reusable, deterministic harness that is ready to consume the completed game at FCPB. It reads a built `dist/` or a
served URL, runs the route registry in a real browser, performs static asset/audio/leak validation, tortures
save/reload and migration, checks progression starvation, sweeps the mobile viewport matrix and the phone-placement
hook, and writes a compact reproduction bundle for every failure.

## 2. Architecture

```
tools/f14/
  config.mjs       statuses (AUTOMATED/MANUAL/PENDING_FRAGMENT), viewport matrix, placeholder sentinels, hashing
  routes.mjs       route registry loader + schema validation + PENDING_FRAGMENT resolution
  routes/_expected.json  declared campaign routes (F01–F06) — all PENDING_FRAGMENT
  routes/IF1.json  accepted baseline browser success paths (runnable now)
  assets.mjs       referenced-file existence, image/audio magic-byte decode, placeholder markers, duplicate ids
  audio.mjs        RA audio manifest + RAArtRegistry availability (registered vs declared-pending)
  collect.mjs      pure detectors: invariants, duplicate resolution, softlock, dead apps/links, backout, retry
  placements.json  phone placement validation hook declarations (baseline installed; fragment ones pending)
  placements.mjs   phone placement hook loader
  executor.mjs     declarative route interpreter over a tiny page adapter
  browser.mjs      playwright-core discovery/serve, page capture, layout + phone placement evaluation
  bundle.mjs       deterministic reproduction bundles + sealed-leak write guard
  checklist.mjs    the FCPB Definition of Done as machine-readable checks
  harness.mjs      orchestrator (static + browser + checklist + bundles)
  run.mjs          CLI
  induce-failure.mjs  self-proof: copy dist, break an asset + inject a page error, expect detection + bundle
tools/tests/f14/   harness self-tests (auto-discovered by tools/run-tests.mjs)
```

No integration-owner-only surface is touched (`js/**`, `index.html`, `package.json`, `tools/leak-check.mjs`, …). Only
`tools/f14/**`, `tools/tests/f14/**` and this document are added.

## 3. Browser stack

The existing stack: `playwright-core`, discovered exactly like `tools/if1/browser-smoke.mjs`, plus the gitignored
`work/browser_deps/` local install. No new framework. When Playwright is unavailable the browser half reports
**SKIPPED** (never a false PASS); `--require-browser` makes a skip fatal. Captured per page: console errors, page
errors, network 404s / request failures, and `unhandledrejection` (via an init script).

## 4. Route registry

`tools/f14/routes/<FRAGMENT>.json` is discovered automatically. `_expected.json` declares the campaign routes the
mission names (F01 SHOWDOWN success/failure/retreat, F02 ARMORY + RANGE DAY, F03 M9/M10, F04 WAR ROOM, F05 TRAP,
F06 RAINMAKER). Each stays `PENDING_FRAGMENT` until the fragment submits executable `steps` under the same id; a
missing route is reported, counted as pending, and **never counted as a failure**. Accepted IF-1 baseline routes live in
`IF1.json` (boot, start-life, phone, prologue, and one route per minigame).

## 5. Checklist

`AUTOMATED` / `MANUAL` / `PENDING_FRAGMENT` are distinct. The encoded FCPB DoD: authorized missions reachable,
mechanics reachable, authored failures, retreat/backout, persistence, browser routes, migration/reload, no starvation,
asset integrity, authored audio availability, mobile 360/390/430 + desktop sanity, phone placement hook, OPEN/SEALED
leak scan, placeholders (advisory until `--final`), and no P0/P1 (**MANUAL**). A blocking `FAIL` makes the run fail;
`PENDING_FRAGMENT` does not.

## 6. Reproduction bundle

For every failure: commit SHA, branch, release id, feature flags, seed, viewport, day, full state + save snapshot,
console/page/network/unhandled errors, the failed assertion, screenshots and the route/action history. The
`fingerprint` is deterministic (volatile timestamps stripped). Strings are redacted against an optional private
denylist and the written bundle is re-scanned; a surviving sealed hit aborts the write and is reported by rule index
and JSON path only — **no SEALED text leaks into public artifacts**.

## 7. Tests

`node tools/run-tests.mjs --fragment f14` runs 8 suites (also part of `npm test`, so the release gate enforces them):
route registry + `PENDING_FRAGMENT` handling, asset validation (missing reference / decode failure / placeholder /
duplicate ids), audio availability, deterministic reproduction + failure bundles + redaction guard, pure detectors
(invariants, softlock, dead apps/links, backout/retry), the route executor, end-to-end harness orchestration with a
fake driver (checklist statuses, viewport switching, screenshot generation, failure-bundle generation), and leak-scan
integration.

## 8. Evidence

### 8.1 Harness self-tests

`node tools/run-tests.mjs --fragment f14` — 8 suites PASS (route registry + PENDING_FRAGMENT handling, asset
validation, audio availability, deterministic reproduction + bundle redaction guard, detection helpers, route
executor, end-to-end orchestration with a fake driver, leak-scan integration).

### 8.2 Sample pass (real browser, Playwright + Chromium)

`node tools/f14/run.mjs --dist dist` against `dist/` built as `ra-101a394b5fa9-20260929044122` (commit
`101a394b5fa9`): static validation clean, browser routes pass, save/reload and migration replay pass, 28-day
starvation clean, 360/390/430 + desktop sweep clean, no placeholders, leak scan clean. Checklist counts
`PASS 8 · PENDING_FRAGMENT 7 · MANUAL 1`; 13/14 authorized baseline routes pass (the fourteenth is the reported
finding below), and all ten campaign routes (F01–F06) are `PENDING_FRAGMENT`; no fragment flag is ON.

### 8.3 Intentional failure

`node tools/f14/induce-failure.mjs` copies `dist/`, deletes a referenced frozen asset
(`assets/before_the_fame/art_ship_014/package_d/D-supra-listing.png`) and injects an uncaught page error. The harness
reports `asset-integrity` FAIL (referenced-file-missing) and the `IF1.boot` route FAIL (page + console error) and
writes five reproduction bundles carrying the failed assertion, console/page errors, screenshot, route history and save
snapshot.

### 8.4 Real finding surfaced (not fixed — reported only)

`IF1.minigame.owambe_collection` fails on the Play Window A lab surface: `js/minigames/owambe_collection.js` reads
`window.RANewOgaTunables.m5` at mount, which the lab page does not load, so the entry throws and never mounts
(`reports/f14/full/bundles/IF1.minigame.owambe_collection.mobile-390.a77810667e.json`). The harness does not modify
gameplay; the fix belongs to the owning fragment. A scoped run can use `--exclude IF1.minigame.owambe_collection` while
the finding is triaged.

