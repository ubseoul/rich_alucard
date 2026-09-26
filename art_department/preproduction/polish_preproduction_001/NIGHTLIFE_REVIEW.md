# A — World life / nightlife candidate library

**Exploratory visual options only.** Nine designs, 21 clearly adult figures; no names, biographies, dialogue, canon status or character identity commitments. All clothing remains opaque over intimate areas. Sensual poses are social/dance gestures, not sexual activity.

| ID | People | Reuse | Internal review |
|---|---:|---|---|
| A01 dancer | 1 | Adult female club dancer | Raised-arm oval and rounded hair silhouette survive 1x; plum halter/shorts and boots read. Best in a side pocket of the dance floor. Small arm gaps need checking at any future non-integer display scale. |
| A02 performer | 1 | Adult club performer / revealing stage outfit | Platinum bob, extended arm, black/red bodysuit and tall boots separate from A01. Strong small stage silhouette. No pole, special stage equipment or explicit action implied. |
| A03 queue pair | 2 | Fashionable adult female/male partygoers; club-entry queue | Broad male silhouette/cream shirt contrasts with ponytail and silver dress. Gray garment was preserved during alpha extraction. Treat as a pair fragment unless a future separate extraction is requested. |
| A04 dancing pair | 2 | Partnered dancing | Joined-hands arch reads before facial detail; flared pants and uneven stepping feet give motion in one held pose. Widest pair; needs a clear side floor pocket. |
| A05 affectionate pair | 2 | Flirting / affectionate background pair | Leaning heads and shoulder contact read quietly; fuller red-dress figure contrasts with slimmer black jumpsuit. At 1x the drink and hand detail merge; silhouette carries the social read. |
| A06 bartender | 1 | Bartender / hospitality service | Ivory vest and shaker gesture are legible as service vocabulary; the tiny shaker is less specific at 1x. Supplied without a counter, so composites only test figure visibility. A final bar placement needs its own staging decision. |
| A07 hookah lounge | 3 | Seated lounge, VIP/table and hookah groups | Strong low wide conversational triangle, varied bodies, updo/short/long hair, visible hookah and compact table. Furniture is included in this fragment; avoid duplicating it over existing seating. Smoke ring is a held graphic, not an animation. |
| A08 dense cluster | 6 | Dense dance floor, rooftop cluster, reusable crowd fragment | Staggered bodies and raised arms read as a crowd at 1x. Good density option; weakest for identifying each gesture. Do not tile it repeatedly into a wallpaper pattern. |
| A09 silhouettes | 3 | Foreground dancer silhouettes | Four-color near-black/purple depth fragment, three distinct profiles. Can disappear against very dark areas; use against a lighter floor band. It creates intentional occlusion risk and should remain peripheral. |

The 13 role/use categories above are overlapping uses, not 13 independently generated designs. No near-duplicate colorways or extra raw variations inflate the count. The library leans contemporary gothic nightlife; its strangeness comes from silhouettes, darkness and placement, not newly invented supernatural identities.

## Pixel grammar and native exports

Single figures use padded 80x96 cells with contact (40,88). Pair/group canvases are wider, with explicit contacts in `candidate_manifest.json`; the foreground trio is 144x112 at (72,104). Visible standing envelopes are 54–64 pixels tall including raised hands, comparable to established 52–61 pixel cast envelopes. A07 is 52 pixels high seated; A09 is 78 pixels high for foreground use. The latter is not an actor scale authority.

All native candidates are RGBA with alpha only 0/255, nearest-neighbor sampled and undithered; 4–24 opaque colors. Their anatomy is somewhat longer and slimmer than the most compact legacy Rich/Assistant silhouettes. They sit nearer the Ogun/later-cast proportion range. That is a real HQ taste consideration, not a technical PASS or a claim that matching dimensions proves style compatibility. Faces, hair and garments were reduced to broad clusters; tiny features should not carry placement-critical meaning.

Nine imagegen design sources were selected. Six failed actual-alpha delivery, despite transparency being requested; the first repair repeated the RGB checkerboard and a later repair was blocked by the image service safety filter. The user explicitly authorized deterministic background removal and native exports. Extraction removes connected achromatic checker regions while preserving flat gray clothing; existing alpha is thresholded. Cropping, sampling, color limits and source hashes are recorded per asset. No frozen source entered this processing pipeline.

## Representative scene review

All placements are hypothetical **full-frame 270x480 review**, not Presentation Director shots. Integer 1x fragment placement is deliberate ambient scale; no 1.85x runtime multiplier is prescribed.

- **Party hall sparse:** three action types plus service figure, large open central/lower floor. A02 is an optional performer direction, not an assertion that this venue canonically hosts that act.
- **Party hall dense:** distinct back/middle/foreground masses. Stronger party read; A09 encroaches on potential right actor space. HQ should choose density before a future Director placement contract.
- **Catacomb performance:** performer, crowd and foreground trio. The stage/floor split survives; the foreground option is intentionally aggressive and should be omitted for a close conversation shot.
- **Rooftop social:** queue-style standing pair, affectionate pair, dance pair and service figure. Tests mixing quiet and active gestures. This does not replace or extend the frozen Ship 010 rooftop layer and does not resolve NC-FA-12.
- **Roof lounge:** A07 occupies the right side opposite existing left furniture, with A05 standing left. Reads as an intimate group; native table/seat scale should be checked if a future shot enlarges it.
- **Castle entry:** anonymous foreground arrivals against the existing frozen distant queue. Useful depth contrast, but the composite is a plaza/arrival study, not a new queue-layout contract. It leaves the doorway visible.

Six exact-origin candidate layers are stored separately. No candidate is baked into any frozen environment file. Foreground overlaps and future UI/camera clearance remain review findings, not current HOLD work.
