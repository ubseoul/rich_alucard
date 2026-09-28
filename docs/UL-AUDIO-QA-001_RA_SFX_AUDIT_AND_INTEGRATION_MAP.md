# UL-AUDIO-QA-001 — RA_SFX_DELIVERY_v1 Audit & DeepSeek Coder Integration Map

> AUDIO QA deliverable (P0, F1). Prepared by AUDIO QA for UNDERLORD. Audit of the existing local SFX delivery only; it does not authorize shipping any sound, does not modify game code, and does not source new audio.

## 1. ACCESS CONFIRMATION
- Package: FOUND — `C:\Users\Ube\OneDrive\Desktop\RA_SFX_DELIVERY_v1` (also present as `RA_SFX_DELIVERY_v1.zip` on Desktop).
- Authoritative reference read: `docs/RA_Sound_Deployment_Plan_HQ.md`.
- `RA_Sound_Finder_Brief`: NOT FOUND in workspace, Desktop, or Documents.
- No README/notes file inside the package (only `MANIFEST.csv` + `MISSING.txt`).

## 2. PACKAGE SUMMARY
- Files: 264 = 262 `.wav` + `MANIFEST.csv` + `MISSING.txt`; 14 category folders; no README.
- Audio: 262 WAV files = 244 unique IDs (18 rows are parts of 11 loop-set/variation IDs).
- Categories (14): ui_phone(29), home_castle(15), combat(54), touge(34), pier(9), slurp(7), hatch(6), bars(3), jollof(8), garage(5), hookah_pickup_kbbq(16), locations(33), story(23), reserved(20).
- Manifest: 262 data rows; columns id, filename, category, source_site, source_url, author, license, attribution_line, original_length_s, final_length_s, loop, notes.
- Missing-list: 2 IDs. Total size: 610.4 MB.

## 3. READY FOR INTEGRATION
- All 262 files valid 16-bit PCM 44.1 kHz WAV (192 mono / 70 stereo), untruncated, no clipping; durations match manifest (0.15 s tolerance).
- Manifest/file mapping exactly 1:1 (0 missing, 0 orphan); every file in its declared category folder.
- 244/244 plan IDs accounted for; 85 rows `loop=yes`.
- Loop `loopStart`/`loopEnd` NOT supplied (plan §2.1/§3.4 requires them) — measure at encode/register time. 45 loop rows have raw seam > −35 dBFS and need explicit loop points/crossfade.
- Peaks: most one-shots −3 dBFS; ambience beds −12…−20 dBFS under SFX. No clipping.
- `MAGIC_SEANCE.wav` is defective and must not be wired.

## 4. MANIFEST / FILE MISMATCHES
- Missing files: 0. Orphan files: 0.
- Multi-row IDs (11): CAR_I6_TURBO, CAR_4CYL_HIGHREV, CAR_V8_SUV, CAR_V12, CAR_V8_EXOTIC, TIRE_SQUEAL, COMBO_UP (×3); CAT_PURR, BLOOD_SPRINKLER, SEAL_06, SEAL_09 (×2). Intended, but representation is inconsistent — normalize at Register.
- Byte-identical duplicates: 0 (262 distinct MD5s).
- Near-duplicate: `touge/CLIP_DING.wav` = `ui_phone/UI_CONFIRM.wav` (same Kenney `confirmation_001.ogg`; correlation 1.000, max diff 30 LSB).
- Naming conflicts: none.

## 5. TECHNICAL ISSUES
- Corrupt/unreadable: 0. Unsupported format: none.
- DEFECT — `combat/MAGIC_SEANCE.wav`: brief transient then ~1.2 s constant −23198 DC (min −23198, max 0, no positive samples) — failed render, re-render required.
- Loop seams (worst): SEAL_18 −10.2, CAR_I6_TURBO__high −13.3, CAR_V12__high −13.9, CAR_4CYL_HIGHREV__high −14.8, CAR_I6_TURBO__idle −17.6, REEL_LOOP −17.8, SEAL_13 −19.2, AMB_DOCKS −19.6, SEAL_03 −21.0, AMB_RAMEN −21.1 dBFS. `SEAL_06__alt1` 200 ms lead; `AMB_CATACOMB` ~61 ms.
- DC bias (verify): GUN_HOLYDRAKE +4410, GUN_KRATOS +2915, CAR_V8_EXOTIC* ~+2000, CAR_V8_SUV* ~+1800, AMB_TACO_TRUCK −711, MAGIC_RINGER −891, BAT_FLUTTER −503 LSB.
- One-shots with lead/trailing silence to trim: GUN_SHOTGUN 127 ms, MOVE_OCTOPUS 204 ms, RECORD_SCRATCH 222 ms, SEAL_01 182 ms, XCOM_MISS 100 ms lead; SEAL_02 1769 ms, COUNTDOWN 750 ms, POWER_CUT 694 ms, VICTORY 480 ms trail.

## 6. GENUINE MISSING ITEMS
- `DRAGON_WINGS` — CONFIRMED STILL MISSING (M3 HATCH, one-shot SFX). hatch/ holds 7 of 8 (EGG_CRACK ships in combat/).
- `BARS_PUNCHLINE` — CONFIRMED STILL MISSING (M3 BARS, one-shot UI). bars/ holds 3 of 4.
- No other proven gaps. `DRIBBLE`/`GRILL_LAND` are delivered as split parts (`DRIBBLE__loop`/`DRIBBLE__bounce`, `GRILL_LAND__loop`/`GRILL_LAND__land`).

## 7. DEEPSEEK CODER INTEGRATION MAP
Columns: CODE | FILE | CATEGORY | INTENDED USE | BUS | LOOP/1-SHOT | NOTES. All files are 44.1 kHz/16-bit WAV; encode runtime copies to MP3 per plan §1.4. Loop IDs require manifest loopStart/loopEnd (not yet supplied).
| APP_UNLOCK | APP_UNLOCK.wav | ui_phone | New phone app appears | UI | one-shot |  |
| CASH_IN | CASH_IN.wav | ui_phone | Money added (rent, budget, prizes) | UI | one-shot |  |
| CASH_OUT | CASH_OUT.wav | ui_phone | Purchases | UI | one-shot |  |
| CONTACT_ADDED | CONTACT_ADDED.wav | ui_phone | Someone added to contacts | UI | one-shot |  |
| NOTIF_FAMILY | NOTIF_FAMILY.wav | ui_phone | Family group chat | UI | one-shot |  |
| NOTIF_GENERIC | NOTIF_GENERIC.wav | ui_phone | Generic notification | UI | one-shot |  |
| NOTIF_INSTAHOE | NOTIF_INSTAHOE.wav | ui_phone | InstaHoe DMs/likes | UI | one-shot |  |
| NOTIF_STORM | NOTIF_STORM.wav | ui_phone | Viral moments; the fame morning | UI | one-shot |  |
| NOTIF_TEXT | NOTIF_TEXT.wav | ui_phone | Incoming text/DM | UI | one-shot |  |
| NOTIF_VAMPGRAM | NOTIF_VAMPGRAM.wav | ui_phone | VampGram activity | UI | one-shot |  |
| PHONE_APP_OPEN | PHONE_APP_OPEN.wav | ui_phone | Open any app | UI | one-shot |  |
| PHONE_CLOSE | PHONE_CLOSE.wav | ui_phone | Close phone | UI | one-shot |  |
| PHONE_OPEN | PHONE_OPEN.wav | ui_phone | Open phone | UI | one-shot |  |
| RADIO_SWITCH | RADIO_SWITCH.wav | ui_phone | Changing song on RICH RADIO | UI | one-shot |  |
| REWARD_STINGER | REWARD_STINGER.wav | ui_phone | Reward screens | MUSIC | one-shot |  |
| SAVE | SAVE.wav | ui_phone | Autosave indicator | UI | one-shot |  |
| TRAVEL_WHOOSH | TRAVEL_WHOOSH.wav | ui_phone | Leaving for a destination | UI | one-shot |  |
| UI_BACK | UI_BACK.wav | ui_phone | Back, close panels | UI | one-shot |  |
| UI_CONFIRM | UI_CONFIRM.wav | ui_phone | Confirming choices, purchases, routes | UI | one-shot | duplicate of CLIP_DING |
| UI_DIALOG_ADVANCE | UI_DIALOG_ADVANCE.wav | ui_phone | Tap to advance dialogue | UI | one-shot |  |
| UI_ERROR | UI_ERROR.wav | ui_phone | Can't afford, locked option | UI | one-shot |  |
| UI_MOVE | UI_MOVE.wav | ui_phone | FIGHT/ITEM/HOES/RUN cursor, list scrolling | UI | one-shot |  |
| UI_TAP | UI_TAP.wav | ui_phone | Any button press | UI | one-shot |  |
| UI_TEXT_BLIP_GHOST | UI_TEXT_BLIP_GHOST.wav | ui_phone | Ghost characters' text | VOICE | one-shot |  |
| UI_TEXT_BLIP_NPC_HIGH | UI_TEXT_BLIP_NPC_HIGH.wav | ui_phone | Light/high-voiced NPC text | VOICE | one-shot |  |
| UI_TEXT_BLIP_NPC_LOW | UI_TEXT_BLIP_NPC_LOW.wav | ui_phone | Deep-voiced NPC text | VOICE | one-shot |  |
| UI_TEXT_BLIP_NPC_MID | UI_TEXT_BLIP_NPC_MID.wav | ui_phone | Most NPC text | VOICE | one-shot |  |
| UI_TEXT_BLIP_RICH | UI_TEXT_BLIP_RICH.wav | ui_phone | Rich's dialogue typing | VOICE | one-shot |  |
| WHATWEON_UPDATE | WHATWEON_UPDATE.wav | ui_phone | A new line appears in VampGPT's list | UI | one-shot |  |
| CAT_MEOW | CAT_MEOW.wav | home_castle | Cat interactions | SFX | one-shot |  |
| CAT_PURR | CAT_PURR.wav + CAT_PURR__alt1.wav | home_castle | Cat on bed | SFX | loop | alt1 is variation |
| SNEEZE | SNEEZE.wav | home_castle | Rich near the cat | VOICE | one-shot |  |
| STEPS_STONE | STEPS_STONE.wav | home_castle | Walking in castle | SFX | one-shot |  |
| BAT_FLUTTER | BAT_FLUTTER.wav | home_castle | Window, released women flying off | SFX | one-shot |  |
| AMB_BEDROOM | AMB_BEDROOM.wav | home_castle | Bedroom scene | AMBIENCE | loop |  |
| ROOM_BUILT | ROOM_BUILT.wav | home_castle | Buying a castle room | SFX | one-shot |  |
| TV_ROOM | TV_ROOM.wav | home_castle | Movie room dates | AMBIENCE | loop |  |
| KITCHEN_AMB | KITCHEN_AMB.wav | home_castle | Castle kitchen | AMBIENCE | loop |  |
| DOOR_CASTLE | DOOR_CASTLE.wav | home_castle | Entering/leaving the castle | SFX | one-shot |  |
| BED_RUSTLE | BED_RUSTLE.wav | home_castle | Wake / sleep | SFX | one-shot |  |
| WAKE_STRETCH | WAKE_STRETCH.wav | home_castle | WAKE | SFX | one-shot |  |
| AMB_CASTLE_STREET | AMB_CASTLE_STREET.wav | home_castle | Outside the castle | AMBIENCE | loop |  |
| AMB_THRONE | AMB_THRONE.wav | home_castle | Throne room | AMBIENCE | loop |  |
| BATTLE_START | BATTLE_START.wav | combat | Any fight begins | SFX | one-shot |  |
| TELEGRAPH | TELEGRAPH.wav | combat | Enemy telegraph line | SFX | one-shot |  |
| HIT_LIGHT | HIT_LIGHT.wav | combat | Normal damage | SFX | one-shot |  |
| HIT_HEAVY | HIT_HEAVY.wav | combat | Heavy hit (≥20% HP) | SFX | one-shot |  |
| MISS | MISS.wav | combat | Missed attack | SFX | one-shot |  |
| CRIT | CRIT.wav | combat | Crits | SFX | one-shot |  |
| HEAL | HEAL.wav | combat | HP restored | SFX | one-shot |  |
| BUFF | BUFF.wav | combat | Buffs | SFX | one-shot |  |
| DEBUFF | DEBUFF.wav | combat | Debuffs | SFX | one-shot |  |
| STUN | STUN.wav | combat | Stuns | SFX | one-shot |  |
| KO | KO.wav | combat | Enemy or Rich defeated | SFX | one-shot |  |
| VICTORY | VICTORY.wav | combat | Fight won | MUSIC | one-shot |  |
| DEFEAT | DEFEAT.wav | combat | Fight lost | MUSIC | one-shot |  |
| MOVE_BLOODBATH | MOVE_BLOODBATH.wav | combat | Blood Bath move | SFX | one-shot |  |
| MOVE_BITE | MOVE_BITE.wav | combat | Vampire Bite | SFX | one-shot |  |
| MOVE_OCTOPUS | MOVE_OCTOPUS.wav | combat | Octopus Brain / its encounter option | SFX | one-shot | 204ms lead silence |
| MOVE_REVENGE | MOVE_REVENGE.wav | combat | Revenge | SFX | one-shot |  |
| MOVE_ONEINCH | MOVE_ONEINCH.wav | combat | One-Inch Petty | SFX | one-shot |  |
| ITEM_CAN | ITEM_CAN.wav | combat | Sapporo item | SFX | one-shot |  |
| ITEM_EAT | ITEM_EAT.wav | combat | Food items | SFX | one-shot |  |
| ITEM_SLURP | ITEM_SLURP.wav | combat | Boba item | SFX | one-shot |  |
| COMPANION_CALL | COMPANION_CALL.wav | combat | HOES menu | SFX | one-shot |  |
| GUNWEAVE | GUNWEAVE.wav | combat | Gun appears | SFX | one-shot |  |
| GUN_LILOGA | GUN_LILOGA.wav | combat | Lil Oga | SFX | one-shot |  |
| GUN_SHOTGUN | GUN_SHOTGUN.wav | combat | Sapporo Shotgun | SFX | one-shot | 127ms lead silence |
| GUN_SNIPER | GUN_SNIPER.wav | combat | Chopstick Sniper | SFX | one-shot |  |
| GUN_HOLYDRAKE | GUN_HOLYDRAKE.wav | combat | Holy Baby Drake | SFX | one-shot |  |
| GUN_RPG | GUN_RPG.wav | combat | The RPG | SFX | one-shot |  |
| GUN_KRATOS | GUN_KRATOS.wav | combat | Dev-only gun | SFX | one-shot |  |
| MAGIC_HEX | MAGIC_HEX.wav | combat | Hex | SFX | one-shot |  |
| MAGIC_VEIL | MAGIC_VEIL.wav | combat | Violet Veil | SFX | one-shot |  |
| MAGIC_SEANCE | MAGIC_SEANCE.wav | combat | Séance | SFX | one-shot | DEFECTIVE DC step - do not wire |
| MAGIC_RINGER | MAGIC_RINGER.wav | combat | Dead Ringer | SFX | one-shot |  |
| EN_BRIEFCASE | EN_BRIEFCASE.wav | combat | CEO attack | SFX | one-shot |  |
| EN_SHOVE | EN_SHOVE.wav | combat | Importer attack | SFX | one-shot |  |
| EN_BONES | EN_BONES.wav | combat | Skeleton boss moves | SFX | one-shot |  |
| EN_SWORD | EN_SWORD.wav | combat | Skeleton/Paladin | SFX | one-shot |  |
| EN_SHIELD | EN_SHIELD.wav | combat | Shield attacks | SFX | one-shot |  |
| EN_POOF | EN_POOF.wav | combat | Clones vanishing | SFX | one-shot |  |
| EN_CHARGE | EN_CHARGE.wav | combat | A long charging enemy | SFX | loop |  |
| EN_SCREAM | EN_SCREAM.wav | combat | Charging enemy | VOICE | one-shot |  |
| EN_LUNCHBOX | EN_LUNCHBOX.wav | combat | A certain hunter | SFX | one-shot |  |
| EN_STAKE | EN_STAKE.wav | combat | Hunter attacks | SFX | one-shot |  |
| EN_CHEW | EN_CHEW.wav | combat | The nemesis | SFX | loop |  |
| EN_HOLY | EN_HOLY.wav | combat | Paladin | SFX | one-shot |  |
| EN_KIAI | EN_KIAI.wav | combat | Kung fu enemy | VOICE | one-shot |  |
| CROWD_GASP | CROWD_GASP.wav | combat | Staged entrances | SFX | one-shot |  |
| EGG_CRACK | EGG_CRACK.wav | combat | Hatching | SFX | one-shot |  |
| EN_HOWL | EN_HOWL.wav | combat | Full moon date | SFX | one-shot |  |
| WAKE_SCREAM | WAKE_SCREAM.wav | combat | Waking up from the other life | VOICE | one-shot |  |
| BAT_SWARM | BAT_SWARM.wav | combat | Vampire moments | SFX | one-shot |  |
| CROWD_OOH | CROWD_OOH.wav | combat | Roasts, battles | SFX | one-shot |  |
| EN_LUTE | EN_LUTE.wav | combat | Bard | SFX | one-shot |  |
| EGG_REVEAL | EGG_REVEAL.wav | combat | Special item reveals | SFX | one-shot |  |
| CROWD_CHEER_SMALL | CROWD_CHEER_SMALL.wav | touge | Great drift | SFX | one-shot |  |
| CAR_I6_TURBO | CAR_I6_TURBO__idle.wav + CAR_I6_TURBO__rev.wav + CAR_I6_TURBO__high.wav | touge | TOUGE and car scenes | SFX | loop set (mixed) |  |
| CAR_4CYL_HIGHREV | CAR_4CYL_HIGHREV__idle.wav + CAR_4CYL_HIGHREV__rev.wav + CAR_4CYL_HIGHREV__high.wav | touge | TOUGE | SFX | loop set (mixed) |  |
| CAR_V8_SUV | CAR_V8_SUV__idle.wav + CAR_V8_SUV__rev.wav + CAR_V8_SUV__high.wav | touge | TOUGE | SFX | loop set (mixed) |  |
| CAR_V12 | CAR_V12__idle.wav + CAR_V12__rev.wav + CAR_V12__high.wav | touge | TOUGE | SFX | loop set (mixed) |  |
| CAR_V8_EXOTIC | CAR_V8_EXOTIC__idle.wav + CAR_V8_EXOTIC__rev.wav + CAR_V8_EXOTIC__high.wav | touge | TOUGE | SFX | loop set (mixed) |  |
| TIRE_SQUEAL | TIRE_SQUEAL__loop.wav + TIRE_SQUEAL__start.wav + TIRE_SQUEAL__end.wav | touge | Sliding | SFX | loop set (mixed) |  |
| TIRE_GRIP | TIRE_GRIP.wav | touge | Snapping back to grip | SFX | one-shot |  |
| EBRAKE | EBRAKE.wav | touge | E-brake | SFX | one-shot |  |
| CLUTCH_KICK | CLUTCH_KICK.wav | touge | Clutch kick | SFX | one-shot |  |
| SHIFT | SHIFT.wav | touge | Shifts | SFX | one-shot |  |
| BLOWOFF | BLOWOFF.wav | touge | Lifting throttle (turbo cars) | SFX | one-shot |  |
| WALL_SCRAPE | WALL_SCRAPE.wav | touge | Touching a wall | SFX | one-shot |  |
| SPINOUT | SPINOUT.wav | touge | Spin-out | SFX | one-shot |  |
| CLIP_DING | CLIP_DING.wav | touge | Hitting a clipping point | UI | one-shot | duplicate of UI_CONFIRM |
| COMBO_UP | COMBO_UP.wav + COMBO_UP__alt1.wav + COMBO_UP__alt2.wav | touge | Combo increases | UI | one-shot |  |
| COUNTDOWN | COUNTDOWN.wav | touge | Run start | UI | one-shot |  |
| CAR_WINDOWS_DOWN | CAR_WINDOWS_DOWN.wav | touge | Drive home after the concert | AMBIENCE | loop |  |
| CAR_LIFT | CAR_LIFT.wav | touge | Opening garage screen | SFX | one-shot |  |
| AMB_MOUNTAIN | AMB_MOUNTAIN.wav | touge | Mountain course | AMBIENCE | loop |  |
| CAST | CAST.wav | pier | Cast | SFX | one-shot |  |
| BOBBER_PLOP | BOBBER_PLOP.wav | pier | Line lands | SFX | one-shot |  |
| REEL_LOOP | REEL_LOOP.wav | pier | Reeling | SFX | loop |  |
| LINE_TENSION | LINE_TENSION.wav | pier | High tension | SFX | loop |  |
| LINE_SNAP | LINE_SNAP.wav | pier | Lost fish | SFX | one-shot |  |
| SPLASH_BIG | SPLASH_BIG.wav | pier | Big fish | SFX | one-shot |  |
| FISH_FLOP | FISH_FLOP.wav | pier | Landed catch | SFX | one-shot |  |
| NIBBLE | NIBBLE.wav | pier | Nibble | SFX | one-shot |  |
| AMB_PIER | AMB_PIER.wav | pier | Pier | SFX | loop |  |
| ORDER_BELL | ORDER_BELL.wav | slurp | New order | SFX | one-shot |  |
| TIP_COINS | TIP_COINS.wav | slurp | Perfect bowl tip | SFX | one-shot |  |
| TICKET_PRINT | TICKET_PRINT.wav | slurp | Order ticket | SFX | one-shot |  |
| BROTH_POUR | BROTH_POUR.wav | slurp | Broth | SFX | one-shot |  |
| NOODLE_DROP | NOODLE_DROP.wav | slurp | Noodles | SFX | one-shot |  |
| BOWL_CLINK | BOWL_CLINK.wav | slurp | Serving | SFX | one-shot |  |
| AMB_RAMEN | AMB_RAMEN.wav | slurp | Ramen shop | AMBIENCE | loop |  |
| DRAGON_CHIRP_BABY | DRAGON_CHIRP_BABY.wav | hatch | Hatchling | SFX | one-shot |  |
| DRAGON_HAPPY | DRAGON_HAPPY.wav | hatch | Happy reactions | SFX | one-shot |  |
| DRAGON_SULK | DRAGON_SULK.wav | hatch | Sulking | SFX | one-shot |  |
| DRAGON_ROAR | DRAGON_ROAR.wav | hatch | Grown dragon moments | SFX | one-shot |  |
| DRAGON_FIRE_SMALL | DRAGON_FIRE_SMALL.wav | hatch | Sneezes, cube | SFX | one-shot |  |
| DRAGON_EAT | DRAGON_EAT.wav | hatch | Feeding | SFX | one-shot |  |
| BARS_WRONG | BARS_WRONG.wav | bars | Wrong tap | UI | one-shot |  |
| BARS_TIMER | BARS_TIMER.wav | bars | Run ending | UI | one-shot |  |
| BARS_CORRECT | BARS_CORRECT.wav | bars | Correct tap | UI | one-shot |  |
| BLENDER | BLENDER.wav | jollof | Blending | SFX | loop |  |
| OIL_SIZZLE_PASTE | OIL_SIZZLE_PASTE.wav | jollof | Frying the paste | SFX | loop |  |
| STIR_POT | STIR_POT.wav | jollof | Stirring | SFX | one-shot |  |
| SPICE_SHAKE | SPICE_SHAKE.wav | jollof | Seasoning | SFX | one-shot |  |
| LID_CLANK | LID_CLANK.wav | jollof | Covering pot | SFX | one-shot |  |
| STEAM_HISS | STEAM_HISS.wav | jollof | Steaming | SFX | loop |  |
| BURNT_CRACKLE | BURNT_CRACKLE.wav | jollof | Party rice crust | SFX | one-shot |  |
| AMB_COOKOFF | AMB_COOKOFF.wav | jollof | Cook-off | AMBIENCE | loop |  |
| IMPACT_WRENCH | IMPACT_WRENCH.wav | garage | Installing parts | SFX | one-shot |  |
| RATCHET | RATCHET.wav | garage | Installing parts | SFX | one-shot |  |
| PART_INSTALL | PART_INSTALL.wav | garage | Part installed | SFX | one-shot |  |
| AMB_GARAGE | AMB_GARAGE.wav | garage | Garage | AMBIENCE | loop |  |
| AMB_GARAGE_ECHO | AMB_GARAGE_ECHO.wav | garage | Garage course | AMBIENCE | loop |  |
| EXHALE | EXHALE.wav | hookah_pickup_kbbq | Blowing a ring | VOICE | one-shot |  |
| TONGS | TONGS.wav | hookah_pickup_kbbq | Flip / pull | SFX | one-shot |  |
| WHISTLE | WHISTLE.wav | hookah_pickup_kbbq | Game start/end | SFX | one-shot |  |
| SMOKE_HISS | SMOKE_HISS.wav | hookah_pickup_kbbq | Burnt | SFX | one-shot |  |
| SHOE_SQUEAK | SHOE_SQUEAK.wav | hookah_pickup_kbbq | Crossovers | SFX | one-shot |  |
| HOOKAH_BUBBLE | HOOKAH_BUBBLE.wav | hookah_pickup_kbbq | Inhale | SFX | loop |  |
| DRIBBLE__bounce | DRIBBLE__bounce.wav | hookah_pickup_kbbq | ? | ? | one-shot |  |
| DRIBBLE__loop | DRIBBLE__loop.wav | hookah_pickup_kbbq | ? | ? | loop |  |
| AMB_COURTS | AMB_COURTS.wav | hookah_pickup_kbbq | Courts | AMBIENCE | loop |  |
| CHAR_CRACKLE | CHAR_CRACKLE.wav | hookah_pickup_kbbq | Char stage | SFX | one-shot |  |
| GRILL_LAND__land | GRILL_LAND__land.wav | hookah_pickup_kbbq | ? | ? | one-shot |  |
| GRILL_LAND__loop | GRILL_LAND__loop.wav | hookah_pickup_kbbq | ? | ? | loop |  |
| SIZZLE_PERFECT | SIZZLE_PERFECT.wav | hookah_pickup_kbbq | Doneness cue | SFX | loop |  |
| SWISH | SWISH.wav | hookah_pickup_kbbq | Made shot | SFX | one-shot |  |
| RIM | RIM.wav | hookah_pickup_kbbq | Miss | SFX | one-shot |  |
| AMB_KBBQ | AMB_KBBQ.wav | hookah_pickup_kbbq | KBBQ | AMBIENCE | loop |  |
| AMB_RAIN | AMB_RAIN.wav | locations | Location: Rain night | AMBIENCE | loop |  |
| AMB_CURB | AMB_CURB.wav | locations | Location: Suburban night curb | AMBIENCE | loop |  |
| AMB_HOTSPRING_OUT | AMB_HOTSPRING_OUT.wav | locations | Location: Outdoor hot spring at night | AMBIENCE | loop |  |
| AMB_ONSEN | AMB_ONSEN.wav | locations | Location: Japanese spa | AMBIENCE | loop |  |
| AMB_CAFE_RAIN | AMB_CAFE_RAIN.wav | locations | Location: Café in the rain | AMBIENCE | loop |  |
| AMB_OCEAN_FLOOR | AMB_OCEAN_FLOOR.wav | locations | Location: Ocean floor (prologue) | AMBIENCE | loop |  |
| AMB_DOCKS | AMB_DOCKS.wav | locations | Location: Docks at night | AMBIENCE | loop |  |
| AMB_APARTMENT_LAN | AMB_APARTMENT_LAN.wav | locations | Location: Gamer apartment | AMBIENCE | loop |  |
| AMB_BLOODBANK | AMB_BLOODBANK.wav | locations | Location: Clinic | AMBIENCE | loop |  |
| AMB_ARMORY | AMB_ARMORY.wav | locations | Location: Church back room | AMBIENCE | loop |  |
| AMB_BALLROOM | AMB_BALLROOM.wav | locations | Location: Haunted ballroom | AMBIENCE | loop |  |
| AMB_CATACOMB | AMB_CATACOMB.wav | locations | Location: Basement venue | AMBIENCE | loop |  |
| AMB_RESTAURANT | AMB_RESTAURANT.wav | locations | Location: Busy family restaurant | AMBIENCE | loop |  |
| AMB_FOODCOURT | AMB_FOODCOURT.wav | locations | Location: Food court | AMBIENCE | loop |  |
| AMB_BOBA | AMB_BOBA.wav | locations | Location: Boba shop | AMBIENCE | loop |  |
| AMB_DISPENSARY | AMB_DISPENSARY.wav | locations | Location: Dispensary | AMBIENCE | loop |  |
| AMB_TACO_TRUCK | AMB_TACO_TRUCK.wav | locations | Location: Taco truck | AMBIENCE | loop |  |
| AMB_AFRICAN_STORE | AMB_AFRICAN_STORE.wav | locations | Location: African grocery store | AMBIENCE | loop |  |
| AMB_GALLERY | AMB_GALLERY.wav | locations | Location: Art gallery opening | AMBIENCE | loop |  |
| AMB_SOIREE | AMB_SOIREE.wav | locations | Location: Elite vampire party | AMBIENCE | loop |  |
| AMB_BRUNCH | AMB_BRUNCH.wav | locations | Location: Daytime brunch spot | AMBIENCE | loop |  |
| AMB_DINER_ATL | AMB_DINER_ATL.wav | locations | Location: 24-hour waffle diner | AMBIENCE | loop |  |
| AMB_FAMILY_HOUSE | AMB_FAMILY_HOUSE.wav | locations | Location: Family holiday house | AMBIENCE | loop |  |
| AMB_SALON | AMB_SALON.wav | locations | Location: Hair salon | AMBIENCE | loop |  |
| AMB_LITTLE_TOKYO | AMB_LITTLE_TOKYO.wav | locations | Location: Lantern plaza at night | AMBIENCE | loop |  |
| AMB_RAVE_EXT | AMB_RAVE_EXT.wav | locations | Location: Warehouse party exterior | AMBIENCE | loop |  |
| AMB_RAVE_INT | AMB_RAVE_INT.wav | locations | Location: Warehouse party interior | AMBIENCE | loop |  |
| AMB_CONCERT | AMB_CONCERT.wav | locations | Location: Amphitheater concert | AMBIENCE | loop |  |
| AMB_MALL | AMB_MALL.wav | locations | Location: Outdoor mall at night | AMBIENCE | loop |  |
| AMB_MALL_ATL | AMB_MALL_ATL.wav | locations | Location: Giant indoor mall | AMBIENCE | loop |  |
| AMB_PARK_FOUNTAIN | AMB_PARK_FOUNTAIN.wav | locations | Location: City park fountain | AMBIENCE | loop |  |
| AMB_AIRPORT | AMB_AIRPORT.wav | locations | Location: Huge airport terminal | AMBIENCE | loop |  |
| AMB_PETSTORE | AMB_PETSTORE.wav | locations | Location: Pet store | AMBIENCE | loop |  |
| ALARM_CLOCK | ALARM_CLOCK.wav | story | The other life | SFX | one-shot |  |
| BLOOD_SPRINKLER | BLOOD_SPRINKLER.wav + BLOOD_SPRINKLER__alt1.wav | story | Rave sprinklers | SFX | one-shot |  |
| HEAVY_STEPS | HEAVY_STEPS.wav | story | A dangerous arrival | SFX | one-shot |  |
| HOLY_CHOIR_COMEDIC | HOLY_CHOIR_COMEDIC.wav | story | Legendary bread, sacred jokes | SFX | one-shot |  |
| HOOK_COOKED | HOOK_COOKED.wav | story | A song is finished | MUSIC | one-shot |  |
| KIDS_HALLOWEEN | KIDS_HALLOWEEN.wav | story | Halloween | SFX | one-shot |  |
| LADDER_COLLAPSE | LADDER_COLLAPSE.wav | story | Prologue collapse | SFX | one-shot |  |
| LADDER_CREAK | LADDER_CREAK.wav | story | Prologue climb | SFX | one-shot |  |
| LAPTOP_TYPING | LAPTOP_TYPING.wav | story | Café laptop / music cooking | SFX | loop |  |
| MALL_GATE | MALL_GATE.wav | story | Closed mall | SFX | one-shot |  |
| MIC_FEEDBACK | MIC_FEEDBACK.wav | story | Stage moments | SFX | one-shot |  |
| NINJA_CROWD | NINJA_CROWD.wav | story | The forty clones | SFX | one-shot |  |
| OFFICE_ROOM | OFFICE_ROOM.wav | story | The other life | AMBIENCE | loop |  |
| POLITE_APPLAUSE | POLITE_APPLAUSE.wav | story | The other life | SFX | one-shot |  |
| POWER_CUT | POWER_CUT.wav | story | Venue power cut | SFX | one-shot |  |
| RECORD_SCRATCH | RECORD_SCRATCH.wav | story | Comedic interruptions | SFX | one-shot |  |
| SENSEI_RUMBLE | SENSEI_RUMBLE.wav | story | Sensei appears | SFX | one-shot |  |
| SIREN_CHIRP | SIREN_CHIRP.wav | story | Traffic stops | SFX | one-shot |  |
| STARS_SHIMMER | STARS_SHIMMER.wav | story | A quiet sacred moment | SFX | one-shot |  |
| SUBURB_MORNING | SUBURB_MORNING.wav | story | The other life | AMBIENCE | loop |  |
| TRANSFORM_BLOOM | TRANSFORM_BLOOM.wav | story | Dragon ↔ human | SFX | one-shot |  |
| XCOM_MISS | XCOM_MISS.wav | story | LAN night joke | SFX | one-shot |  |
| SEAL_01 | SEAL_01.wav | reserved | HQ: see sealed volumes | SFX | one-shot |  |
| SEAL_02 | SEAL_02.wav | reserved | HQ: see sealed volumes | SFX | one-shot |  |
| SEAL_03 | SEAL_03.wav | reserved | HQ: see sealed volumes | SFX | loop |  |
| SEAL_04 | SEAL_04.wav | reserved | HQ: see sealed volumes | SFX | loop |  |
| SEAL_05 | SEAL_05.wav | reserved | HQ: see sealed volumes | SFX | loop |  |
| SEAL_06 | SEAL_06.wav + SEAL_06__alt1.wav | reserved | HQ: see sealed volumes | SFX | loop set (mixed) | alt1 200ms lead |
| SEAL_07 | SEAL_07.wav | reserved | HQ: see sealed volumes | SFX | one-shot |  |
| SEAL_08 | SEAL_08.wav | reserved | HQ: see sealed volumes | SFX | loop |  |
| SEAL_09 | SEAL_09.wav + SEAL_09__alt1.wav | reserved | HQ: see sealed volumes | SFX | loop set (mixed) |  |
| SEAL_10 | SEAL_10.wav | reserved | HQ: see sealed volumes | SFX | loop |  |
| SEAL_11 | SEAL_11.wav | reserved | HQ: see sealed volumes | SFX | one-shot |  |
| SEAL_12 | SEAL_12.wav | reserved | HQ: see sealed volumes | SFX | loop |  |
| SEAL_13 | SEAL_13.wav | reserved | HQ: see sealed volumes | SFX | loop |  |
| SEAL_14 | SEAL_14.wav | reserved | HQ: see sealed volumes | SFX | one-shot |  |
| SEAL_15 | SEAL_15.wav | reserved | HQ: see sealed volumes | SFX | one-shot |  |
| SEAL_16 | SEAL_16.wav | reserved | HQ: see sealed volumes | SFX | one-shot |  |
| SEAL_17 | SEAL_17.wav | reserved | HQ: see sealed volumes | SFX | loop |  |
| SEAL_18 | SEAL_18.wav | reserved | HQ: see sealed volumes | SFX | loop |  |
## 8. SOURCE / LICENSE RISKS
- Every row has a license. Attribution-required (must appear in credits): GUN_HOLYDRAKE (CC BY 4.0 component), CROWD_CHEER_SMALL (CC BY 4.0), TONGS (CC-BY 3.0), SHOE_SQUEAK (CC-BY 4.0), BARS_WRONG (CC-BY 3.0), AMB_CURB (OGA-BY 3.0 component), BARS_TIMER (custom attribution-required, treated CC-BY-equivalent). All carry an attribution_line.
- EN_HOWL labeled Public domain with empty attribution_line (acceptable; source_url present).
- 7 Mixkit rows have blank source_site AND source_url (ALARM_CLOCK, NINJA_CROWD, POLITE_APPLAUSE, STARS_SHIMMER, SUBURB_MORNING, TRANSFORM_BLOOM, XCOM_MISS) — provenance gap, no attribution obligation.
- 13 Sonniss GDC rows: commercial game use OK, but not for resale standalone or AI/ML training.
- 10 Pixabay Content License rows: no attribution required.
- License field has ~31 string variants for effectively CC0 / Mixkit / Sonniss / original — normalize to an enum at Register.
- Reserved SEAL_01–SEAL_18 present (20 files); neutral codes preserved; licenses Mixkit (9) / CC0 (11). No label change performed.

## 9. SOURCE REQUIRED ITEMS
- Later Sound Finder ticket (do NOT substitute into delivery): DRAGON_WINGS; BARS_PUNCHLINE (MISSING.txt notes a CC0 OGA bell-chime fallback).
- Non-sourcing actions: re-render MAGIC_SEANCE; decide CLIP_DING/UI_CONFIRM reuse; supply loop points.

## 10. DISPOSITION
READY WITH MINOR GAPS — 242/244 IDs integration-ready as-is; blockers are 2 genuinely missing IDs, 1 defective file, and unspecified loop points. Do not wire MAGIC_SEANCE, DRAGON_WINGS, or BARS_PUNCHLINE until resolved.