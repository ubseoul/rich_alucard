# F15 — visual gaps (audited against existing approved runtime art; no art generated, nothing frozen replaced)

Audit basis: `RAArtRegistry` (56 frozen environments, ~80 characters) on this base, `assets/before_the_fame/**`, and the F15 art package
(`7b034a92…`, foundation cards). A placeholder room names itself on its establishing card and is registered only while `F15.velvet_rotation` is ON.
"Acceptable" = acceptable for a *playable candidate*; "Creator review" = needs Ube's visual decision before release.

## Characters
| Use | Asset inspected | Current fallback | Verdict |
|---|---|---|---|
| Roxy / Rosalyn / Emerald on stage in scenes | the approved **foundation cards** (`roxy/rosalyn/emerald-foundation.png`, 1145×1374 neutral standing poses; hashes verified against the package manifest); dance frame-0 stills were the first fallback and are **no longer used** | the cards, one shared scale into the engine's 80×96 actor box (`assets/f15/portraits/<name>.png`, built by `tools/f15/build_derivatives.py`). Scenes now key on the character's **name**, so they do not depend on the unproven wolf/pink/dragon mapping | Acceptable. Single pose only (no expression/date/bedroom states exist) — creator review if per-scene poses are wanted. Outfit colours on the cards match the dance sprites (teal / pink+black / purple), which is supporting evidence for the provisional mapping, not proof |
| Giant cockroach boss (Rosalyn L4) | registry characters (no cockroach), `bunmi` (Uncle Bunmi, a person), enemy cards | engine placeholder silhouette actor | Acceptable as a gag boss; **creator review** — needs art or an explicit "unseen" treatment |
| Granny Bing (Emerald L3) | registry (absent); frozen Granny Bing exists only on `origin/art/f01-feel-lock-freeze` | speaker name, no on-stage actor | Acceptable; reuse once that frozen art is on the integration line |
| Other fighter (Roxy L3) | — | intentionally never shown | Acceptable (authored as unnamed/never speaking) |
| Kiki, Tristan, Pearman, Baba, props (curry, mug, phones, cards) | `kiki` exists but is not staged | narration only | Acceptable |

## Environments
| Scene/use | Existing approved art inspected | Current fallback | Verdict |
|---|---|---|---|
| THE BING interior (Roxy L1, Rosalyn L1, Emerald L1/L3) | `party_hall` / `party_hall_packed` (Rich's castle party hall with DJ booth, curtains, crowd variant), `catacomb` (named live-music venue) | `f15_bing` code-drawn placeholder | **Creator review.** `party_hall` is the closest approved club-like room but is Rich's castle, not the Bing (OL-031: reuse or R4 art ticket) |
| Roxy's apartment (L4), Rosalyn's apartment lit/dark (L4) | `tristan_apt` (modern city apartment, desk/couch) — someone else's home | `f15_roxy_apartment`, `f15_rosalyn_apartment(_dark)` | **Creator review.** `tristan_apt` could stand in for a generic apartment; not used without sign-off (Roxy's whiteboard/dog calendar, Rosalyn's collectibles are not in it) |
| Boxing gym (Roxy L2, L3) | none (`roof`, `garage` are unrelated) | `f15_gym` | **Creator review** — art needed |
| Plénitude (Rosalyn L1) | `brunch` (EGGS BENEDEAD), `ballroom` (hotel ballroom) | `f15_plenitude` | **Creator review**; neither reads as a fine-dining restaurant |
| Convention hall (Rosalyn L3) | `gallery`, `party_hall` | `f15_convention` | **Creator review** — art needed |
| Library, exam-hall steps (Emerald L3) | none | `f15_library`, `f15_exam_hall` | Acceptable (brief, text-message-driven stops); art if wanted |
| Shrine Auditorium (Emerald L4) | `catacomb` (stage with curtains/lights, but a named club), `ballroom` | `f15_shrine` | **Creator review** — the scene's key image (a huge, mostly empty hall) is not in the approved set |
| Waffle Haven, Kiki's Boba, throne room (morning after), castle kitchen, street at night, bedroom | existing approved/placeholder environments | **reused as-is** | Acceptable. Little Tokyo is a street, not a ramen-shop interior |

## Accepted for launch, logged for later polish (not repaired)
* WOLF v2 / DRAGON / PINK inherited clipping, edge contact and restart seams; the v2 package's own audit lists 7 pale-sample losses and "unresolved visual defects".
* Layout A's size and the softer 1/3- (WOLF 1/4-) scale rendering (≈1.7–2.5× upscaled on 2×/3× screens). Three dancers together.
* Wardrobe tiers (deferred artwork) are not implemented and are separate from progression.
