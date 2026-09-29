# THE PLAY paper-sim (OL-014 / OL-015)

Design evidence for `docs/engineering/F01_THE_PLAY_SPEC.md`. **Not** a game and not the browser sandbox; no UI, no grid, no LOS/pathing/cover, no hit-% display, no difficulty selector.

    node tools/tests/f01/play-sim/run.mjs           # full: 800 PLAYs + ablations + car/seat tests + BEEF campaigns + pitch audit (~6 min)
    node tools/tests/f01/play-sim/run.mjs --quick   # 20 seeds for ablations, 8 careers per arm (~2 min)

Files: `load.mjs` (loads the preserved F01 `rng.js` + `data.js` in a vm) · `content.mjs` (drafted placeholder content: jobs, cards, cars, WEIRD/LEGENDARY, pitch voices — H1 drafts for Underlord review) · `policy.mjs` (careful / greedy / naive / random) · `sim.mjs` (the PLAY engine, one seeded stream per decision, call-divergence forks on common random numbers) · `campaign.mjs` (nightly board, morning-after carry-over, BEEF, careers) · `story.mjs` (transcripts, prose) · `run.mjs` (matrix, metrics, invariants, ablations, outputs).

Outputs (`out/`): `summary.json`, `plays.csv` (one row per PLAY), `digest.txt` (10 best / 10 worst / 10 random / 5 transcripts + all metrics), `transcripts.txt`. Deterministic: same code → same bytes. Every number is a structural default, PROVISIONAL, owner F13.
