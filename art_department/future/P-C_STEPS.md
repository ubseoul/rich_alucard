# P-C_STEPS — OL-042 · Ube filename-only checklist

**DEFERRED — OL-052. Not launch scope. No pose sheets or videos requested for launch. Nothing in this historical checklist authorizes launch wardrobe-tier code or dormant shipping logic. Ships when Ube supplies the future videos.**


1. Keep all accepted Tier 2 (REDUCED) loops and still identity references. No new Tier 2 art or videos are requested. `build4/LAUNCH_OUTFIT_MAP.json` records the current single launch outfits internally as Tier 2; prior master sequences remain untouched. Roxy = WOLF, Rosalyn = PINK, Emerald = DRAGON. Do not substitute historical ten-dancer identities or infer wardrobe tier from appearance.
2. Run the three Tier 3 prompts below with your **local model**. Judge/refine each still sheet yourself, keeping the same mature 21+ body/face/species/accessories. Tier 3 is a fully opaque stage two-piece, non-explicit: no nudity, nipples, genitals or see-through coverage. Save the approved sheet under its exact filename.
3. Run the three Tier 1 prompts in **ChatGPT images**, attaching the corresponding approved Tier 3 file plus the listed frozen references. Add clothing over the same identity. Judge/refine each sheet. No Tier 2 prompt.
4. Use those six approved still sheets in **your existing video pipeline**. Make exactly the 12 videos listed below, dancer × Tier 1/Tier 3 × POLE/FLOOR. No image-generated animation frames. Use the same process as the accepted loops, no restyling.
5. Return one P-C drop containing **six PNG sheets and 12 named MP4 videos only**. No individual pose cells, numbered frames, manifest.json, hashes or contact sheets from you. Codex cuts cells, converts approved videos per OL-026, writes every manifest, normalizes, computes hashes and makes review contact sheets. Original videos stay in private HQ/local ingest storage; only approved runtime derivatives enter the public repo.

New still cell contract is APPROVED: 128x160 RGBA, binary alpha, feet contact (64,152). Tier 3 sheet 640x160: IDLE, POSE, CHEER, BACK, IDLE-ALT. Tier 1 sheet 512x160: IDLE, POSE, CHEER, BACK. Transparent background, no gutters, same full-body scale/contact in every cell, all ears/tails/wings/heels inside. Lossless larger source exports are acceptable candidates for Codex normalization, but never crop or resample existing frozen masters.

## Still prompt — Roxy, Tier 3 · local model

Attach:

- `art_department/production/f15-launch-trio-masters/foundation_cards/roxy-foundation.png`
- `art_department/production/f15-launch-trio-masters/wolf/frames/frame_0000.png`

**Prompt — paste:**

Create Roxy, the same clearly 21+ adult pixel dancer in the attached frozen foundation. Generate the FINAL tier first: the same approved pixel dancer in an opaque stage two-piece with her current signature accent colors. Preserve body presence, mature face, hair/species and all approved accessories, no new ones. Hard pixels, transparent background, one dark-pixel outline, 3–4 material tones; no blur or photographic rendering. Non-explicit core art. Do not substitute a historical roster identity. One horizontal sheet of 5 128x160 cells, total 640x160, feet contact (64,152), no gutters. Ordered poses: IDLE (hands at hips, slight lean), POSE (one hand behind head, other on hip), CHEER (both fists up, eyes closed/happy), BACK (turned away, looking over shoulder), IDLE-ALT (weight on other leg). Preserve scale, body mass, face and accessories across cells; contain every ear/tail/wing/heel. No pole, set, scenery, labels or animation frames. Return only `dancer_roxy_t3_poses.png`.

## Still prompt — Rosalyn, Tier 3 · local model

Attach:

- `art_department/production/f15-launch-trio-masters/foundation_cards/rosalyn-foundation.png`
- `art_department/production/f15-launch-trio-masters/pink/frames/frame_0000.png`

**Prompt — paste:**

Create Rosalyn, the same clearly 21+ adult pixel dancer in the attached frozen foundation. Generate the FINAL tier first: the same approved pixel dancer in an opaque stage two-piece with her current signature accent colors. Preserve body presence, mature face, hair/species and all approved accessories, no new ones. Hard pixels, transparent background, one dark-pixel outline, 3–4 material tones; no blur or photographic rendering. Non-explicit core art. Do not substitute a historical roster identity. One horizontal sheet of 5 128x160 cells, total 640x160, feet contact (64,152), no gutters. Ordered poses: IDLE (hands at hips, slight lean), POSE (one hand behind head, other on hip), CHEER (both fists up, eyes closed/happy), BACK (turned away, looking over shoulder), IDLE-ALT (weight on other leg). Preserve scale, body mass, face and accessories across cells; contain every ear/tail/wing/heel. No pole, set, scenery, labels or animation frames. Return only `dancer_rosalyn_t3_poses.png`.

## Still prompt — Emerald, Tier 3 · local model

Attach:

- `art_department/production/f15-launch-trio-masters/foundation_cards/emerald-foundation.png`
- `art_department/production/f15-launch-trio-masters/dragon/frames/frame_0000.png`

**Prompt — paste:**

Create Emerald, the same clearly 21+ adult pixel dancer in the attached frozen foundation. Generate the FINAL tier first: the same approved pixel dancer in an opaque stage two-piece with her current signature accent colors. Preserve body presence, mature face, hair/species and all approved accessories, no new ones. Hard pixels, transparent background, one dark-pixel outline, 3–4 material tones; no blur or photographic rendering. Non-explicit core art. Do not substitute a historical roster identity. One horizontal sheet of 5 128x160 cells, total 640x160, feet contact (64,152), no gutters. Ordered poses: IDLE (hands at hips, slight lean), POSE (one hand behind head, other on hip), CHEER (both fists up, eyes closed/happy), BACK (turned away, looking over shoulder), IDLE-ALT (weight on other leg). Preserve scale, body mass, face and accessories across cells; contain every ear/tail/wing/heel. No pole, set, scenery, labels or animation frames. Return only `dancer_emerald_t3_poses.png`.

## Still prompt — Roxy, Tier 1 · ChatGPT images

Attach:

- `art_department/production/f15-launch-trio-masters/foundation_cards/roxy-foundation.png`
- `art_department/production/f15-launch-trio-masters/wolf/frames/frame_0000.png`
- Your approved new `dancer_roxy_t3_poses.png`.

**Prompt — paste:**

Create Roxy, the same clearly 21+ adult pixel dancer in the attached frozen foundation. Use the approved Tier 3 still sheet as the exact identity/body/face reference; add a full opaque stage costume in her existing signature palette over that same character. Keep body mass, silhouette, species, hair and approved accessories identical; do not redesign or shrink her. Hard pixels, transparent background, one dark-pixel outline, 3–4 material tones; no blur or photographic rendering. Non-explicit core art. Do not substitute a historical roster identity. One horizontal sheet of 4 128x160 cells, total 512x160, feet contact (64,152), no gutters. Ordered poses: IDLE (hands at hips, slight lean), POSE (one hand behind head, other on hip), CHEER (both fists up, eyes closed/happy), BACK (turned away, looking over shoulder). Preserve scale, body mass, face and accessories across cells; contain every ear/tail/wing/heel. No pole, set, scenery, labels or animation frames. Return only `dancer_roxy_t1_poses.png`.

## Still prompt — Rosalyn, Tier 1 · ChatGPT images

Attach:

- `art_department/production/f15-launch-trio-masters/foundation_cards/rosalyn-foundation.png`
- `art_department/production/f15-launch-trio-masters/pink/frames/frame_0000.png`
- Your approved new `dancer_rosalyn_t3_poses.png`.

**Prompt — paste:**

Create Rosalyn, the same clearly 21+ adult pixel dancer in the attached frozen foundation. Use the approved Tier 3 still sheet as the exact identity/body/face reference; add a full opaque stage costume in her existing signature palette over that same character. Keep body mass, silhouette, species, hair and approved accessories identical; do not redesign or shrink her. Hard pixels, transparent background, one dark-pixel outline, 3–4 material tones; no blur or photographic rendering. Non-explicit core art. Do not substitute a historical roster identity. One horizontal sheet of 4 128x160 cells, total 512x160, feet contact (64,152), no gutters. Ordered poses: IDLE (hands at hips, slight lean), POSE (one hand behind head, other on hip), CHEER (both fists up, eyes closed/happy), BACK (turned away, looking over shoulder). Preserve scale, body mass, face and accessories across cells; contain every ear/tail/wing/heel. No pole, set, scenery, labels or animation frames. Return only `dancer_rosalyn_t1_poses.png`.

## Still prompt — Emerald, Tier 1 · ChatGPT images

Attach:

- `art_department/production/f15-launch-trio-masters/foundation_cards/emerald-foundation.png`
- `art_department/production/f15-launch-trio-masters/dragon/frames/frame_0000.png`
- Your approved new `dancer_emerald_t3_poses.png`.

**Prompt — paste:**

Create Emerald, the same clearly 21+ adult pixel dancer in the attached frozen foundation. Use the approved Tier 3 still sheet as the exact identity/body/face reference; add a full opaque stage costume in her existing signature palette over that same character. Keep body mass, silhouette, species, hair and approved accessories identical; do not redesign or shrink her. Hard pixels, transparent background, one dark-pixel outline, 3–4 material tones; no blur or photographic rendering. Non-explicit core art. Do not substitute a historical roster identity. One horizontal sheet of 4 128x160 cells, total 512x160, feet contact (64,152), no gutters. Ordered poses: IDLE (hands at hips, slight lean), POSE (one hand behind head, other on hip), CHEER (both fists up, eyes closed/happy), BACK (turned away, looking over shoulder). Preserve scale, body mass, face and accessories across cells; contain every ear/tail/wing/heel. No pole, set, scenery, labels or animation frames. Return only `dancer_emerald_t1_poses.png`.

## Video pipeline jobs — 12 files, no Tier 2 jobs

Every video: **6 seconds at 24 FPS**, fixed square **688x688** source framing to match the accepted pipeline. One dancer, full body; lock camera, character scale and feet baseline throughout. Nominal source foot anchor (344,664), with enough margin for tails/wings/ears and all motion. Use the same clean flat-background/alpha treatment as your accepted pipeline; no scenery, UI, labels, other dancers, cuts, zooms or interpolation. Pixel dancer only, never a real person. Keep approved outfit/identity stable. End pose and cadence must restart seamlessly.

POLE: centered stage-pole dance, compact continuous motion, full silhouette contained; use the approved still sheet plus the corresponding accepted reduced loop as motion-language reference, without copying/repainting its bytes. FLOOR: confident standing floor dance on the same contact baseline, no pole, stable planted weight and contained motion; no camera drift or extreme contortions. Both are suggestive and non-explicit. Videos are separate performances made by your pipeline, never a set of image-generated frames.

The 688x688 framing is a source-video contract; only **new** video derivatives normalize to the approved 128x160 cells. Existing 688x688 frozen masters and accepted Layout A do not change. Nominal conversion is 144 frames/24 FPS in a row-major 12x12 sheet (1536x1920 RGBA), or approved web video per OL-026. Preserve the delivered timeline; no trimming, frame dedupe, interpolation or invented retiming. Codex records actual source frame count and duration before freeze.

| Job | Dancer / tier | Mode | Attach approved still | Motion reference | Save exactly |
|---:|---|---|---|---|---|
| 1 | Roxy / 3 | POLE | `dancer_roxy_t3_poses.png` | `assets/f15/dancers/wolf.png` (accepted reduced loop) | `dancer_roxy_t3_pole.mp4` |
| 2 | Roxy / 3 | FLOOR | `dancer_roxy_t3_poses.png` | `assets/f15/dancers/wolf.png` (accepted reduced loop) | `dancer_roxy_t3_floor.mp4` |
| 3 | Roxy / 1 | POLE | `dancer_roxy_t1_poses.png` | `assets/f15/dancers/wolf.png` (accepted reduced loop) | `dancer_roxy_t1_pole.mp4` |
| 4 | Roxy / 1 | FLOOR | `dancer_roxy_t1_poses.png` | `assets/f15/dancers/wolf.png` (accepted reduced loop) | `dancer_roxy_t1_floor.mp4` |
| 5 | Rosalyn / 3 | POLE | `dancer_rosalyn_t3_poses.png` | `assets/f15/dancers/pink.png` (accepted reduced loop) | `dancer_rosalyn_t3_pole.mp4` |
| 6 | Rosalyn / 3 | FLOOR | `dancer_rosalyn_t3_poses.png` | `assets/f15/dancers/pink.png` (accepted reduced loop) | `dancer_rosalyn_t3_floor.mp4` |
| 7 | Rosalyn / 1 | POLE | `dancer_rosalyn_t1_poses.png` | `assets/f15/dancers/pink.png` (accepted reduced loop) | `dancer_rosalyn_t1_pole.mp4` |
| 8 | Rosalyn / 1 | FLOOR | `dancer_rosalyn_t1_poses.png` | `assets/f15/dancers/pink.png` (accepted reduced loop) | `dancer_rosalyn_t1_floor.mp4` |
| 9 | Emerald / 3 | POLE | `dancer_emerald_t3_poses.png` | `assets/f15/dancers/dragon.png` (accepted reduced loop) | `dancer_emerald_t3_pole.mp4` |
| 10 | Emerald / 3 | FLOOR | `dancer_emerald_t3_poses.png` | `assets/f15/dancers/dragon.png` (accepted reduced loop) | `dancer_emerald_t3_floor.mp4` |
| 11 | Emerald / 1 | POLE | `dancer_emerald_t1_poses.png` | `assets/f15/dancers/dragon.png` (accepted reduced loop) | `dancer_emerald_t1_pole.mp4` |
| 12 | Emerald / 1 | FLOOR | `dancer_emerald_t1_poses.png` | `assets/f15/dancers/dragon.png` (accepted reduced loop) | `dancer_emerald_t1_floor.mp4` |

## Deferred future-patch engineering notes (not launch step 5; OL-052)

F15 owns wardrobe tiers **per dance**, separate from the lifetime She fw Me levels. F06 code remains feel-locked and untouched. Authored RAINMAKER wardrobe rules, extracted from `source_vault/art_authority/RAINMAKER_Dancer_Generation_Sheets_and_Wardrobe_Levels.docx` §2:

- Tier 1 full → Tier 2 reduced → Tier 3 final. This-dance money fills the wardrobe bar under HYPE, in the dancer's signature color.
- COMMON: Tier 2 $3,000; Tier 3 $8,000. RARE: $6,000/$15,000. LEGENDARY: $15,000/$40,000. ON-BEAT + SPOTLIGHT qualifying flicks count 1.5x. These are authored numbers, not the lifetime romance threshold tuning.
- Walk-off uses POSE then BACK with two small BACK slides; signature lighting; Rich cannot throw and loaded bills stay loaded. Duration 2.5 seconds; re-entry IDLE → POSE; HYPE refills 30%; larger spotlight moments for the remaining dance.
- Each new dance resets to Tier 1. WHALE opens at Tier 2. RAINMAKER NIGHT opens everyone at Tier 2 and halves Tier 3 thresholds. VIP Tier 3 requires at least three hearts.
- Rarity assignment for Roxy/Rosalyn/Emerald is not authored in the current launch ruling (older ten-dancer rotation/classifications are dormant). Do not infer it from WOLF/PINK/DRAGON or invent thresholds. Ground any mapping in supplied authored authority during step 5; keep an explicit engineering SOURCE_REQUIRED item if it remains absent. Likewise, no numeric spotlight growth amount is authored; do not invent one as canon.
- Any missing spoken walk-off line goes to the existing writing queues; use only approved exact source lines.
- Required tests after wiring: tier selection, within-dance persistence, save/reload, new-dance reset, authored discounts/opening conditions, separation from She fw Me, flags-OFF zero change, no F06 delta, and widths 360/390/430.
