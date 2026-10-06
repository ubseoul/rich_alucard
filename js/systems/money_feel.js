(function(){
 'use strict';
 // RC2 BUILD 2 · MONEY FEELS GOOD. Presentation only: it OBSERVES money and ownership (RAStateWatch) and never changes
 // an amount, price or reward (economy is Build 1). Four pieces:
 //   1. CASH CHIP    live balance with count-up + floating +$ / -$ numbers.
 //   2. RESULT CARD  after EVERY event (adventure, minigame, fight): +$ / -$ / $0, with what it was.
 //   3. DAY SUMMARY  when Rich sleeps and the screen goes black: what he made today.
 //   4. PURCHASES    bag icon floats up and fades, cha-ching, and the item lands on Rich's bed, white care tag ripped out.
 const SFX=()=>window.RAFeelSfx;
 const money=()=>Number(window.RAState?.get?.()?.life?.resources?.money)||0;
 const fmt=n=>{const a=Math.abs(Math.round(n));return `$${a.toLocaleString('en-US')}`;};
 const signed=n=>n>0?`+${fmt(n)}`:n<0?`−${fmt(n)}`:'$0';
 const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const screen=()=>document.querySelector('#screen');
 const el=(tag,cls,html)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(html!=null)n.innerHTML=html;return n;};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const started=()=>!!window.RALife?.life?.()?.clock?.started;
 let lastBalance=null,chip=null,shown=0,countRaf=0;

 // ---------- 1. cash chip ----------
 function ensureChip(){const host=screen();if(!host)return null;if(chip&&chip.isConnected)return chip;chip=el('div','rc2-cash','<i class="rc2-cash-icon" aria-hidden="true"></i><b class="rc2-cash-amt">$0</b>');chip.setAttribute('aria-live','off');chip.dataset.rc2Cash='1';host.append(chip);shown=money();chip.querySelector('.rc2-cash-amt').textContent=fmt(shown);return chip;}
 function countTo(target){const c=ensureChip();if(!c)return;cancelAnimationFrame(countRaf);const amt=c.querySelector('.rc2-cash-amt'),from=shown,t0=performance.now(),dur=reduced()?1:Math.min(900,300+Math.abs(target-from)/40);
  const step=now=>{const u=Math.min(1,(now-t0)/dur);shown=Math.round(from+(target-from)*(1-Math.pow(1-u,3)));amt.textContent=fmt(shown);if(u<1)countRaf=requestAnimationFrame(step);};countRaf=requestAnimationFrame(step);}
 function floatDelta(delta){const c=ensureChip();if(!c||!delta)return;const f=el('b',`rc2-float ${delta>0?'up':'down'}`,signed(delta));c.append(f);c.classList.remove('gain','loss');void c.offsetWidth;c.classList.add(delta>0?'gain':'loss');setTimeout(()=>{f.remove();c.classList.remove('gain','loss');},1300);}
 // ---------- day tally (also feeds the summary) ----------
 const DAY_KEY='rc2_day_money_v1';
 function loadDay(){try{return JSON.parse(localStorage.getItem(DAY_KEY)||'null');}catch(e){return null;}}
 function saveDay(d){try{localStorage.setItem(DAY_KEY,JSON.stringify(d));}catch(e){}}
 const todayNum=()=>{try{return window.RALife.today().day;}catch(e){return 0;}};
 function dayRecord(before=null){let d=loadDay();const n=todayNum();if(!d||d.day!==n){d={day:n,start:before??money(),in:0,out:0,src:{}};saveDay(d);}return d;}
 function sourceLabel(tag){tag=String(tag||'untagged');const [fam,rest]=tag.split(':');if(tag==='rc3:story')return 'GAME PROGRESSION BONUS';if(fam==='adventure'){const def=window.RAAdventures?.get?.(rest);return (def?.title||rest||'STORY').toUpperCase();}
  const m={untagged:'ODD JOBS',new_oga:'NEW OGA',trap:'THE TRAP',war_room:'WAR ROOM',rainmaker:'MAKE IT RAIN',cars:'CARS',castle:'CASTLE',realestate:'PROPERTY',minigame:'MINIGAMES',purchase:'SHOPPING'};return m[fam]||fam.replace(/_/g,' ').toUpperCase();}
 function tally(delta){const d=dayRecord(money()-delta);const tag=window.RAMoneyLedger?.current?.()||'untagged';if(delta>0)d.in+=delta;else d.out+=-delta;const k=sourceLabel(tag);d.src[k]=(d.src[k]||0)+delta;saveDay(d);}

 // ---------- 4. purchases ----------
 const BED_KEY='rc2_bed_items_v1';
 const loadBed=()=>{try{return JSON.parse(localStorage.getItem(BED_KEY)||'[]');}catch(e){return [];}};
 const saveBed=l=>{try{localStorage.setItem(BED_KEY,JSON.stringify(l.slice(-6)));}catch(e){}};
 const humanize=id=>String(id).replace(/^(gift|prop|fit|item|ing)_/,'').replace(/[_-]+/g,' ').trim().toUpperCase();
 // 16x16 hard-pixel icons. Palette letters: k ink, w white, 1 main, 2 shade, 3 accent
 const ICONS={
  shirt:['................','..11......11....','.1111....1111...','1111111111111...','.11111111111....','..1111111111....','..1122222211....','..1111111111....','..1111111111....','..1111111111....','..1111111111....','..1111111111....','..1111111111....','...11111111.....','................','................'],
  shoe:['................','................','................','........1111....','.......111111...','......11122211..','.....111111111..','1111111111111111','1222222222222221','1wwwwwwwwwwwwww1','.kkkkkkkkkkkkkk.','................','................','................','................','................'],
  chain:['................','...3333333333...','..33........33..','.33..........33.','.3............3.','.3............3.','..3..........3..','..33........33..','...3...33...3...','....3.3333.3....','.....33113.3....','......3113......','.......33.......','................','................','................'],
  bag:['................','.....kkkk.......','....k....k......','...11111111.....','..1111111111....','..1111331111....','..1113333111....','..1111331111....','..1111111111....','..1222222221....','..1111111111....','..1111111111....','...11111111.....','................','................','................'],
  gadget:['................','....kkkkkkkk....','...k22222222k...','...k21111112k...','...k21111112k...','...k21133112k...','...k21111112k...','...k21111112k...','...k22222222k...','....kkkkkkkk....','................','................','................','................','................','................'],
  box:['................','................','...3333333333...','..311111111113..','..311111111113..','..331111111133..','...3333333333...','...1112332111...','...1112332111...','...1112332111...','...1112332111...','...1111111111...','...1222222221...','................','................','................'],
  food:['................','................','....kkkkkk......','..kk222222kk....','.k2233332322k...','.k2222222222k...','.k3322222332k...','..k22222222k....','...kkkkkkkk.....','................','................','................','................','................','................','................']
 };
 function iconFor(label){const s=label.toLowerCase();return /tee|shirt|hoodie|jacket|top|fit|jersey|coat|pants|jeans/.test(s)?'shirt':/shoe|sneak|boot|kick|jordan|dunk/.test(s)?'shoe':/chain|ring|watch|grill|diamond|jewel|pendant|necklace/.test(s)?'chain':/bag|duffel|purse|tote|satchel/.test(s)?'bag':/phone|speaker|camera|laptop|console|mic|headphone|gadget|tv/.test(s)?'gadget':/taco|boba|food|burger|ramen|snack|drink|sapporo|jollof/.test(s)?'food':'box';}
 const PAL=[['#7d194b','#4a0f2c','#f0c050'],['#2d5fb0','#1c3a70','#f5e8c5'],['#2f7a3a','#1c4a24','#d6af62'],['#d7193f','#8b0f28','#f5e8c5'],['#e8e0c8','#a89f86','#d7193f'],['#17131e','#3a2f4a','#d6af62'],['#d98241','#8f4d1c','#f5e8c5']];
 function drawIcon(ctx,name,ox,oy,pal,scale=1){const rows=ICONS[name]||ICONS.box;const col={k:'#17131e',w:'#ffffff',1:pal[0],2:pal[1],3:pal[2]};rows.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch==='.')return;ctx.fillStyle=col[ch];ctx.fillRect(ox+x*scale,oy+y*scale,scale,scale);}));}
 function iconDataUrl(name,pal,scale=3){const c=document.createElement('canvas');c.width=c.height=16*scale;const x=c.getContext('2d');x.imageSmoothingEnabled=false;drawIcon(x,name,0,0,pal,scale);return c.toDataURL();}
 const hashPal=label=>{let h=0;for(const ch of label)h=(h*31+ch.charCodeAt(0))>>>0;return PAL[h%PAL.length];};
 let bedCanvas=null;
 const BED_SLOTS=[[142,330],[182,334],[222,330],[160,362],[200,366],[240,362]];
 function renderBed(){
  const scene=document.querySelector('#bedroomScene');if(!scene)return;bedCanvas?.remove();bedCanvas=null;const items=loadBed();if(!items.length)return;
  const cv=document.createElement('canvas');cv.width=270;cv.height=480;cv.className='bedroom-overlay-canvas rc2-bed-items';cv.setAttribute('aria-hidden','true');scene.append(cv);bedCanvas=cv;try{window.RAPresentationDirector?.relayout?.();}catch(e){}
  const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
  items.forEach((it,i)=>{const [x,y]=BED_SLOTS[i%BED_SLOTS.length];const pal=hashPal(it.label);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x+2,y+28,26,3);drawIcon(ctx,it.icon,x,y,pal,2);
   // the white care tag, ripped out and left beside the item (wash-symbol lines, torn edge)
   const tx=x+24,ty=y+24;ctx.fillStyle='#17131e';ctx.fillRect(tx,ty,12,9);ctx.fillStyle='#ffffff';ctx.fillRect(tx+1,ty+1,10,7);ctx.fillStyle='#8a8a8a';ctx.fillRect(tx+3,ty+3,2,2);ctx.fillRect(tx+7,ty+3,2,2);ctx.fillRect(tx+2,ty+6,8,1);ctx.fillStyle='#d7193f';ctx.fillRect(tx-2,ty+2,2,4);});
 }
 function bagFloat(label,iconName){
  const host=screen();if(!host)return;const pal=hashPal(label);const wrap=el('div','rc2-bag-float');wrap.innerHTML=`<img alt="" class="rc2-bag-icon" src="${iconDataUrl('bag',[ '#f0c050','#a8761c','#17131e'],3)}"><span class="rc2-bag-label">${label}</span>`;host.append(wrap);setTimeout(()=>wrap.remove(),1700);
  return pal;}
 function ripFlash(){const host=screen();if(!host)return;const t=el('div','rc2-tag-rip','<i></i><b>TAG OUT</b>');host.append(t);setTimeout(()=>t.remove(),1100);}
 async function purchaseFx(items,spent){
  const label=items.length?items[0].label:'PURCHASE',first=items[0];
  bagFloat(label.length>16?label.slice(0,15)+'…':label,first?.icon||'bag');SFX()?.purchase();
  if(first&&first.onBed!==false){const bed=loadBed();for(const it of items)if(it.onBed!==false)bed.push({label:it.label,icon:it.icon,t:Date.now()});saveBed(bed);await wait(780);ripFlash();renderBed();}
 }
 // detect purchases: money drops and ownership grows within the same beat
 let lastOwn=null,pendingAdds=[],lastSpend=null,flushTimer=0;
 const ownSnap=()=>{const o=window.RAState?.get?.()?.life?.ownership||{};return {items:{...(o.items||{})},fits:[...(o.fits?.owned||[])],props:[...(o.props||[])],cars:(o.cars||[]).length,poss:(o.possessions||[]).map(p=>p.id||p.name||String(p))};};
 function diffOwn(a,b){const out=[];for(const [id,n] of Object.entries(b.items))if((n||0)>(a.items[id]||0)&&!/^(cash_|ing_)/.test(id))out.push({label:humanize(id),icon:iconFor(humanize(id))});
  for(const id of b.fits)if(!a.fits.includes(id))out.push({label:humanize(id),icon:'shirt'});
  for(const id of b.poss)if(!a.poss.includes(id))out.push({label:humanize(id),icon:iconFor(humanize(id))});
  if(b.cars>a.cars)out.push({label:'NEW WHIP',icon:'box',onBed:false});
  for(const id of b.props)if(!a.props.includes(id))out.push({label:humanize(id),icon:'box',onBed:false});
  return out;}
 function schedulePurchase(){clearTimeout(flushTimer);flushTimer=setTimeout(()=>{if(!pendingAdds.length||!lastSpend||Date.now()-lastSpend.t>2000){pendingAdds=[];return;}const items=pendingAdds;pendingAdds=[];const spent=lastSpend.amount;lastSpend=null;purchaseFx(items,spent);},260);}

 // ---------- 2. result cards ----------
 const cardQueue=[];let cardShowing=false;
 async function showCard({title,net,sub}){
  const host=screen();if(!host)return;const cls=net>0?'plus':net<0?'minus':'zero';
  const card=el('div',`rc2-result ${cls}`,`<small>${(title||'EVENT').toUpperCase()}</small><strong>${signed(net)}</strong><span>${sub||(net>0?'NICE.':net<0?'OUCH.':'NO MONEY MOVED.')}</span>`);card.setAttribute('role','status');host.append(card);
  requestAnimationFrame(()=>card.classList.add('on'));if(net>0)SFX()?.coin();else if(net<0)SFX()?.loss();else SFX()?.pop();
  await new Promise(res=>{let done=false;const fin=()=>{if(done)return;done=true;res();};card.addEventListener('click',fin,{once:true});setTimeout(fin,net===0?1500:2100);});
  card.classList.remove('on');card.classList.add('off');await wait(160);card.remove();
 }
 async function pumpCards(){if(cardShowing)return;cardShowing=true;try{while(cardQueue.length)await showCard(cardQueue.shift());}finally{cardShowing=false;}}
 function eventResult(title,startBal,sub){if(!started())return;const net=money()-startBal;if(net===0&&!sub)return; // RC5: a $0 card mid-scene is noise
 cardQueue.push({title,net,sub});setTimeout(pumpCards,420);}
 // wrap event sources without touching their modules
 function wrapEvents(){
  const M=window.RAMinigames;if(M&&!M.__rc2){const launch=M.launch;M.launch=function(id,params,opts){const b=money(),def=M.get?.(id);const p=launch.call(this,id,params,opts);Promise.resolve(p).then(r=>{if(r&&!r.quit)eventResult(def?.title||id,b);});return p;};M.__rc2=true;}
  const A=window.RAAdventures;if(A&&!A.__rc2){const start=A.start;const open=new Map();A.start=function(id,opts){const run=start.apply(this,arguments);if(run&&!open.has(id))open.set(id,money());return run;};
   document.addEventListener('ra:adventure-complete',e=>{const id=e.detail?.id;if(!open.has(id))return;const b=open.get(id);open.delete(id);if(id==='A00'||id==='A01')return;eventResult(A.get?.(id)?.title||id,b);});A.__rc2=true;}
  const C=window.RACombat2;if(C&&!C.__rc2){const run=C.run;C.run=function(enemyId,params){const b=money(),p=run.call(this,enemyId,params);Promise.resolve(p).then(r=>{if(r)eventResult(window.RACombatData?.ENEMIES?.[enemyId]?.name||'FIGHT',b);});return p;};C.__rc2=true;}
 }
 // ---------- 3. day summary ----------
 async function daySummary(over){
  if(!started()||!over)return;const d=dayRecord();const net=money()-d.start;const lines=Object.entries(d.src).filter(([,v])=>v).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,4);
  const box=el('div',`rc2-day ${net>0?'plus':net<0?'minus':'zero'}`,`<small>DAY ${d.day} · damn what a night</small><strong>${signed(net)}</strong><ul>${lines.length?lines.map(([k,v])=>`<li><span>${k}</span><b class="${v>0?'p':'m'}">${signed(v)}</b></li>`).join(''):'<li><span>NOTHING MOVED.</span><b>$0</b></li>'}</ul><p>${net>0?'MADE: '+fmt(d.in):'MADE: $0'} · SPENT: ${fmt(d.out)}</p><em>BALANCE ${fmt(money())}</em><i>TAP TO SLEEP</i>`);
  over.append(box);requestAnimationFrame(()=>box.classList.add('on'));if(net>0)SFX()?.sell();else if(net<0)SFX()?.loss();else SFX()?.tally();
  await new Promise(res=>{let done=false;const fin=()=>{if(done)return;done=true;res();};over.addEventListener('click',fin,{once:true});setTimeout(fin,3600);});
  box.classList.remove('on');await wait(220);box.remove();
  try{localStorage.removeItem(DAY_KEY);}catch(e){}
 }
 // ---------- wiring ----------
 function init(){
  lastBalance=money();lastOwn=ownSnap();ensureChip();wrapEvents();
  window.RAStateWatch?.watch('rc2.money',s=>s.life?.resources?.money,(next,prev)=>{
   const delta=next-prev;if(!delta)return;lastBalance=next;if(started()){tally(delta);floatDelta(delta);countTo(next);
    if(delta<0){lastSpend={t:Date.now(),amount:-delta};if(pendingAdds.length)schedulePurchase();}
    else if(delta>=1000)SFX()?.chaching();else SFX()?.coin();}else{shown=next;}
  },{silentVia:['load','reset']});
  window.RAStateWatch?.watch('rc2.own',s=>JSON.stringify(s.life?.ownership||{}),()=>{const now=ownSnap(),added=diffOwn(lastOwn||now,now);lastOwn=now;if(!added.length||!started())return;pendingAdds.push(...added);if(lastSpend&&Date.now()-lastSpend.t<2000)schedulePurchase();else schedulePurchase();});
  document.addEventListener('ra:scene',e=>{wrapEvents();ensureChip();if(e.detail?.id==='bedroom')setTimeout(renderBed,60);else{bedCanvas?.remove();bedCanvas=null;}});
  window.RAStateWatch?.watch('rc2.load',s=>s.life?.clock?.started,()=>{shown=money();chip?.querySelector('.rc2-cash-amt')&&(chip.querySelector('.rc2-cash-amt').textContent=fmt(shown));},{silentVia:[]});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
 window.RAMoneyFeel={fmt,signed,daySummary,eventResult,purchaseFx,renderBed,tally:dayRecord,iconFor,ICONS,sourceLabel,clearBed(){saveBed([]);renderBed();},_test:{pumpCards,cardQueue}};
})();
