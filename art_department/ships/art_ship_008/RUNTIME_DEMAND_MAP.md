# ART SHIP 008 — Runtime Demand Map

**Status:** APPROVED MASTER / FROZEN / COMPLETE — PENDING ENGINEERING INTEGRATION
**Runtime authority:** `origin/claude/frozen-art-integration` at `c887f5d6d1a417384d906a361e2b52c0f3423e3c`
**Machine authority:** `RUNTIME_DEMAND_MAP.json`

This map is spoiler-safe at report level. Exact runtime surface keys live in the machine sibling so Engineering never infers placement from filenames.

## Candidate summary

| Request | Ticket | Category | Count | Authority | Severity | Expected effect |
|---|---|---:|---:|---|---|---|
| AS8-CROWD-* | NC-FA-01 | exact-origin condition layers | 3 | OPEN | BLOCKING | 5 held screens |
| AS8-RICH-APRON-FIX | NC-FA-02 | corrected derivative state | 1 | OPEN + HQ DELTA | BLOCKING | 1 held screen + 1 held minigame surface |
| AS8-MOONIE-ENDPOINT / AS8-COFFE-GUIDED | NC-FA-05 | matched derivative states | 2 | OPEN / GUIDED | BLOCKING | 2 held fights, one dependent on condition coverage |
| AS8-*-HOOKAH | NC-FA-08 | seated derivative states | 3 | OPEN | BLOCKING | 1 held minigame surface |
| AS8-ENV-STREET-NIGHT | gap map / NC-FA-06 | environment master | 1 | OPEN | COVERAGE | 9 held screens |
| AS8-PHIL-SPENT | NC-FA-04 | matched derivative state | 1 | OPEN | POLISH | finalizes one of the nine screens above |
| AS8-THRONE-MESS-LAYER | gap map / NC-FA-06 | exact-origin condition layer | 1 | OPEN | COVERAGE | 7 held screens, including one NC-FA-05 dependency |
| AS8-CAFE-* | NC-FA-03 | registered rear/foreground layers | 2 | OPEN | POLISH | 3 polish-note screens |

**Total:** 14 native assets are **APPROVED MASTER / FROZEN**. None is runtime-integrated by this Ship.

## Native contracts

- Character states: 80×96 RGBA, binary alpha, contact `(40,88)`; identity, palette and silhouette remain source-faithful.
- Standard environment layers: 270×480 RGBA, binary alpha, exact origin `(0,0)`.
- Legacy throne condition: 765×1024 RGBA, binary alpha, exact origin `(0,0)` over the approved throne master.
- New environment master: 270×480 opaque RGB; floor/contact metadata proposed at `y=372`, with the Presentation Director retaining final framing authority.
- Rear/foreground support layers have explicit draw order. No layer silently repaints its base.

## Frozen-delta boundary

`AS8-RICH-APRON-FIX` is a new candidate path, not an edit to the frozen file. The permitted correction is limited to removal or attachment of the disconnected component occupying source rectangle `x=13..18`, `y=56..73`. All pixels outside that rectangle must remain byte-identical to the frozen source after RGBA normalization. The original frozen path/hash remains immutable.

## Authorization record

- General generation authorization received: `HQ PASS — ART SHIP 008 GENERATION AUTHORIZED`.
- Named GUIDED authorization received for `AS8-COFFE-GUIDED` for this Ship only.
- Exact HQ delta authorization received for `AS8-RICH-APRON-FIX`; validation records zero changed pixels outside the frozen rectangle.
- HQ promotion authorization accepted all 14 submitted candidate bytes without revision.
- Family/culturally sensitive/underspecified identities are excluded as `BLOCKED BY CANON`.
- `NC-FA-09`, no-surface assets, speculative poses/UI and future content are excluded.

## Promotion boundaries

- `AS8-RICH-APRON-FIX` is frozen only as the contextual ramen/SLURP state. It is not a Rich neutral/master redesign. The original frozen source and history remain immutable.
- `AS8-ROOKOKO-HOOKAH` retains its recorded `default_alias: true` proposal, but Art does not make that canon/gameplay decision. Engineering must **VERIFY WITH RUNTIME/CONTENT INTENT DURING INTEGRATION** before making the alias permanent.
- PASS/HOLD counts remain the pre-integration runtime truth until Engineering integration and runtime QA.

## Candidate package

- Frozen manifest: `ART_SHIP_MANIFEST.json`
- Accepted submission evidence: `CANDIDATE_PACKAGE_MANIFEST.json`
- Engineering mappings: `ENGINEERING_ASSET_MAP.json`
- State/layer contracts: `STATE_LAYER_DEFINITIONS.json`
- Technical validation: `CANDIDATE_VALIDATION_REPORT.json` and `.md`
- Source-preservation evidence: `SOURCE_PRESERVATION_EVIDENCE.json` and `.md`
- Internal visual review: `INTERNAL_VISUAL_REVIEW.md` plus player-blind review boards
- Expected runtime effect: `EXPECTED_HOLD_RESOLUTION_REPORT.md`

## Forecast

All 14 assets are now approved/frozen. If Engineering integrates them exactly as mapped and runtime QA accepts the results, up to 23 of 45 current adventure/fight HOLD screens should leave HOLD, yielding approximately 22 remaining. Two held minigame surfaces should also clear, and three current PASS screens should lose their polish notes. This remains a forecast, not current runtime truth.
