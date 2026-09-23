(function(){
 const definitions=[
  {id:'atlanta',category:'go_somewhere',label:'ATLANTA',requirements:{},resultScene:null,action:{type:'dialogue',id:'butter_chicken'}},
  {id:'tokyo',category:'go_somewhere',label:'TOKYO',requirements:{flags:{tokyoAccess:true}},lockedMessage:"tokyo vampires don't fw you yet. get your clout up."},
  {id:'ogun_rave',category:'go_somewhere',label:"OGUN'S RAVE",requirements:{flags:{ogunsRaveInvited:true}},resultScene:null,action:{type:'dialogue',id:'ogun_rave_intro'}},
  {id:'jdm_home_delivery',category:'jdm_imports',label:'HOME DELIVERY',requirements:{flags:{jdmImportsUnlocked:true,jdmHomeDelivery:true}},lockedMessage:'first collection is in person.',resultScene:'jdmImports',action:{type:'open_store',id:'jdm_imports'}},
  {id:'property_fourplex',category:'real_estate',label:'FOURPLEX / AS-IS',requirements:{},resultScene:null,action:{type:'open_store',id:'real_estate'}}
 ];
 function evaluate(rule,life){const failures=[],req=rule?.requirements||{},world=life?.world||{},resources=life?.resources||{},people=life?.people||{};
  if(req.location&&world.location!==req.location)failures.push(`location: ${req.location}`);
  if(req.money?.minimum!==undefined&&Number(resources.money||0)<req.money.minimum)failures.push(`money: $${req.money.minimum}`);
  if(req.clout?.equals!==undefined&&resources.clout!==req.clout.equals)failures.push(`clout: ${req.clout.equals}`);
  if(req.vampireReputation?.equals!==undefined&&resources.vampireReputation!==req.vampireReputation.equals)failures.push(`vampire reputation: ${req.vampireReputation.equals}`);
  if(req.contact&&!people.contacts?.some(x=>(typeof x==='string'?x:x.id)===req.contact))failures.push(`contact: ${req.contact}`);
  if(req.relationship){const r=req.relationship,found=people.relationships?.some(x=>x.contactId===r.contactId&&x.status===r.status);if(!found)failures.push(`relationship: ${r.contactId}=${r.status}`);}
  if(req.prerequisiteFlag&&world.flags?.[req.prerequisiteFlag]!==true)failures.push(`flag: ${req.prerequisiteFlag}=true`);
  for(const [flag,value] of Object.entries(req.flags||{}))if(world.flags?.[flag]!==value)failures.push(`flag: ${flag}=${value}`);
  return {id:rule.id,category:rule.category,label:rule.label,available:failures.length===0,requirements:req,failures,lockedMessage:rule.lockedMessage||null,resultScene:rule.resultScene||null,action:rule.action||null};
 }
 function list(category){const life=window.RAState.get().life;return definitions.filter(x=>!category||x.category===category).map(x=>evaluate(x,life));}
 function get(id){return list().find(x=>x.id===id)||null}
 window.RAOpportunities={definitions,evaluate,list,get};
})();
