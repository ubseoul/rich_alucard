// F15 launch trio — focused regression tests on the REAL production runtime (headless): spend attribution, progression, the one-date-per-WAKE
// cap, decline/retry, save/reload, once-only completion and money effects, approved-text fidelity and compatibility with existing systems.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {boot,SCENES,day,money,setMoney,setDay,give,complete} from './_lib.mjs';

const walkMod=root=>import(pathToFileURL(path.join(root,'tools/btf-test.mjs')).href);
const saveOf=c=>JSON.parse(JSON.stringify(c.RAState.get()));
const idOf=(d,l)=>`F15_${d.toUpperCase()}_L${l}`;
const TH=[10000,35000,80000,150000];

export async function test(root){
 // ---- 1. DARK: flag OFF changes nothing -------------------------------------------------------------------------------------------------
 {const c=await boot(root,{on:false});
  const before=JSON.stringify(c.RAState.get());
  assert.equal(c.RAF15.enabled(),false);
  assert.equal(c.RAF15.recordSpend('roxy',500),null,'flag OFF: no attribution');
  assert.equal(c.RAF15.select('roxy'),false);
  for(const id of SCENES)assert.equal(c.RAAdventures.available(id),false,`${id} unavailable while dark`);
  assert.equal(c.RAFrag.has('F15'),false,'save.frag.F15 never created while dark');
  assert.equal(c.RAEnvironments.get('f15_bing'),null,'placeholder environments are registered only while ON');
  assert.equal(c.RACombatData.ENEMIES.f15_roxy_spar,undefined);
  assert.equal(JSON.stringify(c.RAState.get()),before,'dark: shared save byte-identical');
  console.log('PASS F15 dark: flag OFF leaves save, environments, enemies and adventures inert');}

 // ---- 2. per-dancer totals, threshold != completion, sequence -----------------------------------------------------------------------
 {const c=await boot(root);setDay(c,5);setMoney(c,1e7);
  give(c,'roxy',9900);give(c,'rosalyn',4000);
  assert.equal(c.RAF15.spent('roxy'),9900);assert.equal(c.RAF15.spent('rosalyn'),4000);assert.equal(c.RAF15.spent('emerald'),0,'totals are separate per dancer');
  assert.equal(c.RAF15.progress('roxy').availableLevel,null,'$9,900 is below T1');
  give(c,'roxy',100);
  const p=c.RAF15.progress('roxy');
  assert.equal(p.thresholdLevel,1);assert.equal(p.completed,0,'threshold reached is NOT completed');assert.equal(p.availableLevel,1);
  assert.ok(c.RAAdventures.available(idOf('roxy',1)));
  assert.equal(c.RAAdventures.available(idOf('roxy',2)),false,'L2 needs T2 AND L1 completed');
  // enough money for every threshold, still sequential
  give(c,'roxy',150000);
  assert.equal(c.RAF15.progress('roxy').thresholdLevel,4);
  assert.equal(c.RAAdventures.available(idOf('roxy',4)),false,'L4 not offered before L1-L3 are played');
  assert.equal(c.RAAdventures.available(idOf('roxy',1)),true);
  // wardrobe tiers / score are not progression: only the F15 ledger moves it
  assert.equal(c.RAF15.progress('emerald').spent,0);
  assert.equal(JSON.stringify(c.RAF15.thresholds()),JSON.stringify(TH),'IMPLEMENTATION TUNING table (pending review) is the configured one');
  console.log('PASS F15 progression: separate dancer totals, threshold eligibility != completion, sequential L1-L4');}

 // ---- 3. spend attribution is exact and uses the existing ledger only --------------------------------------------------------------------
 {const c=await boot(root);setMoney(c,500000);const m0=money(c);
  const e0=c.RAMoneyLedger.entries().length;
  c.RAF15.select('emerald');
  // floor / missed bills count exactly like hits
  c.RAMoneyLedger.debit(1700,{source:'rainmaker:flick'});c.RAF15.recordSpend('emerald',1700);
  assert.equal(c.RAF15.spent('emerald'),1700);
  assert.equal(m0-money(c),1700,'attribution moves no money of its own');
  assert.equal(c.RAMoneyLedger.entries().length-e0,1,'one ledger entry per throw (the F06 payment); F15 adds none');
  assert.equal(c.RAMoneyLedger.byFamily().rainmaker.in??0,0,'no income/refund');
  assert.equal(c.RAF15.recordSpend('nobody',100),null);assert.equal(c.RAF15.recordSpend('roxy',-5),null);assert.equal(c.RAF15.recordSpend('roxy',0),null);
  assert.equal(c.RAF15.selected(),'emerald');
  console.log('PASS F15 spend: exact attribution, no double debit/credit/refund, invalid recipients and amounts ignored');}

 // ---- 4. one date per WAKE across all three routes; decline/retry; reload -------------------------------------------------------------------
 {const {walk}=await walkMod(root);
  const c=await boot(root);setDay(c,12);setMoney(c,1e6);
  for(const d of ['roxy','rosalyn','emerald'])give(c,d,TH[0]);
  const l1=['roxy','rosalyn','emerald'].map(d=>idOf(d,1));
  assert.ok(l1.every(id=>c.RAAdventures.available(id)),'all three L1 are available the same WAKE');
  // decline Roxy L1: nothing consumed, route stays open
  const r=walk(c,l1[0],{pick:list=>Math.max(0,list.findIndex(x=>x.label==='NOT TONIGHT'))});
  assert.equal(r.res.outcome,'declined');
  assert.equal(c.RAAdventures.record(l1[0]),null,'declined: record cleared (never started)');
  assert.equal(c.RAF15.capReached(),false,'a declined date never uses the one-per-WAKE cap');
  assert.ok(c.RAAdventures.available(l1[0]),'declined date stays available');
  assert.equal(c.RAF15.progress('roxy').completed,0);
  assert.equal(c.RAF15.state().paid&&Object.keys(c.RAF15.state().paid).length,0);
  assert.equal(c.RAState.get().life.memoryLog.some(m=>String(m.id).includes('declined')),false,'declined leaves no memory');
  // accept it: completes once
  const ok=walk(c,l1[0],{pick:list=>Math.max(0,list.findIndex(x=>x.label==='GO WITH HER'))});
  assert.equal(ok.res.outcome,'done');assert.equal(c.RAF15.progress('roxy').completed,1);
  // the cap now blocks EVERY other route today
  assert.equal(c.RAF15.capReached(),true);assert.equal(JSON.stringify(c.RAF15.datesToday()),JSON.stringify([l1[0]]));
  assert.equal(c.RAAdventures.available(l1[1]),false,'Rosalyn L1 blocked: one date per WAKE globally');
  assert.equal(c.RAAdventures.available(l1[2]),false,'Emerald L1 blocked');
  assert.equal(c.RAF15.status(l1[1]).code,'capped');
  // reload (real save round-trip) cannot reset the cap
  const seed=saveOf(c);const c2=await boot(root,{seedState:seed});
  assert.equal(c2.RAState.get().life.world.day,12);
  assert.equal(c2.RAF15.capReached(),true,'save/reload keeps the cap');assert.equal(c2.RAAdventures.available(l1[1]),false);
  assert.equal(c2.RAF15.spent('rosalyn'),TH[0],'save/reload keeps per-dancer totals');
  // a new WAKE reopens exactly one more
  setDay(c2,13);
  assert.equal(c2.RAF15.capReached(),false);assert.ok(c2.RAAdventures.available(l1[1]));assert.ok(c2.RAAdventures.available(l1[2]));
  // completed scenes are one-time
  assert.equal(c2.RAAdventures.available(l1[0]),false,'completed scene never repeats');
  console.log('PASS F15 cap: one date per WAKE across all routes; decline/retry keeps access; save/reload cannot reset cap or totals');}

 // ---- 5. mid-scene save/reload ------------------------------------------------------------------------------------------------------------------
 {const c=await boot(root);setDay(c,9);setMoney(c,1e6);give(c,'rosalyn',TH[0]);
  const id=idOf('rosalyn',1),m0=money(c);
  c.RAAdventures.start(id,{from:'test'});
  for(const n of ['bing','yes','plenitude','order','opinion','test','split'])c.RAAdventures.enter(n);   // 'split' pays Rich's half once
  assert.equal(m0-money(c),106,'Rosalyn L1: Rich pays his half, 106 whole dollars, once');
  const seed=saveOf(c);
  const c2=await boot(root,{seedState:seed});
  assert.equal(c2.RAAdventures.active()?.id,id,'an active date survives reload');
  const before=money(c2);
  c2.RAAdventures.enter('split');   // re-entering after reload must not charge again
  assert.equal(money(c2),before,'no second debit after reload');
  assert.equal(c2.RAF15.payOnce(id,'check',106).already,true);
  c2.RAAdventures.complete('end');
  assert.equal(c2.RAF15.progress('rosalyn').completed,1);assert.equal(c2.RAAdventures.record(id).count,1,'completed once');
  assert.equal(c.RAMoneyLedger.query({source:`f15:date:${id}`}).length,1,'exactly one ledger entry for the split (before the reload)');
  assert.equal(c2.RAMoneyLedger.query({source:`f15:date:${id}`}).length,0,'the reloaded session records no second debit');
  console.log('PASS F15 reload: active date resumes, split debited exactly once through the ledger, completed exactly once');}

 // ---- 6. all twelve scenes complete on every branch; money effects exact; no unauthorized income ----------------------------------------------------
 {const {walk}=await walkMod(root);
  let walks=0;
  for(const id of SCENES){
   const def=(await boot(root)).RAAdventures.get(id);assert.ok(def,id);
   const width=Math.max(1,...Object.values(def.nodes).filter(n=>n.choices).map(n=>typeof n.choices==='function'?3:n.choices.length));
   for(let k=0;k<width;k++)for(const outcome of ['win','lose']){
    const c=await boot(root);setDay(c,40);setMoney(c,5e6);def.testSetup(c);
    assert.ok(c.RAAdventures.available(id),`${id} available after seeding`);
    const m0=money(c),fol=c.RAState.get().life.resources.followers;
    const {res}=walk(c,id,{pick:(list,step)=>(k+step)%list.length,fight:()=>({outcome}),maxSteps:200});
    if(res.outcome==='declined')continue;
    walks++;
    assert.equal(res.id,id);assert.equal(c.RAAdventures.record(id).count,1);assert.equal(c.RAAdventures.active(),null);
    const spent=m0-money(c);
    assert.equal(spent,id==='F15_ROSALYN_L1'?106:0,`${id}: exact scene money (spent ${spent})`);
    assert.equal(c.RAState.get().life.resources.followers,fol,`${id}: no followers/club income`);
    assert.ok(c.RAState.get().life.memoryLog.length>0,`${id}: wrote a memory`);
   }
  }
  assert.ok(walks>=12*2,`walked ${walks} branch/outcome combinations`);
  console.log(`PASS F15 scenes: all 12 scenes complete on every branch and fight outcome (${walks} walks); exact money; no income`);}

 // ---- 7. approved-text fidelity ---------------------------------------------------------------------------------------------------------------------
 {const c=await boot(root);const fixture=JSON.parse(await readFile(path.join(root,'tools/tests/f15/rich_lines_v3.json'),'utf8'));
  const rich=[],all=[],labels=[];
  for(const id of SCENES){
   const def=c.RAAdventures.get(id);
   for(const [nodeId,n] of Object.entries(def.nodes)){
    c.RAAdventures.start(id,{from:'test'});
    const lines=typeof n.lines==='function'?n.lines(c.RAAdventures.context()):(n.lines||[]);
    for(const l of lines){all.push({id,nodeId,l});if(l[0]==='rich')rich.push(l);}
    const ch=typeof n.choices==='function'?n.choices(c.RAAdventures.context()):(n.choices||[]);
    for(const o of ch)labels.push(o.label);
    c.RAAdventures.abandon();
   }
  }
  const speech=rich.filter(l=>!l[2].thought).map(l=>l[1]);
  const expected=fixture.richLines.filter(t=>t!=='I BET YOU HAVE DADDY ISSUES.');   // that one is the OCTOPUS option label (combat menu), checked below
  assert.deepEqual([...speech].sort(),[...expected].sort(),'Rich says exactly Ube\'s approved lines: nothing added, nothing paraphrased, no empty optional slots written');
  assert.ok(rich.every(l=>l[2].canon&&!l[2].vp),'Ube\'s lines are canon-marked, no new [VP] voice-pass line is created');
  assert.equal(JSON.stringify(rich.filter(l=>l[2].thought).map(l=>l[1])),JSON.stringify([fixture.authoredThought]));
  assert.equal(c.RACombatData.ENEMIES.f15_uncle_bunmi.octopus.roast.label,'I BET YOU HAVE DADDY ISSUES.');
  // Roxy's protected quote: exactly once, in L3, spoken by Roxy
  const quote=all.filter(x=>/I've gotten used to it/.test(x.l[1]));
  assert.equal(quote.length,1);assert.equal(quote[0].id,'F15_ROXY_L3');assert.equal(quote[0].l[0],'roxy');
  assert.equal(JSON.stringify(c.RAAdventures.get('F15_ROXY_L3').nodes).includes('rich_hits'),false);
  // no source annotations / drafting symbols in anything a player can read
  const bad=/[◆↻▸✎○❝❞]|\bPROPOSED\b|\[RICH|\bQ[1-9]\b|AUDIT|DRAFT|\*[^*]+\*/;
  for(const x of all)assert.ok(!bad.test(x.l[1]),`${x.id}.${x.nodeId}: annotation leaked: ${x.l[1]}`);
  for(const t of labels)assert.ok(!bad.test(t),`choice label annotation: ${t}`);
  // song: title only, no lyrics, no audio
  const songLines=all.filter(x=>/I Am What I Am/.test(x.l[1]));assert.ok(songLines.length>=2);
  assert.ok(songLines.every(x=>x.l[1].length<260));
  assert.equal(Object.values(c.RAAdventures.get('F15_EMERALD_L4').nodes).some(n=>n.audio||n.sfx),false);
  console.log('PASS F15 text: Rich = Ube\'s 29 approved lines + the authored thought only, Roxy quote once, no annotations, no lyrics');}

 // ---- 7b. all three routes unlock L1-L4 strictly in order, and the global cap lets exactly ONE date through per WAKE ------------------------------------
 {const {walk}=await walkMod(root);
  const c=await boot(root);setMoney(c,1e7);setDay(c,50);
  const dancers=['roxy','rosalyn','emerald'];
  // spend exactly enough for each threshold in turn so eligibility (spend) stays visibly separate from completion (played)
  for(const d of dancers)give(c,d,TH[0]);
  const played=[];let wake=0;
  while(dancers.some(d=>c.RAF15.progress(d).completed<4)&&wake++<40){
   setDay(c,50+wake);
   for(const d of dancers){const p=c.RAF15.progress(d);if(p.next&&p.spent<TH[p.next-1])give(c,d,TH[p.next-1]-p.spent);}   // meet the NEXT threshold only
   const ready=dancers.filter(d=>c.RAF15.nextScene(d)&&c.RAAdventures.available(c.RAF15.nextScene(d)));
   assert.ok(ready.length>=1,`wake ${wake}: something is playable`);
   const pick=ready[0],id=c.RAF15.nextScene(pick);
   walk(c,id,{pick:()=>0,fight:()=>({outcome:'win'}),maxSteps:300});played.push(id);
   assert.equal(c.RAF15.datesToday().length,1,'exactly one date this WAKE');
   for(const d of dancers){const n=c.RAF15.nextScene(d);if(n)assert.equal(c.RAAdventures.available(n),false,`${n} blocked after today's date`);}
   // no L(n+1) for the dancer just played until her next threshold is met AND a new WAKE has begun
   const pp=c.RAF15.progress(pick);if(pp.next){assert.equal(c.RAF15.status(c.RAF15.nextScene(pick)).code,'threshold','next scene needs its own threshold');give(c,pick,TH[pp.next-1]-pp.spent);assert.equal(c.RAF15.status(c.RAF15.nextScene(pick)).code,'capped','threshold met, but date already spent');}
  }
  assert.equal(played.length,12,'twelve scenes took twelve separate WAKEs');
  for(const d of dancers){const mine=played.filter(x=>x.includes(d.toUpperCase()));assert.equal(JSON.stringify(mine),JSON.stringify([1,2,3,4].map(l=>idOf(d,l))),`${d}: L1..L4 played strictly in order`);}
  // a scene whose threshold is not met never becomes available, however much else is done
  const c2=await boot(root);setDay(c2,9);setMoney(c2,1e7);give(c2,'emerald',TH[0]);
  assert.equal(c2.RAF15.status(idOf('emerald',2)).code,'sequence');assert.equal(c2.RAF15.status(idOf('roxy',1)).code,'threshold');
  console.log('PASS F15 routes: every route unlocks L1-L4 strictly in order, thresholds gate eligibility, 12 scenes need 12 separate WAKEs (global cap)');}

 // ---- 7c. Rosalyn's check vs the whole-dollar economy ---------------------------------------------------------------------------------------------------
 {const c=await boot(root);setDay(c,3);setMoney(c,1000);
  c.RALife.addMoney(-106.23);assert.equal(money(c),894,'the game rounds every money change to whole dollars: $106.23 cannot be represented (no fractional dollars)');
  setMoney(c,1000);const r=c.RAF15.payOnce('F15_ROSALYN_L1','check',c.RAF15Tunables.MONEY.rosalynL1RichHalf);
  assert.equal(r.ok,true);assert.equal(1000-money(c),106,'the debit is the whole-dollar adaptation of $106.23');

  console.log('PASS F15 check: money is whole dollars only; Rich half of $106.23 is adapted to a once-only $106 debit (constraint documented)');}

 // ---- 7d. the cap is enforced at the shared entry seam (RAAdventures.start), not only by buttons ------------------------------------------------------
 {const {walk}=await walkMod(root);
  const c=await boot(root);setDay(c,70);setMoney(c,1e7);for(const d of ['roxy','rosalyn','emerald'])give(c,d,TH[0]);
  const L1=['roxy','rosalyn','emerald'].map(d=>idOf(d,1));
  // browsing / declining consume nothing
  assert.ok(c.RAAdventures.available(L1[1]));walk(c,L1[0],{pick:list=>Math.max(0,list.findIndex(x=>x.label==='NOT TONIGHT'))});
  assert.equal(c.RAF15.capReached(),false);
  // a scene that is not yet earned cannot be started directly
  assert.equal(c.RAAdventures.start(idOf('roxy',3),{from:'test'}),false,'threshold/sequence enforced at the seam');
  assert.equal(c.RAAdventures.active(),null);
  // first date of the WAKE goes through; a second NEW date (any dancer) is refused even by a direct start
  assert.ok(c.RAAdventures.start(L1[1],{from:'phone'}),'authorized date starts');
  c.RAAdventures.abandon();                                  // (browsing: nothing completed yet)
  walk(c,L1[1],{pick:()=>0});
  for(const id of [L1[0],L1[2],idOf('rosalyn',2)])assert.equal(c.RAAdventures.start(id,{from:'phone'}),false,`${id}: second new date in the same WAKE refused at start()`);
  assert.equal(c.RAAdventures.active(),null,'a refused start leaves no run behind');
  assert.equal(money(c),1e7-TH[0]*3-106,'the one completed date charged its scene cost once; refused starts cost nothing');
  // an authorized in-progress date resumes after reload (even once the next WAKE has begun) and is never refused or re-charged
  const c2=await boot(root);setDay(c2,80);setMoney(c2,1e7);give(c2,'rosalyn',TH[0]);
  assert.ok(c2.RAAdventures.start(L1[1],{from:'phone'}));for(const n of ['bing','yes','plenitude','order','opinion','test','split'])c2.RAAdventures.enter(n);
  const paid=1e7-TH[0]-money(c2);assert.equal(paid,106);
  const seed=saveOf(c2);const c3=await boot(root,{seedState:seed});setDay(c3,81);
  assert.equal(c3.RAAdventures.active()?.id,L1[1]);assert.equal(c3.RAAdventures.start(L1[1],{from:'phone'})?.id,L1[1],'resume is not blocked');
  const m3=money(c3);c3.RAAdventures.enter('split');assert.equal(money(c3),m3,'no second debit on resume');
  c3.RAAdventures.complete('end');assert.equal(c3.RAAdventures.record(L1[1]).count,1);
  // the next real WAKE permits the next eligible date
  setDay(c3,82);give(c3,'roxy',TH[0]);assert.ok(c3.RAAdventures.start(L1[0],{from:'phone'}),'next WAKE: next eligible date starts');
  // flag OFF: no F15 scene can start at all
  const off=await boot(root,{on:false});setDay(off,5);assert.equal(off.RAAdventures.start(L1[0],{from:'test'}),false);
  console.log('PASS F15 date gate: second new date refused at the shared start() seam; decline/browse consume nothing; authorized date resumes after reload; one charge; next WAKE reopens; dark = no entry');}

 // ---- 8. nothing else changed ------------------------------------------------------------------------------------------------------------------------
 {const c=await boot(root);const L=c.RALife;
  const kiki=c.RAAdventures.get('DATE');assert.ok(kiki,'existing DATE adventure intact');
  assert.equal(c.RAFeatures.enabled('F06.rainmaker'),true);
  // F15 contributes no relationship-ladder state, no new currency
  assert.equal(Object.keys(c.RAState.get().life.resources).some(k=>/favor/i.test(k)),false);
  assert.equal(c.RAF15.mapping().roxy,'wolf');assert.equal(c.RAF15.mapping().emerald,'dragon');assert.equal(c.RAF15.mapping().rosalyn,'pink');
  assert.equal(c.RAF15.setMapping({roxy:'pink',rosalyn:'pink',emerald:'dragon'}),false,'a mapping must be a permutation');
  assert.ok(c.RAF15.setMapping({roxy:'pink',rosalyn:'wolf',emerald:'dragon'}));assert.equal(c.RAF15.handleOf('roxy'),'pink');
  assert.equal(c.RAF15.dancerOf('wolf'),'rosalyn');
  console.log('PASS F15 compatibility: existing DATE intact, no favor currency, identity mapping configurable and validated');}
}
