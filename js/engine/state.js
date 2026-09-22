(function(){
  const KEY='rich_alucard_save_v1';
  const defaults={version:6,life:{identity:{name:'Rich Alucard'},world:{location:'LA',day:1,month:1,scene:'bedroom',flags:{}},resources:{money:100000,clout:'LOW',vampireReputation:'LOW'},ownership:{cars:[],properties:[],possessions:[]},people:{contacts:[],relationships:[]},creativeLife:{music:{songs:[],progress:{}}},phone:{learned:false},desires:{activeTrip:null,completed:[]},acquisitions:{active:null,completed:[]},opportunities:{},history:[]},characters:{ceo_assistant_001:{met:true,stolen:false,vampire:false,cracked:false}},encounters:{ceo_prince:{defeated:false,completed:false}}};
  const clone=o=>JSON.parse(JSON.stringify(o));
  function merge(base,extra){if(!extra||typeof extra!=='object')return base;for(const k in extra){if(extra[k]&&typeof extra[k]==='object'&&!Array.isArray(extra[k]))base[k]=merge(base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k])?base[k]:{},extra[k]);else base[k]=extra[k];}return base;}
  function migrateRecord(saved){
    if(!saved||typeof saved!=='object')return clone(defaults);
    if(saved.version>=5&&saved.life){const migrated=merge(clone(defaults),saved);migrated.version=6;return migrated;}
    const old={...saved},life=clone(defaults.life),legacy={};
    const rich=old.rich||{},world=old.world||{},phone=old.phone||{};
    life.resources.money=rich.budget??life.resources.money;
    life.resources.clout=rich.clout??life.resources.clout;
    life.world.location=rich.location??life.world.location;
    life.world.day=world.day??life.world.day;life.world.month=world.month??life.world.month;life.world.scene=world.scene??life.world.scene;
    if(world.time!==undefined)life.world.time=world.time;
    if(world.flags&&typeof world.flags==='object')life.world.flags=clone(world.flags);
    life.phone.learned=!!phone.learned;
    if(old.activeTrip&&typeof old.activeTrip==='object'){
      life.desires.activeTrip=clone(old.activeTrip);
      if(old.activeTrip.status==='completed'){
        const entry={id:old.activeTrip.id,title:old.activeTrip.title||null,destination:clone(old.activeTrip.destination||{}),purpose:old.activeTrip.purpose||null,completedAt:old.activeTrip.completedAt||null};life.desires.completed=[entry];
        life.history.push({id:`desire-completed:${old.activeTrip.id}`,type:'desire_completed',tripId:old.activeTrip.id,title:entry.title,destination:entry.destination,purpose:entry.purpose,at:entry.completedAt||old.activeTrip.createdAt||null});
      }
    }
    if(rich.social!==undefined&&rich.social!==null)legacy.richSocial=rich.social;
    for(const k of Object.keys(old))if(!['version','life','rich','world','phone','activeTrip','characters','encounters'].includes(k))legacy[k]=old[k];
    const next=clone(defaults);next.life=merge(next.life,life);next.characters=merge(next.characters,old.characters||{});next.encounters=merge(next.encounters,old.encounters||{});
    if(Object.keys(legacy).length)next.life.migration=legacy;
    return next;
  }
  let state=clone(defaults);
  function load(){try{const raw=localStorage.getItem(KEY);if(raw){const saved=JSON.parse(raw);state=migrateRecord(saved);if(saved.version!==6||!saved.life)save();}else state=clone(defaults);}catch(e){state=clone(defaults);}return state;}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch(e){return false;}}
  function reset(){state=clone(defaults);save();return state;}
  function get(){return state;}
  function patch(path,value){const parts=path.split('.');let cur=state;for(let i=0;i<parts.length-1;i++)cur=cur[parts[i]]||(cur[parts[i]]={});cur[parts.at(-1)]=value;save();return value;}
  function recordEvent(event){if(!event?.id)return false;const history=state.life.history;if(history.some(item=>item.id===event.id))return false;history.push({...event,at:event.at||new Date().toISOString()});save();return true;}
  window.RAState={load,save,reset,get,patch,recordEvent,migrateRecord,defaults:clone(defaults)};
  load();
})();
