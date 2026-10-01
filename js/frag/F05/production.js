(function(){
 'use strict';
 // F05 - THE TRAP - production.js
 // THE TRAP sec.3 (grades + quality) and sec.4 (the COOK). Work cycle: BUY BASE -> COOK (quality) -> AGE -> READY.
 // Authored numbers (prices, aging sleeps, quality bands) come from tunables; the source leaves ingredient/upgrade
 // costs silent, so they are PROVISIONAL (owner F13) and centralized.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;
 const A=()=>R.AUTHORED,P=()=>R.PROVISIONAL;

 const GRADE_LEVEL={D:1,C:1,B:2,A:3,S:5};   // sec.6 Cook D-C (L1), Grade B (L2), Grade A (L3), Grade S (L5)
 const BASE_OF={D:'synth',C:'standard',B:'good',A:'premium',S:'premium'};

 function gradeUnlocked(grade,level=R.store.level()){const need=GRADE_LEVEL[grade];return !!need&&U.int(level)>=need;}
 function unlockedGrades(level=R.store.level()){return Object.keys(A().grades).filter(g=>gradeUnlocked(g,level));}

 function ingredients(){return R.read('ingredients',{})||{};}
 function addIngredient(kind,qty){const cur=U.int(ingredients()[kind]);R.patch(`ingredients.${kind}`,cur+U.int(qty));return cur+U.int(qty);}
 function purchaseIngredients(kind,qty,{source='gbenga'}={}){
  if(!(kind in ingredients()))return {ok:false,reason:'unknown-ingredient'};
  const q=U.int(qty);if(q<=0)return {ok:false,reason:'no-quantity'};
  const cost=U.num(P().ingredientCost[kind])*q;   // provisional; source gives no Gbenga markup number
  const paid=window.RAMoneyLedger?.withSource
   ? window.RAMoneyLedger.withSource(`trap:ingredients:${source}`,()=>cost===0?true:window.RALife.spend(cost),{memo:kind})
   : (cost===0?true:window.RALife.spend(cost));
  if(!paid)return {ok:false,reason:'no-money'};
  addIngredient(kind,q);
  return {ok:true,kind,qty:q,cost};
 }

 function hot(houseId,day=U.day()){const h=R.store.house(houseId);return !!h&&h.hotUntilDay!=null&&U.int(h.hotUntilDay)>day;}

 // The final grade after the authored "perfect cook" requirement (A) and Reserve+rare (S).
 function resolveGrade(grade,quality){
  const band=qualityBand(quality);
  if(grade==='A'&&quality<A().quality.premiumAt)return {grade:'B',downgradedFrom:'A'};
  if(grade==='S'&&quality<A().quality.premiumAt)return {grade:'A',downgradedFrom:'S'};
  return {grade};
 }
 function qualityBand(quality){
  const q=U.clamp(U.num(quality),0,100);
  if(q>=A().quality.premiumAt)return 'premium';
  if(q<A().quality.lowBelow)return 'low';
  return 'standard';
 }

 // Cook one night's capacity. `quality` is 0-100 from the COOK minigame or a crew cook (lower quality).
 function cook({houseId,grade,cases,quality,byCrew=false}={}){
  if(!R.on())return {ok:false,reason:'flag-off'};
  if(!R.store.route().active)return {ok:false,reason:'route-inactive'};
  const h=A().houses[houseId];if(!h)return {ok:false,reason:'unknown-house'};
  if(!R.store.hasHouse(houseId))return {ok:false,reason:'not-owned'};
  if(hot(houseId))return {ok:false,reason:'house-hot'};
  if(!gradeUnlocked(grade))return {ok:false,reason:'grade-locked'};
  const qty=U.int(cases);
  if(qty<=0)return {ok:false,reason:'no-cases'};
  if(qty>U.int(h.capacity))return {ok:false,reason:'over-capacity'};
  const resolved=resolveGrade(grade,U.num(quality));
  const final=resolved.grade;

  const base=BASE_OF[grade];
  if(U.int(ingredients()[base])<qty)return {ok:false,reason:'no-ingredients',needs:{[base]:qty,have:U.int(ingredients()[base])}};
  if(U.num(A().grades[grade].rare)){
   if(U.int(ingredients().rare)<1)return {ok:false,reason:'no-rare-ingredient'};
   R.patch('ingredients.rare',U.int(ingredients().rare)-1);
  }
  R.patch(`ingredients.${base}`,U.int(ingredients()[base])-qty);

  const aging=U.int(A().grades[final].aging);
  const batch={id:`b${U.day()}-${Math.random().toString(36).slice(2,8)}`,houseId,grade:final,quality:U.clamp(U.num(quality),0,100),
   cases:qty,readyDay:U.day()+aging,madeDay:U.day(),premium:qualityBand(quality)==='premium',byCrew:!!byCrew,
   requestedGrade:grade,downgradedFrom:resolved.downgradedFrom||null};
  R.store.addBatch(batch);
  return {ok:true,batch};
 }

 function crewQuality(){return U.num(P().crewCookQuality);}

 // Ready stock grouped by quality band, highest quality first (used by sales to price per case).
 function readyGroups({houseId,grade,day=U.day()}={}){
  const list=R.store.readyBatches(day).filter(b=>b.houseId===houseId&&b.grade===grade).sort(U.byQuality);
  return list.map(b=>({batchId:b.id,quality:U.num(b.quality),premium:!!b.premium,low:qualityBand(b.quality)==='low',cases:U.int(b.cases)}));
 }
 function readyCases({houseId=null,grade=null,day=U.day()}={}){
  return R.store.readyBatches(day).filter(b=>(houseId==null||b.houseId===houseId)&&(grade==null||b.grade===grade))
   .reduce((n,b)=>n+U.int(b.cases),0);
 }
 function stockSummary(day=U.day()){
  const out={};for(const b of R.store.readyBatches(day)){const k=`${b.houseId}|${b.grade}`;out[k]=(out[k]||0)+U.int(b.cases);}return out;
 }

 // Consume up to `cases` ready cases, highest quality first, returning the groups actually taken.
 function takeStock({houseId,grade,cases,day=U.day()}={}){
  let remaining=U.int(cases);const taken=[];
  for(const b of R.store.batches().filter(x=>x.houseId===houseId&&x.grade===grade&&U.int(x.readyDay)<=day).sort(U.byQuality)){
   if(remaining<=0)break;
   const have=U.int(b.cases);if(have<=0)continue;
   const use=Math.min(have,remaining);
   taken.push({batchId:b.id,quality:U.num(b.quality),cases:use,premium:!!b.premium,low:qualityBand(b.quality)==='low'});
   const left=have-use;remaining-=use;
   if(left<=0)R.store.removeBatch(b.id);else R.patch('batches',R.store.batches().map(x=>x.id===b.id?{...x,cases:left}:x));
  }
  return {taken,cases:taken.reduce((n,t)=>n+t.cases,0),shortfall:Math.max(0,remaining)};
 }

 // Sec.3 quality -> price. Authored: >=90% adds PREMIUM +25%; below 50% sells at half price; wholesale = 60%.
 function unitPrice(grade,quality,{channelId=null}={}){
  const g=A().grades[grade];if(!g)return 0;
  let price=U.num(g.price);const band=qualityBand(quality);
  if(band==='premium')price*=U.num(A().quality.premiumMult);
  else if(band==='low')price*=U.num(A().quality.lowMult);
  const ch=channelId?A().channels[channelId]:null;
  if(ch&&ch.multiplier!=null)price*=U.num(ch.multiplier);
  return Math.round(price);
 }

 // THE TRAP sec.3 S grade rare ingredient: "one per week: dragon scale from Mazda's roost, an Agege crumb,
 // a fish scale - which Rich must handle himself". No second rare is granted inside 7 days.
 const RARE_SOURCES=['dragon_scale','agege_crumb','fish_scale'];
 function gainRare(source,{handled=false,day=U.day()}={}){
  if(!RARE_SOURCES.includes(source))return {ok:false,reason:'unknown-rare'};
  const last=R.read('rare.lastGainedDay',null);
  if(last!=null&&day-U.int(last)<7)return {ok:false,reason:'rare-weekly-lock',nextDay:U.int(last)+7};
  if(source==='dragon_scale'){const d=window.RALife?.dragon?.();if(!d)return {ok:false,reason:'no-dragon'};}
  if(source==='fish_scale'&&!handled)return {ok:false,reason:'rich-must-handle-it'};
  const count=U.int(R.read('rare.count',0))+1;
  R.patch('rare',{lastGainedDay:day,count});
  R.patch('ingredients.rare',U.int(ingredients().rare)+1);
  return {ok:true,source,count};
 }

 R.production={GRADE_LEVEL,BASE_OF,gradeUnlocked,unlockedGrades,ingredients,addIngredient,purchaseIngredients,
  hot,resolveGrade,qualityBand,cook,crewQuality,readyGroups,readyCases,stockSummary,takeStock,unitPrice,
  RARE_SOURCES,gainRare,rareHeld:()=>U.int(ingredients().rare)};
})();
