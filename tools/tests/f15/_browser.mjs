// Shared real-browser helpers for the F15 checks (Playwright + a tiny static server over the checkout; not a test file).
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const require=createRequire(import.meta.url);
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.ttf':'font/ttf','.json':'application/json','.mp3':'audio/mpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};

export async function serve(){
  const missing=[];
  const server=http.createServer(async(req,res)=>{
    const rel=decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'')||'index.html';
    const file=path.resolve(root,rel);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    try{const body=await fs.readFile(file);res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);}
    catch{missing.push(rel);res.writeHead(404);res.end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  return {server,missing,url:`http://127.0.0.1:${server.address().port}/`,close:()=>new Promise(r=>{server.close(r);server.closeAllConnections();})};
}
export async function launch(){
  const {chromium}=require(process.env.RA_PLAYWRIGHT_PATH||'playwright-core');
  return chromium.launch({executablePath:process.env.RA_CHROMIUM_PATH});
}
// Open a page at a phone width with error collection.
export async function open(browser,base,{width=390,height=844,flags='F06.rainmaker,F15.velvet_rotation',dpr=2}={}){
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true,isMobile:true});
  const page=await ctx.newPage();
  const errors=[],failed=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
  page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')failed.push(r.url());});   // a reload/teardown aborting an in-flight media stream is not a missing asset
  page.on('response',r=>{if(r.status()>=400)failed.push(r.status()+' '+r.url());});
  await page.goto(`${base}?dev=1&ff=${flags}`);
  await page.waitForFunction(()=>window.RAF15&&window.RAPhone&&window.RAF06Rainmaker);
  return {page,ctx,errors,failed};
}
// A fresh life in the bedroom with the RAINMAKER app open and the club launched.
export async function enterClub(page,{money=500000}={}){
  await page.evaluate(async m=>{RAState.reset();await RAScenes.go('bedroom',{dev:true});RALife.addMoney(m-RALife.money());RAPhoneRegistry.unlock('rainmaker');RAPhone.openApp('rainmaker');},money);
  await page.getByRole('button',{name:'MAKE IT RAIN',exact:true}).click();
  await page.getByRole('dialog',{name:'MAKE IT RAIN',exact:true}).waitFor();
  await page.waitForFunction(()=>window.RAF15Club?.current()?.status().loaded||window.RAF15Club?.current()?.status().failed);
}
