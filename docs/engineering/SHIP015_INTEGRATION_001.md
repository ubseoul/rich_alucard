# SHIP 015 INTEGRATION 001 — ENGINEERING 05B (micro pass)

Branch `claude/ship015-integration-001` · status **READY FOR HQ REVIEW** (not self-approved; no FUN/TASTE verdict; not a release candidate; nothing merged or deployed).

Spoiler-safe: ids, surfaces and results only. OPEN content only — no SEALED document or `js/sealed/` file was opened or changed, and the brothers are presented only in their existing ordinary family places.

## 1. Authority

| | |
|---|---|
| Starting runtime SHA | `459f252eebc5cc4f3de87e0796ddec5d1b298e05` (`claude/open-art-life-integration-001`, Engineering 05, HQ technical PASS) |
| Ship 015 authority | `art/art_ship_015` @ `d73946c0399485f7d4a6329966368c06cb368d3e` — verified on the remote before any runtime change |
| Final SHA | the commit that adds this document (reported in the HQ return) |
| Branch | `claude/ship015-integration-001`, created from exactly `459f252` in its own worktree |
| Import | Path checkout from `d73946c`, not a merge: the 7 production files, the Ship 015 records (manifest, map, ledgers, SHA256 sums, validation, tools) and the Art registers it updated. Review boards, generation sources and pre-correction evidence stay on the Art branch |

**Authority checks (all matched; nothing inferred):** branch exists at exactly `d73946c`, its parent is Ship 014's `f1ae59a`, and every changed path is under `art_department/` or `assets/before_the_fame/art_ship_015/` (0 runtime/gameplay files); records say **APPROVED MASTER / FROZEN / COMPLETE**, 7 accepted assets, corpus 404 → **411**, register 544 → 551, SEALED access 0, Ship 011 changes 0; the 7 files hash exactly to the HQ card values and to `PROMOTED_SHA256SUMS.txt` (the manifest keys the two God states under one asset id `A-god`, distinguished by `state`).

## 2. What each asset does now

| Asset | Hash (prefix) | Result | Exact surface |
|---|---|---|---|
| `A-family-brother1-avatar.png` | `70f46469` | **Player-facing** | TEXTS → FAMILY thread: every `BIG BRO` message shows his avatar (whole visible bust 37×40, native pixels) |
| `A-family-brother2-avatar.png` | `3bfa7ab3` | **Player-facing** | TEXTS → FAMILY thread: every `LIL BRO` message (whole bust 35×38) |
| `A-god-seated_on_curb.png` | `f9112765` | **Player-facing** | A31 GOD ON THE CURB `arrive`/`stars`/`silence` — "someone sits down next to him"; she is God's identity anchor |
| `A-god-fading.png` | `e22f2be9` | **Player-facing** | A31 `fade` — "she fades" |
| `A-og-hooper.png` | `dfb70a46` | **Player-facing** | PICKUP (via GO SOMEWHERE → VENICE COURTS): when a game ends and the authored line "an OG on the sideline: 'run it back?'" appears, the OG stands on the right sideline (native 1:1 on his contact, fully on canvas) |
| `A-family-brother1.png` | `8ca1f250` | **Approved, registered, unwired** | Identity anchor for `brother1` (resolvable by id). His only OPEN appearance off the phone is a spoken line in A53's Thanksgiving kitchen, whose authored cast is mom/Rich/dad; staging him would add a cast member to an authored beat |
| `A-family-brother2.png` | `9afe9279` | **Approved, registered, unwired** | Same as above for `brother2` |

**Why these surfaces.** God appears in exactly one OPEN beat (A31), whose text seats her beside Rich and later fades her, and Ship 015's own curb-staging review stages her there. The OG exists in OPEN content only at the PICKUP result line, and Ship 015's court-staging review puts him on the Venice court. The brothers already send FAMILY thread messages as `BIG BRO` / `LIL BRO` (the same `brother1`/`brother2` display names). No story, dialogue, encounter, route or canon was added.

## 3. Changes

Eight hand-authored Engineering files, plus the imported Art, generated data and this document:

| File | Change |
|---|---|
| `tools/art-registry.mjs` | Ship 015 joins the Ship 014 contract; rows keyed by production file name; `characters.<id>.anchor.<pose>` creates a new identity anchor from the manifest contact (refused if one exists) |
| `tools/art-integration/ship015_runtime_map.json` | New: one runtime key per file with its surface or reason |
| `tools/art-integration.mjs` | The gate's Ship 014 row builder now covers Ship 014 and 015 (claimed-but-unconsumed rows still fail) |
| `js/data/btf/adventures/w5.js` | A31: God staged on `arrive` (seated) and `fade` (fading); Rich moves from `mid` to `left` on those two nodes, as in Art's staging. With `mid`, the Director closed the pair's gap until God covered Rich's face (`face-visible` failed live at all three widths) |
| `js/minigames/pickup.js` | Draws `og_hooper` on the sideline with the existing end-of-game line |
| `js/phone/apps_core.js` | FAMILY avatars gain BIG BRO / LIL BRO with per-avatar framing (their visible bust, uncropped); mom/dad/sister unchanged |
| `tools/presentation/annotations.json` | Face boxes for God's two states (read by eye) |
| `tools/art-integration/review.json` | Clears the four stale "no approved art" people entries; updates the PICKUP and phone-card surface notes |
| Generated | `js/data/art_registry.js`, `js/data/presentation_assets.js`, `docs/art_integration/INTEGRATION_MATRIX.json`, `docs/presentation/locks/wave1-adventures.json` |
| Imported (Art, exact bytes) | 7 PNGs under `assets/before_the_fame/art_ship_015/package_a/`; `art_department/ships/art_ship_015/` records; `ASSET_REGISTER.json` (551), `APPROVAL_LEDGER.md`, `APPROVED_ASSET_INDEX.md`, `CURRENT_HANDOFF.md`, `CURRENT_OPEN_ART_GAPS.{json,md}`, `START_HERE.md` |

## 4. Presentation Director

- **Census: 166 → 166 PASS / 0 HOLD** (149 adventure screens + 17 fights). The count does not grow: A31's curb screen `curb|mid:rich` becomes `curb|left:rich,right:god@seated_on_curb` (reviewed; lock rewritten). Director exceptions: **PD-FA-03 only**, unchanged.
- **The fade screen is outside the census.** God's `fading` state is on A31's end node, and the dry-run census has always skipped end nodes (a rule predating this pass). I linted it live instead: **PASS at 360/390/430**. Widening the census to every end node is recorded for the completeness audit, not done here.
- **Live checks, 360×740 / 390×844 / 430×932:**
  - A31 arrive and fade: lint PASS; `<img>` actors use `image-rendering: pixelated`; the right sprites (Rich standing, God seated/fading); no page errors.
  - FAMILY avatars: native size (mom/dad/sister 22×28 framed as before; brothers 37×40 / 35×38 whole), pixelated.
  - PICKUP result: the OG appears only at game end and draws at native 1:1 (nearest-neighbour `drawSprite`) fully on canvas.

## 5. Regression

**Focused first:** registry build (391 files; each Ship 015 byte, alpha, size and contact checked); A31 dry run and live lint at 360/390/430; FAMILY avatar rendering; the PICKUP result with the OG.

**Full battery** (all green; the built game was the committed runtime, identical to the final SHA's):

| Check | Result |
|---|---|
| `npm test` | PASS. Presentation: 149 screens vs lock, PD-FA-03 only. Art integration: 391 files, matrix **166 PASS**. Reachability: 112 adventures, 12 route proofs, 0 without a player entry. Release gate: paused-Supra assertions pass |
| `npm run build` / `npm run verify:artifact` | PASS |
| Frozen corpus | Ship 015 **411/411**, promoted 7/7; Ship 014 404/404; Ship 011 212/212; register 551 (7/7 Ship 015 FROZEN). Since `459f252` no file under `assets/` was modified or deleted (7 added) |
| Ship 011 gate | Unchanged: library only, no population file referenced (checked by `npm test`) |
| Presentation sweeps (live) | Adventures **149/149 at 360/390/430**, 1 accepted exception, 0 errors; fights **17/17** |
| 9/9 routed adventures, ONLYVAMPS | Built game, `--only routes`: all nine reached through player taps, refresh diff 0 (Velvet → ONLYVAMPS opens) |
| PICKUP / PIER | Built game: PICKUP through VENICE COURTS play (finished) + quit; PIER play + quit; both return cleanly |
| Paused Supra / fresh opening / migration | All 8 fixtures v12. Paused Supra → bedroom with no prologue. New game at 360/390/430 (A00 → throne → bedroom), mid-prologue and throne refresh, throne defeat |
| Armory / in-adventure availability fix | Reachability proof A23R (Grave hub → A19 → A24 → ARMORY) passes; built-game A23R route passes |
| Protected ending | Fires once after day 35, THE NEXT MORNING → day 36, refresh ok, no replay |
| Save | v12, no field added |
| Widths 360/390/430 | Bedroom, castle, phone pages, minigame canvases OK |
| Findings | **0** across all built-game sets |

The TOUGE harness timing limit documented in Engineering 05 was not touched and did not recur (TOUGE wasn't among the affected surfaces).

## 6. Deferred to the completeness audit (not fixed here)

- **Census:** end-node screens are not in the Presentation census (for example A31 `fade`, A30 `wakeup`). They are player-facing.
- **Staging (Ship 014 carry-over):** 20 entrance cues (`E(person)`) fire in a node where that person is not staged. In some (e.g. A37, A29C) the person is staged in a later node. In others the person is never staged: the MEET beats for Emberly, Jade, Lo, Hina and Anfeesa, plus A18 (Kaede), A25 (Nightshade) and A38 (Brenda). Engineering 05 kept the no-new-cast rule for these, and this pass applied the same rule to the brothers. The exception is A31: the node text itself seats God beside Rich, and Art staged it. One HQ decision could settle all of these together.
- **PICKUP:** the other three players remain placeholders (NC-FA-07).
