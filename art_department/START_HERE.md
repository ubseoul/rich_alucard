# Rich Alucard Art Department — start here

This repository is the Art Department's institutional memory. **The project remembers. The chat does not.** A fresh Art Agent must be able to onboard from this file and the records it points to; no Ube-uploaded source packet or prior chat is required.

## What this project is

`Rich Alucard: Before the Fame` is a portrait pixel-art life/adventure game. Art owns pixels and visual continuity; Story/canon owns meaning; Engineering owns runtime integration; Ube owns taste and canon; HQ owns scope, acceptance and freeze.

## Current state

- Runtime/art-integration authority: `origin/claude/art-ship-010-integration` at `8eab30dc790071ec8da98f65311e2b4676fabad0`.
- ART SHIP 011 is the latest frozen pixel authority. The frozen corpus contains **212 assets**; the Asset Register contains **352 entries**.
- ART SHIP 004–011 hand off **192 frozen files**. At the current checkpoint, **159 drive runtime**, **9 Ship 011 population-library assets have no runtime assignment**, one historical file is superseded, **12 are handoff/reference sheets**, six approved states have no current scene, four files are mapping-ambiguous, and one prop has no visual surface.
- The playable census contains **104 adventure screens + 17 fights**: **106 PASS (final art)** and **15 HOLD**. All automated adventure/fight presentation checks pass; HOLD means missing or incorrect creative coverage, unresolved cast/environment art, or an explicit NEEDS CREATIVE condition—not generic Presentation Director failure.
- ART SHIP 011 — NIGHTLIFE POPULATION LIBRARY is APPROVED MASTER / FROZEN / COMPLETE on `art/art_ship_011`. The package adds nine reusable anonymous-adult population fragments with stable IDs and frozen placement constraints. No runtime screen, Presentation Director mapping or HOLD resolution is assigned by this freeze.

## Authority hierarchy

1. Ube's current canon/taste decisions.
2. `docs/CURRENT_CANON.md` and `docs/PRODUCTION_CONTROL.md`.
3. Exact frozen pixels plus `ASSET_REGISTER.json` and `APPROVED_ASSET_INDEX.md`.
4. The applicable Art Ship manifest, HQ decision, Engineering map, state definitions and Runtime Demand Map.
5. The committed OPEN production-authority subsets in `production_authority/`.
6. Art Department judgment inside the explicit Ship scope.

Pixels outrank prose for established visual grammar. Asset existence is not approval. Candidate, review and exploratory output cannot become style authority by existing in the repository.

## Required reading order for a fresh Art Agent

Read completely, in this order:

1. `art_department/ART_SYSTEM.md`
2. `art_department/CURRENT_HANDOFF.md`
3. `art_department/production_authority/README.md`
4. `art_department/production_authority/HQ_PRODUCTION_ADDENDUM_OPEN_ART.md`
5. `art_department/production_authority/VOL2_CHARACTER_VISUAL_BIBLE_OPEN.md`
6. `art_department/production_authority/VOL5_OPEN_VISUAL_ADDITIONS.md`
7. `art_department/production_authority/ROUGH_COMPLETE_ENGINEERING_SNAPSHOT.md` (historical audit context only)
8. `art_department/CURRENT_OPEN_ART_GAPS.md` and `.json`
9. `art_department/STYLE_FINGERPRINT.md` and the relevant files in `art_department/references/`
10. `art_department/APPROVED_ASSET_INDEX.md`, then relevant `ASSET_REGISTER.json` entries and native PNGs
11. Relevant frozen Ship records under `art_department/ships/` (004, 005, 006, 007, 008, 009)
12. `art_department/APPROVAL_LEDGER.md` and the templates under `art_department/templates/`

For current implementation truth, additionally read:

1. `docs/ENGINEERING_HANDOFF.md`
2. `docs/art_integration/README.md`
3. `docs/art_integration/INTEGRATION_MATRIX.json`
4. `docs/presentation/NEEDS_CREATIVE.md`
5. For an active Ship, its `RUNTIME_DEMAND_MAP.md` and machine-readable sibling.

Never use the historical Rough Complete placeholder census as current integration truth after reading the files above.

## Display-size rule

Native frozen source pixels never change. On scenes migrated to the Presentation Director, the Director's shot profile, camera and framing metadata are the **sole final display-size authority**. Historical approximately 1.85× guidance remains useful as provenance and environment-composition context, but it is not a universal multiplier for Director-managed scenes. Do not resize source sprites to repair composition.

Non-Director surfaces follow their explicit current runtime contract and still consume native assets unchanged.

## OPEN and restricted boundaries

OPEN cards and frozen pixels are actionable only inside an authorized Ship. GUIDED work requires its named authorization. Never inspect, import, summarize or solve SEALED/HQ-only material. If canon or identity is insufficient, record `BLOCKED BY CANON`; if the boundary is restricted, record `SEALED / DO NOT TOUCH`.

## Candidate → approval → freeze

An Art Agent may generate only after HQ authorizes a named Ship and the agent completes onboarding. Work from the exact frozen master, never a previous derivative. Submit native candidates, exact integer-scale review evidence, state definitions, Engineering mappings, source hashes, validation and expected HOLD resolution. A Runtime Demand Map must make every asset's ticket, runtime id, state/layer, status, source, dimensions, alpha, contact/origin, intended surfaces, severity and Engineering destination explicit.

Only an explicit decision can make a candidate `APPROVED MASTER`; only an explicit freeze can make it `FROZEN`. Runtime integration is a separate Engineering decision.

At Ship close, update as applicable: `START_HERE.md`, `CURRENT_HANDOFF.md`, the current gap map, `ASSET_REGISTER.json`, `APPROVED_ASSET_INDEX.md`, `APPROVAL_LEDGER.md`, Ship maps/manifests, frozen totals and recommended next priority. Verify frozen hashes, no runtime changes, the zero-upload cold start and a clean scoped tree.

**Current stop point:** ART SHIP 011 is FROZEN / COMPLETE. The nightlife population library remains unassigned; a later World Life / Nightlife integration task must choose actual runtime screens and Presentation Director framing while preserving every recorded placement constraint. Do not infer placement from asset availability, change the 106 PASS / 15 HOLD baseline, merge or deploy from this Art task.
