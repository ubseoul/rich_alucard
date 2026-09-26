# ART SHIP 011 — Runtime demand / use map

**Status:** APPROVED MASTER / FROZEN — NO RUNTIME ASSIGNMENT

This is a frozen reusable population-library contract, not a screen-integration plan. All nine entries have `COVERAGE` severity, clear no existing HOLD ticket, and intentionally leave Engineering destination and runtime surfaces unassigned for later World Life / Nightlife integration.

| Request | Stable ID | Type / held state | Source / native contract | Intended future use | Placement constraint |
|---|---|---|---|---|---|
| AS11-NL-01 | `nightlife_population.dancer` | population fragment / dance | A01; 80×96 RGBA; contact (40,88) | party, club, dance-floor side pocket | named-actor clearance; sparse/medium density |
| AS11-NL-02 | `nightlife_population.performer` | population fragment / performance | A02; 80×96 RGBA; contact (40,88) | stage or performance environment | credible stage context; non-explicit adult presentation |
| AS11-NL-03 | `nightlife_population.queue_pair` | population fragment / arrival | A03; 112×96 RGBA; contact (56,88) | venue entrance, queue, passive social | keep as a pair; clear entrance/actors |
| AS11-NL-04 | `nightlife_population.dancing_pair` | population fragment / partnered dance | A04; 112×96 RGBA; contact (56,88) | party or club floor | wide side pocket; named-actor clearance |
| AS11-NL-05 | `nightlife_population.affectionate_pair` | population fragment / affectionate social | A05; 112×96 RGBA; contact (56,88) | lounge, rooftop, party background | anonymous adults; background behavior only |
| AS11-NL-06 | `nightlife_population.bartender` | population fragment / hospitality | A06; 80×96 RGBA; contact (40,88) | bar/service context | never free-floating; requires bar/service staging |
| AS11-NL-07 | `nightlife_population.hookah_lounge` | population fragment / seated lounge | A07; 128×96 RGBA; contact (64,88) | hookah lounge, rooftop social pocket | included hookah/table/seats; do not duplicate furniture |
| AS11-NL-08 | `nightlife_population.dense_cluster` | population fragment / dense crowd | A08; 144×96 RGBA; contact (72,88) | one-off party/club/rooftop density | never tile or repeat into wallpaper |
| AS11-NL-09 | `nightlife_population.foreground_silhouettes` | population fragment / foreground depth | A09; 144×112 RGBA; contact (72,104) | peripheral foreground framing | high occlusion risk; lighter band; clear actors/UI |

Machine-readable source paths, SHA-256 values, alpha contracts, contacts, future-use families, severity, null HOLD impact and unassigned Engineering destinations are in `RUNTIME_DEMAND_MAP.json`.

Presentation Director remains the final framing authority. Native source pixels must not be resized to solve composition.
