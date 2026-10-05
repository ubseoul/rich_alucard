// OL-027 A — F1 / F2 regression, REAL Chromium, NORMAL PLAYER SURFACE (no ?dev=1, no feature-flag URL).
//   node tools/tests/walkthrough/walkthrough-fixes-browser.mjs [--dist dist]
// F1  Combat 1 -> EVERY post-victory branch -> Combat 2: the battle commands are visible, un-retracted, un-intercepted and clickable.
// F2  a valid live save presents CONTINUE; NEW GAME stays available behind a confirmation and is visually secondary; no engine/version
//     text on the normal player surface (start card, title, bedroom, phone).
// Prints PASS/FAIL lines only.
import fs from 'node:fs';import path from 'node:path';
import {serve,loadPlaywright,root} from '../f05/_browser-lib.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const DIST=arg('dist','');
const {chromium}=loadPlaywright();
const CHROME=process.env.RA_CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const results=[];const log=(ok,name,detail='')=>{results.push({ok});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' - '+detail:''}`);return ok;};
const srv=await serve(DIST?path.resolve(DIST):root);const origin=`http://127.0.0.1:${srv.address().port}`;
const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(CHROME)?CHROME:undefined});
const errs=[];
async function newPage(width=390,height=844){
 const ctx=await browser.newContext({viewport:{width,height}});const page=await ctx.newPage();
 page.on('pageerror',e=>errs.push(`pageerror: ${e.message}`));
 page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/.test(m.text()))errs.push(`console: ${m.text().slice(0,200)}`);});
 page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errs.push(`http ${r.status()} ${r.url()}`);});
 return {ctx,page};
}
const ready=p=>p.waitForFunction(()=>window.RAState&&window.RACombat&&window.RANewGame&&document.querySelector('#startButton'),null,{timeout:30000});
const PLAYER_URL=`${origin}/index.html`;                         // NO dev flag, NO ff

// ---------------------------------------------------------------------------------------- F1
// the battle commands a player needs: every main-menu button, visible, not retracted, and the element under its centre IS the button
async function commandsUsable(p){
 return p.evaluate(()=>{
  const ui=document.querySelector('.battle-ui'),cs=getComputedStyle(ui);
  const out={ui:{opacity:cs.opacity,pe:cs.pointerEvents,transform:cs.transform,retract:ui.classList.contains('victory-retract'),attack:ui.classList.contains('attack-mode')},buttons:[],overlays:{victory:document.querySelector('#victoryOverlay').classList.contains('on'),ending:document.querySelector('#endingText').classList.contains('on'),choice:document.querySelector('#choiceOverlay')?.classList.contains('show')}};
  for(const b of document.querySelectorAll('.main-menu button')){
   const r=b.getBoundingClientRect(),top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
   out.buttons.push({label:b.textContent.trim(),w:Math.round(r.width),h:Math.round(r.height),hit:top===b||b.contains(top)});
  }
  return out;
 });
}
const usable=u=>u.ui.opacity==='1'&&u.ui.pe!=='none'&&(u.ui.transform==='none'||/^matrix\(1, 0, 0, 1, 0, 0\)$/.test(u.ui.transform))&&!u.ui.retract&&!u.overlays.victory&&!u.overlays.ending&&u.buttons.length>0&&u.buttons.every(b=>b.w>0&&b.h>0&&b.hit);

async function branch(name,drive){
 const {ctx,page:p}=await newPage();
 await p.goto(PLAYER_URL);await ready(p);
 await p.evaluate(()=>{localStorage.clear();document.querySelector('#startOverlay').style.display='none';});
 // Combat 1: the CEO fight, won
 await p.evaluate(()=>{window.__v=normalVictory();});
 await p.waitForSelector('#victoryOverlay.on',{timeout:10000});
 await drive(p);
 const post=await commandsUsable(p);
 // Combat 2: the next encounter starts through the real entry point
 await p.evaluate(()=>{RACombat.startJdmEncounter();});
 await p.waitForTimeout(250);
 const c2=await commandsUsable(p);
 log(usable(c2),`F1 ${name}: Combat 2 commands visible, un-retracted, un-intercepted`,JSON.stringify({o:c2.ui.opacity,pe:c2.ui.pe,retract:c2.ui.retract,v:c2.overlays.victory,e:c2.overlays.ending,btn:c2.buttons.map(b=>`${b.label}:${b.hit}`).join(' ')}));
 // clickable with a REAL pointer click (Playwright refuses a click an overlay would intercept) and the click does something
 const before=await p.evaluate(()=>({m:document.querySelector('.battle-ui').className,sel:[...document.querySelectorAll('.main-menu button')].findIndex(b=>b.classList.contains('selected'))}));
 let clicked=true;try{await p.click('.main-menu button:nth-child(2)',{timeout:5000});}catch(e){clicked=false;}
 const after=await p.evaluate(()=>[...document.querySelectorAll('.main-menu button')].findIndex(b=>b.classList.contains('selected')));
 log(clicked&&after===1,`F1 ${name}: a real click on a Combat 2 command lands`,`selected ${before.sel} -> ${after}`);
 const snap=await p.evaluate(()=>RACombat.snapshot());
 log(snap.battleEncounter==='jdm'&&snap.battleOver===false&&snap.richHP===100,`F1 ${name}: Combat 2 state is fresh`,JSON.stringify(snap));
 await ctx.close();return {post};
}
// each post-victory branch the player can take after Combat 1
{
 const steal=await branch('victory -> STEAL (battle UI retracts)',async p=>{
  await p.click('#stealYes');
  await p.waitForFunction(()=>document.querySelector('.battle-ui').classList.contains('victory-retract'),null,{timeout:10000});
  log(true,'F1 STEAL branch reached the retracted state (the softlock precondition)');
  await p.evaluate(()=>window.RACharacterReveal?.close?.());await p.waitForTimeout(300);
 });
 await branch('victory -> KEEP (ending card)',async p=>{
  await p.click('#stealNo');await p.waitForSelector('#endingText.on',{timeout:10000});
  log(true,'F1 KEEP branch reached the ending-card state');
 });
 await branch('victory -> never answered (left on the card)',async()=>{});
}
// Combat 1 loss -> respawn -> Combat 2 (the other reset path)
{
 const {ctx,page:p}=await newPage();await p.goto(PLAYER_URL);await ready(p);
 await p.evaluate(()=>{localStorage.clear();document.querySelector('#startOverlay').style.display='none';});
 await p.evaluate(()=>{richHP=0;resetBattle();RACombat.startJdmEncounter();});await p.waitForTimeout(250);
 log(usable(await commandsUsable(p)),'F1 Combat 1 loss/respawn -> Combat 2: commands usable');
 await ctx.close();
}
// the same reset closes the SOURCE of the bug: no stale post-victory state after a reset, whatever state it was left in
{
 const {ctx,page:p}=await newPage();await p.goto(PLAYER_URL);await ready(p);
 await p.evaluate(()=>{document.querySelector('#startOverlay').style.display='none';document.querySelector('.battle-ui').classList.add('victory-retract','attack-mode');victoryOverlay.classList.add('on');endingText.classList.add('on');endingText.textContent='x';victoryCard.style.display='none';resetBattle();});
 const s=await p.evaluate(()=>({retract:document.querySelector('.battle-ui').classList.contains('victory-retract'),v:victoryOverlay.classList.contains('on'),e:endingText.classList.contains('on'),t:endingText.textContent,card:victoryCard.style.display,over:battleOver,busy}));
 log(!s.retract&&!s.v&&!s.e&&s.t===''&&s.card==='block'&&!s.over&&!s.busy,'F1 resetBattle clears victory-retract / overlay / ending text / card / flags',JSON.stringify(s));
 await ctx.close();
}

// ---------------------------------------------------------------------------------------- F2
const SEED=()=>{localStorage.clear();RAState.reset();RAState.patch('life.clock.started',true);for(const k of ['prologueDone','throneDone','firstWakeDone'])RALife.setFlag(k,true);RAState.patch('life.world.day',9);RAState.patch('life.resources.money',100000);};
const bad=/engine\s*foundation|\bv0\.\d+/i;
{
 // fresh: START, no NEW GAME, no engine text
 const {ctx,page:p}=await newPage();await p.goto(PLAYER_URL);await ready(p);await p.evaluate(()=>localStorage.clear());await p.reload();await ready(p);
 const f=await p.evaluate(()=>({start:document.querySelector('#startButton').textContent.trim(),ng:document.querySelector('#newGameButton').hidden,title:document.title,text:document.querySelector('#startOverlay').innerText}));
 log(/START/.test(f.start)&&!/CONTINUE/.test(f.start)&&f.ng===true,'F2 fresh boot: START, NEW GAME hidden',f.start);
 log(f.title==='Rich Alucard'&&!bad.test(f.title+' '+f.text),'F2 no ENGINE FOUNDATION / version text on the start surface or title',f.title);
 await ctx.close();
}
for(const [w,h] of [[360,640],[390,844],[430,932]]){
 const {ctx,page:p}=await newPage(w,h);await p.goto(PLAYER_URL);await ready(p);
 await p.evaluate(SEED);await p.reload();await ready(p);
 const s=await p.evaluate(()=>{const a=document.querySelector('#startButton'),b=document.querySelector('#newGameButton'),ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect(),ca=getComputedStyle(a),cb=getComputedStyle(b);
  return {cont:a.textContent.trim(),ngHidden:b.hidden,ngText:b.textContent.trim(),aBg:ca.backgroundColor,bBg:cb.backgroundColor,aTop:ra.top,bTop:rb.top,aH:ra.height,bw:rb.width,inView:rb.left>=0&&rb.right<=innerWidth&&rb.bottom<=innerHeight,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,text:document.querySelector('#startOverlay').innerText,hit:(()=>{const e=document.elementFromPoint(rb.left+rb.width/2,rb.top+rb.height/2);return e===b;})()};});
 log(/CONTINUE/.test(s.cont),`F2 ${w}px valid live save: CONTINUE`,s.cont);
 log(!s.ngHidden&&s.ngText==='NEW GAME'&&s.inView&&s.hit,`F2 ${w}px NEW GAME still available, on-screen, tappable`);
 log(s.aBg!==s.bBg&&s.bTop>s.aTop,`F2 ${w}px NEW GAME is visually secondary (below CONTINUE, different fill)`,`${s.aBg} / ${s.bBg}`);
 log(s.sw<=s.cw+1&&!bad.test(s.text),`F2 ${w}px no horizontal overflow, no engine/version text`,`${s.sw}/${s.cw}`);
 await ctx.close();
}
{
 // CONTINUE resumes the live save (existing life -> bedroom)
 const {ctx,page:p}=await newPage();await p.goto(PLAYER_URL);await ready(p);await p.evaluate(SEED);await p.reload();await ready(p);
 await p.click('#startButton');await p.waitForFunction(()=>document.body.classList.contains('bedroom-mode'),null,{timeout:20000}).catch(()=>{});
 const r=await p.evaluate(()=>({bed:document.body.classList.contains('bedroom-mode'),day:RALife.today().day,money:RALife.money()}));
 log(r.bed&&r.day===9&&r.money===100000,'F2 CONTINUE resumes the live save into the bedroom (day 9, money intact)',JSON.stringify(r));
 await p.click('#checkPhone');await p.waitForFunction(()=>RAPhone.isOpen());
 const t=await p.evaluate(()=>document.body.innerText);
 log(!bad.test(t),'F2 no ENGINE FOUNDATION / version text in the bedroom or on the phone');
 await ctx.close();
}
{
 // NEW GAME is behind a confirmation: cancel keeps the save, accept resets it
 const {ctx,page:p}=await newPage();await p.goto(PLAYER_URL);await ready(p);await p.evaluate(SEED);await p.reload();await ready(p);
 const dialogs=[];let answer=false;p.on('dialog',async d=>{dialogs.push(d.message());answer?await d.accept():await d.dismiss();});
 const snap=()=>p.evaluate(()=>JSON.stringify(RAState.get()));
 const before=await snap();
 await p.click('#newGameButton');await p.waitForTimeout(400);
 log(dialogs.length===1&&/NEW GAME/i.test(dialogs[0]),'F2 NEW GAME asks for confirmation first',dialogs[0]);
 const afterCancel=await snap();
 log(afterCancel===before&&await p.evaluate(()=>document.querySelector('#startOverlay').style.display!=='none'&&/CONTINUE/.test(document.querySelector('#startButton').textContent)),'F2 cancelling the confirmation changes nothing: save intact, still on the start surface');
 answer=true;await p.click('#newGameButton');
 await p.waitForFunction(()=>!RAState.get().life.clock.started||document.querySelector('#startOverlay').style.display==='none',null,{timeout:15000}).catch(()=>{});
 const s=await p.evaluate(()=>({started:!!RAState.get().life.clock.started,day:RAState.get().life.world.day,money:RALife.money()}));
 log(dialogs.length===2&&s.day===1&&s.started===false,'F2 confirming NEW GAME starts a fresh life (old save replaced)',JSON.stringify(s));
 await ctx.close();
}
log(errs.length===0,'zero console errors / page errors / failed requests',errs.join(' | '));
await browser.close();srv.close();
const failed=results.filter(r=>!r.ok);console.log(`\n${results.length-failed.length}/${results.length} checks passed`);
process.exitCode=failed.length?1:0;
