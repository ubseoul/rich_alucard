import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
export async function test(root){
 const source=await fs.readFile(path.join(root,'js/systems/combat_pixel_fx.js'),'utf8'),jobs=[],sounds=[];let now=0,drawn=[];
 const ctx={imageSmoothingEnabled:true,fillStyle:'',clearRect(){drawn=[];},fillRect(...args){assert.ok(args.every(Number.isInteger),'all hard-pixel coordinates must be integers');drawn.push([...args,this.fillStyle]);}};
 const fake=()=>({dataset:{},style:{},className:'',setAttribute(){},getContext(){return ctx;},remove(){this.isConnected=false;}});
 const battle={isConnected:true,dataset:{},append(el){this.canvas=el;el.isConnected=true;},getBoundingClientRect:()=>({left:0,top:0,width:390,height:693}),querySelector:()=>null,addEventListener(){},removeEventListener(){}};
 const actor={getBoundingClientRect:()=>({left:20,top:120,width:80,height:120,bottom:240})},box=id=>({visible:{x:id==='rich'?40:230,y:110,w:70,h:150},contact:{x:80,y:270}});
 const sandbox={window:{},performance:{now:()=>now},document:{createElement:fake},setInterval(fn){jobs.push(fn);return jobs.length;},clearInterval(){},setTimeout(){},Map,WeakMap,Math};sandbox.window=sandbox;
 let attached=[];sandbox.matchMedia=()=>({matches:false});sandbox.RAPresentationDirector={worldRect:()=>({x:0,y:60,w:390,h:300}),actorBox:box};sandbox.RAAudio={preload:async()=>{},oneShot:id=>sounds.push(id),stop(){}};sandbox.RAAudioManifest={get:()=>({type:'one-shot'})};sandbox.RAIronAndGrace={modsFor:()=>attached,engravedName:()=> 'CENSUS'};sandbox.RAIronCatalog={byId:()=>({audio:'GN_01'}),MODS:Object.fromEntries(['blessed_rounds','drum_mag','silencer','scope','gold_plating','custom_engraving'].map(id=>[id,{label:id}]))};
 vm.createContext(sandbox);vm.runInContext(source,sandbox);
 const F=sandbox.RACombatPixelFX;assert.equal(Object.keys(F.MOVES).length,9);assert.equal(Object.keys(F.GUNS).length,13);
 const snapshots=new Set();
 for(const id of ['petty','hex','veil','seance','ringer']){now=0;const spec=Object.freeze({root:battle,attacker:actor,target:actor,action:Object.freeze({type:'move',id}),events:[]});const p=F.move(spec);now=260;jobs.at(-1)();assert.equal(battle.canvas.width,270);assert.equal(ctx.imageSmoothingEnabled,false);assert.ok(drawn.length>0,`${id} must draw pixels`);snapshots.add(JSON.stringify(drawn));assert.equal(p.duration,720);}
 assert.equal(snapshots.size,5,'each learned/magic move must have a distinct presentation');
 const gunSnapshots=new Set();for(const id of Object.keys(F.GUNS)){now=0;F.move({root:battle,attacker:actor,target:actor,action:{type:'gun',id},gun:id,events:[{gun:id}]});now=300;jobs.at(-1)();assert.ok(drawn.length>0,`${id} has a firing shape`);gunSnapshots.add(JSON.stringify(drawn));}
 assert.equal(gunSnapshots.size,13,'gun firing presentations must differ');
 const modSnapshots=new Set();for(const id of Object.keys(sandbox.RAIronCatalog.MODS)){now=0;attached=[id];const host={...battle,dataset:{}};F.move({root:host,attacker:actor,target:actor,action:{type:'gun',id:'lil_oga'},gun:'lil_oga',events:[]});now=260;jobs.at(-1)();modSnapshots.add(JSON.stringify(drawn));}assert.equal(modSnapshots.size,6,'all passive mod overlays must differ');attached=[];
 assert.ok(!source.includes('RAState.patch')&&!source.includes('RAFrag.patch'),'presentation has no save/rule writes');
 const repeated=F.move({root:battle,attacker:actor,target:actor,action:{type:'move',id:'petty'},events:[]});assert.equal(repeated.duration,360,'repeat is no longer than half the full presentation');
 sandbox.matchMedia=()=>({matches:true});F.move({root:battle,attacker:actor,target:actor,action:{type:'move',id:'seance'},events:[]});assert.ok(drawn.length>0,'reduced motion renders the impact frame immediately');
 await Promise.resolve();assert.ok(!sounds.includes('GUNWEAVE'),'unsourced SCAR presentation remains unconsumed');
 const audio={window:{}};audio.window=audio;vm.createContext(audio);vm.runInContext(await fs.readFile(path.join(root,'js/data/audio_manifest.js'),'utf8'),audio);const accepted=audio.RAAudioManifest.get('MAGIC_HEX');vm.runInContext(await fs.readFile(path.join(root,'js/data/audio/parts/F11_seance_pick.js'),'utf8'),audio);const seance=audio.RAAudioManifest.get('MAGIC_SEANCE');assert.equal(seance.selectedFrom,'MAGIC_HEX');assert.equal(seance.file,accepted.file);assert.equal(seance.sourceUrl,accepted.sourceUrl);assert.ok(seance.registered);
 console.log('PASS FINAL-A combat presentation (5 distinct pixel moves, 13 distinct gun firings, 6 distinct passive mod overlays, integer pixels, repeat/reduced-motion, accepted non-gun Séance sound)');
}
