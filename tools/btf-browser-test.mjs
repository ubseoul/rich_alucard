// BTF real-player-path browser QA (not part of npm test; needs a served build and Playwright).
// Usage: node tools/btf-browser-test.mjs [baseUrl] [evidenceDir] [scenario]
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.RA_PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/playwright');
const base=process.argv[2]||'http://127.0.0.1:4180',out=path.resolve(process.argv[3]||'work/btf-evidence'),scenario=process.argv[4]||'newgame';
await mkdir(out,{recursive:true});
const browser=await chromium.launch();
const errors=[];let shot=0;
async function page(viewport={width:390,height:844}){const p=await browser.newPage({viewport});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/404|Failed to load resource/.test(m.text()))errors.push(m.text())});return p;}
const snap=async(p,name)=>{await p.screenshot({path:path.join(out,`${String(++shot).padStart(2,'0')}-${name}.png`)});};
const tapStage=async p=>{await p.locator('#adventureScene').click({position:{x:195,y:300}});await p.waitForTimeout(120);};
async function advanceAdventure(p,{maxTaps=120,choose=0,shots=false}={}){
 for(let i=0;i<maxTaps;i++){
  const inAdv=await p.evaluate(()=>RAScenes.current()==='adventure');if(!inAdv)return;
  const choices=p.locator('.adv-choice:not([disabled])');
  if(await choices.count()){if(shots)await snap(p,'choice');const n=await choices.count();await choices.nth(Math.min(n-1,typeof choose==='function'?choose(n):choose)).click();await p.waitForTimeout(150);continue;}
  if(await p.locator('.ra-minigame').count()){await p.locator('.ra-minigame-quit').click();await p.waitForTimeout(150);continue;}
  if(await p.locator('.c2-scene').count()){if(shots)await snap(p,'combat');const done=p.locator('[data-c2="done"]');if(await done.count()){await done.click();continue;}const f=p.locator('[data-c2="fight"]');if(await f.count()){await f.click();await p.locator('[data-c2^="move:blood"]').click();await p.waitForTimeout(2600);continue;}await p.waitForTimeout(500);continue;}
  await tapStage(p);
 }
}
try{
 if(scenario==='newgame'){
  const p=await page();await p.goto(`${base}/?dev=1`);await p.evaluate(()=>{localStorage.clear();});await p.goto(`${base}/`);
  await p.waitForTimeout(400);await snap(p,'start');
  await p.locator('#startButton').click();await p.waitForFunction(()=>RAScenes.current()==='adventure');await p.waitForTimeout(300);await snap(p,'prologue-dream');
  for(let i=0;i<6;i++)await tapStage(p);await snap(p,'prologue-ocean');
  await advanceAdventure(p,{choose:n=>n-1,shots:true});
  await p.waitForFunction(()=>RAScenes.current()==='battle',null,{timeout:8000});await p.waitForTimeout(400);await snap(p,'throne');
  // Fight the CEO with Blood Bath until the victory card.
  for(let i=0;i<14;i++){if(await p.locator('#victoryOverlay.on').count())break;if(await p.locator('#choiceOverlay.show').count()){await p.locator('#choiceYes').click();}const ok=await p.evaluate(()=>!RACombat.snapshot().busy&&!RACombat.snapshot().battleOver);if(ok){await p.locator('[data-main="fight"]').click();await p.locator('[data-move="blood"]').click();}await p.waitForTimeout(1500);}
  await p.waitForSelector('#victoryOverlay.on',{timeout:30000});await snap(p,'ceo-victory');
  await p.locator('#stealNo').click();
  await p.waitForFunction(()=>RAScenes.current()==='bedroom'&&RAState.get().life.clock.started,null,{timeout:10000});await p.waitForTimeout(900);await snap(p,'first-wake-mail');
  await p.locator('.mail-done').click();await p.waitForTimeout(300);await snap(p,'bedroom-day1');
  await p.locator('#checkPhone').click();await p.waitForTimeout(400);await snap(p,'phone-home');
  await p.locator('[data-phone-action="app:vampgpt"]').click();await p.waitForTimeout(200);await snap(p,'vampgpt');
  await p.reload();await p.waitForTimeout(300);await p.locator('#startButton').click();await p.waitForFunction(()=>RAScenes.current()==='bedroom');await p.waitForTimeout(400);await snap(p,'reload-resume');
  const s=await p.evaluate(()=>({day:RAState.get().life.world.day,started:RAState.get().life.clock.started,flags:RAState.get().life.world.flags}));
  if(!s.started||s.day!==1)throw new Error('resume lost the life clock '+JSON.stringify(s));
  await p.locator('.bedroom-sleep').click();await p.locator('[data-bed="yes"]').click();await p.waitForTimeout(3600);await snap(p,'day2-mail');
  console.log('PASS newgame path',JSON.stringify({day:await p.evaluate(()=>RALife.today().day)}));
 }
 if(scenario==='adventure'){
  const id=process.argv[5];const vars=JSON.parse(process.argv[6]||'{}');const setup=process.argv[7]||'';const p=await page();await p.goto(`${base}/`);
  await p.evaluate(()=>{localStorage.clear();});await p.goto(`${base}/`);
  await p.evaluate(async(id)=>{const s=RAState.migrateRecord(RASaveFixtures.fixtures.supraOwned);RAState.write(localStorage,s,false);RAState.load();},id);
  await p.goto(`${base}/`);await p.locator('#startButton').click();await p.waitForFunction(()=>RAScenes.current()==='bedroom');
  await p.evaluate(({id,vars,setup})=>{if(setup)(new Function(setup))();return RAAdventureScene.begin(id,{from:'qa',vars});},{id,vars,setup});await p.waitForTimeout(400);
  await advanceAdventure(p,{shots:true});await snap(p,`after-${id}`);console.log('PASS adventure',id);
 }
}finally{
 await browser.close();
 if(errors.length){console.error('PAGE ERRORS:\n'+errors.join('\n'));process.exitCode=1;}
}
