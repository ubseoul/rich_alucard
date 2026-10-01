# F03 — NEW_OGA_LADDER_CLOSE (R3 bounded port: M9 → M10 → VampGPT, THE ALTERNATIVE)

Flag `F03.new_oga_ladder_close` — **dark by default**. Ported onto the corrected runtime `31ac1bfe6eddb04786fb6fffded69e6d8fa0b643`.
Port source (implementation evidence only, not merge authority): `origin/frag/new-oga-ladder-close/001 @ 84141373f87364d6c9634d5c51981dfd66228284`.

This is a bounded port. No economy value, payout, ingredient, War Room capacity, F13 value or F01 recovery rule changed. No M8 and no finale
behaviour was written; no dialogue was authored.

## What ships

| Piece | Where |
|---|---|
| M9 THE TRIBUTE, M10 VICE PRESIDENT, VampGPT scene, weekly income, queues | `js/frag/F03/new_oga_ladder_close.js` |
| Namespace defaults (`save.frag.F03`: `koreatown`, `crew`) — no schema number claimed | `js/frag/F03/migrations.js` |
| THE ALTERNATIVE chair activity (flag ON; OFF is the frozen fallback) | `js/data/btf/adventures/new_oga_m4.js` |
| M9 trust (`M9_GIVE 0 / M9_OTHER −1 / M9_NAH −1`), `m10.WEEKLY_INCOME 15000`, `m10.REASK_DAYS 7` | `js/data/btf/new_oga_tunables.js` |
| TRIBUTED hidden from normal availability (`RALife.ownedCars`), `RALife.heldCars` | `js/systems/life.js` |
| Pure reader `RAVehicles.tributedCar()`, `RAVehicles.returnTribute()` (additive IF-1) | `js/if1/vehicles.js` |
| On-loan units do not count against the crew cap (`meta.onLoan`) | `js/frag/F04/crew.js` (one condition) |
| Loader slot + migrations glob | `index.html` (generated, `node tools/loader.mjs sync`) |

## B1 / B2 — prerequisite and delivery

* M9 requires `life.newOga.m8Resolved`. **Any** resolved outcome qualifies (SEND THE BOYS included); `m8Outcome` is never read.
  **Dependency:** M8 is not implemented on this base and F03 never writes `m8Resolved`. Tests use `RANewOga.patch({m8Resolved:true})` as the
  smallest explicit fixture. F07 (M8 + finale) must write it.
* Every mission arrives on a WAKE through the accepted `RAWakeTriggers` arbiter: one adventure per WAKE; each mission also needs
  `day > lastMissionDay`, so nothing chains onto the WAKE of the mission before it. M9 priority 76, M10 priority 75 (`voiceNotes.define`;
  77 stays reserved for M8).
* VampGPT is its own adventure (`NEW_OGA_VAMPGPT`) delivered on the **next WAKE after M10** (or after a NAH M9). The candidate played it inside
  M10's scene; that was split to satisfy B2 with no text change.

## B3 — tribute

* Favorite = highest `RAVehicles.driveCount` among **available** owned cars (not TRIBUTED, LOST or IMPOUNDED); ties go to the earliest-owned.
  No eligible car → M9 waits.
* TRIBUTED is recorded by `RAVehicles` (`save.frag.if1.vehicles.<id>.tributed`); the ownership record is never edited or deleted.
  `RALife.ownedCars()` (every garage / route / TOUGE / PLAY picker) hides TRIBUTED cars; `RALife.heldCars()` and `RAVehicles.list()` keep them.
  F04's PLAY garage already skipped `service.tributed`, so a TRIBUTED car cannot PLAY.
* OFFER ANOTHER CAR is enabled only while an **available** Urus or Aventador is owned (prefers one that is not the favorite). Trust −1.
* TAKEOVER: `RANewOgaLadder.returnTribute()` clears the TRIBUTED mark (F07 calls it). Nothing is priced or recreated.

## B4 — crew

* The M8 squad is ON LOAN: units defined with `meta.onLoan:true` are not counted by `RAWarRoomCrew.recruit`'s cap of 8.
* M10's two boys are **generic** recruits through the existing `RAWarRoomCrew.recruit` path: normal cap, normal `RACrew` mortality, **queued**
  (`save.frag.F03.crew.queue`) while the crew is full or the War Room is inactive, drained on WAKE.

## B5 — Koreatown

F03 defines the district and is the sole owner of its progression state (`save.frag.F03.koreatown`, `RANewOgaLadder.koreatown()`).
`RADistricts.define` refuses a second definer, F04 only consumes (`RAWarRoomDistricts.provider().owned.koreatown === 'F03'`), and the convergence
scan now asserts `js/frag/F03/new_oga_ladder_close.js` is the *only* definer. The M10 grant is **queued** while the War Room is inactive and applied
once, on the first WAKE it is active. The historical F04 shadow is not reintroduced.

## B6 / B7

F07 reads `RAVehicles.tributedCar()` (returns `m9TributedCar`); it is pure (tested: no writes, `tribute()` never called).
M10 income: the authored `$15,000` every 7th day after the grant, via `RAMoneyLedger.credit` source `new_oga:m10`. Not changed.

## Excluded from the historical candidate

* `gbenga_boy_1/2` named `oga`-class units (B4: no named recruits; replaced by generic War Room recruits).
* The candidate's in-scene VampGPT (replaced by the separate next-WAKE scene) and its grant-in-`enter` M10 (grants now apply once, in the M10 end `fx`).
* The F04 Koreatown definition fixture: the real F03 definition now stands in for it.
* `tributeCar()` as a reader, and the candidate's `alternateCar()` fallthrough that could offer the favorite as "another" car.
* The candidate's new critique line "the delivery still completes" (replaced by NEW_OGA_M3's own authored critique line).

## Open items (reported, not decided)

1. M9/M10/VampGPT scene text and the NAH / SR-17 consequences are carried verbatim from the candidate, which cites the OVERLORD OPEN package
   (`Rich_Alucard_PLAYMAKERS_Patch1_NEW_OGA`). That package is **not in this repository**, so the text could not be re-verified here.
2. M10 recruits' class and name are placeholders (`NEW RECRUIT n`; class cycles the six existing classes). The source authors neither.
3. LOST / IMPOUNDED have no runtime writer on this base; F03 reads `ownershipStatus` (`lost` / `impounded`). F01's `garage.lost` lives in the PLAY world
   and is not mirrored into `life.ownership.cars`.
4. VampGPT needs a WAKE-arbiter number; the mission band 75–89 is full, so it is registered at 74 directly with `RAWakeTriggers.define`.
   Integration owner may re-number.
5. `RALife.hasCar(id)` stays true for a TRIBUTED car (the record is retained by design).
6. F04's `allOgas()` still counts GONE units against the cap of 8 (pre-existing); queued recruits therefore wait while GONE units fill the roster.
