(function(){
 'use strict';
 // F05 - THE TRAP - sales.js
 // THE TRAP sec.5 (THE LOOP + SALES CHANNELS) and sec.7 (bad product, robbery). Sales resolve at NIGHT (when Rich
 // sleeps); the night report is read at the next WAKE; COUNT THE MONEY moves the cash from the house into the phone
 // balance and is the payoff moment. All money movement is tagged through the IF-1 money ledger; the reserved IF-1
 // sales channel `trap` is used for the banked income.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;
 const A=()=>R.AUTHORED,P=()=>R.PROVISIONAL;

 const ELITE_CLIENTS=['duchess','obas'];

 // ---- requirements ----
 function cloutIndex(){try{return window.RALife.clout();}catch(e){return 0;}}   // LOW=0 MID=1 HIGH=2 CRAZY=3
 function repIndex(){try{return window.RALife.rep();}catch(e){return 0;}}
 function bigTipper(){
  if(window.RAFrag&&window.RAFrag.has('F06')){
   const s=window.RAFrag.read('F06','status',null);if(s==='big_tipper'||s==='BIG_TIPPER')return true;
   if(window.RAFrag.read('F06','bigTipper',false))return true;
  }
  try{if(window.RALife.flag('bigTipper'))return true;}catch(e){}
  return false;   // RAINMAKER (F06) is not on this base -> F06_INTEGRATION_PENDING
 }
 function newOgaOrOffer(){return R.unlock.associateOrHigher()||R.unlock.newOgaFinished()||R.unlock.offerAccepted();}

 function requirementMet(channelId){
  const ch=A().channels[channelId];if(!ch)return {ok:false,reason:'unknown-channel'};
  const req=ch.requires||{};
  if(req.runner&&R.store.crewByRole('runner').length<U.int(req.runner))return {ok:false,reason:'need-runner'};
  if(req.cloutTier==='MID'&&cloutIndex()<1)return {ok:false,reason:'need-clout-mid'};
  if(req.bigTipper&&!bigTipper())return {ok:false,reason:'need-big-tipper',pending:'F06_INTEGRATION_PENDING'};
  if(req.repTier==='HIGH'&&repIndex()<2)return {ok:false,reason:'need-rep-high'};
  if(req.newOgaOrOffer&&!newOgaOrOffer())return {ok:false,reason:'need-new-oga-or-offer'};
  if(ch.eliteClients&&eliteClientsLeft().length===0)return {ok:false,reason:'no-clients'};
  return {ok:true};
 }
 function eliteClientsLeft(){return ELITE_CLIENTS.filter(id=>!R.store.clientLost(id));}

 function channels(){
  return Object.values(A().channels).map(ch=>({id:ch.id,label:ch.label,needs:ch.needs,risk:ch.risk,notes:ch.notes,grades:ch.grades.slice(),
   available:requirementMet(ch.id).ok,reason:requirementMet(ch.id).reason||null,multiplier:ch.multiplier==null?1:ch.multiplier,heatOverride:ch.heatOverride==null?null:ch.heatOverride}));
 }

 // ---- assign ----
 function assign({houseId,grade,cases,channel,day=U.day()}={}){
  if(!R.on())return {ok:false,reason:'flag-off'};
  if(!R.store.route().active)return {ok:false,reason:'route-inactive'};
  const ch=A().channels[channel];if(!ch)return {ok:false,reason:'unknown-channel'};
  const req=requirementMet(channel);if(!req.ok)return req;
  if(!ch.grades.includes(grade))return {ok:false,reason:'grade-not-on-channel',channelGrades:ch.grades.slice()};
  if(!R.store.hasHouse(houseId))return {ok:false,reason:'not-owned'};
  if(R.production.hot(houseId))return {ok:false,reason:'house-hot'};
  const qty=U.int(cases);if(qty<=0)return {ok:false,reason:'no-cases'};
  const ready=R.production.readyCases({houseId,grade,day});
  if(ready<qty)return {ok:false,reason:'not-enough-stock',ready};
  const a={houseId,grade,cases:qty,channel,day};
  R.store.setAssigned(a);
  return {ok:true,assignment:a};
 }

 // ---- resolve (NIGHT) ----
 function resolveNight({roll=null,day=U.day()}={}){
  if(!R.on())return null;
  const a=R.store.assigned();
  if(!a)return null;
  R.store.setAssigned(null);
  const ch=A().channels[a.channel];if(!ch)return null;
  const dayNow=U.day();

  const stock=R.production.takeStock({houseId:a.houseId,grade:a.grade,cases:a.cases,day:dayNow});
  const sold=stock.cases;
  if(sold<=0){const empty={day:dayNow,channel:a.channel,grade:a.grade,cases:0,revenue:0,heat:0,notes:['no stock ready'],skimming:false,lostClients:[]};R.store.addReport(empty);return empty;}

  let revenue=0;let lowCases=0;
  for(const g of stock.taken){
   const unit=R.production.unitPrice(a.grade,g.quality,{channelId:a.channel});
   revenue+=unit*g.cases;
   if(g.low)lowCases+=g.cases;
  }

  // THE TRAP sec.7 bad product: low-quality to elite clients ends that client forever.
  const lostClients=[];
  if(ch.eliteClients&&lowCases>0){
   const left=eliteClientsLeft();
   if(left.length){R.store.loseClient(left[0],dayNow);lostClients.push(left[0]);}
  }

  // THE TRAP sec.7 robbery by your own people (a runner can skim).
  let skimming=false;let stolen=0;const notes=[];
  if(ch.usesRunner){
   const runners=R.store.crewByRole('runner');
   const runnerId=runners[0]||null;
   const vaulted=R.levels.hasUpgrade('vault');   // "a vault (cash can't be stolen)"
   const theRoll=roll==null?Math.random():roll;
   const skim=vaulted?null:R.crew.skimCheck({runnerId,roll:theRoll});
   if(skim&&skim.skimming){
    skimming=true;stolen=Math.round(revenue*U.num(skim.amountPct));revenue-=stolen;
    R.patch('robbery',{suspectId:runnerId,notice:true,noticeDay:dayNow,resolved:null});
    notes.push('numbers look light.');
   }
  }
  if(lostClients.length)notes.push(`lost client: ${lostClients.join(', ')}`);

  // HEAT (shared). wholesale has a 0 override; everything else uses the provisional per-channel/grade weights.
  const heatDelta=R.heat.addSale({channelId:a.channel,grade:a.grade,cases:sold});
  if(heatDelta!==0)notes.push(`heat +${heatDelta}`);

  R.store.addUnbanked(revenue);
  R.levels.recordCases(sold);
  const report={day:dayNow,channel:a.channel,channelLabel:ch.label,grade:a.grade,cases:sold,revenue,stolen,
   heat:heatDelta,skimming,lostClients,clientsRemaining:eliteClientsLeft().length,notes,heatTier:R.heat.tier()};
  R.store.addReport(report);
  return report;
 }

 // ---- COUNT THE MONEY (WAKE) ----
 function bank(){
  if(!R.on())return {ok:false,reason:'flag-off'};
  const amount=U.int(R.read('unbanked',0));
  if(amount<=0)return {ok:false,reason:'nothing-to-count',amount:0};
  const last=R.store.lastReport()||{};
  let credited=false;
  try{
   if(window.RASalesChannels&&window.RASalesChannels.enabled&&window.RASalesChannels.enabled('trap')){
    const res=window.RASalesChannels.record('trap',{amount,kind:'sale',memo:last.channel||null});credited=!!res&&res.ok;
   }
  }catch(e){}
  if(!credited)window.RAMoneyLedger?.credit(amount,{source:`trap:${last.channel||'sale'}`});
  const moved=R.store.bankUnbanked();
  const bands=Math.floor((U.int(R.read('banked',0)))/U.num(A().counter.bandSize));
  return {ok:true,amount,moved:moved.amount||amount,bands};
 }

 function pending(){return U.int(R.read('unbanked',0));}
 function banked(){return U.int(R.read('banked',0));}

 R.sales={ELITE_CLIENTS,cloutIndex,repIndex,bigTipper,newOgaOrOffer,requirementMet,eliteClientsLeft,channels,assign,resolveNight,bank,pending,banked,status:()=>({pending})};
})();
