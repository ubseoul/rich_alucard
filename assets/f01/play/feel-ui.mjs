// THE PLAY — FEEL LOCK (OL-023) controller. One shared engine (js/frag/F01/play/engine.mjs) runs the PLAY; this file only turns its prompts and events into
// the ratified experience: PHONE OFFER → CREW / CAR → DEPARTURE → ARRIVAL → LIVE FEED → ESCAPE or SILENCE → BLACK → RETURN / AFTERMATH.
// DEEP SIMULATION, SIMPLE SURFACE: nothing here computes a rule and nothing here shows a number the player does not need.
import * as E from '../../../js/frag/F01/play/engine.mjs';
import * as W from '../../../js/frag/F01/play/world.mjs';
import * as C from '../../../js/frag/F01/play/content.mjs';
import * as AD from '../../../js/frag/F01/play/adapter.mjs';
import {createFeed,offerHints} from '../../../js/frag/F01/play/feed.mjs';
import {store,counter,tele} from './ui-core.mjs';
import * as K from './feel-core.mjs';
import * as V from './feel-scenes.mjs';
import * as A from './feel-art.mjs';

const Q=new URLSearchParams(location.search);
export const G={w:null,last:null,texts:[],plan:null,ctx:null,params:Q};
const money=k=>'$'+Math.round(k*1000).toLocaleString('en-US');
const save=()=>{if(G.embed)return;store.set('world2',G.w);}; // embed (F04 request): nothing is persisted mid-PLAY; the world is committed with the result

// ------------------------------------------------------------------------------------------------ world
function loadWorld(){
 let w=store.get('world2',null);
 if(!w||w.v!==2||!w.garage){
  const seed=Q.get('seed')?+Q.get('seed'):(Math.floor(Math.random()*90000)+1000);
  w=W.newWorld(seed);w.v=2;
  W.feelState(w);
  if(counter.get().plays>0)w.feel.sibDone=true; // the sibling meme is once per player, not once per save
 }
 return w;
}
function startNight(){
 const w=G.w;
 if(!(w.ui&&w.ui.open===w.night&&!w.ui.used)){W.advanceNight(w);w.ui={open:w.night,used:false};tele.log('NIGHT',{night:w.night});}
 save();
}
const named=(w,id)=>w.roster.find(o=>o.id===id)||{id,short:id,name:String(id).toUpperCase(),cls:'GHOST',traits:[]};

// ------------------------------------------------------------------------------------------------ what needs Rich at home
function homeItems(){
 const w=G.w;const recover=[],ransom=[];
 for(const l of W.lostCars(w)){
  recover.push({title:l.id,car:{id:l.id,state:l.route==='IMPOUND'?'impounded':'wrecked'},line:l.route==='IMPOUND'?'towed. it can be got back.':'wrecked. the dealer has more, if you want it back.',button:'GET IT BACK',act:()=>{W.recoverCar(w,l.id,{fee:0});save();}});
 }
 for(let gi=(w.lostGuns||[]).length-1;gi>=0;gi--){if(w.lostGuns[gi].gun==='pistol')W.rebuyGun(w,gi);} // a sidearm costs nothing at the weapon source: no need to bother Rich
 for(const [i,g] of (w.lostGuns||[]).entries()){
  const gv=A.gunView(g.gun);const fee=W.gunQuote(g.gun,w)||0;
  recover.push({title:gv.type+(gv.nick?` · ${gv.nick}`:''),line:g.route==='IMPOUND'?'the cops have it.':'gone. the armory has more.',button:fee?`BUY ${money(fee)}`:'REPLACE',disabled:w.cash<fee,act:()=>{const idx=(w.lostGuns||[]).findIndex(x=>x===g);if(idx>=0)W.rebuyGun(w,idx);save();}});
 }
 for(const c of (G.embed?[]:W.captiveInfo(w))){ // embed: F04 owns the EXTRACT window; F01's RANSOM surface is not routed
  if(c.lastNight)ransom.push({title:c.names.join(' & '),line:'last night. they want money.',button:`PAY ${money(c.cost)}`,disabled:!c.affordable,act:()=>{W.payRansom(w,c.gid);save();}});
 }
 return {recover,ransom};
}

// ------------------------------------------------------------------------------------------------ offers: a contact calls Rich
function decorate(p){
 const w=G.w,job=p.job,pit=named(w,p.pitcher);
 const t=p.extract?{text:p.quote,full:p.quote}:W.pitchText(w,job,p.pitcher);
 return {...p,caller:(pit.short||'SOMEONE').toUpperCase(),name:p.extract?job.names[0]:job.names[p.nameIdx],cashK:job.band[1],min:job.size[0],big:!!job.bigPlay,notice:!!p.notice,
  quote:p.notice?"they're coming to the castle. lock the good door.":t.text,full:t.full,hints:p.extract?[]:offerHints(w,job,p.pitcher)};
}
function buildOffers(){
 const w=G.w;const board=W.productionBoard(w);
 const extracts=(w.captives||[]).map(g=>AD.extractPitch(w,g));
 return [...board.pitches.filter(p=>p.notice),...extracts,...board.pitches.filter(p=>!p.notice)].map(decorate);
}

// ------------------------------------------------------------------------------------------------ one PLAY
async function playOne(offer){
 const w=G.w,job=offer.job,isX=!!offer.extract;
 const plan=isX?{oba:false,falseAlarm:false,sibling:null}:W.feelPlan(w,job);
 if(Q.get('oba')==='1'&&E.obaEligible(job)){plan.oba=true;}
 if(Q.get('falsealarm')==='1')plan.falseAlarm=true;
 const qa=Q.get('qa');const cfg={seed:G.embed?AD.seedFor(G.embed.req,isX):w.seed*1000+w.night*10+(isX?1:2),job,policy:'driver',opts:qa==='wash'?{qaWash:true}:{},night:w.night,pitcher:offer.pitcher,nameIdx:offer.nameIdx,pitchText:offer.full,state:w,intel:!!offer.intel,oba:!!plan.oba};
 G.plan=plan;G.curCfg={...cfg,state:structuredClone(w)};G.curRoster=structuredClone(w.roster);
 tele.log('PLAY_START',{job:job.id,seed:cfg.seed,night:w.night});tele.start('play');
 const out=await drive(cfg,plan,offer);
 const rec=out.rec;rec.feel=out.feed?{...out.feed.feel,lineLog:[...out.feed.lineLog]}:{};
 G.last={cfg:G.curCfg,rec,plan};
 const bankBefore=w.cash;
 W.applyResult(w,rec,job);
 if(!isX){w.ui.used=true;w.lastBoardSpecs=[job.id];}
 counter.bump();tele.log('PLAY_END',{job:job.id,win:rec.win,klass:rec.klass,ms:tele.since('play')});
 G.texts=rec.morning&&rec.morning.texts&&rec.morning.texts[0]?[splitText(rec.morning.texts[0])]:[];
 save();
 if(G.embed&&G.embed.onApplied)G.embed.onApplied(rec,w); // embed: build + COMMIT the canonical result before the return scene, so a reload here cannot lose or repeat the PLAY
 await returnFlow(out,rec,bankBefore);
 return rec;
}
const splitText=t=>{const m=/^([^:]{2,24}): (.*)$/.exec(t);return m?{who:m[1],text:m[2]}:{who:'TEXT',text:t};};

async function drive(cfg,plan,offer){
 const evs=[];E.setSink((t,d)=>evs.push({t,d}));
 const g=E.playGen(cfg);const ctx={feed:null,room:null,ui:null,crewObjs:null,carId:null,crew:null,job:cfg.job,defense:!!cfg.job.defense,plan,slide:null};G.ctx=ctx;
 let ans,r;
 try{
  for(;;){
   r=g.next(ans);
   const batch=evs.splice(0);await playBatch(batch,ctx,cfg);
   if(r.done)break;
   ans=await handlePrompt(r.value,ctx,cfg,offer);
  }
 }finally{E.setSink(null);}
 if(ctx.room)ctx.room.stop();
 return {rec:r.value,ctx,feed:ctx.feed};
}

async function playBatch(batch,ctx,cfg){
 for(const e of batch){
  const d=e.d;
  if(e.t==='SLIDE'){await onSlide(d,ctx,cfg);continue;}
  if(e.t==='GUN_FIRE'&&G.w.iron){K.S.gun(d.gun);continue;}
  if(!ctx.feed||!ctx.room)continue;
  let steps=[];
  if(e.t==='BEAT'){const nx=batch[batch.indexOf(e)+1];steps=ctx.feed.beat(d,{endKind:nx&&nx.t==='END'&&nx.d.kind==='WASH'?'WASH':null});}
  else if(e.t==='OBA')steps=ctx.feed.oba(d);
  else if(e.t==='GETAWAY')steps=ctx.feed.getaway(d);
  else if(e.t==='STEP_OK')steps=ctx.feed.stepOk(d);
  else if(e.t==='STEP_FAIL')steps=ctx.feed.stepFail(d);
  else if(e.t==='END'){if(d.kind!=='OBA')steps=ctx.feed.end(d);}
  else if(e.t==='REPORT'){if(!ctx.feed.quiet)steps=ctx.feed.out(d);}
  if(steps.length)await ctx.room.run(steps);if(d.snap)ctx.room.state(d.snap,d.stage||(e.t.startsWith('STEP')?'EXTRA ROOM':e.t));
 }
}
async function onSlide(d,ctx,cfg){
 const w=G.w;const guns=(ctx.crew&&ctx.crew.guns)||{};
 ctx.slide=d;
 ctx.crewObjs=d.seats.map(s=>{const o=G.curRoster.find(x=>x.id===s.id)||named(w,s.id);return {...o,gun:guns[s.id]||o.gun};});
 ctx.feed=createFeed({seed:cfg.seed,job:cfg.job,crew:ctx.crewObjs,roster:G.curRoster,recent:w.recent,seen:w.boardSeen,plan:ctx.plan});
 await V.departScene({ui:ctx.ui,slide:d,crewObjs:ctx.crewObjs,carId:d.car,defense:ctx.defense});
 await V.arriveScene({slide:d,crewObjs:ctx.crewObjs,carId:d.car,defense:ctx.defense,job:cfg.job});
 ctx.room=await V.roomScene({crewObjs:ctx.crewObjs,defense:ctx.defense,objective:cfg.job.names?.[cfg.nameIdx||0]||cfg.job.name||cfg.job.id});
 // the opening of the feed is part of the beat stream; nothing to say until the engine reports the first beat
}
async function handlePrompt(pr,ctx,cfg,offer){
 switch(pr.type){
  case 'CAR':{
   const w=G.w;const job=cfg.job;
   const res=await V.crewScene({pr,w,job:{...job,name:offer.name},hints:offer.hints,pitcher:named(w,offer.pitcher).short,big:!!job.bigPlay,defense:!!job.defense,lastCar:store.get('lastCar',null)});
   ctx.ui=res.ui;ctx.crew=res.answer;if(res.carId&&res.carId!=='CASTLE')store.set('lastCar',res.carId);
   return res.answer;
  }
  case 'CALL':{const view=ctx.feed.call(pr,{moreTime:K.moreTime()});return ctx.room.call(view);}
  case 'CLIMB':{const view=ctx.feed.climb(pr.info,{moreTime:K.moreTime()});const p=await ctx.room.climb(view);return p==='TIMEOUT'?'TIMEOUT':p==='KEEP';}
  case 'TURN':{const view=ctx.feed.turn(pr.turner&&pr.turner.id);const p=await ctx.room.turnChoice(view);return p==='TURN';}
  case 'GUN':{
   const crewIds=ctx.crewObjs.map(o=>o.id);const faces=pr.cands.filter(id=>crewIds.includes(id)).map(id=>ctx.crewObjs.find(o=>o.id===id)).filter(Boolean);
   const gv=A.gunView(pr.crate.gun);
   const pick=faces.length?await ctx.room.gunChoice({line:`WE GOT A ${gv.type}${gv.nick?' — '+gv.nick.toUpperCase():''}.`,faces}):pr.cands[0];
   return pick;
  }
 }
 return undefined;
}

// ------------------------------------------------------------------------------------------------ the way home
async function returnFlow(out,rec,bankBefore){
 const ctx=out.ctx;const w=G.w;
 const crewObjs=(ctx.crewObjs||rec.crew.map(id=>named(w,id)));
 const gunsAtStart=(ctx.crew&&ctx.crew.guns)||{};
 const objs=crewObjs.map(o=>({...o,gun:rec.gunGifts&&rec.gunGifts.some(g=>g.to===o.id)?rec.gunGifts.find(g=>g.to===o.id).gun:(gunsAtStart[o.id]||o.gun)}));
 // a collapse or a clean win both end in black first (the WASH steps already faded; otherwise fade here)
 if(!(ctx.feed&&ctx.feed.quiet&&rec.klass==='WASH'))await K.fadeTo(1,rec.klass==='WASH'?1000:900);
 K.stopAll();K.duck(false);
 const res=await V.returnScene({rec,crewObjs:objs,w,bankBefore,canonical:G.embed?.canonical||null});
 G.lastReturn=res;
 tele.start('again');
 const canonical=G.embed?.canonical||null;
 V.operationResult({rec,crewObjs:objs,canonical,bankBefore,bankAfter:w.cash,story:!!G.embed?.req.requestId?.startsWith('f07:')});
 await V.againButton(G.embed?'RETURN TO MISSION':undefined);
}

// ------------------------------------------------------------------------------------------------ nights
async function noOneCanGo(){
 K.clear();K.bg(K.BG.room,'brightness(.45)');K.el('dim');K.el('cap','NOBODY IS READY. SLEEP IT OFF.',null,{top:'200px'});
 await K.fadeTo(0,600);const b=document.createElement('button');b.className='again';b.textContent='SLEEP';K.world.appendChild(b);
 await new Promise(r=>b.onclick=()=>{K.unlock();r();});await K.fadeTo(1,500);
 G.w.ui.used=true;G.w.recent=[...G.w.recent.slice(-2),[...(G.w.boardSeen||[])]];G.w.boardSeen=[];save();
}
async function mainLoop(){
 let again=false;
 for(;;){
  const w=G.w;
  if(!w.ui||w.ui.used||w.ui.open!==w.night)startNight();
  await K.fadeTo(1,1);
  const items=homeItems();
  if(G.texts.length||items.recover.length||items.ransom.length){await V.homeScene({w,texts:G.texts,recover:items.recover,ransom:items.ransom,bank:w.cash});G.texts=[];}
  const offers=buildOffers();
  if(!offers.length){await noOneCanGo();continue;}
  let taken=null;
  for(const o of offers){
   const c=await V.offerScene({...o,bank:w.cash,again});again=true;
   if(tele.since('again')!=null){tele.log('M2P_TAP',{ms:tele.since('again')});tele.mark.again=null;}
   if(c==='answer'){taken=o;break;}
  }
  if(!taken){w.recent=[...w.recent.slice(-2),[...(w.boardSeen||[])]];w.boardSeen=[];w.ui.used=true;save();continue;} // laid low: the night passes
  await playOne(taken);
 }
}

// ------------------------------------------------------------------------------------------------ embed: the WAR ROOM asks for ONE play (contract: js/frag/F01/play_contract.js)
// WAR ROOM -> PHONE (this one offer) -> CREW / CAR -> DEPARTURE -> ARRIVAL -> LIVE FEED -> RETURN -> back to the WAR ROOM with a canonical result.
// The whole canonical presentation is reused unchanged; only the loop around it (the board, the nights, the title) is replaced by the request.
const EMBED_KEY='world_f04',RESULTS_KEY='embed_results';
// Transport retries can arrive before settlement: share the same live operation,
// just as completed requests share the persisted canonical receipt.
const activeRequests=new Map();
export function runEmbedded(req){
 const id=req&&req.requestId;
 if(typeof id!=='string'||!id)return runEmbeddedOnce(req);
 if(activeRequests.has(id))return activeRequests.get(id);
 if(activeRequests.size)return Promise.resolve(AD.refusedResult(req,'PLAY_BUSY','another operation is still in progress'));
 const pending=runEmbeddedOnce(req).finally(()=>activeRequests.delete(id));
 activeRequests.set(id,pending);return pending;
}
async function runEmbeddedOnce(req){
 const CT=globalThis.RAPlayContract;
 const cache=store.get(RESULTS_KEY,{});
 if(req&&cache[req.requestId])return cache[req.requestId]; // idempotent: an already-completed request is answered from the record, never replayed
 const v=CT.validateRequest(req);if(!v.ok)return AD.refusedResult(req,'BAD_REQUEST','the request does not match the contract',v.errors);
 const w=AD.prepareWorld(req,store.get(EMBED_KEY,null));G.w=w;A.bindGunViews(w.iron);K.bindGunAudio(w.iron);
 const before=Object.fromEntries(req.roster.map(o=>[o.id,o.status]));const cash0=w.cash;
 let picked=AD.pitchFor(w,req);
 const viaHome=AD.needsRecovery(w,picked); // NO CAR refuses the job, never the way back: a recoverable lost car sends Rich through the home scene (GET IT BACK) before the refusal is final
 if(picked.refuse&&!viaHome)return AD.refusedResult(req,picked.refuse.code,picked.refuse.reason);
 let result=null;
 const commit=(res)=>{const c=store.get(RESULTS_KEY,{});c[req.requestId]=res;const keys=Object.keys(c);for(const k of keys.slice(0,Math.max(0,keys.length-AD.RESULT_KEEP)))delete c[k];store.set(RESULTS_KEY,c);store.set(EMBED_KEY,G.w);};
 G.embed={req,onApplied:(rec,wNow)=>{result=AD.buildResult(req,{rec,w:wNow,before,cash0});G.embed.canonical=result;wNow.morningTexts=G.texts.slice();commit(result);
  if(window.parent!==window)window.parent.postMessage({type:'F01.play_committed',requestId:req.requestId},location.origin);}};
 w.ui={open:w.night,used:false};
 try{
  await K.fadeTo(1,1);
  const items=homeItems();
  if(G.texts.length||w.morningTexts.length||items.recover.length){await V.homeScene({w,texts:w.morningTexts.length?w.morningTexts:G.texts,recover:items.recover,ransom:[],bank:w.cash});w.morningTexts=[];G.texts=[];}
  if(viaHome){picked=AD.pitchFor(w,req);store.set(EMBED_KEY,G.w);} // judge the job again with whatever was got back; what was got back is kept even if the job still refuses
  if(picked.refuse)result=AD.refusedResult(req,picked.refuse.code,picked.refuse.reason);
  else{
   const offer=decorate(picked.pitch);
   const c=await V.offerScene({...offer,bank:w.cash,again:false});
   if(c!=='answer'){result=AD.declinedResult(req,{cash0,w});commit(result);}
   else await playOne(offer);
  }
 }catch(err){
  console.error(err);tele.log('ERROR',{msg:String(err&&err.stack||err)});
  if(!result)result=AD.refusedResult(req,'PLAY_ERROR',String(err&&err.message||err));
 }finally{G.embed=null;}
 return result;
}
// Host wiring: the WAR ROOM opens this page in an iframe (RAShowdown.play.launch); the request arrives by postMessage, the result goes back the same way.
async function bootEmbed(){
 K.applySettings();
 V.settingsButton({onNewCareer:null}); // the War Room owns the career: no NEW CAREER in embed
 const host=window.parent!==window?window.parent:null;const origin=location.origin;
 window.__raPlayEmbed={run:runEmbedded,G};
 window.__raPlay={G,W,E,C,K,V,A,AD,store,counter,tele,replayCheck};
 if(!host)return; // opened directly: driven through window.__raPlayEmbed.run(request)
 window.addEventListener('message',async ev=>{
  if(ev.origin!==origin||ev.source!==host||!ev.data||ev.data.type!=='F04.play_request')return;
  const res=await runEmbedded(ev.data.request);
  host.postMessage({type:'F01.play_result',result:res},origin);
 });
 host.postMessage({type:'F01.play_ready'},origin);
}

// ------------------------------------------------------------------------------------------------ boot
export async function boot(){
 if(Q.get('fresh')==='1'){store.del('world2');store.del('tele');store.del('counter');store.del('lastCar');try{const u=new URL(location.href);u.searchParams.delete('fresh');history.replaceState(null,'',u.toString());}catch(e){}}
 if(Q.get('mute')==='1')K.settings.set({sound:false});
 if(Q.get('reduce')==='1')K.settings.set({reduceMotion:true});
 if(Q.get('moretime')==='1')K.settings.set({moreTime:true});
 if(Q.get('embed')==='1'){await bootEmbed();return;}
 K.applySettings();
 G.w=loadWorld();if(Q.get('devbig')==='1')G.w.devBig=true;if(Q.get('hold')==='1'&&!(G.w.pending))G.w.pending={night:G.w.night,kind:'HOLD'};
 save();
 V.settingsButton({onNewCareer:()=>{store.del('world2');store.del('counter');store.del('lastCar');location.reload();}});
 window.__raPlay={G,W,E,C,K,V,A,store,counter,tele,replayCheck,forceHold:()=>{G.w.pending={night:G.w.night,kind:'HOLD'};save();},forceBig:()=>{G.w.devBig=true;save();}};
 await V.titleScene();
 try{await mainLoop();}catch(err){
  console.error(err);tele.log('ERROR',{msg:String(err&&err.stack||err)});
  K.clear();K.el('cap','SOMETHING BROKE. RELOAD TO RESUME.',null,{top:'200px'});await K.fadeTo(0,300);
 }
}

// deterministic replay: rerun the last PLAY headlessly from its recorded answers and compare the outcome
export function replayCheck(){
 const L=G.last;if(!L)return {ok:false,reason:'no play yet'};
 const ans=[...L.rec.answers];let i=0;const cfg={...L.cfg,state:structuredClone(L.cfg.state)};E.setSink(null);
 const rec2=E.runPlay(cfg,pr=>{const a=ans[i++];if(!a||a.t!==pr.type)return undefined;return a.a;});
 const pick=r=>JSON.stringify({win:r.win,final:r.final,klass:r.klass,fs:r.finalStatus,pot:r.pot,steps:r.steps,getaway:r.getaway,lost:r.lost,flags:r.storyFlags});
 return {ok:pick(rec2)===pick(L.rec),a:pick(L.rec),b:pick(rec2)};
}
