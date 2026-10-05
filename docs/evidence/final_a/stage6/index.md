# Stage6 · validation

| Required gate | Actual measurement | Result |
|---|---|---|
| npm test | Full deterministic release gate | PASS |
| verify:all --require-browser | 7 steps; built 9f06b0c58ae3db9cf9e7ed059fc94874b09d2b2a | PASS |
| Loader | 224 ordered scripts; generated index in sync | PASS |
| OPEN source / artifact leak | Source tree and built artifact clean; empty overlay identical | PASS |
| Frozen art | 1090 frozen; 0 altered; 1335 preserved copies / 0 mismatches | PASS |
| Placeholder log | 0 active / 0 pending | EMPTY |
| Actor floor contact | 2,799 contacts / 403 variants × three widths; 0 violations | PASS |
| Minigame contact | 48 contacts / 27 actual frames; 0 violations | PASS |
| Move presentation | 84/84 MATCH; 0 rules-state differences | PASS |
| Full 390px battle | 1728 frames; p95 16.8ms; max 33.3ms; 0 hitches >50ms | PASS |
| Action beats | 11/11 START, 11/11 effect/impact, 11/11 SETTLE | PASS |
| Tap sound | 978/978; 0 errors; 0 leaked combat loops | PASS |
| F01 timing/layout/record | 3/3 width traces match; 45/45 existing browser feel checks | PASS |
| F01/F06 executable preservation | 38 files; 0 changed | PASS |
| Capture band: routine | 134/3200 = 4.1875% (limit 8%) | PASS |
| Capture band: BIG PLAY | 64/400 = 16.0000% (limit 20%) | PASS |
| Capture band: HOLD THE HOUSE | 17/400 = 4.2500% (limit 8%) | PASS |
| BAILED bounds | 507 outcomes; 0 violations | PASS |
| R1 random 100 seeds | Mean 8.18; worst 3; seed54 3; target ≥4 | ESCALATE: inherited |
| T9 repetition | 99,039 uses; 0 repeats-within-three; 0 uncovered triggers | PASS |
| T9 capacity | 2 unchanged short pools | ESCALATE: authored lines |
| Historical migrations | 10 v07–v16 fixtures + legacy v4/v6; additive/idempotent | PASS |
| Normal release developer surface | 30 frames at 360/390/430; absent after START/F2; dev=1 retains tools | PASS |
| Real browser fresh → ending | Day 36; real continuation; no day/wealth/momentum injection | PASS |
| Built artifact ending / continuation | 0 findings; real sleep, ending, continue, reload, no repeat | PASS |

The R1 minimum and T9 pool-capacity targets remain explicit inherited escalations. The release engineering gates passing does not waive them. No locked odds or authored text/number was changed.

[Machine-readable validation](validation.json), [full release gate](../verify-all.log), [npm test](npm-test.log), [hash authority audit](hash-audit.json), [locked PLAY audit](play-audit.json), [tap index](tap-index.md), [normal/dev surface](release-surface/index.md), [artifact ending](artifact-ending/report.json).

Windows text checkout conversions are recorded separately from binary frozen art: 161 text files canonicalize to their exact authority LF hash; all frozen binary bytes remain strict. Source manifests are checked with 170 sources and 11 inherited unresolved source requirements. Historical v4/v6 and v07–v16 fixtures are the actual available historical schemas; recovery/future-version and lazy-fragment migration cases are also included in the release suite.
