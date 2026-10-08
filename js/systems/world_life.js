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
  // Parked World Reaction C5: a returned homie can sleep off the PLAY at the castle.
  // Read the existing report snapshot; wounded, captured and gone crew never appear here.
  const play=window.RAWarRoomReportCard?.recent?.(1)?.[0];
  if(play?.day===info.day-1)for(const id of ['tunde','dre']){
   const returned=play.squad?.find(o=>o.id===id&&o.status==='ACTIVE');
   if(returned&&window.RACrew?.get?.(id)?.status==='ACTIVE')cand.push({kind:'homie',id});
  }
  if(L.dragon?.stage==='majestic'&&RALife.hash(info.day*7)%2===0)cand.push({kind:'mazda'});
  if(life().ownership.cat&&RALife.hash(info.day*11)%3===0)cand.push({kind:'cat'});
  pick=cand[0]||null;RALife.setFlag('bedroomCompany',pick?{...pick,day:info.day}:null);
 });
 const PROPS={prop_plant:{x:236,y:392,w:14,h:22,c:'#2f7a3a'},prop_trippin_poster:{x:224,y:250,w:34,h:44,c:'#d7193f'},prop_rookoko_painting:{x:186,y:236,w:36,h:30,c:'#141026'},prop_jollof_trophy:{x:250,y:376,w:12,h:18,c:'#c18b3c'},prop_duoqlo_bag:{x:206,y:424,w:18,h:20,c:'#f0f0f0'},prop_cat_bed:{x:160,y:430,w:30,h:10,c:'#a07a5a'},prop_umich_pennant:{x:234,y:206,w:30,h:12,c:'#ffcb05'},prop_waffle_mix:{x:150,y:352,w:10,h:14,c:'#e8b43a'}};
 // ART SHIP 014 frozen room art by prop id (exact-origin 270×480 overlays); unmapped props keep the placeholder rect.
 const PROP_ART={prop_plant:'plant',prop_trippin_poster:'trippin_red_poster',prop_rookoko_painting:'rookoko_painting',prop_jollof_trophy:'jollof_trophy',prop_duoqlo_bag:'duoqlo_bag',prop_cat_bed:'unused_cat_bed',prop_umich_pennant:'michigan_pennant',prop_waffle_mix:'waffle_mix_bag'};
 // Frozen company sprites at native 1:1 on a contact point: she lies on the bed right of Rich; a homie sleeps it off
 // on the floor (the approved asleep-on-the-floor states); the cat curls on the bed where the placeholder sat.
 const WOMAN_CONTACT=[196,360],HOMIE_CONTACT=[128,478],CAT_AT=[202,350];
 // Source overlays are frozen; crop only their transparent padding while drawing.
 // Wall decor mounts on the solid left pier, floor objects sit on the foreground strip.
 const PROP_PLACEMENT={plant:[250,478,24,32],trippin_red_poster:[18,147,22,30],rookoko_painting:[18,201,24,23],jollof_trophy:[239,309,19,24],duoqlo_bag:[191,478,22,28],unused_cat_bed:[147,478,30,15],michigan_pennant:[18,248,28,17],waffle_mix_bag:[217,478,20,25]};
 const cropCache=new Map();
 function bounds(im){let b=cropCache.get(im.src);if(b)return b;const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const c=cv.getContext('2d');c.drawImage(im,0,0);const d=c.getImageData(0,0,cv.width,cv.height).data;let x1=cv.width,y1=cv.height,x2=0,y2=0;for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(d[(y*cv.width+x)*4+3]){x1=Math.min(x1,x);y1=Math.min(y1,y);x2=Math.max(x2,x+1);y2=Math.max(y2,y+1);}b=[x1,y1,x2-x1,y2-y1];cropCache.set(im.src,b);return b;}
 const HOMIE_FLOOR={tunde:'asleep_floor',dre:'asleep_floor',tristan:'floor'};
 const art=()=>window.RAArtRegistry||{};
 const images=new Map();
 function image(src,redraw){if(!images.has(src)){const img=new Image();img.src=src;images.set(src,img);}const img=images.get(src);if(!(img.complete&&img.naturalWidth))img.addEventListener('load',redraw,{once:true});return img;}
 function canvas(className,z){const cv=document.createElement('canvas');cv.width=270;cv.height=480;cv.className=className;Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',imageRendering:'pixelated',pointerEvents:'none',zIndex:z});return cv;}
 let under=null;
 function clear(){under?.remove();under=null;}
 function render(layer){
  // Two world layers: `under` sits below Rich (the window weather and Mazda's fly-by pass behind him); the main
  // overlay rides with the life layer above the room (props and company stay clear of Rich's corridor).
  clear();const cv=canvas('bedroom-overlay-canvas','1');under=canvas('bedroom-overlay-canvas bedroom-overlay-under','2');
  document.querySelector('#bedroomScene')?.append(under);
  const draw=()=>{
   const ctx=cv.getContext('2d'),uctx=under?.getContext('2d');if(!uctx)return;
   for(const c of [ctx,uctx]){c.imageSmoothingEnabled=false;c.clearRect(0,0,270,480);}
   const put=(c,src,x=0,y=0)=>{if(!src)return false;const img=image(src,draw);if(img.complete&&img.naturalWidth){c.drawImage(img,x,y);}return true;};
   for(const id of life().ownership.props||[]){const p=PROPS[id],key=PROP_ART[id],at=PROP_PLACEMENT[key],src=art().bedroom?.props?.[key]?.asset;if(!p||!at)continue;const im=src&&image(src,draw);if(!im?.complete||!im.naturalWidth)continue;const [cx,foot,w,h]=at,[sx,sy,sw,sh]=bounds(im);
    if(['plant','duoqlo_bag','unused_cat_bed','waffle_mix_bag'].includes(key)){ctx.fillStyle='rgba(8,5,12,.55)';ctx.fillRect(Math.round(cx-w/2)+2,foot-1,w-4,2);}
    if(key==='jollof_trophy'){ctx.fillStyle='#251921';ctx.fillRect(cx-13,foot,26,2);ctx.fillStyle='#8a583e';ctx.fillRect(cx-13,foot-1,26,1);}
    ctx.drawImage(im,sx,sy,sw,sh,Math.round(cx-w/2),foot-h,w,h);
   }
   // Approved weather variant: rain nights dim the cloud window and show the frozen rain-window overlay.
   if(RALife.today().rain){uctx.save();uctx.beginPath();uctx.rect(32,10,236,250);uctx.clip();uctx.fillStyle='rgba(20,30,60,.28)';uctx.fillRect(32,10,236,250);uctx.restore();
    if(!put(uctx,art().bedroom?.window?.rain_night_window?.asset)){const rnd=RAPixel.rng(RALife.today().day);for(let i=0;i<90;i++)RAPixel.rect(uctx,32+rnd()*236,10+rnd()*250,1,6,'rgba(200,220,255,.55)');}}
   const c=RALife.flag('bedroomCompany');
   if(c&&c.day===RALife.today().day){
    const person=RABtfPeople.get(c.id);
    if(c.kind==='woman'){if(!put(ctx,person?.states?.bedroom_company,WOMAN_CONTACT[0]-40,WOMAN_CONTACT[1]-88)){ctx.save();ctx.translate(196,332);ctx.rotate(-Math.PI/2);RAPixel.drawActor(ctx,person?.look||{},0,0,.9);ctx.restore();RAPixel.rect(ctx,150,332,86,12,'#e9dcc4');}}
    if(c.kind==='homie'){if(!put(ctx,person?.states?.[HOMIE_FLOOR[c.id]],HOMIE_CONTACT[0]-40,HOMIE_CONTACT[1]-88)){ctx.save();ctx.translate(120,452);ctx.rotate(-Math.PI/2);RAPixel.drawActor(ctx,person?.look||{},0,0,.8);ctx.restore();}}
    if(c.kind==='cat'){const src=art().creatures?.cat?.states?.on_bed?.asset,im=src&&image(src,draw);if(im?.complete&&im.naturalWidth){ctx.fillStyle='rgba(27,6,22,.5)';ctx.fillRect(CAT_AT[0]-18,CAT_AT[1]-1,36,2);ctx.drawImage(im,CAT_AT[0]-30,CAT_AT[1]-30,60,40);}else if(!src){RAPixel.rect(ctx,200,336,16,10,'#e8c0b0');RAPixel.rect(ctx,212,330,6,6,'#e8c0b0');RAPixel.rect(ctx,212,327,2,3,'#e8c0b0');RAPixel.rect(ctx,216,327,2,3,'#e8c0b0');}}
    if(c.kind==='mazda'){if(!put(uctx,art().bedroom?.company?.mazda_flyby?.asset)){uctx.save();uctx.globalAlpha=.9;uctx.fillStyle='#3a6ff0';uctx.fillRect(150,90,46,10);uctx.fillRect(160,78,28,12);uctx.fillRect(196,86,12,6);uctx.restore();}}
   }
  };
  draw();layer.prepend(cv);
 }
 window.RABedroomCompany={render,clear,PROPS,PROP_ART,HOMIE_FLOOR,PROP_PLACEMENT};
 // ---- Laura: never seen. The ledger quietly counts; what happens at its end is sealed. ----
 RAClock.onWake('laura',95,()=>{const n=Number(RALife.flag('lauraLedger'))||0;if(n!==life().laura.ledger){RAState.patch('life.laura.ledger',n);RASealed.fire('LEDGER',{ledger:n});}});
 window.RAEcology=Eco;window.RANodd=Nodd;
})();
