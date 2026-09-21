# Rich Alucard — Canon / Art Direction Changelog

This is a creative-direction changelog, not a substitute for Git history.

## 2026-09-21

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
- A player-facing Revenge stored-damage cue remains a creative decision, not yet canon.

### Locked CEO hit language
- Ube approved the authored CEO normal, heavy and lethal reaction poses.
- `assets/ceo_hit_reaction_manifest.json` is now `LOCKED / APPROVED`; the packed sheet is the canonical runtime source. Individual frames and the 6× preview remain inspection/reference assets.
- Current presentation thresholds: remaining CEO HP before a hit `>52` normal, `27–52` heavy, `≤26` lethal.

### Approved Vampire Bite FX
- Ube approved the target-agnostic Vampire Bite package: screen jaws/snap, runtime contact burst, lifesteal particles and brief afterimages.
- The package is presentation-only; existing Bite damage/healing mechanics remain unchanged. Revenge is not part of this pass.

### Exploration
- Pokémon-style walking discussed as inspiration but not approved for implementation.
- Fixed scenes/hotspots may deliver the desired inhabited-world feeling with less complexity.

### Fun Test
- Formalized principle: Rich Alucard must still be worth making if nobody watches the Shorts.
- Game enjoyment and world expression outrank marketing utility.

### Lifestyle foundation
- Rich has a conceptual $100,000 monthly budget.
- Bedroom and Phone established as future life/navigation direction.
- Exact economy, phone apps and bedroom layout remain TBD.

### Vampire conversion
- Established reusable reveal → bite → transformation → vampire profile → locked CRACK / LET HER FLY flow.
- CRACK is Social-gated in the future; mechanics remain TBD.
- CEO Assistant #001 canonical profile documented in CURRENT_CANON and the Master Game Bible.
