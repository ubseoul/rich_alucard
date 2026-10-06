import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
export async function test(root){
 const read=f=>readFile(path.join(root,f),'utf8');
 const c={console,structuredClone,document:{addEventListener(){},body:{classList:{add(){},remove(){}}}},setTimeout:fn=>{c.timer=fn;return 1;},clearTimeout:()=>{c.timer=null;}};c.window=c;
 let record=null,flags={},phase=null,modalHidden=false,launches=0,fights=0,nextResult={quit:true};
 c.RAState={get:()=>({life:{night:{active:record,completed:[]}}}),patch:(p,v)=>{if(p==='life.night.active')record=v;},recordEvent(){}};
 // Retain one connected session, as the real scene does, so lifecycle ownership checks are meaningful.
 const raveSession={root:{isConnected:true,set hidden(v){modalHidden=v;},get hidden(){return modalHidden;}},session:{setPhase:p=>{phase=p;},commit(){}}};
 c.RARaveScene={current:()=>raveSession};c.scene='ogun-rave';
 c.RAScenes={go:async id=>{c.scene=id;},current:()=>c.scene};
 c.RAMinigames={launch:async()=>{launches++;assert(modalHidden,'rave must not cover rhythm input');return nextResult;}};
 c.RACombatData={ENEMIES:{hunter:{name:'HUNTER',hp:70,pattern:['bolt'],vampireHunter:true}}};
 c.RACombat2={run:async(id,params)=>{fights++;assert(modalHidden,'rave must not cover combat input');assert.equal(id,'ogun_rave_hilt');assert.equal(params.name,'HILT');assert.equal(c.RACombatData.ENEMIES[id].person,'hilt');assert.equal(params.env,'rave_interior');assert.equal(c.RACombatData.ENEMIES[id].vampireHunter,true);return {outcome:'lose'};}};
 c.RALife={today:()=>({day:1}),setFlag:(k,v)=>{flags[k]=v;}};
 c.RAF15Tunables={DANCERS:['roxy','rosalyn','emerald']};
 vm.createContext(c);for(const f of ['js/data/ogun_rave_content.js','js/systems/ogun_rave.js','js/frag/F15/club.js'])vm.runInContext(await read(f),c,{filename:f});
 assert.deepEqual([1,2,3,4,5,6].map(c.RAF15Club.nightDancer),['roxy','rosalyn','emerald','roxy','rosalyn','emerald']);
 assert.deepEqual([0,1,3,4,8,9].map(c.RAF15Club.vipLevel),[0,1,1,2,2,3]);
 const t=c.RAF15Club.targetFor();assert(t.driftAmplitude>0&&t.driftPeriodMs<10000,'target must move rather than lock to a slot');
 record={id:'ogun_rave_001',status:'in_progress',phase:'floor1'};
 await c.RAOgunRave.dance();assert.equal(record.phase,'floor1');assert.equal(modalHidden,false);assert.equal(c.timer,undefined,'quit never starts a fight');
 nextResult={quit:false,outcome:'lose'};await c.RAOgunRave.dance();assert.equal(record.phase,'bllad33Enter','losing rhythm must not block the adventure');assert.equal(record.danceResult,'lose');assert.equal(modalHidden,false);assert.equal(c.timer,undefined,'entrance waits for player choice');assert.equal(fights,0,'rhythm failure never launches an orphaned fight');
 await c.RAOgunRave.fight();assert.equal(fights,1);assert.equal(record.phase,'exterior-outside','losing the hunter fight must still advance');
 record={id:'ogun_rave_001',status:'in_progress',phase:'sprinklers'};await c.RAOgunRave.resume();assert.equal(record.phase,'floor1','old blocked save phase maps to playable floor');
 record.phase='fight';await c.RAOgunRave.resume();assert.equal(fights,2,'reload resumes the hunter fight');assert.equal(record.phase,'exterior-outside');
 assert.equal(launches,2);assert.equal(c.RAOgunRaveContent.interiorPhases.find(p=>p.id==='bllad33Enter').dialogue.includes("oh shit, that's Blad33ee!"),true);
 const css=await read('assets/f01/play/feel.css'),scenes=await read('assets/f01/play/feel-scenes.mjs');assert(css.includes('fonts/monogram.ttf')&&css.includes('fonts/tiny5.ttf'));assert(scenes.includes("el('bedwrap quilt')")&&!scenes.includes("el('bedwrap',A.bedBase())"),'single-hand background regression');
 console.log('PASS RC3 Build B (night rotation, moving target, VIP thresholds, rave quit/lose/legacy reload/fight resume, single PLAY hand, Life OS fonts)');
}
