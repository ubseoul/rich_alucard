# Current handoff

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
- **Corpus Snapshot:**
  - Frozen corpus: **429 verified assets** (411 prior baseline + 18 Visual A production masters and runtime sprites).
  - Asset Register: **571 entries**.
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

## Boundaries

Runtime integration, Presentation framing, and gameplay code remain separate Engineering/runtime-QA work. Never inspect or import SEALED/HQ-only material.
