# Rich Alucard — Canon / Art Direction Changelog

This is a creative-direction changelog, not a substitute for Git history.

## 2026-09-22

### Foundation Season — Wave 2: Build / Release / Deployment Integrity
- Added repository-owned deterministic release tooling for the vanilla static game. It validates JavaScript syntax and Wave 1 save fixtures, then produces one `dist/` artifact from the exact commit.
- Each artifact generates a matching machine-readable `build.json` and DEV-only `js/build-info.js` with release ID, commit SHA and build timestamp. `?dev=1` reads this generated identity instead of a handwritten build string.
- Added GitHub Actions test and Pages workflows: test → build artifact → deploy artifact → verify public build identity against the deployment commit. The public URL and game runtime architecture remain unchanged.
- Replaced scattered manual CSS/JS cache labels with one generated artifact query version. No gameplay, save, art, combat, music, dialogue or UI behavior changed.

### Foundation Mega-Patch — Wave 1: Save Integrity + Regression Foundation
- Advanced the browser-local save format to v7 with an explicit legacy bridge and sequential v5 → v6 → v7 migrations. Existing life, trip/history, character/encounter, ownership, business-unlock and one-time acquisition consequences are preserved.
- Added non-destructive normalization for partial records and browser-local recovery/quarantine handling: malformed primary data restores the last valid recovery copy rather than silently defaulting Rich.
- Added synthetic save fixtures for fresh, legacy, v6 life, completed Butter Chicken, paused/owned Supra, malformed JSON and partial corruption. The smoke suite now verifies migration idempotence, recovery, round-trips and one-time Supra consequences without assuming a fresh player save.
- Added release cache version `foundation-wave1-save-integrity-20260922.3`. No gameplay, content, economy, encounter or art changes were made.

### Milestone 6B — I Want a Supra
- Tests desire-driven acquisition, persistent ownership, business unlocks and consequences using the Life Engine. Encounter details are intentionally withheld until Ube's first playthrough.
- Integrated the approved 6B production art into the existing phone, dock, battle and ownership scenes. Replaced the temporary SVG and drawn stand-ins with individual native-size raster assets; reused canonical Rich frames byte-for-byte.
- Dock and ownership character rendering defaults to 1.25× nearest-neighbor scale, with DEV options at 1× and 1.5×. The $78,000 price remains editable temporary test data, not canon.

### Milestone 6A — Life Engine foundation
- Recorded **Milestone 5 as PASS**: the Powder Springs playtest validated Desire Trips as satisfying without a conventional objective or reward; **FULFILLMENT IS GAMEPLAY**. Contemplative moments remain player-controlled.
- Added the v5 browser-local `life` save record for Rich identity, world state, resources, ownership, people, creative music progress, phone, desire trips, opportunity data and history. Future-facing collections start empty.
- Migrated the prior save shape in place, preserving existing money/location/clout, day/month/scene, phone use, active/completed trip data, characters and encounter progress.
- VampGPT now reads its authored cash/location/clout response from life state. The Go Somewhere options are data-driven: Atlanta remains available and Tokyo remains locked with the authored message; reusable access rules support location, money, clout, vampire reputation, contacts, relationships and prerequisite flags without adding a Tokyo threshold.
- Desire Trip #001 travel and completion persist through life state and add idempotent history consequences only, with no rewards. Added a DEV-only Life State Inspector, state-value test controls and session-only Tokyo access preview.
- Kept the life simulation mostly invisible until an authored player-facing activity exists. This is the minimal foundation only; no Milestone 6B work or future content was added.

### Desire Trip #001 final integration approved
- Replaced the Powder Springs placeholder with the approved, unchanged 270×480 night environment and approved immutable Rich eating, chilling and stargazing source sprites.
- Rich renders at 1.5× nearest-neighbor scale by default at shared anchor (40,88) → curb anchor (135,406); a DEV-only selector supports 1×, 1.5×, 1.75× and 2× for playtesting.
- Arrival begins in the eating pose; FINISHED EATING advances to chilling, then LOOK AT THE STARS enters indefinite stargazing. I'M GOOD marks the persisted trip completed and begins a brief Powder Springs → Atlanta → LA transition back to the bedroom.
- Desire Trips do not inherently grant rewards. Contemplative activities remain available until the player chooses to leave. No twinkles or distant cars were added; distant cars remain a future backlog idea.

### Desire Trip framework + Butter Chicken Under the Stars #001
- Locked the first minimal Desire Trip flow: desire → persistent trip → brief travel transition → destination → activity → player-controlled completion. Activities can exist without quests, objectives or rewards.
- Atlanta selection now surfaces only the authored Butter Chicken conversation and LET'S GO / NAH choice. Committing creates a trip to Powder Springs, Georgia, for butter chicken.
- Added planned, traveling, arrived and completed trip statuses plus current/completed activity tracking. Travel shows LA → ATLANTA → POWDER SPRINGS briefly.
- Added `powderSpringsCurb` and indefinite `stargazing` scene states. EAT BUTTER CHICKEN exposes LOOK AT THE STARS; I'M GOOD ends the moment and completes the trip.
- In that framework-only pass, destination visuals remained a DEV PLACEHOLDER BACKGROUND. The final environment and Rich activity sprites were approved and integrated in the later entry above; no rewards, quest, encounter, NPC or restaurant gameplay were added.

### Bedroom Phone + VampGPT v0.1 approved
- `☎ CHECK PHONE` is the player-facing bedroom entry point, compacting to a phone icon after its first use.
- Approved the brief handset-origin transition, full-screen cartridge phone home, authored VampGPT conversation and return-to-bedroom flow. Music and cloud ambience continue through it.
- Phone home has exactly VampGPT, VampGram, InstaHoe, RealMoneyRealEstate, JDMIMPORTS, RICHBOIMPORTS and ONLYVAMPS. Only VampGPT is authored for play; unavailable surfaces say `NOT SET UP YET.`
- Canonical prompt: **OGA WHAT DO I DO**. VampGPT reads the existing $100,000 budget, LA location and LOW clout from saved state and presents MAKE MONEY / MEET PEOPLE / GO SOMEWHERE.
- GO SOMEWHERE shows Atlanta as available and Tokyo as socially/clout-gated. The exact clout requirement remains TBD. Atlanta does not trigger travel in this milestone.
- The Phone + VampGPT prototype stops for Ube's playtest; no activities beyond seeing Atlanta are part of this approval.

### Bedroom Ambient Prototype approved — final tuning
- Ube approved the first playable Bedroom Ambient Prototype.
- Bedroom entry initializes at least one cloud already moving right-to-left at a randomized position within the window; a second differently sized cloud may occasionally also be in progress.
- Cloud speeds are size-specific, calm and perceptible within a few seconds. Future spawns retain long irregular gaps and open-sky periods.
- Preserve the supplied bedroom environment, exact window masking, nearest-neighbor cloud art and sparse Rich state changes. Phone gameplay remains out of scope.

### Approved room background update
- Ube approved the supplied 765×1024 throne-room background with Rich's simplified red self-portrait as the current room background.
- Preserve the supplied composition and use it as the active background asset.

### Cartridge identity
- Clarified north star: a strange forgotten early-2000s handheld cartridge made specifically for Rich Alucard, not a perfect GBC simulation.
- Preserve colorful old-game readability alongside vampire darkness; do not make the entire interface uniformly gothic.
- Candidate font lab: Monogram, Press Start 2P, Tiny5, plus control font.
- Cartridge tint remains experimental until Ube approves a default.
- Yoruba influence must come from user-selected references/forms; do not invent pseudo-Yoruba symbols.

### Locked default typeface
- **LOCKED: Press Start 2P is Rich Alucard's default primary typeface, selected by Ube after in-game playtesting and a strong immediate visual preference.**
- Press Start 2P is bundled locally in `assets/fonts/`; Monogram and Tiny5 remain developer font-lab alternatives and are not the current default.

### Throne-room self portrait
- Replaced the concept of the panther painting with a self-portrait of Rich based on Ube's red-background YouTube/profile image.
- Portrait purpose: Rich is self-absorbed/loves himself and hangs his own commissioned portrait in the throne room.
- Preserve red background, sunglasses, hair silhouette, Black skin, black shirt, green earring and fang.
- Portrait must be much lower-detail than the initial HD pixel-art attempt.

### Immutable environment rule
- **Approved environment artwork is immutable source art.**
- Environmental edits must be surgical/composited unless Ube explicitly approves regeneration.
- A portrait replacement must not regenerate the throne room.
- The accidental two-rug/environment drift from the regenerated portrait-room version is not canon; restore the previously approved room and change only the painting interior.

### QA / polish
- Core combat routes tested stable.
- Developer-only tooling is appropriate for scene/save/audio/Revenge/font/tint inspection.
- Do not use a generic web-app “processing” indicator; attack presentation should communicate locked input.
- Revenge's player-facing stored-damage cue is approved and canonical.

### Locked CEO hit language
- Ube approved the authored CEO normal, heavy and lethal reaction poses.
- `assets/ceo_hit_reaction_manifest.json` is now `LOCKED / APPROVED`; the packed sheet is the canonical runtime source. Individual frames and the 6× preview remain inspection/reference assets.
- Current presentation thresholds: remaining CEO HP before a hit `>52` normal, `27–52` heavy, `≤26` lethal.

### Approved Vampire Bite FX
- Ube approved the target-agnostic Vampire Bite package: screen jaws/snap, runtime contact burst, lifesteal particles and brief afterimages.
- The package is presentation-only; existing Bite damage/healing mechanics remain unchanged.

### Intro / Throne Room Combat v1 milestone approved
- Ube approved the current intro/throne-room battle presentation as good enough to move forward; return here for later tuning after more of the game exists.
- Press Start 2P is the default typeface.
- Reusable enemy reactions use normal/heavy/lethal authored states. Heavy is triggered by a single hit dealing ≥20% of target max HP; lethal overrides.
- Blood Bath is POWER with its reusable target-agnostic impact architecture.
- Vampire Bite is SPEED with giant symbolic jaw snap, readable dramatic holds and reusable lifesteal FX.
- Revenge is FEAR: music continues uninterrupted, wounds accumulate visibly on Rich, the exact stored value is shown, and the locked mechanic remains exact accumulated-damage reflection followed by reset.
- Octopus Brain is WEIRDNESS and remains substantially as implemented.
- Core combat FX remain target-agnostic wherever practical.

### Exploration
- Pokémon-style walking discussed as inspiration but not approved for implementation.
- Fixed scenes/hotspots may deliver the desired inhabited-world feeling with less complexity.

### Fun Test
- Formalized principle: Rich Alucard must still be worth making if nobody watches the Shorts.
- Game enjoyment and world expression outrank marketing utility.

### Lifestyle foundation
- Rich has a conceptual $100,000 monthly budget.
- Bedroom is an approved ambient prototype and the first Phone + VampGPT v0.1 navigation prototype is approved as recorded above.
- Exact economy mechanics and functionality for the other phone apps remain TBD.

### Vampire conversion
- Established reusable reveal → bite → transformation → vampire profile → locked CRACK / LET HER FLY flow.
- CRACK is Social-gated in the future; mechanics remain TBD.
- CEO Assistant #001 canonical profile documented in CURRENT_CANON and the Master Game Bible.
