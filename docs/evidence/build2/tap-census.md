# OL-043 automated UI tap census

Real installed Chrome. **720/720 taps produced a sound start; 0 failures** across the three complementary runs below. The fresh shell run inventories 74 screen/state labels. Counts are taps in screen states, not a claim of 720 unique DOM nodes. Repeated controls across states and widths are intentional.

| Run | Tapped | With sound | Failures | Raw rows |
|---|---|---|---|---|
| Main shell / review / phone / minigames | 532 | 532 | 0 | [tap-census.json](tap-census.json) |
| Moves / guns / companions / result states / rapid taps | 121 | 121 | 0 | [tap-supplement.json](tap-supplement.json) |
| THE PLAY / trap-raid controls at 360/390/430 | 67 | 67 | 0 | [tap-paths-all.json](tap-paths-all.json) |

The shell runner enumerates enabled interactive elements in the review tour, bedroom/castle, the phone navigation closure (including isolated source unlock fixtures), owned Armory/mod states, combat menus, and every registered minigame. Supplemental fixtures cover all nine Rich actions, all 13 guns under their own unlock conditions, secondary equipment, every available companion action, OCTOPUS choices, mail/sleep, and minigame result controls. The path audit covers offers, crew/car/weapon selection, settings, SEND/hold, timed choices and return controls in actual THE PLAY and NIGHT raids. Drawn canvas regions are exercised through their existing canvas receiver; no production rules or state are added.

Each control is physically clicked with audio enabled and a running context; the runner observes delivered UI/phone cues through WebAudio source starts or successful HTMLMediaElement playback. Sound settings are reset before individual taps. MUTE receives its acknowledgement, then respects the chosen muted setting; this is a routing/start proof, not a measurement of speaker volume. Twenty rapid review taps also pass while preserving the authored three-voice UI cap. Page errors and missing cues both fail the scripts.

## Fresh shell screens/states

- review controls
- home
- settings
- worldEvent:player_blind_proof_event_001
- worldEvent:ogun_rave_invite_001
- vampgpt
- app:warRoom
- app:vampgram
- app:instahoe
- app:onlyvamps
- realEstate
- jdmImports
- app:richboi
- app:trap
- app:texts
- app:radio
- app:hatch
- app:touge
- app:bars
- app:receipts
- app:cars
- app:castle
- app:realestate
- app:armory
- app:moves
- somewhere
- options
- app:instahoe:p:ceo_assistant_001
- app:instahoe:p:jdm_importer_daughter_001
- app:texts:family
- app:armory:bench
- app:moves:0
- app:moves:1
- app:moves:2
- app:moves:3
- butterChicken
- money
- people
- app:instahoe:dm:ceo_assistant_001
- app:instahoe:dm:jdm_importer_daughter_001
- owned Armory
- owned Armory bench
- owned Armory gun:lil_oga
- owned Armory gun:sapporo_shotgun
- owned Armory gun:mac_and_cheese
- owned Armory gun:chopstick_sniper
- owned Armory gun:tommy_tony
- owned Armory gun:holy_baby_drake
- owned Armory gun:jollof_burner
- owned Armory gun:blueberry_blaster
- owned Armory gun:legendary_draco
- owned Armory gun:golden_draco
- owned Armory gun:rpg
- owned Armory gun:auntie_slipper
- attached Armory
- bedroom shell
- castle overlay
- combat main
- combat fight
- combat item
- combat hoes
- minigame touge
- minigame owambe_collection
- minigame hatch
- minigame pier
- minigame bars
- minigame slurp
- minigame jollof
- minigame garage
- minigame hookah
- minigame pickup
- minigame range_day
- minigame f05_cook
- minigame f05_counter

## Reproduction

Set RA_PLAYWRIGHT_PATH to an installed Playwright module and RA_CHROMIUM_PATH to installed Chrome, then run from the repository root:

```powershell
node tools/build2/tap-census.mjs
node tools/build2/tap-supplement.mjs
node tools/build2/browser-path.mjs
```
