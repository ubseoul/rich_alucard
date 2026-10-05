# FCPB CONVERGENCE 001 — F01 + F04 + F05 + F06 composed (integration owner)

Branch: `integration/fcpb-convergence-001`
Base (convergence authority): `integration/f04-war-room-play-remap-001` @ `2d3886987d115c034a60e9f0cefb734718a275c7` (contains the accepted F01 integration seam: `RAPlayContract`, the F01 adapter, embed mode, `RAShowdown.play`; standalone F01 `039bcae` is an ancestor and was NOT re-merged).

## Composition (order)

| # | Step | Object | Result |
|---|---|---|---|
| 1 | Base | F04 `2d38869` | — |
| 2 | Merge | F05 `integration/f05-trap-hold-final-001` @ `7a5d988` | 1 conflict, `index.html` (generated loader block) — resolved by regenerating with `node tools/loader.mjs sync` |
| 3 | Merge | F06 `integration/f06-rainmaker-production-001` @ `e3c4d3b` (exact accepted object, fetched from the remote branch) | clean |
| 4 | Cherry-pick | F14 QA harness `0c6837b` (tooling only: `tools/f14`, `tools/tests/f14`, a doc; no game code) | clean. Not in the stated merge order, but the cross-fragment harness and route matrix gates run on it |
| 5 | Owner repairs | this document | — |
| 6 | Loader/index regeneration | `node tools/loader.mjs sync` | 190 scripts |

F07 is NOT composed. F02 / F03 / F11 are not composed either (F11's audio master was trial-loaded in scratch only, see Audio).

## UBE SOURCE DECISIONS (now implemented)

1. **Traphouse HOLD** — the existing castle HOLD (`hold_the_house`) launches unchanged. `houseId`, defenders, supports, attacker, `bigRaid`, `holdTurns` ride in `job.context` (inert; F01 ignores it; nothing varies with `houseId`). No traphouse map, no traphouse variant. Temporary production decision by Ube; the castle was not originally generic and no source doc claims it was.
2. **Rainmaker unlock** — after the first completed event (below).
3. **Failed traphouse HOLD** — F05's rule only: affected stash + 30% of unbanked cash. The castle's "half SUPPLY / a fifth of the cash" is a narrative line in F01's breach report (`engine.mjs` `aftermath()`); it is not a field of the wire result and is applied by nobody.

## The HOLD host bridge — `js/if1/hold_bridge.js` (`RAHoldBridge`)

Integration-owned. F01 is not F05-aware (it receives an ordinary `F04.play_request` for `hold_the_house`); F05 is not launch-aware (its phone raid card only offers a HOLD THE HOUSE / BACK IN button that delegates to `RAHoldBridge.start()`; the button is absent when the host is unavailable).

```
F05 pending raid
  -> start(): RATrap.raids.handoff()                       (marks the raid 'handed', idempotent)
  -> request built from shared state (canonical RACrew ids) + persisted as the transaction BEFORE F01 is asked   [LAUNCHED]
  -> RAShowdown.play.launch(request)                       (F01 castle HOLD, real embed iframe / real transport)
  -> receive(result): validated, durably held             [RESULT_HELD]
  -> deliver(): plan fixed, shared consequences applied   [DELIVERING]
  -> RATrap.raids.applyDefense({record, raidId})           (F05: its own stash / 30% / hot house / history / receipt)
  -> transaction cleared
```

One transaction, persisted at `save.frag.if1.hold` (`{seq, tx, lastRefusal}`; a shared, already-owned namespace; no schema change, still v16): `tx = {raidId, launchId, seq, phase, origin, sent, request, record, plan}`. There is no permanent applied ledger: F05's per-raid receipt (`save.frag.F05.raids.applied`) remains the final exactly-once authority.

**Exactly once.** Every shared step converges to an *absolute target* fixed when DELIVERING starts (money = pre + net, HEAT = pre + delta, bonds = pre + 1, statuses set-if-different, stories keyed), so a crash or retry anywhere is a no-op for whatever already landed. A shared step that throws leaves the transaction in DELIVERING (F05 is NOT applied over it) and the next recover/start retries it.

**Shared consequences (host applies once)** — the accepted F04 play-consume semantics minus the War Room strategy layer: banked pot and call spend as one net (gain first, spend clamped, cash never negative; ledger tags `hold_bridge:play` / `hold_bridge:play:spent`), the HEAT delta, crew statuses / bonds / stories via `RAWarRoomCrew`. **F05 applies only its own**: affected stash, 30% of unbanked, house hot window, raid lifecycle/history/receipt, trap-side capture handling. Nobody applies XP, loot, recruits, cars, F01 half-SUPPLY / fifth-of-cash (no invented conversions; recruits/loot counts are reported in the delivery result as `unapplied`).

**Decisions to know about**
- HEAT: the raid's whole delta goes to **global** HEAT. F04's district split (full to district + 30% to global) does not apply: a traphouse is not an F04 district, and F04's own districtless path (30% global only) is an artifact of every F04 job having a district.
- Back-out / refusal / decline: apply **nothing**, including F01's `cash.spent` on a DECLINED result. The raid stays pending, launchable, with a new launch id per attempt (F01 caches even DECLINED under a request id, so a retry needs a fresh id). An interrupted HOLD (reload) reuses its launch id so F01 answers a result it already committed from its own record instead of replaying it.
- Unknown crew ids (not sent / not in the shared roster), non-HOLD results, contract-invalid results and results with no canonical outcome are rejected whole (`UNKNOWN_CREW`, `BAD_RESULT`, `UNKNOWN_OUTCOME`): transaction cleared, nothing applied, raid kept. Ids are never matched by name and never guessed.
- A result for another launch is `STALE_RESULT` and leaves an open transaction alone; a result with no open transaction is `NO_TRANSACTION` (inert).
- Recovery: a held/delivering transaction is delivered with no UI on the next scene change, page load or flag change; an interrupted launch waits for the player (BACK IN).

## Capture clock
One timer. `RAWarRoomCrew.setCaptured` (RACrew `extract_window`, `days:3`) is the same window `F05.capture()` uses and the F04 EXTRACT request already converts it with `clock = (until − today) + 1` (a fresh capture reads 4, F01 `CLOCK_START`). The bridge never stores a second timer; F05 skips an already-CAPTURED crew, so a capture cannot be re-stamped. Covered by test.

## Crew identity
Shared `RACrew.id` end to end: shared roster → F01 request → F01 roster → result (`crew[]`, `captured[]`, `rescued[]`, `storySeeds[]`) → shared application → F05. Only F04-fragment units in a request-legal status are sent. No name matching, no translation table, no new ids.

## Rainmaker unlock — `js/if1/first_event_unlock.js` (`RAFirstEventUnlock`)
Canonical event-completion signal = `RAWorldEvents` (`js/systems/world_events.js`): an event is completed when its persisted record reaches `status:'resolved'` (`life.events.records`). It is the only existing mechanism that is an "event" with a completion lifecycle; `adventure_completed` history rows and OGUN'S RAVE `night_completed` are different mechanisms and are deliberately not blended (change `firstEventCompleted()` if Ube names another). Unlock = `RAPhoneRegistry.unlock('rainmaker')` (persisted in `life.phone.apps`, idempotent, one NEW APP notice, refuses while `F06.rainmaker` is OFF). Triggers (all idempotent): a `resolve()` adapter, flag changes, scene changes, page load. Nothing unlocks from the flag alone or from any day / money / fame / story condition; a persisted unlock is never revoked. No WAKE handler was added (the frozen IF-1 wake roster is unchanged). Rainmaker gameplay is untouched.

## Other owner repairs
- **F04 orphan migration** — `F04.init-war-room` submission removed (its body only stamped an empty `frag.F04`; every reader defaults lazily and `RAMigrations.normalize` fills the namespace). `RAMigrations.validate()` and `RAIF1.selfCheck()` are clean. No version invented; ledger untouched; schema v16.
- **IF-1 loader fixture** — `tools/tests/if1/loader.test.mjs` now synthesizes fragments `F98`/`F99` (registered only in its scratch copy of the manifest). Real F01 migrations untouched.
- **HEAT owner** — `js/if1/heat_floors.js` (`RAHeatFloors`, integration-owned) is the single owner of the authored 0/30/60/85 floors. F04 `heat_config.js` and F05 `heat.js` no longer call `RAHeat.configure()`; both call `RAHeatFloors.ensure()`. Applied only while F04 or F05 is ON (flags OFF ⇒ IF-1's shipped provisional floors, zero change). Identical for every flag combination; no last-writer-wins.
- **Flags** — F05: one identity, the frozen IF-1 reserved `F05.trap`; `F05.the_trap` and its mirror are retired (no bidirectional drift). F01: `F01.showdown_core` is the live flag; the frozen reserved `F01.showdown` stays registered (IF-1 contract) and gates nothing (tested). F14: the stale tactical `F01.showdown.success/.failure/.retreat` routes were retired and replaced by `F01.play.hold`.
- **Phone registry** — classified: `cars` duplicate registration → mechanical repair (the second registration was the live one; `RAPhoneApps.register` is last-writer-wins; now one). The "route-matrix expectation 2 → 1" test named in the brief is not in any composed branch (searched); nothing to update here. `onlyvamps` placement + lock line → PRESERVED (intentional, accepted UL-L2-001 hierarchy). `realEstate` (canonical page id) vs `realestate` (separate hidden action-routing app) → PRESERVED (distinct ids with distinct jobs; a rename is not a mechanical repair). Reserved/dark slots (`armory` for F02) stay dark.
- **Wake bus** — scanned on the composed branch: NIGHT priorities are unique (`-35 f05.heat-decay`, `-30 f05.sales-resolve`, `-20 f05.raid-schedule`, `-10 fame-night`); the historical F04/F05 `-20` collision is not present. The only ties are two pre-IF-1 accepted raw `onWake` pairs (`45 music-drops + onlyvamps-renew`, `55 family-thread + a29-tells`); pinned by test, not changed.
- **Audio (F11)** — F11's master `js/data/audio/parts/F04_blood_x.js` (branch `frag/audio-completion/001`) is canonical for the BX family. Trial composition in scratch confirmed a hard collision with F01's inert duplicate (`RAAudioParts(F04): audio id BX_SLIDEIN_IDLE already exists`), so F01's six inert `BX_*` hooks were removed (`F01_showdown.js` now registers nothing; F01's `sfx` tags/call sites are unchanged and an unregistered id is inert). `BX_STEP` stays unregistered (SOURCE_REQUIRED, safe fallback, nothing fabricated). F05 `TR_01`/`TR_05` unchanged. F06 `RM_01–RM_08` verified against the exact `e3c4d3b` part.
- **Extra (not on the brief's list)** — `minigame-lab.html` never loaded `RANewOgaTunables`, so OWAMBE COLLECTION threw in the lab (reproduced on the untouched F04 base + F14 harness): one `<script>` added. F14's static server lacked `.mjs` in its MIME map (the F01 PLAY page is ES modules): one map entry added.

## Persistence
Shared state lives only in `save.frag.if1.hold`, `save.frag.F05.*`, `save.frag.F04.*`, `save.life.*`, the RACrew / HEAT services. F01's PLAY sandbox/embed storage (`ra.f01.play.v1.*`, `rich_alucard_f01_sandbox_v1`) stays in F01's own page storage and never enters the game save (tested, in Node and in the browser).

## Verification
`node tools/loader.mjs sync && verify`; `node tools/run-tests.mjs` (all fragments, 42 suites incl. `tools/tests/if1/hold_bridge.test.mjs` and `convergence.test.mjs`); `node tools/release.mjs build`; `node tools/verify-all.mjs --skip-build --require-browser`; `node tools/f14/run.mjs --dist dist --require-browser`; `node tools/tests/if1/hold-bridge-browser.mjs --dist dist` (40 checks, real phone → real F01 iframe); `node tools/tests/f05/hold-browser.mjs` (30); `node tools/check-owner-surfaces.mjs --base 2d38869 --as-owner`; `node tools/leak-check.mjs [--dist dist]`.

## OWNER_REQUIRED / SOURCE_REQUIRED (none blocks F13)
- OWNER: confirm the "first completed event" definition (RAWorldEvents `resolved`) or name another mechanism.
- OWNER: confirm HEAT full-to-global for a traphouse raid.
- OWNER (copy): F01's breach report still reads "STASH RAIDED — half the SUPPLY and a fifth of the cash gone" on a traphouse raid, while the real consequence is F05's stash + 30% (F01 unchanged by decision).
- OWNER (UX, F01-owned): the HOLD notice has no in-play exit control (PICK UP only; F01 authored it as a notice). Backing out means leaving the page; the raid is preserved and BACK IN relaunches. The bridge handles DECLINED/REFUSED correctly if F01 ever offers one.
- OWNER: F05 `TR_01`/`TR_05` bus/category/scene ownership (audio polish).
- OWNER: when F11 merges, no further audio action is needed (F01 duplicate already removed).
- SOURCE_REQUIRED: `BX_STEP` sound; traphouse-specific HOLD (map / layout / rewards); authored unanswered-raid consequence (none by decision).
