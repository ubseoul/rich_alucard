// F15 VELVET ROTATION — the club stage: three dancers over the REAL F06 MAKE IT RAIN renderer, the support choice, targeting,
// per-throw recipient snapshot and feedback. DARK behind F15.velvet_rotation.
//
// Seam (smallest legitimate F06/F15 contact): F06's production launcher calls RAF15Club.open() when the flag is ON and passes the
//   result's {hideTarget, tunables, onSpend} into its own mount; F06's pure core and tunables are untouched. The neutral placeholder
//   mannequin is not drawn (adapter option hideTarget), the dancers are drawn on an overlay canvas at device resolution (the accepted
//   Layout A rendering), and F06's approved mechanics decide every hit, miss, hype and dollar.
//
// Targeting: the F06 target is the existing `target` tunable block. With the period made effectively infinite and the amplitude set
//   to (cx - 0.5) the approved formula 0.5 + A*sin(2*pi*t/P + pi/2) evaluates to the supported dancer's slot x, so F06's own hit
//   test, spotlight pool and HIT/MISS feedback land on HER. Changing selection only rewrites those numbers for FUTURE releases: the
//   F06 core resolves a throw (targetX included) at the instant of release and the feedback animation already carries that value,
//   so nothing already in flight can be redirected.
//
// Money: F06 production debits each throw once (rainmaker:flick). F15 only ATTRIBUTES that already-paid amount to the recipient
//   chosen at that same instant (floor and missed bills included). No money is created, refunded or moved here.
(function(global){
 'use strict';
 const T=()=>global.RAF15Tunables,C=()=>global.RAF15;
 const enabled=()=>!!C()?.enabled();
 const SHEET_DIR='assets/f15/dancers/';
 const PSTART='"Press Start 2P", "Courier New", monospace';
 let current=null;

 const CSS=`
 .cab.f15 .stage{height:clamp(340px,calc(100vh - 216px),calc((var(--stage-w) - 16px) * 1.78));height:clamp(340px,calc(100dvh - 216px),calc((var(--stage-w) - 16px) * 1.78))}
 .f15-dancers{position:absolute;left:0;top:0;pointer-events:none}
 .f15-bar{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}
 .f15-chip{font-family:var(--font);color:#f4f0ff;background:var(--purple);border:2px solid #8a85b8;outline:1px solid var(--ink);padding:6px 4px;min-height:58px;min-width:0;cursor:pointer;text-align:center;box-shadow:2px 2px 0 var(--blood);touch-action:manipulation;border-radius:0}
 .f15-chip[aria-checked="true"]{border-color:var(--cyan);background:#0f3a52}
 .f15-chip b{display:block;font-size:9px;font-weight:400;letter-spacing:0}
 .f15-chip span{display:block;margin-top:5px;font-size:7px;line-height:1.35;color:var(--lav);word-break:break-word}
 .f15-chip i{display:block;margin:4px 2px 0;height:4px;background:#241a45;font-style:normal}
 .f15-chip i u{display:block;height:100%;background:var(--gold-hi);text-decoration:none}
 .f15-date{display:grid;gap:6px;margin-top:8px}
 .f15-date:empty{display:none}
 .f15-date .btn{width:100%;font-size:9px}
 .f15-note{margin:6px 2px 0;font-family:var(--font);font-size:7px;line-height:1.6;color:var(--lav);min-height:12px}
 .f15-id{margin-top:4px;font-family:var(--font);font-size:7px;color:var(--lav)}
 .f15-id summary{cursor:pointer;color:var(--gold-hi);padding:4px 2px;min-height:28px}
 .f15-id p{margin:4px 0 8px;line-height:1.7;color:var(--cream)}
 .f15-id label{display:flex;justify-content:space-between;align-items:center;gap:6px;margin:4px 0}
 .f15-id select{font-family:var(--font);font-size:8px;background:var(--purple);color:var(--cream);border:2px solid var(--lav-2);padding:6px;min-height:36px}
 .f15-dev{color:var(--gold-hi)}
 `;

 const money=n=>'$'+Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
 const short=n=>n>=1000?'$'+(n/1000)+'K':money(n);

 function open({shadow,stage,canvas}){
  if(current)current.close();
  const L=T().LAYOUT,names=T().NAMES;
  const style=document.createElement('style');style.textContent=CSS;shadow.appendChild(style);
  const cab=shadow.querySelector('.cab');cab?.classList.add('f15');
  const over=document.createElement('canvas');over.className='f15-dancers';over.setAttribute('aria-hidden','true');stage.appendChild(over);
  const octx=over.getContext('2d');
  const bar=document.createElement('div');bar.className='f15-bar';bar.setAttribute('role','radiogroup');bar.setAttribute('aria-label','Choose who to support');
  const dateRow=document.createElement('div');dateRow.className='f15-date';
  const note=document.createElement('p');note.className='f15-note';note.setAttribute('role','status');note.textContent='LOADING DANCERS...';
  const idBox=document.createElement('details');idBox.className='f15-id';
  const anchor=shadow.querySelector('.player-bar');
  for(const el of [bar,dateRow,note,idBox])anchor?anchor.before(el):cab.appendChild(el);

  const sheets={},status={loaded:false,failed:null};
  let manifest=null,game=null,api=null,disposed=false,raf=0,t0=performance.now(),lastKey='',effects=[],pulses={},last=null,selectedLocal=C().selected();
  const geo={W:0,H:0,feetY:0,k:1,dpr:1,boxes:{},x:{},clamped:false};
  const targetFor=dancer=>{const cx=L.slots[C().handleOf(dancer)].cx,A=cx-0.5;return {driftAmplitude:A,driftPeriodMs:1e15,driftPhase:Math.PI/2};};

  // ---- chips ---------------------------------------------------------------------------------------------------------
  function renderBar(){
   bar.replaceChildren();
   for(const d of C().dancers()){
    const p=C().progress(d),b=document.createElement('button');
    b.type='button';b.className='f15-chip';b.dataset.dancer=d;b.setAttribute('role','radio');b.setAttribute('aria-checked',String(d===selectedLocal));
    const pct=p.maxed?100:Math.min(100,Math.round(100*p.spent/(p.nextThreshold||1)));
    b.innerHTML=`<b>${names[d]}</b><span>${money(p.spent)}</span><i><u style="width:${pct}%"></u></i><span>${p.maxed?'ALL 4 SEEN':p.availableLevel?`SCENE ${p.availableLevel} READY`:`SCENE ${p.next} AT ${short(p.nextThreshold)}`}</span>`;
    b.addEventListener('click',()=>choose(d));bar.appendChild(b);
   }
   dateRow.replaceChildren();
   const ready=C().dancers().map(d=>({d,id:C().nextScene(d)})).filter(x=>x.id&&C().status(x.id).ok);
   for(const {d,id} of ready){
    const b=document.createElement('button');b.type='button';b.className='btn f15-go';b.dataset.scene=id;
    b.textContent=`${names[d]} - ${global.RAF15Dates?.title(id)||id} - GO`;b.addEventListener('click',()=>binding?.launchScene(id));dateRow.appendChild(b);
   }
   if(!ready.length&&C().capReached()&&C().dancers().some(d=>C().progress(d).availableLevel))note.dataset.cap='1';
   renderIdentity();
  }
  function renderIdentity(){
   if(idBox.dataset.open==='1'&&idBox.open)return;
   const map=C().mapping(),ident=T().IDENTITY;
   idBox.innerHTML=`<summary>IDENTITY CHECK - UBE TO CONFIRM</summary><p class="f15-dev">${ident.status}. Which dancer is which has no proof in the art files. Pick the right figure for each name; progress is saved by NAME and never changes.</p>`;
   for(const d of C().dancers()){
    const l=document.createElement('label');l.innerHTML=`<span>${names[d]}</span>`;
    const sel=document.createElement('select');sel.dataset.dancer=d;sel.setAttribute('aria-label',`${names[d]} figure`);
    for(const h of T().HANDLES){const o=document.createElement('option');o.value=h;o.textContent=h.toUpperCase();if(map[d]===h)o.selected=true;sel.appendChild(o);}
    sel.addEventListener('change',()=>{const next={...C().mapping()};const other=C().dancers().find(x=>x!==d&&next[x]===sel.value);if(other)next[other]=next[d];next[d]=sel.value;C().setMapping(next);applyTarget();lastKey='';renderBar();idBox.open=true;idBox.dataset.open='1';});
    l.appendChild(sel);idBox.appendChild(l);
   }
   idBox.addEventListener('toggle',()=>{idBox.dataset.open=idBox.open?'1':'0';},{once:false});
  }

  // ---- targeting -------------------------------------------------------------------------------------------------------
  function applyTarget(){if(!game)return;Object.assign(game.tunables.target,targetFor(selectedLocal));}
  function choose(d){
   if(!C().select(d))return;selectedLocal=d;applyTarget();lastKey='';
   note.textContent=`SUPPORTING ${names[d]}. EVERY BILL YOU THROW COUNTS FOR HER.`;
   for(const el of bar.children)el.setAttribute('aria-checked',String(el.dataset.dancer===d));
  }
  // F06 production calls this after it has paid for ONE throw. The recipient is read HERE, at the instant of the throw.
  function onSpend({delta,result}){
   const recipient=selectedLocal,before=C().progress(recipient);
   const after=C().recordSpend(recipient,delta);
   if(!after)return;
   last={recipient,delta:Math.round(delta),kind:result?.kind||null,targetX:result?.targetX??null,at:performance.now()};
   const x=geo.x[recipient]??geo.W/2,N=performance.now(),kind=result?.kind||'hit';
   effects.push({x,recipient,text:kind==='hit'?(result.perfect?'PERFECT':'HIT'):(kind==='overthrow'?'OVERTHROW':'MISS'),sub:'$'+Math.round(delta).toString().replace(/\B(?=(\d{3})+(?!\d))/g,','),color:kind==='hit'?'#ffe6a1':'#ff8a4a',t0:N,ttl:1100});
   pulses[recipient]={t0:N,hit:kind==='hit'};
   if(after.availableLevel&&after.availableLevel!==before.availableLevel){
    note.textContent=`${names[recipient]}: SCENE ${after.availableLevel} IS READY.`;
    try{global.RAF15Dates?.offer(recipient);}catch(e){console.error('F15 offer',e);}
   }
   renderBar();lastKey='';
  }

  // ---- drawing -------------------------------------------------------------------------------------------------------------
  function measure(){
   if(!game)return false;
   const g=game.geometry(),sr=stage.getBoundingClientRect(),cr=canvas.getBoundingClientRect();
   if(!(cr.width>0&&cr.height>0&&g.H>0))return false;
   const W=stage.clientWidth,H=stage.clientHeight,dpr=Math.min(3,global.devicePixelRatio||1),scale=cr.height/g.H;
   const offX=(cr.left-sr.left)-stage.clientLeft,offY=(cr.top-sr.top)-stage.clientTop;
   geo.W=W;geo.H=H;geo.dpr=dpr;
   geo.feetY=offY+(g.deckTop+Math.round(g.deckH*L.deckFeetFrac))*scale;
   const kw=L.refScale*W/L.refStageWidth,kh=(geo.feetY-(offY+L.hudLogicalY*scale)-L.headroomPx)/L.tallestMasterPx;
   geo.k=Math.min(kw,kh);geo.clamped=kh<kw;geo.kWidth=kw;geo.kHeadroom=kh;geo.hudBottom=offY+L.hudLogicalY*scale;
   for(const d of C().dancers())geo.x[d]=offX+L.slots[C().handleOf(d)].cx*cr.width;
   return true;
  }
  const frameFor=handle=>Math.floor((performance.now()-t0)/(1000/L.fps))%manifest.dancers[handle].frames;
  function draw(){
   const W=geo.W,H=geo.H,dpr=geo.dpr,cw=Math.round(W*dpr),ch=Math.round(H*dpr);
   if(over.width!==cw||over.height!==ch){over.width=cw;over.height=ch;}
   over.style.width=W+'px';over.style.height=H+'px';
   octx.setTransform(1,0,0,1,0,0);octx.clearRect(0,0,cw,ch);
   octx.imageSmoothingEnabled=true;octx.imageSmoothingQuality='high';
   geo.boxes={};
   const order=C().dancers().slice().sort((a,b)=>L.slots[C().handleOf(a)].z-L.slots[C().handleOf(b)].z),N=performance.now();
   // floor marks first, under every dancer: selected = cyan pool, others = dim ring; a throw pulses the recipient's ring
   for(const d of order){
    const cx=geo.x[d]*dpr,cy=geo.feetY*dpr,rx=0.30*464*geo.k*dpr,ry=Math.max(3*dpr,rx*0.2),sel=d===selectedLocal,pu=pulses[d],age=pu?N-pu.t0:9e9;
    octx.beginPath();octx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
    if(sel){octx.fillStyle='rgba(95,227,255,0.22)';octx.fill();}
    if(age<500){octx.fillStyle=(pu.hit?'rgba(246,200,90,':'rgba(255,90,95,')+(0.45*(1-age/500))+')';octx.fill();}
    octx.lineWidth=(sel?2:1)*dpr;octx.strokeStyle=sel?'#5fe3ff':'rgba(164,159,192,0.45)';octx.stroke();
   }
   for(const d of order){
    const h=C().handleOf(d),m=manifest.dancers[h],img=sheets[h],f=frameFor(h);
    const dw=m.cell[0]*3*geo.k,dh=m.cell[1]*3*geo.k,dx=geo.x[d]-m.anchor_in_cell_px[0]*3*geo.k,dy=geo.feetY-dh;
    if(img){octx.drawImage(img,(f%m.cols)*m.cell[0],Math.floor(f/m.cols)*m.cell[1],m.cell[0],m.cell[1],Math.round(dx*dpr),Math.round(dy*dpr),Math.round(dw*dpr),Math.round(dh*dpr));}
    else{octx.fillStyle='rgba(164,159,192,.25)';octx.fillRect(Math.round(dx*dpr),Math.round(dy*dpr),Math.round(dw*dpr),Math.round(dh*dpr));}
    geo.boxes[d]={x:dx,y:dy,w:dw,h:dh,frame:f,handle:h};
    // name tag under the feet: always says who is who (and lets Ube judge the provisional mapping on sight)
    octx.font=`${Math.round(7*dpr)}px ${PSTART}`;octx.textAlign='center';octx.textBaseline='top';
    octx.lineWidth=3*dpr;octx.strokeStyle='#07060f';octx.strokeText(names[d],geo.x[d]*dpr,(geo.feetY+5)*dpr);
    octx.fillStyle=d===selectedLocal?'#5fe3ff':'#f6efd9';octx.fillText(names[d],geo.x[d]*dpr,(geo.feetY+5)*dpr);
   }
   // throw feedback, tied to the recipient and above every figure
   effects=effects.filter(e=>N-e.t0<e.ttl);
   for(const e of effects){
    const a=(N-e.t0)/e.ttl,top=geo.boxes[e.recipient]?.y??geo.feetY-120,y=(Math.max(geo.hudBottom+8,top)-14-a*14)*dpr;
    octx.globalAlpha=Math.min(1,2*(1-a));octx.textBaseline='bottom';octx.textAlign='center';
    octx.font=`${Math.round(9*dpr)}px ${PSTART}`;octx.lineWidth=3*dpr;octx.strokeStyle='#07060f';octx.strokeText(e.text,e.x*dpr,y);octx.fillStyle=e.color;octx.fillText(e.text,e.x*dpr,y);
    octx.font=`${Math.round(7*dpr)}px ${PSTART}`;octx.strokeText(e.sub,e.x*dpr,y+12*dpr);octx.fillStyle='#f6efd9';octx.fillText(e.sub,e.x*dpr,y+12*dpr);
    octx.globalAlpha=1;
   }
   for(const d of Object.keys(pulses))if(N-pulses[d].t0>600)delete pulses[d];
  }
  function tick(){
   if(disposed)return;
   raf=requestAnimationFrame(tick);
   if(!manifest||!measure())return;
   const frames=T().HANDLES.map(frameFor).join(','),key=[frames,geo.W,geo.H,geo.feetY.toFixed(1),geo.dpr,selectedLocal,effects.length,Object.keys(pulses).length,C().handleOf('roxy'),C().handleOf('rosalyn')].join('|');
   if(key!==lastKey||effects.length||Object.keys(pulses).length){lastKey=key;draw();}
  }

  // ---- loading (reliable: every failure is visible and nothing blocks the throw/attribution path) -----------------------------
  const loadImg=u=>new Promise((ok,bad)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>bad(new Error(u));i.src=u;});
  const ready=fetch(SHEET_DIR+'manifest.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('manifest '+r.status);return r.json();}).then(m=>{
   manifest=m;return Promise.all(Object.keys(m.dancers).map(h=>loadImg(SHEET_DIR+m.dancers[h].file).then(i=>{sheets[h]=i;})));
  }).then(()=>{status.loaded=true;if(!disposed)note.textContent=`SUPPORTING ${names[selectedLocal]}. TAP A NAME TO SUPPORT SOMEONE ELSE.`;}).catch(e=>{
   status.failed=String(e.message||e);console.error('F15 dancers failed to load',e);
   if(!manifest)manifest={dancers:Object.fromEntries(T().HANDLES.map(h=>[h,{frames:1,cell:[155,200],cols:1,anchor_in_cell_px:[77,200]}]))};
   if(!disposed)note.textContent='DANCER ART FAILED TO LOAD. YOU CAN STILL SUPPORT AND THROW.';
  });

  let binding=null;
  const tunables={target:targetFor(selectedLocal)};
  const instance={tunables,onSpend,
   bind(session,hooks){binding=hooks;game=session.game;api=session;applyTarget();renderBar();raf=requestAnimationFrame(tick);},
   close(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);over.remove();bar.remove();dateRow.remove();note.remove();idBox.remove();style.remove();effects=[];pulses={};if(current===instance)current=null;},
   select:choose,selected:()=>selectedLocal,game:()=>game,lastThrow:()=>last&&{...last},ready,status:()=>({...status}),geo:()=>({...geo,boxes:JSON.parse(JSON.stringify(geo.boxes)),x:{...geo.x}}),
   frames:()=>manifest?Object.fromEntries(T().HANDLES.map(h=>[h,frameFor(h)])):null,refresh:()=>{renderBar();lastKey='';},manifest:()=>manifest,
   restart(){t0=performance.now();lastKey='';}};
  current=instance;
  return instance;
 }
 global.RAF15Club={enabled,open,current:()=>current};
})(window);
