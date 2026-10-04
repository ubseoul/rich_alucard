import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const {boot,mulberry}=await import(pathToFileURL(path.join(root,'tools/tests/f13/_campaign.mjs')).href);
const c=await boot(root,{rng:mulberry(1)});
for(const d of c.RATemptations.defs())console.log([d.id,d.source,'min'+(d.minDay||''),'max'+(d.maxDay||''),d.thread?('thr:'+(typeof d.thread==='function'?'fn':d.thread)):'',d.adventure?(typeof d.adventure==='function'?'advfn':d.adventure):(d.action||''),d.priority?('P'+d.priority):'',d.repeatable?'R':'',d.when?'when':''].join(' '));
console.log('flags',JSON.stringify(c.RAFlagDefaults));
const rel=c.RARelations;console.log(Object.keys(rel));
