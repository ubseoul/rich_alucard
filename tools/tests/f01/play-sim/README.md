# THE PLAY sim + sandbox tooling

**Current (OL-016 build):** the sim and the browser sandbox share one engine — `js/frag/F01/play/{engine,world,content,lines}.mjs`.

    node tools/tests/f01/play-sim/run_tuned.mjs        # tuned sim: 800 PLAYs + 40×24-night careers ×4 policies + R1 ablations (~3.5 min, deterministic)
    node tools/tests/f01/play-sim/bot_gate.mjs --plays 15 --widths 360,390,430 [--policy careful|random] [--hold 1] [--trim 7] [--shots DIR]
                                                        # Playwright drives the real page; exit 0 = pass (needs playwright + chromium; RA_PLAYWRIGHT_PATH / RA_CHROME override)
    node tools/tests/f01/play-sim/serve-play.mjs                          # serve the sandbox at http://localhost:8123/assets/f01/play/index.html

Files: `driver.mjs` (sim driver: answers the engine's prompts with the four policies) · `policy.mjs` · `campaign.mjs` (careers on the world layer) · `metrics.mjs` (T1–T13, R1, skill gap) · `globals.mjs`/`load.mjs` (publish the preserved F01 `rng.js`+`data.js` globals in node) · `sim_v1.mjs`/`content_v1.mjs` (the approved fb3ff8a engine, kept for the regression) · `regress*.mjs` (800-PLAY old↔new regression: 0 mismatches at the port commit, i.e. before the OL-016 changes; **expected to differ now** — the tuned engine diverges on purpose). Results: `out/tuned/` (`tuned_summary.json`, `run_tuned.log`), `out/bot/` (bot-gate JSON). Write-up: `docs/engineering/F01_THE_PLAY_TUNED_SIM.md`, `F01_THE_PLAY_FEEL_GATE.md`.

---

## Historical: the OL-014 / OL-015 paper-sim (fb3ff8a)

Design evidence for `docs/engineering/F01_THE_PLAY_SPEC.md`. **Not** a game and not the browser sandbox; no UI, no grid, no LOS/pathing/cover, no hit-% display, no difficulty selector.

    node tools/tests/f01/play-sim/run.mjs           # full: 800 PLAYs + ablations + car/seat tests + BEEF campaigns + pitch audit (~6 min)
    node tools/tests/f01/play-sim/run.mjs --quick   # 20 seeds for ablations, 8 careers per arm (~2 min)

Files: `load.mjs` (loads the preserved F01 `rng.js` + `data.js` in a vm) · `content.mjs` (drafted placeholder content: jobs, cards, cars, WEIRD/LEGENDARY, pitch voices — H1 drafts for Underlord review) · `policy.mjs` (careful / greedy / naive / random) · `sim.mjs` (the PLAY engine, one seeded stream per decision, call-divergence forks on common random numbers) · `campaign.mjs` (nightly board, morning-after carry-over, BEEF, careers) · `story.mjs` (transcripts, prose) · `run.mjs` (matrix, metrics, invariants, ablations, outputs).

Outputs (`out/`): `summary.json`, `plays.csv` (one row per PLAY), `digest.txt` (10 best / 10 worst / 10 random / 5 transcripts + all metrics), `transcripts.txt`. Deterministic: same code → same bytes. Every number is a structural default, PROVISIONAL, owner F13.
