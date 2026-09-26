# ART SHIP 012 Closeout Provenance

The closeout branch begins at exact frozen ART SHIP 013 commit `9d6f521bdfc404f03a5f5bba7c700860de1eb293`.

The four HQ-passed candidate byte streams were restored directly from historical ART SHIP 012 commit `fcf094b30d5f8288f7727e5faf3f61fed8ff5016`. No raster operation, conversion, resizing, optimization, metadata edit, or re-encoding was applied. Their SHA-256 values remain identical to the HQ direction.

The initial Buckhead candidate was restored from commit `4c7477f0d3c73951a3a8494634ead38129c7d685`. The deterministic native-grid candidate was restored from commit `fcf094b30d5f8288f7727e5faf3f61fed8ff5016`. Both files were renamed only at the filesystem level to make their rejected status unambiguous; their byte streams remain unchanged.

The review boards are new review-only composites generated from those preserved PNGs. They are not candidate sources and must not be promoted.

No stale ART SHIP 012 version of a shared current-authority file was copied. In particular, `CURRENT_HANDOFF.md`, `START_HERE.md`, `ASSET_REGISTER.json`, `APPROVAL_LEDGER.md`, and `CURRENT_OPEN_ART_GAPS.*` remain the versions inherited from ART SHIP 013.
