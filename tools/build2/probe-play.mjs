import {serve,loadPlaywright} from '../tests/f05/_browser-lib.mjs';
const server=await serve(),{chromium}=loadPlaywright();const browser=await chromium.launch({headless:true,executablePath:process.env.RA_CHROMIUM_PATH});const p=await browser.newPage();
p.on('pageerror',e=>console.log('ERROR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
await p.goto(`http://127.0.0.1:${server.address().port}/?dev=1&ff=F01.showdown_core,F02.iron_and_grace,F02.armory,F02.range_day,F04.war_room,F05.trap&speed=10`);await p.waitForFunction(()=>window.RAIron&&window.RAWarRoomPlay);
console.log('DATA',await p.evaluate(()=>{const s=RAState.migrateRecord(RASaveFixtures.fixtures.supraOwned);RAState.write(localStorage,s,false);RAState.patch('life.resources.money',1000000);RAFrag.patch('F04','active',true);RAFrag.patch('F04','offer.status','accepted');RAIronAndGrace.grant('mac_and_cheese',{free:true});const job=RAWarRoomJobs.buildJobCard({type:'TAKE_THE_BLOCK',district:'arts_district'});window.__probe=RAWarRoomPlay.launch(job);return {job,request:RAWarRoomPlay.pending(),crew:RACrew.list({fragment:'F04'})};}));
await p.waitForTimeout(5000);console.log('FRAMES',p.frames().map(f=>f.url()));console.log('RESULT',await p.evaluate(()=>Promise.race([window.__probe,new Promise(r=>setTimeout(()=>r({pending:true,refusal:RAWarRoomPlay.lastRefusal()}),50))])));
for(const f of p.frames().slice(1))console.log('BODY',await f.locator('body').innerText());
await browser.close();server.close();
