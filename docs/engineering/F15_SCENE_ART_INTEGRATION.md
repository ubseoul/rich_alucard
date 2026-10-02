# F15 scene art integration (STOVE Y) — CANDIDATE FOR UNDERLORD REVIEW

Branch `feat/f15-scene-art-001`, started from art commit `75459f401d9fe6115e7fdf8c8f2bed572df55746` (`art/f15-date-scene-assets`). Ancestry verified: runtime candidate
`8a1dc98a` (`feat/f15-romance-trio-001`) → `bc745185` → `75459f40`; the art branch adds only the art package. Still DARK behind `F15.velvet_rotation`; nothing merged, `main` untouched.
Actor/UI placement is now **measured** in the real scenes (see Verification), not only reviewed.

## What is wired

| Asset | Runtime path | Where |
|---|---|---|
| The Bing | `assets/f15/environments/the_bing_270x480.png` | `f15_bing` — Roxy L1, Rosalyn L1, Emerald L1/L3 |
| Boxing gym | `…/boxing_gym_270x480.png` | `f15_gym` — Roxy L2 + L3 and the Roxy spar (Combat 2.0) |
| Roxy's apartment | `…/roxy_apartment_270x480.png` | `f15_roxy_apartment` — Roxy L4 |
| Plénitude | `…/plenitude_270x480.png` | `f15_plenitude` — Rosalyn L1 |
| Convention hall | `…/convention_hall_270x480.png` | `f15_convention` — Rosalyn L3 |
| Rosalyn's apartment | `…/rosalyn_apartment_270x480.png` | `f15_rosalyn_apartment` — Rosalyn L4 "lights on" |
| Same, lights off | same PNG + overlay layer `assets/f15/layers/lights_off_270x480.png` | `f15_rosalyn_apartment_dark` — Rosalyn L4 dialogue and the cockroach fight |
| Shrine Auditorium | `…/shrine_auditorium_270x480.png` | `f15_shrine` — Emerald L4 |
| Granny Bing | frozen path `assets/before_the_fame/characters/granny_bing/cga_f2_032/…_80x96_v1.png` | person `granny_bing`; on stage (right slot) in Emerald L3 "THE BING — BINGO NIGHT", where she speaks. Lines unchanged; the speaker name still shows. Provenance folder `art_department/visual_a/granny_bing_cga_f2_032/` (freeze record, QA, sums) brought from `61a8a559` — that asset and folder only, no branch merge. |
| Cockroach | `assets/f15/characters/spirit_of_uncle_bunmi_444x222.png` (derivative, below) | person `spirit_of_uncle_bunmi`; Rosalyn L4 dialogue (mid slot) and `f15_uncle_bunmi` combat |

Backgrounds and Granny are **byte copies** (`tools/f15/build_scene_art.py` hash-checks each against the approval records; `assets/f15/scene_art_manifest.json` records bytes, hash and
dimensions of every runtime asset). The Library and the exam-hall steps have no approved art and stay named placeholders. No dialogue, mapping, Layout A, WOLF, thresholds, money,
date gate or save logic was touched.

All eight environments are ordinary image envs (`floorY 372, base 1`: the actor feet line and the engine's standard depth scale; measured clear in every scene). Each id is used only by the location it depicts.

## The one derivative (cockroach) and the one overlay

* Master `…/f15-date-scene-assets/production/spirit_of_uncle_bunmi_candidate_original.png` (1774×887 RGBA, sha `2c1589a8…`) is **unchanged** in the art package.
* The master is 6.3 MiB decoded and would be nearest-neighbour-sampled at about 1:10, dropping 1-pixel legs and antennae. Derivative = **one whole-canvas area (BOX) resize to 444×222** on
  premultiplied alpha (`tools/f15/build_scene_art.py`; scale 0.2503 — 887 is prime, so no integer reduction exists). Same 2:1 aspect and canvas: no crop, recentre, sharpen, recolour, alpha edit or repack.
  Measured: master alpha box `[0,16,1768,871]` → derivative `[0,4,441,218]` (expected `[0,4,442.5,222]`). Both touch the left edge (the master's own antenna tip is on column 0), so **no clipping is added**.
  Partial-alpha pixels 553,579 → 36,054 (area-averaged; alpha extrema 0..254; nothing forced opaque or transparent).
* Runtime: one fixed world scale **0.30** (`RAF15Dates.ROACH`) = 133×67 world px, facing left toward Rich; contact = bottom-centre of its visible pixels (`groundedAnchor` in
  `tools/presentation/annotations.json`; face box authored by eye). Drawn with the screen's existing nearest-neighbour rendering.
* `lights_off_270x480.png` is a flat 6/5/20 α150 layer (not derived from approved art) on the existing `env.layers` mechanism: "lights off" without touching the approved PNG.
  Delete the `layers` entry in `dates.js` to see the lit room.

Shared-file seams (inert when unset): `js/engine/stage.js` `combat2Stage(…,{enemyScale})` and `js/scenes/combat2.js` passing `def.stageScale` (the Director already supports a per-actor
`lineScale` for adventure nodes; combat had no way to scale one enemy). Plus two entries in `tools/presentation/annotations.json` and the regenerated `js/data/presentation_assets.js`.
These need integration-owner acknowledgment like the earlier F15 seams.

## Payload and decoded memory

Added under `assets/` (measured, `scene_art_manifest.json`): **1,336,242 B** in total (backgrounds 1,253,863 B; cockroach derivative 79,469 B; overlay 1,194 B; Granny 1,716 B).
Decoded, loaded on demand one scene at a time: each background 270×480×4 = 518,400 B (the overlay another 518,400 B in the lights-off rooms); cockroach 444×222×4 = 394,272 B
(the 1774×887 master would be 6,294,152 B and is not shipped); Granny 30,720 B.

## Verification

* `tools/tests/f15/art.test.mjs` (in `npm test`): every runtime asset re-hashed against the manifest; backgrounds byte-identical to the approved package and its recorded hashes; Granny =
  frozen hash and freeze-record sums; cockroach master unchanged, derivative keeps partial alpha and adds no edge contact; every `env:` the scenes use resolves; art ids are image-backed and
  approved, the two art-less rooms stay placeholders; sprites registered.
* `tools/tests/f15/browser-check.mjs` section `art` (real Chromium, 360/390/430, DPR 2, touch): served bytes equal the manifest; plays Roxy L1/L2/L4, Rosalyn L1/L3/L4, Emerald L3/L4 through the
  real UI so all eight environments, Granny and the cockroach (dialogue and combat) render. From the Director's projected frame and rasterised sprite alpha it checks: sprites loaded; drawn pixels
  inside the viewport; Granny/cockroach feet on their contact line; nearest-neighbour rendering; pairwise sprite pixel overlap ≤ 20 %; dialogue box/bubble/choices never over an actor's face;
  combat HUD/telegraph/panel clear of every body; no console errors, failed or missing assets; the cockroach fight ends and the scene continues.

## For Ube's presentation review

`docs/engineering/F15_SCENE_ART_REVIEW/` — `contact_sheet_390.png` (labeled, 11 frames), `contact_sheet_widths_360_390_430.png`, and the 390 frames in `screens/`.
Rebuild: `node tools/tests/f15/browser-check.mjs --only art --shots <dir>` then `python tools/f15/build_art_contact_sheet.py <dir> <out>`.

Judgement calls to look at:
* the lights-off treatment (the approved apartment under a flat navy layer — there is no approved dark-room art);
* cockroach size (change `ROACH.scale`; 0.30 keeps it clear of Rich and Rosalyn in the three-actor dialogue frame, where Rich and Rosalyn use the far slots there);
* the Director frames each 270×480 background to the world viewport as it does for every environment (PNG bytes and composition are intact);
* sprites stand in front of furniture, the engine's normal depth convention. Measured clear of faces and of each other.
