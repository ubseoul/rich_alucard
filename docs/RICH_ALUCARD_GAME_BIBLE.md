# Rich Alucard — Master Game Bible

**Status:** Living document  
**Creative director:** Ube  
**Implementation:** browser-first HTML/CSS/JS

For day-to-day implementation, read **CURRENT_CANON.md first**. This document captures the broader game direction.

## 1. Premise

You play as **Rich Alucard**, a vampire who is effectively the boss of his own game. Adventurers occasionally break into his castle to fight him, but combat is only one part of Rich's life.

Rich parties, spends money, dates, builds his castle/lifestyle, deals with invaders and gradually creates a stranger, richer world around himself.

Sometimes Rich wins. Sometimes Rich loses and becomes a blood splatter before returning to his life.

## 2. Rich

Rich is Black and wears an all-black fit, green earrings, sunglasses and fangs. No cape and no weapon.

Personality:
- straightforward about what he wants
- not presented as a mastermind
- tries different things
- meta
- does not deeply analyze things he does not care about
- capable of getting drinks with somebody and then stealing his girl
- never turns men into vampires

His unexplained weakness is fish.

Rich is generally partying. When he is in the throne room, he is often hungover/recovering.

## 3. Core life loop

Emerging direction:

**Rich wakes up → monthly budget → bedroom/phone → chooses what to do → battle/date/shopping/party/etc. → consequences → returns to Rich's life**

This is directional rather than a fully specified mechanical loop.

Rich currently begins with a **$100,000 monthly budget** concept. Future systems may increase it. Reset, income and spending rules remain TBD.

The **Phone** is planned as the primary navigation/interface for choosing activities. Exact apps are TBD.

## 4. Fun Test

The game must be worth making even if nobody watches the Shorts.

Priority:
1. Is it fun for Ube to play?
2. Does it make Rich's world more expressive?
3. Does it create something naturally worth recording?
4. Does it help the music?

Development should remain play-led:
**play → notice “I wish I could ___” → backlog → build**

Do not create giant systems merely because they sound scalable.

## 5. Combat

Combat is fixed, side-on, turn/state-driven and designed for a 9:16 phone presentation.

Rich normally lounges on an elevated throne at left. Enemies stand at right.

Current moves:
- **BLOOD BATH**
- **OCTOPUS BRAIN**
- **VAMPIRE BITE**
- **REVENGE**

### Blood Bath
Chunky blood projectiles/orbs/tendrils travel from Rich toward the enemy. Pokémon-style resolution rather than bullet hell.

### Vampire Bite
Rich disappears from the throne, uses a fast red/black teleport streak, appears beside the target for a bite/lunge key pose, damages the target, heals via lifesteal, then snaps back to the throne.

Biting a man does not mean turning him.

### Revenge
Actual HP damage Rich receives is stored exactly once. Revenge returns that accumulated amount and then resets storage to zero.

Visual direction: stored damage can pull/rip outward around Rich, collect into a blood-red mass and launch back toward the opponent. Rich remains seated.

### Octopus Brain
A lateral-thinking system rather than a standard damage spell. Eight thick physical tentacles appear with an underwater tint/bubbles, while only three contextual choices are presented.

For CEO Zombie Prince:
- **CHARISMA — STEAL YOUR HOE**
- **RECRUIT — JOIN MY SQUAD**
- **ROAST — GET OUT MY CASTLE**

Exact target numbers/check presentation are not canon.

## 6. First encounter

First enemy: **CEO Zombie Prince**.

He is a human-looking zombie in a corporate suit, wears a crown and carries a briefcase. His attack identity includes literally throwing the briefcase.

He is accompanied by an adult female Assistant/Healer.

The encounter begins with the CEO's grandiosity and Rich's hungover annoyance. Exact dialogue should not be invented without approval.

## 7. Victory / loss

Normal victory can lead to defeated adventurers exploding or becoming zombies depending on the authored encounter.

If an enemy party includes an adult woman, Rich may have an opportunity to turn her into a vampire. This does not automatically make her his girlfriend.

Loss direction: Rich can become a blood splatter and respawn hungover. Exact penalties remain TBD.

## 8. Vampire conversion

A stolen adult woman can receive a dedicated reveal/conversion sequence.

Flow:
**character reveal → human profile → BITE HER? → bite/transformation states → vampire reveal → CRACK locked or LET HER FLY**

Vampire transformation preserves identity while moving toward a curvier, more revealing but clothed goth/vampire design.

**CRACK** is planned as a future Social-gated mechanic. Its threshold, roll, progression and exact outcome are not designed.

### CEO Assistant #001

- Class: Healer
- Likes: Boba; Walks in the Rain
- Moves & Spells: Light Heal; Cleanse; Gossip
- Gossip: target takes +10% damage
- Shopping Stores: Boughi-V; Krada
- Dating Preference: Date to Marry
- Dating Preference is flavor only.
- Bust Size: Average (human) → Above Average (vampire)

Approved vampire appearance preserves her identity with black/burgundy goth styling, vampire details and the approved curvier silhouette.

## 9. Dating / lifestyle direction

Future possibilities include dates such as boba outings, parties, shopping and other lifestyle activities. Adult/NSFW material is a much-later possibility, not part of the current implementation scope.

Parties may eventually affect characters/skills and quests may fund Rich's lifestyle, but these systems are not mechanically locked.

Cars, castle size and lifestyle status may eventually influence the world and characters attracted to Rich. Exact rules remain TBD.

## 10. Bedroom / Phone

A future bedroom scene shows Rich on his phone, potentially in a hoodie.

The Phone is planned as the navigation center for Rich's life.

Do not invent the bedroom layout or phone apps until designed through play/creative direction.

## 11. Exploration

Pokémon-like walking is an inspiration, not an approved system.

The desired feeling is inhabiting Rich's world. This may be achieved more cheaply and intentionally through fixed room scenes and hotspots.

Only build free walking if play repeatedly demonstrates that movement itself would improve the game.

## 12. Music

Music is part of the world rather than merely advertising.

Current combat soundtrack uses `bloodbath_mix3.wav` and the current implementation begins around 15 seconds. Rich's synchronized lyric bubble makes him appear to rap/mutter along.

Current lyric sync implementation is recording-approved and should not be casually altered.

Longer-term, music may become an in-world object/system, but that is not locked.

## 13. Visual identity

See **VISUAL_STYLE_BIBLE.md**.

Short version: strange forgotten cartridge; Pokémon clarity; dark vampire room; colorful old-game interfaces; anime/VN weirdness; artifact/manuscript texture; selected Yoruba formal influence; Rich's red/black/purple modern identity.

Do not make everything uniformly gothic.

## 14. Architecture

Stay with vanilla HTML/CSS/JS unless the game's actual needs outgrow it.

Architecture should gradually separate:
- persistent state
- scenes
- dialogue
- audio
- save/load
- combat
- characters
- relationships
- budget
- phone
- data definitions

Do not overengineer hypothetical systems.

Persistent state should eventually track:
- Rich state
- monthly budget
- location
- world day/month
- character states such as met/stolen/vampire/cracked
- encounter completion

Save locally in the browser.

## 15. Production workflow

**Ube = creative director/world-builder/player.**

Design and canon decisions should be made through play and review. Codex implements approved briefs.

Preferred loop:
**design/approve → implementation brief → build → Ube plays → review → next feature**

For reviews, distinguish:
- **LOCKED**
- **PROPOSED**
- **DOUBTS**
- **QUESTIONS**

Never convert a PROPOSED idea into canon silently.

## 16. Current milestone order

Current intended sequence:
**Engine → Conversion → Polish/QA → Bedroom → Phone → Fun Test → expand**

The order may change based on actual play.

## 17. Marketing relationship

The game/world comes first. Shorts should feel like moments from Rich's life rather than advertisements.

Useful framing:
**“My music has its own video game.”**

The game should remain worthwhile even without content performance.
