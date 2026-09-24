# Presentation Director — pilot report

Branch `claude/presentation-director`. It isn't merged or deployed. This report is spoiler-safe: it holds metrics and assessments only. Reviewer-only captures are regenerated with `tools/presentation-census.mjs` into `work/presentation_census/REVIEWER_ONLY/`, which git ignores. The committed golden references are in `docs/presentation/golden/`.

**Recommendation: PASS.** The pilot gate is complete. No bulk migration has been done; this is the stop point for HQ.

## Scope delivered

| Pilot | Path | Status |
|---|---|---|
| Docks combat | legacy `game.js` fight, `jdm-imports-docks` contract | migrated; locked (contact 0.80, zoom 1) |
| Throne-room combat | legacy `game.js` fight, the boot `battle` state is now a Director scene | migrated; locked (contact 0.80, zoom 1); beats: `combat`, `tableau` (snap-pan) |
| Powder Springs curb | `adventure.js → Director` adapter, gated by an allowlist (`curb` only) | adapter live for `curb`; proven with a DEV fixture; real curb content linted as reviewer-only |
| Combat 2.0 | DEV-only non-canon fixture (`RAPresentationFixtures.combat2`) on the approved docks environment | Director path behind `params.director`; real Combat 2.0 fights stay legacy |

Director scenes take their size only from the Director. Every unmigrated scene is unchanged: the throne and docks legacy baselines, the prologue adventure and the bedroom are pixel-identical to the pre-Director base.

## Before → after (Rich; 390×844 unless noted; the other two sizes follow the same pattern)

| Screen | Phone screen used | Rich body (px) | Rich face (px) | Rich sprite pixels under UI (px²) | Shot size |
|---|---|---|---|---|---|
| Throne combat | 82% → 100% | 125 → 204 (+63%) | 27 → 45 | 0 → 0 | combat 0.312 |
| Docks combat | 82% → 100% | 174 → 173 | 47 → 47 | 45 → **0** (importer 40 → 0) | combat 0.327 |
| Curb (adapter) | 82% → 100% | 208 → 208 | 56 → 56 | 1,623 → **0** | conversation 0.410 |
| Combat 2.0 fixture | 82% → 100% | 125 → 173 (+38%) | 34 → 47 | 0 → 0 | combat 0.327 |

- **Throne legacy defect removed.** The legacy throne used fixed pixel sizes, so Rich was 125 px on every phone. He now scales with the phone: 192 / 204 / 225 px at 360 / 390 / 430.
- **Cross-scene consistency.** Rich's combat size is 0.312–0.327 across the throne, docks and Combat 2.0, within ±5% of the locked 0.325 reference.
- **Crisp pixels.**
  - Actor positions snap to device pixels everywhere.
  - Docks, curb and Combat 2.0 land on whole device pixels per source pixel at all three sizes (9/10/11, 11/12/13, 9/10/11).
  - Throne is 9.0–10.5 device px per source pixel. Snapping any further would leave the combat size band, and the assistant's back depth line never lands on a whole number.

## Lint (final census, 360×740 / 390×844 / 430×932)

All four screens pass at all three sizes:
- UI/body overlap 0 (opaque pixels under the real rendered UI)
- focal faces 100% visible
- face ≥ 24 px at 360 wide
- shot-size band and cross-scene consistency
- contact lines
- viewport clipping
- no letterbox inside the world
- asset authority
- text fit
- dead space ≤ 0.8

The runtime variant matrix also passes:
- **Docks:** importer hit/defeated, daughter reaction, the longest bubble and dialogue.
- **Throne:** every Rich and CEO state, the authored CEO hit sprite sheet (per-frame metadata), the assistant joining, the tableau beat, and the longest dialogue. The release gate additionally lints all 28 combinations of Rich × CEO states at every size.
- **Curb:** one and two actors, the seated curb pose, the three-actor fallback, choices, and Rich's speech bubble.
- **Combat 2.0:** the fight menu, blood orbs and the crowd.

World-attached effects were played for real (blood bath, vampire bite, revenge, plus the enemy turns) and sampled every frame. Every effect stayed inside the world viewport on docks and throne at all sizes, over repeated runs.

**Adapter dry run** (`tools/presentation-adventure-dryrun.mjs`, numbers only): **89 of 94** distinct adventure screens (315 nodes) pass default-adapter lint at all three sizes with no authoring. The 5 that fail are placeholder environments with larger casts, and they need authored `shot` overrides once real art exists.

## Visual review (Claude, rubric = future judge rubric)

- **Docks: materially better.** The screen is full-height, the HUD and command panel sit in their own bands, and no UI touches a body. The combatants read first and the skyline band identifies the location. Weakness: about 40% of the world is still low-detail night sky. At the locked combat size a full-width camera on 270×480 art must show about 365 rows. That's an art-density limit, not something the Director can solve.
- **Throne: materially better, and the biggest win.** Characters are about 60% larger. Rich on his throne, the CEO and the assistant (the stakes) all read. The candles, shelves and window keep the room's identity. Weakness: Rich's wall portrait is cropped at the top in the combat framing. The tableau beat shows it in full.
- **Curb (adapter): materially better.** The dialogue box no longer covers Rich. The world viewport and dialogue band separate cleanly, Rich's speech bubble sits above his head inside the world, and the sky keeps the Powder Springs mood. Weakness: the placeholder figures used by the fixture are blocky; that's placeholder art, not a framing issue.
- **Combat 2.0 fixture: materially better.** It uses the same framing language and Rich size as the migrated legacy fights. Combat 2.0 is no longer smaller than the legacy fights (0.18 → 0.33 of the world).

## Judging and locks

- **Docks.** Midpoint lock c2 (zoom 1.06) became illegal once the cross-scene combat reference was locked, so it was re-judged among the three legal framings. Both shuffled passes picked c1 → locked.
  - Process note: the pass-2 letter mapping was visible before pass 2. The census now writes the key to a sealed file so the judge can't see it.
- **Throne.** The first search offered two framings only 2.6% of the view apart, and the passes disagreed → **HOLD**. SEARCH now requires perceptible separation (≥ 4% position / ≥ 3% zoom), which left one legal framing. It passed two acceptability reviews → locked.
- **Curb and Combat 2.0** are utility defaults (solve + lint), so no judge was run.
- **Locks.** Each lock stores the choice, the reasons and an inputs hash. The release gate fails if a lock's inputs change or its framing stops linting.

## Changes worth HQ attention

- **Contact lines carry depth scale.** Docks 2.3125 and adventures `base × 1.85` make the approved legacy scale explicit, and the global `RADisplay` multiplier and the dev scale control no longer affect Director scenes. The throne's per-character CSS sizes became two depth lines (front 3.9, back 3.59 from floor perspective).
- **Composition changes (pilot aesthetic decisions, no pixels touched):**
  - The throne fight is re-staged closer together; the throne chair is part of Rich's seated sprite.
  - Combat effects are re-authored as body-relative placements (HQ PASS at midpoint).
  - Adventure edge slots are clamped inward so bodies aren't cut off; this was a legacy defect.
- **Fixed on the way:**
  - During attacks, off-screen command buttons could scroll the whole `#screen` by about 114 px (Director scenes use `overflow:clip`).
  - The contact shadow now sits on the contact line instead of 8 source px below the feet.
  - A false `npm test` failure on Windows checkouts caused by line endings.

## Remaining weaknesses and risks

1. **Screen height jumps** between Director scenes (full phone height) and unmigrated scenes (9:16) until migration completes.
2. **Low-detail sky** dominates the docks and curb at the locked sizes. Dead space is measured, and the threshold is set at 0.8 from the approved examples. The metric separates poorly between framings of the same art; a per-environment normalised version is recommended.
3. **Two dead-space implementations.** The census's legacy-comparable yardstick and the Director lint compute dead space differently. The Director lint value is authoritative; they should be unified.
4. **The 9:16 desktop shape** still misses the combat band, because the phone-first layout gives it too little world height.
5. **Pre-existing, untouched:** the bite afterimage shows the seated throne pose in the docks fight.
6. **Combat 2.0 fights launched from a non-allowlisted adventure** would switch to Director framing for the fight and back afterwards once migrated. Today only the fixture uses the Director path.

## NEEDS CREATIVE

None required for the pilot. Candidate for later: optional higher-detail upper-band or foreground layers for sky-heavy 270×480 environments (docks, curb), if HQ wants less empty sky at combat/conversation sizes.
