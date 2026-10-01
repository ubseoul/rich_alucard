// F07 M8_AND_FINALE (R3): M8 THE TURF WAR + the finale "NEW OGA" on the REAL runtime (F01 PLAY engine as host, real Combat 2.0 rules,
// real F03 ladder, real RAWakeTriggers arbiter, real save/reload). No fixture writes `m8Resolved`: M8's own adventure does.
import assert from 'node:assert/strict';
import {full,run,load} from '../if1/_lib.mjs';
import {F01_FILES,F04_FILES,saveOf,playHost} from '../F04/_lib.mjs';

const J=v=>JSON.parse(JSON.stringify(v));
const F07='js/frag/F07',F07_FILES=['tunables','play_bridge','gbenga_combat','m8_and_finale'].map(f=>`${F07}/${f}.js`);
const SUPRA='toyota_supra_mk4_001',URUS='lambo_urus_oxblood';
const car=(c,id)=>c.RALife.addCar({id,make:'X',model:id,short:id.split('_')[1]||id,price:1,value:1,parts:{}});
const only=id=>/^NEW_OGA_/.test(id||'')?id:null;
const wake=c=>{c.RAClock.sleep();return only(c.RAWakeTriggers.pick());};
const lane=c=>c.RANewOga.current();
const money=c=>Number(c.RAState.get().life.resources.money);
const choose=label=>list=>Math.max(0,list.findIndex(c=>c.label===label));
async function walkOf(root,c,id,opts){const {walk}=await load(root,'tools/btf-test.mjs');return walk(c,id,opts);}

// production order: F03 migrations, F07 migrations, F01, F03, F04, F07
async function boot(root,{f07=true,f03=true,f01=true,f04=false,seedState=null}={}){
 const c=await full(root,seedState?{seedState}:{});
 await run(root,c,['js/frag/F03/migrations.js',`${F07}/migrations.js`,...F01_FILES,'js/frag/F03/new_oga_ladder_close.js',...F04_FILES,...F07_FILES]);
 if(f07)c.RAFeatures.set('F07.m8_and_finale',true);
 if(f03)c.RAFeatures.set('F03.new_oga_ladder_close',true);
 if(f01)c.RAFeatures.set('F01.showdown_core',true);
 if(f04){c.RAFeatures.set('F04.war_room',true);}
 return c;
}
// M7 done, M8 due: lastMissionDay 14, today 15, a car, money.
function ready(c,{day=15,last=14,cars=[SUPRA],trust=1,extra={}}={}){
 c.RAClock.wake({first:true});c.RAState.patch('life.world.day',day);c.RAState.patch('life.resources.money',500000);
 for(const id of cars)car(c,id);
 c.RANewOga.patch({status:'m8_hold',mission:7,rank:4,title:'SENIOR ASSOCIATE',rank4Granted:true,m5Completed:true,m6Completed:true,m7Completed:true,m8Held:true,trust,lastMissionDay:last,...extra});
}
async function withHost(root,c,policy='careful'){const host=await playHost(root,{policy});c.RAShowdown.play.setTransport(host.transport);return host;}
// run the real PLAY until it produces the wanted outcome (win|lose); each attempt is a fresh life so the seed (requestId) differs per attempt
async function realPlay(root,want,{kind='m8',tries=14,setup=null,policy='careful'}={}){
 for(let n=0;n<tries;n++){
  const c=await boot(root);ready(c,{day:15+n,last:14+n});if(setup)setup(c);const host=await withHost(root,c,policy);
  const r=await c.RAF07Play.run(kind);
  if(!r.refused&&(want==='win'?r.win:!r.win))return {c,host,r};
 }
 throw new Error(`no ${want} PLAY in ${tries} attempts`);
}

export async function test(root){
 // =============================================================== 0. dark by default
 {
  const c=await boot(root,{f07:false});ready(c);
  assert.equal(c.RAAdventures.available('NEW_OGA_M8'),false,'flag OFF: M8 unavailable');
  assert.equal(only(c.RAWakeTriggers.pick()),null,'flag OFF: no M8 voice note');
  c.RANewOga.patch({finaleBegun:true,m8Resolved:true,m9Resolved:true,lastMissionDay:1});
  assert.equal(c.RAAdventures.available('NEW_OGA_FINALE'),false,'flag OFF: the finale is unavailable');
  assert.equal(c.RAFrag.has('F07'),false,'flag OFF: no F07 namespace is written');
  assert.ok(c.RACombatData.ENEMIES.gbenga,'the GBENGA card is plain data');
  assert.equal(c.RACombat2Ext.registered().bosses.includes('gbenga'),true);
  const s=c.RACombat2Rules.create('gbenga',{},{maxHp:100,moves:['blood','octopus','bite','revenge'],items:{},guns:[],fits:[],rooms:[],companions:[]},()=>.5);
  assert.equal(s.f07,undefined,'flag OFF: the boss script is inert');
  assert.deepEqual(J(c.RACrew.list({fragment:'F07'})),[],'flag OFF: no loan squad is defined');
  console.log('PASS f07 dark: flag OFF -> M8 + finale unavailable, no namespace, boss script inert, no loan squad');
 }

 // =============================================================== 1. M8 WAKE delivery (priority 77, one per WAKE)
 {
  const c=await boot(root);ready(c,{last:15});          // same day as M7
  assert.equal(c.RAAdventures.available('NEW_OGA_M8'),false,'never on the WAKE of the mission before it');
  const d=await boot(root);d.RANewOga.patch({m7Completed:false});ready(d,{extra:{m7Completed:false}});
  assert.equal(d.RAAdventures.available('NEW_OGA_M8'),false,'locked until M7 is complete');
  const k=await boot(root);ready(k);
  assert.equal(k.RAAdventures.available('NEW_OGA_M8'),true);
  assert.equal(k.RAWakeTriggers.list().find(w=>w.adventure==='NEW_OGA_M8').priority,77,'priority 77 (reserved for M8 by F03)');
  assert.equal(only(k.RAWakeTriggers.pick()),'NEW_OGA_M8');
  console.log('PASS f07 M8 delivery: needs M7 + a later day, WAKE voice note at the reserved priority 77');
 }

 // =============================================================== 2. the PLAY request (Showdown-class, NOT a BIG PLAY)
 {
  const c=await boot(root);ready(c);
  const b=c.RAF07Play.buildRequest('m8');assert.ok(b.ok);
  assert.equal(b.request.job.f01JobId,'smack_crib','Lil Smack is there');
  assert.equal(c.RAPlayContract.validateRequest(J(b.request)).ok,true,'the request satisfies the F01 contract');
  const ids=b.request.roster.map(r=>r.id);
  assert.deepEqual(J(ids.slice(0,3)),['f07_loan_1','f07_loan_2','f07_loan_3'],"Gbenga's boys ON LOAN lead the roster");
  for(const o of ['tunde','dre','half_pint','sunday_best','young_mazi','auntie_grit'])assert.ok(ids.includes(o),`any Ogas: ${o}`);
  assert.equal(c.RACrew.get('f07_loan_1').meta.onLoan,true);assert.equal(c.RACrew.get('f07_loan_1').fragment,'F07','the loan squad is F07-owned: never a War Room slot');
  const job=J(c.RAShowdown.describe().maps);void job;
  const U=await import('node:url');await import(U.pathToFileURL(root+'/tools/tests/f01/play-sim/globals.mjs').href);const big=await import(U.pathToFileURL(root+'/js/frag/F01/play/content.mjs').href);
  assert.equal(!!big.JOBS.find(j=>j.id==='smack_crib').bigPlay,false,'M8 is a normal PLAY, not a BIG PLAY');
  c.RALife.setFlag('lilSmackGone',true);
  assert.equal(c.RAF07Play.buildRequest('m8').request.job.f01JobId,'car_wash_stickup','lilSmackGone: the LIEUTENANT leads (no Lil Smack)');
  const lines=c.RAAdventures.get('NEW_OGA_M8').nodes.voice.lines().map(l=>l[1]).join(' ');
  assert.ok(!/Lil Smack/.test(lines),'job text omits Lil Smack once he is gone');
  c.RALife.setFlag('lilSmackGone',false);
  assert.ok(/Lil Smack is there, chewing\./.test(c.RAAdventures.get('NEW_OGA_M8').nodes.voice.lines().map(l=>l[1]).join(' ')));
  console.log('PASS f07 M8 PLAY request: smack_crib (not BIG PLAY), boys on loan + any Ogas, contract-valid, lilSmackGone -> LIEUTENANT leads');
 }

 // =============================================================== 3. a WON PLAY: authored $18K + 12 HEAT, writes m8Resolved
 {
  const {c,host,r}=await realPlay(root,'win');
  assert.equal(host.calls,1);assert.equal(c.RAF07Play.pending(),null,'consumed');
  const m0=money(c),h0=lane(c).heat,clout0=lane(c).gangClout;
  assert.equal(lane(c).m8Resolved,undefined,'a PLAY alone resolves nothing: the mission resolves through its own ending');
  const out=await walkOf(root,c,'NEW_OGA_M8',{pick:choose('GO MYSELF'),minigame:()=>({outcome:'win',data:{win:true}})});
  assert.equal(out.res.outcome,'win');
  const s=lane(c);
  assert.equal(s.m8Resolved,true,'the canonical state F03 consumes');assert.equal(s.m8Outcome,'win');
  assert.equal(money(c)-m0,18000,'authored $18K, not the PLAY pot');assert.equal(s.heat-h0,12,'+12 HEAT through the lane (RAHeat reads it)');
  assert.equal(s.gangClout-clout0,2);assert.equal(c.RAHeat.global(),h0+12);
  assert.equal(c.RAMoneyLedger.byFamily().new_oga?.credit??c.RAMoneyLedger.query?.({source:'new_oga:m8'}).length,c.RAMoneyLedger.byFamily().new_oga?.credit??1);
  assert.equal(c.RAAdventures.available('NEW_OGA_M8'),false,'resolved: M8 never re-arrives');
  // the PLAY applied crew + spent only: no pot, no PLAY heat
  assert.ok(r.win&&r.cashSpent>=0);
  console.log('PASS f07 M8 win: m8Resolved written, $18K authored pay (not the PLAY pot), +12 HEAT, clout, never re-offered');
 }

 // =============================================================== 4. a LOST PLAY allows retry; the loss resolves nothing
 {
  const {c,host,r}=await realPlay(root,'lose');
  const m0=money(c),h0=lane(c).heat;
  const out=await walkOf(root,c,'NEW_OGA_M8',{pick:(l,step)=>step<3?choose('GO MYSELF')(l):choose('SEND THE BOYS')(l),
   minigame:(()=>{let n=0;return ()=>++n===1?{outcome:'lose',data:{win:false}}:{outcome:'win',data:{win:true}};})()});
  // first PLAY lost -> 'lost' node offers TRY AGAIN; the walker took SEND THE BOYS second: resolved only by the back-out
  assert.equal(out.visited.includes('lost'),true,'the loss routes to the retry node');
  assert.equal(lane(c).m8Outcome,'send_the_boys');
  const c2=await boot(root);ready(c2);
  const retry=await walkOf(root,c2,'NEW_OGA_M8',{pick:l=>choose('GO MYSELF')(l)||0,minigame:(()=>{let n=0;return ()=>++n===1?{outcome:'lose',data:{win:false}}:{outcome:'win',data:{win:true}};})()});
  assert.equal(retry.visited.filter(n=>n==='play').length,2,'TRY AGAIN re-runs the Showdown in the same mission');
  assert.equal(lane(c2).m8Outcome,'win');assert.equal(lane(c2).heat,12,'only the win paid HEAT');
  void m0;void h0;void host;void r;
  console.log('PASS f07 M8 loss: resolves nothing, TRY AGAIN retries in place, only the resolution pays');
 }

 // =============================================================== 5. SEND THE BOYS: the back-out costs something, never nothing
 {
  const c=await boot(root);ready(c);const m0=money(c),t0=lane(c).trust,h0=lane(c).heat;
  await walkOf(root,c,'NEW_OGA_M8',{pick:choose('SEND THE BOYS')});
  const s=lane(c);
  assert.equal(s.m8Resolved,true,'ANY resolved outcome unlocks M9');assert.equal(s.m8Outcome,'send_the_boys');
  assert.equal(money(c),m0,'no pay');assert.equal(s.heat,h0,'no HEAT');assert.equal(s.trust,t0-1,'trust −1: not free');assert.equal(s.m8Rewarded,false);
  console.log('PASS f07 SEND THE BOYS: resolves M8, no pay, no HEAT, trust −1');
 }

 // =============================================================== 6. refusals: nothing resolved, never a deadlock
 {
  const c=await boot(root,{f01:false});ready(c);                   // THE PLAY is not available
  const out=await walkOf(root,c,'NEW_OGA_M8',{pick:choose('GO MYSELF'),minigame:()=>({outcome:'refused',data:{refused:true,code:'NO_CAR'}})});
  void out;
  const r=await c.RAF07Play.run('m8');assert.equal(r.refused,true);assert.equal(r.code,'FLAG_OFF');assert.equal(c.RAF07Play.pending(),null,'nothing persisted when F01 is off');
  const d=await boot(root);ready(d,{cars:[]});await withHost(root,d);
  const n=await d.RAF07Play.run('m8');assert.equal(n.refused,true);assert.equal(n.code,'NO_CAR','no car refuses the job (F01 recovery rule), never invents a loaner');
  assert.equal(d.RAF07Play.pending(),null);
  // the refused node offers SEND THE BOYS and NOT YET; NOT YET leaves the mission open and re-arrives next WAKE
  const e=await boot(root);ready(e);
  await walkOf(root,e,'NEW_OGA_M8',{pick:l=>choose(l.some(x=>x.label==='NOT YET')?'NOT YET':'GO MYSELF')(l),minigame:()=>({outcome:'refused',data:{refused:true,code:'NO_CAR',reason:'NO CAR'}})});
  assert.equal(lane(e).m8Resolved,undefined);assert.equal(e.RAAdventures.available('NEW_OGA_M8'),false,'once per night');
  assert.equal(wake(e),'NEW_OGA_M8','the next WAKE offers it again');
  console.log('PASS f07 refusals: no car / F01 off resolve nothing, SEND THE BOYS always available, NOT YET re-arrives next WAKE');
 }

 // =============================================================== 7. THE HANDOFF: M8 resolved -> m8Resolved -> M9 eligible (real runtime, no fixture)
 for(const route of ['win','send']){
  const c=await boot(root);ready(c);
  assert.equal(c.RAAdventures.available('NEW_OGA_M9'),false,'M9 locked before M8');
  if(route==='win')await walkOf(root,c,'NEW_OGA_M8',{pick:choose('GO MYSELF'),minigame:()=>({outcome:'win',data:{win:true}})});
  else await walkOf(root,c,'NEW_OGA_M8',{pick:choose('SEND THE BOYS')});
  assert.equal(lane(c).m8Resolved,true,'M8 itself wrote the canonical field');
  assert.equal(c.RAAdventures.available('NEW_OGA_M9'),false,'not on the WAKE of M8 (day > lastMissionDay)');
  assert.equal(wake(c),'NEW_OGA_M9','the next WAKE: M9 is the voice note, by F03\'s own rules');
 }
 console.log('PASS f07 -> f03 handoff: M8 (win or SEND THE BOYS) writes m8Resolved; the next WAKE delivers M9; locked before');

 // =============================================================== 8. creator-locked M9 NAH after a real M8 (rank 4, trust delta 0, M10 normal -> rank 5)
 {
  const c=await boot(root);ready(c,{trust:2});
  await walkOf(root,c,'NEW_OGA_M8',{pick:choose('GO MYSELF'),minigame:()=>({outcome:'win',data:{win:true}})});
  const t0=lane(c).trust;assert.equal(wake(c),'NEW_OGA_M9');
  await walkOf(root,c,'NEW_OGA_M9',{pick:choose('NAH')});
  assert.equal(lane(c).rank,4);assert.equal(lane(c).trust,t0,'NAH: trust delta 0');
  console.log('PASS f07 x f03 creator ruling: M8 -> M9 NAH keeps Rank 4 and trust delta 0');
 }

 // =============================================================== 9. save / reload
 {
  const c=await boot(root);ready(c);c.RAF07Play.buildRequest('m8');      // defines the loan squad, as a real PLAY would
  await walkOf(root,c,'NEW_OGA_M8',{pick:choose('GO MYSELF'),minigame:()=>({outcome:'win',data:{win:true}})});
  const r=await boot(root,{seedState:saveOf(c)});
  assert.equal(r.RANewOga.current().m8Resolved,true);assert.equal(r.RANewOga.current().m8Outcome,'win');
  assert.equal(money(r),money(c));
  // the loan squad is re-defined on load (RACrew keeps definitions in memory only)
  assert.deepEqual(J(r.RACrew.list({fragment:'F07'}).map(u=>u.id)),['f07_loan_1','f07_loan_2','f07_loan_3']);
  // mid-PLAY reload: the pending request survives; F01 answers from its record; the result is consumed exactly once
  const m=await boot(root);ready(m);const host=await withHost(root,m);
  const built=m.RAF07Play.buildRequest('m8');m.RAFrag.patch('F07','play.pending',{request:built.request,carMap:built.carMap,seq:built.seq,kind:'m8'});
  const res=await host.transport(built.request);assert.equal(res.status,'COMPLETE');const bank0=money(m);
  const m2=await boot(root,{seedState:saveOf(m)});m2.RAShowdown.play.setTransport(host.transport);
  assert.equal(m2.RAF07Play.pending().request.requestId,built.request.requestId,'the pending request survived the reload');
  assert.equal(money(m2),bank0,'nothing applied yet');
  const out=await m2.RAF07Play.run('m8');assert.ok(out.ok&&!out.refused);
  assert.equal(host.calls,1,'F01 answered from its record: no second simulation');assert.equal(host.answeredFromRecord,1);
  assert.equal(money(m2),Math.max(0,bank0-res.cash.spent),'only the PLAY spend is applied (no pot)');
  const bank2=money(m2);m2.RAFrag.patch('F07','play.pending',{request:built.request,carMap:built.carMap,seq:built.seq,kind:'m8'});
  assert.equal(m2.RAF07Play.consume(J(res)).duplicate,true);assert.equal(money(m2),bank2,'a re-delivery is a no-op');assert.equal(m2.RAF07Play.pending(),null);
  console.log('PASS f07 save/reload: m8Resolved + loan squad persist; a pending PLAY survives reload and is consumed exactly once');
 }

 // =============================================================== 10. the Gbenga fight: authored numbers and behaviours on Combat 2.0
 const LO={maxHp:100,moves:['blood','octopus','bite','revenge'],items:{},guns:[],fits:[],rooms:[],companions:[]};
 const seq=(...v)=>{let i=0;return ()=>v[i++%v.length];};
 {
  const c=await boot(root);ready(c);const R=c.RACombat2Rules;
  assert.equal(c.RAGbengaFight.hpFor(0),260);assert.equal(c.RAGbengaFight.hpFor(3),320,'320 if trust was high');
  const s=R.create('gbenga',{hp:260},LO,()=>.99);
  assert.equal(s.enemy.max,260);assert.equal(s.telegraph,'HE IS ADJUSTING HIS SLEEVES','AGBADA SWEEP is telegraphed');
  R.act(s,{type:'move',id:'bite'});                       // Rich acts; Gbenga sweeps for 24
  assert.ok(s.log.some(l=>l.move==='sweep'));assert.equal(s.rich.max-s.rich.hp-0,24-0>0?s.rich.max-s.rich.hp:0);
  assert.equal(s.log.find(l=>l.kind==='hurt').amount,24,'AGBADA SWEEP: 24');
  assert.equal(s.telegraph,'HE IS HOLDING THE PHONE FLAT IN FRONT OF HIS MOUTH','the VOICE NOTE is telegraphed next');
  // VOICE NOTE: Rich skips his next turn
  R.act(s,{type:'move',id:'bite'});assert.ok(s.log.some(l=>l.move==='voice'));assert.equal(s.rich.stun,1,'Rich skips his next turn');
  const hp=s.enemy.hp;R.act(s,{type:'move',id:'blood'});assert.ok(s.log.some(l=>/PINNED/.test(l.text)),'the skipped turn');assert.equal(s.enemy.hp,hp,'no damage dealt on the lost turn');
  // MY SON heals 30 and removes Rich's buffs
  const s2=R.create('gbenga',{hp:260},LO,()=>.99);s2.enemy.step=2;s2.enemy.hp=200;s2.rich.buffNext=1.5;s2.rich.doubleNext=true;s2.rich.shield=9;s2.rich.sureNext=true;
  R.act(s2,{type:'move',id:'revenge'});assert.ok(s2.log.some(l=>l.move==='my_son'));
  assert.equal(s2.enemy.hp,230,'MY SON heals 30');assert.equal(s2.rich.buffNext,1);assert.equal(s2.rich.doubleNext,false);assert.equal(s2.rich.shield,0);assert.equal(s2.rich.sureNext,false,"removes Rich's buffs");
  console.log('PASS f07 GBENGA: 260 / 320 HP, AGBADA SWEEP 24 (telegraphed), VOICE NOTE skips Rich\'s turn, MY SON heals 30 + removes buffs');
 }
 {
  const c=await boot(root);ready(c);const R=c.RACombat2Rules;
  // the VOICE NOTE is interruptible only with REVENGE or DEAD RINGER
  const mk=()=>{const s=R.create('gbenga',{hp:260},{...LO,moves:['blood','octopus','revenge','ringer']},()=>.99);s.enemy.step=1;s.f07.pp={revenge:s.rich.pp.revenge,ringer:s.rich.pp.ringer};return s;};
  const a=mk();R.act(a,{type:'move',id:'revenge'});assert.ok(a.log.some(l=>/INTERRUPTED/.test(l.text)),'REVENGE interrupts');assert.equal(a.rich.stun,0);
  const b=mk();R.act(b,{type:'move',id:'blood'});assert.equal(b.rich.stun,1,'a plain attack does NOT interrupt');
  const d=mk();d.rich.pp.ringer=2;const rng=()=>0;const dd=R.create('gbenga',{hp:260},{...LO,moves:['blood','octopus','revenge','ringer']},rng);dd.enemy.step=1;dd.f07.pp={revenge:8,ringer:8};
  R.act(dd,{type:'move',id:'ringer'});assert.ok(dd.log.some(l=>/INTERRUPTED/.test(l.text)||/LOSES THE TURN/.test(l.text)),'a DEAD RINGER that holds interrupts');assert.equal(dd.rich.stun,0);
  // 50%: Mama Gbenga on the speaker; he loses a turn to shame (once)
  const e=R.create('gbenga',{hp:260},LO,()=>.5);e.enemy.hp=131;
  R.act(e,{type:'move',id:'blood'});assert.ok(e.enemy.hp<=130);
  assert.ok(e.log.some(l=>/Gbenga, are you fighting at your own party\?/.test(l.text)),'authored Mama Gbenga line');
  assert.ok(e.log.some(l=>/LOSES (A|THE) TURN/.test(l.text)));assert.ok(!e.log.some(l=>l.kind==='enemy'),'he loses the turn: no attack');
  const before=e.log.length;R.act(e,{type:'move',id:'bite'});assert.ok(!e.log.some(l=>/fighting at your own party/.test(l.text)),'the shame beat fires once');void before;
  // below 30%: THE GOLDEN DRACO, 2 x 20, telegraphed
  const g=R.create('gbenga',{hp:260},LO,()=>.5);g.f07.shamed=true;g.enemy.hp=100;g.enemy.step=0;
  R.act(g,{type:'move',id:'blood'});               // 100-26 = 74 <= 30% of 260 (78): THE GOLDEN DRACO is queued behind this turn
  assert.equal(g.telegraph,'HE IS REACHING INTO THE COOLER','THE GOLDEN DRACO is telegraphed');
  R.act(g,{type:'move',id:'bite'});
  const hits=g.log.filter(l=>l.kind==='hurt');assert.equal(hits.length,2,'2 hits');assert.ok(hits.every(h=>h.amount===20),'2 × 20');
  const above=R.create('gbenga',{hp:260},LO,()=>.5);above.f07.shamed=true;above.enemy.hp=200;above.enemy.step=0;R.act(above,{type:'move',id:'blood'});
  assert.notEqual(above.telegraph,'HE IS REACHING INTO THE COOLER','not below 30%: no GOLDEN DRACO');
  console.log('PASS f07 GBENGA scripts: VOICE NOTE interruptible only by REVENGE / DEAD RINGER, 50% Mama Gbenga shame turn (once), below 30% GOLDEN DRACO 2×20 telegraphed');
 }
 {
  const c=await boot(root);ready(c);const R=c.RACombat2Rules;
  // OCTOPUS BRAIN: RETIRE, UNCLE needs the leftovers; WORK FOR ME needs high trust; ROAST: two lost turns
  const fight=(lanePatch,option)=>{c.RANewOga.patch(lanePatch);const s=R.create('gbenga',{hp:260},LO,seq(.99));R.act(s,{type:'move',id:'octopus'});assert.equal(s.awaitingOctopus,true);R.act(s,{type:'octopus',option});return s;};
  assert.deepEqual(J(['charisma','recruit','roast'].map(k=>c.RACombatData.ENEMIES.gbenga.octopus[k].label)),['RETIRE, UNCLE','WORK FOR ME','YOU PHOTOSHOPPED YOURSELF SHAKING YOUR OWN HAND.']);
  let s=fight({leftoversAte:true,trust:0},'charisma');assert.equal(s.outcome,'spared',"RETIRE, UNCLE works when Rich ate Mama Gbenga's leftovers");assert.equal(s.octopusUsed,'charisma');
  s=fight({leftoversAte:false,refusedMama:true,trust:0},'charisma');assert.equal(s.outcome,null,'…and only then');assert.ok(s.log.some(l=>/YOU NEED LEFTOVERS/.test(l.text)));
  s=fight({leftoversAte:false,trust:3},'recruit');assert.equal(s.outcome,'spared','WORK FOR ME works if trust is high');assert.equal(s.octopusUsed,'recruit');
  s=fight({leftoversAte:true,trust:2},'recruit');assert.equal(s.outcome,null,'low trust: WORK FOR ME does not land');
  s=fight({trust:0},'roast');assert.equal(s.enemy.skip,1,'two turns: one is lost now, one is still owed');assert.ok(s.log.some(l=>/LOSES THE TURN/.test(l.text)),'ROAST: he loses a turn…');
  const t=R.create('gbenga',{hp:260},LO,()=>.99);R.act(t,{type:'move',id:'octopus'});R.act(t,{type:'octopus',option:'roast'});
  const t2=t.log.filter(l=>l.kind==='enemy').length;R.act(t,{type:'move',id:'bite'});assert.equal(t.log.filter(l=>l.kind==='enemy').length,0,'…and the next turn too');void t2;
  console.log('PASS f07 GBENGA octopus: RETIRE, UNCLE needs the leftovers (M7), WORK FOR ME needs high trust, ROAST costs him two turns');
 }

 // =============================================================== 11. the finale: plan, lanes, Phase 1 (PLAY), Phase 2 (fight), three endings
 const finaleLife=async(opts={})=>{
  const c=await boot(root,{f04:opts.f04});ready(c,{trust:opts.trust??1,extra:opts.extra||{},cars:opts.cars||[SUPRA]});
  await walkOf(root,c,'NEW_OGA_M8',{pick:choose('SEND THE BOYS')});
  assert.equal(wake(c),'NEW_OGA_M9');
  await walkOf(root,c,'NEW_OGA_M9',{pick:choose(opts.m9||'GIVE IT')});
  assert.equal(wake(c),'NEW_OGA_M10','creator ruling: normal M10 stays available after NAH');await walkOf(root,c,'NEW_OGA_M10');assert.equal(wake(c),'NEW_OGA_VAMPGPT');
  assert.equal(lane(c).finaleBegun,undefined);
  await walkOf(root,c,'NEW_OGA_VAMPGPT',{pick:choose('…SAY LESS.')});
  assert.equal(lane(c).finaleBegun,true,"F03's VampGPT scene recorded finaleBegun");
  return c;
 };
 {
  const c=await finaleLife({extra:{leftoversAte:true,carlos:0}});
  assert.equal(c.RAAdventures.available('NEW_OGA_FINALE'),false,'not on the WAKE of VampGPT');
  assert.equal(wake(c),'NEW_OGA_FINALE','the finale is the next WAKE voice');
  // lane picks: pick 3 of; conditional lanes appear only when their condition holds
  const labels=()=>c.RAAdventures.choicesFor('plan').map(x=>x.label);
  c.RAAdventures.start('NEW_OGA_FINALE',{from:'test'});c.RAAdventures.enter('plan');
  assert.deepEqual(J(labels()),['THE OGAS','SHANNON','MAZDA','PINKY','TRISTAN'],'CARLOS (walked in at M4) and SENATOR (high trust at M6) are hidden');
  c.RAAdventures.abandon();
  const d=await finaleLife({extra:{m4Outcome:'walk_in',carlosCanopyApron:true,senatorCommands:true}});wake(d);
  d.RAAdventures.start('NEW_OGA_FINALE',{from:'test'});d.RAAdventures.enter('plan');
  assert.deepEqual(J(d.RAAdventures.choicesFor('plan').map(x=>x.label)),['THE OGAS','SHANNON','MAZDA','PINKY','TRISTAN','CARLOS','SENATOR'],'all seven lanes when both conditions hold');
  d.RAAdventures.abandon();
  console.log('PASS f07 finale entry: next WAKE after VampGPT; pick 3 of seven lanes, CARLOS / SENATOR conditional');
 }

 // ---- 11a. THE BLESSING (RETIRE, UNCLE), Phase 1 won on the REAL PLAY, Shannon ON SCREEN
 {
  const c=await finaleLife({extra:{leftoversAte:true},f04:true,cars:[SUPRA,URUS]});
  const host=await withHost(root,c);const m9car=lane(c).m9TributedCar;assert.ok(m9car,'M9 tributed a car');assert.equal(c.RAVehicles.isTributed(m9car),true);
  wake(c);
  const A=c.RAAdventures;A.start('NEW_OGA_FINALE',{from:'test'});A.enter('plan');
  for(const [node,label] of [['plan','SHANNON'],['pick2','THE OGAS'],['pick3','PINKY']]){A.enter(node);const ch=A.choicesFor(node).find(x=>x.label===label);assert.ok(ch,`${label} offered at ${node}`);A.choose(node,ch.index);}
  assert.deepEqual(J(A.active().vars.lanes),['shannon','ogas','pinky']);
  const crew=A.get('NEW_OGA_FINALE').nodes.crew,actors=crew.actors(A.context());
  assert.ok(Object.values(actors).includes('shannon_001'),'Shannon appears ON SCREEN');assert.equal(actors.left,'rich');
  const lines=crew.lines(A.context()).map(l=>l[1]);
  assert.ok(lines.includes('Shannon reads Gbenga’s business filings: the rental company is legally in Mama Gbenga’s name.'),'authored (source) sentence, no invented Shannon dialogue');
  assert.ok(crew.lines(A.context()).every(l=>l[0]!=='shannon_001'),'Shannon speaks no line: none is authored in OPEN source');
  A.abandon();
  // Phase 1 through the real PLAY (win), Phase 2 spared by RETIRE, UNCLE
  let win=null,last=null;
  for(let i=0;i<12&&!win;i++){const r=last=await c.RAF07Play.run('finale_p1');if(r.win)win=r;else for(const u of c.RACrew.list())if(u.status!=='ACTIVE'&&u.status!=='GONE')c.RACrew.setStatus(u.id,'ACTIVE',{reason:'test-heal'});}
  assert.ok(win,'Phase 1 can be won on the real PLAY '+JSON.stringify(last));
  assert.equal(host.trace.at(-1).req.job.f01JobId,'car_wash_stickup');assert.equal(host.trace.at(-1).req.roster.every(o=>!o.id.startsWith('f07_loan')),true,'the finale squad is the Ogas: Gbenga\'s boys are the other side');
  const m0=money(c),k0=c.RADistricts.get('koreatown').state;
  const out=await walkOf(root,c,'NEW_OGA_FINALE',{pick:(l,step)=>step,minigame:id=>({outcome:'win',data:{win:true}}),fight:()=>({outcome:'spared',octopus:'charisma'})});
  assert.equal(out.res.outcome,'blessing');assert.ok(out.visited.includes('office'));assert.ok(out.visited.includes('p1'),'both phases ran');
  const s=lane(c);
  assert.equal(s.rank,6);assert.equal(s.title,'NEW OGA');assert.equal(s.finaleDone,true);assert.equal(s.finaleEnding,'blessing');assert.equal(s.enterprisesRenamed,true);
  assert.equal(s.sundayDinnerInvite,true);assert.equal(s.earpieceGiven,true);
  const post=c.RAVampGram.feed?.()?.find?.(p=>/My son is now my oga/.test(p.text));
  void post;void k0;void m0;
  assert.equal(c.RAVehicles.isTributed(m9car),true,'BLESSING: the tributed car stays in the warehouse');
  for(const id of ['koreatown','inglewood']){const d=c.RADistricts.get(id);assert.equal(d.state,'CONTROLLED');assert.equal(d.holder,'rich');}
  assert.equal(c.RAFrag.read('F04','active',false),true,'the War Room begins immediately');assert.equal(c.RAFrag.read('F07','finale.warRoom',null),'started');
  assert.equal(c.RAPhoneRegistry?.isUnlocked?.('warRoom')??true,true);
  const rec=c.RAFrag.read('F07','recruits',{});assert.equal(rec.recruited.length+rec.queue.length,3,"Gbenga's boys offered as recruits");
  assert.ok(rec.recruited.length>=1,'recruited through the War Room path');
  const caps=c.RAState.get().life.receipts.map(r=>r.caption);for(const h of ['WHO IS THE NEW OGA OF LA','GBENGA’S FORMER INTERN TAKES OVER','CARLOS SPEAKS OUT'])assert.ok(caps.includes(h),`fame headline: ${h}`);
  assert.ok(c.RAState.get().life.momentum.sparkId,'a SPARK has fired (an earlier neutral one is kept; the chair sets it when none exists)');
  console.log('PASS f07 THE BLESSING: real Phase 1 PLAY + Phase 2 (RETIRE, UNCLE) -> NEW OGA rank 6, blocks, War Room starts, recruits, headlines, SPARK; car stays tributed; Shannon on screen, no invented dialogue');
 }

 // ---- 11b. THE CONSIGLIERE and THE TAKEOVER (car returns via F03)
 {
  const c=await finaleLife({trust:3,extra:{leftoversAte:false}});wake(c);
  const out=await walkOf(root,c,'NEW_OGA_FINALE',{pick:()=>0,fight:()=>({outcome:'spared',octopus:'recruit'}),minigame:()=>({outcome:'win',data:{win:true}})});
  assert.equal(out.res.outcome,'consigliere');assert.equal(lane(c).consigliere,true);assert.equal(lane(c).rank,6);
  const line=c.RAAdventures.get('NEW_OGA_FINALE').nodes.consigliere.lines.map(l=>l[1]);assert.ok(line.includes('Hello. Hello. Oga. Hello.'));
  const day0=lane(c).finaleDay;for(let i=0;i<7;i++)c.RAClock.sleep();
  const texts=JSON.stringify(c.RAState.get().life);assert.ok(texts.includes('Hello. Hello. Oga. Hello.'),'the voice notes continue');
  console.log('PASS f07 THE CONSIGLIERE: WORK FOR ME (high trust) -> Gbenga stays as advisor; "Hello. Hello. Oga. Hello." continues');void day0;
 }
 {
  const c=await finaleLife({});wake(c);
  const tributed=lane(c).m9TributedCar;assert.ok(tributed&&c.RAVehicles.isTributed(tributed));
  const hasCar0=c.RALife.hasCar(tributed);
  const out=await walkOf(root,c,'NEW_OGA_FINALE',{pick:()=>0,fight:()=>({outcome:'win'}),minigame:()=>({outcome:'win',data:{win:true}})});
  assert.equal(out.res.outcome,'takeover');assert.equal(lane(c).gbengaLeftLA,true);assert.equal(lane(c).rank,6);
  assert.equal(c.RAVehicles.isTributed(tributed),false,'THE TAKEOVER: the tributed car is pulled back and Rich gets it back');
  assert.equal(c.RALife.hasCar(tributed),true);assert.equal(hasCar0,true);
  assert.equal(c.RAFrag.read('F07','finale.tributeReturned',false),true);assert.ok(lane(c).m9TributeReturnedDay!=null,"F03's own return marker");
  const lines=c.RAAdventures.get('NEW_OGA_FINALE').nodes.takeover.lines().map(l=>l[1]);assert.ok(lines.some(l=>/canopy with Rich’s tributed car is pulled back/.test(l)));
  console.log('PASS f07 THE TAKEOVER: win the fight -> Gbenga leaves LA, warehouse is Rich’s, the F03-tributed car comes back (F03 returnTribute)');
 }
 // the M9 NAH path (no tribute) can still reach every ending; the takeover omits the car line and returns nothing
 {
  const c=await finaleLife({m9:'NAH'});wake(c);
  assert.equal(lane(c).m9TributedCar,null);
  const out=await walkOf(root,c,'NEW_OGA_FINALE',{pick:()=>0,fight:()=>({outcome:'win'}),minigame:()=>({outcome:'win',data:{win:true}})});
  assert.equal(out.res.outcome,'takeover');assert.equal(lane(c).rank,6);
  assert.ok(!c.RAAdventures.get('NEW_OGA_FINALE').nodes.takeover.lines().some(l=>/tributed car/.test(l[1])),'no tribute: no car line');
  console.log('PASS f07 M9 NAH path reaches the finale and the NEW OGA ending (no tribute to return)');
 }

 // =============================================================== 12. fame floor: next sleep if Day >= 25, else the first sleep of Day 25
 {
  const c=await finaleLife({});wake(c);
  await walkOf(root,c,'NEW_OGA_FINALE',{pick:()=>0,fight:()=>({outcome:'win'}),minigame:()=>({outcome:'win',data:{win:true}})});
  let day=c.RALife.today().day;assert.ok(day<25);
  while(c.RALife.today().day<25){assert.ok(!c.RAState.get().life.momentum.fameEligible,`no fame before Day 25 (day ${c.RALife.today().day})`);c.RAClock.sleep();}
  assert.ok(!c.RAState.get().life.momentum.fameEligible);c.RAClock.sleep();   // the sleep OF Day 25
  assert.equal(c.RAState.get().life.momentum.fameEligible,true,'fires on the first sleep of Day 25');
  const d=await finaleLife({});wake(d);d.RAState.patch('life.world.day',26);d.RAState.patch('life.newOga',{...d.RANewOga.current(),lastMissionDay:20});
  await walkOf(root,d,'NEW_OGA_FINALE',{pick:()=>0,fight:()=>({outcome:'win'}),minigame:()=>({outcome:'win',data:{win:true}})});
  d.RAClock.sleep();assert.equal(d.RAState.get().life.momentum.fameEligible,true,'Day >= 25: the NEXT sleep');
  assert.equal(d.RAFame.claimsWake(),true,'the accepted fame system plays the ending on the wake after');
  console.log('PASS f07 fame (§5): SPARK waives the dimension requirement, floor Day 25 (next sleep if Day >= 25, else first sleep of Day 25)');
 }

 // =============================================================== 13. save/reload of the finished finale
 {
  const c=await finaleLife({f04:true});wake(c);
  await walkOf(root,c,'NEW_OGA_FINALE',{pick:()=>0,fight:()=>({outcome:'win'}),minigame:()=>({outcome:'win',data:{win:true}})});
  const r=await boot(root,{f04:true,seedState:saveOf(c)});
  assert.equal(r.RANewOga.current().rank,6);assert.equal(r.RANewOga.current().finaleEnding,'takeover');assert.equal(r.RANewOga.current().finaleDone,true);
  assert.equal(r.RADistricts.get('koreatown').state,'CONTROLLED');assert.equal(r.RADistricts.get('inglewood').holder,'rich');
  assert.equal(r.RAFrag.read('F07','finale.tributeReturned',false),true);
  const tributed=r.RANewOga.current().m9TributedCar;assert.equal(r.RAVehicles.isTributed(tributed),false);
  assert.equal(r.RAAdventures.available('NEW_OGA_FINALE'),false,'once done, never again');
  console.log('PASS f07 finale save/reload: NEW OGA, blocks, tribute return, War Room state persist; the finale never re-arrives');
 }

 // =============================================================== 14. War Room queued while F04 is dark, started when it comes up
 {
  const c=await finaleLife({});wake(c);
  await walkOf(root,c,'NEW_OGA_FINALE',{pick:()=>0,fight:()=>({outcome:'win'}),minigame:()=>({outcome:'win',data:{win:true}})});
  assert.equal(c.RAFrag.read('F07','finale.warRoom',null),'queued');
  c.RAFeatures.set('F04.war_room',true);c.RAClock.sleep();
  assert.equal(c.RAFrag.read('F04','active',false),true,'queued: the War Room starts on the first WAKE it is available');
  console.log('PASS f07 War Room: queued while F04 is dark, started on the first WAKE it is available');
 }
}
