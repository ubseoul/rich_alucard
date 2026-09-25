#!/usr/bin/env node
// Generates js/data/art_registry.js — the canonical runtime Art Registry for the frozen ART SHIP 004–008 corpus.
// Source of truth: each Ship's ART_SHIP_MANIFEST.json (paths, ids, categories, anchors, derivations) cross-checked
// against art_department/ASSET_REGISTER.json (status FROZEN + sha256) and the actual bytes on disk.
// ART SHIP 008 onward: runtime ids, layer names and activation surfaces come from the Ship's ENGINEERING_ASSET_MAP.json
// and STATE_LAYER_DEFINITIONS.json (never inferred from filenames).
// Frozen PNGs are only read. The generator refuses any file whose bytes, status or dimensions disagree.
// Usage: node tools/art-registry.mjs            (write)
//        import {expectedRegistry} for the release gate (verify up to date)
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodePng} from './presentation/png.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.join(root,'js/data/art_registry.js');
export const SHIPS=['art_ship_004','art_ship_005','art_ship_006','art_ship_007','art_ship_008'];
const json=async rel=>JSON.parse(await readFile(path.join(root,rel),'utf8'));
const sorted=obj=>Object.fromEntries(Object.entries(obj).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,v&&typeof v==='object'&&!Array.isArray(v)?sorted(v):v]));

// Ship 004 predates open ids in its manifest: its six files are identified by path.
const SHIP_004_IDS={
 'assets/goldfish_years/masters/ocean_floor_base_270x480.png':{kind:'environment',id:'ocean_floor'},
 'assets/goldfish_years/layers/ladder_intact_overlay_270x480.png':{kind:'layer',id:'ocean_floor',layer:'ladder_intact'},
 'assets/goldfish_years/layers/ladder_collapsed_overlay_270x480.png':{kind:'layer',id:'ocean_floor',layer:'ladder_collapsed'},
 'assets/goldfish_years/characters/octopus_sensei/octopus_sensei_neutral_96x96.png':{kind:'character',id:'octopus_sensei',state:'neutral',anchor:true},
 'assets/goldfish_years/characters/octopus_sensei/octopus_sensei_point_96x96.png':{kind:'character',id:'octopus_sensei',state:'point'},
 'assets/goldfish_years/characters/octopus_sensei/octopus_sensei_state_sheet_192x96.png':{kind:'sheet',id:'octopus_sensei'}
};
// Anchor pose word(s) from the canonical filename ("accepted anchor pose represented by the canonical filename").
function anchorPose(file,id){
 const stem=path.basename(file,'.png').replace(/_\d+x\d+$/,'');
 if(/(^|_)neutral(_|$)/.test(stem))return stem.slice(stem.indexOf('neutral'));
 const words=stem.split('_'),idWords=new Set(id.split('_'));
 let i=0;while(i<words.length-1&&(idWords.has(words[i])||['sir','power','level','blueberry','mr','dj','the','tastemaker','vantablack','kagebunshin','dorsey','bathory','brown','wyrmwood','dolores'].includes(words[i])||/^[a-z]+$/.test(words[i])&&i===0))i++;
 return words.slice(i).join('_');
}
// ART SHIP 006 state id → state name: strip the identity (or its first word) from the asset id.
function stateName(assetId,identity){
 if(assetId.startsWith(`${identity}_`))return assetId.slice(identity.length+1);
 if(assetId.startsWith('rich_'))return assetId.slice(5);
 return assetId.split('_').slice(1).join('_');
}

// ART SHIP 008: every file is placed by its Engineering Asset Map key; contacts/origins come from the state/layer
// definitions. Exact-origin layers must match their base's native size and carry binary alpha only.
let ship008Maps=null;
async function loadShip008(){
 const map=await json('art_department/ships/art_ship_008/ENGINEERING_ASSET_MAP.json'),defs=await json('art_department/ships/art_ship_008/STATE_LAYER_DEFINITIONS.json');
 ship008Maps={map:Object.fromEntries(map.mappings.map(m=>[m.approved_path,m])),defs:Object.fromEntries(defs.states_and_layers.map(d=>[d.path,d]))};
}
async function ship008Base(f){
 if(!f.source_master?.path)return null;const bytes=await readFile(path.join(root,f.source_master.path));
 if(createHash('sha256').update(bytes).digest('hex')!==f.source_master.sha256)throw new Error(`${f.path}: source master ${f.source_master.path} bytes differ from the Ship record`);
 return decodePng(bytes);
}
const binaryAlpha=png=>{for(let i=3;i<png.data.length;i+=4)if(png.data[i]!==0&&png.data[i]!==255)return false;return true};
function ship008(f,png,base,out,character){
 const m=ship008Maps.map[f.path],d=ship008Maps.defs[f.path];
 if(!m||!d)throw new Error(`${f.path}: ART SHIP 008 file without an Engineering Asset Map / state definition entry`);
 if(m.approved_sha256!==f.sha256||d.approved_sha256!==f.sha256)throw new Error(`${f.path}: Engineering map / state definition sha256 disagrees with the manifest`);
 const key=m.engineering_key,surfaces=m.runtime_surfaces.filter(s=>!s.startsWith('minigame:'));
 if(/LAYER$/.test(f.asset_type)){
  if(!d.contact_or_origin?.exact_origin||String(d.contact_or_origin.origin)!=='0,0')throw new Error(`${f.path}: layer without an exact (0,0) origin contract`);
  if(!binaryAlpha(png))throw new Error(`${f.path}: layer alpha is not binary`);
  if(!base||base.width!==png.width||base.height!==png.height)throw new Error(`${f.path}: exact-origin layer size ${png.width}x${png.height} differs from its base ${f.source_master?.path}`);
  let env,name,over=null;const k=key.match(/^environments\.([a-z_0-9]+)\.layers\.([a-z_0-9]+)$/);
  if(k){env=k[1];name=k[2];}
  else if(/^environments\.([a-z_0-9]+)$/.test(key)){env=key.split('.')[1];name='condition';over=f.source_master.path;}
  else throw new Error(`${f.path}: unsupported layer key ${key}`);
  const e=out.environments[env]||(out.environments[env]={});
  if(over)e.over=over;
  e.layers={...(e.layers||{}),[name]:f.path};
  e.surfaces={...(e.surfaces||{}),[name]:surfaces};
  return;
 }
 if(f.asset_type==='ENVIRONMENT_MASTER'){
  const k=key.match(/^environments\.([a-z_0-9]+)$/);if(!k||png.width!==270||png.height!==480)throw new Error(`${f.path}: environment master contract (${key}, ${png.width}x${png.height})`);
  out.environments[k[1]]={...(out.environments[k[1]]||{}),asset:f.path};return;
 }
 if(/^CHARACTER_STATE/.test(f.asset_type)){
  // Character states: `characters.<id>.states.<state>`; minigame keys name their state through the definition's runtime id.
  const k=key.match(/^characters\.([a-z_0-9]+)\.states\.([a-z_0-9]+)$/),rid=d.runtime_asset_id.match(/^([a-z_0-9]+)\.([a-z_0-9]+)$/);
  const [id,state]=k?[k[1],k[2]]:key.startsWith('minigames.')&&rid?[rid[1],rid[2]]:[];
  if(!id)throw new Error(`${f.path}: unsupported character key ${key}`);
  if(!binaryAlpha(png))throw new Error(`${f.path}: character alpha is not binary`);
  const c=character(id);
  // A corrected delta replaces the runtime state; the original frozen file stays registered as history.
  if(c.states[state]&&c.states[state]!==f.path)c.superseded={...(c.superseded||{}),[state]:c.states[state]};
  c.states[state]=f.path;
  const contact=d.contact_or_origin?.contact;if(!contact)throw new Error(`${f.path}: character state without a contact`);
  if(id==='rich'||!c.contact){if(c.contact&&String(c.contact)!==String(contact))throw new Error(`${f.path}: contact ${contact} disagrees with ${id} ${c.contact}`);if(id==='rich'||c.anchor)c.contact=contact;}
  if(!c.cell)c.cell=[png.width,png.height];
  return;
 }
 throw new Error(`${f.path}: unknown ART SHIP 008 asset type ${f.asset_type}`);
}

export async function buildRegistry(){
 await loadShip008();
 const register=(await json('art_department/ASSET_REGISTER.json')).assets;
 const reg=Object.fromEntries(register.map(a=>[a.path,a]));
 const out={environments:{},characters:{},creatures:{},props:{},vehicles:{},ui:{},sheets:{},assets:{}};
 const openIdByPath={};
 const files=[];
 for(const ship of SHIPS){
  const m=await json(`art_department/ships/${ship}/ART_SHIP_MANIFEST.json`);
  for(const f of m.files){files.push({ship,f});if(f.open_id)openIdByPath[f.path]=f.open_id;}
 }
 for(const {ship,f} of files){
  const r=reg[f.path];
  if(!r)throw new Error(`${f.path}: not in ASSET_REGISTER.json`);
  if(r.status!=='FROZEN')throw new Error(`${f.path}: register status ${r.status}, expected FROZEN`);
  if(r.sha256!==f.sha256)throw new Error(`${f.path}: manifest sha256 disagrees with ASSET_REGISTER.json`);
  const bytes=await readFile(path.join(root,f.path)),sha=createHash('sha256').update(bytes).digest('hex');
  if(sha!==r.sha256)throw new Error(`${f.path}: bytes differ from ASSET_REGISTER.json (frozen authority)`);
  const png=decodePng(bytes);
  if(f.dimensions&&(png.width!==f.dimensions[0]||png.height!==f.dimensions[1]))throw new Error(`${f.path}: dimensions ${png.width}x${png.height} disagree with manifest`);
  out.assets[f.path]={ship:ship.replace('art_ship_',''),sha256:sha,width:png.width,height:png.height,status:'FROZEN'};
  const contact=f.source_anchor||null;
  const cat=f.category||(SHIP_004_IDS[f.path]?.kind||'').toUpperCase();
  const id=f.open_id||f.asset_id;
  const character=(cid)=>out.characters[cid]||(out.characters[cid]={anchor:null,anchorPose:null,cell:null,contact:null,states:{}});
  if(ship==='art_ship_008'){ship008(f,png,/LAYER$/.test(f.asset_type)?await ship008Base(f):null,out,character);continue;}
  if(ship==='art_ship_004'){
   const x=SHIP_004_IDS[f.path];if(!x)throw new Error(`${f.path}: unmapped ART SHIP 004 file`);
   if(x.kind==='environment')out.environments[x.id]={...(out.environments[x.id]||{}),asset:f.path};
   else if(x.kind==='layer')(out.environments[x.id]||(out.environments[x.id]={})).layers={...(out.environments[x.id].layers||{}),[x.layer]:f.path};
   else if(x.kind==='sheet')out.sheets[`${x.id}`]=f.path;
   else{const c=character(x.id);c.states[x.state]=f.path;if(x.anchor){c.anchor=f.path;c.anchorPose=x.state;c.cell=[png.width,png.height];c.contact=contact;}}
  }
  else if(cat==='ENVIRONMENT'||cat==='ENVIRONMENT_STATE'){
   const eid=id;if(png.width!==270||png.height!==480)throw new Error(`${f.path}: environment is not 270x480`);
   if(f.mode&&f.mode!=='RGB'&&!(f.alpha||[]).every(a=>a===255))throw new Error(`${f.path}: environment with transparency needs an explicit layer contract`);
   out.environments[eid]={...(out.environments[eid]||{}),asset:f.path};
  }
  else if(cat==='CHARACTER'){
   const c=character(id);c.anchor=f.path;c.anchorPose=anchorPose(f.path,id);c.cell=[png.width,png.height];c.contact=contact;c.states[c.anchorPose]=f.path;
  }
  else if(cat==='CHARACTER_STATE'||cat==='RICH_CONTEXTUAL_STATE'){
   const identity=cat==='RICH_CONTEXTUAL_STATE'?'rich':openIdByPath[f.derived_from_frozen_master];
   if(!identity)throw new Error(`${f.path}: derived master ${f.derived_from_frozen_master} has no open id`);
   const c=character(identity);c.states[stateName(f.asset_id,identity)]=f.path;
   if(identity==='rich'){c.cell=[png.width,png.height];c.contact=contact;}
  }
  else if(cat==='CREATURE')out.creatures[id]={anchor:f.path,cell:[png.width,png.height],contact};
  else if(cat==='PROP')out.props[id]={asset:f.path,cell:[png.width,png.height]};
  else if(cat==='TOUGE_VEHICLE')(out.vehicles.touge||(out.vehicles.touge={}))[f.asset_id]={asset:f.path,cell:[png.width,png.height],contact};
  else if(cat==='PHONE_APP_ICON')(out.ui.apps||(out.ui.apps={}))[f.asset_id]=f.path;
  else if(cat==='STATE_SHEET')out.sheets[f.asset_id]=f.path;
  else throw new Error(`${f.path}: unknown category ${cat}`);
 }
 return sorted(out);
}

export async function expectedRegistry(){
 const r=await buildRegistry();
 const counts=Object.fromEntries(['environments','characters','creatures','props','sheets'].map(k=>[k,Object.keys(r[k]).length]));
 return `(function(){\n // GENERATED by tools/art-registry.mjs from the ART SHIP 004–008 manifests + ASSET_REGISTER.json — do not edit by hand.\n // Canonical frozen art by runtime id. Every path is FROZEN in the register with a verified sha256; pixels are never modified.\n // Handoff state sheets are listed for provenance only: runtime placement uses the individual masters.\n // ${Object.keys(r.assets).length} frozen files: ${JSON.stringify(counts)}\n window.RAArtRegistry=${JSON.stringify(r,null,1).replace(/\n/g,'\n ')};\n})();\n`;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){await writeFile(target,await expectedRegistry());console.log('js/data/art_registry.js written');}
