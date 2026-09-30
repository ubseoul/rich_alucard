// F14-A harness self-test — end-to-end orchestration with a fake driver: checklist statuses, PENDING_FRAGMENT
// handling, viewport switching, screenshot generation and failure-bundle generation.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {runHarness} from '../../f14/harness.mjs';
import {VIEWPORTS,RESULT} from '../../f14/config.mjs';
import {fakePage,fakeDriver,scriptedEvaluate,tmpDir,rm} from './_lib.mjs';

const cleanState=()=>({version:16,life:{world:{day:9},resources:{money:1000},receipts:[],memoryLog:[],clock:{mail:[]},history:[],ownership:{cars:[],properties:[],castleRooms:[]},adventures:{records:{}},events:{records:{}},phone:{threads:{}}}});
const passingEvaluate=scriptedEvaluate([
  ['RAState.getLoadStatus',{source:'recovery',recovered:true,day:9,version:16,target:16}],
  ['Object.keys(RASaveFixtures',[]],
  ['RALife',9],
  ['document.body',true],
  ['RAPhone',true]
]);
const makePassingDriver=shotsDir=>fakeDriver(()=>fakePage({evaluate:passingEvaluate,snapshot:cleanState,screenshotDir:shotsDir}));

export async function test(root){
  // ---- PASS run
  const passOut=await tmpDir('raf14harness-');
  try{
    const driver=makePassingDriver(path.join(passOut,'shots'));
    const report=await runHarness({root,dist:path.join(root,'__no_dist__'),driver,base:'http://fake',out:passOut,only:['IF1.boot'],leak:false,starvation:false,log:()=>{}});
    assert.equal(report.browser.status,RESULT.PASSED,`browser should pass: ${JSON.stringify(report.routes.results)}`);
    assert.equal(report.routes.results.length,1,'only the selected route runs');
    assert.equal(report.routes.results[0].status,RESULT.PASS);
    // viewport switching: the sweep exercised all four matrix viewports (360/390/430 + desktop sanity)
    const swept=driver.pages.map(p=>p.vpArg&&p.vpArg.id).filter(Boolean);
    for(const vp of VIEWPORTS)assert(swept.includes(vp.id),`viewport ${vp.id} was not swept`);
    assert.equal(report.viewports.length,4);
    // screenshot generation happened (the viewport sweep and start route both shoot)
    const shots=await readdir(path.join(passOut,'shots')).catch(()=>[]);
    assert(shots.length>0,'screenshots must be generated');
    // checklist never fails on missing fragment content
    assert.equal(report.checklistSummary.ok,true,`unexpected failures: ${report.checklistSummary.failed}`);
    assert(report.registry.pending>=8,'campaign routes are PENDING_FRAGMENT (8 declared after the retired tactical SHOWDOWN routes were replaced)');
    assert.equal(report.routes.pending,report.registry.pending);
    const auth=report.checklist.find(c=>c.id==='authorized-missions');
    assert(['PASS','PENDING_FRAGMENT','SKIPPED'].includes(auth.status),'pending missions are never a failure');
    const phone=report.checklist.find(c=>c.id==='phone-placement-hook');
    assert.equal(phone.status,RESULT.PENDING_FRAGMENT,'no fragment placement validators yet');
    const p0=report.checklist.find(c=>c.id==='no-p0-p1');
    assert.equal(p0.kind,'MANUAL','no P0/P1 is a human sign-off');
    assert.equal(report.bundles.length,0,'a clean run writes no reproduction bundle');
  }finally{await rm(passOut,{recursive:true,force:true});}

  // ---- FAIL run: a captured page error must fail the route and write a reproduction bundle
  const failOut=await tmpDir('raf14harness-fail-');
  try{
    let first=true;
    const driver=fakeDriver(()=>{const page=fakePage({evaluate:passingEvaluate,snapshot:cleanState,errors:first?{console:[],page:['F14-INDUCED-PAGE-ERROR'],network404:[],unhandled:['boom']}:{console:[],page:[],network404:[],unhandled:[]}});first=false;return page;});
    const report=await runHarness({root,dist:path.join(root,'__no_dist__'),driver,base:'http://fake',out:failOut,only:['IF1.boot'],leak:false,starvation:false,log:()=>{}});
    assert.equal(report.routes.results[0].status,RESULT.FAIL);
    assert.equal(report.checklistSummary.ok,false,'a failed route is a blocking failure');
    assert(report.bundles.length>=1,'a failed run must produce a reproduction bundle');
    const file=report.bundles[0];
    const bundle=JSON.parse(await readFile(file,'utf8'));
    for(const key of ['commit','featureFlags','seed','viewport','day','saveSnapshot','pageErrors','failedAssertion','screenshots','routeHistory'])assert(key in bundle,`reproduction bundle is missing ${key}`);
    assert(bundle.pageErrors.includes('F14-INDUCED-PAGE-ERROR'),'console/page errors are captured in the bundle');
    assert(bundle.unhandledRejections.includes('boom'));
    assert(bundle.failedAssertion&&bundle.failedAssertion.message,'the failed assertion is recorded');
  }finally{await rm(failOut,{recursive:true,force:true});}
  console.log('PASS f14 harness orchestration (checklist, PENDING_FRAGMENT, viewport sweep, screenshots, failure bundles)');
}
