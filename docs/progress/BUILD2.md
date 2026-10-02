# BUILD-2 resume log

Base: r3-base / 779a56363a2b5ed01e188025279138d1443293a7.
Branch: build/open-completion-001. Do not move accepted branches or regenerate preserved work.
Status: **STOPPED WITH ACCEPTANCE BLOCKERS**, as permitted by OL-039. Functional release gates pass; this is a review candidate.

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

Ube clarified: **retain OBA DE GWINNETT**. DEACON in OL-039 is not a rename. All new features remain OFF by default. The built artifact records e0c918067d442d80ba1dffebe6baf5dadef8dd06 in docs/evidence/build2/build.json. Later closeout commits contain evidence and proof tooling; read the final branch tip with git for-each-ref.

Resolved diagnostic failures are retained locally under the git-ignored docs/evidence/build2/diagnostic path and in the local evidence bundle. Current passing logs are at the main evidence path. Next: R1 authority/source resolution, authored BAIT scenario content, and audio event wiring/dynamic-routing proof. Do not treat sound registration as playback or tune authored values to erase the base failure.

Diagnostic correction: an unsupported audio-build --help invocation began regeneration. It was stopped; all affected runtime MP3s and the manifest were restored from the preserved port's Git blobs. No regenerated audio is retained. Re-run `python tools/build2/proof.py` to verify correspondence.

Resume commands: `python tools/build2/extract-sources.py`, `node tools/build2/audio-audit.mjs`, `node tools/run-tests.mjs --fragment build2`, `node tools/build2/browser-path.mjs`, `node tools/build2/validate-play.mjs`, `npm test`, `npm run leak-check`, `npm run verify:all`, `python tools/build2/proof.py`. Chrome runner requires RA_PLAYWRIGHT_PATH and RA_CHROMIUM_PATH (see final report for this host's exact paths). Do not tune authored values to erase the confirmed R1 base failure.
