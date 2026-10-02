# F15 VELVET ROTATION — launch trio & romance implementation (CANDIDATE FOR UNDERLORD REVIEW)

Status: **CANDIDATE — NOT FROZEN, NOT MERGED, DARK BEHIND `F15.velvet_rotation`.** Branch `feat/f15-romance-trio-001`, based on runtime `4800055a96cf9ce06434c3451d5a4f61c6ec195d`.

## What it is

The club shows **Roxy, Rosalyn and Emerald** (adults, 21+) on the real F06 MAKE IT RAIN stage every WAKE. The player picks whom to support; every dollar
thrown at her counts toward **her** cumulative total (floor/missed bills included). Totals unlock four sequential romance scenes per dancer (L1–L4,
twelve in all), at most **one date per WAKE across all three**. No club income, no refunds, no favor currency, no relationship-ladder mapping or regression.

## Provenance (every input, exact)

| Input | Ref |
|---|---|
| Runtime base | `4800055a96cf9ce06434c3451d5a4f61c6ec195d` |
| Windows test fix (bounded, test-only, 2 files) | `origin/claude/f03-ownership-path-portability` `009036220b96ae905b329981dcdc6ae8190958cf`, cherry-picked here as `98a51a8db3de1fdb937fe7ead9cb18befd379a4b` |
| Frozen dance masters | `7b034a92f602db70a044466188dcec983bab0ec9` `art_department/production/f15-launch-trio-masters/` (read with `git archive`; not merged; masters not copied into the repo) |
| Accepted stage preview (Layout A) | `74fdd5ac3ee90b410be82ef80f785888ad8aba2f` `tools/f15-stage-preview/` (math + derivative builder ported, not merged) |
| Source vault | `e76f8400271d5f538edc17b5ba6dfb682123a957` (`UNDERLORD_Character_Relationship_Packet_v0_2.docx`, `F15_RECONCILIATION_ITEMS.md`, `Rich_Alucard_Patch_RAINMAKER_…docx`; no SEALED material opened) |
| Approved creative script | `F15_ROMANCE_TWELVE_SCENE_DRAFT_v3.md`, SHA-256 `91e28703e5a37cff71f94d01edb6a2479df08a4a61e3f280cdc6039542040e07`, supplied as a chat attachment (readable, 1,227 lines). **Approved in full by Ube** in the implementation authorization (including "i liked it when you talked that much", the Rosalyn/Emerald kisses, Roxy's rain check and Roxy's unsent repayment). The script was **not** published on Git before this candidate. `tools/tests/f15/rich_lines_v3.json` carries the 29 Rich lines extracted from it, with its hash. |

## What changed (files)

F15-owned (new): `js/frag/F15/{migrations,tunables,core,club,dates,roxy,rosalyn,emerald}.js` + `manifest.json`; `assets/f15/dancers/*` (3 sprite sheets + manifest, 6.4 MiB), `assets/f15/portraits/*` (3 scene portraits); `tools/f15/build_derivatives.py`; `tools/tests/f15/*`; this doc and `F15_VISUAL_GAPS.md`.

**Outside the F15 surface — integration-owner acknowledgment needed** (smallest possible each):

| File | Change |
|---|---|
| `js/frag/F06/make_it_rain.js` | adapter seam: `options.hideTarget` skips the placeholder mannequin; read-only `geometry()`. Core and tunables **untouched** (byte-guarded by `f06/source.test.mjs`). |
| `js/frag/F06/production.js` | seam: `onSpend` after the real once-only payment; the launcher opens the F15 stage when the flag is ON. Flag OFF = byte-identical behaviour. |
| `js/data/btf/environments.js` | add-only `RAEnvironments.register()` (F15 registers its placeholder rooms only while ON). |
| `js/loader/manifest.json`, `index.html` | `F15` added to the fragment list; `index.html` regenerated with `npm run loader:sync` (owner-only). |
| `tools/if1/owner-surfaces.json` | `F15` added to `fragmentIds`. |
| `tools/tests/if1/convergence.test.mjs` | the fragment-folder guard now lists `F15`. |
| `tools/f15/build_derivatives.py` | new, outside the fragment patterns (it must not ship in `assets/`). |

No flag was promoted (`js/if1/flag_defaults.js` untouched), no schema version assigned (additive lazy `save.frag.F15`), `main` untouched.

## How the pieces work

* **Club (F06 seam).** The real procedural F06 renderer draws the club. The mannequin is suppressed; the three dancers are drawn on an overlay canvas at device resolution using accepted **Layout A** (same math/anchors as the preview: refScale 0.28 @ 370 px, feet on the deck line, HUD headroom cap 6 px). Animation: the 3:1 sprite sheets exactly as accepted (every frame, WOLF's A A B B pairs, 24 fps, no retiming/alpha edits). `tools/f15/build_derivatives.py` rebuilds the sheets **byte-identically** from the frozen masters (hash-verified against `animation.json`; the three sheet SHA-256 equal the preview's).
* **Targeting.** F06's own `target` tunable block is set so the approved formula lands on the supported dancer's slot (amplitude = slot − 0.5, period effectively infinite). F06's hit test, spotlight pool and HIT/MISS therefore apply to **her**. The F06 core resolves a throw (target included) at release and the feedback animation already carries it: a selection change only affects the next throw.
* **Money.** F06 pays each throw once (`rainmaker:flick`); F15 then attributes that exact amount to the recipient read at that instant. Insufficient funds / duplicate feedback attribute nothing. Per-dancer totals live in `save.frag.F15.dancers` — never a score or wardrobe tier.
* **Progression.** `availableLevel` = next unplayed scene **if** its threshold is met. Completion is read from the engine's adventure records (so reload cannot duplicate or reset it). The date cap is derived the same way (`completedDay`): one completed F15 scene per WAKE, across all routes. A declined date leaves no trace.
* **Delivery.** Existing conventions: a phone text + WHAT WE ON line through the temptation engine (`f15:<scene>`; a notice only — it carries no dialogue; a WAKE subscriber at priority 67 re-offers) and a GO button in the club.
* **Scenes.** Ordinary adventures (`F15_<NAME>_L<n>`), existing node grammar, existing Combat 2.0 (`f15_roxy_spar`, `f15_uncle_bunmi` via narrow enemy cards; no new engine).

## Decisions still open for Ube / the Underlord

1. **Identity mapping — UNPROVEN.** No metadata binds `wolf/dragon/pink` to Roxy/Rosalyn/Emerald. Default (one config, `RAF15Tunables.IDENTITY`): **Roxy = wolf, Rosalyn = pink, Emerald = dragon**, from the Roxy foundation card (a wolf) and the F15 audit (Emerald a green dragon); Rosalyn by elimination. The club shows a collapsible **IDENTITY CHECK — UBE TO CONFIRM** panel (and a name tag under every dancer) so it can be judged and corrected on sight; a correction persists in `save.frag.F15.mapping` and never touches progress (keyed by name).
2. **Thresholds — IMPLEMENTATION TUNING — PENDING REVIEW** (`RAF15Tunables.THRESHOLDS`, not canon): **$10,000 / $35,000 / $80,000 / $150,000** cumulative per dancer. Basis: F13's economy (rounds of $5K/$10K/$25K; "normal" rains $5K ≈ weekly, "spender" $25K daily). Rounds needed (at $5K / $10K / $25K): T1 2/1/1, T2 7/4/2, T3 16/8/4, T4 30/15/6. One focused session reaches T1; T4 is a late-game commitment, never a grind wall. F15 pays nothing back, so the locked economy is unchanged.
3. **Combat numbers — IMPLEMENTATION TUNING — PENDING REVIEW** (`COMBAT`): spar HP 60 (jab 6, cross 9), cockroach HP 90 (scuttle 7, stare 5, flies 12); no defeat penalty; every fight result continues the same scene (results are not authored).
4. **Scene money amounts the script leaves open** (`MONEY`): Rosalyn L1 — Rich's half is **$106** (the game's money is whole dollars; $106.23 rounded down), debited once through the ledger, and the date is only offered when Rich has it; Roxy L4 curry — **$0** (no amount is authored); Emerald L1's $40 is narration (no credit: that would be new income); Rosalyn L2's boba is not charged.
5. **Optional narration kept** (Emerald L4: Rich's hand drifts toward his pocket, then he claps) — script marks it "yours to keep or cut"; it contains no Rich speech.
6. Visual gaps — see `F15_VISUAL_GAPS.md`.

## Script conversions (reported changes)

* All 15 unfilled optional Rich blanks cut (Roxy L3 ×2, L4 ×2; Rosalyn L1 ×2, L4 ×4; Emerald L1 ×2, L2 ×1, L3 ×1, L4 ×1). No adjacent non-Rich line was reworded. Two blanks that were combat-menu options became neutral **option labels** from the draft's own descriptions ("TRY TO TALK IT DOWN", "OFFER IT A JOB"); the roast option's label is Ube's line.
* Stage directions that carry a beat became one-line narration: *(quietly)*, *(whispering)*, *(no blink)*, *(long stare)*, *(startled laugh)*, *(fast, breathless)*, "[address]" → "She sends an address.", "Then, immediately:" kept as narration. Italic emphasis markers removed (plain text).
* Telegraphs / Octopus reactions are Rosalyn's approved lines shown in the combat log (upper-cased like every combat string).
* Ube's lines are marked `canon` (not `[VP]`): no new voice-pass lines. The authored thought "...something felt off." is Rich's exact Packet line.
* Roxy's protected quote appears once (L3, spoken by Roxy). The hit comes from an unnamed, never-shown fighter; Rich is at ringside.
* Recital song: referenced by title only; no lyrics, no audio.

## Validation

`tools/tests/f15/core.test.mjs`, `club.test.mjs` (in `npm test`), and `tools/tests/f15/browser-check.mjs` (real Chromium; see the receipt for results and limits). Browser run:

```
RA_PLAYWRIGHT_PATH=<playwright-core dir> RA_CHROMIUM_PATH=<chrome.exe> node tools/tests/f15/browser-check.mjs --shots <dir>
```

## WOLF replacement (STOVE N v2) — creator-approved after the first candidate commit

Ube approved the **STOVE N v2** WOLF (thin black outline, 4-px grid, cleaned transparency gaps) in chat; the package metadata itself still reads
"CANDIDATE — PENDING UBE REVIEW", so that approval is recorded here, not in the package. Replaces **only** the WOLF animation: character design, the
other dancers, mapping, progression and dialogue are unchanged. (An earlier attachment, the FROZEN zip, held the *old* WOLF — identical sequence hash — and was not used.)

* Package: `CANDIDATE_PENDING_UBE_REVIEW_v2_outline_4px_LAUNCH_PACKAGE.zip`, SHA-256 `2bcd3ffebac332ff9ed4f22e72f4eb7c6b71d49fb71c2b527568b6aa861a792c`. Verified: its own `verify_package.py` PASS (all files, both sequences, order, rational timing); manifest sequence hash `67572b524a4f07d680659dcde2cd14b363930ed87cc9d187c8bddd853c0dc9f7` recomputed by the builder; **145 frames, 24 fps, 6.0417 s** (old: 146 frames, 6.0833 s); **0 of its frames are byte-identical to the old WOLF**; source video SHA-256 `6beff2bb…92c4f3d`.
* Transform (fixed for the whole sequence, built by `tools/f15/build_derivatives.py --wolf-v2 <package dir>`): crop = occupied union (x 96–592, y 48–633) grown to the art's 4-px grid; **exact 4:1** area downsample (the art is on a 4-px grid, so the old 3:1 would alias it); anchor x = union centre (344, same as the other dancers); feet = union bottom; `scale_mul` 600/585 so the apparent height equals the previous WOLF's under Layout A. No frame duplication assumed (the old A A B B pairs do not apply), no retiming, no alpha edit, no clip repair. Sheet 1488×1911, cell 124×147.
* Recoverable: the previous WOLF sheet stays byte-identical as `assets/f15/dancers/wolf_prev.png` (and `portraits/wolf_prev.png`); set `RAF15Tunables.WOLF_SHEET='wolf_prev'` to switch back. Originals untouched.
* Payload vs memory (active set, WOLF v2 + DRAGON + PINK): **6,908,644 B download (6.6 MiB)**, **42,761,232 B decoded (40.8 MiB)** (v2 WOLF alone: 2,228,791 B / 11,374,272 B; the old set was 6,707,435 B / 50,730,960 B). `wolf_prev.png` (2,027,582 B) ships but is only fetched if selected.
* Checks: playback advances (145-frame loop), all 145 cells non-empty with partial alpha preserved; 40 of 145 frames touch the cell edge — this is the package's own source-canvas contact (its audit reports `added_master_clipping:false`) and is **inherited, not repaired**; no pixel lies outside the crop (asserted). Real-browser at 360/390/430: all dancers inside the stage, feet on the shared line, headroom ≥ 6 px (WOLF unchanged: 6.0 px at 360, 6.0 at 390, 27.8 at 430), UI clear; 58/58 widths+throws and 56/56 scenes checks. Screenshots: `club_*_start.png`, `club_390_hit_roxy.png` (WOLF v2 visible). The package's own audit lists 7 pale-sample losses and "unresolved visual defects" — carried as is.
