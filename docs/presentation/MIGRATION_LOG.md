# Presentation Director — bulk migration log

Each wave follows the same cycle: migrate, then variant lint, deterministic census, internal visual review, regression lock, and NEEDS CREATIVE tickets. Captures are reviewer-only and player-blind, in `work/presentation_census/REVIEWER_ONLY/`, which git ignores.

## Sync (pre-wave)
- Merged `origin/main` b8ab4fe (Art Ship 007). Tests, build and artifact verification all pass. The asset register has 313 entries (173 frozen), with 0 hash mismatches.
- The four pilot baselines (3 sizes each) are pixel-identical after the sync, so Art Ship 007 doesn't affect them.
- There is now one canonical dead-space metric (`js/engine/presentation_metrics.js`). The census and the Director lint agree exactly on every pilot screen.

## Wave 1 — generic adventures (adapter)
- **Scope:** every adventure environment (`RAPresentationData.adventure.environments = 'all'`). There are 94 distinct screens (environment + cast) across 315 authored nodes.
- **Variant lint (dry run, release gate):** 89 pass their adapter default; 5 are accepted EXCEPTION-LAYOUT screens (tickets PD-W1-01…04, see `NEEDS_CREATIVE.md`).
- **Deterministic sweep** (`tools/presentation-sweep.mjs`: the real adventure scene with the real UI, live lint at 360×740 / 390×844 / 430×932): **94/94 screens pass at all sizes**, and all 94 render through the Director. Sizes on placeholder actors and dead space on placeholder environments are PROVISIONAL.
- **Conversation reference locked at 0.392 ±5%.** Measured bodies form two clusters: 0.41 on 60 screens (full-width cover) and 0.376 on 22 screens (width-limited). Both are within the band.
- **Internal visual review:** all 8 contact sheets reviewed. Rich's size is consistent, there's no clipping, speaker tags and bubbles are clean, and the dialogue band is consistent. No generic defect was found. The flatness seen on many screens is placeholder art.
- **Regression lock:** `docs/presentation/locks/wave1-adventures.json` records the chosen shot for every screen. `npm test` fails on any unexpected failure, stale exception or changed default.
- **No scene-specific code:** the 5 exceptions are data entries with tickets.

## Wave 2 — Combat 2.0
- **Scope:** every Combat 2.0 fight is Director-staged in combat mode through the shared contract builder (`RAPresentationDirector.combat2Stage`). The legacy 0.9 × multiplier and the fixed y=318 floor are no longer used. There are 17 authored fight × environment screens (16 fight nodes; one fight resolves to two environments).
- **Bug fixed on the way:** two fights define their environment as a function of adventure state, which `combat2.js` never resolved, so they rendered without a backdrop. Environments now resolve before staging.
- **Variant lint (dry run, release gate):** 17/17 pass the combat profile at 360/390/430.
- **Deterministic sweep** (`tools/presentation-sweep.mjs --combat`, the real combat scene with the real UI): **17/17 fights pass live lint at all sizes**, all Director-staged, with no page errors.
- **Internal visual review:** Rich's size is consistent with the migrated legacy fights, and bodies and crowds read. One generic defect was found and fixed: the command panel left about 40% of the UI band empty. The command grid now fills the band, giving larger touch targets (a combat-mode CSS rule, not per scene).
- **Real player path:** an adventure fight node was played through Director-staged combat to victory and back through the adventure resolution, with no errors and no leftover Director state.
- **Regression lock:** `docs/presentation/locks/wave2-combat.json`, enforced by `npm test`. Pilot baselines: docks, throne and curb are pixel-identical. The Combat 2.0 fixture golden was refreshed for the panel change (framing and lint unchanged).
- **No new tickets.**

## Wave 3 — legacy / special systems
- **Migrated:**
  - Desire Trip curb and stargazing (hero; cinematic mode, locked after an agreed two-pass judge)
  - JDM docks story scenes (arrival / meet / aftermath) and the Supra payoff reveal (cinematic, the car as an object slot, the key prop kept in Rich's hand)
  - Property exterior and interior (hotspots kept in frame; rats as floor objects)
  - Ogun's Rave interior (the speaker foreground as a world layer) and exterior (the same adapter contract as its adventure screen; world-anchored neon sign)
  - the bedroom hub (new `room` profile)
  - UI-only Director entry for the trip travel/return cards and the character reveal
- **Generic mechanisms added (no per-scene layout code):**
  - `enterMounted` for image-based scenes
  - UI roles (`data-pd-ui`) with a UI-band stack
  - selector-based world layers
  - stage objects (vehicles/props)
  - per-beat modes
  - shot `target` and `includeHotspots`
  - stage-level accepted intent / exceptions
  - `enterUi`
- **New lint:** rendered-vs-camera placement, which caught a legacy transform displacing the trip sprite. All earlier waves were re-verified.
- **New census check:** aspect integrity. It found and fixed two stretch regressions: adventure-launched minigames stretched to 2.16:1, and full-screen authored FX and the octopus tentacles stretched on tall screens. The tentacle stretch already existed in legacy (33%).
- **Screen shape:** new game → prologue → throne → victory → bedroom → reveal → Desire Trip loop now stays one shape (no 9:16 jumps).
- **Census:** all Wave 3 screens pass lint, variants and aspect integrity at 360/390/430.
- **Tickets:** PD-W3-01 (property interior) and PD-W3-02 (rave interior) accept `shot-consistency` only.
