# Zero-upload onboarding validation

**Date:** 2026-09-25

**Authority tested:** ART SHIP 009 promotion tree based on accepted candidate checkpoint `47da18d9984c4915d3325709364db9a442fb3b36`

**Final onboarding record:** promotion commit containing `ships/art_ship_009/ART_SHIP_MANIFEST.json`

**Result:** **PASS**

## Cold-start simulation

The simulation began with no chat history, uploads, review boards or old onboarding prompt. The only starting file was `art_department/START_HERE.md`. Following its required reading order reached every required repository record without an external dependency.

| Question | Repository-only answer | Evidence |
|---|---|---|
| 1. What visual style is authoritative? | Frozen native pixels; PIXELS OUTRANK PROSE; measured grammar and anchors are in the Style Fingerprint and references. | `STYLE_FINGERPRINT.md`, `references/`, `APPROVED_ASSET_INDEX.md` |
| 2. What is frozen? | 199 frozen assets, with exact paths, hashes and scopes in the register and Ship manifests. | `ASSET_REGISTER.json`, `APPROVED_ASSET_INDEX.md`, `ships/art_ship_004..009/` |
| 3. What cannot be changed? | Frozen bytes, identities, proportions, palette logic, density, contacts/origins and restricted content; runtime code remains outside Art promotion. | `ART_SYSTEM.md`, `CURRENT_HANDOFF.md`, production-authority records |
| 4. What is the current implementation state? | The live post–Ship 008 integration baseline is 104 adventure screens + 17 fights at 98 PASS / 23 HOLD. Ship 009 freezes 12 assets and one zero-pixel reuse mapping but performs no runtime integration or PASS/HOLD update. | `CURRENT_HANDOFF.md`, live Integration Matrix, `ships/art_ship_009/` |
| 5. What OPEN art remains? | Four previously listed environment ids, eight identity slots, and the derivative/prop/vehicle/crowd/UI categories in the current gap map. Ship 009 coverage is art-supplied but runtime-open pending integration/QA. | `CURRENT_OPEN_ART_GAPS.md` / `.json` |
| 6. What does Engineering need visually? | Integrate the 12 Ship 009 frozen assets and approved `lan_night → tristan_apt` reuse, preserve exact layer/contact contracts and Director authority, review PD-W1-04, then rerun the matrix and real Presentation QA. | `CURRENT_HANDOFF.md`, `ships/art_ship_009/ENGINEERING_ASSET_MAP.json` |
| 7. What is sealed/forbidden? | SEALED/HQ-only material and other restricted reveal/canon areas remain inaccessible; the current OPEN subsets and gap map state the actionable boundary. | `START_HERE.md`, `ART_SYSTEM.md`, production-authority subsets, gap map |
| 8. What is the next priority? | Engineering integration and Presentation QA for Ship 009; do not update PASS/HOLD or open another Art Ship until demand is refreshed. | `CURRENT_HANDOFF.md`, `CURRENT_OPEN_ART_GAPS.md` |
| 9. How are future assets packaged/reviewed/frozen? | Authorized Ship → Runtime Demand Map → native candidates → deterministic review/validation → Ube/HQ acceptance → Approved Master → explicit Freeze → register/index/ledger/maps/gaps updated → full hash/cold-start/clean-tree verification. | `ART_SYSTEM.md`, templates, frozen Ship records |

## Repository checks

- Every file in the START_HERE reading order exists locally.
- All current counts agree across START_HERE, CURRENT_HANDOFF and both gap-map forms: 199 frozen assets, 339 register entries, 104 adventure screens + 17 fights, 98 PASS / 23 HOLD.
- ART SHIP 009 canonical paths, hashes, state/layer contracts and Engineering mappings are self-contained in the repository.
- All 12 promoted PNGs match their accepted candidate hashes; the entire 199-file frozen corpus and all 18 referenced source hashes pass.
- `lan_night → tristan_apt` is documented as zero-pixel reuse with no duplicate bitmap.
- PD-W1-04 and Presentation Director final-framing authority remain explicit.
- PLAYER-BLIND review evidence remains reviewer-only.
- No runtime/gameplay code changed and no SEALED/HQ-only content was opened or imported.

## Outcome

The onboarding system is complete for repository-only use. A future Art Agent can determine authoritative style, frozen pixels, immutable boundaries, current implementation truth, open/blocked demand, Engineering's next step and the Ship lifecycle without Ube reassembling an onboarding packet.
