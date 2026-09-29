#!/usr/bin/env node
// F03 NEW_OGA_LADDER_CLOSE — REAL BROWSER PATH (run manually; not auto-run by npm test).
//   node tools/tests/f03/browser-path.mjs            (uses the built dist/)
//   RA_PLAYWRIGHT_PATH=<dir> RA_CHROMIUM_PATH=<exe> node tools/tests/f03/browser-path.mjs
// Proves M9/M10 + THE ALTERNATIVE restoration through the real UI (same harness style as UL-F2-001..004).
import {createRequire} from 'node:module';import http from 'node:http';import {readFile,mkdir,writeFile} from 'node:fs/promises';import {existsSync} from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));const root=path.resolve(here,'..','..','..');const dist=path.join(root,'dist'),out=path.resolve(process.argv[2]||path.join(root,'work','ul_f03_browser'));await mkdir(out,{recursive:true});
const require=createRequire(import.meta.url);let pw;for(const id of [process.env.RA_PLAYWRIGHT_PATH,path.join(root,'work','browser_deps','node_modules','playwright-core'),'playwright-core','playwright'].filter(Boolean))try{pw=require(id);break}catch{}if(!pw)throw new Error('Playwright not found: set RA_PLAYWRIGHT_PATH');
const edge=process.env.RA_CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.ttf':'font/ttf','.mp3':'audio/mpeg','.woff2':'font/woff2'};
const server=await new Promise(resolve=>{const s=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://x'),f=path.join(dist,decodeURIComponent(u.pathname)==='/'?'index.html':decodeURIComponent(u.pathname));res.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});res.end(await readFile(f));}catch{res.writeHead(404);res.end();}});s.listen(0,'127.0.0.1',()=>resolve(s));});
const base=`http://127.0.0.1:${server.address().port}`,browser=await pw.chromium.launch({headless:true,...(existsSync(edge)?{executablePath:edge}:{})}),results=[];const pass=(name,detail={})=>results.push({name,pass:true,detail});
async function page(query=''){const p=await browser.newPage({viewport:{width:390,height:844}});p.setDefaultTimeout(20000);const errors=[];p.on('pageerror',e=>errors.push('pageerror: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/404|favicon/.test(m.text()))errors.push(m.text())});await p.goto(base+query);return {p,errors};}
const RANK4={status:'m8_hold',mission:7,rank:4,title:'SENIOR ASSOCIATE',rank4Granted:true,m5Completed:true,m6Completed:true,m7Completed:true,m7Eligible:false,m9Resolved:false,lastMissionDay:14};
const RANK5={status:'vice_president',mission:9,rank:5,title:'VICE PRESIDENT',rank4Granted:true,m5Completed:true,m6Completed:true,m7Completed:true,m9Resolved:true,m9Outcome:'give',m10GrantsApplied:false,m10GrantsWithheld:false,m10Completed:false,m10Outcome:null,finaleBegun:false,lastMissionDay:15};
async function seed(p,{flag=true,day=15,newOga=RANK4,car=true}={}){await p.evaluate(({flag,day,newOga,car})=>{localStorage.clear();RAState.reset();RAState.patch('life.clock.started',true);for(const f of ['prologueDone','throneDone','firstWakeDone'])RALife.setFlag(f,true);RAState.patch('life.world.day',day);RAState.patch('life.resources.money',120000);RAState.patch('life.newOga',{...RAState.get().life.newOga,...newOga});if(car&&!RALife.hasCar(RACars.SUPRA))RALife.addCar({id:RACars.SUPRA,short:'SUPRA'});RAFeatures.set('F03.new_oga_ladder_close',flag);},{flag,day,newOga,car});}
async function begin(p,id){await p.evaluate(id=>RAAdventureScene.begin(id,{from:'qa'}),id);await p.waitForFunction(()=>RAScenes.current()==='adventure');}
async function tap(p){await p.locator('#adventureScene').click({position:{x:195,y:300}});await p.waitForTimeout(30);}
async function reachChoices(p){for(let i=0;i<160;i++){if(await p.locator('.adv-choice:not([disabled])').count())return;await tap(p);}throw new Error('choices did not appear');}
async function choice(p,label){await reachChoices(p);const b=p.locator('.adv-choice:not([disabled])').filter({hasText:label}).first();if(!await b.count())throw new Error(`choice missing: ${label}`);await b.click();await p.waitForTimeout(30);}
async function finish(p){for(let i=0;i<120;i++){if(await p.evaluate(()=>!RAAdventures.active()))return;await tap(p);}throw new Error('adventure did not finish');}
async function waitMinigame(p,sel){for(let i=0;i<200;i++){if(await p.locator(sel).count())return;await tap(p);}throw new Error(`minigame did not mount: ${sel}`);}
async function snap(p){return p.evaluate(()=>({s:RAState.get().life.newOga,money:RALife.money(),hasCar:RALife.hasCar(RACars.SUPRA),tributed:RAVehicles.isTributed(RACars.SUPRA),frag:!!RAState.get().frag}));}

async function envFlags(){const {p,errors}=await page('?dev=1&ff=F03.new_oga_ladder_close');
 const on=await p.evaluate(()=>({enabled:RAFeatures.enabled('F03.new_oga_ladder_close'),m9:!!RAAdventures.get('NEW_OGA_M9'),m10:!!RAAdventures.get('NEW_OGA_M10'),alt:RAAdventures.get('NEW_OGA_ALTERNATIVE').nodes.voice.next(),kotown:RAFeatures.enabled('F03.new_oga_ladder_close')&&RADistricts.ids().includes('koreatown')}));
 if(!on.enabled||!on.m9||!on.m10||on.alt!=='chairs'||!on.kotown)throw new Error('flag ON registrations invalid: '+JSON.stringify(on));
 await p.evaluate(()=>RAFeatures.set('F03.new_oga_ladder_close',false));
 const off=await p.evaluate(()=>({enabled:RAFeatures.enabled('F03.new_oga_ladder_close'),avail:RAAdventures.available('NEW_OGA_M9'),alt:RAAdventures.get('NEW_OGA_ALTERNATIVE').nodes.voice.next()}));
 if(off.enabled||off.avail||off.alt!=='delivery')throw new Error('flag OFF invalid: '+JSON.stringify(off));
 if(errors.length)throw new Error(errors.join('; '));pass('F03 browser flag ON/OFF',{on,off});await p.close();}

async function m9Give(){const {p,errors}=await page();await seed(p,{day:15,newOga:RANK4});await begin(p,'NEW_OGA_M9');
 await choice(p,'GIVE IT');await finish(p);
 const a=await snap(p);if(a.s.rank!==5||a.s.title!=='VICE PRESIDENT'||a.s.m9Outcome!=='give'||!a.tributed||!a.hasCar)throw new Error('M9 GIVE invalid: '+JSON.stringify(a));
 await p.reload();const b=await snap(p);if(b.s.m9Outcome!=='give'||!b.tributed||!b.hasCar)throw new Error('M9 GIVE lost across reload');
 if(errors.length)throw new Error(errors.join('; '));pass('F03 M9 GIVE (Rank 5, TRIBUTED hidden-not-deleted, reload)',{rank:b.s.rank,tributed:b.tributed,hasCar:b.hasCar});await p.close();}

async function m9NahThenM10Withheld(){const {p,errors}=await page();await seed(p,{day:15,newOga:RANK4});await begin(p,'NEW_OGA_M9');await choice(p,'NAH');await finish(p);
 let a=await snap(p);if(a.s.rank!==4||a.s.m9Outcome!=='nah'||a.s.trust!==-1||!a.s.m9GrantsWithheld||a.tributed)throw new Error('M9 NAH invalid: '+JSON.stringify(a.s));
 await p.evaluate(()=>{RAState.patch('life.world.day',16);RAState.patch('life.newOga',{...RAState.get().life.newOga,lastMissionDay:15});});
 const ready=await p.evaluate(()=>RANewOgaLadder.m10Ready(RALife.L()));if(!ready)throw new Error('M10 did not become ready after M9 NAH');
 await begin(p,'NEW_OGA_M10');await choice(p,'…SAY LESS.');await finish(p);
 const b=await snap(p);if(b.s.finaleBegun!==true||b.s.m10GrantsApplied||b.s.office||b.s.rank!==4)throw new Error('M10 withheld invalid: '+JSON.stringify(b.s));
 const kot=await p.evaluate(()=>RADistricts.get('koreatown').state);if(kot!=='UNCONTROLLED')throw new Error('Koreatown granted on withheld path: '+kot);
 if(errors.length)throw new Error(errors.join('; '));pass('F03 M9 NAH → M10 withheld (VampGPT fires; no grants)',{rank:b.s.rank,grants:b.s.m10GrantsApplied,koreatown:kot});await p.close();}

async function m10Grants(){const {p,errors}=await page();await seed(p,{day:16,newOga:RANK5});await begin(p,'NEW_OGA_M10');await choice(p,'…SAY LESS.');await finish(p);
 const a=await snap(p);if(!a.s.m10GrantsApplied||a.s.office!=='vice_president'||!Array.isArray(a.s.recruits)||a.s.recruits.length!==2||a.s.finaleBegun!==true)throw new Error('M10 grants invalid: '+JSON.stringify(a.s));
 const kot=await p.evaluate(()=>RADistricts.get('koreatown').state);if(kot!=='CONTROLLED')throw new Error('Koreatown not controlled: '+kot);
 await p.reload();const b=await snap(p);if(!b.s.m10GrantsApplied||b.s.office!=='vice_president')throw new Error('M10 grants lost across reload');
 if(errors.length)throw new Error(errors.join('; '));pass('F03 M10 grants (office, recruits, Koreatown, finale flag, reload)',{rank:b.s.rank,koreatown:kot});await p.close();}

async function alternativeChair(){const {p,errors}=await page();await seed(p,{day:11,newOga:{status:'alternative_pending',mission:4,rank:1,title:'INTERN',carlosMutual:true,m4Outcome:'beat_1',alternativePending:true,lastMissionDay:10}});
 await begin(p,'NEW_OGA_ALTERNATIVE');
 await waitMinigame(p,'.canopy-finish');
 await p.locator('.canopy-finish').click();await p.waitForSelector('.canopy-done',{timeout:20000});await p.locator('.canopy-done').click();
 await finish(p);
 const s=await p.evaluate(()=>RAState.get().life.newOga);if(!s.alternativeCompleted)throw new Error('THE ALTERNATIVE chair activity did not complete');
 if(errors.length)throw new Error(errors.join('; '));pass('F03 THE ALTERNATIVE chair restoration (SLURP canopyDuty mounts in the real UI)',{alternativeCompleted:true});await p.close();}

try{
 await envFlags();
 await m9Give();
 await m9NahThenM10Withheld();
 await m10Grants();
 await alternativeChair();
 await writeFile(path.join(out,'results.json'),JSON.stringify({base,results},null,2)+'\n');
 console.log(`PASS UL-F03 real-browser paths (${results.length}/${results.length})`);
 for(const r of results)console.log('PASS',r.name,JSON.stringify(r.detail));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
