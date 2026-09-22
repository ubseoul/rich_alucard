(function(){
 const catalog=id=>window.RAPersonCatalog?.[id]||null;
 const clone=value=>JSON.parse(JSON.stringify(value));
 function records(){return RAState.get().life.people.records||{}}
 function record(id){return records()[id]||null}
 function save(id,next){const all=clone(records());all[id]=next;RAState.patch('life.people.records',all);return next}
 function ensure(id){if(!catalog(id))return null;return record(id)||{met:false,conversionState:null,contactable:!!catalog(id).contactCapable,flags:{},memories:[]}}
 function meetPerson(id,source){const prior=ensure(id);if(!prior)return null;const next={...prior,met:true,contactable:!!catalog(id).contactCapable,flags:{...prior.flags},memories:[...prior.memories]};if(!prior.met&&source)next.firstMeetingSource=source;return save(id,next)}
 function rememberPersonEvent(id,eventId){const prior=ensure(id);if(!prior||!eventId)return null;const memories=prior.memories.includes(eventId)?prior.memories:[...prior.memories,eventId];return save(id,{...prior,flags:{...prior.flags},memories})}
 function setPersonFlag(id,flag,value){const prior=ensure(id);if(!prior||!flag)return null;return save(id,{...prior,flags:{...prior.flags,[flag]:value},memories:[...prior.memories]})}
 function setConversionState(id,state){const prior=ensure(id);if(!prior)return null;return save(id,{...prior,conversionState:state||null,flags:{...prior.flags},memories:[...prior.memories]})}
 function known(){return Object.entries(records()).filter(([,value])=>value?.met).map(([id,value])=>({id,catalog:catalog(id),record:value}))}
 function bootstrapCompatibility(){
  const legacy=RAState.get().characters||{},assistant=legacy.ceo_assistant_001,daughter=legacy.jdm_importer_daughter_001;
  if(assistant?.met&&!record('ceo_assistant_001')){
   meetPerson('ceo_assistant_001');setConversionState('ceo_assistant_001',assistant.vampire?'converted':'human');
   if(assistant.stolen){setPersonFlag('ceo_assistant_001','stolen',true);rememberPersonEvent('ceo_assistant_001','ceo_assistant_stolen');}
   if(assistant.vampire)rememberPersonEvent('ceo_assistant_001','ceo_assistant_converted');
  }
  if(daughter?.met&&!record('jdm_importer_daughter_001')){
   meetPerson('jdm_importer_daughter_001','jdm_imports_docks');setConversionState('jdm_importer_daughter_001',daughter.vampire?'converted':'human');rememberPersonEvent('jdm_importer_daughter_001','jdm_daughter_encountered');
   if(daughter.conversionOutcome){setPersonFlag('jdm_importer_daughter_001','conversionOutcome',daughter.conversionOutcome);rememberPersonEvent('jdm_importer_daughter_001',`jdm_daughter_${daughter.conversionOutcome}`);}
  }
 }
 bootstrapCompatibility();
 window.RAPeople={catalog,record,known,meetPerson,rememberPersonEvent,setPersonFlag,setConversionState};
})();
