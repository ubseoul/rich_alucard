# Rough Complete Engineering visual snapshot

This is a dated, read-only reconciliation of the Rough Complete implementation branch for Art planning. It is not current runtime truth and does not authorize code changes.

## Reconciled commits

- Art authority / current `origin/main`: `a2992617b825acf1ab7a9bdb187d2caca66be701` (ART SHIP 006 frozen).
- Read-only Rough Complete branch: `origin/claude/eloquent-shannon-kc5qkn` at `c2a637bb2df8143f117cff1cecc8ca1cff6ba11e`.
- Branch merge base: `f2ca7d4393ec5af60ae6ecb53eec001b449a649e`.
- The Rough Complete branch is not merged or deployed. Its `docs/btf/ART_INPUTS.md` is historical Engineering demand, not current Art truth.

## What Engineering says exists on the branch

The branch checkpoint reports save v12, the W1–W5 OPEN adventure set, the life clock, phone Life OS, Combat 2.0, nine feel-track minigames, and browser/persona validation. It also reports that all new environments and characters are honest `RAPixel` placeholders; the current runtime does not consume the frozen ART SHIP 004/005/006 assets.

The branch's generated demand is:

- 61 placeholder environment ids at 270×480;
- 56 placeholder character ids/slots using the 80×96/contact `(40,88)` convention where applicable;
- Rich contextual states;
- Mazda stages, sphynx cat, catches, Dragon Maggi Cube, Agege bread, guns and bedroom overlays/props;
- WORLD/LISTING/TOUGE vehicle surfaces;
- full phone/app screens and cards;
- four missing radio loops (audio is outside Art scope).

## Integration truth

### Frozen and already in the repository

The frozen pixels are present under `assets/` and indexed by `art_department/ASSET_REGISTER.json` and `APPROVED_ASSET_INDEX.md`. ART SHIP 004 has 6 files, ART SHIP 005 has 52 files, and ART SHIP 006 has 57 files. Their manifests and Engineering maps are authoritative.

### Frozen but not runtime-integrated

ART SHIP 004/005/006 explicitly record handoff-only status. The Rough Complete branch still paints missing surfaces through `RAPixel`, so the next Engineering integration task must map canonical individual masters, overlays, states, and icons into the branch without changing their bytes. Handoff sheets are convenience references; individual masters control placement.

### Existing runtime art

The pre-Rough-Complete mainline runtime continues to use its existing approved legacy art (Rave, Property, JDM/Supra, Rich/bedroom and related assets). Do not infer active usage from a filename: use runtime references plus the Art Register and the relevant Ship map. No frozen Ship 004/005/006 image is assumed integrated until Engineering records that mapping.

## Current visual demand

Use `art_department/CURRENT_OPEN_ART_GAPS.md` and `.json`. The map separates satisfied frozen anchors, derivative states, new identity work, environment masters/conditions, integration work, and blocked/restricted demand. It supersedes the historical `docs/btf/ART_INPUTS.md` for current planning.

## Runtime presentation rule

Primary gameplay characters target approximately 1.85× historical display with nearest-neighbor. This is presentation only; source sprites remain native-size and frozen. Composed throne/bedroom art has its own composition contract and is not to be blindly rescaled.

## Sources checked

- `origin/claude/eloquent-shannon-kc5qkn:docs/btf/ART_INPUTS.md` (historical demand map)
- `origin/claude/eloquent-shannon-kc5qkn:docs/btf/CHECKPOINT.md` (implementation status)
- `origin/claude/eloquent-shannon-kc5qkn:docs/btf/DECISIONS.md` (display/integration decisions)
- `art_department/ships/art_ship_004/`, `art_ship_005/`, `art_ship_006/` (frozen authority)

Sealed/HQ-only source files were not opened or imported.
