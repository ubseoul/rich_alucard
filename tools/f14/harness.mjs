// F14-A — FCPB WHOLE-GAME QA HARNESS (orchestrator, INFRASTRUCTURE ONLY).
//
// Reads the game (dist/ or a served URL), never edits it, never owns UX/UI. Produces one report: static validation
// (assets/audio/art/placeholders/leak), browser traversal of the route registry, save/reload torture, migration replay,
// starvation, the mobile viewport matrix and the phone-placement hook. Every FAILED run gets a deterministic
// reproduction bundle. Missing fragment routes are PENDING_FRAGMENT, never failures.
import {existsSync} from 'node:fs';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkTree,checkRange} from '../leak-check.mjs';
import {loadRoutes} from './routes.mjs';
import {scanAssets,RUNTIME_SCOPE} from './assets.mjs';
import {checkAudio,checkArtRegistry} from './audio.mjs';
import {loadPlacements} from './placements.mjs';
import {openDriver,viewportFindings,phonePlacementFindings} from './browser.mjs';
import {executeRoute} from './executor.mjs';
import {createBundle,writeBundle} from './bundle.mjs';
import {evaluateChecklist} from './checklist.mjs';
import {stateInvariants} from './collect.mjs';
import {VIEWPORTS,RESULT,gitCommit,gitBranch,stableStringify} from './config.mjs';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');

const posix=p=>p.split(path.sep).join('/');
const SEED_LIFE="()=>{localStorage.clear();RAState.reset();RAState.patch('life.clock.started',true);for(const k of ['prologueDone','throneDone','firstWakeDone'])RALife.setFlag(k,true);RAState.patch('life.world.day',9);RAState.patch('life.resources.money',100000);}";
const READY="()=>window.RAIF1&&window.RAState";
const BEDROOM="()=>document.body.classList.contains('bedroom-mode')";
const DEFAULT_VIEWPORT={id:'mobile-390',width:390,height:844};

async function readRelease(dist){
  try{return JSON.parse(await readFile(path.join(dist,'build.json'),'utf8'));}catch(e){return null;}
}
async function runLeak({root,dist,denylist,range,hqPrivate=false}){
  const out={source:null,artifact:null,range:null};
  try{out.source=await checkTree({root,denylist,hqPrivate});}catch(e){out.source={ok:false,violations:[{rule:'leak-check-error',file:String(e.message)}],filesScanned:0};}
  if(dist&&existsSync(path.join(dist,'index.html')))try{out.artifact=await checkTree({root,dist:posix(path.relative(root,dist)),denylist});}catch(e){out.artifact={ok:false,violations:[{rule:'leak-check-error',file:String(e.message)}],filesScanned:0};}
  if(range)try{out.range=await checkRange({root,range,denylist});}catch(e){out.range={ok:false,violations:[{rule:'leak-check-error',file:String(e.message)}]};}
  const violations=[...(out.source?.violations||[]),...(out.artifact?.violations||[]),...(out.range?.violations||[])];
  return {ok:violations.length===0,violations,filesScanned:out.source?.filesScanned??0,artifactScanned:out.artifact?.filesScanned??0,range:range||null};
}

// ---- failure bundle ----------------------------------------------------------------------
// A compact state summary next to the full save snapshot: the bundle stays small but still reproducible.
function summarizeState(state){
  if(!state)return null;const L=state.life||{};
  return {version:state.version,day:L.world?.day??null,location:L.world?.location??null,scene:L.world?.scene??null,
    resources:L.resources?{money:L.resources.money,followers:L.resources.followers,clout:L.resources.clout}:null,
    flags:L.world?.flags||null,activeAdventure:L.adventures?.active?.id??null};
}
async function writeFailureBundle({dir,route,viewport,flags,seed,state,errors,failures,history,screenshots,commit,branch,releaseId,denylist,failureKind,notes=[]}){
  const bundle=createBundle({
    commit,branch,releaseId,
    route:route?.id||null,fragment:route?.fragment||null,
    failureKind: failureKind||(failures[0]&&/console|page|network|unhandled/i.test(failures[0].message||'')?'CONSOLE':'ASSERTION'),
    failedAssertion:failures[0]||null,
    seed, viewport, featureFlags:flags||{},
    day:state?.life?.world?.day??null, state:summarizeState(state), saveSnapshot:state,
    consoleErrors:errors?.console||[],pageErrors:errors?.page||[],network404:errors?.network404||[],unhandledRejections:errors?.unhandled||[],
    screenshots:screenshots||[],routeHistory:history||[],notes
  });
  return writeBundle(dir,bundle,{denylist});
}

// ---- one authorized route ----------------------------------------------------------------
async function runOneRoute({driver,route,viewport=DEFAULT_VIEWPORT,seed,commit,branch,releaseId,denylist,shotsDir,bundleDir,log}){
  const flags=route.flag?{[route.flag]:true}:{};
  const page=await driver.page(viewport,flags);
  let exec,errors={},state=null;
  try{
    exec=await executeRoute(page,route,{shotsDir});
    errors=await page.errors();
    state=await page.snapshot();
  }catch(error){
    exec={ok:false,failures:[{message:`executor crash: ${error.message}`}],history:[],screenshots:[],backout:null};
    errors={console:[],page:[String(error.message)],network404:[],unhandled:[]};
  }
  const consoleFailure=(errors.page?.length||errors.console?.length||errors.network404?.length||errors.unhandled?.length);
  const ok=exec.ok&&!consoleFailure;
  const failures=[...(exec.failures||[])];
  if(consoleFailure)failures.push({message:'console/page/network/unhandled error captured',actual:{page:errors.page,console:errors.console,network404:errors.network404,unhandled:errors.unhandled}});
  const result={id:route.id,fragment:route.fragment,kind:route.kind,status:ok?RESULT.PASS:RESULT.FAIL,backoutOk:exec.backout?!!exec.backout.ok:null,failures,screenshots:exec.screenshots,viewport:viewport.id,flag:route.flag||null,historyLength:exec.history.length};
  if(!ok){
    const written=await writeFailureBundle({dir:bundleDir,route,viewport,flags,seed,state,errors,failures,history:exec.history,screenshots:exec.screenshots,commit,branch,releaseId,denylist});
    result.bundle=written.file;
    log(`FAIL ${route.id}: ${failures.map(f=>f.message).join(' | ')}`);
  }else log(`PASS ${route.id}`);
  await page.close();
  return result;
}

// ---- feature-flag matrix -----------------------------------------------------------------
// For every fragment flag an authorized route declares, boot the game with that flag ON (and everything else OFF) and
// require a clean boot. At IF-1 no fragment routes are authorized, so the matrix is PENDING_FRAGMENT — not a failure.
async function flagMatrixSuite({driver,registry,commit,branch,releaseId,denylist,bundleDir,log}){
  const flags=[...new Set(registry.authorized.map(r=>r.flag).filter(Boolean))].sort();
  const checks=[];const screenshots=[];
  for(const flag of flags){
    const page=await driver.page(DEFAULT_VIEWPORT,{[flag]:true});
    try{
      await page.goto('/');await page.waitForFunction("()=>window.RAIF1&&window.RAState",{timeout:20000});
      const on=await page.evaluate("()=>!!(window.RAFeatures&&RAFeatures.enabled&&RAFeatures.enabled('"+flag+"'))");
      const errors=await page.errors();
      const clean=!(errors.page?.length||errors.console?.length||errors.network404?.length||errors.unhandled?.length);
      checks.push({name:`flag:${flag}`,ok:clean&&on,detail:on?(clean?'boots clean with the flag ON':JSON.stringify(errors)):`flag ${flag} did not register/enable`});
      if(!clean)screenshots.push(await page.screenshot(`flag-${flag}`));
      log(`${clean&&on?'PASS':'FAIL'} flag ${flag}`);
    }catch(error){checks.push({name:`flag:${flag}`,ok:false,detail:String(error.message)});}
    await page.close();
  }
  let bundle=null;
  if(checks.some(c=>!c.ok))bundle=(await writeFailureBundle({dir:bundleDir,route:{id:'feature-flag-matrix',fragment:'IF1'},viewport:DEFAULT_VIEWPORT,flags:Object.fromEntries(flags.map(f=>[f,true])),seed:null,state:null,errors:{},failures:checks.filter(c=>!c.ok).map(c=>({message:c.name,actual:c.detail})),history:[],screenshots,commit,branch,releaseId,denylist,failureKind:'FLAG_MATRIX'})).file;
  return {checks,flags,bundle};
}

// ---- persistence torture -----------------------------------------------------------------
async function persistenceSuite({driver,seed,commit,branch,releaseId,denylist,bundleDir,shotsDir,log}){
  const checks=[];const screenshots=[];
  const page=await driver.page(DEFAULT_VIEWPORT,{});
  let bundle=null;
  const core=state=>state?{version:state.version,day:state.life?.world?.day,money:state.life?.resources?.money,flags:state.life?.world?.flags,adventures:state.life?.adventures}:null;
  try{
    await page.goto('/');await page.waitForFunction(READY,{timeout:20000});
    await page.evaluate(SEED_LIFE);
    await page.reload();await page.waitForFunction(READY,{timeout:20000});
    await page.click('#startButton');await page.waitForFunction(BEDROOM,{timeout:20000});
    const before=await page.snapshot();
    for(let i=1;i<=3;i++){
      await page.reload();await page.waitForFunction(READY,{timeout:20000});
      if(await page.evaluate("()=>!!document.querySelector('#startButton')"))await page.click('#startButton');
      await page.waitForFunction(BEDROOM,{timeout:20000});
      const after=await page.snapshot();
      const same=stableStringify(core(after))===stableStringify(core(before));
      checks.push({name:`reload-${i}`,ok:same,detail:same?'save preserved across reload':`core state changed: ${stableStringify(core(after))}`});
      if(!same&&!screenshots.length)screenshots.push(await page.screenshot('persistence-reload-diff'));
    }
    // malformed-but-recoverable: a good recovery envelope survives a corrupted primary.
    await page.evaluate("()=>{const raw=localStorage.getItem(RAState.keys.primary);localStorage.setItem(RAState.keys.recovery,JSON.stringify({format:1,savedAt:new Date().toISOString(),state:JSON.parse(raw)}));localStorage.setItem(RAState.keys.primary,'{not valid json');}");
    await page.reload();await page.waitForFunction(READY,{timeout:20000});
    const status=await page.evaluate("()=>({...RAState.getLoadStatus(),day:RAState.get().life.world.day})");
    const recovered=status.recovered===true&&status.source==='recovery'&&Number.isInteger(status.day);
    checks.push({name:'malformed-recoverable',ok:recovered,detail:JSON.stringify(status)});
    if(!recovered){screenshots.push(await page.screenshot('persistence-recovery'));const errors=await page.errors();bundle=(await writeFailureBundle({dir:bundleDir,route:{id:'persistence.malformed-recoverable',fragment:'IF1'},viewport:DEFAULT_VIEWPORT,flags:{},seed,state:null,errors,failures:[{message:'malformed save did not recover from the backup envelope',actual:status}],history:[],screenshots,commit,branch,releaseId,denylist,failureKind:'PERSISTENCE'})).file;}
  }catch(error){
    checks.push({name:'persistence-suite',ok:false,detail:String(error.message)});
    bundle=(await writeFailureBundle({dir:bundleDir,route:{id:'persistence.suite',fragment:'IF1'},viewport:DEFAULT_VIEWPORT,flags:{},seed,state:null,errors:{page:[String(error.message)]},failures:[{message:`persistence suite error: ${error.message}`}],history:[],screenshots,commit,branch,releaseId,denylist,failureKind:'PERSISTENCE'})).file;
  }
  await page.close();
  return {checks,bundle};
}

// ---- migration / reload replay -----------------------------------------------------------
async function migrationSuite({driver,seed,commit,branch,releaseId,denylist,bundleDir,log}){
  const checks=[];const page=await driver.page(DEFAULT_VIEWPORT,{});
  const screenshots=[];let bundle=null;
  try{
    await page.goto('/');await page.waitForFunction("()=>window.RAState&&window.RASaveFixtures",{timeout:20000});
    const ids=await page.evaluate("()=>Object.keys(RASaveFixtures.fixtures)");
    for(const id of ids){
      await page.evaluate(({id})=>{const f=RASaveFixtures.fixtures[id];localStorage.clear();localStorage.setItem(RAState.keys.primary,typeof f==='string'?f:JSON.stringify(f));},{id});
      await page.reload();await page.waitForFunction("()=>window.RAState",{timeout:20000});
      const info=await page.evaluate("()=>({...RAState.getLoadStatus(),version:RAState.get().version,target:RAState.version,day:RAState.get().life.world.day})");
      const ok=info.version===info.target;
      checks.push({name:`migration:${id}`,ok,detail:ok?`v${info.version} via ${info.source}${info.migrated?' (migrated)':''}${info.recovered?' (recovered)':''}`:`version ${info.version} != ${info.target}`});
      if(!ok&&!screenshots.length)screenshots.push(await page.screenshot('migration-diff'));
    }
  }catch(error){checks.push({name:'migration-suite',ok:false,detail:String(error.message)});}
  await page.close();
  if(checks.some(c=>!c.ok))bundle=(await writeFailureBundle({dir:bundleDir,route:{id:'migration.replay',fragment:'IF1'},viewport:DEFAULT_VIEWPORT,flags:{},seed,state:null,errors:{},failures:checks.filter(c=>!c.ok).map(c=>({message:c.name,actual:c.detail})),history:[],screenshots,commit,branch,releaseId,denylist,failureKind:'MIGRATION'})).file;
  return {checks,bundle};
}

// ---- no starvation (headless, deterministic) ---------------------------------------------
async function starvationSuite({root,days=28,isRepeatable}){
  const checks=[];
  try{
    const {loadBtf}=await import('../btf-test.mjs');
    const ctx=await loadBtf(root);
    ctx.RAClock.wake({first:true});
    const repeatable=isRepeatable||(id=>ctx.RAAdventures?.get?.(id)?.repeatable===true);
    const startDay=ctx.RALife.today().day;let last=startDay;let ok=true;let detail='';
    for(let d=0;d<days;d++){
      ctx.RAClock.sleep();
      const day=ctx.RALife.today().day;
      if(day!==last+1){ok=false;detail=`day did not advance: ${last} -> ${day}`;break;}
      last=day;
      const problems=stateInvariants(ctx.RAState.get(),{version:ctx.RAState.version,isRepeatable:repeatable});
      if(problems.length){ok=false;detail=problems.join('; ');break;}
      const money=ctx.RALife.money();
      if(!Number.isFinite(money)||money<0){ok=false;detail=`starvation: money ${money}`;break;}
    }
    checks.push({name:`${days}-day-clock`,ok,detail:ok?`day ${startDay} → ${last}, money finite, no duplicate resolutions`:detail});
  }catch(error){checks.push({name:'starvation-suite',ok:false,detail:String(error.message)});}
  return {checks};
}

// ---- viewport matrix + phone placement hook ----------------------------------------------
const SWEEP_ROUTE={id:'IF1.viewport.phone',fragment:'IF1',steps:[
  {action:'goto',url:'/'},{action:'waitFor',expression:READY,timeout:20000},
  {action:'eval',script:SEED_LIFE,saveAs:'seed'},{action:'reload'},{action:'waitFor',expression:READY,timeout:20000},
  {action:'click',selector:'#startButton'},{action:'waitFor',expression:BEDROOM,timeout:20000},
  {action:'click',selector:'#checkPhone'},{action:'waitFor',expression:"()=>window.RAPhone&&RAPhone.isOpen()",timeout:10000},
  {action:'wait',ms:800}
]};
async function viewportSuite({driver,commit,branch,releaseId,denylist,shotsDir,bundleDir,log}){
  const viewports=[];const phoneHook={registered:1,validators:0,findings:[]};const bundles=[];
  for(const vp of VIEWPORTS){
    const page=await driver.page(vp,{});
    let findings=null,phone=null,errors={};
    try{
      await executeRoute(page,SWEEP_ROUTE,{shotsDir:null});
      findings=await viewportFindings(page);
      phone=await phonePlacementFindings(page);
      await page.screenshot(`viewport-${vp.id}`);
      errors=await page.errors();
    }catch(error){findings={overflow:false,clipped:[],covered:[],unreachable:[],smallTargets:[],error:String(error.message)};errors={page:[String(error.message)]};}
    const behavioral=!!(findings.overflow||findings.clipped?.length||findings.covered?.length||findings.unreachable?.length||findings.error||errors.page?.length||errors.console?.length||errors.network404?.length);
    const record={id:vp.id,width:vp.width,height:vp.height,mobile:vp.mobile,findings,errors:{page:errors.page||[],console:errors.console||[],network404:errors.network404||[]}};
    viewports.push(record);
    for(const f of phone?.clipped||[])phoneHook.findings.push({kind:'phone-clipped',viewport:vp.id,...f});
    for(const f of phone?.covered||[])phoneHook.findings.push({kind:'phone-control-covered',viewport:vp.id,...f});
    if(behavioral&&vp.mobile){
      const built=await writeFailureBundle({dir:bundleDir,route:{id:`viewport.${vp.id}`,fragment:'IF1'},viewport:vp,flags:{},seed:null,state:null,errors,failures:[{message:'viewport layout finding',actual:findings}],history:[],screenshots:[],commit,branch,releaseId,denylist,failureKind:'VIEWPORT'});
      bundles.push(built.file);
    }
    if(vp.mobile)log(`${behavioral?'FAIL':'PASS'} viewport ${vp.id} (${vp.width}x${vp.height})`);
    await page.close();
  }
  return {viewports,phoneHook,bundles};
}

// ---- main --------------------------------------------------------------------------------
export async function runHarness(options={}){
  const rootDir=options.root||root;
  const dist=options.dist?path.resolve(options.dist):path.join(rootDir,'dist');
  const url=options.url||null;
  const out=path.resolve(options.out||path.join(rootDir,'reports','f14'));
  const shotsDir=path.join(out,'shots');const bundleDir=path.join(out,'bundles');
  const log=options.log||console.log;
  const seed=options.seed??7;
  const only=options.only?new Set(options.only):null;
  const exclude=options.exclude?new Set(options.exclude):null;
  const requireBrowser=!!options.requireBrowser;
  const denylist=options.denylist||null;
  const finalMode=!!options.finalMode;
  const leakEnabled=options.leak!==false;
  const commit=options.commit||gitCommit(rootDir);const branch=options.branch||gitBranch(rootDir);
  const release=url?null:await readRelease(dist);
  const releaseId=release?.releaseId||null;
  await mkdir(out,{recursive:true});await mkdir(shotsDir,{recursive:true});await mkdir(bundleDir,{recursive:true});

  // ---- static
  const registry=await loadRoutes(rootDir);
  if(registry.problems.length)log(`route registry problems:\n  ${registry.problems.join('\n  ')}`);
  const scanDir=(!url&&existsSync(dist))?dist:rootDir;
  const scanScope=(!url&&existsSync(dist))?null:RUNTIME_SCOPE;
  const assets=await scanAssets({dir:scanDir,scope:scanScope});
  const audioCheck=await checkAudio({root:rootDir,dir:scanDir});
  const artCheck=await checkArtRegistry({root:rootDir,dir:scanDir});
  const placements=await loadPlacements(rootDir);
  const placeholders={findings:assets.findings.filter(f=>f.kind==='placeholder-marker'||f.kind==='placeholder-marker-name')};
  const leak=leakEnabled?await runLeak({root:rootDir,dist:(!url&&existsSync(dist))?dist:null,denylist,range:options.leakRange||null,hqPrivate:!!options.hqPrivate}):{ok:true,violations:[],skipped:true};

  // ---- browser
  const bundles=[];
  const reports={assets,audioCheck,artCheck,placeholders,leak,viewports:[],routes:{results:[]},persistence:null,migration:null,flagMatrix:null,starvation:{checks:[]},phoneHook:{registered:1,validators:placements.authorized.length,findings:[]}};
  let browser={status:RESULT.SKIPPED,reason:'no driver'};
  const opened=options.driver?{status:'READY',driver:options.driver,base:options.base||''}:await openDriver({root:rootDir,dist,url,out:shotsDir,denylist,log});
  if(opened.status!=='READY'){
    browser={status:RESULT.SKIPPED,reason:opened.reason};
    log(`SKIPPED browser suite: ${opened.reason}`);
  }else{
    const driver=opened.driver;
    try{
      const selected=registry.authorized.filter(r=>(!only||only.has(r.id)||only.has(r.fragment))&&!(exclude&&(exclude.has(r.id)||exclude.has(r.fragment))));
      for(const route of selected){
        const result=await runOneRoute({driver,route,seed,commit,branch,releaseId,denylist,shotsDir,bundleDir,log});
        reports.routes.results.push(result);if(result.bundle)bundles.push(result.bundle);
      }
      const flagMatrix=await flagMatrixSuite({driver,registry,commit,branch,releaseId,denylist,bundleDir,log});
      reports.flagMatrix=flagMatrix;if(flagMatrix.bundle)bundles.push(flagMatrix.bundle);
      const persistence=await persistenceSuite({driver,seed,commit,branch,releaseId,denylist,bundleDir,shotsDir,log});
      reports.persistence=persistence;if(persistence.bundle)bundles.push(persistence.bundle);
      const migration=await migrationSuite({driver,seed,commit,branch,releaseId,denylist,bundleDir,log});
      reports.migration=migration;if(migration.bundle)bundles.push(migration.bundle);
      const vp=await viewportSuite({driver,commit,branch,releaseId,denylist,shotsDir,bundleDir,log});
      reports.viewports=vp.viewports;reports.phoneHook=vp.phoneHook;bundles.push(...vp.bundles);
      const browserFailed=reports.routes.results.some(r=>r.status===RESULT.FAIL)||flagMatrix.checks.some(c=>!c.ok)||persistence.checks.some(c=>!c.ok)||migration.checks.some(c=>!c.ok)||vp.viewports.some(v=>v.findings?.error||v.findings?.overflow||v.findings?.clipped?.length||v.findings?.covered?.length||v.findings?.unreachable?.length)||vp.viewports.some(v=>v.errors?.page?.length);
      browser={status:browserFailed?RESULT.FAILED:RESULT.PASSED,total:reports.routes.results.length,failed:reports.routes.results.filter(r=>r.status===RESULT.FAIL).length};
    }finally{await driver.close();}
  }
  reports.starvation=options.starvation===false?{checks:[{name:'starvation',ok:true,detail:'not run'}]}:await starvationSuite({root:rootDir,days:options.days||28});
  reports.browser=browser;

  // ---- checklist
  const evaluated=evaluateChecklist(reports,registry,{finalMode});
  // A static FAIL (assets/audio/leak/starvation) also gets a bundle.
  const staticFails=evaluated.failed.filter(c=>['asset-integrity','authored-audio','leak-scan','no-starvation','placeholder-final-mode'].includes(c.id));
  for(const c of staticFails){
    const written=await writeFailureBundle({dir:bundleDir,route:{id:c.id,fragment:'IF1'},viewport:null,flags:{},seed,state:null,errors:{},failures:[{message:c.detail,actual:c.findings}],history:[],screenshots:[],commit,branch,releaseId,denylist,failureKind:'STATIC',notes:[c.title]});
    bundles.push(written.file);
  }

  const report={
    schema:1,harness:'f14-fcpb-qa-harness',at:new Date().toISOString(),
    commit,branch,releaseId,target:url||posix(path.relative(rootDir,dist)),
    finalMode,
    requireBrowser,
    browser,
    routes:{...reports.routes,total:reports.routes.results.length,passed:reports.routes.results.filter(r=>r.status===RESULT.PASS).length,failed:reports.routes.results.filter(r=>r.status===RESULT.FAIL).length,pending:registry.pending.length,authorized:registry.authorized.length},
    registry:{total:registry.routes.length,authorized:registry.authorized.length,pending:registry.pending.length,problems:registry.problems},
    viewports:reports.viewports,
    flagMatrix:reports.flagMatrix,
    persistence:reports.persistence,
    migration:reports.migration,
    starvation:reports.starvation,
    assets:{summary:{files:assets.files,refs:assets.refs,decoded:assets.decoded,images:assets.images,audio:assets.audio},findings:assets.findings},
    audioCheck:{summary:audioCheck.summary,findings:audioCheck.findings,pending:audioCheck.pending},
    artCheck:{summary:artCheck.summary,findings:artCheck.findings},
    placeholders:reports.placeholders,
    leak,
    phoneHook:reports.phoneHook,
    phonePlacementDeclared:{authorized:placements.authorized.length,pending:placements.pending.length},
    checklist:evaluated.checks,
    checklistSummary:{ok:evaluated.ok,counts:evaluated.counts,failed:evaluated.failed.map(c=>c.id),pending:evaluated.pending.map(c=>c.id),manual:evaluated.manual.map(c=>c.id)},
    bundles:[...new Set(bundles)]
  };
  return report;
}

export function formatReport(report){
  const lines=[];
  lines.push(`${report.checklistSummary.ok?'PASS':'FAIL'} F14 FCPB QA HARNESS — ${report.target} @ ${report.commit.slice(0,12)}`);
  lines.push(`  routes: ${report.routes.passed}/${report.routes.authorized} authorized passed, ${report.routes.pending} PENDING_FRAGMENT`);
  lines.push(`  browser: ${report.browser.status}${report.browser.reason?` — ${report.browser.reason}`:''}`);
  for(const c of report.checklist)lines.push(`  ${c.status.padEnd(17)} [${c.kind}] ${c.id} — ${c.detail}`);
  if(report.bundles.length)lines.push(`  reproduction bundles: ${report.bundles.length} in ${path.dirname(report.bundles[0])}`);
  return lines.join('\n');
}
