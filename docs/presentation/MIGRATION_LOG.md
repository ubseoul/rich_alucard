# Presentation Director — bulk migration log

Each wave follows the same cycle: migrate, then variant lint, deterministic census, internal visual review, regression lock, and NEEDS CREATIVE tickets. Captures are reviewer-only and player-blind, in , which git ignores.

## Sync (pre-wave)
- Merged  b8ab4fe (Art Ship 007). Tests, build and artifact verification all pass. The asset register has 313 entries (173 frozen), with 0 hash mismatches.
- The four pilot baselines (3 sizes each) are pixel-identical after the sync, so Art Ship 007 doesn't affect them.
- There is now one canonical dead-space metric (). The census and the Director lint agree exactly on every pilot screen.

## Wave 1 — generic adventures (adapter)
- **Scope:** every adventure environment (). There are 94 distinct screens (environment + cast) across 315 authored nodes.
- **Variant lint (dry run, release gate):** 89 pass their adapter default; 5 are accepted EXCEPTION-LAYOUT screens (tickets PD-W1-01…04, see NEEDS_CREATIVE.md).
- **Deterministic sweep** (, real adventure scene with real UI, live lint at 360×740 / 390×844 / 430×932): **94/94 screens pass at all sizes**, and all 94 render through the Director. Sizes/consistency on placeholder actors and dead space on placeholder environments are PROVISIONAL.
- **Conversation reference locked at 0.392 ±5%.** Measured bodies form two clusters: 0.41 on 60 screens (full-width cover) and 0.376 on 22 screens (width-limited). Both are within the band.
- **Internal visual review:** all 8 contact sheets reviewed. Rich's size is consistent, there's no clipping, speaker tags and bubbles are clean, and the dialogue band is consistent. No generic defect was found. The flatness seen on many screens is placeholder art.
- **Regression lock:**  records the chosen shot for every screen. Unknown command: "test"


Did you mean this?
  npm test # Test a package
To see a list of supported npm commands, run:
  npm help fails on any unexpected failure, stale exception or changed default.
- **No scene-specific code:** the 5 exceptions are data entries with tickets.
