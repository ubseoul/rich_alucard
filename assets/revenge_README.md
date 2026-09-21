# Revenge reusable FX package

Visual thesis: The damage never disappeared. Rich was keeping it.

## Locked mechanic

Revenge reflects ALL actual accumulated damage Rich has received, deals EXACTLY that amount to the target, then resets stored damage to ZERO. This package does not implement or change that mechanic.

Particle count, sprite choice, mass size, scaling, opacity, visual caps and duration must never determine the damage amount. Read the existing authoritative stored-damage value; execute the existing damage and reset logic independently of these images. No thresholds, multipliers, charges, new attacks or additional rules are introduced.

## Assets and anchors

| Group | Count | Cell size | Local anchor | Role |
|---|---:|---|---|---|
| Stored wound shards | 4 | 16×16 | (8,8) | Persistent pieces positioned relative to Rich by runtime |
| Extraction states | 4 | 24×24 | (12,12) | Moving particles corresponding to the four stored marks |
| Revenge mass | 3 | 96×96 | (48,48) | Loose, tightened and condensed wound collections |
| Target crack overlays | 3 | 96×96 | (48,48) | Generic ruptures composited over the current target |
| Full-screen impact | 1 | 270×480 | (0,0) | Brief opaque screen overlay; not an environment replacement |

Draw at `worldAnchor - localAnchor`. Keep canvas padding; do not recenter by opaque bounds. A stored shard and its matching extraction particle use different canvas sizes but both have a center anchor, so swap them at the same world point.

Three mass states describe visual compression, not damage tiers. Their content becomes more compact inside one fixed cell. Runtime can repeat pieces or apply integer scaling/compositing to represent stored damage. The images contain no travel trail or projectile identity.

## Target masking

The target crack files contain generic interrupted fissures, no enemy silhouette. For silhouette-following:

1. Render the selected crack overlay on a temporary offscreen canvas in the CURRENT target's world pose coordinates.
2. Set the offscreen compositing operation to `destination-in` and draw that target's CURRENT reaction-frame alpha at its matching position.
3. Restore `source-over` and draw the result over the target.

Use the target's current dimensions/anchor as runtime inputs. Translate, tile or integer-scale the generic crack pattern for a different target size. Do not save an enemy-specific composite into the core FX package. Do not bake CEO or Rich into the layers.

Suggested roles: existing scene and characters; stored marks/extraction pieces relative to Rich; independent condensed mass where the runtime places it; current enemy reaction plus masked cracks; optional full-screen impact; existing UI policy. The package does not prescribe timing or a new sequence mechanic.

## Fear through restraint

Use the existing runtime to control timing, silence/audio, hit-stop, shaking, HP drain and reactions. These are a few held authored states, not a long tweened animation. The condensed forms and asymmetric wound seam provide the visual emphasis. No fireball, glow, radial blast, spellcasting pose, room replacement or character art is included.

## Rendering and files

All transparent components use binary alpha (0/255). The full-screen impact is fully opaque. Every file uses a subset of three colors: #10050D, #A40F32, #FFE3DE.

Use Canvas `imageSmoothingEnabled=false`, CSS `image-rendering:pixelated`, integer positions and nearest-neighbor scaling. Do not add blur/feathering during import.

Four sheets contain exact individual frames in left-to-right order: `revenge_stored_wound_sheet.png`, `revenge_extraction_sheet.png`, `revenge_mass_sheet.png`, `revenge_target_crack_sheet.png`. The JSON manifest defines all dimensions, anchors, roles and masking instructions. Existing Rich sprites, enemy sprites and environments remain separate and unchanged.
