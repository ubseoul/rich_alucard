# P-B — F07 owambe exterior and condition (A1) · paste-ready brief

Destination: ChatGPT images only if Ube identifies a genuinely absent condition. All four backgrounds are already frozen; this is a reuse and mapping review, with no new generation requested.

Use `art_department/production/f07-warehouse-backgrounds/`: interiors `warehouse_workday_270x480.png` and `warehouse_owambe_party_270x480.png`; exteriors `warehouse_exterior_270x480.png` and `warehouse_exterior_rich_enterprises_270x480.png`. Exact 270×480 opaque RGB PNGs. The party interior is wired for the party/office/duel; the base exterior is installed into the F07-only `owambe_party` arrival table. Workday reuse for `gbenga_rentals` remains an Engineering mapping item in P-D; do not substitute the exterior for an interior.

Ube review: approve the existing exterior bytes and the post-TAKEOVER repainted-sign mapping. The RICH ENTERPRISES variant belongs only to the existing post-TAKEOVER state. Do not add a story scene or show Rich on the Phase 1 field; BUILD-1's accepted phone framing stays intact. Before/after sign rect (54,104,163,30), 701 changed pixels, zero outside the authorized sign bounds, recorded in `exteriors/warehouse_exterior_approval.json`.

Palette: preserve the exact image palettes. Reference deep wine/royal blue and gold for the rental business; swatches #16151B, #34323A, #45434A, #DDD5C4, #B8AA90, #F0C65A. These swatches guide any *new approved* additive condition; do not recolor the existing masters. Do not extract overlays from the two opaque interiors: registration between them is not established.

## Shared acceptance

All women clearly 21+; sexy and suggestive, fully non-explicit core art. OPEN only. Preserve frozen originals byte-for-byte. No redesigned dancer identity, smoothing, inferred story, new dialogue or unreadable baked UI text. Pixels outrank prose. Reuse existing accepted masters before producing any additional asset. Ube judges women's and dancer art. New files are candidates until his exact-byte approval.

Deliver one folder/ZIP per package, named assets plus `manifest.json` (asset id, filename, dimensions, alpha, tier/pose/state, source paths+SHA-256, feet contact, visible bounds, face box) and a labeled contact sheet. Include source-resolution PNGs and final native PNGs separately. Never overwrite an existing production file. Record the final SHA-256 only after the approved normalization. Reviewer exports use integer nearest-neighbor scaling.

## Authority references

- `source_vault/art_authority/RAINMAKER_Dancer_Generation_Sheets_and_Wardrobe_Levels.docx`
- `source_vault/art_authority/OL017_OPEN_VISUAL_CHARACTER_AUTHORITY.md`
- `source_vault/art_authority/F01_FREEZE_RECORD.md`
- `art_department/production_authority/VOL2_CHARACTER_VISUAL_BIBLE_OPEN.md`
- `art_department/APPROVAL_LEDGER.md` and preserved newer approval snapshots under `art_department/build4/provenance/61a8a55/`
- `art_department/PLACEHOLDER_LOG.json`; approval evidence and source SHA-256 in `art_department/build4/PRESERVED_ART_HASH_AUDIT.json`

## Exact asset acceptance / mapping

### `f07_owambe_exterior` — RESOLVED — preserved byte copy / adapter

- Screen: THE PARTY arrival. Route: `assets/f07/play/index.html → FL_ART.exterior.owambe_party`.
- Native contract: 270×480 RGB.
- Reference: `art_department/production/f07-warehouse-backgrounds/exteriors/warehouse_exterior_270x480.png`.
- Acceptance: A1 exterior fallback replaced with approved bytes. A preserved RESOLVED row requests zero new pixels. Source hash matches, dimensions/alpha/contact match, same identity and scene function, no clipping of visible pixels or UI obstruction at 360/390/430. Creator-review or SOURCE_REQUIRED rows need Ube's specific decision before closing.

### `f07_rich_enterprises_condition` — CREATOR_REVIEW

- Screen: Warehouse sign after TAKEOVER. Route: `NEW_OGA_FINALE:takeover; F07 exterior condition adapter pending`.
- Native contract: 270×480 RGB.
- Reference: `art_department/production/f07-warehouse-backgrounds/exteriors/warehouse_exterior_rich_enterprises_270x480.png`.
- Acceptance: Review mapping of existing repainted sign to post-TAKEOVER exterior only; no new node or dialogue. A preserved RESOLVED row requests zero new pixels. Source hash matches, dimensions/alpha/contact match, same identity and scene function, no clipping of visible pixels or UI obstruction at 360/390/430. Creator-review or SOURCE_REQUIRED rows need Ube's specific decision before closing.
