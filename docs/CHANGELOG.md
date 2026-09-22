# Rich Alucard — Canon / Art Direction Changelog

This is a creative-direction changelog, not a substitute for Git history.

## 2026-09-21

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
