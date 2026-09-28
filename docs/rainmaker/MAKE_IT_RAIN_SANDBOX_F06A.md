# MAKE IT RAIN — Sandbox (F06-A)

Fragment: `UBE_PORTAL_FRAGMENT_RAINMAKER_MAKE_IT_RAIN_SANDBOX`
Authority: OL-011, PARALLEL_SAFE Wave 0 (isolated before IF-1)
Base: `b8ab4fecd75d8c33a0fc52fece7f8d34fb628010` (`origin/main`, per Underlord override)
Branch: `frag/rainmaker/make-it-rain-sandbox-001`

This is an isolated grey-box prototype of the authored **STACK + TARGET + BEAT** loop.
It is **not** the full RAINMAKER build. It contains no dancers, no club systems, no economy,
no progression, no phone app, and no WAKE hooks.

## Run it

From this worktree:

```
node tools/minigames/make-it-rain-test.mjs      # core tests (standalone runner)
npm test                                        # project gate (also syntax-checks this fragment)
```

Play / review (any static server rooted at the worktree):

```
node C:\Users\Ube\AppData\Local\Temp\opencode\mir-server.mjs
# open http://127.0.0.1:8791/make_it_rain_sandbox.html
# responsive review:  http://127.0.0.1:8791/make_it_rain_review.html
```

You can also just open `make_it_rain_sandbox.html` in a browser that allows local file scripts.

## How to play

1. Press and **drag up along the cash roll** at the bottom — a bill fan loads (1–20 bills; longer drag loads more).
2. **Flick upward and release** to throw the loaded bills at the silhouette.
3. **ON BEAT** (release inside the pulse window) → ×1.5 HYPE.
4. **SPOTLIGHT** (target ring lit + aim on target) → ×2 HYPE.
5. **FAN** (10+ bills with a long, smooth drag) → wider fan, CROWD bonus.
6. **STREAK** (consecutive good flicks) → up to ×5.
7. Flicking while the spotlight is **off**, or missing, wastes that money on the floor.
8. 30 seconds, then a result: money spent, hype, waste, best streak, **RAIN SCORE** (hype per dollar).

Budget presets `$5K / $10K / $25K` and `RESTART` sit below the stage. Development controls are in a
separate dashed panel and are not part of the mechanic.

## Files

| File | Role |
| --- | --- |
| `js/systems/rainmaker/make_it_rain_tunables.js` | **single source of tuning** (all discretionary values) |
| `js/systems/rainmaker/make_it_rain_core.js` | reusable deterministic core (no DOM, no randomness unless jitter > 0) |
| `js/minigames/make_it_rain.js` | disposable sandbox adapter (canvas render + pointer input + round lifecycle) |
| `make_it_rain_sandbox.html` | standalone sandbox page |
| `make_it_rain_sandbox.css` | sandbox-only styles |
| `make_it_rain_review.html` | responsive review harness (360 / 390 / 430 iframes) |
| `tools/minigames/make-it-rain-test.mjs` | core tests (auto-discovered by newer `tools/release.mjs`) |

## Integration boundary (for the full RAINMAKER build)

Keep the core, replace the adapter:

- **CORE** — `RAMakeItRainCore.MakeItRain`: pure state machine. `beginDrag / dragTo / cancelDrag / release /
  advance / state / summary`. No DOM, no rendering, deterministic. Embed this in the real RAINMAKER scene.
- **ADAPTER** — `RAMakeItRainSandbox`: sandbox-only canvas/pointer/round harness. The full build supplies its
  own scene adapter (stage art, audio, POLE/FLOOR/VIP modes, dancers) against the same core API.
- **TUNABLES** — one object; the feel gate tunes here.

## Placeholders / audio

- Art: neutral geometric silhouette and shapes, tagged `DEVELOPMENT PLACEHOLDER`. Not registered as final art.
- Audio: `RAMakeItRainSandbox.defaultAudioHooks()` exposes inert hooks (round start, load, flick, hit, miss,
  overthrow, beat, fan, streak, storm, result). Nothing is sourced or played.
- Persistence: none. `diagnostics.persist` is `false`.
