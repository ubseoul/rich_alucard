// F15 launch trio — REAL-BROWSER check (Chromium via Playwright, touch emulation, DPR 2). Not part of `npm test` (needs a browser):
//   RA_PLAYWRIGHT_PATH=<playwright-core dir> RA_CHROMIUM_PATH=<chrome.exe> node tools/tests/f15/browser-check.mjs [--shots <dir>] [--only widths,throws,scenes]
// Drives the real shipped files: club entry, actual pointer bill throws, switching support, in-flight selection change, floor bills,
// reload + return, date entry from the club, and every one of the 12 scenes through the real adventure/combat UI. Collects console
// errors, failed/404 requests and text-fit violations at 360 / 390 / 430. Desktop Chromium emulation only: NOT a real device, NOT Safari.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {serve,launch,open,enterClub} from './_browser.mjs';

const args=process.argv.slice(2);
const arg=n=>{const i=args.indexOf(n);return i<0?null:args[i+1];};
const shots=arg('--shots'),only=(arg('--only')||'widths,throws,scenes').split(',');
if(shots)fs.mkdirSync(shots,{recursive:true});
const WIDTHS=[[360,740],[390,844],[430,932]];
const results=[];const log=(ok,msg)=>{results.push({ok,msg});console.log((ok?'PASS ':'FAIL ')+msg);};
const must=(cond,msg)=>{log(!!cond,msg);if(!cond)throw new Error(msg);};
const shot=async(page,name)=>{if(shots)await page.screenshot({path:path.join(shots,name+'.png')});};
const SCENES=['roxy','rosalyn','emerald'].flatMap(d=>[1,2,3,4].map(l=>({d,l,id:`F15_${d.toUpperCase()}_L${l}`})));

// ------------------------------------------------------------------ gestures (real pointer events on the F06 canvas)
async function throwBills(page,{at,spotlight=true,reload=false}){
  // wait for a safe spotlight window (on: aim lands; off: overthrow on the floor)
  await page.waitForFunction(s=>{const g=RAF15Club.current().game(),t=g.debug.clock();const a=x=>g.core.spotlightActive(x);return s?(a(t)&&a(t+650)):(!a(t)&&!a(t+650));},spotlight,{timeout:15000,polling:20});
  const info=await page.evaluate(a=>{const c=RAF15Club.current(),g=c.game();const cx=RAF15Tunables.LAYOUT.slots[RAF15.handleOf(a)].cx;return {cx,spread:g.tunables.aim.aimSpread,state:g.getState()};},at);
  const box=await page.locator('[role="dialog"] #stage-canvas').boundingBox();
  const x0=box.x+box.width*.5,yBase=box.y+box.height*.92,yLoad=box.y+box.height*.5;
  const ratio=(info.cx-.5)/info.spread,dy=box.height*.30,dx=ratio*dy;
  await page.mouse.move(x0,yBase);await page.mouse.down();
  await page.mouse.move(x0,yLoad,{steps:12});
  await page.waitForTimeout(150);                       // let the loading samples age out of the 110 ms velocity window
  await page.mouse.move(x0+dx*.5,yLoad-dy*.5,{steps:1});
  await page.mouse.move(x0+dx,yLoad-dy,{steps:1});
  await page.mouse.up();
}
const snapshot=page=>page.evaluate(()=>({money:RALife.money(),F15:RAFrag.get('F15'),last:RAF15Club.current()?.lastThrow()||null,sel:RAF15Club.current()?.selected()}));

// ------------------------------------------------------------------ dialogue/combat driver (real UI)
async function driveScene(page,id,{pickChoice=(labels)=>0,maxSteps=900}={}){
  const viol=[];let steps=0,lines=0,fights=0;
  const vp=page.viewportSize();
  while(steps++<maxSteps){
    const st=await page.evaluate(()=>({active:RAAdventures.active()?.id||null,combat:document.body.classList.contains('combat2-mode'),
      choices:[...document.querySelectorAll('.adv-choice')].filter(b=>b.offsetParent&&!b.disabled).map(b=>b.textContent.trim()),
      talk:!!document.querySelector('.adv-box:not([hidden])')||!!document.querySelector('.adv-bubble:not([hidden])')||!!document.querySelector('.adv-title:not([hidden])'),
      scene:document.querySelector('#adventureScene')?'adventure':null}));
    if(st.combat){fights++;await fight(page);continue;}
    if(!st.active&&!st.scene)return {steps,lines,fights,viol};
    if(st.choices.length){
      const idx=Math.min(pickChoice(st.choices),st.choices.length-1);
      viol.push(...await fitCheck(page,vp,'choices'));
      await page.locator('.adv-choice:not([disabled])').nth(idx).click();await page.waitForTimeout(40);continue;
    }
    if(st.talk){lines++;viol.push(...await fitCheck(page,vp,'line'));await page.mouse.click(vp.width/2,70);await page.waitForTimeout(25);continue;}
    await page.waitForTimeout(40);
  }
  throw new Error(`${id}: scene did not finish in ${maxSteps} steps`);
}
async function fitCheck(page,vp,what){
  return page.evaluate(([w,h,what])=>{
    const bad=[];
    for(const el of document.querySelectorAll('.adv-box:not([hidden]),.adv-bubble:not([hidden]),.adv-choices:not([hidden]) .adv-choice,.adv-title:not([hidden])')){
      const r=el.getBoundingClientRect();if(!r.width)continue;
      if(r.left<-0.5||r.right>w+0.5||r.top<-0.5||r.bottom>h+0.5)bad.push(`${what}: ${el.className} outside viewport (${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}) of ${w}x${h}`);
      if(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+2)bad.push(`${what}: ${el.className} text overflows its box`);
    }
    return bad;
  },[vp.width,vp.height,what]);
}
async function fight(page){
  for(let i=0;i<120;i++){
    const s=await page.evaluate(()=>({on:document.body.classList.contains('combat2-mode'),
      acts:[...document.querySelectorAll('[data-c2]')].filter(b=>b.offsetParent&&!b.classList.contains('c2-off')).map(b=>b.dataset.c2)}));
    if(!s.on)return;
    const click=a=>page.evaluate(a=>document.querySelector(`[data-c2="${a}"]`)?.click(),a);   // the menu re-renders each turn and the DEV panel (dev=1) can float over it: dispatch on the live button
    if(s.acts.includes('done'))await click('done');
    else if(s.acts.includes('fight'))await click('fight');
    else if(s.acts.some(a=>a.startsWith('move:')))await click(s.acts.find(a=>a.startsWith('move:')));
    else await page.waitForTimeout(120);
    await page.waitForTimeout(80);
  }
  throw new Error('fight did not end');
}
const seed=(page,{id,d,l,day})=>page.evaluate(async({id,d,l,day})=>{
  RAState.patch('life.world.day',day);RAState.patch('life.adventures.active',null);
  RAFrag.patch('F15',`dancers.${d}`,{spent:RAF15.thresholds()[3],throws:1});
  for(let k=1;k<l;k++)RAState.patch(`life.adventures.records.${RAF15.sceneId(d,k)}`,{status:'completed',count:1,completedDay:1});
  RALife.addMoney(1000000-RALife.money());
  await RAScenes.go('bedroom',{dev:true});
  return RAAdventures.available(id);
},{id,d,l,day});

// ====================================================================================================================
const s=await serve(),browser=await launch();
try{
  if(only.includes('widths')||only.includes('throws')){
    for(const [w,h] of WIDTHS){
      const {page,ctx,errors,failed}=await open(browser,s.url,{width:w,height:h});
      await enterClub(page);
      const tag=`${w}`;
      // ---- layout: dancers, headroom, usable UI
      const lay=await page.evaluate(()=>{const c=RAF15Club.current(),g=c.geo();const sh=document.querySelector('[role="dialog"]').shadowRoot;
        const stage=sh.querySelector('.stage').getBoundingClientRect();const r=sel=>{const e=sh.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect();return {l:b.left,r:b.right,t:b.top,b:b.bottom,w:b.width,h:b.height};};
        const chips=[...sh.querySelectorAll('.f15-chip')].map(e=>{const b=e.getBoundingClientRect();return {l:b.left,r:b.right,t:b.top,b:b.bottom,w:b.width,h:b.height};});
        return {g,stage:{l:stage.left,r:stage.right,w:stage.width,h:stage.height},chips,bar:r('.player-bar'),vw:innerWidth,vh:innerHeight,st:c.status(),frames:c.frames()};});
      must(lay.st.loaded&&!lay.st.failed,`${tag}: dancer sheets loaded`);
      for(const [d,b] of Object.entries(lay.g.boxes)){
        must(b.x>=-0.5&&b.x+b.w<=lay.g.W+0.5,`${tag}: ${d} inside the stage horizontally (${b.x.toFixed(1)}..${(b.x+b.w).toFixed(1)} of ${lay.g.W})`);
        must(b.y-lay.g.hudBottom>=5.5,`${tag}: ${d} keeps >=6px headroom under the HUD (${(b.y-lay.g.hudBottom).toFixed(1)}px)`);
        must(Math.abs((b.feet??b.y+b.h)-lay.g.feetY)<0.01,`${tag}: ${d} stands on the shared feet line`);
      }
      must(lay.chips.length===3&&lay.chips.every(c=>c.w>=100&&c.h>=44&&c.l>=0&&c.r<=lay.vw&&c.b<=lay.vh),`${tag}: three support buttons >=44px, fully on screen (${lay.chips.map(c=>Math.round(c.w)+'x'+Math.round(c.h)).join(', ')})`);
      must(lay.bar&&lay.bar.b<=lay.vh+0.5,`${tag}: budget bar visible without scrolling (bottom ${Math.round(lay.bar.b)} / ${lay.vh})`);
      await page.waitForTimeout(700);
      const f2=await page.evaluate(()=>RAF15Club.current().frames());
      must(JSON.stringify(f2)!==JSON.stringify(lay.frames),`${tag}: animation advancing (${JSON.stringify(lay.frames)} -> ${JSON.stringify(f2)})`);
      await shot(page,`club_${tag}_start`);

      if(only.includes('throws')&&w===390){
        // ---- support Roxy: a real throw into the spotlight
        let a=await snapshot(page);
        await throwBills(page,{at:'roxy'});await page.waitForTimeout(250);
        let b=await snapshot(page);
        must(b.last&&b.last.recipient==='roxy','390: throw credited to the selected dancer (Roxy)');
        must(a.money-b.money===b.last.delta&&b.last.delta>0,`390: F06 charged exactly the thrown dollars ($${b.last.delta})`);
        must(b.F15.dancers.roxy.spent===a.F15.dancers.roxy.spent+b.last.delta&&b.F15.dancers.rosalyn.spent===0&&b.F15.dancers.emerald.spent===0,'390: only Roxy\'s total moved by exactly that amount');
        must(Math.abs(b.last.targetX-0.5)<1e-6&&b.last.kind==='hit',`390: the approved F06 target stood on Roxy and the aimed throw HIT (${b.last.kind}, target ${b.last.targetX})`);
        await shot(page,'club_390_hit_roxy');
        // ---- switch support to Emerald with the real button, throw again
        await page.locator('[role="dialog"] .f15-chip[data-dancer="emerald"]').click();
        must(await page.evaluate(()=>RAF15.selected()==='emerald'&&RAF15Club.current().game().tunables.target.driftAmplitude<-0.28),'390: switching support retargets the stage to Emerald');
        a=await snapshot(page);await throwBills(page,{at:'emerald'});await page.waitForTimeout(250);b=await snapshot(page);
        must(b.last.recipient==='emerald'&&Math.abs(b.last.targetX-0.21)<1e-6&&b.F15.dancers.emerald.spent===b.last.delta&&b.F15.dancers.roxy.spent===a.F15.dancers.roxy.spent,'390: Emerald credited exactly; Roxy unchanged');
        // ---- in-flight: throw at Emerald, switch to Rosalyn immediately; the bills already thrown stay Emerald's
        a=await snapshot(page);
        await throwBills(page,{at:'emerald'});
        await page.locator('[role="dialog"] .f15-chip[data-dancer="rosalyn"]').click();   // bills are still in the air (~520 ms flight)
        b=await snapshot(page);
        must(b.last.recipient==='emerald'&&b.F15.dancers.emerald.spent===a.F15.dancers.emerald.spent+b.last.delta&&b.F15.dancers.rosalyn.spent===0,'390: changing selection mid-flight does not redirect bills already thrown');
        must(b.sel==='rosalyn','390: ...and the new selection applies to the NEXT throw');
        await shot(page,'club_390_switch_midflight');
        // ---- floor / missed bill (spotlight OFF = overthrow) still counts for the dancer it was thrown at
        a=await snapshot(page);await throwBills(page,{at:'rosalyn',spotlight:false});await page.waitForTimeout(250);b=await snapshot(page);
        must(b.last.kind==='overthrow'&&b.last.recipient==='rosalyn'&&b.F15.dancers.rosalyn.spent===b.last.delta&&a.money-b.money===b.last.delta,`390: floor bills count toward Rosalyn ($${b.last.delta}, ${b.last.kind}); no money other than the throw moved`);
        const {money,F15}=await snapshot(page);
        // ---- reload mid-club and return
        await page.reload();await page.waitForFunction(()=>window.RAF15&&window.RAF06Rainmaker);
        const r=await page.evaluate(()=>({money:RALife.money(),F15:RAFrag.get('F15'),active:RAF06Rainmaker.state().active}));
        must(r.money===money&&JSON.stringify(r.F15.dancers)===JSON.stringify(F15.dancers)&&r.active===null,'390: reload keeps money and every dancer total; no round replayed or charged');
        await page.evaluate(async()=>{await RAScenes.go('bedroom',{dev:true});RAPhone.openApp('rainmaker');});
        await page.getByRole('button',{name:'MAKE IT RAIN',exact:true}).click();
        await page.waitForFunction(()=>RAF15Club.current()?.status().loaded);
        const back=await page.evaluate(()=>{const sh=document.querySelector('[role="dialog"]').shadowRoot;return {sel:RAF15Club.current().selected(),chips:[...sh.querySelectorAll('.f15-chip')].map(e=>e.textContent)};});
        must(back.sel==='rosalyn'&&/\$\d/.test(back.chips[1]),'390: returning to the club restores the supported dancer and the saved totals');
        await shot(page,'club_390_after_reload');
        // ---- BACK / re-entry / animation cleanup
        await page.getByRole('button',{name:'BACK',exact:true}).click();
        must(await page.evaluate(()=>RAF15Club.current()===null&&!document.querySelector('[role="dialog"]')),'390: BACK disposes the club (overlay, loop and listeners gone)');
        await page.evaluate(()=>{RAPhone.openApp('rainmaker');});await page.getByRole('button',{name:'MAKE IT RAIN',exact:true}).click();
        await page.waitForFunction(()=>RAF15Club.current()?.status().loaded);
        must(await page.evaluate(()=>document.querySelectorAll('[role="dialog"]').length===1&&document.querySelectorAll('.f15-dancers').length+[...document.querySelector('[role="dialog"]').shadowRoot.querySelectorAll('.f15-dancers')].length===1),'390: re-entry builds exactly one stage');
        await page.keyboard.press('Escape');
      }
      // ---- date entry from the club at this width (real button), then the scene text at this width
      if(only.includes('scenes')){
        await page.evaluate(async()=>{await RAScenes.go('bedroom',{dev:true});RAFrag.patch('F15','dancers.roxy',{spent:RAF15.thresholds()[0],throws:1});RAPhone.openApp('rainmaker');});
        await page.getByRole('button',{name:'MAKE IT RAIN',exact:true}).click();
        await page.waitForFunction(()=>RAF15Club.current()?.status().loaded);
        const go=page.locator('[role="dialog"] .f15-go');
        must(await go.count()===1,`${tag}: the club offers Roxy's scene when her threshold is met`);
        const goBox=await go.boundingBox();must(goBox.x>=0&&goBox.x+goBox.width<=w,`${tag}: date button fits the width`);
        await shot(page,`club_${tag}_date_ready`);
        await go.click();
        await page.waitForSelector('#adventureScene');
        const out=await driveScene(page,'F15_ROXY_L1',{pickChoice:l=>Math.max(0,l.indexOf('GO WITH HER'))});
        must(out.viol.length===0,`${tag}: Roxy L1 text and choices fit the viewport (${out.lines} lines, 0 violations)${out.viol[0]?' - '+out.viol[0]:''}`);
        const done=await page.evaluate(()=>RAF15.progress('roxy').completed);must(done===1,`${tag}: scene entered from the club completes once`);
      }
      must(errors.length===0,`${tag}: no console/page errors${errors.length?' - '+errors.slice(0,3).join(' | '):''}`);
      must(failed.length===0&&s.missing.length===0,`${tag}: no failed or missing assets${failed.length?' - '+failed.slice(0,3).join(' | '):''}`);
      await ctx.close();
    }
  }

  if(only.includes('scenes')){
    // ---- every route, every scene, through the real adventure/combat UI at 390 (one date per WAKE: each scene gets its own day)
    const {page,ctx,errors,failed}=await open(browser,s.url,{width:390,height:844});
    await enterClub(page);await page.keyboard.press('Escape');
    let i=0;
    for(const sc of SCENES){
      const before=await page.evaluate(()=>RALife.money());
      const ok=await seed(page,{...sc,day:30+(++i)});
      must(ok,`${sc.id}: available after its threshold and the earlier scenes`);
      await page.evaluate(id=>RAAdventureScene.begin(id,{from:'phone'}),sc.id);
      await page.waitForSelector('#adventureScene');
      const out=await driveScene(page,sc.id,{pickChoice:l=>0});
      const post=await page.evaluate(({id,d,l})=>({rec:RAAdventures.record(id),p:RAF15.progress(d),dates:RAF15.datesToday().length,money:RALife.money()}),sc);
      must(post.rec?.status==='completed'&&post.rec.count===1&&post.p.completed===sc.l&&post.dates===1,`${sc.id}: ran to its end in the real UI (${out.lines} lines, ${out.fights} fight), completed once, one date that WAKE`);
      must(out.viol.length===0,`${sc.id}: text fits at 390${out.viol[0]?' - '+out.viol[0]:''}`);
      const spent=1000000-post.money;
      must(spent===(sc.id==='F15_ROSALYN_L1'?106:0),`${sc.id}: exact money effect ($${spent})`);
      if(sc.l===1||sc.id==='F15_ROSALYN_L4'||sc.id==='F15_ROXY_L2')await shot(page,`end_${sc.id}`);
    }
    must(errors.length===0,`scenes: no console/page errors${errors.length?' - '+errors.slice(0,3).join(' | '):''}`);
    must(failed.length===0&&s.missing.length===0,`scenes: no failed or missing assets${failed.length?' - '+failed.slice(0,3).join(' | '):''}`);
    await ctx.close();
    // ---- representative scene text at the other two widths (a hub scene with a fight, one with Rich bubbles)
    for(const [w,h] of [[360,740],[430,932]]){
      const {page:p,ctx:c2,errors:e2}=await open(browser,s.url,{width:w,height:h});
      await enterClub(p);await p.keyboard.press('Escape');
      for(const [k,sc] of [SCENES[1],SCENES[11]].entries()){
        await seed(p,{...sc,day:60+k});await p.evaluate(id=>RAAdventureScene.begin(id,{from:'phone'}),sc.id);await p.waitForSelector('#adventureScene');
        const out=await driveScene(p,sc.id,{pickChoice:l=>0});
        must(out.viol.length===0,`${w}: ${sc.id} text fits (${out.lines} lines)${out.viol[0]?' - '+out.viol[0]:''}`);
      }
      must(e2.length===0,`${w}: scenes ran with no console/page errors`);
      await c2.close();
    }
  }
}catch(e){console.error('ERROR',e.message);process.exitCode=1;}
finally{await browser.close();await s.close();}
const bad=results.filter(r=>!r.ok);
console.log(`\n${results.length-bad.length}/${results.length} checks passed`);
if(bad.length)process.exitCode=1;
