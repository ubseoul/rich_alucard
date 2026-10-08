import assert from 'node:assert/strict';
import path from 'node:path';
import {full,run} from './if1/_lib.mjs';
const root=path.resolve('.');
for(const installed of [false,true]){
 const c=await full(root),listeners=[];
 c.document.readyState='loading';
 c.document.addEventListener=(type,fn)=>{if(type==='DOMContentLoaded')listeners.push(fn);};
 c.RAState.patch('life.adventures.active',{id:'ADDON_EXAMPLE',node:'start',vars:{checkpoint:7}});
 if(installed)listeners.push(()=>{const allowed=c.RARC3.allowed;c.RARC3.allowed=id=>id==='ADDON_EXAMPLE'||allowed(id);});
 await run(root,c,['js/systems/rc3.js']);
 assert.equal(c.RAAdventures.active().vars.checkpoint,7,'startup keeps checkpoint until providers install');
 listeners.forEach(fn=>fn());
 assert.equal(!!c.RAAdventures.active(),installed,'final installed policy decides whether the saved addon can resume');
}
console.log('PASS startup policy provider: checkpoint retained until final policy installation; accepted addon survives, unavailable addon is removed.');
process.exit(0);
