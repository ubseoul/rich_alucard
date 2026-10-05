import {open} from './harness.mjs';import fs from 'node:fs';
const h=await open({width:390});const {page}=h;await page.waitForTimeout(1000);
await page.evaluate(async()=>{RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);document.querySelector('#startOverlay').style.display='none';await RAScenes.go('bedroom',{});});
await page.waitForTimeout(800);await page.click('#checkPhone');await page.waitForTimeout(900);
console.log(await page.evaluate(()=>document.querySelector('#phoneContent').innerHTML.slice(0,3000)));
await page.screenshot({path:'C:/ra/shots/phone.png'});await h.close();
