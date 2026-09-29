// F14-A harness self-test — deterministic reproduction + failure bundle generation + leak guard.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createBundle,writeBundle,fingerprint,redactText,scanForSealed,bundleName} from '../../f14/bundle.mjs';
import {tmpDir,rm} from './_lib.mjs';

const baseInput=()=>({
  commit:'101a394b5fa9c41ec089bc7022ee86ff43f5f31c',branch:'frag/f14-fcpb-qa-harness/001',releaseId:'ra-test',
  route:'F01.showdown.success',fragment:'F01',failureKind:'ASSERTION',failedAssertion:{message:'expected rank 5',actual:4},
  seed:7,viewport:{id:'mobile-390',width:390,height:844},featureFlags:{'F01.showdown':true},day:12,
  state:{life:{world:{day:12},resources:{money:1000}}},saveSnapshot:{life:{world:{day:12}}},
  consoleErrors:[],pageErrors:[],network404:[],unhandledRejections:[],
  screenshots:['001-before.png'],routeHistory:[{phase:'run',action:'choose'}]
});

export async function test(root){
  const a=createBundle(baseInput());
  for(const key of ['commit','branch','releaseId','route','fragment','failureKind','failedAssertion','seed','viewport','featureFlags','day','state','saveSnapshot','consoleErrors','pageErrors','network404','unhandledRejections','screenshots','routeHistory','fingerprint'])
    assert(key in a,`bundle is missing ${key}`);
  assert.equal(a.failureKind,'ASSERTION');
  // ---- deterministic: same inputs (different wall clock) => same fingerprint
  const b=createBundle({...baseInput(),createdAt:'2000-01-01T00:00:00.000Z'});
  const c=createBundle({...baseInput(),createdAt:'2030-06-06T06:06:06.000Z'});
  assert.equal(b.fingerprint,c.fingerprint,'fingerprint must ignore volatile timestamps');
  assert.equal(fingerprint({...baseInput(),createdAt:'x',at:'y'}),fingerprint({...baseInput(),createdAt:'z',at:'w'}),'fingerprint ignores volatile keys');
  assert.equal(bundleName(b),bundleName(c),'bundle name is deterministic');
  // different inputs => different fingerprint
  assert.notEqual(createBundle({...baseInput(),seed:8}).fingerprint,b.fingerprint);
  // ---- redaction + leak guard (never echo the matched text)
  const deny={literals:['SEALED-SECRET'],regex:['SECRET-TOKEN-\\d+']};
  assert.equal(redactText('value SEALED-SECRET and SECRET-TOKEN-42 end',deny),'value [REDACTED] and [REDACTED] end');
  const hits=scanForSealed({note:'has SEALED-SECRET',list:['SECRET-TOKEN-9']},deny);
  assert.equal(hits.length,2);assert(hits.every(h=>/^literal#|^regex#/.test(h.rule)));
  assert(!JSON.stringify(hits).includes('SEALED-SECRET'),'scan must never echo the matched text');
  // ---- write a bundle; a planted secret is redacted and never written
  const tmp=await tmpDir('raf14bundle-');
  try{
    const withSecret=createBundle({...baseInput(),notes:['diagnostic SEALED-SECRET line']});
    const written=await writeBundle(tmp,withSecret,{denylist:deny});
    assert(written.file.endsWith('.json'));
    const text=await readFile(written.file,'utf8');
    assert(!text.includes('SEALED-SECRET'),'written bundle must not contain the sealed literal');
    assert(text.includes('[REDACTED]'));
    const parsed=JSON.parse(text);
    assert.equal(parsed.fingerprint,written.fingerprint);
    assert.deepEqual(parsed.routeHistory,a.routeHistory);
    assert.equal(parsed.saveSnapshot.life.world.day,12);
    // a denylist that still matches after redaction must REFUSE to write
    await assert.rejects(()=>writeBundle(tmp,createBundle({...baseInput(),notes:['SEALED-SECRET']}),{denylist:{literals:['SEALED-SECRET'],regex:['REDACTED']}}),/refusing to write bundle/);
  }finally{await rm(tmp,{recursive:true,force:true});}
  console.log('PASS f14 reproduction bundles (deterministic fingerprint, required fields, redaction + write guard)');
}
