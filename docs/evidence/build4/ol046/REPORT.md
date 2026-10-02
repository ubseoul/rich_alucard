# BUILD-4 REPORT · OL-046 · build/visual-completion-001

Failures / blockers: no unresolved validation failures. BUILD-4 remains at the drop gate: 68 art requirement rows, no drops ingested. The rebased branch is local; publication over the previous remote head needs an explicit exception to the earlier OL-039 “Never … force-push” instruction. No force-push has been attempted.

LOCAL_BROWSER_REQUIRED: none; real Chrome ran locally.

## Rebase and preservation

Accepted annotated tag `build2-accepted` resolves to `40fd2bc02e4793380fbf9f6cb04c95113a46db11` and is an ancestor of the rebased BUILD-4 branch. Original pushed head `807523cb369776540bc573dd53a9fc753d2f30de` retained in a local safety branch. Both BUILD-4 commits were replayed. The only conflict was index.html's art-part loader; both `F02_combat_fx.js` and `F12_preserved.js` were retained in generated sorted order. Audio parts remain additive and unchanged from BUILD-2.

342 accepted runtime/audio files match the accepted tag's committed bytes, including F02 gun consumers, F06 and the PLAY bridge. Existing text-only checkout newline differences are separately recorded in the proof; no functional F06 change. All 1,335 preserved source copies and 960 frozen assets pass the authoritative audit. Zero frozen assets altered. [Rebase and source proof](rebase-and-gun-proof.json).

## Art scope

Eight held-gun rows added: MAC & CHEESE; THE TOMMY TONY; JOLLOF BURNER; BLUEBERRY BLASTER; LEGENDARY DRACO; THE GOLDEN DRACO; AUNTIE'S SLIPPER; TRIPLE K-KRATOS.

[IMAGE_PROMPTS_P-D.md](../../../../art_department/briefs/IMAGE_PROMPTS_P-D.md) now has 48 numbered prompts: original six sub-batches plus GUNS, eight prompts numbered 41–48. Every gun uses exact frozen Package E `E-gun-*-held.png` references and authored IRON & GRACE names/descriptions only. Targets use 64×32 transparent RGBA, binary alpha, isolated weapon-only held convention. No character, hands, case or new story. GOLDEN DRACO also uses the existing Gbenga weapon state as its identity reference. TRIPLE K-KRATOS remains DEV-only; no runtime/acquisition/tuning gate changes.

ONE-INCH PETTY, HEX, VIOLET VEIL, SÉANCE and DEAD RINGER FX belong to BUILD-6. They have no BUILD-4 generation/ingest request. Accepted BUILD-2 presentation/audio is retained.

| Package | Pending rows | Ube drop |
|---|---:|---|
| P-A | 0 | None |
| P-B | 0 | None |
| P-C | 18 | Six pose sheets + twelve Ube-pipeline videos |
| P-D | 50 | 48 image targets; two additional Codex reuse-wiring rows |

Pending 60 → 68 after OL-046. Earlier OL-042 closures and DEV exclusion remain. Return named PNG/MP4 files only; Codex owns manifests, normalization, hashes, freeze and contact sheets. [P-C_STEPS.md](../../../../art_department/briefs/P-C_STEPS.md) remains authoritative for stills/videos. F15 per-dance wardrobe rules and required behavior tests are queued for ingest; F06 untouched. Recheck accepted-tag ancestry before final ingest and repeat validation if the base changes.

## Validation after rebase

| Check | Result |
|---|---|
| npm test | PASS · [log](npm-test.log) |
| Release build and artifact | PASS · [build](build.log), [artifact](verify-artifact.log) |
| Loader | PASS, 222 scripts · [log](loader.log) |
| Supplemental art registry | PASS · [log](registry.log) |
| Art/presentation checks | PASS, 960 frozen; 267 screen PASS / 15 pending HOLD; Director lock retained · [presentation](presentation.log), [matrix](art-matrix.log) |
| Leak check | PASS · [log](leak-check.log) |
| Preserved/frozen audit | PASS, 1,335 copies, 960 frozen, zero changes · [log](hash-verification.log) |
| Raw staged bytes | PASS · [result](staged-byte-verification.json) |
| F15 real Chrome | PASS, 519/519 · [log](f15-browser-recheck.log) |
| F07 real Chrome 360/390/430 | PASS, 77 each · [360](f07-360.log), [390](f07-390.log), [430](f07-430.log) |
| Existing cast 360/390/430 | PASS, 135 checks · [log](character-widths.log) |
| F02 browser lit/dark | PASS, 17 checks · [log](f02-browser.log) |
| BUILD-2 browser gun/PLAY/TRAP/audio 360/390/430 | PASS, 51 checks; 67/67 taps with sound · [log](build2-browser.log) |
| Accepted move/gun/mod census | PASS, 28 cases, no page errors · [log](build2-move-census.log) |
| New art ingest / wardrobe behavior / empty production log | PENDING approved drops and step 5 |

Initial F15 concurrent sweep failed one spotlight-sensitive aimed throw (35/36 checks before stopping). A full rerun with the other width sweeps finished passed 519/519, including that throw. No F06 edits were made. Initial failure log retained as diagnostic history, not an outstanding failure.

No held-gun assets have been generated or frozen. Existing references are copied byte-identically into this handoff. [GUNS reference sheet](GUNS-reference-sheet.png); [P-D current baseline plus GUNS](P-D-current-state.png).
