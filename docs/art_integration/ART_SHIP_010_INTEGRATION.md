# ART SHIP 010 — runtime integration

Branch `claude/art-ship-010-integration`, from the frozen Art checkpoint `1c96101` (art: freeze Ship 010 approved candidates), which itself sits on the ART SHIP 009 integration (`5af730a`). This is an Engineering integration and runtime Presentation QA pass. No pixels were generated, regenerated or modified — all 203 frozen bytes verified unchanged against `art_department/ships/art_ship_010/FROZEN_CORPUS_SHA256SUMS.txt`.

## Result

| | Before (5af730a) | After |
|---|---|---|
| Registry (frozen files) | 179 | **183** (+4 Ship 010) |
| Integrated frozen files | 157 | **159**: all 4 Ship 010 assets integrated, none blocked |
| Adventure + fight screens | 121: **105 PASS / 16 HOLD** | 121: **106 PASS / 15 HOLD** |
| Held surfaces cleared | — | **1**: `rooftop_dtla\|left:rich` (NC-FA-12 resolved) |
| Layout exception retired | — | PD-W1-04's `EXCEPTION-LAYOUT` (the four-actor `breakfast` screen now lints clean on the generic Director; see HQ-AS10-01). The screen's PASS/HOLD status is unchanged — still HOLD on NC-FA-07 cast art. |

The forecast (`RUNTIME_DEMAND_MAP.md`) was "approximately 106 PASS / 15 HOLD" — that is exactly the measured result. NC-FA-12 resolved as forecast. The five Portobello screens stay HOLD as forecast: Rich's dependency is supplied, but `portobello_wife`, `portobello_kid1`, `portobello_kid2` and `portobello_manager` remain BLOCKED BY CANON with no committed visual card, so no screen fully clears.

## Assets → surfaces

| Request | Runtime | Surfaces | Result |
|---|---|---|---|
| AS10-RICH-PORTO-STANDING | `rich_portobello` (new identity anchor, default/standing) | all 3 `portobello_bedroom` screens | Integrated; screens stay HOLD (NC-FA-07: wife/kid1/kid2 still placeholders) |
| AS10-RICH-PORTO-PRESENTING | `rich_portobello.presenting` | `portobello_office\|left:rich_portobello@presenting,right:portobello_manager` | Integrated; HOLD (NC-FA-07: manager still placeholder) |
| AS10-RICH-PORTO-PORCH-SEATED | `rich_portobello.porch_seated` | `portobello_porch\|left:rich_portobello@porch_seated,right:portobello_wife` | Integrated; HOLD (NC-FA-07: wife still placeholder) |
| AS10-ROOFTOP-PARTY-CROWD | `environments.rooftop_dtla.layers.party_crowd_condition` | `rooftop_dtla\|left:rich` | **PASS; NC-FA-12 resolved** |
| AS10-PORTO-WIFE / KID1 / KID2 / MANAGER | — | — | **Not generated.** BLOCKED BY CANON: no committed visual card exists for any of the four; no art was invented. Screens they touch stay HOLD. |

`rich_portobello` is registered as its own named character identity in the Art Registry and `js/data/btf/people.js` (distinct from `rich`) — its short-hair look is an intentional, explicitly authorized Portobello-timeline variant, not identity drift, per `HQ_DECISION.md`.

## Engineering changes

- **Registry** (`tools/art-registry.mjs`): added a `ship010()` ingestion path, from `ENGINEERING_ASSET_MAP.json` `maps` (runtime key + surfaces per candidate) and `STATE_LAYER_DEFINITIONS.json` (existence checks only — contacts/origin/dimensions/alpha are re-verified against the frozen `ASSET_REGISTER.json` entry the generic loader already checked against the manifest sha256).
  - `people.<id>.default` creates a **new** named character anchor (refuses to overwrite an existing one).
  - `people.<id>.states.<state>` adds an approved state to that identity; requires the anchor to already exist and the contact to agree with it.
  - `environments.<env>.layers.<layer>` adds an exact-(0,0)-origin, binary-alpha condition layer over an existing frozen environment master; requires the base master to already be registered and the layer name to not already exist.
  - All three paths call the existing `binaryAlpha()` check; the layer path also re-decodes the base PNG and asserts matching dimensions, exactly like the Ship 009 layer path.
- **`js/data/btf/people.js`:** added `rich_portobello` as a named `M(...)` entry (same pattern as `bllad33`/`ogun`) so the generated registry's anchor/states resolve onto it automatically through the existing per-id wiring loop. `portobello_wife`/`kid1`/`kid2`/`manager` were deliberately **not** added to this catalog — they have no frozen art to wire, and `js/data/btf/adventures/w5.js` already renders their RAPixel placeholder `look` inline without needing a catalog entry.
- **`js/data/btf/adventures/w5.js`:** the office (`kpi1`/`kpi2`/`kpi3`/`approve`) and porch (`porch`) nodes now pass `{id:'rich_portobello', state:'presenting'}` / `{..., state:'porch_seated'}` instead of the bare id, so the adapter resolves the approved frozen state. The bedroom nodes (`wake`, `breakfast`, `bedtime`, `bed`) are unchanged and use the default/standing anchor. No dialogue, choices or outcomes were touched.
- **`js/data/art_integration.js`:** `rooftop_dtla` now declares `conditions:['party_crowd_condition']`, the same surface-scoped condition-layer mechanism as `catacomb`/`hollow_bowl`. Draw order is base → condition → actors → UI (enforced by the existing generic renderer in `js/data/btf/environments.js`); the frozen rooftop master is otherwise untouched.
- **`tools/presentation-assets.mjs`:** re-run; the 3 new `rich_portobello` states got **derived** (not authored) face boxes, since none were added to `tools/presentation/annotations.json`. This is a minor polish gap, filed as NC-FA-14 below.
- **`tools/art-integration/review.json`:** updated the 4 pre-existing Portobello HOLD notes (2 bedroom keys, 1 office, 1 porch) to reflect that Rich now resolves and name which companions remain placeholders; the office/porch review keys were renamed to include their new `@presenting`/`@porch_seated` screen-key suffix (screen keys include the resolved state, per `js/data/presentation.js` `screenKey`). Removed the `rooftop_dtla|left:rich` HOLD override now that the beat genuinely passes.
- **`js/data/presentation.js`:** removed the `portobello_bedroom|farRight:...` `PD-W1-04` `EXCEPTION-LAYOUT` entry from `adventure.exceptions`. See HQ-AS10-01 below — this was not a manual tuning decision, it's the release gate's own "no stale exceptions" invariant firing once Rich's real (narrower) geometry let the existing generic slot solver clear the shot band on its own.
- **`docs/presentation/locks/wave1-adventures.json`:** regenerated via `node tools/presentation-adventure-dryrun.mjs --write-lock` (the `breakfast` screen's lock entry changed from `conversation!PD-W1-04` to plain `conversation`; the two office/porch keys picked up their `@state` suffix).

## HQ-AS10-01: PD-W1-04 layout exception retired

See `docs/art_integration/HQ_DECISIONS.md`. Summary: HQ-AS9-01 measured the four-actor `breakfast` screen against Rich-**proxy** placeholder metrics and found no clean Director solve, recommending "wait for the Portobello cast art, then re-run." ART SHIP 010 supplies real Rich geometry only (not the full cast). Re-running the unmodified generic Director against real-Rich + still-placeholder-family now clears `shot-size`/`shot-consistency` at 360/390/430, so the release gate (which asserts the exception list matches the dry run exactly) refused to let the now-unnecessary exception stand. It was removed; no composition was authored or tuned. The screen's PASS/HOLD bucket is unaffected — it stays HOLD under NC-FA-07 because three of its four cast members are still BLOCKED BY CANON placeholders. Visually confirmed in the built game at 360×740/390×844/430×932: all four figures stay on-frame, none clipped or overlapping.

## QA

- `npm test`: **all suites pass**, including `art integration (registry 183 frozen files, 217 runtime art refs resolve to the register, matrix: {"PASS":106,"HOLD":15})` and `presentation (... 104 adventure screens vs Wave 1 lock: 103 pass, 1 accepted exceptions)`.
- `npm run build`: passes, produces `dist/` with the same test suite green.
- `npm run verify:artifact`: passes.
- Frozen-corpus hashes: **203/203 match** `art_department/ships/art_ship_010/FROZEN_CORPUS_SHA256SUMS.txt` (verified independently with a byte-for-byte SHA-256 recompute, not just the checksum tool).
- `node tools/presentation-adventure-dryrun.mjs [--combat]`: adventures 103 pass / 1 accepted exception (`pier`, PD-FA-02, unrelated to this Ship); fights 17/17 pass.
- **Live visual QA** (built game, real dev server, real adventure scenes — not a synthetic test page) at 360×740, 390×844 and 430×932:
  - `ROOFTOP_DTLA` `arrive`: the party-crowd condition layer reads clearly as a rooftop party (silhouetted guests along both side walls, behind the low wall, under the string-light band), Rich stays fully readable in front and centered on the walkway, the crowd never overlaps or occludes him, and the dialogue box does not obstruct the world viewport at any size. **PASS at all three sizes.**
  - A30 `wake`/`breakfast`/`kpi1` (`presenting`)/`porch` (`porch_seated`): each new Rich-Portobello state renders correctly (short-hair intentional variant, contact-anchored, no seam/clipping against the placeholder companions). **PASS.**
  - A30 `breakfast` (the four-actor screen): all four actors stay on-frame with no clipping/overlap at all three sizes, confirming the HQ-AS10-01 lock-file result visually, not just numerically.

## Remaining HOLD (15)

| Category | Count | Screens |
|---|---|---|
| Mixed: unresolved cast art (NC-FA-07) | 11 | Portobello ×5 (`breakfast` four-actor screen, 2 more bedroom keys, office, porch); family ×3; `naija_mart` auntie; ocean-floor souls ×2 |
| Combat mixed cast (NC-FA-07) | 3 | `combat:buckhead@lennox`, `combat:training@maul`, `combat:training@throne` |
| PD-FA-02 (staging, HQ; unrelated to this Ship) | 1 | `pier\|left:rich@holding_fish_away,right:uncle_sunday@fishing` |

No environment is a placeholder on a live screen. Tickets: `docs/presentation/NEEDS_CREATIVE.md` (NC-FA-12 resolved; NC-FA-07 unchanged; new polish note NC-FA-14) and `docs/art_integration/HQ_DECISIONS.md` (HQ-AS10-01).
