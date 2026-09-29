// F14-A — DETERMINISTIC REPRODUCTION BUNDLES.
//
// For every FAILED run the harness writes a compact package: commit SHA, feature flags, seed, viewport, day/state, the
// relevant save snapshot, console/page/network errors, the failed assertion, screenshots and the route/action history.
//
// NO SEALED TEXT LEAKS. Bundle strings are redacted against an optional private denylist before they are written, and
// the writer scans its own output again. A violation is reported by RULE INDEX and JSON PATH only — never the text.
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {sha256,stableStringify,SCHEMA} from './config.mjs';

const VOLATILE=new Set(['createdAt','at','savedAt','runAt','generatedAt','builtAt','startedAt','endedAt','durationMs','elapsedMs','ms']);
export function stripVolatile(value){
  if(Array.isArray(value))return value.map(stripVolatile);
  if(value&&typeof value==='object'){const out={};for(const [k,v] of Object.entries(value))if(!VOLATILE.has(k))out[k]=stripVolatile(v);return out;}
  return value;
}
// A reproducible identity for the inputs of a run (ignores wall-clock/volatile fields).
export const fingerprint=input=>sha256(stableStringify(stripVolatile(input)));

// ---- redaction / leak guard --------------------------------------------------------------
function compile(denylist){
  if(!denylist)return null;
  return {literals:(denylist.literals||[]).map(s=>String(s).toLowerCase()),regex:(denylist.regex||[]).map(r=>new RegExp(r,'i'))};
}
export function redactText(text,denylist){
  let out=String(text);const deny=compile(denylist);if(!deny)return out;
  for(const lit of deny.literals)if(lit)out=out.replaceAll(new RegExp(lit.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),'[REDACTED]');
  for(const re of deny.regex)out=out.replace(re,'[REDACTED]');
  return out;
}
// Recursively redact strings. Returns a new value.
export function redact(value,denylist){
  if(typeof value==='string')return redactText(value,denylist);
  if(Array.isArray(value))return value.map(v=>redact(v,denylist));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,redact(v,denylist)]));
  return value;
}
// Scan an arbitrary structure for denylist hits. Reports kind+path+rule index ONLY (never the matched text).
export function scanForSealed(value,denylist,at='$',out=[]){
  const deny=compile(denylist);if(!deny)return out;
  if(typeof value==='string'){
    const lower=value.toLowerCase();
    deny.literals.forEach((lit,i)=>{if(lit&&lower.includes(lit))out.push({rule:`literal#${i}`,path:at});});
    deny.regex.forEach((re,i)=>{if(re.test(value))out.push({rule:`regex#${i}`,path:at});});
    return out;
  }
  if(Array.isArray(value)){value.forEach((v,i)=>scanForSealed(v,denylist,`${at}[${i}]`,out));return out;}
  if(value&&typeof value==='object'){for(const [k,v] of Object.entries(value))scanForSealed(v,denylist,`${at}.${k}`,out);return out;}
  return out;
}

// ---- bundle -------------------------------------------------------------------------------
export function createBundle(input={}){
  const bundle={
    schema:SCHEMA,
    harness:'f14-fcpb-qa-harness',
    createdAt:input.createdAt||new Date().toISOString(),
    commit:input.commit||'unknown',
    branch:input.branch||'unknown',
    releaseId:input.releaseId||null,
    route:input.route||null,
    fragment:input.fragment||null,
    failureKind:input.failureKind||'ASSERTION',
    failedAssertion:input.failedAssertion||null,
    seed:input.seed??null,
    viewport:input.viewport||null,
    featureFlags:input.featureFlags||{},
    day:input.day??null,
    state:input.state??null,
    saveSnapshot:input.saveSnapshot??null,
    consoleErrors:input.consoleErrors||[],
    pageErrors:input.pageErrors||[],
    network404:input.network404||[],
    unhandledRejections:input.unhandledRejections||[],
    screenshots:input.screenshots||[],
    routeHistory:input.routeHistory||[],
    notes:input.notes||[]
  };
  bundle.fingerprint=fingerprint(bundle);
  return bundle;
}
export function bundleName(bundle){
  const parts=[bundle.route||'run',bundle.viewport?.id||bundle.viewport?.width||'viewport',(bundle.fingerprint||'nofp').slice(0,10)];
  return parts.map(p=>String(p).replace(/[^a-z0-9_.-]+/gi,'_')).join('.')+'.json';
}
// Write a bundle (redacted) plus a leak check. Returns {file,fingerprint,violations}. Throws if a sealed leak would
// survive redaction — never writing the offending text.
export async function writeBundle(dir,bundle,{denylist=null}={}){
  await mkdir(dir,{recursive:true});
  const safe=redact(bundle,denylist);
  const violations=scanForSealed(safe,denylist);
  if(violations.length)throw new Error(`refusing to write bundle with ${violations.length} sealed hit(s): ${violations.map(v=>`${v.rule}@${v.path}`).join(', ')}`);
  const file=path.join(dir,bundleName(safe));
  await writeFile(file,`${JSON.stringify(safe,null,1)}\n`);
  return {file,fingerprint:safe.fingerprint,violations};
}
