(function(){
  const QUEST_ID='property_la_4p_01_acquisition',PROPERTY_ID='property_la_4p_01';
  const PRICE_CUT=34000,REPAIR_CUT=4000,PRICE_ASIS=42000,REPAIR_ASIS=12000;
  const MONTHLY_INCOME=1400,STABILIZE_MS=24*60*60*1000;
  const active=()=>RAState.get().life.property?.active||null;
  const ownedRecord=()=>RAState.get().life.ownership.properties.find(x=>x.id===PROPERTY_ID)||null;
  function patchActive(fields){const prior=active();if(!prior)return false;return RAState.patch('life.property.active',{...prior,...fields});}
  function findChoice(phaseId,choiceId,phases){const phase=phases.find(p=>p.id===phaseId);return phase?.choices?.find(c=>c.id===choiceId)||null;}
  function currentSession(){return (window.RAPropertyScene?.current?.()||{}).session||null;}

  function computeAcquisition(mode){return mode==='asis'?{price:PRICE_ASIS,repair:REPAIR_ASIS}:{price:PRICE_CUT,repair:REPAIR_CUT};}

  function completePurchase(mode){
    if(ownedRecord())return {ok:true,already:true};
    const {price,repair}=computeAcquisition(mode);
    if(RABudget.balance()<price)return {ok:false,reason:'insufficient-funds',price};
    const record=active();
    const pb01Eligible=record?.firstSignChoice==='wait'&&record?.ratApproach==='stand_ground';
    RABudget.spend(price);
    const acquiredAt=new Date().toISOString();
    const stabilizeAt=new Date(Date.now()+STABILIZE_MS).toISOString();
    const property={id:PROPERTY_ID,label:'PALOMA FOURPLEX',ownershipStatus:'owned',acquisitionSource:'real_estate_shannon',transactionMode:mode,acquiredAt,condition:'active',pendingRepairCost:repair,monthlyIncome:MONTHLY_INCOME,purchasePrice:price,incomeReadyAt:stabilizeAt,nextCollectionAt:stabilizeAt,firstSignChoice:record?.firstSignChoice||null,ratApproach:record?.ratApproach||null};
    const life=RAState.get().life;
    RAState.patch('life.ownership.properties',[...life.ownership.properties,property]);
    window.RAPeople?.meetPerson('shannon_001','property_la_4p_01');
    window.RAPeople?.rememberPersonEvent('shannon_001','property_shannon_closed_deal');
    RAState.recordEvent({id:`property-acquired:${PROPERTY_ID}`,type:'property_acquired',propertyId:PROPERTY_ID,mode,price,at:acquiredAt});
    const completed=[...life.property.completed];
    if(!completed.some(x=>x.id===QUEST_ID))completed.push({id:QUEST_ID,propertyId:PROPERTY_ID,completedAt:acquiredAt});
    RAState.patch('life.property.completed',completed);
    RAState.patch('life.world.flags.propertyOwned',true);
    if(pb01Eligible)RAState.patch('life.world.flags.propertyPb01Eligible',true);
    RAState.patch('life.property.active',{...record,status:'completed',phase:'acquired',transactionMode:mode});
    return {ok:true,already:false,price};
  }

  function collectRent(){
    const life=RAState.get().life,idx=life.ownership.properties.findIndex(x=>x.id===PROPERTY_ID);
    if(idx<0)return false;
    const prop=life.ownership.properties[idx];
    if(Date.parse(prop.nextCollectionAt||0)>Date.now())return false;
    const amount=Number(prop.monthlyIncome)||0;
    window.RABudget?.add(amount);
    const next=[...life.ownership.properties];
    next[idx]={...prop,nextCollectionAt:new Date(Date.now()+STABILIZE_MS).toISOString(),lastCollectedAt:new Date().toISOString(),condition:prop.condition==='active'?'stabilized':prop.condition};
    RAState.patch('life.ownership.properties',next);
    RAState.recordEvent({id:`property-rent:${PROPERTY_ID}:${Date.now()}`,type:'property_income_collected',propertyId:PROPERTY_ID,amount,at:new Date().toISOString()});
    return amount;
  }

  function buildExteriorDefinition(){
    const phases=window.RAPropertyContent.exteriorPhases;
    return {phases,onPhase(id){patchActive({phase:id});},onChoice(id,snapshot){
      const choice=findChoice(snapshot.phaseId,id,phases);if(!choice)return;
      if(id==='numbers'){window.RAPropertyScene?.flashNumbers?.();}
      if(choice.next){patchActive({phase:choice.next});currentSession()?.setPhase(choice.next);}
      else if(choice.commit)currentSession()?.commit(choice.commit,{choiceId:id});
    },consequences:{
      enterInterior(){patchActive({phase:'int_entry'});if(window.RAPhone?.isOpen?.())window.RAPhone.close();RAScenes.go('property-la-4p-interior',{definition:buildInteriorDefinition(),phase:'int_entry'});},
      acquire(payload){
        const mode=payload?.choiceId==='asis'?'asis':'cut';
        const result=completePurchase(mode);
        if(!result.ok){window.RAPropertyScene?.flashMessage?.('NOT ENOUGH CASH TO CLOSE.');return;}
        RAScenes.go('property-la-4p-exterior',{definition:buildExteriorAcquiredDefinition(),phase:'acquired'});
      },
      deferOffer(){patchActive({status:'paused'});RAState.patch('life.world.location','LA');document.body.classList.remove('property-mode');RAScenes.go('bedroom',{propertyDefer:true});},
      goCurb(){patchActive({phase:'curb_offer'});RAScenes.go('property-la-4p-exterior',{definition:buildExteriorDefinition(),phase:'curb_offer'});},
      returnHome(){RAState.patch('life.world.location','LA');document.body.classList.remove('property-mode');RAScenes.go('bedroom',{propertyAcquired:true});}
    }};
  }
  function buildExteriorAcquiredDefinition(){
    const phases=window.RAPropertyContent.exteriorPhases;
    return {phases,onPhase(id){patchActive({phase:id});},onChoice(id,snapshot){
      const choice=findChoice(snapshot.phaseId,id,phases);if(!choice)return;
      if(choice.commit)currentSession()?.commit(choice.commit,{choiceId:id});
    },consequences:{
      returnHome(){RAState.patch('life.world.location','LA');document.body.classList.remove('property-mode');RAScenes.go('bedroom',{propertyAcquired:true});}
    }};
  }
  function buildInteriorDefinition(){
    const phases=window.RAPropertyContent.interiorPhases;
    return {phases,onPhase(id){patchActive({phase:id});},onChoice(id,snapshot){
      const choice=findChoice(snapshot.phaseId,id,phases);if(!choice)return;
      if(choice.next){patchActive({phase:choice.next});currentSession()?.setPhase(choice.next);}
      else if(choice.commit)currentSession()?.commit(choice.commit,{choiceId:id});
    },consequences:{
      firstSign(payload){patchActive({firstSignChoice:payload?.choiceId||null,phase:'rat_reveal'});currentSession()?.setPhase('rat_reveal');},
      ratApproach(payload){patchActive({ratApproach:payload?.choiceId||null,phase:'pressure_resolve'});currentSession()?.setPhase('pressure_resolve');},
      goCurb(){patchActive({phase:'curb_offer'});if(window.RAPhone?.isOpen?.())window.RAPhone.close();RAScenes.go('property-la-4p-exterior',{definition:buildExteriorDefinition(),phase:'curb_offer'});},
      acquire(payload){
        const mode=payload?.choiceId==='asis'?'asis':'cut';
        const result=completePurchase(mode);
        if(!result.ok){window.RAPropertyScene?.flashMessage?.('NOT ENOUGH CASH TO CLOSE.');return;}
        RAScenes.go('property-la-4p-exterior',{definition:buildExteriorAcquiredDefinition(),phase:'acquired'});
      }
    }};
  }

  async function begin(){
    if(ownedRecord())return;
    const current=active();
    if(current&&current.status!=='completed')return resume();
    RAState.patch('life.property.active',{id:QUEST_ID,propertyId:PROPERTY_ID,status:'in_progress',phase:'ext_arrival',firstSignChoice:null,ratApproach:null,startedAt:new Date().toISOString()});
    document.body.classList.add('property-mode');
    if(window.RAPhone?.isOpen?.())await window.RAPhone.close();
    await RAScenes.go('property-la-4p-exterior',{definition:buildExteriorDefinition(),phase:'ext_arrival'});
  }
  async function resume(){
    const record=active();if(!record||record.status==='completed')return begin();
    document.body.classList.add('property-mode');
    if(window.RAPhone?.isOpen?.())await window.RAPhone.close();
    const interiorIds=window.RAPropertyContent.interiorPhases.map(p=>p.id);
    if(interiorIds.includes(record.phase))await RAScenes.go('property-la-4p-interior',{definition:buildInteriorDefinition(),phase:record.phase});
    else await RAScenes.go('property-la-4p-exterior',{definition:buildExteriorDefinition(),phase:record.phase||'ext_arrival'});
  }
  function resetForDev(){
    const life=RAState.get().life,idx=life.ownership.properties.findIndex(x=>x.id===PROPERTY_ID);
    let refund=0;
    if(idx>=0){refund=Number(life.ownership.properties[idx].purchasePrice)||0;const next=life.ownership.properties.filter(x=>x.id!==PROPERTY_ID);RAState.patch('life.ownership.properties',next);if(refund)window.RABudget?.add(refund);}
    RAState.patch('life.property.active',null);
    RAState.patch('life.property.completed',life.property.completed.filter(x=>x.propertyId!==PROPERTY_ID));
    RAState.patch('life.world.flags.propertyOwned',false);
    RAState.patch('life.world.flags.propertyPb01Eligible',false);
    window.RAWorldEvents?.reset?.('property_pb01_001');
    document.body.classList.remove('property-mode');
    return refund;
  }
  function storeMarkup(){
    const owned=ownedRecord(),record=active();
    if(owned){
      const ready=Date.parse(owned.incomeReadyAt||0)<=Date.now();
      const collectable=ready&&Date.parse(owned.nextCollectionAt||0)<=Date.now();
      return `<h1>REALMONEYREALESTATE</h1><img class="property-thumb" src="assets/property/ui/property_ownership_thumbnail_96x96.png" alt="" draggable="false" /><p class="property-owned-label">PALOMA FOURPLEX / OWNED</p><p class="property-status">CONDITION: ${owned.condition==='stabilized'?'STABILIZED':'ACTIVE'}</p><p class="property-status">INCOME: ${ready?'READY':'PENDING STABILIZATION'}</p><div class="property-actions"><button type="button" class="phone-button property-action" data-property-action="collect" ${collectable?'':'disabled'}>${collectable?`COLLECT $${new Intl.NumberFormat('en-US').format(owned.monthlyIncome)}`:'NOT YET DUE'}</button><button type="button" class="phone-button" data-property-action="home">HOME</button></div>`;
    }
    if(record&&record.status!=='completed')return `<h1>REALMONEYREALESTATE</h1><p>FOURPLEX / AS-IS</p><p class="property-status">INSPECTION IN PROGRESS.</p><div class="property-actions"><button type="button" class="phone-button property-action" data-property-action="resume">RETURN TO THE PROPERTY</button><button type="button" class="phone-button" data-property-action="home">HOME</button></div>`;
    return `<h1>REALMONEYREALESTATE</h1><p>FOURPLEX / AS-IS</p><p class="property-status">FOUR DOORS. ONE PRICE. SELLER WANTS SPEED.</p><p class="property-status">INCOME PROPERTY. INSPECTION REQUIRED.</p><div class="property-actions"><button type="button" class="phone-button property-action" data-property-action="see">SEE IT</button><button type="button" class="phone-button" data-property-action="home">NOT TODAY</button></div>`;
  }
  function action(name){
    if(name==='home'){window.RAPhone?.home?.();return;}
    if(name==='see'||name==='resume'){begin();return;}
    if(name==='collect'){const amount=collectRent();if(amount)window.RAPhone?.refresh?.();return;}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelector('#devResetProperty')?.addEventListener('click',async()=>{resetForDev();if(window.RAPhone?.isOpen?.())await window.RAPhone.close();if(window.RAScenes?.current?.()!=='bedroom')await window.RAScenes?.go?.('bedroom',{devReset:'property'});});
    document.querySelector('#devEnterProperty')?.addEventListener('click',()=>begin());
    document.querySelector('#devCollectRent')?.addEventListener('click',()=>{const life=RAState.get().life,idx=life.ownership.properties.findIndex(x=>x.id===PROPERTY_ID);if(idx>=0){const next=[...life.ownership.properties];next[idx]={...next[idx],nextCollectionAt:new Date(0).toISOString(),incomeReadyAt:new Date(0).toISOString()};RAState.patch('life.ownership.properties',next);}});
  });
  window.RAPropertyQuest={propertyId:PROPERTY_ID,questId:QUEST_ID,active,ownedRecord,begin,resume,resetForDev,storeMarkup,action,collectRent,computeAcquisition,completePurchase,priceCut:PRICE_CUT,priceAsis:PRICE_ASIS,monthlyIncome:MONTHLY_INCOME,buildExteriorDefinition,buildInteriorDefinition};
})();
