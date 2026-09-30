# WHOLE-GAME CANDIDATE 001 — Rich Alucard: Before the Fame

Assembly + verification record. **No gameplay, balance, art, audio, copy or content changed in this pass.** The only additions are this record, its raw evidence, and one new browser smoke script (`tools/tests/candidate/whole_game_smoke.mjs`). No repair was required.

## 1. Identity

| | |
|---|---|
| Source (accepted runtime) | `claude/quirky-ptolemy-1eccex` @ `2fbf120c97c313a4105db71898402b1a993ea116` |
| Candidate branch | `claude/amazing-darwin-s4x3o6` (local branch reset to the source SHA; `main` not merged, not used) |
| Candidate SHA | the commit that carries this file (it equals the source SHA plus docs/evidence/one test script — nothing under `js/`, `assets/`, `index.html`, `game.js`, `style.css`, `art_department/` differs; see §7) |
| Tested-code SHA | `2fbf120c97c313a4105db71898402b1a993ea116` |
| Release build id (tested code) | `ra-2fbf120c97c3-20260930204254` (`dist/build.json`, `commit` = the source SHA) |
| Release build id (clean rebuild) | `ra-1f2c53a19a02-20260930212859` — built from a fresh checkout of `1f2c53a19a02e59ba309b1a2b4cbcdaa16536611` (the record-introducing commit; the candidate SHA differs from it only by this file's final wording). Every build stamps its own commit: `npm run build` at the candidate SHA yields `ra-<first 12 of SHA>-<UTC stamp>` |
| Node | v22.22.2 (CI uses 20; `engines: >=20`) · Chromium 1194 via Playwright 1.56.1 |

## 2. Systems included (all present and reachable)

F01 THE PLAY (`F01.showdown_core`) incl. the frozen FL-A01–A10 runtime art (54 PNGs, byte-identical, none changed since `aebb34d`), the QA-repair-001 composition fixes and the no-car recovery repair · F04 War Room (`F04.war_room`) · F05 THE TRAP incl. HOLD (`F05.trap`, single identity) · IF-1 HOLD bridge (`js/if1/hold_bridge.js`) · F06 RAINMAKER (`F06.rainmaker`) + first-event unlock (`js/if1/first_event_unlock.js`) · F13 locked balance values · phone / WAKE bus / routing · persistence + migrations v07–v16 (schema v16) · audio registry · existing art/audio integrations · F14 harness (18 authorized routes).

**Not in this lineage (unchanged, not invented):** F02 (ARMORY / RANGE DAY), F03 (M9 / M10, Koreatown district provider), F07 / M8 / Finale (parked, SOURCE-GATED — `convergence F07 parked` proves no F07 content is composed).

## 3. How a playtester reaches the accepted systems (READ THIS)

**`js/if1/flag_defaults.js` ships `RAFlagDefaults = {}`: every accepted fragment flag is DARK by default in the release build.** This is the accepted IF-1 design (the integration owner promotes flags; nobody has) and every accepted browser suite drives the game through the DEV session override. A default-URL player sees only the base game (no War Room, no TRAP, no RAINMAKER, no THE PLAY). The candidate is therefore played with:

```
<origin>/index.html?dev=1&ff=F01.showdown_core,F04.war_room,F05.trap,F06.rainmaker
```

(`&speed=10&mute=1` are the accepted test accelerators; omit them for real-time play.) Promoting these four flags is an **owner decision recorded below (C1) — not taken here**, because it would change what "a default build" is and invalidate the dark-default proofs (`IF-1 features`, `zero-behavior-change`, `convergence dark`, browser smoke "reserved apps absent with flags OFF").

## 4. Results (raw logs: `docs/engineering/evidence/whole_game_candidate_001/logs/`)

| Gate | Command | Result |
|---|---|---|
| Full repository suite | `npm test` | **PASS** — 124 suite lines PASS, 0 FAIL, 0 SKIP (4 m 04 s) |
| Release build | `node tools/release.mjs build` (inside verify:all) | **PASS** `ra-2fbf120c97c3-20260930204254` — regression, every fragment suite, migration fixtures, IF-1 contract, zero-behavior-change replay, leak check, artifact verification |
| `verify:all --require-browser` | `node tools/verify-all.mjs --require-browser` | **PASS** — loader, build, artifact, OPEN leak, empty-overlay == OPEN, overlay leak, browser smoke **22/22** |
| F14 whole-game route coverage | `node tools/f14/run.mjs --dist dist --require-browser` | **PASS** — routes 18/18 authorized; 4 PENDING_FRAGMENT (F02.armory.open, F02.range_day.run, F03.m9.tribute, F03.m10.vice_president); 4 flags; 360/390/430 viewports clean; 528 asset references / 858 files decoded; leak-scan 1894 files clean |
| F01 feel gate | `feel_gate.mjs` | **PASS 45/45** |
| F01 frozen-art browser | `feel_lock_art_browser.mjs` | **ALL PASSED** (74 checks: 54 frozen files fetched, 0 broken images / 4xx / console errors) |
| F01 QA-repair regression | `feel_lock_qa_repair_browser.mjs` | **ALL PASSED** (60 checks) |
| F01 no-car recovery browser | `norecovery_browser.mjs` | **PASS** (15 checks) |
| F01 browser path | `browser-path.mjs --dist dist --require-browser` | **PASS 86/86** |
| War Room browser | `tools/tests/F04/browser-war-room.mjs` | **PASS 18/18** |
| HOLD bridge browser | `tools/tests/if1/hold-bridge-browser.mjs --dist dist` | **PASS 40/40** |
| F05 HOLD browser | `tools/tests/f05/hold-browser.mjs` | **PASS 30/30** |
| F13 balance-lock suite | `run-tests.mjs --fragment f13` (also inside `npm test`) | **PASS** |
| F13 population re-run (API) | `tools/tests/f13/run.mjs` 9 personas × 10 seeds × 42 nights | **byte-identical to the committed `reverify.json`** (label line aside) → locked values unchanged |
| F13 population re-run (UI) | `… --mode ui` | **digest identical to the committed `reverify_ui` for the two personas it records (NORMAL, AGGRESSIVE; 5 seeds — lines 1–17 byte-equal incl. car-loss counters)**; the other 7 personas (and a 10-seed, 9-persona run) show `invariants 0 · softlock 0 · errors 0` and NO_CAR / EXTRACT-crash 0 in every persona |
| Loader | `node tools/loader.mjs verify` | **PASS** (190 scripts, deterministic order, `index.html` in sync) |
| Leak check | `node tools/leak-check.mjs` · `--dist dist` | **PASS** (source 1894 files / artifact 1113 files) |
| Ownership / surfaces | `node tools/check-owner-surfaces.mjs --base d5c7869` | **PASS** (38 changed files) |
| Whole-game smoke traversal | `tools/tests/candidate/whole_game_smoke.mjs --dist dist` | **PASS 64/64** (§5) |

Audits on the built artifact: no sealed/stale branch name in `dist/` (grep for `claude/*`, `quirky-ptolemy`, `confident-euler`, `amazing-darwin` → none); `index.html` and `dist/index.html` list 190 scripts with no duplicate script and no dev-only page (`party-dev.html`, `minigame-lab.html`, `rave-review.html` are pre-existing standalone tools, not loaded by the game); all runtime asset paths resolve (F14 asset-integrity + artifact verification); zero console / page / network errors in every browser suite.

## 5. Whole-game smoke traversal (fresh save, one continuous context, built `dist/`, 390×844)

`node tools/tests/candidate/whole_game_smoke.mjs --dist dist` — 64/64. One localStorage save, one game page, never reset after the fresh boot; screenshots in `evidence/whole_game_candidate_001/smoke_screens/`, per-check results in `smoke_traversal.json`. A smoke, not a playtest: nothing was judged for feel and nothing tuned.

| Phase | What was exercised (real UI unless noted) |
|---|---|
| P0 fresh boot | empty storage → IF-1 1.0.0 self-check → built artifact identity → START → prologue adventure mounts and advances on a real tap |
| P1 phone | progressed life seeded with the same state the accepted gates seed (Day 16, $300K, Supra + Urus, New Oga ASSOCIATE, War Room accepted — *seeded, not played to*: reaching Day 16 organically is the AI playtest's job) → bedroom → CHECK PHONE → apps listed |
| P2 RAINMAKER | locked → event merely SEEN ≠ unlock → first RESOLVED event unlocks → exactly once → survives reload → app opens |
| P3 War Room → THE PLAY | MAKE THIS PLAY → real F01 embed PLAY → F04 consumed the record; bank = before + pot − cost exactly; crew statuses = F01 record per member; one log entry + one report card; HEAT moved once |
| P4 car loss + GET IT BACK | **organic**: the first real PLAY lost the Supra (DEALER/CRASH) → real NIGHT (+1 day; War Room SLOTS cap = 1 job/night) → next job opens on the GET IT BACK home scene → one tap = one car → offer playable → PLAY → garage holds both cars exactly once, recovery moved $0, second record consumed once, two log entries |
| P5 THE TRAP | phone listing → BUY HOUSE → BUY BASE → (cook/count minigames' production calls via API) → ASSIGN queued → the next real NIGHT resolved it exactly once (one report) |
| P6 HOLD | real NIGHT scheduled the raid → phone HOLD THE HOUSE → transaction persisted before launch → nothing applied during HOLD → real F01 castle HOLD → cash, HEAT, F05 receipt, stash rule applied exactly once; crew = record; back on the phone |
| P7 save / reload / continue | reload → money, day, crew, HEAT, job log, raid receipts, RAINMAKER unlock identical; nothing pending; no storage-key changes; game save holds no F01 sandbox keys; earlier namespaces intact → a NEW PLAY after reload completes, consumed once, bank exact, log +1 → a further NIGHT advances the day by exactly one |
| all | zero console / page errors / failed requests; IF-1 self-check OK at the end |

Notes: the script's first drafts failed on three driver assumptions, all of them correct game behaviour (morning mail must be dismissed; War Room SLOTS cap blocks a second job the same night; F01's home lock-screen crew text needs one OK tap before the offer; the garage world commits when the PLAY resolves, not on the GET IT BACK tap). No game defect was found.

## 6. Candidate integrity

| Check | Evidence |
|---|---|
| Save/reload coherent | P7; `migrations` (10 historical schemas v07–v16), `HOLD bridge persistence`, F14 persistence/migration-reload |
| Exactly-once consequences | P3/P4/P6/P7 accounting; `HOLD bridge` reload-before/during/after-handoff, repeated/stale/malformed delivery; war-room duplicate-consume check |
| No duplicate reward / double penalty | bank arithmetic after every PLAY / HOLD / sale; `convergence` suites; F13 `balance.test` |
| No namespace overwrite | P7 namespaces; `IF-1 features` namespace guard; `HOLD bridge persistence` (shared namespaces only, no sandbox keys) |
| No accepted frozen asset modified | `git diff aebb34d..HEAD -- 'assets/**/*.png'` = 0 files; `feel_lock_art.test` SHA-256 of all 54 frozen PNGs; f14 `asset-integrity` |
| F13 locked values unchanged | `git diff 2fbf120 -- js assets` is empty for this candidate; F13 population re-run byte-identical |
| No F07 content | `convergence F07 parked`; no `js/frag/F07` |
| Clean rebuild from a fresh checkout | **PASS** — fresh `git worktree` of `1f2c53a19a02` (the code-identical commit that introduced this record): `release.mjs build` (full gate) → `ra-1f2c53a19a02-20260930212859`, `verify-artifact`, leak check (1113 files), loader, `verify-all --skip-build --require-browser` (browser smoke PASS), F14 18/18, whole-game smoke 64/64. Its `dist/` (1113 files) equals the tested-code `dist/` byte for byte except `build.json`, `js/build-info.js` and the release-id query strings in 4 HTML pages |

## 7. Repairs required during assembly

**None.** No runtime, asset, data or test-expectation file was edited. (`git diff --stat 2fbf120..<candidate> -- js assets index.html game.js style.css art_department` is empty.)

## 8. Known non-blocking owner/source items carried forward (recorded, NOT fixed, nothing invented)

**C1 — flags ship dark (OWNER, new in this pass).** `RAFlagDefaults = {}`: no accepted fragment is live in a default-URL build (§3). Promotion (`js/if1/flag_defaults.js`, one commit per flag) is the integration owner's decision and will require re-baselining the dark-default proofs.
**C2 — F02 / F03 not in this lineage (OWNER, surfaced).** ARMORY, RANGE DAY, M9 THE TRIBUTE, M10 VICE PRESIDENT have no runtime (F14: 4 PENDING_FRAGMENT); Koreatown reports `PROVIDER_MISSING` in the real game (F04 §7.7), so only ARTS DISTRICT and INGLEWOOD jobs exist.

The mission's named items:
- **Defended raids pay the HOLD pot** (F13 O2): a HELD raid banks F01's HOLD band ($8–20K).
- **Car recovery is free** (`fee: 0`, F13 S1): car loss has no economic pressure; price SOURCE_REQUIRED (observed live in P4: recovery moved $0).
- **HEAT has no authored escalation past ON FIRE** (F13 S2); no-traphouse HEAT has no consequence.
- **Long-horizon / post-fame wealth outruns sinks** (F13 O8).
- **FL-A07** named-Oga F01 state families (walking/boarding/standing/wounded/carried for TUNDE, DRE, HALF-PINT, SUNDAY BEST, YOUNG MAZI, AUNTIE GRIT) — SOURCE_REQUIRED; named Ogas keep face bust + gun overlay.
- **FL-A10** RECRUIT / STORY / DISTRICT physical loot silhouettes — SOURCE_REQUIRED; labelled placeholder crate.

## 9. Exact list still `SOURCE_REQUIRED` / `PENDING_FRAGMENT`

**PENDING_FRAGMENT (F14, reported not failed):** F02.armory.open · F02.range_day.run · F03.m9.tribute · F03.m10.vice_president. F14 checklist: `authored-failures` (no failure branch registered), `retreat` (no backout route authorized), `phone-placement-hook` (no fragment validators), `authored-audio` (3 unregistered: BARS_PUNCHLINE — missing-from-delivery, DRAGON_WINGS — missing-from-delivery, MAGIC_SEANCE — defective-render-do-not-wire; 6 inert hooks), `no-p0-p1` (MANUAL sign-off).

**SOURCE_REQUIRED (from the accepted records):**
- F13 §8: S1 car recovery price · S2 HEAT past ON FIRE · S3 wired effects for VAULT / PANIC ROOM / CAMERAS / MONEY COUNTER / AGING RACKS · S4 what lowers runner loyalty · S5 S-grade rare ingredient player path · S6 level-up job scenes (+ trap level thresholds PROVISIONAL) · F07 / M8 / Finale parked.
- F13 owner decisions O1 (unanswered raid is free by decision), O2 (HELD raid pays pot), O3, O4 (RE-UP / BAIT pay F01 cash), O5 (L1 sales on the Day-14 JUG THE PLUG path), O6 (placeholder trap workers lose RACrew definition on reload), O7 (lost districts never return), O8 (long-horizon wealth).
- F01 art: FL-A07, FL-A10 (above). F01 spec: car trait words/stats (F03/F13), OCTOPUS BRAIN plans + smart-way-out lines, THIRST moment text, generic quirk pool, WEIRD/LEGENDARY names, BIG PLAY prize table, turning flavour lines, DAY ONES pairs, nickname/scar tables, RAIN / FULL MOON night-modifier math, ROBBED pocket-loss size; F01 §11 refused items (OCTOPUS BRAIN "three context tricks", ITEM action, F02 JOLLOF BURN scale / TOMMY TONY bonus, BLESSED ROUNDS, FULL MOON werewolves, SEEN IT ALL).
- Convergence: `BX_STEP` sound · traphouse-specific HOLD (map / layout / rewards) · authored unanswered-raid consequence (none by decision) · F01 breach-report copy still says "half the SUPPLY and a fifth of the cash" while F05 applies stash + 30 % · HOLD notice has no in-play exit (BACK IN relaunches) · `TR_01`–`TR_06` F11 masters.
- F04 §7: Vol 7 HEAT floors ownership (now `RAHeat` single owner), BAIT / HAND BACK ↔ F01 shape provisional, F01 `BLOOD_X` / `DISTRICT` loot not converted to F04 resources, car stats only for SUPRA / S2000 / URUS / HOOPTIE.
- Vol 7 HEAT numeric tier floors (F00) and the 243 Rich `[VP]` lines private pre-FCPB H1 review (F00).

## 10. Reproduce

```bash
git checkout <candidate SHA>
npm test && npm run build && npm run verify:artifact
node tools/verify-all.mjs --skip-build --require-browser
node tools/f14/run.mjs --dist dist --require-browser
node tools/tests/candidate/whole_game_smoke.mjs --dist dist
# browser env used here: RA_PLAYWRIGHT_PATH=<global playwright> RA_CHROMIUM_PATH=<chromium-1194>/chrome-linux/chrome
```
