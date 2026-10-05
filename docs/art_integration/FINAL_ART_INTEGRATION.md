# FINAL ART INTEGRATION — ENGINEERING 03

Branch `claude/final-art-integration`. Status: **READY FOR HQ REVIEW** (not self-approved). Spoiler-safe: ids, screen keys, statuses and metrics only.

## Authorities

| | Authority | Commit |
|---|---|---|
| Starting Engineering/runtime | `claude/hold-clearance-001` (HOLD CLEARANCE 001, 108 PASS / 13 HOLD, 0 Director exceptions) | `a66170218375e52404715789dde48c23726a6044` |
| Frozen Art consumed | `art/art_ship_012_closeout` (ART SHIP 012 CLOSEOUT; includes ART SHIP 011 and ART SHIP 013 at `9d6f521`) | `920912ff3d006c33d9b002d2436b8e1b0ed83f72` |

The two branches diverged at `8eab30d`. The Art side changed only `art_department/` and `assets/`, and the Engineering side changed no file under either, so the Art branch was merged into the Engineering branch (`a55313a`) with no conflicts. After the merge, `git diff 920912f -- art_department assets` is empty: every Art-owned byte is exactly the frozen commit's.

## Assets integrated

| Ship | Runtime id / state | Master | Runtime surface |
|---|---|---|---|
| 013 | `mom.default` | `characters/mom/mom_neutral_80x96.png` | `family_house\|left:mom,mid:rich,right:dad` |
| 013 | `dad.default` | `characters/dad/dad_neutral_80x96.png` | family kitchen + `family_house\|left:dad,mid:rich` |
| 013 | `sister.default` | `characters/sister/sister_neutral_80x96.png` | `family_house\|left:sister,mid:rich` |
| 013 | `portobello_wife.default` | `characters/portobello_wife/…` | A30 wake/bed, breakfast, porch |
| 013 | `portobello_kid1.default`, `portobello_kid2.default` | `characters/portobello_kid1/…`, `…kid2/…` | A30 breakfast, bedtime |
| 013 | `rich.hookah_seated` (corrected) | `characters/rich/rich_hookah_seated_corrected_80x96.png` | HOOKAH (BLLAD33 / HOMIES / ROOKOKO). Continuity polish only. The original `rich_hookah_seated_80x96.png` stays frozen and registered as superseded history. |
| 012C | `portobello_manager.default` | `characters/portobello_manager/…` | A30 office (kpi1–3, approve) |
| 012C | `auntie.default` | `characters/auntie/auntie_register_neutral_80x96.png` | A43 NAIJA MART + repeatable NAIJA |
| 012C | `soul.default` | `characters/ocean_soul/ocean_soul_climbing_80x96.png` | A00 ocean floor ×2 screens |
| 012C | `training_dummy.default` | `characters/training_dummy/…` | `combat:training@throne` (THRONE spar) |
| 012C | `buckhead.default` | `characters/buckhead/buckhead_vampire_neutral_80x96.png` | `combat:buckhead@lennox` |

- **Buckhead:** only the final frozen master is registered. The two REJECTED attempts are in no Engineering map or manifest file list, so the registry cannot ingest them. Their bytes still match `REJECTED_SHA256SUMS.txt`.
- **Maul:** unchanged. `A44_N2` still calls `lil_smack` with `params.hp:60` (HOLD CLEARANCE 001), and `w4.js` is byte-identical to `a661702`. The Art demand map's `combat:training@maul` is stale on this point; the training dummy stages only the throne fight.
- **ART SHIP 011:** registered as a library (`RAArtRegistry.population`, 9 files) with **no runtime assignment**. The release gate now fails if any population file becomes a runtime art reference or is named in runtime code.

## Engineering changes

- `tools/art-registry.mjs`: added ingestion for Ships 011, 013 and 012 CLOSEOUT. Mappings come from each Ship's Engineering Asset Map and are cross-checked against the state definitions, the manifest contact, `ASSET_REGISTER.json` (FROZEN + sha256) and the bytes on disk. A `default` state creates a new identity anchor, and the generator refuses to overwrite an existing one. An alternate state replaces a runtime state only when the map names the exact frozen source it supersedes. Registry: 183 → **204** files.
- `js/data/btf/people.js`: mom/dad/sister/buckhead resolve their new anchors through the existing wiring loop. The Portobello wife, kids and manager, the auntie, the ocean soul and the training dummy are **non-catalog cast** (`RABtfPeople.extras`). They are resolvable by id, but they are never contacts, dates or relationship records. Their names are exactly the speaker labels the runtime already showed.
- `js/data/btf/combat.js`: the `training` card stages `person:'training_dummy'`. The HP, moves and options are unchanged.
- `js/data/btf/adventures/w1_life.js`: the inline auntie definition now uses the existing `byId.x=byId.x||{…}` guard, so the frozen art is not overwritten.
- `tools/presentation/annotations.json`: 11 authored face boxes from pixel inspection, using the skin/feature region convention. The ocean soul and training dummy are `noFace`: a faceless climbing silhouette and a post head, respectively. The corrected hookah state keeps a derived box, like the other five hookah states (minigame canvas, not Director-staged).
- `js/engine/stage.js` + `js/scenes/adventure.js` (generic Director): a node `shot` that names only `speakers` keeps the generic slot compaction and automatic shot selection. A shot that authors `focal`/`profile` stages itself, as before. Pier authors both, so it is unchanged. Before this change, **any** node shot forced the first candidate at runtime while the dry run walked all candidates. That mismatch made live A30 breakfast frame at establishing (0.274) while the dry run reported conversation.
- `js/data/btf/adventures/w5.js` (staging data only; no lines, choices or outcomes changed):
  - A30 `breakfast`/`commute` use `{speakers:['mid','left']}`. Only the wife and Rich speak there, so the kids' child-scale faces don't carry the dialogue face floor.
  - The office manager is mirrored on the right slot (`flip`, a runtime transform) so she faces Rich's pitch. Her frozen pose turns to its right, so unmirrored she gestured off-frame.
- `tools/art-integration.mjs`:
  - The matrix and gate include the non-catalog cast.
  - Population files get the library status and the no-assignment check.
  - States in use now also come from the live census casts. This fixes a pre-existing undercount: A30's spread-built `rich_portobello.presenting`/`porch_seated` have rendered since Ship 010 but were reported as "available".
- Records: `review.json` retires the four Portobello HOLD overrides and the stale mom/dad/sister/buckhead demand notes. It adds PD-FA-03 (HOLD) and NC-FAI-01 (porch polish). The exception list (`presentation.js`) and the regenerated Wave 1 lock record PD-FA-03. The Wave 2 lock is unchanged.

No frozen byte was modified. No story line, choice, outcome, combat number or save field changed.

## Result

| | Start (`a661702`) | Now |
|---|---|---|
| Surfaces (104 adventure + 17 fights) | 108 PASS / 13 HOLD | **120 PASS / 1 HOLD** |
| Adventure Director exceptions | 0 | **1** (PD-FA-03, held for HQ) |
| Placeholder actor slots (dry run) | 13 surfaces with unresolved cast art | **0** |
| Registry / integrated | 183 / 159 (+2 miscounted) | 204 / **172**; 2 superseded (history); 9 library; 4 states available; 4 mapping-ambiguous; 1 ready, no surface |

Of the 13 former HOLDs, **12 cleared**: Portobello office, porch and wake/bed plus the four-actor breakfast; family ×3; NAIJA MART auntie; ocean-floor souls ×2; `combat:buckhead@lennox`; and `combat:training@throne`.

### Remaining HOLD — PD-FA-03 (`portobello_bedroom|left:portobello_kid1,mid:rich_portobello,right:portobello_kid2`, A30 `bedtime`)

All three figures resolve frozen art and read correctly. The beat's speaking kid (kid1) has a frozen child-scale face of 6 source px. That measures 22/24/26 px against the 24/26/28.7 px dialogue face floor at 360/390/430. Clearing the floor needs a body of about 0.444, which is above the conversation consistency ceiling (0.392 ± 5% = 0.412). The one passing option measured, a `close` two-shot of kid1 + Rich, puts kid2 fully off-frame (in-view 0). HQ-AS9-01 classed that kind of choice as creative, so it was not authored. Enlarging the face box to pass would misstate the pixels, so it wasn't done either. Decision: `HQ_DECISIONS.md` HQ-FAI-01.

## QA

- `npm test`: all 18 suites pass, including BTF v12 migration + idempotency, 110 adventures / 258 branch walks, presentation (104 screens: 103 pass + 1 accepted exception; 17 fights), and art integration (204 files, 239 runtime art refs resolve to the register).
- `npm run build` and `npm run verify:artifact`: PASS.
- Frozen hashes, recomputed independently:
  - 224/224 against `art_ship_012_closeout/FROZEN_CORPUS_SHA256SUMS.txt`
  - 219/219 (Ship 013) and 212/212 (Ship 011) against their own sums
  - 224/224 FROZEN register entries
  - the 2 rejected Buckhead files against `REJECTED_SHA256SUMS.txt`
- Dry runs: adventures 103 pass + 1 exception (PD-FA-03), 0 placeholder actor slots; fights 17/17. Locks regenerated. The only Wave 1 change is the bedtime entry, `conversation` → `conversation!PD-FA-03`; no other screen's framing moved.
- Live sweeps (real adventure/combat scenes, 360×740 / 390×844 / 430×932): adventures 103 pass + 1 exception, fights 17/17, 0 page errors. The sweep caught the runtime shot-selection mismatch described above, which was then fixed.
- Built-game QA: this branch's `dist/`, with the build identity asserted against HEAD, save v12 confirmed in-page, and 0 page errors.
  - Played through the real flows with real taps and choices at all three sizes: A00 floor/fall1, A43 arrive/q2/buy, A30 wake/breakfast/commute/kpi1/approve/bedtime/porch/bed, and A53 kitchen/dad/sister. Every beat lints PASS except bedtime (PD-FA-03).
  - THRONE → SPAR shows the frozen training dummy. A44_N2 shows LIL SMACK **60/60** with the frozen sprite. A44_N3 shows the frozen Buckhead. All are combat profile, PASS.
  - HOOKAH BLLAD33 / HOMIES / ROOKOKO show the corrected Rich at native scale, seated and grounded, clear of the score UI.
- Visual review (correct environment, character, state, grounding, scale, transparency, clipping, faces, UI clearance): no placeholders and no clipping; the dialogue box never covers an actor. Adjusted during review: the office manager's facing (mirrored). Recorded, not changed:
  - NC-FAI-01 (porch: the narration has the wife leaning on Rich's shoulder, but her only frozen state is standing);
  - the Portobello cast speaker labels read `PORTOBELLO_WIFE` / `PORTOBELLO_KID1` / `PORTOBELLO_MANAGER`, as before this pass (HQ-FAI-02);
  - the two identical ocean souls could be mirrored for variety, which the Art record allows (optional).
- Regression:
  - Pier and Maul content is byte-identical to `a661702`, and pier stays `conversation` in the lock.
  - Rave, Party, Property, save and state sources are untouched.
  - `btf-browser-test` newgame + adventure: PASS on this `dist/`.
  - `party-browser-test` fails identically on a fresh build of `a661702`. It is a pre-existing baseline failure: the suite expects START → bedroom, while a new game now opens into the prologue.
  - `rave-browser-test` needs the `sharp` module, which this machine doesn't have; Rave sources are unchanged.

Reconciliation audit: `docs/RUNTIME_RECONCILIATION_AUDIT.md`.

## HQ closeout (review of `0f4378f`)

- **HQ-FAI-01 PASS:** PD-FA-03 is an accepted exception: `accept:['face-size']` on that exact screen. Without the exception, the dry run shows face-size as the screen's only failing check.
- **HQ-FAI-02 DEFERRED:** no names are invented.
- **HQ-FAI-03 PASS:** the manager mirror stays; frozen pixels are unchanged.
- **Count correction:** the audit's commit count now uses Git evidence.

**Result:** **121 PASS / 0 HOLD**, 1 accepted adventure Director exception (PD-FA-03).
- Dry run: 103 pass + 1 accepted exception; 0 placeholder actor slots; locks unchanged.
- Live sweeps: adventures 104/104 (bedtime passes at 360/390/430 under PD-FA-03); fights 17/17; 0 page errors.
