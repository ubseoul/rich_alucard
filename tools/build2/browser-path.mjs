import fs from 'node:fs';import path from 'node:path';
import {serve,loadPlaywright} from '../tests/f05/_browser-lib.mjs';
const args=process.argv;const only=args.includes('--width')?+args[args.indexOf('--width')+1]:null;
const tapRows=[];
async function tap(frame,selector,screen){
 const page=frame.page(),loc=frame.locator(selector).first(),label=await loc.innerText().catch(()=>selector),read=()=>page.evaluate(()=>{const d=window.RAAudio?.describe?.();return {child:window.__b2TapMedia?.length||0,host:Object.fromEntries(Object.entries(d?.plays||{}).filter(([id])=>/^UI_(TAP|CONFIRM|BACK)$/.test(id))),context:d?.context,rejected:window.__b2TapRejected?.length||0};}),before=await read();
 await loc.click();await page.waitForTimeout(250);await page.waitForFunction(b=>{const p=window.RAAudio?.describe?.().plays||{};return (window.__b2TapMedia?.length||0)-b.child+Object.entries(p).filter(([id])=>/^UI_(TAP|CONFIRM|BACK)$/.test(id)).reduce((n,[id,k])=>n+k-(b.host[id]||0),0)>0;},before,{timeout:1500}).catch(()=>{});
 const after=await read(),parentWebAudio=Object.fromEntries(Object.entries(after.host).map(([id,n])=>[id,n-(before.host[id]||0)]).filter(([,n])=>n>0)),childMedia=after.child-before.child,starts=childMedia+Object.values(parentWebAudio).reduce((a,b)=>a+b,0),mediaRejected=await page.evaluate(n=>(window.__b2TapRejected||[]).slice(n),before.rejected);
 tapRows.push({width:page.viewportSize().width,screen,element:label.trim(),sound:starts>0,starts,origins:{childMedia,parentWebAudio,parentContext:after.context},mediaRejected});
}
const results=[],out=args.includes('--out')?args[args.indexOf('--out')+1]:'docs/evidence/build2';fs.mkdirSync(out,{recursive:true});
const check=(width,name,ok,detail='')=>{results.push({width,name,ok,detail});console.log(ok?'PASS':'FAIL',width,name,detail);};
const server=await serve();const origin=`http://127.0.0.1:${server.address().port}`;
const {chromium}=loadPlaywright();const browser=await chromium.launch({headless:true,executablePath:process.env.RA_CHROMIUM_PATH});
const flags='F01.showdown_core,F02.iron_and_grace,F02.armory,F02.range_day,F04.war_room,F05.trap';
async function drivePlay(page,tag,width,selectGun=true,audit=false){
 await page.waitForSelector('#f01-play-frame',{timeout:15000});
 const frame=await (await page.$('#f01-play-frame')).contentFrame();
 const readyUntil=Date.now()+30000;
 while(Date.now()<readyUntil){if(await frame.locator('.b-ans').count())break;if(await frame.locator('[data-done]').count())await tap(frame,'[data-done]',tag+' home');await page.waitForTimeout(100);}
 await frame.waitForSelector('.b-ans',{timeout:5000});await tap(frame,'.b-ans',tag+' offer');await frame.waitForSelector('.send');
 if(selectGun){
  const slots=frame.locator('.card .wslot');
  let found=false;
  for(let i=0;i<12;i++){if(/Mac & Cheese/i.test(await slots.first().innerText())){found=true;break;}await tap(frame,'.card .wslot',tag+' weapon slot');}
  check(width,tag+' bought gun in existing loadout selector',found);
 }
 if(width===390&&audit){
  await tap(frame,'#gear',tag+' settings');
  for(const key of ['moreTime','reduceMotion'])await tap(frame,`[data-k="${key}"]`,tag+' settings');
  await tap(frame,'[data-close]',tag+' settings');
  if(await frame.locator('.carpick').count()){await tap(frame,'.carpick',tag+' car selector');await tap(frame,'.car',tag+' car sprite');}
  for(let i=0;i<await frame.locator('.card .wslot').count();i++){
   const before=await page.evaluate(()=>window.__b2TapMedia?.length||0);await frame.locator('.card .wslot').nth(i).click();await page.waitForTimeout(250);const after=await page.evaluate(()=>window.__b2TapMedia?.length||0);tapRows.push({screen:tag+' crew',element:'weapon slot '+i,sound:after>before,starts:after-before});
   if(await frame.locator('.sw').nth(i).count()){const n=await frame.locator('.bench .bi').count();await tap(frame,`.card:nth-child(${i+1}) .sw`,tag+' swap opener');const benchCount=await frame.locator('.bench .bi').count();for(let j=0;j<benchCount;j++){if(j)await frame.locator('.sw').nth(i).click();const b=frame.locator('.bench .bi').nth(j),old=await page.evaluate(()=>window.__b2TapMedia?.length||0);await b.click();await page.waitForTimeout(250);const end=await page.evaluate(()=>window.__b2TapMedia?.length||0);tapRows.push({screen:tag+' bench',element:'crew option '+j,sound:end>old,starts:end-old});if(await frame.locator('.bench').count())await tap(frame,'.bench .bi:not(.off)',tag+' bench return');}}
  }
 }
 // Census cycling can unequip the test weapon; restore it through the same real controls before launch.
 for(let slot=1;slot<await frame.locator('.card .wslot').count();slot++)for(let i=0;i<20&&!/BARE HANDS/.test(await frame.locator('.card .wslot').nth(slot).innerText());i++)await frame.locator('.card .wslot').nth(slot).click();
 for(let i=0;i<20&&!/Mac & Cheese/i.test(await frame.locator('.card .wslot').first().innerText());i++)await tap(frame,'.card .wslot',tag+' bought weapon restore');
 await page.screenshot({path:`${out}/${width}-${tag}-loadout.png`});
 const sendBefore=await page.evaluate(()=>window.__b2TapMedia?.length||0);if(await frame.locator('.send.hold').count()){const box=await frame.locator('.send').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(1900);await page.mouse.up();}else await frame.click('.send');await page.waitForTimeout(250);const sendAfter=await page.evaluate(()=>window.__b2TapMedia?.length||0);tapRows.push({screen:tag+' crew',element:'send / hold',sound:sendAfter>sendBefore,starts:sendAfter-sendBefore});
 let end=false;const until=Date.now()+120000;
 while(Date.now()<until){
  await page.waitForTimeout(150);
  const state=await frame.evaluate(()=>({kind:document.querySelector('.decide')?.dataset.kind,buttons:document.querySelectorAll('.decide button').length,again:!!document.querySelector('.again')}));
  if(state.again){end=true;break;}
  if(state.buttons){const button=state.kind==='CLIMB'?frame.locator('.decide button[data-id="OUT"]'):frame.locator('.decide button').first();const id=await button.getAttribute('data-id');await tap(frame,`.decide button[data-id="${id}"]`,tag+' decision '+state.kind).catch(()=>{});}
 }
 check(width,tag+' terminates through real UI',end);
 if(end){
  const data=await frame.evaluate(()=>({gun:window.__raPlay.G.last?.rec.stateOut.roster.map(o=>o.gun),lost:window.__raPlay.G.last?.rec.lost?.guns.map(g=>g.gun)||[],audio:window.__raPlay.K.audio.log,rec:window.__raPlay.G.last?.rec.klass}));
  check(width,tag+' F02 gun preserved in PLAY record',data.gun.includes('mac_and_cheese')||data.lost.includes('mac_and_cheese'),data.rec+'; authored losses '+data.lost.join(',' ));
  if(!audit)check(width,tag+' bought gun GN_01 actually plays in iframe',data.audio.includes('GN_01.mp3'));
  await page.screenshot({path:`${out}/${width}-${tag}-return.png`});await tap(frame,'.again',tag+' return');await page.waitForSelector('#f01-play-frame',{state:'detached'});
 }
}
try{
 for(const width of only?[only]:[360,390,430]){
  const context=await browser.newContext({viewport:{width,height:844}}),page=await context.newPage(),errors=[];
  await page.addInitScript(()=>{window.__b2Media=[];window.__b2TapMedia=[];window.__b2TapRejected=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__b2Media.push(this.src);const result=play.call(this);if(/UI_(TAP|CONFIRM|BACK)\.mp3/.test(this.src))result?.then(()=>window.top.__b2TapMedia.push(this.src),e=>window.top.__b2TapRejected.push({src:this.src,reason:e.name+': '+e.message}));return result;};});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errors.push(`HTTP ${r.status()} ${r.url()}`);});
  try{
   await page.goto(`${origin}/?dev=1&ff=${flags}&speed=3`);await page.waitForFunction(()=>window.RAIron&&window.RAHoldBridge);
   await page.evaluate(()=>{const s=RAState.migrateRecord(RASaveFixtures.fixtures.supraOwned);s.life.clock.started=true;for(const key of ['prologueDone','throneDone','firstWakeDone','armoryKnown'])s.life.world.flags[key]=true;RAState.write(localStorage,s,false);});
   await page.reload();await page.waitForFunction(()=>window.RAIron);
   await page.evaluate(()=>{RAState.patch('life.resources.money',1000000);RALife.setFlag('armoryKnown',true);RAClock.wake({first:true});RAFrag.patch('F04','active',true);RAFrag.patch('F04','offer.status','accepted');RAPhoneRegistry.unlock('warRoom');});
   await page.click('#startButton');await page.waitForFunction(()=>document.body.classList.contains('bedroom-mode'));
   if(await page.locator('.mail-done').count())await page.click('.mail-done');
   await page.click('#checkPhone',{force:true});await page.waitForFunction(()=>RAPhone.isOpen());
   await page.evaluate(()=>RAPhone.openApp('armory'));await page.waitForSelector('#phoneContent .ia-gun');
   const cash=await page.evaluate(()=>RALife.money());await page.click('[data-phone-action="do:armory:buy:mac_and_cheese"]');
   check(width,'buy gun through Armory UI',await page.evaluate(before=>RAIronAndGrace.owns('mac_and_cheese')&&before-RALife.money()===RAIronCatalog.byId('mac_and_cheese').price,cash));
   await page.click('[data-phone-action="do:armory:equip:mac_and_cheese"]');await page.screenshot({path:`${out}/${width}-armory.png`});
   await page.click('[data-phone-action="do:armory:range:mac_and_cheese"]');await page.waitForSelector('.rd-lane');await page.screenshot({path:`${out}/${width}-range-day.png`});
   const end=Date.now()+65000;
   while(Date.now()<end&&await page.locator('.rd-lane').count()){
    // Read target and geometry together: Range Day can settle between separate locator reads.
    const box=await page.evaluate(()=>{const e=[...document.querySelectorAll('.rd-lane')].find(e=>e.querySelector('.rd-target:not(.rd-hostage)')&&!e.querySelector('.rd-hostage'));if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};});
    if(box)await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
    await page.waitForTimeout(160);
   }
   check(width,'complete one full Range Day',await page.evaluate(()=>RAFrag.read('F02','range.mac_and_cheese.attempts',0)>0));
   check(width,'range target clack GN_06 actually plays',await page.evaluate(()=>!!RAAudio.describe().plays.GN_06));
   await page.evaluate(()=>{RAPhone.close();window.__b2Fight=RACombat2.run('bruce_loose',{noPenalty:true});});await page.waitForSelector('.c2-scene');
   await page.click('[data-c2="weapon:iron_and_grace_gun"]');await page.waitForTimeout(900);await page.screenshot({path:`${out}/${width}-menu-combat.png`});
   check(width,'menu gun action plays GN_01',await page.evaluate(()=>!!RAAudio.describe().plays.GN_01));
   await page.evaluate(()=>RACombat2.debugResolve('win'));await page.click('[data-c2="done"]');await page.waitForSelector('.c2-scene',{state:'detached'});
   await page.evaluate(()=>{const job=RAWarRoomJobs.buildJobCard({type:'TAKE_THE_BLOCK',district:'arts_district'});window.__b2Play=RAWarRoomPlay.launch(job);});
   await drivePlay(page,'play',width);
   // F05 authored setup, real NIGHT scheduling, existing HOLD iframe bridge.
   await page.evaluate(()=>{for(const o of RACrew.list({fragment:'F04'}))if(o.status!=='GONE')RACrew.setStatus(o.id,'ACTIVE',{reason:'browser-fixture'});
    const R=RAF05;RAState.patch('life.newOga',{...RAState.get().life.newOga,rank:3,status:'associate'});R.unlock.tick();RAState.patch('life.resources.money',1000000);R.unlock.buy('the_bando');R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});R.store.addUnbanked(1000);RAHeat.add(70,{source:'browser'});RAClock.sleep();RAIronAndGrace.trap.assign('trap:dre','mac_and_cheese');});
   check(width,'real NIGHT schedules trap raid',await page.evaluate(()=>!!RATrap.raids.pending()));
   await page.evaluate(()=>{window.__b2Hold=RAHoldBridge.start();});await drivePlay(page,'trap-raid',width,false);
   check(width,'trap raid delivered',await page.evaluate(()=>!RATrap.raids.pending()));
   // Isolated THE PLAY control census, after the integration path is already proved.
   if(width===390){await page.evaluate(()=>{window.__b2TapPlay=RAWarRoomPlay.launch(RAWarRoomJobs.buildJobCard({type:'DROP',district:'arts_district'}));});await drivePlay(page,'tap-play',width,true,true);}
   // Browser decoding and playback proof for every GN family. No sealed codes toured.
   const audio=await page.evaluate(async()=>{const ids=['GN_01','GN_02','GN_03','GN_04','GN_05','GN_06'];await Promise.all(ids.map(id=>RAAudio.preload(id)));for(const id of ids)RAAudio.oneShot(id);RAAudio.stop('GN_03',0);return ids.every(id=>RAAudio.describe().plays[id]>0);});
   check(width,'GN_01–GN_06 decode and play',audio);
   check(width,'UI tap sound observed',await page.evaluate(()=>RAAudio.describe().plays.UI_TAP>0));
   check(width,'no page/network errors',errors.length===0,errors.join('; '));
  }catch(e){await page.screenshot({path:`${out}/${width}-failure.png`});check(width,'path exception',false,(e.stack||String(e))+'\n'+await page.evaluate(()=>document.body.innerText));}
  await context.close();
 }
}finally{await browser.close();server.close();}
fs.writeFileSync(`${out}/tap-paths-${only||'all'}.json`,JSON.stringify({rows:tapRows,tapped:tapRows.length,withSound:tapRows.filter(r=>r.sound).length,failures:tapRows.filter(r=>!r.sound)},null,2)+'\n');
const ok=results.every(r=>r.ok)&&tapRows.every(r=>r.sound);fs.writeFileSync(`${out}/browser-${only||'all'}.json`,JSON.stringify({ok,results},null,2)+'\n');console.log(ok?'PASS':'FAIL','BUILD2 real-browser path');process.exitCode=ok?0:1;
