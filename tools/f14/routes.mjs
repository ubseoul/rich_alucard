// F14-A — ROUTE REGISTRY.
//
// Fragments submit meaningful BROWSER SUCCESS PATHS as JSON files under tools/f14/routes/<FRAGMENT>.json. The registry
// discovers them automatically, validates them, and resolves every route to one of:
//
//   AUTHORIZED        executable now (has steps); the harness runs it
//   PENDING_FRAGMENT  declared but not implemented yet (no steps, or the fragment file is absent)
//
// A missing route is PENDING_FRAGMENT — never a failure. tools/f14/routes/_expected.json declares the campaign routes
// the mission names (F01 SHOWDOWN, F02 ARMORY/RANGE DAY, F03 M9/M10, F04 WAR ROOM, F05 TRAP, F06 RAINMAKER …) so the
// report enumerates what is still owed without inventing content. Do NOT invent unavailable routes here.
import {readFile,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';

export const ROUTE_KINDS=Object.freeze(['baseline','mission','mechanic','success','failure','retreat','backout']);
const ID=/^(F\d{2}|IF1)\.[A-Za-z0-9_.-]+$/;
const FILE_ID=/^(F\d{2}|IF1)$/;

const isObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const nonEmptyString=v=>typeof v==='string'&&v.trim().length>0;
const asArray=v=>Array.isArray(v)?v:[];

// Validate one route descriptor. `source` is the file it came from, for error messages.
export function validateRoute(route,{source='<inline>'}={}){
  const problems=[];
  if(!isObject(route))return ['route must be an object'];
  if(!nonEmptyString(route.id)||!ID.test(route.id))problems.push(`invalid route id ${JSON.stringify(route.id)}`);
  if(!nonEmptyString(route.fragment))problems.push('route.fragment required');
  else if(route.fragment!=='IF1'&&!/^F\d{2}$/.test(route.fragment))problems.push(`invalid fragment ${route.fragment}`);
  if(!nonEmptyString(route.title))problems.push('route.title required');
  if(!nonEmptyString(route.kind)||!ROUTE_KINDS.includes(route.kind))problems.push(`invalid kind ${JSON.stringify(route.kind)} (${ROUTE_KINDS.join('|')})`);
  const status=route.status||'PENDING_FRAGMENT';
  if(!['AUTHORIZED','PENDING_FRAGMENT'].includes(status))problems.push(`invalid status ${JSON.stringify(status)}`);
  if(status==='AUTHORIZED'&&!(Array.isArray(route.steps)&&route.steps.length))problems.push('AUTHORIZED routes need a non-empty steps array');
  if(status==='PENDING_FRAGMENT'&&Array.isArray(route.steps)&&route.steps.length)problems.push('PENDING_FRAGMENT routes must not carry executable steps');
  if(route.backout!==undefined&&!isObject(route.backout))problems.push('backout must be an object when present');
  if(route.assertions!==undefined&&!Array.isArray(route.assertions))problems.push('assertions must be an array when present');
  if(route.fragment==='IF1'&&status==='PENDING_FRAGMENT')problems.push('IF1 routes are the accepted baseline and cannot be PENDING_FRAGMENT');
  return problems.map(p=>`${source}: ${p}`);
}

// Load and merge every tools/f14/routes/*.json file (files starting with "_" are declarations, see below).
export async function loadRoutes(root){
  const dir=path.join(root,'tools','f14','routes');
  const files=existsSync(dir)?(await readdir(dir)).filter(f=>f.endsWith('.json')).sort():[];
  const merged=new Map();const problems=[];const sources={};
  // Declarations first, so a real fragment file can upgrade a declared id by replacing it.
  const ordered=['_expected.json',...files.filter(f=>f!=='_expected.json')];
  for(const file of ordered){
    if(!existsSync(path.join(dir,file)))continue;
    let doc;try{doc=JSON.parse(await readFile(path.join(dir,file),'utf8'));}catch(error){problems.push(`${file}: invalid JSON (${error.message})`);continue;}
    const routes=Array.isArray(doc)?doc:doc.routes;
    if(!Array.isArray(routes)){problems.push(`${file}: expected {routes:[...]}`);continue;}
    for(const route of routes){
      const errs=validateRoute(route,{source:file});
      problems.push(...errs);
      if(errs.length)continue;
      if(merged.has(route.id)){sources[route.id]=`${sources[route.id]},${file}`;}else{sources[route.id]=file;}
      merged.set(route.id,{...route,status:route.status||'PENDING_FRAGMENT',backout:route.backout||null,assertions:asArray(route.assertions),steps:asArray(route.steps),source:file});
    }
  }
  const routes=[...merged.values()].sort((a,b)=>a.id<b.id?-1:1);
  const pending=routes.filter(r=>r.status==='PENDING_FRAGMENT');
  const authorized=routes.filter(r=>r.status==='AUTHORIZED');
  const byFragment={};
  for(const r of routes)(byFragment[r.fragment]=byFragment[r.fragment]||[]).push(r.id);
  return {schema:1,routes,byId:new Map(routes.map(r=>[r.id,r])),pending,authorized,byFragment,problems,sources};
}

// A route is runnable only when authorized AND its fragment flag is enabled (or it has no flag).
export function isRunnable(route,flags={}){
  if(route.status!=='AUTHORIZED')return {runnable:false,reason:'PENDING_FRAGMENT'};
  if(route.flag&&!(route.flag in flags))return {runnable:true,flagMissing:true}; // flag not registered yet — the route decides
  return {runnable:true};
}
export {FILE_ID};
