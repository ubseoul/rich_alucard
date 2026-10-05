// §6 ZERO BEHAVIOR CHANGE INVARIANT. With every new fragment flag OFF the integrated game must behave exactly like the
// accepted pre-F00 game. Proof by differential replay: play the SAME lives through the REAL engine calls once with the IF-1
// modules absent (baseline) and once with them present, and require byte-identical saves, wake orders and outcomes.
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {normalize,same,full} from './_lib.mjs';

async function live(root,save,{if1,nights=6}){
  const {loadBtf,drive,driveChain,offers}=await import(pathToFileURL(path.join(root,'tools','pilot','headless.mjs')).href);
  const ctx=await loadBtf(root,{seedState:save,if1});const {RAState,RAClock,RALife,RAAdventures,RAWakeTriggers}=ctx;
  const trace=[];const exits=[/I'M GOOD/,/^BACK/,/THAT'S ENOUGH/,/NOT TODAY/,/LEAVE/,/GET OUT/,/JUST SIT/,/THAT'S THE LIST/];
  for(let n=0;n<nights;n++){
    RAClock.sleep();const w=RAWakeTriggers.pick();trace.push(['wake',RALife.today().day,w]);
    if(w)driveChain(ctx,drive(ctx,w,{from:'wake'}));
    for(const o of offers(ctx).filter(o=>o.adventure&&RAAdventures.available(o.adventure)).slice(0,3)){trace.push(['offer',o.adventure]);driveChain(ctx,drive(ctx,o.adventure,{vars:o.vars||{},prefer:exits}),{prefer:exits});}
  }
  return {trace,save:normalize(RAState.get()),money:RALife.money(),day:RALife.today().day,handlers:ctx.RAClock.handlers().filter(id=>id!=='night-report'&&id!=='if1.crew-timers')};
}
export async function test(root){
  const dir=path.join(root,'tools','pilot','fixtures');const files=(await readdir(dir)).filter(f=>f.endsWith('.json')).sort();assert(files.length>=4);
  let plays=0;
  for(const f of files){
    const {save}=JSON.parse(await readFile(path.join(dir,f),'utf8'));
    const base=await live(root,save,{if1:false}),now=await live(root,save,{if1:true});
    same(now.trace,base.trace,`${f}: wake triggers + offered routes identical`);
    assert.equal(now.money,base.money,`${f}: economy identical`);assert.equal(now.day,base.day);
    assert.equal(now.save,base.save,`${f}: the full save after 6 nights is byte-identical with IF-1 present and all fragment flags OFF`);
    same(now.handlers,base.handlers,`${f}: WAKE handler roster identical (except IF-1's own inert handlers)`);
    assert(!JSON.parse(now.save).frag,`${f}: IF-1 wrote nothing into the save`);
    plays+=now.trace.filter(t=>t[0]==='offer').length;
  }
  // accepted NEW OGA path, differential: M1 → M2 → M3 outcomes and the ledger's view of them
  {const {loadBtf,drive}=await import(pathToFileURL(path.join(root,'tools','pilot','headless.mjs')).href);
   const run=async if1=>{const ctx=await loadBtf(root,{if1});ctx.RAState.patch('life.world.day',9);ctx.RAState.patch('life.ownership.cars',[{id:'toyota_supra_mk4_001',ownershipStatus:'owned'}]);
    const out=[];ctx.RALife.setFlag('a08Done',true);
    out.push(JSON.stringify(ctx.RANewOga.completeM1('SWITCH_THE_BAG')));out.push(JSON.stringify(ctx.RANewOga.answerM2('honest')));out.push(JSON.stringify(ctx.RANewOga.workOffM2()));out.push(JSON.stringify(ctx.RANewOga.completeM3('complete')));
    return {out,save:normalize(ctx.RAState.get()),features:ctx.RAFeatures?.snapshot?.()};};
   const a=await run(false),b=await run(true);same(b.out,a.out,'NEW OGA M1–M3 results identical');assert.equal(b.save,a.save,'NEW OGA save identical');}
  // with IF-1 present every fragment flag is OFF and nothing is enabled
  {const ctx=await full(root);
   assert.equal(Object.entries(ctx.RAFeatures.snapshot()).some(([k,v])=>v&&!(k in (ctx.RAFlagDefaults||{}))),false);assert(Object.values(ctx.RAFeatures.snapshot()).every(v=>v===false),'every registered flag is OFF by default');
   assert.equal(ctx.RAState.version,16,'schema is still the accepted v16');assert.equal(ctx.RAIF1.selfCheck().ok,true,'IF-1 self-check');assert.equal(ctx.RAIF1.selfCheck().fragmentFlagsOn.length,0);}
  console.log(`PASS IF-1 zero-behavior-change (${files.length} lives × 6 nights, ${plays} route plays: byte-identical saves/traces/wake rosters with IF-1 present + all flags OFF; NEW OGA M1–M3 identical)`);
}
