# ART SHIP 013 — Generation and provenance log

Status: **CANDIDATE — HQ REVIEW REQUIRED**.

The built-in ImageGen workflow produced transparent source renders. Each selected render was generated from the explicit brief plus approved repository references. No real photographs or real-family likenesses were used.

## Selected directions

| Request | Source render | Visual decision |
|---|---|---|
| AS13-01 Mom | `mom_raw.png` | warm middle-aged fictional Nigerian-American woman; low twist/bun; burgundy knit; ordinary holiday-at-home presentation |
| AS13-02 Dad | `dad_raw.png` | grounded middle-aged fictional Nigerian-American man; close salt-and-pepper hair; forest knit; ordinary specificity |
| AS13-03 Sister | `sister_raw.png` | clearly adult fictional sibling; half-up micro-locs; teal cardigan; subtle family echo without cloning Rich |
| AS13-04 Wife | `portobello_wife_raw.png` | ordinary approachable white woman; brown bob; dusty-rose sweater; warm and non-satirical |
| AS13-05 Kid 1 | `portobello_kid1_raw.png` | older school-age fictional daughter; bun; sage sweatshirt; 35px native envelope |
| AS13-06 Kid 2 | `portobello_kid2_raw.png` | younger fictional son; short curls; muted yellow sweatshirt; 32px native envelope |
| AS13-07 Hookah Rich | `rich_hookah_seated_raw.png` | identity-preserving seated correction: compact loc mass, shades, warm face, green earring, black fit, bright shoe accents |

## Internal rejection

`rich_hookah_seated_v1_rejected.png` restored most identity cues but retained a tall upward/radial hair fan. It was rejected before native candidate packaging. A single targeted hair-only refinement produced the selected render. No family or Portobello alternate was necessary.

## Deterministic preparation

`tools/build_candidates.py` performs significant-alpha crop, BOX downsampling, 16-color adaptive reduction for new identities, approved standing/curb palette remap for Rich, binary-alpha thresholding, transparent-RGB cleanup, native centering and contact alignment. It also builds exact nearest-neighbor review boards and review-only environment composites.

No baked checkerboard was present, so no checkerboard-removal operation was required. Deterministic preparation did not repair anatomy or redesign a subject.

Exact source-render hashes are in `RAW_GENERATION_HASHES.json`; final native hashes are in `CANDIDATE_SHA256SUMS.txt`.
