# Generation Log — Art Ship 004

## Technical-review revision

On 2026-09-24, the candidate board and handoff documentation were revised to state the authoritative approximately 1.85x historical on-screen scale with nearest-neighbor filtering. No ImageGen call was made for this correction. No candidate art or native source pixels were regenerated or changed.

## Method

Built-in ImageGen was used for reference-led bitmap exploration. Approved/frozen local pixels supplied the style authority. Candidate conversion used nearest-neighbor fitting, limited-palette quantization, and binary-alpha cleanup; no source asset was upscaled to imitate the 1.85 runtime rule.

Raw generations and candidate-folder duplicates existed in the originating production workspace for review and provenance. After HQ TECHNICAL PASS they were excluded from the committed approved corpus. The byte-identical promoted files under `assets/goldfish_years/` are the only frozen production authority.

## Approved reference set

- `assets/jdm_imports/environment/docks_night_270x480.png`
- `assets/powder_springs_night_270x480.png`
- `assets/ogun_rave/masters/rave_interior_270x480.png`
- `assets/property/masters/property_interior_base_270x480.png`
- `assets/rich_standing_right.png`
- `assets/ogun_rave/masters/ogun_neutral_80x96.png`
- `assets/property/characters/shannon/shannon_neutral_80x96.png`
- `assets/bllad33/masters/bllad33_neutral_candidate_80x96.png` (approved master record only)

Rejected, archived, exploratory, and status-unknown art was not used as style authority. Existing Octopus Brain runtime frames were specifically excluded.

## Final normalized prompt set

### Ocean floor base

> Create one empty 9:16 ocean-floor gameplay background matching the attached approved Rich Alucard environments: early-2000s handheld pixel art, hard square pixels, limited cool midnight palette, broad readable clusters, restrained shading, intimate authored messiness, and a clear lower actor band. Deep open water above; sparse broken stone and debris at the sides; broad traversable floor in the lower third. No characters, ladder, text, UI, symbols, glow, bloom, CRT/VHS effect, antialiasing, glossy modern rendering, or tiny-detail noise.

### Octopus Sensei neutral

> Create a transparent-background Octopus Sensei character candidate matching the attached approved Rich Alucard character sprites: compact hard-edged pixel art, limited palette, strong silhouette, sparse interior detail, no antialiasing. Ancient, calm, stern-but-gentle octopus; deep purple-red body; tiny gold spectacles; a few barnacle-like jewelry accents; exactly eight tentacles implied in a clean squat silhouette. Neutral listening pose. Adult, funny, personal, slightly ridiculous, never cute-childlike or horror-gory. No text, symbols, aura, glow, bloom, gradients, or over-rendering.

### Intact ladder

> Create a transparent pixel-art overlay of one tall, narrow, precarious driftwood-and-rope ladder for the approved ocean-floor scene. Match its hard pixels, cool dark palette, restrained seven-to-eight-color material treatment, broad clusters, and imperfect handmade humor. Full-height readable silhouette; no character, floor, scenery, text, symbols, glow, shadows, antialiasing, or extra props.

### Collapsed ladder edit

> Edit the same ladder into its collapsed condition while preserving its exact material identity, palette, rung spacing, and pixel grammar. It should read as a low connected diagonal wreck lying across the ocean floor, practical as a transparent scene overlay. No new props, characters, text, symbols, glow, floor, scenery, or soft edges.

### Sensei point edit

> Edit the neutral Octopus Sensei so only the upper-left tentacle becomes a clear leftward pointing gesture toward Rich and the ladder. Preserve identity, face, spectacles, colors, body mass, other tentacles, source scale, hard pixel edges, and transparent background. Do not add effects, text, symbols, or extra detail.

## Candidate conversion

- Environment: nearest-neighbor crop to 270x480; 24 opaque RGB colors.
- Ladder conditions: isolated to binary alpha; seven opaque RGB colors each; delivered on exact-origin 270x480 canvases.
- Sensei states: isolated to binary alpha; 14 opaque RGB colors per frame; placed in 96x96 cells with a shared `(48, 84)` contact anchor.
- State sheet: 192x96, two 96x96 frames, `neutral` then `point`.
- Review scenes: 270x480 logical canvas with Engineering's 1.85x runtime presentation simulated using nearest-neighbor only.
