# Art system

- PIXELS OUTRANK PROSE for measuring established visual grammar.
- Written canon controls character/world facts.
- Explicit Production Control decisions control approval/freeze status.
- Asset existence does not imply approval.
- Rejected/exploratory art is excluded from default future style study.
- A generated image enters the approved visual corpus only after explicit Ube/HQ acceptance.
- Direction approval, Taste Pass, Approved Master, and FROZEN are distinct states.
- Fresh Art Agents must complete onboarding and receive HQ PASS before generating production art.

## Ownership and states
Ube owns taste/canon; HQ owns scope, acceptance and freeze; Art executes a bounded visual brief; Engineering owns runtime integration. Art cannot approve itself or redefine stage contracts. Preserve PLAYER-BLIND boundaries; do not add hidden story details to onboarding/review material.

Use REFERENCE, EXPLORATION, CANDIDATE, APPROVED MASTER, FROZEN, REJECTED / ARCHIVED. If acceptance cannot be proven, use STATUS UNKNOWN — HQ REVIEW REQUIRED. Status is not derived from filenames, repository presence, generation quality or technical test success.

REFERENCE requires an explicit purpose and may be an accepted target or inspiration without production authority. EXPLORATION is not a master. CANDIDATE is a production-intended submission awaiting acceptance. APPROVED MASTER names accepted exact production pixels. FROZEN additionally records immutability in a defined scope. REJECTED / ARCHIVED preserves history but excludes default reuse. Closure and review state are separate fields; neither implies taste acceptance.

## Ship lifecycle
Only HQ authorizes an Art Ship. Record inputs, permission boundaries, spoiler classification, deliverables and stop point using the templates. Explore only inside scope. Ube Taste Pass selects direction; production requires authorization. Submit native assets, exact integer review exports, contacts/layers/states and source-preservation evidence required by the Ship. Report READY FOR HQ REVIEW. HQ may accept, request fixes, reject or freeze exact files. Art updates this corpus only from explicit decisions, then retires the session with a complete handoff.

## Runtime Demand Map

Every runtime-completion Ship must create a Ship-level `RUNTIME_DEMAND_MAP.md` and machine-readable sibling before pixel generation. Each requested asset must record: source NEEDS CREATIVE/gap ticket; runtime asset id; asset type; exact state/condition/layer; OPEN or GUIDED status; frozen source path and SHA-256 when derivative; native dimensions; alpha/opacity contract; contact point or exact-origin requirement; exact intended runtime surfaces; severity (`BLOCKING`, `POLISH`, or `COVERAGE`); expected HOLD/problem class cleared; and the Engineering mapping key/path. Use reviewer-only records for protected story context while keeping user-facing reports to neutral ticket ids and counts. Engineering must never infer placement or purpose from filenames.

A Runtime Demand Map is a production contract, not approval. Proposed entries remain `PLANNED — GENERATION NOT AUTHORIZED`; generated entries remain `CANDIDATE — HQ/UBE REVIEW REQUIRED` until an explicit decision changes them.

## Approval and delta
Preserve decision text, authority, scope, exact paths and hashes. Do not infer acceptance of an entire folder or archive. Do not edit frozen submission headers merely because later decisions supersede them. Record the newer authority separately. Identical bytes in an exploratory path and a master path can have different roles. A freeze applies only to its named files/target and states. Changes require an explicit delta, source hashes, allowed regions, unchanged-region evidence and fresh HQ review. Runtime acceptance is distinct from Art PASS.

## Repository discipline
No runtime asset moves, renames or edits for indexing. Use repository-root-relative paths and SHA-256; retain canonical filenames. External historical paths are audit locators only, never required onboarding authority. Missing legacy media stays missing; do not reconstruct it. Use current repository docs for current integration, inherited sources for historical acceptance. Do not merge, push or deploy merely to publish this documentation. Keep all required knowledge self-contained in this directory and current repo docs; optional external archives may remain unavailable on a fresh machine.

Native frozen source pixels never change. For Presentation Director-managed scenes, final display size is controlled solely by the Director's shot profile, camera and framing metadata. Historical approximately 1.85× guidance may inform provenance and composition review but is not a universal Director multiplier. Never resize native source art to repair runtime composition.

## Zero-upload onboarding requirement

`START_HERE.md` is the canonical cold-start entry point. Every retiring Art Agent must leave the next agent able to determine, from the repository alone: the authoritative style, frozen pixels, immutable boundaries, current implementation/integration state, current OPEN gaps, Engineering visual demand, restricted demand, next priority, and the candidate→approval→freeze procedure.

The durable Art-facing OPEN canon and execution subset lives in `production_authority/`. Its README records source names, versions/dates, treatment, and hashes. It must never import or summarize SEALED/HQ-only content. `CURRENT_OPEN_ART_GAPS.md` and `.json` are the current reconciliation; historical Engineering lists such as `docs/btf/ART_INPUTS.md` are provenance only.

At Ship close, update `START_HERE.md`, `CURRENT_HANDOFF.md`, the current gap map, `ASSET_REGISTER.json`, `APPROVED_ASSET_INDEX.md`, `APPROVAL_LEDGER.md`, the Ship Engineering map, frozen totals, and recommended next priority as applicable. Run the zero-upload cold-start validation before commit. Frozen asset bytes and runtime code must remain unchanged unless a separately authorized task explicitly scopes them.
