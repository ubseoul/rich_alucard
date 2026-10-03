# FINAL-A STAGE 6 · developer surface gate

Authority: BLOOD MIRROR master §5, explicit `dev=1` only. Real Chrome checks pass in 30 recorded frames with zero runtime errors or failed requests. The ordinary game is exercised through the actual fresh-save START button and its authored A00 prologue; the harness does not seed or skip that route.

| Route / input | Widths | Result |
|---|---|---|
| Normal game before and after START | 360 / 390 / 430 | Developer panel, geometry overlay, controls and developer APIs absent |
| Normal game, F2 twice after START | 360 / 390 / 430 | Still absent; no placeholder fixture registered or mounted |
| Explicit `?dev=1` before and after START | 360 / 390 / 430 | Panel, BTF controls, test pilot and fixture APIs present |
| Explicit `?dev=1`, F2 twice | 360 / 390 / 430 | Authorized panel hides, then returns with controls intact |
| `?dev=0` / `?dev=01`, F2 | 390 | Developer surface absent |
| Normal minigame lab URL | 390 | Returns to ordinary game; no lab API or menu |
| Minigame lab with `?dev=1` | 390 | Lab API and registered game menu available |
| Existing party/rave review URLs without query | 390 | Entry disabled under their existing blocked-page contract |

The guarded modules return before installing developer APIs or keyboard handlers. Normal load removes the static developer panel and geometry canvas. The Director also requires the query before adopting or drawing its overlay: otherwise its scene-exit restoration could reinsert a canvas already removed by the normal-load cleanup. Minigame lab routing and initialization use the same exact query predicate. No scene floor, actor scale, gameplay rule, F01/F06 timing or input flow changes in this gate.

The focused automated regression also passes normal, `dev=0`, `dev=01`, `dev=true`, duplicate `dev=0&dev=1`, and a simulated stale `dev-enabled` class. Only explicit `dev=1` installs `RADev`, `RATestPilotInstall` and `RAPresentationFixtures`, and registers F2. The test is auto-discovered by the full fragment suite.

Representative evidence: [normal START](390-normal-start.png), [normal after START](390-normal-started.png), [normal after F2](390-normal-f2.png), [normal repeated F2](390-normal-f2-again.png), [authorized DEV](390-dev-started.png), [DEV hidden by F2](390-dev-f2.png), [DEV restored](390-dev-f2-again.png), [normal lab return](390-lab-normal-returns-to-game.png), [authorized lab](390-lab-dev.png). Full assertions and frame index: [metrics.json](metrics.json).

Reproduce with `node tools/final_a/release-surface-browser.mjs` using `RA_PLAYWRIGHT_PATH` and `RA_CHROMIUM_PATH`. Run `node tools/run-tests.mjs --fragment final_a` for the automated module regression alongside the other FINAL-A suites. Root owns final full release verification.
