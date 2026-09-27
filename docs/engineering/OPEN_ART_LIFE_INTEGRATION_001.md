# OPEN ART + LIFE INTEGRATION 001 — ENGINEERING 05

Branch `claude/open-art-life-integration-001` · status **READY FOR HQ REVIEW** (not self-approved; no FUN verdict; not a release candidate).

**Spoiler-safe for Ube.** Ids, systems, flags, route kinds and outcomes only. Authored lines are quoted only where a route reuses an adventure's own words as its button/want text. PLAYER-BLIND flows (Ogun's Rave, The Property, World Events) are recorded as mechanical pass/fail and as the outcome flags they write; the SEALED pack (`js/sealed/pack.js`) was not opened.

## 1. Authority

| | |
|---|---|
| Starting SHA | `229e41a6b2ae391b68a306caee9c42333cf544ac` (`claude/playtest-candidate-001`), verified descendant of `06d378846d98347715800624d76bf619df1465ac` |
| Final SHA | the commit that adds this document (reported in the HQ return) |
| Branch | `claude/open-art-life-integration-001`, created from exactly `229e41a` in its own worktree. `main` untouched, nothing merged or deployed |
| Frozen Art | ART SHIP 014 — `art/art_ship_014` @ `f1ae59a3f342a30fc09a3c4659198795ef867178` (parent `920912f`, already in this lineage) |
| Import method | Path checkout from `f1ae59a`, **not a merge** (commit `a4e5468`): the 180 production files under `assets/before_the_fame/art_ship_014/`, the Ship 014 records (manifest, promotion/validation, ledgers, Engineering map, SHA256 sums, tools) and the Art registers Ship 014 updated (`ASSET_REGISTER.json` 544, approval ledger, approved index, gap records, handoff/START_HERE). Candidate iterations and review boards stay on the Art branch |
| ART SHIP 015 | **PENDING FROZEN ART AUTHORITY — SHIP 015.** The remote has no Ship 015 ref (`git ls-remote` at start: highest is `art/art_ship_014`). Nothing integrated; Brother 1/2, their FAMILY THREAD avatars, God and OG Hooper keep existing behaviour (name-only labels / no actor / placeholder) |
| Save schema | v12 from code (`js/engine/state.js` `VERSION=12`); unchanged |

Runtime truth was re-derived from code at `229e41a` (Engineering 04's report was read as evidence): START → A00 → throne → bedroom; Maul = `lil_smack` `hp:60`; PD-FA-03 is the only Director exception; Ship 011 is library-only and gated.

## 2. Results at a glance

| Item | Before (`229e41a`) | After |
|---|---|---|
| Frozen files in the runtime registry | 204 | **384** (+180 Ship 014) |
| Frozen files consumed by the live runtime | 172 | **295** (+121 Ship 014, +2 earlier `asleep_floor` states now used) |
| Ship 014 files | — | **121 integrated** (120 on a player-visible surface + the airport master mapped to its existing id, which no node stages yet), **46 registered with a recorded reason**, **13 Package H reference-only** |
| Presentation census | 104 adventure + 17 fights = **121 PASS / 0 HOLD** | 149 adventure + 17 fights = **166 PASS / 0 HOLD** |
| Director exceptions | 1 (PD-FA-03 `face-size`) | **1 (PD-FA-03 `face-size`, unchanged)** |
| Authored adventures with no player entry | 9 of 110 | **0 of 112** |
| PICKUP | lab page only | **GO SOMEWHERE → VENICE COURTS → RUN PICKUP** |
| Paused-Supra old save | replays the prologue | **skips it** (acquisition kept, paused) |

## 3. Workstream A — Ship 014 frozen Art

**Mechanism.** Ship 014's manifest carries no runtime keys, so Engineering authored one per file in `tools/art-integration/ship014_runtime_map.json` (asset id → key such as `characters.kiki.states.date`, `dragon.young.happy`, `items.catches.moon_koi.icon`, `vehicles.listing.urus`, `bedroom.props.plant`). `tools/art-registry.mjs` reads it with the same refusal discipline as earlier Ships: no key → refuse; non-binary alpha, wrong native size, a character state without a frozen/registered anchor, or any overwrite → refuse; bytes must match `ASSET_REGISTER.json`. Each map row records how the runtime consumes the file (surface + a code token) or why it is not wired; `tools/art-integration.mjs` fails the gate if a row claimed as integrated is not actually consumed (content states must be staged by the census; other rows' tokens must be present in their consumer file).

**Where it now shows up (player-visible):**
- **Dates (19 women).** The DATE loop and A46 stage her in her frozen `date` state (census: 19 variant screens each).
- **Beats that already narrated the state (11 beats, 12 states):** Don Chuy singing (TACOS arrive, A51), Nneka handing the bill (A17), Officer Nodd's nod and his 10th-stop picture (A57), Lil Smack mouth-closed (A56), Pinky impressed (A36), Marisol disapproving (A39), Rookoko painting (GALLERY), Coffe caught (A29B), the Duchess impressed/unimpressed by answer (A33), Ms. Patrice laughing while she roasts the room (ARC_PATRICE_2).
- **Bedroom** (`js/systems/world_life.js`): 13 women + Mazda's human form in their covered `bedroom_company` pose on the bed right of Rich; homies after a party night asleep on the floor (Tristan's Ship 014 floor state; Tunde/Dre's earlier frozen `asleep_floor` states, previously unused); the cat on the bed; Mazda's fly-by and the rain window on a canvas **below** Rich; the 8 owned room props as exact-origin overlays.
- **HATCH:** hatchling/young/majestic Blueberry Mazda at integer 2×/3×/3× on the old ground line (hungry reads neutral; majestic sulk uses perched — no approved majestic sulk).
- **PIER:** catch art on the result card and wallet/rare/chest prompts; junk held at arm's length. BIG FISH keeps its drawn placeholder (ledger mapping decision: no approved art).
- **TOUGE:** tandem rivals drive frozen cars (Pinky → her pink S2000, Tokyo Tony → Midnight Mafia rival A); HUD face crop (locked in while drifting, spun out after a spin).
- **Phone:** car LISTING art on JDMIMPORTS/RICHBOIMPORTS cards and the Supra store card; RICH RADIO covers; FAMILY thread avatars for mom/dad/sister; Dragoon of the North's VampGram posts carry his silhouette.
- **Items:** fit/item art on store choices, gun cases on ARMORY choices, item and held-gun art on Combat 2.0 ITEM/FIGHT buttons (native pixels; the combat grid keeps its layout at 360/390/430).
- **World cars:** RB_DELIVERY — the delivered Urus/Aventador/Ferrari rolls off the ramp beside Rich; A13 — Pinky leaning on her S2000. These use a small new node field, `props` (frozen world art drawn in the environment layer below actors, native 1:1).
- **Environment:** the Vol. 5 airport master is mapped to the existing `atl_airport` id (contact line y=372 on the concourse floor). No node stages the airport yet.

**Registered, not wired (46) — reasons are per file in the appendix.** Summary: 2 Art-mapped surface conflicts (Tasha's stage rush and Vicky's doorway sit on frozen Ship 008 condition-layer screen keys); 1 paired composite needing a cast change (June working); 7 people who are named but never on stage in their beat; 7 reactions with no objective beat; 1 dormant surface (TOUGE passenger flag never set); 3 bedroom overlays with an Art geometry ambiguity (they draw a second, larger bed / blanket pile over Rich); 3 held common-fish sprites (Rich's frozen hold already shows a fish); remaining files have no live surface (riding composites, majestic flying, Mazda eating, Britney profile, cat in combat, rival B, four WORLD cars bought on the phone, S2000 listing, blood-bank bill props covered by Nneka's state, sword/bread/egg item beats, church shoes, the night-sky window). **Package H (13)** is UI visual-treatment reference only, per its rule: its pixels carry example labels and values, so none is used as a runtime image.

**Ledger rows resolved by Engineering:**

| Row | Result |
|---|---|
| C-big-fish (mapping decision) | No approved art; runtime BIG FISH keeps the drawn placeholder |
| D-runtime-delivery | The only delivery beat (RB_DELIVERY, RICHBOI cars) now shows the frozen WORLD car; no other sourced delivery state exists in content |
| D-runtime-damaged | No current content names a damaged car; no surface |
| G-env-catacomb_dead, G-env-halloween | Both placeholder ids exist but no node stages them (A52 uses `castle_exterior_party`/`street_night`); no art needed |
| A-RICH-hungover (conditional) | Existing art presents the beat (THRONE/COFFIN narrate the hangover over the approved anchors); no new art needed |
| A-RICH-portobello_wake (conditional) | A30 `wakeup` presents Rich on his anchor; inside the protected PD-FA-03 adventure — left unchanged |
| D-supra-world (conditional) | The existing `supra_mk4_world.png` is REFERENCE authority and still used only by the legacy payoff screen; no new WORLD surface needs it |
| E-cube (conditional) | Still mapping-ambiguous (label spelling Ube-owned); unchanged |
| G-castle_party, G-grave (conditional) | Would need Ship 011 assignments; the Ship 011 gate stays closed |

## 4. Workstream B — the nine adventures

Every route uses an existing system; the adventures themselves are unchanged (routing fields only: chains, party-lane registration, wake-time wants, one hub choice).

| Adventure | Route (all non-DEV) | Kind |
|---|---|---|
| A_EMBERLY1 | GO SOMEWHERE → KUSH & CRYPT → **THE BACK ROOM** (KUSH store choice) → chain | one time |
| A_HINA1 | GO SOMEWHERE → SLURP DYNASTY → A08 first shift → chain; a life that finished A08 before this build gets it after its next SLURP shift | one time |
| A_JADE1 | ⌂ CASTLE → PARTY HALL → theme **DRAGON NIGHT** (A26/HOST) → chain; never at other themes; the party still ends the night | one time, rare |
| A_LO1 | VampGPT → MEET PEOPLE → FIND A PARTY: after Ogun's Rave the first party the lane offers (Ogun's first rave untouched) | one time |
| A_ANFEESA1 | FIND A PARTY → OGUN'S SECOND RAVE (A55) → chain (booth side, between sets) | one time |
| A_VELVET1 | After Ogun's Rave + VampGram: Morning Mail / WHAT WE ON — "a DM from a locked account: velvet vantablack." → her DM scene → **ONLYVAMPS** unlocks | one time |
| A37 | Morning Mail INVITE / WHAT WE ON on an eligible Friday after Day 15 — "it's a friday. atlanta is calling." (its own availability decides the day) | one time |
| A46 | A CLOSE woman DMs on InstaHoe — "take me somewhere special." → SAY LESS → A46 (also in WHAT WE ON) | repeatable, 7-day cooldown |
| A23R | Once prepared (A23 done, the Armory known and visited, ≥1 gun): WHAT WE ON — "hilt again. same windbreaker." | one time |

Supporting engine changes (generic, small): a chained continuation inherits the night-ending of the adventure it continues; `RATemptations.ensure(id)` delivers the one-time routed wants (A37, Velvet, A23R) through the existing `push()` path on the wake they become eligible, so the cadence cap cannot starve them; a want's DM thread may be chosen at wake time (A46: the closest eligible woman).

## 5. Workstream C — PICKUP

GO SOMEWHERE → **VENICE COURTS** (sub: PICKUP · PULL-UPS ON THE RIM) → a small hub (`VENICE`, repeatable) → **RUN PICKUP** launches the existing PICKUP minigame unchanged; **PULL-UPS ON THE RIM** chains the existing MOONIE_MEET unchanged. Finish, quit, return and refresh verified headless (3 runs + a quit) and in the built game (play + quit, return to bedroom, refresh diff 0). OG Hooper has no frozen art (BLOCKED BY CANON → Ship 015): the minigame keeps its text-only "an OG on the sideline". The castle courtyard hoop was **not** wired: the PICKUP canvas paints its own VENICE BEACH COURTS set, so a castle surface would need a minigame change.

## 6. Workstream D — paused-Supra migration

`migrateV11ToV12` now counts an `acquisitions.active` Supra (`toyota_supra_mk4_001`) with `status:'paused'` as existing progress. Headless (release gate): the `supraPaused` fixture migrates to v12 with the clock started and `prologueDone/throneDone/firstWakeDone`, the acquisition still paused, no car, money unchanged; migrating twice is identical; the fresh fixture still plays the prologue. Built game: `supraPaused` → START → bedroom Day 1 (no A00), refresh diff 0; all 8 fixtures load as v12.

## 7. Workstream E — Presentation census

- **Count: 121 → 166** (adventure screens 104 → 149, fights 17 unchanged). New screens: 19 DATE + 19 A46 date-state variants (declared `presentationVariants`, since the cast is runtime-bound), the contextual-state beats, the VENICE hub and PIER. Five old keys were replaced by their state variants (Pinky, Ms. Patrice, Nodd, Don Chuy, Marisol).
- **Dry run** 149 screens: 148 pass + PD-FA-03. **Live sweeps** (real adventure scene, 360×740/390×844/430×932): **149/149, 1 accepted exception, 0 errors, all Director-staged**; fights **17/17**, 0 provisional. Wave 1 lock rewritten after review; Wave 2 lock unchanged.
- Face boxes for the 31 newly staged states were added to `tools/presentation/annotations.json` (27 transferred from the character's authored anchor face by head offset and checked on an overlay; 4 read by eye).
- Non-census surfaces are recorded in `tools/art-integration/review.json` `surfaces` (bedroom company is PARTIAL: company without an approved bedroom state keeps the placeholder).

## 8. Workstream F — reachability audit

`tools/reachability-audit.mjs` (now part of `npm test`):
1. **Classification** of every authored adventure by the routes that name it (literal references plus the live want and wake-trigger registries). Baseline with the same tool at `229e41a`: 110 adventures, **9 with no player entry** — exactly the nine above. Now: 112 adventures, **0**.
2. **Twelve route proofs** in fresh headless lives: each drives the real route code (places, lanes, party lane, chains, the real clock's wake with every handler, Morning Mail/DM delivery), completes the target, and proves one-time content is not offered again (Emberly, Hina + fallback, Jade + no-show at other themes + night still ends, Lo → A55 → Anfeesa, Velvet → ONLYVAMPS open, A37 only on Fridays > 15 and returning if ignored, A23R only once prepared) while repeatables stay repeatable (KUSH, SLURP, HOST, parties, A46 after cooldown, VENICE/PICKUP, PIER). Seeds are listed per proof: only the PLAYER-BLIND Ogun's Rave outcome flags, money for castle rooms, relationship points, and a pre-route A08 record.

Built game (`tools/playtest-qa.mjs --only routes`): all nine reached **through player taps** (phone, Morning Mail card, WHAT WE ON, InstaHoe profile → DMS → SAY LESS, ⌂ CASTLE → PARTY HALL), each returning to an idle bedroom with invariants clean and refresh diff 0; ONLYVAMPS opens its creator page.

## 9. Incidental runtime fixes

| ID | Bug | Reproduction | Cause | Fix | Files | Regression evidence |
|---|---|---|---|---|---|---|
| IF-01 | Fishing vanished after the first cast | Finish A12 → GO SOMEWHERE no longer lists SANTA MONICA PIER; VampGPT "FISH. WALLETS BE IN THERE." and the `pier_money` want never appear | The pier place, money lane and want all route to a repeatable `PIER` adventure that was never defined | Defined `PIER`: the existing PIER minigame, once a night (like SLURP), rain passed through | `js/data/btf/adventures/w2.js` | Reachability proof PIER; census screen `pier|left:rich` PASS |
| IF-02 | Grave hub encounters A18/A19 and CAFE's COOK A TRACK never appeared; the Armory (and so guns and A23R's "prepared") was unreachable | Open THE GRAVE hub on a fresh life: no "SOMEONE IS FIGHTING OVER ORANGE CHICKEN"; A19 is the only source of `armoryKnown` | Their predicates call `RAAdventures.available(id)`, which returns false for every other id while the current adventure (GRAVE/CAFE) is running | `available(id,{ignoreActive:true})` for follow-ups offered from inside a run; used by A18, A19, COOK and the two new hub choices | `js/engine/adventures.js`, `w2.js`, `w3.js` | Headless: GRAVE hub lists them; A23R proof walks A19 → A24 → ARMORY; `npm test` 262 branch walks |

No frozen byte, save field, combat number, authored line or accepted checkpoint changed. (Two harness-only fixes in `tools/playtest-qa.mjs`: settle to an idle bedroom before a route; reach DMs through her profile.)

## 10. Protected checkpoints

| Item | Result |
|---|---|
| Save schema | v12; no field added |
| Maul | `lil_smack`, `hp:60`, unchanged |
| Pier staging (A12) | unchanged screens |
| Ship 011 | library only; gate unchanged (no population file referenced) |
| Presentation exceptions | PD-FA-03 only |
| Frozen hashes | Ship 014 corpus **404/404**, promoted 180/180; Ship 012 closeout 224/224; Ship 013 219/219; Ship 011 212/212; no frozen file outside Ship 014 changed since `229e41a` (Ship 011 source-package / 013 candidate provenance lists reference files on other branches — identical to baseline) |
| Protected ending | fires once on the sleep after eligibility, THE NEXT MORNING continues, no replay, survives refresh |
| PLAYER-BLIND / SEALED | not exposed; the pack was not opened; blind flows exercised for function only |

## 11. QA

| Check | Result |
|---|---|
| `npm test` | PASS — all suites incl. presentation (149 screens vs lock), art integration (384 files, matrix 166 PASS), **reachability (112, 12 proofs)**, release gate (paused-Supra assertions) |
| `npm run build` / `npm run verify:artifact` | PASS |
| New game ×3 widths, mid-prologue refresh, throne-fight refresh, throne defeat | PASS, refresh diff 0 |
| Migration fixtures (8) incl. paused Supra | PASS, all v12, refresh diff 0; paused Supra skips the prologue |
| Wake-event refresh | PASS (A11 survives a refresh during Morning Mail) |
| Widths 360×740 / 390×844 / 430×932 | PASS on bedroom, castle, phone pages, minigame canvases |
| All nine minigames | enter → play → finish/quit → return → refresh diff 0; PICKUP through VENICE COURTS; all nine lab entries open+quit |
| Legacy flows (butter chicken, Ogun's Rave, Supra/JDM dock fight, The Property), systems (music cook/drop/radio, dragon hatch/feed, date, RICHBOI delivery, kitchen/JOLLOF, movie room), protected ending | PASS, 0 findings |
| Combat 2.0 / legacy CEO fight / Maul | 17/17 fight sweep; throne fight in new game; OCTOPUS BRAIN sub-choices driven in the life run |
| **14-day autonomous life** (seed 23, randomized refreshes) | Day 1 → 15, 24 outings, 13 distinct adventures, 69 fights, save 43 KB, **0 findings**; it hit A08 → A_HINA1 naturally |
| Targeted routes (§8) | 9/9 through player taps |

## 12. Remaining blockers and roughness

**OPEN blockers (product/Art decisions):** Ship 015 (brothers, their avatars, God, OG Hooper); the 46 registered Ship 014 files that need a placement, cast or Art call (appendix) — most notably company without an approved bedroom state, Tasha/Vicky on Art-mapped surfaces, and June's paired composite; Package H awaits a UI treatment pass; BIG FISH has no art.

**Engineering (non-blocking):** TOUGE's HUD face was verified in code and by the gate, but the headless harness could not provoke a live drift to capture it; the harness's TOUGE "play" ends by QUIT on this machine at both `229e41a` and this build (identical — a timing limit of the driver, not a regression; quit/return/refresh pass).

**Intentional roughness (unchanged):** 4 of 5 song loops pending; the 239-line Rich voice pass; draft non-Rich dialogue; unnamed canon (cat, family names, Maggi/Magi); Portobello speaker labels; momentum saturation; the RB_DELIVERY car can sit partly outside the tight single-actor conversation shot; the woman-in-bed sprites are small at the room's native scale.

## Appendix — every Ship 014 file

Generated from `tools/art-integration/ship014_runtime_map.json` and the live matrix (the gate keeps them in sync).

| Asset id | Runtime key | Status | Surface / reason |
|---|---|---|---|
| `A-RICH-riding_mazda` | `characters.rich.states.riding_mazda` | REGISTERED — NO LIVE SURFACE | FLY ON MAZDA is a route choice with no staged beat; A32/arc flights stage her human form. The bedroom Mazda uses the fly-by overlay; HATCH majestic uses happy/perched. |
| `A-RICH-touge_locked` | `characters.rich.states.touge_locked` | INTEGRATED | TOUGE HUD face: locked in while drifting, spun out after a spin |
| `A-RICH-touge_spun` | `characters.rich.states.touge_spun` | INTEGRATED | TOUGE HUD face: locked in while drifting, spun out after a spin |
| `A-anfeesa-dj` | `characters.anfeesa.states.dj` | REGISTERED — PERSON NOT ON STAGE | The matching beat names her in an entrance/speaker line but never stages her (actors: Rich only). Staging would add a cast member to an authored beat. |
| `A-bllad33-dry` | `characters.bllad33.states.dry` | REGISTERED — NO OBJECTIVE BEAT | No current OPEN beat narrates this exact reaction with the person on stage; placing it would be a guess. |
| `A-brenda-date` | `characters.brenda.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-brenda-gossiping` | `characters.brenda.states.gossiping` | REGISTERED — PERSON NOT ON STAGE | The matching beat names her in an entrance/speaker line but never stages her (actors: Rich only). Staging would add a cast member to an authored beat. |
| `A-britney-profile` | `ui.avatars.britney_stakes` | REGISTERED — NO LIVE SURFACE | A58 is a notification beat; no VampGram post by Britney Stakes exists to carry a profile. |
| `A-bunmi-bedroom_company` | `characters.bunmi.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-bunmi-date` | `characters.bunmi.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-cammile-bedroom` | `characters.jdm_importer_daughter_001.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-cammile-date` | `characters.jdm_importer_daughter_001.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-cammile-touge_spectator` | `characters.jdm_importer_daughter_001.states.touge_spectator` | REGISTERED — NO LIVE SURFACE | TOUGE has no spectator layer; ARC_CAMMILE_1 has her riding shotgun, not watching. |
| `A-ceo_assistant-bedroom` | `characters.ceo_assistant_001.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-ceo_assistant-date` | `characters.ceo_assistant_001.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-coffe-caught` | `characters.coffe.states.caught` | INTEGRATED | adventure beat: A29B expose |
| `A-coffe-hype` | `characters.coffe.states.hype` | REGISTERED — NO OBJECTIVE BEAT | No current OPEN beat narrates this exact reaction with the person on stage; placing it would be a guess. |
| `A-don_chuy-singing` | `characters.don_chuy.states.singing` | INTEGRATED | adventure beat: TACOS arrive, A51 sing |
| `A-dragoon-silhouette` | `ui.avatars.dragoon_of_the_north` | INTEGRATED | VampGram: @dragoon_of_the_north post avatar |
| `A-duchess-bedroom_company` | `characters.duchess.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-duchess-impressed` | `characters.duchess.states.impressed` | INTEGRATED | adventure beat: A33 react |
| `A-duchess-unimpressed` | `characters.duchess.states.unimpressed` | INTEGRATED | adventure beat: A33 react (honest "nothing yet" answer) |
| `A-emberly-bedroom_company` | `characters.emberly.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-emberly-date` | `characters.emberly.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-family-dad-avatar` | `ui.avatars.family_dad` | INTEGRATED | TEXTS FAMILY thread: sender avatar |
| `A-family-mom-avatar` | `ui.avatars.family_mom` | INTEGRATED | TEXTS FAMILY thread: sender avatar |
| `A-family-sister-avatar` | `ui.avatars.family_sister` | INTEGRATED | TEXTS FAMILY thread: sender avatar |
| `A-hina-date` | `characters.hina.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-hina-smug` | `characters.hina.states.smug` | REGISTERED — PERSON NOT ON STAGE | The matching beat names her in an entrance/speaker line but never stages her (actors: Rich only). Staging would add a cast member to an authored beat. |
| `A-jade-impressed` | `characters.jade.states.impressed` | REGISTERED — PERSON NOT ON STAGE | The matching beat names her in an entrance/speaker line but never stages her (actors: Rich only). Staging would add a cast member to an authored beat. |
| `A-june-bedroom` | `characters.june.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-june-date` | `characters.june.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-june-working` | `characters.june.states.working` | REGISTERED — CAST CHANGE REQUIRED | A paired composite (June working in Rich's locs, Rich included). A48 mirror / RETWIST stage Rich and June as two actors; using it means replacing the cast of an authored beat. Needs an HQ call. |
| `A-kaede-bedroom_company` | `characters.kaede.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-kaede-ceiling_drop` | `characters.kaede.states.ceiling_drop` | REGISTERED — PERSON NOT ON STAGE | The matching beat names her in an entrance/speaker line but never stages her (actors: Rich only). Staging would add a cast member to an authored beat. |
| `A-kaede-date` | `characters.kaede.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-kiki-bedroom_company` | `characters.kiki.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-kiki-date` | `characters.kiki.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-kiki-laughing` | `characters.kiki.states.laughing` | REGISTERED — NO OBJECTIVE BEAT | No current OPEN beat narrates this exact reaction with the person on stage; placing it would be a guess. |
| `A-lil_smack-diss` | `characters.lil_smack.states.diss` | REGISTERED — NO OBJECTIVE BEAT | No current OPEN beat narrates this exact reaction with the person on stage; placing it would be a guess. |
| `A-lil_smack-finale` | `characters.lil_smack.states.finale` | INTEGRATED | adventure beat: A56 arrive/react/leave (mouth closed) |
| `A-lo-arm_fall` | `characters.lo.states.arm_fall` | REGISTERED — PERSON NOT ON STAGE | The matching beat names her in an entrance/speaker line but never stages her (actors: Rich only). Staging would add a cast member to an authored beat. |
| `A-lo-date` | `characters.lo.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-marisol-date` | `characters.marisol.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-marisol-disapproving` | `characters.marisol.states.disapproving` | INTEGRATED | adventure beat: A39 marisol |
| `A-moonie-bedroom_company` | `characters.moonie.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-moonie-date` | `characters.moonie.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-ms_patrice-bedroom` | `characters.ms_patrice.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-ms_patrice-date` | `characters.ms_patrice.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-ms_patrice-laugh` | `characters.ms_patrice.states.laugh` | INTEGRATED | adventure beat: ARC_PATRICE_2 (she roasts the room) |
| `A-nightshade-casting` | `characters.nightshade.states.casting` | REGISTERED — PERSON NOT ON STAGE | The matching beat names her in an entrance/speaker line but never stages her (actors: Rich only). Staging would add a cast member to an authored beat. |
| `A-nightshade-date` | `characters.nightshade.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-nneka-bedroom_company` | `characters.nneka.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-nneka-date` | `characters.nneka.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-nneka-handing_bill` | `characters.nneka.states.handing_bill` | INTEGRATED | adventure beat: A17 bill |
| `A-officer_nodd-nod` | `characters.officer_nodd.states.nod` | INTEGRATED | adventure beat: A57 stop |
| `A-officer_nodd-phone` | `characters.officer_nodd.states.phone` | INTEGRATED | adventure beat: A57 leave (10th stop, the picture) |
| `A-pinky-bedroom_company` | `characters.pinky.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-pinky-date` | `characters.pinky.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-pinky-impressed` | `characters.pinky.states.impressed` | INTEGRATED | adventure beat: A36 pinky |
| `A-pinky-neutral` | `characters.pinky.states.neutral` | REGISTERED — NO OBJECTIVE BEAT | No current OPEN beat narrates this exact reaction with the person on stage; placing it would be a guess. |
| `A-rookoko-painting` | `characters.rookoko.states.painting` | INTEGRATED | adventure beat: GALLERY look |
| `A-tasha-bedroom_company` | `characters.tasha.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `A-tasha-date` | `characters.tasha.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-tasha-stage_rush` | `characters.tasha.states.stage_rush` | REGISTERED — ART-MAPPED SURFACE CONFLICT | A14 tasha is the Art-mapped catacomb crowd surface `catacomb/left:rich@on_stage,right:tasha` (ART SHIP 008); staging her in a new state would change that frozen surface key and drop the crowd layer. Needs an Art/HQ call. |
| `A-tristan-floor` | `characters.tristan.states.floor` | INTEGRATED | bedroom company (homie after a party night): asleep on the floor |
| `A-tristan-laugh` | `characters.tristan.states.laugh` | REGISTERED — NO OBJECTIVE BEAT | No current OPEN beat narrates this exact reaction with the person on stage; placing it would be a guess. |
| `A-tristan-passenger` | `characters.tristan.states.passenger` | REGISTERED — DORMANT SURFACE | The TOUGE passenger slot reads RALife.flag('passenger'), which nothing in play ever sets. |
| `A-velvet-date` | `characters.velvet.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-vicky-doorway` | `characters.vicky.states.doorway` | REGISTERED — ART-MAPPED SURFACE CONFLICT | A29C vicky is the Art-mapped throne-party-mess surface `throne_party_mess/left:rich,right:vicky` (ART SHIP 008); a new state would change that frozen surface key. Needs an Art/HQ call. |
| `A-wispa-date` | `characters.wispa.states.date` | INTEGRATED | DATE (every date node) and A46 LITTLE TOKYO SPECIAL NIGHT (plan, bench): she is staged in her date state |
| `A-wispa-wave` | `characters.wispa.states.wave` | REGISTERED — NO OBJECTIVE BEAT | No current OPEN beat narrates this exact reaction with the person on stage; placing it would be a guess. |
| `B-hatchling-happy` | `dragon.hatchling.happy` | INTEGRATED | HATCH minigame: her life stage and pose (hungry reads neutral; majestic sulks perched) |
| `B-hatchling-neutral` | `dragon.hatchling.neutral` | INTEGRATED | HATCH minigame: her life stage and pose (hungry reads neutral; majestic sulks perched) |
| `B-hatchling-sulk` | `dragon.hatchling.sulk` | INTEGRATED | HATCH minigame: her life stage and pose (hungry reads neutral; majestic sulks perched) |
| `B-human-bedroom` | `characters.mazda_human.states.bedroom_company` | INTEGRATED | bedroom company (woman who stayed over / a close date): her covered pose on the bed right of Rich |
| `B-human-eating` | `characters.mazda_human.states.eating` | REGISTERED — PERSON NOT ON STAGE | A32 bed narrates her eating the bread but stages Rich only. |
| `B-majestic-flying` | `dragon.majestic.flying` | REGISTERED — NO LIVE SURFACE | FLY ON MAZDA is a route choice with no staged beat; A32/arc flights stage her human form. The bedroom Mazda uses the fly-by overlay; HATCH majestic uses happy/perched. |
| `B-majestic-happy` | `dragon.majestic.happy` | INTEGRATED | HATCH minigame: her life stage and pose (hungry reads neutral; majestic sulks perched) |
| `B-majestic-perched` | `dragon.majestic.perched` | INTEGRATED | HATCH minigame: her life stage and pose (hungry reads neutral; majestic sulks perched) |
| `B-riding-composite` | `dragon.riding_composite` | REGISTERED — NO LIVE SURFACE | FLY ON MAZDA is a route choice with no staged beat; A32/arc flights stage her human form. The bedroom Mazda uses the fly-by overlay; HATCH majestic uses happy/perched. |
| `B-young-happy` | `dragon.young.happy` | INTEGRATED | HATCH minigame: her life stage and pose (hungry reads neutral; majestic sulks perched) |
| `B-young-neutral` | `dragon.young.neutral` | INTEGRATED | HATCH minigame: her life stage and pose (hungry reads neutral; majestic sulks perched) |
| `B-young-sulk` | `dragon.young.sulk` | INTEGRATED | HATCH minigame: her life stage and pose (hungry reads neutral; majestic sulks perched) |
| `C-cat-judging_combat` | `creatures.cat.states.judging_combat` | REGISTERED — NO LIVE SURFACE | The cat never appears in Combat 2.0. |
| `C-cat-on_bed` | `creatures.cat.states.on_bed` | INTEGRATED | bedroom company (the cat) |
| `C-chest` | `items.catches.chest.icon` | INTEGRATED | PIER minigame: result card / wallet, rare and chest prompts; junk held at arm's length |
| `C-common-pier_perch-held` | `items.catches.pier_perch.held` | REGISTERED — MAPPING AMBIGUOUS | The frozen rich.holding_fish_away already paints a fish in hand; overlaying a held fish would double it. The catch icons carry the named fish. |
| `C-common-pier_perch-icon` | `items.catches.pier_perch.icon` | INTEGRATED | PIER minigame: result card / wallet, rare and chest prompts; junk held at arm's length |
| `C-common-silver_grunt-held` | `items.catches.silver_grunt.held` | REGISTERED — MAPPING AMBIGUOUS | The frozen rich.holding_fish_away already paints a fish in hand; overlaying a held fish would double it. The catch icons carry the named fish. |
| `C-common-silver_grunt-icon` | `items.catches.silver_grunt.icon` | INTEGRATED | PIER minigame: result card / wallet, rare and chest prompts; junk held at arm's length |
| `C-common-ugly_mackerel-held` | `items.catches.ugly_mackerel.held` | REGISTERED — MAPPING AMBIGUOUS | The frozen rich.holding_fish_away already paints a fish in hand; overlaying a held fish would double it. The catch icons carry the named fish. |
| `C-common-ugly_mackerel-icon` | `items.catches.ugly_mackerel.icon` | INTEGRATED | PIER minigame: result card / wallet, rare and chest prompts; junk held at arm's length |
| `C-junk-boot` | `items.catches.boot.icon` | INTEGRATED | PIER minigame: result card / wallet, rare and chest prompts; junk held at arm's length |
| `C-junk-flip_phone` | `items.catches.flip_phone.icon` | INTEGRATED | PIER minigame: result card / wallet, rare and chest prompts; junk held at arm's length |
| `C-junk-waterlogged_wallet` | `items.catches.waterlogged_wallet.icon` | INTEGRATED | PIER minigame: result card / wallet, rare and chest prompts; junk held at arm's length |
| `C-rare-moon_koi` | `items.catches.moon_koi.icon` | INTEGRATED | PIER minigame: result card / wallet, rare and chest prompts; junk held at arm's length |
| `C-rare-old_barnacle_grouper` | `items.catches.old_barnacle_grouper.icon` | INTEGRATED | PIER minigame: result card / wallet, rare and chest prompts; junk held at arm's length |
| `D-aventador-listing` | `vehicles.listing.aventador` | INTEGRATED | phone car cards (JDMIMPORTS / RICHBOIMPORTS listing and owned cards) |
| `D-aventador-world` | `vehicles.world.aventador` | INTEGRATED | RB_DELIVERY arrive: the delivered car rolls off the ramp |
| `D-ferrari_f40-listing` | `vehicles.listing.ferrari` | INTEGRATED | phone car cards (JDMIMPORTS / RICHBOIMPORTS listing and owned cards) |
| `D-ferrari_f40-world` | `vehicles.world.ferrari` | INTEGRATED | RB_DELIVERY arrive: the delivered car rolls off the ramp |
| `D-portobello-world` | `vehicles.world.portobello` | REGISTERED — NO LIVE SURFACE | These cars are bought on the phone (no delivery beat); the GARAGE lift band is 32 px tall and cannot host a 50 px WORLD sprite without a minigame layout change; the Portobello Mazda is narrated at breakfast indoors (A30, protected PD-FA-03 scope). |
| `D-r34-listing` | `vehicles.listing.r34` | INTEGRATED | phone car cards (JDMIMPORTS / RICHBOIMPORTS listing and owned cards) |
| `D-r34-world` | `vehicles.world.r34` | REGISTERED — NO LIVE SURFACE | These cars are bought on the phone (no delivery beat); the GARAGE lift band is 32 px tall and cannot host a 50 px WORLD sprite without a minigame layout change; the Portobello Mazda is narrated at breakfast indoors (A30, protected PD-FA-03 scope). |
| `D-rival_a-touge` | `vehicles.touge.rival_a` | INTEGRATED | TOUGE tandem rival car for TOKYO TONY (TANDEM_BATTLE, A36) |
| `D-rival_b-touge` | `vehicles.touge.rival_b` | REGISTERED — NO LIVE SURFACE | Content has one Midnight Mafia tandem driver (Tokyo Tony → rival A). |
| `D-s15_bodykit-listing` | `vehicles.listing.s15_bodykit` | INTEGRATED | phone car cards (JDMIMPORTS / RICHBOIMPORTS listing and owned cards) |
| `D-s15_bodykit-world` | `vehicles.world.s15_bodykit` | REGISTERED — NO LIVE SURFACE | These cars are bought on the phone (no delivery beat); the GARAGE lift band is 32 px tall and cannot host a 50 px WORLD sprite without a minigame layout change; the Portobello Mazda is narrated at breakfast indoors (A30, protected PD-FA-03 scope). |
| `D-s15_stock-listing` | `vehicles.listing.s15` | INTEGRATED | phone car cards (JDMIMPORTS / RICHBOIMPORTS listing and owned cards) |
| `D-s15_stock-world` | `vehicles.world.s15` | REGISTERED — NO LIVE SURFACE | These cars are bought on the phone (no delivery beat); the GARAGE lift band is 32 px tall and cannot host a 50 px WORLD sprite without a minigame layout change; the Portobello Mazda is narrated at breakfast indoors (A30, protected PD-FA-03 scope). |
| `D-s2000_pink-listing` | `vehicles.listing.s2000` | REGISTERED — NO LIVE SURFACE | The S2000 is never listed for sale (Pinky gives it in A36). |
| `D-s2000_pink-world` | `vehicles.world.s2000` | INTEGRATED | A13 meet: Pinky leaning on her pink S2000 |
| `D-supra-listing` | `vehicles.listing.supra` | INTEGRATED | phone JDMIMPORTS Supra store card |
| `D-urus-listing` | `vehicles.listing.urus` | INTEGRATED | phone car cards (JDMIMPORTS / RICHBOIMPORTS listing and owned cards) |
| `D-urus-world` | `vehicles.world.urus` | INTEGRATED | RB_DELIVERY arrive: the delivered car rolls off the ramp |
| `E-blood_bill` | `props.blood_bank_bill` | REGISTERED — COVERED BY STATE | A17 bill stages nneka@handing_bill, which already shows the long receipt; adventures have no separate held-item layer. |
| `E-blood_held` | `props.blood_bank_bill_held` | REGISTERED — COVERED BY STATE | A17 bill stages nneka@handing_bill, which already shows the long receipt; adventures have no separate held-item layer. |
| `E-bonesworth_sword` | `props.bonesworth_sword` | REGISTERED — NO LIVE SURFACE | Adventures have no item layer for these beats (A27 sword, A10 bread, A11/A09 egg); HATCH shows the Ship 005 egg master. Wiring them needs a placement decision. |
| `E-bread-torn` | `props.agege_bread_torn` | REGISTERED — NO LIVE SURFACE | Adventures have no item layer for these beats (A27 sword, A10 bread, A11/A09 egg); HATCH shows the Ship 005 egg master. Wiring them needs a placement decision. |
| `E-egg-bed` | `props.mazda_egg_bed` | REGISTERED — NO LIVE SURFACE | Adventures have no item layer for these beats (A27 sword, A10 bread, A11/A09 egg); HATCH shows the Ship 005 egg master. Wiring them needs a placement decision. |
| `E-egg-cracking` | `props.mazda_egg_cracking` | REGISTERED — NO LIVE SURFACE | Adventures have no item layer for these beats (A27 sword, A10 bread, A11/A09 egg); HATCH shows the Ship 005 egg master. Wiring them needs a placement decision. |
| `E-egg-held` | `props.mazda_egg_held` | REGISTERED — NO LIVE SURFACE | Adventures have no item layer for these beats (A27 sword, A10 bread, A11/A09 egg); HATCH shows the Ship 005 egg master. Wiring them needs a placement decision. |
| `E-fit-black_leather_trench` | `items.fits.leather_trench` | INTEGRATED | store choice that sells the fit (SHOP) |
| `E-fit-boughi_v_blazer` | `items.fits.boughi_blazer` | INTEGRATED | store choice that sells the fit (SHOP) |
| `E-fit-church_shoes` | `items.fits.church_shoes` | REGISTERED — NO LIVE SURFACE | CHURCH SHOES is a fit whose store (armory) sells guns only; no player can buy it, so there is no choice to carry its art. |
| `E-fit-drift_sneakers` | `items.fits.drift_sneakers` | INTEGRATED | store choice that sells the fit (SHOP) |
| `E-fit-grave_hoodie` | `items.fits.grave_hoodie` | INTEGRATED | store choice that sells the fit (SHOP) |
| `E-fit-krada_shades` | `items.fits.krada_shades` | INTEGRATED | store choice that sells the fit (SHOP) |
| `E-fit-slides` | `items.fits.slides` | INTEGRATED | store choice that sells the fit (SHOP) |
| `E-fit-tradeya_hoes_chain` | `items.fits.tradeya_chain` | INTEGRATED | store choice that sells the fit (SHOP) |
| `E-gun-chopstick_sniper-case` | `items.guns.chopstick_sniper.case` | INTEGRATED | ARMORY shop choice for the gun |
| `E-gun-chopstick_sniper-held` | `items.guns.chopstick_sniper.held` | INTEGRATED | combat FIGHT menu gun button (GUN WEAVING) |
| `E-gun-holy_baby_drake-case` | `items.guns.holy_baby_drake.case` | INTEGRATED | ARMORY shop choice for the gun |
| `E-gun-holy_baby_drake-held` | `items.guns.holy_baby_drake.held` | INTEGRATED | combat FIGHT menu gun button (GUN WEAVING) |
| `E-gun-lil_oga-case` | `items.guns.lil_oga.case` | INTEGRATED | ARMORY shop choice for the gun |
| `E-gun-lil_oga-held` | `items.guns.lil_oga.held` | INTEGRATED | combat FIGHT menu gun button (GUN WEAVING) |
| `E-gun-sapporo_shotgun-case` | `items.guns.sapporo_shotgun.case` | INTEGRATED | ARMORY shop choice for the gun |
| `E-gun-sapporo_shotgun-held` | `items.guns.sapporo_shotgun.held` | INTEGRATED | combat FIGHT menu gun button (GUN WEAVING) |
| `E-gun-the_rpg-case` | `items.guns.rpg.case` | INTEGRATED | ARMORY shop choice for the gun |
| `E-gun-the_rpg-held` | `items.guns.rpg.held` | INTEGRATED | combat FIGHT menu gun button (GUN WEAVING) |
| `E-item-boba` | `items.combat.boba` | INTEGRATED | combat ITEM menu, and the store choice that sells it |
| `E-item-dragon_keef` | `items.combat.dragon_keef` | INTEGRATED | combat ITEM menu, and the store choice that sells it |
| `E-item-garlic_knots` | `items.combat.garlic` | INTEGRATED | combat ITEM menu, and the store choice that sells it |
| `E-item-jollof_takeout` | `items.combat.jollof` | INTEGRATED | combat ITEM menu, and the store choice that sells it |
| `E-item-sapporo` | `items.combat.sapporo` | INTEGRATED | combat ITEM menu, and the store choice that sells it |
| `E-item-smelling_salts` | `items.combat.salts` | INTEGRATED | combat ITEM menu, and the store choice that sells it |
| `E-radio-bloodbath` | `ui.radio.bloodbath` | INTEGRATED | RICH RADIO track cards |
| `E-radio-montana` | `ui.radio.montana` | INTEGRATED | RICH RADIO track cards |
| `E-radio-octopus_brain` | `ui.radio.octopus_brain` | INTEGRATED | RICH RADIO track cards |
| `E-radio-playmakers` | `ui.radio.playmakers` | INTEGRATED | RICH RADIO track cards |
| `E-radio-shopping_addict` | `ui.radio.shopping_addict` | INTEGRATED | RICH RADIO track cards |
| `F-company_system` | `bedroom.company.company_system` | REGISTERED — ART GEOMETRY AMBIGUITY | These exact-origin overlays draw a second, larger bed / a blanket pile that does not register with the runtime bedroom (Rich lies at x14–142, y282–346): they occlude or duplicate him. Per-woman bedroom_company states and the frozen asleep-floor states cover the same surface. Needs an Art call. |
| `F-covered_companion` | `bedroom.company.covered_companion` | REGISTERED — ART GEOMETRY AMBIGUITY | These exact-origin overlays draw a second, larger bed / a blanket pile that does not register with the runtime bedroom (Rich lies at x14–142, y282–346): they occlude or duplicate him. Per-woman bedroom_company states and the frozen asleep-floor states cover the same surface. Needs an Art call. |
| `F-homie_floor` | `bedroom.company.homie_floor` | REGISTERED — ART GEOMETRY AMBIGUITY | These exact-origin overlays draw a second, larger bed / a blanket pile that does not register with the runtime bedroom (Rich lies at x14–142, y282–346): they occlude or duplicate him. Per-woman bedroom_company states and the frozen asleep-floor states cover the same surface. Needs an Art call. |
| `F-mazda_flyby` | `bedroom.company.mazda_flyby` | INTEGRATED | bedroom company (majestic Mazda): exact-origin fly-by behind Rich |
| `F-prop-duoqlo_bag` | `bedroom.props.duoqlo_bag` | INTEGRATED | bedroom props Rich owns: exact-origin room overlay |
| `F-prop-jollof_trophy` | `bedroom.props.jollof_trophy` | INTEGRATED | bedroom props Rich owns: exact-origin room overlay |
| `F-prop-michigan_pennant` | `bedroom.props.michigan_pennant` | INTEGRATED | bedroom props Rich owns: exact-origin room overlay |
| `F-prop-plant` | `bedroom.props.plant` | INTEGRATED | bedroom props Rich owns: exact-origin room overlay |
| `F-prop-rookoko_painting` | `bedroom.props.rookoko_painting` | INTEGRATED | bedroom props Rich owns: exact-origin room overlay |
| `F-prop-trippin_red_poster` | `bedroom.props.trippin_red_poster` | INTEGRATED | bedroom props Rich owns: exact-origin room overlay |
| `F-prop-unused_cat_bed` | `bedroom.props.unused_cat_bed` | INTEGRATED | bedroom props Rich owns: exact-origin room overlay |
| `F-prop-waffle_mix_bag` | `bedroom.props.waffle_mix_bag` | INTEGRATED | bedroom props Rich owns: exact-origin room overlay |
| `F-rain_night_window` | `bedroom.window.rain_night_window` | INTEGRATED | bedroom on rain days: exact-origin rain-window overlay behind Rich |
| `F-stars_night_sky` | `bedroom.window.stars_night_sky` | REGISTERED — NO LIVE SURFACE | The runtime bedroom window always shows the approved daytime sky with clouds; no night-window condition exists. |
| `G-vol5-airport` | `environments.atl_airport` | INTEGRATED | environment atl_airport (HEARTSFELT-JACKSUN INTERNATIONAL) — mapped; no current node stages it |
| `H-bars` | `ui.treatments.bars` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-blood_bank_bill` | `ui.treatments.blood_bank_bill` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-garage` | `ui.treatments.garage` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-hatch` | `ui.treatments.hatch` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-hookah_rings` | `ui.treatments.hookah_rings` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-jollof_wars` | `ui.treatments.jollof_wars` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-pickup` | `ui.treatments.pickup` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-pier` | `ui.treatments.pier` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-receipts` | `ui.treatments.receipts` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-rich_radio` | `ui.treatments.rich_radio` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-touge` | `ui.treatments.touge` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-vehicle_listing_cards` | `ui.treatments.vehicle_listing_cards` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
| `H-what_we_on` | `ui.treatments.what_we_on` | REFERENCE — UI VISUAL-TREATMENT AUTHORITY ONLY | Package H pixels carry example labels/values; they are never runtime images (package_h_rule). Kept as reference for a later UI pass. |
