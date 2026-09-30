# CGA-F2-031 — Big Bing `NO` Freeze Record

**Status:** APPROVED MASTER / FROZEN / CLOSED
**Decision authority:** Ube
**Decision:** “its cool freeze it” — PASS — FREEZE APPROVED
**Freeze date:** 2026-09-30

## Accepted exact asset

- **Character:** BIG BING
- **State:** `NO`
- **Ticket:** `CGA-F2-031`
- **Asset ID:** `VA-BIG-BING-CGA-F2-031-NO-v1`
- **Native path:** `assets/before_the_fame/characters/big_bing/cga_f2_031/big_bing_no_80x96_v1.png`
- **Native SHA-256:** `3cce5b05bed65fcb891857916eb07bab7bafd6dd9bbbcb839dd658558b926168`
- **4× preview path:** `art_department/visual_a/big_bing_cga_f2_031/review/big_bing_no_4x_nearest_v1.png`
- **Preview SHA-256:** `0a45b0b51386f09e94e0d1d1d56a46b1dedcd77bd3e9afc369984321a5426a6a`

## Authority and derivation

- Identity authority: frozen `VA-BIG-BING-CGA-F2-031-NEUTRAL-v1`, SHA-256 `a133f44b9cd4c232cda4b6d779ce295da64a18dc9cdf671bc7f2531087e90ccd`.
- State authority: OL-017 authorizes `NO`; Ube resolved its behavior as Big Bing visibly saying no.
- Implementation: speech-only facial derivative; exactly three existing opaque mouth-region pixels changed.
- Unchanged scope: every other native pixel, including the complete silhouette, body, hands, wardrobe, palette, contact and face structure.
- Precedence: frozen pixels > OL-017 + Ube state ruling > other OPEN references.
- Restricted-material access: none.

## Technical contract

- 80×96 RGBA
- binary alpha `{0,255}`
- contact `(40,88)`; last opaque row 87
- opaque envelope `(20,12)` through `(59,87)`, unchanged from neutral
- 14 opaque RGB colors, unchanged from neutral
- crisp hard pixels; no anti-aliasing or gradient
- preview exactly 320×384 and pixel-identical to a 4× nearest-neighbor enlargement

## Closure boundary

- `SOURCE_REQUIRED = none`
- Exactly one Big Bing `NO` state is frozen.
- No gesture, prop, environment, text, effect, additional state or variant is included.
- Runtime integration, gameplay placement, merge and deployment remain separate work.

**BIG BING NO STATE — FROZEN / CLOSED**
