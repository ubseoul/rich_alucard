# Stage Contract handoff

For role authority, Production Card fields and acceptance evidence, see [Studio Production Control](PRODUCTION_CONTROL.md). Stage Contract handoffs are engineering/art integration evidence; they do not by themselves mark work PASS or FROZEN.

Every approved production stage has one machine-readable contract in `js/data/stages.js`. Coordinates are authored in native canvas pixels. Runtime placement is derived only by `RAStageLayout` from the native rectangle and the rendered stage bounds.

Required contract fields are `id`, `native`, `environment`, `referenceScale`, `contactLines`, `actors`, `dialogueSafeZones`, `uiExclusionZones`, and `layers`. Actor slots contain a native contact anchor, source dimensions/anchor, facing direction, and optional `observer` designation.

Art handoff for a new stage must state: native dimensions, environment asset, named contact line, each actor's source anchor and world contact anchor, reference scale, dialogue safe zones, UI exclusions, and intended layer order. Source art remains immutable.

The JDM Imports docks contract preserves the approved 270×480 composition: combat line `y=350`, Rich `x=55`, importer `x=180`, adult daughter observer `x=230`, all at the approved 1.25× reference scale. The DEV Stage Contract overlay draws authored contacts, actor bounds, dialogue zone, and UI exclusions; it is hidden during normal play.

The locked Supra source art is an object slot in this same contract. Its runtime presentation scale is 1.75×; its contact anchor remains authored at `(168, 354)` so scaling cannot introduce a separate positioning hack.

## QA

The `ogun-rave` contract is submitted for HQ engineering review in `RAVE_STAGE_REVIEW.md`. It adopts the supplied Art Card 02 proof at 1× actor scale: Rich contact (75,344), Ogun contact (192,273), both with source anchor (40,88). The room and overlay are unchanged frozen imports. This engineering submission does not mark the contract PASS/FROZEN and adds no production entry or adventure content.

**COMBAT STAGING QA RULE** — Every new encounter must receive a visual staging inspection at actual gameplay resolution after final production art integration. Verify ground/contact line, relative scale, opponent spacing, UI clearance, every combat state, and return-to-origin after displacement. Functional tests alone are insufficient.

**REAL PLAYER PATH QA** — Before release, test a representative existing save and a fresh save through the production entry path without DEV shortcuts. Verify startup/resume semantics, final rendered staging, persistence, and browser reload behavior.
