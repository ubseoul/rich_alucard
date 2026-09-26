# ART SHIP 011 — NIGHTLIFE POPULATION LIBRARY

**Status:** CANDIDATE — READY FOR HQ REVIEW

**Owner:** Art

**Base:** Engineering checkpoint `8eab30dc790071ec8da98f65311e2b4676fabad0`

**Branch:** `art/art_ship_011`

**Exploratory evidence:** `art/polish_preproduction_001` at `d8c24b632ecdc134986b4f81ff5d3f3959609eea`

**Spoiler class:** OPEN

## Purpose

Productionize the nine HQ-selected POLISH PREPRODUCTION 001 nightlife fragments as a reusable library of anonymous ambient adult figures. The package preserves the approved candidate pixels exactly and records stable IDs, contacts, categories, provenance, placement constraints, production paths, technical validation and review evidence.

This Ship does not assign the library to specific runtime screens. Later World Life / Nightlife integration must make those decisions against actual runtime demand and Presentation Director framing.

## Package

| Request | Stable production ID | Category | Native cell | Contact | Production path |
|---|---|---|---:|---:|---|
| `AS11-NL-01` | `nightlife_population.dancer` | `ACTIVE_DANCE` | 80×96 | (40,88) | `assets/before_the_fame/population/nightlife/nightlife_dancer_80x96.png` |
| `AS11-NL-02` | `nightlife_population.performer` | `STAGE_PERFORMANCE` | 80×96 | (40,88) | `assets/before_the_fame/population/nightlife/nightlife_performer_80x96.png` |
| `AS11-NL-03` | `nightlife_population.queue_pair` | `ARRIVAL_QUEUE` | 112×96 | (56,88) | `assets/before_the_fame/population/nightlife/nightlife_queue_pair_112x96.png` |
| `AS11-NL-04` | `nightlife_population.dancing_pair` | `PARTNERED_DANCE` | 112×96 | (56,88) | `assets/before_the_fame/population/nightlife/nightlife_dancing_pair_112x96.png` |
| `AS11-NL-05` | `nightlife_population.affectionate_pair` | `AFFECTIONATE_SOCIAL` | 112×96 | (56,88) | `assets/before_the_fame/population/nightlife/nightlife_affectionate_pair_112x96.png` |
| `AS11-NL-06` | `nightlife_population.bartender` | `HOSPITALITY_SERVICE` | 80×96 | (40,88) | `assets/before_the_fame/population/nightlife/nightlife_bartender_80x96.png` |
| `AS11-NL-07` | `nightlife_population.hookah_lounge` | `SEATED_LOUNGE_GROUP` | 128×96 | (64,88) | `assets/before_the_fame/population/nightlife/nightlife_hookah_lounge_128x96.png` |
| `AS11-NL-08` | `nightlife_population.dense_cluster` | `DENSE_CROWD_CLUSTER` | 144×96 | (72,88) | `assets/before_the_fame/population/nightlife/nightlife_dense_cluster_144x96.png` |
| `AS11-NL-09` | `nightlife_population.foreground_silhouettes` | `FOREGROUND_DEPTH` | 144×112 | (72,104) | `assets/before_the_fame/population/nightlife/nightlife_foreground_silhouettes_144x112.png` |

All assets use origin `(0,0)`, true 8-bit RGBA and alpha values exactly `0/255`. The contact is a placement anchor within the padded native cell, not permission to infer scene coordinates.

## Pixel and promotion result

Nine of nine candidates pass. Zero were rejected. The exploratory candidate, Ship candidate and production-path file are byte-identical for every asset. Deterministic source extraction recreates the exact native pixel arrays. No file was regenerated, redrawn, resized, retouched, palette-shifted or re-encoded.

The production paths remain **CANDIDATE — HQ REVIEW REQUIRED**. Their presence under `assets/` is production staging, not approval, freeze, runtime use or style authority.

## Placement authority

- Keep all ambient population clear of named actors and critical UI.
- A01 is a sparse/medium-density side-pocket dance-floor tool.
- A02 needs credible stage/performance context; its adult sensual presentation remains non-explicit.
- A03 stays a pair fragment for queue/arrival or passive social use.
- A04 needs a wide side-floor pocket.
- A05 is adult affectionate background behavior, not a named relationship.
- A06 requires a credible bar/service context and is intentionally absent from the environment compatibility board because no runtime bar placement is assigned here.
- A07 includes the hookah, table and seats. Do not duplicate host furniture beneath it.
- A08 is a one-off density tool. Do not tile or repeat it into wallpaper.
- A09 carries high occlusion risk. Keep it peripheral or use it only in deliberately framed foreground depth against a lighter band.

Representative composites are evidence only. No population fragment is baked into an environment master.

## Explicit boundaries

No runtime JavaScript, named-character art, Rich state, `rich_hookah_seated`, laptop Rich state, Portobello asset, Portobello companion identity, family identity, HOLD status, PLAYMAKERS content, combat FX/presentation, SEALED/HQ-only content, merge or deployment is changed by this Ship.

## Stop point

**ART SHIP 011 — READY FOR HQ REVIEW.** Do not self-award HQ PASS, approve, freeze, integrate, merge or deploy.
