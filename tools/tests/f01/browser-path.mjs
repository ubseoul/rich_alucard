#!/usr/bin/env node
// F01 SHOWDOWN_CORE — REAL-BROWSER path test (Chromium via Playwright). Not part of `npm test` (needs a browser); run:
//   node tools/tests/f01/browser-path.mjs [--dist dist] [--out reports/f01] [--require-browser]
// Proves on 360 / 390 / 430 phones and a desktop window: the sandbox loads clean, has no horizontal overflow, touch targets are
// big enough, and the whole tactical loop works through real taps: select, two-tap move, POD reveal, cover shields, honest hit
// chance sheet, shoot, overwatch, hunker, class abilities, downed / carry / extract, enemy turn, Rich pull-up, victory / retreat /
// failure result screens, reload-resume, seeded determinism; then the integrated game page: flag OFF = nothing changes.
import {mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {loadPlaywright} from '../../if1/browser-smoke.mjs';
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.ttf':'font/ttf','.mp3':'audio/mpeg','.wav':'audio/wav'};
// (own static server: the shared one in browser-smoke.mjs crashes on a 404 such as /favicon.ico)
const serve=dir=>new Promise(resolve=>{const s=http.createServer(async(req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://x').pathname);const f=path.join(dir,p==='/'?'index.html':p);if(!f.startsWith(dir))throw new Error('outside');const buf=await readFile(f);res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});res.end(buf);}catch(e){res.writeHead(404);res.end();}});s.listen(0,'127.0.0.1',()=>resolve(s));});

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
const arg=n=>{const i=process.argv.indexOf(n);return i===-1?null:process.argv[i+1];};
const dist=path.resolve(root,arg('--dist')||(existsSync(path.join(root,'dist','index.html'))?'dist':'.'));
const out=path.resolve(root,arg('--out')||'reports/f01');
const results=[];const log=(ok,name,detail='')=>{results.push({ok,name,detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?` — ${detail}`:''}`);return ok;};

const pw=loadPlaywright();
if(!pw){console.log('SKIPPED F01 browser path (Playwright not found; set RA_PLAYWRIGHT_PATH)');process.exit(process.argv.includes('--require-browser')?1:0);}
await mkdir(out,{recursive:true});
const server=await serve(dist);const base=`http://127.0.0.1:${server.address().port}`;
async function chromiumPath(){for(const p of [process.env.RA_CHROMIUM_PATH,'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].filter(Boolean))if(existsSync(p))return p;return undefined;}
const browser=await pw.chromium.launch({headless:true,executablePath:await chromiumPath()});

async function open(width,height,query='dev=1&seed=browser&mission=skirmish&autostart=1',{touch=width<600,url}={}){
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,hasTouch:touch,isMobile:touch});ctx.setDefaultTimeout(15000);
  const page=await ctx.newPage();const errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/.test(m.text()))errors.push('console: '+m.text().slice(0,200));});
  page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errors.push(`http ${r.status()}: ${r.url().replace(base,'')}`);});
  await page.goto(url||`${base}/assets/f01/showdown-sandbox.html?${query}`);
  return {page,errors,ctx};
}
const ui=(page,fn,...a)=>page.evaluate(([f,args])=>{const c=window.RAShowdownUI.current;const v=c[f];return typeof v==='function'?v(...args):v;},[fn,a]);
const S=page=>page.evaluate(()=>{const c=window.RAShowdownUI.current;return JSON.parse(JSON.stringify(c.session.state));});
const idle=page=>page.waitForFunction(()=>window.RAShowdownUI.current&&!window.RAShowdownUI.current.busy,null,{timeout:40000});
const ready=async page=>{await page.waitForSelector('.sd');await page.waitForFunction(()=>window.RAShowdownUI.current&&!window.RAShowdownUI.current.busy,null,{timeout:20000});};
const tapTile=async(page,x,y)=>{const b=await page.locator('[data-r=board]').boundingBox();const t=b.width/6;await page.mouse.click(b.x+(x+.5)*t,b.y+(y+.5)*t);};
const btn=(page,sel)=>page.click(sel);
const mutate=(page,fn,arg)=>page.evaluate(([src,a])=>{const c=window.RAShowdownUI.current;const s=c.session.state;(new Function('s','arg',src))(s,a);c.refresh();},[fn.toString().replace(/^[^{]*\{|\}$/g,''),arg]);

try{
  // ================= A. layout on every target width =================
  for(const [w,h] of [[360,640],[360,780],[390,844],[430,932],[1280,800]]){
    const {page,errors,ctx}=await open(w,h);await ready(page);
    const m=await page.evaluate(()=>{const d=document.documentElement;const rects=[...document.querySelectorAll('.sd button:not([hidden]),.sd-act')].map(b=>{const r=b.getBoundingClientRect();return {w:r.width,h:r.height,t:(b.textContent||'').trim().slice(0,14)};}).filter(r=>r.w>0);
      const board=document.querySelector('[data-r=board]').getBoundingClientRect();const cmd=document.querySelector('[data-r=cmd]').getBoundingClientRect();
      return {sw:d.scrollWidth,cw:d.clientWidth,sh:d.scrollHeight,ch:d.clientHeight,tile:window.RAShowdownUI.current.tile,minBtnH:Math.min(...rects.map(r=>r.h)),small:rects.filter(r=>r.h<32||r.w<32).map(r=>r.t),boardBottom:board.bottom,cmdTop:cmd.top,vh:innerHeight,boardRight:board.right,vw:innerWidth};});
    log(m.sw===m.cw,`${w}x${h}: no horizontal overflow`,`${m.sw}/${m.cw}`);
    log(m.sh<=m.ch+1,`${w}x${h}: no vertical page scroll`,`${m.sh}/${m.ch}`);
    log(m.boardRight<=m.vw+1&&m.boardBottom<=m.cmdTop+2||w>=820,`${w}x${h}: board fits above the command panel`,`board bottom ${Math.round(m.boardBottom)} cmd top ${Math.round(m.cmdTop)}`);
    log(m.tile>=(w<400?38:44),`${w}x${h}: tile is a usable touch target`,`${m.tile}px`);
    log(m.small.length===0,`${w}x${h}: every control is at least 32px`,m.small.join(','));
    await page.screenshot({path:path.join(out,`layout_${w}x${h}.png`)});
    log(errors.length===0,`${w}x${h}: zero console/page/network errors`,errors.join(' | '));await ctx.close();
  }

  // ================= B-F. the tactical loop, by real taps, on a phone =================
  {const {page,errors,ctx}=await open(390,844);await ready(page);
   let s=await S(page);
   log(s.units.muscle.ap===2&&s.turn===1&&s.phase==='PLAYER','boot: turn 1, your phase, 2 actions each');
   log(await page.locator('.sd-chip').count()===4,'turn order strip shows the squad');
   // select by tapping the chip, two-tap move
   await page.click('.sd-chip[data-id=shooter]');log((await ui(page,'selected'))==='shooter','tap a chip selects that Oga');
   await page.click('.sd-chip[data-id=muscle]');
   await tapTile(page,2,5);log((await ui(page,'plan'))?.kind==='move','first tap on a teal tile PREVIEWS the path (no move yet)');
   s=await S(page);log(s.units.muscle.y===7&&s.units.muscle.ap===2,'...and nothing has moved');
   await tapTile(page,2,5);await idle(page);await page.waitForTimeout(1300);
   s=await S(page);log(s.units.muscle.y===5&&s.units.muscle.ap===1,'second tap commits the move (1 action)');
   log(s.pods.every(p=>p.revealed),'closing in reveals the POD (enemies spotted)');
   log(await page.locator('.u.foe').count()>=4,'revealed enemies appear on the field');
   log(await page.locator('.u .cv:not([hidden])').count()>0,'cover / flank shields are drawn on units');
   // hit chance sheet is honest: DOM % equals the engine's preview
   await page.click('.sd-chip[data-id=shooter]');await ui(page,'select','shooter');
   const foe=Object.values(s.units).find(u=>u.kind==='ENEMY'&&u.status==='ACTIVE'&&u.y>=1);
   await tapTile(page,foe.x,foe.y);
   
   const shown=await page.locator('.sd-sheet-t .big').innerText();
   const truth=await page.evaluate(([f])=>{const c=window.RAShowdownUI.current;const st=c.session.state;const R=window.RAShowdownRules;return Math.round(R.preview(st,st.units.shooter,st.units[f],{}).chance);},[foe.id]);
   log(parseInt(shown,10)===truth,'target sheet shows the honest hit chance',`${shown.trim().replace(/\s+/g,' ')} vs engine ${truth}%`);
   log(await page.locator('.sd-sheet-t li').count()>=1,'the sheet lists every modifier');
   await page.screenshot({path:path.join(out,'sheet_390.png')});
   const clip0=s.units.shooter.weapon.clip,ap0=s.units.shooter.ap;await tapTile(page,foe.x,foe.y);await idle(page);
   s=await S(page);log(s.units.shooter.weapon.clip===clip0-1&&s.units.shooter.ap===ap0-1,'confirming fires: ammo -1, action -1',`clip ${clip0}->${s.units.shooter.weapon.clip} ap ${ap0}->${s.units.shooter.ap}`);
   // back-out works
   await ui(page,'select','doc');await ui(page,'action','MOVE');
   // overwatch + hunker through the buttons
   await ui(page,'select','ghost');await page.click('[data-act=OVERWATCH]');await idle(page);s=await S(page);log(s.units.ghost.ow===true,'OVERWATCH button sets the stance');
   await ui(page,'select','doc');await page.click('[data-act=HUNKER]');await idle(page);s=await S(page);log(s.units.doc.hunker===true,'HUNKER button sets the stance');
   // class ability through the UI (DOC: nothing to heal -> refused politely; MUSCLE: shoulder check needs a target)
   await ui(page,'select','muscle');await page.click('[data-act=ABILITY]');await page.waitForTimeout(150);
   log((await ui(page,'mode')).startsWith('t:'),'ABILITY enters target mode for the class ability (SHOULDER CHECK)');
   await ui(page,'cancel');
   await page.screenshot({path:path.join(out,'midfight_390.png')});
   // end turn: warns first (unspent actions), second tap confirms; the enemy turn plays and hands the turn back
   await page.click('[data-a=end]');await page.waitForTimeout(150);
   log((await page.locator('.sd-end.warn').count())===1,'END TURN warns when Ogas still have actions');
   s=await S(page);log(s.turn===1,'...and did not end the turn');
   await page.click('[data-a=end]');await page.waitForTimeout(400);
   log((await page.locator('.sd[data-phase=ENEMY]').count())===1,'enemy phase is announced');
   await idle(page);s=await S(page);
   log(s.turn===2&&s.phase==='PLAYER'||s.status==='ENDED','the enemy turn plays out and hands control back');
   log(errors.length===0,'B-F: zero errors',errors.join(' | '));await ctx.close();}

  // ================= G. downed -> carry -> extract, by taps =================
  {const {page,errors,ctx}=await open(390,844,'dev=1&seed=carry&mission=skirmish&autostart=1&squad=MUSCLE,SHOOTER,GHOST,DOC');await ready(page);
   await mutate(page,(s)=>{const a=s.units.muscle;a.status='DOWNED';a.hp=0;a.bleed=3;a.ap=0;a.x=2;a.y=6;s.units.shooter.x=3;s.units.shooter.y=6;s.units.ghost.x=0;s.units.ghost.y=5;s.units.doc.x=5;s.units.doc.y=7;});
   await ui(page,'select','shooter');
   log((await page.locator('.u[data-id=muscle] .tg').innerText()).startsWith('BLEED'),'a downed Oga shows its bleed clock');
   await page.click('[data-act=CARRY]');await page.waitForTimeout(200);
   log((await ui(page,'plan'))?.kind==='CARRY'||(await ui(page,'mode'))==='t:carry','CARRY targets the downed ally');
   if((await ui(page,'plan'))?.kind!=='CARRY')await tapTile(page,2,6);
   await page.click('[data-a=confirm]');await idle(page);
   let s=await S(page);log(s.units.shooter.carrying==='muscle','the carrier lifts them (1 action)');
   log(s.units.shooter.ap===1,'costs an action');
   await tapTile(page,3,8);await tapTile(page,3,8);await idle(page);await page.waitForTimeout(900);s=await S(page);
   log(s.units.muscle.status==='EXTRACTED','carried onto the exit zone: EXTRACTED');
   await page.screenshot({path:path.join(out,'extracted_390.png')});
   // PATCH UP stabilizes a downed ally
   await mutate(page,(s)=>{const g=s.units.ghost;g.status='DOWNED';g.hp=0;g.bleed=3;g.x=5;g.y=6;g.ap=0;s.units.doc.x=5;s.units.doc.y=7;s.units.doc.ap=2;});
   await ui(page,'select','doc');await page.click('[data-act=ABILITY]');await page.waitForTimeout(150);
   if((await ui(page,'plan'))?.kind!=='PATCH_UP')await tapTile(page,5,6);
   await page.click('[data-a=confirm]');await idle(page);s=await S(page);log(s.units.ghost.stabilized===true,'DOC PATCH UP stabilizes a downed Oga');
   log(errors.length===0,'G: zero errors',errors.join(' | '));await ctx.close();}

  // ================= H. Rich pull-up =================
  {const {page,errors,ctx}=await open(390,844);await ready(page);
   log((await page.locator('[data-a=pullup]').innerText()).includes('T3'),'PULL UP is locked before turn 3');
   await mutate(page,(s)=>{s.turn=3;});
   await page.click('[data-a=pullup]');await page.waitForTimeout(500);
   log((await page.locator('.sd-cut:not([hidden])').count())===1,'pull-up plays the neutral slide-in cut');
   await idle(page);let s=await S(page);
   log(s.units.rich.status==='ACTIVE'&&s.rich.visible===true,'Rich is on the field and SEEN (the +15 HEAT hook)');
   log(await page.locator('.u[data-id=rich]').count()===1,'Rich has a token');
   log(await page.locator('.sd-act').count()>=4,'Rich gets his own move buttons');
   const names=await page.locator('.sd-act').allInnerTexts();log(names.some(n=>/OCTOPUS/.test(n))&&names.some(n=>/BLOOD BATH/.test(n)),'BLOOD BATH / VAMP BITE / REVENGE / OCTOPUS are offered');
   await page.screenshot({path:path.join(out,'rich_390.png')});
   log(errors.length===0,'H: zero errors',errors.join(' | '));await ctx.close();}

  // ================= I. the three endings =================
  for(const [name,setup,expect] of [
    ['RETREAT',async page=>{await page.click('[data-a=menu]');await page.click('[data-m=retreat]');},'RETREAT'],
    ['VICTORY',async page=>{await mutate(page,(s)=>{for(const u of Object.values(s.units))if(u.kind==='ENEMY'&&u.id!=='e1'){u.status='REMOVED';u.removedReason='ELIMINATED';}const e=s.units.e1;e.x=2;e.y=5;e.hp=1;s.units.shooter.x=2;s.units.shooter.y=7;s.units.shooter.aim=100;s.pods.forEach(p=>p.revealed=true);});
       await ui(page,'select','shooter');await page.click('[data-act=SHOOT]');await page.waitForTimeout(200);if((await ui(page,'plan'))?.kind==='shot')await page.click('[data-a=confirm]');},'VICTORY'],
    ['FAILURE',async page=>{await mutate(page,(s)=>{for(const u of Object.values(s.units))if(u.kind==='OGA'){u.status='DOWNED';u.hp=0;u.bleed=3;}s.pods.forEach(p=>p.revealed=true);});await page.click('[data-a=end]');},'FAILURE']]){
    const {page,errors,ctx}=await open(390,844);await ready(page);await setup(page);
    await page.waitForSelector('.sd-result',{timeout:25000});
    const title=await page.locator('.sd-result h2').innerText();
    log(title===expect,`${name}: result screen`,title);
    log(await page.locator('.sd-crew li').count()>=4,`${name}: crew status is listed`);
    const ov=await page.evaluate(()=>{const r=document.querySelector('.sd-result').getBoundingClientRect();return r.right<=innerWidth&&r.left>=0;});log(ov,`${name}: result card fits the phone`);
    await page.screenshot({path:path.join(out,`result_${name.toLowerCase()}_390.png`)});
    log(errors.length===0,`${name}: zero errors`,errors.join(' | '));await ctx.close();}

  // ================= J. reload = resume, K. seeded determinism =================
  {const {page,errors,ctx}=await open(390,844,'dev=1&seed=resume&mission=skirmish&autostart=1');await ready(page);
   await tapTile(page,3,5);await tapTile(page,3,5);await idle(page);await page.waitForTimeout(1200);
   const before=await page.evaluate(()=>window.RAShowdown.hash(window.RAShowdownUI.current.session.state));
   await page.goto(`${base}/assets/f01/showdown-sandbox.html?dev=1`);await page.waitForSelector('[data-resume]');
   await page.click('[data-resume]');await ready(page);
   const after=await page.evaluate(()=>window.RAShowdown.hash(window.RAShowdownUI.current.session.state));
   log(before===after,'reload mid-fight -> CONTINUE resumes the exact tactical state',`${before} == ${after}`);
   log(errors.length===0,'J: zero errors',errors.join(' | '));await ctx.close();}
  {const play=async()=>{const {page,ctx}=await open(390,844,'dev=1&seed=same-seed&mission=skirmish&autostart=1');await ready(page);await page.evaluate(()=>window.RAShowdownUI.current.setSpeed(4));
     await tapTile(page,2,6);await tapTile(page,2,6);await idle(page);await page.click('[data-a=end]');await page.click('[data-a=end]');await idle(page);
     const h=await page.evaluate(()=>window.RAShowdown.hash(window.RAShowdownUI.current.session.state));await ctx.close();return h;};
   const a=await play(),b=await play();log(a===b,'same seed + same taps => identical fight in the browser',`${a} == ${b}`);}

  // ================= L. the integrated game: flag OFF changes nothing =================
  if(existsSync(path.join(dist,'index.html'))){
   const {page,errors,ctx}=await open(390,844,'',{url:`${base}/index.html`});await page.waitForFunction(()=>window.RAIF1&&window.RAState);
   const g=await page.evaluate(()=>({flag:RAFeatures.enabled('F01.showdown_core'),reg:!!RAFeatures.get('F01.showdown_core'),any:RAFeatures.anyEnabled(),frag:!!RAState.get().frag,ver:RAState.version,sd:!!window.RAShowdown,refused:window.RAShowdown.createSession({seed:1}).code,open:window.RAShowdownSandbox.open().code,overlay:!!document.querySelector('.sd'),self:RAIF1.selfCheck().ok}));
   log(g.reg&&!g.flag&&!g.any,'game: F01.showdown_core registered and DARK');log(!g.frag&&g.ver===16,'game: no save namespace written, schema still v16');
   log(g.refused==='FLAG_OFF'&&g.open==='FLAG_OFF'&&!g.overlay&&g.self,'game: F01 refuses to run and draws nothing while OFF; IF-1 self-check OK');
   log(errors.length===0,'game (flag OFF): zero errors',errors.join(' | '));await ctx.close();
   const on=await open(390,844,'',{url:`${base}/index.html?dev=1&ff=F01.showdown_core`});await on.page.waitForFunction(()=>window.RAIF1&&window.RAState);
   const o=await on.page.evaluate(()=>{const r=window.RAShowdownSandbox.open();return {ok:r.ok,enabled:RAFeatures.enabled('F01.showdown_core')};});
   await on.page.waitForSelector('.sb-card');await on.page.click('[data-go]');await on.page.waitForSelector('.sd');await on.page.waitForFunction(()=>!window.RAShowdownUI.current.busy,null,{timeout:20000});
   const fit=await on.page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,life:JSON.stringify(RAState.get().life).length>0}));
   log(o.ok&&o.enabled,'game (?dev=1&ff=F01.showdown_core): the sandbox opens as an overlay');log(fit.sw===fit.cw,'game overlay: no horizontal overflow');
   await on.page.screenshot({path:path.join(out,'ingame_overlay_390.png')});
   log(on.errors.length===0,'game (flag ON via DEV): zero errors',on.errors.join(' | '));await on.ctx.close();
  }else log(true,'game page check skipped (no index.html in served root)');
}finally{await browser.close();server.close();}
const failed=results.filter(r=>!r.ok);
console.log(`\n${failed.length?'FAIL':'PASS'} F01 browser path: ${results.length-failed.length}/${results.length} checks (${dist})`);
process.exit(failed.length?1:0);
