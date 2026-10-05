// RC3 nightly rotation supersedes OL-031's simultaneous stage lineup. All three identities/date paths stay stable.
// No REQUEST mechanic (withdrawn in OL-029); Emerald L3's lost item remains the recital sheet music.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {boot} from './_lib.mjs';

const J=v=>JSON.parse(JSON.stringify(v));
export async function test(root){
 const c=await boot(root);
 const T=c.RAF15Tunables;

 // RC3 overrides the stage lineup. The three identities and date progress remain stable; nightly presentation is tested below.
 assert.deepEqual(J(T.DANCERS),['roxy','rosalyn','emerald']);
 assert.deepEqual(J(c.RAF15.dancers()),['roxy','rosalyn','emerald']);
 assert.deepEqual(J(Object.keys(T.LAYOUT.slots).sort()),J(Object.values(c.RAF15.mapping()).sort()),'one stage slot per dancer (handles wolf/pink/dragon)');
 const {run}=await import('../if1/_lib.mjs');await run(root,c,['js/frag/F15/club.js']);
 assert.deepEqual([1,2,3,4].map(c.RAF15Club.nightDancer),['roxy','rosalyn','emerald','roxy'],'RC3: one performer per night, stable three-night cycle');

 // 2. no REQUEST mechanic (withdrawn in OL-029)
 for(const f of ['club','dates','core','tunables','roxy','rosalyn','emerald','migrations']){
  const src=await readFile(`${root}/js/frag/F15/${f}.js`,'utf8').then(s=>s.replace(/requestAnimationFrame|cancelAnimationFrame/g,''));
  assert.ok(!/\bREQUEST\b|\brequestDancer\b|\bcallUp\b/.test(src.replace(/^\s*\/\/.*$/gm,'')),`${f}.js has no REQUEST mechanic`);
 }
 assert.ok(!Object.keys(c.RAF15).some(k=>/^request/i.test(k)),'RAF15 exposes no request API');

 // 3. Emerald L3's lost item is the recital sheet music
 const L3=c.RAAdventures.get('F15_EMERALD_L3');assert.ok(L3,'Emerald L3 exists');
 const text=JSON.stringify(L3.nodes);
 assert.ok(/sheet music for the recital/.test(text),'she lost her sheet music for the recital');
 assert.ok(/sheet music folder under the bingo cage/.test(text),'the found item is the sheet music');
 console.log('PASS f15 roster: three stable identities, RC3 nightly stage rotation, no REQUEST mechanic, Emerald L3 recital sheet music');
}
