# F05 THE TRAP x F01 HOLD THE HOUSE - final integration record (STOVE J)

Branch: `integration/f05-trap-hold-final-001`
Inputs: `prep/f05-trap-hold-postrewrite-ready-001` @ `ae83cf0` (F05) + `frag/showdown-core/play-sandbox-001` @ `039bcae` (F01 THE PLAY, OL-023), both on OPEN baseline `integration/ube-portal` @ `5e4b3a3`.
Scope: F05 only. No F01 code, no main, no economy, no art, no F06/F07.

> **FCPB CONVERGENCE UPDATE.** The OWNER_REQUIRED / SOURCE_REQUIRED items below were resolved at convergence — see `docs/engineering/FCPB_CONVERGENCE_001.md`: the host bridge now exists (`js/if1/hold_bridge.js`); `RAHeat.configure` has one owner (`js/if1/heat_floors.js`); `F05.trap` is the single flag identity; the capture window is one timer (3 nights, F01 counter derived); the traphouse HOLD is the existing castle HOLD (Ube); the trap-side loss is F05's stash + 30% (Ube); HEAT/cash from a HOLD are applied once by the host; the night `-20` tie does not exist on the composed branch. The text below is the historical record of the standalone branch and is kept unchanged.

## Ownership (unchanged, now enforced by tests)

| F05 owns | F01 owns |
|---|---|
| THE TRAP, the pending raid, the handoff request, the traphouse stash + unbanked cash, the house heat window, raid history + receipts | the lived HOLD THE HOUSE (crew, seating, beats, FALL BACK, loot, its own cash/HEAT/crew consequences in its world) |

F05 consumes F01's canonical result afterward and applies **only** what it owns. It applies no money to the balance, no HEAT, no XP and no loot.

## The canonical path

```
night  : RAWakeBus f05.raid-schedule  -> RATrap.raids.schedule()        (pending raid, id raid:<day>:<house>)
launch : RATrap.raids.handoff()       -> { raidId, play:{job:'hold_the_house',...}, request }   (marks pending 'handed')
HOLD   : F01 THE PLAY runs hold_the_house with that request              (F01-owned)
result : RATrap.raids.applyDefense({ record, raidId })                   (exactly once per raid)
```

`handoff()` request keys: `raidId, day, houseId, attacker{id,label}, defenders[{id,role,weapon}], holdTurns[], supports{cameras,panicRoom}, bigRaid`.
Removed from the handoff: `map`, `f01Pending`, `kind`, the legacy tactical `packet`, `weapons`, `atNight`. (`buildEntryPacket()` and the stored pending packet are the legacy compatibility shape; nothing F01-facing reads them.)

## Defects found and fixed (all F05-owned)

1. **`handoff()` could not run on a scheduled raid.** It re-ran `eligible()`, and `schedule()` had just set `lastDay`, so the cadence check always refused it. It now reads the pending raid.
2. **A record could hit the wrong raid.** `applyDefense` applied to whichever raid was pending. It now requires the raid id, answers a repeat from a per-raid receipt (`save.frag.F05.raids.applied`, last 20), and refuses a record for another raid (`stale-raid`).
3. **`COSTLY` misread as a breach.** In real F01 records `klass:'COSTLY'` also covers a HELD door with a shot Oga (`COSTLY|HELD`). The readiness reader mapped it to BREACHED and would have taken the stash of a house that held. The defense outcome is now read from the record's own `getaway` (`HELD`/`BREACHED`) after `fellBack`/`WASH`.
4. **A pending raid was silently replaced** by the next `schedule()`. It now stays until answered (`raid-pending`).
5. **A capture timer could be reset.** Capturing an Oga who is already CAPTURED/GONE is now a no-op.
6. **Player-facing dev string.** The phone raid card printed `F01_INTEGRATION_PENDING`; it now shows `incoming` / `HOLD THE HOUSE under way`.
7. **`holdTurns()` shape.** F02 defines `holdTurns() -> [1,2]` (`js/frag/F02/registry.js`, pinned by F02 `contracts.test.mjs`). F05's fallback returned `{turns,pending,note}`. Both modes now return an array; with F02 absent it is `[]` (F02 owns the door-hold rule; `weapons.status().pending` still reports `F02_INTEGRATION_PENDING`).

## Consequence table (F05 side)

| Canonical | Stash + product | Unbanked cash | House heat window | Crew | Balance / HEAT |
|---|---|---|---|---|---|
| HELD | kept | kept | none | none | untouched |
| BREACHED | lost | -30% | hot 5 nights | record captives, else authored fallback (panic room protects) | untouched |
| FELL_BACK | lost | -30% | hot 5 nights | 0 captures | untouched |
| WASH | lost | -30% | hot 5 nights | record captives, else authored fallback | untouched |

Banked money is never touched by F05. `pot`, `heatDelta`, `spent`, `pocketLoss` in the record belong to F01's world.

## Open items (not decided here)

**OWNER_REQUIRED**
- **`RAHeat.configure` owner.** F05 (`js/frag/F05/heat.js`) and F04 (`heat_config.js`) both configure the same authored floors (0/30/60/85). F04 already labels this OWNER_REQUIRED and applies only while HEAT is provisional. F05 was not given ownership.
- **`F05.trap` vs `F05.the_trap`.** IF-1 reserves `F05.trap` (phone slot `trap`); F05 registers `F05.the_trap` and mirrors it. No authority names one canonical id; no alias was added.
- **Who bridges F01's world into the game.** THE PLAY runs as a standalone page (`assets/f01/play/`) with its own world (roster, cash, heat, captives). No host launches it with an external request or returns its record to `RATrap.raids.applyDefense`. Building that host touches F01 and shared IF-1 surfaces.
- **HEAT/cash from a HOLD.** Because the F01 world is standalone, `heatDelta`/pot are applied by nobody in the game today. F05 deliberately does not apply them (double-apply risk once a host exists).
- **Capture-timer ownership.** F05's authored 3-night extract window vs F01's 4-night captive clock for the same Oga.
- **Night priority `-20`** (F04 heat-decay vs `f05.raid-schedule`): see below.

**SOURCE_REQUIRED**
- **The F04 night heat-decay handler.** Not present in any reachable F04 ref (`frag/playmakers-war-room/001`, `integration/f04-war-room-play-remap-001` have wake handlers only). The tie itself is reproduced with a stand-in handler.
- **Stash loss figure.** F01 spec words a breach as "half the SUPPLY and a fifth of the cash"; THE TRAP authors "stash + 30% of unbanked". F05 applies its authored figure; the two sources disagree.
- **Unanswered-raid rule.** No authored consequence for ignoring a raid. F05 now holds it pending rather than invent one.
- **PLAY-side traphouse identity.** F01's `hold_the_house` job is authored as the castle; it does not consume `houseId`/`defenders`. Passing them is harmless but unused until F01 defines a traphouse HOLD.

## Wake priorities

On the current base every night priority is unique (`fame-night -10`, `f05.raid-schedule -20`, `f05.sales-resolve -30`, `f05.heat-decay -35`). `RAWakeBus.subscribe` rejects any second handler at `-20` (`priority -20 already used by f05.raid-schedule`); the test reproduces that. No priority was changed: choosing which fragment moves is an ownership decision.

## Verification

| Check | Command | Result |
|---|---|---|
| F05 suites | `node tools/run-tests.mjs --fragment f05` | PASS (`the_trap`: 32 groups; `hold_integration`: 8 groups over 240 real F01 HOLD records) |
| F01 suites (incl. FALL BACK, FEEL LOCK) | `node tools/run-tests.mjs --fragment f01` | PASS (14 suites) |
| Every suite, individually | all 25 discovered suites | 24 PASS, 1 FAIL: `if1/loader.test.mjs` (pre-existing, below) |
| Loader / leak | `node tools/loader.mjs verify`, `node tools/leak-check.mjs` | PASS (170 scripts; 1697 files) |
| Owner surfaces | `node tools/check-owner-surfaces.mjs --base <merge> --fragment F05` | PASS |
| Real Chromium | `node tools/tests/f05/hold-browser.mjs` | 30/30: game page + F01 PLAY UI, real `sleep()` NIGHT/WAKE, reload at every stage, repeat and stale delivery, 360/390/430 widths, zero console/page errors |
| Build | `node tools/release.mjs build` + `verify-artifact` | PASS only with `if1/loader.test.mjs` removed in a scratch copy (see below) |

Mutation checks (each broken in turn, each caught by the F05 suite): no receipt check, no stale-raid check, COSTLY read as breach, pending raid overwritten, F05 credits pot to balance, F05 adds record `heatDelta`, `trap_report_card` reintroduced, `holdTurns` object shape, `handed` not persisted, wake priority tie (`-30` to `-20`), capture timer re-stamped.

### Pre-existing failure (not introduced here)

`tools/tests/if1/loader.test.mjs` "new files land in their slots" fails on the accepted F01 branch (`039bcae`) alone and passes on `integration/ube-portal` and on the F05 readiness branch. The fixture invents a "new F01 fragment" containing `js/frag/F01/migrations.js`; the accepted F01 has a real one, so it is no longer a new file. `npm test` and `npm run build` stop there. That file is an IF-1 owner surface, so it was not edited; the integration owner should move the fixture to an unused fragment id.

### Real-browser note

HEAT must be above HOT (60) when the night begins: the NIGHT bus decays 3 at `-35`, before the raid check at `-20`. The browser check uses 70.
