## Approved owner feedback release - 2026-10-11

Ube approved the art and instructed "push live". Independent normal delta QA and the full official source gate passed. The bounded patch checklist below is the preserved candidate record; its earlier approval and publication pending statements are historical. Engine 4042ae5bd48a3519f11131ce224efd69a9fc8209; private 32f68dda85d8dd4ea27d7e3b4e0172bf952eea9a. The known inherited Armory behavior under rejected save writes is documented in the release handoff and was not changed in this patch.

## Owner feedback patch - 2026-10-11 (local candidate, not published)

Authority: Ube's current feedback supersedes historical stop instructions only for the bounded sibling candidates below. Preserve original masters, approved dialogue words/order, combat damage/timing, car prices/ownership/story gates, and the separate r5 QA baseline.

Project-wide visual lessons: reuse established combat and dialogue components; size actors using their visible silhouette rather than padded canvas dimensions; keep touch controls clear of actors and text; use coherent native pixel density, stepped outlines and restrained material palettes; keep one character design across every animation pose; make attack effects match the game's existing pixel language. Inspect native and actual consumer pixels before claiming completion.

Current patch checklist and dependency order:

1. [x] Consolidate owner instructions here; preserve unrelated guidance.
2. [x] Permanent **Get a car** in Your Time -> existing JDM screen; visibility on every post-intro day, unchanged buying gates, back/close/mobile checks. 50 integrated checks passed.
3. [x] Uncle Bunmi uses established Rich dialogue, one line at a time, with exact existing words/order/choices and persisted route state; tap/keyboard/reload/encounter transition checks.
4. [x] Quit remains in clear touch UI space; Grandma is unobscured. Human Bunmi and his roach have readable visible size with grounded feet and no clipping at 360/390/430/desktop.
5. [x] Cohesive pixelated roach family: idle and all four moves' prepare/action/contact/recovery, plus actual hit/result states. Preserve source art/provenance and animation registration. Replace La Chancla chain-looking effect with readable pixel sandal waves; damage/contact/timing unchanged.
6. [x] Integrated focused screenshots, controls/save/replay checks and one combined local patch handoff. 52 five-size host checks, 24 combat/receipt checks and 16 rule comparisons passed. Technical candidate complete; art taste/HQ acceptance and publication remain parent-owned. Independent broad QA stays on public bba89da / engine 13b88add / private d45e493 / pack 98f708ad.
7. [x] Later explicit owner approval ("yes go fix") adds the two Armory findings to this same candidate: visible insufficient-cash feedback and protection against repeated BUY presses activating a reflowed Range Day control. Original prices, grant/save functions and intentional Range Day remain unchanged. 98 checks pass across double/triple native touchscreen or pointer presses at 360/390/430/1280, with reload and healthy navigation.

The parent is Hojicha and receives the actual before/after contact sheet and short Bunmi/Chancla gameplay clip for consultation. No additional internal signoff is required. New art still needs the owner's creative approval before production acceptance; local technical completion does not imply that approval or publication.

Completed work is retained when later feedback changes ordering. The checklist is acceptance order, not a request to redo already verified work. Candidate/delta evidence belongs with the patch; it does not replace baseline or imply full-campaign acceptance.

---

# Current handoff

**ART SHIP 007 — OPEN FOUNDATION COMPLETION: BE TASTE PASS / HQ VISUAL PASS / APPROVED MASTER / FROZEN / COMPLETE.** No Art Ship is active. Do not begin ART SHIP 008 in this chat.

## Frozen result

- 18 canonical 80×96 RGBA identity anchors, binary alpha and contact `(40,88)`.
- 20 canonical 270×480 opaque RGB reusable environment masters.
- 38 total canonical PNGs; every canonical SHA-256 equals its accepted candidate SHA-256.
- No regeneration or visual revision occurred during promotion.
- The approximately 1.85× character presentation scale remains runtime-only nearest-neighbor guidance.

Exact ids, paths, hashes, dimensions, formats, alpha, contacts, provenance and freeze scopes are authoritative in [ART SHIP 007 manifest](ships/art_ship_007/ART_SHIP_MANIFEST.json), [Engineering Asset Map](ships/art_ship_007/ENGINEERING_ASSET_MAP.json), [Promotion Validation](ships/art_ship_007/VALIDATION_REPORT.json), and [Asset Register](ASSET_REGISTER.json).

## Accepted deferrals

Ambiguous, likeness-sensitive, condition-dependent, crowd, overlay, GUIDED and presentation-dependent work remains deferred. Family identities, God, Buckhead Vampire and OG Hooper remain outside the promoted set. No inference or substitute art is authorized.

## Boundaries

No runtime/gameplay code changed. Runtime integration was not performed. No SEALED/HQ-only content was accessed. Future pixel changes require an explicit HQ delta.

## Corpus and integration

The frozen corpus is now **173 assets** and the register contains **313 entries**. ART SHIP 004–007 contribute 153 frozen handoff files that remain not runtime-integrated by their Ships. Engineering integration is the next highest-value independent task.

**STOP. ART SHIP 007 is FROZEN / COMPLETE. Retire this Art Agent after commit, push and clean-tree verification. Do not begin ART SHIP 008 in this chat.**
