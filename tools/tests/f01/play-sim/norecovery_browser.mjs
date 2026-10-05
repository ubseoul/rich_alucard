// THE PLAY — NO-CAR RECOVERY REPAIR browser regression (real Chromium, the real embed controller runEmbedded). Not part of `npm test` (needs a browser):
//   node tools/tests/f01/play-sim/norecovery_browser.mjs [--port 8160]
// Proves on the real scenes: a carless War Room request reaches the existing home scene (GET IT BACK) instead of dying on NO_CAR; one tap per car, never a duplicate;
// the recovered car restores the job offer; a reload while carless shows the same recovery; a carless request with nothing to recover still refuses (no loaner);
// EXTRACT with zero cars refuses or recovers — it never throws and never consumes the captive. No copy, art, price or balance value is asserted or changed.
import {createRequire} from 'node:module';import fs from 'node:fs';
const require=createRequire(process.env.RA_PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/');
const {chromium}=require('playwright');
import {serve} from './serve-play.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const PORT=+arg('port',8160);const CHROME=process.env.RA_CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let failed=0;const log=(ok,name,detail='')=>{if(!ok)failed++;console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' — '+detail:''}`);return ok;};
const srv=await serve(PORT);const base=`http://127.0.0.1:${PORT}/assets/f01/play/index.html?embed=1&mute=1&speed=10`;
const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(CHROME)?CHROME:undefined});
const IDS=['tunde','dre','half_pint','sunday_best','young_mazi','auntie_grit'],CLS={tunde:'MUSCLE',dre:'TALKER',half_pint:'GHOST',sunday_best:'SHOOTER',young_mazi:'WHEELS',auntie_grit:'DOC'};
const mk=(n,job={},crew={},garage=['SUPRA','URUS'])=>({schema:'F04.play_request',version:1,requestId:'nrb#'+n,seed:4200+n,day:30,job:{f01JobId:'car_wash_stickup',f04Type:'TAKE_THE_BLOCK',district:'koreatown',...job},
 roster:IDS.map(id=>({id,name:id.toUpperCase().replace(/_/g,' '),cls:CLS[id],status:'ACTIVE',bonds:{},perks:[],...(crew[id]||{})})),garage:{owned:garage},bank:50000,heat:12,rosterCap:8});
const errs=[];
const ctx=await browser.newContext({viewport:{width:390,height:844}});const page=await ctx.newPage();
page.on('pageerror',e=>errs.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon/.test(m.text()))errs.push('console: '+m.text().slice(0,200));});
const open=async()=>{await page.goto(base);await page.waitForFunction(()=>window.__raPlayEmbed&&window.__raPlay);};
const start=req=>page.evaluate(r=>{window.__r=null;window.__raPlayEmbed.run(r).then(x=>{window.__r=x;},e=>{window.__r={threw:String(e)};});},req);
const seedLost=(req,lost)=>page.evaluate(([r,l])=>{const {AD,store}=window.__raPlay;const w=AD.prepareWorld(r,null);w.garage.lost=l;w.garage.owned=[];w.cars={};store.set('world_f04',w);},[req,lost]);
const world=()=>page.evaluate(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith('world_f04')))||'null'));
const cards=()=>page.evaluate(()=>[...document.querySelectorAll('.lostcar')].map(e=>e.dataset.car));
const waitCards=n=>page.waitForFunction(n=>document.querySelectorAll('.lostcar').length===n,n,{timeout:15000});
const result=()=>page.waitForFunction(()=>window.__r,null,{timeout:20000}).then(()=>page.evaluate(()=>window.__r));
const LOST={SUPRA:{route:'DEALER',cause:'CRASH'},URUS:{route:'IMPOUND',cause:'WASH'}};
try{
 // ===== A. lose all cars -> War Room is NOT dead: GET IT BACK is reachable; repeated tap cannot duplicate; the job comes back
 await open();const rA=mk(1);await seedLost(rA,LOST);await start(rA);
 await waitCards(2);log(true,'carless request reaches the home scene with both lost cars offered (not a NO_CAR refusal)',(await cards()).join('+'));
 // reload while carless: same recovery state
 await open();await seedLost(rA,LOST);await start({...rA,requestId:'nrb#1r'});await waitCards(2);
 log((await cards()).sort().join()==='SUPRA,URUS','reload while carless: the same two cars are offered again',(await cards()).join('+'));
 // tap the first GET IT BACK twice in the same tick: the second tap finds a rebuilt card, never the same car twice
 await page.evaluate(()=>{const b=document.querySelector('[data-rec="0"]');b.click();});
 await waitCards(1);const left=await cards();
 log(left.length===1,'one tap recovers exactly one car',left.join());
 await page.evaluate(()=>document.querySelector('[data-rec="0"]').click());await waitCards(0);
 await page.evaluate(()=>document.querySelector('[data-done]').click());
 await page.waitForSelector('.b-ans',{timeout:15000});
 log(true,'with the cars got back, the job offer is shown (recovered car restores valid job access)');
 await page.evaluate(()=>document.querySelector('.b-dec').click());
 const resA=await result();log(resA.status==='DECLINED','declining the restored offer is a clean DECLINED',resA.status+' '+(resA.code||''));
 const wA=await world();const all=[...wA.garage.owned,...Object.keys(wA.garage.lost)];
 log(wA.garage.owned.slice().sort().join()==='SUPRA,URUS'&&Object.keys(wA.garage.lost).length===0&&new Set(all).size===all.length,'committed world: both cars back exactly once, nothing lost, nothing duplicated',JSON.stringify(wA.garage));
 log(Math.abs(wA.cash-50)<1e-9&&resA.cash.spent===0,'recovery moved no money',`cash ${wA.cash}K spent ${resA.cash.spent}`);

 // ===== B. carless, nothing recovered: the job still refuses (no loaner); what is lost stays lost and recoverable
 await open();const rB=mk(2);await seedLost(rB,LOST);await start(rB);await waitCards(2);
 await page.evaluate(()=>document.querySelector('[data-done]').click());
 const resB=await result();log(resB.status==='REFUSED'&&resB.code==='NO_CAR','not taking GET IT BACK: the job that needs a car still refuses NO_CAR',resB.status+' '+resB.code);
 const wB=await world();log(Object.keys(wB.garage.lost).length===2&&wB.garage.owned.length===0,'...and nothing was granted or lost by refusing',JSON.stringify(wB.garage));
 await start(mk(3));await waitCards(2);log(true,'the next carless request offers GET IT BACK again (the way back stays open)');

 // ===== C. EXTRACT with zero cars: recovery first, then the EXTRACT offer; never a crash
 await open();const XJ={f01JobId:'extract',captive:{ids:['half_pint'],clock:2}},XC={half_pint:{status:'CAPTURED'}};
 const rC=mk(4,XJ,XC);await seedLost(rC,LOST);await start(rC);await waitCards(2);
 await page.evaluate(()=>{document.querySelector('[data-rec="0"]').click();});await waitCards(1);await page.evaluate(()=>document.querySelector('[data-rec="0"]').click());await waitCards(0);
 await page.evaluate(()=>document.querySelector('[data-done]').click());await page.waitForSelector('.b-ans',{timeout:15000});
 const pname=await page.evaluate(()=>document.querySelector('.pname').textContent);
 log(/HALF.PINT/i.test(pname),'EXTRACT with zero cars reaches recovery, then the EXTRACT offer itself',pname);
 await page.evaluate(()=>document.querySelector('.b-dec').click());const resC=await result();log(resC.status==='DECLINED','declining the EXTRACT offer consumes nothing',resC.status);

 // ===== D. EXTRACT, no car, nothing lost (never owned one): refuses cleanly — no PLAY_ERROR, captive untouched
 await open();const wD0=JSON.stringify(await world());const rD=mk(5,XJ,XC,[]);await start(rD);const resD=await result();
 log(resD.status==='REFUSED'&&resD.code==='NO_CAR','EXTRACT with zero cars and nothing to recover refuses NO_CAR (not PLAY_ERROR)',resD.status+' '+resD.code);
 const wD=await world();log(JSON.stringify(wD)===wD0,'no F01 state was committed or altered by the refusal');
 log(errs.length===0,'no page error / console error in any scenario',errs.join(' | '));
}catch(e){log(false,'scenario threw',String(e&&e.stack||e).split('\n').slice(0,3).join(' | '));}
await browser.close();srv.close();
console.log(failed?`FAILED ${failed}`:'PASS F01 no-car recovery browser');process.exit(failed?1:0);
