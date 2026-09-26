# HOLD CLEARANCE 001 — Engineering micro-pass

Branch `claude/hold-clearance-001`, from the HQ-accepted checkpoint `8eab30d` (ART SHIP 010 integration + NC-FA-14). Two audited HOLDs only. No art was generated, no frozen bytes changed, and the other 13 HOLDs are untouched.

## Result

| | Before (8eab30d) | After |
|---|---|---|
| Adventure + fight screens | 121: **106 PASS / 15 HOLD** | 121: **108 PASS / 13 HOLD** |
| Held surfaces cleared | — | `combat:training@maul` → `combat:lil_smack@maul`; `pier\|left:rich@holding_fish_away,right:uncle_sunday@fishing` |
| Director exceptions | 1 (`pier`, PD-FA-02) | **0** |

## 1 — Maul / Lil Smack

The A44_N2 Maul fight is narrated as Lil Smack but called the generic `training` enemy (no person, so no art). `js/data/btf/adventures/w4.js` now calls the existing `lil_smack` enemy card, whose person resolves the frozen ART SHIP 005 `lil_smack` anchor (the same art as the already-passing `combat:lil_smack@food_court`).

- **HP:** the authored encounter HP is preserved with the engine's existing encounter-level override, `params.hp:60` (`js/engine/combat2.js` `create`: `hp:params.hp||e.hp`). No new machinery. The Food Court Lil Smack is unchanged at the card's 70.
- **Tuning consequence (not changed; HQ owns numbers):** the fight now uses Lil Smack's own move set (CHEW ATTACK 14 + accuracy down, CRUMB SPRAY 8) instead of the dummy's BONK 8. A seeded 20-run simulation with the default loadout: 20/20 wins in both cases, same average turns to win (2.95), Rich finishes with 77.8 HP on average vs 84.4 before (≈6.6 more damage taken). All three outcomes still route to `won`, so no story outcome changes.
- **Octopus options** are now Lil Smack's card options (none spare him), whereas the dummy's options spared. The adventure's outcome routing is outcome-agnostic (`win/lose/spared → won`), so this has no story effect.
- **`lilSmackGone`** (set by A56 when Lil Smack leaves "until the fame") is written once and read nowhere in the codebase. A44/A44_N2 do not check it, so ordering-wise Lil Smack can appear at the Maul after A56. This is a pre-existing, content-wide ordering question (the Maul narration already names him, independent of the enemy id); it is not caused or fixed by this change. Reported for HQ/Story; not in scope.

## 2 — Pier (PD-FA-02)

Only `A12:react` failed: two wide frozen poses (Rich's fish at arm's length, Uncle Sunday's rod) could not reach the conversation band under the default two-focal staging.

- **Fix:** an authored node `shot` on `A12:react` using existing Director capability: `{profile:'conversation', focal:['left'], speakers:['left']}`. Rich is the focal subject (the beat's narration and only line are his). Both frozen poses and the cast are unchanged; Uncle Sunday is not swapped to his neutral pose.
- **`include:['right']` was tried first and rejected.** At the default slots it misses the band (body 0.296, shot-consistency −0.245). Authored closer positions reach the band only at a spacing ≤ 76 world units, which puts Rich's fish arm ~17 source px into Uncle Sunday's body. That is not clean, so it was not used.
- **Result:** dry run conversation at 360/390/430, body 0.407/0.410/0.403, no failing checks. Uncle Sunday stays on-frame at the right edge as the secondary figure: face and body readable, only his rod runs off-frame.
- **Retired:** the `PD-FA-02` `EXCEPTION-LAYOUT` entry in `js/data/presentation.js` and the pier HOLD entry in `tools/art-integration/review.json`. The release gate's "no stale exceptions" check required both once the screen passed. `docs/presentation/locks/wave1-adventures.json` records the screen as `conversation`.

## QA

- `npm test`, `npm run build`, `npm run verify:artifact`: pass.
- Presentation dry run: adventures **104/104 pass, 0 exceptions**; fights **17/17 pass** (`lil_smack@maul` replaces `training@maul`). Locks regenerated with `--write-lock` / `--combat --write-lock`.
- Art integration matrix: **108 PASS / 13 HOLD**.
- Live built-game QA (real dist server, real adventure flow):
  - **Pier `A12:react`**, entered through arrive → teach → LEARN → PIER minigame → react at 360×740, 390×844 and 430×932: runtime Director lint conversation, body 0.389/0.41/0.40, **0 failing checks** once the scene settled. Rich's speech bubble reads clearly above him. On entering the beat, Uncle Sunday takes the scene's standard 0.5 s stepped move from the previous beat's framing to his mark (existing reframing behavior).
  - **Maul A44_N2**, played to completion at 390×844: LIL SMACK 60/60 with the frozen `lil_smack_eating` sprite on the frozen Maul background, combat profile, 0 lint failures; won in 3 turns (Rich 78/100), then routed to `won`.
- QA harness note: the browser pane did not advance CSS transition clocks while idle, so runtime `placement` lint read mid-transition positions until the animations were finished or a tap forced a relayout. The same reading appeared on the untouched `arrive` beat. It is a harness artifact, not a runtime defect.

## Remaining HOLD (13)

11 adventure screens with unresolved cast art (NC-FA-07: Portobello ×5, family ×3, `naija_mart` auntie, ocean-floor souls ×2) and 2 combat screens (`combat:buckhead@lennox`, `combat:training@throne`).
