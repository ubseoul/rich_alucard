# F03 — NEW_OGA_LADDER_CLOSE (M9 + M10 + THE ALTERNATIVE restoration)

Fragment `UBE_PORTAL_FRAGMENT_NEW_OGA_LADDER_CLOSE` · branch `frag/new-oga-ladder-close/001` ·
base `integration/ube-portal` / IF-1 v1.0 `101a394b5fa9c41ec089bc7022ee86ff43f5f31c` (tag `if1-v1.0`).
Feature flag `F03.new_oga_ladder_close` — **dark by default**.

## Authority used

- **OPEN source:** `Rich_Alucard_PLAYMAKERS_Patch1_NEW_OGA` (OVERLORD package `02_OPEN_PATCHES`) — the NEW OGA ladder
  M1–M10. M9 THE TRIBUTE and M10 VICE PRESIDENT are transcribed from it; no story content was invented.
- Accepted NEW OGA M1–M7 implementation (`js/data/btf/adventures/new_oga_*.js`, `js/systems/new_oga.js`,
  `js/data/btf/new_oga_tunables.js`) and `docs/engineering/UL_F2_001..004.md`.
- OL-011 cut-fallback audit (`docs/engineering/F00_INTEGRATION_SPINE.md` §3): THE ALTERNATIVE chair activity is
  **MANDATORY PRE-FCPB, owner F03**; it was implemented as an authorized scene fallback in UL-F2-002.
- IF-1 v1.0 frozen contracts (`tools/tests/if1/`). `RAVehicles`, `RADistricts`, `RACrew`, `RAMoneyLedger`, `RAWakeBus`.

## Scope

| Mission | Status |
|---|---|
| M8 THE TURF WAR / the finale | **NOT implemented** (F07 `m8_and_finale`). Voice-note priority **77 reserved** for F07. |
| M9 THE TRIBUTE | Implemented, flag-gated. |
| M10 VICE PRESIDENT | Implemented, flag-gated. |
| THE ALTERNATIVE chair activity | Restored (PRE-FCPB), flag-gated. |

## M9 — THE TRIBUTE (`NEW_OGA_M9`)

- Arrives on the first qualifying WAKE after M7: `rank===4 && rank4Granted && m7Completed && !m9Resolved &&
  day>lastMissionDay && a driveable (owned, non-TRIBUTED) car exists`. Mission voice-note priority **76**.
- **Authored drive telemetry:** the favorite car is the owned, non-TRIBUTED car with the highest
  `RAVehicles.driveCount`. Telemetry is wired (flag ON only) through two seams that do not edit accepted systems:
  the accepted `RANewOga.observeTouge` (TOUGE result → car catalog key → owned record) and `RANodd.maybeStop`
  (a `car:` route choice, read from the active adventure's `vars.car`).
- Choices: `GIVE IT` (favorite tributed, **Rank 5**, Trust 0) · `OFFER ANOTHER CAR` (only when an Urus/Aventador is
  owned and is not the favorite; the exotic is tributed, **Trust −1**, Rank 5) · `NAH` (**Rank 4**, **Trust −1**).
- **TRIBUTED vehicles are hidden, not deleted.** `RAVehicles.tribute()` records the tribute in
  `save.frag.if1.vehicles.<carId>`; the accepted ownership record is untouched, so `RALife.hasCar` stays true and
  `TRIBUTED` cars are excluded from the favorite/usable selection. F07 may return the car (source: THE TAKEOVER).
  A global hide in the accepted garage/TOUGE pickers would edit accepted car surfaces — see Integration requests.

## M10 — VICE PRESIDENT (`NEW_OGA_M10`)

- Arrives on the first qualifying WAKE after M9: `m9Resolved && !finaleBegun && (!m10Completed || NAH-stay re-ask)`.
  Mission voice-note priority **75**.
- **Grant path** (`GIVE IT` / `OFFER ANOTHER CAR`): Rank 5 `VICE PRESIDENT`, office `vice_president`, two recruits
  (`gbenga_boy_1/2`, RACrew), **Koreatown CONTROLLED by Rich** (`RADistricts`, defined by F03 so the later War Room
  F04 consumes it rather than redefining it — "queued before War Room"), and the authored **$15K/week** income
  (WAKE handler `F03.m10-income`, priority 71, tagged `new_oga:m10`). Grants are applied exactly once
  (`m10GrantsApplied`).
- **VampGPT:** `…SAY LESS.` records `finaleBegun` for F07 (the finale itself is F07) · `NAH, I'M GOOD HERE.` keeps
  Rich VICE PRESIDENT and re-asks in **7 sleeps** (`m10VampgptReaskDay`), repeatable indefinitely.
- **SR-17 / M9 NAH path:** when M9 resolved `NAH`, the player stays **Rank 4**, Trust **−1**, and M10's grants are
  **withheld** (`m10GrantsWithheld`) — no office, recruits, Koreatown, income, or rank 5. The **VampGPT scene still
  fires** and can still begin the finale; the finale later becomes harder purely from the lower Trust and missing
  resources. **No substitute punishment or content was invented.**

## THE ALTERNATIVE — PRE-FCPB restoration

`NEW_OGA_ALTERNATIVE` (`js/data/btf/adventures/new_oga_m4.js`) routes to the authored chair activity when
`F03.new_oga_ladder_close` is ON: the **same accepted SLURP `canopyDuty` harness** M3 uses (total/bundle/duration from
`RANewOgaTunables.chairs`), then the auntie critique and `RANewOga.completeAlternative()`. No second chair system was
created and the mechanic was not redesigned. With the flag **OFF** the node resolves to the frozen fallback scene and
is byte-identical to the accepted build.

## State

Progression extends the accepted NEW OGA lane on `life.newOga` through the lane's own `RANewOga.patch` (`m9Resolved`,
`m9Outcome`, `m9TributedCar/Day`, `m9GrantsWithheld`, `m10Fired/Completed/Outcome`, `m10GrantsApplied`,
`m10GrantsWithheld`, `m10GrantDay`, `m10VampgptReaskDay`, `finaleBegun`, `office`, `recruits`) — additive fields, absent
on old saves and written only while the flag is ON. `js/frag/F03/migrations.js` declares the F03 namespace defaults and
claims **no schema version** (none is needed; the integration owner assigns versions in `migration_ledger.js`).
With the flag OFF no `save.frag` namespace is created.

## H1

No new Rich `[VP]` line was authored. The M9/M10 scenes use narration, authored non-Rich lines (Gbenga/VampGPT) and
choice labels only. H1 is not opened or inferred.

## Tests / evidence

- `node tools/run-tests.mjs --fragment f03` — 12 assertions PASS (flag OFF, M9 entry, GIVE/OTHER/NAH, telemetry,
  TRIBUTED persistence/reload, M10 entry/grants/withheld, VampGPT re-ask, Alternative restoration, M1–M7 regression).
- `npm test` PASS — full deterministic gate incl. IF-1 v1.0 contracts, the IF-1 zero-change replay (72 route plays,
  all flags OFF byte-identical), and all fragment suites.
- `npm run build` + artifact verification PASS.
- Real browser (`tools/tests/f03/browser-path.mjs`, Edge 390×844) — **5/5** PASS: flag ON/OFF registrations, M9 GIVE
  (Rank 5, TRIBUTED hidden-not-deleted, reload), M9 NAH → M10 withheld, M10 grants (office/recruits/Koreatown/reload),
  THE ALTERNATIVE chair mounts in the real UI.

## Integration requests (integration owner)

1. **Loader sync.** `js/frag/F03/**` are new fragment files; the generated `index.html` LOADER block was regenerated
   with the sanctioned `node tools/loader.mjs sync` so the branch is self-contained/auditable. The owner should
   regenerate on merge (adds `js/frag/F03/migrations.js` at the migration glob and
   `js/frag/F03/new_oga_ladder_close.js` at the F03 fragment slot).
2. **Accepted-content tickets** (authorized by this F03 ticket, non-owner surfaces):
   `js/data/btf/adventures/new_oga_m4.js` (chair restoration), `js/data/btf/new_oga_tunables.js`
   (`trust.M9_GIVE/M9_OTHER/M9_NAH`, `m10.WEEKLY_INCOME/REASK_DAYS`).
3. **Global TRIBUTED hiding** in the accepted garage/TOUGE pickers (`js/systems/cars.js`, `js/data/btf/adventures/w1_life.js`,
   `js/scenes/adventure.js`) if the auditor requires TRIBUTED cars hidden everywhere rather than from F03/F07 surfaces.
4. **F07 handoff:** finale reads `finaleBegun`, `m9TributedCar`, `m9GrantsWithheld`, `m10GrantsApplied`; M8 must take
   voice-note priority 77.

## Placeholder / audio

No art or audio changed. M9/M10 reuse existing RAPixel placeholders and the existing `NO_01–NO_06` inert hooks.
