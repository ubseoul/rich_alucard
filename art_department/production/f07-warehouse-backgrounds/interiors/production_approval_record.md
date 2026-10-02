# STOVE H — Warehouse interiors production approval record

Status: ACCEPTED TECHNICAL DERIVATIVES.
Approver: Ube. Acceptance authority: explicit user instruction in the existing warehouse interior artist chat.
Acceptance recorded: 2026-10-01 (America/New_York).

The following assets are accepted as separate complete opaque backgrounds, WORKDAY and OWAMBE PARTY.

## warehouse_workday_270x480.png

- Exact path: `C:\Users\Ube\Documents\Codex\2026-10-01\stove-f-warehouse-workday-base-art\outputs\warehouse_party_production_candidate\warehouse_workday_270x480.png`
- SHA256: `a4d36fcfa06a18503fbd037a24442e674ee3e9601fd5fde32027b0e37e70357d`
- Format: PNG, 270×480 pixels, RGB, opaque (no alpha channel).

## warehouse_owambe_party_270x480.png

- Exact path: `C:\Users\Ube\Documents\Codex\2026-10-01\stove-f-warehouse-workday-base-art\outputs\warehouse_party_production_candidate\warehouse_owambe_party_270x480.png`
- SHA256: `4431afd5b0c0bb3ae47a03a899600ec98b755d15334b7fd825a5ed1cbf5f0899`
- Format: PNG, 270×480 pixels, RGB, opaque (no alpha channel).

## Approved source images

- Ube-approved / frozen WORKDAY revision 2: `C:\Users\Ube\Documents\Codex\2026-10-01\stove-f-warehouse-workday-base-art\outputs\stove_f_warehouse_workday_candidate_v2.png`
  - SHA256: `da7c60d0ec4ade5f87b9dc770ed36c4fe0634f6cefad09e4869652617428d3fa`
  - Source dimensions: 941×1672, RGB.
- Ube-approved OWAMBE party design candidate: `C:\Users\Ube\Documents\Codex\2026-10-01\stove-f-warehouse-workday-base-art\outputs\stove_h_warehouse_owambe_party_candidate.png`
  - SHA256: `537f2bb84ecd46bcf63c11912249dd9313ce04650f78581816eccb0fff14b645`
  - Source dimensions: 941×1672, RGB.

## Shared normalization transform

- Both sources use the identical crop box in source edge coordinates: `(left=0.25, top=0.0, right=940.75, bottom=1672.0)`.
- Effective crop dimensions: 940.5×1672; centered removal of 0.25 source pixels from each horizontal edge. No padding.
- Operation: `Image.resize((270,480), resample=Image.Resampling.NEAREST, box=(0.25,0.0,940.75,1672.0))`.
- Isotropic target/source scale: `480/1672 = 60/209`; source/target scale: `1672/480 = 209/60`.
- Continuous edge-coordinate mapping: `x_target=(x_source-0.25)*480/1672`, `y_target=y_source*480/1672`.
- Existing workday normalization was verified against its frozen source hash and reproduced pixel values, then reused. Party normalization uses the same transform.

## Acceptance scope and remaining work

- Accepted as two separate complete backgrounds. This approval does not approve a transparent overlay.
- Pixel-perfect registration is not established. Sampled visible architecture measured best at zero translation, but generated color/texture differences remain; occluded geometry could not be verified.
- No overlay is approved or extracted.
- Runtime integration remains pending.
- Both normalized PNGs and approved source files are preserved unchanged. No regeneration, runtime edits, commit or push performed.
- Technical measurements, output hashes and native-size QA: `C:\Users\Ube\Documents\Codex\2026-10-01\stove-f-warehouse-workday-base-art\outputs\warehouse_party_production_candidate\manifest.json`.
