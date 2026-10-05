# ART SHIP 015 — generation log

Mode: OpenAI built-in image generation, followed by native-grid reconstruction. The built-in path was available; no CLI/API fallback or deterministic substitute was used.

Frozen inputs were supplied only as explicit style/staging references. Final candidate assets were built at 80×96, quantized to a limited palette, alpha-thresholded to 0/255, registered to the applicable contact, and preserved separately from the raw generated sources.

## Brother 1 prompt

Create one full-body NEUTRAL sprite for the older brother in Rich's Nigerian-American Atlanta family: tall, broad/solid, short dark hair, trimmed beard, grounded relaxed grown-man Atlanta energy, protective without sternness; charcoal T-shirt, dark athletic pants, clean sneakers, subtle chain or watch. Match the frozen family's forgotten-cartridge grammar without copying any face or outfit. Design as hard-cell native pixel art on an 80×96 grid; transparent background; no antialiasing, soft alpha, shadow, text, fantasy clothing, vampire traits, cultural shorthand, invented symbols, or real-person likeness.

## Brother 2 prompt

Create one full-body NEUTRAL sprite for the younger brother: lean/athletic, slightly shorter and visibly younger than Brother 1, short twists/locs, clean-shaven or extremely light facial hair, animated casual energy, phone in hand; muted deep-blue athletic hoodie/top, dark basketball shorts, crew socks, sneakers. Match the frozen family's cartridge grammar without copying identity. Native 80×96 hard-cell pixel art; transparent background; no antialiasing, soft alpha, shadow, text, fantasy clothing, vampire traits, cultural shorthand, invented symbols, or real-person likeness.

## God prompt

Create two states, SEATED_ON_CURB and FADING, for the original Vol. 2 God definition: ageless older-woman presentation, old and beautiful, completely sure of herself, beloved-grandmother warmth with effortless allure and power; elegant silver natural hair, gold earrings, simple deep-plum wrap, soft edge light only. Use the frozen Powder Springs environment and Rich curb states only for scale/contact. No halo, wings, denominational or real-world religious imagery, spectacle, pure-light body, comedy, gradients, or high-resolution gloss. The final FADING candidate was made as an exact-identity subtractive derivative of the seated native master.

## OG Hooper prompt

Create one NEUTRAL / COURT_READY sprite for a Black man in his late 50s/early 60s: lean, deceptively athletic, close-cropped gray hair, short gray beard, weathered older face, grounded pickup-court confidence; faded muted-rust sleeveless tee, old-school dark-teal shorts, white crew socks, worn basketball shoes, one charcoal knee sleeve. Avoid specific athlete likeness, NBA/team marks, supernatural traits, elderly caricature, frailty, flashy uniform, gradients, or modern gloss. Native 80×96 hard-cell pixel art with binary transparency.

## Native reconstruction

`tools/build_candidates.py` performs only the disclosed production reconstruction: fringe-alpha-safe source crop, nearest-neighbor reduction to the chosen native silhouette box, limited-palette quantization, binary alpha, exact 80×96 placement, exact-pixel avatar crops, and the subtractive God fade. Raw generated sources remain in `source_generation/` for audit.

## HQ surgical-correction pass

The built-in image-editing workflow was run once for God and once for OG Hooper as edit studies. Both studies were excluded from candidate bytes because their large generated outputs drifted beyond HQ's exact-pixel invariants. `tools/apply_surgical_corrections.py` instead applies the approved direction directly to the native files: nine/four declared God edge pixels and an upper-garment-only palette remap for OG Hooper. The exact pre-correction God/OG candidates are retained under `evidence/pre_surgical_correction/` for pixel regression.
