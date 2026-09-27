# BTF OPEN CLOSURE LEDGER 001 — ENGINEERING 06

Branch `claude/giga-open-closure-001` (from `9ae8fd7`). Spoiler-safe: ids, systems, routes and outcomes. SEALED and
PLAYER-BLIND material was not opened; PLAYER-BLIND flows (Ogun's Rave, The Property, world events) appear only as
outcome flags and function checks.

**Statuses.** `CLOSED` implemented, connected and testable · `DEFERRED` real work that belongs after serious playtesting
and does not block it · `UBE/HQ` needs a decision existing OPEN authority does not make (see
`BTF_OPEN_UBE_DECISIONS_001.md`) · `BLOCKED` a technical/source dependency prevents completion.
**No `GAP — IMPLEMENTATION AUTHORIZED` item remains open.** Every gap found was either fixed (marked *fixed E06*) or
classified below.

**Reachability levels** (Test Pilot handoff §4): `REG` registered · `DEV` DEV-reachable · `PLAYER` reached through the
real route code (headless proof and/or browser taps) · `PLAYER+PRES` player-reachable and every screen passes live
Director lint at 360/390/430.

**Source set reviewed:** HQ Production Addendum v1 (MD + DOCX), VOL 1 Master Plan, VOL 2 Character & Visual Bible, VOL 3
Numbers, VOL 5 Dragon Maggi Cube — from `Rich_Alucard_BTF_Rough_Complete_OPEN_Packet_v1` (Downloads; the four DOCX and the
Addendum hash exactly to the values in `art_department/production_authority/README.md`), plus `docs/CURRENT_CANON.md`,
`docs/PRODUCTION_CONTROL.md`, `docs/btf/*`, the Art registers/manifests and the Engineering 04/05/05B/05C records.
Not reviewed by rule: VOL 4, VOL 5-S, HQ-M01–03, `js/sealed/*`, `js/data/ogun_rave_content.js`,
`js/data/property_content.js`, `art_department/ships/art_ship_003`, `*player_blind*` review boards, and
`Rich_Alucard_BTF_Vol7_PLAYMAKERS_Blood_X_Operations.docx` (present in Downloads but not part of the OPEN packet or any
project authority — not opened).

## 1. Core systems

| Requirement (source) | Status | Level | Evidence / note |
|---|---|---|---|
| Life clock: sleep-only time, WAKE pipeline, Morning Mail (V1 §3) | CLOSED | PLAYER | btf gate calendar/clock; playtest-qa `wake-reload` |
| Calendar: Day 1 = Oct 1, Halloween D31, Thanksgiving D57, full moon D14, rain ≈1/7 (V5 §9) | CLOSED | PLAYER | btf gate |
| Budget $100K / 28 days; Shannon Friday rent (V1 §4, V3 §5) | CLOSED | PLAYER | btf gate; fixtures gate |
| Temptation engine: cadence, cap, expiry, "comes back changed" (V1 §6, V3 §8) | CLOSED | PLAYER | btf gate |
| WHAT WE ON: ≤6 lines, tap offers the route (V1 §6.3) | CLOSED *fixed E06* | PLAYER | story-priority wants were pushed off the six lines on busy mornings (Halloween invite unreachable in the browser); now priority first |
| Wants may target a runtime-chosen adventure | CLOSED *fixed E06* | PLAYER | `w2_retwist` ("locs crunchy") passed a function to `available()` and could never appear |
| Wake triggers: ≤1 world interruption per morning (V1 §6.2) | CLOSED | PLAYER | route proofs |
| Adventure grammar incl. return beat + memory (V1 §8) | CLOSED | PLAYER | 113 adventures validated, 314 branch walks |
| No dead-end screens | CLOSED *fixed E06* | PLAYER | nodes whose choices were all locked (PEKING/TACOS/DATE/A26/HOST when nearly broke) stranded the player with no control; the scene now offers NOT TONIGHT and does not count the night |
| Node-level `fx` ignored by the engine | CLOSED *fixed E06* | PLAYER | A10 PAY DOUBLE was free; A48's first retwist set no FRESH, no $85, no June points |
| Georgia is a flight (V1 A37 "fly or dragon to Atlanta") | CLOSED *fixed E06* | PLAYER | route beats offered WALK/DRIVE to Atlanta and Powder Springs |
| Progression without XP: money, followers, clout/rep tiers, elder address (V1 §5, V5 §1.1) | CLOSED | PLAYER | life.js |
| Life momentum + protected ending, fame safety net (V1 §5.3, A40) | CLOSED | PLAYER | playtest-qa `ending`: fires once, THE NEXT MORNING, no replay, refresh ok |
| SOLID/MESSY tendencies (V5 §1.4) | CLOSED | PLAYER | family replies, dates, conversions; single sealed use left to the pack |
| RECEIPTS memoir app (V5 §9.3) | CLOSED | PLAYER | apps_core; share to VampGram |
| Weather: rain nights + rain window (V5 §9.1) | CLOSED | PLAYER | world_life (frozen rain window) |
| Save v12, migrations, recovery | CLOSED | PLAYER | 8 legacy fixtures + **4 new mid-life v12 fixtures** from simulated lives (fixtures gate); no schema change |
| CRACK (canon: threshold/roll/outcome TBD) | UBE/HQ | — | shown locked; "she stays." fade used where beats call for it (D1) |

## 2. Lanes (V1 §9, V5)

| Lane / surface | Status | Level | Evidence / note |
|---|---|---|---|
| 1 Home: bedroom company (woman, homie, Mazda, cat) (V1 §9.1) | CLOSED | PLAYER | world_life, frozen company states |
| Bedroom props (V5 §9.5) | CLOSED *fixed E06* | PLAYER | the waffle-mix prop was added as an inventory item, so it never appeared; now a prop |
| Night-sky window variant (V5 errata: approved) | DEFERRED | REG | approved asset; no trigger defined ("some wakes") — HQ can name one post-playtest |
| Castle rooms: purchase + one tap from bedroom (V1 §9.1, V5 §9.4) | CLOSED | PLAYER | ⌂ CASTLE menu |
| MAID QUARTERS "Marisol lives in… judges everything" | CLOSED *fixed E06* | PLAYER | the owned room answered "not tonight." forever after A39, and KEEP INTERVIEWING lost Marisol; A39 repeats until hired, then MAID (browser route `maid`) |
| GARAGE "trophy view of every car; TOUGE car select from home" + GARAGE parts bay (V1 §9.1, V5 §4.2) | CLOSED *fixed E06* | PLAYER+PRES | castle GARAGE is the trophy view (frozen WORLD cars), picks tonight's car, opens PARTS BAY; GARAGE now tunes the selected car (it always tuned the last-bought one) |
| MUSIC ROOM, KITCHEN, MOVIE ROOM, DRAGON ROOST, HOOKAH ROOF, ARMORY WALL, COFFIN, FISH TANK, PARTY HALL verbs | CLOSED | PLAYER | route map; kitchen adds ATL waffles once a week (V5 A44 leave-behind) *E06* |
| Castle room affordability inside a typical life | UBE/HQ | PLAYER (saver) | D2: no simulated persona afforded the Party Hall before fame fires at Day 36 |
| 2 Phone: canon seven + TEXTS, unlock-by-event, no dead icons (V1 §7) | CLOSED | PLAYER | playtest-qa `newgame` home actions |
| VampGPT lanes MAKE MONEY / MEET PEOPLE / GO SOMEWHERE | CLOSED | PLAYER | |
| 3 Nightlife: Ogun's Rave (PLAYER-BLIND, function only) | CLOSED | PLAYER | playtest-qa `legacy` |
| Four attendable parties: rooftop DTLA, neighbor castle, ATL house party (A37), Duchess soirée (A33) (V1 §9.3) | CLOSED *fixed E06* | PLAYER | FIND A PARTY only ever offered the rooftop (neighbor castle unreachable); repeatables now rotate by day (proof `NEIGHBOR_CASTLE`) |
| Party behaviors TWO STEP/HEAD NOD/TOO COOL + earned SHMOOVE, STOMP, CLONE LINE, NOD HARDER | CLOSED *fixed E06* | PLAYER | THE SHMOOVE (Kiki) could never be earned; now on reaching COOL with her |
| Hosting A26/HOST: plan (guests, song, drinks, door, theme), escalations, VampGram resolve | CLOSED | PLAYER (saver/DEV) | invited guests now staged ("guests arrive (visible, staged)") *E06*; reachability depends on D2 |
| Host changes the song mid-party (V1 CSPT) | DEFERRED | — | song chosen in PLAN only; polish |
| 4 Dating: InstaHoe, date loop, per-woman content, gifts, neglect | CLOSED | PLAYER | "devoted" life reached RIDE-OR-DIE (35 dates) and A46 |
| 22+1 women exist, 10 FULL loops | CLOSED | PLAYER | people.js, dates*.js |
| Conversion of BTF women (V1 §9.4 "each conversion feeds ecology") | UBE/HQ | — | D3: only the two legacy conversions exist; no OPEN trigger for others |
| ONLYVAMPS: unlock via Velvet, $4,999/mo, renewal, cancel | CLOSED | PLAYER | "cancelling is its own tiny scene" → DEFERRED (cancel works) |
| ONLYVAMPS collisions ("someone you know has a page") | UBE/HQ | REG | D4: which women have pages is not specified; code path exists, never granted |
| 5 Vampire ecology: headlines, Obas post, Bllad33 hookah | CLOSED | PLAYER | |
| Hilt A23 / A23R | UBE/HQ | PLAYER (A23R route) · DEV (A23) | D3: OPEN pressure sources cannot reach the provisional (sealed-owned) warning level |
| 6 Property: The Property (PLAYER-BLIND, function), 4 listings, 30% down, events, drift, Cryptrat hook | CLOSED | PLAYER | playtest-qa `legacy`, `systems` |
| 7 Music: cook, real catalog, drops, shows, Iron Jaw, RICH RADIO, castle song | CLOSED *fixed E06* | PLAYER | a song Rich "sat on" could never be dropped; RICH RADIO now has DROP |
| DROP on InstaHoe (V1 "VampGram or InstaHoe") | DEFERRED | — | InstaHoe has no feed surface; the VampGram drop provides the function |
| 4 of 5 song loops (audio) | DEFERRED | — | final audio production (external); RICH RADIO shows LOOP PENDING and never swaps to a missing file (not a test blocker) |
| 8 Cars & TOUGE: owned-car touge, courses, tandem, R34/RWD, RichBoi unlock/delivery, Laura record | CLOSED | PLAYER | TOUGE natural finish now proven in the built game *E06* |
| TOUGE PASSENGER SEAT (V5 §5.1; Tristan, the cat) | CLOSED *fixed E06* | PLAYER | the minigame supported it but nothing set it; TOUGE app picker + Tristan's frozen passenger portrait |
| A date as passenger changing the date's read | DEFERRED | — | mechanics not specified |
| 9 Dragons: egg → hatchling → young → majestic, care, sulk, Agege bread, Maggi cube, human form, roost assist | CLOSED | PLAYER | A11 egg now on the bed (frozen) *E06*; A32 mid-air ride composite *E06* |
| 10 PIER | CLOSED | PLAYER | |
| 11 SLURP | CLOSED | PLAYER | |
| 12 The Grave hub + stores; CHURCH SHOES at the Armory (V3 §2.1) | CLOSED *fixed E06* | PLAYER | CHURCH SHOES existed as a fit no store sold |
| 13 Combat 2.0 (functional closure only) | CLOSED | PLAYER+PRES | 17/17 fight screens (Wave 2 lock); legacy CEO throne fight in new game; defeat bill/unfollow; no move/balance change |
| Magic (Nightshade), ONE-INCH PETTY, guns, fits, items, HOES companions | CLOSED | PLAYER | |
| 14 Coffe arc & Vicky's party (V1 §9.14, MUST) | CLOSED *fixed E06* | PLAYER | **was entirely unreachable**: A29 had no route; tells stopped after one; A29B read inventory and had no route. Now: days 2–8 wake beat → tells (days 20/23/26) → WHAT WE ON fork → raid at the next wake (or day 31+ if the fork is never taken). Headless proof + browser route `coffe` |
| 15 Shout-outs: Bruce Loose, Kevins, Phil, Iron Jaw | CLOSED | PLAYER | |
| 16 Weird & sincere: A30, A31, A34 | CLOSED *A31 fixed E06* | PLAYER | A31 is now the Sunday desire trip its own text claims |
| 17 Ascent & ending | CLOSED | PLAYER | |
| VOL 5 minigames JOLLOF WARS, GARAGE, HOOKAH RINGS, PICKUP | CLOSED | PLAYER | all nine minigames enter → play → finish/quit → return → refresh |
| PICKUP other three players | DEFERRED | — | readable placeholders; teammate choice (Tristan/Moonie/Pinky/Tunde, V5 §4.4) is post-playtest polish, not a test blocker |
| June's "retwist HER locs" minigame (V5 §8) | DEFERRED | — | beat plays as a choice beat; no such minigame exists |
| Family thread; A53 Thanksgiving; Rich's family on screen | CLOSED *staging E06* | PLAYER (D57) | both brothers staged in A53 |
| Officer Nodd, Don Chuy, Laura, Britney Stakes, Lil Smack series | CLOSED *fixed E06* | PLAYER | Lil Smack #2 (Peking Naija date) and #4 (Venice pickup) were missing; Britney now posts on VampGram with her frozen profile |
| Octopus Brain options unlocked by possession (JUST FLY AWAY, NEGOTIATE LIKE SHANNON — V1 §8.2 "e.g.") | DEFERRED | — | examples without placement; 18 authored octopus forks exist |
| Adult nightlife / strip club | UBE/HQ (scope only) | — | D5: OPEN authority establishes no such system (only Lane 3 parties and ONLYVAMPS with swappable packages) — nothing built |

## 3. Adventure inventory (A00–A58 + systems) — reachability after E06

All 113 authored adventures have a player route (`tools/reachability-audit.mjs`, **fixed classifier**: at `9ae8fd7` it
counted `fame.js` lists and `done('ID')` predicates as routes and hid six adventures). Run against the untouched start
tree, the fixed classifier reports exactly `A29 A29B A44 A50 A52 A_CAMMILE1`; on this branch, none.

| Adventure | Status | Route (E06 changes in bold) |
|---|---|---|
| A00–A06 | CLOSED | new game / legacy flows (A05, A06 PLAYER-BLIND, function) |
| A07–A17, A42, A45, A48, A_TRISTAN, A_SMACK2 | CLOSED | wants, places, wake triggers (A10/A48 fx fixed) |
| A18–A28, A47, A49, A51, A57, VENICE, MOONIE_MEET, HOOKAH, KITCHEN, MOVIE, ROOST | CLOSED | Grave hub, wake triggers, castle, places (A23 → D3) |
| **A29, A29B, A29C** | CLOSED | **wake beat → tells → WHAT WE ON → wake raid** |
| A30–A34, A36–A39 | CLOSED | (A33 reachability → D2 rep pacing) |
| **A44, A44_N2–N4** | CLOSED | **GO SOMEWHERE → HEARTSFELT-JACKSUN, one night per trip**; rebuilt to VOL 5's four nights (airport → Waffle Haven/Ms. Patrice; perfume + Lil Smack; Lennox date + Buckhead rival; her mother's recipe) |
| **A50** | CLOSED | **GO SOMEWHERE → TRISTAN'S APARTMENT** (VOL 5 §6) + Tristan's text |
| **A52** | CLOSED | **Day-31 invite** |
| **A_CAMMILE1** | CLOSED | **GO SOMEWHERE → THE DOCKS** |
| A41, A41B, A46, A53–A58, meet beats, ARC_* | CLOSED | wants/DMs/wake/chains (A41/A46 now pick women only) |
| **MAID, GARAGE_VIEW** | CLOSED | **⌂ CASTLE** |
| Top-5 arcs (V5 §8) | CLOSED *rebuilt E06* | all 15 beats followed placeholder content that did not match the source table; now the table's beats; Ms. Patrice's beat 1 **is** the Waffle Saga |

## 4. Presentation / staging

| Item | Status | Evidence |
|---|---|---|
| Census skipped end nodes | CLOSED *fixed E06* | end nodes with a title/lines are screens; inheritance follows the graph (no isolated states) |
| Runtime-bound casts in census | CLOSED *fixed E06* | variants may name nodes; A26/HOST guests and A41 plus-one added |
| Sweep false positives | CLOSED *fixed E06* | (a) a minigame-only screen launched PIER and every later capture showed it while lint passed; (b) runtime-bound casts rendered with Rich alone. Both now errors. |
| Live sweep | CLOSED | **247/247 PASS at 360/390/430**, 0 errors, rendered key = census key (dry run: 249 screens, 248 + PD-FA-03) |
| Director exceptions | CLOSED | PD-FA-03 only (unchanged) |

**The 20 entrance cues (05B list):**

| Cue | Result |
|---|---|
| A37 Bunmi | staged at arrival (was only staged later) |
| A23 Hilt | staged (+ `walk_away` as he leaves) |
| A29C bard, cleric, paladin, Coffe | each staged as he walks in (Coffe as `rogue`) |
| A44_N3 Buckhead | staged with Ms. Patrice at the rival beat |
| Emberly, Jade, Lo (`arm_fall`), Hina (`smug`), Anfeesa (`dj`) meet beats | staged |
| A18 Kaede | staged (`ceiling_drop`, then anchor) |
| A25 Nightshade | staged (+ `casting` when she teaches) |
| A38 Brenda | staged (+ `gossiping`) |
| MOONIE_MEET | staged |
| A29 Coffe | staged (+ `hype`) |
| A55 Anfeesa | staged (`dj`) |
| A41 Trippin' Red | drawn **on the Hollow Bowl stage** as world art (never beside Rich) |
| A33 J-Circle | **not staged — UBE/HQ (Art)**: the frozen reception crowd layer is keyed to `duchess_castle\|left:rich` and its foreground couple stands where a second actor would (D6) |

Also staged where the text puts the person on screen: A32 Mazda eating the bread; A53 both brothers; A41 roof crew
(Tunde, `hookah_seated`); A26/HOST invited guests. Face boxes for newly staged states were read by eye (their derived
boxes pointed at hair, props or feet).

## 5. Art disposition — the 48 registered-but-unwired Ship 014/015 files

**Wired now (22):** kaede `ceiling_drop`, lo `arm_fall`, hina `smug`, anfeesa `dj`, nightshade `casting`, brenda
`gossiping`, mazda_human `eating`, coffe `hype`, tristan `passenger`, wispa `wave`, both brothers (A53), egg `bed` +
`cracking` (A11), Bonesworth sword (Armory Wall), S15 stock/body-kit + R34 WORLD (Garage), S2000 listing (A36 choice),
church shoes (Armory), Britney profile (VampGram), riding composite (A32). Ship 014/015 integrated: 300 → 323.

| File(s) | Class | Reason |
|---|---|---|
| A-tasha-stage_rush, A-vicky-doorway | BLOCKED BY DESIGN → UBE/HQ D6 | Art-mapped Ship 008 condition-layer keys |
| A-june-working | BLOCKED BY DESIGN → UBE/HQ D6 | paired composite replaces the two-actor cast |
| A-jade-impressed, A-kiki-laughing, A-lil_smack-diss, A-tristan-laugh, A-bllad33-dry | FUTURE/POLISH | no OPEN beat narrates the exact reaction with the person on stage |
| A-pinky-neutral | INTENTIONALLY UNUSED | her approved Ship 006 anchor covers neutral |
| A-RICH-riding_mazda, B-majestic-flying | FUTURE/POLISH | the composite now carries the one staged ride; FLY ON MAZDA is a route choice |
| A-cammile-touge_spectator, D-rival_b-touge | BLOCKED BY SYSTEM | TOUGE has no spectator layer; content has one Midnight Mafia driver |
| C-cat-judging_combat | BLOCKED BY SYSTEM | Combat 2.0 draws no companion sprites (combat presentation frozen for this pass) |
| C-common-*-held (3) | INTENTIONALLY UNUSED | Rich's frozen `holding_fish_away` already paints the fish |
| E-blood_bill, E-blood_held | INTENTIONALLY UNUSED | covered by nneka `handing_bill` |
| E-bread-torn, E-egg-held | FUTURE/POLISH | no item layer at those beats; placement decision |
| D-portobello-world | INTENTIONALLY UNUSED | the Portobello Mazda is not Rich's car (A30 is protected PD-FA-03 scope) |
| F-company_system, F-covered_companion, F-homie_floor | BLOCKED BY DESIGN (Art) | exact-origin overlays draw a second bed/blanket over Rich |
| F-stars_night_sky | FUTURE/POLISH | approved variant, no trigger defined |
| Package H (13) | REFERENCE ONLY | UI treatment authority, never runtime images |

Ship 011 stays gated (no population file referenced). No frozen byte changed.

## 6. Engineering items from the brief

| Item | Status | Result |
|---|---|---|
| Census final nodes | CLOSED | see §4 |
| PICKUP placeholders | DEFERRED | not a test blocker (NC-FA-07) |
| TOUGE natural finish | CLOSED | root cause: frames capped at 50 ms game time, so a 90 game-second run outlasts a fixed real budget under headless load. Read-only `data-phase` marker; the harness drives until `results` and taps DONE → `exit:"finished"`, return, refresh diff 0. No gameplay change |
| Random/weighted content | CLOSED (control layer) | `RATestPilot.seed(n)` seeds Math.random per page; wants were already day-seeded; assert "within N sleeps", not a day |
| Mid-life v12 fixtures | CLOSED | four simulated-life saves (days 12/24/33/34) + gate |
| Test Pilot control/evidence layer | CLOSED (minimum) | `js/systems/test_pilot.js` (DEV only), `tools/pilot/*`; see report §7 |
| Long-life sanity | CLOSED (observations) | 5 personas × seeds, 60-day cap: 0 errors, 0 stranded adventures, fame Day 36 in every run; findings → D2, D3 |
