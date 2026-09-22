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
  }
 ];
})();
