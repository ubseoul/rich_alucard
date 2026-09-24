# Engineering Staging Notes — ART SHIP 006

- Use `ENGINEERING_ASSET_MAP.json` for semantic ids and canonical paths.
- Character/Rich sources remain 80x96 with anchor/contact `(40,88)`; present primary gameplay characters at approximately 1.85x with nearest-neighbor filtering where the Stage Contract calls for it.
- TOUGE sources are 16x28 with bottom-center anchor `(8,27)` and noses oriented upward.
- Icons are 24x24 transparent sources. Add labels in UI code; do not bake text into the icons.
- Environment variants are opaque 270x480 full-frame states. They are not overlays and must replace their matching base frame only where the scene requests that state.
- This Ship supplies art and mappings only. Runtime integration remains an Engineering change with separate review.
