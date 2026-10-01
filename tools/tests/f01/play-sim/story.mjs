// Player-facing transcript + plain-prose digest helpers.
export const SECS=['PITCH','CAR','SLIDE-IN','BEATS','CALLS','GETAWAY','TRUNK','HIT ONE MORE','REPORT','MORNING AFTER','NEXT TEMPTATION'];
export function transcript(r){
 const out=[];let last=null;
 for(const s of r.script){
  const sec=s.sec;const tag=sec===last?' '.repeat(sec.length+2):`${sec}  `;
  const lines=String(s.line).split('\n');
  lines.forEach((ln,i)=>out.push((i===0?tag:' '.repeat(sec.length+2))+ln));
  last=sec;
 }
 return out.join('\n');
}
export function interest(r){
 const fam=new Set(r.mem.map(family));
 return r.memW+3*fam.size+(r.reversal?4:0)+(r.klass==='CLEAN'?0:2)+(r.callLog?.some(c=>c.choice!=='DEFAULT'&&Math.abs(c.realized)>=2)?3:0);
}
export function family(id){
 return id.replace(/^nerve:[a-z_0-9]+:lost$/,'nerve:lost').replace(/^chain:.*/,'chain').replace(/^greed:fail:\d/,'greed:fail').replace(/^call:(pay|talk|sneak|save)(:.*)?$/,'call:$1').replace(/^car:crash:.*/,'car:crash');
}
const LABEL={CLEAN:'a clean win',MESSY:'a win with a story',COSTLY:'a win that cost them',FOLDED:'a fold — they walked away with something',GREED:'a HIT ONE MORE that went wrong',ROBBED:'a getaway that got jugged',WASH:'a wash'};
export function prose(r){
 const top=[...r.moments].sort((a,b)=>b.w-a.w).slice(0,3).map(m=>m.t.replace(/ — [A-Z' &.]+$/,''));
 const crew=r.crew.map(id=>id).join(', ');
 const loss=(r.losses||[]).filter(l=>l.kind!=='WOUNDED'&&l.kind!=='CRASH'&&l.kind!=='SPLIT').map(l=>l.text);
 const bits=[`${r.jobName} (${r.policy}, seed ${r.seed}, ${r.car}, ${r.approach}) ended as ${LABEL[r.klass]||r.klass}.`];
 if(top.length)bits.push(top.join('; ')+'.');
 if(loss.length)bits.push(loss.slice(0,2).join('; ')+'.');
 if(r.kicker&&(r.kicker.rar!=='COMMON'))bits.push(`The kicker was ${r.kicker.name}.`);
 if(r.greedFail)bits.push('The player took HIT ONE MORE and lost the pot.');
 return bits.join(' ').replace(/\.{2,}/g,'.').replace(/\.\s+\./g,'.');
}
