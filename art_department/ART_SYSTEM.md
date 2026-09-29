# Art system

- PIXELS OUTRANK PROSE for measuring established visual grammar.
- Written canon controls character/world facts.
- Explicit Production Control decisions control approval/freeze status.
- Asset existence does not imply approval.
- Rejected/exploratory art is excluded from default future style study.
- A generated image enters the approved visual corpus only after explicit Ube / UNDERLORD / HQ acceptance.
- Direction approval, Taste Pass, Approved Master, and FROZEN are distinct states.
- Fresh Art Agents must complete onboarding and receive approval before generating production art.

## Ownership and states
Ube owns taste/canon; HQ / UNDERLORD owns scope, acceptance and freeze; Art executes a bounded visual brief; Engineering owns runtime integration. Art cannot approve itself or redefine stage contracts. Preserve PLAYER-BLIND boundaries; do not add hidden story details to onboarding/review material.

Use REFERENCE, EXPLORATION, CANDIDATE, APPROVED MASTER, FROZEN, REJECTED / ARCHIVED. If acceptance cannot be proven, use STATUS UNKNOWN — HQ REVIEW REQUIRED. Status is not derived from filenames, repository presence, generation quality or technical test success.

REFERENCE requires an explicit purpose and may be an accepted target or inspiration without production authority. EXPLORATION is not a master. CANDIDATE is a production-intended submission awaiting acceptance. APPROVED MASTER names accepted exact production pixels. FROZEN additionally records immutability in a defined scope. REJECTED / ARCHIVED preserves history but excludes default reuse. Closure and review state are separate fields; neither implies taste acceptance.

## Production Workflow Protocols

### 1. Fresh Chat Onboarding
Every fresh Art Agent must begin with:
- Open the latest Rich Alucard repository.
- Read `art_department/START_HERE.md` completely.
- Complete the onboarding it specifies in the Required Reading Order.
- Then execute the authorized Art Ship or production brief.

The repository is institutional memory. Prior chats are not required. Ube should not need to manually re-upload the whole visual corpus for every fresh art session.

### 2. Whole-Package Generation
Default behavior for character production:
$$\text{SOURCE REVIEW} \longrightarrow \text{INTERNAL IDENTITY ANCHOR} \longrightarrow \text{ALL AUTHORIZED STATES} \longrightarrow \text{INTERNAL QA} \longrightarrow \text{PACKAGE} \longrightarrow \text{UNDERLORD / UBE GATE}$$
Do NOT stop after every ordinary state. Generating the full authorized state package in one continuous workflow preserves cohesive visual identity and minimizes conversational drift.

### 3. Identity-Preserving Derivation
After the identity anchor is established, derive ordinary states from that same identity. Preserve:
- Face, skin tone, facial hair, and expression character
- Proportions, height, silhouette, and mass
- Palette identity and wardrobe continuity
- Accessories and key signifiers
- Native pixel grammar, cluster resolution, and contact conventions (`contact (40,88)` for standard 80×96 actors)

### 4. Local Repair Rule
If one state in a multi-state family fails QA:
- Repair **only** that specific state.
- Do NOT regenerate already-good states.
- Do NOT regenerate a full accepted family unless the identity anchor itself is defective.

### 5. Batching
Multiple related characters may be produced in one coherent batch when:
- Sources are complete
- Shared art grammar is stable
- Characters remain individually distinguishable with distinct body types and silhouettes
- Each character is still reviewed and frozen independently
- Batching must never homogenize silhouettes or body types.

### 6. Drift Control
Fresh art sessions are preferred between major coherent batches. Do not maintain an indefinitely growing production chat when clean re-onboarding from repository authority is available.

## Visual Lane A & Concept Card Authority (OVERLORD OL-012)

- **OPEN Visual Concept Cards are identity authority.**
- **Art-Director Discretion:** When a card is silent on exact face, skin tone, hair, or minor palette details, normal art-director discretion may fill the gap inside MUST / MUST NOT boundaries.
- **Adult Age Rule:** All human characters are adults. Authored ages remain authoritative. Characters subject to the project's explicit 21+ requirement must read clearly 21+. No juvenile or childlike proportions or styling.
- **Ube Judgment Gates:** Mama Gbenga and Auntie Grit require explicit Ube judgment before freeze.
- **Visual A Production Order:** 1. Gbenga (DONE) $\to$ 2. Carlos (DONE) $\to$ 3. Senator $\to$ 4. Mama Gbenga $\to$ 5. Half-Pint $\to$ 6. Sunday Best $\to$ 7. Young Mazi $\to$ 8. Auntie Grit $\to$ 9. Open Mouth Gang $\to$ 10. Gbenga's boys $\to$ 11. Uncle Bamidele $\to$ 12. Mister December $\to$ 13. hunters $\to$ 14. HOA president $\to$ 15. trap crew.

## Approval and delta
Preserve decision text, authority, scope, exact paths and hashes. Do not infer acceptance of an entire folder or archive. Do not edit frozen submission headers merely because later decisions supersede them. Record the newer authority separately. Identical bytes in an exploratory path and a master path can have different roles. A freeze applies only to its named files/target and states. Changes require an explicit delta, source hashes, allowed regions, unchanged-region evidence and fresh HQ review. Runtime acceptance is distinct from Art PASS.

## Repository discipline
No runtime asset moves, renames or edits for indexing. Use repository-root-relative paths and SHA-256; retain canonical filenames. External historical paths are audit locators only, never required onboarding authority. Missing legacy media stays missing; do not reconstruct it. Use current repository docs for current integration, inherited sources for historical acceptance. Do not merge, push or deploy merely to publish this documentation. Keep all required knowledge self-contained in this directory and current repo docs; optional external archives may remain unavailable on a fresh machine.

Native frozen source pixels never change. For Presentation Director-managed scenes, final display size is controlled solely by the Director's shot profile, camera and framing metadata. Historical approximately 1.85× guidance may inform provenance and composition review but is not a universal Director multiplier. Never resize native source art to repair runtime composition.

## Zero-upload onboarding requirement
`START_HERE.md` is the canonical cold-start entry point. Every retiring Art Agent must leave the next agent able to determine, from the repository alone: the authoritative style, frozen pixels, immutable boundaries, current implementation/integration state, current OPEN gaps, Engineering visual demand, restricted demand, next priority, and the candidate $\to$ approval $\to$ freeze procedure.

The durable Art-facing OPEN canon and execution subset lives in `production_authority/`. Its README records source names, versions/dates, treatment, and hashes. It must never import or summarize SEALED/HQ-only content. `CURRENT_OPEN_ART_GAPS.md` and `.json` are the current reconciliation; historical Engineering lists such as `docs/btf/ART_INPUTS.md` are provenance only.

At Ship/Lane close, update `START_HERE.md`, `CURRENT_HANDOFF.md`, the current gap map, `ASSET_REGISTER.json`, `APPROVED_ASSET_INDEX.md`, `APPROVAL_LEDGER.md`, frozen totals, and recommended next priority as applicable. Run the zero-upload cold-start validation before commit. Frozen asset bytes and runtime code must remain unchanged unless a separately authorized task explicitly scopes them.
