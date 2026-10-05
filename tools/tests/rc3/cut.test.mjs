// RC3 · BUILD A (OL-074/076B/077) — THE CUT, on the real runtime: eight phone apps, ten Maps keepers, everything else unreachable, nothing pushed,
// the ladder cannot end early or stall, guns/moves trimmed. Cut = unreachable, never deleted.
import assert from 'node:assert/strict';
import {mulberry} from '../f13/_campaign.mjs';
import {careerBoot} from '../f13/_career.mjs';
import {run} from '../if1/_lib.mjs';

const fresh=async root=>{const {c}=await careerBoot(root,{seed:9,persona:'explorer'});await run(root,c,['js/systems/rc3_cut.js']);c.RAClock.wake({first:true});for(const f of ['prologueDone','throneDone','firstWakeDone'])c.RALife.setFlag(f,true);return c;};

export async function test(root){
 const c=await fresh(root),K=c.RARC3Cut,A=c.RAAdventures;
 // ---- the phone: eight apps, exactly, in order; The Trap is dark
 assert.equal(K.APPS.length,8);assert.equal(K.APPS.map(a=>a.id).join(),'vampgpt,texts,warRoom,stripClub,armory,bank,maps,radio');
 assert.equal(c.RAFlagDefaults['F05.trap'],false,'THE TRAP ships OFF (the headless boot flips it on for the F05 suites)');
 // ---- classification covers every defined adventure; the cut set is the rest
 const counts=c.RACut.counts();assert.equal(counts.optional,10,'ten Maps keepers');assert.ok(counts.cut>=90,`most random adventures are cut (${counts.cut})`);
 for(const id of K.OPTIONAL_IDS)assert.ok(A.get(id),`keeper ${id} exists`);
 for(const id of c.RACut.cutIds()){assert.equal(A.available(id),false,`${id} is unreachable`);}
 assert.equal(A.available('THRONE'),true,'the training dummy stays');
 // ---- non-stripper dates are cut; the dancers' dates stay defined (reached inside the club)
 assert.equal(A.available('DATE'),false);assert.ok(A.all().some(d=>/^F15_/.test(d.id)),'dancer dates exist');
 for(const id of ['A44','ARC_MAZDA_1','A07','A17','A41','A46'])assert.equal(A.available(id),false,`${id} (non-stripper romance) is cut`);
 // ---- nothing is pushed: no random wants, only story wake triggers, only the story INCOMING
 for(let d=0;d<12;d++){c.RAClock.sleep();}
 const live=c.RAState.get().life.temptations.live;assert.ok(live.every(t=>/^f15:/.test(t.id)),'no random wants are generated');
 assert.equal(c.RATemptations.push('day1_hungry'),false);assert.equal(c.RATemptations.ensure('vg_yam'),false);
 for(let d=0;d<30;d++){const w=c.RAWakeTriggers.pick();assert.ok(!w||K.isSpine(w),`wake only ever starts the story: ${w}`);c.RAClock.sleep();}
 assert.ok(c.RAWorldEvents.pending('phone').every(e=>K.STORY_EVENTS.includes(e.id)));
 // ---- the ladder cannot end early
 const labels=(adv,node)=>A.get(adv).nodes[node].choices.map(x=>x.label);
 assert.ok(!labels('NEW_OGA_M1','pitch').includes('NAH'));assert.ok(!labels('NEW_OGA_M1','table').includes('BUY A BOBA AND LEAVE'));assert.ok(!labels('NEW_OGA_M2','debt').some(l=>/END/.test(l)));
 // ---- ...and cannot stall on a car: CANOPY DUTY leaves a loaner
 {const d=await fresh(root);d.RAState.patch('life.newOga',{...d.RAState.get().life.newOga,status:'intern',mission:2});
  assert.equal(d.RALife.ownedCars().length,0);document_dispatch(d,'NEW_OGA_M3');assert.equal(d.RALife.ownedCars().length,1,'Gbenga lends a car');}
 // ---- pace: no beat before its day
 assert.equal(A.available('NEW_OGA_M1'),false,'Day 1: the ladder has not started');c.RAState.patch('life.world.day',K.PACE.NEW_OGA_M1);assert.equal(A.available('NEW_OGA_M1'),true);
 // ---- Maps keepers: gated by their own rules, replaced gates open the window
 c.RAState.patch('life.world.day',20);assert.equal(A.available('A29'),true,'COFFE RUN is no longer Days 2-8 only');assert.equal(A.available('A29C'),false,'the raid waits for the coffe run');
 // ---- guns + moves
 assert.equal(K.GUNS_KEEP.length,5);assert.ok(K.GUNS_KEEP.includes('golden_draco')&&K.GUNS_KEEP.includes('auntie_slipper'));
 assert.equal(K.COMBAT_MENU_MAX,6);
 {const lo=c.RACombat2Rules?.create?null:null;}
 const base=c.RACombat2Rules.create('lil_smack',{}),n0=base.moves.length;assert.equal(n0,4,'core four');
 c.RAState.patch('life.combat.learnedMoves',['petty']);c.RAState.patch('life.combat.learnedSlot','petty');
 const s2=c.RACombat2Rules.create('lil_smack',{});assert.equal(s2.moves.length,5,'core four + one learned move');assert.ok(s2.moves.length+s2.guns.length<=K.COMBAT_MENU_MAX);
 console.log('PASS RC3 cut (8 apps, 10 Maps keepers, cut adventures unreachable, nothing pushed, ladder never ends early or stalls, pace table, 5 guns, <= 6 moves)');
}
function document_dispatch(ctx,id){ctx.document.dispatchEvent(new ctx.CustomEvent('ra:adventure-complete',{detail:{id,outcome:'done'}}));}
