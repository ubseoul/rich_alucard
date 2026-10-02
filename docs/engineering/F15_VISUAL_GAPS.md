# F15 — visual gaps (recorded, not fixed; no art was generated)

Nothing below was silently substituted: each placeholder room names itself on its establishing card and in the location tag, and is registered
only while `F15.velvet_rotation` is ON (so a flag-OFF game and its art censuses are unchanged).

## Environments
| Needed by | Used now | Gap |
|---|---|---|
| THE BING interior (Roxy L1, Rosalyn L1, Emerald L1/L3) | `f15_bing` — code-drawn placeholder (`RAPixel.paintEnvironment`) | no approved Bing interior in the repo (OL-031: reuse or R4 art ticket) |
| Boxing gym (Roxy L2, L3) | `f15_gym` placeholder | no gym art |
| Roxy's apartment (Roxy L4) | `f15_roxy_apartment` placeholder | none |
| Plénitude (Rosalyn L1) | `f15_plenitude` placeholder | none (existing `brunch` is EGGS BENEDEAD, not fine dining) |
| Yuck Wars convention (Rosalyn L3) | `f15_convention` placeholder | none |
| Rosalyn's apartment, lights on / off (Rosalyn L4) | `f15_rosalyn_apartment`, `f15_rosalyn_apartment_dark` placeholders | none |
| Library, exam hall steps (Emerald L3) | `f15_library`, `f15_exam_hall` placeholders | none |
| Shrine Auditorium (Emerald L4) | `f15_shrine` placeholder | none |
| Waffle Haven, Little Tokyo, Kiki's Boba, throne room (morning after), castle kitchen, street at night, bedroom (texts/calls) | **existing approved/placeholder environments reused** | Little Tokyo is a street, not a ramen-shop interior |

## Characters
* **Roxy / Rosalyn / Emerald in scenes:** the only approved presentation is the dance masters. Scene actors are **frame-0 stills of those frozen masters** (`assets/f15/portraits`, one shared scale, relative size preserved). There are no idle/expression/scene-pose states. The approved foundation cards are not used at runtime.
* **The giant cockroach (THE SPIRIT OF UNCLE BUNMI):** no art exists; it is the engine's placeholder silhouette actor.
* **Granny Bing** (speaks in Emerald L3): her frozen art exists only on `art/f01-feel-lock-freeze`, not on this base; she is a speaker name with no on-stage actor.
* **The other fighter (Roxy L3):** intentionally never shown. Kiki, Tristan, Pearman, Baba, the stranger at the prop booth: narration only.
* Props (curry, mug, phones, flashcards, receipts): narration only.

## Accepted for launch, logged for later polish (not repaired)
* WOLF's white pixels and the inherited source clipping / restart seams in all three masters.
* Layout A's size and the softer 1/3-scale animation rendering (≈1.7–2.5× upscaled on 2×/3× screens). A 1/2-scale build would be crisper at ≈2.25× the decoded memory (~110 MiB, not built). Decoded sheet memory at 1/3 is 48.4 MiB.
* Three dancers together (a future "one at a time" preference is not a requirement).
* Wardrobe tiers (deferred artwork) are not implemented and are separate from progression.
