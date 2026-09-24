(function(){
 window.RAWorldEventDefinitions=[
  {
   id:'player_blind_proof_event_001',
   deliveryChannel:'phone',
   once:true,
   safeBoundaries:['bedroom-entry'],
   prerequisite:{
    person:{id:'jdm_importer_daughter_001',met:true,memory:'jdm_daughter_encountered'}
   },
   sender:'JDMIMPORTS',
   subject:'INCOMING',
   body:'your pickup left something loose.',
   actions:[
    {id:'acknowledge',label:'OPEN IT',resolution:{flag:'proofEvent001Handled',historyType:'world_event_resolved'}}
   ]
  },
  {
   id:'property_pb01_001',
   deliveryChannel:'phone',
   once:true,
   safeBoundaries:['bedroom-entry'],
   prerequisite:{flags:{propertyPb01Eligible:true}},
   sender:'SHANNON',
   subject:'PALOMA FOURPLEX',
   body:'I did not send a contractor. The panel is closed, the baseboard is patched, and somebody used the paint. I am documenting that sentence and moving on.',
   actions:[
    {id:'ok',label:'NOTED',resolution:{flag:'propertyPb01Seen',historyType:'world_event_resolved'}}
   ]
  },
  {
   id:'ogun_rave_invite_001',
   deliveryChannel:'phone',
   once:true,
   safeBoundaries:['bedroom-entry'],
   // Life clock integration: the invite lands on the first party night (Friday), not before the first wake.
   prerequisite:{flags:{ogunInviteWindow:true}},
   sender:'OGUN',
   subject:'TONIGHT',
   body:"meatpacking district. bring yourself. don't be too fashionably late.",
   actions:[
    {id:'in',label:"I'M THERE",resolution:{flag:'ogunsRaveInvited',historyType:'world_event_resolved'}}
   ]
  }
 ];
})();
