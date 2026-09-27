# Runtime reconciliation audit — what is authorized but not yet in the playable runtime

ENGINEERING 03, branch `claude/final-art-integration`, 2026-09-26. **Spoiler-safe:** ids, statuses and neutral codes only. SEALED contents were not inspected.

- **Method:** every item was verified against live source, tests or generated evidence at this branch's HEAD, not taken from prose alone.
- **Excluded:** new ideas, feature proposals, SEALED contents.
- **Stale prose:** where a document states older runtime facts (e.g. save v7/v9, "do not implement Ogun's Rave yet"), it is treated as history. The live runtime is **save v12** (`js/engine/state.js`), and Ogun's Rave is implemented (its suite passes).

## 0. The largest gap: none of this lineage is on `main`

`main` (which Pages deploys, per `RELEASE_RUNBOOK.md`) is `b8ab4fe`, "Freeze Art Ship 007". Everything after it exists only on unmerged branches, 58 commits ahead:
- the BTF Rough Complete (save v12, 110 adventures, life clock, phone Life OS, Combat 2.0, minigames, lanes);
- the Presentation Director;
- Art Ship 004–013 runtime integration;
- HOLD CLEARANCE 001;
- this card.

`claude/eloquent-shannon-kc5qkn` (the BTF checkpoint) is not an ancestor of `main`. Merge and deploy sequencing is an HQ decision, and this card performed neither.

## ALREADY IMPLEMENTED (this lineage, verified by `npm test` + browser paths)

- **Life and phone:**
  - Save v12 with migrations.
  - Life clock and calendar (Oct 1 start, full moons, rain, budget months).
  - Phone Life OS: the canon seven apps plus TEXTS, HATCH, TOUGE, BARS, RICH RADIO, RECEIPTS.
  - VampGPT lanes.
- **Content and combat:**
  - 110 authored adventures and the date loop.
  - Combat 2.0 fights.
  - 9 minigames.
  - The dragon, cars, castle, real-estate, music, shops, ecology, parties and fame lanes, and the ending infrastructure.
- **Earlier milestones:** Ogun's Rave (PLAYER-BLIND), The Property (PLAYER-BLIND), Party Foundation, Rave Stage, the Supra, Butter Chicken, and World Events (PLAYER-BLIND proof event).
- **Presentation and Art:** the Presentation Director (104 adventure screens, 17 fights), frozen Art Ships 004–010, HOLD CLEARANCE 001 (Maul → Lil Smack, Pier).

## IMPLEMENTED BY THIS CARD

ART SHIP 013 (six identities plus the corrected hookah Rich) and ART SHIP 012 CLOSEOUT (five identities) are integrated: **120 PASS / 1 HOLD**. ART SHIP 011 is registered as a library with a gate against unauthorized use. See `docs/art_integration/FINAL_ART_INTEGRATION.md`.

## APPROVED / FROZEN BUT NOT RUNTIME-INTEGRATED

| Item | Why it isn't in runtime | Needs |
|---|---|---|
| ART SHIP 011 nightlife population library (9 files) | Frozen with no runtime assignment by HQ decision; registered and gated | HQ surface/demand assignment |
| 4 frozen states with no scene: `hilt.walk_away`, `iron_jaw.rapping`, `tunde.asleep_floor`, `dre.asleep_floor` | No beat stages them (wiring would add cast or motion the content doesn't narrate) | Story/HQ beat call |
| 4 mapping-ambiguous (NC-FA-09): `bruce_loose.bow`, `deacon_brass.blessing`, Dragon Maggi cube icon, PICKUP app icon | No clear runtime surface | HQ mapping call |
| `agege_bread` prop | Bread appears only as text | UI surface decision |
| Rejected Buckhead ×2 | REJECTED / provenance only | — (must stay out) |

## DESIGNED / SCOPED BUT NOT IMPLEMENTED

| Item | Evidence | Needs |
|---|---|---|
| Art coverage still open (`art_department/CURRENT_OPEN_ART_GAPS.md`): derivative states (Coffe, Reggie, several women, Mazda-human, Rich riding/TOUGE, Bllad33), Mazda life stages, pier catch props, TOUGE rivals, world vehicles, crowd/weather layers, full phone screens | Placeholders at runtime. None of these sits on the 121 census screens. | Named Art Ships from a refreshed demand map |
| Non-census surfaces still HOLD: `minigame:pickup` (players), `minigame:jollof` (cook), `bedroom:company` | `tools/art-integration/review.json` surfaces; outside the 121 count | Identity/Art decisions |
| HATCH beyond the egg stage, TOUGE rival cars | Placeholder shapes (matrix surface notes) | Art |
| 4 environment ids without masters: `catacomb_dead`, `atl_airport`, `ocean_night_flight`, `halloween` | Registered placeholders; **no current census screen uses them** | Only if a live surface appears |
| Content-ordering question: the `lilSmackGone` flag is written once (A56) and never read | Reported by HOLD CLEARANCE 001; still true | Story/HQ |

## POLISH / OPTIONAL FOLLOW-UP

- **Screens that PASS with a polish note:**
  - NC-FA-13 `la_sky` (riding staging);
  - PD-AS9-01 `lan_night` (monitors cropped);
  - NC-FAI-01 porch (standing wife vs "leans on his shoulder").
- **Accepted Director exceptions** outside the adventure census: PD-W3-01 (Property inspect) and PD-W3-02 (Ogun's Rave composition).
- **HQ-FAI-02:** the Portobello cast speaker labels show raw ids. **HQ-FAI-03:** the office manager is mirrored (for review). The two identical ocean souls could be mirrored for variety (optional).
- **Tuning:** momentum saturates quickly in very active play (Rough Complete note). Throne-room and bedroom composed art is deliberately not rescaled.
- **Test harness debt:**
  - `party-browser-test` expects START → bedroom and fails identically on the accepted baseline;
  - `rave-browser-test` needs the `sharp` module;
  - the browser suites call `chromium.launch()` with no executable path.
- **Stale records (history, not runtime truth):**
  - `docs/btf/ART_INPUTS.md`: the Rough Complete snapshot lists 61 envs / 56 characters; the live figure is 4 environments and 4 identities.
  - `docs/CURRENT_CANON.md`: the save v7 statements.
  - `docs/ENGINEERING_HANDOFF.md`: save v9, "do not implement Ogun's Rave yet".
  - `docs/RICH_ALUCARD_GAME_BIBLE.md` §16: milestone order.
  - `docs/PRODUCTION_CONTROL.md`: header build and milestone.
  - Art-side `CURRENT_OPEN_ART_GAPS.md`: snapshot counts ("145 integrated"; Engineering now has 172).

## BLOCKED BY MISSING AUTHORITY

| Item | Blocked on |
|---|---|
| 4 of 5 song loops (OCTOPUS BRAIN, MONTANA, PLAYMAKERS, SHOPPING ADDICT) | `js/systems/radio.js` has `file:null`; no audio exists. Audio is outside Art scope. |
| 239 Rich `[VP]` lines (`node tools/vp-lines.mjs`) | Ube voice pass |
| Non-Rich dialogue is functional draft text | HQ Story |
| Ube-named items: the cat's name (placeholder EGUSI), family names (MOM/DAD/SISTER/BIG BRO/LIL BRO), the Maggi vs Magi label | Ube |
| `brother1`, `brother2`, `god`, `og_hooper` identities | Canon cards. `god` is culturally sensitive and needs named review. Today all four are speaker-only lines with no on-screen actor, so there is no visual surface. |
| CRACK, the Tokyo clout threshold, loss penalties, budget/income rules beyond the Rough Complete defaults | CURRENT_CANON "TBD / DO NOT SILENTLY LOCK" |
| Play Window A (feel batch) / Play Window B | Ube play sessions |
| **VOL 1, VOL 3 and HQ Addendum v1**, cited as authority by `docs/btf/DECISIONS.md` | **SOURCE REQUIRED — NOT RECONSTRUCTED.** They are not in the repository or its history; only VOL 2/VOL 5 OPEN visual extracts are (`art_department/production_authority/`). The full designed scope can't be audited for completeness against them. |

## PLAYER-BLIND / SEALED — DO NOT EXPOSE

- **Sealed hooks:** neutral codes S01–S08, ARC-X, HQ-M01–M03, SPARK, PRESSURE, LEDGER, CUBE, CHEST, DRAGON2, CRYPTRAT, PROPERTY and TENDENCY run as no-ops (`js/systems/sealed.js`). The install slot `js/sealed/pack.js` is still a 3-line stub; its size was checked, its contents were not read. Two provisional tunings stand in until HQ installs a pack. Installing it needs an HQ-authorized sealed session.
- **PLAYER-BLIND content already in runtime:** Ogun's Rave, The Property, World Events proof event #001. The details are intentionally not listed.

## Suggested inputs for HQ's next card (facts, not a plan)

1. Merge and deploy sequencing for this lineage onto `main` (§0).
2. HQ-FAI-01, the only remaining HOLD.
3. Audio loops and the voice pass: the two largest content dependencies outside Art/Engineering.
