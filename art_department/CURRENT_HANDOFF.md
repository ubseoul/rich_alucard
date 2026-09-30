# Current handoff

**F01 FEEL-LOCK ASSET BATCH — UBE APPROVED / FROZEN DELIVERED SUBSET.**

- Exact frozen production pixels: **54 PNGs** under `assets/f01/feel_lock/`, manifest and decision in `art_department/f01_feel_lock/FREEZE_RECORD.json`.
- FL-A01 uses the Ube-accepted second close-up: deep red bed, phone approximately 80% of frame height, visible hand and live DOM cutout. JOLT uses code shake; thumb-typing overlay is separate.
- Source-required remainder: named Oga state families (FL-A07) and physical RECRUIT/STORY/DISTRICT loot silhouettes (FL-A10). They are not frozen.
- Frozen corpus **486**, Asset Register **628**. Prior **432/432** frozen files verified unchanged.
- Runtime registration, Presentation, audio and QA remain separate Engineering work. No SEALED material was accessed.

## Prior Visual Lane A handoff

**ART DEPARTMENT REFRESH 2026 — VISUAL LANE A INGESTION & WORKFLOW UPDATE.**

## Freeze Result

- **Visual Lane A — GBENGA:**
  - Status: **ACCEPTED / FROZEN**.
  - Anchor: `VA-GBENGA-NEUTRAL-v2` (`assets/before_the_fame/characters/gbenga/gbenga_neutral_anchor_v2.png` / `runtime_80x96/gbenga_neutral_anchor_80x96_v2.png`).
  - Accepted full six-state package: Neutral v2, Voice Note v2, "My Son" v2, Adjusting Sleeves v2, Golden Draco v2, Defeated v2.
  - Corrected Neutral v2 supersedes Neutral v1 (repaired desk foreground/contact). The other five states remained byte-identical.
- **Visual Lane A — CARLOS:**
  - Status: **ACCEPTED / FROZEN**.
  - Anchor: `VA-CARLOS-NEUTRAL-HAPPY-v1` (`assets/before_the_fame/characters/carlos/carlos_neutral_happy_anchor_v1.png` / `runtime_80x96/carlos_neutral_happy_anchor_80x96_review_v1.png`).
  - Accepted three-state package: Neutral / Happy, Betrayed, Canopy Apron.
- **Visual Lane A — BIG BING / `CGA-F2-031`:**
  - Status: **NEUTRAL + NO ACCEPTED / FROZEN / CLOSED**.
  - Anchor: `VA-BIG-BING-CGA-F2-031-NEUTRAL-v1` (`assets/before_the_fame/characters/big_bing/cga_f2_031/big_bing_neutral_anchor_80x96_v1.png`).
  - Exact SHA-256: `a133f44b9cd4c232cda4b6d779ce295da64a18dc9cdf671bc7f2531087e90ccd`.
  - Derived state: `VA-BIG-BING-CGA-F2-031-NO-v1` (`assets/before_the_fame/characters/big_bing/cga_f2_031/big_bing_no_80x96_v1.png`).
  - Exact `NO` SHA-256: `3cce5b05bed65fcb891857916eb07bab7bafd6dd9bbbcb839dd658558b926168`.
  - Ube accepted the exact speech-only derivative: three mouth pixels changed; all other native pixels remain identical to the frozen neutral anchor.
- **Visual Lane A — GRANNY BING / `CGA-F2-032`:**
  - Status: **NEUTRAL / CALLING NUMBERS ACCEPTED / FROZEN / CLOSED**.
  - Anchor: `VA-GRANNY-BING-CGA-F2-032-NEUTRAL-CALLING-NUMBERS-v1` (`assets/before_the_fame/characters/granny_bing/cga_f2_032/granny_bing_neutral_calling_numbers_anchor_80x96_v1.png`).
  - Exact SHA-256: `6f042de972f6fe7fa89178095829ac44e96650cf7b067ad0004f2ca208ddf4ee`.
  - No alternate Granny Bing state was created or frozen.
- **Corpus Snapshot:**
  - Frozen corpus: **432 verified assets** (431 prior frozen assets + Big Bing `NO`).
  - Asset Register: **574 entries**.
  - Baseline frozen corpus: 411/411 verified unchanged.
  - Candidate provenance, review boards, and transparent 80×96 boards preserved in `art_department/visual_a/`.

## Active Workflow Rules

1. **Fresh Chat Onboarding:** Start from `art_department/START_HERE.md` alone. Zero manual re-upload required.
2. **Whole-Package Generation:** Complete full authorized character state packages in one continuous pass (`SOURCE REVIEW → IDENTITY ANCHOR → AUTHORIZED STATES → QA → PACKAGE → UNDERLORD GATE`).
3. **Identity-Preserving Derivation:** Derive subsequent states from the established identity anchor.
4. **Local Repair Rule:** Repair only defective states; do not regenerate good states or full families.
5. **Batching:** Coherent batches allowed when sources are complete, without homogenizing silhouettes.
6. **Drift Control:** Fresh art sessions between major batches.

## Visual Lane A Queue

1. Gbenga — **DONE / FROZEN**
2. Carlos — **DONE / FROZEN**
3. Senator — **NEXT QUEUED** (sitting, charging, asleep on throne)
4. Mama Gbenga (requires Ube judgment before freeze)
5. Half-Pint
6. Sunday Best
7. Young Mazi
8. Auntie Grit (requires Ube judgment before freeze)
9. Open Mouth Gang (Chewer, Enforcer, Lieutenant)
10. Gbenga's boys
11. Uncle Bamidele (age 60 owambe costume)
12. Mister December
13. hunters
14. HOA president
15. trap crew (cooks, runners, lookout)
16. Big Bing — **NEUTRAL + NO DONE / FROZEN / CLOSED**
17. Granny Bing — **NEUTRAL / CALLING NUMBERS DONE / FROZEN / CLOSED**

## Boundaries

Runtime integration, Presentation framing, and gameplay code remain separate Engineering/runtime-QA work. Never inspect or import SEALED/HQ-only material.
