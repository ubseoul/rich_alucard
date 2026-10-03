#!/usr/bin/env node
// Foot-contact release gate. Source PNG support pixels are scanned independently of Director metadata;
// feet are projected through the actual camera and compared with the stage's authored floor geometry.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {boot} from './tests/f15/_lib.mjs';
import {visibleNodes} from './presentation-adventure-dryrun.mjs';
import {decodePng} from './presentation/png.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const SIZES=[[360,740],[390,844],[430,932]],SLOTS={farLeft:34,left:72,mid:135,right:198,farRight:238};
const rd=f=>readFile(path.join(root,f),'utf8');
export async function inventory({baseline=false}={}){
 const c=await boot(root);
 for(const file of ['js/data/stages.js','js/data/presentation.js','js/data/presentation_assets.js','js/data/presentation_locks.js','js/engine/stage.js']){
  let code=baseline?execFileSync('git',['-c','gc.auto=0','show',`0c6ccc3d18:${file}`],{cwd:root,encoding:'utf8'}):await rd(file);
  // Expose the historical chooser for the audit only; production geometry is otherwise byte-identical.
  if(baseline&&file==='js/engine/stage.js')code=code.replace('adventureStage,combat2Stage,enterMounted','adventureStage,combat2Stage,chooseShot,enterMounted');
  vm.runInContext(code,c,{filename:file});
 }
 const rows=[],seen=new Set(),people=c.RABtfPeople;
 const assetOf=p=>p?.src||(p?.state&&people.get(p.id)?.states?.[p.state])||(p?.id==='rich'?people.rich?.sprite:people.get(p?.id)?.sprite);
 for(const def of c.RAAdventures.all())for(const vars of [{},...(def.presentationVariants||[])]){
  const dummy=new Proxy({},{get:(t,k)=>k==='vars'?vars:()=>false});
  for(const n of visibleNodes(def,dummy)){
   if(vars.nodes&&!vars.nodes.includes(n.id))continue;
   const e=c.RAEnvironments.get(n.env);if(!e)continue;
   const key=c.RAPresentationData.screenKey(n.env,n.actors),slots=c.RAEnvironments.surfaceLayers(e,{key}).slots,cast={},assets={};
   for(const [slot,v]of Object.entries(n.actors))if(v){const p=typeof v==='string'?{id:v}:v,x=p.x??slots[slot]?.x??SLOTS[slot]??135;cast[slot]={...p,...slots[slot],x,flip:!!p.flip||(p.id==='rich'&&x>150)};assets[slot]=assetOf(p)}
   const sig=key+'|'+JSON.stringify(n.node.shot||null);if(seen.has(sig))continue;seen.add(sig);
   const stage=c.RAPresentationDirector.adventureStage(e,cast,{slots:SLOTS,node:n.node,assets});
   rows.push({key:sig,kind:'adventure',stage,assets,mode:'dialogue',ref:`${def.id}:${n.id}`});
  }
 }
 // Every authored combat enemy, including fights offered from providers rather than node.fight.
 const fights=new Map();for(const def of c.RAAdventures.all())for(const [id,n]of Object.entries(def.nodes))if(n.fight)for(const vars of [{},{where:'slurp'},{where:'grave'}]){
  const A={vars,L:{},get:k=>vars[k],flag:()=>false};let p={};try{p=typeof n.fight.params==='function'?n.fight.params(A):n.fight.params||{}}catch{}
  let env=p.env;try{if(typeof env==='function')env=env(A)}catch{env=null}env=env||'throne';fights.set(`${n.fight.enemy}@${env}`,{enemy:n.fight.enemy,env,ref:`${def.id}:${id}`});
 }
 for(const enemy of Object.keys(c.RACombatData.ENEMIES))if(![...fights.values()].some(f=>f.enemy===enemy))fights.set(`${enemy}@throne`,{enemy,env:'throne',ref:'enemy catalog'});
 for(const [key,f]of fights){const e=c.RAEnvironments.get(f.env)||c.RAEnvironments.get('throne'),def=c.RACombatData.ENEMIES[f.enemy],art=c.RACombatData.enemyArt(f.enemy),states=[art.base,...Object.values(art.roles).map(r=>r.src)].filter((s,i,a)=>s&&a.indexOf(s)===i);
  for(const enemyAsset of states.length?states:[people.get(def.person||f.enemy)?.sprite]){const stage=c.RAPresentationDirector.combat2Stage(e,def.person||f.enemy,{flip:!!art.base,minions:def.minions?5:0,states,enemyScale:def.stageScale});
   const assets={rich:'assets/rich_standing_right.png',enemy:enemyAsset};for(const slot of Object.keys(stage.actors).filter(s=>s.startsWith('minion')))assets[slot]=people.get(def.person||f.enemy)?.sprite;
   rows.push({key:`${key}|${enemyAsset}`,kind:'combat',stage,assets,mode:'combat',ref:f.ref});
  }
 }
 for(const stage of c.RAStages.all())for(const [beat,shot]of Object.entries(stage.director?.shots||{})){
  const slots=Object.keys(stage.actors).concat(Object.keys(stage.objects||{})),base={};
  for(const slot of slots)base[slot]=stage.director.states?.[slot]?.[0]||(slot==='supra'?'assets/jdm_imports/vehicles/supra_mk4_world.png':slot.startsWith('rat')?'assets/property/creatures/giant_rat/giant_rat_alert_96x64.png':null);
  for(const slot of slots)for(const asset of stage.director.states?.[slot]||[base[slot]])if(asset)rows.push({key:`${stage.id}/${beat}/${slot}/${asset}`,kind:'mounted',stage,assets:{...base,[slot]:asset},shot,beat,mode:stage.director.modes?.[beat]||stage.director.mode||'dialogue',ref:stage.id});
 }
 return {c,rows};
}
const sourceCache=new Map();
async function sourceSupport(asset,notes){
 if(sourceCache.has(asset))return sourceCache.get(asset);
 const [file,index]=asset.split('#');let p=decodePng(await readFile(path.join(root,file)));
 if(index!=null){const width=notes[file]?.frames?.width||80,data=Buffer.alloc(width*p.height*4);for(let y=0;y<p.height;y++)p.data.copy(data,y*width*4,(y*p.width+Number(index)*width)*4,(y*p.width+(Number(index)+1)*width)*4);p={width,height:p.height,data}}
 const clip=notes[file]?.support?.box||[0,0,p.width,p.height],threshold=notes[file]?.support?.threshold||16;let row=-1;
 for(let y=clip[1];y<clip[1]+clip[3];y++)for(let x=clip[0];x<clip[0]+clip[2];x++)if(p.data[(y*p.width+x)*4+3]>=threshold)row=Math.max(row,y);
 assert.ok(row>=0,`${asset} has no support pixels`);const result={y:row+1,pixels:p};sourceCache.set(asset,result);return result;
}
export async function audit({baseline=false}={}){
 const {c,rows}=await inventory({baseline}),D=c.RAPresentationDirector,notes=JSON.parse(await rd('tools/presentation/annotations.json')).assets,out=[],missing=[];
 for(const r of rows){for(const [W,H]of SIZES){const L=D.screenLayout(r.mode,W,H),shot=r.shot||D.chooseShot?.(r.stage,{w:L.world.w,h:L.world.h},r.assets)||r.stage.director.shots.default,lock=c.RAPresentationLocks.get(r.stage.id,r.beat||'default');
  const actors=[];for(const [slot,asset]of Object.entries(r.assets)){if(!asset||!c.RAPresentationAssets[asset])missing.push({scene:r.key,slot,asset:asset||null});if(asset)actors.push(D.worldActor(r.stage,slot,asset))}
  if(!actors.length)continue;
  const focal=shot.focal.filter(s=>actors.some(a=>a.slot===s));const cam=D.solve({stage:r.stage,...shot,focal,assets:r.assets,states:r.stage.director.states,view:{w:L.world.w,h:L.world.h},...(lock?{contact:lock.contact,zoom:lock.zoom}:{})}),frame=D.project(r.stage,L,cam,actors,3);
  for(const a of Object.values(frame.actors)){const support=await sourceSupport(a.asset,notes),line=r.stage.contactLines.find(l=>l.id===a.line),floor=L.world.y+(line.y-cam.y)*cam.S,feet=a.sprite.y+support.y*a.k,lift=notes[a.asset.split('#')[0]]?.grounding?.lift||0,delta=feet+lift*a.k-floor;
   out.push({scene:r.key,kind:r.kind,ref:r.ref,width:W,slot:a.slot,asset:a.asset,sourceBaseline:support.y,sourceAnchor:a.meta.anchor[1],sceneFloor:line.y,screenFloor:Math.round(floor*1000)/1000,screenFeet:Math.round(feet*1000)/1000,lift,deltaPx:Math.round(delta*1000)/1000,k:a.k,scale:a.scale,expectedScale:r.stage.actors[a.slot]?.scale??r.stage.objects?.[a.slot]?.scale??line.scale,pass:Math.abs(delta)<=.34&&a.scale===(r.stage.actors[a.slot]?.scale??r.stage.objects?.[a.slot]?.scale??line.scale)});
  }
 }}
 const uniqueMissing=[...new Map(missing.map(m=>[m.scene+'|'+m.slot,m])).values()];
 return {method:'Independent source alpha >=16 bottom edge (prop-only support crop authored where required); actual production Director floor + camera projection at DPR 3; tolerance .34 CSS px (one device pixel). Explicit underwater hover lift is preserved from A00:sensei.',sizes:SIZES,baseline,scenes:rows.length,contacts:out.length,violations:out.filter(r=>!r.pass).length,authoredHoverContacts:out.filter(r=>r.lift).length,maxAbsDeltaPx:Math.max(...out.map(r=>Math.abs(r.deltaPx))),missing:uniqueMissing,rows:out};
}
export async function test(){const r=await audit();assert.equal(r.violations,0,`${r.violations} foot-contact violations: ${JSON.stringify(r.rows.filter(x=>!x.pass).slice(0,10))}`);assert.equal(r.missing.length,0,`${r.missing.length} missing actor states: ${JSON.stringify(r.missing.slice(0,10))}`);console.log(`PASS grounding: ${r.contacts} independently measured actor × scene × width contacts, ${r.scenes} state/scene variants at 360/390/430, zero violations; maximum floor delta ${r.maxAbsDeltaPx}px`);return r;}
if(process.argv[1]===fileURLToPath(import.meta.url)){const baseline=process.argv.includes('--baseline'),r=baseline?await audit({baseline}):await test(),out=path.resolve(process.argv.find(a=>a.startsWith('--out='))?.slice(6)||path.join(root,'docs/evidence/final_a/stage2',baseline?'before.json':'after.json'));await mkdir(path.dirname(out),{recursive:true});await writeFile(out,JSON.stringify(r,null,2)+'\n');console.log(`${baseline?'BASELINE':'AFTER'}: ${r.scenes} scene/state variants, ${r.contacts} contacts, ${r.violations} violations, ${r.missing.length} missing actor states; saved ${out}`)}
