# Blood Bath reusable FX package

These assets contain only Blood Bath liquid and abstract impact graphics. They contain no attacker, enemy, enemy silhouette, clothing, room or UI. Existing character and environment files are unchanged. Use Rich's existing authored attack pose separately.

## Layer order

1. Existing battle environment.
2. One rear floor-rise state (01, 02 or 03).
3. The current target's own normal, heavy or lethal reaction sprite, selected by the existing runtime.
4. Optional engulf overlay.
5. Foreground blood layer.
6. Contact splash at the actual hit point.
7. Optional opaque full-screen impact frame.
8. Existing UI, according to the game's existing overlay policy.

The runtime controls timing, movement, hit-stop, shake, palette flashes and extra particles. The package introduces no damage values, mechanics, attack variants or timing rules.

## Dimensions and anchors

- Rear rise and foreground: 270×362 RGBA, local anchor (135,362). To map the layer to a floor point (floorCenterX,floorY), draw at (floorCenterX−135,floorY−362). All lower edges share that floor line. Transparent padding is intentional; do not trim it.
- Contact states: 96×96 RGBA, local anchor (48,48). Draw at (contactX−48,contactY−48). This is a hit-point effect, independent of target species, clothing or silhouette.
- Engulf overlays: 96×96 RGBA, local anchor (48,88). Place against the current target's runtime ground anchor. No target-shaped cutout is baked in. Translate, tile or use integer scaling when a future target has different bounds. The PNGs remain unchanged.
- Full-screen impact: 270×480, fully opaque, origin (0,0). Three colors only: red, near-black and off-white. It is a replacement screen flash, not a transparent target overlay.

## Optional target masking

For blood that follows a particular target silhouette, build a temporary offscreen layer at runtime using that target's CURRENT reaction-frame alpha. Clip the generic blood overlay with Canvas `destination-in`, then restore `source-over`. Do not save the resulting composite as a new core Blood Bath asset. Any target-specific mask comes from the current target at runtime; the supplied overlays have no hardcoded enemy outline.

Floor layers may be clipped to a runtime-selected battle region to avoid covering the attacker or non-target participants. The target's bounds and contact point are runtime inputs, not facts embedded in the art. No changes to Rich's sprite are required.

## Pixel rendering

Set `imageSmoothingEnabled = false`; use `image-rendering: pixelated` for CSS display. Use integer source rectangles, destination positions and display scale. Transparency is binary (0/255); all transparent FX use the same five opaque colors. Avoid blur, alpha feathering and bilinear resizing.

## Sheets

`blood_bath_floor_sheet.png`: 2×2 cells, each 270×362. Reading order: rise01, rise02, rise03, foreground01.

`blood_bath_contact_overlay_sheet.png`: 2×2 cells, each 96×96. Reading order: contact01, contact02, engulf01, engulf02.

The sheets contain exact copies of the individual PNGs. `blood_bath_manifest.json` contains dimensions, anchors and roles. Neither sheet is intended to be drawn in its entirety during combat.
