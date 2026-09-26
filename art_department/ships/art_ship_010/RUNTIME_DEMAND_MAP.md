# ART SHIP 010 — Runtime Demand Map

**Status:** APPROVED MASTER / FROZEN / COMPLETE — PENDING ENGINEERING INTEGRATION

**Runtime authority:** `claude/art-ship-009-integration` at `5af730a132c035f6f2f5afb20eef5149ca3f2761`

**Live baseline:** 104 adventure screens + 17 fights; **105 PASS / 16 HOLD**

**Machine authority:** `RUNTIME_DEMAND_MAP.json`

## Runtime reconciliation and minimum package

The five Portobello screens require five runtime identities. The repository supplies a named GUIDED visual contract only for `rich_portobello`; this Ship is authorized to execute it. The other four identities have no committed visual cards. Their inline RAPixel placeholder looks are implementation placeholders, not canon authority, so each remains `BLOCKED BY CANON`.

The frozen rooftop master is correct and remains immutable. NC-FA-12 is satisfied at Art-package level by one binary-alpha exact-origin party-crowd condition layer, surface-scoped below Rich and inside the live conversation band.

## Demand summary

| Request | Ticket | Runtime id/state/layer | Authority | Native contract | Exact intended surfaces | Status / expected effect | Engineering mapping |
|---|---|---|---|---|---|---|---|
| AS10-RICH-PORTO-STANDING | NC-FA-07 | `rich_portobello.standing` / default anchor | GUIDED — named authorization | 80×96 RGBA; binary alpha; contact (40,88) | all three Portobello bedroom surface keys | **APPROVED MASTER / FROZEN**; required cast dependency; intentional Rich variant | `people.rich_portobello.default` |
| AS10-RICH-PORTO-PRESENTING | NC-FA-07 | `rich_portobello.presenting` | GUIDED — named authorization | 80×96 RGBA; binary alpha; contact (40,88) | `portobello_office\|left:rich_portobello,right:portobello_manager` | **APPROVED MASTER / FROZEN**; required office state; intentional Rich variant | `people.rich_portobello.states.presenting` |
| AS10-RICH-PORTO-PORCH-SEATED | NC-FA-07 | `rich_portobello.porch_seated` | GUIDED — named authorization | 80×96 RGBA; binary alpha; contact (40,88) | `portobello_porch\|left:rich_portobello,right:portobello_wife` | **APPROVED MASTER / FROZEN**; required porch state; intentional Rich variant | `people.rich_portobello.states.porch_seated` |
| AS10-PORTO-WIFE | NC-FA-07 | `portobello_wife` | no sufficient committed visual card | 80×96/contact (40,88) only after canon | three wife-present Portobello keys | **BLOCKED BY CANON** | `people.portobello_wife` |
| AS10-PORTO-KID1 | NC-FA-07 | `portobello_kid1` | no sufficient committed visual card | 80×96/contact (40,88) only after canon | breakfast + bedtime keys | **BLOCKED BY CANON** | `people.portobello_kid1` |
| AS10-PORTO-KID2 | NC-FA-07 | `portobello_kid2` | no sufficient committed visual card | 80×96/contact (40,88) only after canon | breakfast + bedtime keys | **BLOCKED BY CANON** | `people.portobello_kid2` |
| AS10-PORTO-MANAGER | NC-FA-07 | `portobello_manager` | no sufficient committed visual card | 80×96/contact (40,88) only after canon | office key | **BLOCKED BY CANON** | `people.portobello_manager` |
| AS10-ROOFTOP-PARTY-CROWD | NC-FA-12 | `rooftop_dtla.party_crowd_condition` | OPEN | 270×480 RGBA; binary alpha; exact origin (0,0); behind actors | `rooftop_dtla\|left:rich` | **APPROVED MASTER / FROZEN**; projects 1 HOLD cleared after integration | `environments.rooftop_dtla.layers.party_crowd_condition` |

## Source integrity

- Rich source master: `assets/rich_standing_right.png`, SHA-256 `765170076e8d3a9af9e8857e176e079b2a68c7ee1daafb7c8d551482228f144b`.
- Rooftop source master: `assets/before_the_fame/environments/rooftop_dtla/downtown_la_rooftop_party_270x480.png`, SHA-256 `af41cbb7c045a55848421434e14e9e122dabc61becc2d1c2dcc1fb1ceebf5ebf`.
- Crowd grammar reference: `assets/before_the_fame/environments/hollow_bowl/layers/hollow_bowl_stage_band_crowd_overlay_270x480.png`, SHA-256 recorded in the Ship 009 manifest and Asset Register.

Every source remains read-only. The four approved canonical copies are byte-identical to the Ship candidates; runtime integration remains pending Engineering and QA.

## Projected runtime effect

- NC-FA-12: one held screen can move from HOLD after approval, integration and runtime visual QA.
- Portobello: the Rich dependency is supplied, but all five screens remain held until the four canon-blocked identities exist; the four-actor screen additionally remains subject to PD-W1-04.
- Immediate projected matrix after only this candidate package is accepted and integrated: approximately **106 PASS / 15 HOLD**.

## Explicit exclusions

Family ×3, Naija Mart auntie, ocean-floor souls, Buckhead, training fights, pier staging, other canon-sensitive identities, PLAYMAKERS, SEALED/HQ-only material, audio and runtime code.
