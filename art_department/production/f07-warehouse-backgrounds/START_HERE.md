# START_HERE - F07 warehouse backgrounds (frozen art package)

Status: **creator-approved / frozen** (approver: Ube). Runtime integration: **PENDING** (not wired; no runtime files touched).

## Contents (paths relative to this folder; machine inventory: `inventory.json`)

| File | Format | Bytes | SHA256 |
|---|---|---|---|
| `interiors/warehouse_workday_270x480.png` | 270x480 RGB opaque | 179277 | `a4d36fcfa06a18503fbd037a24442e674ee3e9601fd5fde32027b0e37e70357d` |
| `interiors/warehouse_owambe_party_270x480.png` | 270x480 RGB opaque | 192244 | `4431afd5b0c0bb3ae47a03a899600ec98b755d15334b7fd825a5ed1cbf5f0899` |
| `interiors/manifest.json` | - | 9687 | `a21fbb4c33e3d1f5b1beb79a412a427729fbf69737865339425f1dfc6a98ce50` |
| `interiors/production_approval_record.md` | - | 3221 | `0831b0ba3abd46708b5e33894d5cfc5c51af099c9d23adb0ed8dfd5709095744` |
| `exteriors/warehouse_exterior_270x480.png` | 270x480 RGB opaque | 138736 | `0f62562efa01e6023858e092bd72c40c3c757009a63d1bb1157e0fef528abd14` |
| `exteriors/warehouse_exterior_rich_enterprises_270x480.png` | 270x480 RGB opaque | 139380 | `71176517270e72b67aea396878a14022c53b033ccf6c469d02069e9ac196295e` |
| `exteriors/warehouse_exterior_approval.json` | - | 8639 | `7f3c57ebaff2782f11e67ab452b496e0519ca6554017b9f08abff419f63f6c39` |
| `exteriors/warehouse_exterior_manifest.json` | - | 4784 | `438437dc0a3c9f4ca876fcf3fe7b3023f594b3f06b9d3c691753b713b3a48a93` |
| `exteriors/owambe_party_exterior_normalization.json` | - | 3222 | `5b14d7864980c0bc03ad6d7e285537794eaf56d12464225b7f7756f8132e4d7d` |

PNGs are copied byte-for-byte; records are preserved byte-for-byte (scoped `.gitattributes` here sets `* -text` so no line-ending normalization alters recorded hashes).

## Interiors (`interiors/`)
- WORKDAY and OWAMBE PARTY are **separate complete opaque backgrounds**. No overlay is approved or extracted.
- Pixel-perfect registration between them is **not established** (see `manifest.json` / `production_approval_record.md`).
- Source provenance: normalized from 941x1672 sources `stove_f_warehouse_workday_candidate_v2.png` (sha256 `da7c60d0...d3fa`) and `stove_h_warehouse_owambe_party_candidate.png` (sha256 `537f2bb8...b645`) in the STOVE F artist output folder (not included here); recorded NEAREST crop/resize transform in the manifest.

## Exteriors (`exteriors/`)
- `warehouse_exterior_270x480.png` is the base; `warehouse_exterior_rich_enterprises_270x480.png` changes only the sign region (sign bounds x,y,w,h = 54,104,163,30). Recorded changed pixels: 701; changed bbox (72,109)-(198,130), all inside the sign bounds; zero pixels changed outside. Re-verified when this package was built.
- Provenance: STOVE G, Ube-approved v2 source `stove-g-warehouse-exterior-candidate-v2.png` (941x1672, sha256 `fabab780...5fe1`), normalized with the recorded transform; see `warehouse_exterior_approval.json`.

## Original source locations
- Interiors: `C:/Users/Ube/Documents/Codex/2026-10-01/stove-f-warehouse-workday-base-art/outputs/warehouse_party_production_candidate/`
- Exteriors: `C:/Users/Ube/Documents/Codex/2026-10-01/stove-g-warehouse-exterior-background-candidate/outputs/`