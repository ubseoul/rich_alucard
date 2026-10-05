# RA Sound Deployment Plan — HQ

> _Imported verbatim into the repository so future engineering/art sessions can find the approved sound plan. Source: `RA_Sound_Deployment_Plan_HQ.docx` (HQ). Companion to the Sound Finder Brief. This document is data for the audio engine; it does not by itself authorize shipping any sound._

RICH ALUCARD — SOUND DEPLOYMENT PLAN
HQ + Engineering integration guide
Companion to the Sound Finder Brief. The Finder delivers RA_SFX_DELIVERY_v1.zip; this document turns it into shipped, balanced, tested sound across the game. 244 sound IDs, 7 milestones.

CONTENTS

## 1. PIPELINE

## 2. MANIFEST SCHEMA

## 3. AUDIO ENGINE REQUIREMENTS (extend the existing RAAudio)

## 4. MILESTONES

## 5. PER-SOUND DEPLOYMENT TABLE (each row = mini-milestone)

## 6. RESERVED MAPPING (HQ ONLY)

## 7. QA CHECKLIST (run per milestone)

## 1. PIPELINE

1. Intake: unzip into `audio_src/sfx/` (masters, never shipped). Verify every ID in this plan exists or is listed in MISSING.txt. Reject any file whose MANIFEST row lacks a confirmed license.
2. Review: HQ listens to every file against its row (the Finder descriptions are the spec). Pick the best of any alternates. Mark each ID ACCEPT / REPLACE.
3. Process: trim, fade 5 ms in/out on one-shots, confirm loop seams, balance loudness (targets in 3.2).
4. Encode: runtime copies go to `assets/audio/sfx/<category>/` as MP3 (one-shots mono 96–128 kbps; ambience and loops stereo 128 kbps).
5. Register: add each ID to `js/data/audio_manifest.js` (schema 2.1).
6. Wire: Engineering calls sounds only by ID through the audio engine (Section 3). No file paths in scene code.
7. QA: per-milestone checklist (Section 5), plus a credits entry for any CC-BY sound.

## 2. MANIFEST SCHEMA

### 2.1 Per-ID entry

`id`, `file`, `bus` (UI / SFX / VOICE / AMBIENCE / MUSIC), `type` (one-shot / loop / loop set), `gain` (0–1), `loopStart`/`loopEnd` in seconds (loops only — required, see 3.4), `variations` (list of alternate files), `pitchJitter` (e.g. ±0.03 for repeated sounds), `maxVoices` (concurrency cap), `priority` (1–5), `license`, `credit`.

### 2.2 Credits

Any CC-BY row produces an automatic line in the game's credits screen. No credit line, no ship.

## 3. AUDIO ENGINE REQUIREMENTS (extend the existing RAAudio)

### 3.1 Buses

| Bus | Default gain | Notes |
| --- | --- | --- |
| MUSIC | 0.70 | Rich Radio + stingers. Ducks under dialogue and big story stingers. |
| SFX | 0.90 | World and combat sounds. |
| UI | 0.60 | Taps, pings, blips. Never louder than SFX. |
| VOICE | 0.80 | Text blips, breaths, library vocal SFX. |
| AMBIENCE | 0.45 | Location beds. Crossfade 600–1200 ms between locations. |

### 3.2 Loudness targets

One-shots peak ≈ −3 dBFS before bus gain; ambience beds sit ~12–15 dB under combat SFX; UI blips should be audible but never fatiguing after 100 repeats.

### 3.3 Behavior

Unlock: Web Audio starts on the first user tap (the START button). Nothing plays before it.
Ducking: music −6 dB while dialogue is on screen; −12 dB under REWARD_STINGER, VICTORY, DEFEAT and big story stingers; restore over 400 ms.
Preload by scene: each scene declares its sound IDs; the engine preloads them on scene enter and releases unused buffers on exit. UI, combat core and phone sounds stay resident.
Repetition: pitch jitter ±3% and alternates for anything heard constantly (taps, hits, blips, footsteps, tire chirps).
Concurrency caps: text blips max 1; hits max 3; notifications max 4 (except NOTIF_STORM); ambience max 2 during crossfade.
Settings: MUSIC / SFX / AMBIENCE sliders and a MUTE toggle in the phone settings, persisted in the save's settings block (no save-format change beyond settings).
Haptics (optional, Android only): pair HIT_HEAVY, CRIT, CLIP_DING, NIBBLE, BOBBER_PLOP with short vibrations; iOS Safari does not support the Vibration API, so never depend on it.

### 3.4 Loops on the web (important)

MP3 and AAC add silent padding that breaks seamless loops. Every loop must be played through Web Audio with explicit `loopStart`/`loopEnd` from the manifest, measured on the decoded buffer. QA must listen to 3 full loop cycles for every loop.

### 3.5 Known platform caveats

iPhones may silence web audio when the ringer switch is on silent; this is expected. The first-run tip can say "turn your ringer on for sound."
Keep total audio preloaded per scene under ~8 MB decoded to protect low-end phones.

## 4. MILESTONES

| Milestone | Contents | Acceptance |
| --- | --- | --- |
| M1 CORE FEEL | UI & Phone, Home & Castle | Every tap, notification, money event and bedroom state has sound; no silent buttons; blips pass the 100-repeat fatigue test |
| M2 COMBAT | Combat | Every move, item, gun, spell, enemy attack and outcome has a sound; heavy vs light hits clearly different; telegraph is unmistakable |
| M3 SIGNATURE MINIGAMES | TOUGE, PIER, HATCH, BARS | Engine pitch follows RPM; tire squeal follows slide angle; reel tension audible; dragon has a voice at every stage; BARS feels on-beat |
| M4 LIFE MINIGAMES | SLURP, JOLLOF WARS, GARAGE, HOOKAH, PICKUP, KBBQ | Cooking sounds are the doneness cues (players can play by ear); each minigame has start, success, fail, and ambience |
| M5 LOCATIONS | All ambience beds | Every location has a bed; crossfades clean; no bed louder than dialogue; rain layer works over any exterior |
| M6 STORY MOMENTS | Open story sounds | Each tied to its authored beat; stingers duck music; quiet moments stay quiet |
| M7 RESERVED | SEAL_01–SEAL_18 | Wired by HQ per the sealed volumes; never labeled by content in any Ube-facing build or dev menu |

## 5. PER-SOUND DEPLOYMENT TABLE (each row = mini-milestone)

Status per row: ☐ IN ZIP ☐ ACCEPTED ☐ ENCODED ☐ IN MANIFEST ☐ WIRED ☐ QA PASS

### M1 — UI & PHONE

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| UI_TAP | Any button press | UI | one-shot | ☐☐☐☐☐☐ |
| UI_MOVE | FIGHT/ITEM/HOES/RUN cursor, list scrolling | UI | one-shot | ☐☐☐☐☐☐ |
| UI_CONFIRM | Confirming choices, purchases, routes | UI | one-shot | ☐☐☐☐☐☐ |
| UI_BACK | Back, close panels | UI | one-shot | ☐☐☐☐☐☐ |
| UI_ERROR | Can't afford, locked option | UI | one-shot | ☐☐☐☐☐☐ |
| UI_DIALOG_ADVANCE | Tap to advance dialogue | UI | one-shot | ☐☐☐☐☐☐ |
| UI_TEXT_BLIP_RICH | Rich's dialogue typing | VOICE | one-shot (rapid repeat) | ☐☐☐☐☐☐ |
| UI_TEXT_BLIP_NPC_LOW | Deep-voiced NPC text | VOICE | one-shot (rapid repeat) | ☐☐☐☐☐☐ |
| UI_TEXT_BLIP_NPC_MID | Most NPC text | VOICE | one-shot (rapid repeat) | ☐☐☐☐☐☐ |
| UI_TEXT_BLIP_NPC_HIGH | Light/high-voiced NPC text | VOICE | one-shot (rapid repeat) | ☐☐☐☐☐☐ |
| UI_TEXT_BLIP_GHOST | Ghost characters' text | VOICE | one-shot (rapid repeat) | ☐☐☐☐☐☐ |
| PHONE_OPEN | Open phone | UI | one-shot | ☐☐☐☐☐☐ |
| PHONE_CLOSE | Close phone | UI | one-shot | ☐☐☐☐☐☐ |
| PHONE_APP_OPEN | Open any app | UI | one-shot | ☐☐☐☐☐☐ |
| NOTIF_GENERIC | Generic notification | UI | one-shot | ☐☐☐☐☐☐ |
| NOTIF_TEXT | Incoming text/DM | UI | one-shot | ☐☐☐☐☐☐ |
| NOTIF_VAMPGRAM | VampGram activity | UI | one-shot | ☐☐☐☐☐☐ |
| NOTIF_INSTAHOE | InstaHoe DMs/likes | UI | one-shot | ☐☐☐☐☐☐ |
| NOTIF_FAMILY | Family group chat | UI | one-shot | ☐☐☐☐☐☐ |
| NOTIF_STORM | Viral moments; the fame morning | UI | one-shot | ☐☐☐☐☐☐ |
| CASH_IN | Money added (rent, budget, prizes) | UI | one-shot | ☐☐☐☐☐☐ |
| CASH_OUT | Purchases | UI | one-shot | ☐☐☐☐☐☐ |
| APP_UNLOCK | New phone app appears | UI | one-shot | ☐☐☐☐☐☐ |
| CONTACT_ADDED | Someone added to contacts | UI | one-shot | ☐☐☐☐☐☐ |
| WHATWEON_UPDATE | A new line appears in VampGPT's list | UI | one-shot | ☐☐☐☐☐☐ |
| RADIO_SWITCH | Changing song on RICH RADIO | UI | one-shot | ☐☐☐☐☐☐ |
| TRAVEL_WHOOSH | Leaving for a destination | UI | one-shot | ☐☐☐☐☐☐ |
| REWARD_STINGER | Reward screens | MUSIC | one-shot | ☐☐☐☐☐☐ |
| SAVE | Autosave indicator | UI | one-shot | ☐☐☐☐☐☐ |

### M1 — HOME & CASTLE

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| AMB_BEDROOM | Bedroom scene | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_THRONE | Throne room | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_CASTLE_STREET | Outside the castle | AMBIENCE | loop | ☐☐☐☐☐☐ |
| BED_RUSTLE | Wake / sleep | SFX | one-shot | ☐☐☐☐☐☐ |
| WAKE_STRETCH | WAKE | SFX | one-shot | ☐☐☐☐☐☐ |
| STEPS_STONE | Walking in castle | SFX | one-shot | ☐☐☐☐☐☐ |
| DOOR_CASTLE | Entering/leaving the castle | SFX | one-shot | ☐☐☐☐☐☐ |
| BAT_FLUTTER | Window, released women flying off | SFX | one-shot | ☐☐☐☐☐☐ |
| ROOM_BUILT | Buying a castle room | SFX | one-shot | ☐☐☐☐☐☐ |
| CAT_MEOW | Cat interactions | SFX | one-shot | ☐☐☐☐☐☐ |
| CAT_PURR | Cat on bed | SFX | loop | ☐☐☐☐☐☐ |
| SNEEZE | Rich near the cat | VOICE | one-shot | ☐☐☐☐☐☐ |
| KITCHEN_AMB | Castle kitchen | AMBIENCE | loop | ☐☐☐☐☐☐ |
| TV_ROOM | Movie room dates | AMBIENCE | loop | ☐☐☐☐☐☐ |

### M2 — COMBAT

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| BATTLE_START | Any fight begins | SFX | one-shot | ☐☐☐☐☐☐ |
| TELEGRAPH | Enemy telegraph line | SFX | one-shot | ☐☐☐☐☐☐ |
| HIT_LIGHT | Normal damage | SFX | one-shot | ☐☐☐☐☐☐ |
| HIT_HEAVY | Heavy hit (≥20% HP) | SFX | one-shot | ☐☐☐☐☐☐ |
| MISS | Missed attack | SFX | one-shot | ☐☐☐☐☐☐ |
| CRIT | Crits | SFX | one-shot | ☐☐☐☐☐☐ |
| HEAL | HP restored | SFX | one-shot | ☐☐☐☐☐☐ |
| BUFF | Buffs | SFX | one-shot | ☐☐☐☐☐☐ |
| DEBUFF | Debuffs | SFX | one-shot | ☐☐☐☐☐☐ |
| STUN | Stuns | SFX | one-shot | ☐☐☐☐☐☐ |
| KO | Enemy or Rich defeated | SFX | one-shot | ☐☐☐☐☐☐ |
| VICTORY | Fight won | MUSIC | one-shot | ☐☐☐☐☐☐ |
| DEFEAT | Fight lost | MUSIC | one-shot | ☐☐☐☐☐☐ |
| MOVE_BLOODBATH | Blood Bath move | SFX | one-shot | ☐☐☐☐☐☐ |
| MOVE_BITE | Vampire Bite | SFX | one-shot | ☐☐☐☐☐☐ |
| MOVE_OCTOPUS | Octopus Brain / its encounter option | SFX | one-shot | ☐☐☐☐☐☐ |
| MOVE_REVENGE | Revenge | SFX | one-shot | ☐☐☐☐☐☐ |
| MOVE_ONEINCH | One-Inch Petty | SFX | one-shot | ☐☐☐☐☐☐ |
| ITEM_CAN | Sapporo item | SFX | one-shot | ☐☐☐☐☐☐ |
| ITEM_EAT | Food items | SFX | one-shot | ☐☐☐☐☐☐ |
| ITEM_SLURP | Boba item | SFX | one-shot | ☐☐☐☐☐☐ |
| COMPANION_CALL | HOES menu | SFX | one-shot | ☐☐☐☐☐☐ |
| GUNWEAVE | Gun appears | SFX | one-shot | ☐☐☐☐☐☐ |
| GUN_LILOGA | Lil Oga | SFX | one-shot | ☐☐☐☐☐☐ |
| GUN_SHOTGUN | Sapporo Shotgun | SFX | one-shot | ☐☐☐☐☐☐ |
| GUN_SNIPER | Chopstick Sniper | SFX | one-shot | ☐☐☐☐☐☐ |
| GUN_HOLYDRAKE | Holy Baby Drake | SFX | one-shot | ☐☐☐☐☐☐ |
| GUN_RPG | The RPG | SFX | one-shot | ☐☐☐☐☐☐ |
| GUN_KRATOS | Dev-only gun | SFX | one-shot | ☐☐☐☐☐☐ |
| MAGIC_HEX | Hex | SFX | one-shot | ☐☐☐☐☐☐ |
| MAGIC_VEIL | Violet Veil | SFX | one-shot | ☐☐☐☐☐☐ |
| MAGIC_SEANCE | Séance | SFX | one-shot | ☐☐☐☐☐☐ |
| MAGIC_RINGER | Dead Ringer | SFX | one-shot | ☐☐☐☐☐☐ |
| EN_BRIEFCASE | CEO attack | SFX | one-shot | ☐☐☐☐☐☐ |
| EN_SHOVE | Importer attack | SFX | one-shot | ☐☐☐☐☐☐ |
| EN_BONES | Skeleton boss moves | SFX | one-shot | ☐☐☐☐☐☐ |
| EN_SWORD | Skeleton/Paladin | SFX | one-shot | ☐☐☐☐☐☐ |
| EN_SHIELD | Shield attacks | SFX | one-shot | ☐☐☐☐☐☐ |
| EN_POOF | Clones vanishing | SFX | one-shot | ☐☐☐☐☐☐ |
| EN_CHARGE | A long charging enemy | SFX | loop | ☐☐☐☐☐☐ |
| EN_SCREAM | Charging enemy | VOICE | one-shot | ☐☐☐☐☐☐ |
| EN_LUNCHBOX | A certain hunter | SFX | one-shot | ☐☐☐☐☐☐ |
| EN_STAKE | Hunter attacks | SFX | one-shot | ☐☐☐☐☐☐ |
| EN_CHEW | The nemesis | SFX | loop | ☐☐☐☐☐☐ |
| EN_LUTE | Bard | SFX | one-shot | ☐☐☐☐☐☐ |
| EN_HOLY | Paladin | SFX | one-shot | ☐☐☐☐☐☐ |
| EN_KIAI | Kung fu enemy | VOICE | one-shot | ☐☐☐☐☐☐ |
| EN_HOWL | Full moon date | SFX | one-shot | ☐☐☐☐☐☐ |

### M3 — MINIGAME — TOUGE (DRIFT)

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| CAR_I6_TURBO | TOUGE and car scenes | SFX | loop set | ☐☐☐☐☐☐ |
| CAR_4CYL_HIGHREV | TOUGE | SFX | loop set | ☐☐☐☐☐☐ |
| CAR_V8_SUV | TOUGE | SFX | loop set | ☐☐☐☐☐☐ |
| CAR_V12 | TOUGE | SFX | loop set | ☐☐☐☐☐☐ |
| CAR_V8_EXOTIC | TOUGE | SFX | loop set | ☐☐☐☐☐☐ |
| TIRE_SQUEAL | Sliding | SFX | loop set | ☐☐☐☐☐☐ |
| TIRE_GRIP | Snapping back to grip | SFX | one-shot | ☐☐☐☐☐☐ |
| EBRAKE | E-brake | SFX | one-shot | ☐☐☐☐☐☐ |
| CLUTCH_KICK | Clutch kick | SFX | one-shot | ☐☐☐☐☐☐ |
| SHIFT | Shifts | SFX | one-shot | ☐☐☐☐☐☐ |
| BLOWOFF | Lifting throttle (turbo cars) | SFX | one-shot | ☐☐☐☐☐☐ |
| WALL_SCRAPE | Touching a wall | SFX | one-shot | ☐☐☐☐☐☐ |
| SPINOUT | Spin-out | SFX | one-shot | ☐☐☐☐☐☐ |
| CLIP_DING | Hitting a clipping point | UI | one-shot | ☐☐☐☐☐☐ |
| COMBO_UP | Combo increases | UI | one-shot | ☐☐☐☐☐☐ |
| CROWD_CHEER_SMALL | Great drift | SFX | one-shot | ☐☐☐☐☐☐ |
| COUNTDOWN | Run start | UI | one-shot | ☐☐☐☐☐☐ |
| AMB_MOUNTAIN | Mountain course | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_GARAGE_ECHO | Garage course | AMBIENCE | loop | ☐☐☐☐☐☐ |

### M3 — MINIGAME — PIER (FISHING)

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| CAST | Cast | SFX | one-shot | ☐☐☐☐☐☐ |
| BOBBER_PLOP | Line lands | SFX | one-shot | ☐☐☐☐☐☐ |
| NIBBLE | Nibble | SFX | one-shot | ☐☐☐☐☐☐ |
| REEL_LOOP | Reeling | SFX | loop | ☐☐☐☐☐☐ |
| LINE_TENSION | High tension | SFX | loop | ☐☐☐☐☐☐ |
| LINE_SNAP | Lost fish | SFX | one-shot | ☐☐☐☐☐☐ |
| SPLASH_BIG | Big fish | SFX | one-shot | ☐☐☐☐☐☐ |
| FISH_FLOP | Landed catch | SFX | one-shot | ☐☐☐☐☐☐ |
| AMB_PIER | Pier | SFX | loop | ☐☐☐☐☐☐ |

### M4 — MINIGAME — SLURP (RAMEN)

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| BOWL_CLINK | Serving | SFX | one-shot | ☐☐☐☐☐☐ |
| BROTH_POUR | Broth | SFX | one-shot | ☐☐☐☐☐☐ |
| NOODLE_DROP | Noodles | SFX | one-shot | ☐☐☐☐☐☐ |
| ORDER_BELL | New order | SFX | one-shot | ☐☐☐☐☐☐ |
| TICKET_PRINT | Order ticket | SFX | one-shot | ☐☐☐☐☐☐ |
| TIP_COINS | Perfect bowl tip | SFX | one-shot | ☐☐☐☐☐☐ |
| AMB_RAMEN | Ramen shop | AMBIENCE | loop | ☐☐☐☐☐☐ |

### M3 — MINIGAME — HATCH (DRAGON)

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| EGG_CRACK | Hatching | SFX | one-shot | ☐☐☐☐☐☐ |
| DRAGON_CHIRP_BABY | Hatchling | SFX | one-shot | ☐☐☐☐☐☐ |
| DRAGON_HAPPY | Happy reactions | SFX | one-shot | ☐☐☐☐☐☐ |
| DRAGON_SULK | Sulking | SFX | one-shot | ☐☐☐☐☐☐ |
| DRAGON_ROAR | Grown dragon moments | SFX | one-shot | ☐☐☐☐☐☐ |
| DRAGON_WINGS | Flying, flybys | SFX | one-shot | ☐☐☐☐☐☐ |
| DRAGON_FIRE_SMALL | Sneezes, cube | SFX | one-shot | ☐☐☐☐☐☐ |
| DRAGON_EAT | Feeding | SFX | one-shot | ☐☐☐☐☐☐ |

### M3 — MINIGAME — BARS

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| BARS_CORRECT | Correct tap | UI | one-shot | ☐☐☐☐☐☐ |
| BARS_WRONG | Wrong tap | UI | one-shot | ☐☐☐☐☐☐ |
| BARS_PUNCHLINE | Punchline word | UI | one-shot | ☐☐☐☐☐☐ |
| BARS_TIMER | Run ending | UI | one-shot | ☐☐☐☐☐☐ |

### M4 — MINIGAME — JOLLOF WARS

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| BLENDER | Blending | SFX | loop | ☐☐☐☐☐☐ |
| OIL_SIZZLE_PASTE | Frying the paste | SFX | loop | ☐☐☐☐☐☐ |
| STIR_POT | Stirring | SFX | one-shot | ☐☐☐☐☐☐ |
| SPICE_SHAKE | Seasoning | SFX | one-shot | ☐☐☐☐☐☐ |
| LID_CLANK | Covering pot | SFX | one-shot | ☐☐☐☐☐☐ |
| STEAM_HISS | Steaming | SFX | loop | ☐☐☐☐☐☐ |
| BURNT_CRACKLE | Party rice crust | SFX | one-shot | ☐☐☐☐☐☐ |
| AMB_COOKOFF | Cook-off | AMBIENCE | loop | ☐☐☐☐☐☐ |

### M4 — MINIGAME — GARAGE

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| IMPACT_WRENCH | Installing parts | SFX | one-shot | ☐☐☐☐☐☐ |
| RATCHET | Installing parts | SFX | one-shot | ☐☐☐☐☐☐ |
| CAR_LIFT | Opening garage screen | SFX | one-shot | ☐☐☐☐☐☐ |
| PART_INSTALL | Part installed | SFX | one-shot | ☐☐☐☐☐☐ |
| AMB_GARAGE | Garage | AMBIENCE | loop | ☐☐☐☐☐☐ |

### M4 — MINIGAME — HOOKAH, PICKUP, KBBQ

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| HOOKAH_BUBBLE | Inhale | SFX | loop | ☐☐☐☐☐☐ |
| EXHALE | Blowing a ring | VOICE | one-shot | ☐☐☐☐☐☐ |
| DRIBBLE | Dribbling | SFX | loop set | ☐☐☐☐☐☐ |
| SWISH | Made shot | SFX | one-shot | ☐☐☐☐☐☐ |
| RIM | Miss | SFX | one-shot | ☐☐☐☐☐☐ |
| SHOE_SQUEAK | Crossovers | SFX | one-shot | ☐☐☐☐☐☐ |
| WHISTLE | Game start/end | SFX | one-shot | ☐☐☐☐☐☐ |
| AMB_COURTS | Courts | AMBIENCE | loop | ☐☐☐☐☐☐ |
| GRILL_LAND | A cut placed | SFX | loop set | ☐☐☐☐☐☐ |
| TONGS | Flip / pull | SFX | one-shot | ☐☐☐☐☐☐ |
| SIZZLE_PERFECT | Doneness cue | SFX | loop | ☐☐☐☐☐☐ |
| CHAR_CRACKLE | Char stage | SFX | one-shot | ☐☐☐☐☐☐ |
| SMOKE_HISS | Burnt | SFX | one-shot | ☐☐☐☐☐☐ |
| AMB_KBBQ | KBBQ | AMBIENCE | loop | ☐☐☐☐☐☐ |

### M5 — LOCATIONS & AMBIENCE

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| AMB_OCEAN_FLOOR | Location: Ocean floor (prologue) | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_DOCKS | Location: Docks at night | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_CURB | Location: Suburban night curb | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_RAVE_EXT | Location: Warehouse party exterior | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_RAVE_INT | Location: Warehouse party interior | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_MALL | Location: Outdoor mall at night | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_BOBA | Location: Boba shop | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_FOODCOURT | Location: Food court | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_PETSTORE | Location: Pet store | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_DISPENSARY | Location: Dispensary | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_CAFE_RAIN | Location: Café in the rain | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_CATACOMB | Location: Basement venue | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_BLOODBANK | Location: Clinic | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_ARMORY | Location: Church back room | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_BALLROOM | Location: Haunted ballroom | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_SOIREE | Location: Elite vampire party | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_RESTAURANT | Location: Busy family restaurant | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_AFRICAN_STORE | Location: African grocery store | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_BRUNCH | Location: Daytime brunch spot | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_ONSEN | Location: Japanese spa | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_LITTLE_TOKYO | Location: Lantern plaza at night | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_CONCERT | Location: Amphitheater concert | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_TACO_TRUCK | Location: Taco truck | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_APARTMENT_LAN | Location: Gamer apartment | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_GALLERY | Location: Art gallery opening | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_DINER_ATL | Location: 24-hour waffle diner | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_AIRPORT | Location: Huge airport terminal | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_MALL_ATL | Location: Giant indoor mall | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_PARK_FOUNTAIN | Location: City park fountain | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_FAMILY_HOUSE | Location: Family holiday house | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_SALON | Location: Hair salon | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_RAIN | Location: Rain night | AMBIENCE | loop | ☐☐☐☐☐☐ |
| AMB_HOTSPRING_OUT | Location: Outdoor hot spring at night | AMBIENCE | loop | ☐☐☐☐☐☐ |

### M6 — STORY MOMENTS (OPEN)

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| LADDER_CREAK | Prologue climb | SFX | one-shot | ☐☐☐☐☐☐ |
| LADDER_COLLAPSE | Prologue collapse | SFX | one-shot | ☐☐☐☐☐☐ |
| SENSEI_RUMBLE | Sensei appears | SFX | one-shot | ☐☐☐☐☐☐ |
| EGG_REVEAL | Special item reveals | SFX | one-shot | ☐☐☐☐☐☐ |
| HOLY_CHOIR_COMEDIC | Legendary bread, sacred jokes | SFX | one-shot | ☐☐☐☐☐☐ |
| BLOOD_SPRINKLER | Rave sprinklers | SFX | one-shot | ☐☐☐☐☐☐ |
| CROWD_GASP | Staged entrances | SFX | one-shot | ☐☐☐☐☐☐ |
| CROWD_OOH | Roasts, battles | SFX | one-shot | ☐☐☐☐☐☐ |
| RECORD_SCRATCH | Comedic interruptions | SFX | one-shot | ☐☐☐☐☐☐ |
| MIC_FEEDBACK | Stage moments | SFX | one-shot | ☐☐☐☐☐☐ |
| POWER_CUT | Venue power cut | SFX | one-shot | ☐☐☐☐☐☐ |
| MALL_GATE | Closed mall | SFX | one-shot | ☐☐☐☐☐☐ |
| SIREN_CHIRP | Traffic stops | SFX | one-shot | ☐☐☐☐☐☐ |
| HEAVY_STEPS | A dangerous arrival | SFX | one-shot | ☐☐☐☐☐☐ |
| BAT_SWARM | Vampire moments | SFX | one-shot | ☐☐☐☐☐☐ |
| XCOM_MISS | LAN night joke | SFX | one-shot | ☐☐☐☐☐☐ |
| SUBURB_MORNING | The other life | AMBIENCE | loop | ☐☐☐☐☐☐ |
| ALARM_CLOCK | The other life | SFX | one-shot | ☐☐☐☐☐☐ |
| OFFICE_ROOM | The other life | AMBIENCE | loop | ☐☐☐☐☐☐ |
| POLITE_APPLAUSE | The other life | SFX | one-shot | ☐☐☐☐☐☐ |
| WAKE_SCREAM | Waking up from the other life | VOICE | one-shot | ☐☐☐☐☐☐ |
| STARS_SHIMMER | A quiet sacred moment | SFX | one-shot | ☐☐☐☐☐☐ |
| TRANSFORM_BLOOM | Dragon ↔ human | SFX | one-shot | ☐☐☐☐☐☐ |
| KIDS_HALLOWEEN | Halloween | SFX | one-shot | ☐☐☐☐☐☐ |
| CAR_WINDOWS_DOWN | Drive home after the concert | AMBIENCE | loop | ☐☐☐☐☐☐ |
| NINJA_CROWD | The forty clones | SFX | one-shot | ☐☐☐☐☐☐ |
| LAPTOP_TYPING | Café laptop / music cooking | SFX | loop | ☐☐☐☐☐☐ |
| HOOK_COOKED | A song is finished | MUSIC | one-shot | ☐☐☐☐☐☐ |

### M7 — RESERVED (HQ ONLY — neutral descriptions)

| ID | Plays when | Bus | Type | Status |
| --- | --- | --- | --- | --- |
| SEAL_01 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_02 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_03 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_04 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_05 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_06 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_07 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_08 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_09 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_10 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_11 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_12 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_13 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_14 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_15 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_16 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_17 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |
| SEAL_18 | HQ: see sealed volumes | SFX | see length | ☐☐☐☐☐☐ |

## 6. RESERVED MAPPING (HQ ONLY)

| Code | Sealed reference |
| --- | --- |
| SEAL_01–03 | Vol 4 · ARC-X |
| SEAL_04 | Vol 4 · S01 |
| SEAL_05 | Vol 4 · S02 |
| SEAL_06 | Vol 4 · S05 |
| SEAL_07 | Vol 4 · S06 / D2 |
| SEAL_08 | Vol 4 · S07 |
| SEAL_10 | Vol 4 · S08 |
| SEAL_11 | Vol 4 · M1 |
| SEAL_12 | Vol 5-S · C1 |
| SEAL_09, SEAL_17 | Final Addendum · H7 |
| SEAL_13 | Final Addendum · H4 |
| SEAL_14–16 | Final Addendum · H2 |
| SEAL_18 | Final Addendum · H5 |

## 7. QA CHECKLIST (run per milestone)

Every ID in the milestone plays from its real trigger at least once in a scripted run.
No sound plays before the first tap.
No clicks at loop points (3 cycles each).
Music ducks correctly under dialogue and stingers.
Volume sliders and mute work and persist across reloads.
Nothing clips when the loudest combat sounds overlap.
Every manifest row has a license; every CC-BY row appears in credits.
Tested on one iPhone and one Android at full and half volume.
Reserved sounds are never labeled by content anywhere Ube can see.
