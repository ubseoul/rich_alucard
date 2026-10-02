// F15 OL-031 launch roster: Roxy, Rosalyn and Emerald are ALL on stage every WAKE; the Rainmaker §5 rotation code is present and DORMANT
// (activates only when the roster exceeds 4); no REQUEST mechanic (withdrawn in OL-029); Emerald L3's lost item is the recital sheet music.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {boot} from './_lib.mjs';

const J=v=>JSON.parse(JSON.stringify(v));
export async function test(root){
 const c=await boot(root);
 const R=c.RAF15Tunables.ROTATION;

 // 1. all three on stage every WAKE (any day, any weekday, with or without WHALE); tiers are never read for the trio
 assert.deepEqual(J(c.RAF15Tunables.DANCERS),['roxy','rosalyn','emerald']);
 for(let day=1;day<=60;day++)for(const friday of [false,true])for(const whale of [false,true]){
  assert.deepEqual(J(c.RAF15.stageLineup(undefined,{day,friday,whale})),['roxy','rosalyn','emerald'],`trio on stage day ${day}`);
  assert.deepEqual(J(c.RAF15.stageLineup(['roxy','rosalyn','emerald'].map(id=>({id,tier:'LEGENDARY'})),{day,friday,whale})),['roxy','rosalyn','emerald'],'tiers are ignored at or below the threshold');
 }

 // 2. §5 rotation present, authored numbers, dormant at 4
 assert.equal(R.LINEUP_SIZE,4,'§5: the nightly lineup shows 4');assert.equal(R.ACTIVE_ABOVE,4,'OL-031: dormant until the roster exceeds 4');
 const four=['a','b','c','d'].map(id=>({id,tier:'COMMON'}));
 assert.deepEqual(J(c.RAF15.stageLineup(four,{day:3})),['a','b','c','d'],'a roster of 4 is all on stage: still dormant');
 const ten=[['h1','COMMON'],['h2','COMMON'],['h3','COMMON'],['h4','COMMON'],['r1','RARE'],['r2','RARE'],['r3','RARE'],['r4','RARE'],['l1','LEGENDARY'],['l2','LEGENDARY']].map(([id,tier])=>({id,tier}));
 const tierOf=id=>ten.find(x=>x.id===id).tier;
 for(let day=1;day<=40;day++){
  const wk=c.RAF15.stageLineup(ten,{day,friday:false,whale:true});
  assert.equal(wk.length,4,'weekday lineup shows 4');assert.ok(wk.every(id=>tierOf(id)!=='LEGENDARY'),'weekdays draw from COMMON and RARE only');
  const nw=c.RAF15.stageLineup(ten,{day,friday:true,whale:false});assert.ok(nw.every(id=>tierOf(id)!=='LEGENDARY'),'LEGENDARY needs WHALE status even on Friday/Saturday');
  const we=c.RAF15.stageLineup(ten,{day,friday:true,whale:true});assert.equal(we.length,4);assert.equal(new Set(we).size,4);
  assert.deepEqual(J(c.RAF15.stageLineup(ten,{day,friday:true,whale:true})),J(we),'deterministic');
 }
 assert.ok([...Array(40).keys()].some(d=>c.RAF15.stageLineup(ten,{day:d+1,friday:true,whale:true}).some(id=>tierOf(id)==='LEGENDARY')),'LEGENDARY can appear on Friday/Saturday after WHALE');
 // dormant = nothing in the launch path calls it
 for(const f of ['club','dates','roxy','rosalyn','emerald'])assert.ok(!/stageLineup/.test(await readFile(`${root}/js/frag/F15/${f}.js`,'utf8')),`${f}.js does not call the rotation`);

 // 3. no REQUEST mechanic (withdrawn in OL-029)
 for(const f of ['club','dates','core','tunables','roxy','rosalyn','emerald','migrations']){
  const src=await readFile(`${root}/js/frag/F15/${f}.js`,'utf8').then(s=>s.replace(/requestAnimationFrame|cancelAnimationFrame/g,''));
  assert.ok(!/\bREQUEST\b|\brequestDancer\b|\bcallUp\b/.test(src.replace(/^\s*\/\/.*$/gm,'')),`${f}.js has no REQUEST mechanic`);
 }
 assert.ok(!Object.keys(c.RAF15).some(k=>/^request/i.test(k)),'RAF15 exposes no request API');

 // 4. Emerald L3's lost item is the recital sheet music
 const L3=c.RAAdventures.get('F15_EMERALD_L3');assert.ok(L3,'Emerald L3 exists');
 const text=JSON.stringify(L3.nodes);
 assert.ok(/My sheet music\. For the recital\./.test(text),'she lost her sheet music for the recital');
 assert.ok(/a folder of sheet music/.test(text),'the found item is the sheet music');
 console.log('PASS f15 OL-031: three dancers on stage every WAKE, §5 rotation present + dormant at <=4 (4 shown; weekday COMMON/RARE; LEGENDARY Fri/Sat after WHALE), no REQUEST mechanic, Emerald L3 lost item = recital sheet music');
}
