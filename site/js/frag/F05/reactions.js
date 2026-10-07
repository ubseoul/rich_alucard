(function(){
 'use strict';
 // F05 - THE TRAP - reactions.js
 // THE TRAP sec.7 "PEOPLE NOTICE": Nneka, Bllad33, Tristan and Mom's group chat each react once (like Vol 7);
 // Carlos (NEW OGA) has opinions. The source describes the reactions but authors NO lines, so this system records
 // the one-time reaction and reports contentSourceRequired - it never invents dialogue. A host hook may consume
 // RAF05.hooks.onReaction to deliver authored text once the writing exists.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;

 const PEOPLE=[
  {id:'nneka',label:'NNEKA',contentSourceRequired:true},
  {id:'bllad33',label:'BLLAD33',contentSourceRequired:true},
  {id:'tristan',label:'TRISTAN',contentSourceRequired:true},
  {id:'mom',label:"MOM'S GROUP CHAT",contentSourceRequired:true},
  {id:'carlos',label:'CARLOS',contentSourceRequired:true}
 ];
 const byId=id=>PEOPLE.find(p=>p.id===id)||null;

 function trigger(id){
  if(!R.on())return {ok:false,reason:'flag-off'};
  const person=byId(id);if(!person)return {ok:false,reason:'unknown-person'};
  if(R.store.reactionSeen(id))return {ok:false,reason:'already',id};
  const day=R.store.markReaction(id);
  try{R.hooks.onReaction&&R.hooks.onReaction({...person,day});}catch(e){}
  return {ok:true,id,day,contentSourceRequired:true};
 }
 // Convenience: mark every reaction whose precondition the caller reports true, once each.
 function tick(flags={}){
  const out=[];for(const p of PEOPLE)if(flags[p.id])out.push(trigger(p.id));return out;
 }
 function seen(){return PEOPLE.filter(p=>R.store.reactionSeen(p.id)).map(p=>({id:p.id,day:R.read(`reactions.${p.id}`,null)}));}
 function pending(){return PEOPLE.filter(p=>!R.store.reactionSeen(p.id)).map(p=>({...p}));}

 R.hooks=R.hooks||{};
 R.reactions={PEOPLE,trigger,tick,seen,pending,has:id=>R.store.reactionSeen(id)};
})();
