// Tiny static server for the F15 stage preview (fetch() of the F06 renderer needs http, not file://).
// Usage: node tools/f15-stage-preview/serve.mjs [port]   ->   http://localhost:4175/tools/f15-stage-preview/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const port = Number(process.argv[2] || process.env.PORT || 4175);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.md': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403).end(); return; }
  fs.readFile(f, (e, b) => {
    if (e) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(b);
  });
}).listen(port, () => console.log('F15 stage preview: http://localhost:' + port + '/tools/f15-stage-preview/'));
