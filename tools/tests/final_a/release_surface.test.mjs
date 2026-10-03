import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

export async function test(root){
 const files=['js/systems/devtools.js','js/systems/btf_dev.js','js/systems/test_pilot.js','js/systems/presentation_fixtures.js'];
 const sources=await Promise.all(files.map(f=>readFile(path.join(root,f),'utf8')));
 function boot(search){
  // Simulate a stale dev-enabled class as well as real mounted panel/overlay markup.
  const classes=new Set(['dev-enabled','stage-overlay-active']),listeners=[],nodes=new Map();
  for(const id of ['#devPanel','#stageContractOverlay'])nodes.set(id,{remove(){nodes.delete(id)}});
  const body={classList:{contains:x=>classes.has(x),remove(...xs){xs.forEach(x=>classes.delete(x))},toggle(x,on){if(on)classes.add(x);else classes.delete(x)}}};
  const c={console,URLSearchParams,location:{search},document:{readyState:'complete',body,querySelector:s=>nodes.get(s)||null,addEventListener:(type,fn)=>listeners.push({type,fn})},addEventListener:(type,fn)=>listeners.push({type,fn}),setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},Math};c.window=c;
  vm.createContext(c);sources.forEach((s,i)=>vm.runInContext(s,c,{filename:files[i]}));return {c,classes,listeners,nodes};
 }
 for(const query of ['','?dev=0','?dev=01','?dev=true','?dev=0&dev=1']){
  const {c,classes,listeners,nodes}=boot(query);
  for(const api of ['RADev','RATestPilot','RATestPilotInstall','RAPresentationFixtures'])assert.equal(c[api],undefined,`${query||'normal'} must not install ${api}`);
  assert.equal(nodes.size,0,'normal markup is removed');assert.equal(classes.size,0,'stale developer classes are cleared');assert.equal(listeners.some(x=>x.type==='keydown'),false,'normal page cannot acquire DEV through F2');
 }
 const {c,listeners}=boot('?dev=1');assert.ok(c.RADev);assert.ok(c.RATestPilotInstall);assert.ok(c.RAPresentationFixtures);assert.ok(listeners.some(x=>x.type==='keydown'),'authorized DEV retains F2 toggle');
 console.log('PASS dev=1-only API/control registration; normal, dev=0/01/true and stale-class bypasses blocked');
}
