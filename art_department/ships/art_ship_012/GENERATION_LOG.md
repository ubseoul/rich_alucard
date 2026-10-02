# ART SHIP 012 — Generation Log

**Mode:** built-in ImageGen, one transparent source render per authorized asset. No batch sheet and no discarded variants.

**Nativeization:** deterministic significant-alpha crop; BOX reduction into an asset-specific maximum visible envelope; no-dither 11–18 color reduction; binary-alpha cleanup; registration in an 80×96 RGBA cell at contact `(40,88)`. The source renders remain preserved unchanged under `source_renders/`.

## Final prompt set

### AS12-01 — Portobello manager

Create one transparent full-body adult office manager for Rich Alucard's warm Portobello alternate life, standing in a neutral conversational KPI-review pose. Competent Black woman in her early forties; navy cardigan, cream collared blouse, taupe straight-leg trousers, dark loafers and one small employee badge. Deliberately low-resolution early-2000s handheld-cartridge pixel art with hard square edges, compact silhouette, sparse facial marks, broad grouped color planes and minimal folds. Supporting role; no corporate-hell parody, sinister read, comedy, text, props beyond the badge, shadow or ground plane.

### AS12-02 — NAIJA MART auntie

Create one transparent full-body adult Nigerian-American woman who runs the NAIJA MART register, in a neutral register-conversation stance. Warm, assertive and naturally interrogative; soft-full adult build; rust-and-teal patterned blouse, dark cardigan, practical green waist apron, comfortable shoes and small gold studs. One hand near the apron and one lightly raised as if asking a fond pointed question. Handheld-cartridge pixel art with hard edges, compact silhouette and grouped planes. Everyday retail clothing only; no traditional-dress caricature, poverty/culture joke, text, counter, shadow or ground plane.

### AS12-03 — Ocean soul

Create one transparent anonymous drowned adult soul climbing upward for the dark OPEN ocean-floor prologue. Nondescript identity, muted blue-gray soaked clothing, hunched climbing-compatible pose with one hand lifted toward an unseen rung and offset legs. Recognizably human, eerie and melancholy, with restrained cool edge light. Handheld-cartridge pixel art, hard square edges, sparse detail and 8–12 muted colors. No ladder, gore, wounds, zombie/monster face, dramatic glow, text, shadow or ground plane.

### AS12-04 — Training dummy

Create one transparent simple battered fantasy training dummy for Rich Alucard's castle combat grammar: wooden post, weighted dark iron-and-stone base, short crossbar arms wrapped in worn burgundy cloth, stitched burlap striking pad, restrained nicks and dents. Clearly an object, not a person. Compact hard-edged handheld-cartridge pixel art with broad grouped planes and minimal texture. No face, eyes, humanoid identity, scarecrow read, gore, spikes, elaborate weapons, text, shadow or ground plane.

### AS12-05 — Buckhead vampire

Create one transparent full-body adult male Buckhead vampire who reads instantly as a polished affluent brunch entrepreneur in a combat-capable neutral stance. Self-satisfied Black man in his late thirties; neat close-cropped hair and trimmed mustache; restrained pale-violet vampire cast and tiny fangs; cream knit polo, dark oxblood unstructured jacket, tailored charcoal trousers, unmistakable tan boat shoes with white soles and one gold watch. Hard-edged compact handheld-cartridge pixel art with sparse face marks and broad grouped planes. Funny stakes, never a ridiculous design; no cape, tuxedo, monster anatomy, mimosa prop, recipe, text, shadow or ground plane.

Full structured prompts additionally specified centered isolated composition, generous transparent padding, one shared baseline, no antialiasing, no gradients, no photorealism, no painterly rendering and no watermark.

## AS12-05R — HQ style/proportion revision

HQ passed Buckhead's established character concept and requested only a style/proportion correction. The built-in image editor was attempted against the preserved Buckhead source render but returned an account usage-limit error and produced no file. No API/CLI fallback was used.

The revision was therefore redrawn deterministically at the native grid by `tools/build_candidates.py`, using the preserved source render only as concept/provenance authority. The revision keeps the oxblood jacket, cream polo, fitted charcoal trousers, tan boat shoes, single gold watch, adult male identity, self-satisfied stance and restrained fang cue. It replaces the naturalistic anatomy and soft fold construction with a larger head mass, 59-pixel visible height, short planted legs, compact bent arms, broad connected jacket/trouser clusters, sparse face pixels and 14 opaque colors.

Superseded candidate SHA-256: `26bc338ca53b12aac0b051189745dadba4b4fb6d29c745e85253fa8c8e01265c`.

Revised candidate SHA-256: `f178b6b63a8d01f3acbbb9d38228da5b97be2fad9fcc8a6ccb7f8ffa0fc6333e`.
