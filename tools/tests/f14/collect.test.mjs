// F14-A harness self-test — save snapshot invariants, softlock, dead phone apps / dead links, backout & retry.
import assert from 'node:assert/strict';
import {stateInvariants,duplicateResolutions,detectSoftlock,detectBudgetExhaustion,deadPhoneApps,deadLinks,backoutFindings,retryFindings} from '../../f14/collect.mjs';

const clean=()=>({version:16,life:{resources:{money:1000},world:{day:9},receipts:[{id:'r1'}],memoryLog:[{id:'m1'}],clock:{mail:[{id:'x1'}]},history:[{id:'h1'}],ownership:{cars:[{id:'c1'}],properties:[],castleRooms:[]},adventures:{records:{A1:{count:1}}},events:{records:{E1:{deliveries:1}}},phone:{threads:{kiki:[{id:'t1'}]}}}});

export async function test(root){
  assert.deepEqual(stateInvariants(clean(),{version:16}),[],'a clean save has no invariant findings');
  const dup=clean();dup.life.receipts.push({id:'r1'});dup.life.ownership.cars.push({id:'c1'});
  dup.life.clock.mail.push({id:'x1'});dup.life.phone.threads.kiki.push({id:'t1'});
  dup.life.adventures.records.A1.count=2;dup.life.events.records.E1.deliveries=2;
  const problems=stateInvariants(dup,{version:16});
  assert(problems.some(p=>/duplicate receipts/.test(p)));
  assert(problems.some(p=>/duplicate cars/.test(p)));
  assert(problems.some(p=>/duplicate mail/.test(p)));
  assert(problems.some(p=>/duplicate text ids/.test(p)));
  assert(problems.some(p=>/non-repeatable adventure A1/.test(p)));
  assert(problems.some(p=>/world event E1/.test(p)));
  // a repeatable adventure completing more than once is authored, not a duplicate-resolution bug
  assert(!stateInvariants(dup,{version:16,isRepeatable:id=>id==='A1'}).some(p=>/non-repeatable adventure A1/.test(p)));
  // ---- duplicate resolution detector
  const dr=duplicateResolutions({adventures:{A1:{count:3}},events:{E2:{deliveries:2}}});
  assert.equal(dr.length,2);assert(dr.every(x=>/duplicate/.test(x.kind)));
  assert.equal(duplicateResolutions({adventures:{FAILBRANCH:{count:5}},authoredFailures:['FAILBRANCH']}).length,0,'authored failure branches may repeat');
  // ---- softlock / budget
  assert.equal(detectSoftlock(Array(39).fill('same')),null);
  assert.equal(detectSoftlock(Array(40).fill('same')).repeats,40);
  assert.equal(detectSoftlock([...Array(39).fill('a'),'b']),null);
  assert(detectBudgetExhaustion(1200,1200));assert.equal(detectBudgetExhaustion(3,1200),null);
  // ---- dead phone apps / dead links
  assert.deepEqual(deadPhoneApps({declared:['vampgpt','warRoom'],rendered:['vampgpt'],unlocked:()=>true}),[{kind:'dead-phone-app',id:'warRoom'}]);
  assert.equal(deadPhoneApps({declared:['warRoom'],rendered:[],unlocked:id=>id!=='warRoom'}).length,0,'a locked app is not dead');
  assert.deepEqual(deadLinks({anchors:['/ok.html','/gone.html','https://x/y'],missing:['/gone.html']}),[{kind:'dead-link',href:'/gone.html',status:404}]);
  assert.equal(deadLinks({anchors:['/ok.html'],statuses:{'/ok.html':200}}).length,0);
  // ---- backout / retry
  assert.deepEqual(backoutFindings({before:{resources:{money:1000}},after:{scene:'bedroom',resources:{money:1000}}}),[]);
  assert(backoutFindings({before:{resources:{money:1000}},after:{scene:'adventure',resources:{money:900}},activeAdventure:'A00'}).length>=1);
  assert.equal(retryFindings({first:{available:true},second:{available:true,reopened:true}}).length,0);
  assert(retryFindings({first:{available:false},second:{available:true,reopened:false}}).some(f=>f.kind==='retry-not-reopened'));
  console.log('PASS f14 detection (invariants, duplicate resolutions, softlock, dead apps/links, backout, retry)');
}
