# Rich Alucard — Current Canon

> **READ THIS BEFORE MODIFYING THE GAME.**
>
> Ube is the creative director. Do not silently resolve creative ambiguity. Preserve LOCKED decisions, distinguish PROPOSED ideas from canon, and flag conflicts/questions for Ube.

## Core production rule

**Approved environment artwork is immutable source art.** Environmental edits must be surgical/composited unless Ube explicitly approves regeneration. Do not recreate or reinterpret an approved room to change one prop.

## Fun Test

Rich Alucard must still be worth making if nobody watches the Shorts.

Every major system should:
1. make the game more fun to play,
2. make Rich's world more expressive,
3. ideally create something worth screen-recording,
4. and only then help the music.

Marketing value alone is not sufficient justification.

## LOCKED

- Player character: **Rich Alucard**. Rich is actually the boss/final boss; adventurers sometimes invade his castle.
- Rich is Black, wears an all-black fit, green earrings, shades and fangs. No cape. No weapon. Use approved Rich character art; do not redesign him.
- Rich is straightforward, self-interested, meta, tries different things, and does not overthink things he does not care about.
- Rich never turns men into vampires. He may bite male enemies without turning them.
- Rich's unexplained weakness is fish.
- Rich is usually partying; he is in the throne room when hungover/recovering.
- Throne room uses an elevated throne. Rich remains seated/lounging during normal combat except approved brief attack/victory states.
- First enemy: **CEO Zombie Prince**, human-looking zombie in a corporate suit with crown and briefcase.
- CEO has an adult female Assistant/Healer.
- Current moves: **BLOOD BATH, OCTOPUS BRAIN, VAMPIRE BITE, REVENGE**.
- REVENGE: actual HP damage Rich receives accumulates once; Revenge returns exactly the stored amount; storage then resets to zero. No minimum fallback.
- Vampire Bite: fast red/black teleport/lunge bite, lifesteal/heal, return to throne.
- Approved Vampire Bite FX package is canonical for presentation: screen-space jaws/snap, runtime contact burst, lifesteal particles and brief afterimages. Damage/healing mechanics remain unchanged.
- Blood Bath: chunky blood projectiles/orbs/tendrils travel left-to-right. Pokémon-style resolution; no bullet hell.
- Reusable enemy reaction language is **LOCKED / APPROVED**: normal, heavy and lethal authored reactions are target-agnostic wherever practical. Heavy presentation is used for a single hit dealing ≥20% of target max HP; lethal overrides when the hit defeats the target.
- Blood Bath is the **POWER** move: chunky, reusable target-agnostic projectiles/orbs/tendrils build toward a readable impact.
- Vampire Bite is the **SPEED** move: giant symbolic jaws and snap, with readable dramatic holds, runtime contact FX and reusable lifesteal FX. Damage/healing remain unchanged.
- Revenge is the **FEAR** move: music continues uninterrupted; wounds visibly accumulate on Rich; the exact stored value is shown in the move UI; Revenge reflects exactly accumulated damage and then resets storage to zero.
- Octopus Brain is the **WEIRDNESS** move and remains substantially as currently implemented.
- Core combat FX should remain target-agnostic wherever practical and use runtime target anchors.
- Octopus Brain: eight physical tentacles + underwater/bubble treatment + three context-specific nonstandard solutions. Current CEO choices are CHARISMA — STEAL YOUR HOE; RECRUIT — JOIN MY SQUAD; ROAST — GET OUT MY CASTLE. Exact prototype checks/timings are not canon.
- 9:16 phone-first presentation. Canonical production target: **270×480**, scalable with nearest-neighbor feel.
- Combat is mostly fixed 2D side-on. No top-down combat, platforming or free combat movement.
- UI direction: **Gothic Pokémon Hybrid** — Pokémon readability with restrained vampire personality.
- **LOCKED: Press Start 2P is Rich Alucard's default primary typeface, selected by Ube after in-game playtesting and a strong immediate visual preference.** Monogram and Tiny5 remain available as developer font-lab alternatives, but are not the current default.
- Lost-cartridge aesthetic: large visible pixels, limited tones/material, flat lighting, hard edges, cheap/state-based animation, sparse asymmetry.
- Music soundtrack currently uses `bloodbath_mix3.wav`, starting around 15 seconds and manually looping to the WAV end. Existing lyric sync should not be casually changed.
- Lyric bubble represents Rich rapping/muttering the soundtrack and should visually belong near his head.
- The throne-room wall portrait is now a self-portrait of Rich based on Ube's red-background YouTube/profile image. It should be deliberately low-detail cartridge pixel art: recognizable silhouette, sunglasses, hair, skin, black shirt, green earring, fang, strong red background. The portrait interior may change; the approved room outside it must not.
- Room ambience may occasionally include bats. The castle should usually be still, occasionally alive.
- Main game direction includes Rich's life outside battle. Rich has a **$100,000 monthly budget**. Exact reset/income/spending mechanics are TBD.
- **Bedroom Ambient Prototype is approved** as Rich's first playable home scene. Preserve its supplied immutable 270×480 environment, authored Rich states, window-masked cloud layer and sparse ambient presentation. On every scene entry, initialize at least one cloud already in progress at a randomized position; a second differently sized cloud may occasionally also be in progress. Clouds drift right-to-left at calm, size-specific speeds with long irregular future spawn gaps and open-sky periods.
- **Bedroom Phone + VampGPT v0.1 is approved** as the first life-navigation prototype. `☎ CHECK PHONE` is the bedroom entry point; after the first use it may compact to a phone icon. The cartridge-style phone home contains exactly VampGPT, VampGram, InstaHoe, RealMoneyRealEstate, JDMIMPORTS, RICHBOIMPORTS and ONLYVAMPS; only VampGPT has an authored interaction in this milestone. Other apps and the Make Money / Meet People lanes respond `NOT SET UP YET.`
- VampGPT is Rich's authored, state-aware personal assistant. The canonical prompt is **OGA WHAT DO I DO** and its response presents the Make Money, Meet People and Go Somewhere lanes without choosing for Rich. Cash is sourced from the existing budget, location is LA, and clout is LOW; no numeric clout scale is defined.
- Go Somewhere shows **Atlanta as available** and **Tokyo locked by social/clout access**. Tokyo's authored response is `tokyo vampires don't fw you yet. get your clout up.` The exact clout requirement is TBD. Selecting Atlanta opens the authored Butter Chicken Under the Stars desire; Rich's location changes only after he commits with LET'S GO.
- **Desire Trips** are activities Rich pursues for the experience, without requiring quests, objectives or rewards. Desire Trip #001 is **Butter Chicken Under the Stars**: destination Powder Springs, Georgia; purpose butter chicken. Its minimal persistent status advances planned → traveling → arrived → completed. The player ends stargazing with I'M GOOD; it has no timer or automatic completion. The current destination scene uses only a clearly marked development placeholder. Final Powder Springs artwork and Rich eating/stargazing states are unapproved and must be art-directed separately.
- The short handset-to-cartridge transition and phone UI do not control music or bedroom cloud ambience. The ambient prototype remains approved and unchanged.
- Stay with vanilla HTML/CSS/JS for now. Do not migrate to Unity/Godot merely for scale.
- Persistent state should support Rich/world/character/encounter progression and browser-local saving.
- Pokémon-style overworld walking is **not approved**. Fixed scenes/hotspots remain a valid future approach.

## Vampire conversion

When Rich steals an adult woman:
- character reveal/conversion screen,
- human profile is shown,
- Rich may bite her,
- authored transformation states play,
- she becomes a visibly curvier but clothed goth/vampire version of herself while preserving identity,
- she remains a potential later romance interest,
- if not otherwise retained, she can fly away,
- character persistence must remember relevant state.

**CRACK** is a future Social-gated mechanic. It may be visible as locked, but its threshold, roll, outcome and progression are TBD and must not be invented.

### Character #001 — CEO Assistant

- Adult woman
- Class: **Healer**
- Likes: **Boba; Walks in the Rain**
- Moves & Spells: **Light Heal; Cleanse; Gossip**
- Gossip: affected target takes **+10% damage**
- Shopping Stores: **Boughi-V; Krada**
- Dating Preference: **Date to Marry** — flavor only, no gameplay effect
- Bust Size: **Average (human) → Above Average (vampire)**
- Do not invent additional lore/stats/personality.
- Vampirism does not automatically change established profile fields other than the approved Bust Size update.

## TBD / DO NOT SILENTLY LOCK

- Exact HP/damage/balance numbers
- PP's long-term role
- Exact loss penalties
- Social starting level/progression
- CRACK threshold/roll/outcome
- Budget reset/income/spending mechanics
- Phone app functionality beyond the authored VampGPT prototype
- Future typography-role exceptions or secondary font choices
- Exact final palette/tint
- Overworld walking
- Additional ambience events
- Incidental generated dialogue, levels, labels or environmental text

## Removed / rejected

- Vampireflix TV
- Corporate Curse CEO attack
- Generic visible production hitbox rectangles
- Invented pseudo-Yoruba symbols
- Major environment regeneration for surgical prop changes
