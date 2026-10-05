(function(){
 'use strict';
 // RC3 · BUILD A · THE CUT — runtime enforcement of js/data/rc3_cut.js (OL-074/076B/077/078). Loads LAST (after the fragments), so every
 // wrapper below sees the final objects. Nothing is deleted: cut content stays defined in the repo and is simply unreachable.
 //   1. every adventure that is not spine / functional / dancer date / one of the ten Maps keepers answers "not available" everywhere
 //   2. nothing is pushed: no random wants, no wake-time adventure except the story ladder, no non-story phone INCOMING
 //   3. the ladder cannot end early (pitch NAH, boba-and-leave, pay-and-end are hidden) and cannot stall (Gbenga lends a car)
 //   4. story beats land no earlier than RARC3Cut.PACE (a ~21-day game)
 const C=window.RARC3Cut;if(!C)return;
 const A=window.RAAdventures,T=window.RATemptations,W=window.RAWakeTriggers,E=window.RAWorldEvents;
 const sealed=new Set((window.RASealed?.installed?.()?.adventures||[]).map(d=>d.id));
 const cutIds=()=>A.all().map(d=>d.id).filter(id=>!sealed.has(id)&&C.classify(id)==='cut');
 const isCut=id=>!sealed.has(id)&&!!A.get(id)&&C.classify(id)==='cut';

 // ---- 1+4. availability ---------------------------------------------------------------------------------------------------------
 const optionalById=new Map(C.OPTIONAL.map(o=>[o.id,o]));
 const baseAvailable=A.available;
 function available(id,opts){
  if(isCut(id))return false;
  const pace=C.PACE[id];if(pace&&window.RALife.today().day<pace)return false;
  // a keeper's own gate may be replaced (its original window closed, or its prerequisite was cut)
  const o=optionalById.get(id);
  if(o&&o.when){
   const def=A.get(id),a=A.active();
   if(a&&a.id!==id&&!(opts&&opts.ignoreActive))return false;
   if(!def.repeatable&&A.isDone(id))return false;
   try{return o.when(window.RALife.L())!==false;}catch(e){return false;}
  }
  return baseAvailable(id,opts);
 }
 A.available=available;

 // ---- 2. nothing is pushed ------------------------------------------------------------------------------------------------------
 // random wants: the generator is off; only the dancers' invites (f15:*) and nothing else may be pushed or ensured
 window.RAClock?.onWake('temptations',60,()=>{});
 const pushable=id=>/^f15:/.test(String(id));
 if(T){const push=T.push,ensure=T.ensure;T.push=(id,o)=>pushable(id)?push(id,o):false;T.ensure=id=>pushable(id)?ensure(id):false;}
 // wake: at most one story beat; never a random adventure
 if(W){
  W.pick=function(){
   const L=window.RALife.L(),prior=window.RALife.flag('wakeTrigger');
   if(prior?.day===L.day){return prior.id&&A.available(prior.id)?prior.id:null;}
   for(const w of W.list()){try{if(C.isSpine(w.adventure)&&A.available(w.adventure)&&w.when(L)){window.RALife.setFlag('wakeTrigger',{day:L.day,id:w.adventure});return w.adventure;}}catch(e){console.error(e);}}
   window.RALife.setFlag('wakeTrigger',{day:L.day,id:null});return null;
  };
 }
 // phone INCOMING: only story events
 if(E){const pending=E.pending;E.pending=ch=>pending(ch).filter(e=>C.STORY_EVENTS.includes(e.id));}

 // ---- 3. the ladder never ends early and never stalls -----------------------------------------------------------------------------
 for(const [adv,node,label] of C.DEAD_ENDS){
  const n=A.get(adv)?.nodes?.[node];if(!n||!Array.isArray(n.choices))continue;
  n.choices=n.choices.filter(c=>c.label!==label);
 }
 // M4 needs a car Rich may not have: Gbenga's cousin leaves one outside after CANOPY DUTY (a hooptie; F04's PLAYs already ride one)
 document.addEventListener('ra:adventure-complete',e=>{
  const L=window.RALife;if(!L)return;
  if(e.detail?.id==='NEW_OGA_M3'&&!(L.life().ownership.cars||[]).some(c=>c.ownershipStatus!=='sold')){
   L.addCar({id:'gbenga_hooptie',make:'TOYOTA',model:"GBENGA'S HOOPTIE",short:'HOOPTIE',price:3000,value:3000,parts:{},acquisitionSource:'gbenga_loaner'});
   L.text('gbenga','GBENGA','a car is outside. the keys are in it. do not scratch it.',{id:'rc3:loaner'});
  }
  // every spine beat marks today: one story beat a day
  if(C.isSpine(e.detail?.id))L.setFlag('rc3StoryDay',L.today().day);
 });

 // ---- day-one unlocks: every phone app is there from the first wake ------------------------------------------------------------------------
 window.RAClock?.onWake('rc3-apps',2,({info})=>{
  const L=window.RALife;
  for(const id of ['texts','radio'])L.unlockApp(id,{silent:true});
  L.setFlag('armoryKnown',true);
  try{window.RAPhoneRegistry?.unlock?.('armory',{silent:true});}catch(e){}
 });

 // ---- property + cars inside the Bank: no castle rooms (their visits are cut), no parts bay (the garage minigame is cut) ----------------------
 if(window.RACastle)window.RACastle.markup=()=>'';
 if(window.RACars?.jdmMarkup){const jdm=window.RACars.jdmMarkup;window.RACars.jdmMarkup=(...a)=>String(jdm(...a)).replace(/<button[^>]*do:cars:garage[^>]*>[\s\S]*?<\/button>/g,'');}

 window.RACut={classify:C.classify,isCut,cutIds,available,optional:()=>C.OPTIONAL.map(o=>({...o,id:o.id,title:A.get(o.id)?.title||o.id,available:available(o.id)})),
  counts(){const all=A.all().map(d=>d.id).filter(id=>!sealed.has(id)),by={};for(const id of all){const k=C.classify(id);by[k]=(by[k]||0)+1;}return {total:all.length,...by};}};
})();
