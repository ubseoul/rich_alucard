// IF-1 4C — WAKE/NIGHT bus: deterministic priority order, flag gating, no double-fire, mission voice-note arbitration
// (one per WAKE), night-report slot, and the accepted WAKE handler roster is untouched.
import assert from 'node:assert/strict';
import {game,throwsCode,same} from './_lib.mjs';

// The accepted WAKE/NIGHT handlers at IF-1 v1.0 with their priorities (ids + priority). F00 adds only the two IF-1 handlers.
const ACCEPTED=[['fame-night',-10],['hangover',5],['legacy-bridge',3],['budget',10],['btf-day-flags',15],['rent',20],['property-events',22],['blood-bank-bill',25],['weather',30],['dragon',35],['relations-neglect',40],['music-drops',45],['w2-checkins',48],['ecology-legacy',49],['ecology',50],['onlyvamps-renew',45],['family-thread',55],['a29-tells',55],['e05-routed-wants',61],['a29b-fork',62],['temptations',60],['britney-stakes',66],['a22-city-talking',65],['a23-bllad33-text',72],['richboi-unlock',70],['sealed-slots',75],['world-events',80],['bedroom-company',90],['laura',95],['weekday',999]];
export async function test(root){
  const ctx=await game(root);const {RAClock,RAWakeBus,RAFeatures,RALife,RAState,RAWakeTriggers}=ctx;
  // ---- the accepted roster is intact (ids + priorities); IF-1 adds only its own two handlers
  const info=RAClock.handlerInfo();const byId=new Map(info.map(h=>[h.id,h.priority]));
  for(const [id,priority] of ACCEPTED)if(byId.has(id))assert.equal(byId.get(id),priority,`accepted handler ${id} changed priority`);
  const present=ACCEPTED.filter(([id])=>byId.has(id)).length;assert(present>=24,`accepted handlers missing (${present})`);
  const added=info.filter(h=>!ACCEPTED.some(([id])=>id===h.id)).map(h=>h.id).sort();
  same(added,['if1.crew-timers','night-report','rc2-start','rc2-story-offers'],'IF-1 may add only its own wake/night handlers, the RC2 first-wake start cash (OL-068) and the RC2 B3 story-offer handler');
  // ---- deterministic order: sorted by priority; bus refuses ties (order would depend on load order)
  const order=RAWakeBus.order('wake');const pri=order.map(id=>byId.get(id));assert.deepEqual([...pri],[...pri].sort((a,b)=>a-b),'WAKE order is priority-sorted');
  assert(throwsCode(()=>RAWakeBus.subscribe({id:'f03.tie',fragment:'F03',priority:35,fn(){}}),/already used by dragon/),'tie with an accepted handler rejected');
  assert(throwsCode(()=>RAWakeBus.subscribe({id:'f03.bad',fragment:'F03',phase:'night',priority:5,fn(){}}),/night handlers need priority < 0/));
  assert(throwsCode(()=>RAWakeBus.subscribe({id:'f03.noflag',fragment:'F03',priority:33,flag:'F03.unregistered',fn(){}}),/not registered/));
  assert(throwsCode(()=>RAWakeBus.subscribe({id:'weekday',fragment:'F03',priority:1001,fn(){}}),/already registered/));
  // ---- subscribers run in priority order among accepted handlers, gated by their flag
  RAFeatures.register({id:'F03.bus_test',fragment:'F03'});
  const calls=[];
  RAWakeBus.subscribe({id:'f03.late',fragment:'F03',priority:33.5,flag:'F03.bus_test',fn:c=>calls.push(['late',c.info.day])});
  RAWakeBus.subscribe({id:'f03.early',fragment:'F03',priority:33.25,flag:'F03.bus_test',fn:c=>calls.push(['early',c.info.day])});
  RAWakeBus.subscribe({id:'f03.always',fragment:'F03',priority:33.75,fn:c=>calls.push(['always',c.info.day])});
  const o2=RAWakeBus.order('wake');assert(o2.indexOf('weather')<o2.indexOf('f03.early')&&o2.indexOf('f03.early')<o2.indexOf('f03.late')&&o2.indexOf('f03.late')<o2.indexOf('f03.always')&&o2.indexOf('f03.always')<o2.indexOf('dragon'),'bus subscribers slot into priority order');
  RAClock.sleep();assert.deepEqual(calls.map(c=>c[0]),['always'],'flag OFF: gated subscribers do not run, ungated ones do');
  RAFeatures.set('F03.bus_test',true);calls.length=0;RAClock.sleep();
  assert.deepEqual(calls.map(c=>c[0]),['early','late','always'],'flag ON: subscribers fire in priority order');
  // ---- no accidental double-fire even when the accepted pipeline replays the same day
  const before=calls.length;RAClock.wake({first:true});assert.equal(calls.length,before,'wake({first:true}) replay must not double-fire bus subscribers');
  // ---- night phase runs before the day advances; the night-report slot gathers ordered sections, then empties
  const nightDays=[];RAWakeBus.subscribe({id:'f03.night',fragment:'F03',phase:'night',priority:-5,fn:c=>nightDays.push([c.night.day,RALife.today().day])});
  RAWakeBus.nightReport.contribute({id:'f03.rep-b',fragment:'F03',priority:20,fn:()=>'B'});
  RAWakeBus.nightReport.contribute({id:'f03.rep-a',fragment:'F03',priority:10,fn:()=>({text:'A',n:1})});
  RAWakeBus.nightReport.contribute({id:'f03.rep-none',fragment:'F03',priority:15,fn:()=>null});
  RAWakeBus.nightReport.contribute({id:'f03.rep-gated',fragment:'F03',priority:5,flag:'F03.bus_test',fn:()=>'G'});
  const day=RALife.today().day;RAClock.sleep();
  same(nightDays,[[day,day]],'night handlers run BEFORE the day advances');
  const rep=RAWakeBus.nightReport.last();same(rep.sections.map(s=>s.id),['f03.rep-gated','f03.rep-a','f03.rep-b'],'sections ordered by priority, nulls dropped');
  assert.equal(rep.day,day);assert.equal(RAWakeBus.nightReport.consume().sections.length,3);assert.equal(RAWakeBus.nightReport.last(),null,'consume empties the slot');
  RAFeatures.set('F03.bus_test',false);RAClock.sleep();assert.equal(RAWakeBus.nightReport.last().sections.length,2,'flag OFF drops the gated section');
  RAWakeBus.resetTrace();
  // ---- mission voice-note arbitration: accepted ladder recorded, band + uniqueness enforced, ONE per WAKE
  same(RAWakeBus.voiceNotes.list().map(w=>[w.adventure,w.priority]).filter(([a])=>a.startsWith('NEW_OGA')).sort((a,b)=>b[1]-a[1]),[['NEW_OGA_M1',85],['NEW_OGA_M2',84],['NEW_OGA_M3',83],['NEW_OGA_M4',82],['NEW_OGA_ALTERNATIVE',81],['NEW_OGA_M5',80],['NEW_OGA_M6',79],['NEW_OGA_M7',78]],'accepted NEW OGA voice-note ladder priorities unchanged');
  for(const [adv,p] of Object.entries(RAWakeBus.voiceNotes.assigned))assert.equal(RAWakeTriggers.list().find(w=>w.adventure===adv)?.priority,p,`${adv} priority`);
  assert(throwsCode(()=>RAWakeBus.voiceNotes.define('F03',[{adventure:'X1',priority:60,when:()=>true}]),/outside mission voice-note band/));
  assert(throwsCode(()=>RAWakeBus.voiceNotes.define('F03',[{adventure:'X2',priority:85,when:()=>true}]),/already held by NEW_OGA_M1/));
  assert(throwsCode(()=>RAWakeBus.voiceNotes.define('F03',[{adventure:'X3',priority:77,when:()=>true,flag:'F03.nope'}]),/not registered/));
  RAWakeBus.voiceNotes.define('F03',[{adventure:'F03_TEST_NOTE',priority:77,flag:'F03.bus_test',when:()=>true}]);
  const def=RAWakeTriggers.list().find(w=>w.adventure==='F03_TEST_NOTE');RAFeatures.set('F03.bus_test',false);assert.equal(def.when(RALife.L()),false,'dark: a gated voice note is never eligible');
  RAFeatures.set('F03.bus_test',true);assert.equal(def.when(RALife.L()),true);
  ctx.RAAdventures.define({id:'F03_TEST_NOTE',title:'T',lane:'money',start:'a',nodes:{a:{env:'bedroom',actors:{left:'rich'},lines:[['narrator','x']],end:{outcome:'done'}}}});
  RAState.patch('life.world.flags.wakeTrigger',null);const one=RAWakeTriggers.pick(),two=RAWakeTriggers.pick();assert.equal(one,two,'ONE mission voice note per WAKE: repeated arbitration returns the same single pick');
  console.log('PASS IF-1 wake/night bus (accepted roster intact, deterministic priority order, flag gating, no double-fire, night-report slot, one voice note per WAKE)');
}
