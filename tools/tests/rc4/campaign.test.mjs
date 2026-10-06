import assert from 'node:assert/strict';
import {boot} from '../../rc3/policy-test.mjs';
import {playHost,card} from '../F04/_lib.mjs';
import {run} from '../if1/_lib.mjs';
const plain=x=>JSON.parse(JSON.stringify(x));
export async function test(root){
 const dark=process.env.RA_FLAGS_DARK;delete process.env.RA_FLAGS_DARK;
 try{
  const c=await boot(root),G=c.RARC3,A=c.RAAdventures;
  c.RAState.patch('life.ownership.cars',[]);c.RALife.setFlag('throneDone',true);c.RALife.setFlag('ogunsRaveCompleted',true);
  c.RAState.patch('life.world.day',5);c.RANewOga.patch({mission:3,m1Rewarded:true,m3Rewarded:true,lastMissionDay:4});
  assert.ok(A.start('NEW_OGA_M4',{from:'rc3-story'}));
  const p=A.get('NEW_OGA_M4').nodes.run.minigame.params(A.context());
  assert.equal(p.car,'supra');assert.equal(p.escapeRunner,'Carlos');assert.equal(c.RALife.ownedCars().length,0);
  A.enter('run');G.suspend();assert.equal(G.next().kind,'recovery');
  const before=c.RALife.money();assert.equal(G.settleAttempt('NEW_OGA_M4','run',{quit:true,outcome:'quit'}),'paused');
  assert.equal(c.RALife.money(),before);assert.equal(G.attemptAllowed('NEW_OGA_M4','run'),true);
  G.settleAttempt('NEW_OGA_M4','run',{outcome:'lose'});assert.equal(G.attemptAllowed('NEW_OGA_M4','run'),true);
  G.settleAttempt('NEW_OGA_M4','run',{outcome:'lose'});assert.equal(G.attemptAllowed('NEW_OGA_M4','run'),false);assert.equal(G.canSleep(),true);
  const reload=await boot(root,{seedState:plain(c.RAState.get())});
  assert.equal(reload.RAAdventures.active().node,'run');assert.equal(reload.RAAdventures.active().vars.rc4Paused,true);
  assert.equal(reload.RARC3.attemptAllowed('NEW_OGA_M4','run'),false);
  reload.RAState.patch('life.world.day',6);assert.equal(reload.RARC3.attemptAllowed('NEW_OGA_M4','run'),true);
  A.abandon();G.patch({action:false});
  c.RAFeatures.set('F07.m8_and_finale',true);c.RAFeatures.set('F01.showdown_core',true);
  const host=await playHost(root);c.RAShowdown.play.setTransport(host.transport);c.RAF07Play.useTransport(host.transport);
  const m8=c.RAF07Play.buildRequest('m8');assert.ok(m8.request.garage.owned.includes('HOOPTIE'));assert.equal(m8.carMap.HOOPTIE,undefined);
  const r=await c.RAF07Play.run('m8');assert.equal(r.refused,false,'carless M8 plays the real canonical engine');
  assert.equal(G.read().action,true,'settled PLAY loss or win is meaningful daily action');assert.equal(c.RALife.ownedCars().length,0);
  const result=host.trace.at(-1).res,bank=c.RALife.money();assert.equal(c.RAF07Play.consume(result).duplicate,true);assert.equal(c.RALife.money(),bank);
  assert.equal(G.settlePlay(result,c.RAF07Play.consumed(result.requestId)),false,'credit is once per request');
  G.patch({action:false});assert.equal(G.settlePlay({status:'REFUSED',requestId:'no'},{day:5}),false);assert.equal(G.read().action,false);
  c.RALife.addCar({id:'honda_s2000_pink',short:'S2000'});assert.ok(c.RAF07Play.buildRequest('m8').request.garage.owned.includes('HOOPTIE'));
  // The optional War Room settlement uses the same daily contract.
  c.RAFrag.patch('F04','active',true);c.RAFeatures.set('F04.war_room',true);const job=card(c,'DROP','inglewood');
  c.RAState.patch('life.ownership.cars',[]);const w=await c.RAWarRoomPlay.launch(job,{transport:host.transport});
  assert.equal(w.ok,true);assert.equal(w.summary.status,'COMPLETE');assert.equal(G.read().action,true);assert.equal(c.RALife.ownedCars().length,0);
  // Real authored prerequisites and the one retained continuation.
  assert.equal(A.available('A54'),false);assert.equal(A.start('A54',{from:'rc3-maps'}),false);
  c.RALife.setFlag('jollofWarsWins',1);assert.ok(A.available('A54'));assert.ok(A.start('A54',{from:'rc3-maps'}));
  A.enter('win');A.complete('win');assert.ok(A.start('A56',{from:'chain'}));A.abandon();
  c.RAState.patch('life.world.day',20);c.RALife.setFlag('philProgress',0);c.RALife.setFlag('philLastDay',0);
  assert.ok(A.start('A20',{from:'rc3-maps',vars:{stage:1}}));A.enter('wrap');A.complete('end');assert.equal(A.available('A20'),false,'one Phil stage per day');
  c.RAState.patch('life.world.day',21);assert.equal(A.available('A20'),true);
  // Preserve the verified creator ruling, despite the audit's stale comment inference.
  c.RANewOga.patch({m9Resolved:false,rank:4,trust:3,lastMissionDay:4});c.RANewOgaLadder.completeM9('nah');
  assert.equal(c.RANewOga.current().rank,4);assert.equal(c.RANewOga.current().trust,3);assert.ok(!c.RANewOga.current().m9GrantsWithheld);
  c.RANewOgaLadder.completeM10();assert.equal(c.RANewOga.current().m10GrantsApplied,true);
  c.RANewOga.patch({m4Outcome:'walk_in',m5Completed:true,m6Completed:true,m7Completed:true,m8Resolved:true,finaleBegun:false,m10VampgptReaskDay:12,lastMissionDay:5});c.RAState.patch('life.world.day',6);G.patch({story:false});
  assert.equal(A.available('NEW_OGA_VAMPGPT'),false);assert.equal(G.next().kind,'rest');assert.equal(G.canSleep(),true);
  // Labelled completed-spine fixture: no natural playthrough claim.
  c.RANewOga.patch({mission:11,m1Rewarded:true,m3Rewarded:true,m4Outcome:'walk_in',alternativePending:false,m5Completed:true,m6Completed:true,m7Completed:true,m8Resolved:true,m9Resolved:true,m10Completed:true,finaleBegun:true,finaleDone:true});
  c.RAState.patch('life.momentum.fameFired',false);
  for(const d of [20,21,22,23,24,25,37]){c.RAState.patch('life.world.day',d);assert.equal(G.claimsEnding(),d>=21,`ending day ${d}`);}
  c.RANewOga.patch({m8Resolved:false});assert.equal(G.claimsEnding(),false,'overdue fallback never fabricates mandatory story');
  c.RANewOga.patch({m8Resolved:true});c.RAState.patch('life.momentum.fameFired',true);assert.equal(G.claimsEnding(),false,'once-only ending');
  // Encounter transport recovers without touching a personal garage or engine odds.
  await import(new URL('../f01/play-sim/globals.mjs',import.meta.url));
  const {prepareWorld}=await import(new URL('../../../js/frag/F01/play/adapter.mjs',import.meta.url));
  const first=prepareWorld(plain(m8.request),null);first.garage.lost.HOOPTIE={route:'DEALER'};
  const again=prepareWorld(plain(m8.request),first);assert.ok(again.garage.owned.includes('HOOPTIE'));assert.equal(again.garage.lost.HOOPTIE,undefined);
  console.log('PASS B1 seeded campaign: carless Carlos/M8/War Room, settlement idempotency, retry/reload, live prerequisites, NAH authority, Day21–25/overdue mandatory ending gates');
 }finally{if(dark===undefined)delete process.env.RA_FLAGS_DARK;else process.env.RA_FLAGS_DARK=dark;}
}
