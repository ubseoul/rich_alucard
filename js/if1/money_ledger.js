(function(){
 'use strict';
 // RAMoneyLedger — IF-1 (4E). Records every mutation of Rich's money with a SOURCE TAG so later analysis can separate
 // NEW OGA, TRAP, War Room and other authored income/expense. It observes; it never changes an amount or the economy.
 //
 // How mutations are seen: RAStateWatch reports every change of life.resources.money whichever accepted path caused it
 // (RALife.addMoney/spend, RABudget, acquisitions, dev tools). The source comes from the ambient tag:
 //   RAMoneyLedger.withSource('trap:sale',()=>…)  explicit (new fragments)
 //   the active adventure id                       'adventure:<ID>'   (accepted content, no edits needed)
 //   otherwise                                     'untagged'
 // Families group tags for analysis: 'new_oga:m3' and 'adventure:NEW_OGA_M3' both roll up to family 'new_oga'.
 // The buffer is in memory (last MAX entries + running totals). With flag if1.ledger_persist ON the totals and the last
 // PERSIST_MAX entries are mirrored to save.frag.if1.ledger; OFF (default) the save is untouched.
 const MAX=500,PERSIST_MAX=100;
 const F=window.RAFeatures;F?.register({id:'if1.ledger_persist',fragment:'if1',persist:true,description:'Mirror the money ledger totals into the save (save.frag.if1.ledger)'});
 const stack=[],entries=[],totals={};let seq=0,writing=false;
 const FAMILY_RULES=[[/^new_oga(:|$)/,'new_oga'],[/^adventure:NEW_OGA/,'new_oga'],[/^trap(:|$)/,'trap'],[/^war_room(:|$)/,'war_room'],[/^rainmaker(:|$)/,'rainmaker']];
 const balance=()=>Number(window.RAState.get().life.resources.money)||0;
 const today=()=>{try{return window.RALife.today().day;}catch(e){return null;}};
 function familyOf(source){for(const [rule,family] of FAMILY_RULES)if(rule.test(source))return family;return String(source).split(':')[0]||'untagged';}
 function registerFamily(pattern,family){if(!(pattern instanceof RegExp)||!family)throw new Error('registerFamily(RegExp,family)');FAMILY_RULES.unshift([pattern,String(family)]);}
 function ambientSource(){if(stack.length)return stack.at(-1).tag;const id=window.RAAdventures?.active?.()?.id;return id?`adventure:${id}`:'untagged';}
 function withSource(tag,fn,{memo=null}={}){
  stack.push({tag:String(tag),memo});let popped=false;const pop=()=>{if(!popped){popped=true;stack.pop();}};
  try{const result=fn();if(result&&typeof result.then==='function')return result.finally(pop);pop();return result;}catch(e){pop();throw e;}
 }
 function record({delta,source=null,memo=null,via='service'}){
  if(!Number.isFinite(delta)||delta===0)return null;
  const tag=source||ambientSource();if(memo===null&&stack.length)memo=stack.at(-1).memo;
  const entry={seq:++seq,day:today(),delta:Math.round(delta),balance:balance(),source:tag,family:familyOf(tag),via};if(memo)entry.memo=String(memo);
  entries.push(entry);if(entries.length>MAX)entries.shift();
  const t=totals[tag]||(totals[tag]={in:0,out:0,net:0,count:0});if(entry.delta>0)t.in+=entry.delta;else t.out+=-entry.delta;t.net+=entry.delta;t.count++;
  persist();return {...entry};
 }
 function persist(){
  if(writing||!F?.enabled('if1.ledger_persist'))return;
  writing=true;try{window.RAFrag.patch('if1','ledger',{totals:JSON.parse(JSON.stringify(totals)),recent:entries.slice(-PERSIST_MAX),seq});}catch(e){console.error('ledger persist',e);}finally{writing=false;}
 }
 function restore(){
  if(!F?.enabled('if1.ledger_persist'))return false;
  const saved=window.RAFrag?.read('if1','ledger',null);if(!saved)return false;
  for(const [k,v] of Object.entries(saved.totals||{}))totals[k]={in:v.in||0,out:v.out||0,net:v.net||0,count:v.count||0};
  entries.splice(0,entries.length,...(saved.recent||[]));seq=Number(saved.seq)||entries.length;return true;
 }
 // Explicit, tagged mutations for new fragments (these call the accepted RALife API; the watcher records them).
 const credit=(amount,{source,memo=null}={})=>withSource(source||'untagged',()=>window.RALife.addMoney(Math.abs(Number(amount)||0)),{memo});
 const debit=(amount,{source,memo=null}={})=>withSource(source||'untagged',()=>window.RALife.spend(Math.abs(Number(amount)||0)),{memo});
 const query=({source=null,family=null,fromSeq=0}={})=>entries.filter(e=>e.seq>fromSeq&&(!source||e.source===source||e.source.startsWith(`${source}:`))&&(!family||e.family===family)).map(e=>({...e}));
 function byFamily(){const out={};for(const [tag,t] of Object.entries(totals)){const f=familyOf(tag),o=out[f]||(out[f]={in:0,out:0,net:0,count:0});o.in+=t.in;o.out+=t.out;o.net+=t.net;o.count+=t.count;}return out;}
 function reset(){entries.length=0;for(const k of Object.keys(totals))delete totals[k];seq=0;}
 window.RAStateWatch?.watch('if1.money',s=>s.life?.resources?.money,(next,prev,{via})=>{record({delta:next-prev,via});});
 restore();
 window.RAMoneyLedger={withSource,record,credit,debit,entries:()=>entries.map(e=>({...e})),query,totals:()=>JSON.parse(JSON.stringify(totals)),byFamily,familyOf,registerFamily,sources:()=>Object.keys(totals).sort(),reset,restore,balance,current:ambientSource};
})();
