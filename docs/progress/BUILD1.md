# BUILD-1 progress (OL-036 / OL-037) — resume file

Working clone: `C:\Users\Ube\Documents\Codex\2026-09-21\can\work\rich_alucard_build1` (fresh clone of ubseoul/rich_alucard, 2026-10-02). Branch: `integration/r3-base-candidate` (from 2e6a446, fast-forward 8a1dc98, merge `integration/source-vault-v1.1` e76f840).
Private clone: `...\work\rich_alucard_hq_build1`, branch `ingest/build1-sources` @ `d6502cd` (not merged).
Inputs (Ube): ZIP `C:\Users\Ube\Downloads\OVERLORD_PACKAGE_Rich_Alucard.zip`; dancer folder `C:\Users\Ube\Documents\Codex\2026-10-02\build-1-input`. CEO_LOCK_TEXT: not supplied (OL-037: closed, see below).
Environment: Node v20.17.0 (win32), Chromium 1134 via playwright-core, `RA_PLAYWRIGHT_PATH`/`RA_CHROME`/`RA_CHROMIUM_PATH` as in the built-game QA notes.

| Step | Status | SHA / evidence |
|---|---|---|
| 0.1–0.2 refs + register | DONE (82 refs, 0 unclassified) | `docs/PRESERVED_WORK.md` |
| 0.3 preserve tags | DONE, 22 `preserve/*` pushed | `git tag -l 'preserve/*'` |
| 0.4 art hashes | DONE | `art_department/PRESERVED_ART_HASHES.json` |
| 1a CEO lock | CLOSED by OL-037: not written; `ceo-creative-lock-v1` stays `present:false` with the OL-037 note | `source_vault/manifest.json`; `node tools/sources.test.mjs` 6/6 |
| 1b blind sealed copy | DONE (9 files, names+bytes only, nothing read) | private `d6502cd` |
| 1c dancer sources | DONE (19 manifest rows; tiers UNKNOWN by ruling) | `dancer_sources/MANIFEST.md` (private) |
| 1d public leak check | DONE | `npm run leak-check` PASS |
| 2 candidate | DONE | branch above; `vault-v1-accepted` → 0e62107 pushed |
| 3a F07 Phase 1 | DONE | `docs/evidence/build1/fail-before-pass-after.md` |
| 3b F15 OL-031 | DONE (no code change needed; rotation helper removed per OL-037) | same |
| 3c F07-D1..D8 rename | DONE | `docs/engineering/F07_M8_AND_FINALE*.md` |
| 4 validation | DONE (see report) | `docs/evidence/build1/` |
| 5 stage preview | DONE: Ube answered APPROVE | below |
| 6 push | DONE (branch + tags, no force) | see report |

## Evidence index (`docs/evidence/build1/`)
`npm-test-final.log`, `verify-all-final.log`, `ol022-bands.log`, `tuned-sim.log` + `tuned-sim-rerun2.log`, `f13-base.log` / `f13-m10.log` (+ `tools/tests/f13/out/build1_{base,m10}.{json,txt}`), `browser-paths-{360,390,430}.log`, `f07-browser-{360,390,430}.log`, `f15-browser.log`, `playtest-newgame.log`, `playtest-end.log`, `screens/` (per-width screenshots: `<w>_f03_*`, `<w>_newgame_*`, `<w>_flagsoff_*`, `f07-<w>/`, `f15/`), `playtest-newgame/`, `playtest-end/`.

## Stage review (OL-012) — Ube's answer, verbatim
> approve it was the best thing ever

(Ube, 2026-10-02, after the 10-minute stage preview of the three-dancer club. Recorded verbatim.)
