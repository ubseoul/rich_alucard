(function(){
  const KEY='rich_alucard_save_v1';
  const defaults={version:2,rich:{budget:100000,social:null,location:'throne_room'},world:{day:1,month:1},characters:{ceo_assistant_001:{met:true,stolen:false,vampire:false,cracked:false}},encounters:{ceo_prince:{defeated:false,completed:false}},phone:{}};
  const clone=o=>JSON.parse(JSON.stringify(o));
  let state=clone(defaults);
  function merge(base,extra){for(const k in extra){if(extra[k]&&typeof extra[k]==='object'&&!Array.isArray(extra[k])){base[k]=merge(base[k]||{},extra[k]);}else base[k]=extra[k];}return base;}
  function load(){try{const raw=localStorage.getItem(KEY);const saved=raw?JSON.parse(raw):null;state=saved?merge(clone(defaults),saved):clone(defaults);if(!saved||saved.version<2)state.rich.social=null;state.version=2;}catch(e){state=clone(defaults);}return state;}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch(e){return false;}}
  function reset(){state=clone(defaults);save();return state;}
  function get(){return state;}
  function patch(path,value){const parts=path.split('.');let cur=state;for(let i=0;i<parts.length-1;i++)cur=cur[parts[i]]||(cur[parts[i]]={});cur[parts.at(-1)]=value;save();return value;}
  window.RAState={load,save,reset,get,patch,defaults:clone(defaults)};
  load();
})();
