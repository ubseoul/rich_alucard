(function(){
 'use strict';
 // BUILD-2: translate preserved F02 data across the existing F01 iframe boundary.
 // No inventory is duplicated. Every snapshot is fresh, read-only and gated by the core flag.
 const R=window.RAIronAndGrace,C=window.RAIronCatalog;
 function snapshot(roster,{trap=false}={}){
  if(!window.RAIronFlags.core())return null;
  const weapons={},loadout={};
  for(const g of C.list().filter(g=>!g.dev)){
   const held=window.RAArtRegistry?.items?.guns?.[g.id]?.held?.asset||null;
   weapons[g.id]={id:g.id,label:g.label,type:g.type,audio:g.audio,price:g.price,stats:R.showdown.stats(g.id),held};
  }
  for(const o of roster){
   const id=(trap?R.trap.owner(`trap:${o.id}`):null)||window.RAIronShowdown.carried(o.id);
   if(id&&R.owns(id))loadout[o.id]=id;
  }
  return {schema:'F02.play_weapons/1',weapons,loadout,owned:R.ownedGuns().map(g=>g.id),conditions:{mazdaMajestic:!!window.RALife?.flag?.('mazdaMajestic')}};
 }
 R.playSnapshot=snapshot;
 // The host's existing transaction owns idempotency; this updates only F02-owned assignments.
 R.consumePlay=function(result){
  if(!window.RAIronFlags.core()||!result?.iron)return;
  const receipts=window.RAFrag.read('F02','playConsumed',{});
  if(result.requestId&&receipts[result.requestId])return;
  for(const loss of result.guns?.lost||[]){
   if(!R.owns(loss.gun))continue;
   const guns=window.RALife.life().ownership.guns.filter(g=>g.id!==loss.gun);
   window.RAState.patch('life.ownership.guns',guns);
   for(const entry of R.trap.list())if(entry.gun===loss.gun)R.trap.clear(entry.owner);
  }
  for(const gift of result.guns?.gifts||[])if(C.byId(gift.gun))R.grant(gift.gun,{source:'F01.play'});
  for(const [id,gun] of Object.entries(result.iron.loadout||{}))if(R.owns(gun))window.RAIronShowdown.assign(id,gun);
  if(result.requestId)window.RAFrag.patch('F02','playConsumed',{...receipts,[result.requestId]:true});
 };
})();
