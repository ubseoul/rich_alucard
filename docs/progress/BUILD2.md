# BUILD-2 resume log

Base: r3-base / 779a56363a2b5ed01e188025279138d1443293a7.
Branch: build/open-completion-001. Do not move accepted branches or regenerate preserved work.
Status: **VERIFIED under OL-043 / OL-045; publication in progress**. Runtime integration committed at 75d475b02849ffd5875ea0ce884d3cabc0b81f05; final release, browser, statistics, audio and tap proofs pass. Publication advances only build/open-completion-001; the final remote receipt accompanies the user-facing report. Historical steps below are superseded by the current ruling/evidence ledger.

| Step | Status | SHA | Evidence |
|---|---|---|---|
| 0: clone, authority and preservation register | PASS | 779a56363a2b5ed01e188025279138d1443293a7 | docs/PRESERVED_WORK.md; art_department/PRESERVED_ART_HASHES.json |

| 1a: preserved F02 port | PASS; cherry-picked, loader composed | 244de808488298dd127a55595e92289d964874a5 | docs/evidence/build2/port-correspondence.json |
| 1b: preserved F11-A port | PASS; cherry-picked, loader composed | 3036cd66c5135eac379546be9e68ce1a51967772 | docs/evidence/build2/port-correspondence.json |
| 2: gun seams | PASS headless and real Chrome; snapshot, hit counts, mods/condition, ownership/loss, GN consumers | e0c918067d442d80ba1dffebe6baf5dadef8dd06 | tools/tests/build2/guns.test.mjs; docs/evidence/build2/browser-all.json |
| 3: sound audit | PARTIAL; MAGIC_SEANCE missing; 145 IDs without literal consumer proof need routing proof / wiring | d69f7e39b449b2f5c5586eaf7294616d4c680f63 | docs/audio/BUILD2_GAP_TABLE.md; docs/audio/MISSING_SOUNDS.md |
| 4: OL-023 and T10 | OL-023 retained; max two calls repaired; T10 BLOCKED by unauthored BAIT scenario | d69f7e39b449b2f5c5586eaf7294616d4c680f63 | tools/tests/f01/feellock.test.mjs; docs/engineering/BUILD2_JOB_SOURCE_AUDIT.md |
| 5: statistical acceptance | FAIL R1 minimum 3; same on base at seed 54. Bands PASS: 3.825%, 16.2%, 4.225%. Careful 100%; T9 0 repeats | d69f7e39b449b2f5c5586eaf7294616d4c680f63 | docs/evidence/build2/play-validation.json; docs/evidence/build2/r1-base-comparison.json |
| 6: release and browser verification | PASS npm test, leak-check, verify:all; full paths 360/390/430; 17 F02 browser checks; 22 artifact smoke checks | e0c918067d442d80ba1dffebe6baf5dadef8dd06 | docs/evidence/build2/npm-test.log; leak-check.log; verify-all-final.log; verify-all.json; browser-final.log |
| 7: Ube review build | PASS; fixture, purchase/equip, gunfight and audio tour | e0c918067d442d80ba1dffebe6baf5dadef8dd06 | tools/build2/review.html; docs/evidence/build2/review-smoke.json; review-page.png |
| 8: publish review branch | PASS; public remote SHA verified, no accepted branch moved or force push | cc55bc593cc7913b884390c7cabf6343555ba1ed | docs/evidence/build2/push-receipt.json |

Ube clarified: **retain OBA DE GWINNETT**. DEACON in OL-039 is not a rename. All new features remain OFF by default. The built artifact records e0c918067d442d80ba1dffebe6baf5dadef8dd06 in docs/evidence/build2/build.json. Later closeout commits contain evidence and proof tooling; read the final branch tip with git for-each-ref.

Historical closeout note (superseded by OL-043): resolved diagnostics remain git-ignored and are excluded from the public evidence bundle. Current passing evidence is at the main path. R1, BAIT and audio dispositions are in the resume ledger below; authored values were not tuned to erase the base result.

Public export review: the first push was rejected over potentially sensitive diagnostic evidence. The unpublished evidence commit was replaced with a safer payload: diagnostics/failure captures kept local, host paths replaced with placeholders, and only game-fixture screenshots retained. The retry was approved and pushed. Subsequent closeout metadata records that verified publication; the current branch tip may advance beyond the receipt SHA.

Diagnostic correction: an unsupported audio-build --help invocation began regeneration. It was stopped; all affected runtime MP3s and the manifest were restored from the preserved port's Git blobs. No regenerated audio is retained. Re-run `python tools/build2/proof.py` to verify correspondence.

Resume commands: `python tools/build2/extract-sources.py`, `node tools/build2/audio-audit.mjs`, `node tools/run-tests.mjs --fragment build2`, `node tools/build2/browser-path.mjs`, `node tools/build2/validate-play.mjs`, `npm test`, `npm run leak-check`, `npm run verify:all`, `python tools/build2/proof.py`. Chrome runner requires RA_PLAYWRIGHT_PATH and RA_CHROMIUM_PATH (set RA_PLAYWRIGHT_PATH and RA_CHROMIUM_PATH for your host). Do not tune authored values to erase the confirmed R1 base failure.

## OL-043 / OL-045 resume ledger

| Step | Status | SHA | Evidence |
|---|---|---|---|
| OL-043 R1 base parity | PASS; all 100 paired scores identical; 97/100 random >=6; min 3 seed 54 transferred to BUILD-5; careful 100/100, min 7 | 75d475b02849ffd5875ea0ce884d3cabc0b81f05 | docs/evidence/build2/r1-base-comparison.json |
| Source squad corrections | PASS; COLLECT 3->2, EXTRACT 2->3; roles untouched; F04 suites pass; bands before/after identical, 4,000 each | same | play-validation-before-ol043.json; play-validation.json; f04-ol043.log |
| T10 | CLOSED; BAIT adapter INTENTIONALLY KEPT (OL-043); creator content queued for BUILD-5 | same | docs/engineering/BUILD2_JOB_SOURCE_AUDIT.md; docs/D_QUEUE.md |
| OL-045 moves | PASS; 28 real-browser move/gun/mod fixtures, exact purchase/equip/fight path; four fixed slots and source-authored home MOVES receiver; approved FX and art_ship_014 held art consumed | same | docs/evidence/build2/move-census.md; move-census-before.json; move-census-after.json; 28 move-390 PNGs |
| Audio hooks / pick | PASS 145/145 original unproven hooks decode/start; zero remaining unproven; Ube picks GN_01 SMG burst for MAGIC_SEANCE; seven reserved hooks approved for playable tour proof | same | docs/evidence/build2/audio-hook-table.md; audio-proof.json |
| Tap census | PASS fresh shell 532/532, supplemental 121/121, PLAY/raid 67/67: total 720/720 sound starts, zero failures | same | docs/evidence/build2/tap-census.json; tap-supplement.json; tap-paths-all.json |
| Final release | PASS final code-commit run: npm test/release, OPEN source/artifact leak, artifact verification, empty overlay equality and required Chrome smoke; 51/51 full-width integration assertions. | same | docs/evidence/build2/verify-all-final.log; verify-all.json; browser-all.json |

Ube's retained decisions: OBA DE GWINNETT, no rename; GN_01 SMG burst is the MAGIC_SEANCE pick; reserved KBBQ/outdoor-hot-spring hooks may use playable review-tour proof, and future scene wiring is queued. No new art/audio/scenario was authored. Missing dedicated visual assets are BUILD-6 rows; rare-hunter art is BUILD-4. The former R1/T10/audio blockers in the historical ledger no longer apply under OL-043.
