# Rich Alucard — Engineering Handoff

**Purpose:** give the next Codex engineering session enough repository context to continue safely without this chat. This is an engineering handoff, not a new Production Card and not authorization to implement new milestone content.

## Current HEAD / build state

### Current checkpoint — ENGINEERING 02

HQ granted PASS to `1905774afae66398c46ec55340c9d07f820b9c18` on `engineering/rave-stage-framework`. Accepted stage values and content-free hooks are recorded in `RAVE_STAGE_REVIEW.md` and `STAGE_CONTRACT_HANDOFF.md`. The follow-up checkpoint records that decision and reruns checks only; use `git rev-parse HEAD` for its final commit. Status: **READY FOR INTEGRATION REVIEW**. Do not merge, push, deploy, add story/framework or begin Engineering 03 without HQ authorization. Preserve the documented progressed-save World Events baseline failure. Sections below are historical handoff context and do not supersede this boundary.

### Branch checkpoint after ENGINEERING 01 review

`engineering/party-foundation-prototype` contains the isolated DEV Party Foundation implementation at `74f55eb06183d87177163d42590a0a6a83858ef5` plus the integration-review documentation/test follow-up. Use `git rev-parse HEAD` for the final checkpoint commit. HQ issued PASS and Ube FUN PASS for the core system. Temporary situations, writing, crowd geometry and visuals are not canon or frozen production content. See `PARTY_FOUNDATION_REVIEW.md` for the exact accepted boundary, isolation checks and pre-existing progressed-save World Events smoke failure.

Current branch status: **READY FOR INTEGRATION REVIEW**. Do not merge, push, deploy, expand the prototype, implement actual story content or start another milestone without HQ authorization. The baseline/public build information below describes the prior handoff, not a deployment of this local branch.

- Branch: `main`
- Current production-control baseline before this handoff patch: `188e336ff3c8d2970522c9a98cf79aed023b4da0`
- Last verified public build before this handoff patch: `ra-188e336ff3c8-20260923010223`
- Public URL: `https://ubseoul.github.io/rich_alucard`
- Runtime: vanilla static HTML/CSS/JS. No framework and no runtime Node server.
- Deployable artifact: generated `dist/` from `tools/release.mjs build`.
- Build identity: generated `dist/build.json` and generated `dist/js/build-info.js`; DEV `?dev=1` reads the same identity.

If this document is changed and committed, the final handoff commit supersedes the baseline above. Verify public identity against the final commit before claiming the handoff is complete.

## Required reading order for a new engineering session

1. `docs/PRODUCTION_CONTROL.md`
2. `docs/CURRENT_CANON.md`
3. `docs/RICH_ALUCARD_GAME_BIBLE.md`
4. `docs/VISUAL_STYLE_BIBLE.md`
5. `docs/STAGE_CONTRACT_HANDOFF.md`
6. `docs/RELEASE_RUNBOOK.md`
7. This file, `docs/ENGINEERING_HANDOFF.md`
8. Relevant source modules for the authorized Production Card only

Production Control is now part of the contract. Ube is Creative Director / Player. HQ owns scope, integration, spoiler classification and acceptance. Engineer/Codex owns implementation, testing, tooling and deployment inside the approved product contract. Specialists cannot mark their own work PASS or FROZEN.

## Current milestone boundary

Current milestone: **RICH'S LA #001 — OGUN'S RAVE**.

Status: **PRE-PRODUCTION / PRODUCTION CONTROL**.

Known locked creative direction is recorded in `docs/PRODUCTION_CONTROL.md`: Ogun's vampire rave, Meatpacking District, attending-party mechanic, dance loadout concept, Bllad33 later in arc, blood sprinklers later, Rich hates blood in his locs, later outside sequence and eventual Castle Party Hosting unlock.

**Ogun's Rave is PRE-PRODUCTION. Engineering is NOT authorized to implement Ogun's Rave until HQ issues a Production Card.** Do not begin party foundation, arrival, rave scenes, dance systems, party mechanics, art integration, hidden event branches or milestone work from the direction above without explicit authorization.

## How to run, test, build and deploy

From the repository root:

```powershell
npm test
npm run build
npm run verify:artifact
python -m http.server 4174 --directory dist
```

Open the local build at `http://localhost:4174`. Use `?dev=1` to display build identity and DEV tools.

Deployment path:

1. Commit changes to `main`.
2. Push `main` to `origin`.
3. GitHub Actions runs the deterministic test workflow and Pages build/deploy workflow.
4. Verify the public artifact against the expected commit:

```powershell
$sha = git rev-parse HEAD
node tools/release.mjs verify-deployment --url "https://ubseoul.github.io/rich_alucard" --commit $sha --retries 8
```

A release is not verified merely because `git push` succeeded. Public `build.json`, public `js/build-info.js`, workflow commit and local/remote HEAD must agree.

## Architecture map and important files

Top-level runtime:

- `index.html` — static DOM shell for battle, bedroom, phone, desire trip scenes, JDM scenes, DEV panel and script order.
- `style.css` — global presentation, scene UI, DEV panel, battle/phone/life scene styling.
- `game.js` — legacy/central battle orchestration and current combat presentation glue. Several systems have been extracted, but this file remains important.
- `assets/` — approved production and prototype assets. Source art is treated as immutable unless explicitly authorized.

Build/release tooling:

- `tools/release.mjs` — deterministic release gate, artifact builder, artifact verifier and public deployment verifier.
- `.github/workflows/` — GitHub Actions test and Pages deploy workflows.
- `dist/` — generated static deploy artifact. Do not hand-edit as source.

Engine modules:

- `js/engine/state.js` — browser-local save state, schema version, migrations, normalization, recovery backup and quarantine behavior.
- `js/engine/scenes.js` — scene registry and scoped lifecycle cleanup. Use scene scopes for listeners/timers/frames to avoid stale presentation state.
- `js/engine/stage.js` — Stage Contract layout runtime. Runtime placement should flow through this instead of ad hoc per-scene geometry hacks.
- `js/engine/combat_foundation.js` — reusable combat definitions/state/event foundation used by existing encounters.
- `js/engine/audio.js` and `js/engine/core.js` — audio/core startup glue.

Data modules:

- `js/data/combat.js` — migrated encounter/combatant/move definitions for current combat compatibility.
- `js/data/moves.js`, `js/data/characters.js` — authored combat/character data used by presentation and legacy paths.
- `js/data/stages.js` — machine-readable Stage Contracts, including JDM docks geometry.
- `js/data/opportunities.js` — data-driven phone/opportunity access rules.
- `js/data/people.js` — Persistent People catalog.
- `js/data/world_events.js` — authored world-event definitions. Keep PLAYER-BLIND content out of user-facing reports unless HQ authorizes disclosure.
- `js/data/save_fixtures.js` — deterministic save fixtures for migration, recovery and regression tests.

Scene/system modules:

- `js/scenes/bedroom.js` — bedroom scene, Rich bedroom states, cloud ambience entry behavior and phone entry point.
- `js/scenes/phone.js` — phone shell, VampGPT flow, app routing, incoming-event presentation and phone lifecycle cleanup.
- `js/scenes/desire_trip.js` and `js/systems/desire_trips.js` — Butter Chicken Under the Stars trip flow/state.
- `js/scenes/character_reveal.js` — conversion/reveal presentation used by current content.
- `js/systems/jdm_imports.js` — JDMIMPORTS / Supra acquisition scenes, state, DEV reset and Stage Contract placement.
- `js/systems/world_events.js` — event eligibility, safe-boundary pending state, delivery, seen/resolved lifecycle.
- `js/systems/people.js` — persistent people record helpers and idempotent memories/conversion state.
- `js/systems/budget.js` — money helpers.
- `js/systems/ambience.js` — ambient helpers.
- `js/systems/combat_presentation.js` — extracted combat presentation hooks.
- `js/systems/devtools.js` — `?dev=1` panel, state inspectors and safe reset controls.
- `js/systems/smoke.js` — browser smoke/regression checks, including phone stability, save/migration and content foundations.

## Current save schema and migration system

Current save schema version: **v9** (`RAState.version`).

Primary save key: `rich_alucard_save_v1`  
Recovery key: `rich_alucard_save_v1_recovery`  
Quarantine key for malformed primary saves: `rich_alucard_save_v1_invalid`

The authoritative record is `RAState.get().life`, with major sections:

- `identity`
- `world` (`location`, `day`, `month`, `scene`, `flags`)
- `resources` (`money`, `clout`, `vampireReputation`)
- `ownership`
- `people`
- `events`
- `creativeLife`
- `phone`
- `desires`
- `acquisitions`
- `opportunities`
- `history`

Legacy `characters` and `encounters` still exist for compatibility and current encounter state. Do not delete or flatten them without an explicit migration plan.

Migration path in `js/engine/state.js`:

- Legacy / pre-v5 saves are bridged into v5.
- v5 → v6 → v7 preserves life state and adds required structures.
- v7 → v8 migrates known character information into Persistent People records.
- v8 → v9 adds `life.events.records` for World Events.

Important state invariants:

- Migration must preserve valid player progress.
- Missing/malformed optional structures normalize safely.
- Repeated migration should be idempotent.
- A valid primary save is backed up before replacement.
- Malformed primary save can recover from backup and quarantine the bad primary.
- Browser saves are local per browser/profile.

## Major implemented systems

Frozen/stable foundations currently include:

- Foundation Wave 1: save integrity and regression foundation.
- Foundation Wave 2: build/release/deployment identity and artifact verification.
- Foundation Wave 3: scene lifecycle and scoped cleanup foundation.
- Foundation Wave 4: reusable combat foundation for existing encounters.
- Foundation Wave 5: Persistent People foundation.
- Foundation Wave 6: safe-boundary World Events foundation.
- Production Control patch: studio authority, QA evidence and milestone governance.

Implemented gameplay/product foundations include:

- Throne-room combat with Blood Bath, Vampire Bite, Revenge and Octopus Brain.
- Reusable reaction thresholds and target-agnostic combat FX principles.
- Bedroom Ambient Prototype with window-clipped clouds and phone entry.
- Phone / VampGPT v0.1 with authored OGA WHAT DO I DO flow.
- Desire Trip #001: Butter Chicken Under the Stars.
- JDMIMPORTS / Supra acquisition foundation and docks Stage Contract integration.
- Browser-local persistence for life, acquisitions, people, world events and history.

## DEV and testing tools

Enable DEV tools with `?dev=1` or F2.

DEV panel currently provides:

- build/release identity readout
- font lab and cartridge tint controls
- JDM character scale selector
- Stage Contract overlay toggle
- life state inspector and editable money/location/clout/vampire reputation fields
- Persistent People inspector
- World Events inspector and proof-event reset
- browser smoke check button
- JDM / Supra quest reset
- Butter Chicken trip reset
- fresh test save
- destructive full save wipe with explicit confirmation
- bedroom scene controls and cloud controls
- curb Rich scale selector

Browser smoke entrypoint: `window.RASmoke.run()` or DEV panel `RUN SMOKE CHECK`.

Deterministic release gate: `npm test`.

Important QA rules already documented:

- `docs/STAGE_CONTRACT_HANDOFF.md` — Combat Staging QA and Real Player Path QA.
- `docs/PRODUCTION_CONTROL.md` — completion is a claim; evidence earns acceptance.

## Frozen / stable foundations to preserve

Treat these as stable unless a new Production Card explicitly permits changes:

- Build identity pipeline: generated `build.json`, generated `js/build-info.js`, asset-version query strings and public verification.
- Save schema/migration/recovery behavior.
- Scene scope lifecycle cleanup model.
- Stage Contract placement for production scenes and actual-resolution visual QA rule.
- Existing combat behavior and migrated compatibility encounters.
- Persistent People idempotency rules.
- World Events safe-boundary delivery model.
- Phone lifecycle fix from the stability patch: per-open phone scopes must be cleaned up on normal close.
- Approved source art immutability and runtime scale tuning where explicitly allowed.

## Known bugs, technical debt and integration discrepancies

No known blocking regression is open at handoff.

Known technical debt / caution areas:

- `game.js` still contains significant legacy battle orchestration and presentation glue. Use the Combat Foundation modules for future architecture work, but do not rewrite `game.js` without a scoped Production Card.
- Some current systems are compatibility layers around existing encounters rather than fully generalized engines. Preserve behavior first.
- Browser-local saves are intentionally per browser/profile; cross-browser save differences are expected.
- DEV tools can reveal implementation state. For PLAYER-BLIND work, keep completion reports and player-facing test directions spoiler-safe.
- Documentation can age quickly around release workflow details. If GitHub Pages settings or workflow behavior changes, update `docs/RELEASE_RUNBOOK.md` and this handoff together.
- Stage Contract coordinates are native 270×480 canvas pixels. Always verify final rendered composition at actual gameplay resolution; coordinate math alone is insufficient.

## Handoff instruction to next engineer

Start from the required reading order above. Do not infer authority from backlog ideas or locked creative direction. Wait for an HQ Production Card before implementing new milestone content.

Especially: **do not implement Ogun's Rave yet.**
