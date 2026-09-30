# F04 WAR ROOM → F01 THE PLAY — INTEGRATION (OL-023 lineage)

Branch: `integration/f04-war-room-play-remap-001` · F01 source (authoritative, closed): `frag/showdown-core/play-sandbox-001` @ `039bcae08f98c4508b3d4fd0bac082c921dd67df` · F04 source: `frag/playmakers-war-room/001` @ `de99634` (2 commits, ported) · `main` NOT merged.

**Shape of the game now:** WAR ROOM answers **"WHAT PLAY DO I WANT TO MAKE?"**. Once a job is chosen the player is in F01's canonical **PHONE → CREW / CAR → DEPARTURE → ARRIVAL → LIVE FEED → RETURN** and comes back to the WAR ROOM with a result. F04 shows no crew setup, seating, tactical combat, NERVE, moment cards, report-card presentation, percentages or PLAY outcome.

## 1. Repo safety record
- Lineage: post-rewrite. `git rev-list HEAD` ∩ OL-019 *old* SHAs (`docs/engineering/OL019_HISTORY_REWRITE_COMMIT_MAP.txt`) = **0**. F01 `039bcae` descends from the rewritten `c899d70`; F04 `de99634` is the rewritten tip of `frag/playmakers-war-room/001`.
- Remote `origin` = `https://github.com/ubseoul/rich_alucard`. This branch is pushed only to its own name.
- HQ/public guard: `tools/guards/hq-path-guard.mjs` (OL-019 H, on `main` `625f3c6`) run from `main`'s copy against this branch's tracked and untracked paths → **exit 0**. The guard files/CI are **not** in this lineage (F01 and F04 branched from the F00 spine before the guard commit); they arrive when `main` is merged (integration owner). Nothing was cherry-picked from `main`.
- **WARNING for whoever holds this clone:** the local branch `main` (`f2ca7d4`) is a **pre-rewrite** ref (50 old SHAs). It was left untouched and **must never be pushed**.

## 2. Koreatown ownership fix (DeepSeek finding 1)
- Defect reproduced against the pre-fix file: `RADistricts.define: koreatown already defined by F03` is thrown by F04's loop, so `arts_district` and `inglewood` never register (`registered: koreatown`).
- Fix (`js/frag/F04/districts.js`): F04 **defines only what nobody else owns** (`arts_district`, `inglewood`), each define isolated in try/catch; **Koreatown is consumed**. F04's demand / heat weights for all three live in an F04-owned overlay table (`RAWarRoomDistricts.strategic(id)`), so F03's meta-less definition works. `RAWarRoomDistricts.activeIds()` / `usable(id)` / `provider()` report what is registered, who owns it and what is missing (`PROVIDER_MISSING`, owner F03). Every F04 consumer (night menu, wake pressure tick, board, hand back) uses `activeIds()` instead of a hard-coded list or `fragment === 'F04'`.
- Verified in three orders: F03 → F04 (production), F04 alone (Koreatown absent: not invented, jobs/pressure skip it, hand back falls back to a usable district), F03 after F04 (F03's tolerant define succeeds, F04 picks it up). Tests: `tools/tests/F04/district_provider.test.mjs`.

## 3. The contract — ONE adapter, versioned (`js/frag/F01/play_contract.js`, `RAPlayContract`, v1)
F01 owns the file and the version; F04 builds requests and consumes results.

**Request `F04.play_request` v1** (F04 → F01) — strategic only: `requestId` (idempotency key), `seed`, `day`, `job{f01JobId, f04Type, district, handBack, captive{ids,clock}}`, `roster[{id,name,cls,status ACTIVE|DOWNED|CAPTURED,bonds,perks}]` (exactly F04's crew, GONE excluded), `garage.owned` (F04 maps its owned cars onto `SUPRA|S2000|URUS|HOOPTIE`), `bank` (dollars), `heat`, `rosterCap`, `dayOneThreshold`. No grid, no seating, no approach, no stat block, no Rich field stats.

**Result `F01.play_result` v1** (F01 → F04): `status COMPLETE | DECLINED | REFUSED` (+`code`), `outcome{win,klass,…}`, `crew[{id,before,after READY|WOUNDED|SHOT|CAPTURED|GONE|DEAD,away}]`, `cash{gain,spent}` (dollars), `heat{delta}`, `car{id,lost,route,cause}`, `guns`, `loot`, `recruits`, `rescued`, `captured`, `newBonds`, `storySeeds`, `flags`, `digest`.

**F01 side** (`js/frag/F01/play/adapter.mjs`, `assets/f01/play/feel-ui.mjs` embed controller, `RAShowdown.play` in `showdown.js`): `prepareWorld` (F04 is authoritative for crew status / bonds / bank / HEAT / owned cars; F01 keeps nerve baselines, scars, nicknames, line memory, lost guns, feel state), `pitchFor` (the ONE job chosen; refuses `NO_CAR` / `NO_CAR_FITS` / `NOBODY_READY` — no loaner, nothing invented), `buildResult`, `runHeadless` (same steps as the browser controller, used by tests). Embed mode is `assets/f01/play/index.html?embed=1` in an iframe opened by `RAShowdown.play.launch(request)`; request/result travel by same-origin `postMessage`; no title screen, no NEW CAREER, the last button is **BACK TO THE WAR ROOM**. The embed world is committed **with the result, before the return scene**, and completed requests are answered from a record (`ra.f01.play.v1.embed_results`), never replayed. The PLAY page never writes the game save.

**F04 side** (`js/frag/F04/play_adapter.js`, `RAWarRoomPlay`, replaces `showdown_stub.js`): `buildRequest` → persist `play.pending` **before** asking F01 → `launch` → `consume(result)`. `consume` is idempotent on `requestId`, applies each effect in isolation (one failure cannot abort the rest, errors are recorded), and writes the consumed marker last. `resume()` re-issues a pending request after a reload; if F01 already finished, it answers from its record.

## 4. How a result lands in WAR ROOM state
| F01 says | F04 does |
|---|---|
| `READY` | `ACTIVE` |
| `WOUNDED` / `SHOT` (carried home) | `DOWNED` with a **recovery timer** (`away` nights → `ACTIVE`). *Not* the bleed-out clock: `setDowned` (bleed → GONE) is the un-carried case and is no longer used for PLAY results |
| `CAPTURED` | `setCaptured` (3-night EXTRACT window, unchanged) |
| `GONE` / `DEAD` | `setGone` (BIG PLAY named loss, or a generic recruit) |
| `rescued` (EXTRACT win) | `CAPTURED → ACTIVE`, extract window closed |
| `cash.gain` then `cash.spent` | credit, then debit **clamped to the bank** (banked money never negative); tagged `war_room:play` / `war_room:play:spent` |
| `heat.delta` | F04's existing distribution: full to the district, 30 % to global (unchanged behaviour) |
| `recruits` | `RAWarRoomCrew.recruit` — F04 owns the roster cap (8); rejected recruits are reported |
| every pair that went out | `recordJobTogether` (F01 counts every PLAY as a co-run) |
| `storySeeds` | `addStory('play_<perk>')` (cap 4) |
| win | authored **non-cash** effects only (SUPPLY, STREET REP, RIVAL PRESSURE) + pressure reset |
| `RETALIATION` played | clears `retaliationPending` |
| HAND BACK result | `resolveHandBack` — route closes whatever the outcome |
| the car | `RAVehicles.recordDrive` if it survived. F04 never mutates ownership |

**No duplicate rewards:** for a PLAY-routed job the PLAY's banked pot is the money (the return scene counts exactly that) and the PLAY's heat is the HEAT. F04's authored per-type cash / HEAT (Vol 7 §3.2) are **not** paid on top. LAY LOW (no crew) is the only job F04 still resolves itself.

## 5. Retired (F04)
`RAWarRoomShowdown` (`showdown_stub.js`: entry packet builder with hard-coded roster / stat block / Rich field stats / grid, `receiveResolution`, the 10-item `F01_INTEGRATION_PENDING` registry) · the RUN SEQUENCE (`BEAT_LIBRARY`, `beatOdds`, `selectBeats`, QUIET/LOUD/OCTOPUS approach, `executeRun` for crew jobs — now throws `RUN_RETIRED`) · the squad / car / approach picker screen · the "⚔ SHOWDOWN / 🚗 RUN" cards and pending banners · `showdownSetup` on job cards. Authored data kept: `JOB_TYPES`, `resolveReward`, night modifiers, districts / pressure, crew, stories, bonds, GONE mourning, report cards (Vol 7 §7.3, strategic archive in the REPORT CARDS tab — the F01 return scene is the only PLAY outcome presentation), VampGram, wake handlers, HAND BACK state, persistence.

## 6. F04 job → F01 job (F04-owned table `RAWarRoomPlay.PLAY_MAP`; F01 validates the id)
DROP → `tupperware` / `vampire_dentist` · RE-UP → `dock_restock` · COLLECT → `boba_backroom` / `quiet_lift` · PROTECT → `vampire_gala` · TAKE THE BLOCK → `car_wash_stickup` / `smack_crib` · EXTRACT → F01 EXTRACT (`extractJob`) · RETALIATION → `hold_the_house` · **BAIT → `quiet_lift` (PROVISIONAL)** · **HAND BACK → `counting_house` BIG PLAY (PROVISIONAL)**. A due retaliation (`retaliationPending`, previously set but never surfaced) is now offered as a RETALIATION card.

## 7. OWNER_REQUIRED / SOURCE_REQUIRED (nothing invented)
1. **RAHeat.configure ownership** (global): F04 keeps its compatible local behaviour — it applies the Vol 7 §8 floors **only while HEAT is still provisional** and never overrides an owner's earlier `configure` (`RAWarRoomHeat.configured` reports which). F00's engineering record still lists the numeric floors as SOURCE_REQUIRED; F04's commit calls them authored. Owner must rule.
2. **Flag naming:** the runtime gate is `F01.showdown_core` (registered by F01, used by every F01 code path and now by `RAShowdown.play`). IF-1 `features.js` still reserves `F01.showdown`. No alias / migration was created. Owner must decide alias vs. rename.
3. **Authored §3.2 cash / HEAT vs PLAY pot / HEAT** (F13 / economy): F04 no longer pays the authored numbers for PLAY-routed jobs. Reconciliation is F13 work; no value was tuned.
4. **BAIT** has no F01 shape (provisional map above); **HAND BACK** ↔ which F01 job is the final stand (provisional).
5. **F01 loot ↔ F04 resources:** F01 loot categories `BLOOD_X` and `DISTRICT` ("a corner of the block changes hands") are **not** converted into F04 SUPPLY or district control (that would invent district ownership / economy). They are reported in the result's `loot` and remain F01's inventory.
6. **F01 possessions:** F01's lost cars / guns, its recovery surface (dealer / impound / weapon source) and RANSOM live in F01's embed world. F04 does not model ownership loss; RANSOM is not routed in embed mode (F04 owns the EXTRACT window). Car words / stats exist only for SUPRA / S2000 / URUS / HOOPTIE — other owned cars are not offered (SOURCE_REQUIRED F03/F13).
7. **F03 is not in this lineage.** Koreatown is exercised in tests with the verbatim F03 provider line; in the real game build without F03 it reports `PROVIDER_MISSING`.
8. **Pre-existing, not touched (IF-1 core):** `tools/tests/if1/loader.test.mjs` "new files land in their slots" FAILS at F01 `039bcae` itself (F01 shipped `js/frag/F01/migrations.js`, which the test's synthetic sandbox then re-creates). It also fails the `npm test` release gate on F01's own tip. Owner: IF-1 / F01.
9. `RAShowdown.f04.enter` / `packets.js#fromWarRoomPacket` (the pre-OL-023 tactical seam) still exist in F01's tree and F01's own suites still cover them; **F04 no longer calls them**. Retiring them is an F01-owner call.

## 8. Tests
`node tools/run-tests.mjs --fragment F04` (3 suites) · `--fragment f01` (15 suites incl. new `adapter.test.mjs`) · `node tools/tests/F04/browser-war-room.mjs` (real Chromium, 18 checks; not part of `npm test`).
- `district_provider.test.mjs` — Koreatown F03-owned and consumed, never redefined; arts + inglewood register in every load order; no duplicate district state; static guard.
- `play_roundtrip.test.mjs` — the real F01 engine as host: request contract; WAR ROOM phone action → PLAY → state; crew / bank / HEAT / vehicle / log / report card applied once; idempotent consume; reload including the crash window between F01 finishing and F04 consuming; banked money never negative; Koreatown jobs; refusals inert (no car / flag off / F01 absent / bad result / bad request); EXTRACT, RETALIATION, HAND BACK; recruit cap; F01 status vocabulary pinned; no tactical RUN UI, no percentages, no pending marker.
- `f01/adapter.test.mjs` — contract validators both ways; F04-authoritative world sync; refusals; 300 real PLAYs across every job and policy (cash ≤ bank + gain, bank never negative, only sent crew appear, named never DEAD, GONE only on BIG PLAY); determinism; continuity; embed page wiring.
- Mutation check (not committed): double-credit, F04 redefining Koreatown, non-idempotent consume and injuries-bleed-out each make the suites fail.
