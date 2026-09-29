# F01 — THE PLAY: OL-016 tuned sim (feel-gate build, step 1)

Authority: OL-014 + OL-015 + OL-016. Baseline: `frag/showdown-core/play-spec-001` @ `fb3ff8a` (the approved 800-PLAY digest, `F01_PLAY_SIM_DIGEST.md`).
Reproduce: `node tools/tests/f01/play-sim/run_tuned.mjs` (≈3.5 min; deterministic — two consecutive runs are identical). Raw output: `tools/tests/f01/play-sim/out/tuned/run_full3.log`, `tuned_summary.json`.

The sim and the browser sandbox now run **one engine** (`js/frag/F01/play/engine.mjs`, world layer `world.mjs`). The port was regression-checked against the approved sim before any OL-016 change was applied (800/800 PLAYs identical on outcome fields; `regress.mjs` now differs by design).

Matrix: 10 job specs × 20 seeds × 4 policies (careful / greedy / naive / random) = 800 PLAYs; careers: 40 careers × 24 nights per policy on the new world layer (nights, captives + EXTRACT clock, RANSOM, turning v1, line memory).

## 000. OL-023 — FEEL LOCK re-run

Seating is now automatic and visible presentation is the feel lock; the full re-run (T1–T5, T9, T13, R1, BAILED / FALL BACK invariants) and the T5 lever breakdown are in **`F01_THE_PLAY_FEEL_LOCK.md` §11**. Reproduce: `node tools/tests/f01/play-sim/run_tuned.mjs`. Headline: T2 3.9 / 18.8 / 7.5 % · T5 **36.9 %** (SWAP 220, WEAPON 130, CAR 55, CALLS 144, TRAIT 45) · T13 80.0 / 67.5 / 12.5.

## 00. OL-022 — FALL BACK v1 (HOLD THE HOUSE) and the T2 bands

T2 is now judged in three bands (OL-022). FALL BACK is the defense-only last-stand exit: HOLD THE HOUSE / defense only (never routine offense, never BIG PLAY) · crew at start ≥ 2 · exactly 1 able Oga and ≥ 1 downed · nobody already dead · before the resolution phase · automatic. 0 able stays the WASH-equivalent defense loss. Outcome: the house resolves BREACHED, the raid product is lost, banked money untouched, 0 captures, 0 deaths, the downed come home WOUNDED, base HEAT only, own state (`fellBack` / klass `FELL_BACK` / getaway `FALL_BACK`) — never BAILED / ROBBED / JUGGED, and separate in stats, telemetry, lines (`fallback:line`, 8 variants) and the report card. Headline: **FELL BACK — THE HOUSE IS HIT, THE CREW ISN'T**. Predicate: `engine.mjs › fallBackEligible`.

| metric | OL-020 | OL-022 | target | |
|---|---|---|---|---|
| T2 routine offense | 5.5% | **5.5%** | ≤ 8% | ✔ |
| T2 BIG PLAY | 20.0% | **20.0%** | ≤ 20% | ✔ (at the line) |
| T2 HOLD THE HOUSE | 26.3% | **6.3%** | ≤ 8% | ✔ |
| T2 global (informational) | 9.0% | 7.0% | — | |
| T1 generic death | 10.8% | **10.4%** | 10–12% | ✔ |
| T3 SPLIT | 5.9% | 5.9% | 4–6% | ✔ |
| T5 player-attributable | 35.7% | **36.3%** | ≥ 35% | ✔ |
| T13 careful / naive / gap | 83.5 / 67.5 / 16.0 | **83.0 / 67.0 / 16.0** | 70–85 / 55–70 / ≥ 12 | ✔ |
| strict-call gap | 0.55 | 0.54 | ≥ 0.4 | ✔ |
| R1 random mean / ≥ 6 / worst | 8.30 / 100% / 6 | **8.25 / 100% / 6** | ≥ 95% ≥ 6, worst ≥ 4 | ✔ |
| R1 careful ≥ 6 | 100% | 100% | 100% | ✔ |
| T9 repeats within 3 PLAYs | 0 | **0** of 73,635 (182 triggers all pool > 3 × max) | 0 | ✔ |
| HOLD careful / naive win | — | **90.0% / 65.0%** (greedy 5.0%, random 50.0%; n = 20 each) | — | |

HOLD FALL BACK rate by policy: careful 5.0% · naive 30.0% · greedy 45.0% · random 40.0% (30.0% overall; WASH 8.8%). Invariants: 0 violations over 39 FELL BACK PLAYs; 0 BAILED on defense. `tools/tests/f01/fallback.test.mjs` (15 requirement groups, 1,000 PLAYs, 27 FELL BACK) — **invariant violations: 0**. Note a FELL BACK HOLD is a non-win (the win-rate figures above count only HELD / COSTLY). The HOLD sample is 20 PLAYs per policy; treat those win rates as directional.

BIG PLAY presentation: the pitch card carries a gold BIG PLAY tag, and the CAR screen shows a BIG PLAY plate + a crew line about the stakes before GO (no percentages; J.1 unchanged — a named Oga lost on a BIG PLAY is GONE, never DEAD). The gate board ships no BIG PLAY, so a QA-only hook offers it: `?devbig=1` or ☰ → DEV MODE → OFFER THE BIG PLAY, or `window.__raPlay.forceBig()`.

## 0. OL-020 correction pass (supersedes §1 and §3.1 where they differ)

BAILED is **RATIFIED WITH BOUNDS** (canonical v1). One predicate owns it (`engine.mjs › bailEligible`): routine OFFENSE PLAY only (never BIG PLAY, never HOLD THE HOUSE) · crew at start ≥ 2 · **exactly 1** able Oga and ≥ 1 downed · nobody already dead · GETAWAY has not begun · automatic (no player call). 0 able is a WASH, always. Outcome: the unbanked pot is lost, banked money untouched, 0 captures, 0 deaths, the downed come home WOUNDED, job base HEAT only, no retaliation credit, own state (never robbed / ROBBED / JUGGED). The bailer gets one CREW BOOK memory, **GOT EVERYBODY OUT** (no stat, no XP). Headline everywhere: **BAILED — NOBODY LEFT BEHIND**. T9 pools resized (181 triggers, every pool > 3 × its max uses in one PLAY; 116 genuinely new lines; no Rich lines).

Rerun (`run_tuned.mjs`, deterministic, base fb3ff8a + OL-020):

| metric | OL-016 build | OL-020 | target | |
|---|---|---|---|---|
| T1 generic death | 10.6% | **10.8%** | 10–12% | ✔ |
| **T2 named CAPTURED** | 5.8% | **9.0%** | ≤ 8% | **✖ FAIL** |
| T3 SPLIT | 5.4% | **5.9%** (HOOPTIE 11.9%, URUS 4.0%, SUPRA 3.1%) | 4–6% | ✔ |
| T4 step 1 / 2 / 3 EV | +16.0 / −7.8 / −93.6 | **+16.2 / −8.5 / −94.7** (aggregate +21.8% / −7.0% / −49.1% of pot; step-2 jackpot 14.0%) | + / −10…0% / clearly − | ✔ |
| T5 player-attributable | 35.8% | **35.7%** | ≥ 35% | ✔ (thin) |
| T13 careful / naive / gap | 81.5 / 66.0 / 15.5 | **83.5 / 67.5 / 16.0** | 70–85 / 55–70 / ≥ 12 | ✔ |
| strict-call careful−naive gap | 0.55 | **0.55** (calls off 0.19) | ≥ 0.4 | ✔ |
| R1 random: mean / ≥ 6 / worst | 8.13 / 95% / 4 | **8.30 / 100% / 6** | ≥ 6 in ≥ 95%, worst ≥ 4 | ✔ |
| R1 careful ≥ 6 | 100% | **100%** (mean 8.82, worst 7) | 100% | ✔ |
| T9 repeats within 3 PLAYs | 8 | **0** of 73,760 uses | 0 | ✔ |

BAILED rate — 800-PLAY matrix by policy: careful 7.5% · greedy 10.5% · naive 14.5% · random 18.0% (all 12.6%, 101 of 800). Careers: careful 5.8% · greedy 10.7% · naive 14.5% · random 14.2% (all 11.3%). Invariants checked on all 563 BAILED PLAYs in the run: 0 violations (`tools/tests/f01/bailed.test.mjs` asserts the same on a 480-PLAY matrix that includes BIG PLAY and HOLD THE HOUSE).

**T2 fails, and the cause is the ruling itself, not a tuning slip.** Excluding BIG PLAY and HOLD THE HOUSE from BAILED removes the last-stand exit from the two jobs whose crews are most often overrun:

| named CAPTURED share | |
|---|---|
| routine offense jobs (8 specs) | **5.5%** (≤ 8% ✔) |
| BIG PLAY (counting_house) | 20.0% |
| HOLD THE HOUSE | 26.3% |
| BIG PLAY + HOLD pooled | 23.1% (WASH 24.4% vs 4.5% routine) |
| all 800 PLAYs | **9.0%** |

Per OL-020 no other rule was loosened to compensate. The gate build itself ships no BIG PLAY (HOLD THE HOUSE is one of its three jobs). Rulings needed: (a) measure T2 on routine offense PLAYs only (5.5% ✔) with BIG PLAY / HOLD tracked as their own bands, or (b) a different exit for those two job classes. Not chosen here.

## 1. Result vs. OL-016 targets (the OL-016 build; see §0 for OL-020)

| Target | OL-016 | fb3ff8a | tuned | verdict |
|---|---|---|---|---|
| T1 generic death (PLAYs with a generic aboard) | ~10–12% | 24.9% | **10.6%** | ✔ |
| T2 named CAPTURED (share of PLAYs) | ≤ 8% | 18.0% | **5.8%** | ✔ |
| T3 SPLIT | 4–6%, higher on HOOPTIE / low-NERVE driver | 1.8% | **5.4%** (HOOPTIE 11.5%, URUS 3.2%, SUPRA 2.5%, S2000 0%) | ✔ |
| T4 step 1 EV | positive | +11.2 | **+16.0** (+21.5% of pot) | ✔ |
| T4 step 2 EV | −10%…0% of pot, ~15% visible jackpot | −35.5 | **−7.8** (−6.5% of pot aggregate); jackpot share **14.0%** | ✔ |
| T4 step 3 EV | clearly negative, success ⇒ LEGENDARY | −102.2 | **−93.6** (−48.7%); success guarantees a LEGENDARY crate | ✔ |
| T5 player-attributable losses | ≥ 35% | 18.5% | **35.8%** | ✔ (thin — see caveat 2) |
| T8 retaliation share of next-temptation cards | ≤ 20% | — | **6.3%** | ✔ |
| T9 line repeats within 3 PLAYs | 0; ≥ 4 variants per trigger | — | **8 repeats in 72,852 line uses (0.011%)**; 0 uncovered triggers; 0 thin keys; 1,492 distinct lines; top line 1.8% | ◐ near-zero, not zero (caveat 3) |
| T13 careful / naive / gap | 70–85 / 55–70 / ≥ 12 pts | 85.0 / 70.0 / 15.0 | **81.5 / 66.0 / 15.5** | ✔ |
| R5 strict-call careful−naive skill gap | ≥ 0.4 | — (digest reported calls-off 0.08) | **0.55** (calls off: 0.20) | ✔ |
| R1 random-career roster retention | ≥ 6 of 9 | 2.25 of 9 (careful 8.15) | **8.13 of 9** mean; ≥ 6 in **95%** of careers; worst career 4 | ✔ mean / ◐ tail |

Other: nothing-happened PLAYs 5.1% (strict); story-beat 94.1%; blame-broad 97.3%; funny/dramatic 55.1%.
Win bands: careful 81.5%, naive 66.0%, random 50.0%, greedy 20.5%. WASH careful/naive 4.5% / 5.5%.
Next-temptation mix over the campaigns: RARE_PITCH 446 · RECRUIT 123 · DEMAND 105 · RESCUE 51 · RETALIATION 50 · INTEL 25.

### R1 — death-spiral brakes (career retention, 40 careers × 24 nights)

| policy | roster end (of 9) | careers ≥ 6 | worst | lost per career | ransom paid | EXTRACT wins |
|---|---|---|---|---|---|---|
| careful | 8.70 | 100% | 7 | 0.03 | 0.00 | 0.65 |
| naive | 9.00 | 100% | 9 | 0.03 | 0.00 | 0.85 |
| greedy | 7.35 | 80% | 3 | 0.78 | 0.42 | 0.30 |
| **random** | **8.13** | **95%** | 4 | 0.45 | 0.25 | 0.63 |

Ablation on the random policy (what actually carries retention):

| arm | roster end | careers ≥ 6 | lost/career |
|---|---|---|---|
| all OL-016 brakes | 8.13 | 95% | 0.45 |
| no EXTRACT/RANSOM brakes | 7.38 | 83% | 1.70 |
| no last-stand bail-out | 7.10 | 88% | 1.00 |
| neither (the approved fb3ff8a rules) | 4.97 | 43% | 4.40 |

## 2. What was implemented

- **R1a** one EXTRACT rescues every captive taken in the same PLAY (a single captive *group* with one clock, `world.applyResult`).
- **R1b** EXTRACT never counts against the nightly job cap (the board shows EXTRACT cards beside, not among, tonight's pitches).
- **R1c** RANSOM on the clock's last night: `25 + 0.8·HEAT + 10·captives` ($K); a captive stays GONE only if Rich can't or won't pay.
- **Mercy** tightened to at most ONE named CAPTURED per routine PLAY (BIG PLAY exempt).
- **R5** BEEF cut; low-divergence calls cut; strict call gate (best-vs-worst button gap ≥ 3.6 over 6 common-random-number futures) is the default. Calls are the skill.
- **T5** enemy tells (`content.mjs → TELLS`): charge / flank / silver / aura. Each has ≥ 1 counter that is *visible on the car screen*; a seated counter halves the tell; an aboard-but-wrong-seat counter is attributed SEAT, a counter left at home CHOICE.
- **T6** CLEAN WIN → NO SCRATCH bonus crate + crew flex line + VampGram brag. **T7** FOLD always leaves a STORY seed / returning intel / small cash. **T8** retaliation ≤ 20% of next-temptation cards. **T11** turning v1: free seat only, ≤ 1 willing generic/PLAY, never a named human, 3-night cooldown. **T12** kickers gear / rare / WEIRD only. **T9** every trigger ≥ 4 variants with context tokens; same-PLAY dedupe + 3-PLAY memory (`world.recent`). Empty beats collapse to a ~1.5 s caption. Cars that can't seat the crew are disabled. Thin traits widened per §K.
- **HOLD THE HOUSE** runs on a CASTLE pseudo-car (DOOR / HALL L / HALL R / INNER), no getaway (AFTERMATH: HELD / BREACHED).

## 3. Honest caveats — read before ratifying

1. **(Superseded by OL-020 — see §0.)** *Bail-out was a new rule, not an OL-016 line item.* Retention leans on it more than on the EXTRACT/RANSOM brakes (ablation above). When the last Oga standing is the only one still up after a bad beat, the crew *bails*: no prize, no getaway, everybody out (new failure class **BAILED**, non-win, no captures). It is what let T2 (≤ 8%) and R1 be met without softening the fights. **Underlord/Overlord: ratify or veto.** The alternative is a softer mercy rule; that costs T5 headroom.
2. **T5 is 35.8% against a ≥ 35% floor and leans on one cause.** 256 of the attributable losses are SEAT ("the counter was aboard but in the wrong seat"). That is a real, learnable player choice, but the margin is thin; a small change to tell strength moves it under 35%.
3. **T9 is 8 repeats, not 0.** They occur where a trigger's pool is exhausted inside the 3-PLAY window and the LRU fallback re-serves the oldest line. More variants on the ~5 busiest keys would take it to zero; a sandbox pass does not need it.
4. **R1 tail:** the mean (8.13) and the 95% ≥ 6 clear the target; 2 of 40 random careers still finish below 6 (worst 4). Greedy careers (which take HIT ONE MORE constantly) sit at 7.35 and 80% ≥ 6 — greed *should* cost.
5. **T10 content pool** is not in this build: the feel gate keeps the 3 hand-authored jobs. The sim still runs 10 specs; the gate's Open Mouth Gang share (~58% of the pool) is flagged for F04.
6. **Shape rule:** with only two normal shapes on the gate board (LOUD stick-up, QUIET lift) "never the same shape twice" cannot hold; it is suspended for the gate and logged.
7. **R2** (Vol 7 errata: §3.2 % → risk words; "recruit up to 8" → J.2 seat rule) is the Underlord's document; this build already *shows* risk words instead of percentages (HIT ONE MORE) and applies the J.2 seat rule (cap 9 = 8 base + 1 Koreatown).
8. **R3** persistent PLAY counter lives in the sandbox's own F01 namespace (`localStorage: ra.f01.play.v1.counter`). Wiring it into `save.frag.F01` is an F01/IF-1 integration step, out of scope for the sandbox.
9. Escalation conditions (R1 unreachable / T4 step 2 untemptable without breaking step 1): **neither triggered.**
