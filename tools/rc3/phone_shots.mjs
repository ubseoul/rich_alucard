// RC3: screenshots of the eight-app phone pages on a seeded Day 3 life (390 wide). Shots in C:/ra/shots/rc3/pages.
import {open} from '../rc2/harness.mjs';import fs from 'node:fs';
const out='C:/ra/shots/rc3/pages';fs.mkdirSync(out,{recursive:true});
const h=await open({width:390,query:'?dev=1'});const {page}=h;await page.waitForTimeout(800);
await page.evaluate(async()=>{for(const f of ['prologueDone','throneDone','firstWakeDone'])RAState.patch('life.world.flags.'+f,true);RAClock.wake({first:true});RAPhoneApps.get('warRoom').onAction('accept','',{refresh(){},message(){}});RALife.setFlag('guideVampgptOpened',true);RALife.setFlag('ogunsRaveCompleted',true);RAState.patch('life.world.day',3);RAClock.wake({});await RAScenes.go('bedroom',{});});
await page.waitForTimeout(900);
const shot=async n=>{await page.waitForTimeout(350);await page.screenshot({path:`${out}/${n}.png`});};
await page.click('#checkPhone');await shot('home');
for(const [name,go] of [['vampgpt',()=>RAPhone.openApp('vampgpt')],['maps',()=>RAPhone.openApp('maps')],['bank',()=>RAPhone.openApp('bank')],['texts',()=>RAPhone.openApp('texts')],['feed',()=>RAPhone.openApp('texts','feed')],['armory',()=>RAPhone.openApp('armory')],['strip',()=>{}]]){
 if(name==='strip')continue;await page.evaluate(go);await shot(name);}
console.log(await page.evaluate(()=>document.querySelector('#phoneContent').innerText.replace(/\s+/g,' ').slice(0,200)),h.errors.join('|'));
await h.close();process.exit(0);
