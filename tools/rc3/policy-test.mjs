import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {boot as base} from '../tests/f15/_lib.mjs';
import {run} from '../tests/if1/_lib.mjs';
import {F01_FILES,F04_FILES} from '../tests/F04/_lib.mjs';
import {F02_FILES} from '../tests/F02/_lib.mjs';
export async function boot(root){const c=await base(root);c.setInterval=()=>0;
 await run(root,c,[...F01_FILES,'js/frag/F02/migrations.js',...F02_FILES,'js/frag/F03/new_oga_ladder_close.js',...F04_FILES,...['tunables','play_bridge','gbenga_combat','m8_and_finale'].map(f=>`js/frag/F07/${f}.js`)]);
 c.RAFeatures.set('F02.iron_and_grace',true);c.RAFeatures.set('F02.armory',true);await run(root,c,['js/systems/rc3.js']);return c;}
export async function test(root){
 const c=await boot(root),G=c.RARC3,A=c.RAAdventures;
 assert.equal(G.apps.length,9);assert.equal(new Set(G.apps).size,9);assert.equal(G.maps.length,20);
 c.RAFeatures.set('F05.trap',true);assert.equal(c.RAFeatures.enabled('F05.trap'),false,'cut survives flag override');
 for(const d of A.all())if(!G.allowed(d.id)){assert.equal(A.available(d.id),false,d.id);assert.equal(A.start(d.id),false,d.id);}
 for(const id of G.maps){assert.equal(A.start(id,{from:'phone'}),false);assert.equal(A.start(id,{from:'wake'}),false);assert.ok(A.start(id,{from:'rc3-maps'}),id);A.abandon();}
 assert.equal(c.RAWakeTriggers.pick(),null);assert.equal(G.phoneRoute('instahoe'),false);assert.equal(G.phoneRoute('trap'),false);
 c.RALife.setFlag('throneDone',true);assert.equal(G.next().label,"OGUN'S RAVE");
 c.RALife.setFlag('ogunsRaveCompleted',true);c.RAState.patch('life.world.day',2);assert.equal(G.pendingMission(),'NEW_OGA_M1');assert.ok(A.available('NEW_OGA_M1'),'ramen/cash prerequisite retired');
 // Canonical mission consequences, no optional friends/car/Trap prerequisites, one beat per day.
 const finish=[()=>c.RANewOga.completeM1('STICK_UP'),()=>c.RANewOga.workOffM2(),()=>c.RANewOga.completeM3('complete'),()=>c.RANewOga.completeM4('walk_in'),()=>c.RANewOga.completeM5({outcome:'SUCCESS',amountCaught:30000}),()=>c.RANewOga.completeM6({walked:true}),()=>c.RANewOga.completeM7('take'),()=>c.RAF07.completeM8('win'),()=>c.RANewOgaLadder.completeM9('nah'),()=>c.RANewOgaLadder.completeM10(),()=>c.RANewOgaLadder.completeVampgpt('say_less')];
 const spine=['NEW_OGA_M1','NEW_OGA_M2','NEW_OGA_M3','NEW_OGA_M4','NEW_OGA_M5','NEW_OGA_M6','NEW_OGA_M7','NEW_OGA_M8','NEW_OGA_M9','NEW_OGA_M10','NEW_OGA_VAMPGPT'];
 const economy=[];for(let i=0;i<spine.length;i++){
  assert.equal(G.pendingMission(),spine[i]);assert.ok(A.available(spine[i]),spine[i]);const before=c.RALife.money();G.patch({moneyBefore:before});finish[i]();G.patch({story:true,action:true});assert.equal(G.next().kind,'cash');G.claimCash();const paid=c.RALife.money();assert.ok(paid-before>=15000,'nightly club reserve');assert.equal(G.claimCash(),false,'no duplicate credit');
  c.RALife.spend(5000);c.RALife.setFlag('stripClubLastDay',c.RALife.today().day);assert.ok(G.canSleep());economy.push({day:c.RALife.today().day,mission:spine[i],before,afterCash:paid,afterClub:c.RALife.money()});c.RAClock.sleep();
 }
 assert.equal(G.pendingMission(),'NEW_OGA_FINALE');assert.ok(A.available('NEW_OGA_FINALE'),'finale reached without optional adventures');
 assert.equal(c.RACastle.buy('garage'),false,'collapsed room tiers cannot be bought');
 c.RAState.patch('life.resources.money',255000);assert.ok(c.RACastle.buy('party_hall'),'Party Hall needs savings, not the cut castle party');assert.equal(c.RALife.money(),5000,'club reserve survives the big goal');
 c.RAScenes.current=()=> 'bedroom';const armory=c.RAPhoneApps.get('armory');const api={esc:String,button:(l,a)=>`<button data-phone-action="${a}">${l}</button>`,refresh(){}};
 assert.ok(armory.render('',api).includes('app:armory:move:0'),'moves are folded into Armory');assert.ok(armory.render('move:0',api).includes('do:armory:moveEquip:0|bite'));
 armory.onAction('moveEquip','0|bite',api);assert.equal(c.RALife.life().combat.equippedMoves[0],'bite');
 const all=A.all().filter(d=>d.id!=='RC3_FIGHT');const kept=all.filter(d=>G.allowed(d.id)),cut=all.filter(d=>!G.allowed(d.id));
 await mkdir(path.join(root,'docs/rc3'),{recursive:true});
 const list=items=>items.map(d=>`- ${d.title}`).join('\n');
 await writeFile(path.join(root,'docs/rc3/CUT_LIST.md'),`# Kept\n\n${list(kept)}\n- Ogun's Rave\n\n# Cut\n\n${list(cut)}\n- The Trap\n`);
 await writeFile(path.join(root,'docs/rc3/economy.json'),JSON.stringify(economy,null,2)+'\n');
 console.log(`PASS RC3: nine apps, twenty Maps-only adventures, ${kept.length+1} kept / ${cut.length+1} cut titles, Trap override blocked, canonical ladder + nightly $15K reserve`);
}
if(process.argv[1]?.endsWith('policy-test.mjs'))await test(process.cwd());
