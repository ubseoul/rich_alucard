// RC3 · BUILD A — spine + economy sim. A fresh life follows VampGPT (RAGuidance) for ~21 days: story beat -> PLAY -> club -> sleep, on the REAL
// production runtime with the RC3 cut enforced (js/systems/rc3_cut.js). Reports per day what was done and the cash after the night.
//   node tools/rc3/spine-sim.mjs [--days 24] [--seeds 3] [--policy naive|careful] [--json out.json]
import path from 'node:path';
import vm from 'node:vm';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const url=f=>pathToFileURL(path.join(root,f)).href;
const {mulberry}=await import(url('tools/tests/f13/_campaign.mjs'));
const {careerBoot}=await import(url('tools/tests/f13/_career.mjs'));
const {read,run}=await import(url('tools/tests/if1/_lib.mjs'));
const {drive,SEEDS}=await import(url('tools/pilot/headless.mjs'));
const arg=(n,d)=>{const i=process.argv.indexOf(n);return i<0?d:process.argv[i+1];};
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h;};

async function playHostFor(seed,policy){
 await import(url('tools/tests/f01/play-sim/globals.mjs'));
 if(!globalThis.RAPlayContract)vm.runInThisContext(await read(root,'js/frag/F01/play_contract.js'));
 const {makeDriver}=await import(url('tools/tests/f01/play-sim/driver.mjs'));
 const AD=await import(url('js/frag/F01/play/adapter.mjs'));
 const host={saved:null,cache:new Map(),results:[],crashes:[],
  transport(req){
   const plain=JSON.parse(JSON.stringify(req));
   if(host.cache.has(plain.requestId))return JSON.parse(JSON.stringify(host.cache.get(plain.requestId)));
   plain.seed=(hash(`${seed}|${plain.requestId}`)%90000)+1000;
   let r;try{r=AD.runHeadless(plain,makeDriver(policy),host.saved);}catch(e){host.crashes.push(String(e.message||e).slice(0,100));return {schema:globalThis.RAPlayContract.RESULT_SCHEMA,version:globalThis.RAPlayContract.VERSION,status:'ERROR'};}
   if(r.result.status==='COMPLETE'||r.result.status==='DECLINED'){host.cache.set(plain.requestId,r.result);if(r.result.status==='COMPLETE')host.saved=r.world;}
   host.results.push({day:plain.day,status:r.result.status,win:r.result.outcome?.win,gain:r.result.cash?.gain||0,spent:r.result.cash?.spent||0});
   return JSON.parse(JSON.stringify(r.result));
  }};
 return host;
}

export async function simulate(seed,{days=24,policy='naive'}={}){
 const rng=mulberry(hash(`rc3|${seed}`));const realMath=Math.random;Math.random=rng;
 try{
  const {c}=await careerBoot(root,{seed,persona:'explorer'});
  await run(root,c,['js/systems/rc3_cut.js']);
  const host=await playHostFor(seed,policy);c.RAShowdown.play.setTransport(host.transport);
  c.RAClock.wake({first:true});for(const f of ['prologueDone','throneDone','firstWakeDone'])c.RALife.setFlag(f,true);
  const money=()=>c.RALife.money();
  const api={refresh(){},message(){},close:async()=>true,begin:async()=>false,launch:async()=>({})};
  const m={seed,days:[],errors:[],beats:[],finaleDay:null,minMoney:1e12,clubNights:0,clubSpent:0,plays:0};
  const drv=(id)=>{try{return drive(c,id,{fight:()=>({outcome:'win'}),minigame:(mid)=>({outcome:'win',score:1,rewards:mid==='slurp'?{money:150}:{}})});}catch(e){m.errors.push(`${id}: ${String(e.message||e).slice(0,100)}`);try{c.RAAdventures.abandon();}catch(e2){}}};
  const WR=()=>c.RAPhoneApps.get('warRoom');
  const playOne=async()=>{const menu=c.RAWarRoomJobs.buildNightMenu(),i=menu.findIndex(j=>j.routesToPlay);if(i<0)return false;const n0=host.results.length;
   try{await WR().onAction('play',String(i),api);}catch(e){m.errors.push('play '+String(e.message||e).slice(0,80));}
   if(c.RAWarRoomPlay.pending())await c.RAWarRoomPlay.resume();const r=host.results.at(-1);if(host.results.length===n0||!r||r.status!=='COMPLETE')return false;m.plays++;return true;};
  const club=async(budget)=>{
   if(!c.RAStripClub?.isOpen())return 0;const terms=c.RAStripClub.terms();const b0=money();const s=c.RAF06Rainmaker.mount({},{terms});
   try{if(s.start(budget)){let t=1000;for(let i=0;i<60;i++){if(c.RAF06Rainmaker.state().active==null)break;const st=s.game.getState();if(st.remaining<=0)break;s.game.flick(t+=700);}s.game.end();}}catch(e){m.errors.push('club '+String(e.message||e).slice(0,80));}finally{s.dispose();}
   c.RALife.setFlag('stripClubLastDay',c.RALife.today().day);return Math.max(0,b0-money());};
  for(let d=0;d<days;d++){
   const day=c.RALife.today().day,did=[];
   try{const w=c.RAWakeTriggers.pick();if(w){drv(w);did.push('wake:'+w);}}catch(e){m.errors.push('wake '+String(e.message||e).slice(0,80));}
   c.RAWorldEvents.deliver('phone');
   const seen=new Set();
   for(let i=0;i<12;i++){
    const g=c.RAGuidance.next();if(process.env.SIMDBG&&[12,14].includes(day))console.log('D'+day,i,g&&g.id,g&&g.action,g&&g.key);if(!g||seen.has(g.key+g.action))break;seen.add(g.key+g.action);
    const a=g.action;
    if(a==='sleep'||a==='close')break;
    if(a==='app:vampgpt'||a==='maps'){c.RAGuidance.opened('vampgpt');if(a==='maps')break;continue;}
    if(a==='app:warRoom'){const o=c.RAFrag.read('F04','offer',{});if(o.status==='available'){WR().onAction('accept','',api);did.push('offer');}}
    else if(a==='playNext'){if(await playOne())did.push('PLAY');}
    else if(a.startsWith('story:')){drv(a.slice(6));did.push(a.slice(6));}
    else if(a==='ogun_rave'){SEEDS.ogunsRave.apply(c);c.RALife.setFlag('rc3StoryDay',day);did.push('RAVE');}
    else if(a.startsWith('openWorldEvent:')){const id=a.slice(15);c.RAWorldEvents.see(id);c.RAWorldEvents.resolve(id,c.RAWorldEvents.byId(id).actions[0].id);did.push('invite');}
    else if(a==='app:stripClub'){const cash=money(),sp=await club(cash>=60000?10000:cash>=20000?5000:2000);if(sp>0){m.clubNights++;m.clubSpent+=sp;did.push('CLUB $'+sp);}}
    else if(a==='app:bank'){did.push('bank?');break;}
    else {m.errors.push(`unmapped ${a}`);break;}
    c.RAGuidance.opened(g.app||'');
   }
   m.minMoney=Math.min(m.minMoney,money());
   const NO=c.RAState.get().life.newOga;if(NO.finaleDone&&m.finaleDay==null)m.finaleDay=day;
   m.days.push({day,did:did.join(' '),before:money()});
   c.RAClock.sleep();m.days.at(-1).after=money();
  }
  m.final={money:money(),spine:c.RAGuidance.spine()?.label||'DONE',newOga:c.RAState.get().life.newOga.status};
  return m;
 }finally{Math.random=realMath;}
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const n=Number(arg('--seeds',3)),days=Number(arg('--days',24)),policy=arg('--policy','naive'),rows=[];
 for(let s=1;s<=n;s++){const m=await simulate(s,{days,policy});rows.push(m);
  console.log(`seed ${s}: finale D${m.finaleDay} final ${JSON.stringify(m.final)} minCash ${m.minMoney} club ${m.clubNights} nights $${m.clubSpent} plays ${m.plays} errors ${m.errors.length}`);
  if(s===1||process.argv.includes('--verbose'))for(const d of m.days)console.log(`  D${d.day} $${d.before} -> $${d.after} | ${d.did}`);
  if(m.errors.length)console.log('  errors:',m.errors.slice(0,6).join(' | '));}
 const out=arg('--json',null);if(out)fs.writeFileSync(out,JSON.stringify(rows,null,1));
}
