# Validation Report — Art Ship 005

**Result:** PASS — APPROVED MASTER / FROZEN PROMOTION

**Approval boundary:** Exact 52 named canonical production PNGs only. Runtime integration remains separate.

## Automated checks

| Check | Result |
|---|---|
| Exact manifest count: 52 | PASS |
| Category count: 28 characters, 20 environments, three props, one creature | PASS |
| Seven source-package validation reports | PASS |
| Accepted candidate SHA-256 equals canonical SHA-256 for all 52 | PASS — 0 mismatches |
| 32 transparent assets retain binary alpha | PASS |
| 20 environment masters remain opaque RGB at 270x480 | PASS |
| Asset tree: 218 files / 201 PNGs | PASS |
| Asset Register: 218 entries / 78 FROZEN | PASS |
| Runtime code changed | PASS — none |
| SEALED/HQ-only content accessed | PASS — none |

Per-file hashes and metadata are recorded in `VALIDATION_REPORT.json` and `ART_SHIP_MANIFEST.json`.

## Promotion verification

All 52 accepted source PNGs were copied byte-for-byte into canonical paths. Hashes were computed from the accepted candidate files before copy and again from canonical placement. Every pair matches. No image was regenerated, decoded, re-encoded, resized, retouched, resampled, optimized or reinterpreted.

## Runtime scale verification

The approximately 1.85x primary-character presentation target is documented solely as an Engineering runtime rule using nearest-neighbor filtering. Every character master remains native 80x96 with source contact `(40,88)`.

## Scope verification

Only `assets/before_the_fame/` and Art Department records/archive are changed. JavaScript, CSS, HTML, package metadata, game data and existing frozen assets are untouched. No runtime test or integration was authorized or performed.

**ART SHIP 005 — FROZEN / COMPLETE.**
