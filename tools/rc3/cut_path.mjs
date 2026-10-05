// RC3 browser run at 390: fresh save -> prologue -> FIRST FIGHT (timed) -> bedroom (control, timed) -> day 1 (offer, PLAY, club, sleep) -> day 2 story beat.
// Env: RA_PLAYWRIGHT_PATH + RA_CHROMIUM_PATH (docs/rc2/QA.md). Shots in C:/ra/shots/rc3.
import {open} from '../rc2/harness.mjs';import fs from 'node:fs';
const out='C:/ra/shots/rc3';fs.mkdirSync(out,{recursive:true});
const T0=Date.now(),t=()=>((Date.now()-T0)/1000).toFixed(1);
const h=await open({width:390});const {page}=h;await page.waitForTimeout(800);
const log=[];const say=(...a)=>{const s=`[${t()}s] ${a.join(' ')}`;log.push(s);console.log(s);};
const shot=async n=>page.screenshot({path:`${out}/${n}.png`}).catch(()=>{});
const clickText=async(txt)=>{for(const e of await page.$$('button')){if(!await e.isVisible())continue;const x=(await e.innerText()).toUpperCase();if(x.includes(txt)){await e.click({force:true,timeout:1500}).catch(()=>{});return true;}}return false;};
const st=()=>page.evaluate(()=>({scene:RAScenes.current(),started:RALife.life().clock.started,day:RALife.today().day,money:RALife.money(),adv:RAAdventures.active()?.id||null,choices:document.querySelectorAll('.adv-choices button').length,phone:RAPhone.isOpen()}));
await page.click('#startButton');say('START clicked');
let firstFight=null,control=null;
for(let i=0;i<500&&!control;i++){
 await page.waitForTimeout(250);const s=await st();
 if(s.scene==='battle'&&firstFight==null){firstFight=t();say('FIRST FIGHT on screen');await shot('01_first_fight');}
 if(s.scene==='bedroom'&&s.started){control=t();say('CONTROL: bedroom, life started');break;}
 if(s.choices){await page.click('.adv-choices button').catch(()=>{});continue;}
 if(s.scene==='battle'){await clickText('FIGHT');await clickText('BLOOD');await clickText('STEAL');await clickText('BITE HER');await clickText('YES');await clickText('LET HER FLY');await clickText('CONTINUE');continue;}
 if(s.scene==='character_reveal'){await clickText('YES');await clickText('LET HER FLY');continue;}
 await page.mouse.click(190,430);
}
await page.waitForTimeout(600);await shot('02_bedroom');
console.log(JSON.stringify({firstFight,control,errors:h.errors.slice(0,5)}));
if(process.argv.includes('--stop')){await h.close();process.exit(0);}
// ---- phone
const taps=[];
await page.click('#checkPhone');await page.waitForTimeout(500);taps.push('phone');await shot('03_phone');
const info=await page.evaluate(()=>({tiles:[...document.querySelectorAll('#phoneContent .phone-app-grid .app-button')].map(b=>b.innerText.replace(/\s+/g,' ').trim()),next:document.querySelector('#phoneContent .phone-next-button')?.innerText.replace(/\s+/g,' ')}));
say('tiles',info.tiles.length,JSON.stringify(info.tiles),'next',info.next);
// ---- day 1: tap 2 = NEXT UP (the offer), accept, back, NEXT UP = the PLAY
const snapState=()=>page.evaluate(()=>({scene:RAScenes.current(),day:RALife.today().day,money:RALife.money(),phone:RAPhone.isOpen(),page:RAPhone.page(),body:document.body.innerText.replace(/\s+/g,' ').slice(0,300)}));
await page.click('#phoneContent .phone-next-button');await page.waitForTimeout(400);taps.push('next-up');await shot('04_offer');say('after NEXT UP:',JSON.stringify(await snapState()));
await clickText("I'M IN");await page.waitForTimeout(400);await shot('05_accepted');say('accepted',JSON.stringify((await snapState()).page));
await page.evaluate(()=>RAPhone.home());await page.waitForTimeout(300);
await page.click('#phoneContent .phone-next-button');taps.push('next-up(PLAY)');
await page.waitForSelector('#f01-play-frame',{timeout:20000});const tPlay=t();say('PLAY frame up after',taps.length,'taps from the bedroom',JSON.stringify(taps));
const frame=await (await page.$('#f01-play-frame')).contentFrame();
await frame.waitForSelector('.b-ans',{timeout:30000});await frame.click('.b-ans');await frame.waitForSelector('.send',{timeout:30000});await page.waitForTimeout(300);
const btn=await frame.$("button.send");
if(btn){const bb=await btn.boundingBox();await page.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await page.mouse.down();await page.waitForTimeout(150);await page.mouse.up();await page.mouse.down();await page.waitForTimeout(1900);await page.mouse.up();}else await frame.click('.send');
const t1=Date.now();
for(;;){
 if(Date.now()-t1>600000)throw new Error('PLAY did not finish');
 await page.waitForTimeout(200);
 const s=await frame.evaluate(()=>({d:document.querySelector('.decide button')?document.querySelector('.decide').dataset.kind:null,fb:!!document.querySelector('.decide .fb'),again:!!document.querySelector('.again')})).catch(()=>null);
 if(!s)break;
 if(s.d){const bs=await frame.$$('.decide button');await (s.d==='CLIMB'?await frame.$('.decide button[data-id=OUT]'):bs[0]).click();}
 if(s.fb)await (await frame.$('.decide .fb')).click();
 const dgo=await frame.$('button.d-go');if(dgo&&await dgo.isVisible())await dgo.click().catch(()=>{});else{const dout=await frame.$('button.d-out');if(dout&&await dout.isVisible())await dout.click().catch(()=>{});}
 if(s.again){await shot('07_play_return');await frame.click('.again');break;}
}
await page.waitForFunction(()=>!document.getElementById('f01-play-frame'),null,{timeout:20000});
say('PLAY done; cash',await page.evaluate(()=>RALife.money()));
// ---- the club: 2 taps (phone, STRIP CLUB tile) -> the club scene
if(!await page.evaluate(()=>RAPhone.isOpen()))await page.click('#checkPhone');await page.waitForTimeout(600);
const nextNow=await page.evaluate(()=>document.querySelector('#phoneContent .phone-next-button')?.innerText.replace(/\s+/g,' '));say('NEXT UP after the PLAY:',nextNow);
await page.click('#phoneContent .phone-next-button');await page.waitForTimeout(2500);await shot('08_club');
say('club launched:',JSON.stringify(await page.evaluate(()=>({scene:RAScenes.current(),dom:[...document.querySelectorAll('body > *')].filter(e=>e.getClientRects().length).map(e=>e.id||e.className).slice(0,10)}))));
await clickText('BACK');await page.waitForTimeout(800);await shot('09_after_club');
say('after leaving the club:',JSON.stringify(await snapState()).slice(0,160));
// ---- sleep: ONE tap, no confirm box
await page.evaluate(()=>{if(RAPhone.isOpen())RAPhone.close();});await page.waitForTimeout(500);
const confirmBefore=await page.$('.bed-confirm');
await page.click('.bedroom-sleep');say('SLEEP tapped; confirm box shown:',!!(await page.$('.bed-confirm')),'(was',!!confirmBefore,')');
await page.waitForFunction(()=>RALife.today().day===2,null,{timeout:20000});
await page.waitForTimeout(1800);await shot('10_day2_morning');
const morning=await page.evaluate(()=>({day:RALife.today().day,cards:[...document.querySelectorAll('.morning-mail .mail-card')].map(b=>b.innerText.replace(/\s+/g,' ')),next:RAGuidance.next().label,sub:RAGuidance.next().sub}));
say('DAY 2 morning:',JSON.stringify(morning));
// day 2 story beat: the one card opens the phone to Ogun's invite; answer it; NEXT UP is the rave
const card=await page.$('.morning-mail .mail-card');if(card){await card.click();await page.waitForTimeout(700);await shot('11_day2_invite');say('invite page:',(await page.evaluate(()=>document.querySelector('#phoneContent').innerText.replace(/\s+/g,' ').slice(0,160))));await clickText("I'M THERE");await page.waitForTimeout(500);}
await page.evaluate(()=>{if(!RAPhone.isOpen())RAPhone.open();RAPhone.home();});await page.waitForTimeout(500);
say('DAY 2 NEXT UP:',await page.evaluate(()=>document.querySelector('#phoneContent .phone-next-button')?.innerText.replace(/\s+/g,' ')));
await shot('12_day2_nextup');
say('errors:',JSON.stringify(h.errors.slice(0,5)));
await h.close();
