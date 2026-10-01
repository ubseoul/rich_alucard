# COMBAT PRESENTATION — FX LANGUAGE, SIGNATURES & UBE COOK WINDOWS

Role: Combat Presentation Director · Status: **DESIGN ONLY — nothing here is implemented**
Question: **When something crazy happens, does it look and feel crazy?**

Ground rules for everything below:

- **No rebalancing.** Every fix reads fields the rules already emit (`kind`, `target`, `amount`, `heavy`, `fx`, `hits`, `move`, `companion`) or move/enemy ids the scene already has. No HP, damage, PP, timing-of-rules, RNG or outcome changes.
- **F01 / THE PLAY is out of scope.** Its feel lock (OL-023: "danger is felt, never explained", the phone feed, silence) is not touched. It is cited once below as a reference for silence as a presentation tool.
- **Frozen art is never edited.** "Use existing assets" means wiring, sequencing, compositing and timing frozen files. Anything new is an art ticket in §F.
- **Never ask Ube to cook blind.** Every question about an existing character, move or encounter opens with 1–3 sentences of spoiler-safe existing context.
- **Creator source is verbatim.** Wording Ube supplies is recorded exactly (§E0) and never paraphrased in runtime copy. Anything else in this document is a director proposal, marked as such, and Ube can override it.
- **Style bible holds.** Hard edges, integer placement, few authored states, deliberate pauses, restrained shake and hit-stop, no particle soup, blur, bloom or fake VHS, and no generic black-and-red "vampire everything" (`docs/VISUAL_STYLE_BIBLE.md`).

Evidence base: the runtime on `integration/fcpb-convergence-001` (tip 2026-09-30). This branch's `main` only holds the throne slice, so all file paths below are paths on that branch.

| Area | Files studied |
|---|---|
| Combat 2.0 rules + data | `js/engine/combat2.js`, `js/data/btf/combat.js` (18 enemy cards, 9 moves, 6 guns, 8 items), `js/data/btf/people.js` (22 companions, 44 HOES moves), `js/if1/combat2_ext.js` |
| Combat 2.0 presentation | `js/scenes/combat2.js`, `js/scenes/adventure.css` (`.c2-*`), `style.css` (Director overrides) |
| Throne / legacy combat | `game.js` (`bloodBathCanonicalFX`, `projectileVolley`, `vampireBiteCanonicalFX`, `revengeFX`, `octopusBrainFX`, `enemyTurn`, `importerTurn`), `js/systems/combat_presentation.js` |
| Director | `docs/PRESENTATION_DIRECTOR.md`, `js/data/presentation.js` (FX registry in body units), `js/engine/stage.js` |
| Guns | `frag/iron-and-grace/001`: `docs/engineering/F02_IRON_AND_GRACE.md`, `js/frag/F02/catalog.js` (13 guns) |
| Art | `assets/before_the_fame/characters/*` (combat states), `art_ship_014/package_e` (gun case/held art, item art), throne FX packages (`blood_bath_*`, `vampire_bite_*`, `revenge_*`, `octopus_brain_a–d`, `ceo_hit_reaction_sheet`, `briefcase_*`, `blood_missiles_detailed`, `blood_impact*`) |
| Audio | `assets/audio/sfx/combat/*` (53 delivered files), `docs/UL-AUDIO-QA-001_RA_SFX_AUDIT_AND_INTEGRATION_MAP.md`, `js/engine/audio.js` (haptics) |
| Canon | `docs/CURRENT_CANON.md` (Blood Bath = POWER, Bite = SPEED, Revenge = FEAR, Octopus = WEIRDNESS), `docs/RICH_ALUCARD_GAME_BIBLE.md` |

---

## A. CURRENT SPECTACLE DIAGNOSIS

### A0. Verdict

**In the throne room, mostly yes. Everywhere else, no.**

The game has two combat presentation tiers that never met:

1. **The throne tier** (CEO and Importer, `game.js`) is directed. It has a real hit pipeline (`RACombatPresentation.play`: contact → hit-stop → white or silhouette flash → contact burst → recoil → shake → HP drain → recovery) with three severity profiles (normal 55 ms, heavy 85 ms, lethal 105 ms stop). It has authored, multi-layer packages for all four canon moves, a locked CEO hit-reaction sheet, a wound-accumulation display for Revenge, a thrown briefcase with wind-up, and a move SFX on every hit.
2. **The Combat 2.0 tier** (`js/scenes/combat2.js`) is every fight after the throne: all 18 enemy cards, every gun, every item and every HOES companion move. It has **one** hit treatment for everything: a brightness flash on the sprite, a floating number, and a 1.2%-of-width shake when `heavy` is set. Every event waits a fixed 720 ms (telegraphs 900 ms). It plays three sounds in total: `BATTLE_START`, `VICTORY` and `DEFEAT`.

So the moments that *should* be the craziest in the game (Phil's beam after two turns of charging, Sir Bonesworth's "ALL OF HIM" death charge, firing the RPG, Hilt opening the lunchbox) currently look the same as the training dummy's BONK.

### A1. Surface inventory

| Surface | Count | Presentation today |
|---|---|---|
| Throne fights (CEO, Importer) | 2 | Directed: authored packages, severity pipeline, SFX, haptics |
| Combat 2.0 enemy cards | 18 (16 staged in adventures; `hunter` and `groupies` defined but not placed) | One generic flash + number + shake |
| Rich canon moves in Combat 2.0 | 4 | Blood Bath = 5 copies of `blood_orb.png` sliding right. Bite, Revenge and Octopus = a full-screen tint. Octopus menu uses a static `octopus_brain_a.png` |
| Learned / magic moves (One-Inch Petty, Hex, Violet Veil, Séance, Dead Ringer) | 5 | Text in the log + `c2-weird` purple tint |
| Guns (menu combat) | 6 accepted + 7 more in F02 | Scanline overlay (`c2-gunfx`) + generic hit. The frozen **held** gun art is only used as a menu icon |
| Items | 8 | Log text. Frozen item art is only used as a menu icon |
| HOES companion moves | 22 companions × 2 = 44 | **Log text only.** The companion never appears on screen |
| F01 THE PLAY | — | Protected. Off-screen combat told through the phone feed (out of scope) |

### A2. Scorecard (Combat 2.0, where 95% of fights live)

| Criterion | Throne tier | Combat 2.0 | Evidence |
|---|---|---|---|
| Anticipation | Wind-ups (`ceoRecoil.windup` 220 ms), charge orbs, Bite vanish, Revenge freeze | **None on screen.** The telegraph is a text banner. Only Bonesworth has a telegraph pose. The enemy never winds up before a hit | `combat2.js` `setEnemyState` only swaps on `telegraph`/`hurt`/`hit`/`win` |
| Impact frame | Authored contact frames (`blood_bath_contact_01/02`, `vampire_bite_contact`, `revenge_target_crack_01–03`) | Brightness filter on the whole sprite (`c2Flash`: `brightness(2.2) saturate(.2)`): a gray wash, not a pixel impact frame | `adventure.css` `@keyframes c2Flash` |
| Hit-stop | 45–110 ms, per severity | **None** | No hit-stop class in `.c2-*` |
| Shake | Fixed-px keyframes per move (`biteShake`, `revengeShake`, `combatShakeHeavy`) | One shake, in % of width, applied to the **whole scene root, so the HUD, log and menu text shake too** | `.c2-scene.c2-shake` |
| Reaction | Locked CEO normal / heavy / lethal recoil sheet | Only states that exist: Bonesworth (full set), Bruce (strike), Hilt (strike), Kevin (attack/poof). **Rich has no combat states at all** (`rich_standing_right.png` only) | `RACombatData.enemyArt`, `COMBAT_STATES` |
| Sound transient | Move SFX + HIT_LIGHT / HIT_HEAVY / KO on the contact frame | **Silent hits.** 50 of the 53 delivered combat SFX are never played. Haptics (`HIT_HEAVY` 18, `CRIT` 22, `KO` 30) never fire because they ride on those SFX | `combat2.js`, `audio.js` `HAPTIC_IDS` |
| Aftermath | Wounds stay on Rich (Revenge); defeated CEO state; walk-off | HP bar steps. Floating number. Defeated state only where art exists | — |
| Silhouette / readability | Strong: authored poses, black outlines | Enemy poses mostly neutral. **`hunter` renders as Hilt** (`person:'hilt'`) and `groupies` renders as Tasha alone, so a generic grunt reads as a named boss | `combat.js` enemy cards |
| Pixel coherence | Nearest-neighbour, integer px | Filters (`brightness`/`saturate`), %-based shake and a repeating-gradient scanline overlay for guns, which is close to the "fake VHS" the bible bans | `.c2-scene.c2-gunfx::after` |
| Repetition fatigue | One fight, four moves, all authored | **Worst offender.** Multi-hit moves log one event per hit at 720 ms each: KEVIN POKE ×5 = 3.6 s of identical flashes, FLURRY ×3 and HUG ×3 = 2.2 s, Ms. Patrice's SCATTERED SMOTHERED COVERED ×3, Sapporo Shotgun ×2 | `play()` loop, `damageToEnemy` per hit |
| Mobile readability | Tuned on the throne | Shake moves the text the player is reading. Damage numbers have no crit / heavy size step. **No reduced-motion path** (F01 has one; Combat 2.0 doesn't) | — |

### A3. The crazy-moment test (what should feel crazy vs what you get)

| Moment | What the fiction says | What plays today |
|---|---|---|
| Phil BEAM | "PHIL IS CHARGING A BEAM (2 TURNS)…" then 40 damage, the biggest regular hit in the game | Two text banners, then "POWER LEVEL PHIL: BEAM!", a flash on Rich and −40. Phil's frozen **gold-aura charging** states (`charging_day1`, `charging_day3`) exist but are never shown, because their state names don't match the combat roles |
| Bonesworth DEATH CHARGE | Below 50%: SECOND WIND, then "HE IS LOWERING INTO A CHARGE. ALL OF HIM.", 55 damage | The same flash as his 18-damage SHIELD BASH |
| 40 KEVINS | Forty shadow clones, KEVIN POKE ×5, the "real one" bows | Five Kevins at 0.55 scale, five identical flashes at 720 ms each, and the opacity of the crowd drops as HP falls |
| THE RPG | 80 damage + "RICH TAKES 10 SPLASH" | The scanline overlay, −80, then the log text about splash |
| HILT | No telegraph, can't run, Octopus does nothing, 400 HP | Plays exactly like a training dummy that hits harder. The lack of a tell, his signature, is not felt |
| Vampire Bite (Combat 2.0) | Canon SPEED move: full-screen jaws snap | Purple tint + flash + green "+18" |
| Revenge (Combat 2.0) | Canon FEAR move: wounds accumulate, are extracted, the target cracks | A 55% black overlay for 500 ms. The stored amount is a number in the menu |
| HOES: Kaede CEILING DROP, Moonie STOMP, Emberly HEAT WAVE… | A girl drops from the ceiling onto the enemy | "KAEDE: CEILING DROP!" in the log. Kaede never appears |
| Uncle Sunday "WHO IS YOUR FATHER" | A verbal attack that does 24 damage after he "INHALES DEEPLY" | Same flash as a finger wag |

### A4. What is already good (protect it)

- **The throne pipeline and severity profiles** (`RACombatPresentation`). They are the right abstraction and already parameterised. Combat 2.0 just never calls them.
- **The four canon move packages.** POWER (Blood Bath), SPEED (Bite), FEAR (Revenge) and WEIRDNESS (Octopus) are already four distinct visual verbs. This document extends that idea; it doesn't replace it.
- **The locked CEO hit-reaction sheet** (normal / heavy / lethal), which is the model for every enemy reaction.
- **The Director's FX anchoring** (`fxPoint`, body units, `--pd-fx`). Every FX in this plan anchors through it, so FX stay the right size on all three locked phone sizes.
- **Silence as a weapon.** F01's mid-event silence is the best "something is wrong" beat in the project. One signature below (Hilt) borrows the idea for menu combat; F01 itself is not touched.

---

## B. REUSABLE FX FAMILY SYSTEM

### B0. Shared grammar (applies to every family)

**B0.1 The beat chain** (from the style bible: anticipation → travel → contact → impact → reaction → drain → idle), mapped to the events the rules already emit:

| Beat | Rules event that drives it | Budget |
|---|---|---|
| TELL (next-turn intent) | `kind:'telegraph'` | Pose + banner + `TELEGRAPH`, ≤ 900 ms (current) |
| WIND-UP | `kind:'enemy'` (carries `move`) or the player's action | 120–220 ms |
| TRAVEL | — (family-specific; 0 for melee) | 0–430 ms |
| CONTACT + IMPACT FRAME | `kind:'hit'` / `kind:'hurt'` | 1–2 authored frames, 45–75 ms |
| HIT-STOP | same event | Severity tier (B0.2) |
| REACTION + SHAKE | same event | 150 ms |
| AFTERMATH | the next idle | Lingers until the next action (wounds, cracks, status pips) |

**B0.2 Severity tiers.** Reuse the existing `RACombatPresentation.profiles` as is. They are keyed off fields the rules already emit, so nothing is rebalanced:

| Tier | Trigger (existing data) | Hit-stop | Shake (world only) | Flash | Fragments |
|---|---|---|---|---|---|
| LIGHT | any `hit`/`hurt` | 55 ms | 1 art px | white silhouette, 1 frame | 5 |
| HEAVY | `heavy:true` (≥ 20% of max HP) or a CRIT | 85 ms | 2 art px | white silhouette, 2 frames | 9 |
| LETHAL | target HP reaches 0 on this event | 105 ms | 3 art px | full silhouette (`combat-silhouette-flash`) | 13 |
| SIGNATURE | §C moves only | authored per move | authored | authored | authored |

CRIT: the rules write "(CRIT)" into the log text but don't put a flag on the event. Adding `crit:true` to that event payload is a presentation seam, not a rule change. It needs the rules owner's sign-off (§F, ENG-03).

**B0.3 TELL grammar (anticipation).** Every enemy gets the same three-layer tell, layered on top of the existing banner:
1. Pose: the frozen `telegraph` state where one exists, else a **1-art-pixel lean** toward Rich (a whole-pixel offset, not a tween).
2. Sound: `TELEGRAPH` once, at the banner.
3. A family glyph on the banner edge (an 8×8 icon: fist, blade, bullet, word, skull, shield…), so a player who doesn't read the line still learns "something sharp is coming".

The tell is the **only** place an enemy explains itself. Bosses with `noTelegraph` (Hilt) get the anti-tell (§C2).

**B0.4 FINISH grammar (KO / spared / ran).**
- **Win:** LETHAL tier → `KO` → the defeated state holds → **400 ms of nothing** (music keeps going, no log text) → "X IS DOWN." Pause before the text, not after.
- **Spared** (Octopus / food / tame): no KO, no flash. The enemy swaps to its spared state where one exists (§D8), then a soft cue (director default `HEAL`; `REWARD_STINGER` is the alternative, Ube can override).
- **Lose:** Rich takes the LETHAL silhouette; `DEFEAT`. The Blood Bank bill fiction does the rest.

**B0.5 Pixel rules.**
- Shake moves `#pdWorld` (environment + actors) by **whole art pixels** × the Director's integer scale, never by % and never the HUD, log or menu.
- Flash = the existing silhouette classes, never `brightness()` / `saturate()` filters.
- One authored impact sprite per family, 2–3 frames, `steps()` timing, nearest-neighbour. Hard cap: **≤ 13 fragments on screen**, matching the existing lethal profile. This is the anti-particle-soup rule.
- Palettes come from the bible's identity list. Each family owns one accent (B1) and shares near-black outlines and bone highlights.

**B0.6 Mobile rules.**
- Impact must read at 360×740. The impact sprite is ≥ 24 CSS px (the Director's face-size floor) at the smallest locked size.
- Damage numbers get three steps: LIGHT 1×, HEAVY 1.5×, CRIT/LETHAL 2× with a 1-frame bone-white pop. Never animate the text the player is reading.
- **Reduce motion** (follows `prefers-reduced-motion`, same contract as F01): no shake and no travel tweens. Hit-stop and flashes stay, but flashes are limited to 2 frames. Signatures play their impact frame and skip the camera moves.

**B0.7 Fatigue rules.**
- **Multi-hit compression:** consecutive `hit`/`hurt` events from one action play at **90–120 ms cadence**, one small tick per hit (transient only, no number), then one summed number and one shake at the end. The log can still list every hit.
- **First-time-full, repeat-short:** a SIGNATURE plays in full the first time in a fight, and in a ≤ 50% cut after that (keep the wind-up and the impact frame, drop the camera and travel). A tap during any FX skips to the impact frame. It never skips the impact frame itself.
- **Variant rotation:** each family's impact sheet has 2–3 frames. Pick a deterministic variant per hit (`turn + hit index`) so back-to-back hits never use the same frame.
- **Turn-time budget:** a typical turn (one player action + one enemy action) must not get more than **15% longer** than today. Spectacle is paid for by compression elsewhere: telegraph text reads during the enemy wind-up, not after it.

**B0.8 Audio rules.**
- The transient lands **on the impact frame**, not on the event. Files with lead silence get an offset (`GUN_SHOTGUN` 127 ms, `MOVE_OCTOPUS` 204 ms, per UL-AUDIO-QA-001).
- Layering: move/weapon sound at wind-up, `HIT_LIGHT`/`HIT_HEAVY`/`CRIT`/`KO` at contact. Haptics fall out of that for free.
- Never wire `MAGIC_SEANCE` (defective DC step). Fix the DC bias on `GUN_HOLYDRAKE` and `GUN_KRATOS` before featuring them.

### B1. The twelve families

The taxonomy is derived from the 9 Rich moves, 44 HOES moves, ~45 enemy moves, 13 guns and 8 items in the game. It is not a generic RPG list. The two families most specific to this game are **VERBAL** (words are weapons here) and **CAMEO** (half the roster fights by showing up).

| # | Family | Accent (bible palette) | Impact shape | Hit-stop bias | Core sound |
|---|---|---|---|---|---|
| 1 | **BLUNT** | bone / cream | 4-point star, chunky | tier | `HIT_LIGHT` / `HIT_HEAVY` |
| 2 | **EDGE** | bone with a burgundy core | one thin arc, 2 frames | tier − 15 ms (sharp is fast) | `EN_SWORD`, `EN_STAKE` |
| 3 | **IRON** (firearms) | muted gold muzzle, near-black smoke | muzzle burst at the barrel + small puff at the target | tier + 20 ms on the **shot**, not the hit | `GUNWEAVE` + `GUN_*` / `GN_*` |
| 4 | **THROWN** (objects) | the object's own colours | the object itself, spinning in 3–4 rotation frames | tier | per object (`EN_BRIEFCASE`, `EN_LUNCHBOX`, `ITEM_CAN`…) |
| 5 | **BLOOD** (vampire) | Rich red / dried blood | droplet clusters, tendrils | tier + 10 ms | `MOVE_BLOODBATH`, `MOVE_BITE`, `BAT_SWARM` |
| 6 | **OCCULT** | **two sub-palettes:** UNHOLY = nocturnal purple, HOLY = muted gold | UNHOLY: inward-folding glyph; HOLY: a vertical light bar | tier | `MAGIC_HEX` / `VEIL` / `RINGER`; `EN_HOLY` |
| 7 | **VERBAL** (words as weapons) | bone-cream slab, black type | **the words as a physical object** (§B2.7) | 0 on the throw, tier on the landing | `CROWD_OOH`, `RECORD_SCRATCH`, voice |
| 8 | **SWARM** (many bodies, many hits) | inherits the attacker's family | many small impacts, one summed result | per B0.7 compression | the attacker's sound, pitch-stepped per hit |
| 9 | **CONDITION** (buff / debuff / stun / DOT / blind) | green = good for Rich, burgundy = bad | an 8×8 pip above the head that stays | none | `BUFF`, `DEBUFF`, `STUN` |
| 10 | **GUARD** (block / evade / reflect / shield) | muted gold edge | a 3-frame shield edge facing the attacker | **inverted**: hit-stop on the *block*, no reaction | `EN_SHIELD`, `MISS` |
| 11 | **RESTORE** (heal / food / cleanse) | green with a cream sparkle | rising 2-px motes (max 5), and the item sprite | none | `HEAL`, `ITEM_EAT`, `ITEM_SLURP`, `ITEM_CAN` |
| 12 | **STAGE** (environmental) | the environment's own palette | the room reacts: dust from the ceiling, floor blood, a cracked frame | rides the attack's tier | per room (`POWER_CUT`, `MIC_FEEDBACK`…) |

Two wrappers sit across the families. They are delivery modes, not looks:

- **CAMEO**: a companion enters frame, does one pose, leaves. Any family can ride inside it (§B3).
- **SIGNATURE**: a bespoke override for the §C shortlist. It still declares a base family, so when its art isn't ready yet it falls back to that family's treatment.

### B2. Family cards

Each card lists: members (real moves) · anticipation · impact frame · hit-stop/shake · reaction · transient · aftermath · silhouette/readability · fatigue · mobile · existing assets.

**B2.1 BLUNT.**
Members: FINGER WAG, PUNCH, KICK, SHIELD BASH, BONK, SHOVE, STOMP, HUG, TREASURE SLAM, TAIL SWIPE, KEVIN POKE, FLURRY.
- Anticipation: 1-art-px pull back, 120 ms (wind-up frame where one exists: `bruce_strike`, `hilt_strike`, `kevin_attack`).
- Impact: 4-point star, 2 frames.
- Hit-stop / shake: tier / tier.
- Reaction: the target's `hit` state, else a 2-art-px knockback that snaps back.
- Transient: `HIT_LIGHT` / `HIT_HEAVY`, plus `EN_KIAI` for Bruce and `EN_SHOVE` for shoves.
- Aftermath: none. Blunt is clean.
- Readability: the star is the most generic shape on purpose; everything else must be distinguishable from it.
- Fatigue: 3 star variants.
- Mobile: the star is ≥ 24 CSS px.
- Assets: the throne `contact-fragment` bursts (CSS, existing) until the bone-star sheet lands (ART-F1). Frozen blood impact sheets are not recoloured.

**B2.2 EDGE.**
Members: OVERHEAD CLEAVE, HOLY SWING, STAKE JAB, DAGGER, BACKSTAB, KNIFE WORK, SWIPE, CROSSBOW.
- Anticipation: the blade is raised (`bonesworth_telegraph` is the model pose).
- Impact: one diagonal arc across the target, 2 frames, + 1 frame of a burgundy line *in* the body.
- Hit-stop: tier − 15 ms. Sharp hits are quick.
- Reaction: the hit state + a 1-art-px drop.
- Transient: `EN_SWORD` / `EN_STAKE`. CROSSBOW needs a sound (AUD-04).
- Aftermath: none, except BACKSTAB, which flips the arc to come from behind Rich (it's the only move that reads as "from behind").
- Readability: the arc direction says who did it (left→right = Rich's side, right→left = the enemy's).
- Fatigue: 2 arc angles.
- Assets: none frozen (ART-F2).

**B2.3 IRON (firearms).**
Members: all 13 guns, plus enemy guns (hunters' silver crossbows count as EDGE; Enforcer shotguns and Gbenga's Golden Draco are IRON).
- Anticipation is the **GUN WEAVE**: canon says guns "become part of Rich's blood and appear only when needed", so the gun is built out of blood at Rich's hand in 3 steps (droplets → shape → the held sprite), 220 ms, `GUNWEAVE`.
- Impact: muzzle frame at the barrel (where the bullet leaves), then the target puff. A visible bullet only for SNIPER (tracer line, 1 frame) and RPG (projectile, §C5).
- Hit-stop: on the **shot**, +20 ms over tier. That's where gun feel lives. The target reaction follows.
- Shake: recoil is a 2-art-px push on Rich, not a screen shake. Only the RPG shakes the screen.
- Class sub-shapes: POCKET PISTOL = 1 small muzzle; DOUBLE BARREL = 2 bursts side by side + two target puffs (its `hits:2` compressed per B0.7); SMG = 5-tick cadence; HAND CANNON = big muzzle + gold HOLY tint vs undead (`vsUndead`); FLAME = a STAGE-family burn on cover; LAUNCHER = signature.
- Aftermath: one casing sprite drops and stays on the floor until the turn ends (range-day "casing juice" from the F02 doc).
- Transient: `GUN_*` / `GN_*`.
- Readability: the held sprite **is** the readability. Players should see which gun they paid $90,000 for.
- Assets: `E-gun-*-held.png` ×5 (frozen, menu-only today), `blood_orb.png` and `blood_bath_contact_01/02` for the weave.

**B2.4 THROWN (objects).**
Members: BRIEFCASE (CEO), LUNCHBOX (Hilt), MIMOSA TOSS, CRUMB SPRAY, TAPIOCA SHOT, FEATHER DUSTER, garlic knots (as an attack), and AUNTIE'S SLIPPER (IRON by catalogue, THROWN by look).
- Anticipation: the object visibly in hand, 1 frame (the throne CEO's `windup` is the model).
- Travel: an arc, 3–4 rotation frames, 350–430 ms. The throne briefcase flight (430 ms) is the reference.
- Impact: the object stops dead for the hit-stop, **then** the burst. The freeze on the object is the joke.
- Reaction: tier.
- Transient: the object's sound on contact.
- Aftermath: the object lands on the floor and stays until the turn ends (the briefcase on the throne floor; a slipper lying there is funnier than any particle).
- Readability: object silhouette ≥ 12 art px. It has to be recognisable *as that object*.
- Assets: `briefcase_throw_sheet`, `briefcase_impact_sheet`, `ceo_briefcase_throw` (throne). Item art `E-item-*` for food thrown as an attack.

**B2.5 BLOOD (vampire).**
Members: BLOOD BATH, VAMPIRE BITE, REVENGE (the delivery), DRAIN (Duchess), and lifesteal in general. Mazda's JEALOUS FLAME is dragon fire, so it goes to STAGE, not BLOOD.
- This is **Rich's family**. Canon already gives it four authored verbs; Combat 2.0 must inherit them (§D3) rather than use a generic version.
- Rule: BLOOD is the only family allowed to go full-screen, and only in its canon moves. That keeps full-screen special.
- Aftermath: Revenge wounds on Rich stay (canon). Blood Bath floor-rise clears.
- Assets: the complete throne packages.

**B2.6 OCCULT (UNHOLY violet / HOLY gold).**
Members: UNHOLY = HEX, VIOLET VEIL, SÉANCE, DEAD RINGER, HAUNT, VIOLET BOLT, REVERSE HEX, UNPLUG. HOLY = HOLY SWING, JUDGE, HEAL ALLY (cleric), HOLY BABY DRAKE vs undead, garlic.
- Anticipation: UNHOLY folds inward (a 3-frame glyph shrinking onto the caster); HOLY opens outward (a vertical light bar widens).
- Impact: UNHOLY is a glyph stamped on the target; HOLY is a 1-frame vertical bar.
- The split matters. HOLY hurting a vampire should read as **wrong** for Rich: on a HOLY hit on Rich, add a 1-frame desaturate on Rich only. That's the one allowed filter, and only on the vampire.
- Transient: `MAGIC_*` / `EN_HOLY` / `HOLY_CHOIR_COMEDIC` (the comedic choir is too good not to use on the Paladin).
- Aftermath: the glyph stays as a CONDITION pip for the effect's duration.
- Assets: none frozen (ART-F3).

**B2.7 VERBAL (words as weapons). This game's own family.**
Members: "WHO IS YOUR FATHER", ASK ABOUT MARRIAGE, TERRIBLE COVER OF PLAYMAKERS, GOSSIP, CHARM, "SIT DOWN.", "SIT STILL", "I KNEW YOU WHEN", BRUNCH EMPIRE ("pitching a franchise"), HOWL, and **every Octopus ROAST/CHARISMA result**.
- Anticipation: the speaker's mouth opens (or they inhale: Uncle Sunday "IS INHALING DEEPLY").
- Travel: **the actual words leave the speaker's mouth as a bone-cream slab with black type** (the game's own dialogue-box material) and fly at the target. Words are the projectile.
- Impact: the slab hits and **cracks** (2 frames). The target's reaction is shame, not knockback: a 1-art-px shrink + look away (a state where one exists: `uncle_sunday_offended`).
- Transient: `CROWD_OOH` on a landed roast, `RECORD_SCRATCH` on a devastating one (the `damage` result), silence + `MISS` on "IT DID NOT LAND."
- Aftermath: the cracked slab pieces lie on the floor until the next turn.
- Readability: the slab carries ≤ 3 words in the pixel font, at ≥ 8 CSS px. Long lines are cut to the punch word ("FATHER").
- Fatigue: the slab text is the line itself, so it never repeats visually.
- Assets: the dialogue box CSS material (existing), fonts (existing). **This family can ship with zero new art.**

**B2.8 SWARM (many bodies, many hits).**
Members: 40 KEVINS, GROUPIE RUSH, FLURRY, HUG ×3, SCATTERED SMOTHERED COVERED ×3, HEAT WAVE (`damage_all`), Sapporo Shotgun ×2, MAC & CHEESE ×5.
- It's a timing family, not a look. It inherits the attacker's family look and applies B0.7 compression: ticks at 90–120 ms, pitch +1 semitone per tick, one summed number, one shake.
- Crowd rule: for minions, *different* bodies do the hits, round-robin across the 5 minion sprites, so it reads as many attackers, not one sprite flashing.
- Readability: groupies must not render as five Tashas (they would read as a Tasha clone army). This is art, not presentation (ART-E3).

**B2.9 CONDITION.**
Members: accDown, weaken, richWeak, stun, stunRich (PIN), dot, blind, buff, double, sure_hit, intel, gossip.
- One 8×8 pip per active condition, stacked above the head, max 3 visible (`+N` after that). Applied with a 1-frame pop + `BUFF`/`DEBUFF`/`STUN`. Each DOT tick pulses its pip.
- No screen tint. The pip **is** the status. Remove the `c2-weird` full-screen purple tint for status moves.
- Assets: none (ART-F4: about 12 pips, 8×8).

**B2.10 GUARD.**
Members: SHIELD UP, VIOLET VEIL, TANK UP, HOARD, SIDESTEP, PLAY DEAD, REVERSE HEX (reflect), Rich `block`, enemy `evade` ("SWINGS AT NOBODY").
- Inverted rhythm: the attack winds up and travels normally, then hits a 3-frame shield edge. **The hit-stop lands on the block**, and the defender doesn't react. The attacker gets the reaction instead (a 1-art-px bounce back).
- Reflect: the projectile or slab reverses on the same path. That's the payoff for REVERSE HEX.
- Evade: the defender steps 4 art px aside for the impact frame; `MISS`.
- Assets: none (ART-F5). `EN_SHIELD` and `MISS` exist.

**B2.11 RESTORE.**
Members: all heals, food items, cleanse, IV DRIP regen, Holy Baby Drake heal-per-shot, Bite lifesteal (via BLOOD).
- The item sprite appears above Rich at 1:1 (the Pokémon "used X" beat), 1 frame of a hand-to-mouth bob, then up to 5 green motes rise from the HP bar side, then a green number.
- Food matters in this game (enemies "SIT DOWN AND EAT"; jollof cures hangovers). Food heals are louder than potions: `ITEM_EAT` + the item art.
- Assets: `E-item-*` ×6 (frozen, menu-only today), `ITEM_*`, `HEAL`.

**B2.12 STAGE (environmental).**
Members: Blood Bath floor rise, CEILING DROP (Kaede), the RPG and JOLLOF BURNER "destroys / burns cover", SMOKE BOMB, Phil's beam scorch, POWER_CUT-style blackouts, the Bonesworth hallway.
- The room is the reaction. A 1-frame room event that stays as aftermath: dust falling from the top of the frame (throne/crypt), a scorch decal on the floor line, the room going dark for 2 frames.
- Rule: STAGE only rides HEAVY, LETHAL or SIGNATURE moves. If the room reacts to a finger wag, it means nothing.
- Assets: environment layers via `RAEnvironments.surfaceLayers` (existing exact-origin overlay system); new decals are art (ART-F6).

### B3. CAMEO wrapper (HOES)

44 companion moves have no presentation at all, and every companion already has frozen art. CAMEO is the cheapest big win in this document.

- **Enter:** the companion's frozen neutral sprite slides in from the frame edge behind Rich, on the contact line, in **3 stepped positions** (no tween), 150 ms, `COMPANION_CALL`.
- **Act:** their move plays in its family (SLIDE IN = BLUNT, CEILING DROP = STAGE + BLUNT from above, VIOLET BOLT = OCCULT, GOSSIP = VERBAL, IV DRIP = RESTORE, TANK UP = GUARD…). If the companion has an action state, use it (`kaede.ceiling_drop`, `tasha.filming`, `nightshade.casting`, `marisol.*`); otherwise their neutral sprite with a 1-art-px hop.
- **Exit:** 3 stepped positions back out. Total budget ≤ 900 ms including the move.
- Repeat rule: the second use in a fight skips enter/exit (they're already "there" for the moment).
- Readability: the cameo stands on the Director's contact line at the combat profile, so it's the same size as in their adventure scenes.

### B4. Routing table (every attack → family)

| Source | Moves → family |
|---|---|
| Rich canon | BLOOD BATH, VAMPIRE BITE, REVENGE → BLOOD (canon packages) · OCTOPUS BRAIN → WEIRDNESS (canon overlay) + VERBAL for the results |
| Rich learned / magic | ONE-INCH PETTY → BLUNT, **cook window** E9 · HEX, SÉANCE, DEAD RINGER → OCCULT-UNHOLY · VIOLET VEIL → GUARD |
| Guns | all → IRON · RPG → SIGNATURE · AUNTIE'S SLIPPER → SIGNATURE (THROWN look) |
| Items | heals / food → RESTORE · GARLIC KNOTS vs a vampire → THROWN + HOLY · DRAGON KEEF → CAMEO (Mazda) + STAGE fire · MAGGI CRUMBLE → RESTORE |
| Uncle Sunday | FINGER WAG → BLUNT · ASK ABOUT MARRIAGE → VERBAL + CONDITION · "WHO IS YOUR FATHER" → **SIGNATURE** (VERBAL) |
| Bruce Loose | FLURRY → SWARM/BLUNT · KICK → BLUNT (HEAVY, `EN_KIAI`, uses `bruce_strike`) · NOISE → CONDITION (self-buff), `EN_KIAI` without the hit |
| 40 Kevins | KEVIN POKE ×5 → **SIGNATURE** (SWARM) · HONOR STRIKE → BLUNT after a bow tell |
| Power Level Phil | PUNCH → BLUNT · BEAM → **SIGNATURE** |
| Sir Bonesworth | HUNGOVER SWAY → TELL only · OVERHEAD CLEAVE → EDGE · SHIELD BASH → BLUNT · BONE RATTLE → CONDITION + `EN_BONES` · SECOND WIND → RESTORE · DEATH CHARGE → **SIGNATURE** |
| Hilt / Hilt rematch | STAKE JAB → EDGE · LUNCHBOX → **SIGNATURE** (THROWN) · PIN → CONDITION (stunRich), BLUNT contact |
| Paladin | HOLY SWING → EDGE + HOLY · SHIELD UP → GUARD |
| Bard | TERRIBLE COVER OF PLAYMAKERS → VERBAL + CONDITION, `EN_LUTE` · STRUM → BLUNT (sound-led) |
| Cleric | HEAL ALLY → RESTORE (enemy side, HOLY tint) · JUDGE → VERBAL + HOLY |
| Coffe (rogue) | BACKSTAB → EDGE from behind · DAGGER → EDGE · SIP → RESTORE |
| Lil Smack / Smallie | CHEW ATTACK → VERBAL-adjacent "gross" + CONDITION, `EN_CHEW` (**cook window** E10) · CRUMB SPRAY → THROWN (SWARM of crumbs) |
| Smallie's Cousin | DAGGER → EDGE · FEINT → GUARD-inverted (a fake wind-up that doesn't land) |
| Buckhead Vampire | BRUNCH EMPIRE → VERBAL ("pitching a franchise") · MIMOSA TOSS → THROWN |
| Hunter | CROSSBOW → EDGE (projectile bolt) |
| Groupie Rush | HUG ×3 → SWARM/BLUNT (soft) |
| Moonie (full moon) | SWIPE → EDGE (claw arc, 3 lines) · HOWL → VERBAL + CONDITION, `EN_HOWL` |
| Training Dummy | BONK → BLUNT (the baseline; must stay the most boring hit in the game) |
| Throne CEO / Importer | unchanged (already directed) |

---

## C. BESPOKE-SIGNATURE SHORTLIST

Criteria for bespoke: (1) the fiction already promises spectacle (a charge-up, "ALL OF HIM", a boss with no tell), (2) the move is rare enough that it won't fatigue (once or twice a fight), (3) there's frozen art or audio to build on, (4) it's the move a player would describe to a friend.

The shortlist is **six**. Everything else gets its family. The canon four (Blood Bath, Bite, Revenge, Octopus) already *are* signatures; they need to be ported to Combat 2.0 (§D3), not redesigned.

| # | Signature | Why it's bespoke | Base family (fallback) | What exists | Needs |
|---|---|---|---|---|---|
| C1 | **POWER LEVEL PHIL — BEAM** · ✅ creator source | Two full turns of announced charging is the biggest set-up in menu combat. A set-up that long without a payoff is broken | STAGE + BLUNT | `power_level_phil_charging_day1` and `phil_charging_day3` (**gold aura already drawn**), `phil_spent_grounded`, `phil_sitting_plate`, `EN_CHARGE` (loop), `EN_SCREAM` | Beam + screen-crack frames (ART-S1, not requested yet) |
| C2 | **HILT — LUNCHBOX** (+ the anti-tell) | The one boss with `noTelegraph`, `noRun`, and an Octopus that does nothing. He's the fight that tells Rich he isn't safe. His signature is the *absence* of a tell, then a lunchbox | THROWN | `hilt_strike`, `hilt_walk_away`, `EN_LUNCHBOX`, `EN_STAKE` | Lunchbox + contents frames (ART-S2, not requested yet). ✅ contents are creator source |
| C3 | **SIR BONESWORTH — DEATH CHARGE** | Scripted below-50% phase change: SECOND WIND → "HE IS LOWERING INTO A CHARGE. ALL OF HIM." → 55. The only enemy with a full frozen combat sheet | BLUNT HEAVY | Full `telegraph/strike/hit/defeated` sheet (bone pile), `EN_BONES`, `EN_SWORD`, `EN_SHIELD` | ⏳ creator input (E3, context-first). No art until then |
| C4 | **40 KEVINS — KAGE BUNSHIN** | Forty clones is a promise of chaos. "FIND THE REAL ONE" is a built-in replay hook | SWARM | `kagebunshin_kevin_neutral`, `kevin_attack` (with a thrown puff), `kevin_poof` (cloud), `EN_POOF` | ⏳ creator input (E4, context-first). Works on existing art |
| C5 | **GUN WEAVE → THE RPG** (and AUNTIE'S SLIPPER) | Gun Weaving is canon-unique (guns made of Rich's blood). The RPG is the most expensive item in the game ($400,000) and hurts Rich too. Auntie's Slipper is "never cut" in the F02 patch | IRON / THROWN | `E-gun-the_rpg-held`, all 5 held guns, `GUNWEAVE`, `GUN_RPG`, blood weave frames | ✅ RPG line is creator source. Weave (E5) and slipper (E6) open. RPG projectile + blast (ART-S5), slipper art, `GN_05` (AUD-01), none requested yet |
| C6 | **UNCLE SUNDAY — "WHO IS YOUR FATHER"** | The flagship of VERBAL, the family only this game has. It has a telegraph ("INHALING DEEPLY…") and 24 damage from a question | VERBAL | `uncle_sunday_offended`, `_melted`, `_fishing`, dialogue-box material, `CROWD_OOH` | Nothing required. Ube's line and voice (E8) |

**Explicitly not bespoke** (family treatment is enough): Paladin, Bard, Cleric, Coffe, Buckhead, Hunter, Groupies, Moonie, Lil Smack's CRUMB SPRAY, all 44 HOES moves (CAMEO is their signature), all items. One-Inch Petty and Lil Smack's CHEW get a cook window but no bespoke budget until Ube says they earn one.

### C1. POWER LEVEL PHIL — BEAM

**Creator source (Ube, COOK RETURN 001):** a Kamehameha-inspired energy attack, **distinctly purple** and **visually huge**. At peak impact it temporarily causes **SCREEN CRACKS**. The cracking is spectacle and presentation, not permanent UI damage.

Director treatment (proposals within that source):
- **Turn N (charge 1):** swap to `charging_day1` (the aura is in the frozen art). Start `EN_CHARGE` looping, quiet. Banner: "PHIL IS CHARGING A BEAM (2 TURNS)…".
- **Turn N+1 (charge 2):** swap to `charging_day3`. Loop louder. STAGE: 1 frame of dust drop every 600 ms. The music doesn't duck yet.
- **Turn N+2 (BEAM):**
  1. The music **ducks** for the first time in any fight → `EN_SCREAM`.
  2. Release: the frozen charge aura is gold, and the **beam is purple**. The colour change at release is the read: the charge was a warning, and the purple is the thing itself. It's an original beam shape *inspired by* the reference, not a copy of any existing show's frames.
  3. "Visually huge": the beam is the only effect in menu combat allowed to be **wider than a body** and to leave the world viewport. It spans from Phil to past the frame edge behind Rich.
  4. **Peak impact → SCREEN CRACKS:** a crack overlay spreads across the whole screen, the HUD and menu bands included, as if the handheld's glass took the hit. LETHAL-grade hit-stop (105 ms), 3-art-px world shake.
  5. **The cracks clear before control returns.** They're held about 500 ms, then gone (a snap, not a fade). They never sit over an active button and are never stored as state. Reduce motion keeps them, static and shorter.
  6. Crack colour: bone-white fracture lines with a purple bleed. It deliberately avoids Rich red, which belongs to Revenge's own crack (`revenge_target_crack_*`, the canon FEAR move). That asset is **not** reused here.
  7. Aftermath: a purple-black STAGE scorch on the floor line that stays for the rest of the fight. The screen cracks do not stay.
- **After:** Phil swaps to `spent_grounded` for his next turn (a free visual of the cost). Spared via "GET FOOD WHILE HE CHARGES" → `sitting_plate`.
- **Repeat:** the second BEAM in a fight is a ≤ 50% cut (no duck, no scream). The screen cracks **still happen**, because they're the move's identity, but at 50% coverage.
- **Palette note:** OCCULT-UNHOLY also uses nocturnal purple. Phil's beam is told apart by shape and scale (a huge horizontal column vs a small glyph). It's the only purple thing in the game that is huge.
- Budget: about +1.3 s on the beam turn only. Charge turns cost 0 extra.

### C2. HILT — LUNCHBOX, and the anti-tell

- **Anti-tell:** every enemy turn has a telegraph banner except Hilt's. The empty slot is filled with **nothing**: no banner, the ambient bed drops 6 dB for his whole turn, and the log stays empty for 300 ms longer than usual before he acts. Players learn "silence = Hilt" (the F01 silence idea, applied to menu combat only).
- **STAKE JAB:** EDGE, fast, `hilt_strike`.
- **LUNCHBOX:** **Creator source:** inside the lunchbox are **gabagool, provolone, vinegar peppers, sandwich**. The mundane specificity is the point and is preserved exactly; nothing is added, swapped or made fancy.
  - Director treatment: Hilt produces an ordinary lunchbox. Travel 430 ms (the throne briefcase timing). The box **stops dead** on Rich for the hit-stop, then snaps open and the four contents are **individually readable** for one beat: four small, plain sprites, nothing glowing. `EN_LUNCHBOX`.
  - Log copy names them in Ube's order, verbatim: GABAGOOL. PROVOLONE. VINEGAR PEPPERS. SANDWICH. No adjectives.
  - Aftermath: the open box and its contents stay on the floor until the turn ends (THROWN family rule).
  - Not decided: whether the box opens before or after contact. Director default: after, so the hit lands as a box and the reveal is the aftermath.
- **PIN:** BLUNT contact + a CONDITION pip on Rich. On Rich's lost turn, Rich's sprite doesn't move at all and the menu greys out for one beat.
- **End (first fight, 400 HP, can't run):** whatever the outcome, Hilt leaves on `hilt_walk_away`. He doesn't hold a defeated or victory pose. He just leaves.
- Rematch: same language, plus his telegraphs now exist (`hilt_rematch` has them). The tell coming back is itself a story beat.

### C3. SIR BONESWORTH — DEATH CHARGE

**Status: awaiting creator input (E3).** Ube has said he doesn't know this character well enough yet, so nothing below is creator intent. Existing context is in §E (E3).

Existing, non-negotiable (rules + frozen art): the below-50% phase change (SECOND WIND → "HE IS LOWERING INTO A CHARGE. ALL OF HIM." → DEATH CHARGE, 55), and the full frozen `telegraph / strike / hit / defeated` sheet.

Director placeholder (BLUNT HEAVY, existing art only; all of it replaceable by Ube's answer):
- SECOND WIND = RESTORE + `EN_BONES`.
- Tell = the `telegraph` pose + a 4-art-px step back.
- Charge = the `strike` pose crossing the gap in 3 stepped positions, LETHAL-grade hit-stop.
- Defeat = the frozen bone pile + `KO`.
- No invented gags (loose bones, reassembly) until creator input.

### C4. 40 KEVINS

- **Staging:** the five minion sprites on the far depth band (existing) + the "real" Kevin in front.
- **KEVIN POKE ×5:** SWARM compression. Each poke comes from a *different* Kevin (round-robin), using the `kevin_attack` pose for 1 frame, at a 100 ms cadence. That's 0.5 s instead of 3.6 s.
- **Losing Kevins:** when the visible-minion count drops (existing HUD logic), the leaving Kevin plays `kevin_poof` + `EN_POOF` instead of fading opacity.
- **HONOR STRIKE tell:** "THE REAL KEVIN IS BOWING…". All five minions bow together.
- **Canon constraint:** the adventure's receipt says *"forty kevins. one real one. you never found out which."* So the presentation must **never visually confirm which Kevin is real**. No persistent tell, no highlight. That rules out the earlier "late bow" seed.
- **Octopus "FIND THE REAL ONE":** the result text ("THE REAL ONE BLINKED.") is the only confirmation, and it stays text.
- **Status: awaiting creator input (E4)** for anything beyond this family treatment.

### C5. GUN WEAVE → THE RPG / AUNTIE'S SLIPPER

- **Weave (all guns):** E5 is still open; this is a placeholder. The IRON anticipation, 220 ms. Blood droplets gather at Rich's hand (`blood_orb`), then a contact-blob frame (`blood_bath_contact_01`), then the held gun sprite.
- **RPG:** **Creator source, Rich's firing line: "BACK TO SENDER"** (exact wording). Director treatment: weave → Rich shoulders it → **"BACK TO SENDER"** in Rich's speech bubble on the frame before the shot (it's his first spoken combat line, so it gets the bubble, not the log) → (the held sprite, rotated by whole 90° steps only) → the projectile travels with 2 smoke-puff aftermath frames → the **only full-screen flash allowed outside BLOOD**: one new bone-white blast frame (ART-S5). Until it exists, use a 2-frame world silhouette flash. Don't borrow the red Blood Bath fullscreen, which belongs to BLOOD → 3-art-px shake → STAGE debris → "RICH TAKES 10 SPLASH": **Rich gets hit by his own blast** (a LIGHT hurt on Rich, 200 ms later). The self-hit is the joke.
- **Auntie's Slipper:** THROWN look. Woven, then thrown, spinning (E6 is still open; this is a placeholder). `GN_05` (slipper whap + crowd "OOOH"). Fear effect: the enemy's sprite **shrinks 1 art px and flinches before the slipper lands** (the memory hits first).

### C6. UNCLE SUNDAY — "WHO IS YOUR FATHER"

- **Tell:** "UNCLE SUNDAY IS INHALING DEEPLY…". His sprite rises 1 art px per 300 ms (he's filling with air).
- **Release:** a VERBAL slab per word, fired in sequence (WHO / IS / YOUR / FATHER), each slab bigger than the last, the last at HEAVY size. Hit-stop on FATHER only.
- **Reaction:** Rich doesn't get knocked back. He **looks down** for 2 frames. That needs a Rich state, so in the meantime use a 1-art-px drop.
- **Octopus results:** CALL HIM UNCLE → `uncle_sunday_melted`. TEACH YOU FISHING → `uncle_sunday_fishing`. "WHY ARE YOU UNEMPLOYED" → `uncle_sunday_offended` (enrage).

---

## D. PRESENTATION FIXES USING EXISTING ASSETS (no new art)

Ordered by spectacle gained per hour of work. All of these are scene / CSS / audio wiring in `js/scenes/combat2.js`, `js/scenes/adventure.css` and a small mapping table. None of them touch `js/engine/combat2.js` rules.

| # | Fix | Uses | Spectacle gain |
|---|---|---|---|
| D1 | **Route every Combat 2.0 `hit`/`hurt` through `RACombatPresentation.play`** with severity from existing fields (`heavy` → HEAVY; target HP at 0 → LETHAL). Hit-stop, silhouette flash, contact fragments, recoil and HIT/KO sounds arrive in all 18 fights at once | `js/systems/combat_presentation.js` (existing) | ★★★★★ |
| D2 | **Wire the delivered combat SFX** (table D2a below). This also turns haptics on (`HIT_HEAVY`, `CRIT`, `KO`) | `assets/audio/sfx/combat/*` | ★★★★★ |
| D3 | **Port Rich's canon packages into Combat 2.0.** Blood Bath: floor-rise ×3, engulf ×2, foreground, contact ×2, fullscreen impact, detailed missiles (`projectileVolley`). Bite: jaws upper/lower/snap, contact, lifesteal drops/orb, afterimages. Revenge: stored wounds ×4 **shown on Rich as he takes damage** (canon), extraction ×4, mass ×3, target crack ×3, fullscreen impact. Octopus: animate `octopus_brain_a→d` instead of the static `a` | throne FX packages (all frozen) | ★★★★★ |
| D4 | **Multi-hit compression** (B0.7) for `hits>1` moves, guns and `multi` / `damage_all` companion moves | — | ★★★★ (fatigue) |
| D5 | **Shake the world, not the words.** Move the shake from `.c2-scene` to the Director world element, in whole art pixels | Director `#pdWorld` | ★★★ (mobile) |
| D6 | Replace `c2Flash` brightness filters with the existing `combat-white-flash` / `combat-silhouette-flash` | `style.css` (existing classes) | ★★★ (coherence) |
| D7 | **TELL upgrade:** `TELEGRAPH` sound + frozen tell pose + 1-art-px lean where there's no pose | `bonesworth_telegraph`, aliases in D8 | ★★★ |
| D8 | **State alias map:** use frozen states that the role names miss. Phil `charging_day1`/`charging_day3` → charge turns 1/2; `spent_grounded` → after the beam / defeated; `sitting_plate` → spared. Uncle `offended` → enrage; `melted` / `fishing` → spared. Hilt `walk_away` → fight end. Bruce `bow` → recruit-spared ("BECOME HIS STUDENT"). Lil Smack `eating` → spared by food. Tasha `filming` → companion FILMING cameo | existing frozen states | ★★★★ |
| D9 | **Show the gun.** The held sprite at Rich's hand anchor (`fxPoint('rich', …)`), woven from `blood_orb` + `blood_bath_contact_01`, `GUNWEAVE` then `GUN_*`. **Delete the scanline overlay** (`c2-gunfx`) | `E-gun-*-held.png` ×5 | ★★★★ |
| D10 | **Show the item** above Rich + `ITEM_CAN` / `ITEM_EAT` / `ITEM_SLURP` + green motes | `E-item-*.png` ×6 | ★★★ |
| D11 | **CAMEO for HOES** with frozen neutral/action states + `COMPANION_CALL` (§B3) | all companion masters | ★★★★★ (44 moves go from invisible to visible) |
| D12 | **FINISH beat** (B0.4): LETHAL → `KO` → defeated hold → 400 ms of nothing → text | `KO`, defeated states | ★★★ |
| D13 | **Number sizing:** LIGHT / HEAVY / CRIT steps. A CRIT plays `CRIT` (needs the `crit:true` seam, ENG-03; until then, LIGHT/HEAVY only) | fonts | ★★ |
| D14 | **Reduce motion** parity with F01 (B0.6) | — | accessibility |
| D15 | **Audio hygiene:** offset lead silence (`GUN_SHOTGUN` 127 ms, `MOVE_OCTOPUS` 204 ms); don't feature `GUN_HOLYDRAKE` / `GUN_KRATOS` until their DC bias is fixed; Séance plays `MAGIC_HEX` pitched down until `MAGIC_SEANCE` is re-rendered | UL-AUDIO-QA-001 | ★★ |
| D16 | **Pacing by event kind** instead of a flat 720 ms: impact events take what their family needs; `info` lines take 450 ms; telegraph text reads *during* the wind-up. This pays for D1–D12 inside the 15% budget | — | ★★★ (keeps fights snappy) |
| D17 | Remove the full-screen `c2-weird` tint for status / magic moves (CONDITION pips replace it once ART-F4 lands). Until then, limit the tint to the world viewport and 2 frames | — | ★★ |

**D2a. SFX wiring map (all delivered, all unwired in Combat 2.0)**

| Trigger | SFX |
|---|---|
| Any telegraph | `TELEGRAPH` |
| Contact, by tier | `HIT_LIGHT`, `HIT_HEAVY`, `CRIT`, `KO` · miss: `MISS` |
| Rich moves | `MOVE_BLOODBATH`, `MOVE_BITE`, `MOVE_REVENGE`, `MOVE_OCTOPUS`, `MOVE_ONEINCH` · Hex/Veil/Ringer: `MAGIC_HEX`, `MAGIC_VEIL`, `MAGIC_RINGER` |
| Guns | `GUNWEAVE` (every weave) + `GUN_LILOGA`, `GUN_SHOTGUN`, `GUN_SNIPER`, `GUN_HOLYDRAKE`, `GUN_RPG`, `GUN_KRATOS` (dev) |
| Items / HOES | `ITEM_CAN` (Sapporo), `ITEM_EAT` (food), `ITEM_SLURP` (boba) · `COMPANION_CALL` · `HEAL`, `BUFF`, `DEBUFF`, `STUN` |
| Enemies | Bonesworth `EN_BONES`/`EN_SWORD`/`EN_SHIELD` · Paladin `EN_HOLY`/`EN_SWORD`/`EN_SHIELD` (+ `HOLY_CHOIR_COMEDIC` on HOLY SWING) · Hilt `EN_STAKE`/`EN_LUNCHBOX` · Phil `EN_CHARGE` (loop)/`EN_SCREAM` · Bruce `EN_KIAI` · Kevins `EN_POOF` · Bard `EN_LUTE` · Lil Smack/Smallie `EN_CHEW` · Moonie `EN_HOWL` · Groupies `CROWD_GASP` · roasts `CROWD_OOH` |
| Vampire moments | `BAT_SWARM` (Bite, Duchess DRAIN) |

**Gaps** (no sound delivered): crossbow (Hunter), Coffe's dagger/backstab (can borrow `EN_STAKE`), Buckhead's mimosa (can borrow `ITEM_CAN`), Phil's beam release (`EN_SCREAM` carries it for now), `GN_01–GN_06` (F02, SOURCE_REQUIRED).

---

## E. UBE COOK WINDOWS

**Law:** never ask Ube to cook blind. Every window opens with **Context**: 1–3 sentences of spoiler-safe existing material (adventure text, rules, frozen art) so he isn't asked to invent canon about something he hasn't been shown. Seeds are unfinished and optional. Constraint for every window: drawable in the 80×96 / contact-(40,88) grammar with ≤ 3 new frames, and it must read at 360 px wide.

### E0. Creator source log

| Return | Window | Creator source (verbatim intent) | Recorded in |
|---|---|---|---|
| COOK RETURN 001 | E1 Phil | Kamehameha-inspired energy attack, distinctly purple, visually huge. At peak impact, temporary SCREEN CRACKS (spectacle, not permanent UI damage) | §C1 |
| COOK RETURN 001 | E2 Hilt | Inside the lunchbox: gabagool, provolone, vinegar peppers, sandwich. Preserve the mundane specificity | §C2 |
| COOK RETURN 001 | E7 RPG | Rich's firing line: "BACK TO SENDER" (exact wording) | §C5 |
| COOK RETURN 001 | E3 Bonesworth, E4 Kevins | Ube doesn't know these well enough. Context first; don't invent creator intent | §C3, §C4, E3, E4 |

### E-status

| Window | Status |
|---|---|
| E1 Phil BEAM | ✅ RESOLVED (COOK RETURN 001) |
| E2 Hilt LUNCHBOX | ✅ RESOLVED: contents. Open/close timing is a director default |
| E7 RPG | ✅ RESOLVED: line. The aftermath gag is a director default (no extra question) |
| E3 Bonesworth, E5 Gun Weave, E11 Rich's combat voice | **NEXT** (top 3, below) |
| E4 Kevins, E6 Slipper, E8 Uncle Sunday, E9 Petty, E10 Nemesis | OPEN, queued |

### NEXT — the three highest-value open windows

**E3. SIR BONESWORTH — "ALL OF HIM."**
- **Context:** Sir Bonesworth is a hungover skeleton knight in rusted armour. Rich finds him groaning under the confetti in his own throne room the morning after his first castle party ("…who threw this. i need to know who threw this."). The fight is that hangover: he sways, cleaves and rattles his bones. Below half HP he gets a second wind, and the game warns "HE IS LOWERING INTO A CHARGE. ALL OF HIM." before a 55-damage charge, his biggest hit. Afterwards he either hands Rich his sword for the Armory wall or moves into the crypt. Frozen art: sword raised, low lunge, recoil, and a pile of bones.
- **Question:** when a hungover skeleton commits *all of himself* to one charge, what happens in those three frames that makes someone replay it?
- **Seeds (optional):** ① the skull arrives a frame before the body. ② the charge is perfect, and the hangover catches up a frame after impact. ③ something from last night's party comes with him.
- **Need back:** one sentence for the charge; frame 1 / 2 / 3; or "keep it plain".

**E5. THE GUN WEAVE — every gun in menu combat.**
- **Context:** in canon, Rich doesn't carry guns. Guns "become part of Rich's blood and appear only when needed" (Gun Weaving), bought at THE ARMORY from Deacon Brass behind a church in South LA. Rich has no default weapon identity; guns are tools he chooses. Five guns have frozen held art today (Lil Oga, Sapporo Shotgun, Chopstick Sniper, Holy Baby Drake, The RPG). The weave plays before **every** gun shot, so it's the most-repeated signature in the game, and it now leads into "BACK TO SENDER" for the RPG.
- **Question:** what does a gun look like coming *out of Rich's blood*? Does it go back in after the shot?
- **Seeds (optional):** ① blood builds it bottom-up, like a 3D printer. ② for one frame it's the wrong gun, then it corrects itself. ③ Rich never looks at it; it's simply in his hand.
- **Need back:** the weave in one sentence; returns to blood yes/no.

**E11. RICH'S COMBAT VOICE — now that he says "BACK TO SENDER".**
- **Context:** in the throne fight, Rich's only voice is the music-synced lyric bubble (he raps or mutters along to the track). In Combat 2.0 he says nothing; every line is narration in the log. Ube's RPG line "BACK TO SENDER" is his **first spoken combat line**, and it sets a precedent. (F01 / THE PLAY has its own locked rule for Rich's voice and is not affected.)
- **Question:** is "BACK TO SENDER" a one-off for the RPG, or does Rich get a spoken line on other big moments?
- **Seeds (optional):** ① one line per signature only (RPG, plus whatever Ube writes for the others). ② a line on lethal blows, from a tiny pool Ube writes. ③ the RPG stays the only time he speaks, which makes it land harder.
- **Need back:** the rule (one-off, per signature, or on lethal blows); if it's a pool, Ube writes it.

### Queued (context-first, ask later)

**E4. 40 KEVINS.**
- **Context:** at the grave (or as a single forty-ticket order at Slurp), Rich finds the same guy forty times (same hoodie, same haircut, all named Kevin), all bowing to each other: a ninja's shadow clones. Kaede, who was tailing one of them, drops from a ceiling vent ("this is not my first forty kevins"). The adventure ends on *"one real one. you never found out which."*
- **Question:** what's the one image of forty Kevins that people remember, given that the game must never reveal the real one?
- Seeds withheld until Ube has the context.

**E6. AUNTIE'S SLIPPER.**
- **Context:** in the OPEN guns patch (Iron & Grace), AUNTIE'S SLIPPER is one of the 13 guns: "Enemies who grew up with it lose a turn to fear." Its sound is specified as a slipper whap plus a crowd "OOOH". It's marked never-cut. No art exists. A frozen character called Auntie exists, but nothing establishes that it's her slipper.
- **Question:** what kind of slipper is it, and does it come back?

**E8. UNCLE SUNDAY — "WHO IS YOUR FATHER."**
- **Context:** a pot-bellied man in slides and a buba, met at a pet store holding the last loaf of agege bread. The fight opens "UNCLE SUNDAY WANTS TO KNOW WHO YOUR FATHER IS." He inhales deeply before the question, which does 24 damage. Calling him "Uncle" melts him; asking to learn fishing ends the fight.
- **Question:** is the damage the words, or the silence after them?

**E9. ONE-INCH PETTY.**
- **Context:** Bruce Loose is a kung-fu legend Rich fights at the food court. He makes a noise before his kick, and Rich can roast it ("THAT NOISE AIN'T A MOVE"). Becoming his student teaches Rich ONE-INCH PETTY, his first learned move.
- **Question:** what makes it *petty*?

**E10. THE NEMESIS CHEWS.**
- **Context:** Lil Smack is listed in the cast as Rich's nemesis. He fights by chewing with his mouth open (CHEW ATTACK, CRUMB SPRAY), and the roast is "WE CAN SEE YOUR FOOD." A looping chew sound is already delivered.
- **Question:** how gross is allowed, and how long should the chewing play?

## F. IMPLEMENTATION / ART / AUDIO DEPENDENCY BOARD

**Lanes:** ENG = presentation engineering (scene/CSS/audio wiring only) · ART = art department tickets (new frozen frames through the normal ship process) · AUD = sound finder / re-render · UBE = creative decision · QA = Director census and locks.

### F1. Phase 0: ships with no new art (unblocked today)

| ID | Item | Lane | Depends on | Size |
|---|---|---|---|---|
| ENG-01 | Route Combat 2.0 hits through `RACombatPresentation` (D1) | ENG | — | S |
| ENG-02 | SFX wiring table (D2) + offsets (D15) | ENG | — | S |
| ENG-03 | `crit:true` on the existing hit event payload (no rule change) | ENG | **rules owner sign-off** | XS |
| ENG-04 | Port the canon packages to Combat 2.0 (D3) | ENG | Director FX registry entries for the new elements | M |
| ENG-05 | Multi-hit compression + event-kind pacing (D4, D16) | ENG | — | S |
| ENG-06 | World-only shake in art px; silhouette flashes (D5, D6) | ENG | — | S |
| ENG-07 | TELL upgrade + state alias map (D7, D8) | ENG | — | S |
| ENG-08 | Gun held sprite + weave; delete the scanline overlay (D9) | ENG | — | S |
| ENG-09 | Item pop (D10) | ENG | — | XS |
| ENG-10 | CAMEO wrapper for HOES (D11, §B3) | ENG | Director: a cameo slot on the combat stage | M |
| ENG-11 | FINISH beat (D12), number steps (D13) | ENG | ENG-03 for crits | XS |
| ENG-12 | Reduce-motion path (D14) | ENG | — | S |
| ENG-13 | VERBAL slabs (§B2.7). The family needs no new art | ENG | UBE line edits for slab text cuts | S |
| QA-01 | Census `--fx` on all 18 fights at 360 / 390 / 430; FX centres inside the world; turn-time ≤ +15% vs baseline | QA | ENG-01…13 | S |

### F2. Phase 1: family art (unlocks the full system)

**NOT REQUESTED.** Per Ube COOK RETURN 001, no new art is being requested yet. F2 and F3 are a dependency map only; nothing below has been filed with the art department.

| ID | Item | Lane | Notes |
|---|---|---|---|
| **ART-R1** | **Rich standing combat states: CAST, HIT, STRIKE, VICTORY (80×96)** | ART | **The biggest single dependency in this plan.** Rich has no combat poses outside the throne. Every family reaction on Rich and C6's "looks down" wait on it |
| ART-F1 | BLUNT impact sheet, 3 variants × 2 frames, bone/cream | ART | — |
| ART-F2 | EDGE arc sheet, 2 angles × 2 frames | ART | — |
| ART-F3 | OCCULT glyph (UNHOLY) + light bar (HOLY), 3 frames each | ART | — |
| ART-F4 | CONDITION pips, ~12 × 8×8 | ART | — |
| ART-F5 | GUARD shield edge, 3 frames | ART | — |
| ART-F6 | STAGE decals: scorch, dust drop, debris (exact-origin overlay grammar) | ART | per environment family |
| ART-F7 | IRON muzzle sheet per class (pistol, shotgun, SMG, cannon, sniper tracer) + casing | ART | — |
| ART-E1 | Enemy combat states for neutral-only enemies: Paladin, Bard, Cleric, Buckhead (strike + hit minimum) | ART | — |
| ART-E2 | **Hunter needs its own identity.** It currently renders as Hilt, the boss | ART | readability defect, not polish |
| ART-E3 | **Groupies need a crowd plate**, not a single Tasha | ART | readability defect |
| ART-E4 | Smallie + Smallie's Cousin have no frozen art (placeholder actors) | ART | — |
| ART-G1 | Held art for the 7 new F02 guns | ART | F02 `ART_SOURCE_REQUIRED` already filed |
| AUD-01 | `GN_01–GN_06` (SMG, drum mag, flame loop, dragon rifle, slipper + OOOH, range clack) | AUD | F02 `SOURCE_REQUIRED` |
| AUD-02 | `MAGIC_SEANCE` re-render (defective DC step) | AUD | — |
| AUD-03 | DC-bias fix: `GUN_HOLYDRAKE`, `GUN_KRATOS`, `MAGIC_RINGER` | AUD | — |
| AUD-04 | Crossbow fire + bolt impact (Hunter) | AUD | — |

### F3. Phase 2: signatures (each blocked on its cook window)

| ID | Signature | Blocked on | Then needs | Size |
|---|---|---|---|---|
| SIG-1 | Phil BEAM | ✅ creator source received | ART-S1, not requested: ≤ 3 purple beam frames, a full-screen crack overlay (2 frames, bone-white + purple), a scorch decal. ENG: music duck, loop control, crack overlay above the UI bands, cleared before input | M |
| SIG-2 | Hilt LUNCHBOX + anti-tell | ✅ creator source received | ART-S2, not requested: lunchbox in hand / flight / open + 4 content sprites (gabagool, provolone, vinegar peppers, sandwich) | S |
| SIG-3 | Bonesworth DEATH CHARGE | **UBE E3 (NEXT, context-first)** | decided by the answer | S |
| SIG-4 | 40 Kevins | **UBE E4 (queued, context-first)** | works on existing art; must never reveal the real Kevin | S |
| SIG-5 | Gun Weave / RPG / Slipper | ✅ E7 line received · **E5 NEXT** · E6 queued | ART-S5 (RPG projectile + blast frame), slipper art, AUD-01 (`GN_05`) | M |
| SIG-6 | Uncle Sunday | **UBE E8** | nothing; ENG-13 VERBAL slabs | XS |
| — | Rich's combat voice (**E11 NEXT**), One-Inch Petty, the Nemesis chew | **UBE E11, E9, E10** | budget decided by Ube's answer | — |

### F4. Ordering and guardrails

1. **Phase 0 first, in this order:** ENG-01 → ENG-02 → ENG-05 → ENG-03 → the rest. After ENG-01 + 02 + 05 alone, every one of the 18 fights gains hit-stop, sound, haptics and readable multi-hits, with no art.
2. **Cook windows can run in parallel with Phase 0.** Signatures aren't drawn before Ube answers. Creator source is verbatim (§E0).
3. **ART-R1 (Rich combat states) is the top dependency once art requests open.** It's on the critical path for half of Phase 1. Not requested yet, per COOK RETURN 001.
4. Guardrails, checked on every change:
   - No edits to `js/engine/combat2.js` rules or `js/data/btf/combat.js` numbers (ENG-03 is a payload field, signed off separately).
   - F01 / THE PLAY files are untouched (`js/frag/F01/**`, `assets/f01/**`).
   - Frozen PNGs are never modified. New frames go through an Art Ship.
   - Director locks: FX are world-attached through `fxPoint` / the FX registry. Stage contracts, shots and contact lines don't change, so the presentation-lock input hashes stay valid. If a change would move a contract, it's a separate, judged change.
   - Turn-time budget ≤ +15% (QA-01). Fatigue rules (B0.7) are acceptance criteria, not polish.
