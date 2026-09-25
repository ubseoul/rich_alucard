# Presentation Director — engineering handoff

**Status:** HQ PASS. The Presentation Director architecture, the pilot and the four-wave bulk migration are accepted. The next major production phase hasn't been started. Don't merge to `main` or deploy without HQ authorization.

## Branch and SHAs
- **Branch:** `claude/presentation-director` (pushed to origin).
- **Accepted bulk-migration QA checkpoint:** `c1ce9d010d8b1641700ab92bda57f71851f2e9b0`. This handoff/docs commit sits on top of it and changes no runtime code. Use `git rev-parse origin/claude/presentation-director` for the final tip.
- **Relationship to `origin/main`:** `origin/main` = `b8ab4fecd75d8c33a0fc52fece7f8d34fb628010` (Art Ship 007) is fully merged into this branch (0 commits behind at handoff). The branch started from the Rough Complete checkpoint `c2a637b` and includes all Rough Complete runtime (save v12, 110 adventures, Combat 2.0, …).
- **Gate at handoff:** `npm test`, `npm run build` and `npm run verify:artifact` all PASS, including in a clean LF checkout. The asset register has 313 entries with 0 hash mismatches, and there are no asset or Art Department changes against `origin/main`.

## What the Director owns
In `js/engine/stage.js` (`RAPresentationDirector`), with data in `js/data/presentation*.js` and contracts in `js/data/stages.js`, for every migrated screen:
- The camera: zoom, crop, snap-pan and cut, one mapping from world to screen, snapped to device pixels.
- Actor size, which comes from shot profiles and contact-line depth scale only. The legacy `RADisplay` 1.85× multiplier, the Combat 2.0 0.9× multiplier and per-scene CSS sizes aren't used on Director screens.
- The UI-aware screen modes (HUD / world / UI bands), and the UI band layout for tagged scene UI (`data-pd-ui`).
- World-attached FX (body units), world layers, stage objects, beats, moves and marks.
- Presentation QA:
  - geometry and live lint: size and consistency, faces, UI overlap, placement, dead space, FX bounds, text fit
  - locks with input hashes
  - the census, sweeps and dry runs
  - the aspect-integrity guard (frozen art is never stretched)

`docs/PRESENTATION_DIRECTOR.md` is the architecture reference.

## What has been migrated
- **Wave 1:** every adventure screen, through the adapter (94 distinct screens across 315 nodes).
- **Wave 2:** every Combat 2.0 fight (17 fight × environment screens).
- **Pilot and Wave 3:**
  - the legacy throne and docks fights
  - the docks story and Supra payoff
  - the Desire Trip curb and stargazing
  - Property exterior and interior
  - Ogun's Rave interior and exterior
  - the bedroom hub
  - the UI-only screens: trip travel/return and the character reveal
- **Wave 4:** Property interior talk/inspect choreography.

Minigames and the phone are UI overlays that run inside the Director screen. Minigames keep a 9:16 stage.

## Unmigrated / out of scope
- Desktop 9:16 presentation (phone-first scope by HQ direction).
- Dev-only pages: `party-dev.html`, `rave-review.html`, `minigame-lab.html`.
- Art Ship 004–007 frozen art that isn't runtime-integrated yet, including the ocean-floor master and the Art Ship 007 environments and characters. Integrating it is a separate Engineering change.
- `window.__pdLegacy` is a test hook only, used by the census to produce legacy baselines.

## Known tickets and risks
- **Six presentation tickets:** PD-W1-01…04, PD-W3-01 and PD-W3-02, in `docs/presentation/NEEDS_CREATIVE.md`.
- **One non-presentation follow-up:** FU-01, an out-of-order story-node null crash at `js/data/btf/adventures/w2.js:16`, also recorded there.
- **Risks:**
  - Placeholder art makes some checks PROVISIONAL. Re-run the dry runs and sweeps when art is integrated; the Wave 1/2 locks will show exactly which screens change.
  - Full-width environments set the widest possible shot through their depth scale.
- Full detail: `docs/presentation/BULK_QA_REPORT.md` and `docs/presentation/MIGRATION_LOG.md`.

## Regression locks and evidence (preserve)
- **Locks** (all enforced by `npm test` via `tools/presentation-test.mjs`):
  - Hero shots: `js/data/presentation_locks.js`
  - Wave 1 adventures: `docs/presentation/locks/wave1-adventures.json`
  - Wave 2 fights: `docs/presentation/locks/wave2-combat.json`
  - Asset metadata: `js/data/presentation_assets.js`, generated from `tools/presentation/annotations.json`
- **Golden set (committed):** `docs/presentation/golden/` holds approved and known-bad references with hashes, plus `GOLDEN.json`.
- **Reviewer evidence:** screenshots, contact sheets, sweep JSON and sealed judge keys live under `work/presentation_census/REVIEWER_ONLY/`. The folder is git-ignored and player-blind, deliberately kept out of the repo because it contains unseen content. It's fully regenerable with the tools below and isn't needed to resume.

## How a fresh engineer should resume
1. Check out `claude/presentation-director`, then run `npm test`. On Windows checkouts with CRLF line endings the index check is EOL-agnostic, so it works either way.
2. Read in this order:
   - `docs/PRESENTATION_DIRECTOR.md`
   - this file
   - `docs/presentation/NEEDS_CREATIVE.md`
   - `docs/presentation/BULK_QA_REPORT.md`
3. Tools (Playwright from `RA_PLAYWRIGHT_PATH`; Chromium from `RA_CHROMIUM_PATH` or the Playwright-managed browser):
   ```bash
   node tools/presentation-census.mjs --scenes <ids> [--candidates] [--fx] [--legacy]
   ```
   ```bash
   node tools/presentation-sweep.mjs [--combat]
   ```
   ```bash
   node tools/presentation-adventure-dryrun.mjs [--combat] [--write-lock]
   ```
4. **For any presentation change:**
   - migrate using the entries in `PRESENTATION_DIRECTOR.md`
   - variant lint (dry runs)
   - census and sweep
   - internal visual review, reviewer-only
   - re-lock (`--write-lock`, or a re-judge for hero locks with sealed keys)
   - record tickets
5. Keep captures PLAYER-BLIND. Never merge or deploy without HQ.
