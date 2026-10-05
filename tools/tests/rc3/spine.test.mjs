// RC3 · BUILD A (OL-074/077) — the spine end to end: a fresh life that only follows VampGPT reaches the finale in ~21 days, with a PLAY (fight)
// every day, a strip club night nearly every night, and never runs out of cash (tools/rc3/spine-sim.mjs).
import assert from 'node:assert/strict';
import {simulate} from '../../rc3/spine-sim.mjs';

export async function test(root){
 const m=await simulate(1,{days:24,policy:'naive'});
 assert.equal(m.errors.length,0,`no errors: ${m.errors.join(' | ')}`);
 assert.ok(m.finaleDay>=19&&m.finaleDay<=22,`the finale lands around Day 21 (D${m.finaleDay})`);
 assert.equal(m.final.spine,'DONE');assert.equal(m.final.newOga,'new_oga');
 assert.ok(m.days.slice(0,21).every(d=>/PLAY/.test(d.did)),'a fight/PLAY on every day of the story');
 assert.ok(m.days[0].did.includes('offer')&&m.days[0].did.includes('PLAY'),'Day 1: the offer and the first PLAY');
 assert.ok(m.days[1].did.includes('RAVE'),'Day 2: the rave');assert.ok(/NEW_OGA_M1/.test(m.days[2].did),'Day 3: JUG THE PLUG');
 assert.ok(m.clubNights>=18,`a club night nearly every night (${m.clubNights} of 24)`);assert.ok(m.minMoney>=10000,`never broke (min $${m.minMoney})`);
 console.log(`PASS RC3 spine sim (finale D${m.finaleDay}, ${m.plays} PLAYs, ${m.clubNights} club nights, min cash $${m.minMoney})`);
}
