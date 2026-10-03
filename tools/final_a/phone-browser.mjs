import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.RA_PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(''),arg=n=>process.argv.includes(n)?process.argv[process.argv.indexOf(n)+1]:null;
const phase=arg('--phase')||'after',base=arg('--base'),out=path.join(root,'docs/evidence/final_a/stage1',phase);
fs.mkdirSync(out,{recursive:true});
const cache=new Map(),mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.mp3':'audio/mpeg','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{try{const rel=decodeURIComponent(new URL(req.url,'http://x').pathname).replace(/^\//,'')||'index.html';if(rel.includes('..'))throw Error('path');let bytes;if(base&&(!rel.startsWith('assets/')||/\.(css|mjs|js|html)$/.test(rel))){if(!cache.has(rel))cache.set(rel,execFileSync('git',['-c','gc.auto=0','show',`${base}:${rel}`],{cwd:root,maxBuffer:30*1024*1024,stdio:['ignore','pipe','ignore']}));bytes=cache.get(rel);}else bytes=fs.readFileSync(path.join(root,rel));res.writeHead(200,{'content-type':mime[path.extname(rel)]||'application/octet-stream','cache-control':'no-store'});res.end(bytes);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.RA_CHROMIUM_PATH}),rows=[],errors=[],checks=[];
try{
 for(const width of [360,390,430]){
  const page=await browser.newPage({viewport:{width,height:844}});page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));
  await page.goto(`http://127.0.0.1:${server.address().port}/?dev=1&ff=F02.iron_and_grace,F02.armory,F04.war_room,F05.trap,F06.rainmaker,F15.velvet_rotation`);
  await page.waitForFunction(()=>window.RAPhone&&window.RALife&&window.RAClock);
  await page.evaluate(async()=>{RAState.reset();RAState.patch('life.clock.started',true);for(const k of ['prologueDone','throneDone','firstWakeDone'])RALife.setFlag(k,true);await RAScenes.go('bedroom',{dev:true});document.querySelector('#devPanel')?.remove();RAAudio.unlock();});
  await page.evaluate(()=>RAPhone.open());await page.waitForTimeout(260);
  const shot=async name=>{await page.locator('#screen').screenshot({path:path.join(out,`${width}-${name}.png`)});const geometry=await page.evaluate(()=>{const c=document.querySelector('#phoneContent'),b=c.getBoundingClientRect();return {page:RAPhone.page(),scroll:c.scrollWidth,contentWidth:c.clientWidth,rect:{x:b.x,y:b.y,width:b.width,height:b.height},appButtons:c.querySelectorAll('.app-button').length,next:c.querySelector('.phone-next [data-phone-action]')?.dataset.phoneAction,theme:c.dataset.phoneApp,buttons:[...c.querySelectorAll('button')].map(b=>({action:b.dataset.phoneAction,label:b.innerText}))};});rows.push({width,name,...geometry});};
  await shot('fresh-home');
  if(await page.locator('#phoneLockButton').count()){
   await page.click('#phoneLockButton');await shot('device-lock');
   const box=await page.locator('#phoneContent').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height*.75);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+box.height*.4,{steps:8});await page.mouse.up();
   checks.push({width,check:'swipe-up unlock',pass:await page.locator('#phoneOverlay.device-locked').count()===0});
   await page.locator('[data-phone-action="app:vampgram"]').click();await shot('app-lock-guidance');
   checks.push({width,check:'lock reason and unlock route',pass:await page.locator('.phone-message').innerText().then(t=>/UNLOCK:/.test(t))});
   await page.evaluate(()=>RAPhone.home());
  }
  await page.evaluate(()=>{for(const a of RAPhoneApps.list())if(!a.hidden)RALife.unlockApp(a.id,{silent:true});RALife.unlockApp('vampgram',{silent:true});RALife.unlockApp('instahoe',{silent:true});RARelations.meet('kiki','boba');RALife.text('family','MOM','eat first.',{id:'phone-evidence-family'});RALife.text('kiki','KIKI','boba?',{id:'phone-evidence-dm'});RAVampGram.post({id:'phone-evidence-post',handle:'richalucard',text:'…still here.',likes:12});RAFrag.patch('F04','active',true);RAFrag.patch('F04','offer.status','accepted');RAState.patch('life.resources.money',300000);RAPhone.home();});
  await shot('progressed-home');
  const apps=await page.evaluate(()=>RAPhoneApps.list().filter(a=>!a.hidden).map(a=>a.id));
  for(const id of [...new Set(['vampgpt','realEstate','jdmImports',...apps])]){await page.evaluate(id=>RAPhone.openApp(id),id);await page.waitForTimeout(130);await shot(id);if(id==='contacts'&&await page.locator('[data-phone-key="k"]').count()){await page.locator('[data-phone-key="k"]').click();await shot('contacts-keyboard');checks.push({width,check:'pixel keyboard filters contacts',pass:await page.locator('[data-contact-search]').inputValue()==='k'&&await page.locator('[data-contact-name]:not([hidden])').count()===1});await page.locator('[data-phone-key="clear"]').click();}}
  for(const [pageId,name] of [['options','vampgpt-options'],['money','vampgpt-money'],['people','vampgpt-people'],['somewhere','maps-destinations'],['settings','audio']]){await page.evaluate(id=>RAPhone.api.go(id),pageId);await shot(name);}
  await page.evaluate(()=>RAPhone.openApp('texts','family'));await shot('texts-family');
  await page.evaluate(()=>RAPhone.openApp('instahoe','p:kiki'));await shot('contacts-profile');
  await page.evaluate(()=>RAPhone.openApp('instahoe','dm:kiki'));await shot('contacts-dm');
  for(const [id,sub] of [['armory','bench'],['warRoom','jobs'],['warRoom','crew'],['warRoom','reports'],['trap','report']]){await page.evaluate(({id,sub})=>RAPhone.openApp(id,sub),{id,sub});await shot(`${id}-${sub}`);}
  await page.close();
 }
 const violations=rows.filter(r=>r.scroll>r.contentWidth+1);
 fs.writeFileSync(path.join(out,'screens.json'),JSON.stringify({phase,base,rows,checks,errors,violations},null,2)+'\n');
 console.log(JSON.stringify({phase,screens:rows.length,checks,errors,overflow:violations.map(r=>`${r.width}:${r.name}`)}));if(errors.length||violations.length||checks.some(c=>!c.pass))process.exitCode=1;
}finally{await browser.close();server.close();}
