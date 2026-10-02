# CGA-F2-032 Granny Bing — Final QA

**Review date:** 2026-09-30  
**Disposition:** PASS — NEUTRAL / CALLING NUMBERS anchor approved and frozen

## Mechanical verification

| Check | Result | Evidence |
|---|---|---|
| Accepted byte stream | PASS | Canonical SHA-256 is exactly `6f042de972f6fe7fa89178095829ac44e96650cf7b067ad0004f2ca208ddf4ee`. |
| Native dimensions | PASS | Exactly 80×96. |
| Color mode | PASS | RGBA. |
| Alpha | PASS | Binary values 0/255 only. |
| Contact convention | PASS | Last opaque row 87; standard contact `(40,88)`. |
| Palette discipline | PASS | 16 opaque RGB colors. |
| Preview construction | PASS | 320×384 preview is an exact nearest-neighbor 4× enlargement of the canonical native. |
| Promotion method | PASS | Byte-for-byte copy; native was not decoded/re-encoded or changed. |

## Visual verification

| Check | Result | Notes |
|---|---|---|
| Authored identity | PASS | Reads as Granny Bing: Big Bing's very old vampire grandmother and bingo caller at the DJ mic. |
| Adult / age read | PASS | Silver bun, lined face, slight stoop, modest dress and mature proportions communicate a very old adult without frailty or juvenile styling. |
| Family resemblance | PASS | Deep-brown skin plus broad brow/jaw echo Big Bing without copying his bald head, massive build, velvet suit or planted bouncer pose. |
| Judgmental comic edge | PASS | Closed mouth, side-eye, lifted chin and hand-at-waist posture create a dry, unimpressed read. |
| Microphone fidelity | PASS | Plain vintage mic and slim stand sit at mouth height as the single authored identity prop. |
| Native face | PASS | Brow, eye, nose, mouth and old-age planes remain readable at 80×96; one red eye pixel is the only explicit vampire tell. |
| Frozen-corpus fit | PASS | Hard stepped contours, grouped planes, restrained highlights, low fold density and limited palette match the established grammar. |
| Big Bing separation | PASS | Compact teal dress-column silhouette, high silver bun and microphone remain unmistakably separate from his towering mulberry velvet bouncer identity. |
| Neighbor separation | PASS | No Hunter rust/indigo tactical language, HOA taupe cardigan/clipboard, Mister December white fur/umbrella, Bllad33 hunter coat/sword, Hilt olive jacket/case, Nneka scrubs or Ms Patrice apron. |
| Prohibited drift | PASS | No sexualized styling, fangs, cape, weapon, blood, wings, aura, occult symbol, lore accessory, bingo prop, environment or extra character. |

## Scope closure

- `SOURCE_REQUIRED = none`.
- Exactly one Granny Bing anchor was created and frozen.
- No alternate state, environment, additional character, or unauthorized asset was created.
- Runtime integration and downstream projections remain outside this closeout.

