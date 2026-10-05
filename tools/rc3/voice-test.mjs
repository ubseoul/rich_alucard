import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {boot} from './policy-test.mjs';
import {run} from '../tests/if1/_lib.mjs';
import {sentences} from '../rc2/text-audit.mjs';
export async function test(root){
 const c=await boot(root),W=c.RAWriting;
 const sheet=JSON.parse(await fs.readFile(path.join(root,'tools/rc3/voice-sheet.json'),'utf8'));
 assert.equal(sheet.length,20);assert.deepEqual(Array.from(W.voiceSheet),sheet);
 for(let i=1;i<=20;i++)assert.equal(W.voice(i),sheet[i-1]);
 assert.equal(W.voice(7),'whats haddenning');assert.equal(W.voice(13),'O ma ṣe o');
 const slots=JSON.parse(await fs.readFile(path.join(root,'tools/rc3/voice-slots.json'),'utf8'));
 assert.equal(Object.keys(slots).length,28);
 for(const [id,line] of Object.entries(slots)){assert.equal(W.voiceSlots[id],line);assert.ok(sentences(line)<=3);}
 const m1=c.RAAdventures.get('NEW_OGA_M1'),m2=c.RAAdventures.get('NEW_OGA_M2');
 assert.equal(m1.nodes.table.lines.find(l=>l[0]==='rich')[1],sheet[10]);
 assert.equal(m1.nodes.table.lines.find(l=>l[1]===sheet[11])[0],'smallie');
 assert.equal(m2.nodes.voice.lines[0][1],sheet[12]);
 assert.equal(m2.nodes.questions.choices.find(x=>x.label==='FLEX').next,'flex_voice');
 assert.deepEqual(Array.from(m2.nodes.flex_voice.lines,l=>l[1]),[sheet[13],sheet[14]]);
 assert.equal(c.RAAdventures.get('A08').nodes.clockout.end.home[1],sheet[3]);
 await run(root,c,['js/data/ogun_rave_content.js']);
 const phases=c.RAOgunRaveContent.interiorPhases;
 for(const [phase,id] of [['arrival',6],['greet',7],['floor1',8],['bllad33Enter',9],['bllad33Enter',10]])assert.ok(phases.find(p=>p.id===phase).dialogue.includes(sheet[id-1]));
 for(const phase of [...phases,...c.RAOgunRaveContent.exteriorPhases])assert.ok(sentences(phase.dialogue)<=3,phase.id);
 assert.equal(c.RAStripClub.terms().cap,Math.floor(c.RALife.money()/2),'first-visit half-bankroll rule still applies');
 assert.equal(W.dancerGreeting('roxy'),slots[21]);assert.equal(W.dancerGreeting('rosalyn'),slots[22]);assert.equal(W.dancerGreeting('emerald'),slots[23]);
 for(const d of ['roxy','rosalyn','emerald'])assert.notEqual(W.throwReaction(d,1),W.throwReaction(d,1000));
 console.log('PASS RC3 voice (20 verbatim lines, 28 authored slots, contextual robbery/interview/rave/ramen placement, three-sentence rave, half-bankroll protection)');
}
