// RC2 browser harness: serves the repo (or dist/) statically and opens it in Chromium at a phone width.
// Env: RA_PLAYWRIGHT_PATH (playwright-core dir) and RA_CHROMIUM_PATH (chrome.exe). See docs/rc2/QA.md.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const MIME={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.mp3':'audio/mpeg','.wav':'audio/wav','.svg':'image/svg+xml','.webp':'image/webp','.txt':'text/plain'};
export function serve(dir=root,port=0){return new Promise(res=>{const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(dir,p);if(!f.startsWith(dir)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});s.listen(port,()=>res({server:s,url:`http://localhost:${s.address().port}`}));});}
export async function open({width=390,height=844,dir=root,query=''}={}){
  const pw=await import(pathToFileURL(path.join(process.env.RA_PLAYWRIGHT_PATH||'C:/Users/Ube/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core','index.js')).href);
  const chromium=(pw.chromium||pw.default.chromium);
  const {server,url}=await serve(dir);
  const browser=await chromium.launch({executablePath:process.env.RA_CHROMIUM_PATH||`${process.env.LOCALAPPDATA}/ms-playwright/chromium-1134/chrome-win/chrome.exe`,args:['--autoplay-policy=no-user-gesture-required']});
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:true});
  const page=await ctx.newPage();page.setDefaultTimeout(8000);
  const errors=[];page.on('pageerror',e=>errors.push(String(e.message||e)));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
  await page.goto(`${url}/index.html${query}`);
  return {page,errors,browser,close:async()=>{await browser.close();server.close();}};
}
