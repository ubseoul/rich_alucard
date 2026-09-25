# Presentation Director — exception and NEEDS CREATIVE tickets

## ART SHIP 008 integration re-evaluation (branch `claude/art-ship-008-integration`)

The 14 frozen ART SHIP 008 assets are integrated (`docs/art_integration/ART_SHIP_008_INTEGRATION.md`). Ticket status after live visual review:

| Ticket | Status | Notes |
|---|---|---|
| NC-FA-01 | **4/5 RESOLVED** | Catacomb ×3 and `duchess_castle|left:rich` pass with their surface-scoped crowd layers. `hollow_bowl|left:rich` stays HOLD → NC-FA-10. |
| NC-FA-02 | **RESOLVED** | `rich.ramen_apron` resolves to the corrected delta. The SLURP screen and minigame pass. |
| NC-FA-03 | **RESOLVED** | The café seat (rear) and table (foreground) layers, with Rich on their registered contact zone, read as seated at a table. |
| NC-FA-04 | **RESOLVED** | The A20 day-three wrap shows `phil@spent_grounded`. |
| NC-FA-05 | **RESOLVED** | The werewolf and Coffe fights hold `moonie.wolfed_out` / `coffe.rogue`. |
| NC-FA-06 | **2 of 16 RESOLVED** | `street_night` master and the `throne_party_mess` condition. 14 placeholder environments remain. |
| NC-FA-08 | **RESOLVED for content** | HOOKAH (BLLAD33) passes. The default-company visual is an HQ decision (`docs/art_integration/HQ_DECISIONS.md` HQ-AS8-01), not an Art gap. |

### New NEEDS CREATIVE

| Ticket | Screens | Current assets | What fails | Asset needed | Severity |
|---|---|---|---|---|---|
| NC-FA-10 | `hollow_bowl|left:rich` (A41 arrive → finale; a companion joins at runtime) | Frozen `hollow_bowl_night` master + ART SHIP 008 `hollow_bowl_crowd_overlay` (integrated) | The narration says the amphitheater is packed, "every seat, every aisle". The crowd layer occupies the seating tiers (opaque y≈108–243) and is hollow around the stage shell. The Director's conversation framing of the staging floor (world ≈ x 40–225, y 160–400 at 390×844 with the companion; similar at 360/430) contains almost none of it, so the frame reads as an empty venue. | An exact-origin 270×480 additive condition layer (companion to the frozen seating crowd, no base repaint) that puts audience presence inside that framing band. For example: floor/aisle crowd behind the actors' contact line y=372, flanking the stage, and/or crowd filling the shell-adjacent tiers inside x 40–225. Named actors must stay unoccluded, and the layer draws below actors. The Director keeps final framing, so reframing to the seating would push the actors out of the conversation band. | Blocking for that screen (HOLD) |

## Frozen-art integration re-evaluation (branch `claude/frozen-art-integration`)

Tickets were re-checked against the integrated frozen ART SHIP 004–007 art (docs/art_integration/README.md). With real sprite metadata the adventure adapter clamps each slot by the actor's actual visible body and closes spare space in a width-limited focal group (generic; no per-screen positions). Current state:

| Ticket | Status after frozen art | Notes |
|---|---|---|
| PD-W1-01 | **RESOLVED** | The frozen ocean-floor base (with its exact-origin ladder layers) plus metadata-driven staging reaches the conversation band. The screens stay HOLD in the integration matrix because the drowned-soul figures have no approved art (mixed screen). |
| PD-W1-02 | **RESOLVED** (framing) | The Slurp three-shot reaches the conversation band with authored faces ≥ 24 px. The screen is HOLD for NC-FA-02 (apron state). |
| PD-W1-03 | **RESOLVED** | Pet Crypt pair, including the offended and melted states, passes in the conversation band. |
| PD-W1-04 | OPEN | Portobello bedroom: no approved environment or cast art yet (placeholders). |
| PD-W3-01 | UNCHANGED | Property interior inspect beat; already frozen art; composition-limited by hotspots. |
| PD-W3-02 | UNCHANGED | Ogun's Rave; already frozen art; HQ-accepted composition. |
| PD-FA-02 | NEW — EXCEPTION-LAYOUT, HOLD | `pier|left:rich@holding_fish_away,right:uncle_sunday@fishing`: two wide approved poses (fish held at arm's length, rod out) leave no slack to close; framing falls between bands. Resolution: an authored hero shot for this beat (e.g. Rich-only focal with the second figure as a secondary) — a staging decision for HQ, not a new asset. Polish. |
| FU-01 | **FIXED** | `meet` derives the date person the same way as `wake` when entered directly; a second instance of the same class (a spell chosen in the previous node) was guarded too. `npm test` now enters every adventure node cold. |

### NEEDS CREATIVE (Art tickets from final-art review; spoiler-safe)

| Ticket | Screens | Current assets | What fails | Asset needed | Severity |
|---|---|---|---|---|---|
| NC-FA-01 | `hollow_bowl|left:rich`, `duchess_castle|left:rich`, `catacomb|left:rich@on_stage`, `catacomb|left:rich@on_stage,right:tasha`, `catacomb|left:rich,right:iron_jaw` | Frozen empty/base environment masters | The beat's text depends on a crowd or a staged room of people; the frozen base is empty, so the screen contradicts the narration | Crowd/condition layers (exact-origin overlays or condition masters) for these venues — already listed in CURRENT_OPEN_ART_GAPS "crowd/condition overlays" | Blocking for final presentation of those beats (screens HOLD) |
| NC-FA-02 | `slurp|farRight:hina,left:rich@ramen_apron,right:okada` | `rich_ramen_apron_80x96.png` (frozen) | The approved apron state contains a detached utensil well left of the body; in-scene it reads as a stray floating object at the frame edge | A corrected apron state (held item attached or removed) via an HQ delta | Blocking for that screen (HOLD) |
| NC-FA-03 | `cafe|left:rich@laptop_seated`, `…@laptop_nod`, `…@laptop_seated,right:wispa` | `rich_laptop_seated/nod_80x96.png` (frozen) | The seated pose has no seat in the café master, so Rich reads as sitting on the floor | A café seat/table foreground layer or a seated-at-table variant | Polish |
| NC-FA-04 | `street_night|left:rich,right:phil@charging_day3` (wrap beat) | Phil day-3 charging state | The closing beat describes a spent, grounded figure but the only approved day-3 state is mid-charge | A spent/grounded Phil state | Polish |
| NC-FA-05 | `combat:werewolf@grave_closed`, `combat:coffe@throne_party_mess` | Identity anchors | Both fights are a transformed or GUIDED variant of a known identity; only the default anchor is approved | The transformed endpoint and the GUIDED variant states (already in CURRENT_OPEN_ART_GAPS) | Blocking for final presentation (HOLD) |
| NC-FA-06 | Environments with no frozen master (16 ids, e.g. `street_night`, `throne_party_mess`, `la_sky`) | RAPixel placeholders | Placeholder environments; any screen using them is HOLD | Environment masters per CURRENT_OPEN_ART_GAPS "STILL MISSING — environments" | Blocking (coverage) |
| NC-FA-07 | Screens with family, God, Buckhead Vampire, OG, drowned souls, Portobello cast, ad-hoc extras; PICKUP players, the JOLLOF cook, bedroom company | RAPixel placeholder actors | Mixed real/placeholder screens (HOLD per HQ) | Identity anchors (canon-owned where noted) | Blocking (coverage) |
| NC-FA-08 | HOOKAH minigame | RAPixel placeholder figures | A seated hookah scene; no approved seated state exists for Rich or the companions | Seated hookah states (CURRENT_OPEN_ART_GAPS lists Bllad33 hookah seated) | Blocking for that surface (HOLD) |
| NC-FA-09 | PICKUP phone icon (frozen), Bruce bow, Deacon blessing, Dragon Maggi Cube (frozen) | Frozen assets | Not a presentation failure: no runtime surface or scene is clearly theirs (MAPPING AMBIGUOUS) | An HQ/Story call on where each belongs — no new art | Polish |

---

## Historical tickets (as accepted at the bulk QA checkpoint)

| Ticket | Screen | Status |
|---|---|---|
| PD-W1-01 | `ocean_floor` / `ocean_floor_collapsed` three-actor prologue screens | EXCEPTION-LAYOUT, **NEEDS CREATIVE**: integrate the frozen ocean-floor master, then author a hero shot |
| PD-W1-02 | `slurp`, three actors | EXCEPTION-LAYOUT; also accepts partial face overlap; needs an authored shot or slot positions |
| PD-W1-03 | `pet_crypt`, two actors at the frame edges | EXCEPTION-LAYOUT; needs authored slot positions |
| PD-W1-04 | `portobello_bedroom`, four actors | EXCEPTION-LAYOUT; needs an authored shot and environment art |
| PD-W3-01 | Property interior, `inspect` beat only | Accepts `shot-consistency` (every hotspot must stay in frame) |
| PD-W3-02 | Ogun's Rave interior | Accepts `shot-consistency`; tightening means changing the HQ-accepted composition, a creative decision for HQ |

## Non-presentation follow-ups (not tickets for Art or the Director)

| ID | Issue | Where | Notes |
|---|---|---|---|
| FU-01 | An out-of-order story node throws `TypeError: Cannot read properties of null (reading 'name')` | `js/data/btf/adventures/w2.js:16`. The node's `lines` read `RABtfPeople.get(A.vars.person).name`, but `A.vars.person` is set by an earlier node | Only reached when a node is entered without its predecessor (the presentation sweep jumps straight to nodes). It doesn't occur in normal play order. Content-side fix: null-guard the person lookup, or seed the var on entry. Not a Presentation Director issue |

These are the screens the generic Director can't bring into a shot band without scene-specific staging. The Director still frames each one best-effort (full-width, UI-separated, nothing clipped), and lint records the accepted exception. Screen keys are `environment|slot:person`, and this file contains no story content. The release gate requires the exception list in `js/data/presentation.js` to exactly match the screens that fail the dry run.

| Ticket | Screen(s) | Why generic framing can't pass | Resolution path |
|---|---|---|---|
| PD-W1-01 | `ocean_floor` / `ocean_floor_collapsed` with three actors (farLeft, mid, farRight) | A wide three-figure spread in a base-1 placeholder environment: full-width cover gives a body of about 0.27, between the establishing (≤ 0.25) and conversation (≥ 0.35) bands | **NEEDS CREATIVE**: the frozen ocean-floor master (Art Ship 004) isn't runtime-integrated yet. Revisit as a Wave 4 hero override once the real environment and its depth scale land |
| PD-W1-02 | `slurp` with three actors (left, right, farRight) | Three-figure spread; edge-slot crowding also partly covers one face (≈ 92% visible) | Wave 4 authored `shot` / slot positions (EXCEPTION-LAYOUT) |
| PD-W1-03 | `pet_crypt` with two actors at left and farRight | The wide pair can't reach the conversation band, and full-width cover is larger than establishing | Wave 4 authored slot positions (EXCEPTION-LAYOUT) |
| PD-W1-04 | `portobello_bedroom` with four actors | Four-figure family line-up in a base-1 placeholder environment | Wave 4 authored `shot` (EXCEPTION-LAYOUT); revisit when environment art lands |

## Provisional checks (not tickets)

These are tracked through the Art gap map, not as presentation defects:
- **Placeholder environments** (RAPixel paintings) report dead space as PROVISIONAL. Flat placeholder art is low-detail by design, so dead space is re-checked when final art is integrated.
- **Placeholder actors** report size and in-view checks as PROVISIONAL, because their painted bounds are wider than final sprites.

## Environment art already frozen but not runtime-integrated

Art Ship 007 froze a set of environments and characters, including boba_shop, brunch, food_court, kitchen, onsen and venice, that the adventures still paint as placeholders. Integrating them is a separate Engineering change and isn't part of this presentation migration. When they are integrated, rerun the dry run and sweep: provisional notes should drop, and the Wave 1 lock will show exactly which screens changed.

## Wave 3 exceptions

| Ticket | Screen | Why | Resolution path |
|---|---|---|---|
| PD-W3-01 | Property interior (`property-la-4p-interior`), **inspect beat only** | While inspecting, every hotspot (door → far-right kitchen) must stay in frame, so the frame is nearly full-width: conversation size 0.359, in band but 8% under the reference | **Narrowed in Wave 4:** dialogue now uses a tight `talk` beat (0.41, no exception), and the camera snap-pans wider only in hotspot mode. The exception applies to the `inspect` beat alone |
| PD-W3-02 | Ogun's Rave interior (`ogun-rave`) | The HQ-accepted wide composition (Rich left; Ogun on the raised host landing; a third speaker right) gives a conversation size of 0.351: in band but 10% under the reference | Accept `shot-consistency` only. Wave 4 checked per-phase beats: even the two-person beat is width-limited (≈0.36) by the accepted positions. Tightening it means changing the HQ-accepted composition, which is a creative decision for HQ |
