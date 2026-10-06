import assert from 'node:assert/strict';
import {game,run,same} from '../if1/_lib.mjs';
export async function test(root){
 const c=await game(root);await run(root,c,['js/engine/open_audio.js']);const O=c.RAOpenAudio;
 for(const key of Object.keys(O.beats)){const [id,node]=key.split(':');assert(c.RAAdventures.get(id)?.nodes[node],`unknown accepted beat ${key}`);}
 for(const id of Object.keys(O.environments))assert(c.RAEnvironments.get(id),`unknown environment ${id}`);
 for(const [id,moves] of Object.entries(O.enemy))for(const move of Object.keys(moves))assert(c.RACombatData.ENEMIES[id]?.moves[move],`unknown enemy move ${id}:${move}`);
 const originalActive=c.RAAdventures.active,showSounds=[];
 for(const adventure of ['A14','SHOW'])for(const outcome of ['success','failure','quit',undefined])for(const pay of [0,200]){c.RAAdventures.active=()=>({vars:{showOutcome:outcome,pay}});showSounds.length=0;O.beat({sound:id=>showSounds.push(id)},adventure,'result');same(showSounds,outcome==='success'&&pay>0?['CROWD_OOH']:[],`${adventure} crowd cue follows successful paid performance only`);}
 c.RAAdventures.active=originalActive;
 const pending=[],starts=[],stops=[];let cleanup;
 c.RAAudio={preload:()=>new Promise(r=>pending.push(r)),oneShot:id=>{starts.push(id);return true;},part:(id,part)=>{starts.push(id+':'+part);return true;},stop:id=>stops.push(id)};
 c.RAAudioManifest={get:()=>({type:'loop'})};const a=O.scope({isConnected:true},{cleanup:fn=>cleanup=fn});
 const stopped=a.sound('BLENDER');a.stop('BLENDER');pending.shift()();assert.equal(await stopped,false,'released control cannot start a stale decoded loop');
 a.edge('motor',true,'CAR_V12','high');a.edge('motor',false,'CAR_V12','high');pending.shift()();await Promise.resolve();same(starts,[],'released high-RPM voice stays stopped');
 const stale=a.sound('AMB_PIER');cleanup();pending.shift()();assert.equal(await stale,false,'leaving a scene cancels pending ambience');
 assert(stops.includes('CAR_V12:high'),'RPM stop leaves idle component alone');
 console.log('PASS OPEN audio routes (accepted node/environment/enemy keys, release/decode race, scope cancellation, component cleanup)');
}
