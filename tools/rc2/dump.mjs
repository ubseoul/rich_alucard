// RC2 scratch: what does a fresh life offer on Days 1-3? (not part of npm test)
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const {boot,mulberry}=await import(pathToFileURL(path.join(root,'tools/tests/f13/_campaign.mjs')).href);
const c=await boot(root,{rng:mulberry(1)});
const {RAAdventures,RALife,RAClock,RATemptations,RAPlaces,RAVampGPT}=c;
const all=RAAdventures.all?RAAdventures.all():[];
console.log('adventures',all.length);
for(const a of all.slice(0,400))console.log([a.id,a.title,a.lane,a.scope||'',a.repeatable?'R':''].join(' | '));
RAClock.wake({first:true});
console.log('day',RALife.today().day,'money',RALife.money(),'flags',JSON.stringify(RALife.life().world.flags));
console.log('whatWeOn',JSON.stringify(RATemptations.whatWeOn().map(t=>t.line)));
console.log('places',JSON.stringify(RAPlaces.visible().map(p=>p.label)));
console.log('money lane',JSON.stringify(RAVampGPT.lane('money').map(o=>o.label)));
