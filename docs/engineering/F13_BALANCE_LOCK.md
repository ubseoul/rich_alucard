# F13 — WHOLE-GAME BALANCE / ECONOMY LOCK

Start: `claude/confident-euler-4zra7w` @ `d5c7869794b2f3aa2e69685f4ce564f82efcbe0a` (accepted convergence + F01 frozen-art QA-closed runtime).
Branch: `claude/quirky-ptolemy-1eccex`. Final SHA: see the hand-off (the commit that carries this file).

**Method.** existing authored game → measured simulation → broken/degenerate balance → smallest justified change → deterministic re-measure → lock.
Nothing was redesigned. No currency, progression system, penalty, encounter, unlock condition, mechanic or story rule was added. F07 / M8 / Finale were not touched.
Frozen art, F01 presentation / feel-lock, dialogue, narrative, unlock rules, F05 exactly-once, HOLD bridge semantics, migrations / ledger, audio and routing are unchanged.

## 1. Systems audited (owner → what moves progression)

| System | Owner / file | Economy surface | F13 status before this pass |
|---|---|---|---|
| Life budget | base game `js/systems/life_clock.js` | +$100,000 every 28-day month | authored (canon: exact mechanics TBD) — untouched |
| Base-game sinks | castle rooms $40K–$400K, real estate $180K–$3.8M, cars, dates, adventures | where operations money goes | authored / accepted content — untouched |
| WAR ROOM | F04 `jobs.js`, `play_adapter.js`, `phone_app.js`, `districts.js`, `crew.js` | 1–2 jobs a night (Vol 7 §3.1 SLOTS), LAY LOW $10K / HEAT −15, rival pressure 0–5, recruits (max 8) | authored numbers; enforcement defects (below) |
| THE PLAY | F01 `js/frag/F01/play/*` | pot bands ($K), HIT ONE MORE curve, calls, crew outcomes, car / gun loss, HEAT per PLAY | feel-locked (OL-023 T1–T13 targets); read, **not** tuned |
| THE TRAP | F05 `tunables.js` (AUTHORED + PROVISIONAL owner F13) | house prices/capacity, grade prices, quality bands, channels, HEAT per case, levels, raids (stash + 30% unbanked, hot 5 nights) | PROVISIONAL money values all $0 |
| HOLD bridge | IF-1 `hold_bridge.js` | F05 raid → F01 castle HOLD → shared money/HEAT/crew once → F05 applies its own loss | integration decision — untouched |
| HEAT | IF-1 `heat.js` + `heat_floors.js` | global + district; Vol 7 floors 0/30/60/85; −3 per sleep (F05) | authored — untouched |
| RAINMAKER | F06 | pure spend ($5K/$10K/$25K rounds, $100 bills), no payout by design | untouched (healthy: a sink, not a source) |
| Money ledger | IF-1 `money_ledger.js` | every mutation tagged by family | used for measurement |

## 2. The harness (new, measurement only)

`tools/tests/f13/_campaign.mjs` boots the **real production runtime** headlessly (BTF game + IF-1, then F01 / F03 provider / F04 / F05 / F06 / HOLD bridge in production load order, flags ON) and plays a life only through the calls the phone makes: WAR ROOM `onAction('play' | 'runJob')` with the **real F01 PLAY engine** answering (headless transport, F01 sim policies careful / greedy / naive / random), TRAP BUY BASE / COOK / ASSIGN / COUNT / ROLES / UPGRADES / LEVEL UP / HOLD THE HOUSE (`RAHoldBridge.start` → F01 HOLD → F05 `applyDefense`), RAINMAKER rounds from the approved pure core, and `RAClock.sleep()` for NIGHT / WAKE. One seeded `Math.random` is shared by every realm and F01 PLAY seeds derive from (campaign seed, requestId): **same code + same arguments → byte-identical metrics.** A phone action that throws is recorded as an error and the life continues, as it would in the browser.

Start state: Day 16 (Mister December's window), $100,000, clout MID, Supra + Urus, the six Vol 7 Ogas, NEW OGA ASSOCIATE (THE TRAP open). 42 nights (to Day 58, past the fame threshold), 10 paired seeds per persona.

Personas (behavior only): `normal`, `aggressive` (greedy F01 policy, 2 PLAYs, never lays low, three houses, retail), `conservative` (safe jobs, wholesale, one house), `loser` (random F01 policy, counts money every third day, bad cooks, rains), `winner` (careful, best jobs, perfect cooks), `spender` (every house and upgrade, a $25K RAINMAKER round every day), `hoarder` (War Room only, never buys), `repeater` (taps PLAY ×6, COOK ×6, LAY LOW ×8 a night), `raid_dodger` (never answers a raid).
Runner: `node tools/tests/f13/run.mjs --label <l> [--mode api|ui]`; compare: `node tools/tests/f13/compare.mjs a.json b.json`. `--mode ui` buys base only when the TRAP phone actually offers it.

Before = the untouched `d5c7869` tree (a detached worktree); after = this branch. Both with the **identical** harness file (the one line that later changed, `ui` mode reading the house page through `render()` as the phone does, only runs in `--mode ui`, and both `ui` populations were re-run with it). Raw rows: `tools/tests/f13/out/{baseline,after,baseline_ui,after_ui}.json`, digests `*.txt`, table `compare.txt`.

## 3. Baseline findings (untouched `d5c7869`)

Distributions are p10 / p50 / p90 over 10 seeds unless stated. Full tables: `tools/tests/f13/out/baseline.txt`.

**Healthy (left alone).** Normal play is steady and rewarding: cash never comes near zero (lowest $41K–$73K), a normal life ends at $1.8–2.6M, a careful War Room wins 89–92 % of PLAYs, and early money matters (a traphouse is 45 % of the Day-16 cash). The strong player out-earns the average one (median $5.0M vs $2.1M) and the erratic player earns least ($0.8M), so skill is rewarded without making weak play a death spiral: no life ever went negative (the spender bottomed at $100 by choice), and no life hit an invariant violation (NaN, negative cash / HEAT / stock). THE TRAP's pacing is sane: Level 2 around Day 26 and Level 3 around Day 41 for a two-house operation, Level 2 at Day 36 for one house. Raids arrive once an operation scales (first raid Day 37–43 normal, Day 26 strong) and never touch the small wholesale player. HEAT per case, the HOT threshold and the 7-night cadence behave as authored. RAINMAKER is a pure sink ($30K–$983K by persona) and cannot generate money.

**Actual problems measured.**

| # | Problem (baseline evidence) | Kind |
|---|---|---|
| P1 | **Unlimited War Room jobs a night.** The board shows `SLOTS: 1` / `2`, but nothing spends them: the repeater ran **6 PLAYs** in a night and **185 LAY LOWs** in 42 nights. | repeated-action exploit (authored rule never enforced) |
| P2 | **Unlimited trap cooks a night.** A house's capacity is authored as cases **per night** (the listing says "N cases/night"), but COOK never checked: **5.73 cooks per house-night**, trap net **$9.4M** vs $1.2M for the same houses played normally; final cash $8.4M vs $2.1M. | repeated-action exploit / runaway wealth |
| P3 | **THE TRAP cannot produce in the real game.** No phone action ever called `production.purchaseIngredients` (ingredients start at 0 and have no other source), and the house page that holds COOK threw (`R.production.readyBatches` is not a function; the page rendered "error"). UI-faithful run (`baseline_ui`): **0 cases ever sold; every traphouse buyer is down $185K–$445K for good.** | progression stall / softlock of a whole system |
| P4 | **Trap product was free** (PROVISIONAL ingredient cost $0, owner F13). With P3 fixed, a case is pure profit: THE TRAP out-earns the War Room 1.8× (normal) to 2× (strong) with no working capital, a raided stash costs nothing to replace, and the safe wholesale channel has no input to cover. | no cost basis |
| P5 | **Free HEAT cut.** BETTER BURNER (halves sale HEAT) cost $0, so every persona that wanted it bought it on day 1. It is the only upgrade with a wired economic effect. | consequence avoidance at zero cost |
| P6 | **LAY LOW paid for a third of its HEAT.** Card: "COST: $10,000 · HEAT: −15". Applied: −5 (the 30 % district-to-global share applied to a job that has no district). Average measured drop **5.0**. | shown ≠ applied |
| P7 | **LAY LOW threw** in the VampGram caption (`district.replace` on null) after the money and HEAT had applied: **120–1,854 errors per persona**; the phone action died half-way (no report-card post, the night counter skipped). | crash |
| P8 | **Recruits vanished on reload.** `RACrew` keeps unit definitions in memory only; F04 defines recruits at runtime and never restored them. Measured: a save/reload mid-life removed an Oga (8 → 7 active) and changed the rest of the life by −$51K in five nights. | reload changes the economy |
| P9 | **The War Room dies after car losses** (9–10 of 10 lives, every persona; median last PLAY night 29, aggressive 12). See §8 R1 — **not changed here** (F01-owned, frozen). | softlock (pre-existing, out of F13 authority) |
| P10 | **An ignored raid is free and ends raids** (`raid_dodger`: one raid pending 21 nights, no second raid ever, production unaffected, final cash above normal). See §8 O1 — **not changed** (owner decision "none"). | consequence avoidance (by decision) |
| P11 | **HEAT has no ceiling effect** (aggressive peak 341–615; nothing beyond ON FIRE; raid cadence fixed). See §8 S2. | SOURCE_REQUIRED |


## 4. Problems → changes (every change: previous → new, measured reason, system, regression)

| # | System | Value / rule | Previous | New | Measured reason | Regression |
|---|---|---|---|---|---|---|
| C1 | F04 WAR ROOM | nightly SLOTS (`jobs.js` `canRunTonight` / `slotsUsedTonight`, enforced in `phone_app.js`) | shown, never spent | a PLAY or LAY LOW spends a slot; the cap is the SLOTS number the board shows (set at WAKE, Vol 7 §3.1: 1, or 2 at 6+ active Ogas); **EXTRACT exempt** (F01 R1 brake), HAND BACK exempt (one-time closing job); a full night answers on the board's existing "not tonight:" line | P1: 6 PLAYs / 185 LAY LOWs a night-set | f13 §1, §5 |
| C2 | F04 HEAT | districtless job HEAT (`applyRunResult`) | 30 % of the delta to global (−5) | the whole authored delta to global (−15); district jobs unchanged (full to district + 30 % global) | P6: card says −15, applied −5 | f13 §2; F04 suite §7 |
| C3 | F04 VampGram | `postReportCard` with no district | threw | returns (no post — the same visible result as before, minus the exception) | P7 | f13 §5 (no phone action throws) |
| C4 | F04 crew | recruit identity | memory only | `save.frag.F04.recruits` `[{id,name,cls,source}]` written on join, re-defined at load (lazy `[]` default, no migration, no schema version) | P8 | f13 §5 reload digest, §6 |
| C5 | F05 production / phone | COOK capacity | per batch | per night: `production.cookedTonight` / `capacityLeft` (read-only helpers over the batches' `madeDay`); the phone's COOK spends what is left and answers "cooked tonight." | P2 | f13 §3, §5 |
| C6 | F05 phone | BUY BASE | no caller | house page offers BUY BASE for each unlocked, non-rare grade's base: one night of the house (`capacity` units) through the existing `production.purchaseIngredients` (ledger `trap:ingredients:gbenga`) | P3 | f13 §3 |
| C7 | F05 phone | house page | threw → "error" | `R.store.readyBatches` (the function that exists) | P3 | f13 pages (every TRAP / WAR ROOM page renders) |
| C8 | F05 PROVISIONAL | `ingredientCost` per case | synth 0 · standard 0 · good 0 · premium 0 · rare 0 | **250 · 700 · 1,400 · 2,800 · 0** = 20 % of the base's reference grade (D $1,200 / C $3,500 / B $7,000 / A $14,000) = one third of its wholesale price | P4 | f13 §4 (input exists; standard wholesale profitable; retail ≥ 1.5× wholesale margin) |
| C9 | F05 PROVISIONAL | `upgradeCost.better_burner` | 0 | **50,000** (priced on the authored LAY LOW rate: $10K per 15 HEAT → $50K ≈ 75 HEAT, i.e. it pays back after ~75 retail cases) | P5 | f13 §4 |
| — | F05 PROVISIONAL | other five upgrade costs | 0 | **0 (kept)**: no wired economic effect in the integrated game, so a price would charge the player for nothing (§8 S3) | — | f13 §4 |


Change surface: `js/frag/F04/{jobs,phone_app,crew,vampgram}.js`, `js/frag/F05/{tunables,production,phone_app}.js` (+89 / −11 lines). No IF-1, F01, F06, migration-ledger, loader, art, audio or copy file changed; no save schema version; `save.frag.F04.recruits` is the only new persisted field (F04's own namespace, read lazily with a `[]` default, no migration).

**Left alone because it is healthy** (measured): LAY LOW's $10K price; HEAT per case / grade; the 7-night raid cadence and HOT threshold; the level thresholds 40 / 120 / 300 / 700 (Level 2 around Day 22–36, Level 3 Day 31–43 depending on scale); grade prices and quality bands (authored); the F05 raid loss (stash + 30% of unbanked); RAINMAKER; the base-game budget and sinks; F01 pot bands (DROP / COLLECT / PROTECT bands sit inside the Vol 7 §3.2 authored cash ranges) and every F01 odds / curve number (feel-locked, T-targets thin).

## 5. Before / after

Paired, identical seeds and harness. Full per-persona tables: `tools/tests/f13/out/compare.txt` (economy underneath the phone, `api`) and `compare_ui.txt` (only what the phone offers, `ui`).

| persona | final cash p50 before → after | trap net p50 | War Room p50 | max jobs / night | LAY LOW drop | peak HEAT p50 | UI errors |
|---|---|---|---|---|---|---|---|
| normal | 2.06M → 1.65M | 1.20M → 687K | 666K → 673K | 1 → 1 | 5 → 15 | 75 → 73 | 120 → 0 |
| aggressive | 1.72M → 2.00M | 1.35M → 1.20M | 20K → 417K | 2 → 2 | — | 368 → 638 | 0 → 0 |
| conservative | 1.40M → 1.31M | 200K → 110K | 900K → 900K | 1 → 1 | — | 2 → 2 | 0 → 0 |
| loser | 803K → 714K | 253K → 163K | 313K → 313K | 1 → 1 | — | 23 → 23 | 0 → 0 |
| winner | 4.96M → 3.70M | 3.29M → 2.11M | 1.70M → 1.27M | 2 → 2 | 5 → 15 | 133 → 76 | 194 → 0 |
| spender | 1.76M → 697K | 1.85M → 658K | 666K → 667K | 1 → 1 | 5 → 15 | 181 → 82 | 180 → 0 |
| hoarder | 1.20M → 1.20M | 0 → 0 | 900K → 900K | 1 → 1 | — | 65 → 65 | 0 → 0 |
| **repeater** | **8.38M → 2.22M** | **9.40M → 755K** | 461K → 1.18M | **6 → 3** (2 SLOTS + EXTRACT) | 5 → 15 (185 → 8 LAY LOWs) | 99 → 64 | **1,854 → 0** |
| raid_dodger | 2.39M → 1.90M | 1.26M → 730K | 851K → 851K | 1 → 1 | — | 124 → 123 | 0 → 0 |
| normal (`ui`: what the phone offers) | **758K → 1.65M** | **−185K → +663K** (0 → 214 cases sold) | 674K → 673K | 1 → 1 | 0 → 15 | 3 → 74 | 0 → 0 |
| aggressive (`ui`) | **132K → 2.02M** | **−185K → +1.22M** | 20K → 422K | 2 → 2 | — | 5 → 638 | 0 → 0 |

Reading it against the principles:
- **Early money matters**: Day-23 cash for a normal life is $116K after (was $187K with free product); a traphouse plus its first week of base is a real decision. The lowest cash in any non-spender life was $10.8K (aggressive); the spender, who chose to rain away $928K, touched exactly $0 and never went negative.
- **Risky play pays, losses hurt, one bad night is not the end**: retail keeps ≥ 1.5× the wholesale margin on every grade; a raided stash now costs its inputs; the aggressive player ends richest-but-hottest (HEAT 638, 5 raids, stash lost 7 cases on average) and still recovers; crew GONE for aggressive fell 1.8 → 0.7 because the board no longer lets a thin crew be sent out twice a night.
- **Momentum without runaway**: the strong player still ends ~2.2× the average; repetition no longer compounds (repeater == the same player at the caps to the dollar, §6.5); the one-house wholesale player still nets $110K after paying for the house (2.4× its price).
- **No safe action dominates**: conservative wholesale is profitable but the smallest trap income; the War Room and THE TRAP now pay about the same for a normal player (673K vs 687K) instead of THE TRAP paying 1.8–2×.
- **Unchanged by design**: hoarder (War Room only, never LAY LOW) is byte-identical before/after (same digests, all 10 seeds); F01 odds are untouched (win % moves only with trajectory).


## 6. Tests added

`tools/tests/f13/balance.test.mjs` (runs in `npm test`): relationships, not tuned values —
1. WAR ROOM runs at most the SLOTS the board shows; a refused launch leaves nothing pending; LAY LOW needs a slot; a new night reopens the board; **EXTRACT is never capped**.
2. LAY LOW lowers global HEAT by exactly its authored delta and costs exactly its authored price; district jobs keep full-to-district + 30 % global.
3. The house page offers BUY BASE; BUY BASE charges `capacity × cost` through the ledger (`trap:ingredients:gbenga`); a second COOK the same night adds nothing and eats no base; the next night cooks again; a broke Rich cannot buy and nothing goes negative.
4. Margin shape for D/C/B/A: an input cost exists; a standard-quality wholesale sale is profitable; retail pays ≥ 1.5× wholesale margin; BETTER BURNER is a purchase and cuts HEAT; unwired upgrades are never charged; F05's 30 % unbanked raid rule is intact.
5. Repeating past a cap buys nothing (repeater == the same player at the caps, to the dollar and the case); no NaN / negative state, no softlock, no phone action throws; **a mid-life save/reload yields a byte-identical economic digest**.
6. A recruit and their state survive a reload; never defined twice.

## 7. Verification

All on the final tree (`f1d62eb` + this record), Node 22, Chromium via Playwright:

| Gate | Result |
|---|---|
| `node tools/run-tests.mjs` (44 suites incl. new `f13/balance.test.mjs`, F01 feel-lock + frozen art, F04 round trip, F05 THE TRAP + HOLD integration, F06, IF-1 contract / services / wake bus / hold bridge / convergence / **zero-change** (flags OFF byte-identical)) | PASS |
| `node tools/release.mjs build` (full release gate: 194 syntax checks, every suite, leak check) | PASS `ra-f1d62eb5be14-…` |
| `node tools/verify-all.mjs --skip-build --require-browser` (loader, artifact, OPEN leak, empty-pack overlay, IF-1 browser smoke 22 checks) | PASS |
| `node tools/f14/run.mjs --dist dist --require-browser` (`RA_PLAYWRIGHT_PATH=/opt/node22/lib/node_modules/playwright`) | PASS — 18/18 authorized routes incl. `F01.play.hold`, `F04.war_room.open`, `F05.trap.run`, `F06.rainmaker.run`; 360/390/430 viewports; 4 PENDING_FRAGMENT (F03, unchanged) |
| `node tools/tests/F04/browser-war-room.mjs` | PASS 18 checks |
| `node tools/tests/if1/hold-bridge-browser.mjs --dist dist` | PASS 40/40 |
| `node tools/tests/f05/hold-browser.mjs` | PASS 30/30 |
| `node tools/loader.mjs verify` · `node tools/leak-check.mjs` | PASS (190 scripts) · PASS |
| `node tools/check-owner-surfaces.mjs --base d5c7869` | PASS (no integration-owner surface changed) |

Specifically verified (harness + suites): **no reward duplication** (F04 consume idempotency, hold bridge exactly-once, repeater == capped player); **no double penalty** (F05 raid receipt; F05 loss stays stash + 30 % unbanked — the castle half-SUPPLY/fifth-of-cash line is still applied by nobody); **reload does not alter the economy** (mid-life save/reload digest byte-identical, incl. recruits); **exactly-once consequences** (F05 / hold-bridge suites untouched and green); **no new softlock** (0 softlocks, 0 invariant violations, 0 phone-action errors across 100 after-lives); **F01 frozen art untouched** (`feel_lock_art` suite; no F01 or `assets/` file in the diff); **F04 / F05 / F06 intact** (their suites and browser paths green).


## 8. OPEN ITEMS — REPAIR / OWNER / SOURCE_REQUIRED (nothing invented)

**R — repairs outside F13's authority (F01 frozen layer); they block a whole-game candidate**
- **R1 — the War Room dies after car losses.** F01 THE PLAY loses cars (CRASH → dealer, WASH / police → impound) into its own embed world (`world_f04.garage.lost`). In embed mode `runEmbedded` (`assets/f01/play/feel-ui.mjs`) calls `AD.pitchFor` — which refuses `NO_CAR` / `NO_CAR_FITS` — **before** the home scene that offers GET IT BACK, so the recovery surface is unreachable from the War Room. Once Supra and Urus are lost (S2000 is the only other mapped car and seats two), every job is refused for the rest of the life. Measured in 9–10 of 10 lives for every persona (median last PLAY: night 29 normal, 12 aggressive). Needs the F01 owner: reach the recovery surface before the refusal (or refuse only after it). Car recovery price stays SOURCE_REQUIRED (S1).
- **R2 — EXTRACT crashes with no car.** `pitchFor` skips `canRoll` for EXTRACT, so with every car lost `carStage` reads `options[0].id` of an empty list (`engine.mjs:252`) → `PLAY_ERROR`; the captive cannot be rescued and goes GONE when the clock expires. Measured in 1–8 of 10 lives before, 0–4 after (fewer after only because the SLOTS cap sends thin crews out less). F01 owner (a guard alone would turn the crash into a refusal; the rescue still needs R1).

**O — owner decisions measured, not changed**
- **O1 — ignoring a raid is free and stops raids** (convergence: "authored unanswered-raid consequence: none by decision"). `raid_dodger`: one raid pending 20–21 nights, no second raid (eligibility refuses while one is pending), production unaffected. A consequence-avoidance loop by decision; Ube to confirm.
- **O2 — a HELD raid pays the HOLD pot** (the bridge banks F01's HOLD band, $8–20K). Raids are net positive for a competent crew (HOLD net +$40K to +$68K per life, mean by persona); the F05 loss bites only on BREACHED / WASH / FELL BACK. Integration decision; the band is F01 content.
- **O3 — first-event / HEAT-to-global / breach-copy items** from FCPB_CONVERGENCE_001 unchanged.
- **O4 — RE-UP and BAIT pay F01 cash** where Vol 7 §3.2 authors none (RE-UP: SUPPLY; BAIT: rival pressure), via F04's PROVISIONAL `PLAY_MAP`. DROP / COLLECT / PROTECT bands sit inside their authored ranges (8–25 / 10–40 / ≥15 $K) — reconciled, no change.
- **O5 — L1 sales for the Day-14 JUG THE PLUG unlock path**: with no ASSOCIATE rank, no December offer and clout LOW, THE TRAP has no channel at Level 1 (corner needs a runner slot, which Level 2 grants) → nothing sells → no level-up. Authored rules; not observed on the harness's ASSOCIATE start.
- **O6 — F05 placeholder trap workers** (`trap_runner_1`…) are also runtime `RACrew.define`s and lose their RACrew definition on reload (their F05 role persists, so selling is unaffected today). Same repair shape as C4, F05-owned.
- **O7 — lost districts never come back.** A district at rival pressure 5 flips to the rival for good (the job board drops it; no job retakes it). Measured: a player who always takes the first card keeps one district. Authored ("you cannot service everything"); flagged because it narrows the War Room to one card for the rest of the life.

**S — SOURCE_REQUIRED (no value invented)**
- **S1** car recovery price (F01 sandbox fee 0; no authored car price; canon-unique list empty) — F03 / F13 when authored.
- **S2** HEAT past ON FIRE has no further consequence (raid cadence fixed at one per 7 nights; Hilt pressure is sealed) — aggressive HEAT 313–655.
- **S3** wired effects for VAULT (runner loyalty never decreases, so skimming never happens), PANIC ROOM (the HOLD bridge always supplies F01's captives, so F05's fallback capture rule never runs), CAMERAS, MONEY COUNTER, AGING RACKS — kept free until wired.
- **S4** what lowers runner loyalty (THE TRAP §7 names skimming, not its trigger).
- **S5** S-grade rare ingredient has no player path (`gainRare` has no caller: Mazda's roost / Agege crumb / fish scale flows are not authored as actions).
- **S6** Level-up job scenes (known, `contentSourceRequired`), trap level thresholds stay PROVISIONAL (healthy, unchanged).
- F07 / M8 / Finale: parked, untouched.

