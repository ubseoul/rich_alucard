# ART SHIP 013 — Runtime Demand Map

Status: **CANDIDATE — HQ REVIEW REQUIRED**. This map is not approval and does not clear any HOLD.

Runtime authority is the frozen-checkpoint integration record at production base `c6a49410e558be34aa44703015556c00a4e592c9`, including `docs/art_integration/INTEGRATION_MATRIX.json` and `docs/presentation/NEEDS_CREATIVE.md`.

| Request | Ticket | Runtime identity/state | Authority | Source candidate | Native contract | Intended held surface(s) | Expected opportunity | Engineering key |
|---|---|---|---|---|---|---|---|---|
| AS13-01 | NC-FA-07 | `mom` default/neutral | OPEN + explicit Ube card | `mom_neutral_80x96.png` | 80×96 RGBA; binary alpha; contact (40,88) | `family_house\|left:mom,mid:rich,right:dad` | dependency toward 1 HOLD | `people.mom.default` |
| AS13-02 | NC-FA-07 | `dad` default/neutral | OPEN + explicit Ube card | `dad_neutral_80x96.png` | 80×96 RGBA; binary alpha; contact (40,88) | family kitchen + dad conversation keys | dependency toward 2 HOLD screens | `people.dad.default` |
| AS13-03 | NC-FA-07 | `sister` default/neutral | OPEN + explicit Ube card | `sister_neutral_80x96.png` | 80×96 RGBA; binary alpha; contact (40,88) | `family_house\|left:sister,mid:rich` | dependency toward 1 HOLD | `people.sister.default` |
| AS13-04 | NC-FA-07 | `portobello_wife` default/neutral | GUIDED Portobello + explicit Ube card | `portobello_wife_neutral_80x96.png` | 80×96 RGBA; binary alpha; contact (40,88) | two bedroom keys, breakfast key, porch key | dependency toward 3 distinct held surface keys | `people.portobello_wife.default` |
| AS13-05 | NC-FA-07 | `portobello_kid1` default/neutral | GUIDED Portobello + explicit Ube card | `portobello_kid1_neutral_80x96.png` | 80×96 RGBA; binary alpha; contact (40,88); child-height envelope | breakfast + bedtime keys | dependency toward 2 HOLD screens | `people.portobello_kid1.default` |
| AS13-06 | NC-FA-07 | `portobello_kid2` default/neutral | GUIDED Portobello + explicit Ube card | `portobello_kid2_neutral_80x96.png` | 80×96 RGBA; binary alpha; contact (40,88); child-height envelope | breakfast + bedtime keys | dependency toward 2 HOLD screens | `people.portobello_kid2.default` |
| AS13-07 | POLISH PREPRODUCTION 001 | `rich.hookah_seated` corrected | OPEN; explicit frozen-delta candidate authorization | `rich_hookah_seated_corrected_80x96.png` | 80×96 RGBA; binary alpha; contact (40,88) | hookah minigame default, ROOKOKO and HOMIES surfaces | identity-continuity polish; no HOLD movement | `people.rich.states.hookah_seated` |

## Dependency result

- Family package is candidate-complete for all three currently held family-house surface keys.
- Wife/kids are candidate-complete for the four Portobello bedroom/porch surface keys that do not require the manager. The office key remains blocked by the out-of-scope `portobello_manager`.
- The existing hookah surfaces already pass final-art coverage. This candidate creates a replacement opportunity only after explicit HQ acceptance, frozen promotion, Engineering integration and runtime QA.

No screen status is changed by this candidate package.
