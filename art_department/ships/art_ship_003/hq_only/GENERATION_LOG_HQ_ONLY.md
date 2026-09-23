# HQ Only — Image Generation and Selection Log

**Mode:** Built-in `image_gen` tool  
**Final project location:** `outputs/property_creative_candidate/`  
**Raw generations:** retained only under the local task `work/property_creative_candidate/raw/`; raw files are not production candidates.

Every generated raster was inspected, reduced to its declared native canvas, palette-controlled, converted to binary alpha where applicable, and checked at actual size. Existing approved references were never overwritten.

## Shannon neutral

**References:** approved Rich standing, Ogun neutral, Assistant idle, Daughter neutral, Importer neutral.  
**Final candidate:** `assets/shannon_neutral_80x96.png`.

**Final prompt:**

> Create Shannon, a recurring adult woman working in Los Angeles real estate, as one full-body neutral/conversation pixel sprite for the Rich Alucard game. Match the references' native sprite language: tiny face, large deliberate pixel clusters, sparse internal cuts, hard edges, flat lighting, limited material tones, clear silhouette, no antialiasing. Shannon is competent, practical, memorable, and composed in mundane inspections and absurd supernatural situations. Contemporary professional-casual real-estate look without luxury-agent cliché: dark plum cropped blazer, muted cream top, tailored charcoal trousers, practical oxblood ankle boots, compact cross-body document bag, dark warm-brown skin, short asymmetrical natural curls, small muted-gold hoop earrings. One hand near the bag strap; the other holds a compact key ring. Grounded, mildly skeptical, not flirtatious. One isolated sprite on genuine transparency, compatible with the 80×96 / contact-y88 cast. No frame, text, shadow, floor, UI, watermark, glamour pose, smooth shading, or extra accessories.

## Shannon controlled reaction

**Reference:** final Shannon neutral candidate.  
**Final candidate:** `assets/shannon_controlled_reaction_80x96.png`.

**Final prompt:**

> Preserve Shannon's exact identity, outfit, palette, proportions, and pixel language. Create one controlled-reaction state: torso leans back slightly, key hand drawn close, free hand raised in a small flat-palmed “hold on” gesture, contained disbelief rather than panic. Same apparent height, foot contact, and facing. Transparent background; no redesign, glamourization, extra detail, objects, UI, or text.

## Property exterior

**References:** frozen rave exterior/interior and approved docks, Powder Springs, and bedroom environments.  
**Final candidate:** `assets/property_exterior_270x480.png`.

**Final prompt:**

> Create Rich Alucard's attainable first rental property: a modest aging Los Angeles fourplex, early evening after sunset. Compact two-story 1970s stucco, four-unit identity, narrow central courtyard, exterior metal stair, small carport edge, block wall, utility meters, tired drought-resistant shrubs, cracked concrete, and one warm porch bulb. Worn but salvageable, mundane landlord fantasy. Exact vertical 9:16 scene with broad unobstructed lower actor field and useful dialogue space. Cool violet-blue evening, dusty blue-gray/faded tan stucco, muted burgundy, warm gold, sparse green. Match approved hard-cluster, limited-tone lost-cartridge grammar. No actors, rats, text, logos, luxury, collapse, gore, overt supernatural effect, gradients, bloom, or HD detail.

## Property interior base

**References:** final property exterior plus approved rave interior, bedroom, and docks.  
**Final candidate:** `assets/property_interior_base_270x480.png`.

**Final prompt:**

> Create the primary vacant-unit inspection interior for the same fourplex: worn but viable unfurnished one-bedroom living room, faded plaster, scuffed dark wood-look floor, barred window with cool evening light, narrow old kitchen recess, closed interior door, baseboards, ceiling fixture, outlet, low maintenance access panel, repaired plaster, one water stain, and abandoned paint can. Nothing overtly supernatural. Exact vertical 9:16 with lower 38% as broad actor/interaction floor and upper-left dialogue space. Match approved hard-cluster, limited-tone environment grammar. No actors, rats, text, UI, luxury staging, gore, collapse, overt magic, gradients, or smooth detail.

## Property problem overlay

**Reference:** final interior base.  
**Final candidate:** `assets/property_problem_overlay_270x480.png`.

**Final prompt:**

> Create only a transparent registered overlay aligned to the base: low maintenance access panel hanging open into a black void at the same location, large irregular gnaw marks on the nearby baseboard, one torn curl of insulation, a sparse trail of oversized dusty pawprints crossing a short floor section toward the opening, and two displaced wood chips. Make an absurdly large animal problem visually undeniable while keeping the rat separate. Same hard-edged limited pixel language. Transparent everywhere except added evidence. No room repaint, actors, rats, text, gore, blood, slime, magic, fog, or gradients.

## Giant-rat alert

**References:** approved Rich/Ogun scale and final Shannon scale.  
**Final candidate:** `assets/giant_rat_alert_96x64.png`.

**Final prompt:**

> Create the neutral/alert state of a reusable giant property rat. Side view facing right, roughly Rich's upper-thigh height, planted feet, hunched long body, thick low curling tail, oversized rounded ears, blunt snout, one cream incisor, charcoal-brown fur, dusty mauve underside, tiny burgundy eye, one notched ear. Watchful and self-possessed—more disrespectful tenant than horror monster. Intentionally cheap handheld pixel clusters, flat lighting, limited tones, transparent background, designed for a 96×64 / contact-y56 cell. No clothing, weapons, jewelry, money, tech, gore, disease, magic, or protected Cryptrat references.

## Giant-rat scurry

**Reference:** final alert rat.  
**Final candidate:** `assets/giant_rat_scurry_96x64.png`.

**Final prompt:**

> Preserve the exact rat identity and create one low forward scurry state facing right: body slightly longer/lower, front paws reaching, rear feet pushing, tail in a shallow trailing S, ears swept back. One held sprite, same apparent scale and 96×64 / contact-y56 convention. Transparent background. No added effects, props, injuries, gore, disease, weapons, money, tech, or protected references.

## Giant-rat recoil

**Reference:** final alert rat.  
**Final candidate:** `assets/giant_rat_recoil_96x64.png`.

**Final prompt:**

> Preserve the exact rat identity and create one startled-brace/recoil state facing right: front half pulled back, shoulders raised, forepaws close, rear feet planted, ears angled outward, tail kinked low. Surprised and offended, not injured, dying, or terrified. Same apparent scale and 96×64 / contact-y56 convention. Transparent background. No effects, wounds, gore, disease, weapons, money, tech, or protected references.

## Deterministic post-processing

- Character raw generations were isolated by largest opaque component, nearest-neighbor normalized to a 56-pixel visible-height target, centered in 80×96, foot contact y88, quantized to 18 opaque colors, and converted to alpha 0/255.
- Rat raw generations were isolated, nearest-neighbor normalized into 96×64, contact y56, and mapped to one shared 14-color opaque palette with alpha 0/255.
- Environment raw generations were center-cropped only as needed to exact 9:16, nearest-neighbor reduced to 270×480, and quantized without dithering to 28 colors (exterior) or 30 colors (interior).
- The problem overlay was reduced at full-canvas registration to 270×480, quantized to 18 opaque colors, and converted to alpha 0/255.
- State sheets, review boards, composites, and the ownership thumbnail were assembled deterministically from candidate pixels; they were not new generative art.

## Rejected work

One generated PLAYER-BLIND money-adjacent prop was rejected and excluded from the deliverable because it risked weakening the protected Cryptrat concept through casual rat/money association. It remains only in the task's `work/property_creative_candidate/rejected/` audit folder and is not listed in the package manifest.

No other raw generation is promoted by existence. Only paths listed in `PACKAGE_MANIFEST.json` are submitted for HQ review.
