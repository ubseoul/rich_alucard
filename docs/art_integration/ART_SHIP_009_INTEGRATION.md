# ART SHIP 009 — runtime integration

Branch `claude/art-ship-009-integration`, from the frozen Art checkpoint `art/art_ship_009` @ `c55483b`. This is an Engineering integration and runtime Presentation QA pass. No pixels were generated, regenerated or modified. The report is spoiler-safe. Reviewer captures live in the git-ignored `work/presentation_census/REVIEWER_ONLY/as9/`.

## Result

| | Before (c55483b) | After |
|---|---|---|
| Registry (frozen files) | 167 | **179** (+12 Ship 009) |
| Integrated frozen files | 145 | **157**: all 12 Ship 009 assets integrated, none blocked |
| Zero-pixel reuse | — | `lan_night → tristan_apt` (registry alias; no bitmap duplicated or renamed) |
| Adventure + fight screens | 121: **98 PASS / 23 HOLD** | 121: **105 PASS / 16 HOLD** |
| Held minigame surfaces cleared | — | **1**: `minigame:hookah?company=HOMIES` (NC-FA-11) |
| Polish-note screens | 0 | **2** (`la_sky`, `lan_night`) |

Art forecast about 111 PASS / 10 HOLD. The measured result is 105 / 16. Seven screens cleared. Six forecast screens did not:
- **Portobello ×5.** The three environment masters integrate and frame cleanly, but every Portobello figure (`rich_portobello`, wife, two kids, manager) is an inline RAPixel placeholder with no approved art. That's the existing NC-FA-07 cast dependency. It was hidden behind the placeholder environment and is now the blocker.
- **`rooftop_dtla|left:rich`.** The beat is a rooftop party, and the master is an empty rooftop. The frame reads as no party, so it's held under a new Art ticket, NC-FA-12.

## Assets → surfaces

| Request | Runtime | Surfaces | Result |
|---|---|---|---|
| AS9-ENV-ATL-HOUSE-PARTY | `atl_house_party` master, contact y=372 | `atl_house_party\|left:rich,right:bunmi` | PASS |
| AS9-ENV-LA-SKY | `la_sky` master, contact y=372 (cloud-bank flight plane) | `la_sky\|left:rich,right:mazda_human` | PASS (POLISH NOTE, NC-FA-13) |
| AS9-REUSE-LAN-NIGHT | `lan_night` → registry `tristan_apt` (alias) | `lan_night\|left:rich,right:tristan` | PASS (POLISH NOTE, PD-AS9-01) |
| AS9-ENV-NAIJA-LOT | `naija_lot` master | `naija_lot\|left:rich,right:nneka` | PASS |
| AS9-ENV-NEIGHBOR-CASTLE | `neighbor_castle` master | `neighbor_castle\|left:rich` | PASS |
| AS9-ENV-PORTOBELLO-BEDROOM | `portobello_bedroom` master | 3 bedroom screens | Integrated; HOLD ×3 (NC-FA-07 cast; the four-actor screen also PD-W1-04) |
| AS9-ENV-PORTOBELLO-OFFICE | `portobello_office` master | `portobello_office\|left:rich_portobello,right:portobello_manager` | Integrated; HOLD (NC-FA-07 cast) |
| AS9-ENV-PORTOBELLO-PORCH | `portobello_porch` master | `portobello_porch\|left:rich_portobello,right:portobello_wife` | Integrated; HOLD (NC-FA-07 cast) |
| AS9-ENV-ROOFTOP-DTLA | `rooftop_dtla` master | `rooftop_dtla\|left:rich` | Integrated; HOLD (NC-FA-12) |
| AS9-ENV-TOKYO-TEASE | `tokyo_tease` master | `tokyo_tease\|mid:rich` | PASS |
| AS9-HOLLOW-STAGE-BAND-CROWD | `hollow_bowl` condition `stage_band_crowd_condition`, after the Ship 008 `crowd_condition` | `hollow_bowl\|left:rich` (live key includes the runtime companion) | PASS; **NC-FA-10 resolved** |
| AS9-TUNDE-HOOKAH / AS9-DRE-HOOKAH | `tunde.hookah_seated`, `dre.hookah_seated` | `minigame:hookah?company=HOMIES` (A41 crew roof) | PASS; **NC-FA-11 resolved** |

Every environment master was checked with its live cast on the y=372 contact line at base depth 1. All are walkable except `la_sky`, where the line is the cloud-bank flight plane Art proposed.

## Engineering changes

- **Registry** (`tools/art-registry.mjs`):
  - Ingests Ship 009 from its Engineering Asset Map `entries` and `STATE_LAYER_DEFINITIONS`, never from filenames.
  - Environment masters must be 270×480 opaque RGB, and an id can't take a second master.
  - The stage-band layer must have an exact (0,0) origin, binary alpha and matching surfaces in the map and the definition. Its base must be the registered `hollow_bowl` master, and it can't replace an existing layer.
  - Character states need an existing identity anchor and a contact that agrees between the map and the definition.
- **Zero-pixel reuse:** the reuse row adds `aliases:['lan_night']` to the `tristan_apt` registry entry, after verifying three things:
  - the map's reuse path is the frozen `tristan_apt` master;
  - the manifest's `zero_pixel_reuse` sha256 matches it;
  - `lan_night` has no art of its own.

  `js/data/art_integration.js` maps `lan_night:env('tristan_apt')` through the existing environment path, and the runtime id keeps its own title ("TRISTAN'S · 4 A.M."). The release gate fails if any runtime id presents another id's master unchanged without a registry alias, or if an approved alias isn't integrated.
- **Hollow Bowl:**
  - Draw order is `conditions:['crowd_condition','stage_band_crowd_condition']`, giving base → seating crowd → stage-band crowd → actors → UI. The gate asserts this order.
  - The layer stays surface-scoped through the existing node table, so it still activates when A41 binds its companion at runtime (`hollow_bowl|left:rich,right:<person>`).
  - **Director staging:** while these layers are active, the pair is registered to the open stage apron, `left` x=108 and `right` x=164, on the unchanged contact line. This is the same layer-registered slot mechanism as the Ship 008 café. The reason is below.
- **HOOKAH** (`js/minigames/hookah.js`):
  - `company==='HOMIES'` draws Tunde on the existing company seat (90,388) and Dre on Rich's other side (181,388), at native 1:1 on their (40,88) contacts.
  - They sit above the score lines and clear of the antenna target, with no flip, no scaling and no standing-anchor fallback.
  - Dialogue lines, gameplay, targets, scoring and Rich's seated state are unchanged. Rookoko is still drawn only for an explicit ROOKOKO company.
- **Director metadata:** authored face boxes for the two seated states (`tools/presentation/annotations.json`).
- **Matrix/reviewer record:** the matrix is regenerated from the live runtime. Reviewer decisions are in `tools/art-integration/review.json`.

## NC-FA-10: Hollow Bowl in real framing

A41 always binds the picked companion, so the real frame is the two-shot. At the default slots (72/198) the stage-band crowd was integrated but hidden. The two actors stand directly in front of both flanks (x≈0–95 and ≈172–270 on y≈244–311). Measured at 390×844, the layer changed only 1.9% of the stage viewport, in edge strips. Staging the pair on the open apron between the flanks puts the audience beside them on both sides, below the Ship 008 seating tiers. The frame now reads as the packed amphitheater the beat narrates. Lint passes at 360/390/430, both solo and with the companion (body 0.389/0.410/0.400). Frozen pixels are untouched and the contact line is unchanged.

## PD-W1-04: Portobello four-actor staging

This was reviewed with the Director on the real `portobello_bedroom` master. The four figures are placeholders, so the Director measures them with Rich-proxy metrics.

| Shot | Body (360/390/430) | Result |
|---|---|---|
| Generic default (slots compacted to 83/135/187/227) | 0.359 | In the conversation band, but `shot-consistency` −8.5% vs the reference. **Fails.** |
| Authored conversation, all four focal | 0.322 | `shot-size` and `shot-consistency` fail |
| Authored establishing, all four | 0.274 | Between bands. Fails |
| Authored conversation, Rich + wife focal, kids included | 0.322 | Fails |
| Authored conversation, Rich + wife focal only | ≈0.41 | Lint passes, **but both kids leave the frame**. The beat narrates the two kids, so this is a creative staging call, not a clean solve |

**Result: HOLD.** The Director can't close it cleanly:
- The only lint-clean shot drops half the narrated cast.
- Any authored staging now would be tuned to placeholder metrics. Kid sprites are expected to be narrower and shorter, and would give the generic compaction more slack.

See the HQ ticket, `docs/art_integration/HQ_DECISIONS.md` HQ-AS9-01. The screen is also HOLD for NC-FA-07 cast art.

## QA

- `npm test`, `npm run build` and `npm run verify:artifact` pass.
- Frozen-corpus hashes: 199/199 match `art_department/ships/art_ship_009/FROZEN_CORPUS_SHA256SUMS.txt`. `git diff` shows no change under `assets/` or `art_department/`.
- Live Director sweeps (Playwright, real scene) at 360×740 / 390×844 / 430×932:
  - Adventures: 104/104 pass, with the 2 accepted exceptions (PD-FA-02, PD-W1-04) unchanged.
  - Fights: 17/17 pass.
  - 0 page errors, 0 PROVISIONAL combat notes.
- Wave 1 and Wave 2 locks are unchanged: no adventure or fight shot changed profile.
- **Cold enters in the built game (true viewports):**
  - A41 `arrive` with the runtime companion: both crowd layers active in order, lint pass ×3.
  - A50 `arrive` (`lan_night`) presents the `tristan_apt` master under its own title: pass ×3.
  - A32 `night` (`la_sky`): pass ×3.
  - A41 `roofgame` launches HOOKAH with `company:'HOMIES'`: Tunde, Rich and Dre are seated.
  - Every other adventure screen and fight also cold-enters through the sweep.
  - In the in-app browser pane, `placement` lint again flags rendered-vs-camera offsets. That's the known pane scaling artifact; the Playwright true-viewport runs are authoritative and pass.
- **Visual review** of every changed screen:
  - the 9 environment screens plus `lan_night` and all 5 Portobello screens;
  - Hollow Bowl solo and with its companion, before and after the layer and before and after the apron staging;
  - HOOKAH HOMIES.
- **Regressions:** none. Previously passing screens keep their locked shots. The Hollow Bowl slot registration applies only while its mapped layers are active. HOOKAH BLLAD33, ROOKOKO and default paths are unchanged.

## Remaining HOLD (16)

| Category | Count | Screens |
|---|---|---|
| Mixed: unresolved cast art (NC-FA-07) | 14 | Portobello ×5 (the four-actor bedroom screen is also PD-W1-04); family ×3; `naija_mart` auntie; ocean-floor souls ×2; `combat:buckhead@lennox`, `combat:training@maul`, `combat:training@throne` |
| NC-FA-12 (new Art ticket) | 1 | `rooftop_dtla\|left:rich` |
| PD-FA-02 (staging, HQ) | 1 | `pier\|left:rich@holding_fish_away,right:uncle_sunday@fishing` |

Placeholder environments no longer hold any screen. The four remaining placeholder ids (`catacomb_dead`, `atl_airport`, `ocean_night_flight`, `halloween`) have no current census screen.

Tickets: `docs/presentation/NEEDS_CREATIVE.md` (Ship 009 re-evaluation: NC-FA-10/11 resolved; new NC-FA-12, NC-FA-13, PD-AS9-01) and `docs/art_integration/HQ_DECISIONS.md` (HQ-AS9-01).
