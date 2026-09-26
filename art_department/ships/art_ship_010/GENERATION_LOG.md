# ART SHIP 010 — Generation Log

Status: **CANDIDATE — HQ REVIEW REQUIRED**. Nothing in this log is an approval or freeze decision.

Generation used the built-in ImageGen path required for raster art, followed by deterministic repository-native preparation in `tools/build_candidates.py`. The source renders remain under `source_renders/`; native candidates are the only files intended for later Engineering consideration.

## Authorized Rich package

Three minimum states were requested from the existing Rich source contract: a compact standing/default anchor, a presenting office state, and a porch-seated state. The prompt intent for each was: 16-bit pixel-art game sprite, transparent background, single subject, compact full-body silhouette, restrained palette consistent with the supplied Rich reference, short close-cropped hair, no text, no props that would introduce a new canon claim, and native-friendly crisp edges.

The first pass for all three Rich states showed hair volume drifting beyond the committed source contract. Those renders were rejected and removed from the candidate package. A targeted hair-only edit was then used for each state; the selected raw renders are the non-`_v1` files and were nativeized without changing the frozen source master.

## Rooftop party condition

The prompt requested a restrained, anonymous rooftop party-crowd condition in the established pixel-art language: no named faces, no signage, no new environment repaint, transparent background, and enough clustered silhouettes to make the authored party beat read as populated. The result was cropped and masked deterministically to the exact 270×480 origin contract, with the named Rich corridor kept clear and all pixels below the actor contact line removed.

## Selection record

| Candidate | Selected raw render | Rejected/alternate | Reason |
|---|---|---|---|
| Rich standing | `rich_portobello_standing_raw.png` | first pass discarded | targeted hair correction; compact native silhouette |
| Rich presenting | `rich_portobello_presenting_raw.png` | first pass discarded | targeted hair correction; readable presenting gesture |
| Rich porch seated | `rich_portobello_porch_seated_raw.png` | first pass discarded | targeted hair correction; seated contact remains native-safe |
| Rooftop crowd | `rooftop_dtla_party_crowd_raw.png` | none | additive anonymous crowd condition |

No alternate character identities or speculative states were generated. Wife, kid1, kid2 and manager were not generated because the repository has no committed OPEN/GUIDED visual card for them.
