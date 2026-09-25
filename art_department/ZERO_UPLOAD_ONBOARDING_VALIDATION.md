# Zero-upload onboarding validation

**Date:** 2026-09-25
**Authority tested:** ART SHIP 008 promotion tree based on candidate checkpoint `d37e157b929f1a8ae8e690f30f73729e81e491bf`
**Final onboarding record:** promotion commit containing `ships/art_ship_008/ART_SHIP_MANIFEST.json`
**Result:** **PASS**

## Cold-start simulation

The simulation began with no chat history, no uploaded Vol 2/Vol 5/Addendum, no review boards, and no old onboarding prompt. The only starting file was `art_department/START_HERE.md`. Following its required reading order reached every required repository record without an external path.

| Question | Repository-only answer | Evidence |
|---|---|---|
| 1. What visual style is authoritative? | Frozen native pixels; PIXELS OUTRANK PROSE; measured grammar and anchors are in the Style Fingerprint and references. | `STYLE_FINGERPRINT.md`, `references/`, `APPROVED_ASSET_INDEX.md` |
| 2. What is frozen? | 187 frozen assets, with exact paths/hashes/scopes in the register and Ship manifests. | `ASSET_REGISTER.json`, `APPROVED_ASSET_INDEX.md`, `ships/art_ship_004..008/` |
| 3. What cannot be changed? | Frozen bytes, identities, proportions, palette logic, density, contacts, and restricted content; runtime code is outside this Art task. | `ART_SYSTEM.md`, `CURRENT_HANDOFF.md`, `production_authority/HQ_PRODUCTION_ADDENDUM_OPEN_ART.md` |
| 4. What is the current implementation state? | The current frozen-art integration checkpoint remains 75 PASS / 45 HOLD. Ship 008 adds 14 approved/frozen assets but performs no runtime integration, alias decision or PASS/HOLD update. | `CURRENT_HANDOFF.md`, `docs/art_integration/INTEGRATION_MATRIX.json`, `ships/art_ship_008/` |
| 5. What OPEN art is still missing? | 8 identity slots, 14 environments/conditions, and the listed props, vehicle surfaces, overlays, crowds, derivative states, and full UI screens. Ship 008 items are art-supplied but runtime-open pending integration/QA. | `CURRENT_OPEN_ART_GAPS.md` / `.json` |
| 6. What does Engineering need visually? | Integrate the 14 Ship 008 frozen assets using the exact map, verify the Rookoko default alias with runtime/content intent, preserve Director framing authority, then rerun the matrix and runtime visual QA. | `CURRENT_HANDOFF.md`, `ships/art_ship_008/ENGINEERING_ASSET_MAP.json` |
| 7. What is sealed/forbidden? | Vol 4, Vol 5-S, sealed reveal identities, Cryptrat/second-dragon dispositions, HQ-M01/M02/M03, and other HQ-only material. | `START_HERE.md`, `ART_SYSTEM.md`, source subsets, gap map |
| 8. What is the next priority? | Engineering integration and runtime QA for the 14 Ship 008 assets, including the explicit Rookoko alias-intent verification; do not open another Art Ship until demand is refreshed. | `CURRENT_HANDOFF.md`, `CURRENT_OPEN_ART_GAPS.md` |
| 9. How are future assets packaged/reviewed/frozen? | Authorized Ship → native candidates → deterministic review/validation → Ube/HQ acceptance → Approved Master → explicit Freeze → register/index/ledger/maps/gaps updated → hash/clean-tree verification. | `ART_SYSTEM.md`, `templates/`, frozen Ship records |

## Automated repository checks performed

- The promotion baseline `HEAD` resolved exactly to candidate checkpoint `d37e157b929f1a8ae8e690f30f73729e81e491bf` before promotion.
- All referenced onboarding files exist under the repository.
- The three production-authority subsets contain no external file links or source-packet dependency for required navigation.
- ART SHIP 008 accepted/canonical hashes are recorded in `ships/art_ship_008/ART_SHIP_MANIFEST.json`, `SOURCE_PACKAGE_SHA256SUMS.txt` and the promotion validation report.
- All 173 pre-existing frozen asset hashes passed before and after promotion.
- All 14 ART SHIP 008 promoted PNGs match their accepted candidate hashes; the resulting frozen corpus is 187 assets and no runtime/gameplay path changed.
- No SEALED/HQ-only source was opened or imported for this onboarding system.

## Outcome

The onboarding system is complete for repository-only use. A future agent can answer all nine cold-start questions from the repository and can identify the next action without Ube manually assembling an onboarding packet.
