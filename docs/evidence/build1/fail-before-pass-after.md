# Repair tests: fail on 8a1dc98, pass on the candidate

Runner: `node <scratch>/one.mjs <repoRoot> <test file>` (imports the test and calls `test(root)`), once on a detached worktree of `8a1dc98` with only the new test file copied in, once on the candidate.

## Repair 3a — F07 finale Phase 1 (OL-029 F) — `tools/tests/f07/phase1_phone.test.mjs`

| Tree | Result |
|---|---|
| 8a1dc98 | `FAIL tools/tests/f07/phase1_phone.test.mjs - Phase 1 scene = the existing narration recast with no Rich-as-actor (no new facts)` |
| candidate | `PASS f07 Phase 1 (OL-029 F): THE PARTY is a PLAY Rich watches on his phone from the owambe: no Rich-as-actor/hazard in scene, feed or stage cards; PLAY seam; THE OFFICE unchanged` |

Code change: `js/frag/F07/m8_and_finale.js`, node `party` of `NEW_OGA_FINALE` (2 lines recast, no Rich as subject/target; 4 insertions, 2 deletions). No F01 file, number or feel changed.

## Repair 3b — F15 (OL-031) — `tools/tests/f15/ol031_roster.test.mjs`

After OL-037 (Rainmaker §5 rotation helper removed; it ships with Rainmaker's ten) this repair needs **no F15 code change**: all three dancers are on stage every WAKE, there is no REQUEST mechanic, and Emerald L3's lost item is already the recital sheet music. The test therefore **passes on 8a1dc98 and on the candidate** (it is a guard, not a fail-before test):

| Tree | Result |
|---|---|
| 8a1dc98 | `PASS f15 OL-031: three dancers on stage every WAKE (no rotation / lineup logic), no REQUEST mechanic, Emerald L3 lost item = recital sheet music` |
| candidate | same PASS |

(Before OL-037 an earlier version of this test, which also asserted the dormant rotation helper, failed on 8a1dc98 with `c.RAF15.stageLineup is not a function`; that helper and assertion were removed.)
