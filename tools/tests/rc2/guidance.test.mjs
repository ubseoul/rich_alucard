// RC3 · BUILD A (OL-074) — GUIDANCE is the story spine: VampGPT's top line, the home screen's NEXT UP and the pulsing app all read ONE item
// (js/systems/guidance.js). Headless, on the real runtime. (Was the RC2 recommended-list test; the spine replaced the RC2 step list.)
import assert from 'node:assert/strict';
import {boot,mulberry} from '../f13/_campaign.mjs';
import {run} from '../if1/_lib.mjs';
import {playHost} from '../f04/_lib.mjs';

const fresh=async root=>{const c=await boot(root,{rng:mulberry(5)});await run(root,c,['js/systems/rc3_cut.js']);c.RAClock.wake({first:true});for(const f of ['prologueDone','throneDone','firstWakeDone'])c.RALife.setFlag(f,true);return c;};
const ACTION=/^(app:[A-Za-z]+(:[A-Za-z]+)?|story:[A-Z0-9_]+|playNext|ogun_rave|openWorldEvent:[a-z0-9_]+|maps|sleep|close)$/;

export async function test(root){
 // ---- 1. Day 1: the first thing on a new phone is VampGPT (it pulses until opened); the first STORY step is Mister December's offer
 {const c=await fresh(root),G=c.RAGuidance;
  assert.equal(G.target().app,'vampgpt','the VampGPT tile pulses first');assert.equal(G.pulsing('vampgpt'),true);assert.equal(G.pulsing('warRoom'),false,'one app at a time');
  G.opened('maps');assert.equal(G.pulsing('vampgpt'),true,'opening some other app does not clear it');
  G.opened('vampgpt');assert.equal(G.pulsing('vampgpt'),false);assert.equal(c.RALife.flag('guideVampgptOpened'),true);
  const n=G.next();assert.equal(n.id,'offer');assert.equal(n.kind,'story');assert.equal(n.action,'app:warRoom');assert.equal(G.target().app,'warRoom','then the app the next step lives in');
  assert.equal(G.spine().chapter,'PROLOGUE');assert.equal(G.recommended()[0].action,G.next().action,'RECOMMENDED #1 is the home screen NEXT UP');}

 // ---- 2. the day is: story -> PLAY (the fight) -> club -> sleep; one story beat a day
 {const c=await fresh(root),G=c.RAGuidance,api={refresh(){},message(){}};G.opened('vampgpt');
  c.RAPhoneApps.get('warRoom').onAction('accept','',api);
  let n=G.next();assert.equal(n.id,'play');assert.equal(n.action,'playNext','NEXT UP launches the fight directly');
  assert.equal(G.spine().id,'rave');assert.equal(G.spine().ready,false,'Ogun waits for Day 2');assert.equal(G.spine().wait,'DAY 2');
  const host=await playHost(root,{policy:'careful'});c.RAShowdown.play.setTransport(host.transport);
  const i=c.RAWarRoomJobs.buildNightMenu().findIndex(j=>j.routesToPlay);await c.RAPhoneApps.get('warRoom').onAction('play',String(i),api);
  n=G.next();assert.equal(n.id,'club','after the PLAY: the strip club night');
  c.RALife.setFlag('stripClubLastDay',c.RALife.today().day);n=G.next();assert.equal(n.id,'sleep');assert.equal(n.action,'sleep');
  const rows=G.today();assert.equal(rows.map(r=>r.id).join(),'story,play,club,sleep');
  assert.ok(rows.every(r=>r.sub.length<=40),'short rows');}

 // ---- 3. the story step is ALWAYS the first thing recommended when it can be played, and every action is dispatchable
 {const c=await fresh(root),G=c.RAGuidance,api={refresh(){},message(){}};G.opened('vampgpt');
  for(let day=1;day<=6;day++){
   for(const money of [0,900,12000,400000]){c.RAState.patch('life.resources.money',money);
    const list=G.recommended();assert.ok(list.length>=1&&list.length<=4,`day ${day}: a short list`);
    if(G.spine()?.ready)assert.equal(list[0].id,G.spine().id,'the story beat comes first');
    assert.equal(new Set(list.map(x=>x.action+x.id)).size,list.length,'no repeated line');
    for(const it of list){assert.match(it.action,ACTION,`dispatchable action: ${it.action}`);assert.ok(it.label&&it.label.length<=40,`short label: ${it.label}`);assert.ok(String(it.sub||'').length<=70);}}
   if(c.RAFrag.read('F04','offer.status')==='available')c.RAPhoneApps.get('warRoom').onAction('accept','',api);
   c.RAState.patch('life.resources.money',150000);c.RAClock.sleep();}}

 // ---- 4. the ladder follows the pace table: a mission is never ready before its day
 {const c=await fresh(root),G=c.RAGuidance,P=c.RARC3Cut.PACE;
  c.RAFrag.patch('F04','offer.status','accepted');c.RAFrag.patch('F04','active',true);c.RALife.setFlag('ogunsRaveCompleted',true);
  c.RAState.patch('life.world.day',P.NEW_OGA_M1-1);assert.equal(G.spine().id,'NEW_OGA_M1');assert.equal(G.spine().ready,false);assert.equal(G.spine().wait,`DAY ${P.NEW_OGA_M1}`);
  c.RAState.patch('life.world.day',P.NEW_OGA_M1);assert.equal(G.spine().ready,true);assert.equal(G.spine().action,'story:NEW_OGA_M1');}
 console.log('PASS RC3 guidance (the spine: offer -> rave -> ladder, one story beat a day, PLAY -> club -> sleep, one pulse, NEXT UP launches the fight)');
}
