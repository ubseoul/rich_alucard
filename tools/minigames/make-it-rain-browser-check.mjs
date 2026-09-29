// MAKE IT RAIN — real-browser presentation check (F06-A-P1).
//
// Drives the sandbox page with REAL pointer input (Playwright mouse + a CDP touch gesture) and asserts
// the F06-A polish acceptance list: successful flick, miss, overthrow, FAN, streak, round result,
// restart, 360/390/430 layout (no clipping, >=44px touch targets), feedback hierarchy, no console errors.
//
// Not part of `npm test` (needs a browser). Run:
//   RA_PLAYWRIGHT_PATH=<playwright-core dir> RA_CHROMIUM_PATH=<chrome.exe> \
//     node tools/minigames/make-it-rain-browser-check.mjs [--out <dir>] [--natural] [--widths 360,390,430]
//
// It serves the repo root itself and never touches the network. It does not alter gameplay values.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const arg = (name, fallback) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback; };
const outDir = path.resolve(arg('--out', path.join(os.tmpdir(), 'make-it-rain-browser-check')));
const natural = argv.includes('--natural');
const widths = arg('--widths', '360,390,430').split(',').map(Number);
const heights = { 360: 740, 390: 844, 430: 932 };
fs.mkdirSync(outDir, { recursive: true });

const require = createRequire(import.meta.url);
const pwPath = process.env.RA_PLAYWRIGHT_PATH || 'playwright-core';
const { chromium } = require(pwPath);
const launchOpts = process.env.RA_CHROMIUM_PATH ? { executablePath: process.env.RA_CHROMIUM_PATH } : {};

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const file = path.resolve(root, rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(buf);
  });
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/make_it_rain_sandbox.html`;

const results = [];
const log = (ok, name, extra = '') => { results.push({ ok, name }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`); };
async function check(name, fn) { try { const extra = await fn(); log(true, name, extra || ''); } catch (e) { log(false, name, e.message.split('\n')[0]); } }

const browser = await chromium.launch(launchOpts);

// ---- in-page planners (read-only over the core) ----
const PRED = {
  hit: 'c.spotlightActive(t)',
  hitOnBeat: 'c.spotlightActive(t) && c.beatAt(t).onBeat',
  hitPerfect: 'c.spotlightActive(t) && c.beatAt(t).perfect',
  miss: 'c.spotlightActive(t)',
  overthrow: '!c.spotlightActive(t)'
};

// Plan the release moment and aim ratio for an outcome; returns game-time + aim.
async function plan(page, kind, predKey, leadMs, margin = 40) {
  return page.evaluate(({ kind, pred, leadMs, margin }) => {
    const g = window.makeItRainGame, c = g.core;
    const f = new Function('c', 't', 'return ' + pred);
    const t0 = g.debug.clock();
    for (let dt = leadMs; dt < 9000; dt += 4) {
      const t = t0 + dt;
      // require the predicate to hold across +-margin so driver latency cannot flip the outcome
      if (f(c, t) && f(c, t - margin) && f(c, t + margin)) {
        const tx = c.targetX(t);
        let landing = tx;
        if (kind === 'miss') landing = tx < 0.5 ? Math.min(0.97, tx + 0.34) : Math.max(0.03, tx - 0.34);
        if (kind === 'overthrow') landing = 0.5;
        return { dt, t, landing, ratio: (landing - 0.5) / c.T.aim.aimSpread };
      }
    }
    return null;
  }, { kind, pred: PRED[predKey], leadMs, margin });
}

// Real mouse gesture: press on the roll, drag straight up loading ~bills, finish with a flick whose
// direction carries the aim ratio for the last 112ms (the adapter's velocity window).
const mouseIO = page => ({
  down: (x, y) => page.mouse.move(x, y).then(() => page.mouse.down()),
  move: (x, y) => page.mouse.move(x, y),
  up: () => page.mouse.up()
});
const touchIO = cdp => {
  const send = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  return { down: (x, y) => send('touchStart', x, y), move: (x, y) => send('touchMove', x, y), up: () => send('touchEnd', 0, 0) };
};

// Press on the roll, drag straight up (loading bills), HOLD until the flick must start, then finish with
// a fast flick whose direction carries the aim ratio for the last steps (the adapter's 110ms velocity
// window). Release lands on the planned game instant regardless of driver latency.
async function flick(page, io, { bills, ratio, loadMs, releaseAtGameMs }) {
  const box = await (await page.$('#stage-canvas')).boundingBox();
  const sx = box.x + box.width * 0.5, sy = box.y + box.height * 0.94;
  // Flick = 3 big steps (0.18 normalized height each) so the release speed stays above the core's minimum
  // even when the driver adds latency between events. The gesture therefore always loads the full roll.
  const stepN = 3, stepNorm = 0.18;
  const loadDyNorm = 0.03;
  const loadSteps = Math.max(2, Math.round(loadMs / 160));
  const clock = () => page.evaluate(() => window.makeItRainGame.debug.clock());
  const waitUntil = target => page.evaluate(async t => { const g = window.makeItRainGame; while (g.debug.clock() < t) await new Promise(r => setTimeout(r, 2)); }, target);
  await waitUntil(releaseAtGameMs - loadMs - 1100);        // start early; we hold after loading
  await io.down(sx, sy);
  let y = sy;
  const c0 = await clock();
  for (let i = 1; i <= loadSteps; i++) {
    y = sy - (loadDyNorm * box.height * i) / loadSteps;
    await io.move(sx, y);
    await page.waitForTimeout(loadMs / loadSteps);
  }
  const perStep = ((await clock()) - c0) / loadSteps;      // measured driver latency per step
  const flickEst = stepN * Math.max(8, perStep - (loadMs / loadSteps) + 12);
  await waitUntil(releaseAtGameMs - flickEst);
  let x = sx;
  for (let i = 1; i <= stepN; i++) {
    x = sx + ratio * stepNorm * box.width * i;
    y -= stepNorm * box.height;
    await io.move(x, y);
    await page.waitForTimeout(8);
  }
  await io.up();
}

async function snapshot(page) {
  return page.evaluate(() => {
    const g = window.makeItRainGame, s = g.getState();
    return { ...s, last: g.core.lastOutcome ? { ...g.core.lastOutcome, beat: undefined } : null, popups: g.debug.popups(), litter: g.debug.litter(), anims: g.debug.animations() };
  });
}

async function playOne(page, kind, predKey, opts = {}) {
  const lead = (opts.loadMs || 300) + 1100 + 250;
  const p = await plan(page, kind, predKey, lead, predKey === 'hitOnBeat' || predKey === 'hitPerfect' ? 40 : 160);
  assert(p, `no ${kind} window found`);
  const before = await snapshot(page);
  await flick(page, mouseIO(page), { bills: opts.bills || 6, ratio: p.ratio, loadMs: opts.loadMs || 300, releaseAtGameMs: p.t });
  const early = await snapshot(page);
  await page.waitForTimeout(650);
  const late = await snapshot(page);
  const drift = await page.evaluate(t => { const h = window.makeItRainGame.core.history; return h.length ? Math.round(h[h.length - 1].t - t) : null; }, p.t);
  late.drift = drift;
  return { before, early, late };
}

// ---- per-width run ----
for (const w of widths) {
  const h = heights[w] || 800;
  const ctxOpts = { viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: false };
  const context = await browser.newContext(ctxOpts);
  const page = await context.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(base);
  await page.waitForTimeout(700);
  const tag = `[${w}]`;

  await check(`${tag} layout: no horizontal clipping, stage + canvas fit, canvas is integer-2x pixel grid`, async () => {
    const m = await page.evaluate(() => {
      const r = el => { const b = el.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height }; };
      const c = document.getElementById('stage-canvas'), st = document.getElementById('stage');
      return {
        iw: window.innerWidth, sw: document.documentElement.scrollWidth,
        canvas: r(c), stage: r(st), cw: c.width, ch: c.height, hostW: st.clientWidth, hostH: st.clientHeight,
        buttons: [...document.querySelectorAll('.player-bar .btn, #result-again')].filter(b => b.offsetParent !== null).map(b => ({ id: b.id || b.textContent.trim(), ...r(b) }))
      };
    });
    assert(m.sw <= m.iw, `horizontal overflow ${m.sw} > ${m.iw}`);
    assert(m.canvas.l >= 0 && m.canvas.r <= m.iw + 0.5, 'canvas clipped horizontally');
    assert(m.stage.l >= 0 && m.stage.r <= m.iw + 0.5, 'stage clipped horizontally');
    assert.strictEqual(m.cw, Math.floor(m.hostW / 2), 'canvas width is not floor(host/2)');
    assert.strictEqual(Math.round(m.canvas.w), m.cw * 2, 'canvas css width is not 2x logical');
    for (const b of m.buttons) {
      assert(b.h >= 44 && b.w >= 44, `touch target ${b.id} ${Math.round(b.w)}x${Math.round(b.h)} < 44`);
      assert(b.l >= 0 && b.r <= m.iw + 0.5, `button ${b.id} clipped`);
    }
    return `canvas ${m.cw}x${m.ch} logical, stage ${Math.round(m.stage.w)}x${Math.round(m.stage.h)}, ${m.buttons.length} buttons >=44px`;
  });

  await check(`${tag} canvas is painted (not blank) and player-bar sits inside the first screen`, async () => {
    const info = await page.evaluate(() => {
      const c = document.getElementById('stage-canvas'), x = c.getContext('2d');
      const d = x.getImageData(0, 0, c.width, c.height).data;
      const seen = new Set();
      for (let i = 0; i < d.length; i += 4 * 37) seen.add((d[i] >> 5) + ',' + (d[i + 1] >> 5) + ',' + (d[i + 2] >> 5));
      const bar = document.getElementById('player-bar').getBoundingClientRect();
      return { colors: seen.size, barBottom: bar.bottom, ih: window.innerHeight };
    });
    assert(info.colors > 25, `only ${info.colors} color buckets`);
    assert(info.barBottom <= info.ih, `player bar bottom ${Math.round(info.barBottom)} beyond viewport ${info.ih}`);
    return `${info.colors} color buckets; bar bottom ${Math.round(info.barBottom)}/${info.ih}`;
  });

  await page.screenshot({ path: path.join(outDir, `${w}_01_idle.png`) });

  const fresh = async () => { await page.click('[data-budget="25000"]'); await page.waitForTimeout(120); };
  // Driver latency on a busy machine can push a real flick outside its planned window (a too-slow flick is
  // correctly rejected by the core as not-a-flick), so each scenario retries a few times on a fresh round.
  async function until(tries, run, ok, what) {
    let last = null;
    for (let i = 0; i < tries; i++) {
      last = await run();
      if (ok(last)) return { r: last, attempts: i + 1 };
    }
    const l = last && last.late && last.late.last;
    throw new Error(`${what}: ${tries} attempts failed; last kind ${l && l.kind} reason ${l && l.reason} drift ${last && last.late && last.late.drift}ms`);
  }

  // 1. successful flick: FAN + on-beat hit (long smooth load, real mouse)
  await fresh();
  await check(`${tag} real-mouse FAN hit: consumes cash, hit + FAN + timing feedback`, async () => {
    const { r, attempts } = await until(5, () => playOne(page, 'hit', 'hitOnBeat', { bills: 14, loadMs: 640 }),
      x => x.late.last && x.late.last.kind === 'hit' && x.late.last.fan, 'FAN hit');
    assert(r.late.cash < r.before.cash, 'cash did not decrease');
    assert(r.late.hits >= 1);
    // timing/fan/cost labels appear at release; HIT/+hype land with the bills (sample both moments)
    const labels = [...new Set([...r.early.popups, ...r.late.popups])].join('|');
    assert(/HIT/.test(labels) && /\+\d/.test(labels), `missing HIT/+hype (${labels})`);
    assert(/FAN \+CROWD/.test(labels), `missing FAN (${labels})`);
    // the timing tag must match the core's verdict exactly (never a false ON BEAT / PERFECT)
    const l = r.late.last;
    if (l.perfect) assert(/PERFECT/.test(labels), `perfect hit without PERFECT (${labels})`);
    else if (l.onBeat) assert(/ON BEAT/.test(labels), `on-beat hit without ON BEAT (${labels})`);
    else assert(!/ON BEAT|PERFECT/.test(labels), `timing tag shown for an off-beat hit (${labels})`);
    assert(r.late.popups.length <= 6 && r.early.popups.length <= 6, 'too many simultaneous labels');
    return `hype +${Math.round(r.late.last.hypeGained)}, labels ${labels}, attempts ${attempts}`;
  });
  await page.screenshot({ path: path.join(outDir, `${w}_02_fan_hit.png`) });

  // 2. consecutive hits for a streak
  await fresh();
  await check(`${tag} real-mouse consecutive hits build a STREAK`, async () => {
    const { r, attempts } = await until(8, () => playOne(page, 'hit', 'hit', { bills: 6, loadMs: 260 }),
      x => x.late.streak >= 2, 'STREAK');
    assert(r.late.popups.length <= 6, 'too many simultaneous labels');
    return `streak x${r.late.streak}, best x${r.late.bestStreak}, attempts ${attempts}`;
  });
  await page.screenshot({ path: path.join(outDir, `${w}_03_streak.png`) });

  // 3. miss
  await fresh();
  await check(`${tag} real-mouse MISS (lit, off-aim): waste + litter + MISS label`, async () => {
    const { r, attempts } = await until(5, () => playOne(page, 'miss', 'miss', { bills: 8, loadMs: 260 }),
      x => x.late.last && x.late.last.kind === 'miss', 'MISS');
    assert(r.late.waste > r.before.waste, 'waste did not grow');
    assert(r.late.litter > r.before.litter, 'no floor litter');
    assert(r.late.streak === 0, 'streak not reset');
    assert(r.late.popups.some(t => t === 'MISS'), `no MISS label (${r.late.popups})`);
    return `waste $${r.late.waste}, litter ${r.late.litter}, attempts ${attempts}`;
  });
  await page.screenshot({ path: path.join(outDir, `${w}_04_miss.png`) });

  // 4. overthrow
  await fresh();
  await check(`${tag} real-mouse OVERTHROW (dark): waste + OVERTHROW label`, async () => {
    const { r, attempts } = await until(5, () => playOne(page, 'overthrow', 'overthrow', { bills: 10, loadMs: 260 }),
      x => x.late.last && x.late.last.kind === 'overthrow', 'OVERTHROW');
    assert(r.late.waste > r.before.waste, 'waste did not grow');
    assert(r.late.popups.some(t => t === 'OVERTHROW'), `no OVERTHROW label (${r.late.popups})`);
    assert(r.late.overthrows >= 1);
    return `overthrows ${r.late.overthrows}, waste $${r.late.waste}, attempts ${attempts}`;
  });
  await page.screenshot({ path: path.join(outDir, `${w}_05_overthrow.png`) });

  // 5. ON BEAT / PERFECT timing labels (aimed at the perfect window; a PERFECT is informational)
  await fresh();
  await check(`${tag} real-mouse on-beat hit shows ON BEAT / PERFECT at the roll`, async () => {
    let perfect = false;
    const { r, attempts } = await until(6, async () => {
      const rp = await playOne(page, 'hit', 'hitPerfect', { bills: 5, loadMs: 240 });
      if (rp.late.last && rp.late.last.perfect) { perfect = true; await page.screenshot({ path: path.join(outDir, `${w}_06_perfect.png`) }); }
      return rp;
    }, x => x.late.last && x.late.last.kind === 'hit' && x.late.last.onBeat, 'ON BEAT hit');
    const labels = [...new Set([...r.early.popups, ...r.late.popups])].join('|');
    assert(/PERFECT|ON BEAT/.test(labels), `no timing label (${labels})`);
    return `${r.late.last.perfect ? 'PERFECT' : 'ON BEAT'} labelled (${labels}), attempts ${attempts}${perfect ? ', perfect screenshot saved' : ''}`;
  });

  // 6. round result + restart
  await check(`${tag} round result (${natural && w === widths[0] ? 'natural 30s' : 'forced'}): required data + RUN IT BACK restarts`, async () => {
    if (natural && w === widths[0]) {
      await page.waitForFunction(() => window.makeItRainGame.getState().ended, null, { timeout: 40000 });
      await page.waitForTimeout(2800);
    } else {
      await page.evaluate(() => window.makeItRainGame.debug.forceEnd());
      await page.waitForTimeout(150);
    }
    const s = await page.evaluate(() => window.makeItRainGame.getSummary());
    for (const k of ['spent', 'hype', 'waste', 'rainScore', 'bestStreak', 'hits', 'misses', 'overthrows']) assert(typeof s[k] === 'number', `summary.${k} missing`);
    const vis = await page.evaluate(() => !document.getElementById('result-actions').hidden);
    assert(vis, 'RUN IT BACK not shown');
    await page.screenshot({ path: path.join(outDir, `${w}_07_result.png`) });
    await page.click('#result-again');
    await page.waitForTimeout(200);
    const s2 = await page.evaluate(() => window.makeItRainGame.getState());
    assert.strictEqual(s2.ended, false); assert.strictEqual(s2.spent, 0); assert.strictEqual(s2.cash, s2.budget);
    return `score ${s.rainScore}, spent $${s.spent}, hits/miss/over ${s.hits}/${s.misses}/${s.overthrows}`;
  });

  await check(`${tag} budget presets + RESTART`, async () => {
    await page.click('[data-budget="5000"]');
    let s = await page.evaluate(() => ({ b: window.makeItRainGame.getState().budget, p: document.querySelector('[data-budget="5000"]').getAttribute('aria-pressed') }));
    assert.strictEqual(s.b, 5000); assert.strictEqual(s.p, 'true');
    await page.click('[data-budget="25000"]');
    s = await page.evaluate(() => window.makeItRainGame.getState());
    assert.strictEqual(s.budget, 25000);
    await page.click('#player-restart');
    s = await page.evaluate(() => window.makeItRainGame.getState());
    assert.strictEqual(s.budget, 25000); assert.strictEqual(s.cash, 25000);
    await page.click('[data-budget="10000"]');
    return 'budget 5K/25K/RESTART/10K';
  });

  await check(`${tag} dev controls exist below the game and stay functional`, async () => {
    const m = await page.evaluate(() => {
      const st = document.getElementById('stage').getBoundingClientRect(), dv = document.getElementById('dev').getBoundingClientRect();
      return { stageBottom: st.bottom, devTop: dv.top + window.scrollY, ids: ['dev-reset', 'dev-seed', 'dev-seed-apply', 'dev-show-tunables', 'dev-state', 'dev-tunables'].every(id => !!document.getElementById(id)) };
    });
    assert(m.ids, 'dev ids missing');
    assert(m.devTop > m.stageBottom, 'dev panel not below the stage');
    await page.click('#dev-show-tunables');
    const shown = await page.evaluate(() => !document.getElementById('dev-tunables').hidden && document.getElementById('dev-tunables').textContent.includes('"bpm": 120'));
    assert(shown, 'tunables not shown');
    await page.click('#dev-show-tunables');
    await page.fill('#dev-seed', '7');
    await page.click('#dev-seed-apply');
    await page.click('#dev-reset');
    return 'reset/seed/tunables ok';
  });

  await check(`${tag} no console errors / page errors`, async () => {
    assert.strictEqual(errors.length, 0, errors.join(' | '));
  });
  await context.close();
}

// ---- touch path: same handlers, pointerType touch (CDP touch events) ----
await check('[touch] real touch flick uses the same gameplay path (valid outcome, cash consumed)', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base);
  await page.waitForTimeout(700);
  const cdp = await context.newCDPSession(page);
  let s = null;
  for (let i = 0; i < 5; i++) {
    await page.click('#player-restart');
    await page.waitForTimeout(120);
    const p = await plan(page, 'hit', 'hit', 300 + 1100 + 250, 160);
    await flick(page, touchIO(cdp), { bills: 8, ratio: p.ratio, loadMs: 300, releaseAtGameMs: p.t });
    await page.waitForTimeout(200);
    s = await page.evaluate(() => ({ st: window.makeItRainGame.getState(), last: window.makeItRainGame.core.lastOutcome }));
    if (s.last && s.last.kind === 'hit') break;
  }
  await context.close();
  assert.strictEqual(errors.length, 0, errors.join('|'));
  assert(s.last && s.last.kind === 'hit', `outcome ${s.last && s.last.kind} ${s.last && s.last.reason}`);
  assert(s.st.spent > 0, 'no cash consumed via touch');
  return `touch outcome ${s.last.kind}, spent $${s.st.spent}`;
});

await browser.close();
server.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${failed.length ? 'FAILED' : 'PASSED'}: ${results.length - failed.length}/${results.length} checks. Screenshots: ${outDir}`);
process.exit(failed.length ? 1 : 0);
