# FINAL-A STAGE 2 · actor grounding

Before is accepted base `0c6ccc3d18674c713a0a6e5896fe6ecbf7f7bc0f`. After uses the same frozen PNG bytes, source scene floors, shot choices, actor scales and cast. Feet and tires now align using the opaque source support baseline rather than an asset's older registration anchor. The anchor is retained for registration and horizontal placement. Separate hard-pixel contact shadows follow each actor's visibility, including defeated minions.

| Independent measurement | Identical coverage before / after | Before violations | After violations | Maximum error before → after |
|---|---|---:|---:|---:|
| Source PNG + production Director geometry | 403 scene/state variants, 2,799 contacts at 360/390/430 | 357 | 0 | 27.227 → 0.326 CSS px |
| Real Chrome DOM + independently scanned PNG pixels | 1,209 frames, 2,799 contacts at 360/390/430 | 357 | 0 | 27.203 → 0.318 CSS px |
| Actual minigame canvas draws | 27 frames, 48 contacts at 360/390/430 | 30 | 0 | 1.593 → 0 CSS px |

The Director tolerance is 0.34 CSS px: one physical pixel at DPR 3. Minigame contact tolerance is 0.01 CSS px. Canvas draws are intercepted with their real transforms, then independently checked against their authored `drawSprite(x, y)` floor point. Each real minigame screenshot records a live game frame.

The census includes every authored adventure cast variant, all combat enemies and registered state art, mounted-stage beats and states, the Supra and giant rats. Nineteen contacts had missing metadata in the base; all remain in the comparison and now have metadata for the existing frozen F15 portraits. Six contacts retain the explicitly authored underwater mentor hover from A00. Vicky's doorway composition uses a declared actor-only alpha crop so the doorway frame is not mistaken for her feet. Seated poses retain their composed prop support. No airborne or composed pose is silently omitted.

Chrome scene census screenshots are presentation fixtures made from real scene geometry, cameras and frozen assets; the small fixture label identifies the audit. They establish actor placement and shadows. They do not claim to replay every story interaction. Minigame screenshots are captured in actual launched games.

| Representative 390px evidence | Before | After |
|---|---|---|
| Coffe and Rich | [image](before/390_098.png) | [image](after/390_098.png) |
| Rosalyn and Rich | [image](before/390_273.png) | [image](after/390_273.png) |
| Docks / Supra | [image](before/390_342.png) | [image](after/390_342.png) |
| Pickup minigame | [image](before/minigames/390_pickup.png) | [image](after/minigames/390_pickup.png) |
| Hookah with crew | [image](before/minigames/390_hookah_crew.png) | [image](after/minigames/390_hookah_crew.png) |
| Senator care | [image](before/minigames/390_senator.png) | [image](after/minigames/390_senator.png) |

Raw measurements: [headless before](before.json), [headless after](after.json), [Chrome before](before/browser.json), [Chrome after](after/browser.json), [minigames before](before/minigames/metrics.json), [minigames after](after/minigames/metrics.json).

Reproduce with `node tools/grounding-test.mjs --baseline` and `node tools/grounding-test.mjs`; Chrome with `node tools/final_a/grounding-browser.mjs --baseline --all` and `node tools/final_a/grounding-browser.mjs --all`; minigames with `node tools/final_a/grounding-minigames.mjs --baseline` and `node tools/final_a/grounding-minigames.mjs`. Chrome commands use `RA_PLAYWRIGHT_PATH` and `RA_CHROMIUM_PATH`. `npm test` now runs the independent foot-contact gate.

Focused presentation regression passed: generated metadata equals the registry/generator, Director self-test, locked shot matrix at all widths, 263 adventure screens (262 pass plus one existing accepted exception), and 19 Combat 2.0 fight screens. F01/F06 layout, timing, odds and interaction rules are unchanged by this stage. Root owns final frozen-byte verification and the full release regression.
