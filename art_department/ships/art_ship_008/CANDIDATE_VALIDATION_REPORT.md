# ART SHIP 008 — Candidate Validation Report

**Result: PASS**

Fourteen native candidates were checked against the accepted Runtime Demand Map.

- Character and corrected-state candidates: native `80×96`, RGBA, binary alpha, preserved contact convention or source contact row.
- Standard layers: native `270×480`, RGBA, binary alpha, exact origin `(0,0)`.
- Legacy condition layer: native `765×1024`, RGBA, binary alpha, exact origin `(0,0)`.
- Environment master: native `270×480`, opaque RGB.
- All 15 unique referenced frozen/approved sources still match their recorded SHA-256 hashes.
- The authorized frozen-state delta changes 65 pixels inside `x=13..18, y=56..73` and zero pixels outside it after RGBA normalization.
- Five deterministic integer-scale internal review boards were generated.

The machine-readable per-file checks and candidate hashes are in `CANDIDATE_VALIDATION_REPORT.json` and `CANDIDATE_PACKAGE_MANIFEST.json`.

This technical PASS does not grant Taste Pass, Approved Master, freeze, runtime integration or runtime acceptance.
