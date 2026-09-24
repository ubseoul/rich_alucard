# Presentation Director

The Presentation Director is the single presentation source of truth for migrated scenes: environment framing, actors, camera, depth, the UI-aware world viewport, world-attached FX, beats and presentation QA. It is an evolution of the Stage Contract system (`js/engine/stage.js`), not a second renderer. It changes how game state is displayed, never what it means: no save, gameplay, canon or frozen-pixel changes.

Status: **pilot midpoint** — core, numeric lint, real-UI framing and the docks combat migration are in. Throne combat, the Powder Springs curb adventure adapter and the DEV Combat 2.0 fixture follow after HQ review. Nothing else is migrated.

## Files

| File | Role |
|---|---|
| `js/engine/stage.js` | `RAPresentationDirector` (camera, modes, solve/search, projection, lint, live controller, FX anchoring) and the legacy `RAStageLayout` API for unmigrated scenes |
| `js/data/presentation.js` | Screen modes, shot profiles, acceptance thresholds, judge rubric, FX registry (body units) |
| `js/data/presentation_assets.js` | GENERATED per-asset metadata: dimensions, sha256, register authority, visible (alpha) bounds, contact anchor, face box |
| `js/data/presentation_locks.js` | Locked screens: the judged choice (contact position + zoom), input hash, two-pass judge record, golden metrics |
| `js/data/stages.js` | Stage contracts; Director stages add contact-line `scale`, `director.shots`, `director.roles`, `director.states`, `director.worldLayers` |
| `tools/presentation-assets.mjs` | Regenerates asset metadata from the frozen PNGs; refuses bytes that differ from `ASSET_REGISTER.json` |
| `tools/presentation/annotations.json` | Authored face boxes (source pixels, from visual inspection of the frozen PNG) |
| `tools/presentation-census.mjs` | Deterministic screen census: captures, objective metrics, live lint, runtime variants, real FX playback, candidate contact sheets |
| `tools/presentation-test.mjs` | Release-gate checks (runs in `npm test`) |

## Coordinate model

- **World units** = the stage's native environment grid (270×480 for the docks). Contact lines, anchors and world layers are authored here.
- **Contact lines** carry depth metadata: `scale` is the world scale of an 80×96 source sprite standing on that line. This replaces per-character scaling and the global `RADisplay` 1.85× multiplier on Director scenes (docks: `2.3125` = the approved 1.25 × 1.85 made explicit).
- **Camera** `{S, x, y}`: `S` = CSS px per world unit, `(x, y)` = world-space top-left of the view. Screen = `world.x + (wx − x)·S`. Environment, actors, world layers and FX anchors all go through this one mapping. Positions snap to device pixels. Actor pixel scale snaps to an integer number of device pixels per source pixel when that stays within 4% and inside the shot-size band.
- Actors are placed per element through the camera rather than by a CSS transform on a container, because the legacy combat FX interleave z-order with actors (for example blood-bath rear/foreground). Environment and actors are re-parented into `#pdWorld`, a clipping, non-stacking viewport element. Everything is restored on exit.

## Screen modes (UI-aware)

`screenLayout(mode, W, H)` returns HUD band, world viewport and UI band in `#screen` CSS px. Lengths are fractions of the screen width, because portrait phones are width-limited. The world viewport has a bounded aspect, and **surplus tall-phone height goes to the UI band**, not to extra environment. Director scenes let `#screen` grow up to 9:20, so there are no black bars on 19.5:9 phones. Frozen art is never stretched. Combat: HP panels in a top status band, the world viewport, then the command band. The world never sits under UI. CSS reads the `--pd-*` variables generically per mode, with no per-scene sizing.

## Shot profiles

Body targets are the visible height of a reference-height body (Rich standing, 52 source px) on the focal contact line, as a fraction of the world viewport. This makes "same character + same shot profile" consistent across scenes.

| Profile | Body band | Target |
|---|---|---|
| establishing / crowd | 20–25% | 22.5% |
| combat | 30–35% | 32.5% |
| conversation | 35–45% | 40% |
| intimate / close | 50–60% | 55% |

## SOLVE → SEARCH → LINT → AI JUDGE → LOCK

1. **SOLVE** (`solve`): `S = max(cover, target·zoom·viewH / refBody)`. The focal group must fit the usable width. `x` centres the focal group. `y` puts the front contact line at the profile's contact fraction while keeping bubble headroom above the tallest head. The focal boxes are the **envelope of every approved state** (`director.states`), so the camera never jumps when an actor changes pose.
2. **SEARCH** (`search`): contact fraction × zoom ∈ {1, 1.06}, ≤ 6 candidates.
3. **LINT** (`lintFrame` geometry and `lint()` live on the rendered DOM):
   - shot size and consistency
   - face size (≥ 24 CSS px at 360 wide, scaled)
   - focal body and face in view
   - UI overlap as opaque sprite pixels under the real rendered UI (0)
   - face visibility against UI, bubbles and front actors (100%)
   - headroom, contact-line validity, environment covers viewport, asset authority
   - dialogue text fit, FX centre inside the world
   - dead space (measure-only until locked from the golden set)
4. **AI JUDGE**: hero and composition-sensitive screens only. The legal candidates are rendered with the real UI into one contact sheet, then judged twice, the second time in a seeded shuffled order. The result is accepted only if both passes pick the same candidate for rubric reasons. Disagreement means **HOLD**. No confidence percentages.
5. **LOCK**: `presentation_locks.js` stores the choice (not pixels), the reasons and an inputs hash (`tools/presentation/inputs.mjs`: contract, profile, mode, acceptance, asset hashes/metadata). The release gate fails if the hash goes stale. It also lints every locked screen across the runtime variant matrix (all combinations of approved focal states) at 360×740, 390×844 and 430×932.

**No-pass behaviour**: if no legal candidate exists, file a specific `NEEDS CREATIVE` ticket for Art. The player never positions sprites.

## Judge rubric

The criteria for the internal visual review and for future automated judging are the same:
1. **Focal hierarchy**: the story's subjects read first, and observers stay secondary.
2. **Readability**: bodies, faces and silhouettes read at phone size, with nothing clipped by UI or frame.
3. **Environment readability**: the location is recognisable, and empty low-detail area is minimised.
4. **UI coexistence**: the world and the UI are cleanly separated, and text fits.
5. **Dramatic / story intent**: spacing and height support the beat (confrontation, intimacy, spectacle).
6. **Rich Alucard presentation consistency**: the same character at the same shot profile has the same size, the pixel-art stays crisp, and the look is established.

## World-attached FX

`RAPresentationData.fx` lists combat effects in **body units** (px at a reference visible body height of 124.67), relative to the role anchor: the actor's visible body centre x, 42% down. `--pd-fx` is the current reference-height body divided by 124.67. The Director re-anchors every listed effect each layout and nudges it inside the world viewport. Code-spawned effects (missiles, impacts) use `RAPresentationDirector.fxPoint`, and flight distances are CSS variables. Effects that game code positions from actor rectangles keep their authored size relative to the actor through `scale: var(--pd-fx)`. Screen-space overlays (flashes, bite jaws, octopus, fullscreen impacts) stay screen-space by design. Unmigrated scenes keep their original CSS untouched.

## Census

```bash
RA_PLAYWRIGHT_PATH=<playwright-core dir> node tools/presentation-census.mjs --label after --candidates --fx
```

- Fixed viewports at DPR 3, seeded `Math.random`, cleared storage, and paused animations for stills.
- Real move playback samples every visible world FX each frame.
- Output goes to `work/presentation_census/REVIEWER_ONLY/<label>/` (git-ignored): screenshots, contact sheets, candidate sheets (pass 1 and shuffled pass 2), and `census-<label>.json`.
- `--root <checkout>` measures another checkout, such as the pre-Director baseline, with the same yardstick.
- Never surface the output automatically to the player. Unseen and SEALED content stays spoiler-protected.

## Migrating a scene

1. Give its contact lines a `scale`, and give the contract `director.shots` (profile, focal, speakers, reference), `director.states` (the approved variant matrix) and `director.roles` if it uses combat FX.
2. In the scene's enter hook, call `RAPresentationDirector.enter({stage, mode, beat, scope, env, envAsset, actors, roles, worldLayers})`. The scope cleanup exits it.
3. Remove the scene's legacy sizing inputs (global multiplier, bespoke CSS sizes). There must be only one sizing system active.
4. Run the census with `--candidates --fx`, judge, lock, and add golden references.
