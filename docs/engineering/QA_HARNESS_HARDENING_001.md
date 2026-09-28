# QA HARNESS HARDENING 001

Status: **complete — QA/test harness changes only.** No gameplay, content, save-schema, SEALED or PLAYER-BLIND code was
touched. Nothing merged or deployed.

| | |
|---|---|
| Branch | `qa-harness-hardening-001` (from the accepted runtime baseline) |
| Base SHA | `627d85a2691e978e5b8e026070317d6365c6eb55` |
| Final SHA | `f0cfabd5dc67315e1ad983f5bb5d7ebe1db0cc57` (the hardening changeset; the branch head carries this report plus the one-line follow-up that records this value) |
| Files changed | `tools/playtest-qa.mjs`, `tools/btf-test.mjs`, `tools/pilot/coverage-sim.mjs` (3 files) |
| Gameplay changed | none |
| Worktree | clean apart from the commit (generated `dist/` and `work/` are gitignored) |

## 1. Why

The false-green audit (`RICH ALUCARD — QA FALSE-GREEN / LIMIT TEST AUDIT`) found that the browser harness reported
minigames as "finished naturally" while the automated player scored 0 and never performed the intended mechanic, and
that every headless walker substituted synthetic minigame/fight outcomes. The harness could not distinguish "the run
ended" from "the mechanic worked". This pass fixes that class in the test layer only.

## 2. Every false-green fixed

| # | False green (before) | Fix (after) |
|---|---|---|
| 1 | `scenarioMinigames` recorded `score` but never asserted it. | `assertMinigameResult` asserts a non-zero result per scoring minigame (TOUGE drift score, SLURP `bowlsServed`, HOOKAH `sessionStack`, BARS score, JOLLOF dish average, PICKUP decided outcome). |
| 2 | Reward/state consequences (hatch, pier, garage) were captured but never asserted. | HATCH asserts a `dragonActions` care action; PIER asserts a landed catch (items/money/memories); GARAGE asserts an installed part (`data.parts`). |
| 3 | `canvasResponded` (a pixel hash) was the only "input landed" signal; every minigame animates, so it never fired. | The `MINIGAME-STATIC` canvas-change finding is replaced by the result/state assertions above. `canvasResponded` is kept only as a recorded diagnostic. |
| 4 | TOUGE/SLURP/HOOKAH/BARS gesture scripts sent inputs the games ignore. | TOUGE drives with the keyboard (throttle/e-brake/countersteer); SLURP drags a broth+topping into the bowl then taps SERVE; HOOKAH does a full hold then a brief hold (a real ring stack); BARS taps the actual rhyme-chip rectangles. |
| 5 | Only the prologue CEO fight was ever fought; non-prologue combat was random clicks. | `scenarioCombatWin`: ⌂ CASTLE → THE THRONE ROOM → SPAR WITH A TRAINING DUMMY won via FIGHT → BLOOD BATH, asserting the win is recorded in `life.history`. |
| 6 | All headless walkers fed fixed minigame/fight outcomes with no check that they reached state. | New `btf` propagation test asserts a minigame reward reaches life money, the result is stored in adventure vars, routing uses the authored next node, and a fight outcome routes win/lose/spared. |
| 7 | `coverage-sim` computed never-offered / never-completed / dead buttons but only printed them. | `simulate()` returns a `warnings` array and the CLI prints `WARNING [NEVER-OFFERED|NEVER-COMPLETED|DEAD-BUTTONS] …`. |

## 3. Files changed

- `tools/playtest-qa.mjs` — repaired gesture scripts (TOUGE SLURP HOOKAH BARS, plus HATCH/GARAGE/PICKUP), `holdAt`
  helper, `instrument` captures `ctx.finish` `data`, `MG_EXPECT` + `assertMinigameResult`, new `scenarioCombatWin`
  (+ wiring and usage comment).
- `tools/btf-test.mjs` — `FU-03` synthetic minigame/fight outcome propagation assertions.
- `tools/pilot/coverage-sim.mjs` — coverage `warnings` surfaced as explicit WARNING lines (and in the JSON). No
  gameplay change was required by any item; nothing was referred to HQ review.

## 4. Before / after behaviour

| Minigame | Before (false green) | After (asserted) |
|---|---|---|
| TOUGE | Stationary press + tap → throttle/steer = 0, score **0**, "finished" via the 90s timer. | Keyboard drive → drift, score **917.1**, "first clean drift" memory. |
| SLURP | Dragged to x40–230 (bowl is x190–254), never served → **0** bowls, "finished" via CLOCK OUT. | Drag broth+topping to the bowl, tap SERVE → **1** bowl, **+$8**, `jollofRamenOnMenu` flag. |
| HOOKAH | 80px drag reads as "wobbly" → never stacks, score **0**, "finished" via I'M GOOD. | Full-hold then brief-hold → **stacked** ring, score **2**. |
| BARS | Tapped y300–460 (chips are at y190–308) → score ≈ **0**, "finished" via the 60s timer. | Taps all four chip rectangles → score **23400**. |
| HATCH | Random button taps; no care action guaranteed or checked. | PLAY → **a real `dragonActions` play** (`dragonChanged` true). |
| PIER | Reward captured, unasserted. | **A landed catch** (`items.fish_common`, "first fish"). |
| GARAGE | Random tap + DONE, no purchase, unasserted. | Buys TIRES → **money −1200**, `parts.tires`. |
| PICKUP | One low-meter shot then STOP, unasserted. | 10 full-meter shots → **win**, score 10. |
| JOLLOF | Score recorded, unasserted (already ~30). | **Asserted** score 30 > 0. |
| Combat (non-prologue) | Only the prologue CEO fight; everything else random. | **SPAR win** recorded in `life.history` (`enemy:'training'`, `outcome:'win'`) after 3 FIGHT→BLOOD BATH turns. |

## 5. Exact test evidence

**Release gate** — `npm test` (headless; all suites PASS, including the new line):
```
PASS btf propagation (minigame reward+result reach life/adventure state; fight outcome routes win/lose/spared)
PASS btf (v12 migration + idempotency, calendar Oct 1/Oct 31/Nov 26/full moons/rain, clock budget+rent+family, 113 adventures validated, 314 branch walks)
PASS presentation (… 249 adventure screens vs Wave 1 lock: 248 pass, 1 accepted exceptions)
PASS reachability (113 adventures; 19 route proofs; no player entry: none)
PASS mid-life fixtures (4 simulated v12 saves: idempotent migration, load, 4 sleeps each, 52 route plays, round trip)
PASS deterministic release gate (111 JavaScript syntax checks, save fixtures, recovery, opportunity access)
```

**Browser minigame QA** — `node tools/playtest-qa.mjs --only minigames` → **0 findings** (all nine, both modes):
```
touge  play: score 917.1  (progress saved)
bars   play: score 23400
slurp  play: score 1, moneyDelta +8, advAfter A08,A_HINA1
hookah play: score 2
jollof play: score 30
pickup play: outcome win, score 10
hatch  play: rewards dragonActions [{type:play,game:fetch}], dragonChanged true
pier   play: rewards items.fish_common 1, memories [first fish]
garage play: moneyDelta -1200, rewards parts.tires
[minigame-lab] 9 entries open+quit; every mode returnScene bedroom, reloadDiff 0
```

**Real combat path** — `node tools/playtest-qa.mjs --only combat` → **0 findings**:
```
[combat] throne SPAR won through FIGHT -> BLOOD BATH in 3 turns (win recorded in life.history)
```

**Existing behaviour unchanged** — `node tools/playtest-qa.mjs --only migration,routes --route hina` → **0 findings**:
```
[migration] all 8 fixtures → v12, refresh diff 0; supraPaused skips the prologue
[route] hina: {"completed":{"A08":true,"A_HINA1":true},"reloadDiff":0}
```
(The `hina` route reaches A08 → the SLURP minigame → A_HINA1, so it also exercises the repaired SLURP input through
`drive()`.)

**Coverage warnings** — `node tools/pilot/coverage-sim.mjs --days 20 --seeds 1 --personas explorer,party --quiet`:
```
WARNING [NEVER-OFFERED] …
WARNING [NEVER-COMPLETED] …
WARNING [DEAD-BUTTONS] tacos
ERRORS: 0
```

## 6. Items that required HQ review

**None.** Every item was fixed in the test layer. Specifically: TOUGE already exposed keyboard input
(`ArrowUp`/`Space`/arrows in `js/minigames/touge.js`), SLURP's first-shift tutorial already accepts any bowl, HOOKAH's
smoothness rule already yields a clean ring for a no-flick hold, and BARS/HATCH/GARAGE/PICKUP/combat all expose the
player controls the harness now uses. No `GAMEPLAY CHANGE REQUIRED — HQ REVIEW` was raised.

Open UX/teaching observations from the false-green audit (TOUGE's unlabeled drag controls; HOOKAH's invisible
smooth-flick threshold) remain **player-facing evaluation** items — they are not mechanical defects and are out of
scope for a harness-only pass.

## 7. Protections

`git diff --stat` vs the base touches only `tools/playtest-qa.mjs`, `tools/btf-test.mjs` and
`tools/pilot/coverage-sim.mjs`. `js/`, `assets/`, `art_department/`, `index.html`, save schema and all content are
unchanged. No SEALED / HQ-SECRET / PLAYER-BLIND material was opened or modified.
