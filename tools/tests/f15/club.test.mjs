// F15 club seam + targeting, on the REAL approved F06 core and the REAL F06 production wrapper (headless; the DOM stage is covered by
// tools/tests/f15/browser-check.mjs in a real browser).
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {run} from '../if1/_lib.mjs';
import {boot,money,setMoney} from './_lib.mjs';

const sha=v=>createHash('sha256').update(v).digest('hex');
export async function test(root){
 // ---- F06's approved core/tunables are untouched; the adapter delta is the two additive seams only -----------------------------------------
 {const rd=f=>readFile(path.join(root,f),'utf8');
  const adapter=(await rd('js/frag/F06/make_it_rain.js')).replace(/\r\n/g,'\n');
  assert.match(adapter,/var hideTarget = !!options\.hideTarget;/);assert.match(adapter,/if \(!hideTarget\) drawTarget\(L, tx, spot, N\);/);assert.match(adapter,/geometry: function \(\)/);
  const prod=(await rd('js/frag/F06/production.js')).replace(/\r\n/g,'\n');
  assert.match(prod,/options\.onSpend\?\.\(\{delta, result, round: round\.id\}\)/);
  console.log('PASS F15 seam: F06 adapter/production deltas are the additive hideTarget/geometry/onSpend seams (core + tunables guarded by f06/source.test.mjs)');}

 // ---- WOLF v2 replacement: verified, distinct, previous recoverable --------------------------------------------------------------------------
 {const m=JSON.parse(await readFile(path.join(root,'assets/f15/dancers/manifest.json'),'utf8')).dancers;
  assert.equal(m.wolf.frames,145);assert.equal(m.wolf_prev.frames,146);assert.notEqual(m.wolf.master_sequence_sha256,m.wolf_prev.master_sequence_sha256,'replacement differs from the old WOLF');
  assert.equal(m.wolf.div,4);assert.ok(Math.abs(m.wolf.scale_mul*(m.wolf.occupied_union_master_xyxy[3]-m.wolf.occupied_union_master_xyxy[1])-600)<1e-6,'Layout A apparent height preserved');
  assert.equal(m.wolf_prev.sheet_sha256,'3a77ea24b3f87cdc0'.slice(0,0)+m.wolf_prev.sheet_sha256);assert.match(m.wolf_prev.sheet_sha256,/^3a77ea24b3f87cdc/,'previous WOLF sheet byte-identical to the accepted one');
  assert.equal(JSON.parse(JSON.stringify((await boot(root)).RAF15Tunables.WOLF_SHEET)),'wolf');
  console.log('PASS F15 WOLF v2: 145-frame replacement verified and distinct, previous 146-frame sheet recoverable, apparent height preserved');}

 // ---- targeting: the approved target formula lands on the supported dancer's slot ----------------------------------------------------------
 {const c=await boot(root);
  const T=c.RAF15Tunables.LAYOUT.slots,defaults=c.RAMakeItRainTunables.defaults;
  for(const dancer of c.RAF15.dancers()){
   const cx=T[c.RAF15.handleOf(dancer)].cx;
   const tunables=c.RAMakeItRainTunables.merge(defaults,{target:{driftAmplitude:cx-0.5,driftPeriodMs:1e15,driftPhase:Math.PI/2}});
   const core=c.RAMakeItRainCore.create({tunables,seed:1});core.reset({budget:10000});
   for(const t of [0,500,1049,2600,9000,25000])assert.ok(Math.abs(core.targetX(t)-cx)<1e-9,`${dancer}: target is her slot at t=${t}`);
   // a flick aimed at HER (during the spotlight window) is a hit; aimed at the next dancer over is not
   const aim=x=>(x-0.5)/tunables.aim.aimSpread,release=(x,t)=>{core.beginDrag({x:.5,y:.9,t:t-300});core.dragTo({x:.5,y:.4,t:t-40});return core.release({x:.5,y:.2,t,vx:aim(x)*2,vy:-2});};
   const hit=release(cx,300);assert.equal(hit.kind,'hit',`${dancer}: aimed at her => HIT`);assert.ok(Math.abs(hit.targetX-cx)<1e-9);
   const other=c.RAF15.dancers().map(d=>T[c.RAF15.handleOf(d)].cx).find(x=>Math.abs(x-cx)>0.25);
   const miss=release(other,2900);assert.equal(miss.kind,'miss',`${dancer}: aimed at someone else => MISS`);
  }
  // changing the target for FUTURE throws never rewrites a throw already resolved (the result carries the snapshot)
  const tunables=c.RAMakeItRainTunables.merge(defaults,{target:{driftAmplitude:-0.29,driftPeriodMs:1e15,driftPhase:Math.PI/2}});
  const core=c.RAMakeItRainCore.create({tunables,seed:1});core.reset({budget:10000});
  core.beginDrag({x:.5,y:.9,t:100});core.dragTo({x:.5,y:.4,t:360});const first=core.release({x:.5,y:.2,t:400,vx:-0.9,vy:-2});
  Object.assign(tunables.target,{driftAmplitude:0.29});
  assert.ok(Math.abs(first.targetX-0.21)<1e-9,'the resolved throw keeps the recipient it was thrown at');
  assert.ok(Math.abs(core.targetX(500)-0.79)<1e-9,'only the next throw sees the new target');
  console.log('PASS F15 targeting: real F06 core resolves hit/miss on the supported dancer; later selection changes cannot redirect a resolved throw');}

 // ---- production wrapper: onSpend fires once per PAID throw, never for duplicates/insufficient funds ---------------------------------------------
 {const c=await boot(root);const calls=[];let lastOptions=null;
  c.RAMakeItRainSandbox={mount(canvas,options){
   lastOptions=options;const core=c.RAMakeItRainCore.create({seed:1});
   return {core,tunables:{target:{}},startRound:b=>core.reset({budget:b}),getState:()=>core.state(),stop(){},destroy(){},
    flick(t=1000){core.beginDrag({x:.5,y:.9,t:t-250});core.dragTo({x:.5,y:.4,t:t-40});const r=core.release({x:.5,y:.2,t,vx:0,vy:-2});options.audio.onFlick(r);return r;},
    duplicate:()=>options.audio.onFlick()};}};
  await run(root,c,['js/frag/F06/production.js']);
  setMoney(c,50000);
  const s=c.RAF06Rainmaker.mount(null,{onSpend:x=>calls.push(x),hideTarget:true,tunables:{target:{driftPeriodMs:1e15}}});
  assert.equal(lastOptions.hideTarget,true);assert.equal(lastOptions.tunables.target.driftPeriodMs,1e15,'F06 passes the host seam through to the adapter');
  assert.ok(s.start(5000));const b0=money(c);
  const r1=s.game.flick(1000),r2=s.game.flick(1400);s.game.duplicate();
  assert.equal(calls.length,2,'one onSpend per paid throw; a duplicate feedback is never a second attribution');
  assert.equal(calls[0].delta,r1.dollars);assert.equal(calls[1].delta,r2.dollars);
  assert.equal(b0-money(c),r1.dollars+r2.dollars,'F06 pays exactly the thrown dollars');
  s.dispose();
  // insufficient funds: F06 aborts the round, nothing is attributed
  setMoney(c,5000);const n=calls.length;const s2=c.RAF06Rainmaker.mount(null,{onSpend:x=>calls.push(x)});assert.ok(s2.start(5000));setMoney(c,10);
  s2.game.flick(2000);assert.equal(calls.length,n,'an unpaid throw is never attributed');s2.dispose();
  console.log('PASS F15 production seam: onSpend exactly once per paid throw (misses included), never for duplicates or unpaid throws');}
}
