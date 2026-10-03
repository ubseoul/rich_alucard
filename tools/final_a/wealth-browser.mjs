import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const root=path.resolve(''),require=createRequire(import.meta.url),{chromium}=require(process.env.RA_PLAYWRIGHT_PATH||'playwright');
const base='0c6ccc3d18674c713a0a6e5896fe6ecbf7f7bc0f',out=path.join(root,'docs/evidence/final_a/stage4/wealth');fs.mkdirSync(out,{recursive:true});
let phase='before';const cache=new Map(),errors=[],rows=[];
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.ttf':'font/ttf','.woff2':'font/woff2','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{try{const rel=new URL(req.url,'http://local').pathname.slice(1)||'index.html';if(rel.includes('..'))throw Error('path');let bytes;if(phase==='before'&&/\.(html|css|js|mjs|json)$/.test(rel)){if(!cache.has(rel))cache.set(rel,execFileSync('git',['-c','gc.auto=0','show',`${base}:${rel}`],{cwd:root,maxBuffer:30e6,stdio:['ignore','pipe','ignore']}));bytes=cache.get(rel);}else bytes=fs.readFileSync(path.join(root,rel));res.writeHead(200,{'content-type':mime[path.extname(rel)]||'application/octet-stream','cache-control':'no-store'}).end(bytes);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:process.env.RA_CHROMIUM_PATH});
try{
 for(phase of ['before','after'])for(const width of [360,390,430]){
  const page=await browser.newPage({viewport:{width,height:844}});page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push({phase,width,error:e.message}));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>window.RACastle&&window.RACars&&window.RAScenes);
  await page.evaluate(async()=>{RAState.reset();RAState.patch('life.clock.started',true);for(const k of ['prologueDone','throneDone','firstWakeDone'])RALife.setFlag(k,true);await RAScenes.go('bedroom');});
  await page.waitForTimeout(250);
  const shot=async name=>{await page.locator('#screen').screenshot({path:path.join(out,`${phase}-${width}-${name}.png`)});rows.push({phase,width,name,...await page.evaluate(()=>({money:RALife.money(),netWorth:RALife.netWorth(),rooms:RACastle.ROOMS.filter(x=>RALife.hasRoom(x.id)).map(x=>x.id),cars:RALife.ownedCars().map(x=>x.id),devSurface:!!document.querySelector('#devPanel,#stageContractOverlay')}))});};
  await shot('unowned-bedroom');
  const purchase=await page.evaluate(async()=>{RAState.patch('life.resources.money',1200000);RALife.setFlag('castlePartyHostingUnlocked',true);const initial=RALife.money(),party=RACastle.buy('party_hall'),fish=RACastle.buy('fish_tank'),car=RACars.buy('urus');await RAScenes.go('bedroom');return {initial,party,fish,car,remaining:RALife.money(),prices:{party:RACastle.ROOMS.find(x=>x.id==='party_hall').price,fish:RACastle.ROOMS.find(x=>x.id==='fish_tank').price,car:RACars.CATALOG.urus.price}};});
  await page.waitForTimeout(200);await shot('owned-bedroom');await page.evaluate(()=>RACastle.open());await shot('owned-castle-menu');
  await page.locator('[data-castle="castle:fishtank"]').click();await page.waitForSelector('#adventureScene');await page.waitForTimeout(350);await shot('owned-fish-tank-room');
  rows.push({phase,width,purchase,balanced:purchase.remaining===purchase.initial-Object.values(purchase.prices).reduce((a,b)=>a+b,0)});
  await page.close();
 }
 const bad=rows.filter(r=>r.balanced===false||r.purchase&&(!r.purchase.party||!r.purchase.fish||!r.purchase.car));
 fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify({method:'Declared visual fixtures, not career affordability evidence. Fresh unowned bedroom; then $1.2M supplied and existing Party Hall hosting prerequisite set. Real production purchases debit original prices for PARTY HALL, FISH TANK ROOM and URUS. Scenes/menu use production renderers. Identical fixture/purchases before and after, normal release URL, all three widths. Actual money-by-day/ownership timing belongs to the paired Stage5 population.',base,rows,errors,bad},null,2)+'\n');
 console.log(JSON.stringify({screens:rows.filter(r=>r.name).length,purchases:rows.filter(r=>r.purchase).length,errors,bad}));if(errors.length||bad.length)process.exitCode=1;
}finally{await browser.close();server.close();}
