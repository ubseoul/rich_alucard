// Gate for the mid-life v12 fixtures (tools/pilot/fixtures/*.json, produced by real simulated lives).
// Each must: migrate to the current schema idempotently; load as the saved game; keep living for 4 real sleeps with every offered
// route playable (no content errors, no stranded active adventure, finite money); and survive a save/load round trip.
import assert from 'node:assert/strict';import {readdir,readFile} from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';
export async function test(root){
 const {loadBtf,drive,driveChain,offers}=await import(pathToFileURL(path.join(root,'tools','pilot','headless.mjs')).href);
 const dir=path.join(root,'tools','pilot','fixtures');const files=(await readdir(dir)).filter(f=>f.endsWith('.json')).sort();assert(files.length>=4,'mid-life fixtures missing');let played=0;
 for(const f of files){const {save}=JSON.parse(await readFile(path.join(dir,f),'utf8'));
  const ctx=await loadBtf(root,{seedState:save});const {RAState,RAClock,RALife,RAAdventures}=ctx;
  const m=RAState.migrateWithReport(save);assert(m.ok&&m.state.version===16,`${f}: migration failed`);assert.equal(JSON.stringify(RAState.migrateWithReport(m.state).state),JSON.stringify(m.state),`${f}: not idempotent`);
  assert.equal(RALife.today().day,save.life.world.day,`${f}: did not load as the saved game`);assert(!RAAdventures.active(),`${f}: saved mid-adventure`);
  for(let n=0;n<4;n++){RAClock.sleep();const w=ctx.RAWakeTriggers.pick();if(w){driveChain(ctx,drive(ctx,w,{from:'wake'}));played++;}
   for(const o of offers(ctx).filter(o=>o.adventure&&RAAdventures.available(o.adventure)).slice(0,3)){const exits=[/I'M GOOD/,/^BACK/,/THAT'S ENOUGH/,/NOT TODAY/,/LEAVE/,/GET OUT/,/JUST SIT/,/THAT'S THE LIST/];const r=driveChain(ctx,drive(ctx,o.adventure,{vars:o.vars||{},prefer:exits}),{prefer:exits});played+=r.length;assert(!RAAdventures.active(),`${f}: ${o.adventure} left an active record`);}
   assert(Number.isFinite(RALife.money()),`${f}: money not finite`);}
  const round=await loadBtf(root,{seedState:RAState.get()});assert.equal(round.RALife.today().day,RALife.today().day,`${f}: save round trip lost the day`);
 }
 console.log(`PASS mid-life fixtures (${files.length} simulated v12 saves: idempotent migration, load, 4 sleeps each, ${played} route plays, round trip)`);
}
