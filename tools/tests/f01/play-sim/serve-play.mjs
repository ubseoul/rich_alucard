#!/usr/bin/env node
// Tiny static server for the THE PLAY sandbox (serves .mjs as JavaScript; no dependencies).
//   node tools/tests/f01/play-sim/serve-play.mjs [port]      → http://localhost:8123/assets/f01/play/index.html
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..','..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.ttf':'font/ttf','.png':'image/png','.svg':'image/svg+xml'};
export function serve(port=8123){
 const srv=http.createServer((req,res)=>{
  let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';
  const f=path.join(root,p);
  if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end('not found');return;}
  res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(f).pipe(res);
 });
 return new Promise(r=>srv.listen(port,()=>r(srv)));
}
if(import.meta.url===`file://${process.argv[1]}`){const port=+process.argv[2]||8123;await serve(port);console.log(`THE PLAY sandbox: http://localhost:${port}/assets/f01/play/index.html`);}
