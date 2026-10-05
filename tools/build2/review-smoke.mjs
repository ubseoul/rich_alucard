import fs from 'node:fs';
import {serve,loadPlaywright} from '../tests/f05/_browser-lib.mjs';
const server=await serve(),{chromium}=loadPlaywright();const browser=await chromium.launch({headless:true,executablePath:process.env.RA_CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:1040,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/tools/build2/review.html`);
 await page.click('#seed');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Review save prepared'));
 await page.click('#armory');const frame=page.frames().find(f=>f!==page.mainFrame());await frame.waitForSelector('.ia-gun');
 await frame.click('[data-phone-action="do:armory:buy:mac_and_cheese"]');await frame.click('[data-phone-action="do:armory:equip:mac_and_cheese"]');
 const state=await frame.evaluate(()=>({owned:RAIronAndGrace.owns('mac_and_cheese'),equipped:RAIronAndGrace.equipped(),cars:RAVehicles.list().map(c=>c.id)}));
 await page.screenshot({path:'docs/evidence/build2/review-page.png'});
 await page.click('#fight');await frame.waitForSelector('[data-c2="weapon:iron_and_grace_gun"]');
 await frame.click('[data-c2="weapon:iron_and_grace_gun"]');await page.waitForTimeout(900);
 await frame.evaluate(()=>RACombat2.debugResolve('win'));await frame.click('[data-c2="done"]');
 await page.click('#tour');await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Audio tour complete'),null,{timeout:60000});
 const ok=state.owned&&state.equipped==='mac_and_cheese'&&state.cars.includes('toyota_supra_mk4_001')&&!errors.length;
 fs.writeFileSync('docs/evidence/build2/review-smoke.json',JSON.stringify({ok,state,errors},null,2)+'\n');console.log(ok?'PASS review fixture, Armory, gunfight and audio tour':'FAIL review',JSON.stringify({state,errors}));process.exitCode=ok?0:1;
}finally{await browser.close();server.close();}
