# Rich Alucard — Visual Style Bible

## North star

**A strange forgotten early-2000s handheld cartridge made specifically for Rich Alucard.**

It is not a perfect Game Boy Color simulation and should not become generic modern pixel art.

The emerging mixture is:
- Pokémon-like readability and RPG interface logic
- GBC/GBA-style physical limitation
- dark vampire/Castlevania-like environments
- Terraria-esque chunky world/sprite influence
- anime / visual-novel weirdness
- old manuscript / artifact texture
- Berserk-adjacent darkness as inspiration, not copied art
- selected Yoruba formal influence chosen by Ube
- Rich's modern red / black / purple identity
- deliberately funny modern intrusions: boba, pizza, music, HOES, self-portrait

The contradictions are part of the identity.

## Core visual principle

**Make it intentionally cheap, specific and alive — not accidentally unfinished.**

Prefer:
- large deliberate pixel clusters
- 2–3 tones per material where practical
- nearest-neighbor scaling
- integer positioning
- hard edges / no anti-aliasing
- few authored animation states
- deliberate pauses
- tiny sprite reactions
- restrained screen shake / hit-stop
- asymmetry
- environmental clutter with purpose

Avoid:
- modern gloss
- excessive smooth easing
- blur/bloom
- particle soup
- fake VHS
- heavy CRT filters/curvature
- generic black-and-red “vampire everything”
- over-detailed HD pixel art that clashes with the room

## Color direction

Current identity ingredients:
- bone/cream UI
- near-black
- Rich red
- nocturnal purple
- dried-blood/burgundy
- muted gold
- occasional green accents

The strong red behind Rich's self-portrait should remain red rather than being purple-tinted away.

A cartridge tint may be tested, but should remain configurable until Ube approves a default.

## Typography

**LOCKED: Press Start 2P is Rich Alucard's default primary typeface, selected by Ube after in-game playtesting and a strong immediate visual preference.** It is bundled with the game and must load identically locally and on GitHub Pages. Monogram and Tiny5 remain available through the developer font lab for future testing, but are not the current default.

Developer font-lab alternatives:
- Monogram
- Press Start 2P
- Tiny5
- existing control font

Do not assume one font must serve every role. Typography roles may differ for:
- dialogue
- character names
- commands
- move names
- HP/PP/numbers
- system messages

The existing typography-role token architecture remains in place. Do not introduce secondary fonts automatically. If a specific role becomes objectively unreadable or cramped, flag it for Ube before choosing another family.

Desired relationship: **Pokémon readability discovered inside Dracula's castle.**

## Throne room

The approved throne-room environment is source art, not a prompt.

**Immutable environment rule:** when changing one prop, composite into the existing approved asset. Do not regenerate/reinterpret the room.

Preserve the approved:
- room dimensions/composition
- single main combat rug
- window and curtains
- candles
- shelves/props
- coffee/boba/pizza clutter
- wall architecture
- ornate painting frame
- combat plane

### Rich self-portrait

The previous panther subject is replaced by Rich's own portrait.

Purpose: characterization. Rich loves himself enough to hang a commissioned portrait of himself where invaders have to see it.

Portrait requirements:
- based on Ube's red-background Rich/YouTube profile image
- strong red background
- side-facing silhouette
- Black skin
- black hair mass
- large black sunglasses
- black shirt
- green earring
- visible white fang
- aggressively simplified at in-world scale
- large clusters; surprisingly simple when zoomed in

Avoid individual dread-strand rendering, beard stippling, smooth facial modeling, tiny highlights, or HD portrait density.

## UI

Direction: **Gothic Pokémon Hybrid**.

Keep:
- cream/off-white panels
- strong readability
- dark chunky outlines
- large touch targets
- clear HP
- Pokémon-like information hierarchy
- existing overall bottom battle-menu footprint unless Ube changes it

Vampire identity should enter through restrained typography, corners/dividers, color and authored motifs rather than overwhelming ornament.

The outer gothic frame is approved and can inform restrained recurring geometry.

## Yoruba influence

Use only motifs/forms Ube selects.

Do not generate generic “African” decoration or pseudo-Yoruba symbols.

Potential formal qualities identified from Ube's references:
- stacked forms
- carved geometry
- elongated/vertical sculptural rhythm
- selected textile geometry
- crown/form language
- indigo/material inspiration

These are directions for future authored selection, not permission to invent sacred/cultural symbols.

## Animation / game feel

Attacks should generally read:
**anticipation → action/travel → contact → brief impact → target reaction → HP drain → idle**

Static/state-based animation is an aesthetic strength.

The CEO hit language is **LOCKED / APPROVED**. Runtime uses the authored `ceo_hit_reaction_sheet.png` with nearest-neighbor rendering: normal recoil, heavy recoil and lethal reaction. The current presentation thresholds are remaining CEO HP before the hit: `>52` normal, `27–52` heavy, `≤26` lethal.

Room ambience should be sparse. Bats may occasionally cross the room; constant motion is undesirable.

## Rich visual identity

Rich's recurring signals include:
- black
- red
- nocturnal purple
- crown imagery where appropriate
- green earring accent
- sunglasses
- fangs
- self-reference / self-portrait
- modern objects inside ancient surroundings

The game should remain funny. A dark castle and serious RPG interface can coexist with a menu option labeled **HOES**.
