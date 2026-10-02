// F07 finale Phase 1 THE PARTY — OL-029 F: a PLAY that Rich WATCHES ON HIS PHONE from the owambe. Rich is never an actor, a subject or a
// hazard target in the encounter: the squad fights inside F01's group-chat PLAY (the phone), and the narration is the existing text recast
// without Rich as subject. Static + real-runtime checks (no new story text: every asserted sentence already existed in D4's recorded narration).
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {full,run} from '../if1/_lib.mjs';
import {F01_FILES,F04_FILES} from '../F04/_lib.mjs';

const F07='js/frag/F07',F07_FILES=['tunables','play_bridge','gbenga_combat','m8_and_finale'].map(f=>`${F07}/${f}.js`);

async function boot(root){
 const c=await full(root,{});
 await run(root,c,['js/frag/F03/migrations.js',`${F07}/migrations.js`,...F01_FILES,'js/frag/F03/new_oga_ladder_close.js',...F04_FILES,...F07_FILES]);
 c.RAFeatures.set('F07.m8_and_finale',true);c.RAFeatures.set('F03.new_oga_ladder_close',true);c.RAFeatures.set('F01.showdown_core',true);
 return c;
}

const J=v=>JSON.parse(JSON.stringify(v));
export async function test(root){
 const c=await boot(root);
 const def=c.RAAdventures.get('NEW_OGA_FINALE'),party=def.nodes.party;
 const lines=(typeof party.lines==='function'?party.lines(c.RAAdventures.context()):party.lines).map(l=>l[1]);

 // 1. the THE PARTY scene never makes Rich the subject or the hazard target of the encounter
 assert.deepEqual(J(lines),[
  'Gbenga’s boys are cleared through a warehouse full of canopies and stacked chairs without disrupting the owambe.',
  'A canopy pole collapses on whoever is under it. The aunties are non-combatants: they block lines of fire and critique the tactics out loud.'],
  'Phase 1 scene = the existing narration recast with no Rich-as-actor (no new facts)');
 assert.ok(lines.every(l=>!/\bRich\b/.test(l)),'no line puts Rich inside the encounter');
 assert.ok(lines.every(l=>!/Rich included|including you|your tactics/i.test(l)),'no hazard or critique lands on Rich');

 // 2. the encounter itself (F07-owned PLAY config + feed narration) never targets Rich either; the only Rich mention is his crew's side
 const O=await import(new URL('file:///'+root.replace(/\\/g,'/')+'/js/frag/F07/play/owambe.mjs').href);
 for(const [id,text] of Object.entries(O.EVENT_NARRATION))assert.ok(!/\bRich\b/.test(text),`feed narration ${id} has no Rich`);
 for(const card of Object.values(O.CARDS_F07)){
  assert.ok(!/\bRich\b/.test(card.hazard.word),`hazard cause ${card.id} names no Rich`);
  assert.ok(!/\bRich\b(?!’s crew)/.test(card.text),`stage card ${card.id} puts only Rich's crew (never Rich) under the hazard`);
 }
 assert.ok(!/\brich\b/i.test(JSON.stringify(O.JOB.pods)),'no Rich unit in the Phase 1 pods: he is not on the field');

 // 3. Phase 1 is a PLAY (F01's group-chat presentation = the phone), reached from the plan, then THE OFFICE as authored
 assert.equal(def.nodes.p1.minigame.id,'f07_play','Phase 1 runs on the PLAY seam');
 assert.equal(def.nodes.p1.minigame.params({get:()=>['ogas','shannon','pinky']}).kind,'finale_p1');
 assert.ok(def.nodes.duel.fight&&def.nodes.duel.fight.enemy==='gbenga','Phase 2 THE OFFICE stays menu combat vs Gbenga');
 const host=await readFile(root+'/assets/f07/play/index.html','utf8');
 assert.ok(/feel-ui\.mjs/.test(host),'the Phase 1 page is F01\'s own group-chat PLAY UI (the phone)');
 console.log('PASS f07 Phase 1 (OL-029 F): THE PARTY is a PLAY Rich watches on his phone from the owambe: no Rich-as-actor/hazard in scene, feed or stage cards; PLAY seam; THE OFFICE unchanged');
}
