# BUILD-2 T10 source audit

Authority: `source_vault/open_design/Rich_Alucard_BTF_Vol7_PLAYMAKERS_Blood_X_Operations.docx`, §3.2. No new scenario, dialogue, loot table, enemy layout or balance value was authored by BUILD-2.

| Authored job | Squad | Reward | HEAT |
|---|---|---|---|
| DROP | 2 | $8K–25K | +4 |
| RE-UP | 2 | Supply, 3–6 | +3 |
| COLLECT | 2 | $10K–40K | +5 |
| PROTECT | 3 | $15K + rep | +2 |
| TAKE THE BLOCK | 3–4 | Control + $$ | +12 |
| EXTRACT | 3–4 | Person | +10 |
| BAIT | 2 | Pressure −2 | +6 |
| LAY LOW | 0 | HEAT −15; cash −$10K | −15 |

The accepted F04 job table declares all eight types. F01 has ten accepted job specifications plus dynamic EXTRACT; LAY LOW resolves in F04. **T10 closes under OL-043.** BAIT's accepted provisional `quiet_lift` adapter is **INTENTIONALLY KEPT (OL-043)**. Its authored scenario and non-Rich pitch/call lines remain a creator item in `docs/D_QUEUE.md` for BUILD-5. BUILD-2 authors no scenario, cash band, enemy pods, loot or dialogue.

OL-043 / SR-11 corrects two source discrepancies: F04 COLLECT `squadSize` 3 -> 2; EXTRACT 2 -> 3, using the lower end of the authored 3-4 range as TAKE THE BLOCK already does. Role lists are unchanged; all three F04 suites pass without changing them.

Before/after OL-022, 4,000 PLAYs per band: routine 153/4,000 (3.825%) -> same, BIG 648/4,000 (16.2%) -> same, HOLD 169/4,000 (4.225%) -> same. F01 owns the actual crew-shape contract; the source correction is F04 job-card metadata and does not tune the locked simulation.

R1 compares the branch against untouched r3-base on seeds 1-100: every score is identical, zero regressions. Both yield 97/100 random careers >=6/9 and min 3 at seed 54. OL-043 transfers that base balance target to BUILD-5; OL-020 bounds are unchanged. Careful careers are 100/100 >=6/9, min 7. Evidence: `docs/evidence/build2/play-validation-before-ol043.json`, `play-validation.json`, `r1-base-comparison.json`, `f04-ol043.log`.
