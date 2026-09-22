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

The **Phone** is the primary navigation/interface prototype. Bedroom entry uses `☎ CHECK PHONE`; the first usable app interaction is authored VampGPT. Other lifestyle activities remain unimplemented until separately approved.

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
**POWER.** Chunky blood projectiles/orbs/tendrils travel from Rich toward the enemy using the approved reusable FX architecture. Pokémon-style resolution rather than bullet hell.

### Vampire Bite
**SPEED.** Rich disappears from the throne, giant symbolic jaws enter and snap with readable dramatic holds, then Rich appears beside the target for the approved bite pose. Reusable lifesteal FX travel back to Rich before he returns to the throne.

Biting a man does not mean turning him.

### Revenge
Actual HP damage Rich receives is stored exactly once. Revenge returns that accumulated amount and then resets storage to zero.

**FEAR.** Music continues uninterrupted. Stored wounds visibly accumulate on Rich and the exact stored value is communicated in the move UI. The approved spectacle extracts the wounds, forms a mass, pauses, ruptures the target and drains exact stored damage; storage then resets to zero. Rich remains seated.

### Octopus Brain
**WEIRDNESS.** A lateral-thinking system rather than a standard damage spell. Eight thick physical tentacles appear with an underwater tint/bubbles, while only three contextual choices are presented. It remains substantially as currently implemented.

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

The **Bedroom Ambient Prototype is approved** as the first playable home scene. It uses the supplied immutable 270×480 environment, authored Rich bedroom states and sparse window-clipped clouds. Each bedroom entry begins with at least one cloud already drifting at a randomized position; an occasional second differently sized cloud may also be in progress. Cloud speed is calm and size-specific, while future spawns remain irregular and leave open-sky periods.

The **Bedroom Ambient Prototype and Bedroom Phone + VampGPT v0.1 are approved milestones**. Bedroom entry initializes clouds already in progress as described above. `☎ CHECK PHONE` opens a full-screen Gothic Pokémon Hybrid cartridge phone from the physical phone in Rich's hand; closing returns to the bedroom with Rich lounging, while music and cloud ambience continue.

Phone home contains exactly seven apps: VampGPT, VampGram, InstaHoe, RealMoneyRealEstate, JDMIMPORTS, RICHBOIMPORTS and ONLYVAMPS. Only VampGPT has an authored interaction in v0.1. It is Rich's state-aware personal assistant, surfaces options without choosing his life, and is not freeform AI. Its canonical starting prompt is **OGA WHAT DO I DO**. The authored response reads cash from Rich's existing $100,000 budget and uses LA location and LOW clout state, then offers MAKE MONEY, MEET PEOPLE and GO SOMEWHERE. The first two lanes and other apps respond `NOT SET UP YET.`

GO SOMEWHERE shows Atlanta as **available** and Tokyo as **locked by social/clout access**. The authored Tokyo message is `tokyo vampires don't fw you yet. get your clout up.` The exact clout requirement is TBD. Selecting Atlanta opens the authored Butter Chicken Under the Stars desire; Rich's location changes only after he commits with LET'S GO.

### Desire Trips

A **Desire Trip** is an activity Rich pursues because he wants the experience. It need not have a quest, conventional objective or mechanical reward. The reusable minimum is: authored desire → persistent active trip → brief travel transition → destination scene → activity → player-controlled completion.

**Butter Chicken Under the Stars is Desire Trip #001.** Rich commits to butter chicken in Powder Springs, Georgia. The minimal route is LA → Atlanta → Powder Springs, then the authored eating, chilling and stargazing held poses. The persistent trip state uses destination, purpose, status (`planned`, `traveling`, `arrived`, `completed`), current activity and completed activities. The player ends stargazing with I'M GOOD; there is no automatic completion. A short location-only return transition brings Rich back to the bedroom.

The supplied Powder Springs night environment and Rich curb sprite package are approved/locked, and their source pixels are immutable. The 80×96 Rich cells share anchor (40,88); runtime rendering uses nearest-neighbor at the same foreground curb anchor. Scale defaults to 1.5× and remains playtest-tunable through the DEV-only 1× / 1.5× / 1.75× / 2× selector. Eating and chilling expose their next actions after brief holds; stargazing can remain indefinitely until the player chooses to leave. Desire Trips and contemplative activities do not inherently grant rewards or objectives. No twinkles or distant cars were added; distant cars remain a future backlog idea.
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

The **Foundation Wave 1 Life Engine** provides the minimal persistent foundation in vanilla JavaScript. One browser-local v7 `life` record owns identity, world location/day/month/scene/flags, resources (money, clout and vampire reputation), ownership collections, people/relationships, creative music progress, phone state, desire trips, opportunity data and history. Future-facing collections are empty until content is approved. Existing character and encounter records remain part of the same save and are preserved during migration. The migration path is explicit and sequential: legacy saves bridge to v5, then v5 → v6 → v7. Normalization repairs missing or malformed optional structures without replacing valid progression. Before a valid primary record is replaced, it is kept in a browser-local recovery backup; malformed primary data recovers from that backup instead of silently defaulting the player.

VampGPT reads money, location and clout from this authoritative state. Opportunity definitions are data-driven and evaluate reusable access conditions (location, money, clout, vampire reputation, contacts, relationships and prerequisite flags). Current authored content remains Atlanta available and Tokyo locked with its existing text; Tokyo has no invented unlock threshold. Desire-trip history records travel and completion as consequences without granting rewards. The developer-only Life State Inspector shows saved domains, evaluated opportunities and history, and supports test value edits; Tokyo preview access is session-only.

Persistent state tracks:
- Rich identity/resources and location
- world day/month/scene/flags
- character states such as met/stolen/vampire/cracked
- encounter completion
- owned collections, people, creative progress, phone and desire trips

Save locally in the browser.

**Milestone 6B — I Want a Supra** tests desire-driven acquisition, persistent ownership, business unlocks and consequences using the v7 Life Engine. Its approved native-size production art package replaces the initial placeholders; source assets are immutable. Dock/ownership character scale defaults to 1.25× with DEV tuning at 1×, 1.25× and 1.5×. The $78,000 price remains temporary, editable test data rather than canon. Encounter details remain undisclosed pending Ube's playthrough.

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

**COMBAT STAGING QA RULE** — Every new encounter must receive a visual staging inspection at actual gameplay resolution after final production art integration. Verify ground/contact line, relative scale, opponent spacing, UI clearance, every combat state, and return-to-origin after displacement. Functional tests alone are insufficient.

**REAL PLAYER PATH QA** — A milestone is not player-ready merely because its isolated scene passes. Before release, test the production entry path from a representative existing save and a fresh save, without DEV shortcuts, through the same build the player will open. Verify startup/resume semantics, final rendered staging, persistence, and browser reload behavior.

**PLAYER-VERIFIABLE BUILD ID** — Every release candidate and hotfix must carry an intentionally updated build version that appears only with `?dev=1`. QA must record the displayed value from the deployed browser before approving a player-facing fix.

**BUILD / RELEASE / DEPLOYMENT INTEGRITY** — `npm test` is the deterministic release gate. `npm run build` creates the only Pages artifact in `dist/`, generates `build.json` and `js/build-info.js` from the exact Git commit and build timestamp, and applies one artifact-specific CSS/JS query version. GitHub Actions tests that artifact, deploys the artifact itself, then verifies the public `build.json` and generated DEV metadata against the triggering commit. A push alone is not release verification.

**FOUNDATION WAVE 3 — SCENE LIFECYCLE + STAGE CONTRACT** — Scene-owned timers, animation frames, intervals, delayed callbacks, and temporary listeners must use a cancellable lifecycle scope and cannot mutate after scene exit. Global music keeps its intentional global lifetime. Approved stages use native-coordinate Stage Contracts; JDM Imports docks is the reference contract at 270×480 with a 350 contact line and approved Rich/importer/daughter anchors. The DEV overlay is inspection-only and hidden in normal play.

**FOUNDATION WAVE 4 — COMBAT FOUNDATION** — Encounters are configured with combatants, moves, weighted enemy selection, routes, and presentation IDs. The CEO and JDM Importer are compatibility definitions. Rich's protected move behavior and authored presentation remain unchanged; the legacy presentation functions are adapters until a later wave has reason to generalize them.

**FOUNDATION WAVE 5 — GIVE RICH PEOPLE** — The authored Person Catalog holds stable identity/configuration only. Runtime `life.people.records` holds proven meetings, milestone IDs, conversion state, contact capability, and flags. It is persistent and idempotent; it does not add messages, schedules, relationship scores, or autonomous behavior.

## 16. Current milestone order

Current intended sequence:
**Engine → Conversion → Polish/QA → Bedroom Ambient (approved) → Phone + VampGPT v0.1 (approved) → Desire Trip #001 placeholder → Ube playtest → Fun Test → expand**

The order may change based on actual play.

## 17. Marketing relationship

The game/world comes first. Shorts should feel like moments from Rich's life rather than advertisements.

Useful framing:
**“My music has its own video game.”**

The game should remain worthwhile even without content performance.
