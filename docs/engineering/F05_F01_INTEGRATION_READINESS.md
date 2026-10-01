# F05 THE TRAP / HOLD THE HOUSE — F01 OL-023 INTEGRATION READINESS

Fragment: `F05` — `THE_TRAP` (traphouse / Blood X production) + HOLD THE HOUSE raid seam.
Prep branch: `prep/f05-trap-hold-integration-readiness-001`.
Base: `frag/the-trap/001` @ `14b11c2` (post-rewrite remote tip).
Target architecture: **F01 OL-023 THE PLAY** (`frag/showdown-core/play-sandbox-001` @ `039bcae`, FEEL LOCK).
Status: **READY FOR FINAL F05 INTEGRATION** (F01-owned hookup still to be done by the integration owner).

This document is the hand-off for the final F05 → F01 integration. It records the F05 surface, the
F01 seam classification, the F05-owned repairs already made, and the exact remaining work with an
owner, a risk level, whether it touches F01, and the test that proves completion.

It does **not** modify F01 presentation, OL-023 phone/chat UI, or main.

---

## 1. F05 surface map (Task 1)

| Concern | File | Notes |
|---|---|---|
| Facade + boot | `js/frag/F05/trap.js` | `window.RATrap`; boots HEAT/crew/minigames/sales-channel/phone-app/WAKE only while `on()` |
| Feature flag / `on()` | `js/frag/F05/util.js` | master `F05.the_trap`, mirrors the reserved `F05.trap` |
| Tunables (authored + provisional) | `js/frag/F05/tunables.js` | AUTHORED source numbers; `PROVISIONAL` owner F13 |
| Save schema (declaration) | `js/frag/F05/migrations.js` | `RAMigrations.namespace('F05', …)`, no version submitted |
| State accessors | `js/frag/F05/state.js` | `save.frag.F05.*` |
| Unlock / listing / house buy | `js/frag/F05/unlock.js` | NEW OGA ASSOCIATE, F04 December offer, Day 14 + JUG THE PLUG |
| Production / COOK / pricing | `js/frag/F05/production.js` | grades D–S, aging, rare ingredient, quality→price |
| Sales / night resolution / COUNT THE MONEY | `js/frag/F05/sales.js` | channels, robbery, unbanked→banked, money ledger |
| Levels / upgrades | `js/frag/F05/levels.js` | levels 1–5, COUNTING ROOM, upgrades |
| Crew roles / skimming / confront | `js/frag/F05/crew.js` | roles cook/runner/lookout on shared `RACrew` |
| Shared HEAT | `js/frag/F05/heat.js` | configures authored Vol 7 floors on the ONE `RAHeat` |
| F02 weapon seam | `js/frag/F05/weapons.js` | delegates to `RAIronAndGrace.trap` or isolated fallback |
| **Raids / HOLD / outcome adapter** | `js/frag/F05/raids.js` | entry packet, `handoff()`, `resolve()`, `applyDefense()`, canonical outcomes |
| WAKE / NIGHT loop + mail | `js/frag/F05/wake.js` | night report, COUNT THE MONEY + RAID notices |
| People-notice reactions | `js/frag/F05/reactions.js` | one-time, `contentSourceRequired` (no invented lines) |
| COOK minigame | `js/frag/F05/minigame_cook.js` | registered only while ON |
| COUNT minigame | `js/frag/F05/minigame_counter.js` | registered only while ON |
| Phone app | `js/frag/F05/phone_app.js` | declared via `RAPhoneRegistry` (`trap`) |
| CSS | `js/frag/F05/the_trap.css` | phone-local styling only, no art assets |
| Audio part | `js/data/audio/parts/F05_trap.js` | `TR_01`–`TR_06` inert hooks |
| Manifest | `js/frag/F05/manifest.json` | loader-owned file list |
| Tests | `tools/tests/f05/the_trap.test.mjs` | 29 PASS groups |

### Entry points
- **Boot:** `trap.js` load-time wiring + `RAFeatures.onChange`; `boot()` is a no-op while OFF.
- **Unlock:** `unlock.tick()` at WAKE → `RAPhoneRegistry.unlock('trap')` + Shannon text.
- **Player:** `RATrap` facade; phone app `app:trap:*` subs; `do:trap:*` actions.
- **Raid / HOLD:** `RATrap.raids.schedule()` (NIGHT bus), `handoff()`, `resolve()` / `applyDefense()`.
- **F01 seam:** `RATrap.raids.buildEntryPacket()` (legacy tactical packet) and `RATrap.raids.handoff()` (OL-023 PLAY request).

### Outcome / persistence / audio hooks
- **Outcome adapter:** `js/frag/F05/raids.js` — `DEFENSE_OUTCOMES`, `canonicalOutcome`, `fromPlayRecord`, `resolve`, `applyDefense`.
- **Persistence:** lazy `save.frag.F05` (`raids.pending`, `raids.history`, `raids.lastOutcome`, …); declaration-only migration.
- **Audio hooks:** `js/data/audio/parts/F05_trap.js` (`TR_01`–`TR_06`, `the_trap` scene).
- **Success / failure states:** production/sales return `{ok,reason}`; raids return `{ok,result}` with `canonical`.

### Shared services used (all IF-1, all present and unchanged)
`RAFeatures`, `RAFrag`, `RAState`, `RAMigrations`, `RAHeat`, `RACrew`, `RASalesChannels`, `RAMoneyLedger`,
`RAWakeBus`, `RAMinigames`, `RAPhoneRegistry`/`RAPhoneApps`, `RALife`, `RANewOga`.

### Legacy / pre-OL-023 dependencies
- `raids.js` doc/behaviour previously assumed the **F01 tactical** contract (grid/SHOWDOWN). The RAID
  seam now documents OL-023 as authoritative and keeps the tactical packet only as a compatibility shape.
- `artNeeds[]` still lists `trap_report_card` (F05-authored art scope). F01 retired its own report card;
  this F05 art item is left in place — see §3.
- No seating puzzle, visible NERVE, tactical board, moment cards, visible percentages, or pre-raid
  explanation panels exist anywhere in F05.

---

## 2. F01 seam classification (Task 2)

`js/if1/*` and `js/systems/*` are **byte-identical** between the F05 base and the F01 OL-023 branch, so every
shared service F05 calls already matches.

| Seam | Class | Detail |
|---|---|---|
| Shared HEAT (`RAHeat`) floors/decay/tier-change | **A** | F05 configures authored Vol 7 floors only while ON; identical service both branches |
| Shared crew (`RACrew`) define/roles/statuses | **A** | additive `DISMISSED`; placeholder crew allowed |
| Sales channel `trap` (`RASalesChannels`) | **A** | reserved IF-1 channel, claimed only while ON |
| Money (`RAMoneyLedger` / `RALife`) | **A** | all F05 money tagged `trap:*` |
| WAKE/NIGHT bus (`RAWakeBus`) | **A** | night handlers priority < 0, wake ≥ 0; no double-fire |
| Phone registry (`RAPhoneRegistry`) | **A** | reserved `trap` app slot stays dark while OFF |
| Minigames (`RAMinigames`) | **A** | registered only while ON |
| Migrations (`RAMigrations`) | **A** | declaration-only; no orphan submission |
| F04 (War Room) December offer / districts | **D** | `F04_INTEGRATION_PENDING`; F04 branch is `frag/playmakers-war-room/001` (not merged) |
| F06 (RAINMAKER) BIG TIPPER | **D** | `F06_INTEGRATION_PENDING`; F06 branch is `frag/rainmaker/make-it-rain-sandbox-001` (not merged) |
| F02 weapon ownership | **A/C** | adapter auto-switches when `RAIronAndGrace.trap` exists; no F05 change needed |
| **F01 OL-023 raid resolution** | **B (done) + C** | F05-owned consumer adapter added now; F01-owned hookup (`handoff()` → PLAY, PLAY result → `applyDefense()`) is the integration owner's |
| Legacy F01 tactical profiles `TRAP_RAID`/`TRAP_DEFENSE` | **C** | reserved in `js/frag/F01/packets.js`; not wired on the OL-023 line |
| `index.html` loader entry | **C** | owner re-runs `npm run loader:sync`; `check-owner-surfaces` flags it on fragment branches by design |
| `trap_report_card` art need | **B?/decision** | see §3 — needs an authored-source confirmation before removal |

Classification key: **A** already compatible · **B** F05-owned repair possible now · **C** shared contract
needs the final integration owner · **D** source required · **E** architecture collision.

---

## 3. Legacy assumptions (Task 3)

F05 was already clean. The only pre-OL-023 assumptions found and handled:

| Item | Action | Notes |
|---|---|---|
| `raids.js` header/comment implying "F01 SHOWDOWN_CORE not frozen" | **Replaced** (comment only) | Now documents OL-023 as authoritative; behaviour unchanged |
| `raids.js` raid result had no canonical outcome field | **Repaired additively** | New optional `canonical`/`state`/`crewCaptured`; legacy `win`/`lose`/`big_raid` untouched |
| `artNeeds[].trap_report_card` | **Marked, not removed** | Removing authored art scope would require a source decision → `FINAL_INTEGRATION_REQUIRED` if F01's retired report card is meant to drop it |
| Audio `expectedPath` `assets/audio/sfx/the_trap/` | **Replaced** | Corrected to the F11 delivered location `assets/audio/sfx/trap/`; still inert |

No tactical RUN, moment card, report-card output, seating, visible NERVE, obsolete route name, or retired F01
UI hook exists in F05-owned code.

---

## 4. Outcome adapters (Task 4)

`js/frag/F05/raids.js` now exposes the canonical F05 raid-outcome surface. **No new outcome types are invented:**
the tokens are F01's.

```
RATrap.raids.DEFENSE_OUTCOMES = ['HELD','BREACHED','FELL_BACK','WASH']   // F01's own tokens
RATrap.raids.canonicalOutcome(x)      // token or alias -> canonical | null
RATrap.raids.fromPlayRecord(record)   // F01 THE PLAY summarizeRecord -> canonical | null
RATrap.raids.handoff({houseId})       // F05 -> F01 request: {play:{job:'hold_the_house',…}, packet}
RATrap.raids.resolve({outcome,…})     // existing + canonical tokens; authored losses only
RATrap.raids.applyDefense({canonical|record})   // F01 -> F05 consequence application
```

Mapping (authored THE TRAP consequences only — no invented loot):

| Canonical | Meaning | F05 effect |
|---|---|---|
| `HELD` | HOLD win — the door held | no stash loss, no unbanked loss, house not hot |
| `BREACHED` | HOLD breach — the house is hit | stash (cases) + 30% unbanked at risk + house hot 5 nights; fallback capture rule unless an F01 record supplies captives |
| `FELL_BACK` | OL-022 defense-only last stand | the same hit, **forced 0 captures**; own `FELL_BACK` state recorded |
| `WASH` | 0 able | the same hit; authored fallback capture rule applies |

Banked money is never touched. `resolve()` clears the pending raid, so a resolved raid is **idempotent**
(second call = `no-pending-raid`). Crew state, HEAT, and lost guns come from the F01 record when supplied
(`applyDefense({record})`); a lost gun is released from the F02/F05 weapon seam.

`records` accepted are the F01 THE PLAY `summarizeRecord(...)` shape: `fellBack`, `klass`, `getaway`,
`shape`/`job`, `win`, `captives`, `lost.guns`.

---

## 5. HOLD THE HOUSE / FALL BACK contract (Task 5)

**Verified compatible; the OL-022 rule was not modified.** F05 does not own FALL BACK — F01 does
(`js/frag/F01/play/engine.mjs › fallBackEligible`). F05 only consumes the result.

Canonical reminder (unchanged): defense/HOLD only · crew start ≥ 2 · exactly 1 able · ≥ 1 downed · no dead ·
before resolution · automatic · never offense/BIG · 0 able = WASH-equivalent. Outcome: house BREACHED, raid
stash/product at risk lost, banked money safe, 0 captures/deaths, downed WOUNDED, base HEAT, own FELL_BACK
state, not BAILED/ROBBED/JUGGED. Headline: *FELL BACK — THE HOUSE IS HIT, THE CREW ISN'T*.

F05 compatibility notes:
- F05 adds **no** capture for `FELL_BACK` (`zeroCapture`), matching 0 captures/0 deaths.
- F05 never fabricates `BAILED`/`ROBBED`/`JUGGED` state (those are offense-only in OL-023).
- F05 applies base HEAT only where it is the HEAT owner; F01's `heat`/`heatDelta` is authoritative and is not double-applied.
- The F05→F01 HOLD request is `handoff()` (`play.job='hold_the_house'`, `defense:true`, map `traphouse`).

---

## 6. F11 audio readiness (Task 6)

Current F05 hooks: `js/data/audio/parts/F05_trap.js` — `TR_01`–`TR_06`, all `file:null`/`registered:false`
(inert drop-in hooks), scene `the_trap`.

F11 (`origin/frag/audio-completion/001` @ `9eb8732`, `docs/engineering/F11_AUDIO_COMPLETION_001.md`) registers
the same ids as **real** audio at `assets/audio/sfx/trap/TR_0X.mp3` (F11 supersedes this same-path file on merge).

| ID | F05 hook (this branch) | F11 registration (delivered) | Runtime path | Status |
|---|---|---|---|---|
| `TR_01` | inert, `assets/audio/sfx/trap/TR_01.mp3` (corrected) | registered · loop end 3.477 | `assets/audio/sfx/trap/TR_01.mp3` | F11 master `SOURCE_REQUIRED` until F11 merges |
| `TR_02` | inert | registered · one-shot | `assets/audio/sfx/trap/TR_02.mp3` | `SOURCE_REQUIRED` |
| `TR_03` | inert | registered · one-shot | `assets/audio/sfx/trap/TR_03.mp3` | `SOURCE_REQUIRED` |
| `TR_04` | inert | registered · one-shot | `assets/audio/sfx/trap/TR_04.mp3` | `SOURCE_REQUIRED` |
| `TR_05` | inert | registered · loop end 2.632 | `assets/audio/sfx/trap/TR_05.mp3` | `SOURCE_REQUIRED` |
| `TR_06` | inert | registered · one-shot | `assets/audio/sfx/trap/TR_06.mp3` | `SOURCE_REQUIRED` |

- F05-owned repair done now: `expectedPath` corrected from `assets/audio/sfx/the_trap/` to the delivered
  `assets/audio/sfx/trap/` so a dropped-in master resolves without a second edit. Hooks stay inert (masters absent).
- No F05 code invents a new audio id.
- No authored F05 call site exists yet (both branches: F05 audio is manifest-only) — `CONSUMER_PENDING`.
- **Missing / ready map:** all six are `READY (F11 registered) / CONSUMER_PENDING`; the F05 build is missing the
  F11 masters → `SOURCE_REQUIRED` = F11 merge.

---

## 7. Tests (Task 7)

`tools/tests/f05/the_trap.test.mjs` (29 PASS groups). New/updated groups:

| Test | Proves |
|---|---|
| `F05 outcome vocabulary` | F01 tokens, aliases, `fromPlayRecord` shapes, no invented types |
| `F05 HOLD win` | `HELD` loses no stash/cash and does not heat the house |
| `F05 HOLD breach` | stash + 30% unbanked at risk, house hot, banked money safe |
| `F05 FALL BACK` | house hit, 0 captures, banked safe, own `FELL_BACK` state, no fabricated robbery |
| `F05 WASH` | 0 able uses the authored fallback crew rule |
| `F05 outcome record` | F01 captives authoritative; lost gun released; no duplicate ownership |
| `F05 outcome idempotency` | a resolved raid is not applied twice; one history entry |
| `F05 outcome persistence` | canonical outcome + history survive a save round trip |
| `F05 handoff` | F05→F01 HOLD THE HOUSE request + entry-packet shape |
| `F05 audio hooks + art/crew honesty` | inert hooks + corrected F11 `expectedPath` |

Run: `node tools/run-tests.mjs --fragment f05`.

---

## 8. Integration manifest (Task 8)

| # | Source file | Destination / shared contract | Required change | Owner | Risk | Touches F01? | Proof |
|---|---|---|---|---|---|---|---|
| 1 | `js/frag/F05/raids.js` | `js/frag/F01/play` (OL-023) | F01 consumes `RATrap.raids.handoff()` and runs the `hold_the_house` defense PLAY; returns its record | F01 integration owner | Low | Yes (F01 host) | F05 `handoff` test + F01 `fallback.test.mjs` |
| 2 | `js/frag/F05/raids.js` | F01 result → `applyDefense({record})` | Call `RATrap.raids.applyDefense({record})` once per resolved defense raid | F01/F05 integration owner | Low | Yes (call site) | F05 outcome-record + idempotency tests |
| 3 | `js/frag/F05/raids.js` | `RAShowdownPackets` profiles | If the legacy tactical layer is still used, wire the reserved `TRAP_RAID`/`TRAP_DEFENSE` profiles | F01 owner | Medium | Yes | F01 `packets.test.mjs` |
| 4 | `js/data/audio/parts/F05_trap.js` | F11 `js/data/audio/parts/F05_trap.js` | Resolve the same-path file in favour of F11's registered version; ship `assets/audio/sfx/trap/TR_0*.mp3` | F11 / integration owner | Low | No | F11 audio suite + F05 audio test |
| 5 | `index.html` | loader (generated) | `npm run loader:sync` after F05 lands on trunk | Integration owner | Low | Yes (generated owner surface) | `npm run loader:verify` |
| 6 | `js/if1/flag_defaults.js` | IF-1 flags | Promote `F05.the_trap` (or unify with reserved `F05.trap`) | Integration owner | Low | No | IF-1 features suite |
| 7 | `js/frag/F05/tunables.js` | F13 balance | Replace `F05_PROVISIONAL` with authored numbers | F13 | Medium | No | F13 harness |
| 8 | `js/frag/F05/tunables.js` | authored source | `levelJobs` scenes, people-notice lines, December lines, `artNeeds` (incl. `trap_report_card`) | Authoring/Art | Medium | No | content review |
| 9 | F04 / F06 branches | `RAFrag` namespace read | Merge F04 (December offer/districts) and F06 (BIG TIPPER); adapters auto-detect | F04/F06 owners | Medium | No | F04/F06 suites |
| 10 | F02 branch | `RAIronAndGrace.trap` | Merge F02; weapon adapter switches automatically | F02 owner | Low | No | F05 weapons-seam test |
| 11 | pre-existing F00 file `tools/tests/if1/sealed.test.mjs` | post-rewrite main | Base predates OL-019; the post-rewrite HQ guard flags this path. Reconcile by basing on post-rewrite main before merge | Integration owner | Medium | No | `tools/guards/hq-path-guard.mjs --tracked` |

---

## 9. Repo safety / guard evidence

- Remote HEAD confirmed: `origin/main` @ `625f3c6` (post-rewrite, guard present).
- Isolated prep branch created from the post-rewrite remote F05 tip `14b11c2`.
- HQ/public guard: the guard **does not exist** on the F05 base (it was added in OL-019 on `main`); running the
  post-rewrite guard from the main clone against this tree flags the pre-existing `tools/tests/if1/sealed.test.mjs`
  (F00/IF-1-owned, outside F05 ownership) → manifest item #11. Every F05-changed path passes the guard.
- `node tools/loader.mjs verify` → PASS. `node tools/leak-check.mjs` → PASS (1604 files).
- No push performed; no F01 presentation, OL-023 UI, or `main` touched.
