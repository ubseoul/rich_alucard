# PLAYTEST READINESS 001 — FIRST SERIOUS PLAYTEST CANDIDATE

ENGINEERING 04 · branch `claude/playtest-candidate-001` · status **READY FOR HQ REVIEW** (not self-approved).

**Spoiler-safe for Ube.** This document names ids, systems, flags and outcomes only. It quotes no authored lines. PLAYER-BLIND flows (Ogun's Rave, The Property, World Events) and SEALED hooks are reported as neutral pass/fail only.

## Answer

**Yes — this build is technically ready for Ube Playtest 01**, subject to one HQ logistics decision: how Ube gets the build on his phone. Pages deploys only `main`, and `main` is behind (see §8).

- No open playtest blocker remains.
- Two genuine player-path defects were found and fixed:
  - a one-time wake event could be lost on refresh;
  - owned CASTLE rooms could act as dead buttons.
- Everything else found is non-blocking, intentional roughness, or needs an HQ decision, not an Engineering fix.

No FUN verdict is given or implied. FUN belongs to Ube.

## 1. Authority and method

| | |
|---|---|
| Starting authority | `claude/final-art-integration` @ `06d378846d98347715800624d76bf619df1465ac` (121 PASS / 0 HOLD, PD-FA-03 `face-size` only, save v12, 224/224 frozen) |
| Branch | `claude/playtest-candidate-001`, created from that exact SHA |
| Runtime truth | Verified from source at the SHA, not from prose: save `VERSION=12` (`js/engine/state.js`); START → A00 → throne → bedroom → A02 (`js/systems/newgame.js`); Maul = `lil_smack` `hp:60` (`w4.js`); PD-FA-03 is the only exception (`js/data/presentation.js`); Ship 011 is library-only and gated (`tools/art-integration.mjs`) |

**How the audit was run.** The evidence comes from the **built game** (`dist/`, with the build identity asserted in-page), not from unit tests alone.

- **New tool:** `tools/playtest-qa.mjs` plays through player controls: START, taps, choices, phone buttons, ⌂ CASTLE, ☾ SLEEP, minigame canvases and QUIT.
- **Checks after every outing and every night:**
  - save v12;
  - finite money;
  - no duplicate receipts, memories, mail, history, cars, properties, rooms or text ids;
  - no non-repeatable adventure completed twice;
  - no world event delivered twice;
  - the persisted save equals live state;
  - clean return to the bedroom: no active adventure and no leftover minigame, adventure or combat mode.
- **Refresh check:** a real refresh followed by START must reproduce the save exactly (the scene field is excluded).
- **Setup shortcuts:** some scenarios seed a progressed life (for example a dragon egg or an owned room), with state only. Every step after the seed is a real tap. Seeds are listed per scenario in the tool.

Run it with:

```
RA_PLAYWRIGHT_PATH=… RA_CHROMIUM_PATH=… node tools/playtest-qa.mjs [--only newgame,life,minigames,…] [--days N]
```

It writes a REVIEWER-ONLY evidence folder (screenshots can show authored content).

## 2. Player paths actually exercised (built game)

| Path | Result |
|---|---|
| START on a fresh save → A00 ocean prologue → CEO throne fight → victory → STEAL (yes at 390, no at 360/430) → cut to bedroom → first wake, Morning Mail → Day 1 | PASS at 360×740, 390×844 and 430×932. Flags `prologueDone`/`throneDone`/`firstWakeDone` set, clock started, Day 1 |
| Day 1 family ping → phone → TEXTS → FAMILY thread → reply | PASS |
| Refresh mid-prologue → START | Resumes A00 at the same node |
| Refresh during the throne fight → START | Returns to the throne fight |
| Losing the throne fight | STAY DEAD keeps RESPAWN offered; RESPAWN restarts the fight (no dead end) |
| Life loop: 14 in-game days (Day 1 → 15) of wake → Morning Mail → phone/CASTLE outings → return → sleep, with random refreshes | PASS. 27 outings, 14 distinct adventures, Combat 2.0 fights, BARS and SLURP inside adventures; 0 findings |
| VampGPT: WHAT WE ON, MAKE MONEY, MEET PEOPLE, GO SOMEWHERE → adventures | PASS; each returned to the bedroom with a clean state |
| CASTLE rooms (throne, tacos, music, kitchen, roof, movie, garage…) | PASS after fix F-02 |
| Legacy flows inside the new life: Butter Chicken trip; Ogun's Rave (PLAYER-BLIND; the invite arrives as INCOMING and is accepted on the phone); the Supra via JDMIMPORTS (dock fight → owned, $78K); The Property via RealMoneyRealEstate (PLAYER-BLIND) | All enter, complete or pause correctly, return to the bedroom, and survive refresh. The Property paused after the Supra purchase left $22K (a budget outcome, not a fault) |
| Protected ending | Fires once on the sleep after eligibility; offers THE NEXT MORNING; life continues (Day 36 → 37); survives refresh; does not replay |
| Save migration | Every fixture (fresh, legacy v4, life v6, butterChicken, supraPaused, supraOwned, malformed JSON → recovery, partial corrupt) loads as v12, STARTs, plays, and refreshes with no diff |

## 3. Systems actually exercised

- **Core loop:** life clock and day progression (Day 1 → 15, rain and full-moon mail, weekday line).
- **Phone Life OS:** Morning Mail; TEXTS; InstaHoe → ASK HER OUT → DATE (date count, followers); VampGram; RECEIPTS; RICH RADIO.
- **Combat:** Combat 2.0 fights inside adventures and the THRONE spar, including the OCTOPUS BRAIN choices. The legacy CEO throne fight and the JDM dock fight keep their accepted boundaries.
- **Home, music and dragon:**
  - castle room purchase and use;
  - music: COOK → DROP → catalog unlock → RICH RADIO;
  - dragon: egg → A11 hatch on a wake → HATCH feeding (fish consumed, fed/bond persist through refresh).
- **Cars and property:** RICHBOIMPORTS buy → delivery adventure; real-estate lane entry.
- **Parties:** party lane; hosting unlock → Party Hall.
- **Ecology:** pressure rises and the headline is delivered.
- **Progression:** momentum/fame progression → protected ending → RECEIPTS credits.

**Headless persona simulations** (`tools/persona-sim.mjs`: Homebody, Party, Landlord, Weirdo) each reach the protected ending on Day 36 with 31–39 distinct adventures and no errors.

## 4. Nine minigames — enter → interact → finish/quit → return → state valid

Each was entered by its in-game player route, played until it finished naturally, then entered again and quit with ✕ QUIT. Both exits returned to the correct place, left no residue, kept the save valid, and reproduced exactly after refresh.

| Minigame | Player route used | Natural finish | QUIT | Notes |
|---|---|---|---|---|
| TOUGE | Phone → TOUGE → RUN | PASS (a run lasts ~90 s) | PASS | Best score saved |
| GARAGE | Phone → JDMIMPORTS → SHOP BAY | PASS | PASS | Progress saved |
| PIER | GO SOMEWHERE → SANTA MONICA PIER → A12 | PASS | PASS (A12 continues) | A caught fish goes into the bag |
| HATCH | Phone → HATCH → OPEN HATCH | PASS | PASS | FEED persists |
| BARS | Phone → BARS → PLAY | PASS (60 s run) | PASS | Score/progress saved |
| SLURP | GO SOMEWHERE → SLURP DYNASTY → A08 | PASS | PASS (A08 continues) | — |
| JOLLOF WARS | ⌂ CASTLE → KITCHEN → practice | PASS | PASS | Also reached from the systems pass |
| HOOKAH RINGS | ⌂ CASTLE → HOOKAH ROOF | PASS | PASS | — |
| PICKUP | `minigame-lab.html` (Play Window A surface) | PASS (returns to the lab menu) | PASS | **No in-game route exists** (see §7) |

All nine also open and quit cleanly from `minigame-lab.html`. At 360, 390 and 430 every minigame canvas fits the screen and ✕ QUIT stays visible and tappable. No feel or taste ranking is made.

## 5. Save / reload results

- **Refresh:** refreshes at random points across the 14-day life run and after every scenario gave RELOAD-STATE-DIFF **0**.
- **Invariants:** no duplicate rewards or one-time events, and no stale state.
- **Mid-flow refresh:** mid-adventure, mid-minigame (adventure node) and mid-fight all resume at the saved node; phone-launched minigames return to the bedroom.
- **One-time events:**
  - the protected ending fires once;
  - the Ogun invite is delivered once;
  - non-repeatable adventures never complete twice;
  - after F-01, a refresh during Morning Mail keeps the day's wake adventure.
- **Save size:** about 30 KB after 14 days, well under browser storage limits.

## 6. Blockers found and fixed

| ID | Class | Finding | Fix |
|---|---|---|---|
| F-01 | PLAYTEST BLOCKER (one-time event loss) | A wake adventure is offered only by the Morning Mail's GET UP after a real sleep. A refresh while the mail was up re-showed the mail without it. Day-specific wake adventures (morning after a party, full moon, rain) were then **lost permanently**. Reproduced on the accepted build. | `js/scenes/bedroom_life.js`: the bedroom re-offers the wake adventure that morning's sleep already chose, only until it has started that day. It never picks a new one. Verified: refresh → "…" → the wake adventure runs. |
| F-02 | ENGINEERING BUG (dead button) | Owned CASTLE rooms whose adventure is on cooldown, once-a-night, or already done (MAID QUARTERS after its visit, HOOKAH ROOF cooldown, second DON CHUY'S, MUSIC ROOM cook) closed the menu and did nothing. | `js/systems/castle.js`: the room answers "not tonight." — the phone's existing line for the same situation — and the menu stays open. |

No frozen byte, story line, choice, outcome, combat number or save field changed.

## 7. Remaining findings (not fixed)

**ENGINEERING BUG — NON-BLOCKING**

- **E-01:** a pre-v12 save with a *paused* Supra acquisition and no other progress (`supraPaused` fixture) is not treated as "progressed" by the v11→v12 migration. It replays the new-game prologue and keeps the paused acquisition. It is harmless for a fresh Playtest 01.
- **E-02 (tooling):** `party-browser-test` still expects START → bedroom (accepted-baseline failure). `rave-browser-test` needs `sharp`. Both call `chromium.launch()` with no path. The new tool covers these paths on the built game.

**DESIGNED / SCOPED BUT NOT IMPLEMENTED — player entry missing**

- **D-01:** 9 authored adventures are named by nothing except their own definition. They have no place, lane, temptation, wake trigger, chain or system call, so they are reachable only from DEV:
  - `A_EMBERLY1`, `A_JADE1`, `A_LO1`, `A_HINA1`, `A_ANFEESA1`, `A_VELVET1`;
  - `A37` (scope MUST);
  - `A46`;
  - `A23R`.

  Consequences: four people (emberly, jade, lo, velvet) cannot be met in play. ONLYVAMPS can never unlock (it keeps its in-world "invite only." line).

  Choosing an entry, its line and its timing is a product decision (§8). It was not invented here.
- **D-02:** PICKUP has no in-game route. Its only surface is the feel-batch lab, consistent with `docs/btf/PLAY_WINDOW_A.md`. The frozen PICKUP app icon is already "mapping-ambiguous" (NC-FA-09).

**ROUGHNESS / POLISH:** no layout failure on the active screen at 360/390/430. The phone content scrolls; modal layers correctly cover the bedroom controls. The flag emoji in FAMILY renders as letters on Windows Chromium (platform font).

**KNOWN INTENTIONAL ROUGHNESS (verified against source today)**

- **Audio:** 4 of 5 song loops have no audio file (`radio.js` `file:null`; RICH RADIO says "LOOP PENDING"). Only BLOODBATH plays.
- **Rich voice:** 239 Rich `[VP]` lines await Ube's voice pass (`node tools/vp-lines.mjs`).
- **Other dialogue:** non-Rich dialogue is functional draft text.
- **Unnamed canon:** the cat's name (EGUSI), the family names, and the Maggi/Magi label.
- **Art:** gaps off the census (RAPixel placeholders in some off-census environments/minigames), the ART SHIP 011 library (unassigned), and 4 frozen states with no scene.
- **Speaker labels:** Portobello speaker labels show raw ids (HQ-FAI-02, deferred).
- **Tuning:** momentum saturates quickly in very active play. Throne-room and bedroom composed art is not rescaled (deliberate).

**PLAYER-BLIND / SEALED — DO NOT EXPOSE.** Sealed hooks remain neutral no-ops, and `js/sealed/pack.js` was not opened. PLAYER-BLIND flows were exercised for function only, and this report records ids and flags, not content. DEV tools stay off unless `?dev=1` (or F2 on a keyboard) is used, so a phone player can't reach them.

## 8. HQ decisions genuinely required

1. **Playtest access:** Pages deploys only `main`, which is behind this lineage. HQ decides merge/deploy sequencing, or another way to put this build on Ube's phone. Recommend starting Playtest 01 on a fresh save.
2. **D-01:** whether and how the 9 entry-less adventures get player entries (place, VampGPT lane, text or temptation, wake trigger) and when. This determines whether four people and ONLYVAMPS exist in play.
3. **D-02:** whether PICKUP gets an in-game surface (the VOL 5 extract names "Venice court at night"; the VENICE COURTS place exists), or stays lab-only for Playtest 01.
4. **E-01 (optional):** whether a paused Supra acquisition should count as progress in the v12 migration.

## 9. Source / authority gaps

- VOL 1, VOL 3 and HQ Addendum v1 are cited by `docs/btf/DECISIONS.md` but are not in the repository or its history. **SOURCE REQUIRED — NOT RECONSTRUCTED.** In particular, the intended entry points for D-01 could not be checked against them.
- Stale prose (history, not runtime truth): the save v7/v9 statements in `CURRENT_CANON.md`/`ENGINEERING_HANDOFF.md`, and the `PRODUCTION_CONTROL.md` header build/milestone. These were unchanged by this card.

## 10. Checkpoint protection and QA

| Protected item | Result at the final code SHA |
|---|---|
| 121-surface census | **121 PASS / 0 HOLD** |
| Adventures | Live sweep 104/104 at 360/390/430, including 1 accepted exception; dry run 103 + 1 accepted (`face-size` only), 0 placeholder actor slots |
| Fights | Live sweep 17/17, 0 page errors |
| Presentation exceptions | **1**: PD-FA-03, `accept:['face-size']` only |
| Frozen Art | 224/224 (`art_ship_012_closeout/FROZEN_CORPUS_SHA256SUMS.txt`); 219/219 Ship 013; 212/212 Ship 011; rejected Buckhead 2/2; `git diff 06d3788 -- art_department assets` is empty |
| Ship 011 | Still library-only; the gate is unchanged (art integration: registry 204, 239 runtime refs, matrix PASS 121) |
| Maul | `lil_smack`, `hp:60` (unchanged) |
| Pier staging, manager mirror | Unchanged (no adventure or presentation data touched) |
| Save | v12 (unchanged schema; no save field added) |

**Tests**

- `npm test`: all suites PASS. This covers:
  - party, rave, Ogun's Rave, property;
  - the 9 minigame logic suites;
  - BTF: v12 migration and idempotency, 110 adventures, 258 branch walks;
  - presentation;
  - art integration;
  - the deterministic release gate.
- `npm run build`: PASS.
- `npm run verify:artifact`: PASS.

**Browser/live QA** (`tools/playtest-qa.mjs` on the built `dist/`, build identity checked in-page):

- **New game:** ×3 widths; refreshes mid-prologue and mid-throne; throne defeat.
- **Life:** the 14-day life loop.
- **Minigames:** all nine, both finish and quit.
- **Save:** 8 migration fixtures; wake-refresh.
- **Late game:** the protected ending; legacy flows; per-lane systems.
- **Layout:** 360/390/430 layouts, minigame canvases included.

The final runs have **0 findings** and 0 page errors. Headless persona sims: 4/4 reach the ending on Day 36.

**Git:** nothing was merged to `main`, nothing was deployed, and no repository settings were changed.
