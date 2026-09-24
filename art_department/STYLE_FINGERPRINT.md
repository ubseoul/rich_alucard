# Approved character pixel study

**Calibration: HQ PASS. Bllad33 generation remains stopped.**

The board is assembled from unchanged PNG sources, using crops and integer nearest-neighbor enlargement only. No image generation, repainting, palette reduction or character redesign was performed. Approval scope for the earlier cast comes from the onboarding reference guide; Ogun's source is the explicitly HQ-frozen Card 02 master. Generic vocabulary figures and rejected Bllad33 designs are excluded from the calibration set.

Inspect the runtime PNGs listed in references/CHARACTERS.md at100%. Historical review boards are optional and not needed for this study. No image was created or copied during system implementation.

## Measured source evidence

| Character | Cell | Opaque width x height | Unique opaque RGB colors |
|---|---|---|---|
| Rich standing | 80x96 | 27x52 | 11 |
| Ogun neutral | 80x96 | 26x56 | 14 |
| Assistant idle | 80x96 | 32x54 | 19 |
| Daughter neutral | 80x96 | 21x54 | 15 |
| Importer neutral | 80x96 | 27x56 | 13 |
| CEO idle | 80x96 | 34x61 | 24 |

These are exact alpha-bound measurements. CEO's width includes his briefcase and height includes his crown. Hair is included for every character. All six sources end at opaque row87, immediately above the common y88 contact edge. The full cell dimensions must not be confused with the visible body.

## Proportions and construction

**Head/body:** the board's inspection bands are approximately 25px for Rich, 18px for Ogun and 23px for Assistant, measured from the top of the hair through the face/neck transition. These are visual reading bands, not segmented skull measurements. They account for roughly 48%, 32% and 43% of each visible envelope. Rich's heavy hair silhouette materially affects that ratio. Ogun proves that the game permits a smaller head and longer body; the cast does not impose one universal chibi ratio. The earlier prompts prescribing a 12px head were not grounded in these sources.

**Shoulders/torso:** shoulder bones cannot be measured reliably through clothing and hair. As reproducible upper-body silhouette samples, Rich at source row60 spans x32–48 (17px), Ogun at row52 spans x29–50 (22px), and Assistant at row56 spans x26–54 (29px). These include clothing, arms or hair. Rich's torso is a compact near-black vertical shape; Ogun widens into sleeve/lapel blocks and narrows into his trousers; Assistant's long hair overlaps the shoulder and sleeve construction. Do not convert total silhouette width into a muscular shoulder specification.

**Hands:** Rich's enlarged hand crop is a short skin block beneath a dark sleeve with a tapered lower edge. Assistant's joined hands form a small shared light shape. Ogun's hand is a restrained break at the sleeve/pocket area. Finger anatomy is not the source of readability.

**Feet:** shoes have a distinct stepped toe, a short heel/body and very sparse light interruptions. Rich's shoe sole uses thin bright marks, while Ogun's shoes stay mostly dark. The two feet are not mirrored decorative icons: direction and stance carry the pose.

## Face, hair and marks

**Face resolution:** Rich's face is a small opening beneath a much larger hair mass. The entire head crop is only 27px wide including hair; the exposed face is substantially smaller. His shades, brown planes and tiny mouth/fang marks do the work. Ogun's whole sprite is just 26px wide, and his facial marks occupy a fraction of that. A large rendered face with brows, cheek modeling, beard texture and lens reflections is the wrong working scale.

**Eyes:** Rich uses an opaque shades band. Ogun uses sparse light/dark marks rather than articulated eyes. Assistant's visible face does not need large eyeballs; dark hair frames it. Daughter's turned face retains a few high-contrast eye pixels. Importer's glasses read as a narrow horizontal interruption. CEO's tiny red accents inside dark sockets are an identity exception, not a general eye treatment.

**Hair:** Rich's outer jagged mass has deliberate stair-step lobes and a restrained internal dark plane. Assistant uses a continuous framing mass with a few grouped violet highlights. Importer uses broad gray divisions. Daughter's tied hair extends the silhouette. None requires individually modeled strands or regular shiny waves.

**Outlines/internal lines:** one source pixel is the useful working contour scale, but merging black hair/clothes can create thicker regions. Internal cuts share dark colors with the outline. Lapels, sleeve separations and trouser gaps are short structural cuts, not a full network of thin drawn seams.

## Color, highlights and folds

Rich's three dominant dark RGB values occupy 837 of his 947 opaque pixels: about 88%. His three brown skin colors occupy 91 pixels. The bright white occupies nine pixels across the whole sprite; the green earring family occupies six. These small color allocations explain why identity accents matter more than global surface polish.

Ogun has three closely spaced ivory colors, two main skin colors and several near-duplicate dark values. The raw 14-color count should not be mistaken for 14 useful material tones. Assistant has 19 colors with skin/blush and small accent variations, so imposing a universal 12- or 16-color cap would not faithfully describe the existing cast.

Highlight/shadow size varies by function: Rich's bright marks can be only one source pixel thick; hair and clothing shadows are larger connected planes. Ogun's jacket uses broad ivory areas interrupted by small dark wedges. Assistant has wider grouped dark-violet hair planes. The rule is not that every cluster must be 2x2, nor that every material needs a highlight. Tiny identity accents and broad structural planes have different jobs.

Fold density is low. Rich's garment reads first as one dark object; Ogun's lapels and sleeves do most of the jacket explanation; Assistant's blouse and sleeve overlaps organize the torso. A repeated diagonal crease on every limb or several glossy bands down every trouser leg would add detail the approved native shapes do not need.

## Scale and project identity

The native 1x copies visibly preserve silhouette, hair shape, eyewear, major garment contrast, stance and isolated identity accents. Many enlarged facial or cloth marks merge into these larger readings. This is why an attractive zoomed illustration is insufficient calibration.

This is source-scale evidence, not a live gameplay test. Existing runtime actor scales vary by scene; the supplied standard records 1.25x docks and 1.5x curb presentation, while the accepted Ogun/Rich composition proof uses 1x. Bllad33's runtime placement and scale are not established here. Engineering should inspect any later authorized sprite at its assigned presentation scale rather than alter frozen source pixels to compensate for layout.

What makes the cast specific is the combination: Rich's large black hair and shades with tiny green/white interruptions; compact hands and shoes; dark contemporary clothing described through very few planes; exaggerated identity shapes such as the CEO crown; and Ogun's restrained ivory jacket placed against that grammar. Proportions vary, but the information budget stays small. The recent Bllad33 boards drifted toward fashion illustrations with a pixel surface treatment, too many folds and too much face/hair modeling.

## RULES THE NEXT BLLAD33 SPRITE MUST INHERIT.

1. Establish the native small sprite first within the existing 80x96/contact-y88 convention. Judge its visible envelope beside unchanged Rich and Ogun before making a large review image.
2. Choose head/hair mass from direct comparisons, not an assumed universal 12px head or realistic fashion-model anatomy.
3. Make hair, shades, tailored garment silhouette and the single cane readable at native size. Preserve the VD02 brief; style calibration does not select a costume winner.
4. Construct hands, feet and face as small purposeful clusters. Spend a few identity pixels where they matter rather than modeling every surface.
5. Use roughly one-pixel contour logic, broad material planes and sparse structural interior cuts. Avoid strand texture, repeated folds and gloss ramps.
6. Start with roughly two or three useful tones per material, with justified accent pixels. Do not recolor approved references or impose a universal total-color limit.
7. Supply actual native comparison evidence and exact integer nearest-neighbor enlargement when the next drawing is authorized. Calibration has passed; further Bllad33 generation requires a new authorized Art Ship and fresh-agent onboarding PASS.


Source locations and current hashes: ASSET_REGISTER.json. Measurements below were rechecked against repository copies; no rejected exploration is a style source. PIXELS OUTRANK PROSE for measuring established visual grammar. Written canon controls character/world facts.

## ART SHIP 003 approved additions

Shannon is now an approved cast calibration source in the shared 80x96/contact-(40,88) grammar. Her neutral and controlled-reaction masters use compact visible envelopes of 22x56 and 29x56 pixels respectively; the reaction broadens posture without changing source contact. Use the individual masters for placement and the two-cell sheet only as a handoff convenience.

The Property exterior and interior establish an additional approved 270x480 environment family. The clean interior base and binary-alpha problem overlay share exact full-canvas registration at origin (0,0); preserve that separation so gameplay can change the visible condition without repainting the base. The 96x96 ownership image is an approved exterior-derived UI identity, not a replacement environment source.

The ordinary giant-rat vocabulary uses padded 96x64 cells with contact (48,56) and intended 1.25x presentation. Alert, scurry and recoil have measured opaque envelopes of 68x29, 72x24 and 68x39 pixels. Their silhouette and low-detail cluster logic are approved creature vocabulary; their runtime behavior and all PLAYER-BLIND disposition remain outside this visual calibration.

## ART SHIP 004 approved additions

Octopus Sensei adds an approved compact non-humanoid character grammar in 96x96 cells with contact (48,84). Neutral and point states preserve the same 14-color identity, squat eight-limb silhouette, tiny spectacles and sparse accent logic; the gesture changes without proportion redesign. Use the individual masters for placement and the two-cell sheet only as a handoff convenience.

The Goldfish Years adds a frozen 270x480 midnight-ocean environment base with broad calm staging space. Intact and collapsed ladders are separate seven-color binary-alpha overlays registered at exact origin (0,0), not alternate repaints of the base. This base-plus-condition pattern is approved scene-construction authority alongside the Property base/overlay system.

Primary gameplay characters are presented by Engineering at approximately 1.85x their historical on-screen scale with nearest-neighbor filtering. This larger runtime footprint informs environment negative space, anchors and UI clearance; it does not authorize larger native source sprites or proportional redesign.
