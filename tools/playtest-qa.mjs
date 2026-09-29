#!/usr/bin/env node
// PLAYTEST QA — real-player-path browser harness over the BUILT game (dist/). Not part of npm test.
// It plays the game through its player-facing controls (START, taps, choices, phone buttons, CASTLE, SLEEP,
// minigame canvases, QUIT) and checks engineering invariants + save/reload after every outing and night.
// Evidence is REVIEWER-ONLY (screenshots may show authored content); the printed report uses ids and codes only.
// Usage: RA_PLAYWRIGHT_PATH=… RA_CHROMIUM_PATH=… node tools/playtest-qa.mjs [--out dir] [--only a,b] [--days N] [--seed N]
// Scenarios: newgame, prologue-reload, life, minigames, migration, widths.
import {createRequire} from 'node:module';
import http from 'node:http';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=Object.fromEntries(process.argv.slice(2).reduce((acc,arg,i,all)=>{if(arg.startsWith('--')){const next=all[i+1];acc.push([arg.slice(2),next&&!next.startsWith('--')?next:true])}return acc},[]));
const dist=path.join(root,'dist');
const out=path.resolve(args.out||path.join(root,'work','playtest_qa'));
const only=args.only?String(args.only).split(','):null;
const DAYS=Number(args.days||12),SEED=Number(args.seed||7);
const require=createRequire(import.meta.url);
function loadPlaywright(){for(const id of [process.env.RA_PLAYWRIGHT_PATH,'playwright-core','playwright'].filter(Boolean)){try{return require(id)}catch{}}throw new Error('Playwright not found: set RA_PLAYWRIGHT_PATH')}
async function chromiumPath(){if(process.env.RA_CHROMIUM_PATH)return process.env.RA_CHROMIUM_PATH;const base=path.join(process.env.LOCALAPPDATA||path.join(process.env.HOME||'','.cache'),'ms-playwright');if(!existsSync(base))return undefined;for(const d of (await readdir(base)).filter(d=>d.startsWith('chromium-')).sort().reverse())for(const exe of ['chrome-win/chrome.exe','chrome-linux/chrome'])if(existsSync(path.join(base,d,exe)))return path.join(base,d,exe)}
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.ttf':'font/ttf','.mp3':'audio/mpeg','.woff2':'font/woff2'};
function serve(){return new Promise(resolve=>{const missing=new Set();const s=http.createServer(async(req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://x').pathname);try{const f=path.join(dist,p==='/'?'index.html':p);res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});res.end(await readFile(f))}catch{missing.add(p);res.writeHead(404);res.end()}});s.missing=missing;s.listen(0,'127.0.0.1',()=>resolve(s))})}

const SIZES={360:[360,740],390:[390,844],430:[430,932]};
const findings=[];const log=[];
function finding(cls,code,detail){const f={cls,code,detail};findings.push(f);console.log(`FINDING [${cls}] ${code} ${detail}`);}
function note(...a){const line=a.join(' ');log.push(line);console.log(line);}
function rngFrom(seed){let s=seed>>>0||1;return ()=>{s=Math.imul(s^s>>>15,2246822519)+0x9e3779b9|0;return (s>>>0)/4294967296;};}

let browser,server,base,shot=0;
async function newPage(size=390,{fresh=true}={}){
 const [w,h]=SIZES[size];const context=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:false});
 context.setDefaultTimeout(8000);const page=await context.newPage();page.errors=[];page.size=size;
 page.on('pageerror',e=>page.errors.push(`pageerror: ${e.message}`));
 page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon/.test(m.text()))page.errors.push(`console: ${m.text().slice(0,300)}`)});
 page.on('requestfailed',r=>{if(!/ERR_ABORTED/.test(r.failure()?.errorText||''))page.errors.push(`requestfailed: ${r.url().replace(base,'')} ${r.failure()?.errorText||''}`)});
 page.on('response',r=>{if(r.status()>=400)page.errors.push(`http ${r.status()}: ${r.url().replace(base,'')}`)});
 if(fresh){await page.goto(base+'/');await page.evaluate(()=>localStorage.clear());}
 return page;
}
async function snap(p,name){try{await p.screenshot({path:path.join(out,`${String(++shot).padStart(3,'0')}-${p.size}-${name.replace(/[^a-z0-9_-]+/gi,'_').slice(0,60)}.png`)});}catch{}}
function flushErrors(p,where){if(p.errors.length){for(const e of p.errors)finding('ENGINEERING BUG — NON-BLOCKING','PAGE-ERROR',`${where}: ${e}`);p.errors.length=0;}}
const settle=(p,ms=150)=>p.waitForTimeout(ms);

// ---------- in-page probes ----------
async function probe(p){return p.evaluate(()=>{
 const q=s=>document.querySelector(s),vis=el=>!!el&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none';
 const scene=window.RAScenes?.current?.()||null;const a=window.RAAdventures?.active?.()||null;
 const choices=[...document.querySelectorAll('.adv-choice')].filter(vis).map(b=>({label:b.innerText.replace(/\s+/g,' ').trim().slice(0,40),disabled:b.disabled}));
 return {scene,start:vis(q('#startOverlay'))&&getComputedStyle(q('#startOverlay')).display!=='none',
  minigame:window.RAMinigames?.active?.()?.id||null,c2:!!q('.c2-scene'),phone:!!window.RAPhone?.isOpen?.(),phonePage:window.RAPhone?.page?.()||null,
  adv:a?.id||null,node:a?.node||null,choices,title:vis(q('.adv-title')),advScene:!!q('#adventureScene'),
  mail:vis(q('.morning-mail:not(.castle-menu)')),castle:vis(q('.castle-menu')),bedConfirm:vis(q('.bed-confirm')),returnCard:vis(q('.bedroom-return')),
  victory:!!q('#victoryOverlay.on')&&vis(q('#victoryCard')),choiceOverlay:!!q('#choiceOverlay.show'),reveal:scene==='character_reveal',
  combat:window.RACombat?.snapshot?.()||null,body:document.body.className,
  day:window.RALife?.today?.().day??null,started:!!window.RAState?.get?.().life.clock.started,
  sig:`${scene}|${a?.id}|${a?.node}|${window.RAMinigames?.active?.()?.id}|${(()=>{const t=(q('#screen')?.innerText||'').replace(/\s+/g,' ');let h=0;for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return `${h}:${t.slice(-160)}`;})()}`};
});}
async function invariants(p,where,{idle=false}={}){
 const v=await p.evaluate(({idle})=>{
  const out=[];const S=RAState.get(),L=S.life;
  if(S.version!==RAState.version)out.push(`version ${S.version}`); // IF-1 (F00): was a stale literal 12
  if(!Number.isFinite(L.resources.money))out.push('money not finite');
  if(!Number.isInteger(L.world.day)||L.world.day<1)out.push(`bad day ${L.world.day}`);
  const dup=(list,key='id')=>{const seen=new Set(),d=[];for(const x of list||[]){const k=x?.[key];if(k==null)continue;if(seen.has(k))d.push(k);seen.add(k);}return d;};
  for(const [name,list] of [['receipts',L.receipts],['memoryLog',L.memoryLog],['mail',L.clock.mail],['history',L.history],['cars',L.ownership.cars],['properties',L.ownership.properties],['castleRooms',L.ownership.castleRooms]]){const d=dup(list);if(d.length)out.push(`duplicate ${name}: ${d.slice(0,3).join(',')}`);}
  for(const [id,rec] of Object.entries(L.adventures.records||{})){const def=RAAdventures.get(id);if(def&&!def.repeatable&&(rec.count||0)>1)out.push(`non-repeatable adventure ${id} completed ${rec.count}×`);}
  for(const [id,rec] of Object.entries(L.events.records||{}))if((rec.deliveries||0)>1)out.push(`world event ${id} delivered ${rec.deliveries}×`);
  for(const [id,t] of Object.entries(L.phone.threads||{})){const d=dup(t);if(d.length)out.push(`duplicate text ids in ${id}`);}
  const raw=localStorage.getItem(RAState.keys.primary);if(!raw)out.push('no persisted save');else{const saved=JSON.parse(raw);const norm=x=>JSON.stringify(x);if(norm(saved.life.resources)!==norm(L.resources)||saved.life.world.day!==L.world.day||norm(saved.life.adventures)!==norm(L.adventures))out.push('persisted save differs from live state');}
  if(idle){
   if(RAScenes.current()!=='bedroom')out.push(`idle scene is ${RAScenes.current()}`);
   if(RAAdventures.active())out.push(`adventure still active at bedroom: ${RAAdventures.active().id}`);
   for(const cls of ['minigame-mode','combat2-mode','adventure-mode'])if(document.body.classList.contains(cls))out.push(`body stuck in ${cls}`);
   if(document.querySelector('.ra-minigame'))out.push('minigame DOM left behind');
   if(document.querySelector('#adventureScene'))out.push('adventure DOM left behind');
   if(!document.querySelector('.bedroom-life-layer'))out.push('bedroom controls missing');
  }
  return {out,bytes:(raw||'').length+(localStorage.getItem(RAState.keys.recovery)||'').length,historyLen:L.history.length};
 },{idle});
 for(const x of v.out)finding(/duplicate|completed \d+×|delivered/.test(x)?'PLAYTEST BLOCKER':'ENGINEERING BUG — NON-BLOCKING','INVARIANT',`${where}: ${x}`);
 return v;
}
async function stateSnapshot(p){return p.evaluate(()=>{const s=JSON.parse(JSON.stringify(RAState.get()));delete s.life.world.scene;return s;});}
function diffKeys(a,b,prefix='',outList=[]){if(JSON.stringify(a)===JSON.stringify(b))return outList;if(typeof a!=='object'||typeof b!=='object'||!a||!b||Array.isArray(a)!==Array.isArray(b)){outList.push(prefix||'(root)');return outList;}
 if(Array.isArray(a)){outList.push(`${prefix}[${a.length}→${b.length}]`);return outList;}for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diffKeys(a[k],b[k],prefix?`${prefix}.${k}`:k,outList);return outList;}

// Reload the page like a browser refresh, press START, let the resumed scene settle; compare the save.
async function reloadCheck(p,where){
 const before=await stateSnapshot(p);
 await p.reload();await settle(p,500);
 const pr=await probe(p);if(!pr.start){finding('ENGINEERING BUG — NON-BLOCKING','RELOAD-NO-START',`${where}: START overlay not shown after refresh`);}
 else{await p.locator('#startButton').click();}
 await settle(p,1200);
 const after=await stateSnapshot(p);const d=diffKeys(before,after).filter(k=>!/^life\.clock\.returnBeat|^life\.history/.test(k));
 if(d.length)finding('PLAYTEST BLOCKER','RELOAD-STATE-DIFF',`${where}: ${d.slice(0,8).join(', ')}`);
 return {diff:d,scene:(await probe(p)).scene};
}

// ---------- minigame play ----------
async function canvasBox(p){const c=p.locator('.ra-minigame canvas').first();if(!await c.count())return null;return c.boundingBox();}
const nat=(box,x,y)=>[box.x+x/270*box.width,box.y+y/480*box.height];
async function tapN(p,box,x,y,hold=40){const [X,Y]=nat(box,x,y);await p.mouse.move(X,Y);await p.mouse.down();await p.waitForTimeout(hold);await p.mouse.up();}
async function dragN(p,box,[x1,y1],[x2,y2],steps=8){const [X1,Y1]=nat(box,x1,y1),[X2,Y2]=nat(box,x2,y2);await p.mouse.move(X1,Y1);await p.mouse.down();for(let i=1;i<=steps;i++){await p.mouse.move(X1+(X2-X1)*i/steps,Y1+(Y2-Y1)*i/steps);await p.waitForTimeout(25);}await p.mouse.up();}
async function holdAt(p,box,x,y,ms){const [X,Y]=nat(box,x,y);await p.mouse.move(X,Y);await p.mouse.down();await p.waitForTimeout(ms);await p.mouse.up();}
async function mgActive(p){return p.evaluate(()=>window.RAMinigames?.active?.()?.id||null);}
async function canvasHash(p){return p.evaluate(()=>{const c=document.querySelector('.ra-minigame canvas');if(!c)return null;try{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=97)h=(h*31+d[i])|0;return h;}catch{return 'x'}});}
// Plays a minigame with simple player-like input. Returns 'finished' | 'quit' | 'left'.
async function playMinigame(p,id,rng,{budgetMs=9000,preferQuit=false}={}){
 const t0=Date.now();const box=await canvasBox(p);const h0=await canvasHash(p);
 if(!box){await settle(p,300);}
 const b=box||{x:0,y:0,width:p.viewportSize().width,height:p.viewportSize().height};
 const done=async()=>!(await mgActive(p));
 const until=async(fn)=>{while(Date.now()-t0<budgetMs){if(await done())return true;await fn();}return done();};
 if(preferQuit){await tapN(p,b,135,300);await settle(p,300);}
 // TOUGE: drive until the minigame itself reports `results` (read-only data-phase marker; a 90 game-second run takes
 // longer in real time under headless load), then tap DONE. Engineering 06; earlier runs always hit the budget and QUIT.
 // QA HARNESS HARDENING 001 (A1/A2/A3): a green run must mean the mechanic actually happened. Every scoring minigame is
 // driven through its OWN real controls (derived from each minigame's source) to a legitimate scoring action; success is
 // asserted from the returned result/reward/state (see MG_EXPECT), never from a canvas merely changing.
 else if(id==='touge'){
  // TOUGE reads keyboard (ArrowUp throttle, Space e-brake) and pointer (left half = steer by horizontal drag). Build
  // speed, kick the e-brake to initiate a slide, hold it with countersteer; wait for the game's own `results`, then DONE.
  await until(async()=>{
   const phase=await p.evaluate(()=>document.querySelector('.ra-minigame[data-phase],.ra-minigame [data-phase]')?.dataset.phase||null);
   if(phase==='results'){await tapN(p,b,200,418);await settle(p,500);return;}
   await p.keyboard.down('ArrowUp');
   const [px,py]=nat(b,100,300);
   await p.mouse.move(px,py);await p.mouse.down();
   await p.mouse.move(px-40,py);await p.waitForTimeout(150);                 // steer hard into the corner
   await p.keyboard.down(' ');await p.waitForTimeout(260);await p.keyboard.up(' '); // e-brake initiation
   await p.mouse.move(px+40,py);await p.waitForTimeout(650);                 // countersteer to hold the drift
   await p.mouse.up();await p.keyboard.up('ArrowUp');
   await settle(p,120);
  });
 }
 else if(id==='garage'){
  // Buy one part through the real store (money leaves the account, the part installs), close the detail, then DONE.
  let bought=false;
  await until(async()=>{
   if(!bought){await tapN(p,b,30,80);await settle(p,220);await tapN(p,b,95,413);await settle(p,260);await tapN(p,b,243,160);await settle(p,220);bought=true;return;}
   await tapN(p,b,200,457);await settle(p,300);
  });
 }
 else if(id==='pier'){
  // Pulse the line: cast, tap the real bite, then hold/release to reel without snapping. A landing opens the result
  // card; the periodic I'M GOOD tap ends the session once a catch resolves (harmless while casting/waiting/reeling).
  let pn=0;
  await until(async()=>{
   pn++;
   if(pn%5===0){await tapN(p,b,190,310);await settle(p,400);return;}
   const [X,Y]=nat(b,135,300);await p.mouse.move(X,Y);await p.mouse.down();await p.waitForTimeout(300);await p.mouse.up();await p.waitForTimeout(430);
  });
 }
 else if(id==='hatch'){
  // PLAY always resolves a `play` care action after its ~10s mini-moment (inventory-independent, unlike FEED), then DONE.
  let acted=false;
  await until(async()=>{
   if(!acted){await tapN(p,b,134,445);await settle(p,11000);acted=true;return;}
   await tapN(p,b,40,402);await settle(p,300);
  });
 }
 else if(id==='bars'){
  // Tap every choice-chip cell (a 2x2 grid at x=69/197, y=217/281); at least one is correct each round, so the rhyme
  // chain genuinely scores. Click the end-card DONE when it appears.
  await until(async()=>{
   const btns=p.locator('.ra-minigame button:not(.ra-minigame-quit)');const cnt=await btns.count();
   if(cnt){const labels=await btns.allInnerTexts();const di=labels.findIndex(t=>String(t).trim().toUpperCase()==='DONE');if(di>=0){await btns.nth(di).click({force:true});await settle(p,200);return;}}
   for(const [cx,cy] of [[69,217],[197,217],[69,281],[197,281]]){await tapN(p,b,cx,cy,40);await settle(p,90);}
  });
 }
 else if(id==='slurp'){
  // Serve the opening ticket through the real bowl zone (BOWL_ZONE x190-254, y150-206) — the tutorial order accepts any
  // bowl and pays — then clock out. No longer drags ingredients into nowhere.
  let served=false;
  await until(async()=>{
   const btns=p.locator('.ra-minigame button:not(.ra-minigame-quit)');const cnt=await btns.count();
   if(cnt){const labels=await btns.allInnerTexts();const di=labels.findIndex(t=>/^\s*DONE/i.test(t));const ci=labels.findIndex(t=>/CLOCK/i.test(t));
    if(di>=0){await btns.nth(di).click({force:true});await settle(p,300);return;}
    if(ci>=0&&Date.now()-t0>budgetMs*.35){await btns.nth(ci).click({force:true});await settle(p,400);return;}}
   if(!served){await settle(p,400);await tapN(p,b,222,178);await settle(p,500);served=true;return;}
   await settle(p,250);
  });
 }
 else if(id==='jollof'){const seq=async()=>{const [X,Y]=nat(b,135,300);await p.mouse.move(X,Y);await p.mouse.down();await p.waitForTimeout(1800);await p.mouse.up();await settle(p,500);
   for(let i=0;i<14;i++){await tapN(p,b,i%2?200:70,300,30);await settle(p,90);}await tapN(p,b,135,400);await settle(p,900);
   for(let i=0;i<5;i++){await tapN(p,b,30+(i%5)*48,210);await settle(p,80);}await tapN(p,b,135,420);await settle(p,5800);await tapN(p,b,135,410);await settle(p,900);
   for(let i=0;i<8;i++){await tapN(p,b,135,300);await settle(p,500);}await tapN(p,b,135,414);await settle(p,400);};await until(seq);}
 else if(id==='hookah'){
  // Two smooth, centred releases: a full-lung big ring, then a short-lung smaller one that passes through it (a stack).
  // A long stable hold has no pointer jitter, so it reads as smooth; the size gap satisfies the stack rule.
  let stacked=false;
  await until(async()=>{
   if(!stacked){await holdAt(p,b,135,380,1600);await settle(p,300);await holdAt(p,b,135,380,300);await settle(p,500);stacked=true;return;}
   await tapN(p,b,135,449);await settle(p,250); // I'M GOOD (native y>436, 75<x<195)
  });
 }
 else if(id==='pickup'){
  // Hold-release to shoot (the meter fills over ~0.9s); once the game is decided the same spot is the DONE button.
  await until(async()=>{await tapN(p,b,135,307,900);await settle(p,220);});
 }
 else await until(async()=>{await tapN(p,b,rng()*270,rng()*480);await settle(p,100);});
 const h1=await canvasHash(p);
 if(await done())return {exit:'finished',changed:h0!==h1};
 await p.locator('.ra-minigame-quit').click();await settle(p,300);
 return {exit:(await mgActive(p))?'stuck':'quit',changed:h0!==h1};
}
async function instrument(p){await p.evaluate(()=>{if(window.__qaWrapped)return;window.__qaWrapped=true;window.__mg=[];const launch=RAMinigames.launch;RAMinigames.launch=async function(id,params,opts){const r=await launch.call(this,id,params,opts);window.__mg.push({id,quit:!!r.quit,outcome:r.outcome,score:r.score??null,rewards:r.rewards||{},data:r.data??null,error:r.error||null});return r;};});}

// ---------- the player brain: drive whatever is on screen until back at an idle bedroom ----------
async function drive(p,rng,where,{maxSteps=900,mgBudget=7000,preferQuit=false,throneSteal='no'}={}){
 let last='',same=0;const seen={adventures:new Set(),minigames:[],fights:0};
 for(let step=0;step<maxSteps;step++){
  const s=await probe(p);
  if(process.env.QA_TRACE)console.log('  step',new Date().toISOString().slice(11,19),where,step,s.sig.slice(0,160));
  if(s.sig===last)same++;else{same=0;last=s.sig;}
  if(same>=40){finding('PLAYTEST BLOCKER','STUCK',`${where}: no progress for 40 inputs at ${s.scene}/${s.adv||'-'}/${s.node||'-'} minigame=${s.minigame||'-'}`);await snap(p,`stuck-${where}`);return {stuck:true,...seen};}
  if(s.adv)seen.adventures.add(s.adv);
  if(s.start){await p.locator('#startButton').click();await settle(p,600);continue;}
  if(s.minigame){const r=await playMinigame(p,s.minigame,rng,{budgetMs:mgBudget,preferQuit});seen.minigames.push({id:s.minigame,...r});if(r.exit==='stuck')finding('PLAYTEST BLOCKER','MINIGAME-QUIT-FAILED',`${where}: ${s.minigame}`);await settle(p,300);continue;}
  if(s.c2){seen.fights++;const oc=p.locator('.c2-octo:not([hidden]) [data-octo]');if(await oc.count()){await oc.nth(Math.floor(rng()*await oc.count())).click();await settle(p,900);continue;}const doneBtn=p.locator('[data-c2="done"]');if(await doneBtn.count()){await doneBtn.first().click();await settle(p,400);continue;}
   const fight=p.locator('[data-c2="fight"]');if(await fight.count()){await fight.first().click();await settle(p,120);const mv=p.locator('.c2-btn[data-c2^="move:"]:not(.c2-off), .c2-btn[data-c2^="gun:"]:not(.c2-off)');const n=await mv.count();if(n){await mv.nth(Math.floor(rng()*n)).click();}else{const back=p.locator('[data-c2="back"]');if(await back.count())await back.click();const run=p.locator('[data-c2="run"]');if(await run.count())await run.click();}await settle(p,900);continue;}
   await settle(p,400);continue;}
  if(s.scene==='battle'&&!s.advScene){
   if(s.victory){await p.locator(throneSteal==='yes'?'#stealYes':'#stealNo').click();await settle(p,1500);continue;}
   if(s.choiceOverlay){await p.locator('#choiceYes').click();await settle(p,600);continue;}
   const octo=p.locator('#octopusOverlay.on [data-octo]');if(await octo.count()){await octo.nth(Math.floor(rng()*await octo.count())).click().catch(()=>{});await settle(p,800);continue;}
   if(s.combat&&!s.combat.busy&&!s.combat.battleOver){await p.locator('[data-main="fight"]').click();await settle(p,100);const mv=['blood','bite','octopus','revenge'][Math.floor(rng()*3)];await p.locator(`[data-move="${mv}"]`).click();await settle(p,1300);continue;}
   await settle(p,500);continue;}
  if(s.scene==='adventure'||s.advScene){
   if(s.choices.length){const en=s.choices.map((c,i)=>[c,i]).filter(([c])=>!c.disabled);const pick=en[Math.floor(rng()*en.length)]?.[1]??0;await p.locator('.adv-choice').nth(pick).click();await settle(p,160);continue;}
   await p.locator('#adventureScene').click({position:{x:Math.round(p.viewportSize().width/2),y:Math.round(p.viewportSize().height*.4)}}).catch(()=>{});await settle(p,110);continue;}
  if(s.scene==='bedroom'){
   if(!s.started){await settle(p,400);continue;} // prologue/first wake owns the room until the life clock starts
   if(s.returnCard){await p.locator('.bedroom-return').click();await settle(p,300);continue;}
   if(s.mail){await p.locator('.mail-done').click();await settle(p,500);continue;}
   if(s.bedConfirm&&/THAT WAS A NIGHT/.test(s.sig)){return {night:true,...seen};}
   if(s.castle){await p.locator('.castle-menu [data-castle="close"]').click();await settle(p,200);continue;}
   if(s.phone){return {phoneOpen:true,...seen};}
   if(!s.adv)return {idle:true,...seen};
   await settle(p,300);continue;}
  // Any other scene (legacy trips, rave, property, reveal, docks…): press the visible control a player would.
  // Only controls a thumb can actually reach: topmost at their centre (covered legacy UI underneath is ignored).
  const targets=await p.evaluate(()=>{const W=innerWidth,H=innerHeight,out=[];
   for(const el of document.querySelectorAll('#screen button, #stage button, #screen [class*="dialogue"], #screen [class*="advance"], #screen [data-hotspot]')){
    const r=el.getBoundingClientRect();if(r.width<4||r.height<4||r.right<0||r.bottom<0||r.left>W||r.top>H)continue;if(/DEV|RESET/i.test(el.textContent||'')||el.closest('#devPanel'))continue;
    const x=Math.min(W-2,Math.max(1,r.left+r.width/2)),y=Math.min(H-2,Math.max(1,r.top+r.height/2));const top=document.elementFromPoint(x,y);if(!top||!(el===top||el.contains(top)))continue;if(el.disabled)continue;
    out.push({x,y,button:el.tagName==='BUTTON'});}return out;});
  const btnT=targets.filter(t=>t.button),pool=btnT.length&&rng()<.7?btnT:targets;
  if(pool.length){const t=pool[Math.floor(rng()*pool.length)];await p.mouse.click(t.x,t.y);await settle(p,400);continue;}
  await p.mouse.click(p.viewportSize().width/2,p.viewportSize().height*.45);await settle(p,300);
 }
 finding('PLAYTEST BLOCKER','DRIVE-BUDGET',`${where}: did not return to an idle bedroom within budget`);await snap(p,`budget-${where}`);return {budget:true,...seen};
}

async function openPhone(p){if(!(await probe(p)).phone){await p.locator('#checkPhone').click();await settle(p,350);}return (await probe(p)).phone;}
async function phoneClick(p,action){const b=p.locator(`#phoneContent [data-phone-action="${action}"]`);if(!await b.count())return false;await b.first().click();await settle(p,300);return true;}
async function closePhone(p){if((await probe(p)).phone){const c=p.locator('#phoneContent [data-phone-action="close"], #phoneClose');await c.first().click().catch(()=>p.evaluate(()=>RAPhone.close()));await settle(p,350);}}
async function sleepNight(p,where){
 const before=(await probe(p)).day;
 const confirm=await p.locator('.bed-confirm').count();if(!confirm){await p.locator('.bedroom-sleep').click();await settle(p,200);}
 await p.locator('[data-bed="yes"]').click();await settle(p,3800);
 const after=await probe(p);
 if(after.scene==='bedroom'&&after.day!==before+1&&!/fame|ending/i.test(after.body))finding('PLAYTEST BLOCKER','DAY-ADVANCE',`${where}: day ${before} → ${after.day}`);
 return after;
}

// ---------- scenarios ----------
async function scenarioNewGame(size,{steal='no'}={}){
 const p=await newPage(size);const rng=rngFrom(SEED+size);await p.goto(base+'/');await settle(p,500);
 const build=await p.evaluate(()=>window.RABuild||null);note(`[newgame ${size}] build ${build?.releaseId||'?'} commit ${build?.commit?.slice(0,12)||'?'} save v${await p.evaluate(()=>RAState.version)}`);
 await snap(p,'start');await p.locator('#startButton').click();await settle(p,800);
 let s=await probe(p);if(s.scene!=='adventure'||s.adv!=='A00')finding('PLAYTEST BLOCKER','NEWGAME-ROUTE',`${size}: START led to ${s.scene}/${s.adv}`);
 await snap(p,'prologue');
 // Prologue → throne → first wake.
 const r=await drive(p,rng,`newgame-${size}`,{throneSteal:steal,maxSteps:600});
 s=await probe(p);await snap(p,'first-wake');
 const flags=await p.evaluate(()=>({...RAState.get().life.world.flags,started:RAState.get().life.clock.started,day:RALife.today().day,ceo:RAState.get().encounters.ceo_prince}));
 if(!flags.prologueDone||!flags.throneDone||!flags.firstWakeDone||!flags.started||flags.day!==1)finding('PLAYTEST BLOCKER','NEWGAME-FLAGS',`${size}: ${JSON.stringify({p:flags.prologueDone,t:flags.throneDone,w:flags.firstWakeDone,s:flags.started,d:flags.day})}`);
 note(`[newgame ${size}] reached ${s.scene} day ${s.day}; prologue adventures ${[...r.adventures].join(',')}; ceo ${JSON.stringify(flags.ceo)}; steal=${steal}`);
 // Day 1: phone + family ping + VampGPT.
 await openPhone(p);await snap(p,'phone-home');
 const home=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-phone-action]')].map(b=>b.dataset.phoneAction));
 note(`[newgame ${size}] phone home actions: ${home.join(' ')}`);
 if(await phoneClick(p,'app:texts')){await snap(p,'texts');const threads=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-phone-action^="app:texts:"]')].map(b=>b.dataset.phoneAction));if(!threads.length)finding('ENGINEERING BUG — NON-BLOCKING','DAY1-TEXTS',`${size}: no text threads on Day 1`);else{await phoneClick(p,threads[0]);await snap(p,'family-thread');}await phoneClick(p,'home');}
 else finding('PLAYTEST BLOCKER','DAY1-TEXTS-APP',`${size}: TEXTS app missing on Day 1`);
 await phoneClick(p,'app:vampgpt');await phoneClick(p,'prompt');await snap(p,'vampgpt-options');await phoneClick(p,'home');await closePhone(p);
 await invariants(p,`newgame-${size}`,{idle:true});
 const rl=await reloadCheck(p,`newgame-${size}-after-first-wake`);
 note(`[newgame ${size}] refresh → ${rl.scene}, diff ${rl.diff.length}`);
 flushErrors(p,`newgame-${size}`);
 const save=await p.evaluate(()=>localStorage.getItem(RAState.keys.primary));
 await p.context().close();return save;
}
async function scenarioPrologueReload(){
 const p=await newPage(390);const rng=rngFrom(SEED+11);await p.goto(base+'/');await settle(p,400);await p.locator('#startButton').click();await settle(p,700);
 for(let i=0;i<5;i++){await p.locator('#adventureScene').click({position:{x:195,y:340}});await settle(p,120);}
 const before=await p.evaluate(()=>RAAdventures.active());
 await p.reload();await settle(p,400);await p.locator('#startButton').click();await settle(p,800);
 const after=await p.evaluate(()=>({a:RAAdventures.active(),scene:RAScenes.current()}));
 if(after.scene!=='adventure'||after.a?.id!=='A00'||after.a?.node!==before?.node)finding('PLAYTEST BLOCKER','PROLOGUE-RESUME',`mid-prologue refresh: ${before?.id}/${before?.node} → ${after.scene}/${after.a?.id}/${after.a?.node}`);
 else note(`[prologue-reload] mid-prologue refresh resumed A00 at node ${after.a.node}`);
 // Finish the prologue, then refresh during the throne fight.
 const t0=Date.now();while(Date.now()-t0<60000){const s=await probe(p);if(s.scene==='battle'&&!s.advScene)break;if(s.choices.length){await p.locator('.adv-choice').first().click();}else await p.locator('#adventureScene').click({position:{x:195,y:340}}).catch(()=>{});await settle(p,120);}
 await settle(p,800);await p.reload();await settle(p,400);await p.locator('#startButton').click();await settle(p,1000);
 const s=await probe(p);if(s.scene!=='battle')finding('PLAYTEST BLOCKER','THRONE-RESUME',`refresh during throne → ${s.scene}`);else note('[prologue-reload] refresh during the throne fight returns to the throne fight');
 // Lose the throne fight on purpose: RESPAWN must be available (no dead end).
 await p.evaluate(()=>{});
 const r=await drive(p,rng,'prologue-after-refresh',{maxSteps:500});
 const fin=await probe(p);if(!fin.started)finding('PLAYTEST BLOCKER','PROLOGUE-FINISH',`after refresh the new life never started (${fin.scene})`);
 flushErrors(p,'prologue-reload');await p.context().close();
}
// Rich loses the prologue CEO fight: the player must still be able to continue.
async function scenarioThroneDefeat(){
 const p=await newPage(390);await p.goto(base+'/');await settle(p,400);
 await p.evaluate(()=>{RALife.setFlag('prologueDone',true);});
 await p.reload();await settle(p,400);await p.locator('#startButton').click();await settle(p,1200);
 let s=await probe(p);if(s.scene!=='battle'){finding('ENGINEERING BUG — NON-BLOCKING','THRONE-DEFEAT-SETUP',s.scene);await p.context().close();return;}
 // Take hits without attacking: DEFEND/RUN are not moves here, so just wait for enemy turns by using the weakest action repeatedly.
 const t0=Date.now();let sawChoice=false;
 while(Date.now()-t0<90000){s=await probe(p);if(s.choiceOverlay){sawChoice=true;break;}if(s.victory)break;const octo=p.locator('#octopusOverlay.on [data-octo]');if(await octo.count()){await octo.first().click().catch(()=>{});await settle(p,600);continue;}if(s.combat&&!s.combat.busy&&!s.combat.battleOver){await p.locator('[data-main="fight"]').click();await p.locator('[data-move="octopus"]').click();}await settle(p,900);}
 if(sawChoice){await snap(p,'throne-defeat');await p.locator('#choiceNo').click();await settle(p,1200);const still=await probe(p);if(!still.choiceOverlay)finding('PLAYTEST BLOCKER','THRONE-DEFEAT-DEADEND','STAY DEAD removed the respawn choice');await p.locator('#choiceYes').click();await settle(p,1500);s=await probe(p);if(!(s.combat&&!s.combat.battleOver))finding('PLAYTEST BLOCKER','THRONE-RESPAWN','respawn did not restart the fight');else note('[throne-defeat] defeat → STAY DEAD keeps RESPAWN offered → RESPAWN restarts the fight');}
 else note('[throne-defeat] could not lose the throne fight with OCTOPUS-only input within 90s (outcome: '+(s.victory?'victory':'timeout')+')');
 flushErrors(p,'throne-defeat');await p.context().close();
}

// The life loop: real days of bedroom → phone/castle → outings → return → sleep, with refreshes.
const ROUTES=['wwo','wwo','somewhere','somewhere','money','people','app','castle','app'];
async function outing(p,rng,where){
 const kind=ROUTES[Math.floor(rng()*ROUTES.length)];
 if(kind==='castle'){await p.locator('.bedroom-castle').click();await settle(p,300);const rooms=await p.evaluate(()=>[...document.querySelectorAll('.castle-menu [data-castle]')].map(b=>b.dataset.castle).filter(x=>x!=='close'));const pick=rooms[Math.floor(rng()*rooms.length)];
  await p.locator(`.castle-menu [data-castle="${pick}"]`).click();await settle(p,700);const s=await probe(p);
  const answered=await p.locator('.castle-menu .mail-card[disabled]').count();if(answered)note(`[castle] ${where}: ${pick} answered "not tonight."`);
  if(s.scene==='bedroom'&&!s.adv&&!s.phone&&!s.castle)finding('ENGINEERING BUG — NON-BLOCKING','CASTLE-ROOM-NOOP',`${where}: CASTLE → ${pick} did nothing (menu closed, no scene)`);
  return {kind,pick};}
 if(!await openPhone(p)){finding('PLAYTEST BLOCKER','PHONE-OPEN',where);return {kind};}
 if(kind==='wwo'){await phoneClick(p,'app:vampgpt');const lines=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-phone-action^="tempt:"]')].map(b=>b.dataset.phoneAction));if(!lines.length){await closePhone(p);return {kind,none:true};}const pick=lines[Math.floor(rng()*lines.length)];await phoneClick(p,pick);return {kind,pick};}
 if(kind==='money'||kind==='people'||kind==='somewhere'){await phoneClick(p,'app:vampgpt');await phoneClick(p,'prompt');await phoneClick(p,kind);const opts=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent .phone-option-list [data-phone-action]')].filter(b=>!b.classList.contains('destination-locked')).map(b=>b.dataset.phoneAction));if(!opts.length){await closePhone(p);return {kind,none:true};}const pick=opts[Math.floor(rng()*opts.length)];await phoneClick(p,pick);
  const pg=(await probe(p)).phonePage;if(pg==='butterChicken')await phoneClick(p,'letsGo');if(pg==='ogunRaveIntro')await phoneClick(p,'ogunRaveGo');await settle(p,400);
  const s=await probe(p);if(s.phone&&s.phonePage===kind){const msg=await p.evaluate(()=>document.querySelector('#phoneContent .phone-message')?.textContent||'');if(/not tonight/i.test(msg))finding('ENGINEERING BUG — NON-BLOCKING','LANE-OFFERS-UNAVAILABLE',`${where}: ${kind} offered ${pick} but it answers "not tonight"`);}
  return {kind,pick};}
 // app: open a random unlocked app and press through its buttons like a curious player.
 const apps=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent .app-button:not(.app-dormant)')].map(b=>b.dataset.phoneAction));const pick=apps[Math.floor(rng()*apps.length)];
 await phoneClick(p,pick);const trail=[pick];
 for(let depth=0;depth<3;depth++){const s=await probe(p);if(!s.phone)break;
  const acts=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-phone-action]:not([disabled]), #phoneContent [data-jdm-action]:not([disabled]), #phoneContent [data-property-action]:not([disabled])')].map(b=>b.dataset.phoneAction?['phone-action',b.dataset.phoneAction]:b.dataset.jdmAction?['jdm-action',b.dataset.jdmAction]:['property-action',b.dataset.propertyAction]).filter(([k,v])=>v&&!/^(home|close|app:vampgpt)$/.test(v)));
  if(!acts.length)break;const [k,v]=acts[Math.floor(rng()*acts.length)];trail.push(k==='phone-action'?v:`${k}:${v}`);
  await p.locator(`#phoneContent [data-${k}="${v}"]`).first().click().catch(()=>{});await settle(p,300);}
 return {kind,pick:trail.join(' > ')};
}
async function scenarioLife(save){
 const p=await newPage(390);const rng=rngFrom(SEED*13);
 await p.evaluate(s=>{localStorage.setItem('rich_alucard_save_v1',s);},save);await p.goto(base+'/');await settle(p,400);await instrument(p);
 await p.locator('#startButton').click();await settle(p,900);
 const counts={outings:0,adventures:new Set(),minigames:[],fights:0,reloads:0,routes:{}};
 for(let day=0;day<DAYS;day++){
  const where=`life-day${await p.evaluate(()=>RALife.today().day)}`;
  let r=await drive(p,rng,`${where}-wake`);if(r.stuck||r.budget)break;
  const outs=1+Math.floor(rng()*3);
  for(let o=0;o<outs;o++){
   const s0=await probe(p);if(s0.bedConfirm)break;
   const pick=await outing(p,rng,where);counts.routes[pick.kind]=(counts.routes[pick.kind]||0)+1;
   r=await drive(p,rng,`${where}-${pick.kind}`);counts.outings++;r.adventures.forEach(a=>counts.adventures.add(a));counts.minigames.push(...r.minigames.map(m=>m.id));counts.fights+=r.fights;
   note(`[life] ${where} ${pick.kind}${pick.pick?` ${pick.pick}`:''} → ${[...r.adventures].join(',')||'-'}${r.minigames.length?` mg:${r.minigames.map(m=>`${m.id}/${m.exit}`).join(',')}`:''}${r.fights?` fights:${r.fights}`:''}`);
   if(r.stuck||r.budget)break;
   if(r.phoneOpen)await closePhone(p);
   await invariants(p,`${where}-${pick.kind}`,{idle:!r.night});
   if(rng()<.35){const rl=await reloadCheck(p,`${where}-after-${pick.kind}`);counts.reloads++;await drive(p,rng,`${where}-post-reload`);}
   if(r.night)break;
  }
  flushErrors(p,where);
  await closePhone(p);
  const inv=await invariants(p,`${where}-bedtime`,{idle:true});
  const after=await sleepNight(p,where);
  if(!after.started)break;
  if(after.scene!=='bedroom'){note(`[life] after sleep scene is ${after.scene} (ending or wake adventure)`);}
  note(`[life] slept → day ${after.day}; save ${Math.round(inv.bytes/1024)}KB history ${inv.historyLen}`);
 }
 const final=await p.evaluate(()=>{const L=RAState.get().life;return {day:RALife.today().day,money:L.resources.money,followers:L.resources.followers,clout:L.resources.clout,rooms:L.ownership.castleRooms.map(r=>r.id),cars:L.ownership.cars.map(c=>c.id),dragon:L.ownership.dragon?.stage||null,apps:Object.keys(L.phone.apps||{}),adventuresDone:Object.values(L.adventures.records).filter(r=>r.status==='completed').length,receipts:L.receipts.length,people:Object.keys(L.people.records||{}).length+(window.RARelations?.known?.().length||0),songs:(L.creativeLife.music.songs||[]).length,mg:window.__mg};});
 note(`[life] summary ${JSON.stringify({...final,mg:undefined,outings:counts.outings,distinctAdventures:counts.adventures.size,minigames:counts.minigames,fights:counts.fights,reloads:counts.reloads,routes:counts.routes})}`);
 for(const m of final.mg||[])if(m.error)finding('PLAYTEST BLOCKER','MINIGAME-ERROR',`${m.id}: ${m.error}`);
 flushErrors(p,'life');const save2=await p.evaluate(()=>localStorage.getItem(RAState.keys.primary));await p.context().close();return save2;
}

// Nine minigames entered through their player routes from a progressed save.
const MG_ROUTES={
 touge:{setup:()=>{RALife.unlockApp('touge',{silent:true});RACars.buy('s15');},enter:async p=>{await openPhone(p);await phoneClick(p,'app:touge');await phoneClick(p,'do:touge:run:angeles_crest');}},
 garage:{setup:()=>{if(!RACars.owned('supra'))RALife.addCar({id:RACars.SUPRA,make:'Toyota',model:'Supra MK4',short:'SUPRA',price:0,parts:{}});RALife.addMoney(50000);},enter:async p=>{await openPhone(p);await phoneClick(p,'app:jdmImports');await phoneClick(p,'do:cars:garage');}},
 pier:{setup:()=>{RADragon.adoptEgg();RAState.patch('life.ownership.dragon',{...RALife.dragon(),stage:'hatchling',hatched:true});const mm={...(RAState.get().life.minigames||{})};delete mm.pier;RAState.patch('life.minigames',mm);},enter:async p=>{await openPhone(p);await phoneClick(p,'app:vampgpt');await phoneClick(p,'prompt');await phoneClick(p,'somewhere');await phoneClick(p,'go:pier');},adventure:true},
 hatch:{setup:()=>{RADragon.adoptEgg();RAState.patch('life.ownership.dragon',{...RALife.dragon(),stage:'hatchling',hatched:true});RALife.addItem('fish_common',3);},enter:async p=>{await openPhone(p);await phoneClick(p,'app:hatch');await phoneClick(p,'do:hatch:open');}},
 bars:{setup:()=>{RALife.unlockApp('bars',{silent:true});},enter:async p=>{await openPhone(p);await phoneClick(p,'app:bars');const b=p.locator('#phoneContent [data-phone-action^="do:bars:"]');await b.first().click();await settle(p,300);}},
 slurp:{setup:()=>{},enter:async p=>{await openPhone(p);await phoneClick(p,'app:vampgpt');await phoneClick(p,'prompt');await phoneClick(p,'somewhere');await phoneClick(p,'go:slurp');},adventure:true},
 jollof:{setup:()=>{RALife.addMoney(100000);RACastle.buy('kitchen');},enter:async p=>{await p.locator('.bedroom-castle').click();await settle(p,300);await p.locator('.castle-menu [data-castle="castle:kitchen"]').click();await settle(p,500);},adventure:true},
 // Engineering 05: PICKUP's real route — GO SOMEWHERE → VENICE COURTS → RUN PICKUP (first choice).
 pickup:{setup:()=>{},enter:async p=>{await openPhone(p);await phoneClick(p,'app:vampgpt');await phoneClick(p,'prompt');await phoneClick(p,'somewhere');await phoneClick(p,'go:venice');},adventure:true},
 hookah:{setup:()=>{RALife.addMoney(100000);RACastle.buy('hookah_roof');},enter:async p=>{await p.locator('.bedroom-castle').click();await settle(p,300);await p.locator('.castle-menu [data-castle="castle:roof"]').click();await settle(p,500);},adventure:true},
};
// QA HARNESS HARDENING 001 (A1/A3): the semantic success condition each scored minigame must actually produce when
// played with real input. Read from the returned launch result (score / accumulated rewards / finish data) — never from
// the canvas changing (every minigame animates while idle). A run that only times out, quits, or waits for an exit fails.
const MG_EXPECT={
 touge:{kind:'score',min:1,what:'a drift score'},
 slurp:{kind:'score',min:1,what:'a served bowl (bowlsServed)'},
 hookah:{kind:'score',min:2,what:'a stacked ring (sessionStack)'},
 bars:{kind:'score',min:1,what:'a landed rhyme (score)'},
 jollof:{kind:'score',min:1,what:'a scored dish (average)'},
 pickup:{kind:'score',min:1,what:'a made basket (score)'},
 hatch:{kind:'reward',key:'dragonActions',what:'a dragon care action'},
 pier:{kind:'catch',what:'a landed catch'},
 garage:{kind:'parts',what:'an installed part'}
};
function assertMinigameResult(id,mode,res){
 if(mode!=='play'||!res)return;
 const exp=MG_EXPECT[id];if(!exp)return;
 const rew=res.rewards||{};
 if(exp.kind==='score'){
  if(typeof res.score!=='number'||res.score<exp.min)finding('PLAYTEST BLOCKER','MINIGAME-NO-SCORE',`${id}: finished naturally with score ${res.score} — expected ${exp.what}; the mechanic did not land`);
 } else if(exp.kind==='reward'){
  if(!(rew[exp.key]||[]).length)finding('PLAYTEST BLOCKER','MINIGAME-NO-REWARD',`${id}: finished without ${exp.what} (rewards ${JSON.stringify(rew)})`);
 } else if(exp.kind==='catch'){
  const counts=(res.data&&res.data.counts)||{},items=Object.keys(rew.items||{});
  if(!Object.keys(counts).length&&!items.length&&!rew.money)finding('PLAYTEST BLOCKER','MINIGAME-NO-CATCH',`${id}: finished without landing a catch (counts ${JSON.stringify(counts)}, rewards ${JSON.stringify(rew)})`);
 } else if(exp.kind==='parts'){
  const parts=(res.data&&res.data.parts)||{};
  if(!Object.keys(parts).length)finding('PLAYTEST BLOCKER','MINIGAME-NO-CONSEQUENCE',`${id}: finished with no installed part (data ${JSON.stringify(res.data)})`);
 }
}
async function scenarioMinigames(save){
 const results={};
 for(const [id,route] of Object.entries(MG_ROUTES).filter(([id])=>!args.mg||String(args.mg).split(',').includes(id))){
  for(const mode of ['play','quit']){
   const p=await newPage(390);const rng=rngFrom(SEED+id.length*7+(mode==='quit'?1:0));
   await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);await p.goto(base+'/');await settle(p,400);
   await p.evaluate(`(${route.setup.toString()})()`);await p.reload();await settle(p,400);await instrument(p);
   await p.locator('#startButton').click();await settle(p,900);await drive(p,rng,`mg-${id}-pre`);
   const before=await p.evaluate(()=>({money:RALife.money(),progress:JSON.stringify(RAState.get().life.minigames||{}),items:JSON.stringify(RAState.get().life.ownership.items),dragon:JSON.stringify(RAState.get().life.ownership.dragon)}));
   await route.enter(p);
   let s=await probe(p);
   // Adventure routes: tap through to the minigame node.
   const t0=Date.now();while(!s.minigame&&Date.now()-t0<25000&&(s.scene==='adventure'||s.advScene)){if(s.choices.length)await p.locator('.adv-choice:not([disabled])').first().click();else await p.locator('#adventureScene').click({position:{x:195,y:340}}).catch(()=>{});await settle(p,150);s=await probe(p);}
   if(!s.minigame){finding('PLAYTEST BLOCKER','MINIGAME-ROUTE',`${id}: player route did not launch the minigame (scene ${s.scene}/${s.adv||'-'}/${s.node||'-'}, phone ${s.phonePage||'-'})`);await snap(p,`mg-route-${id}`);flushErrors(p,`mg-${id}`);await p.context().close();results[id]={...(results[id]||{}),[mode]:'ROUTE FAIL'};continue;}
   await snap(p,`mg-${id}-${mode}-in`);
   const r=await playMinigame(p,id,rng,{budgetMs:mode==='quit'?1500:({touge:Number(args.tougeMs||300000),bars:80000,slurp:70000,pier:70000,jollof:60000,pickup:90000}[id]||40000),preferQuit:mode==='quit'});
   await snap(p,`mg-${id}-${mode}-out`);
   const d=await drive(p,rng,`mg-${id}-${mode}-return`);
   const after=await p.evaluate(()=>({money:RALife.money(),progress:JSON.stringify(RAState.get().life.minigames||{}),mg:window.__mg,scene:RAScenes.current(),items:JSON.stringify(RAState.get().life.ownership.items),dragon:JSON.stringify(RAState.get().life.ownership.dragon)}));
   await invariants(p,`mg-${id}-${mode}`,{idle:!d.night});
   const rl=await reloadCheck(p,`mg-${id}-${mode}`);
   const res=after.mg.find(m=>m.id===id);
   results[id]={...(results[id]||{}),[mode]:{exit:r.exit,canvasResponded:r.changed,outcome:res?.outcome,quit:res?.quit,score:res?.score,rewards:res?.rewards,moneyDelta:after.money-before.money,progressSaved:after.progress!==before.progress,itemsChanged:after.items!==before.items,dragonChanged:after.dragon!==before.dragon,returnScene:after.scene,advAfter:[...d.adventures].join(','),reloadDiff:rl.diff.length}};
   note(`[minigame] ${id} ${mode}: ${JSON.stringify(results[id][mode])}`);
   // A1/A3: success is proven by the returned result/reward/state, not by the canvas animating. Canvas change is kept
   // only as a rendering diagnostic (idle animations change it too, so it is never the proof that input was accepted).
   if(!r.changed&&mode==='play')note(`[minigame] ${id}: canvas hash unchanged (rendering diagnostic only)`);
   assertMinigameResult(id,mode,res);
   flushErrors(p,`mg-${id}-${mode}`);await p.context().close();
  }
 }
 if(args.mg)return results;
 // Every lab entry also opens and quits cleanly (Play Window A surface).
 const p=await newPage(390,{fresh:false});await p.goto(base+'/minigame-lab.html');await settle(p,800);const labIds=await p.evaluate(()=>[...document.querySelectorAll('#labList [data-game]')].map(b=>b.dataset.game));
 for(const id of labIds){await p.locator(`#labList [data-game="${id}"]`).click();await settle(p,500);await p.locator('.ra-minigame-quit').click();await settle(p,300);const back=await p.evaluate(()=>getComputedStyle(document.querySelector('#labMenu')).display!=='none'&&!document.querySelector('.ra-minigame'));if(!back)finding('PLAYTEST BLOCKER','LAB-QUIT',id);}
 note(`[minigame-lab] ${labIds.length} entries open+quit: ${labIds.join(',')}`);flushErrors(p,'minigame-lab');await p.context().close();
 return results;
}

// Save migration: every legacy fixture loads in the real page, starts, and survives a refresh.
async function scenarioMigration(){
 const p=await newPage(390);await p.goto(base+'/');await settle(p,300);
 const ids=await p.evaluate(()=>Object.keys(RASaveFixtures.fixtures));await p.context().close();
 for(const id of ids){const q=await newPage(390);await q.goto(base+'/');
  const ok=await q.evaluate(id=>{const f=RASaveFixtures.fixtures[id];localStorage.setItem(RAState.keys.primary,typeof f==='string'?f:JSON.stringify(f));return true;},id);
  await q.goto(base+'/');await settle(q,400);const status=await q.evaluate(()=>({...RAState.getLoadStatus(),version:RAState.get().version,started:RAState.get().life.clock.started}));
  await q.locator('#startButton').click();await settle(q,1200);const s=await probe(q);
  const r=await drive(q,rngFrom(3),`migration-${id}`,{maxSteps:300});
  const s2=await probe(q);let rl={diff:[]};if(s2.scene==='bedroom'&&s2.started)rl=await reloadCheck(q,`migration-${id}`);
  note(`[migration] ${id}: load ${status.source}${status.migrated?' (migrated)':''}${status.recovered?' (recovered)':''} → v${status.version}, START → ${s.scene}${s.adv?'/'+s.adv:''} → ${s2.scene} day ${s2.day}, refresh diff ${rl.diff.length}`);
  if(status.version!==await q.evaluate(()=>RAState.version))finding('PLAYTEST BLOCKER','MIGRATION',`${id} → v${status.version}`); // IF-1 (F00): was a stale literal 12
  // HQ (Engineering 05): a paused Supra acquisition is existing progress — START must not replay the new prologue.
  if(id==='supraPaused'&&(!status.started||s.adv==='A00'||s.scene==='battle'))finding('PLAYTEST BLOCKER','MIGRATION-PROLOGUE',`supraPaused replays the prologue (started ${status.started}, START → ${s.scene}/${s.adv||'-'})`);
  if(id==='supraPaused')note(`[migration] supraPaused: clock started ${status.started}, START → ${s.scene}/${s.adv||'-'} (no prologue)`);
  flushErrors(q,`migration-${id}`);await q.context().close();}
}

// Presentation at the three supported phone widths on key player surfaces.
async function scenarioWidths(save){
 for(const size of [360,390,430]){const p=await newPage(size);await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);await p.goto(base+'/');await settle(p,400);await p.locator('#startButton').click();await settle(p,900);await drive(p,rngFrom(size),`widths-${size}`);
  const checks=[];const measure=async name=>{const m=await p.evaluate(()=>{const W=innerWidth,H=innerHeight;const bad=[];const layer=document.querySelector('#phoneOverlay.open')?'#phoneOverlay.open button':document.querySelector('.castle-menu')?'.castle-menu button, .castle-menu .mail-card':document.querySelector('.bed-confirm')?'.bed-confirm button':'#screen button:not([hidden]), .mail-card, .mail-done';const scrolls=el=>{for(let n=el.parentElement;n;n=n.parentElement){const o=getComputedStyle(n).overflowY;if((o==='auto'||o==='scroll')&&n.scrollHeight>n.clientHeight)return n;}return null;};
  for(const el of document.querySelectorAll(layer)){const r=el.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(el).visibility==='hidden')continue;const sc=scrolls(el);if(sc){el.scrollIntoView({block:'nearest'});}const rr=el.getBoundingClientRect();if(rr.right>W+1||rr.left<-1||rr.bottom>H+1||rr.top<-1)bad.push(`${el.className||el.tagName}:${Math.round(rr.left)},${Math.round(rr.top)},${Math.round(rr.right)},${Math.round(rr.bottom)}`);const r2=rr;const cx=Math.min(W-1,Math.max(0,r2.left+r2.width/2)),cy=Math.min(H-1,Math.max(0,r2.top+r2.height/2));const top=document.elementFromPoint(cx,cy);if(top&&!el.contains(top)&&!top.contains(el)&&rr.bottom<=H&&rr.right<=W&&rr.left>=0)bad.push(`covered ${String(el.className).slice(0,30)} by ${String(top.className||top.tagName).slice(0,30)}`);}return {bad,scrollW:document.documentElement.scrollWidth,W};});if(m.scrollW>m.W+1)m.bad.push(`horizontal scroll ${m.scrollW}>${m.W}`);checks.push([name,m.bad]);await snap(p,`width-${name}`);};
  await measure('bedroom');await p.locator('.bedroom-castle').click();await settle(p,300);await measure('castle-menu');await p.locator('.castle-menu [data-castle="close"]').click();await settle(p,200);
  await openPhone(p);await measure('phone-home');await phoneClick(p,'app:vampgpt');await phoneClick(p,'prompt');await measure('vampgpt-options');await phoneClick(p,'somewhere');await measure('go-somewhere');await phoneClick(p,'home');
  for(const app of ['app:texts','app:receipts','app:realEstate','app:jdmImports']){if(await phoneClick(p,app)){await measure(app);await phoneClick(p,'home');}}
  await closePhone(p);await p.locator('.bedroom-sleep').click();await settle(p,200);await measure('bed-confirm');await p.locator('[data-bed="no"]').click().catch(()=>{});
  // Minigame surfaces: the canvas fits the phone and QUIT stays on screen and tappable.
  await p.goto(base+'/minigame-lab.html');await settle(p,800);const ids=await p.evaluate(()=>[...document.querySelectorAll('#labList [data-game]')].map(b=>b.dataset.game));
  for(const id of ids){await p.locator(`#labList [data-game="${id}"]`).click();await settle(p,600);const m=await p.evaluate(()=>{const W=innerWidth,H=innerHeight,c=document.querySelector('.ra-minigame canvas')?.getBoundingClientRect(),q=document.querySelector('.ra-minigame-quit')?.getBoundingClientRect();const bad=[];if(!c)bad.push('no canvas');else if(c.left<-1||c.right>W+1||c.top<-1||c.bottom>H+1)bad.push(`canvas ${Math.round(c.left)},${Math.round(c.top)},${Math.round(c.right)},${Math.round(c.bottom)} in ${W}x${H}`);if(!q||q.bottom>H||q.right>W||q.top<0)bad.push('QUIT off screen');else{const top=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);if(!top?.closest('.ra-minigame-quit'))bad.push('QUIT covered');}return bad;});checks.push([`minigame:${id}`,m]);await snap(p,`width-mg-${id}`);await p.locator('.ra-minigame-quit').click();await settle(p,300);}
  for(const [name,bad] of checks)if(bad.length)finding('ROUGHNESS / POLISH','LAYOUT',`${size} ${name}: ${bad.slice(0,4).join(' | ')}`);
  note(`[widths ${size}] ${checks.map(([n,b])=>`${n}:${b.length?'ISSUES '+b.length:'ok'}`).join(' ')}`);
  flushErrors(p,`widths-${size}`);await p.context().close();}
}

// Legacy/accepted flows kept inside the new life: Butter Chicken trip, Ogun's Rave (PLAYER-BLIND), the Supra
// (JDMIMPORTS) and The Property (PLAYER-BLIND). Entered from the phone like a player; report ids/flags only.
async function scenarioLegacy(save){
 const p=await newPage(390);const rng=rngFrom(SEED*29);await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);await p.goto(base+'/');await settle(p,400);await p.locator('#startButton').click();await settle(p,900);await drive(p,rng,'legacy-pre');
 const flags=()=>p.evaluate(()=>{const L=RAState.get().life;return {day:RALife.today().day,desires:L.desires.completed.map(d=>d.id||d.desireId||'?'),night:L.night.completed.map(n=>n.id),cars:L.ownership.cars.map(c=>c.id),props:L.ownership.properties.map(x=>`${x.id}:${x.ownershipStatus}`),acq:L.acquisitions.active?.status||null,prop:L.property.active?.status||null,money:L.resources.money};});
 const run=async(name,enter)=>{const before=await flags();const ok=await enter();if(ok===false){note(`[legacy] ${name}: entry not offered on day ${before.day}`);await closePhone(p);return;}const r=await drive(p,rng,`legacy-${name}`,{maxSteps:1200});if(r.phoneOpen)await closePhone(p);await invariants(p,`legacy-${name}`,{idle:!!r.idle});const rl=await reloadCheck(p,`legacy-${name}`);await drive(p,rng,`legacy-${name}-post`);const after=await flags();note(`[legacy] ${name}: ${r.stuck?'STUCK':r.budget?'BUDGET':'returned'}; ${JSON.stringify(before)} → ${JSON.stringify(after)}; refresh diff ${rl.diff.length}`);flushErrors(p,`legacy-${name}`);};
 const somewhere=async(id,go)=>{await openPhone(p);await phoneClick(p,'app:vampgpt');await phoneClick(p,'prompt');await phoneClick(p,'somewhere');const has=await p.locator(`#phoneContent [data-phone-action="${id}"].destination-available`).count();if(!has)return false;await phoneClick(p,id);return phoneClick(p,go);};
 await run('butter-chicken',()=>somewhere('atlanta','letsGo'));
 // Ogun's Rave invite lands on the first Friday (Day 2).
 if((await probe(p)).day<2)await sleepNight(p,'legacy');await drive(p,rng,'legacy-wake');
 // The invite arrives as an INCOMING phone message; accepting it is the player step that opens the night.
 await openPhone(p);const inc=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-phone-action^="openWorldEvent:"]')].map(b=>b.dataset.phoneAction));note(`[legacy] incoming on day ${(await probe(p)).day}: ${inc.length}`);for(const a of inc){await phoneClick(p,a);const acts=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-phone-action^="resolveWorldEvent:"]')].map(b=>b.dataset.phoneAction));if(acts[0])await phoneClick(p,acts[0]);}await closePhone(p);
 await run('ogun-rave',()=>somewhere('ogun_rave','ogunRaveGo'));
 await run('supra',async()=>{await openPhone(p);await phoneClick(p,'app:jdmImports');const acts=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-jdm-action]:not([disabled])')].map(b=>b.dataset.jdmAction).filter(a=>a!=='home'));note(`[legacy] JDMIMPORTS actions: ${acts.join(',')}`);if(!acts.length)return false;await p.locator(`#phoneContent [data-jdm-action="${acts[0]}"]`).click();await settle(p,500);return true;});
 if(await p.evaluate(()=>RAState.get().life.acquisitions.active?.status==='paused'))await run('supra-resume',async()=>{await openPhone(p);await phoneClick(p,'app:jdmImports');const acts=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-jdm-action]:not([disabled])')].map(b=>b.dataset.jdmAction).filter(a=>a!=='home'));note(`[legacy] JDMIMPORTS actions after pause: ${acts.join(',')}`);if(!acts.length)return false;await p.locator(`#phoneContent [data-jdm-action="${acts[0]}"]`).click();await settle(p,500);return true;});
 await run('property',async()=>{await openPhone(p);await phoneClick(p,'app:realEstate');const acts=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-property-action]:not([disabled]), #phoneContent [data-phone-action^="do:realestate"]:not([disabled])')].map(b=>b.dataset.propertyAction||b.dataset.phoneAction));note(`[legacy] RealMoneyRealEstate actions: ${acts.join(',')}`);const a=acts.find(x=>x==='see')||acts[0];if(!a)return false;await p.locator(`#phoneContent [data-property-action="${a}"], #phoneContent [data-phone-action="${a}"]`).first().click();await settle(p,500);return true;});
 await p.context().close();
}

// Each life lane through its player entry, with the smallest progress a real life would already have (setup is
// state only; every step after it is a real tap). Reports lane state fields, never authored text.
async function scenarioSystems(save){
 const p=await newPage(390);const rng=rngFrom(SEED*31);await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);await p.goto(base+'/');await settle(p,400);
 await p.evaluate(()=>{RALife.addMoney(900000);for(const r of ['music_room','kitchen','hookah_roof','movie_room','garage','dragon_roost'])RACastle.buy(r);RADragon.adoptEgg();RALife.remember({text:'qa seed night out',lane:'people'});});
 await p.reload();await settle(p,400);await p.locator('#startButton').click();await settle(p,900);await drive(p,rng,'systems-pre');
 const lane=()=>p.evaluate(()=>{const L=RAState.get().life,m=L.creativeLife.music;return {day:RALife.today().day,cooked:(m.cooked||[]).length,drops:(m.drops||[]).length,songs:(m.songs||[]).map(s=>s.id),radio:RALife.appUnlocked('radio'),followers:L.resources.followers,dragon:L.ownership.dragon&&{stage:L.ownership.dragon.stage,hatched:L.ownership.dragon.hatched,fedDay:L.ownership.dragon.fedDay,sleeps:L.ownership.dragon.sleepsAtStage},cars:L.ownership.cars.map(c=>c.id),props:L.ownership.properties.map(x=>x.id),dates:Object.values(L.people.records||{}).reduce((n,r)=>n+(r.datesCount||0),0),rooms:L.ownership.castleRooms.length,hosting:!!L.world.flags.castlePartyHostingUnlocked,eco:L.ecology,momentum:Object.fromEntries(['expression','connection','ownership','legend','chaos'].map(k=>[k,L.momentum[k]]))};});
 const step=async(name,enter)=>{const before=await lane();const ok=await enter();if(ok===false){note(`[systems] ${name}: entry not available`);await closePhone(p);return;}const r=await drive(p,rng,`systems-${name}`,{maxSteps:1000});if(r.phoneOpen)await closePhone(p);await invariants(p,`systems-${name}`,{idle:!!r.idle});const after=await lane();const changed=Object.keys(after).filter(k=>JSON.stringify(after[k])!==JSON.stringify(before[k]));note(`[systems] ${name}: ${[...r.adventures].join(',')||'-'}${r.minigames.length?' mg:'+r.minigames.map(m=>`${m.id}/${m.exit}`).join(','):''}${r.fights?' fights:'+r.fights:''} → changed ${changed.map(k=>`${k}=${JSON.stringify(after[k])}`).join(' ')||'nothing'}`);flushErrors(p,`systems-${name}`);};
 const castle=room=>async()=>{await p.locator('.bedroom-castle').click();await settle(p,300);const b=p.locator(`.castle-menu [data-castle="${room}"]`);if(!await b.count()){await p.locator('.castle-menu [data-castle="close"]').click();return false;}await b.click();await settle(p,600);return true;};
 // MUSIC: cook in the Music Room → drop → catalog/radio; reactions arrive over the next wakes.
 await step('music-cook',castle('castle:music'));
 await step('radio',async()=>{await openPhone(p);if(!await phoneClick(p,'app:radio'))return false;const t=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-phone-action^="do:radio:play:"]')].map(b=>b.dataset.phoneAction));if(t[0])await phoneClick(p,t[0]);await phoneClick(p,'home');await closePhone(p);return true;});
 // DRAGON: the egg hatches at a wake after three sleeps (A11 wake trigger), then HATCH care.
 for(let i=0;i<3;i++){await sleepNight(p,'systems');const r=await drive(p,rng,'systems-wake');if(r.adventures.size)note(`[systems] wake day ${(await probe(p)).day}: ${[...r.adventures].join(',')}`);}
 note(`[systems] after 3 sleeps: ${JSON.stringify(await lane())}`);
 await p.evaluate(()=>RALife.addItem('fish_common',3));
 await step('hatch-care',async()=>{await openPhone(p);await phoneClick(p,'app:hatch');return phoneClick(p,'do:hatch:open');});
 await step('roost',castle('castle:roost'));
 // DATING: a met, dateable person → InstaHoe → ASK HER OUT → the date.
 const person=await p.evaluate(()=>{const id=RABtfPeople.women?.[0]?.id;if(!id)return null;RARelations.meet(id,'qa');RALife.unlockApp('instahoe',{silent:true});return id;});
 if(person){await sleepNight(p,'systems');await drive(p,rng,'systems-wake');
  await step('date',async()=>{await openPhone(p);if(!await phoneClick(p,'app:instahoe'))return false;if(!await phoneClick(p,`app:instahoe:p:${person}`))return false;return phoneClick(p,`do:instahoe:date:${person}`);});}
 else note('[systems] date: no dateable catalog accessor found');
 // PROPERTY listings (Shannon lane) and CARS/imports.
 await step('property-viewing',async()=>{await openPhone(p);await phoneClick(p,'app:realEstate');const see=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-phone-action^="do:realestate:see:"]:not([disabled])')].map(b=>b.dataset.phoneAction));note(`[systems] listings offered: ${see.length}`);if(!see.length)return false;return phoneClick(p,see[0]);});
 await step('richboi',async()=>{await p.evaluate(()=>RALife.unlockApp('richboi',{silent:true}));await openPhone(p);if(!await phoneClick(p,'app:richboi'))return false;return phoneClick(p,'do:richboi:buy:urus');});
 await step('touge-urus',async()=>{await openPhone(p);if(!await phoneClick(p,'app:touge'))return false;const cars=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-phone-action^="do:touge:car:"]')].map(b=>b.dataset.phoneAction));const u=cars.find(c=>/urus/.test(c));if(u)await phoneClick(p,u);return phoneClick(p,'do:touge:run:grave_garage');});
 // HOSTING: once hosting is unlocked the Party Hall can be built and hosted.
 await p.evaluate(()=>{RALife.setFlag('castlePartyHostingUnlocked',true);RACastle.buy('party_hall');});
 await step('host-party',castle('castle:party'));
 await step('kitchen',castle('castle:kitchen'));
 await step('movie',castle('castle:movie'));
 await reloadCheck(p,'systems-end');
 note(`[systems] final ${JSON.stringify(await lane())}`);
 flushErrors(p,'systems');await p.context().close();
}

// A morning with a wake adventure, refreshed while the Morning Mail is up: the day's wake adventure must survive.
async function scenarioWakeReload(save){
 const p=await newPage(390);await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);await p.goto(base+'/');await settle(p,400);
 await p.evaluate(()=>{RADragon.adoptEgg();RAState.patch('life.ownership.dragon',{...RALife.dragon(),sleepsAtStage:3});});
 await p.reload();await settle(p,400);await p.locator('#startButton').click();await settle(p,900);await drive(p,rngFrom(8),'wake-reload-pre');
 await p.locator('.bedroom-sleep').click();await p.locator('[data-bed="yes"]').click();await settle(p,3600);
 const offered=await p.evaluate(()=>({mail:!!document.querySelector('.morning-mail'),button:document.querySelector('.mail-done')?.textContent,wake:RALife.flag('wakeTrigger')}));
 await p.reload();await settle(p,400);await p.locator('#startButton').click();await settle(p,1200);
 const after=await p.evaluate(()=>({mail:!!document.querySelector('.morning-mail'),button:document.querySelector('.mail-done')?.textContent}));
 if(await p.locator('.mail-done').count())await p.locator('.mail-done').click();await settle(p,900);
 const s=await probe(p);const ran=s.adv||null;
 note(`[wake-reload] after sleep: wake trigger ${JSON.stringify(offered.wake)} button "${offered.button}"; refresh during mail → button "${after.button}" → GET UP → ${ran?`adventure ${ran}`:'no adventure'}`);
 if(offered.wake?.id&&ran!==offered.wake.id)finding('PLAYTEST BLOCKER','WAKE-EVENT-LOST-ON-REFRESH',`refresh during Morning Mail dropped the day's wake adventure ${offered.wake.id}`);
 await drive(p,rngFrom(9),'wake-reload-post');flushErrors(p,'wake-reload');await p.context().close();
}

// The protected ending (RECEIPTS credits) through a real SLEEP, then the life after it. Report stays content-free.
async function scenarioEnding(save){
 const p=await newPage(390);await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);await p.goto(base+'/');await settle(p,400);
 // Setup only: a progressed life at the ending's day floor with momentum already lived (what the persona sims reach).
 await p.evaluate(()=>{const m={...RAState.get().life.momentum,expression:5,connection:5,ownership:5,legend:5};RAState.patch('life.momentum',m);RAState.patch('life.world.day',Math.max(35,RALife.today().day));RAState.patch('life.clock.lastWakeDay',RALife.today().day);});
 await p.reload();await settle(p,400);await p.locator('#startButton').click();await settle(p,900);await drive(p,rngFrom(5),'ending-pre');
 const day0=(await probe(p)).day;await p.locator('.bedroom-sleep').click();await p.locator('[data-bed="yes"]').click();await settle(p,2500);
 const fired=await p.locator('.fame-ending').count();
 if(!fired){finding('ENGINEERING BUG — NON-BLOCKING','ENDING-NOT-CLAIMED',`eligible life slept on day ${day0} without the ending`);await p.context().close();return;}
 const t0=Date.now();while(Date.now()-t0<90000&&!(await p.locator('.fame-continue').count()))await settle(p,1000);
 if(!(await p.locator('.fame-continue').count())){finding('PLAYTEST BLOCKER','ENDING-NO-EXIT','ending never offered a way to continue');await snap(p,'ending-stuck');await p.context().close();return;}
 note(`[ending] fired on sleep after day ${day0}; continue offered after ${Math.round((Date.now()-t0)/1000)}s`);
 await p.locator('.fame-continue').click();await settle(p,800);const s=await probe(p);
 const st=await p.evaluate(()=>({fired:RAState.get().life.momentum.fameFired,day:RALife.today().day}));
 await drive(p,rngFrom(6),'ending-after');await invariants(p,'ending-after',{idle:true});
 await reloadCheck(p,'ending-after');await drive(p,rngFrom(7),'ending-after-reload');
 await p.locator('.bedroom-sleep').click();await p.locator('[data-bed="yes"]').click();await settle(p,4000);
 const again=await p.locator('.fame-ending').count();if(again)finding('PLAYTEST BLOCKER','ENDING-REPEATS','the ending replayed on the next sleep');
 // PHASE D: the Thanksgiving gate. Confirm the runtime semantics, then that A53 stays eligible at Day 57 during
 // legitimate post-fame continuation (no `!fameFired` exclusion). This is the regression for the dead-gate fix.
 const a53=await p.evaluate(()=>{RAState.patch('life.world.day',57);RAState.patch('life.clock.lastWakeDay',57);const L=RAState.get().life;return {fameFired:!!L.momentum.fameFired,available:RAAdventures.available('A53',{ignoreActive:true})};});
 if(!a53.fameFired)finding('ENGINEERING BUG — NON-BLOCKING','ENDING-FLAG','fameFired was not set after the ending');
 if(!a53.available)finding('PLAYTEST BLOCKER','A53-DEAD-GATE','A53 is not eligible at Day 57 after the fame ending (dead gate)');
 else note('[thanksgiving] A53 becomes eligible at Day 57 during post-fame continuation');
 const s2=await probe(p);note(`[ending] continue → ${s.scene} day ${st.day} (fameFired ${st.fired}); refresh ok; next sleep → ${s2.scene} day ${s2.day}, ending replay ${again?'YES':'no'}`);
 flushErrors(p,'ending');await p.context().close();
}

// Static: every authored adventure id should be named by some entry (place, lane, temptation, wake trigger, chain,
// system call). Ids named nowhere but their own definition have no player path (DEV only).
// ---------- Engineering 05: the HQ routes, each encountered through real player taps ----------
async function advPrefer(p,rng,where,prefer,{maxSteps=400}={}){
 // Tap through the current adventure; at a choice, take the one whose text matches `prefer` (else any enabled).
 for(let i=0;i<maxSteps;i++){const s=await probe(p);if(!(s.scene==='adventure'||s.advScene)||s.minigame||s.c2)return s;
  if(s.choices.length){const texts=await p.locator('.adv-choice').allInnerTexts();let k=texts.findIndex((t,j)=>prefer.test(t)&&!s.choices[j]?.disabled);if(k<0)k=s.choices.findIndex(c=>!c.disabled);await p.locator('.adv-choice').nth(Math.max(0,k)).click();await settle(p,160);continue}
  await p.locator('#adventureScene').click({position:{x:Math.round(p.viewportSize().width/2),y:Math.round(p.viewportSize().height*.4)}}).catch(()=>{});await settle(p,110);}
 return probe(p);
}
// Recorded outcome of the PLAYER-BLIND Ogun's Rave (exercised for function in --only legacy); routes build on it.
const ogunSeed=()=>{RAState.patch('life.world.flags.ogunsRaveCompleted',true);RAState.patch('life.world.flags.castlePartyHostingUnlocked',true);RALife.unlockApp('vampgram',{silent:true});};
async function routeOpen(p,save,setup){await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);await p.goto(base+'/');await settle(p,400);if(setup)await p.evaluate(`(${setup.toString()})()`);await p.reload();await settle(p,400);await instrument(p);await p.locator('#startButton').click();await settle(p,900);await drive(p,rngFrom(5),'route-open');}
async function wakeWith(p,rng,where,cardRe){for(let n=0;n<16;n++){await drive(p,rng,`${where}-pre${n}`);await sleepNight(p,where);const card=p.locator('.morning-mail .mail-card',{hasText:cardRe});if(await card.count()){await card.first().click();await settle(p,600);return true}await drive(p,rng,`${where}-mail${n}`);}return false}
const toVamp=async(p,...steps)=>{await openPhone(p);await phoneClick(p,'app:vampgpt');for(const a of steps)await phoneClick(p,a);};
async function scenarioRoutes(save){
 const results={};
 const check=async(p,name,ids)=>{const rng=rngFrom(SEED+name.length);const d=await drive(p,rng,`route-${name}-return`);await invariants(p,`route-${name}`,{idle:!d.night});const rl=await reloadCheck(p,`route-${name}`);
  const got=await p.evaluate(ids=>Object.fromEntries(ids.map(i=>[i,!!RAAdventures.isDone(i)])),ids);results[name]={completed:got,reloadDiff:rl.diff.length};note(`[route] ${name}: ${JSON.stringify(results[name])}`);
  for(const [i,v] of Object.entries(got))if(!v)finding('PLAYTEST BLOCKER','ROUTE',`${name}: ${i} was not reached through its player route`);await snap(p,`route-${name}`);flushErrors(p,`route-${name}`);await p.context().close();};
 const want=n=>!args.route||String(args.route).split(',').includes(n);
 if(want('emberly')){const p=await newPage(390),rng=rngFrom(11);await routeOpen(p,save,()=>{RADragon.adoptEgg();const r={...RAState.get().life.adventures.records,A09:{status:'completed',count:1,completedDay:1}};RAState.patch('life.adventures.records',r);});
  await toVamp(p,'prompt','somewhere','go:kush');await advPrefer(p,rng,'emberly',/THE BACK ROOM/);await check(p,'emberly',['KUSH','A_EMBERLY1']);}
 if(want('hina')){const p=await newPage(390);await routeOpen(p,save);await toVamp(p,'prompt','somewhere','go:slurp');await check(p,'hina',['A08','A_HINA1']);}
 if(want('jade')){const p=await newPage(390),rng=rngFrom(13);await routeOpen(p,save,()=>{RAState.patch('life.world.flags.ogunsRaveCompleted',true);RAState.patch('life.world.flags.castlePartyHostingUnlocked',true);RADragon.adoptEgg();RALife.addMoney(1000000);RACastle.buy('party_hall');RACastle.buy('dragon_roost');});
  await p.locator('.bedroom-castle').click();await settle(p,300);await p.locator('.castle-menu [data-castle="castle:party"]').click();await settle(p,500);await advPrefer(p,rng,'jade',/DRAGON NIGHT|THAT'S THE LIST|NO MUSIC|OPEN BAR|TUNDE|TWO STEP|LET IT GO/);await check(p,'jade',['A26','A_JADE1']);}
 if(want('lo')){const p=await newPage(390),rng=rngFrom(14);await routeOpen(p,save,ogunSeed);await toVamp(p,'prompt','people','go:lane:party');await drive(p,rng,'lo-1');
  await sleepNight(p,'lo');await drive(p,rng,'lo-wake');await toVamp(p,'prompt','people','go:lane:party');await check(p,'lo-anfeesa',['A_LO1','A55','A_ANFEESA1']);}
  if(want('velvet')){const p=await newPage(390),rng=rngFrom(15);await routeOpen(p,save,ogunSeed);const ok=await wakeWith(p,rng,'velvet',/VELVET/);if(!ok)finding('PLAYTEST BLOCKER','ROUTE','velvet: DM card never reached Morning Mail');
   await p.locator('#phoneContent [data-phone-action="tempt:velvet_dm"]').first().click().catch(()=>{});await settle(p,600);await drive(p,rng,'velvet-dm');
   await openPhone(p);await phoneClick(p,'app:onlyvamps');const ov=await p.evaluate(()=>({text:document.querySelector('#phoneContent')?.innerText||'',creators:RAOnlyVamps.creators().map(c=>({id:c.id,person:c.person||null})),collisions:(document.querySelector('#phoneContent')?.innerText.match(/you know her\. this is weird now\./gi)||[]).length}));
   const named=ov.creators.filter(c=>c.person).map(c=>c.person),anonymous=ov.creators.filter(c=>!c.person);if(/invite only/i.test(ov.text))finding('PLAYTEST BLOCKER','ROUTE','ONLYVAMPS still invite-only after Velvet');if(JSON.stringify(named)!=='["velvet"]')finding('PLAYTEST BLOCKER','ONLYVAMPS-ROSTER',`named creators: ${named.join(', ')||'none'}`);if(!anonymous.length)finding('PLAYTEST BLOCKER','ONLYVAMPS-ROSTER','anonymous creators missing');if(ov.collisions!==1||!/VELVET[\s\S]*you know her\. this is weird now\./i.test(ov.text))finding('PLAYTEST BLOCKER','ONLYVAMPS-COLLISION',`expected Velvet-only collision; count ${ov.collisions}`);
   const anon=anonymous[0]?.id;if(anon){await phoneClick(p,`do:onlyvamps:sub:${anon}`);if(!await p.evaluate(id=>RAOnlyVamps.subbed(id),anon))finding('PLAYTEST BLOCKER','ONLYVAMPS-SUBSCRIBE','anonymous creator subscription failed');const refresh=await reloadCheck(p,'velvet-onlyvamps');await drive(p,rng,'velvet-onlyvamps-reload');await openPhone(p);await phoneClick(p,'app:onlyvamps');if(!await p.evaluate(id=>RAOnlyVamps.subbed(id),anon))finding('PLAYTEST BLOCKER','ONLYVAMPS-RELOAD','anonymous subscription did not survive refresh');await phoneClick(p,`do:onlyvamps:cancel:${anon}`);results.onlyvamps={opens:!/invite only/i.test(ov.text),named,anonymous:anonymous.length,collisions:ov.collisions,refreshDiff:refresh.diff.length};}
   await closePhone(p);await check(p,'velvet',['A_VELVET1']);}
 if(want('a37')){const p=await newPage(390),rng=rngFrom(16);await routeOpen(p,save,()=>{let d=16;while(!RALife.dayInfo(d).friday&&RALife.dayInfo(d).weekday!=='FRIDAY')d++;RAState.patch('life.world.day',d-1);});
  const ok=await wakeWith(p,rng,'a37',/ATLANTA/);if(!ok)finding('PLAYTEST BLOCKER','ROUTE','a37: Friday invite never reached Morning Mail');await p.locator('#phoneContent [data-phone-action="tempt:a37_friday"]').first().click().catch(()=>{});await settle(p,600);await check(p,'a37',['A37']);}
 if(want('a46')){const p=await newPage(390),rng=rngFrom(17);await routeOpen(p,save,()=>{RALife.unlockApp('instahoe',{silent:true});RARelations.meet('kiki','qa');RARelations.add('kiki',60);});const ok=await wakeWith(p,rng,'a46',/take me somewhere special/i);if(!ok)finding('PLAYTEST BLOCKER','ROUTE','a46: her ask never reached Morning Mail');
  await openPhone(p);await phoneClick(p,'app:instahoe');await phoneClick(p,'app:instahoe:p:kiki');await phoneClick(p,'app:instahoe:dm:kiki');const reply=p.locator('#phoneContent [data-phone-action^="do:instahoe:reply:kiki|tempt:a46_special"]');if(await reply.count()){await reply.first().click();await settle(p,800);}
  await advPrefer(p,rng,'a46',/KIKI/);await check(p,'a46',['A46']);}
 if(want('a23r')){const p=await newPage(390),rng=rngFrom(18);await routeOpen(p,save,()=>{const r={...RAState.get().life.adventures.records};for(const id of ['A23','A19','A24'])r[id]={status:'completed',count:1,completedDay:1};RAState.patch('life.adventures.records',r);RALife.setFlag('armoryKnown',true);RALife.addGun('lil_oga');});
  for(let n=0;n<6;n++){await drive(p,rng,`a23r-${n}`);await sleepNight(p,'a23r');await drive(p,rng,`a23r-w${n}`);await openPhone(p);await phoneClick(p,'app:vampgpt');if(await p.locator('#phoneContent [data-phone-action="tempt:a23r_rematch"]').count()){await phoneClick(p,'tempt:a23r_rematch');break}await closePhone(p);}
  await check(p,'a23r',['A23R']);}
 // ---------- Engineering 06 routes (NO PLAYER ENTRY before this pass) — taps only after the declared setup ----------
 const castleGo=async(p,go)=>{await p.locator('.bedroom-castle').click();await settle(p,300);await p.locator(`.castle-menu [data-castle="${go}"]`).click();await settle(p,500);};
 if(want('coffe')){const p=await newPage(390),rng=rngFrom(21);await routeOpen(p,save);await sleepNight(p,'coffe');const done=p.locator('.morning-mail .mail-done');if(await done.count()){await done.click();await settle(p,700);}
  await advPrefer(p,rng,'coffe',/SURE/);await check(p,'coffe',['A29']);}
 if(want('waffle')){const p=await newPage(390),rng=rngFrom(22);await routeOpen(p,save);await toVamp(p,'prompt','somewhere','go:heartsfelt');await advPrefer(p,rng,'waffle',/BOOK A FLIGHT/);await check(p,'waffle',['A44']);}
 if(want('lan')){const p=await newPage(390),rng=rngFrom(23);await routeOpen(p,save,()=>{RARelations.meet('tristan','qa-seed');});await toVamp(p,'prompt','somewhere','go:tristan_apt');await advPrefer(p,rng,'lan',/./);await check(p,'lan',['A50']);}
 if(want('halloween')){const p=await newPage(390),rng=rngFrom(24);await routeOpen(p,save,()=>{RAState.patch('life.world.day',30);});const ok=await wakeWith(p,rng,'halloween',/HALLOWEEN/i);if(!ok)finding('PLAYTEST BLOCKER','ROUTE','halloween: Day 31 invite never reached Morning Mail');
  await p.locator('#phoneContent [data-phone-action="tempt:halloween_invite"]').first().click().catch(()=>{});await settle(p,600);await advPrefer(p,rng,'halloween',/DUOQLO|TWO STEP/);await check(p,'halloween',['A52']);}
 if(want('docks')){const p=await newPage(390),rng=rngFrom(25);await routeOpen(p,save,()=>{RARelations.meet('jdm_importer_daughter_001','qa-seed');});await toVamp(p,'prompt','somewhere','go:docks');await advPrefer(p,rng,'docks',/./);await check(p,'docks',['A_CAMMILE1']);}
 if(want('maid')){const p=await newPage(390),rng=rngFrom(26);await routeOpen(p,save,()=>{RALife.addMoney(100000);RACastle.buy('maid_quarters');});await castleGo(p,'castle:maid');await advPrefer(p,rng,'maid',/HIRE MARISOL/);await drive(p,rng,'maid-back');
  await castleGo(p,'castle:maid');await advPrefer(p,rng,'maid-room',/./);await check(p,'maid',['A39','MAID']);}
 if(want('garage')){const p=await newPage(390),rng=rngFrom(27);await routeOpen(p,save,()=>{RALife.addMoney(300000);RACastle.buy('garage');RACars.buy('s15');});await castleGo(p,'castle:garage');await snap(p,'garage-view');await advPrefer(p,rng,'garage',/I'M GOOD/);await check(p,'garage',['GARAGE_VIEW']);}
 return results;
}

async function reachability(){
 const files=[];const walk=async d=>{for(const e of await readdir(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())await walk(p);else if(p.endsWith('.js'))files.push(p);}};await walk(path.join(root,'js'));
 const src=await Promise.all(files.map(async f=>[f,await readFile(f,'utf8')]));const ids=[];
 for(const [f,s] of src)for(const m of s.matchAll(/D\(\{id:'([A-Za-z0-9_]+)'/g))ids.push([m[1],f]);
 const orphans=ids.filter(([id,f])=>src.reduce((n,[g,s])=>n+Math.max(0,(s.match(new RegExp(`['"]${id}['"]`,'g'))||[]).length-(g===f?1:0)),0)===0).map(([id])=>id);
 note(`[reachability] ${ids.length} literal adventure definitions; no player entry: ${orphans.join(', ')||'none'}`);
 return orphans;
}

// PHASE B: a non-prologue Combat 2 win through REAL browser decisions. ⌂ CASTLE → THRONE → SPAR WITH A TRAINING
// DUMMY is an ordinary OPEN Combat 2 encounter (not Hilt/A23, not the prologue). The dummy (60 HP) is beaten with
// FIGHT → BLOOD BATH; the win must be RECORDED (life.history), not merely that the scene closed.
async function scenarioCombatWin(save){
 const p=await newPage(390);const rng=rngFrom(SEED+41);
 await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);await p.goto(base+'/');await settle(p,400);
 await p.locator('#startButton').click();await settle(p,900);await drive(p,rng,'combat-pre');
 await p.locator('.bedroom-castle').click();await settle(p,300);
 await p.locator('.castle-menu [data-castle="castle:throne"]').click();await settle(p,500);
 let s=await probe(p);const t0=Date.now();
 while(!s.c2&&Date.now()-t0<20000&&(s.scene==='adventure'||s.advScene)){const spar=p.locator('.adv-choice',{hasText:/SPAR/});if(await spar.count())await spar.first().click();else if(s.choices.length)await p.locator('.adv-choice:not([disabled])').first().click();else await p.locator('#adventureScene').click({position:{x:195,y:340}}).catch(()=>{});await settle(p,170);s=await probe(p);}
 if(!await p.locator('.c2-scene').count()){finding('PLAYTEST BLOCKER','COMBAT-ROUTE','SPAR did not reach a Combat 2 fight');await p.context().close();return false;}
 const t1=Date.now();let turns=0;
 while(Date.now()-t1<60000&&!(await p.locator('.c2-scene [data-c2="done"]').count())){
  const octo=p.locator('.c2-octo:not([hidden]) [data-octo]');if(await octo.count()){await octo.first().click().catch(()=>{});await settle(p,400);continue;}
  const fight=p.locator('.c2-scene [data-c2="fight"]');if(await fight.count()){await fight.first().click();await settle(p,120);const blood=p.locator('.c2-scene [data-c2="move:blood"]:not(.c2-off)');if(await blood.count()){await blood.first().click();turns++;}await settle(p,820);continue;}
  await settle(p,200);
 }
 if(await p.locator('.c2-scene [data-c2="done"]').count())await p.locator('.c2-scene [data-c2="done"]').click();
 await settle(p,700);
 const fights=await p.evaluate(()=>(RAState.get().life.history||[]).filter(e=>e.type==='fight').slice(-3));
 const won=fights.some(e=>e.enemy==='training'&&e.outcome==='win');
 if(!won)finding('PLAYTEST BLOCKER','COMBAT-NO-WIN',`SPAR finished without a recorded win (turns ${turns}; ${JSON.stringify(fights)})`);
 else note(`[combat] throne SPAR won through real decisions (FIGHT -> BLOOD BATH) in ${turns} turns; win recorded in life.history`);
 await drive(p,rng,'combat-post');await invariants(p,'combat',{idle:true});flushErrors(p,'combat');await p.context().close();
 return won;
}

// PHASE C1: the real Combat 2 LOSS path → a17Pending → survives refresh → A17 on the next wake. A18 (Forty Kevins,
// 260 HP) is reached through its real GRAVE hub encounter; Rich is lost on purpose by only returning stored damage
// (REVENGE), which cannot out-damage a higher-HP enemy. No balance change.
async function scenarioA17(save){
 const p=await newPage(390);const rng=rngFrom(SEED+42);
 await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);await p.goto(base+'/');await settle(p,400);
 await p.locator('#startButton').click();await settle(p,900);await drive(p,rng,'a17-pre');
 await openPhone(p);await phoneClick(p,'app:vampgpt');await phoneClick(p,'prompt');await phoneClick(p,'somewhere');await phoneClick(p,'go:grave');
 // Advance the GRAVE hub to the A18 encounter, then keep advancing until the fight appears.
 const t0=Date.now();let inFight=false;
 while(Date.now()-t0<30000){const pr=await probe(p);if(pr.c2){inFight=true;break;}const hub=p.locator('.adv-choice',{hasText:/FOOD COURT LINE/});if(await hub.count())await hub.first().click();else if(pr.choices.length)await p.locator('.adv-choice:not([disabled])').first().click();else await p.locator('#adventureScene').click({position:{x:195,y:340}}).catch(()=>{});await settle(p,180);}
 if(!inFight){finding('PLAYTEST BLOCKER','A17-ROUTE','the GRAVE hub never reached the A18 fight');await p.context().close();return false;}
 const t1=Date.now();
 while(Date.now()-t1<90000&&!(await p.locator('.c2-scene [data-c2="done"]').count())){
  const octo=p.locator('.c2-octo:not([hidden]) [data-octo]');if(await octo.count()){await octo.first().click().catch(()=>{});await settle(p,400);continue;}
  const fight=p.locator('.c2-scene [data-c2="fight"]');if(await fight.count()){await fight.first().click();await settle(p,120);
   const rev=p.locator('.c2-scene [data-c2="move:revenge"]:not(.c2-off)');if(await rev.count())await rev.first().click();else{const oct=p.locator('.c2-scene [data-c2="move:octopus"]:not(.c2-off)');if(await oct.count())await oct.first().click();}
   await settle(p,860);continue;}
  await settle(p,200);
 }
 if(await p.locator('.c2-scene [data-c2="done"]').count())await p.locator('.c2-scene [data-c2="done"]').click();
 await settle(p,700);
 const st=await p.evaluate(()=>({pending:RAState.get().life.world.flags.a17Pending||null,lastDefeatDay:RAState.get().life.world.flags.lastDefeatDay||null,lost:(RAState.get().life.history||[]).some(e=>e.type==='fight'&&e.outcome==='lose')}));
 if(!st.pending)finding('PLAYTEST BLOCKER','A17-FLAG',`a Combat 2 loss did not set a17Pending (${JSON.stringify(st)})`);
 await p.reload();await settle(p,400);if(await p.locator('#startButton').count())await p.locator('#startButton').click();await settle(p,900);
 const persisted=await p.evaluate(()=>!!RAState.get().life.world.flags.a17Pending);
 if(!persisted)finding('PLAYTEST BLOCKER','A17-PERSIST','a17Pending did not survive a refresh');
 await drive(p,rng,'a17-wake');await sleepNight(p,'a17');await drive(p,rng,'a17-reach');
 const done=await p.evaluate(()=>({done:!!RAAdventures.isDone('A17'),active:RAAdventures.active()?.id||null,met:!!RAState.get().life.people.records.nneka}));
 if(!done.done)finding('PLAYTEST BLOCKER','A17-NOWAKE',`A17 was not reached on the next wake (active ${done.active||'-'})`);
 else note(`[a17] real loss -> a17Pending set -> survived refresh -> A17 on the next wake (nneka met ${done.met})`);
 flushErrors(p,'a17');await p.context().close();
 return {pending:!!st.pending,persisted,completed:done.done};
}

// PHASE C2: Officer Nodd through the real travel flow. A07's route beat offers DRIVE THE <car> for an owned car; the
// real applyRoute() increments drives and, at the 3rd drive, sets noddPending. Two prior drives are seeded (state only)
// because OPEN offers car routes only on A07/A41 — the milestone logic itself is what is under test; pacing unchanged.
async function scenarioA57(save){
 const p=await newPage(390);const rng=rngFrom(SEED+54);
 await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);
 await p.goto(base+'/?dev=1');await settle(p,600);await p.locator('#startButton').click();await settle(p,900);await drive(p,rng,'a57-pre');
 if(!await p.evaluate(()=>!!window.RATestPilot)){finding('ENGINEERING BUG — NON-BLOCKING','A57-DEV','RATestPilot unavailable with ?dev=1');await p.context().close();return false;}
 await p.evaluate(()=>{if(!RALife.ownedCars().length)RALife.addCar({id:RACars.SUPRA,make:'Toyota',model:'Supra MK4',short:'SUPRA',price:0,parts:{}});RALife.setFlag('drives',2);});
 await p.evaluate(async()=>{await window.RATestPilot.launch('A07',{node:'route'});});await settle(p,700);
 const driveBtn=p.locator('.adv-choice',{hasText:/DRIVE THE/});
 if(!await driveBtn.count()){finding('PLAYTEST BLOCKER','A57-ROUTE','A07 route beat offered no DRIVE option with a car owned');await p.context().close();return false;}
 await driveBtn.first().click();await settle(p,500);
 const st=await p.evaluate(()=>({drives:Number(RAState.get().life.world.flags.drives)||0,pending:!!RAState.get().life.world.flags.noddPending}));
 if(st.drives!==3)finding('PLAYTEST BLOCKER','A57-COUNTER',`a real car route did not advance drives to 3 (got ${st.drives})`);
 if(!st.pending)finding('PLAYTEST BLOCKER','A57-TRIGGER','the 3rd real car drive did not set noddPending');
 await p.reload();await settle(p,400);if(await p.locator('#startButton').count())await p.locator('#startButton').click();await settle(p,900);
 const persisted=await p.evaluate(()=>!!RAState.get().life.world.flags.noddPending);
 if(!persisted)finding('PLAYTEST BLOCKER','A57-PERSIST','noddPending did not survive a refresh');
 // The ?dev=1 DEV panel overlays the bedroom controls, so hide it before driving back to the bedroom and sleeping.
 await p.evaluate(()=>{const d=document.querySelector('#devPanel');if(d){d.classList.remove('show');d.style.display='none';}});
 await drive(p,rng,'a57-wake');await sleepNight(p,'a57');await drive(p,rng,'a57-reach');
 const done=await p.evaluate(()=>({done:!!RAAdventures.isDone('A57'),active:RAAdventures.active()?.id||null}));
 if(!done.done)finding('PLAYTEST BLOCKER','A57-NOWAKE',`A57 was not reached on the next wake (active ${done.active||'-'})`);
 else note('[a57] real car route -> drives 3 -> noddPending -> survived refresh -> A57 on the next wake');
 flushErrors(p,'a57');await p.context().close();
 return {drives:st.drives,pending:st.pending,persisted,completed:done.done};
}

// PHASE C3: the real-estate viewing route (headless cannot exercise RAPropertyQuest). With the Shannon lane open the
// listings must appear, SEE IT opens RE_VIEWING, the adventure resolves without a dead end, and refresh stays clean.
async function scenarioRealEstate(save){
 const p=await newPage(390);const rng=rngFrom(SEED+53);
 await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);await p.goto(base+'/');await settle(p,400);
 await p.evaluate(()=>{RAState.patch('life.ownership.properties',[{id:'property_la_4p_01',label:'PALOMA FOURPLEX',ownershipStatus:'owned',weeklyRent:1400,rentDue:0,purchasePrice:34000,value:34000}]);RALife.setFlag('propertyOwned',true);RALife.addMoney(250000);});
 await p.reload();await settle(p,400);await p.locator('#startButton').click();await settle(p,900);await drive(p,rng,'re-pre');
 await openPhone(p);await phoneClick(p,'app:realEstate');
 const see=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-phone-action^="do:realestate:see:"]')].map(b=>({a:b.dataset.phoneAction,disabled:b.disabled})));
 if(!see.length)finding('PLAYTEST BLOCKER','RE-LISTINGS','no listings offered with the Shannon lane open');
 const pick=see.find(x=>!x.disabled);
 if(see.length&&!pick)finding('ENGINEERING BUG — NON-BLOCKING','RE-LISTINGS','all listings disabled (cash below every 30% down)');
 if(pick){await phoneClick(p,pick.a);await settle(p,700);const s=await probe(p);
  if(!(s.scene==='adventure'||s.advScene))finding('PLAYTEST BLOCKER','RE-ROUTE',`SEE IT did not open a viewing (scene ${s.scene})`);
  else{const r=await drive(p,rng,'re-viewing');if(r.stuck||r.budget)finding('PLAYTEST BLOCKER','RE-DEADEND','the viewing did not resolve to an idle bedroom');}
  const rl=await reloadCheck(p,'re-viewing');if(rl.diff.length)finding('PLAYTEST BLOCKER','RE-REFRESH',`viewing refresh diff ${rl.diff.slice(0,6).join(', ')}`);
  note(`[realestate] ${see.length} listings offered; viewing ${pick.a} resolved, refresh diff ${rl.diff.length}`);}
 await closePhone(p);flushErrors(p,'realestate');await p.context().close();
 return {listings:see.length,disabled:see.filter(x=>x.disabled).length};
}

// PHASE E1: the ONLYVAMPS launcher must appear exactly once on the phone home when the app is unlocked (apps_core
// registers it as a canon app; w4 re-registers the real renderer and must stay in the canon row, not the extras grid).
async function scenarioOnlyVamps(save){
 const p=await newPage(390);const rng=rngFrom(SEED+51);
 await p.evaluate(s=>localStorage.setItem('rich_alucard_save_v1',s),save);await p.goto(base+'/');await settle(p,400);
 await p.evaluate(()=>{RALife.unlockApp('onlyvamps',{silent:true});});
 await p.reload();await settle(p,400);await p.locator('#startButton').click();await settle(p,900);await drive(p,rng,'onlyvamps-pre');
 await openPhone(p);
 const n=await p.evaluate(()=>[...document.querySelectorAll('#phoneContent [data-phone-action="app:onlyvamps"]')].length);
 if(n>1)finding('PLAYTEST BLOCKER','ONLYVAMPS-DUPLICATE',`${n} ONLYVAMPS launchers on the phone home (expected 1)`);
 else if(n<1)finding('PLAYTEST BLOCKER','ONLYVAMPS-MISSING','ONLYVAMPS launcher missing after unlock');
 else note('[onlyvamps] exactly one launcher on the phone home');
 await phoneClick(p,'app:onlyvamps');
 const ov=await p.evaluate(()=>({title:document.querySelector('#phoneContent h1')?.textContent||'',cards:document.querySelectorAll('#phoneContent .phone-card').length,velvet:/VELVET/.test(document.querySelector('#phoneContent')?.innerText||'')}));
 if(!/ONLYVAMPS/.test(ov.title))finding('PLAYTEST BLOCKER','ONLYVAMPS-OPEN',`ONLYVAMPS page did not open (title "${ov.title}")`);
 else note(`[onlyvamps] page opens, ${ov.cards} creator tiles, Velvet present ${ov.velvet}`);
 await closePhone(p);flushErrors(p,'onlyvamps');await p.context().close();
 return {launchers:n,...ov};
}

async function main(){
 await mkdir(out,{recursive:true});
 if(!existsSync(path.join(dist,'index.html')))throw new Error('dist/ missing: run npm run build first');
 const build=JSON.parse(await readFile(path.join(dist,'build.json'),'utf8'));
 const {chromium}=loadPlaywright();browser=await chromium.launch({executablePath:await chromiumPath()});server=await serve();base=`http://127.0.0.1:${server.address().port}`;
 note(`PLAYTEST QA over dist ${build.releaseId} (${build.commit})`);
 const want=n=>!only||only.includes(n);let save=null,progressed=null;const report={build,results:{}};
 if(want('reachability'))report.results.orphans=await reachability();
 try{
  if(args.save&&existsSync(String(args.save))){save=await readFile(String(args.save),'utf8');progressed=save;note(`using saved progressed life ${args.save}`);}
  else if(want('newgame')||want('life')||want('minigames')||want('widths')||want('ending')||want('legacy')||want('systems')||want('wake-reload')||want('routes')||want('combat')||want('a17')||want('a57')||want('realestate')||want('onlyvamps')){const saves={};for(const [size,steal] of [[360,'no'],[390,'yes'],[430,'no']]){if(!want('newgame')&&size!==390)continue;saves[size]=await scenarioNewGame(size,{steal});}save=saves[390];}
  if(want('prologue-reload')){await scenarioPrologueReload();await scenarioThroneDefeat();}
  if(want('life')&&save){progressed=await scenarioLife(save);await writeFile(path.join(out,'progressed-save.json'),progressed);}
  if(want('minigames')&&save)report.results.minigames=await scenarioMinigames(progressed||save);
  if(want('migration'))await scenarioMigration();
  if(want('widths')&&save)await scenarioWidths(progressed||save);
  if(want('ending')&&save)await scenarioEnding(progressed||save);
  if(want('legacy')&&save)await scenarioLegacy(save);
  if(want('systems')&&save)await scenarioSystems(save);
  if(want('wake-reload')&&save)await scenarioWakeReload(save);
  if(want('routes')&&save)report.results.routes=await scenarioRoutes(progressed||save);
  if(want('combat')&&save)report.results.combat=await scenarioCombatWin(progressed||save);
  if(want('a17')&&save)report.results.a17=await scenarioA17(progressed||save);
  if(want('a57')&&save)report.results.a57=await scenarioA57(progressed||save);
  if(want('realestate')&&save)report.results.realestate=await scenarioRealEstate(progressed||save);
  if(want('onlyvamps')&&save)report.results.onlyvamps=await scenarioOnlyVamps(progressed||save);
 }finally{
  if(server.missing.size)for(const m of server.missing)finding('ENGINEERING BUG — NON-BLOCKING','MISSING-ASSET',m);
  await browser.close();server.close();
  report.findings=findings;report.log=log;await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,1));
  const byClass={};for(const f of findings)byClass[f.cls]=(byClass[f.cls]||0)+1;
  console.log(`\nPLAYTEST QA done: ${findings.length} findings ${JSON.stringify(byClass)} → ${out}`);
 }
}
await main();
