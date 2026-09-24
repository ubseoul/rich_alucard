# Rich Alucard Art Department — start here

This repository is the Art Department's institutional memory. **The project remembers. The chat does not.** A fresh Art Agent must be able to onboard from this file and the files it points to; no Ube-uploaded Volumes, Addenda, review boards, or prior chat are required.

## What this project is

`Rich Alucard: Before the Fame` is a portrait pixel-art life/adventure game about Rich Alucard's early life in vampire Los Angeles: rooms, dates, friends, minigames, cars, music, social systems, and small ordinary-life jokes. Art owns pixels and visual continuity; Story/canon owns meaning; Engineering owns runtime integration; Ube owns taste and canon; HQ owns scope, acceptance, and freeze.

## Current state

- The frozen ART SHIP 006 pixel authority is commit `a2992617b825acf1ab7a9bdb187d2caca66be701`; the current repository tip includes this onboarding infrastructure commit on top of it.
- ART SHIP 006 — OPEN Derivative Production Push is frozen/complete. The frozen corpus is **135 assets**; the register contains 275 entries.
- ART SHIP 004, 005, and 006 are the latest frozen Ship records. Their canonical PNGs are under `assets/` and are indexed by `APPROVED_ASSET_INDEX.md`, `ASSET_REGISTER.json`, and the Ship manifests.
- No Art Ship is active. Do not generate or modify pixels until HQ authorizes a new Ship.
- The read-only Rough Complete Engineering branch is `origin/claude/eloquent-shannon-kc5qkn` at `c2a637bb2df8143f117cff1cecc8ca1cff6ba11e`; it is not merged or deployed. It still paints new BTF surfaces with placeholders. Use the repository snapshot and gap map to understand its visual demand; never treat its historical `docs/btf/ART_INPUTS.md` as current truth.

## Authority hierarchy

1. Ube's current canon/taste decisions.
2. `docs/CURRENT_CANON.md` and `docs/PRODUCTION_CONTROL.md`.
3. Exact frozen pixels plus `ASSET_REGISTER.json` and `APPROVED_ASSET_INDEX.md`.
4. The applicable ART SHIP manifest, HQ decision, Engineering map, and state definitions.
5. The committed OPEN production-authority subsets in `production_authority/`.
6. Art Department judgment inside the explicit Ship scope.

Pixels outrank prose for established visual grammar. Asset existence is not approval. A candidate, review board, placeholder, or exploratory output cannot become style authority by existing in the repository.

## Required reading order for a fresh Art Agent

Read completely, in this order:

1. `art_department/ART_SYSTEM.md`
2. `art_department/CURRENT_HANDOFF.md`
3. `art_department/production_authority/README.md`
4. `art_department/production_authority/HQ_PRODUCTION_ADDENDUM_OPEN_ART.md`
5. `art_department/production_authority/VOL2_CHARACTER_VISUAL_BIBLE_OPEN.md`
6. `art_department/production_authority/VOL5_OPEN_VISUAL_ADDITIONS.md`
7. `art_department/production_authority/ROUGH_COMPLETE_ENGINEERING_SNAPSHOT.md`
8. `art_department/CURRENT_OPEN_ART_GAPS.md` and `CURRENT_OPEN_ART_GAPS.json`
9. `art_department/STYLE_FINGERPRINT.md` and the relevant files in `art_department/references/`
10. `art_department/APPROVED_ASSET_INDEX.md`, then the relevant `ASSET_REGISTER.json` entries and native PNGs
11. The relevant frozen Ship records under `art_department/ships/` (004, 005, 006)
12. `art_department/APPROVAL_LEDGER.md` and the templates under `art_department/templates/`

For implementation state, also read the current repository `docs/ENGINEERING_HANDOFF.md` and the committed snapshot above. The Rough Complete branch's `CHECKPOINT.md`, `DECISIONS.md`, and `ART_INPUTS.md` are historical read-only evidence and are already reconciled in the snapshot/gap map.

## Where authority lives

- Frozen pixels: repository-root `assets/`, exact paths recorded in `ASSET_REGISTER.json` and `APPROVED_ASSET_INDEX.md`.
- Ship-specific hashes, scopes, and Engineering mappings: `art_department/ships/art_ship_004/`, `art_ship_005/`, and `art_ship_006/`.
- Visual measurements and pixel grammar: `STYLE_FINGERPRINT.md` and `references/CHARACTERS.md`, `ENVIRONMENTS.md`, and `OBJECTS_FX_AMBIENT.md`.
- OPEN source/canon needed for Art: `production_authority/`.
- Current gaps and next priority: `CURRENT_OPEN_ART_GAPS.md` / `.json`.

## Implementation and open demand

The frozen corpus is present, but Ship 004/005/006 records are handoff-only and not runtime-integrated by those Ships. The Rough Complete branch currently renders 61 historical environment placeholders and 56 character slots through `RAPixel`; the reconciled current list is in `CURRENT_OPEN_ART_GAPS.md`. That map distinguishes frozen/satisfied, candidate, derivative state, still-missing identity/environment, Engineering integration, canon blockers, and restricted demand. Do not guess integration status from filenames.

Primary gameplay characters target approximately **1.85×** historical on-screen presentation with nearest-neighbor filtering. This is an Engineering runtime rule, not permission to enlarge or redesign native source sprites. Composed room art has its own contract.

## OPEN vs restricted boundaries

OPEN cards and the repository's frozen corpus are actionable only within an authorized Ship. GUIDED material needs its named scope. Never inspect, import, summarize, or visually solve SEALED/HQ-only material. Keep restricted reveal identities, Vol 4, Vol 5-S, HQ-only deltas, and neutral hooks out of Art-facing boards and records. If a request crosses that boundary, stop and record `SEALED / DO NOT TOUCH`.

## Candidate → approval → freeze procedure

An Art Agent may generate only after HQ names an Art Ship and the agent completes a scoped onboarding report. Work from the frozen master, not a derivative. Submit native pixels, exact integer review boards, state definitions, Engineering mappings, source-preservation evidence, validation, and hashes. Ube/HQ reviews the candidate; only an explicit decision can make it `APPROVED MASTER`, and only an explicit freeze can make it `FROZEN`. Runtime integration is a separate Engineering decision.

Before retirement, update as applicable: `START_HERE.md`, `CURRENT_HANDOFF.md`, `CURRENT_OPEN_ART_GAPS.md` / `.json`, `ASSET_REGISTER.json`, `APPROVED_ASSET_INDEX.md`, `APPROVAL_LEDGER.md`, Ship Engineering maps, frozen totals, and the recommended next priority. Run the repository/art validation, verify every frozen asset hash, verify no runtime changes, perform the cold-start test, commit only scoped Art Department documentation/assets, push, and verify a clean tree.

The current handoff says **STOP**: ART SHIP 006 is frozen/complete and no new Ship is authorized by this repository state.
