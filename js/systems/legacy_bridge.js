(function(){
 // W1 integration of released content WITHOUT rebuilding it (HQ Addendum §1): Ogun's Rave, The Property,
 // I Want a Supra and Butter Chicken keep their flows; this bridge connects their completion to the life clock,
 // memory, phone and world when Rich comes home.
 const once=(key,fn)=>{if(RALife.flag(`bridge_${key}`))return false;RALife.setFlag(`bridge_${key}`,true);fn();return true;};
 function bridge(payload={}){
  if(!RALife.life().clock.started)return;
  const f=RALife.flag;
  if(f('ogunsRaveCompleted'))once('ogun',()=>{
   RALife.remember({id:'ogun-rave',text:'blood in my locs at ogun\'s rave',lane:'nightlife',type:'party',quality:3});
   RALife.receipt({id:'ogun-rave',caption:'ogun\'s rave. never getting this out of my locs.',lane:'nightlife'});
   RALife.unlockApp('vampgram');
   window.RAVampGram?.post?.({id:'vg:rave-tag',handle:'meatpacking.nights',text:'last night at ogun\'s 🩸 (blurry. but that\'s @richalucard in the back)',likes:3100});
   RALife.addFollowers(35);RALife.addPoints('clout',5);RALife.addPoints('rep',5);RALife.light('connection',1,'ogun-rave');RALife.light('chaos',1,'ogun-sprinklers');
   RALife.setFlag('locsBloody',true);RARelations.meet('bllad33','ogun_rave');RARelations.meet('ogun','ogun_rave');
   if(payload.ogunRave)RAState.patch('life.clock.returnBeat',{speaker:'rich',text:'blood in my locs. this shit is crazy.',vp:true,adventure:'ogun_rave_001',nightEnder:true});
   RAAdventures.record('ogun_rave_001')||RAState.patch('life.adventures.records',{...RALife.life().adventures.records,ogun_rave_001:{status:'completed',count:1,completedDay:RALife.today().day}});
  });
  if(f('propertyOwned'))once('property',()=>{
   RALife.remember({id:'the-property',text:'the rats at the fourplex',lane:'property',type:'weird',quality:3});
   RALife.receipt({id:'the-property',caption:'first building. four doors. one key ring.',lane:'property'});
   RALife.light('ownership',1,'property:first');RALife.unlockApp('texts',{silent:true});
   RALife.text('shannon_001','SHANNON','keys are yours. rent comes in on fridays. I will not be answering questions about the other thing.',{id:'shannon-first'});
   if(payload.propertyAcquired)RAState.patch('life.clock.returnBeat',{speaker:'rich',text:'i own a building. with rats. but i own it.',vp:true,adventure:'property'});
   const recs=RALife.life().adventures.records;if(!recs.property_la_4p_01_acquisition)RAState.patch('life.adventures.records',{...recs,property_la_4p_01_acquisition:{status:'completed',count:1,completedDay:RALife.today().day}});
  });
  if(RALife.hasCar(RACars.SUPRA))once('supra',()=>{
   RALife.remember({id:'the-supra',text:'the supra at the docks',lane:'cars',quality:2});RALife.receipt({id:'the-supra',caption:'the supra. finally.',lane:'cars'});
   RALife.light('ownership',1,'car:supra');RALife.unlockApp('jdmImports',{silent:true});
   RALife.patchCar(RACars.SUPRA,{short:'SUPRA',value:78000,parts:{}});
  });
  if((RALife.life().desires.completed||[]).length)once('butter',()=>{if(payload.tripReturn)RAState.patch('life.clock.returnBeat',{speaker:'rich',text:'…i needed that.',vp:true,adventure:'desire_trip_001'});RALife.light('connection',0,'x');});
  const cc=RALife.life().characters?.ceo_assistant_001;if(cc?.stolen||cc?.vampire)once('assistant',()=>{RARelations.meet('ceo_assistant_001','throne_room');if(cc.vampire)RARelations.add('ceo_assistant_001',20,{reason:'converted'});});
  const dd=RALife.life().characters?.jdm_importer_daughter_001;if(dd?.met)once('cammile',()=>{RARelations.meet('jdm_importer_daughter_001','jdm_imports_docks');RARelations.meet('importer','jdm_imports_docks');});
 }
 document.addEventListener('ra:scene',e=>{if(e.detail?.id==='bedroom')bridge(e.detail.payload||{});});
 RAClock.onWake('legacy-bridge',3,()=>bridge({}));
 window.RALegacyBridge={bridge};
})();
