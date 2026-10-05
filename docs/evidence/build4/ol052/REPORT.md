# BUILD-4 REPORT · OL-052 · build/visual-completion-002

Failures / blockers: none for this scope update. Launch art completion awaits approved P-D drops (50 rows). No P-C launch requests remain.

P-C is closed for launch: **0 rows, no pose sheets, no videos**. Its former 18 rows are preserved as deferred future scope and excluded from the pending launch count. OL-042 §5 wardrobe-tier wiring is cancelled for launch. No F15 tier-selection/progression code had been started; the dormant supplemental wardrobe map has now been removed from both its generator and generated runtime registry part. A rebuilt release artifact confirms it is absent. No dormant wardrobe feature ships.

The three existing accepted loops remain FROZEN and registered, render as the single launch outfit for every dancer at all times, and are recorded internally as Tier 2 in `art_department/build4/LAUNCH_OUTFIT_MAP.json`. Renderer, dancer assets, F15 and F06 code bytes are unchanged. No new art or drops ingested.

| Package | Launch pending |
|---|---:|
| P-A | 0 |
| P-B | 0 |
| P-C | 0 — future patch |
| P-D | 50 |
| **Total** | **50** |

Pending 68 → 50. P-D remains 48 OPEN image targets and two reuse-wiring rows; all target filenames, prompts and reference lists are unchanged. [IMAGE_PROMPTS_P-D.md](../../../../art_department/briefs/IMAGE_PROMPTS_P-D.md) is the only active generation checklist. Ube returns named PNG files only; Codex owns manifests, normalization, hashes and contact sheets. Learned-move FX remain BUILD-6-owned.

Moved `P-C.md` and `P-C_STEPS.md` to `art_department/future/`, along with the deferred P-C drop plan and historical wardrobe map. Future folder is outside the shipped `assets/` and `js/` directories. [docs/PRESERVED_WORK.md](../../../PRESERVED_WORK.md) now includes one future-scope row: **RAINMAKER wardrobe tiers (Tier 1 / Tier 3 loops + pose sheets) — ships when Ube supplies the videos.** This historical material requests no launch work.

Validation PASS: full release build with its complete test gate; artifact verification; F15 core/club/art and additive registry unit checks; supplemental registry generation check; loader; authoritative preservation hashes (1,335 copies, 960 frozen, zero alterations); leak check; presentation locks (360/390/430); F15 real Chrome widths/rendering 45/45 checks. Rebuilt artifact contains no future P-C files or dormant wardrobe map, and its three accepted loops are byte-identical. No local browser action required.

[Launch scope and artifact proof](launch-scope-proof.json) · [build/test gate](build.log) · [artifact](verify-artifact.log) · [F15 widths](f15-widths.log) · [hashes](hash-verification.log) · [resume record](../../../progress/BUILD4.md).

All further work and drops use `build/visual-completion-002`. `001` stays unchanged historical lineage. Normal pushes only. Wait for approved P-D drops.
