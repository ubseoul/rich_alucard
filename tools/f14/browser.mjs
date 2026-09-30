// F14-A — BROWSER LAYER.
//
// Uses the project's EXISTING browser automation stack (playwright-core, the same discovery order as
// tools/if1/browser-smoke.mjs). No new framework. When Playwright is unavailable the whole browser half reports
// SKIPPED — never a false PASS — exactly like the existing smoke does.
//
// Captures console errors, page errors, network 404s and unhandled promise rejections per page.
import {createRequire} from 'node:module';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';

const require=createRequire(import.meta.url);
const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.ttf':'font/ttf','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};

export function detectPlaywright(root){
  for(const id of [process.env.RA_PLAYWRIGHT_PATH,path.join(root,'work','browser_deps','node_modules','playwright-core'),'playwright-core','playwright'].filter(Boolean)){
    try{return require(id);}catch(e){}
  }
  return null;
}
export async function chromiumPath(){
  if(process.env.RA_CHROMIUM_PATH)return process.env.RA_CHROMIUM_PATH;
  const base=path.join(process.env.LOCALAPPDATA||path.join(process.env.HOME||'','.cache'),'ms-playwright');
  if(!existsSync(base))return undefined;
  const {readdir}=await import('node:fs/promises');
  for(const d of (await readdir(base)).filter(d=>d.startsWith('chromium-')).sort().reverse())
    for(const exe of ['chrome-win/chrome.exe','chrome-linux/chrome','chrome-mac/Chromium.app/Contents/MacOS/Chromium']){
      const p=path.join(base,d,exe);if(existsSync(p))return p;
    }
  return undefined;
}
export function serve(dir){
  return new Promise(resolve=>{
    const server=http.createServer(async(req,res)=>{
      const p=decodeURIComponent(new URL(req.url,'http://x').pathname);
      const file=path.join(dir,p==='/'?'index.html':p);
      try{res.writeHead(200,{'content-type':TYPES[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(await readFile(file));}
      catch(e){res.writeHead(404);res.end();}
    });
    server.listen(0,'127.0.0.1',()=>resolve(server));
  });
}

const normalizeEval=expr=>typeof expr!=='string'?expr:(/^\s*(\(|async\s|function\b)/.test(expr)?`(${expr})()`:expr);

class PageHandle{
  constructor(page,base,out,id){this.page=page;this.base=base;this.out=out;this.id=id;this.shot=0;
    this.consoleErrors=[];this.pageErrors=[];this.network404=[];this.unhandled=[];
    page.on('pageerror',e=>this.pageErrors.push(String(e.message||e).slice(0,300)));
    page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon/.test(m.text()))this.consoleErrors.push(m.text().slice(0,300));});
    page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))this.network404.push(`http ${r.status()}: ${r.url().replace(base,'')}`);});
    page.on('requestfailed',r=>{if(!/ERR_ABORTED/.test(r.failure()?.errorText||''))this.network404.push(`requestfailed: ${r.url().replace(base,'')} ${r.failure()?.errorText||''}`);});
  }
  // Feature flags are applied through the DEV URL session (?dev=1&ff=a.b,-c.d) so they survive reloads — a page-level
  // RAFeatures.set session does not. Fragment routes declare their flag; the baseline declares none.
  setFlags(flags){const entries=Object.entries(flags||{});this.flagQuery=entries.length?`dev=1&ff=${encodeURIComponent(entries.map(([id,on])=>on?id:`-${id}`).join(','))}`:null;}
  resolve(url){
    const absolute=/^https?:/.test(url);const full=absolute?url:`${this.base}${url.startsWith('/')?url:`/${url}`}`;
    if(!this.flagQuery)return full;
    if(!absolute&&(url==='/'||url==='/index.html'||url.startsWith('/index.html?')))return `${full}${full.includes('?')?'&':'?'}${this.flagQuery}`;
    return full;
  }
  async goto(url){this.pageErrors.length=this.consoleErrors.length=this.network404.length=0;await this.page.goto(this.resolve(url),{waitUntil:'load'});}
  async reload(){await this.page.reload({waitUntil:'load'});}
  async evaluate(expr,arg){return this.page.evaluate(normalizeEval(expr),arg);}
  async waitForFunction(expr,{timeout=15000}={}){await this.page.waitForFunction(`(${expr})()`,null,{timeout});}
  async waitTimeout(ms){await this.page.waitForTimeout(ms);}
  async click(selector,opts={}){await this.page.click(selector,opts.position?{position:opts.position}:{});}
  async screenshot(name){const file=`${String(++this.shot).padStart(3,'0')}-${String(name).replace(/[^a-z0-9_-]+/gi,'_').slice(0,60)}.png`;try{await mkdir(this.out,{recursive:true});await this.page.screenshot({path:path.join(this.out,file)});return file;}catch(e){return null;}}
  viewport(){return this.page.viewportSize();}
  decodeRejections(){return this.page.evaluate(()=>{const list=window.__f14Rejections||[];window.__f14Rejections=[];return list;}).catch(()=>[]);}
  async errors(){const more=await this.decodeRejections();this.unhandled.push(...more);return {console:[...this.consoleErrors],page:[...this.pageErrors],network404:[...this.network404],unhandled:[...this.unhandled]};}
  async snapshot(){return this.page.evaluate(()=>{try{const raw=localStorage.getItem(RAState.keys.primary);return raw?JSON.parse(raw):(RAState.get?RAState.get():null);}catch(e){return null;}}).catch(()=>null);}
  async features(){return this.page.evaluate(()=>window.RAFeatures?.snapshot?.()||{}).catch(()=>({}));}
  async close(){await this.page.context().close();}
}

export class Driver{
  constructor({playwright,browser,server,base,out,denylist,log}){
    this.playwright=playwright;this.browser=browser;this.server=server;this.base=base;this.out=out;this.denylist=denylist;this.log=log||(()=>{});this.n=0;
  }
  async page(viewport={width:390,height:844},flags={}){
    const context=await this.browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:2});
    context.setDefaultTimeout(15000);
    await context.addInitScript(()=>{window.__f14Rejections=[];window.addEventListener('unhandledrejection',e=>{try{window.__f14Rejections.push(String((e.reason&&e.reason.message)||e.reason||'unhandled rejection').slice(0,300));}catch(x){}});});
    const page=await context.newPage();
    const handle=new PageHandle(page,this.base,this.out,++this.n);
    handle.setFlags(flags);
    return handle;
  }
  async close(){try{await this.browser.close();}catch(e){}if(this.server)await new Promise(r=>this.server.close(r));}
}

// Open a driver. Returns {driver, base, status, reason}. status:'SKIPPED' when Playwright is unavailable.
export async function openDriver({root,dist,url=null,out,denylist=null,log=console.log}={}){
  const playwright=detectPlaywright(root);
  if(!playwright)return {status:'SKIPPED',reason:'Playwright not found (set RA_PLAYWRIGHT_PATH)',driver:null,base:null};
  let server=null,base=url;
  if(!base){
    if(!existsSync(path.join(dist,'index.html')))return {status:'SKIPPED',reason:`dist/ missing at ${dist} — run npm run build`,driver:null,base:null};
    server=await serve(dist);base=`http://127.0.0.1:${server.address().port}`;
  }
  const browser=await playwright.chromium.launch({headless:true,executablePath:await chromiumPath()});
  return {status:'READY',driver:new Driver({playwright,browser,server,base,out,denylist,log}),base};
}

// ---- layout / touch-target evaluation (REPORT ONLY; never changes presentation) -----------
// Returns behavioural findings (overflow, clipped, covered, unreachable) and advisory UX findings
// (small touch targets, sub-legible text) that the harness reports and Claude (sole UX owner) may act on.
export async function viewportFindings(page){
  return page.evaluate(()=>{
    const W=innerWidth,H=innerHeight;
    const report={width:W,height:H,scrollWidth:document.documentElement.scrollWidth,overflow:false,clipped:[],covered:[],unreachable:[],smallTargets:[]};
    if(document.documentElement.scrollWidth>W+1)report.overflow=true;
    // Measure only the ACTIVE layer. Controls intentionally covered by an open phone overlay/castle menu/confirm are not
    // "inaccessible". This is a behaviour probe; it never changes presentation.
    let selector;
    if(document.querySelector('#phoneOverlay.open'))selector='#phoneContent button, #phoneContent [data-phone-action], #phoneContent [data-phone-section]';
    else if(document.querySelector('.castle-menu'))selector='.castle-menu button, .castle-menu .mail-card';
    else if(document.querySelector('.bed-confirm'))selector='.bed-confirm button';
    else selector='#screen button:not([hidden]), .mail-card, .mail-done, .bedroom-sleep, .bedroom-castle, .adv-choice, a[href]';
    const visible=el=>{const s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden'||s.opacity==='0')return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
    for(const el of document.querySelectorAll(selector)){
      if(!visible(el))continue;
      const r=el.getBoundingClientRect();const TOL=2; // ignore sub-pixel/1px rounding at the viewport edge
      const label=(el.className&&String(el.className).slice(0,40))||el.tagName;
      if(r.left<-TOL||r.top<-TOL||r.right>W+TOL||r.bottom>H+TOL)report.clipped.push({el:label,rect:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]});
      const cx=Math.min(W-1,Math.max(0,r.left+r.width/2)),cy=Math.min(H-1,Math.max(0,r.top+r.height/2));
      const top=document.elementFromPoint(cx,cy);
      if(top&&!el.contains(top)&&!top.contains(el)&&r.left>=0&&r.top>=0&&r.right<=W&&r.bottom<=H)report.covered.push({el:label,by:String((top.className&&top.className.slice(0,30))||top.tagName)});
      if((el.tagName==='BUTTON'||el.getAttribute('role')==='button'||el.classList.contains('adv-choice'))&&(r.width<24||r.height<24))report.smallTargets.push({el:label,w:Math.round(r.width),h:Math.round(r.height)});
    }
    return report;
  });
}

// Phone-placement validation hook. Baseline: every rendered phone control must be on-screen and tappable. Fragment
// validators (tools/f14/placements.json) extend this later; the harness only REPORTS.
export async function phonePlacementFindings(page){
  return page.evaluate(()=>{
    const out={open:false,clipped:[],covered:[],smallTargets:[]};
    const overlay=document.querySelector('#phoneOverlay.open');if(!overlay)return out;
    out.open=true;const W=innerWidth,H=innerHeight;
    const visible=el=>{const s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden'||s.opacity==='0')return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
    for(const el of document.querySelectorAll('#phoneContent button, #phoneContent [data-phone-action], #phoneContent [data-phone-section]')){
      if(!visible(el))continue;const r=el.getBoundingClientRect();
      const label=(el.dataset&&(el.dataset.phoneAction||el.dataset.phoneSection))||(el.className&&String(el.className).slice(0,32))||el.tagName;
      if(r.left<-1||r.top<-1||r.right>W+1||r.bottom>H+1)out.clipped.push({el:label,rect:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]});
      const cx=Math.min(W-1,Math.max(0,r.left+r.width/2)),cy=Math.min(H-1,Math.max(0,r.top+r.height/2));
      const top=document.elementFromPoint(cx,cy);
      if(top&&!el.contains(top)&&!top.contains(el)&&r.left>=0&&r.top>=0&&r.right<=W&&r.bottom<=H)out.covered.push({el:label,by:String((top.className&&top.className.slice(0,30))||top.tagName)});
      if(el.tagName==='BUTTON'&&(r.width<24||r.height<24))out.smallTargets.push({el:label,w:Math.round(r.width),h:Math.round(r.height)});
    }
    return out;
  });
}
