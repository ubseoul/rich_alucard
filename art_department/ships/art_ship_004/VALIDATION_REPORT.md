# Validation Report — Art Ship 004

**Result:** PASS — APPROVED MASTER / FROZEN PROMOTION
**Approval boundary:** Exact six named canonical production files only. Runtime integration remains separate.

## Automated checks

| File | Size | Mode | Alpha | Opaque colors | Result |
|---|---:|---|---|---:|---|
| `ocean_floor_base_270x480.png` | 270x480 | RGB | Opaque | 24 | PASS |
| `ladder_intact_overlay_270x480.png` | 270x480 | RGBA | Binary | 7 | PASS |
| `ladder_collapsed_overlay_270x480.png` | 270x480 | RGBA | Binary | 7 | PASS |
| `octopus_sensei_neutral_96x96.png` | 96x96 | RGBA | Binary | 14 | PASS |
| `octopus_sensei_point_96x96.png` | 96x96 | RGBA | Binary | 14 | PASS |
| `octopus_sensei_state_sheet_192x96.png` | 192x96 | RGBA | Binary | 27 total across both frames | PASS |

Hashes and exact opaque bounds are recorded in `ART_SHIP_MANIFEST.json` and `VALIDATION_REPORT.json`. The final checks target the canonical `assets/goldfish_years/` production paths.

## Visual checks

- Strong silhouettes survive nearest-neighbor runtime preview at 1.85x.
- Sensei's two states remain the same character; the point state changes only the gesture read.
- Rich is the approved source file, reused unchanged.
- The environment preserves a large, calm central field for larger in-engine characters and phone UI.
- Ladder states are readable, mutually exclusive, and share one exact-origin scene contract.
- Pixel edges are hard; no antialiasing, bloom, fake CRT/VHS treatment, or baked post-processing is present.
- No Yoruba, spiritual, or other unauthorized cultural symbols were introduced.
- The environment uses broad clusters and restrained shading rather than micro-detail noise.

## Corpus consistency

The selected set follows the approved 270x480 environment family and the established compact character-cell system. Sensei occupies a 96x96 source cell because the squat eight-limb silhouette needs more horizontal room; the visible figure remains deliberately compact. This is not compensation for runtime scaling.

## Taste and technical decisions

Ube/HQ passed the Sensei identity, narrow precarious ladder, midnight-ocean palette, and intact/collapsed continuity at candidate level on 2026-09-24. HQ then granted TECHNICAL PASS and authorized exact-file APPROVED MASTER / FROZEN promotion.

## Production correction verification

- Candidate board explicitly states `1.85X NEAREST-NEIGHBOR` and `SOURCE SPRITES UNCHANGED`.
- Manifest and staging notes use the same authoritative approximately 1.85x historical on-screen target.
- Review scene actors remain composed at 1.85x using nearest-neighbor.
- Search across the Ship and handoff package returns no obsolete-scale references.
- All six canonical production hashes match the accepted candidate hashes. Native art was not regenerated, resized, repainted or redesigned.
- All five transparent production PNGs use binary alpha only; the ocean-floor base is fully opaque.
- Canonical paths, manifest paths and Asset Register entries agree.
- No runtime source, JavaScript, CSS, HTML, game data, save schema or existing frozen Rich asset changed.

**ART SHIP 004 — FROZEN / COMPLETE.**
