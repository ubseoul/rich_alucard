// F14-A harness self-test — route registration + PENDING_FRAGMENT handling.
import assert from 'node:assert/strict';
import path from 'node:path';
import {loadRoutes,validateRoute} from '../../f14/routes.mjs';
import {tmpDir,writeJson,rm} from './_lib.mjs';

export async function test(root){
  const reg=await loadRoutes(root);
  assert.equal(reg.problems.length,0,`registry problems: ${reg.problems.join('; ')}`);
  assert(reg.authorized.length>=1,'the accepted baseline must authorize at least one route');
  assert(reg.pending.length>=1,'the campaign routes must be declared PENDING_FRAGMENT');
  // no duplicate ids
  assert.equal(new Set(reg.routes.map(r=>r.id)).size,reg.routes.length,'route ids must be unique');
  // every authorized route is executable; every pending route is not
  for(const r of reg.authorized)assert(r.steps.length>0,`${r.id} authorized but has no steps`);
  for(const r of reg.pending)assert(!r.steps.length,`${r.id} is PENDING_FRAGMENT but carries steps`);
  // the mission's campaign routes are declared, never silently absent
  // (FCPB convergence: the retired tactical SHOWDOWN routes were replaced by F01.play.hold; a route is PENDING_FRAGMENT until a fragment
  // file upgrades it to AUTHORIZED, which is checked by the loops above)
  for(const id of ['F01.play.hold','F02.armory.open','F02.range_day.run','F03.m9.tribute','F03.m10.vice_president','F04.war_room.open','F05.trap.run','F06.rainmaker.run']){
    assert(reg.byId.has(id),`expected campaign route ${id} is not declared`);
  }
  for(const id of ['F01.showdown.success','F01.showdown.failure','F01.showdown.retreat'])assert(!reg.byId.has(id),`retired tactical route ${id} must not be declared`);
  // ---- validation rejects bad descriptors
  assert(validateRoute({id:'F01.x',fragment:'F01',title:'t',kind:'mission',status:'AUTHORIZED',steps:[]}).some(p=>/non-empty steps/.test(p)),'AUTHORIZED without steps must be rejected');
  assert(validateRoute({id:'bad',fragment:'F01',title:'t',kind:'mission'}).some(p=>/invalid route id/.test(p)),'bad id must be rejected');
  assert(validateRoute({id:'IF1.x',fragment:'IF1',title:'t',kind:'mission',status:'PENDING_FRAGMENT'}).length>0,'IF1 baseline cannot be PENDING_FRAGMENT');
  // ---- a fragment file upgrades a declaration by id
  const tmp=await tmpDir('raf14routes-');
  try{
    await writeJson(path.join(tmp,'tools','f14','routes','_expected.json'),{routes:[{id:'F01.showdown.success',fragment:'F01',title:'declared',kind:'success',status:'PENDING_FRAGMENT'}]});
    await writeJson(path.join(tmp,'tools','f14','routes','F01.json'),{routes:[{id:'F01.showdown.success',fragment:'F01',title:'real',kind:'success',status:'AUTHORIZED',steps:[{action:'goto',url:'/'}]}]});
    const upgraded=await loadRoutes(tmp);
    assert.equal(upgraded.byId.get('F01.showdown.success').status,'AUTHORIZED','a fragment file must replace the declaration');
    assert.equal(upgraded.pending.length,0);
    assert(upgraded.sources['F01.showdown.success'].includes('F01.json'));
  }finally{await rm(tmp,{recursive:true,force:true});}
  console.log(`PASS f14 route registry (${reg.authorized.length} authorized, ${reg.pending.length} PENDING_FRAGMENT, validation + override)`);
}
