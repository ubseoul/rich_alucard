// Headless feel-lock run: one PLAY through the shared engine, with the live feed built from the engine's own events exactly as the browser does.
import './globals.mjs';
import * as E from '../../../../js/frag/F01/play/engine.mjs';
import * as C from '../../../../js/frag/F01/play/content.mjs';
import {createFeed} from '../../../../js/frag/F01/play/feed.mjs';
import {makeDriver} from './driver.mjs';
export function runFeel(cfg,{policy='careful',driverOpts={},plan={},settings={},timeoutAll=false,timeoutAt=null,answers=null}={}){
 const drv=makeDriver(policy,driverOpts);const evs=[];E.setSink((t,d)=>evs.push({t,d}));
 const g=E.playGen({...cfg,policy});let feed=null,ans,r,steps=[],calls=[],prompts=[],bundles=[];let ci=0,Pref=null;
 const crewOf=P=>P.crew;
 const handle=(list,P)=>{
  for(const e of list){const d=e.d;
   if(e.t==='SLIDE'){feed=createFeed({seed:cfg.seed,job:cfg.job,crew:P.crew,roster:P.roster,recent:(cfg.state&&cfg.state.recent)||[],plan});}
   else if(e.t==='BEAT'){const nx=list[list.indexOf(e)+1];steps.push(...feed.beat(d,{endKind:nx&&nx.t==='END'&&nx.d.kind==='WASH'?'WASH':null}));}
   else if(e.t==='OBA'){steps.push(...feed.oba(d));}
   else if(e.t==='GETAWAY'){steps.push(...feed.getaway(d));}
   else if(e.t==='END'){if(d.kind!=='OBA')steps.push(...feed.end(d));}
   else if(e.t==='REPORT'){if(!feed.quiet)steps.push(...feed.out(d));}
  }};
 try{for(;;){r=g.next(ans);const list=evs.splice(0);handle(list,Pref);if(r.done)break;
   const pr=r.value;
   if(pr.type==='CAR'){Pref=pr.P;ans=drv(pr);prompts.push('CAR');}
   else if(pr.type==='CALL'){const view=feed?feed.call(pr,{moreTime:settings.moreTime}):null;calls.push(view);const raw=drv(pr);ans=(timeoutAll||(timeoutAt!=null&&ci===timeoutAt))?'TIMEOUT':raw;ci++;prompts.push('CALL');}
   else if(pr.type==='CLIMB'){const view=feed.climb(pr.info,{moreTime:settings.moreTime});calls.push(view);const raw=drv(pr);ans=timeoutAll?'TIMEOUT':raw;prompts.push('CLIMB');}
   else{ans=drv(pr);prompts.push(pr.type);}
  }}finally{E.setSink(null);}
 return {rec:r.value,steps,calls,feed,prompts};
}
