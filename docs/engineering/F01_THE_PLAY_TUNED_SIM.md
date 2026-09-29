# F01 — THE PLAY: OL-016 tuned sim (feel-gate build, step 1)

Authority: OL-014 + OL-015 + OL-016. Baseline: `frag/showdown-core/play-spec-001` @ `3abc08c` (the approved 800-PLAY digest, `F01_PLAY_SIM_DIGEST.md`).
Reproduce: `node tools/tests/f01/play-sim/run_tuned.mjs` (≈3.5 min; deterministic — two consecutive runs are identical). Raw output: `tools/tests/f01/play-sim/out/tuned/run_full3.log`, `tuned_summary.json`.

The sim and the browser sandbox now run **one engine** (`js/frag/F01/play/engine.mjs`, world layer `world.mjs`). The port was regression-checked against the approved sim before any OL-016 change was applied (800/800 PLAYs identical on outcome fields; `regress.mjs` now differs by design).

Matrix: 10 job specs × 20 seeds × 4 policies (careful / greedy / naive / random) = 800 PLAYs; careers: 40 careers × 24 nights per policy on the new world layer (nights, captives + EXTRACT clock, RANSOM, turning v1, line memory).

## 1. Result vs. OL-016 targets

| Target | OL-016 | 3abc08c | tuned | verdict |
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
| neither (the approved 3abc08c rules) | 4.97 | 43% | 4.40 |

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

1. **Bail-out is a new rule, not an OL-016 line item.** Retention leans on it more than on the EXTRACT/RANSOM brakes (ablation above). When the last Oga standing is the only one still up after a bad beat, the crew *bails*: no prize, no getaway, everybody out (new failure class **BAILED**, non-win, no captures). It is what let T2 (≤ 8%) and R1 be met without softening the fights. **Underlord/Overlord: ratify or veto.** The alternative is a softer mercy rule; that costs T5 headroom.
2. **T5 is 35.8% against a ≥ 35% floor and leans on one cause.** 256 of the attributable losses are SEAT ("the counter was aboard but in the wrong seat"). That is a real, learnable player choice, but the margin is thin; a small change to tell strength moves it under 35%.
3. **T9 is 8 repeats, not 0.** They occur where a trigger's pool is exhausted inside the 3-PLAY window and the LRU fallback re-serves the oldest line. More variants on the ~5 busiest keys would take it to zero; a sandbox pass does not need it.
4. **R1 tail:** the mean (8.13) and the 95% ≥ 6 clear the target; 2 of 40 random careers still finish below 6 (worst 4). Greedy careers (which take HIT ONE MORE constantly) sit at 7.35 and 80% ≥ 6 — greed *should* cost.
5. **T10 content pool** is not in this build: the feel gate keeps the 3 hand-authored jobs. The sim still runs 10 specs; the gate's Open Mouth Gang share (~58% of the pool) is flagged for F04.
6. **Shape rule:** with only two normal shapes on the gate board (LOUD stick-up, QUIET lift) "never the same shape twice" cannot hold; it is suspended for the gate and logged.
7. **R2** (Vol 7 errata: §3.2 % → risk words; "recruit up to 8" → J.2 seat rule) is the Underlord's document; this build already *shows* risk words instead of percentages (HIT ONE MORE) and applies the J.2 seat rule (cap 9 = 8 base + 1 Koreatown).
8. **R3** persistent PLAY counter lives in the sandbox's own F01 namespace (`localStorage: ra.f01.play.v1.counter`). Wiring it into `save.frag.F01` is an F01/IF-1 integration step, out of scope for the sandbox.
9. Escalation conditions (R1 unreachable / T4 step 2 untemptable without breaking step 1): **neither triggered.**
