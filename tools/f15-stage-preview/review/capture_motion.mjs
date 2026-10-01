// Deterministic motion capture: pauses the preview, seeks to t = n/24 s, screenshots the stage, then
//   ffmpeg -framerate 24 -i frames/f_%04d.png ... motion_390_recommended.mp4   (150 frames = 6.25 s, passes WOLF's 6.083 s wrap)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.resolve(here, '..', '..', '..');
const { chromium } = createRequire(import.meta.url)(process.env.RA_PLAYWRIGHT_PATH || 'playwright-core');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(new URL(q.url, 'http://x').pathname).replace(/\/$/, '/index.html');
  fs.readFile(path.join(root, p), (e, b) => { if (e) { r.writeHead(404).end(); return; } r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }).end(b); }); }).listen(4177);
const dir = process.env.FRAMES || path.join(here, 'frames'); fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.RA_CHROMIUM_PATH });
const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })).newPage();
await page.goto('http://localhost:4177/tools/f15-stage-preview/');
await page.waitForFunction(() => window.f15Preview && window.makeItRainGame);
await page.evaluate(() => { window.f15Preview.setPlaying(false); });
const stage = page.locator('#stage');
for (let n = 0; n < 150; n++) {
  await page.evaluate((ms) => window.f15Preview.seek(ms), n * 1000 / 24 + 1);
  await new Promise((r) => setTimeout(r, 40));
  await stage.screenshot({ path: path.join(dir, `f_${String(n).padStart(4, '0')}.png`) });
}
await b.close(); srv.close();
