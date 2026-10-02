import fs from 'node:fs';import path from 'node:path';
import {serve,loadPlaywright} from '../tests/f05/_browser-lib.mjs';
const args=process.argv;const only=args.includes('--width')?+args[args.indexOf('--width')+1]:null;
const results=[],out='docs/evidence/build2';fs.mkdirSync(out,{recursive:true});
const check=(width,name,ok,detail='')=>{results.push({width,name,ok,detail});console.log(ok?'PASS':'FAIL',width,name,detail);};
const server=await serve();const origin=`http://127.0.0.1:${server.address().port}`;
const {chromium}=loadPlaywright();const browser=await chromium.launch({headless:true,executablePath:process.env.RA_CHROMIUM_PATH});
const flags='F01.showdown_core,F02.iron_and_grace,F02.armory,F02.range_day,F04.war_room,F05.trap';
async function drivePlay(page,tag,width,selectGun=true){
 await page.waitForSelector('#f01-play-frame',{timeout:15000});
 const frame=await (await page.$('#f01-play-frame')).contentFrame();
 await frame.waitForSelector('.b-ans',{timeout:30000});await frame.click('.b-ans');await frame.waitForSelector('.send');
 if(selectGun){
  const slots=frame.locator('.card .wslot');
  let found=false;
  for(let i=0;i<12;i++){if(/Mac & Cheese/i.test(await slots.first().innerText())){found=true;break;}await slots.first().click();}
  check(width,tag+' bought gun in existing loadout selector',found);
 }
 await page.screenshot({path:`${out}/${width}-${tag}-loadout.png`});await frame.click('.send');
 let end=false;const until=Date.now()+120000;
 while(Date.now()<until){
  await page.waitForTimeout(150);
  const state=await frame.evaluate(()=>({kind:document.querySelector('.decide')?.dataset.kind,buttons:document.querySelectorAll('.decide button').length,again:!!document.querySelector('.again')}));
  if(state.again){end=true;break;}
  if(state.buttons){const button=state.kind==='CLIMB'?frame.locator('.decide button[data-id="OUT"]'):frame.locator('.decide button').first();await button.click().catch(()=>{});}
 }
 check(width,tag+' terminates through real UI',end);
 if(end){
  const data=await frame.evaluate(()=>({gun:window.__raPlay.G.last?.rec.stateOut.roster.map(o=>o.gun),audio:window.__raFeelAudio,rec:window.__raPlay.G.last?.rec.klass}));
  check(width,tag+' F02 gun preserved in PLAY record',data.gun.includes('mac_and_cheese'),data.rec);
  await page.screenshot({path:`${out}/${width}-${tag}-return.png`});await frame.click('.again');await page.waitForSelector('#f01-play-frame',{state:'detached'});
 }
}
try{
 for(const width of only?[only]:[360,390,430]){
  const context=await browser.newContext({viewport:{width,height:844}}),page=await context.newPage(),errors=[];
  await page.addInitScript(()=>{window.__b2Media=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__b2Media.push(this.src);return play.call(this);};});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errors.push(`HTTP ${r.status()} ${r.url()}`);});
  try{
   await page.goto(`${origin}/?dev=1&ff=${flags}&speed=10`);await page.waitForFunction(()=>window.RAIron&&window.RAHoldBridge);
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
    const lane=await page.evaluate(()=>[...document.querySelectorAll('.rd-lane')].findIndex(e=>e.querySelector('.rd-target:not(.rd-hostage)')&&!e.querySelector('.rd-hostage')));
    if(lane>=0){const box=await page.locator('.rd-lane').nth(lane).boundingBox();if(box)await page.mouse.click(box.x+box.width/2,box.y+box.height/2);}
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
   // Browser decoding and playback proof for every GN family. No sealed codes toured.
   const audio=await page.evaluate(async()=>{const ids=['GN_01','GN_02','GN_03','GN_04','GN_05','GN_06'];await Promise.all(ids.map(id=>RAAudio.preload(id)));for(const id of ids)RAAudio.oneShot(id);RAAudio.stop('GN_03',0);return ids.every(id=>RAAudio.describe().plays[id]>0);});
   check(width,'GN_01–GN_06 decode and play',audio);
   check(width,'UI tap sound observed',await page.evaluate(()=>RAAudio.describe().plays.UI_TAP>0));
   check(width,'no page/network errors',errors.length===0,errors.join('; '));
  }catch(e){await page.screenshot({path:`${out}/${width}-failure.png`});check(width,'path exception',false,(e.stack||String(e))+'\n'+await page.evaluate(()=>document.body.innerText));}
  await context.close();
 }
}finally{await browser.close();server.close();}
const ok=results.every(r=>r.ok);fs.writeFileSync(`${out}/browser-${only||'all'}.json`,JSON.stringify({ok,results},null,2)+'\n');console.log(ok?'PASS':'FAIL','BUILD2 real-browser path');process.exitCode=ok?0:1;
