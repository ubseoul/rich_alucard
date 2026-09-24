# Zero-upload onboarding validation

**Date:** 2026-09-24
**Authority tested:** `a2992617b825acf1ab7a9bdb187d2caca66be701`
**Final onboarding record:** documentation-only repository tip after this validation
**Result:** **PASS**

## Cold-start simulation

The simulation began with no chat history, no uploaded Vol 2/Vol 5/Addendum, no review boards, and no old onboarding prompt. The only starting file was `art_department/START_HERE.md`. Following its required reading order reached every required repository record without an external path.

| Question | Repository-only answer | Evidence |
|---|---|---|
| 1. What visual style is authoritative? | Frozen native pixels; PIXELS OUTRANK PROSE; measured grammar and anchors are in the Style Fingerprint and references. | `STYLE_FINGERPRINT.md`, `references/`, `APPROVED_ASSET_INDEX.md` |
| 2. What is frozen? | 135 frozen assets, with exact paths/hashes/scopes in the register and Ship manifests. | `ASSET_REGISTER.json`, `APPROVED_ASSET_INDEX.md`, `ships/art_ship_004..006/` |
| 3. What cannot be changed? | Frozen bytes, identities, proportions, palette logic, density, contacts, and restricted content; runtime code is outside this Art task. | `ART_SYSTEM.md`, `CURRENT_HANDOFF.md`, `production_authority/HQ_PRODUCTION_ADDENDUM_OPEN_ART.md` |
| 4. What is the current implementation state? | Rough Complete branch is read-only, unmerged, and placeholder-backed; Ship 004/005/006 are frozen handoff records, not runtime integration approval. | `production_authority/ROUGH_COMPLETE_ENGINEERING_SNAPSHOT.md` |
| 5. What OPEN art is still missing? | 26 identity slots, 36 environments/conditions, and the listed props, vehicle surfaces, overlays, crowds, and full UI screens. | `CURRENT_OPEN_ART_GAPS.md` / `.json` |
| 6. What does Engineering need visually? | Integration of 115 frozen Ship files, then current-path derivatives, high-reuse environments, props/crowds, and full UI; historical ART_INPUTS is reconciled, not authoritative. | `CURRENT_OPEN_ART_GAPS.md`, `production_authority/ROUGH_COMPLETE_ENGINEERING_SNAPSHOT.md` |
| 7. What is sealed/forbidden? | Vol 4, Vol 5-S, sealed reveal identities, Cryptrat/second-dragon dispositions, HQ-M01/M02/M03, and other HQ-only material. | `START_HERE.md`, `ART_SYSTEM.md`, source subsets, gap map |
| 8. What is the next priority? | Engineering integration of the 115 frozen Ship 004–006 files; then a bounded derivative/condition Ship. | `CURRENT_HANDOFF.md`, `CURRENT_OPEN_ART_GAPS.md` |
| 9. How are future assets packaged/reviewed/frozen? | Authorized Ship → native candidates → deterministic review/validation → Ube/HQ acceptance → Approved Master → explicit Freeze → register/index/ledger/maps/gaps updated → hash/clean-tree verification. | `ART_SYSTEM.md`, `templates/`, frozen Ship records |

## Automated repository checks performed

- `HEAD` and `origin/main` both resolve to `a2992617b825acf1ab7a9bdb187d2caca66be701` before documentation work.
- All referenced onboarding files exist under the repository.
- The three production-authority subsets contain no external file links or source-packet dependency for required navigation.
- The ART SHIP 006 source archive SHA-256 is recorded as the full 64-character value in `ships/art_ship_006/SOURCE_PACKAGE_SHA256SUMS.txt` and its validation records.
- Frozen Ship 004/005/006 manifests remain internally consistent; frozen PNG hashes were checked before and after this documentation change.
- No file under `assets/` changed; no runtime/gameplay path changed.
- No SEALED/HQ-only source was opened or imported for this onboarding system.

## Outcome

The onboarding system is complete for repository-only use. A future agent can answer all nine cold-start questions from the repository and can identify the next action without Ube manually assembling an onboarding packet.
