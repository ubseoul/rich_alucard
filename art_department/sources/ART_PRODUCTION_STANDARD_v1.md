# Rich Alucard — Art Production Standard v1

**Delivery status: READY FOR HQ REVIEW**  
**Artist recommendation: ready for HQ PASS / FROZEN.** HQ must record that decision; this package does not award itself either state.  
Final submission: 2026-09-23. Adult proportion vocabulary has **Ube TASTE PASS**, as conveyed in the current HQ review. No additional proportion iteration is required.

## 1. Authority and scope

Use current `VISUAL_STYLE_BIBLE`, `STAGE_CONTRACT_HANDOFF`, `PRODUCTION_CONTROL`, `CURRENT_CANON` and `RICH_ALUCARD_GAME_BIBLE`, in that document's area of authority. Current Canon is the day-to-day canon source. The repository HEAD was rechecked for this delivery and remains **188e336ff3c8d2970522c9a98cf79aed023b4da0**. Copies are included under `sources/authority/`. Older Downloads bibles and incidental generated labels cannot override them.

The latest HQ review adds approved adult silhouette vocabulary. It does not approve new characters, freeze the generic study models, or authorize retroactive changes. This final standard incorporates that review and supersedes the Artist's draft recommendations; it takes production-standard authority only when HQ accepts it.

Use four evidence labels when ambiguity matters: **OBSERVED** for measured behavior; **LOCKED / APPROVED** for explicit authority; **PROPOSED** for an unaccepted recommendation; **NEEDS HQ DECISION** for an actual unresolved choice. Do not turn old accidents into rules. Files named “final,” repository presence and technical checks are not approval evidence.

No Ogun, Bllad33 or Ogun's Rave production is authorized by this package. No existing artwork or game code was changed. The kit assembles existing pixels and technical annotations only.

## 2. Pixel language, palette and identity

**Established direction:** a strange forgotten handheld cartridge, with large deliberate clusters, hard edges, sparse detail, flat/simple lighting, asymmetry and few held animation states. It is not an exact GBC hardware simulation. Avoid modern gloss, gradients, bloom, antialiasing, realistic texture, excessive hair strands and extra facial detail.

Use the Rich sources and crops on **Sheet 01** as the principal recurring-character pixel-language anchor. Faces read through silhouette and a few landmarks; black clothes read through restrained near-black values. A roughly one-native-pixel dark contour is the working character convention, not a mandate to double-outline every shape. Small identity accents may use single pixels; there is no universal 2×2 cluster rule. Clouds can be deliberately coarser than faces.

Use approximately 2–3 tones per material where practical. Sample the named approved character's skin/material colors; do not substitute conceptual HEX labels or globally recolor a set to impose a palette cap. Total colors depend on materials. The study's nine colors are an experiment palette, not a rule for all women or all assets. Global tint remains separately unapproved.

Rich remains Black, with his approved hair/face, sunglasses, green earrings, fangs and black clothing; no cape or weapon. Approved bedroom bonnet and lounge clothing are contextual exceptions, not a new universal model. Preserve crowned CEO, existing Assistant/daughter identities and the current Rich wall portrait. Reference boards are not licenses to redraw them.

**Legacy exception:** the active throne-room source is 765×1024 with much denser color/texture than newer 270×480 rooms. Preserve its approved pixels; do not infer that future sprites should inherit that density. Sheet 03 uses the simpler newer scenes for spatial examples. No cleanup of the legacy room is required to finish this standard.

## 3. Source scale, dimensions and contacts

| Family | Established source convention | Meaning |
|---|---|---|
| Compatible upright/combat/curb characters | 80×96 cells; anchor (40,88) | Padded cell, not body dimensions; y88 is the edge below opaque shoe row87 |
| Rich bedroom | 128×64 cells; anchor (24,56) | Reclining support reference, not a standing foot anchor |
| Full environment | Canonical stage 270×480 | Older source exceptions must retain explicit mapping |
| Battle-region FX | Some existing packages use 270×362 | Declare viewport origin and mapping; not interchangeable with full-screen FX |
| Full-screen FX | 270×480 where authored | Screen coordinates, not actor-scaled coordinates |

Observed standing envelopes: Rich 52 pixels; Assistant and daughter 54; importer 56; CEO 61 including crown. Rich seated bounds are 40×64 including throne; bedroom bounds are 108×45 in a reclining view. These are comparisons, not mandatory anatomy ratios. Do not normalize all people to equal opaque height or mistake a throne/crown for body height.

Separate **source pixel grid**, **actor presentation scale** and **device display scale**. Preserve the approved defaults: curb Rich 1.5×; docks characters 1.25×; Supra 1.75×. Older integer-only export advice does not override those runtime choices. All use nearest-neighbor/pixelated rendering; inspect fractional presentation at actual gameplay size because displayed pixel widths can differ. Do not resample frozen source artwork to correct a runtime placement problem.

Placement rule in native stage coordinates: `topLeft = worldContactAnchor − sourceAnchor × presentationScale`. Keep resting anchors stable across states. Intentional recoil/displacement is separately authored or runtime-controlled, with a known return origin. Name secondary contacts when relevant: seat/pelvis, head/back support, wheels, grip and hit point. A foot line alone cannot describe a reclining body.

New cells, cameras or scales need a brief-specific justification. Compatible assets reuse existing conventions; exceptions do not silently establish a new global standard.

## 4. Approved adult female proportion language

**Ube TASTE PASS / approved reference range:** adult women may have varied silhouettes. Build, bust, waist, hips, stature, shoulders and leg proportions are independent design axes. Bust-forward, curvy, pronounced and exaggerated shapes are legitimate when appropriate. Preserve meaningful variety rather than converging every woman toward one body. All romance/sexualized character designs are adults.

**Sheet 02 is a vocabulary range, not five templates, a desirability ranking, a conversion ladder or universal master anatomy.** Its generic models remain non-canon. Their shared head, hair, clothing and pose were comparison controls. Future individuals still need their own approved face, hair, clothing, posture, attitude and silhouette, native to the game. The study does not authorize mannequin variants as finished characters.

| Axis | Working vocabulary | Use |
|---|---|---|
| Stature | shorter / comparable / taller than a named reference | Compare matched standing views, excluding accessories |
| Overall build | slim / medium / soft-full / broad | Whole frame/mass, independent of bust |
| Shoulders | narrow / moderate / broad | Keep separate from upper-torso projection |
| Waist | gentle contrast / defined / strong contrast | Relation to that character's torso and pelvis; no mandatory pinched waist |
| Hips/thighs | narrow / balanced / full / emphatic | Specify separately if hips and thighs differ |
| Legs | compact / balanced / elongated | Leg-to-torso relationship, independent of stature |
| Bust | restrained / moderate / pronounced / exaggerated | Clothed upper-volume silhouette; not cup size, anatomy detail or a gameplay stat |
| Face/hair | individual approved shape and mass | Identity, not a shared study head to copy |
| Clothing/posture | body-following / draped / structured; authored pose | Preserve recognizability and character-specific presence without invented lore |

“Curvy” should name waist/hip relationships; “bust-forward” identifies upper-volume emphasis without automatically broadening the hips. “Exaggerated” must identify the affected axis. Full builds need not have extreme waist contrast. Do not infer personality or relationships from silhouette.

A slim control, a soft/full build, a narrow-frame bust-forward shape, a full hourglass and an emphatic combination are all useful examples. They need not appear in every cast. Apply reference influence through simplified garment shape and outline, not additional anatomical detail. Maintain adult identity and meaningful differences.

The supplied references most strongly supported upper-volume/waist contrast; height, hips and legs were less conclusive. TASTE PASS approves the resulting vocabulary range, including its Artist interpretations, without making every source-image trait mandatory. Existing canon profile labels remain intact, including Assistant #001's Average → Above Average. Frozen characters are not redesigned to conform to the study.

## 5. Scene composition, layers and Stage Maps

Different scenes serve different camera purposes. Battle needs readable actor spacing and attack lanes; bedroom is a close bed/sky composition; Powder Springs prioritizes enormous quiet sky over a small seated Rich. Do not force a navigation floor into every room. Furniture must not obstruct required actor footprints or attack travel unless explicitly designed to do so.

A new-stage handoff follows the existing Stage Contract: `id`, `native`, `environment`, `referenceScale`, `contactLines`, `actors`, `dialogueSafeZones`, `uiExclusionZones`, `layers`. Actor slots identify source dimensions/anchor, world anchor, facing, layer and observer status where relevant. Objects additionally declare their own scale and contact. Engineering derives runtime placement through RAStageLayout.

**Sheet 03** is the minimal Stage Map example: clean source beside a data-derived inspection overlay. A Stage Map visualizes the contract; it is not a second placement authority. Include named contacts, actor cell/pose bounds, object contacts, UI/dialogue zones and layer order. Unknown new-stage values stay unset until the authorized stage brief resolves them. Do not copy docks coordinates into a different room.

Docks reference: 270×480; combat y350; Rich (55,350), importer (180,350), observer (230,350), actor scale1.25. Its dialogue/UI zones are specific to that stage. The sheet explicitly shows known legacy contact/zone caveats rather than silently repairing them. No legacy migration is required by this package.

Declare ownership of throne/bed/furniture pixels to prevent duplication. Separate background, behind-actor effects, objects, observers, combatants, front-actor effects, dialogue and UI as needed; retain the stage's actual z-order. Approved bedroom clouds use the existing exact blue-window mask; preserve that source. Do not cut frozen backgrounds into new layers without a delta request.

## 6. State sheets, reusable FX and object scale

Use few deliberate states and long holds. Runtime controls timing, movement, shaking, masks and mechanics unless the brief explicitly assigns authored art. Supply exactly the requested states; do not add smooth animation merely to increase polish.

Keep equal cells within a state family, untrimmed source coordinates, stable anchors and explicit frame rectangles/order. Copy unchanged regions for small state deltas when appropriate. Each sheet cell must match its individual PNG at decoded-pixel level. Include contact/attachment landmarks and maximum pose bounds; do not assume automatic centering preserves identity or contact.

Core attack FX remain target-agnostic wherever practical. Keep Rich and enemy sprites separate from reusable blood, jaws, wound overlays and contact bursts. Declare screen/battle/actor/target coordinate space, behind/front role and target-alpha masking behavior. Target reactions remain character-specific authored states. Art must not redefine damage or reaction-selection mechanics.

Object/vehicle scale is scene-specific rather than a universal meters-per-pixel rule. Supra is a 136×50 source with visible128×42 bounds and approved1.75× runtime presentation. Preserve source pixels and the current contract pending any explicit correction. Listing/inventory art is a separate presentation surface. Name wheel, grip or seat contacts when needed; inspect beside Rich at the actual stage scale.

## 7. Influence, naming, freeze and delta rules

Translate external influences through silhouette, composition, material hierarchy, limited detail and state-based motion; do not copy characters, costumes or whole models. Yoruba formal references require Ube-selected motifs/forms. Existing approved carving can be retained; no invented sacred symbols or generic “African” pattern filler. A new motif selection is a future brief decision, not a reason to delay this standard.

Keep stable lowercase snake_case asset IDs and existing runtime filenames. Number frames only when needed. Put version/status/provenance in the package manifest; avoid “final_final” as authority. Never bulk-rename frozen game assets to satisfy a new naming preference.

A frozen Master Reference is the exact source plus its scope, dimensions, palette/identity invariants, anchor/scale conventions, approved states and HQ approval/freeze record. Use a source hash to identify it; use decoded-pixel comparison when re-encoding changes the file hash. Inspiration boards, raw generator output and generic anatomy studies are not character masters. A small manifest entry is sufficient; no new registry system is required.

Production states remain `DRAFT → AUTHORIZED FOR PRODUCTION → READY FOR HQ REVIEW → PASS or NEEDS FIX → FROZEN`. Ube owns creative taste/canon; HQ owns acceptance/freeze; Artist and Engineering execute within scope. They do not approve one another's work.

Frozen art changes only through an explicit delta naming permitted changes. Work on a copy; preserve untouched pixels; compare allowed-region changes and zero outside-region changes when a surgical edit is required. Attach before/after evidence. A preservation prompt is not proof; pixel checks also do not replace visual judgment.

## 8. Minimal QA and Artist → Engineering handoff

Deliver native PNGs, useful sheets, a short manifest, named master/source provenance, source/world contacts, scale and layer/mask roles. Include native and integer-enlarged inspection, a state/contact view and an intended-scale composite. Preserve genuine alpha0/255 for transparent pixel sprites and opaque environment backgrounds where intended. Labels belong on reference/evidence sheets, not game art.

Check dimensions, alpha, palette complexity, visible bounds, sheet extraction, stable contacts, identity against its master and approved-region diffs where applicable. State exceptions honestly. No fixed global palette cap or automatic likeness score substitutes for visual review.

Artist owns visual/source evidence. Engineering owns runtime transform, masking, timing, persistence, tests and build integration. Both report to HQ. After final integration, current policy requires actual-resolution staging inspection across all states, contacts, relative scale, spacing, UI clearance and return-to-origin; Engineering also tests normal entry paths with fresh/existing saves and reload behavior. An offline reference sheet is not gameplay PASS evidence.

JDMIMPORTS content belongs inside the existing canonical phone. Do not substitute a new shell or turn a UI audition board into production art; model name, price, buttons and status remain runtime UI. Phone placement is integration-owned.

**Acceptance recommendation:** this standard and the three-sheet kit are sufficient to begin future *authorized* art briefs after HQ PASS/FROZEN. No additional proportion study, twelve-sheet reference suite, universal anatomy rig or new art infrastructure is needed. Remaining integration-document discrepancies are recorded separately and do not block art-standard acceptance.
