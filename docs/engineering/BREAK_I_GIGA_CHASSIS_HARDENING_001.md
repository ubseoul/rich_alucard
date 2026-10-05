# BREAK I — GIGA CHASSIS HARDENING 001

Engineering 06-follow-on. Branch `deepseek/break-i-giga-chassis-hardening-001`. Spoiler-safe: ids, systems, routes and
outcomes only. No SEALED / HQ-SECRET / PLAYER-BLIND material was inspected; Ogun's Rave and The Property are referenced
only as released/PLAYER-BLIND outcome-flag flows, exactly as the existing tooling does.

| | |
|---|---|
| Base SHA | `627d85a2691e978e5b8e026070317d6365c6eb55` (accepted OPEN runtime authority) |
| Requested base | `44eae54f7c3fc27c384aa4350fe3a0369a162883` — **unavailable** on `origin` (`not our ref`) and in the local clone |
| Save schema | v12, unchanged |
| `main` | untouched |
| Frozen art | unchanged (matrix 265 PASS / 1 HOLD; no `assets/` byte changed) |

**SOURCE NOTE (base commit).** The brief asked to base on the "later documentation-only audit" `44eae54`. That SHA does
not exist in this clone or on `origin` (verified: `git fetch` → `upload-pack: not our ref`; `git branch -r --contains` →
no such commit). Because it was described as documentation-only, this patch bases on the runtime authority `627d85a`; no
runtime behaviour differs between a documentation-only commit and the authority it documents.

---

## EXECUTIVE RESULT

The chassis is now **materially more trustworthy**. The previous QA layer could report **green while a minigame did no
meaningful play** — the baseline run below proves it: the old harness returned **0 findings** while TOUGE, SLURP, GARAGE,
PIER, HOOKAH and PICKUP all finished with no score/reward/purchase/catch. Six of nine scored minigames were false-green.

This pass closes that class of false green (result/reward/state assertions + real input paths derived from each
minigame's source), proves synthetic adventure outcomes are actually consumed, adds a real Combat 2 win through browser
decisions, verifies the suspicious A17 / RE_VIEWING / Cammile paths in the built game, fixes a confirmed dead
Thanksgiving gate and a duplicate ONLYVAMPS launcher, and improves TOUGE/HOOKAH learnability without touching balance.

No economy, progression, canon, relationship or content-exposure tuning was changed. All such findings from the prior
practical-reachability audit remain **intentionally deferred** (see below).

---

## QA FALSE-GREENS CLOSED

### FG-1 — Scoring minigames passed without any gameplay (A1/A3)

- **Prior weakness.** `playMinigame` only asserted that the run *ended*; the sole "input worked" check was
  `canvas changed`, which is always true because every minigame animates while idle. A minigame could launch, animate,
  time out and QUIT and still be green.
- **Implementation.** Each scored minigame now has a semantic success condition (`MG_EXPECT`) read from the returned
  launch result — `score`, accumulated `rewards`, or `finish` `data` — and `assertMinigameResult()` raises a
  `PLAYTEST BLOCKER` when the mechanic did not land. Canvas change is demoted to a rendering diagnostic only.
- **Evidence it catches failure.** Baseline (`qa_mg_baseline`, old harness): **0 findings** with
  `touge score 0`, `garage rewards {}`, `pier rewards {}`, `slurp score 0`, `hookah score 0`, `pickup score 0 (lose)`.
  With the new assertion those six are `MINIGAME-NO-SCORE` / `MINIGAME-NO-CONSEQUENCE` / `MINIGAME-NO-CATCH`.
  Hardened run (`qa_mg_new`): **0 findings** with real results (below).

### FG-2 — Broken automated inputs (A2)

- **Prior weakness.** TOUGE never drove; SLURP dragged ingredients to nowhere; HOOKAH flicked a wobble; BARS tapped stale
  coordinates; PICKUP tapped randomly.
- **Implementation.** Real gestures derived from each minigame's source (see MINIGAME HARDENING).
- **Evidence.** Baseline TOUGE `score 0` → hardened TOUGE `score 258.55`; baseline SLURP `score 0` → hardened `score 1`
  and `$8`; baseline GARAGE no purchase → hardened `money −$1,200` + `parts:{tires}`; baseline PIER no reward →
  hardened `items:{fish_common:1}` + `vp:RICH_FIRST_FISH`.

### FG-3 — Synthetic adventure outcomes could be ignored (A5)

- **Prior weakness.** The headless branch walker feeds fixed minigame/fight results; a node that dropped the result would
  still walk green.
- **Implementation.** `tools/btf-test.mjs` — FU-03 block: `afterMinigame` must route to the authored next node, apply the
  reward to the life money record, and store the result in the adventure vars; `afterFight` must route win/lose/spared
  and store `fight`.
- **Evidence it catches failure (red→green).** On a scratch copy of the file with `rewards:{money:1234}` changed to
  `rewards:{}`, the run fails with `AssertionError: A08: a synthetic minigame reward must reach the life money record`.
  Restored file: `PASS btf propagation …`.

### FG-4 — Starvation was silently green (A6)

- **Prior weakness.** `coverage-sim` reported only errors; never-offered / dead-button findings could hide behind
  "no errors".
- **Implementation.** `simulate()` now returns a `warnings[]` with `NEVER-OFFERED`, `OFFERED-NOT-TAKEN`, `DEAD-BUTTONS`,
  printed as `WARNING [CODE]`. This is a diagnostic, **not** a release failure — exposure is intentionally not balanced.
- **Evidence.** The CLI prints the warning lines; the release gate still treats the sim as observational.

---

## MINIGAME HARDENING

Each browser run is now proven by its **own mechanic's result**, read from the launch result (`rewards` / `score` /
`data`). Inputs are derived from source, not guessed:

| Minigame | What the test now does | What it now proves |
|---|---|---|
| TOUGE | Keyboard throttle (`ArrowUp`) + pointer steer (left-half drag) + `Space` e-brake; waits for the game's own `results` phase, then DONE | A drift score is produced (258.55) and the run reaches `results` |
| SLURP | Serves the opening ticket through the real `BOWL_ZONE` (x190-254,y150-206), then clocks out | `bowlsServed ≥ 1` (score 1) and `$8` paid |
| HOOKAH | Two smooth centred holds: full-lung big ring, then a short-lung smaller ring (passes-through stack) | `sessionStack ≥ 2` (score 2) |
| BARS | Taps all four real choice-chip cells (2×2 at x69/197, y217/281) each round | A landed rhyme chain (score 33100) |
| JOLLOF | Unchanged cook sequence (verified to score) | A scored dish (average 30) |
| PICKUP | Hold-release to shoot; the same spot is DONE once decided | A made basket and a decided win (score 11, outcome win) |
| HATCH | PLAY (inventory-independent ~10s care moment) then DONE | A real `dragonActions` care action, and the dragon state changes |
| PIER | Pulse-cast/tap/reel; I'M GOOD ends after a landing | A landed catch (`fish_common`, first-fish VP), progress cleared first so the catch is this session |
| GARAGE | TIRES row → BUY INSTALL → close → DONE | A real purchase: `money −$1,200`, `parts:{tires}` installed |

Baseline vs hardened, one line each (`touge/slurp/garage/pier/hookah/pickup`): `0/0/no-buy/no-catch/0/0` → `258.55/1/−$1200+tires/fish/2/win`.

---

## COMBAT PROOF

- **Fight used.** ⌂ CASTLE → THE THRONE ROOM → **SPAR WITH A TRAINING DUMMY** (`enemy:'training'`, `noPenalty`). This is
  an ordinary, non-prologue OPEN Combat 2 encounter; Hilt/A23 were not used.
- **Decisions.** Real browser input: FIGHT (main menu) → BLOOD BATH (move) each turn; octopus prompts answered if shown.
- **Outcome.** Won in **3 turns**; `playtest-qa --only combat` → 0 findings.
- **Resulting state.** The win is **recorded**, not merely that the scene closed:
  `life.history` contains `{type:'fight', enemy:'training', outcome:'win'}`; the SPAR adventure resolves and returns to
  an idle bedroom; invariants clean.
- **Not done.** No combat rebalance, no new moves, no enemy weakening, no special-attack redesign.

---

## TARGETED RUNTIME PATHS

### A17 — WORKING
Real Combat 2 loss → `a17Pending` → refresh → A17 on the next wake.
- Route: GO SOMEWHERE → THE GRAVE → A18 ("THE FOOD COURT LINE IS ALL ONE GUY"), lost on purpose by only returning
  stored damage (REVENGE) against a higher-HP enemy (40 KEVINS, 260 HP) — Rich cannot out-damage it. No balance change.
- Evidence: `[a17] real loss -> a17Pending set -> survived refresh -> A17 on the next wake (nneka met true)`. The flag
  sets, persists across a real reload, and the wake trigger runs A17. **NO CHANGE.**

### A57 — WORKING (mechanism verified); exposure note
Real travel flow → milestone → wake.
- Route: A07's real route beat offers `DRIVE THE <CAR>` for an owned car; `applyRoute()` on a `car:` option calls
  `RANodd.maybeStop()`, which increments `drives` and, at `drives % 8 === 3`, sets `noddPending`.
- Evidence: with two prior drives seeded (state only) and one owned car, choosing the real DRIVE option advanced
  `drives` to **3**, set **`noddPending`**, the flag **survived a refresh**, and the next wake ran A57.
  `playtest-qa --only a57` → **0 findings**: `[a57] real car route -> drives 3 -> noddPending -> survived refresh ->
  A57 on the next wake`.
- **Exposure note (not changed).** OPEN offers `car:` routes on only two near destination beats (A07, A41); far
  destinations (ATL/Powder Springs) offer fly/dragon only. `drives` therefore cannot reach the 3rd-drive milestone in an
  ordinary single life. This is a content/pacing observation, not a runtime defect — the milestone math is correct.
  Per the brief, the pacing/number of stops was **not** changed. `HQ REVIEW` if the milestone should surface in OPEN.

### RE_VIEWING — WORKING
- `playtest-qa --only realestate`: with the Shannon lane open (Paloma fourplex owned) the RE app offered **4 listings**;
  `SEE IT` opened `RE_VIEWING`; the viewing resolved back to an idle bedroom with **refresh diff 0**. No prices, down
  payments or affordability were changed.

### CAMMILE — WORKING
- Cammile's required `met` state is established by a **valid current OPEN path**: the released JDM-imports / "I Want a
  Supra" acquisition's docks meeting (`js/systems/people.js`, `js/data/world_events.js` docks event, and
  `legacy_bridge.js` for migrated saves). `A_CAMMILE1` / `ARC_CAMMILE_*` are therefore gated behind completing that
  released acquisition. No new meeting scene was invented; no content reconstructed. (No defect found.)

### THANKSGIVING (A53) — FIXED
- **Confirmed dead gate (red).** `playtest-qa --only ending` against the pre-fix build:
  the ending fired on the sleep after Day 35, "THE NEXT MORNING" continued play at Day 36 with `fameFired true`, the
  ending did not replay, and **A53 was not eligible at Day 57** → `FINDING A53-DEAD-GATE`. Cause: A53 required
  `day>=57 && !fameFired`, but the ending sets `fameFired` around Day 36, so the condition can never be true in
  legitimate continuation.
- **Smallest correction.** Removed only the contradictory `!fameFired` exclusion from A53's `available` and its wake
  trigger (`js/data/btf/adventures/w5.js`). Nothing else changed: no date move, no fame timing/requirement change, no
  ending change, no economy change, no A53 rewrite.
- **Regression + evidence (green).** Headless FU-04 in `btf-test.mjs` asserts A53 is available at Day 57 with
  `fameFired true` and its wake trigger fires. Browser: `[thanksgiving] A53 becomes eligible at Day 57 during post-fame
  continuation`.

---

## PLAYER-COMPREHENSION FIXES

### TOUGE (`js/minigames/touge.js`)
- Added a concise first-time control cue drawn on the canvas — `HOLD UP = GAS`, `LEFT / RIGHT = STEER`,
  `E-BRAKE = SLIDE` — that appears for the first few seconds and **hides as soon as the player uses any input**; plus a
  small `DRIFT` indicator while a scoring slide (>15°) is held.
- No physics, scoring, difficulty, art or tutorial changes; reuses existing `RAPixel.text`.

### HOOKAH (`js/minigames/hookah.js`)
- Added a first-throw hint (`HOLD TO INHALE / FLICK UP SMOOTH`) and a per-release verdict line: **WOBBLY - FLICK UP,
  SMOOTH** (faint ring) vs **CLEAN RING** / **STACKED!** (clean ring). This surfaces the existing smooth-vs-wobbly
  distinction so a first-time player can learn it by playing.
- The smoothness formula, wobble threshold, stack rule and scoring are **unchanged**; reuses existing text primitives.

### SLURP
- Not changed. The corrected real serve path exposes no bug; the previous zero score was a harness defect.

---

## OTHER CONFIRMED BUGS FIXED

- **Duplicate ONLYVAMPS launcher (E1).** Reproduced first: `js/scenes/phone.js` renders the canon row (which always
  includes ONLYVAMPS) **and** an `extras` grid of non-canon registered apps. `apps_core.js` registers ONLYVAMPS with
  `canon:true`, but `w4.js` re-registered the real renderer **without** `canon:true`, so the registry entry became
  non-canon and the app appeared **twice** once unlocked. **Fix:** add `canon:true` to the w4 registration — the real
  renderer stays in the canon row and out of the extras grid. Verified: `[onlyvamps] exactly one launcher on the phone
  home`; page opens with 4 creator tiles and Velvet present. Velvet and existing ONLYVAMPS behaviour are preserved.

---

## INTENTIONALLY DEFERRED (NOT changed)

Per the brief and the prior practical-reachability audit, the following remain untouched — they are hidden-patch-load
questions, not this pass:

- Starting money, recurring income, budget/income cadence.
- Room prices (incl. Party Hall $250K), car prices, RichBoi prices/thresholds, property prices/down payments.
- Fame minimum day, safety day, dimension thresholds, spark threshold, overall life length.
- Relationship ladder thresholds (COOL/CLOSE/RIDE), decay, ARC relationship requirements and ARC want
  priority/weighting, general want-pool weighting.
- Late-game schedule and Day 30–35 clustering; date frequency; castle-room affordability.
- Content starvation as a whole (Party Hall → hosting/Bonesworth/Dragon-Night; A33 rep gate; RichBoi branch; upper-room
  experiences; A52/A58/A55 narrow windows). The audit's exposure warnings are now **visible** in `coverage-sim`, but no
  exposure tuning was performed.
- A57 stop pacing (see the exposure note above — flagged for HQ, not changed).

**Hilt / A23 / A23R were not touched (D3 in force).**

---

## FULL TEST EVIDENCE

Commands (Windows; Playwright browser `chromium-1134`, tool `playwright-core`):

- `node tools/release.mjs build` → **PASS** (test gate + build). Includes:
  - `PASS btf (… 113 adventures validated, 314 branch walks)`
  - `PASS btf propagation (… FU-03)` and `PASS btf thanksgiving gate (… FU-04)`
  - `PASS reachability (113 adventures; 19 route proofs; no player entry: none)`
  - `PASS presentation (… 249 adventure screens … 248 pass, 1 accepted exceptions)`
  - `PASS art integration (registry 391 frozen files, … matrix {"PASS":265,"HOLD":1})`
  - `PASS mid-life fixtures (4 simulated v12 saves …)` and `PASS deterministic release gate (111 … checks)`
  - `PASS built ra-627d85a2691e-…`
- `playtest-qa --only minigames` (hardened) → **0 findings**; recorded results as in MINIGAME HARDENING.
- `playtest-qa --only combat` → **0 findings**; SPAR win recorded.
- `playtest-qa --only a17` → **0 findings**; `a17Pending` → refresh → A17.
- `playtest-qa --only a57` → **0 findings**; `drives 3` → `noddPending` → refresh → A57.
- `playtest-qa --only realestate` → **0 findings**; 4 listings, viewing resolves, refresh diff 0.
- `playtest-qa --only onlyvamps` → **0 findings**; exactly one launcher.
- `playtest-qa --only ending` → **0 findings**; A53 eligible at Day 57 post-fame (was red pre-fix).
- Baseline (pre-hardening) `playtest-qa --only minigames` → **0 findings** with 6/9 minigames doing no meaningful play
  (the false-green evidence).
- `coverage-sim` (long-life) → runs clean (0 content errors, 0 stranded adventures, ending functional); starvation
  warnings surfaced separately and **not** treated as failure. Example output:
  `WARNING [NEVER-OFFERED] 34 — A00 A17 A23 … ROOST` and `WARNING [DEAD-BUTTONS] 1 — tacos`.

Remaining warnings: practical-reachability starvation warnings (by design, not failures); the `A57` car-route exposure
note; and the pre-existing "coverage-sim cannot exercise `RAPropertyQuest` headless" limitation (covered now by the
browser `realestate` scenario).

---

## FILES CHANGED

| File | Why |
|---|---|
| `tools/playtest-qa.mjs` | A1–A4 minigame result assertions + real gestures; B combat-win scenario; C1 A17, C2 A57, C3 real-estate, C4-adjacent; D ending/A53 gate check; E1 ONLYVAMPS scenario; `instrument` now records `data` |
| `tools/btf-test.mjs` | FU-03 synthetic-outcome propagation; FU-04 Thanksgiving-gate regression |
| `tools/pilot/coverage-sim.mjs` | A6 starvation/dead-button warnings surfaced |
| `js/minigames/touge.js` | F1 first-time control cue + DRIFT indicator (presentation only) |
| `js/minigames/hookah.js` | F2 smooth-vs-wobbly feedback + first-throw hint (presentation only) |
| `js/data/btf/adventures/w4.js` | E1 ONLYVAMPS registered `canon:true` (duplicate launcher fix) |
| `js/data/btf/adventures/w5.js` | D A53 dead-gate fix (remove contradictory `!fameFired`) |
| `docs/engineering/BREAK_I_GIGA_CHASSIS_HARDENING_001.md` | This report |

---

## AUTHORITY / SAFETY CHECK

- No SEALED / HQ-SECRET / PLAYER-BLIND material inspected.
- No hidden patches touched.
- **No Hilt change** (A23/A23R gating untouched; D3 in force).
- **No economy rebalance** (prices, income, fame timing, thresholds unchanged).
- **No frozen art change** (no `assets/` byte changed; art-integration gate PASS, same matrix).
- **No `main` change.**
- Save schema v12 unchanged.

---

## FINAL GIT STATE

(filled at commit time)

| | |
|---|---|
| Branch | `deepseek/break-i-giga-chassis-hardening-001` |
| Base SHA | `627d85a2691e978e5b8e026070317d6365c6eb55` |
| Final SHA | _(reported in the return)_ |
| `git status` | clean after commit |
| Worktree | `rich_alucard_break_i_giga_chassis_hardening_001` |
