// Real-browser check for the F15 stage preview.
//   RA_PLAYWRIGHT_PATH=<playwright-core dir> RA_CHROMIUM_PATH=<chrome.exe> node tools/f15-stage-preview/review/check.mjs
// Serves the repo itself on :4176, drives Chromium at 360/390/430 wide, writes screenshots + results.json (+ video).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.RA_PLAYWRIGHT_PATH || 'playwright-core');
const out = process.env.OUT || here;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg' };
const srv = http.createServer((q, r) => {
  const p = decodeURIComponent(new URL(q.url, 'http://x').pathname).replace(/\/$/, '/index.html');
  fs.readFile(path.join(root, p), (e, b) => { if (e) { r.writeHead(404).end(); return; } r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }).end(b); });
}).listen(4176);
const URL_ = 'http://localhost:4176/tools/f15-stage-preview/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = { widths: {}, notes: [] };
const browser = await chromium.launch({ executablePath: process.env.RA_CHROMIUM_PATH, args: ['--force-device-scale-factor=2'] });

// alpha extents of the dancer overlay at the current frame, in CSS px of the stage
const probe = () => {
  const c = document.getElementById('dancers'), g = c.getContext('2d'), d = window.devicePixelRatio || 1;
  const { data, width, height } = g.getImageData(0, 0, c.width, c.height);
  let x0 = width, x1 = -1, y0 = height, y1 = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    // ignore the translucent floor rings (alpha <= 90); dancers are opaque
    if (data[(y * width + x) * 4 + 3] > 200) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const s = window.f15Preview.state();
  return { left: x0 / d, right: (x1 + 1) / d, top: y0 / d, bottom: (y1 + 1) / d, stageW: s.geo.stageW, stageH: s.geo.stageH, feetY: s.geo.feetY, hudBottom: s.geo.hudBottom, boxes: s.geo.boxes, k: s.geo.k, clamped: s.geo.clamped, frames: s.frames };
};

for (const [w, h] of [[360, 740], [390, 844], [430, 932]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL_);
  await page.waitForFunction(() => window.f15Preview && window.makeItRainGame);
  await page.evaluate(() => window.f15Preview.setRings(false)); // measure dancer pixels only
  await sleep(600);
  const R = { errors, layouts: {} };

  for (const layout of ['recommended', 'alternative']) {
    await page.evaluate((l) => window.f15Preview.setLayout(l), layout);
    await page.evaluate(() => window.f15Preview.restart());
    // sample extents across the sequence (pause at 10 time points: restart → seek by waiting)
    const samples = [];
    for (let i = 0; i < 12; i++) { await sleep(480); samples.push(await page.evaluate(probe)); }
    const L = { samples: samples.length };
    L.minLeft = Math.min(...samples.map((s) => s.left)); L.maxRight = Math.max(...samples.map((s) => s.right));
    L.minTop = Math.min(...samples.map((s) => s.top)); L.maxBottom = Math.max(...samples.map((s) => s.bottom));
    L.stageW = samples[0].stageW; L.stageH = samples[0].stageH; L.feetY = samples[0].feetY; L.hudBottom = samples[0].hudBottom;
    L.edgeMarginLeft = L.minLeft; L.edgeMarginRight = L.stageW - L.maxRight;
    L.headroomBelowHud = L.minTop - L.hudBottom; L.baselineGap = L.feetY - L.maxBottom;
    R.layouts[layout] = L;
    L.k = samples[0].k; L.clamped = samples[0].clamped;
    await page.evaluate(() => window.f15Preview.setRings(true)); await sleep(150);
    await page.screenshot({ path: path.join(out, `shot_${w}_${layout}.png`) });
    await page.evaluate(() => window.f15Preview.setRings(false));
  }

  // selection controls
  await page.evaluate(() => window.f15Preview.setLayout('recommended'));
  const sel = [];
  for (const id of ['dragon', 'wolf', 'pink']) {
    const btn = page.locator(`#pv-select button[data-id="${id}"]`);
    const box = await btn.boundingBox();
    await btn.click();
    sel.push({ id, checked: await btn.getAttribute('aria-checked'), state: (await page.evaluate(() => window.f15Preview.state().selected)), w: box.width, h: box.height });
    if (id === 'pink') await page.screenshot({ path: path.join(out, `shot_${w}_select_pink.png`) });
  }
  R.selection = sel;

  // pause / restart / timing
  await page.locator('#pv-restart').click();
  const t0 = await page.evaluate(() => ({ e: window.f15Preview.state().elapsedMs, f: window.f15Preview.state().frames }));
  await sleep(2000);
  const t1 = await page.evaluate(() => ({ e: window.f15Preview.state().elapsedMs, f: window.f15Preview.state().frames, now: performance.now() }));
  await page.locator('#pv-pause').click();
  const p0 = await page.evaluate(() => window.f15Preview.state().elapsedMs); await sleep(700);
  const p1 = await page.evaluate(() => window.f15Preview.state().elapsedMs);
  const pauseLabel = await page.locator('#pv-pause').textContent();
  await page.locator('#pv-pause').click();
  await page.locator('#pv-restart').click();
  const r0 = await page.evaluate(() => ({ e: window.f15Preview.state().elapsedMs, f: window.f15Preview.state().frames }));
  R.timing = { restartStart: t0, after2s: t1, expectedFrameAt: Math.floor(t1.e / (1000 / 24)), pausedDeltaMs: p1 - p0, pauseLabel, afterRestart: r0 };

  // loop wrap: run until wolf wraps once (146 frames = 6.083 s) and confirm frames reset per dancer length
  await page.evaluate(() => window.f15Preview.restart());
  await sleep(6200);
  R.timing.afterWrap = await page.evaluate(() => { const s = window.f15Preview.state(); return { e: s.elapsedMs, f: s.frames }; });

  // layout toggle changes geometry
  const a = await page.evaluate(() => { window.f15Preview.setLayout('recommended'); return JSON.stringify(window.f15Preview.state().geo.boxes); });
  await sleep(200);
  const b = await page.evaluate(() => { window.f15Preview.setLayout('alternative'); return null; });
  await sleep(250);
  const b2 = await page.evaluate(() => JSON.stringify(window.f15Preview.state().geo.boxes));
  R.layoutToggleChangesBoxes = a !== b2;
  await page.evaluate(() => window.f15Preview.setLayout('recommended'));

  // money-throw interaction still works under the overlay (pointer-events: none)
  const g = await page.evaluate(() => { const r = document.getElementById('stage-canvas').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.86, top: r.top + r.height * 0.55 }; });
  let spent = 0;
  for (let attempt = 0; attempt < 4 && spent === 0; attempt++) {
    await page.mouse.move(g.x, g.y); await page.mouse.down();
    await page.mouse.move(g.x, g.y - 40, { steps: 3 }); await sleep(120);
    await page.mouse.move(g.x, g.y - 120, { steps: 3 }); await sleep(100);
    await page.mouse.move(g.x, g.top, { steps: 3 }); await page.mouse.up(); await sleep(900);
    spent = await page.evaluate(() => window.makeItRainGame.getState().spent || 0);
  }
  R.moneyThrowSpent = spent;
  results.widths[w] = R;
  await ctx.close();
}
await browser.close(); srv.close();
fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 1));
