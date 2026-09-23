# MASSIVE PUSH 001 — THE PROPERTY

## Spoiler-safe Creative Review

**Status:** MASSIVE PUSH CREATIVE CANDIDATE  
**Requested disposition:** HQ CREATIVE REVIEW  
**Production integration:** Not performed  
**Approved-corpus promotion:** Not performed  
**Existing frozen assets modified:** None

This package supplies the minimum coherent visual and writing coverage for Rich's first meaningful rental-property acquisition: a recurring real-estate character, an attainable property identity, a gameplay-ready inspection interior, visible property-problem states, reusable giant-rat language, ownership reuse, staging guidance, and complete HQ-only writing/integration material.

The player-facing package deliberately does not disclose encounter order, escalation, reveals, optional interactions, hidden jokes, surprise treatment, protected-concept disposition, or secret consequences.

## Candidate asset inventory

| Candidate | Dimensions | Runtime role | Contact / registration |
|---|---:|---|---|
| `assets/shannon_neutral_80x96.png` | 80×96 RGBA | Shannon neutral/conversation master | Source anchor `(40,88)` |
| `assets/shannon_controlled_reaction_80x96.png` | 80×96 RGBA | One restrained situational reaction | Source anchor `(40,88)` |
| `assets/shannon_state_sheet_160x96.png` | 160×96 RGBA | Two-cell Engineering handoff sheet | Cells 80×96; neutral, reaction |
| `assets/property_exterior_270x480.png` | 270×480 RGB | Arrival, exterior inspection, ownership location | Proposed contact `y=370` |
| `assets/property_interior_base_270x480.png` | 270×480 RGB | Primary vacant-unit inspection/play space | Proposed contact `y=352` |
| `assets/property_problem_overlay_270x480.png` | 270×480 RGBA | Exact-origin property/problem state | Register at `(0,0)` above base |
| `assets/property_ownership_thumbnail_96x96.png` | 96×96 RGB | Optional property list/card identity | Deterministic crop of exterior candidate |
| `assets/giant_rat_alert_96x64.png` | 96×64 RGBA | Presence/intent state | Source anchor `(48,56)` |
| `assets/giant_rat_scurry_96x64.png` | 96×64 RGBA | Movement state | Source anchor `(48,56)` |
| `assets/giant_rat_recoil_96x64.png` | 96×64 RGBA | Non-gore response state | Source anchor `(48,56)` |
| `assets/giant_rat_state_sheet_288x64.png` | 288×64 RGBA | Three-cell Engineering handoff sheet | Cells 96×64; alert, scurry, recoil |

Exact SHA-256 values are recorded in `PACKAGE_MANIFEST.json`.

## Review evidence

- `review/01_character_creature_scale_board.png` — native-source enlargement, unchanged approved Rich comparison, and intended 1.25× scene checks.
- `review/02_environment_coverage_board.png` — exterior, interior base, and composited problem-state coverage.
- `review/03_problem_layer_registration_board.png` — base, transparent overlay, and exact composite.
- `review/04_stage_guidance_board.png` — proposed contact lines, actor regions, dialogue-safe zones, and control exclusions.

## Visual decision summary

### Shannon

Shannon is a clearly adult, competent real-estate professional with a contemporary professional-casual silhouette: asymmetrical natural curls, dark plum cropped blazer, cream top, charcoal trousers, oxblood boots, compact document bag, tiny key ring, and muted-gold earrings. Her design avoids luxury-agent cliché, romance-first posing, exposition-clerk anonymity, and copied Rich identity signals.

At native size, Shannon's neutral opaque envelope is 22×56; her controlled reaction is 29×56. The different width is authored gesture space, not a scale change. Both end at row 87 and share the established `(40,88)` human contact convention. Her neutral silhouette reads beside approved Rich without adding face, hair, or garment density foreign to the corpus.

Only two states are proposed. Runtime movement, facing, timing, and small positional reactions should do the remaining work.

### Property

The exterior is a modest, worn, salvageable Los Angeles fourplex rather than a mansion, ruin, or endgame trophy. It provides readable building identity, a central approach, mundane utility details, and a broad lower actor/dialogue field. The nighttime palette belongs beside the approved docks, Powder Springs, and rave exterior without copying their compositions.

The interior is one reusable unfurnished unit, not a collection of bespoke rooms. Its door, barred window, kitchen recess, wall patch, baseboards, access panel, paint can, and open floor make inspection legible and interactive. The 270×480 problem layer makes the broad complication visually undeniable while keeping the base reusable.

### Giant-rat vocabulary

The rat family uses one identity across three held states: alert, scurry, and recoil. It is absurdly large beside Rich, visually readable, and intentionally non-gore. The creature is self-possessed and disrespectful rather than diseased, demonic, or horror-anatomical.

The 96×64 padded cell and `(48,56)` contact support the animal's long silhouette without forcing it into the human cell. All three states use binary alpha and a shared limited palette.

## Common-Sense Creative Test

- **One game:** Yes. Assets use limited palettes, hard clusters, low fold/detail density, native-grid contacts, and 270×480 staging.
- **Shannon beside Rich:** Yes. Verified at 1.25× using unchanged approved Rich pixels.
- **Property Rich might buy:** Yes. The building is attainable, worn, income-oriented, and meaningful without luxury energy.
- **Gameplay-first interiors:** Yes. One broad floor supports two adults, a rat, props, dialogue, and state changes.
- **Important threats/objects visible:** Yes. The property problem has a registered visual state; the rat family is separate and stageable.
- **Compatible scale:** Yes. Human and rat contacts are documented and checked together.
- **Dialogue/UI space:** Yes. Proposed safe zones and control exclusions are shown in the Stage guidance board.
- **Generic AI pixel drift:** Rejected through native-size reduction, palette control, binary-alpha cleanup, corpus comparison, and scene checks. No raw generated output is proposed as a production candidate.
- **Missing Engineering-faked art:** None identified for the bounded package. Ownership reuse is supplied as a derivative thumbnail.
- **Unneeded art:** Additional rooms, Shannon outfits, props, crowd, bespoke rewards, and full-frame environment variants were deliberately omitted.

## Writing and integration package

The complete sequence, character writing, staging beats, player choices, protected-concept disposition, and optional PLAYER-BLIND proposal are contained separately under `hq_only/`:

- `hq_only/PROPERTY_CREATIVE_TREATMENT_HQ_ONLY.md`
- `hq_only/PROPERTY_WRITING_PACKAGE_HQ_ONLY.md`
- `hq_only/RICH_VOICE_PASS_HQ_ONLY.md`
- `hq_only/ENGINEERING_INTEGRATION_NOTES_HQ_ONLY.md`

Those files are not player-facing and should not be quoted into Ube-facing release notes, test directions, filenames, or public issue summaries.

## Deliberately deferred

- Runtime implementation, save migration, economy values, price, income cadence, repair balance, and opportunity gating.
- Any new dialogue UI. The package supplies speaker/type/purpose/staging metadata only.
- Additional property rooms or exterior states.
- Additional Shannon poses, outfits, portrait, romance material, or backstory.
- Rat attack animation, combat FX, gore, variants, bosses, weapons, clothing, money-themed variants, or autonomous simulation.
- Additional ownership UI beyond the supplied exterior-derived thumbnail.
- Changes to approved Rich, existing environments, current Stage Contracts, game code, or frozen art.

## Genuine blockers

There is no visual/writing blocker to HQ reviewing this complete Creative candidate.

Before runtime production, HQ must decide the candidate disposition and Engineering must own the exact economy values, save fields/migration, scene implementation, and dialogue grammar. Important Rich lines remain blocked on the dedicated voice pass unless already supplied by HQ.

## Stop statement

This department does not self-award HQ PASS, APPROVED MASTER, or FROZEN. Nothing has been integrated or added to the approved corpus.

**MASSIVE PUSH CREATIVE CANDIDATE — STOP FOR HQ CREATIVE REVIEW.**
