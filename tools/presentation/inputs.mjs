// Presentation lock inputs: everything that can change a locked screen's composition. If the hash changes,
// the lock is stale and the screen must go back through SEARCH → LINT → AI JUDGE before re-locking.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';

export const DIRECTOR_VERSION='pd-1';

export async function loadPresentation(root){
 const ctx={window:{},console};vm.createContext(ctx);
 for(const file of ['js/data/stages.js','js/data/presentation.js','js/data/presentation_assets.js','js/data/presentation_locks.js','js/engine/stage.js'])vm.runInContext(await readFile(path.join(root,file),'utf8'),ctx,{filename:file});
 return ctx.window;
}

export function inputsHash(win,stageId,beat){
 const stage=win.RAStages.get(stageId),shot=stage.director.shots[beat],data=win.RAPresentationData,assets=win.RAPresentationAssets;
 const mode=Object.values(data.modes).find(m=>m.id===(shot.mode||'combat'));
 const actorAssets=Object.keys(assets).filter(file=>!assets[file].environment).sort();
 const payload={version:DIRECTOR_VERSION,stage:{id:stage.id,world:stage.world||stage.native,environment:stage.environment,contactLines:stage.contactLines,actors:Object.fromEntries(Object.entries(stage.actors).map(([slot,a])=>[slot,{anchor:a.anchor,flip:!!a.flip}])),director:stage.director},
  shot,profile:data.profiles[shot.profile],mode,reference:data.reference,acceptance:data.acceptance,
  assets:{environment:assets[stage.environment]?.sha256||null,actors:actorAssets.map(file=>[file,assets[file].sha256,assets[file].visible,assets[file].face])}};
 return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0,16);
}
