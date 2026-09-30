import {runPlay as oldRun} from './sim_v1.mjs';
import {runPlay as newRun} from './driver.mjs';
import {JOBS} from './content.mjs';
import {POLICY_NAMES} from './policy.mjs';
let bad=0,n=0,first=null;
for(let ji=0;ji<JOBS.length;ji++)for(const pol of POLICY_NAMES)for(let k=1;k<=20;k++){
 const cfg={seed:ji*1000+k,job:JOBS[ji],policy:pol};
 const a=oldRun(cfg),b=newRun(cfg);n++;
 const sig=r=>JSON.stringify([r.klass,r.final,r.mem,r.memW,r.losses.map(l=>l.kind+l.who),r.calls.surfaced,r.steps,r.getaway,r.script.filter(s=>s.sec!=="CALLS").map(s=>s.line)]);const ka=sig(a),kb=sig(b);
 if(ka!==kb){bad++;if(!first)first={cfg:[JOBS[ji].id,pol,k],a:a.klass+' '+a.final,b:b.klass+' '+b.final};}
}
console.log('compared',n,'mismatches',bad,first||'');
