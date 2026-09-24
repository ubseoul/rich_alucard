# Engineering Staging Notes — Art Ship 005

**Status:** ART HANDOFF ONLY — APPROVED MASTER / FROZEN; not runtime-integrated.

## Canonical lookup

Use `ENGINEERING_ASSET_MAP.json` for the exact OPEN-id-to-path mapping. Do not infer approval from neighboring files or folders; only the 52 paths in `ART_SHIP_MANIFEST.json` are frozen by this Ship.

## Character presentation

- Native character files remain 80x96 RGBA cells with binary alpha and source contact `(40, 88)`.
- Present primary gameplay characters at approximately 1.85x their historical on-screen scale using nearest-neighbor filtering.
- Never pre-scale, resample, smooth, mip-blur, edge-dilate or rewrite the native PNGs.
- These are accepted identity/pose anchors only; no alternate state or animation timing is implied.

## Environments

- All environment masters are opaque RGB at 270x480.
- Preserve the authored lower staging band and recommended contact line near y=372.
- No condition layer, hotspot, collision, crowd, UI or runtime Stage Contract is accepted by this Ship.

## Props and creature

- Preserve native transparent canvases and binary alpha.
- Select any readable runtime scale with integer nearest-neighbor presentation only after Engineering review; no runtime scale is baked into the art.
- The cube raster contains no label or trademark text. Runtime naming remains separate metadata.

## Integration boundary

This Ship changes art assets and Art Department records only. Runtime integration, behavior, dialogue, audio, save schema and deployment are not included.
