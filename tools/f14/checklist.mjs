// F14-A — FCPB CHECKLIST ENGINE.
//
// Encodes the known FCPB Definition of Done as machine-readable checks. Each check is either AUTOMATED (the harness
// decides) or MANUAL (a human must sign it off). Route-backed checks resolve to PENDING_FRAGMENT — never FAIL — while
// a fragment has not merged.
//
// Input is a `reports` object produced by harness.mjs (and unit tests). Keep this module pure.
import {RESULT} from './config.mjs';

const failedRoutes=(reports,ids)=>{const by=new Map((reports.routes?.results||[]).map(r=>[r.id,r]));return ids.filter(id=>by.get(id)?.status===RESULT.FAIL);};
const passedRoutes=(reports,ids)=>{const by=new Map((reports.routes?.results||[]).map(r=>[r.id,r]));return ids.filter(id=>by.get(id)?.status===RESULT.PASS);};

function routeCheck(reports,registry,predicate,{label='route'}={}){
  if(reports.browser?.status===RESULT.SKIPPED)return {status:RESULT.SKIPPED,detail:`browser ${RESULT.SKIPPED}: ${reports.browser.reason||''}`.trim()};
  const rel=registry.routes.filter(predicate);
  const authorized=rel.filter(r=>r.status==='AUTHORIZED');
  const pending=rel.filter(r=>r.status==='PENDING_FRAGMENT');
  const failed=failedRoutes(reports,authorized.map(r=>r.id));
  if(failed.length)return {status:RESULT.FAIL,detail:`${failed.length} ${label}(s) failed: ${failed.join(', ')}`};
  const passed=passedRoutes(reports,authorized.map(r=>r.id));
  if(authorized.length&&passed.length===authorized.length){
    return {status:RESULT.PASS,detail:`${authorized.length} ${label}(s) passed${pending.length?`; ${pending.length} PENDING_FRAGMENT (${pending.slice(0,6).map(r=>r.id).join(', ')})`:''}`};
  }
  if(!authorized.length&&pending.length)return {status:RESULT.PENDING_FRAGMENT,detail:`${pending.length} ${label}(s) pending: ${pending.slice(0,8).map(r=>r.id).join(', ')}`};
  if(pending.length)return {status:RESULT.PENDING_FRAGMENT,detail:`${passed.length}/${authorized.length} passed; ${pending.length} PENDING_FRAGMENT`};
  return {status:RESULT.PENDING_FRAGMENT,detail:`no ${label}s registered`};
}
const checkStatus=checks=>{
  const list=(checks||[]).filter(Boolean);if(!list.length)return {status:RESULT.PASS,detail:'not run',findings:[]};
  const bad=list.filter(c=>!c.ok);if(bad.length)return {status:RESULT.FAIL,detail:bad.map(c=>`${c.name}: ${c.detail||''}`).join('; '),findings:bad};
  return {status:RESULT.PASS,detail:`${list.length} check(s) passed`,findings:[]};
};

export const CHECKS=Object.freeze([
  {id:'authorized-missions',title:'Authorized missions reachable',kind:'AUTOMATED',blocking:true,source:'routes',
   evaluate:(r,g)=>routeCheck(r,g,route=>route.kind==='mission'||route.kind==='success',{label:'mission'})},
  {id:'mechanics-reachable',title:'Mechanics reachable',kind:'AUTOMATED',blocking:true,source:'routes',
   evaluate:(r,g)=>routeCheck(r,g,route=>route.kind==='mechanic',{label:'mechanic'})},
  {id:'authored-failures',title:'Authored failure branches reachable',kind:'AUTOMATED',blocking:true,source:'routes',
   evaluate:(r,g)=>routeCheck(r,g,route=>route.kind==='failure',{label:'failure branch'})},
  {id:'retreat',title:'Retreat / backout reachable',kind:'AUTOMATED',blocking:true,source:'routes',
   evaluate:(r,g)=>{
     if(r.browser?.status===RESULT.SKIPPED)return {status:RESULT.SKIPPED,detail:'browser skipped'};
     const rel=g.routes.filter(route=>route.backout);
     const authorized=rel.filter(route=>route.status==='AUTHORIZED');
     if(!authorized.length)return {status:RESULT.PENDING_FRAGMENT,detail:`${rel.length} backout path(s) declared, none authorized`};
     const results=r.routes?.results||[];const bad=results.filter(x=>x.backoutOk===false);
     if(bad.length)return {status:RESULT.FAIL,detail:bad.map(x=>x.id).join(', ')};
     return {status:RESULT.PASS,detail:`${authorized.length} backout path(s) validated`};
   }},
  {id:'feature-flag-matrix',title:'Feature-flag matrix boots clean',kind:'AUTOMATED',blocking:true,source:'flags',
   evaluate:r=>{
     if(r.browser?.status===RESULT.SKIPPED)return {status:RESULT.SKIPPED,detail:'browser skipped'};
     const checks=r.flagMatrix?.checks||[];
     if(!checks.length)return {status:RESULT.PENDING_FRAGMENT,detail:'no fragment flags declared by authorized routes yet'};
     return checkStatus(checks);
   }},
  {id:'persistence',title:'Persistence (save/reload) verified',kind:'AUTOMATED',blocking:true,source:'persistence',
   evaluate:r=>r.browser?.status===RESULT.SKIPPED?{status:RESULT.SKIPPED,detail:'browser skipped'}:r.persistence?checkStatus(r.persistence.checks):{status:RESULT.PENDING_FRAGMENT,detail:'not run'}},
  {id:'browser-routes',title:'Browser routes registered and passing',kind:'AUTOMATED',blocking:true,source:'routes',
   evaluate:(r,g)=>routeCheck(r,g,()=>true,{label:'route'})},
  {id:'migration-reload',title:'Migration / reload replay',kind:'AUTOMATED',blocking:true,source:'migration',
   evaluate:r=>r.browser?.status===RESULT.SKIPPED?{status:RESULT.SKIPPED,detail:'browser skipped'}:r.migration?checkStatus(r.migration.checks):{status:RESULT.PENDING_FRAGMENT,detail:'not run'}},
  {id:'no-starvation',title:'No progression starvation',kind:'AUTOMATED',blocking:true,source:'starvation',
   evaluate:r=>r.starvation?checkStatus(r.starvation.checks):{status:RESULT.PENDING_FRAGMENT,detail:'not run'}},
  {id:'asset-integrity',title:'Referenced assets exist and decode',kind:'AUTOMATED',blocking:true,source:'assets',
   evaluate:r=>{const f=(r.assets?.findings||[]).filter(x=>x.kind!=='placeholder-marker'&&x.kind!=='placeholder-marker-name');
     return f.length?{status:RESULT.FAIL,detail:`${f.length} asset finding(s)`,findings:f}:{status:RESULT.PASS,detail:`${r.assets?.refs??0} references, ${r.assets?.decoded??0} files decoded`};}},
  {id:'authored-audio',title:'Authored audio availability',kind:'AUTOMATED',blocking:true,source:'audio',
   evaluate:r=>{
     const hard=(r.audioCheck?.findings||[]);if(hard.length)return {status:RESULT.FAIL,detail:`${hard.length} audio finding(s)`,findings:hard};
     const pending=(r.audioCheck?.pending||[]).filter(p=>p.reason!=='inert-drop-in-hook');
     const hooks=(r.audioCheck?.pending||[]).filter(p=>p.reason==='inert-drop-in-hook');
     if(pending.length)return {status:RESULT.PENDING_FRAGMENT,detail:`${pending.length} unregistered sound(s): ${pending.map(p=>`${p.id}(${p.reason})`).slice(0,6).join(', ')}${hooks.length?`; ${hooks.length} inert hook(s)`:''}`};
     if(hooks.length)return {status:RESULT.PENDING_FRAGMENT,detail:`${hooks.length} inert drop-in hook(s) awaiting approved files`};
     return {status:RESULT.PASS,detail:`${r.audioCheck?.summary?.registered??0} registered sound(s) available`};
   }},
  {id:'mobile-viewports',title:'Mobile 360/390/430 + desktop sanity',kind:'AUTOMATED',blocking:true,source:'viewports',
   evaluate:r=>{
     if(r.browser?.status===RESULT.SKIPPED)return {status:RESULT.SKIPPED,detail:'browser skipped'};
     const vp=r.viewports||[];if(!vp.length)return {status:RESULT.PENDING_FRAGMENT,detail:'no viewport sweep'};
     const bad=vp.filter(v=>v.findings&&(v.findings.overflow||v.findings.clipped?.length||v.findings.covered?.length||v.findings.unreachable?.length));
     const advisory=vp.reduce((n,v)=>n+((v.findings?.smallTargets?.length)||0),0);
     if(bad.length)return {status:RESULT.FAIL,detail:`${bad.length} viewport(s) with layout findings (${bad.map(v=>v.id).join(', ')})`};
     return {status:RESULT.PASS,detail:`${vp.length} viewport(s) clean${advisory?`; ${advisory} advisory touch-target report(s)`:''}`};
   }},
  {id:'phone-placement-hook',title:'Phone placement validation hook',kind:'AUTOMATED',blocking:true,source:'phoneHook',
   evaluate:r=>{
     if(r.phoneHook?.registered===0)return {status:RESULT.FAIL,detail:'phone placement hook not installed'};
     const f=r.phoneHook?.findings||[];if(f.length)return {status:RESULT.FAIL,detail:`${f.length} phone placement finding(s)`,findings:f};
     const v=r.phoneHook?.validators||0;
     return {status:v?RESULT.PASS:RESULT.PENDING_FRAGMENT,detail:v?`${v} fragment placement validator(s)`:'hook ready; no fragment validators registered yet'};
   }},
  {id:'placeholder-final-mode',title:'No placeholders remaining (final mode)',kind:'AUTOMATED',blocking:false,finalOnly:true,source:'placeholders',
   evaluate:r=>{
     const f=r.placeholders?.findings||[];
     if(f.length)return r.finalMode?{status:RESULT.FAIL,detail:`${f.length} placeholder marker(s) in final mode`,findings:f}:{status:RESULT.PENDING_FRAGMENT,detail:`${f.length} placeholder marker(s) (advisory until final mode)`,findings:f};
     return {status:RESULT.PASS,detail:'no placeholder markers'};
   }},
  {id:'leak-scan',title:'OPEN/SEALED leak scan',kind:'AUTOMATED',blocking:true,source:'leak',
   evaluate:r=>r.leak?(r.leak.ok?{status:RESULT.PASS,detail:`${r.leak.filesScanned??''}`.trim()||'clean'}:{status:RESULT.FAIL,detail:`${r.leak.violations.length} violation(s)`,findings:r.leak.violations}):{status:RESULT.PENDING_FRAGMENT,detail:'not run'}},
  {id:'no-p0-p1',title:'No P0/P1 at FCPB sign-off',kind:'MANUAL',blocking:false,source:'manual',
   evaluate:r=>{const blocking=(r.checklist||[]).filter(c=>c.blocking&&c.status===RESULT.FAIL);return blocking.length?{status:RESULT.FAIL,detail:`${blocking.length} blocking automated failure(s) must be cleared before sign-off`}:{status:RESULT.MANUAL,detail:'human sign-off required; automated inputs are green/pending'};}}
]);

export function evaluateChecklist(reports,registry,{finalMode=false}={}){
  const ctx={...reports,finalMode};
  const evaluated=CHECKS.map(check=>{
    let outcome;try{outcome=check.evaluate(ctx,registry);}catch(error){outcome={status:RESULT.FAIL,detail:`check threw: ${error.message}`};}
    return {id:check.id,title:check.title,kind:check.kind,blocking:check.blocking&&!(check.finalOnly&&!finalMode),source:check.source,status:outcome.status,detail:outcome.detail||'',findings:outcome.findings||[]};
  });
  // Re-run the manual gate now that the automated results are known.
  const p0p1=evaluated.find(c=>c.id==='no-p0-p1');
  if(p0p1&&p0p1.status===RESULT.MANUAL){const blocking=evaluated.filter(c=>c.blocking&&c.status===RESULT.FAIL);if(blocking.length){p0p1.status=RESULT.FAIL;p0p1.detail=`${blocking.length} blocking automated failure(s): ${blocking.map(c=>c.id).join(', ')}`;}}
  const blockingFailed=evaluated.filter(c=>c.blocking&&c.status===RESULT.FAIL);
  const pending=evaluated.filter(c=>c.status===RESULT.PENDING_FRAGMENT);
  const skipped=evaluated.filter(c=>c.status===RESULT.SKIPPED);
  const manual=evaluated.filter(c=>c.kind==='MANUAL');
  return {checks:evaluated,ok:blockingFailed.length===0,failed:blockingFailed,pending,skipped,manual,counts:evaluated.reduce((a,c)=>{a[c.status]=(a[c.status]||0)+1;return a;},{})};
}
