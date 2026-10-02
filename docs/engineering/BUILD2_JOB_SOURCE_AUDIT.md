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

The accepted F04 job table already declares all eight types. F01 has ten accepted job specifications plus dynamic EXTRACT; LAY LOW resolves in F04. F04's BAIT-to-`quiet_lift` adapter is explicitly provisional. The source supplies BAIT's squad, pressure and heat values, but does not supply a PLAY scenario, cash band, enemy pods, loot or pitch/call dialogue. Creating those would exceed the wiring-only instruction. T10 expansion is therefore **BLOCKED pending authored scenario content**; the ten accepted specs remain intact.

Source discrepancies retained for authority review: accepted F04 COLLECT uses a squad of 3 instead of source 2; accepted EXTRACT uses 2 instead of source 3–4. No authored number was edited to reconcile these. See `docs/evidence/build2/authored-numbers-vs-r3-base.diff`.

Existing verification: `tools/tests/f04/war_room.test.mjs`, `tools/tests/f04/play_roundtrip.test.mjs`, and F01 `packets.test.mjs`, `adapter.test.mjs` (actual names are enumerated by `node tools/run-tests.mjs --list`). These prove existing declarations and adapters, not completion of the missing authored BAIT scenario.
