(function(){
 'use strict';
 // RAWakeBus — IF-1 (4C). Priority-ordered WAKE / NIGHT subscribers for future fragments.
 //
 // It WRAPS the accepted life clock (RAClock.onWake) instead of replacing it: one handler list, one sort, one pipeline,
 // so every accepted WAKE handler keeps exactly its priority and behavior. The bus adds what fragments need:
 //   * subscribe()            — flag-gated, id-unique, phase-checked, double-fire-guarded, uniquely-prioritised handlers
 //   * voiceNotes.define()    — mission voice notes through the accepted RAWakeTriggers arbiter (ONE per WAKE, by priority)
 //   * nightReport.contribute — the night-report slot: sections gathered in priority order at NIGHT
 //   * trace()/order()        — deterministic ordering + fire log for the contract tests
 // Phases: 'night' handlers run at sleep() BEFORE the day advances (priority < 0); 'wake' handlers run once per new
 // day (priority >= 0). Bands document where a fragment's work belongs.
 const BANDS=Object.freeze({NIGHT:[-999,-1],EARLY:[0,19],ECONOMY:[20,39],WORLD:[40,59],CONTENT:[60,79],NOTICES:[80,94],TAIL:[95,998]});
 // Mission voice notes: the accepted NEW OGA ladder occupies 85 (M1) … 78 (M7), descending one per mission. The owner
 // assigns the next free number; a fragment never invents one. 77..75 are reserved for the next missions.
 const VOICE_NOTE_BAND=Object.freeze([75,89]);
 const VOICE_NOTE_ASSIGNED=Object.freeze({NEW_OGA_M1:85,NEW_OGA_M2:84,NEW_OGA_M3:83,NEW_OGA_M4:82,NEW_OGA_ALTERNATIVE:81,NEW_OGA_M5:80,NEW_OGA_M6:79,NEW_OGA_M7:78});
 const clock=()=>window.RAClock,flags=()=>window.RAFeatures;
 const fired=new Map(),log=[];
 const isId=id=>typeof id==='string'&&/^[A-Za-z][A-Za-z0-9_.:-]*$/.test(id);
 const dayOf=ctx=>ctx?.info?.day??ctx?.night?.day??null;
 const info=()=>clock().handlerInfo?.()||clock().handlers().map(id=>({id,priority:null}));
 function bandOf(priority){return Object.entries(BANDS).find(([,[a,b]])=>priority>=a&&priority<=b)?.[0]||null;}
 function subscribe(spec){
  const {id,fragment,phase='wake',priority,fn,flag=null,repeatable=false,allowTie=false}=spec||{};
  if(!isId(id)||typeof fn!=='function'||!Number.isFinite(priority))throw new Error('RAWakeBus.subscribe: {id,priority,fn} required');
  if(!fragment)throw new Error(`RAWakeBus.subscribe(${id}): fragment required`);
  if(phase!=='wake'&&phase!=='night')throw new Error(`RAWakeBus.subscribe(${id}): phase must be wake|night`);
  if((phase==='night')!==(priority<0))throw new Error(`RAWakeBus.subscribe(${id}): night handlers need priority < 0 and wake handlers priority >= 0 (got ${priority})`);
  if(flag&&!flags()?.get(flag))throw new Error(`RAWakeBus.subscribe(${id}): flag ${flag} is not registered in RAFeatures`);
  const existing=info();
  if(existing.some(h=>h.id===id))throw new Error(`RAWakeBus.subscribe: handler id ${id} already registered`);
  const tie=existing.find(h=>h.priority===priority);
  if(tie&&!allowTie)throw new Error(`RAWakeBus.subscribe(${id}): priority ${priority} already used by ${tie.id}; a tie would make order depend on load order`);
  clock().onWake(id,priority,ctx=>{
   if(flag&&!flags().enabled(flag))return;
   const day=dayOf(ctx),key=`${phase}:${id}`;
   if(!repeatable&&day!==null&&fired.get(key)===day)return; // no accidental double-fire (e.g. wake({first:true}) replays)
   fired.set(key,day);log.push({phase,id,day,priority});if(log.length>200)log.shift();
   return fn(ctx);
  });
  return id;
 }
 // ---- mission voice-note arbitration ----
 const voiceNotes={
  band:VOICE_NOTE_BAND,assigned:VOICE_NOTE_ASSIGNED,
  define(fragment,defs){
   if(!fragment)throw new Error('voiceNotes.define: fragment required');
   const taken=new Map((window.RAWakeTriggers?.list?.()||[]).map(w=>[w.priority,w.adventure]));
   const out=[];
   for(const def of defs){
    if(!def?.adventure||typeof def.when!=='function'||!Number.isFinite(def.priority))throw new Error('voiceNotes.define: {adventure,priority,when} required');
    if(def.priority<VOICE_NOTE_BAND[0]||def.priority>VOICE_NOTE_BAND[1])throw new Error(`voiceNotes.define(${def.adventure}): priority ${def.priority} outside mission voice-note band ${VOICE_NOTE_BAND.join('–')}`);
    if(taken.has(def.priority))throw new Error(`voiceNotes.define(${def.adventure}): priority ${def.priority} already held by ${taken.get(def.priority)}`);
    taken.set(def.priority,def.adventure);
    const flag=def.flag||null;if(flag&&!flags()?.get(flag))throw new Error(`voiceNotes.define(${def.adventure}): flag ${flag} is not registered`);
    out.push({adventure:def.adventure,priority:def.priority,when:flag?L=>flags().enabled(flag)&&def.when(L):def.when});
   }
   window.RAWakeTriggers.define(out);return out.map(d=>d.adventure);
  },
  pick:()=>window.RAWakeTriggers?.pick?.()??null,
  list:()=>(window.RAWakeTriggers?.list?.()||[]).filter(w=>w.priority>=VOICE_NOTE_BAND[0]&&w.priority<=VOICE_NOTE_BAND[1]).map(w=>({adventure:w.adventure,priority:w.priority}))
 };
 // ---- night-report slot ----
 const contributions=new Map();let lastReport=null;
 const nightReport={
  contribute({id,fragment,priority=0,flag=null,fn}){
   if(!isId(id)||typeof fn!=='function')throw new Error('nightReport.contribute: {id,fn} required');
   if(!fragment)throw new Error(`nightReport.contribute(${id}): fragment required`);
   if(contributions.has(id))throw new Error(`nightReport.contribute: ${id} already registered`);
   if(flag&&!flags()?.get(flag))throw new Error(`nightReport.contribute(${id}): flag ${flag} is not registered`);
   contributions.set(id,{id,fragment,priority,flag,fn});return id;
  },
  build(ctx){
   const sections=[];
   for(const c of [...contributions.values()].sort((a,b)=>a.priority-b.priority||(a.id<b.id?-1:1))){
    if(c.flag&&!flags().enabled(c.flag))continue;
    try{const section=c.fn(ctx);if(section!=null)sections.push({id:c.id,fragment:c.fragment,...(typeof section==='object'?section:{text:String(section)})});}catch(e){console.error('night report',c.id,e);}
   }
   lastReport=sections.length?{day:ctx?.night?.day??null,sections}:null;return lastReport;
  },
  last:()=>lastReport?JSON.parse(JSON.stringify(lastReport)):null,
  consume(){const r=nightReport.last();lastReport=null;return r;},
  ids:()=>[...contributions.keys()]
 };
 // The slot itself is one night handler at the LATE end of the night phase (after every accepted night handler).
 clock().onWake('night-report',-1,ctx=>{nightReport.build(ctx);});
 window.RAWakeBus={bands:BANDS,bandOf,subscribe,voiceNotes,nightReport,order:phase=>info().filter(h=>phase==='night'?h.priority<0:h.priority>=0).sort((a,b)=>a.priority-b.priority).map(h=>h.id),trace:()=>log.map(x=>({...x})),resetTrace(){log.length=0;fired.clear();}};
})();
