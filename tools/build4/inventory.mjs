// SR-7 discovery: actual resolved environments, people and adventure nodes with F15 and F07 loaded.
import {boot} from '../tests/f15/_lib.mjs';
import {run} from '../tests/if1/_lib.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const at=process.argv.indexOf('--root');
const root=at>=0?path.resolve(process.argv[at+1]):path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const c=await boot(root);
const man=JSON.parse(await readFile(path.join(root,'js/frag/F07/manifest.json'),'utf8'));
await run(root,c,man.files.filter(p=>!p.includes('/play/')&&!p.includes('page.js')));
c.RAFeatures.set('F07.m8_and_finale',true);
const defs=c.RAAdventures.all(),envUses={},actorUses={};
for(const a of defs)for(const [node,n] of Object.entries(a.nodes||{})){
 const surface=`${a.id}:${node}`;
 if(typeof n.env==='string')(envUses[n.env]||=[]).push(surface);
 for(const actor of Object.values(n.actors&&typeof n.actors==='object'?n.actors:{})){
  const id=typeof actor==='string'?actor:actor?.id;
  if(id)(actorUses[id]||=[]).push(surface);
 }
}
const result={generated:'2026-10-02',adventures:defs.length,
 environments:c.RAEnvironments.all().filter(e=>e.placeholder||!e.image).map(e=>({id:e.id,name:e.name,route:envUses[e.id]||[],fallback:e.paint?'RAPixel.paintEnvironment':'no image'})),
 actors:Object.values(c.RABtfPeople.byId).filter(p=>!p.sprite).map(p=>({id:p.id,name:p.name,route:actorUses[p.id]||[],fallback:'RAPixel person look'})),
 envUses,actorUses};
await mkdir(path.join(root,'art_department/build4'),{recursive:true});
await writeFile(path.join(root,'art_department/build4/RUNTIME_INVENTORY.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({adventures:defs.length,environments:result.environments.map(e=>[e.id,e.route.length]),actors:result.actors.map(e=>[e.id,e.route.length])},null,2));
