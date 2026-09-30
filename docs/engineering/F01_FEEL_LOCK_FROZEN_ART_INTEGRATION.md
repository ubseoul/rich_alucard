# F01 — THE PLAY · FEEL LOCK · frozen art runtime integration

**Art source:** `art/f01-feel-lock-freeze @ 61a8a5599d6c73c573aee8a0494254b8e52004fa` — 54 exact PNG byte streams (`assets/f01/feel_lock/FREEZE_RECORD.json` and `FL-A01_COMPOSITOR_CONTRACT.json` are exact copies of the records on that branch; source ticket SHA-256 `58ebb2b1…bca2`; the full art-department record stays on the art branch).
**Runtime base:** `integration/fcpb-convergence-001 @ f1979deeca57ce38f2de07a734f51ef709ef67d5` (all convergence behaviour preserved).
**Scope:** presentation wiring only. No gameplay, timing, economy, copy or feel-lock behaviour changed. No art was generated, edited, recoloured, cropped or re-encoded; the PNGs live under `assets/f01/feel_lock/` and are referenced in place.

Single source of truth for paths: `assets/f01/play/feel-frozen.mjs` (pure data). `tools/tests/f01/feel_lock_art.test.mjs` checks it against the freeze record.

| Ticket | Frozen files | Runtime mapping | Placeholder retired |
|---|---|---|---|
| FL-A01 | `bedroom_pov_base`, `hand_phone_idle`, `thumb_typing_overlay` | LIVE FEED: base = the deep-red bed (never tinted, never moves); the live chat DOM sits exactly in the idle layer's transparent screen opening (contract rectangle `[57,39,216,391]` → `.phone` 57,39 159×352); **rig** = phone DOM + idle layer + thumb overlay. JOLT = code shake of the rig (the idle pixels are reused). The thumb overlay is up while Rich texts (his `hello?` beats). | `richBed()` / `richHand()` SVG, darkened + red-washed Portobello room, `.redwash` / `.vig` |
| FL-A02 | `base_return`, `base_return_empty` | RETURN / AFTERMATH background; the empty variant is the catastrophe (Rich alone). | `street_night` return backdrop |
| FL-A03 | 3 tiers × closed/open + `rich_counting_hands` | SMALL / MEDIUM / LARGE haul = one frozen image per tier (`bagTier`); opened when Rich counts; the counting-hands overlay works over it. `bagCount()` still sets the drop beats, so the drop keeps its length. | `duffelSVG` repeated |
| FL-A04 | `oba_de_gwinnett_visual_a_native_80x96` | The flash when the feed cuts on an Oba PLAY (2×, same opacity curve). | `obaSilhouette()` (the black coat-and-hat shape) |
| FL-A05 | 9 job exteriors | ARRIVAL background for the rolled job id; the crew's door target is per exterior. HOLD THE HOUSE keeps the castle (no exterior was frozen for defense). | castle exterior for every offense job |
| FL-A06 | HOOPTIE / S2000 / URUS × {left, headlight_on, wrecked, impounded}; SUPRA overlays × {headlight_on, wrecked, impounded} | Car art for crew/car, departure, arrival, return (headlight layer follows `.car.on`). Wrecked / impounded art is drawn on the lost-car recovery card (home lock screen) — the only place a lost car is shown truthfully. The existing SUPRA sprite is unchanged. | HOOPTIE / S2000 / URUS SVGs |
| FL-A07 | 5 `generic_oga_*` states | **Generic (un-named) Ogas only**: walking / boarding / standing / wounded / carried (READY → standing, WOUNDED → wounded, SHOT → carried). | face bust for generic Ogas |
| FL-A08 | pistol, sprayer, slipper, bare_hands (24×24) | PISTOL / SPRAYER / SLIPPER / BARE HANDS icons (integer scale). Lil Oga / Sapporo / Chopstick keep their existing frozen sprites. | SLIPPER / BARE HANDS SVG, SPRAYER stand-in |
| FL-A09 | `chat_bubble_64x24` | 9-slice skin on incoming live-chat bubbles. Rich's own bubble stays the red CSS one. | dark CSS bubbles |
| FL-A10 | blood_x, cash, gun, mod, weird (48×48) | The physical trunk drop for BLOOD_X / CASH / GUN / MOD / WEIRD (rarity = glow + label colour; the art is never recoloured). | crate SVG for those categories, `E-blood_held` |

**Frozen, authorized, deliberately not drawn (2):** `oba_de_gwinnett_visual_a_card_270x480` (Ube's identity-judgment sheet, not a runtime asset) and `phone_bezel_270x480` (duplicates the phone already inside FL-A01's hand+phone layer).

## Still SOURCE_REQUIRED (no substitute invented)
- **FL-A07** named Oga state families (walking / boarding / standing / wounded / carried for TUNDE, DRE, HALF-PINT, SUNDAY BEST, YOUNG MAZI, AUNTIE GRIT) — named Ogas keep their face bust + gun overlay.
- **FL-A10** physical RECRUIT / STORY / DISTRICT silhouettes — these drops keep the labelled placeholder crate.

## Checks
- `tools/tests/f01/feel_lock_art.test.mjs` (in `npm run test:fragments`): 54 files present, SHA-256 and size match the record, runtime references = drawn + explicitly unwired = the frozen set, nothing else hard-codes a path, the screen opening is the recorded 54 925 binary-alpha pixels inside the DOM rectangle and `.phone` equals that rectangle, the SOURCE_REQUIRED gaps are unfilled.
- `tools/tests/f01/play-sim/feel_lock_art_browser.mjs` (real Chromium, not in `npm test`): whole PLAYs at 360 / 390 / 430, JOLT, typing overlay, Oba, reload, scene matrix, all 54 files fetched, zero broken images / 4xx / console errors.
- `tools/tests/f01/play-sim/feel_gate.mjs` (unchanged): the existing 45 feel-lock browser checks.

## QA REPAIR 001 — layout only (base `aebb34d`)
Three composition defects found by the adversarial QA were repaired. Presentation geometry only: **no frozen PNG byte, gameplay, timing, economy, copy, encounter logic, reward or state changed**; the SOURCE_REQUIRED named-Oga and RECRUIT / STORY / DISTRICT loot gaps are still unfilled.

| Defect | Repair (`assets/f01/play/feel-scenes.mjs`, `feel.css`) |
|---|---|
| Return: the five FL-A10 loot spots sat on Rich, on each other and on the haul | Spots are now `[4,256] [52,256] [100,256]` (open courtyard above the car) and `[142,330] [196,330]` (pavement between the car and Rich). Measured on drawn pixels: ≥3 px clear of Rich (body 213–247 × 378–441), the haul, each other and the crew's feet. The label moved from "above its piece" to one caption lane (`.lootlab.lane`, `top:232px`, under the TAKE line) so a 26-character name can never run over Rich, the haul or another piece. Drop animation, beat count, sounds and timing untouched. |
| Oba flash: the 2× sprite was at `left:150` (box 150–310, past the 270 px stage edge) and painted over the bezel and bed | The sprite is composited **inside the FL-A01 rig**, between the live phone and the hand/phone layer, at `left:51 top:103` (box 51–211 × 103–295; figure centred in the 159×352 screen opening). Same 2× sprite, same 1500 ms opacity curve (peak .85); the bezel and hand stay in front, so it reads as the feed cutting to him. |
| Arrival: crew appeared with their feet on the car roof (feet ≈ 357 on a body spanning 334–377) | Spawn/walk origin moved from `top 322→328` to `top 361→367` (feet ≈ 392, below the car body and its ground shadow). Same 250 ms fade-in, same 900 ms walk, same door targets, same `standing → walking` poses. |

Evidence: `docs/engineering/evidence/f01_frozen_art_qa_repair_001/{before,after}/` — the three scenes at 360 / 390 / 430 plus the measurement logs. Gate: `tools/tests/f01/play-sim/feel_lock_qa_repair_browser.mjs` (real Chromium, not in `npm test`; before 24 FAIL → after ALL PASSED, 60 checks).
