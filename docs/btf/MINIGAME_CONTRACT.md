# Minigame Host Contract (W0 FEEL TRACK)

Runtime: vanilla JS, no build step, no npm deps at runtime. Native canvas 270×480 portrait, nearest-neighbor, Press Start 2P font (`RAPixel.FONT`).

## Files
- `js/engine/pixel.js` — `RAPixel` helpers: `createCanvas(root)` → `{canvas,ctx,toNative(clientX,clientY)}`, `text(ctx,str,x,y,{size,color,align,baseline,shadow})`, `wrap`, `rect`, `frame`, `rng(seed)`, `drawActor(ctx,spec,x,y,scale)` (placeholder figure, contact at x,y), `paintEnvironment(ctx,spec)`, `palette`.
- `js/engine/minigames.js` — `RAMinigames.register(id,{title,mount(root,ctx)})`, `RAMinigames.launch(id,params)` → Promise<result>.
- `js/minigames/<id>.js` — one file per minigame. Registers itself. Must also expose pure logic for tests at `window.RAMinigameLogic[id]` (create the object if missing).
- `minigame-lab.html` — standalone FEEL BATCH page (`?game=<id>&param=value` auto-launches). No save state; progress goes to a lab localStorage key.

## mount(root, ctx)
- `root`: a div covering the whole 270×480 screen. Create your canvas with `RAPixel.createCanvas(root)`. DOM buttons are allowed but prefer canvas + pointer events. Leave the top-right ~60×24 native px clear (host QUIT button lives there).
- `ctx.params`: plain object (see each game's params). Always tolerate missing params with sensible defaults (lab launches with `{lab:true}` only).
- `ctx.progress()` / `ctx.saveProgress(patch)`: persistent per-game object (best scores, logs, unlocked lessons). Save bests immediately when they happen (quitting must never lose progress).
- `ctx.reward(partial)`: accumulate rewards during the session. Keys: `money` (number), `items` ({itemId:count}), `followers`, `clout`, `hooks` (array), `memories` (array of short lowercase strings), `flags` ({flag:true}), plus game-specific keys documented below.
- `ctx.finish({outcome:'win'|'lose'|'done', score, summary, data})` ends the session. `ctx.quit()` = instant quit (host button calls it).
- Return `{dispose()}` which must cancel your rAF loop, timers and listeners. After dispose nothing may keep running.

## Rules
- Real controls: touch first (multi-touch where the design needs two thumbs), mouse works, keyboard nice-to-have.
- Every run must be quittable instantly and resumable without loss (persist bests/logs in progress).
- Rough visuals OK (shapes/placeholder via RAPixel). Do NOT edit or regenerate files in `assets/`; you may draw existing PNGs read-only.
- Rich placeholder lines must be marked in data as `{vp:true}` (voice pass required) — never present them as canon.
- No dependencies on other game systems (no RAState, no RAScenes). The life layer applies rewards.
- Text must be readable at 270×480 (min 6px Press Start 2P; 8px for primary info).
- Keep each file self-contained, readable, and under ~900 lines.

## Testing
- Pure logic tests: `tools/minigames/<id>-test.mjs` exporting `async function test(root)` that loads `js/engine/pixel.js`, `js/engine/minigames.js`, `js/minigames/<id>.js` into a `node:vm` context with a stub `window`/`document` (the file must not touch DOM at load time other than registering) and asserts the logic API. Print `PASS <id> (...)`.
- Browser: serve repo root (`python3 -m http.server 4180`), open `http://127.0.0.1:4180/minigame-lab.html?game=<id>` with Playwright (`require('/opt/node22/lib/node_modules/playwright')`, chromium works headless with default launch), viewport 390×844, simulate input, screenshot, confirm zero page errors.
