# Engineering Staging Notes — Art Ship 004

**Technical-review revision:** 2026-09-24
**Authoritative presentation target:** approximately 1.85x historical on-screen scale, nearest-neighbor. Native source pixels remain unchanged.

**Art status:** The six canonical files under `assets/goldfish_years/` are APPROVED MASTER / FROZEN. Runtime integration acceptance remains separate.

## Implementation contract

- Use a 270x480 logical scene canvas.
- Keep source pixels unscaled in the asset bundle. Apply the project's approximately 1.85x historical on-screen character presentation scale at runtime with nearest-neighbor filtering.
- Do not resize, resample, or rewrite the supplied PNGs during import.
- The ladder overlays are exact-origin scene layers. Place either one at `(0, 0)`; never display both.
- Composite in this order: ocean base, ladder condition, actors, dialogue/controls.

## Actor placement

| Actor | Source cell | Source contact anchor | Recommended world anchor | Runtime presentation |
|---|---:|---:|---:|---:|
| Rich, existing approved asset | 80x96 | `(40, 88)` | `(65, 370)` | ~1.85x, nearest-neighbor |
| Octopus Sensei | 96x96 | `(48, 84)` | `(195, 352)` | ~1.85x, nearest-neighbor |

The world anchor is the scene-space point to which the scaled source contact anchor should resolve. The supplied review compositions demonstrate the intended footprint; they are not alternate source assets.

## State usage

- Start A00 with `assets/goldfish_years/layers/ladder_intact_overlay_270x480.png`.
- At the collapse beat, switch atomically to `assets/goldfish_years/layers/ladder_collapsed_overlay_270x480.png`.
- Use Sensei `neutral` for default dialogue and listening.
- Use Sensei `point` for the compact instruction/collapse beat. Return to `neutral` afterward.
- State-sheet frame order is left-to-right: `neutral`, `point`; each frame is 96x96.

## Interaction and UI staging

- Suggested ladder hotspot before collapse: scene rectangle approximately `x=164..214, y=0..380`. This is deliberately more generous than the visible pixels.
- Suggested collapsed-ladder hotspot: `x=76..266, y=338..405`.
- Keep the top dialogue reserve around `x=16..254, y=24..124`.
- Keep the bottom control reserve around `x=8..262, y=400..472`.
- Keep Rich left of center and Sensei on the right. This preserves the conversational diagonal and leaves the upper center clear for dialogue.
- The environment's broad middle band is intentional staging room for the larger runtime footprints; do not fill it with extra debris.

## Import checks

- Preserve binary alpha on all transparent assets.
- Disable smoothing, mip blur, texture filtering, or automatic edge dilation that changes pixel edges.
- Verify the 270x480 overlays align at exact origin on all phone aspect-ratio containers.
- Treat collision and tap areas as authored rectangles, not per-pixel masks.
- Do not infer broader approval from delivery. Only the six exact canonical paths in the Ship manifest are APPROVED MASTER / FROZEN; additional states or pixel changes require a fresh HQ delta.
