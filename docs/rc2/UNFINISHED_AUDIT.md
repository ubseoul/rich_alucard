# RC2 Build 2 — UNFINISHED AUDIT (measured, not guessed)

Method: `tools/rc2/audit_unfinished.mjs` + `tools/rc2/analyze_all.mjs` load every PNG in the real game and count colours / semi-transparent edges. Hand-pixeled masters sit at ~12–40 colours. Raw data: `docs/rc2/audit_data.json`.

## Backgrounds
- Code-painted placeholder environments left in the registry: **0** (`RAEnvironments.placeholders()` is empty; 74 image-backed).
- **Soft / painterly (not hard-pixel) backgrounds: 22** (11 adventure + 7 F15 + minigame boards). Fixed by code: runtime re-pixelation (`js/engine/hard_pixel.js`, 40-colour palette + Bayer dither, files untouched): gbenga_rentals, gbenga_house_dining, gbenga_house_patio, carson_owambe, catacomb_dead, halloween, ocean_night_flight, f07_warehouse_exterior, f07_warehouse_party, all 7 F15 rooms, p_d jollof/hatch/pickup/pier/hookah boards.
- Approved as-is by Ube (not placeholders): `gbenga_house_dining`, `ocean_night_flight`. Rooms never referenced by any adventure: party_hall, music_room, tristan_apt, catacomb_dead, halloween, rave_exterior/property_exterior (scene-driven only).

## Characters
- Sprites with no art (placeholder canvas actor): **0**.
- Soft / anti-aliased runtime sprites (hundreds of colours, semi-alpha): Gbenga ×5, Carlos ×4, Phil states, F15 portraits ×3, p_d Auntie Grit / Mama Gbenga / Uncle Bamidele sprites. Fixed by code: hard alpha, 24-colour palette, 1px ink outline at display time (`RAHardPixel.hardenImg`). Fixed: **~30 sprites**.
- Granny Bing sprite (80×96) is already hard-pixel; the scene around her (the_bing background) was the soft part — fixed by re-pixelation.
- Art already supplied by Ube (no new art needed): giant cockroach = `assets/f15/characters/spirit_of_uncle_bunmi_444x222.png` (derived from the approved master); Roxy/Rosalyn/Emerald approved+frozen stage cards, ingested under `art_department/production/f15-dancer-stage-cards/` (from `build/visual-completion-002` @ 172ccff).
## Dancers
F15 dance sheets were an exact 3:1 box-average of video frames and drawn with smoothing ON (soft). Now: 2×2 block mosaic, 28-colour palette, hard alpha, 1px outline, smoothing OFF (`js/frag/F15/club.js`). Reads as pixel art; verified on frames of the wolf sheet.

## Counts
Fixed by code: 22 backgrounds + ~30 sprites + 3 dancer sheets. Needs art: **0**. The dining room (`p_d_gbenga_house_dining.png`) and night flight (`p_d_ocean_night_flight.png`) are the approved art; the cockroach and the three stage cards are supplied. `IMAGE_PROMPTS_RC2.md` is empty.
