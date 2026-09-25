# ART SHIP 009 — Runtime Demand Map

**Status:** CANDIDATE PACKAGE READY FOR HQ REVIEW

**Runtime authority:** `claude/art-ship-008-integration` at `a16196e4fbc0c7530a00bdfe915fb9c9c7cd1826`

**Live baseline:** 104 adventure screens + 17 fights; 98 PASS / 23 HOLD; frozen corpus 187 assets

**Machine authority:** `RUNTIME_DEMAND_MAP.json`

## Runtime reconciliation and minimum package

The Integration Matrix has five held Portobello surface keys, not five distinct environment ids. They resolve to three masters: `portobello_bedroom` (three held surfaces), `portobello_office` and `portobello_porch`. Across the full requested environment scope there are 12 held screens but only ten distinct environment ids.

`lan_night` is the same authored location already frozen as `tristan_apt`: Tristan's apartment, three monitors/snacks, at night. Reusing that exact master weakens neither the location nor the condition and requires no new pixels. The smallest package is therefore 12 candidates: nine environment masters, one Hollow Bowl exact-origin additive layer and two seated derivatives. A thirteenth map row records the zero-pixel alias handoff.

## Demand summary

| Request | Ticket | Runtime id/state/layer | Authority | Native contract | Exact intended surfaces | Severity | Expected resolution | Engineering mapping |
|---|---|---|---|---|---|---|---|---|
| AS9-ENV-ATL-HOUSE-PARTY | NC-FA-06 | `atl_house_party` master | OPEN | 270×480 opaque RGB; proposed floor line y=372 | `atl_house_party\|left:rich,right:bunmi` | BLOCKING | 1 HOLD screen | `environments.atl_house_party` |
| AS9-ENV-LA-SKY | NC-FA-06 | `la_sky` master | OPEN | 270×480 opaque RGB; proposed floor/contact line y=372 | `la_sky\|left:rich,right:mazda_human` | BLOCKING | 1 HOLD screen | `environments.la_sky` |
| AS9-REUSE-LAN-NIGHT | NC-FA-06 | `lan_night` existing-master alias | OPEN | existing frozen 270×480 opaque RGB master, unchanged | `lan_night\|left:rich,right:tristan` | BLOCKING | 1 HOLD screen, zero new art | `environments.lan_night -> tristan_apt` |
| AS9-ENV-NAIJA-LOT | NC-FA-06 | `naija_lot` master | OPEN | 270×480 opaque RGB; proposed floor line y=372 | `naija_lot\|left:rich,right:nneka` | BLOCKING | 1 HOLD screen | `environments.naija_lot` |
| AS9-ENV-NEIGHBOR-CASTLE | NC-FA-06 | `neighbor_castle` master | OPEN | 270×480 opaque RGB; proposed floor line y=372 | `neighbor_castle\|left:rich` | BLOCKING | 1 HOLD screen | `environments.neighbor_castle` |
| AS9-ENV-PORTOBELLO-BEDROOM | NC-FA-06 / PD-W1-04 | `portobello_bedroom` master | OPEN — named Ship authorization | 270×480 opaque RGB; proposed floor line y=372 | three exact Portobello bedroom keys in machine map | BLOCKING | 3 HOLD screens; staging exception remains Director/HQ-owned | `environments.portobello_bedroom` |
| AS9-ENV-PORTOBELLO-OFFICE | NC-FA-06 | `portobello_office` master | OPEN — named Ship authorization | 270×480 opaque RGB; proposed floor line y=372 | `portobello_office\|left:rich_portobello,right:portobello_manager` | BLOCKING | 1 HOLD screen | `environments.portobello_office` |
| AS9-ENV-PORTOBELLO-PORCH | NC-FA-06 | `portobello_porch` master | OPEN — named Ship authorization | 270×480 opaque RGB; proposed floor line y=372 | `portobello_porch\|left:rich_portobello,right:portobello_wife` | BLOCKING | 1 HOLD screen | `environments.portobello_porch` |
| AS9-ENV-ROOFTOP-DTLA | NC-FA-06 | `rooftop_dtla` master | OPEN | 270×480 opaque RGB; proposed floor line y=372 | `rooftop_dtla\|left:rich` | BLOCKING | 1 HOLD screen | `environments.rooftop_dtla` |
| AS9-ENV-TOKYO-TEASE | NC-FA-06 | `tokyo_tease` master | OPEN | 270×480 opaque RGB; proposed floor line y=372 | `tokyo_tease\|mid:rich` | BLOCKING | 1 HOLD screen | `environments.tokyo_tease` |
| AS9-HOLLOW-STAGE-BAND-CROWD | NC-FA-10 | additive crowd companion layer | OPEN | 270×480 RGBA, binary alpha, exact origin (0,0) | `hollow_bowl\|left:rich` | BLOCKING | 1 HOLD screen | `environments.hollow_bowl.layers.stage_band_crowd_condition` |
| AS9-TUNDE-HOOKAH | NC-FA-11 | `tunde.hookah_seated` | OPEN | 80×96 RGBA, binary alpha, contact (40,88) | `minigame:hookah?company=HOMIES` | BLOCKING | dependency group clears 1 held minigame surface | `minigames.hookah.company.HOMIES.tunde` |
| AS9-DRE-HOOKAH | NC-FA-11 | `dre.hookah_seated` | OPEN | 80×96 RGBA, binary alpha, contact (40,88) | `minigame:hookah?company=HOMIES` | BLOCKING | dependency group clears 1 held minigame surface | `minigames.hookah.company.HOMIES.dre` |

## Source integrity

- `lan_night` reuse source: `assets/before_the_fame/environments/tristan_apt/tristan_apartment_270x480.png`, SHA-256 `7ee376bbf15019ac0c1b86b99403cf16a154e37a50ecc373cf9cb2bbac735e9f`.
- NC-FA-10 base: `hollow_bowl_night_270x480.png`, SHA-256 `19d098d6d70c7228db164a23c2551a301667055977010392d1ff1d9f8420aa30`.
- NC-FA-10 frozen Ship 008 companion layer: `hollow_bowl_crowd_overlay_270x480.png`, SHA-256 `8821c902ca448f3222f3d28f5f32cddafbd95b607a08bf48e73254cc4d7665d1`.
- Tunde anchor: SHA-256 `12b9fa058d82caed91fc89b5fa6c3072875919239b107d79a477623e4de99ac9`.
- Dre anchor: SHA-256 `6945490fb4e31dd01afe594ee061a50d8ee354f92a073936c031e0b32f1e1875`.

All listed source bytes are immutable. New candidates remain under this Ship until HQ review.

## Forecast

If all mappings are later accepted, frozen, integrated and pass runtime visual QA, 13 adventure HOLD screens should clear: the 12 placeholder-environment screens plus NC-FA-10. The projected adventure/fight matrix would move from 98 PASS / 23 HOLD to approximately 111 PASS / 10 HOLD. NC-FA-11 should separately clear one held minigame surface. This is a forecast, not current runtime acceptance.
