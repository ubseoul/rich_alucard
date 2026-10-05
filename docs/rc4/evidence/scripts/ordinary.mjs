import {fileURLToPath} from 'node:url';
// Actual clicks, fresh storage, normal animation timings, 390px. No patched saves or debug victories.
import {open} from '../../../../tools/rc2/harness.mjs';
import fs from 'node:fs';
const out=fileURLToPath(new URL('../ordinary/',import.meta.url));fs.mkdirSync(out,{recursive:true});
const h=await open({width:390,height:844});const p=h.page;
const visible=async s=>await p.locator(s).first().isVisible().catch(()=>false);
const click=async s=>{await p.locator(s).first().click();await p.waitForTimeout(300);};
const snap=async name=>p.screenshot({path:`${out}/${name}.png`});
const log={width:390,fresh:true,firstFightSeconds:null,steps:[],errors:h.errors};
const state=()=>p.evaluate(()=>({scene:RAScenes.current(),adv:RAAdventures.active()?.id,node:RAAdventures.active()?.node,day:RALife.today().day,next:RAGuidance.next(),daily:RARC3.read()}));
try{
 await p.waitForTimeout(1000);const start=Date.now();await click('#startButton');
 for(let i=0;i<140;i++){
  const s=await state();
  if(s.scene==='battle'&&await p.evaluate(()=>RALife.flag('prologueDone'))){log.firstFightSeconds=(Date.now()-start)/1000;await snap('01-first-fight');break;}
  if(await visible('.adv-choices button'))await click('.adv-choices button');
  else if(await visible('#adventureScene')){await p.locator('#adventureScene').click({position:{x:135,y:210}});await p.waitForTimeout(1000);}
  else await p.waitForTimeout(500);
 }
 if(log.firstFightSeconds===null||log.firstFightSeconds>180)throw Error('First fight missed the three-minute target');
 // CEO fight, using the normal FIGHT / BLOOD BATH buttons.
 for(let i=0;i<80;i++){
  if(await visible('#victoryOverlay.on')){await p.locator('#stealNo').waitFor({state:'visible',timeout:15000});await click('#stealNo');break;}
  if(await p.evaluate(()=>RACombat.snapshot().busy)){await p.waitForTimeout(500);continue;}
  const b=p.locator('[data-move="blood"]');if(await b.isVisible()&&await b.isEnabled())await click('[data-move="blood"]');
  else if(await visible('#fightBtn'))await click('#fightBtn');
  else {const f=p.getByRole('button',{name:/^FIGHT$|▶ FIGHT/}).first();if(await f.isVisible()&&await f.isEnabled())await f.click();}
  await p.waitForTimeout(800);
 }
 await p.waitForFunction(()=>RALife.flag('firstWakeDone'),{timeout:20000});await p.waitForTimeout(1200);
 if(await visible('.mail-done'))await click('.mail-done');await click('#checkPhone');
 log.apps=await p.locator('.app-button .phone-app-label').allTextContents();if(log.apps.length!==9)throw Error('Phone did not show exactly nine apps');await snap('02-nine-apps');
 await click('[data-phone-action="app:armory"]');await click('[data-phone-action="app:armory:move:0"]');
 if(!await visible('[data-phone-action="do:armory:moveEquip:0|bite"]'))throw Error('Move swapping was lost with the MOVES tile');
 await click('[data-phone-action="do:armory:moveEquip:0|blood"]');await snap('08-armory-moves');
 await p.evaluate(()=>RAPhone.home());await click('[data-phone-action="app:bank"]');
 if(!await p.locator('#phoneContent').getByText('BIG GOAL · PARTY HALL',{exact:true}).isVisible())throw Error('Collapsed Bank missing Party Hall');await snap('09-bank');
 await p.evaluate(()=>RAPhone.home());await click('[data-phone-action="app:maps"]');
 if(await p.locator('[data-phone-action^="rc3:map:"]').count()!==20)throw Error('Maps did not offer exactly twenty adventures');await snap('10-maps');
 await p.evaluate(()=>RAPhone.home());
 await click('[data-phone-action="rc3:next"]');
 // Rave: Build B's real rhythm game, then normal combat choices.
 log.raveVoice=[];
 async function collectRaveVoice(){const text=(await p.locator('.rave-dialogue').allTextContents()).join('\n');
  for(const line of ['yall listen to carti?','whats haddenning','never met vampire ogas who listen to country',"oh shit, that's Blad33ee!",'here we go again'])if(text.includes(line)&&!log.raveVoice.includes(line))log.raveVoice.push(line);
 }
 async function rhythm(){const keys=['ArrowLeft','ArrowDown','ArrowUp','ArrowRight'],start=Date.now();
  while(await p.locator('.ra-minigame-stage').count()){
   const st=await p.locator('.ra-minigame-stage').evaluate(e=>({phase:e.dataset.phase,due:e.dataset.due||''}));if(st.phase==='results')break;
   for(const lane of new Set(st.due.split(',').filter(Boolean)))await p.keyboard.press(keys[Number(lane)]);
   if(Date.now()-start>50000)throw Error('Rave rhythm did not settle');await p.waitForTimeout(35);
  }
 }
 for(let i=0;i<70;i++){
  await collectRaveVoice();
  if(await visible('.ra-minigame-start')){await click('.ra-minigame-start');await rhythm();await collectRaveVoice();}
  if(await p.evaluate(()=>!!RACombat2.active())){await p.locator('[data-c2="fight"]').waitFor({state:'visible'});break;}
  if(await visible('[data-behavior="head-nod"]')&&await p.locator('[data-behavior="head-nod"]').getAttribute('aria-pressed')!=='true')await click('[data-behavior="head-nod"]');
  if(await visible('.rave-party-action')&&await p.locator('.rave-party-action').isEnabled())await click('.rave-party-action');
  else if(await visible('[data-rave-choice]'))await click('[data-rave-choice]');
  await p.waitForTimeout(400);
 }
 if(log.raveVoice.length!==5)throw Error('Missing authored rave lines: '+JSON.stringify(log.raveVoice));
 await snap('03-blad33ee');
 async function combat(){for(let i=0;i<100;i++){
  if(await visible('[data-c2="done"]')){await click('[data-c2="done"]');return;}
  if(await visible('[data-c2="move:revenge"]')){const revenge=await p.evaluate(()=>RACombat2.active()?.state?.rich.revenge||0);await click(revenge>=20?'[data-c2="move:revenge"]':'[data-c2="move:blood"]');}
  else if(await visible('[data-c2="fight"]'))await click('[data-c2="fight"]');
  else if(!await p.evaluate(()=>!!RACombat2.active()))return;
  await p.waitForTimeout(500);
 }throw Error('Combat did not resolve');}
 await combat();
 for(let i=0;i<20;i++){if((await state()).scene==='bedroom')break;if(await visible('[data-rave-choice]'))await click('[data-rave-choice]');else await p.waitForTimeout(500);}
 await p.waitForTimeout(700);if(await visible('.mail-done'))await click('.mail-done');await click('#checkPhone');
 log.steps.push(await state());await click('[data-phone-action="rc3:next"]');log.cashAfterStory=await p.evaluate(()=>RALife.money());
 await click('[data-phone-action="rc3:next"]');await p.waitForTimeout(1800);await snap('04-club-night');
 const clubText=(await p.locator('[role="status"]').allTextContents()).join('\n');
 for(const line of ['damn this shit is like magic city','gonna make it rain like hell'])if(!clubText.includes(line))throw Error('Missing club voice: '+line);
 log.clubVoice=['damn this shit is like magic city','gonna make it rain like hell'];
 console.log('CLUB_BUTTONS',await p.locator('button:visible').allTextContents());
 const club=p.locator('[data-back]');await club.waitFor({state:'visible'});
 await p.locator('[data-budget="5000"]').click();
 // Use the real canvas drag/flick input, then return using the club's BACK control.
 const canvas=await p.locator('canvas#stage-canvas').boundingBox();
 for(let i=0;i<3;i++){await p.mouse.move(canvas.x+canvas.width*.5,canvas.y+canvas.height*.85);await p.mouse.down();await p.mouse.move(canvas.x+canvas.width*.5,canvas.y+canvas.height*.35,{steps:6});await p.mouse.move(canvas.x+canvas.width*.5,canvas.y+canvas.height*.15,{steps:2});await p.mouse.up();await p.waitForTimeout(250);}
 await p.waitForTimeout(1000);
 if(!((await p.locator('[role="status"]').allTextContents()).join('\n')).includes('dance for me dance!'))throw Error('First paid throw voice missing');
 log.clubVoice.push('dance for me dance!');await snap('11-first-paid-throw');await club.click();await p.waitForTimeout(600);
 await click('#checkPhone');log.steps.push(await state());await snap('05-day1-complete');await click('[data-phone-action="rc3:next"]');
 await p.waitForFunction(()=>RALife.today().day===2);await p.waitForTimeout(3500);
 if(await visible('.mail-done'))await click('.mail-done');await click('#checkPhone');
 log.steps.push(await state());if((await state()).next.label!=='JUG THE PLUG')throw Error('Day 2 story beat is not Jug the Plug');
 await snap('06-day2-story');await click('[data-phone-action="rc3:next"]');await p.waitForTimeout(500);
 if((await state()).adv!=='NEW_OGA_M1')throw Error('Day 2 mission failed to start');
 await snap('07-day2-jug-the-plug');if(h.errors.length)throw Error('Browser errors: '+h.errors.join('; '));
 log.day1Complete=true;log.day2Beat='JUG THE PLUG';
 fs.writeFileSync(`${out}/browser-path.json`,JSON.stringify(log,null,2));
 console.log(JSON.stringify(log,null,2));
}catch(e){log.failure=String(e);await snap('failure');fs.writeFileSync(`${out}/browser-partial.json`,JSON.stringify(log,null,2));throw e;}
finally{await h.close();}
