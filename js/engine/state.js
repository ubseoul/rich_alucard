(function(){
  const KEY='rich_alucard_save_v1';
  const RECOVERY_KEY='rich_alucard_save_v1_recovery';
  const QUARANTINE_KEY='rich_alucard_save_v1_invalid';
  const VERSION=8;
  const defaults={version:VERSION,life:{identity:{name:'Rich Alucard'},world:{location:'LA',day:1,month:1,scene:'bedroom',flags:{}},resources:{money:100000,clout:'LOW',vampireReputation:'LOW'},ownership:{cars:[],properties:[],possessions:[]},people:{contacts:[],relationships:[],records:{}},creativeLife:{music:{songs:[],progress:{}}},phone:{learned:false},desires:{activeTrip:null,completed:[]},acquisitions:{active:null,completed:[]},opportunities:{},history:[]},characters:{ceo_assistant_001:{met:true,stolen:false,vampire:false,cracked:false}},encounters:{ceo_prince:{defeated:false,completed:false}}};
  const clone=value=>JSON.parse(JSON.stringify(value));
  const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
  const isFiniteNumber=value=>typeof value==='number'&&Number.isFinite(value);
  function merge(base,extra){if(!isObject(extra))return base;for(const key of Object.keys(extra)){const value=extra[key];if(isObject(value))base[key]=merge(isObject(base[key])?base[key]:{},value);else if(Array.isArray(value))base[key]=clone(value);else base[key]=value;}return base;}
  function objectOr(value,fallback={}){return isObject(value)?value:fallback;}
  function arrayOr(value,fallback=[]){return Array.isArray(value)?value:fallback;}
  function uniqueById(items){const seen=new Set();return arrayOr(items).filter(item=>{if(!isObject(item))return false;const key=typeof item.id==='string'&&item.id?item.id:null;if(!key)return true;if(seen.has(key))return false;seen.add(key);return true;}).map(clone);}
  function normalizeRecord(record){
    const source=isObject(record)?record:{};
    const normalized=merge(clone(defaults),source);
    normalized.version=VERSION;
    normalized.life=objectOr(normalized.life,clone(defaults.life));
    const life=normalized.life;
    life.identity=objectOr(life.identity,clone(defaults.life.identity));
    life.world=objectOr(life.world,clone(defaults.life.world));
    life.resources=objectOr(life.resources,clone(defaults.life.resources));
    life.ownership=objectOr(life.ownership,clone(defaults.life.ownership));
    life.people=objectOr(life.people,clone(defaults.life.people));life.people.records=objectOr(life.people.records,{});
    life.creativeLife=objectOr(life.creativeLife,clone(defaults.life.creativeLife));
    life.creativeLife.music=objectOr(life.creativeLife.music,clone(defaults.life.creativeLife.music));
    life.phone=objectOr(life.phone,clone(defaults.life.phone));
    life.desires=objectOr(life.desires,clone(defaults.life.desires));
    life.acquisitions=objectOr(life.acquisitions,clone(defaults.life.acquisitions));
    life.opportunities=objectOr(life.opportunities,{});
    life.world.flags=objectOr(life.world.flags,{});
    life.ownership.cars=uniqueById(life.ownership.cars);
    life.ownership.properties=uniqueById(life.ownership.properties);
    life.ownership.possessions=uniqueById(life.ownership.possessions);
    life.people.contacts=arrayOr(life.people.contacts).map(clone);
    life.people.relationships=arrayOr(life.people.relationships).filter(isObject).map(clone);
    life.creativeLife.music.songs=arrayOr(life.creativeLife.music.songs).map(clone);
    life.creativeLife.music.progress=objectOr(life.creativeLife.music.progress,{});
    life.desires.activeTrip=isObject(life.desires.activeTrip)?clone(life.desires.activeTrip):null;
    life.desires.completed=uniqueById(life.desires.completed);
    life.acquisitions.active=isObject(life.acquisitions.active)?clone(life.acquisitions.active):null;
    life.acquisitions.completed=uniqueById(life.acquisitions.completed);
    life.history=uniqueById(life.history);
    normalized.characters=objectOr(normalized.characters,clone(defaults.characters));
    normalized.encounters=objectOr(normalized.encounters,clone(defaults.encounters));
    if(typeof life.identity.name!=='string')life.identity.name=defaults.life.identity.name;
    if(typeof life.world.location!=='string')life.world.location=defaults.life.world.location;
    if(typeof life.world.scene!=='string')life.world.scene=defaults.life.world.scene;
    if(!isFiniteNumber(life.world.day))life.world.day=defaults.life.world.day;
    if(!isFiniteNumber(life.world.month))life.world.month=defaults.life.world.month;
    if(!isFiniteNumber(life.resources.money))life.resources.money=defaults.life.resources.money;
    if(typeof life.resources.clout!=='string')life.resources.clout=defaults.life.resources.clout;
    if(typeof life.resources.vampireReputation!=='string')life.resources.vampireReputation=defaults.life.resources.vampireReputation;
    life.phone.learned=!!life.phone.learned;
    return normalized;
  }
  function migrateLegacyToV5(saved){
    const old=clone(saved),life=clone(defaults.life),legacy={};
    const rich=objectOr(old.rich),world=objectOr(old.world),phone=objectOr(old.phone);
    if(isFiniteNumber(rich.budget))life.resources.money=rich.budget;
    if(typeof rich.clout==='string')life.resources.clout=rich.clout;
    if(typeof rich.location==='string')life.world.location=rich.location;
    if(isFiniteNumber(world.day))life.world.day=world.day;
    if(isFiniteNumber(world.month))life.world.month=world.month;
    if(typeof world.scene==='string')life.world.scene=world.scene;
    if(world.time!==undefined)life.world.time=clone(world.time);
    if(isObject(world.flags))life.world.flags=clone(world.flags);
    life.phone.learned=!!phone.learned;
    if(isObject(old.activeTrip)){
      life.desires.activeTrip=clone(old.activeTrip);
      if(old.activeTrip.status==='completed'){
        const entry={id:old.activeTrip.id,title:old.activeTrip.title||null,destination:clone(objectOr(old.activeTrip.destination)),purpose:old.activeTrip.purpose||null,completedAt:old.activeTrip.completedAt||null};
        life.desires.completed=[entry];
        life.history.push({id:`desire-completed:${old.activeTrip.id}`,type:'desire_completed',tripId:old.activeTrip.id,title:entry.title,destination:entry.destination,purpose:entry.purpose,at:entry.completedAt||old.activeTrip.createdAt||null});
      }
    }
    if(rich.social!==undefined&&rich.social!==null)legacy.richSocial=clone(rich.social);
    for(const key of Object.keys(old))if(!['version','life','rich','world','phone','activeTrip','characters','encounters'].includes(key))legacy[key]=clone(old[key]);
    const next=clone(defaults);next.version=5;next.life=merge(next.life,life);next.characters=merge(next.characters,objectOr(old.characters));next.encounters=merge(next.encounters,objectOr(old.encounters));
    if(Object.keys(legacy).length)next.life.migration=legacy;
    return next;
  }
  function migrateV5ToV6(saved){const next=merge(clone(defaults),saved);next.version=6;return next;}
  function migrateV6ToV7(saved){const next=clone(saved);next.version=7;return next;}
  function migrateV7ToV8(saved){const next=clone(saved),people=next.life.people||(next.life.people={}),records=people.records||(people.records={}),characters=next.characters||{};const assistant=characters.ceo_assistant_001;if(assistant?.met){records.ceo_assistant_001={met:true,conversionState:assistant.vampire?'converted':'human',contactable:false,flags:{stolen:!!assistant.stolen,cracked:!!assistant.cracked},memories:[...(assistant.stolen?['ceo_assistant_stolen']:[]),...(assistant.vampire?['ceo_assistant_converted']:[])]};}const daughter=characters.jdm_importer_daughter_001;if(daughter?.met){const outcome=typeof daughter.conversionOutcome==='string'?daughter.conversionOutcome:null;records.jdm_importer_daughter_001={met:true,firstMeetingSource:'jdm_imports_docks',conversionState:daughter.vampire?'converted':'human',contactable:false,flags:outcome?{conversionOutcome:outcome}:{},memories:['jdm_daughter_encountered',...(outcome?[`jdm_daughter_${outcome}`]:[])]};}next.version=8;return next;}
  const migrations={5:migrateV5ToV6,6:migrateV6ToV7,7:migrateV7ToV8};
  function migrateWithReport(saved){
    if(!isObject(saved))return {ok:false,error:'root-not-object'};
    let next=clone(saved),from=Number.isInteger(next.version)?next.version:0;
    if(from>VERSION)return {ok:false,error:'future-version'};
    if(from<5||!isObject(next.life)){next=migrateLegacyToV5(next);from=5;}
    while(from<VERSION){const step=migrations[from];if(!step)return {ok:false,error:`missing-migration-${from}`};next=step(next);from+=1;}
    return {ok:true,state:normalizeRecord(next),from:Number.isInteger(saved.version)?saved.version:0};
  }
  function migrateRecord(saved){const result=migrateWithReport(saved);return result.ok?result.state:clone(defaults);}
  function parseRecord(raw){if(typeof raw!=='string'||!raw.trim())return {ok:false,error:'missing'};try{return migrateWithReport(JSON.parse(raw));}catch(error){return {ok:false,error:'malformed-json'};}}
  function recoveryEnvelope(state){return {format:1,savedAt:new Date().toISOString(),state:clone(state)};}
  function parseRecovery(raw){if(typeof raw!=='string'||!raw.trim())return {ok:false,error:'missing-recovery'};try{const envelope=JSON.parse(raw);return migrateWithReport(isObject(envelope)&&isObject(envelope.state)?envelope.state:envelope);}catch(error){return {ok:false,error:'malformed-recovery'};}}
  function write(storage,next,backup=true){
    try{
      const normalized=migrateWithReport(next);if(!normalized.ok)return false;
      if(backup){const prior=parseRecord(storage.getItem(KEY));if(prior.ok)storage.setItem(RECOVERY_KEY,JSON.stringify(recoveryEnvelope(prior.state)));}
      storage.setItem(KEY,JSON.stringify(normalized.state));return true;
    }catch(error){return false;}
  }
  function read(storage){
    let primary;
    try{primary=parseRecord(storage.getItem(KEY));}catch(error){primary={ok:false,error:'storage-read-failed'};}
    if(primary.ok)return {state:primary.state,status:{source:'primary',migrated:primary.from!==VERSION,recovered:false,error:null}};
    let recovery;
    try{recovery=parseRecovery(storage.getItem(RECOVERY_KEY));}catch(error){recovery={ok:false,error:'recovery-read-failed'};}
    if(recovery.ok){try{storage.setItem(QUARANTINE_KEY,storage.getItem(KEY)||'');storage.setItem(KEY,JSON.stringify(recovery.state));}catch(error){}return {state:recovery.state,status:{source:'recovery',migrated:recovery.from!==VERSION,recovered:true,error:primary.error}};}
    return {state:clone(defaults),status:{source:'fresh',migrated:false,recovered:false,error:primary.error==='missing'?null:primary.error}};
  }
  let state=clone(defaults);let loadStatus={source:'fresh',migrated:false,recovered:false,error:null};
  function load(){const result=read(localStorage);state=result.state;loadStatus=result.status;if(loadStatus.source==='primary'&&loadStatus.migrated)write(localStorage,state,true);return state;}
  function save(){const result=write(localStorage,state,true);if(result)state=migrateRecord(state);return result;}
  function reset(){state=clone(defaults);save();return state;}
  function get(){return state;}
  function patch(path,value){const parts=String(path||'').split('.').filter(Boolean);if(!parts.length)return false;let current=state;for(let index=0;index<parts.length-1;index++)current=current[parts[index]]||(current[parts[index]]={});current[parts.at(-1)]=value;save();return value;}
  function recordEvent(event){if(!event?.id)return false;const history=state.life.history;if(history.some(item=>item.id===event.id))return false;history.push({...event,at:event.at||new Date().toISOString()});save();return true;}
  window.RAState={load,save,reset,get,patch,recordEvent,migrateRecord,migrateWithReport,normalizeRecord,parseRecord,read,write,getLoadStatus:()=>({...loadStatus}),defaults:clone(defaults),version:VERSION,keys:{primary:KEY,recovery:RECOVERY_KEY,quarantine:QUARANTINE_KEY}};
  load();
})();
