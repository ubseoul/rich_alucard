# ART SHIP 013 — Command validation

Executed from production base checkout on 2026-09-26:

- `python art_department/ships/art_ship_013/tools/build_candidates.py` — PASS; 7 candidates and 8 review boards built.
- `python art_department/ships/art_ship_013/tools/validate_candidates.py` — PASS; 7/7 candidate contracts, 212/212 frozen files, 8/8 review boards.
- `npm test` — PASS; deterministic release gate, 104 adventure screens, 17 combat screens, art-integration matrix remains 106 PASS / 15 HOLD.
- `npm run build` — PASS; built `ra-c6a49410e558-20260926194218` for `c6a49410e558be34aa44703015556c00a4e592c9`.
- `npm run verify:artifact` — PASS for `ra-c6a49410e558-20260926194218`.

An earlier artifact-verification attempt correctly failed before the long-running build had completed and produced `dist/build.json`; it was rerun after confirmed build completion and passed. No candidate or source file changed as a result.
