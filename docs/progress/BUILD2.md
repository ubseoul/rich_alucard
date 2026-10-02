# BUILD-2 resume log

Base: r3-base / 779a56363a2b5ed01e188025279138d1443293a7.
Branch: build/open-completion-001. Do not move accepted branches or regenerate preserved work.

| Step | Status | SHA | Evidence |
|---|---|---|---|
| 0: clone, authority and preservation register | PASS | 779a56363a2b5ed01e188025279138d1443293a7 | docs/PRESERVED_WORK.md; art_department/PRESERVED_ART_HASHES.json |

| 1: preserved ports | PASS; F02/F11 original commits cherry-picked, loader conflicts regenerated | 244de80 / 3036cd6 | docs/engineering/F02_IRON_AND_GRACE.md; docs/engineering/F11_AUDIO_COMPLETION_001.md |
| 2: gun seams | PASS headless; iframe snapshot, authored hit counts, mods/condition, ownership/loss and real audio consumers | 3036cd6 + integration working tree | tools/tests/build2/guns.test.mjs; docs/evidence/build2/browser-validated.log |
User clarified: retain OBA DE GWINNETT; DEACON in OL-039 is not a rename.
| 3: sound audit | PARTIAL; preserved delivery reused; MAGIC_SEANCE missing; 145 literal-reference hook gaps need routing proof / wiring | 3036cd6 + integration working tree | docs/audio/BUILD2_GAP_TABLE.md; docs/audio/MISSING_SOUNDS.md |
| 4: OL-023 and T10 | OL-023 retained; max two calls repaired; T10 BLOCKED by unauthored BAIT scenario, existing source discrepancies retained | 3036cd6 + integration working tree | tools/tests/f01/feellock.test.mjs; docs/engineering/BUILD2_JOB_SOURCE_AUDIT.md |
| 5: statistical acceptance | FAIL R1 worst career 3; identical failure on untouched r3-base (seed 54). Bands and T9 PASS; careful 100% | 3036cd6 + integration working tree | docs/evidence/build2/play-validation.json; docs/evidence/build2/r1-base-comparison.json |
| 6: release and browser verification | IN PROGRESS; final full gate rerunning after adapting old F02/F05/F14 pending-audio assertions | 3036cd6 + integration working tree | docs/evidence/build2/verify-all.log; docs/evidence/build2/browser-validated.log |

Diagnostic correction: an unsupported audio-build --help invocation began regeneration. It was stopped; all affected runtime MP3s and the manifest were restored from the preserved port's Git blobs. No regenerated audio is retained. Re-run `python tools/build2/proof.py` to verify correspondence.

Resume commands: `python tools/build2/extract-sources.py`, `node tools/build2/audio-audit.mjs`, `node tools/run-tests.mjs --fragment build2`, `node tools/build2/browser-path.mjs`, `node tools/build2/validate-play.mjs`, `npm test`, `npm run leak-check`, `npm run verify:all`, `python tools/build2/proof.py`. Chrome runner requires RA_PLAYWRIGHT_PATH and RA_CHROMIUM_PATH (see final report for this host's exact paths). Do not tune authored values to erase the confirmed R1 base failure.
