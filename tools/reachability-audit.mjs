#!/usr/bin/env node
// Player-reachability audit for authored adventures (Engineering 05). Spoiler-safe: ids, route kinds and pass/fail.
//
// 1. Static classification: every literal adventure definition is classified by the player-facing routes that name
//    it (place, VampGPT lane, party lane, wake-time want/DM, wake trigger, chain, castle room, grave hub, date/system
//    call). An id named only by DEV tooling, or by nothing, is `NO PLAYER ENTRY`. The SEALED pack is never opened:
//    its hooks are counted as `PROTECTED` without reading what they contain.
// 2. Dynamic proofs: for each HQ-routed adventure (and PICKUP, ONLYVAMPS) a fresh headless life reaches the route's
//    prerequisites through real adventure walks (seeds are listed per proof), then the REAL route code offers or starts
//    the target, the target completes, and a second pass proves one-time content is not offered again while
//    repeatable systems stay repeatable.
// Usage: node tools/reachability-audit.mjs [--json out.json]      import {test} for the release gate
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadBtf} from './btf-test.mjs';

const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

// ---------------------------------------------------------------- static classification
const ROUTES=[
 ['place',/RAPlaces\.define\(/],['vampgpt-lane',/RAVampGPT\.defineLane\(/],['party-lane',/RAParties\.register\(/],
 ['want/dm',/RATemptations\.define\(|RATemptations\.push\(/],['wake-trigger',/RAWakeTriggers\.define\(/],['chain',/chain:/],
 ['grave-hub',/RAGraveEncounters/],['scene-call',/RAAdventureScene\.begin\(|begin\(/]
];
async function sources(root){
 const out=[];const walk=async d=>{for(const e of await readdir(path.join(root,d),{withFileTypes:true})){const rel=path.posix.join(d,e.name);if(e.isDirectory()){if(e.name!=='sealed')await walk(rel)}else if(rel.endsWith('.js'))out.push(rel)}};
 await walk('js');return Promise.all(out.map(async f=>[f,await readFile(path.join(root,f),'utf8')]));
}
export async function classify(root=here){
 const src=await sources(root),ctx=await loadBtf(root);
 const sealedIds=new Set((ctx.RASealed?.installed?.()?.adventures||[]).map(d=>d.id));
 const rows={},wantIds=new Set(ctx.RATemptations.defs().map(d=>d.adventure).filter(Boolean)),wakeIds=new Set(ctx.RAWakeTriggers.list().map(w=>w.adventure));
 for(const def of ctx.RAAdventures.all()){
  const id=def.id,routes=new Set();let dev=false;
  if(sealedIds.has(id)){rows[id]={routes:['PROTECTED'],status:'PROTECTED (mechanical only)'};continue}
  const q=new RegExp(`['"\`]${id}['"\`]`);
  for(const [file,text] of src){
   const lines=text.split('\n');
   lines.forEach((line,i)=>{if(!q.test(line))return;if(new RegExp(`D\\(\\{id:'${id}'`).test(line)&&!line.slice(line.indexOf(`id:'${id}'`)+id.length+6).match(q))return;
    if(/devtools|btf_dev/.test(file)){dev=true;return}
    const ctxText=lines.slice(Math.max(0,i-12),i+1).join('\n');let kind=null;
    for(const [k,re] of ROUTES)if(re.test(line)){kind=k;break}
    if(!kind)for(const [k,re] of ROUTES)if(re.test(ctxText))kind=k;
    if(/castle\.js/.test(file))kind='castle-room';if(/dating\.js|adventures\/w5\.js/.test(file)&&/date/i.test(line))kind=kind||'dating';
    routes.add(kind||'system-call');});
  }
  if(id==='DATE')routes.add('dating');
  // Live registries (routes built by template at runtime, e.g. the top-5 arcs' DM wants).
  if(wantIds.has(id))routes.add('want/dm');if(wakeIds.has(id))routes.add('wake-trigger');
  rows[id]={routes:[...routes].sort(),status:routes.size?'PLAYER ROUTE':dev?'DEV ONLY':'NO PLAYER ENTRY'};
 }
 return rows;
}

// ---------------------------------------------------------------- dynamic proofs
const labelOf=c=>String(c.label||'').replace(/<[^>]+>/g,'');
function drive(ctx,id,{vars={},prefer=[],from='route',minigame=()=>({outcome:'win',score:1,rewards:{}}),log=[]}={}){
 const {RAAdventures}=ctx;const run=RAAdventures.start(id,{from,vars});assert(run,`${id}: could not start`);let node=run.node,steps=0;
 while(node&&steps++<400){
  const r=RAAdventures.enter(node);assert(r,`${id}: enter failed at ${node}`);const n=r.node;
  if(n.end)return RAAdventures.complete(node);
  if(n.route){RAAdventures.context().set('route','walk');node=n.route.next;continue}
  if(n.choices){const list=RAAdventures.choicesFor(node).filter(c=>!c.locked);if(!list.length){node=RAAdventures.nextOf(node);continue}
   const want=prefer.map(p=>list.find(c=>p.test(labelOf(c)))).find(Boolean)||list[0];log.push(`${id}:${node} → ${labelOf(want)}`);node=RAAdventures.choose(node,want.index);continue}
  if(n.minigame){if(typeof n.minigame.params==='function')n.minigame.params(RAAdventures.context());log.push(`${id}:${node} minigame:${n.minigame.id}`);node=RAAdventures.afterMinigame(node,minigame(n.minigame.id));continue}
  if(n.fight){if(typeof n.fight.params==='function')n.fight.params(RAAdventures.context());node=RAAdventures.afterFight(node,{outcome:'win'});continue}
  node=RAAdventures.nextOf(node);
 }
 throw new Error(`${id}: did not reach an end`);
}
// Follow a completion's chain exactly as the adventure scene does (returnHome → start the chained adventure).
function driveChain(ctx,res,opts={}){const out=[res];while(res?.chain&&ctx.RAAdventures.available(res.chain)){res=drive(ctx,res.chain,{...opts,vars:res.chainVars||{},from:'chain'});out.push(res)}return out}
const chained=list=>list.slice(1).map(r=>r.id);
// Sleep through to a morning with the real clock (every wake handler runs); return the live wants (WHAT WE ON).
function wakeTo(ctx,day){const {RAClock,RALife,RATemptations}=ctx;assert(day>=RALife.today().day,'cannot wake in the past');while(RALife.today().day<day)RAClock.sleep();return RATemptations.whatWeOn()}
const firstFridayAfter=(ctx,day)=>{for(let d=day+1;d<day+15;d++)if(ctx.RALife.dayInfo(d).friday||ctx.RALife.dayInfo(d).weekday==='FRIDAY')return d;throw new Error('no friday')};
// The PLAYER-BLIND Ogun's Rave / legacy bridge writes exactly these fields on completion; the flow itself is exercised in
// the built game (tools/playtest-qa.mjs --only legacy), so headless proofs seed its recorded outcome only.
function seedOgunsRave(ctx){ctx.RAState.patch('life.world.flags.ogunsRaveCompleted',true);ctx.RAState.patch('life.world.flags.castlePartyHostingUnlocked',true);ctx.RALife.unlockApp('vampgram',{silent:true});}

export async function proofs(root=here){
 const results=[];const ok=(name,route,seeds,evidence)=>results.push({name,route,seeds,evidence,result:'PASS'});
 const fresh=async()=>{const ctx=await loadBtf(root);ctx.RAClock.wake({first:true});return ctx};
 // A_EMBERLY1 — Kush & Crypt back room.
 {const ctx=await fresh(),log=[];assert.equal(ctx.RAPlaces.get('kush').adventure(ctx.RALife.L()),'A09');
  drive(ctx,'A09',{prefer:[/BUY IT/,/WALK IT HOME/],log});assert.equal(ctx.RAPlaces.get('kush').adventure(ctx.RALife.L()),'KUSH');
  const offered=()=>{ctx.RAAdventures.start('KUSH');ctx.RAAdventures.enter('store');const has=ctx.RAAdventures.choicesFor('store').some(c=>labelOf(c)==='THE BACK ROOM');ctx.RAAdventures.abandon();return has};
  assert(offered(),'KUSH does not offer the back room');
  const run=driveChain(ctx,drive(ctx,'KUSH',{prefer:[/THE BACK ROOM/],log}));assert.deepEqual(chained(run),['A_EMBERLY1']);
  assert(ctx.RARelations.met('emberly'),'Emberly not met');assert(!offered(),'back room offered again after the meeting');
  assert(ctx.RAAdventures.available('KUSH'),'KUSH must stay repeatable');
  ok('A_EMBERLY1','GO SOMEWHERE → KUSH & CRYPT → THE BACK ROOM (chain)',['none: A09 bought the egg for real'],log.slice(-2));}
 // A_HINA1 — the first Slurp Dynasty experience; and the next shift for a life that already did A08.
 {const ctx=await fresh(),log=[];const run=driveChain(ctx,drive(ctx,'A08',{log}));assert.deepEqual(chained(run),['A_HINA1']);
  const again=driveChain(ctx,drive(ctx,'SLURP'));assert.deepEqual(chained(again),[],'Hina chained twice');assert(ctx.RARelations.met('hina'));
  const old=await fresh();old.RAState.patch('life.adventures.records',{A08:{status:'completed',count:1,completedDay:1}});
  const oldRun=driveChain(old,drive(old,'SLURP'));assert.deepEqual(chained(oldRun),['A_HINA1'],'fallback: next shift must chain Hina');
  ok('A_HINA1','GO SOMEWHERE → SLURP DYNASTY → A08 first shift → A_HINA1 (chain); SLURP shift fallback',['fallback proof seeds an A08 record (a pre-route save)'],['A08 → A_HINA1','SLURP (2nd) → none']);}
 // A_JADE1 — first eligible DRAGON NIGHT hosted party; other themes never surface her.
 {const ctx=await fresh(),log=[];seedOgunsRave(ctx);drive(ctx,'A09',{prefer:[/BUY IT/]});ctx.RAState.patch('life.resources.money',2000000);
  for(const room of ['party_hall','dragon_roost'])assert(ctx.RACastle.buy(room),`could not buy ${room}`);
  const plain=driveChain(ctx,drive(ctx,'A26',{prefer:[/^NORMAL$/,/THAT'S THE LIST/,/NO MUSIC/,/OPEN BAR/,/TUNDE/]}));assert.deepEqual(chained(plain),[],'Jade surfaced at a non-dragon party');
  const night=ctx.RAState.get().life.clock;const run=driveChain(ctx,drive(ctx,'HOST',{prefer:[/DRAGON NIGHT/,/THAT'S THE LIST/,/NO MUSIC/,/OPEN BAR/,/TUNDE/],log}));
  assert.deepEqual(chained(run),['A_JADE1']);assert(ctx.RAState.get().life.clock.returnBeat?.nightEnder,'the dragon party must still end the night after Jade');
  const again=driveChain(ctx,drive(ctx,'HOST',{prefer:[/DRAGON NIGHT/,/THAT'S THE LIST/,/NO MUSIC/,/OPEN BAR/,/TUNDE/]}));assert.deepEqual(chained(again),[],'Jade surfaced twice');
  ok('A_JADE1','⌂ CASTLE → PARTY HALL → theme DRAGON NIGHT → A_JADE1 (chain, one time, night still ends)',["Ogun's Rave outcome flags (PLAYER-BLIND flow)",'money for PARTY HALL + DRAGON ROOST (bought through RACastle.buy)'],['A26 NORMAL → none','HOST DRAGON NIGHT → A_JADE1','HOST DRAGON NIGHT again → none']);}
 // A_LO1 + A_ANFEESA1 — the party lane after Ogun's Rave.
 {const ctx=await fresh();assert.notEqual(ctx.RAParties.next(ctx.RALife.L()),'A_LO1','Lo offered before Ogun\'s Rave');seedOgunsRave(ctx);
  const lane=()=>ctx.RAVampGPT.lane('people').find(o=>o.go==='lane:party');
  assert(lane(),'FIND A PARTY missing');assert.equal(ctx.RAParties.next(ctx.RALife.L()),'A_LO1');
  driveChain(ctx,drive(ctx,'A_LO1'));assert(ctx.RARelations.met('lo'));assert.equal(ctx.RAParties.next(ctx.RALife.L()),'A55','Ogun\'s second rave should follow');
  const rave=driveChain(ctx,drive(ctx,'A55'));assert.deepEqual(chained(rave),['A_ANFEESA1']);
  const after=ctx.RAParties.next(ctx.RALife.L());assert(!['A_LO1','A55','A_ANFEESA1'].includes(after),'one-time party content offered again');assert(after,'repeatable parties must remain');
  ok('A_LO1','VampGPT → MEET PEOPLE → FIND A PARTY (first large vampire party after Ogun\'s Rave)',["Ogun's Rave outcome flags (PLAYER-BLIND flow)"],[`party lane → A_LO1 → A55 → ${after}`]);
  ok('A_ANFEESA1',"FIND A PARTY → OGUN'S SECOND RAVE (A55) → A_ANFEESA1 (chain)",["Ogun's Rave outcome flags (PLAYER-BLIND flow)"],['A55 → A_ANFEESA1']);}
 // A_VELVET1 + ONLYVAMPS — her DM after Ogun's Rave / VampGram.
 {const ctx=await fresh();let wants=wakeTo(ctx,3);assert(!wants.some(t=>t.id==='velvet_dm'),'Velvet before Ogun\'s Rave');
  assert(!ctx.RALife.appUnlocked('onlyvamps'));seedOgunsRave(ctx);wants=wakeTo(ctx,4);const t=wants.find(x=>x.id==='velvet_dm');assert(t,'Velvet DM not offered');
  const mail=ctx.RAState.get().life.clock.mail.find(m=>String(m.id).startsWith('tempt:velvet_dm'));assert(mail?.app==='vampgpt','Velvet DM must reach Morning Mail');
  ctx.RATemptations.take('velvet_dm');driveChain(ctx,drive(ctx,t.adventure));assert(ctx.RALife.appUnlocked('onlyvamps'),'ONLYVAMPS not unlocked');
  assert(!/invite only/.test(ctx.RAOnlyVamps.markup()),'ONLYVAMPS still invite-only');
  for(let d=5;d<20;d++)assert(!wakeTo(ctx,d).some(x=>x.id==='velvet_dm'),'Velvet DM repeated');
  ok('A_VELVET1','Morning Mail / VampGPT WHAT WE ON: "a DM from a locked account" → A_VELVET1',["Ogun's Rave outcome flags + VampGram (PLAYER-BLIND flow)"],['wake → velvet_dm → A_VELVET1 → ONLYVAMPS unlocked']);
  ok('ONLYVAMPS','A_VELVET1 unlocks the ONLYVAMPS app (creator tiles, subscriptions)',['as A_VELVET1'],['appUnlocked(onlyvamps) true; markup is the creator page']);}
 // A37 — one-time opportunity on an eligible Friday after Day 15.
 {const ctx=await fresh();for(let d=2;d<=15;d++)assert(!wakeTo(ctx,d).some(x=>x.id==='a37_friday'),`A37 offered on day ${d}`);
  const fri=firstFridayAfter(ctx,15),sat=fri+1;const w=wakeTo(ctx,fri);assert(w.some(x=>x.id==='a37_friday'),'A37 not offered on the first eligible Friday');
  assert(!wakeTo(ctx,sat).some(x=>x.id==='a37_friday'),'A37 must not be offered on a Saturday');
  const fri2=firstFridayAfter(ctx,sat);assert(wakeTo(ctx,fri2).some(x=>x.id==='a37_friday'),'an ignored Friday must come back next Friday');
  ctx.RATemptations.take('a37_friday');drive(ctx,'A37',{prefer:[/TWO STEP/]});assert(ctx.RARelations.met('bunmi'));
  const fri3=firstFridayAfter(ctx,fri2);assert(!wakeTo(ctx,fri3).some(x=>x.id==='a37_friday')&&!ctx.RAAdventures.available('A37'),'A37 repeated');
  ok('A37','Morning Mail INVITE / WHAT WE ON on an eligible Friday after Day 15 → A37',['none (day advanced by the real calendar)'],[`first eligible Friday = Day ${fri}; not on Day ${sat}; ignored Friday returns on Day ${fri2}; gone after completion`]);}
 // A46 — an eligible woman asks, in her DMs; repeatable.
 {const ctx=await fresh();assert(!wakeTo(ctx,3).some(x=>x.id==='a46_special'));
  drive(ctx,'A07');ctx.RARelations.add('kiki',60);assert(ctx.RARelations.level('kiki')>=3,'kiki not CLOSE');
  let t;for(let d=4;d<40&&!t;d++)t=wakeTo(ctx,d).find(x=>x.id==='a46_special');assert(t,'A46 ask never offered');
  assert.equal(t.thread,'kiki');const dm=(ctx.RAState.get().life.phone.threads.kiki||[]).find(m=>String(m.id).startsWith('tempt:a46_special'));assert(dm?.choices?.[0]?.temptation==='a46_special','the ask must arrive in her DMs with a reply');
  ctx.RATemptations.take('a46_special');drive(ctx,'A46',{prefer:[/KIKI/]});assert(ctx.RAAdventures.available('A46'),'A46 must stay repeatable');
  let again=null;for(let d=t.createdDay+8;d<t.createdDay+60&&!again;d++)again=wakeTo(ctx,d).find(x=>x.id==='a46_special');assert(again,'A46 ask must come back after its cooldown');
  ok('A46','InstaHoe DM from a CLOSE woman: "take me somewhere special." → SAY LESS → A46 (repeatable, 7-day cooldown)',['relationship points added to Kiki after A07 (dates would do the same)'],[`asked by ${t.thread} on day ${t.createdDay}; asked again after cooldown`]);}
 // A23R — prepared = A23 done, the Armory known and visited, at least one gun.
 {const ctx=await fresh();drive(ctx,'A23');const notYet=wakeTo(ctx,5);assert(!notYet.some(x=>x.id==='a23r_rematch'),'rematch offered before Rich is prepared');
  drive(ctx,'A19');assert(ctx.RALife.flag('armoryKnown'));drive(ctx,'A24');drive(ctx,'ARMORY',{prefer:[/LIL OGA/,/ENOUGH GRACE/]});assert(ctx.RAState.get().life.ownership.guns.length>0,'no gun bought');
  let t;for(let d=6;d<30&&!t;d++)t=wakeTo(ctx,d).find(x=>x.id==='a23r_rematch');assert(t,'rematch never offered once prepared');
  ctx.RATemptations.take('a23r_rematch');drive(ctx,'A23R');for(let d=t.createdDay+1;d<t.createdDay+20;d++)assert(!wakeTo(ctx,d).some(x=>x.id==='a23r_rematch'),'rematch repeated');
  ok('A23R','WHAT WE ON: "hilt again. same windbreaker." once prepared → A23R',['A23 driven directly (its wake trigger needs HOOKAH + ecology level 2)'],['A23 → A19 (armory known) → A24 → ARMORY (LIL OGA) → rematch offered → done once']);}
 // PICKUP — GO SOMEWHERE → VENICE COURTS → PICKUP, repeatable, no lab page.
 {const ctx=await fresh(),log=[];const vis=ctx.RAPlaces.visible();assert(vis.some(p=>p.id==='venice'),'VENICE COURTS not in GO SOMEWHERE');
  assert.equal(ctx.RAPlaces.get('venice').adventure,'VENICE');
  for(let i=0;i<3;i++){const res=drive(ctx,'VENICE',{prefer:[/RUN PICKUP/],log,minigame:id=>({outcome:i%2?'lose':'win',score:11})});assert.equal(res.outcome,i%2?'lose':'win')}
  assert.equal(log.filter(l=>l.endsWith('minigame:pickup')).length,3,'PICKUP not launched from the route');
  const quit=drive(ctx,'VENICE',{prefer:[/RUN PICKUP/],minigame:()=>({quit:true})});assert.equal(quit.outcome,'quit');
  const rim=driveChain(ctx,drive(ctx,'VENICE',{prefer:[/PULL-UPS ON THE RIM/]}));assert.deepEqual(chained(rim),['MOONIE_MEET'],'the rim must still lead to Moonie');
  ok('PICKUP','GO SOMEWHERE → VENICE COURTS → RUN PICKUP (repeatable; quit returns cleanly)',['none'],['3 runs + 1 quit through the route; PULL-UPS ON THE RIM → MOONIE_MEET']);}
 // Incidental fix — repeatable PIER after A12.
 {const ctx=await fresh();ctx.RADragon.adoptEgg();ctx.RAState.patch('life.ownership.dragon',{...ctx.RALife.dragon(),stage:'hatchling',hatched:true});
  drive(ctx,'A12');assert.equal(ctx.RAPlaces.get('pier').adventure(ctx.RALife.L()),'PIER');assert(ctx.RAPlaces.visible().some(p=>p.id==='pier'),'pier place vanished after A12');
  const log=[];drive(ctx,'PIER',{log});assert(log.some(l=>l.endsWith('minigame:pier')));assert(!ctx.RAAdventures.available('PIER'),'PIER is once a night');
  ok('PIER','GO SOMEWHERE → SANTA MONICA PIER → PIER (repeatable, once a night) after A12',['a hatched dragon (A11 outcome)'],['A12 → PIER minigame']);}
 return results;
}

export async function test(root=here){
 const rows=await classify(root),targets=['A_EMBERLY1','A_JADE1','A_LO1','A_HINA1','A_ANFEESA1','A_VELVET1','A37','A46','A23R','VENICE','PIER'];
 for(const id of targets)assert.equal(rows[id]?.status,'PLAYER ROUTE',`${id} has no player route (${JSON.stringify(rows[id])})`);
 const none=Object.entries(rows).filter(([,r])=>r.status==='NO PLAYER ENTRY').map(([id])=>id);
 const p=await proofs(root);
 console.log(`PASS reachability (${Object.keys(rows).length} adventures; ${p.length} route proofs; no player entry: ${none.join(', ')||'none'})`);
 return {rows,proofs:p,none};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const r=await test();const i=process.argv.indexOf('--json');if(i>0)await writeFile(process.argv[i+1],JSON.stringify(r,null,1));
 const by={};for(const [id,x] of Object.entries(r.rows))(by[x.status]=by[x.status]||[]).push(id);for(const [k,v] of Object.entries(by))console.log(k,v.length);
 for(const x of r.proofs)console.log(x.result,x.name,'—',x.route);
}
