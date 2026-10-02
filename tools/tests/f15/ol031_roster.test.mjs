// F15 OL-031 launch roster: Roxy, Rosalyn and Emerald are ALL on stage every WAKE; no REQUEST mechanic (withdrawn in OL-029);
// Emerald L3's lost item is the recital sheet music. (Rainmaker §5 rotation is NOT built: it ships with Rainmaker's ten, OL-037.)
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {boot} from './_lib.mjs';

const J=v=>JSON.parse(JSON.stringify(v));
export async function test(root){
 const c=await boot(root);
 const T=c.RAF15Tunables;

 // 1. all three on stage every WAKE: one fixed roster of three, one stage slot each, nothing filters or rotates the roster
 assert.deepEqual(J(T.DANCERS),['roxy','rosalyn','emerald']);
 assert.deepEqual(J(c.RAF15.dancers()),['roxy','rosalyn','emerald']);
 assert.deepEqual(J(Object.keys(T.LAYOUT.slots).sort()),J(Object.values(c.RAF15.mapping()).sort()),'one stage slot per dancer (handles wolf/pink/dragon)');
 for(const f of ['club','dates','core','tunables']){
  const src=(await readFile(`${root}/js/frag/F15/${f}.js`,'utf8')).replace(/^\s*\/\/.*$/gm,'');
  assert.ok(!/stageLineup|\bROTATION\s*:|lineup/i.test(src),`${f}.js has no roster rotation / lineup logic`);
 }

 // 2. no REQUEST mechanic (withdrawn in OL-029)
 for(const f of ['club','dates','core','tunables','roxy','rosalyn','emerald','migrations']){
  const src=await readFile(`${root}/js/frag/F15/${f}.js`,'utf8').then(s=>s.replace(/requestAnimationFrame|cancelAnimationFrame/g,''));
  assert.ok(!/\bREQUEST\b|\brequestDancer\b|\bcallUp\b/.test(src.replace(/^\s*\/\/.*$/gm,'')),`${f}.js has no REQUEST mechanic`);
 }
 assert.ok(!Object.keys(c.RAF15).some(k=>/^request/i.test(k)),'RAF15 exposes no request API');

 // 3. Emerald L3's lost item is the recital sheet music
 const L3=c.RAAdventures.get('F15_EMERALD_L3');assert.ok(L3,'Emerald L3 exists');
 const text=JSON.stringify(L3.nodes);
 assert.ok(/My sheet music\. For the recital\./.test(text),'she lost her sheet music for the recital');
 assert.ok(/a folder of sheet music/.test(text),'the found item is the sheet music');
 console.log('PASS f15 OL-031: three dancers on stage every WAKE (no rotation / lineup logic), no REQUEST mechanic, Emerald L3 lost item = recital sheet music');
}
