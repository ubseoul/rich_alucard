import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const engine=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const task=path.dirname(engine), projects=path.dirname(task);
const base=process.env.RA_QA_BASE||path.join(projects,'task-6/candidate-feedback-r4');
const evidence=path.join(task,'deliverables/browser');await mkdir(evidence,{recursive:true});
const changed=['js/data/rc2_writing.js','js/engine/combat2.js','js/frag/F07/gbenga_combat.js','js/frag/F07/m8_and_finale.js','js/frag/F07/play_bridge.js','js/scenes/combat2.js','js/systems/barks.js','js/systems/dragon.js','js/systems/enemy_fx.js','js/systems/relations.js'];
const overrides=new Map(changed.map(f=>['/'+f,path.join(engine,f)]));
// Legacy JDM is a reviewable seam proposal only; production game.js is unchanged.
overrides.set('/game.js',path.join(task,'deliverables/game-jdm-proposed.js'));
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost'),target=path.resolve(base,'.'+decodeURIComponent(url.pathname));
 if(!target.startsWith(base+path.sep)&&target!==base)throw Error('path');
 let file=overrides.get(url.pathname)||target;if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav'})[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));
 }catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const {chromium}=createRequire(import.meta.url)('C:/Users/Ube/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={base,overrideFiles:changed,legacyJdm:'proposal applied only in disposable QA server',checks:[],errors:[]};
const sha=s=>createHash('sha256').update(s).digest('hex');
const textPublic=await readFile(path.join(projects,'task-22/editorial-engine/js/data/astra_editorial.js'),'utf8');
const textPrivate=await readFile(path.join(projects,'task-22/editorial-private/private_overlay/src/astra-editorial.js'),'utf8');
const progression=await readFile(path.join(projects,'task-23/opening-private/private_overlay/src/astra_progression.js'),'utf8');
const privateGate=await readFile(path.join(task,'private/private_overlay/src/astra_combat_gates.js'),'utf8');
const checkpoint=JSON.parse(await readFile(path.join(path.dirname(projects),'2026-10-07/task-13/evidence/earned-checkpoints/99e16d1-completed-ending-reload.json'),'utf8')).save;
report.textPair={publicSHA256:sha(textPublic),privateSHA256:sha(textPrivate)};report.progressionSHA256=sha(progression);report.privateGateSHA256=sha(privateGate);report.checkpoint='read-only completed99e16d1 checkpoint copied into fresh disposable profiles; G1 Royal Glitch inherited';
async function install(page){
 await page.waitForFunction(()=>!!window.RABuild3&&!!window.RALegendary&&!!window.RAAdventures?.get('NEW_OGA_FINALE')?.nodes?.huddle);
 await page.addScriptTag({content:textPublic});await page.addScriptTag({content:textPrivate});await page.addScriptTag({content:privateGate});await page.addScriptTag({content:progression});
 await page.evaluate(()=>{RAAstraEditorialPrivate.install(RABuild3);const def=RAAdventures.get('NEW_OGA_FINALE'),available=def.available;RAAstraCombatGates.install();if(RAAdventures.get('NEW_OGA_FINALE')!==def||def.available!==available)throw Error('private gate changed availability identity');RAAstraProgressionInstall(RABuild3);RADev?.disable();});
}
let lastPage;
async function open({width=390,hasTouch=true,reduced=false}={}){
 const context=await browser.newContext({viewport:{width,height:844},hasTouch,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage();
 lastPage=page;page.on('pageerror',e=>report.errors.push({width,message:e.message}));
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html?dev=1&speed=10&mute=1`);await install(page);
 assert.equal(await page.evaluate(save=>{const ok=RAState.write(localStorage,save,false);RAState.load();return ok;},checkpoint),true);await page.reload();await install(page);
 await page.click('#startButton');await page.waitForFunction(()=>RAScenes.current()==='bedroom');
 return {context,page};
}
try{await (await import('./browser-cases.mjs')).run({open,install,report,evidence,assert});assert.equal(report.errors.length,0,'no browser page errors');report.passed=true;
}catch(error){if(lastPage&&!lastPage.isClosed()){console.log('FAIL STATE',JSON.stringify(await lastPage.evaluate(()=>({text:document.body.innerText.slice(-1800),node:RAAdventures.active()?.node,params:RAAdventures.get('NEW_OGA_FINALE').nodes.party_play.minigame.params(RAAdventures.context()),pending:RAF07Play.pending()}))));await lastPage.screenshot({path:path.join(evidence,'failure.png')});}throw error;}finally{await writeFile(path.join(evidence,'report-'+(process.env.RA_QA_ONLY||'full')+'.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
