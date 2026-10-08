(function(){
 'use strict';
 // RAAudioParts — IF-1 (4P). Fragment-scoped audio-manifest parts. js/data/audio_manifest.js is GENERATED
 // (tools/audio-build.mjs) from the approved SFX delivery and must not be hand-edited; a fragment therefore registers
 // ITS OWN audio families in its own part file
 //   js/data/audio/parts/<FRAGMENT>_<name>.js   ->   RAAudioParts.register('<FRAGMENT>', { entries:[...], scenes:{...} })
 // which extends the live RAAudioManifest ADDITIVELY (same object, same API): list()/ids/get()/has() include the part
 // entries; existing entries, buses and the F1 audio behavior are untouched. Ids must be NEW (a clash with the base or another
 // part throws). Inert hooks (file:null, registered:false) stay inert exactly as in the base manifest.
 const M=window.RAAudioManifest;
 if(!M)throw new Error('RAAudioParts must load after js/data/audio_manifest.js');
 const baseGet=M.get,baseList=M.list,baseIds=[...M.ids];
 const parts=new Map(),index=new Map(),provenance=[];
 const clone=v=>JSON.parse(JSON.stringify(v));
 const REQUIRED=['id','bus','type','category'];
 function register(fragment,spec){
  if(!fragment||!spec)throw new Error('RAAudioParts.register(fragment,{entries,scenes}) required');
  const entries=spec.entries||[],ids=[];
  for(const e of entries){
   for(const k of REQUIRED)if(!e?.[k])throw new Error(`RAAudioParts(${fragment}): entry missing ${k}`);
   if(!Object.keys(M.busDefaults).includes(e.bus))throw new Error(`RAAudioParts(${fragment}): ${e.id} uses unknown bus ${e.bus}`);
   if(baseGet(e.id)||index.has(e.id)||ids.includes(e.id))throw new Error(`RAAudioParts(${fragment}): audio id ${e.id} already exists — parts may only add new ids`);
   if(e.registered&&!e.file&&!(e.parts||[]).length)throw new Error(`RAAudioParts(${fragment}): ${e.id} is registered:true but has no file`);
   ids.push(e.id);
  }
  const scenes=spec.scenes||{};
  for(const [name,def] of Object.entries(scenes))if(M.scenes[name]&&def.ambience!==undefined&&def.ambience!==M.scenes[name].ambience)throw new Error(`RAAudioParts(${fragment}): scene ${name} ambience is owned by the base manifest`);
  for(const e of entries){const entry=clone(e);index.set(entry.id,entry);}
  for(const [name,def] of Object.entries(scenes)){
   if(!M.scenes[name])M.scenes[name]={ambience:def.ambience??null,preload:[]};
   for(const id of def.preload||[])if(!M.scenes[name].preload.includes(id))M.scenes[name].preload.push(id);
  }
  parts.set(fragment,[...(parts.get(fragment)||[]),...ids]);provenance.push({fragment,ids,scenes:Object.keys(scenes)});
  return ids.length;
 }
 M.get=id=>index.get(id)||baseGet(id);
 M.has=id=>index.has(id)||!!baseGet(id);
 M.list=()=>[...baseList(),...[...index.values()].map(clone)];
 Object.defineProperty(M,'ids',{configurable:true,enumerable:true,get:()=>[...baseIds,...index.keys()]});
 window.RAAudioParts={register,fragments:()=>[...parts.keys()],idsFor:fragment=>[...(parts.get(fragment)||[])],provenance:()=>clone(provenance)};
})();
