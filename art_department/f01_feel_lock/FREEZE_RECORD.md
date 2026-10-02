# F01 feel-lock asset freeze

**Ube decision, 2026-09-30:** “besides that everythings good to be frozen”; after the FL-A01 revision, “the second one is perfect.”

**Status:** APPROVED MASTER / FROZEN for **54 exact PNG byte streams** listed in `FREEZE_RECORD.json`. Production paths are under `assets/f01/feel_lock/`.

**Source:** `SOURCE_TICKET.md`, SHA-256 `58ebb2b14c6d48d0797684a37218570b2e06e39d79dbb38029561c503691bca2`. The source is an exact copy of the supplied OPEN engineering ticket.

**FL-A01 revision:** red bed background and dominant upright phone at native 270×480; the hand remains visible. The blank phone screen is a transparent binary-alpha cutout in the idle foreground. JOLT reuses the idle pixels with code shake. Thumb typing is an additive overlay. `FL-A01_COMPOSITOR_CONTRACT.json` gives exact placement.

**Excluded from freeze:** absent named Oga state families under FL-A07 and physical RECRUIT/STORY/DISTRICT silhouettes under FL-A10. These remain `SOURCE_REQUIRED`. Existing frozen SUPRA source remains byte-identical; three new exact-origin additive overlays are frozen.

**Preservation:** 432/432 prior frozen sources SHA-256 matched before promotion. Frozen corpus 432 → 486; Asset Register 574 → 628.

**Boundary:** No game runtime, Presentation, Engineering mapping, audio, freeze of absent assets, or SEALED material changed. Integration and runtime QA remain separate.

| Ticket | Frozen PNGs |
|---|---:|
| FL-A01 | 3 |
| FL-A02 | 2 |
| FL-A03 | 7 |
| FL-A04 | 2 |
| FL-A05 | 9 |
| FL-A06 | 15 |
| FL-A07 | 5 |
| FL-A08 | 4 |
| FL-A09 | 2 |
| FL-A10 | 5 |
