// Shared helpers for the F15 launch-trio tests (not a test file: leading underscore).
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {full,run} from '../if1/_lib.mjs';

export const SCENES=['roxy','rosalyn','emerald'].flatMap(d=>[1,2,3,4].map(l=>`F15_${d.toUpperCase()}_L${l}`));
// The headless production game (IF-1 + every fragment the loader lists, F15 included) with the F06 + F15 flags ON.
export async function boot(root,{on=true,seedState=null}={}){
  const c=await full(root,{seedState});
  await run(root,c,['js/frag/F06/migrations.js','js/frag/F06/make_it_rain_tunables.js','js/frag/F06/make_it_rain_core.js']);
  await run(root,c,['js/frag/F15/migrations.js']);
  const manifest=JSON.parse(await readFile(path.join(root,'js/frag/F15/manifest.json'),'utf8'));
  await run(root,c,manifest.files.filter(f=>f!=='js/frag/F15/club.js'));   // club.js is DOM-only; the browser run covers it
  if(on){c.RAFeatures.set('F06.rainmaker',true);c.RAFeatures.set('F15.velvet_rotation',true);}
  c.RAClock.wake({first:true});
  return c;
}
export const day=c=>c.RALife.today().day;
export const money=c=>Number(c.RAState.get().life.resources.money);
export const setMoney=(c,n)=>c.RAState.patch('life.resources.money',n);
export const setDay=(c,n)=>c.RAState.patch('life.world.day',n);
// Credit spend to a dancer through the same path the club uses (after a throw has been paid).
export const give=(c,dancer,amount)=>{const before=money(c);c.RAMoneyLedger.debit(amount,{source:'rainmaker:flick'});return c.RAF15.recordSpend(dancer,amount);};
// Mark scenes completed (as if played) on a given day.
export const complete=(c,id,d)=>c.RAState.patch(`life.adventures.records.${id}`,{status:'completed',count:1,completedDay:d});
