# ART SHIP 009 — Promotion Validation Report

**Result: PASS**

## Promotion gates

- 12/12 canonical frozen PNGs are byte-identical to the HQ-approved candidates at checkpoint `47da18d9984c4915d3325709364db9a442fb3b36`.
- 199/199 frozen Asset Register entries pass file-existence and SHA-256 verification.
- 18/18 protected source/reference hashes remain unchanged.
- All package and institutional-memory JSON records parse successfully.
- `lan_night` remains an approved zero-pixel reuse of frozen `tristan_apt`; no duplicate `lan_night` bitmap exists.
- Scope audit passes: only Art Department records and the 12 approved canonical asset paths changed. No runtime/gameplay path changed.
- No SEALED/HQ-only source was accessed.
- Cold-start onboarding validation passes all 23 required references and reconciles the 199/339 corpus/register totals with the unchanged 98 PASS / 23 HOLD runtime baseline.

## Repository gates

- `npm test` — PASS.
- `npm run build` — PASS.
- `npm run verify:artifact` — PASS (`ra-47da18d9984c-20260925222013`).

The build identifies the accepted candidate checkpoint because promotion changes were uncommitted when the repository gate ran. Runtime/gameplay bytes remain unchanged. No merge, deployment or runtime integration was run or authorized.
