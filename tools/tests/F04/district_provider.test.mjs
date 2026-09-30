// F04 x F03 district-provider contract (DeepSeek provider-contract audit, finding 1): F03 OWNS KOREATOWN; F04 CONSUMES it and never redefines it.
// Before the fix F04 called RADistricts.define('koreatown'), which threw "already defined by F03" and aborted the loop, so arts_district and
// inglewood never registered. This suite pins the fix in every load order.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {loadWar,F03_PROVIDER} from './_lib.mjs';

const quiet=async fn=>{const errs=[];const orig=console.error;console.error=(...a)=>errs.push(a.map(String).join(' '));try{return {out:await fn(),errs};}finally{console.error=orig;}};

export async function test(root){
 // 1. F03 loads first (production order): Koreatown is F03's; F04 registers its own two; nothing throws or logs
 {const {out:ctx,errs}=await quiet(()=>loadWar(root));
  assert.deepEqual(errs,[],'no console errors while loading F03 then F04');
  const own=id=>ctx.RADistricts.get(id)?.fragment;
  assert.equal(own('koreatown'),'F03');assert.equal(own('arts_district'),'F04');assert.equal(own('inglewood'),'F04');
  assert.deepEqual([...ctx.RADistricts.ids()].filter(i=>['koreatown','arts_district','inglewood'].includes(i)).sort(),['arts_district','inglewood','koreatown']);
  const prov=ctx.RAWarRoomDistricts.provider();
  assert.deepEqual(JSON.parse(JSON.stringify(prov.consumed)),['koreatown']);assert.equal(prov.missing.length,0);assert.equal(prov.errors.length,0);
  assert.deepEqual(JSON.parse(JSON.stringify(prov.owned)),{koreatown:'F03',arts_district:'F04',inglewood:'F04'});
  // ids are unique in the shared service (no duplicate district state)
  assert.equal(new Set(ctx.RADistricts.list().map(d=>d.id)).size,ctx.RADistricts.list().length);
  // the strategic weights are F04's own data and work although F03's definition carries no meta
  assert.equal(ctx.RADistricts.get('koreatown').meta.demandBase,undefined,'F03 definition has no F04 meta');
  assert.equal(ctx.RAWarRoomDistricts.demand('koreatown'),3,'Koreatown demand comes from the F04 overlay');
  assert.equal(ctx.RAWarRoomDistricts.strategic('arts_district').heatBase,3);
  // F04 may not redefine it: the shared service still refuses
  assert.throws(()=>ctx.RADistricts.define({id:'koreatown',fragment:'F04',label:'KOREATOWN'}),/already defined by F03/);
  // a district F03 controls (M10 grant) is read, never re-set, by F04
  ctx.RADistricts.setControl('koreatown','CONTROLLED',{holder:'rich',reason:'new_oga:m10'});
  assert.equal(ctx.RAWarRoomDistricts.snapshot().koreatown.holder,'rich');
  assert.equal(ctx.RADistricts.list().filter(d=>d.id==='koreatown').length,1);}

 // 2. F03 absent from the build: F04 must NOT invent Koreatown; the rest still registers; the War Room skips the missing district
 {const {out:ctx,errs}=await quiet(()=>loadWar(root,{f03:false}));
  assert.deepEqual(errs,[],'F04 alone loads cleanly');
  assert.equal(ctx.RADistricts.get('koreatown'),null,'F04 never defines Koreatown');
  assert.equal(ctx.RADistricts.get('arts_district').fragment,'F04');assert.equal(ctx.RADistricts.get('inglewood').fragment,'F04');
  const prov=ctx.RAWarRoomDistricts.provider();
  assert.deepEqual(JSON.parse(JSON.stringify(prov.missing)),[{id:'koreatown',code:'PROVIDER_MISSING',owner:'F03'}]);
  assert.deepEqual([...ctx.RAWarRoomDistricts.activeIds()],['arts_district','inglewood']);
  ctx.RAFrag.patch('F04','active',true);
  assert.ok(ctx.RAWarRoomJobs.buildNightMenu().every(j=>j.district!=='koreatown'),'no job is offered in a district nobody defined');
  for(let i=0;i<5;i++)ctx.RAWarRoomDistricts.tickPressure('inglewood'); // flip works
  assert.equal(ctx.RADistricts.get('inglewood').holder,'rival');
  // hand back falls back to a usable district, never an undefined one
  ctx.RAFrag.patch('F04','offer.status','accepted');
  assert.notEqual(ctx.RAWarRoomJobs.buildHandBackJob().district,'koreatown');}

 // 3. F03 loads AFTER F04 (out-of-order build): F04 left the id free, so F03's own tolerant define succeeds and F04 picks it up
 {const {out:ctx,errs}=await quiet(()=>loadWar(root,{f03:false}));
  assert.equal(ctx.RAWarRoomDistricts.usable('koreatown'),false);
  vm.runInContext(F03_PROVIDER,ctx);
  assert.equal(ctx.RADistricts.get('koreatown').fragment,'F03');
  assert.equal(ctx.RAWarRoomDistricts.usable('koreatown'),true,'consumed as soon as the owner defines it');
  assert.deepEqual([...ctx.RAWarRoomDistricts.activeIds()],['koreatown','arts_district','inglewood']);
  assert.deepEqual(errs,[]);}

 // 4. isolation: one failing define cannot stop the others (the original defect was exactly this abort)
 {const ctx=await loadWar(root,{flagOn:false,f03:false});
  assert.ok(ctx.RADistricts.get('arts_district')&&ctx.RADistricts.get('inglewood'));}

 // 5. static guard: F04 source never calls define for koreatown
 {const src=(await readFile(path.join(root,'js/frag/F04/districts.js'),'utf8')).split('\n').map(l=>l.replace(/\/\/.*$/,'')).join('\n');
  const defines=[...src.matchAll(/RADistricts\.define\(([^)]*)\)/g)].map(m=>m[1]);
  assert.ok(defines.length>=1&&defines.every(d=>!/koreatown/i.test(d)),'F04 districts.js must not define koreatown');
  assert.ok(!/id:\s*'koreatown'[^}]*fragment:\s*'F04'/.test(src));}

 console.log('PASS F04/F03 district-provider contract (Koreatown F03-owned and consumed, never redefined; arts_district + inglewood register in every load order; F03 absent degrades without inventing; no duplicate district state)');
}
