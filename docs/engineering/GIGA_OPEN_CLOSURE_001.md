# GIGA OPEN CLOSURE 001 — ENGINEERING 06

Status: **READY FOR HQ OPEN-CLOSURE REVIEW.** Not a release candidate; no FUN/TASTE verdict; nothing merged or deployed.
Spoiler-safe: ids, systems, routes and outcomes only.

## 1. Authority

| | |
|---|---|
| Branch | `claude/giga-open-closure-001` (own worktree) |
| Start SHA | `9ae8fd7f66ac98d6b76d251b1280206260236ee0` — verified on `origin/claude/ship015-integration-001`, worktree clean, baseline `npm test` PASS |
| Final SHA | the commit that adds this report (reported in the HQ return) |
| `main` | untouched (local `c60b5e3`, origin `b8ab4fe`, unchanged) |
| Save schema | v12, unchanged; no field added |
| Sources reviewed | HQ Production Addendum v1; VOL 1, 2, 3, 5 (OPEN packet, hashes match the repository provenance record); CURRENT_CANON, PRODUCTION_CONTROL, `docs/btf/*`, Engineering 04/05/05B/05C records, Art registers/manifests |
| Sources not opened | VOL 4, VOL 5-S, HQ-M01–03, `js/sealed/*`, Ogun's Rave / Property content, Art Ship 003, `*player_blind*` boards, and `…Vol7_PLAYMAKERS_Blood_X_Operations.docx` (not in the OPEN packet or any authority). Note: the provenance README's ZIP hash has a transcription typo; the individual files match |

## 2. What changed (by closure batch)

| Commit | Batch |
|---|---|
| `6b5806c` | Unreachable OPEN content connected (Coffe arc, Waffle Saga rebuilt to VOL 5, LAN night, Halloween, Cammile), dead ends fixed (all-locked choices, ignored node fx, dead want, Georgia routes, Maid Quarters, plus-one pools, Sunday A31, SHMOOVE, passenger seat, parts bay, selected-car garage, later drops); Test Pilot headless layer + coverage sim; reachability classifier fixed |
| `c83904c`, `c54fadf` | Census end nodes + graph inheritance; entrance-cue staging; top-5 arcs rebuilt to VOL 5 §8; A41 roof crew; sweep action-layer fix |
| `79718b1`, `263a722`, `4042645` | `RATestPilot` in-page DEV layer; mid-life v12 fixtures + gate; sweep renders runtime-bound casts; release-gate hook fix |
| `7524404`, `8995ff3`, `927d9dc`, `3fb2373`, `06731db` | Approved art wired to explicit beats (egg, Wispa wave, church shoes, sword, garage trophy view, S2000, Britney, riding composite); Lil Smack #2/#4; TOUGE harness; WHAT WE ON priority; browser route proofs for every new route |

Files (39 + 4 docs): content `js/data/btf/adventures/{date,systems,w1_life,w2,w3,w4,w5}.js`, `js/data/btf/dates.js`;
systems `js/scenes/adventure.js`, `js/systems/{cars,party_life,radio,temptations,test_pilot}.js`,
`js/phone/apps_core.js`, `js/minigames/touge.js` (read-only phase marker only), `js/btf_content.js`, `index.html`
(script sync); generated `js/data/{art_surfaces,presentation_assets}.js`, `docs/art_integration/INTEGRATION_MATRIX.json`,
`docs/presentation/locks/wave1-adventures.json`; Art records `tools/art-integration/{ship014,ship015}_runtime_map.json`,
`review.json`, `tools/presentation/annotations.json` (face boxes only); tools `tools/pilot/*` (new),
`tools/{reachability-audit,presentation-adventure-dryrun,presentation-sweep,playtest-qa,release}.mjs`.

## 3. Gaps discovered and fixed (highlights; full list in the ledger)

- **Six adventures had no player entry** while the audit said "none": the Coffe arc (a MUST lane — A29 unrouted, tells stopped after one, A29B read inventory and was unrouted, so A29C never came), A44 Waffle Saga ("never cut"), A50 LAN night, A52 Halloween, A_CAMMILE1. The classifier counted `fame.js` id lists and `done('ID')` predicates as routes; fixed and proven against the start tree.
- **Source-fidelity:** A44 did not follow VOL 5 (wrong location for night 1, Ms. Patrice missing until night 4, no perfume, four nights in one sitting) — rebuilt; the 15 top-5 arc beats did not match VOL 5 §8 — rebuilt; Lil Smack #2/#4 missing; CHURCH SHOES unsellable; THE SHMOOVE unearnable; neighbor-castle party unreachable.
- **Dead ends / player-facing dead buttons:** all-locked choice nodes stranded the player (PEKING/TACOS/DATE/hosting when broke); Maid Quarters dead after hiring; story invites pushed out of WHAT WE ON on busy days (browser-found).
- **Silent bugs:** ignored node-level `fx` (A10, A48), a function passed as a want's adventure, waffle mix added as an item not a prop, GARAGE tuning the wrong car, walking to Atlanta.

## 4. Player routes added/repaired (all proven)

Headless route proofs (in `npm test`): 12 → **19**. Browser taps (`playtest-qa --only routes`): the 9 Engineering 05
routes plus **coffe, waffle, lan, halloween, docks, maid, garage** — each returns to an idle bedroom with invariants
clean and refresh diff 0.

## 5. Presentation

Census 166 → **249 adventure screens** (+17 fights unchanged): +9 end nodes, +entrance-cue staging, +runtime-bound casts
(A41 plus-one, party guests), +new beats. Live sweep **every census screen PASS at 360/390/430** (247 in the full sweep + the 3 added after it, swept individually), 0 errors, PD-FA-03 only. Two sweep false positives were found and closed (see ledger §4).

## 6. Art disposition

48 registered-but-unwired Ship 014/015 files → **22 wired**, 26 classified (ledger §5). Integrated Ship 014/015 files
300 → 323. Matrix **265 PASS / 1 HOLD** (placeholder ocean-flight environment → AR-01). No frozen byte modified; corpora
verify 011 212/212 · 012 224/224 · 013 219/219 · 014 404/404 · 015 411/411; no file under `assets/` changed. Ship 011
gate unchanged.

## 7. Test Pilot / DEV infrastructure (minimum, shared)

- `tools/pilot/headless.mjs` — one headless driver (the engine calls the scene makes), declared seeds, `offers()` (every bedroom-night route surface). Reused by the audit, fixtures and sim.
- `tools/pilot/coverage-sim.mjs` — persona × seed lives over real route surfaces; never-offered/never-completed, dead buttons, errors, stranded adventures.
- `js/systems/test_pilot.js` — `window.RATestPilot` (DEV only, absent on player pages): seeded RNG, 7 named scenarios built by walking prerequisites (PLAYER-BLIND/legacy outcomes are the only declared seeds), real-clock advance, dump/diff, launch-at-node by replaying a real path. `tools/pilot/pilot-browser-check.mjs` proves it.
- Fixtures: `tools/pilot/fixtures/*.json` (4 simulated mid-life v12 saves) + `fixtures-test.mjs` in `npm test`.
- Harness corrections: census end nodes + graph inheritance; sweep holds minigame/fight actions, starts runtime casts with their vars, and errors when the rendered key differs; TOUGE driven to its own `results` phase.
- Lessons encoded: covered-by-layer vs layout (sweep action-layer error), weighted content (seeded RNG; "within N sleeps"), prerequisite side effects (scenarios walk adventures), node isolation (replay launch), real params (garage/touge launched through their routes), baseline comparison (classifier run against the start tree).

## 8. Regression

| Check | Result |
|---|---|
| `npm test` | PASS — btf 113 adventures / 314 walks; presentation 249 screens (248 + PD-FA-03) + 17 fights; art integration 391 files, matrix 265 PASS / 1 HOLD; reachability 113, 19 proofs, none unrouted; mid-life fixtures; release gate |
| `npm run build`, `npm run verify:artifact` | PASS |
| Live Presentation sweep | 247/247 PASS at 360/390/430 |
| Built game `playtest-qa` | **0 findings** across sets A–D (§8a) |
| Frozen art / SEALED / `assets/` / `main` | unchanged (see §6, §10) |

### 8a. Built-game QA (final)
Built from the committed tree (`ra-68e9f57c2253…` for sets C/D/TOUGE; `ra-3fb23738c7d6…` for sets A/B — the later commits
only moved three world-art placements, the A32 composite, one reviewer note and docs, each re-checked live).

| Set | Result |
|---|---|
| A: new game ×3 widths, prologue refresh, 8 migration fixtures (incl. paused Supra, malformed, partial), widths 360/390/430, wake-refresh, **16 routes by taps** | **0 findings**; every refresh diff 0; paused Supra skips the prologue |
| B: legacy/PLAYER-BLIND flows (function only), systems, protected ending | **0 findings**; ending fires once, THE NEXT MORNING, no replay |
| C: all nine minigames enter → play → finish/quit → return → refresh | **0 findings**; 8 finished naturally; TOUGE quit under parallel load (timing), then **finished naturally alone** on the same build |
| D: new game, 4-day life (seed 23), routes coffe/waffle/maid/garage on the final build | **0 findings** |
| Test Pilot browser check | absent on player page; 7 scenarios, 0 page errors; replayed launch lands on the staged screen |
| Live sweep | 247/247 + the 3 newest screens (garage, Wispa wave, A32 sky) = **250 captures, all PASS** at 360/390/430 |

## 9. Long-life sanity (observations, not balance)

5 personas × 2–3 seeds, 60-day cap: **0 content errors, 0 stranded adventures, 0 dead buttons** after fixes; every
life reaches the protected ending on Day 36 (momentum saturates early — known). Castle rooms/Party Hall, A33 and A23 are
not reached in ordinary lives → D2, D3. A "devoted" life reaches RIDE-OR-DIE and A46, so the relationship ladder is
traversable. Daily dates are allowed (VOL 1 suggests 1–3 sleeps) — pacing, for rigorous testing.

## 10. Known harness limitations (remaining)

Headless proofs feed synthetic minigame/fight results; A17 (defeat), A57 (driving) and the prologue are covered by the
browser sets rather than the coverage sim; `drive()` in the browser is random, so coverage depends on the seed; timing
checks should run alone.

## 11. Deferred, decisions, blockers

- **Deferred polish:** audio loops, voice pass, draft dialogue, PICKUP teammates, June's retwist minigame, party song change mid-party, InstaHoe drops, ONLYVAMPS cancel scene, night-sky trigger, possession-unlocked Octopus options, Art states without a beat.
- **UBE/HQ decisions:** `BTF_OPEN_UBE_DECISIONS_001.md` — D1 CRACK, D2 economy vs fame floor, D3 pressure/Hilt, D4 ONLYVAMPS pages, D5 adult nightlife scope, D6 Art-mapped staging conflicts.
- **Art requests:** `BTF_OPEN_ART_REQUESTS_001.md` — AR-01 ocean night-flight environment.
- **Blockers:** none.

## 12. Protections

SEALED/PLAYER-BLIND material untouched: `git diff 9ae8fd7..HEAD` is empty for `js/sealed`, `js/systems/sealed.js`,
Ogun's Rave/Property content, `art_department/` and `assets/`. Frozen Art not modified. Combat moves/numbers unchanged.
Remote: the branch is pushed to `origin/claude/giga-open-closure-001` (see HQ return); local worktree clean.
