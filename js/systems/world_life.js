(function(){
 // World texture systems: VAMPIRE ECOLOGY (VOL 1 §9.5), OFFICER NODD (VOL 5 §2.7), BEDROOM COMPANY + PROPS
 // (VOL 1 §9.1, VOL 5 §9.5 — additive overlays; the frozen bedroom is never edited), THE LAURA LEDGER (VOL 5 §2.4).
 const life=()=>RALife.life();
 // ---- ecology ----
 const Eco={
  pressure:()=>Number(life().ecology.pressure)||0,
  add(n,reason){const p=Math.max(0,Eco.pressure()+n);RAState.patch('life.ecology.pressure',p);if(reason)RAState.recordEvent({id:`pressure:${RALife.today().day}:${reason}:${Date.now()}`,type:'pressure',amount:n,reason});RASealed.fire('PRESSURE',{pressure:p,reason});return p;},
  level(){const t=RASealed.tuning('pressure'),p=Eco.pressure();return p>=t.warning?2:p>=t.visible?1:0;},
  // Canon conversion outcomes feed the city: released (LET HER FLY) raises it more than kept close.
  converted(personId,{released}){Eco.add(released?2:1,released?'released':'kept');RALife.tendency(released?'messy':'solid');}
 };
 RAClock.onWake('ecology',50,({info})=>{const lvl=Eco.level();const seen=life().ecology.headlinesSeen||[];const key=`level${lvl}`;if(lvl>0&&!seen.includes(key)){RAState.patch('life.ecology.headlinesSeen',[...seen,key]);RALife.mail({id:`eco:${key}`,kind:'world',title:'VAMPGRAM',body:lvl===1?'BAT SIGHTINGS UP IN SILVER LAKE.':'HUNTER SEEN ON SUNSET.',app:'vampgram'});}});
 // Existing canon conversion flows (Assistant reveal; Importer's Daughter) report into the ecology once.
 function syncLegacyConversions(){const recs=life().people.records||{};for(const [id,r] of Object.entries(recs)){if(r?.conversionState!=='converted'||r.flags?.ecologyCounted)continue;RARelations.setFlag(id,'ecologyCounted',true);Eco.converted(id,{released:id==='ceo_assistant_001'});}}
 RAClock.onWake('ecology-legacy',49,syncLegacyConversions);
 // ---- Officer Nodd: once per ~8 drives he pulls Rich over, looks, nods, leaves. 5th: one word. 10th: a picture.
 const Nodd={maybeStop(){const drives=RALife.counter('drives');if(drives%8===3||RALife.flag('noddForce')){RALife.setFlag('noddForce',false);RALife.setFlag('noddPending',true);}},after(reason){RALife.setFlag('noddPending',true);RALife.setFlag('noddAfter',reason);}};
 // ---- bedroom company (chosen at WAKE; never more than one) ----
 RAClock.onWake('bedroom-company',90,({info})=>{
  const L=RALife.L();let pick=null;const cand=[];
  const stay=RALife.flag('stayedOver');if(stay&&stay.day===info.day-1)cand.push({kind:'woman',id:stay.person});
  const close=RALife.flag('lastCloseDate');if(!cand.length&&close&&info.day-close.day<=3&&RARelations.level(close.person)>=3&&RALife.hash(info.day*13)%3===0)cand.push({kind:'woman',id:close.person});
  if(RALife.flag('partyNight')===info.day-1)cand.push({kind:'homie',id:['tunde','dre','tristan'][info.day%3]});
  if(L.dragon?.stage==='majestic'&&RALife.hash(info.day*7)%2===0)cand.push({kind:'mazda'});
  if(life().ownership.cat&&RALife.hash(info.day*11)%3===0)cand.push({kind:'cat'});
  pick=cand[0]||null;RALife.setFlag('bedroomCompany',pick?{...pick,day:info.day}:null);
 });
 const PROPS={prop_plant:{x:236,y:392,w:14,h:22,c:'#2f7a3a'},prop_trippin_poster:{x:224,y:250,w:34,h:44,c:'#d7193f'},prop_rookoko_painting:{x:186,y:236,w:36,h:30,c:'#141026'},prop_jollof_trophy:{x:250,y:376,w:12,h:18,c:'#c18b3c'},prop_duoqlo_bag:{x:206,y:424,w:18,h:20,c:'#f0f0f0'},prop_cat_bed:{x:160,y:430,w:30,h:10,c:'#a07a5a'},prop_umich_pennant:{x:234,y:206,w:30,h:12,c:'#ffcb05'},prop_waffle_mix:{x:150,y:352,w:10,h:14,c:'#e8b43a'}};
 function render(layer){
  const cv=document.createElement('canvas');cv.width=270;cv.height=480;cv.className='bedroom-overlay-canvas';Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',imageRendering:'pixelated',pointerEvents:'none',zIndex:'1'});
  const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
  for(const id of life().ownership.props||[]){const p=PROPS[id];if(!p)continue;RAPixel.rect(ctx,p.x,p.y,p.w,p.h,p.c);RAPixel.rect(ctx,p.x,p.y,p.w,1,'rgba(255,255,255,.25)');}
  // Approved weather variant: rain nights show rain in the cloud window (clipped to the window region).
  if(RALife.today().rain){const rnd=RAPixel.rng(RALife.today().day);ctx.save();ctx.beginPath();ctx.rect(32,10,236,250);ctx.clip();ctx.fillStyle='rgba(20,30,60,.28)';ctx.fillRect(32,10,236,250);for(let i=0;i<90;i++)RAPixel.rect(ctx,32+rnd()*236,10+rnd()*250,1,6,'rgba(200,220,255,.55)');ctx.restore();}
  const c=RALife.flag('bedroomCompany');
  if(c&&c.day===RALife.today().day){
   if(c.kind==='woman'){const look=RABtfPeople.get(c.id)?.look||{};ctx.save();ctx.translate(196,332);ctx.rotate(-Math.PI/2);RAPixel.drawActor(ctx,look,0,0,.9);ctx.restore();RAPixel.rect(ctx,150,332,86,12,'#e9dcc4');}
   if(c.kind==='homie'){ctx.save();ctx.translate(120,452);ctx.rotate(-Math.PI/2);RAPixel.drawActor(ctx,RABtfPeople.get(c.id)?.look||{},0,0,.8);ctx.restore();}
   if(c.kind==='cat'){RAPixel.rect(ctx,200,336,16,10,'#e8c0b0');RAPixel.rect(ctx,212,330,6,6,'#e8c0b0');RAPixel.rect(ctx,212,327,2,3,'#e8c0b0');RAPixel.rect(ctx,216,327,2,3,'#e8c0b0');}
   if(c.kind==='mazda'){ctx.save();ctx.globalAlpha=.9;ctx.fillStyle='#3a6ff0';ctx.fillRect(150,90,46,10);ctx.fillRect(160,78,28,12);ctx.fillRect(196,86,12,6);ctx.restore();}
  }
  layer.prepend(cv);
 }
 window.RABedroomCompany={render,PROPS};
 // ---- Laura: never seen. The ledger quietly counts; what happens at its end is sealed. ----
 RAClock.onWake('laura',95,()=>{const n=Number(RALife.flag('lauraLedger'))||0;if(n!==life().laura.ledger){RAState.patch('life.laura.ledger',n);RASealed.fire('LEDGER',{ledger:n});}});
 window.RAEcology=Eco;window.RANodd=Nodd;
})();
