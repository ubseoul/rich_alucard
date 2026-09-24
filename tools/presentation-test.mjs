// Presentation Director release-gate checks (deterministic, no browser).
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {expectedAssets} from './presentation-assets.mjs';
import {loadPresentation,inputsHash} from './presentation/inputs.mjs';

const eol=text=>text.replace(/\r\n/g,'\n');

export async function test(root){
 // Asset metadata is generated from the frozen PNGs (and refuses bytes that differ from ASSET_REGISTER.json).
 assert.equal(eol(await readFile(path.join(root,'js/data/presentation_assets.js'),'utf8')),eol(await expectedAssets()),'js/data/presentation_assets.js is stale — run node tools/presentation-assets.mjs');
 const win=await loadPresentation(root);
 assert.ok(win.RAPresentationDirector.runSelfTest(),'Presentation Director self-test');
 // Locked screens: inputs must match what was judged, and the locked choice must still lint at every census size.
 const D=win.RAPresentationDirector;
 for(const [stageId,beats] of Object.entries(win.RAPresentationLocks.all()))for(const [beat,lock] of Object.entries(beats)){
  assert.equal(lock.inputs,inputsHash(win,stageId,beat),`presentation lock ${stageId}/${beat} is stale — re-run the census judge (node tools/presentation-census.mjs --candidates) and re-lock`);
  assert.ok(lock.judge?.agreed,`presentation lock ${stageId}/${beat} has no agreed two-pass judgment`);
  const stage=win.RAStages.get(stageId),shot=stage.director.shots[beat],states=stage.director.states;
  // Runtime variant matrix: every combination of approved focal states must lint (a framing that only works
  // for one content combination is not solved).
  let combos=[{}];for(const slot of shot.focal)combos=combos.flatMap(c=>(states[slot]||[null]).map(asset=>({...c,[slot]:asset})));
  for(const assets of combos)for(const [W,H] of [[360,740],[390,844],[430,932]]){
   const L=D.screenLayout(shot.mode||'combat',W,H),cam=D.solve({stage,profile:shot.profile,focal:shot.focal,reference:shot.reference,assets,states,view:{w:L.world.w,h:L.world.h},contact:lock.contact,zoom:lock.zoom});
   const frame=D.project(stage,L,cam,shot.focal.map(slot=>D.worldActor(stage,slot,assets[slot])),3);frame.layout=L;
   const lint=D.lintFrame(stage,frame,{profile:shot.profile,focal:shot.focal,speakers:shot.speakers,reference:shot.reference,uiRects:[L.hud,L.ui],golden:lock.golden});
   assert.ok(lint.pass,`locked ${stageId}/${beat} fails lint at ${W}x${H} with ${JSON.stringify(assets)}: ${lint.checks.filter(c=>!c.pass).map(c=>`${c.id}=${c.value}`).join(', ')}`);
  }
 }
 console.log('PASS presentation (asset metadata vs frozen register, Director self-test, locked shots × runtime variant matrix lint at 360/390/430)');
}
