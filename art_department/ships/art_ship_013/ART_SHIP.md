# ART SHIP 013 — CANON CAST COMPLETION + RICH CONTINUITY CLEANUP

**Status:** CANDIDATE — READY FOR HQ REVIEW. No asset is approved or frozen by this package.

**Branch:** `art/art_ship_013`

**Production base:** `c6a49410e558be34aa44703015556c00a4e592c9` (ART SHIP 011 frozen checkpoint)

**Authorization:** Ube's ART SHIP 013 brief dated 2026-09-26.

## Mission and bounded scope

This Ship contains two separately reviewable workstreams:

1. **Workstream A — canon cast completion:** one neutral/default state each for `mom`, `dad`, `sister`, `portobello_wife`, `portobello_kid1`, and `portobello_kid2`.
2. **Workstream B — Rich identity continuity:** one corrected candidate for `rich.hookah_seated`, preserving the seated/hose function while restoring core Rich identity cues.

The brief is the authoritative visual card for the fictional family and Portobello household. No real-family likeness was used. The Portobello manager, brothers, God, Buckhead, OG Hooper, auntie, souls, training actors and all other unresolved identities remain outside scope.

## Candidate package

Seven native 80×96 RGBA/binary-alpha candidates use contact `(40,88)`. They live only under this Ship's `candidates/` directory. Proposed production ids and paths are recorded in `ENGINEERING_ASSET_MAP.json`; canonical `assets/` files were not changed.

The source renders were created with the built-in ImageGen workflow and deterministically prepared with `tools/build_candidates.py`: alpha thresholding, subject crop, BOX downsampling, palette reduction/remap, native centering and contact alignment. No baked checkerboard was present. The Rich correction is remapped only to the approved standing/curb Rich palette.

## Review package

- `review/01_family_native_1x.png`
- `review/02_family_exact_6x.png`
- `review/03_family_context_2x.png`
- `review/04_portobello_household_native_1x.png`
- `review/05_portobello_household_exact_6x.png`
- `review/06_portobello_contexts_2x.png`
- `review/07_rich_continuity_native_1x.png`
- `review/08_rich_continuity_exact_6x.png`

Context boards are review-only composites. Frozen environment and reference pixels are unchanged.

## Runtime and approval boundary

The six new identities create expected opportunities for three held family screens and four Portobello screens. The office Portobello screen remains held because `portobello_manager` is outside scope. The Rich hookah correction is a continuity/polish replacement opportunity on already-PASS minigame surfaces and does not clear a HOLD.

Engineering/runtime QA owns integration, registry wiring, Presentation Director checks and any HOLD movement. HQ/Ube must explicitly accept exact candidate bytes before promotion. This Ship does not self-award HQ PASS, does not freeze, and does not modify the Approved Asset Index.

## Explicit exclusions

ART SHIP 012, laptop Rich, Portobello Rich, manager/auntie/soul/training dummy, Buckhead, additional nightlife population, PLAYMAKERS, Royal Glitch, audio, runtime JavaScript, SEALED/HQ-only content, merge and deployment were untouched.

## Stop point

**ART SHIP 013 — READY FOR HQ REVIEW. STOP and await HQ decision.**
