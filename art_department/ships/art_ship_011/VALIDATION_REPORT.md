# ART SHIP 011 — Validation report

**Result:** PASS — 9 accepted for HQ review, 0 rejected for technical defect.

This is technical and internal visual validation. It does not grant HQ PASS, approval, freeze, style authority or runtime acceptance.

## Native pixel results

| ID | Dimensions | Opaque px | Opaque colors | RGBA | Alpha | Exact promotion | Deterministic source recreation |
|---|---:|---:|---:|---|---|---|---|
| A01 | 80×96 | 878 | 17 | PASS | 0/255 | PASS | PASS |
| A02 | 80×96 | 669 | 16 | PASS | 0/255 | PASS | PASS |
| A03 | 112×96 | 1,630 | 24 | PASS | 0/255 | PASS | PASS |
| A04 | 112×96 | 1,772 | 24 | PASS | 0/255 | PASS | PASS |
| A05 | 112×96 | 1,173 | 24 | PASS | 0/255 | PASS | PASS |
| A06 | 80×96 | 721 | 15 | PASS | 0/255 | PASS | PASS |
| A07 | 128×96 | 2,766 | 23 | PASS | 0/255 | PASS | PASS |
| A08 | 144×96 | 3,316 | 24 | PASS | 0/255 | PASS | PASS |
| A09 | 144×112 | 3,625 | 4 | PASS | 0/255 | PASS | PASS |

Every PNG has an 8-bit truecolor-with-alpha IHDR (`color_type=6`), a fully transparent padded cell border, nonempty opacity and only alpha values `0` and `255`.

## Pixel-integrity review

- Exploratory candidate bytes at `d8c24b6…`, Ship candidate bytes and production-path bytes match exactly for all nine assets.
- The archived selected design sources were reprocessed with the recorded deterministic extraction, crop, nearest-neighbor resize, palette and no-dither contracts. All nine recreated the exact exploratory native pixel arrays.
- Native 1× and exact 4× boards were inspected. No checkerboard remnant, halo, resampling blur or unintended edge corruption was found.
- A03's extracted silver garment remains connected and readable; no achromatic garment region was lost with the checker removal.
- A01's arm gaps, A04's joined-hand arch, A07's included furniture and A09's separate silhouette profiles remain intact.
- All depicted people read as adults. A02 is revealing/sensual but non-explicit.

## Environment compatibility

Six full-native-frame review composites confirm useful sparse, dense, performance, social, lounge and entrance roles. They are hypothetical placement evidence, not runtime mappings. A06 is not composited because this Ship does not assign a suitable bar/service context. No environment master bytes changed.

## Scope validation

- Runtime JavaScript changed: no.
- Named-character art changed: no.
- Rich, Portobello or family art changed: no.
- HOLD status changed: no.
- Combat FX/presentation changed: no.
- SEALED/HQ-only content accessed: no.
- Merge or deployment performed: no.

## Repository validation

`npm test` passes from the production branch. The deterministic release gate reports 110 JavaScript syntax checks, 104 adventure screens, 17 combat screens, 183 frozen registry files, 217 resolved runtime art references and the unchanged Engineering baseline of 106 PASS / 15 HOLD. Ship 011 adds no runtime reference and changes no PASS/HOLD status.

Machine-readable per-file IHDR, bounds, hashes and pass flags are in `VALIDATION_REPORT.json`.
