import {open} from './harness.mjs';import fs from 'node:fs';
const out='C:/ra/shots/money';fs.mkdirSync(out,{recursive:true});
const w=+(process.argv[2]||390);
const h=await open({width:w});const {page}=h;await page.waitForTimeout(1000);
await page.evaluate(async()=>{RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);RAState.patch('life.phone.learned',true);document.querySelector('#startOverlay').style.display='none';await RAScenes.go('bedroom',{});localStorage.removeItem('rc2_day_money_v1');localStorage.removeItem('rc2_bed_items_v1');});
await page.waitForTimeout(1200);
await page.evaluate(()=>RALife.addMoney(1500));await page.waitForTimeout(500);await page.screenshot({path:`${out}/${w}_gain.png`});
// purchase: spend + add a fit/item
await page.evaluate(()=>{RALife.spend(600);RALife.addItem('burberry_tee',1);});await page.waitForTimeout(700);await page.screenshot({path:`${out}/${w}_bag.png`});
await page.waitForTimeout(1500);await page.screenshot({path:`${out}/${w}_bed.png`});
await page.evaluate(()=>{RALife.spend(250);RALife.addItem('white_forces_sneakers',1);});await page.waitForTimeout(2800);
await page.screenshot({path:`${out}/${w}_bed2.png`});
// event result card via minigame-style
await page.evaluate(()=>RAMoneyFeel.eventResult('RAMEN RUSH',RALife.money()-480));await page.waitForTimeout(900);await page.screenshot({path:`${out}/${w}_result.png`});
await page.waitForTimeout(2600);
// day summary
await page.evaluate(()=>{RABedroomLife.goToSleep();});await page.waitForTimeout(2600);await page.screenshot({path:`${out}/${w}_summary.png`});
console.log(await page.evaluate(()=>JSON.stringify({bed:localStorage.getItem('rc2_bed_items_v1'),day:localStorage.getItem('rc2_day_money_v1')})));
console.log(h.errors.join('\n')||'no errors');await h.close();
