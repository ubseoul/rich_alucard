## Owner feedback patch - 2026-10-11 (local candidate, not published)

Authority: Ube's current feedback supersedes historical stop instructions only for the bounded sibling candidates below. Preserve original masters, approved dialogue words/order, combat damage/timing, car prices/ownership/story gates, and the separate r5 QA baseline.

Project-wide visual lessons: reuse established combat and dialogue components; size actors using their visible silhouette rather than padded canvas dimensions; keep touch controls clear of actors and text; use coherent native pixel density, stepped outlines and restrained material palettes; keep one character design across every animation pose; make attack effects match the game's existing pixel language. Inspect native and actual consumer pixels before claiming completion.

Current patch checklist and dependency order:

1. [x] Consolidate owner instructions here; preserve unrelated guidance.
2. [x] Permanent **Get a car** in Your Time -> existing JDM screen; visibility on every post-intro day, unchanged buying gates, back/close/mobile checks. 50 integrated checks passed.
3. [x] Uncle Bunmi uses established Rich dialogue, one line at a time, with exact existing words/order/choices and persisted route state; tap/keyboard/reload/encounter transition checks.
4. [x] Quit remains in clear touch UI space; Grandma is unobscured. Human Bunmi and his roach have readable visible size with grounded feet and no clipping at 360/390/430/desktop.
5. [x] Cohesive pixelated roach family: idle and all four moves' prepare/action/contact/recovery, plus actual hit/result states. Preserve source art/provenance and animation registration. Replace La Chancla chain-looking effect with readable pixel sandal waves; damage/contact/timing unchanged.
6. [x] Integrated focused screenshots, controls/save/replay checks and one combined local patch handoff. 52 five-size host checks, 24 combat/receipt checks and 16 rule comparisons passed. Technical candidate complete; art taste/HQ acceptance and publication remain parent-owned. Independent broad QA stays on public bba89da / engine 13b88add / private d45e493 / pack 98f708ad.

Completed work is retained when later feedback changes ordering. The checklist is acceptance order, not a request to redo already verified work. Candidate/delta evidence belongs with the patch; it does not replace baseline or imply full-campaign acceptance.

---

# Current handoff

OL-052 current launch scope: P-C deferred, 0 launch rows; no pose sheets/videos or wardrobe-tier code requested. Only P-D remains (50). Three accepted dance loops stay registered as the single launch outfits (Tier 2 internal record), with unchanged always-on rendering. P-C briefs/checklist are in `art_department/future/`; OL-042 wardrobe ingest wiring cancelled. All further work/drops use 002. Earlier wardrobe instructions below are historical.


OL-047 current branch: `build/visual-completion-002`. 001 superseded by 002 (OL-047, rebase onto build2-accepted). All further BUILD-4 work, drops and final reports use 002. Normal push only; remote 001 retained at `807523cb369776540bc573dd53a9fc753d2f30de`. Resume `docs/progress/BUILD4.md`; earlier publication-pending notes below are history.


OL-046 supersedes counts below: P-A 0 / P-B 0 / P-C 18 / P-D 50; 68 pending total. IMAGE_PROMPTS_P-D.md now has 48 targets, including GUNS (eight held sprites). BUILD-6 owns learned-move FX. Rebased locally onto build2-accepted (40fd2bc02e4793380fbf9f6cb04c95113a46db11); no approved art/audio regenerated.


**OL-042 CURRENT:** sections 1–4 applied; 960 frozen paths, zero altered pixels; 21 decision rows closed and DEV excluded. 60 pending (P-A 0 / P-B 0 / P-C 18 / P-D 42). Use `briefs/IMAGE_PROMPTS_P-D.md` and `briefs/P-C_STEPS.md`; Ube returns filename-only images/videos. Hash authority is `build4/PRESERVED_ART_HASH_AUDIT.json`. Historical OL-039/ship records follow.

BUILD-4 / OL-039 status: integration and package preparation complete; awaiting Ube's four package drops. Current register: 952 frozen PNG paths, zero frozen baseline bytes altered. Start at `docs/progress/BUILD4.md`, `PLACEHOLDER_LOG.md`, and `briefs/P-A.md` through `briefs/P-D.md`. The shipment record below is retained as history. No new production taste approval is asserted.

**ART SHIP 015 — APPROVED MASTER / FROZEN / COMPLETE.**

## Freeze result

- Branch: `art/art_ship_015`.
- Ube/HQ Taste Pass: **PASS**; exact-byte promotion and freeze authorized.
- Promoted masters: **7/7**, all byte-for-byte identical to accepted candidates.
- Resolved: `A-family-brother1`, `A-family-brother2`, `A-family-brother1-avatar`, `A-family-brother2-avatar`, `A-god`, `A-og-hooper`.
- Frozen corpus: **411/411 verified**; Asset Register: **551 entries**.
- Pre-Ship-015 frozen corpus: **404/404 unchanged**.
- Candidate duplicate and frozen semantic-equality audits: PASS.
- Four Brother files remained byte-identical through correction and promotion.

## Remaining non-Ship-015 requirements

- `MAPPING / ENGINEERING DECISION` (5): `C-big-fish`, `D-runtime-delivery`, `D-runtime-damaged`, `G-env-catacomb_dead`, `G-env-halloween`.
- `CONDITIONAL — EXISTING ART MUST BE TESTED FIRST` (6): `A-RICH-hungover`, `A-RICH-portobello_wake`, `D-supra-world`, `E-cube`, `G-castle_party`, `G-grave`.
- SEALED remains excluded and untouched.

## Runtime boundary

Runtime authority remains `claude/hold-clearance-001` at `a66170218375e52404715789dde48c23726a6044`: **108 PASS / 13 HOLD**, unchanged. Ship 015 requires separate Engineering mapping/integration and runtime/Presentation QA.

Ship 011 remains separately frozen/unassigned. No runtime/gameplay file, Presentation mapping, PASS/HOLD state, Engineering/main branch, deployment or SEALED material changed.

## Stop

**ART SHIP 015 — APPROVED MASTER / FROZEN / COMPLETE. ART PRODUCTION IS DORMANT.**
