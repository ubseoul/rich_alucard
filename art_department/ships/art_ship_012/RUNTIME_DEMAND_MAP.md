# ART SHIP 012 — Runtime Demand Map

**Status:** CANDIDATE — HQ REVIEW REQUIRED

**Runtime authority:** `origin/claude/art-ship-010-integration` at `8eab30dc790071ec8da98f65311e2b4676fabad0`

**Art base:** `c6a49410e558be34aa44703015556c00a4e592c9`

**Machine authority:** `RUNTIME_DEMAND_MAP.json`

| Request | Ticket | Runtime id/state | Authority | Native contract | Exact intended surfaces | Severity | Expected resolution | Engineering mapping |
|---|---|---|---|---|---|---|---|---|
| AS12-01 | NC-FA-07 | `portobello_manager.neutral` | OPEN — named Ship authorization | 80×96 RGBA, binary alpha, contact `(40,88)` | `portobello_office\|left:rich_portobello@presenting,right:portobello_manager` | BLOCKING | supplies the manager dependency on 1 held screen; no family coverage | `characters.portobello_manager.default` |
| AS12-02 | NC-FA-07 | `auntie.register_neutral` | OPEN — named Ship authorization | 80×96 RGBA, binary alpha, contact `(40,88)` | `naija_mart\|left:rich,right:auntie` | BLOCKING | supplies 1 held screen | `characters.auntie.default` |
| AS12-03 | NC-FA-07 / PD-W1-01 | `soul.climbing` | OPEN — named Ship authorization | 80×96 RGBA, binary alpha, contact `(40,88)` | two ocean-floor keys listed in machine map; reuse/mirror allowed | BLOCKING | supplies both held ocean-floor screens | `characters.soul.default` |
| AS12-04 | NC-FA-07 | `training_dummy.combat_neutral` | OPEN — named Ship authorization | 80×96 RGBA, binary alpha, contact `(40,88)` | `combat:training@maul`; `combat:training@throne` | BLOCKING | supplies 2 held fights | `combatants.training.default` |
| AS12-05 | NC-FA-07 | `buckhead.combat_neutral` | OPEN — named Ship authorization | 80×96 RGBA, binary alpha, contact `(40,88)` | `combat:buckhead@lennox` | BLOCKING | supplies 1 held fight | `combatants.buckhead.default` |

## Forecast and boundary

The five candidates cover dependencies on seven currently held adventure/fight surfaces. This is only an Art forecast. PASS/HOLD totals remain **106 PASS / 15 HOLD** until HQ approval, explicit freeze, Engineering integration and real runtime presentation QA. The Portobello manager does not clear the other four Portobello screens and does not authorize the wife or children.

## Source integrity

All source-render and candidate hashes are recorded in `RAW_GENERATION_HASHES.json`, `CANDIDATE_TECHNICAL_FACTS.json`, `SOURCE_PRESERVATION_EVIDENCE.json` and `CANDIDATE_SHA256SUMS.txt`. Frozen environment and character sources were read only.
