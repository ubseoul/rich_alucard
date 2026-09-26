# ART SHIP 013 — Runtime Demand Map

Status: **APPROVED MASTER / FROZEN — PENDING ENGINEERING INTEGRATION AND RUNTIME QA**. This Art freeze clears no HOLD.

Current accepted runtime authority is `claude/hold-clearance-001` at `a66170218375e52404715789dde48c23726a6044`, 108 PASS / 13 HOLD. Ship 013 changes neither count.

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

- Family package is Art-complete and frozen for three family-house integration opportunities.
- Wife/kids are Art-complete and frozen for four Portobello bedroom/porch integration opportunities that do not require the manager. The office key remains blocked by out-of-scope `portobello_manager`.
- Existing hookah surfaces already pass final-art coverage. The corrected frozen master creates a continuity replacement opportunity only after separate Engineering integration and runtime QA.

No screen status is changed by this Art promotion.
