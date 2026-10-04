// RC2 visual sweep: touched screens at 360/390/430 -> C:/ra/shots/sweep/<w>_<name>.png (+ console errors)
import {open} from './harness.mjs';import fs from 'node:fs';
const out='C:/ra/shots/sweep';fs.mkdirSync(out,{recursive:true});
const widths=(process.argv[2]||'360,390,430').split(',').map(Number);const errs=[];
for(const w of widths){
 const h=await open({width:w,height:Math.round(w*2.165)});const {page}=h;await page.waitForTimeout(1000);
 const shot=async n=>{await page.screenshot({path:`${out}/${w}_${n}.png`});};
 await shot('title');
 await page.evaluate(async()=>{RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);RAState.patch('life.phone.learned',true);document.querySelector('#startOverlay').style.display='none';await RAScenes.go('bedroom',{});});
 await page.waitForTimeout(1500);await shot('bedroom');
 await page.click('#checkPhone');await page.waitForTimeout(900);await shot('phone');await page.click('#phoneClose');await page.waitForTimeout(700);
 await page.evaluate(async()=>{RALife.addMoney(2400);RALife.spend(300);RALife.addItem('burberry_tee',1);});await page.waitForTimeout(900);await shot('purchase');await page.waitForTimeout(2500);
 await page.evaluate(()=>{RAAdventures.start('NEW_OGA_M7',{from:'dev'});return RAScenes.go('adventure',{});});await page.waitForTimeout(2300);await shot('adventure');
 await page.evaluate(async()=>{await RAScenes.go('bedroom',{});RAAdventures.abandon?.();RACombat2.run('uncle_sunday',{});});await page.waitForTimeout(1500);await shot('combat2');
 await page.evaluate(()=>RAEnemyFX.attack({root:document.querySelector('.c2-scene'),enemyId:'uncle_sunday',moveId:'father',dmg:24,attacker:document.querySelector('.c2-enemy'),target:document.querySelector('.c2-rich'),freeze:6}));
 await page.evaluate(()=>{const r=document.querySelector('.c2-scene');RABarks.trigger({root:r,enemyId:'uncle_sunday',kind:'hurt',enemyEl:document.querySelector('.c2-enemy'),force:true});});await page.waitForTimeout(350);await shot('combat2_fx');
 await page.evaluate(()=>RACombat2.active()?.abort());await page.waitForTimeout(500);
 await page.evaluate(async()=>{await RAScenes.go('property-la-4p-exterior',{});});await page.waitForTimeout(1500);await shot('property');
 await page.evaluate(async()=>{await RAScenes.go('bedroom',{});RAMinigames.launch('slurp',{});});await page.waitForTimeout(1500);await shot('minigame');
 errs.push(...h.errors.map(e=>w+': '+e));await h.close();
}
console.log(errs.join('\n')||'no errors');
