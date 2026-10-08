(function(){
 'use strict';
 // RAPhoneRegistry — IF-1 (4D). Extension registry for phone applications, layered on the accepted RAPhoneApps.
 // RESERVED capacity (not implemented here): War Room, Trap / Counting, Armory, RAINMAKER. Each reserved app is bound to a
 // DARK feature flag: while the flag is OFF the app is simply not registered with the phone, so the phone's home grid,
 // ordering, lock lines and every existing app are byte-identical to before. When a fragment is accepted and its flag is
 // promoted the same declaration lights up — no phone edit needed.
 // OL-001: final phone placement is reviewed after F4; `section` here is a provisional slot in RAPhoneHierarchy terms.
 const RESERVED=[
  {id:'warRoom',label:'WAR ROOM',fragment:'F04',flag:'F04.war_room',section:'now'},
  {id:'trap',label:'TRAP',fragment:'F05',flag:'F05.trap',section:'money',note:'Trap / Counting'},
  {id:'armory',label:'ARMORY',fragment:'F02',flag:'F02.armory',section:'life'},
  {id:'rainmaker',label:'RAINMAKER',fragment:'F06',flag:'F06.rainmaker',section:'money'}
 ];
 const declared=new Map(),reservedById=new Map(RESERVED.map(r=>[r.id,r]));
 const apps=()=>window.RAPhoneApps;
 const flagsOn=spec=>!spec.flag||!!window.RAFeatures?.enabled(spec.flag);
 function declare(fragment,app){
  if(!fragment||!app?.id)throw new Error('RAPhoneRegistry.declare(fragment,{id,...}) required');
  if(declared.has(app.id))throw new Error(`RAPhoneRegistry.declare: app ${app.id} already declared by ${declared.get(app.id).fragment}`);
  if(apps().get(app.id)&&!declared.has(app.id))throw new Error(`RAPhoneRegistry.declare: ${app.id} is an accepted phone app; it cannot be redeclared`);
  const reserved=reservedById.get(app.id);
  if(reserved&&reserved.fragment!==fragment)throw new Error(`RAPhoneRegistry.declare: ${app.id} is reserved for ${reserved.fragment}`);
  const flag=app.flag||reserved?.flag||null;
  if(!flag)throw new Error(`RAPhoneRegistry.declare(${app.id}): a feature flag is required — new apps integrate DARK`);
  if(!window.RAFeatures?.get(flag))throw new Error(`RAPhoneRegistry.declare(${app.id}): flag ${flag} is not registered in RAFeatures`);
  if(typeof app.render!=='function')throw new Error(`RAPhoneRegistry.declare(${app.id}): render(sub,api) required`);
  declared.set(app.id,{fragment,flag,app:{label:reserved?.label||app.id.toUpperCase(),section:reserved?.section,order:50,...app,id:app.id}});
  sync();return app.id;
 }
 function sync(){
  for(const [id,d] of declared){
   const present=!!apps().get(id);const on=flagsOn({flag:d.flag});
   if(on&&!present)apps().register({...d.app,__ifOwned:true});
   else if(!on&&present&&apps().get(id).__ifOwned)apps().unregister(id);
  }
  try{if(window.RAPhone?.isOpen?.())window.RAPhone.refresh();}catch(e){}
 }
 // unlock(id): unlock the app on the phone only when its flag is ON (the phone's own lock rules do the rest).
 function unlock(id,opts){const d=declared.get(id);if(!d||!flagsOn({flag:d.flag}))return false;return window.RALife.unlockApp(id,opts);}
 window.RAFeatures?.onChange(()=>sync());
 window.RAPhoneRegistry={declare,sync,unlock,reserved:()=>RESERVED.map(r=>({...r,declared:declared.has(r.id),enabled:!!window.RAFeatures?.enabled(r.flag)})),declaredApps:()=>[...declared].map(([id,d])=>({id,fragment:d.fragment,flag:d.flag,registered:!!apps().get(id)}))};
})();
