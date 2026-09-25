# Presentation Director — exception and NEEDS CREATIVE tickets

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
