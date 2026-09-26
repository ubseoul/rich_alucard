# ART SHIP 012 Closeout — Command Validation

Validation run on `art/art_ship_012_closeout` after exact-byte promotion:

- `python art_department/ships/art_ship_012_closeout/tools/validate_promotion.py` — PASS
  - 219/219 baseline frozen hashes preserved
  - 5/5 promoted files byte-identical to accepted candidates
  - 224/224 final frozen hashes verified
  - 364 Asset Register entries
  - 2/2 rejected Buckhead provenance hashes preserved
  - zero out-of-scope or runtime changes
- `npm test` — PASS
- `npm run build` — PASS
- `npm run verify:artifact` — PASS
- `git diff --check` — PASS

These checks validate the Art promotion package and repository release gates. They do not perform runtime integration, change Presentation Director mappings, alter PASS/HOLD status, merge or deploy.
