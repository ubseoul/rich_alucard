// RC2 · BUILD 1 (OL-063) — GUIDANCE: VampGPT's RECOMMENDED list, the home screen's "do this next" and the pulsing app all read ONE item
// (js/systems/guidance.js). Headless, on the real runtime. The DOM side (the pulse, the tile, the "!") is covered by tools/rc2/browser-path.mjs.
import assert from 'node:assert/strict';
import {boot,mulberry} from '../f13/_campaign.mjs';
import {playHost} from '../f04/_lib.mjs';

const fresh=async root=>{const c=await boot(root,{rng:mulberry(5)});c.RAClock.wake({first:true});for(const f of ['prologueDone','throneDone','firstWakeDone'])c.RALife.setFlag(f,true);return c;};
const ACTION=/^(app:[A-Za-z]+(:[A-Za-z]+)?|go:[a-z:_]+|ogun_rave|close)$/;

export async function test(root){
 // ---- 1. Day 1: the first step is VampGPT itself; its app pulses until opened, then the next step takes over
 {const c=await fresh(root),G=c.RAGuidance;
  const n=G.next();assert.equal(n.id,'vampgpt');assert.equal(n.kind,'story');assert.equal(G.target().app,'vampgpt','the VampGPT tile pulses');assert.equal(G.pulsing('vampgpt'),true);assert.equal(G.pulsing('maps'),false,'one app at a time');
  G.opened('maps');assert.equal(G.pulsing('vampgpt'),true,'opening some other app does not clear it');
  G.opened('vampgpt');assert.equal(G.pulsing('vampgpt'),false,'opening the app clears ITS pulse');assert.equal(c.RALife.flag('guideVampgptOpened'),true);
  const after=G.next();assert.equal(after.id,'meal','Day 1, step 2: something to eat (the cheap-buy showcase)');assert.equal(after.action,'go:tacos');assert.equal(G.target(),null,'a step done from a card or a list does not pulse an app tile');
  assert.ok(!G.recommended().some(r=>r.id==='vampgpt'),'VampGPT does not recommend opening VampGPT');}

 // ---- 2. Day 2: the offer is the next step and WAR ROOM pulses; accepted -> the first PLAY; a PLAY made -> on to the rest
 {const c=await fresh(root),G=c.RAGuidance,api={refresh(){},message(){}};G.opened('vampgpt');
  c.RAClock.sleep();let n=G.next();assert.equal(n.id,'offer');assert.equal(G.target().app,'warRoom');assert.equal(n.action,'app:warRoom');
  G.opened('warRoom');assert.equal(G.pulsing('warRoom'),false,'opened: cleared');
  c.RAPhoneApps.get('warRoom').onAction('accept','',api);n=G.next();assert.equal(n.id,'first_play');assert.equal(n.kind,'story');assert.equal(n.action,'app:warRoom:jobs');
  const host=await playHost(root,{policy:'careful'});c.RAShowdown.play.setTransport(host.transport);
  const i=c.RAWarRoomJobs.buildNightMenu().findIndex(j=>j.routesToPlay);await c.RAPhoneApps.get('warRoom').onAction('play',String(i),api);
  assert.ok(G.story().every(s=>s.id!=='first_play'),'the first PLAY is behind the player');
  assert.ok(['cash','story'].includes(G.next().kind));}

 // ---- 3. the FIRST recommended item is ALWAYS the next story step or a way to make cash — across a fortnight of states, however the player plays
 {const c=await fresh(root),G=c.RAGuidance,api={refresh(){},message(){}};const host=await playHost(root,{policy:'naive'});c.RAShowdown.play.setTransport(host.transport);
  const seen=new Set();
  for(let day=1;day<=14;day++){
   for(const money of [0,900,12000,400000]){c.RAState.patch('life.resources.money',money);
    const list=G.recommended();assert.ok(list.length>=1,`day ${day}: something to recommend`);
    assert.ok(['story','cash'].includes(list[0].kind),`day ${day}, $${money}: first RECOMMENDED is ${list[0].kind}:${list[0].id}, not a story step or a way to make cash`);
    assert.equal(new Set(list.map(x=>x.action)).size,list.length,'no repeated line');
    for(const it of list){assert.match(it.action,ACTION,`dispatchable action: ${it.action}`);assert.ok(it.label&&it.label.length<=40,`short label: ${it.label}`);assert.ok(String(it.sub||'').length<=60);seen.add(it.id);}
    assert.equal(list[0].action,G.next().action,'RECOMMENDED #1 is the home screen do-this-next');}
   if(day===2&&c.RAFrag.read('F04','offer.status')==='available')c.RAPhoneApps.get('warRoom').onAction('accept','',api);
   c.RAState.patch('life.resources.money',150000);c.RAClock.sleep();}
  for(const id of ['meal','shift','club'])assert.ok(seen.has(id),'recommended at some point: '+id);assert.ok(seen.has('first_play')||seen.has('play'),'a PLAY was recommended');
  // every `go:` target is a real place or lane the phone can dispatch
  for(const a of ['tacos','lane:slurp'])assert.ok(c.RAPlaces.get(a)||c.RAVampGPT.lane('money').some(o=>o.go===a),'real destination: '+a);}

 // ---- 4. a story step the player cannot afford yet is replaced, as the FIRST item, by the best way to make that cash (with the gap shown)
 {const c=await fresh(root),G=c.RAGuidance,api={refresh(){},message(){}};G.opened('vampgpt');c.RAClock.sleep();c.RAPhoneApps.get('warRoom').onAction('accept','',api);
  c.RALife.setFlag('ogunsRaveCompleted',true);c.RALife.setFlag('castlePartyHostingUnlocked',true);
  // play is on the board (cash way), the party hall is unaffordable
  const host=await playHost(root,{policy:'careful'});c.RAShowdown.play.setTransport(host.transport);
  const i=c.RAWarRoomJobs.buildNightMenu().findIndex(j=>j.routesToPlay);await c.RAPhoneApps.get('warRoom').onAction('play',String(i),api);
  c.RALife.setFlag('guideAck:story:shift',true);c.RAState.patch('life.adventures.records.A08',{status:'completed',count:1,completedDay:1});
  c.RAState.patch('life.resources.money',20000);
  let n=G.next();assert.equal(n.kind,'cash','unaffordable hall: the first item is a way to make cash');assert.match(n.sub,/TO BUILD THE PARTY HALL/,'with the gap shown');
  c.RAState.patch('life.resources.money',400000);n=G.next();assert.equal(n.id,'party_hall','affordable: the story step comes first');assert.equal(n.kind,'story');}

 // ---- 5. nothing to pulse once everything is acknowledged; the pulse key changes with the step, so a NEW step pulses again
 {const c=await fresh(root),G=c.RAGuidance;G.opened('vampgpt');const k1=G.next().key;c.RAClock.sleep();const k2=G.next().key;assert.notEqual(k1,k2);
  assert.equal(G.target().app,'warRoom');G.opened('warRoom');assert.equal(G.target(),null);}

 console.log('PASS RC2 guidance (VampGPT first, one pulse at a time and cleared on open, Day-2 offer -> first PLAY, the first RECOMMENDED line is always a story step or a way to make cash, unaffordable steps give way to cash with the gap shown)');
}
