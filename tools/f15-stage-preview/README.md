# F15 three-dancer stage preview — CANDIDATE — PENDING UBE STAGE REVIEW

Standalone, review-only. Not F15 integration. Nothing in `index.html`, `js/`, `style.css`, `dist/` or any shipped entry point was touched.
No money, progression, dates, save migration or relationship mechanics are implemented.

## Open it

```bash
node tools/f15-stage-preview/serve.mjs
```

then open <http://localhost:4175/tools/f15-stage-preview/> (phone-width window, 360–430 px, is the intended view; needs http because the page reads the F06 renderer source).

Controls under the stage (preview-only): **DRAGON / WOLF / PINK** select (cyan floor pool + cyan button = selected), **PAUSE/PLAY**, **RESTART** (all three dances to frame 0), **LAYOUT A/B** (recommended / compact). The F06 money-throw (drag up on the cash stack, flick) is live under the dancers so you can feel the clearance.

## Sources used (approved inputs only)

| Input | Where |
|---|---|
| Runtime reference | `4800055a96cf9ce06434c3451d5a4f61c6ec195d` |
| Art package | `7b034a92f602db70a044466188dcec983bab0ec9`, `art/f15-launch-trio-masters`, `art_department/production/f15-launch-trio-masters/` (extracted with `git archive`; art branch not merged; masters are **not** in this branch) |
| Club environment | **There is no club background bitmap in the repo.** The club is drawn in canvas by the F06 renderer: `js/frag/F06/make_it_rain.js` (`buildBg` :563, `drawBackdrop` :596, `drawDeck` :614, `drawCrowd` :710, `drawStack` :805, `drawHud` :985) with `make_it_rain.css` / `assets/fonts/*`. The preview loads that file unmodified from disk and drops one call in memory (`drawTarget(...)`, F06's neutral placeholder mannequin) so the stage is free for the dancers. No new environment was made. |
| UI conventions | `js/frag/F06/make_it_rain.css` (`.btn`, palette, double-edge frame, Press Start 2P) |

Feet line: dancers stand on the F06 deck feet line (`deckTop + 0.55·deckH`, the line the mannequin used). All three share it; verified in-browser (baseline gap 0 px at 360/390/430).

## Layout configuration — `layouts.json`

Per-dancer transform is fixed for the whole sequence (no per-frame scale or recentring). `cx` = dancer anchor (master x=344) as a fraction of stage width; `refScale` = CSS px per master px on a 370 px-wide stage, scaled linearly with stage width, then capped so WOLF's head keeps 6 px under the F06 HUD (this cap only activates on short stages, e.g. 360×740). `scaleMul` is 1 for everyone.

| | A — RECOMMENDED | B — COMPACT |
|---|---|---|
| refScale (css px / master px @370) | 0.28 | 0.23 |
| DRAGON / WOLF / PINK cx | 0.21 / 0.50 / 0.79 | 0.20 / 0.50 / 0.80 |
| Drawn height @370 (DRAGON/WOLF/PINK) | 139 / 168 / 144 px | 114 / 138 / 118 px |
| Max silhouette overlap, neighbours | 0.4 % / 5.5 % of smaller figure, mean ≈ 0 | 0 % |
| Headroom under HUD @390×844 | 24 px | 53 px |
| Side margin to stage edge @390 | 17.5 / 8.5 px | 25 / 17 px |

Overlap numbers: `analyze_overlap.py` (3000 joint frames, silhouette alpha > 32). Relative scale is the masters' **native** relative scale (one shared factor): WOLF 600 px tall, PINK 512, DRAGON 495 master px, i.e. WOLF reads ~17–21 % taller. Height-matching is a `scaleMul` change (WOLF ≈ 0.83) and is a creator decision, not made here.

Slot order is configurable; the recommended pyramid puts the tallest figure in the centre. **Handle→character mapping is not proven** (START_HERE §4): labels stay WOLF / DRAGON / PINK and `identityBinding` is `null` for all three.

## Animation delivery (temporary, preview only)

One lossless PNG sprite sheet per dancer, `canvas.drawImage` from the sheet, 24 FPS clock shared from RESTART (`frame = floor(t·24) % frameCount`, each dancer loops on its own length — so the three phases drift, as the masters' differing lengths imply).

* Derivation: `build_derivatives.py` (reads the frozen masters from the art commit, verifies each ordered-sequence SHA-256 against `animation.json`, asserts no master pixel lies outside the crop). Reproducible: rebuild gives byte-identical sheets.
* Exact integer **3:1** area (BOX) downsample on premultiplied alpha; fixed per-dancer crop = its frozen occupied bounds grown to a 3-px grid anchored so master baseline y=664 is a cell edge. No sharpening, interpolation, de-duplication, alpha edit or clip repair. WOLF's A A B B pairs survive as byte-equal cell pairs (checked by the script).
* Cells: WOLF 155×200 (146 f), DRAGON 145×165 (144 f), PINK 165×171 (145 f); packed 12 columns; sheets 1860×2600 / 1740×1980 / 1980×2223.
* **Download:** 6,707,435 B ≈ 6.4 MiB (WOLF 2,027,582; DRAGON 2,872,715; PINK 1,807,138).
* **Decoded memory:** 50,730,960 B ≈ 48.4 MiB (sheet pixels × 4). Reported separately because PNG size says nothing about it.
* Masters live outside the branch; derivatives are in `runtime_candidates/` with `manifest.json` (hashes, crops, anchors).
* Trade-off: at 1/3 master size the figures are soft on 2×/3× screens (≈1.7×/2.5× upscaled). A 1/2 build would be crisper but ≈ 2.25× the decoded memory (~110 MiB estimate, not built) — a final-integration decision.

## Checks actually performed (`review/check.mjs`, Chromium 1134 via Playwright, DPR 2, touch)

Results in `review/results.json`; screenshots `review/shot_{360,390,430}_*.png`; motion `review/motion_390_recommended.mp4` (150 frames at 24 fps, rendered deterministically with `capture_motion.mjs` — seek to n/24 s, screenshot, ffmpeg; not a live screen recording).

* Zero console/page errors at all three widths.
* Dancer pixels stay inside the stage at every sampled moment (side margins ≥ 8.5 px recommended, ≥ 16 px compact); baseline gap 0 px; headroom to HUD ≥ 6 px (360×740 uses the cap), ≥ 24 px at 390.
* Selection: 3 buttons ≥ 110×46 px, `aria-checked` and floor pool follow each click.
* Timing: after RESTART + 2 s wall clock, elapsed 1991–2010 ms and frame 47–48 (expected 47–48); PAUSE froze elapsed (Δ 0 ms over 0.7 s); RESTART returns all three to frame 0; after 6.2 s frames were 2/4/3 (wolf/dragon/pink wrap at 146/144/145, as expected).
* Layout toggle changes the dancer boxes. Real F06 flick through the transparent overlay registered ($1,100 spent) at all three widths.
* Clipping: the crop is each dancer's own frozen occupied bounds (asserted), so the preview cuts no pixel. Edge contact in the sheets equals the masters' (WOLF 24 L / 38 R / 2 T frames; PINK 2 / 5; DRAGON touches its left/right union edge in all 144 frames) — **inherited source clipping**, not introduced here. Preview clipping found: none.

Not checked: real phones/devices (desktop Chromium emulation only), Safari/Firefox, sustained-load memory, audio (none), the final integration path.

## Caveats

* F06's moving gold hit-zone pool and spotlight wander across the deck under the dancers; it is the real F06 behaviour and is not tied to the selected dancer here. That is an F15-integration question.
* Selection is by buttons only (dancers are not tappable, so they never block the money gesture).
