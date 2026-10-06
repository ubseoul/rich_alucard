// THE PLAY — FEEL LOCK scenes (OL-023): PHONE OFFER → CREW / CAR → DEPARTURE → ARRIVAL → LIVE FEED → ESCAPE or SILENCE → BLACK → RETURN / AFTERMATH.
// One continuous piece of Rich Alucard's life, not a set of menus. Each screen answers ONE question and hides everything else.
import * as K from './feel-core.mjs';
import {el,pos,anim,sleep,fadeTo,clear,bg,BG,shake,S,reduced,settings,world,stage} from './feel-core.mjs';
import * as A from './feel-art.mjs';
import {face,classColor,crate} from './faces.mjs';
import * as C from '../../../js/frag/F01/play/content.mjs';
import * as E from '../../../js/frag/F01/play/engine.mjs';
import {weapon} from '../../../js/frag/F01/play/guns.mjs';
import * as W from '../../../js/frag/F01/play/world.mjs';

const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=k=>'$'+Math.round(k*1000).toLocaleString('en-US');
const tapOnce=(node,fn)=>new Promise(r=>node.addEventListener('click',e=>{K.unlock();fn&&fn(e);r(e);},{once:true}));
const richEl=(css)=>el('rich','',null,css);
const faceOf=(o,st)=>face({id:o.id,name:o.name,cls:o.cls,quirk:o.quirk,vampire:o.vampire},st||{});

// ------------------------------------------------------------------------------------------------ 0. title (also unlocks audio)
export async function titleScene(){
 clear();
 const t=el('title','<h1>THE PLAY</h1><p>TAP TO START</p>');t.setAttribute('role','button');t.tabIndex=0;t.setAttribute('aria-label','Start THE PLAY');t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click();}};
 await tapOnce(t);K.S.buzz();
}

// ------------------------------------------------------------------------------------------------ 1a. home: what happened while Rich slept (only when something needs him)
// lock-screen texts (a crew text from the morning after) and the two things that can still be undone: a lost car, a lost gun, a captive's ransom.
export async function homeScene({w,texts=[],recover=[],ransom=[],bank}){
 clear();bg(BG.room,'brightness(.5) saturate(.8)');el('dim');el('bank','BANK '+money(bank));
 richEl({left:'110px',top:'300px',transform:'scale(1.5)'});
 await fadeTo(0,700);
 if(!texts.length&&!recover.length&&!ransom.length)return;
 const card=el('lock','',null);
 const draw=()=>{
  card.innerHTML=texts.map(t=>`<div class="lt"><b>${esc(t.who)}</b>${esc(t.text)}</div>`).join('')+
   recover.map((r,i)=>`<div class="lt rec"><b>${esc(r.title)}</b>${r.car?`<div class="lostcar" data-car="${esc(r.car.id)}" data-state="${esc(r.car.state)}">${A.carHTML(r.car.id,r.car.state)}</div>`:''}${esc(r.line)}<button data-rec="${i}" ${r.disabled?'disabled':''}>${esc(r.button)}</button></div>`).join('')+
   ransom.map((r,i)=>`<div class="lt rec"><b>${esc(r.title)}</b>${esc(r.line)}<button data-ran="${i}" ${r.disabled?'disabled':''}>${esc(r.button)}</button></div>`).join('')+
   `<button class="ok" data-done>OK</button>`;
  card.querySelectorAll('[data-rec]').forEach(b=>b.onclick=()=>{K.unlock();S.confirm();recover[+b.dataset.rec].act();recover.splice(+b.dataset.rec,1);draw();});
  card.querySelectorAll('[data-ran]').forEach(b=>b.onclick=()=>{K.unlock();S.confirm();ransom[+b.dataset.ran].act();ransom.splice(+b.dataset.ran,1);draw();});
 };
 draw();S.text();
 anim(card,[{transform:'translateY(-120px)',opacity:0},{transform:'translateY(0)',opacity:1}],380,{easing:'ease-out'});
 await new Promise(r=>{card.addEventListener('click',e=>{if(e.target.closest('[data-done]')){K.unlock();S.tap();r();}});});
 await anim(card,[{opacity:1},{opacity:0}],250);
}

// ------------------------------------------------------------------------------------------------ 1b. PHONE OFFER — "do I take the job?"
// Name, potential cash, minimum Ogas, and danger as FICTION (never a percentage, never a risk stat). A NOTICE (HOLD THE HOUSE) cannot be declined.
export async function offerScene(o){
 clear();bg(BG.room,'brightness(.5) saturate(.8)');el('dim');el('bank','BANK '+money(o.bank));
 richEl({left:'110px',top:'300px',transform:'scale(1.5)'});
 await fadeTo(0,500);await sleep(o.again?700:1300);
 const hint=(o.hints||[]).map(h=>`<div class="hint">${esc(o.caller)}: ${esc(h.text)}</div>`).join('');
 const call=el('call',`<div class="who">${esc(o.caller)}</div><div class="ring">${o.notice?'URGENT':'INCOMING CALL'}</div>
  ${o.big?'<div class="bigtag">BIG PLAY</div>':''}<div class="pname">${esc(o.name)}</div>
  ${o.notice?'<div class="cash notice">THEY\'RE COMING</div>':`<div class="cash">BASE TAKE UP TO ${money(o.cashK)}</div><div class="min">${o.min} OGA MIN.</div><div class="take-note">EXTRA ROOMS CAN ADD CASH + LOOT</div>`}
  ${o.quote?`<div class="quote">“${esc(o.quote)}”</div>`:''}${hint}
  <div class="btns"><button class="b-ans">${o.notice?'PICK UP':'ANSWER'}</button>${o.notice?'':'<button class="b-dec">DECLINE</button>'}</div>`);
 anim(call,[{transform:'translateY(440px)'},{transform:'translateY(0)'}],350,{easing:'ease-out'});
 setTimeout(()=>call.classList.add('buzzing'),400/K.SPEED);
 S.buzz();const ring=setInterval(S.buzz,1400/K.SPEED);
 const choice=await new Promise(r=>{call.querySelector('.b-ans').onclick=()=>r('answer');const d=call.querySelector('.b-dec');if(d)d.onclick=()=>r('decline');});
 clearInterval(ring);call.classList.remove('buzzing');
 if(choice==='decline'){await anim(call,[{transform:'translateY(0)'},{transform:'translateY(480px)'}],300);call.remove();S.tap();}
 else{S.confirm();await sleep(250);}
 return choice;
}

// ------------------------------------------------------------------------------------------------ 2. CREW / CAR — "who am I sending, what are they carrying, what are they taking?"
// ONE screen. Crew is PRESELECTED. Confirm, swap ONE Oga, weapon or BARE HANDS per Oga, the owned car. Seating and approach are automatic (backstage).
export async function crewScene({pr,w,job,hints,pitcher,big,defense,lastCar}){
 clear();bg(defense?BG.castle:BG.street);
 const P=pr.P,avail=pr.avail,options=pr.options;
 const usable=options.filter(o=>!o.disabled);
 let carId=defense?'CASTLE':(lastCar&&usable.some(o=>o.id===lastCar)?lastCar:(usable[0]||options[0]).id);
 const seatsOf=id=>C.CARS[id].seats.length;
 const nFor=id=>{const s=seatsOf(id);return Math.max(Math.min(pr.minCrew,s,avail.length),Math.min(pr.maxCrew,s,avail.length));};
 // defaults: the most-used ready Ogas ("my usual guys"), named first, the pitcher aboard
 const rank=[...avail].sort((a,b)=>(b.plays||0)-(a.plays||0)||(b.named-a.named)||(a.id===pitcher?-1:0));
 const defaultIds=rank.slice(0,nFor(carId)).map(o=>o.id);
 if(pitcher&&!defaultIds.includes(pitcher)&&avail.some(o=>o.id===pitcher)){defaultIds[defaultIds.length-1]=pitcher;}
 let crewIds=[...defaultIds];
 const pool=[...E.ownedGuns(P),'pistol','hands'];
 const copies=g=>g==='pistol'||g==='hands'?99:pool.filter(x=>x===g).length;
 const gunOf={};for(const o of avail)gunOf[o.id]=o.gun||'pistol';
 const order=['hands','pistol',...[...new Set(pool.filter(g=>g!=='pistol'&&g!=='hands'))].sort((a,b)=>gavg(a)-gavg(b))];
 function gavg(g){const x=(C.GUNS[g]||C.GUNS.pistol).dmg;return (x[0]+x[1])/2;}
 const used=(g,except)=>crewIds.filter(id=>id!==except&&gunOf[id]===g).length;

 el('grad');
 el('pre-top',`<div class="n">${esc(job.name||'')}</div><div class="m">${defense?'HOLD THE HOUSE':'BASE UP TO '+money(job.band[1])+' · '+job.size[0]+' OGA MIN.'}</div>${big?'<div class="bigtag sm">BIG PLAY</div>':''}`);
 const hintBox=el('hints',(hints||[]).map(h=>`<div>${esc(pitcher||'')}: ${esc(h.text)}</div>`).join(''));
 let carNode=null,carPick=null;
 const drawCar=()=>{
  if(carNode){carNode._sh&&carNode._sh.remove();carNode.remove();}
  if(carPick){carPick.remove();carPick=null;}
  if(defense)return;
  const {w:cw,h:ch}=A.carSize(carId);
  carNode=el('car',`<div class="body">${A.carHTML(carId)}</div>`,null,{left:'8px',top:(300-ch)+'px',width:cw+'px',height:ch+'px'});carNode.dataset.car=carId;
  carNode._sh=el('shadow','',null,{left:'14px',top:'296px',width:(cw-12)+'px',height:'8px'});
  const opt=options.find(o=>o.id===carId);
  carPick=el('carpick',`◂ ${carId} ▸<small>${esc(C.CARS[carId].word)} · ${seatsOf(carId)} SEATS</small><span class="change">CHANGE TRANSPORT</span>`,null,{left:'20px',top:'198px'});
  const cyc=()=>{
   closeBench();world.querySelector('.crew-inspect')?.remove();
   const reads={HOOPTIE:'Budget ride. It can stall.',S2000:'Two seats. Nimble, with crash risk.',SUPRA:'Four seats. Grip for the chase.',URUS:'Five seats. Tough enough to ram.'};
   const panel=el('crew-inspect transport-inspect',`<b>CHOOSE TRANSPORT</b><p>Seats decide how many can go. Only available rides can leave.</p>${options.map(o=>`<button data-transport="${esc(o.id)}" ${o.disabled?'disabled':''} aria-pressed="${o.id===carId}">${esc(o.id)} · ${o.seats} SEATS<small>${esc(o.disabled||reads[o.id]||o.word)}</small></button>`).join('')}<button data-close>CLOSE</button>`);
   panel.querySelector('[data-close]').onclick=()=>{panel.remove();carPick.focus();};
   panel.querySelectorAll('[data-transport]').forEach(b=>b.onclick=()=>{carId=b.dataset.transport;const n=nFor(carId);while(crewIds.length>n)crewIds.pop();for(const o of rank){if(crewIds.length>=n)break;if(!crewIds.includes(o.id))crewIds.push(o.id);}panel.remove();S.tap();drawCar();drawCards();carPick.focus();});
   panel.querySelector('[data-transport]:not([disabled])')?.focus();
  };
  carPick.setAttribute('role','button');carPick.tabIndex=0;carPick.setAttribute('aria-label','change transport, currently '+carId);carPick.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();cyc();}};carPick.onclick=carNode.onclick=cyc;carNode.style.cursor='pointer';
 };
 const cards=el('crew-cards',null,null,{position:'absolute',inset:'0',pointerEvents:'none'});
 let bench=null;
 const closeBench=()=>{if(bench){bench.remove();bench=null;}};
 const swapAllowed=(slot,newId)=>{const test=crewIds.map((id,i)=>i===slot?newId:id);return test.filter(id=>!defaultIds.includes(id)).length<=1;};
 function drawCards(){
  cards.innerHTML='';const n=crewIds.length;const cw=Math.floor((262-(n-1)*4)/n);const x0=Math.round((270-(cw*n+(n-1)*4))/2);
  crewIds.forEach((id,i)=>{
   const o=avail.find(x=>x.id===id);const g=gunOf[id];const gv=A.gunView(g);
   const c=el('card',`<div class="fc">${faceOf(o)}</div><div class="nm">${esc(o.short)}</div><button class="tr inspect" aria-label="inspect ${esc(o.name)}">INFO</button>
    <div class="wslot"><span class="gi">${A.gunImg(g,26,13)}</span><span class="wt">${esc(gv.type)}${gv.nick?`<small>${esc(gv.nick)}</small>`:''}</span></div>${big&&o.named?'<span class="skull" title="may not come back">☠</span>':''}<button class="sw" aria-label="swap ${esc(o.short)}">SWAP</button>`,cards,{left:(x0+i*(cw+4))+'px',top:'318px',width:cw+'px',pointerEvents:'auto'});
   c.querySelector('.inspect').onclick=()=>{closeBench();const old=world.querySelector('.crew-inspect');if(old)old.remove();const gun=g==='hands'?{}:weapon(P,g);const roles={MUSCLE:'Front-line force. Leads a breach.',SHOOTER:'Fits the back line. Delivers fire support.',WHEELS:'Fits the driver seat. Helps the getaway.',TALKER:'Fits the middle. Handles talking.',GHOST:'Fits the back line. Handles slipping past.',DOC:'Fits the middle. Helps crew recovery.'};const info=el('crew-inspect',`<b>${esc(o.name)}</b><p>${o.hp}/${o.maxhp} HP · ${esc(roles[o.cls]||o.cls)}</p><p>${esc((o.traits||[]).map(t=>C.TRAIT_WORD[t]||t).join(' · '))}</p><b>${esc(gv.type)} ${esc(gv.nick||'')}</b><p>${esc(gun.role||'BARE HANDS')} · ${gun.dmg?gun.dmg.join('–')+' DAMAGE'+(gun.hits>1?' ×'+gun.hits:''):'NO GUN'}${gun.lane?' · '+esc(gun.lane)+' LINE':''}</p><p>${esc(gun.flavor||'')}</p><button>CLOSE</button>`);info.querySelector('button').onclick=()=>info.remove();};
   c.querySelector('.wslot').setAttribute('role','button');c.querySelector('.wslot').tabIndex=0;c.querySelector('.wslot').setAttribute('aria-label','change weapon for '+o.name);
   c.querySelector('.wslot').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();c.querySelector('.wslot').click();}};
   c.querySelector('.wslot').onclick=()=>{let k=order.indexOf(g);for(let t=0;t<order.length;t++){k=(k+1)%order.length;const cand=order[k];if(used(cand,id)<copies(cand)){gunOf[id]=cand;break;}}S.tap();drawCards();};
   c.querySelector('.sw').onclick=e=>{e.stopPropagation();openBench(i,c);};
  });
 }
 function openBench(slot,card){
  closeBench();
  const list=rank.filter(o=>!crewIds.includes(o.id));if(!list.length)return;
  bench=el('bench','',null,{left:'8px',top:'300px'});
  for(const o of list){const ok=swapAllowed(slot,o.id);
   const b=el('bi'+(ok?'':' off'),`<div class="f">${faceOf(o)}</div>${esc(o.short)}<br><span>${esc(C.TRAIT_WORD[o.traits[0]]||'')}</span>`,bench);
   b.setAttribute('role','button');b.tabIndex=ok?0:-1;b.setAttribute('aria-disabled',String(!ok));b.setAttribute('aria-label','select '+o.name);b.onclick=()=>{if(!ok){S.tap();return;}crewIds[slot]=o.id;closeBench();S.tap();drawCards();};b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();b.click();}};}
  el('bnote','swap one',bench);S.tap();
 }
 drawCar();drawCards();
 const instruction=el('setup-help','SWAP CREW · TAP GEAR · INSPECT ROLE');
 const btn=document.createElement('button');btn.className='send'+(big?' hold':'');
 btn.innerHTML=big?`<span class="fill"></span><span class="lab">HOLD — SOME MAY NOT COME BACK</span>`:`<span class="lab">${defense?'HOLD THE HOUSE':"SEND 'EM"}</span>`;
 world.appendChild(btn);
 await fadeTo(0,600);
 await new Promise(res=>{
  if(!big){btn.onclick=()=>{K.unlock();res();};return;}
  let t=null,done=false;const need=1100;const fill=btn.querySelector('.fill');
  const stop=()=>{clearTimeout(t);t=null;fill.style.transition='none';fill.style.width='0';};
  const begin=()=>{if(t||done)return;K.unlock();fill.style.transition=`width ${need/K.SPEED}ms linear`;fill.style.width='100%';t=setTimeout(()=>{t=null;done=true;res();},need/K.SPEED);};
  btn.addEventListener('pointerdown',e=>{e.preventDefault();begin();});
  ['pointerup','pointerleave','pointercancel','blur'].forEach(ev=>btn.addEventListener(ev,()=>{if(t)stop();}));
  btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!e.repeat)begin();}});
  btn.addEventListener('keyup',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(t)stop();}});
 });
 closeBench();instruction.remove();world.querySelector('.crew-inspect')?.remove();S.thud();
 // engine answer: crew, guns for the crew, the car. Seating and approach are backstage.
 const answer={car:carId,crew:[...crewIds],guns:Object.fromEntries(crewIds.map(id=>[id,gunOf[id]]))};
 return {answer,ui:{car:carNode,cards,btn,carPick,hintBox,top:world.querySelector('.pre-top'),grad:world.querySelector('.grad')},carId,crewIds};
}

// ------------------------------------------------------------------------------------------------ 3. DEPARTURE — "I sent my people out."
export async function departScene({ui,slide,crewObjs,carId,defense}){
 for(const n of [ui.cards,ui.btn,ui.carPick,ui.hintBox,ui.top,ui.grad])if(n)anim(n,[{opacity:1},{opacity:0}],380);
 await sleep(420);for(const n of [ui.cards,ui.btn,ui.carPick,ui.hintBox,ui.top,ui.grad])if(n)n.remove();
 const seatsOrder=(slide.seats||[]).map(s=>crewObjs.find(o=>o.id===s.id)).filter(Boolean);
 const car=ui.car;const cx=parseFloat(car&&car.style.left||8);
 const busts=seatsOrder.map((o,i)=>{const b=bust(o,34,{pose:'walking'});pos(b,26+i*34,420);return b;});
 await Promise.all(busts.map((b,i)=>anim(b,[{top:'420px'},{top:'300px'}],650+i*130,{easing:'ease-out'})));
 await sleep(350);
 for(let i=0;i<busts.length;i++){
  const b=busts[i],o=seatsOrder[i];setPose(b,'boarding');
  slam(o);S.thud();shake(1);
  await anim(b,[{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${cx+52+i*6-parseFloat(b.style.left)}px,-14px) scale(.35)`,opacity:0}],420,{easing:'ease-in'});
  b.remove();if(car)anim(car,[{transform:'translateY(0)'},{transform:'translateY(2px)'},{transform:'translateY(0)'}],200);
  S.door&&S.door();await sleep(280);
 }
 await sleep(300);
 if(car){
  car.classList.add('on');S.engine(carId,'idle',.45);
  const rumble=car.animate([{transform:'translate(0,0)'},{transform:'translate(1px,1px)'},{transform:'translate(-1px,0)'},{transform:'translate(0,0)'}],{duration:90/K.SPEED,iterations:reduced()?2:14});
  await sleep(1200);S.engine(carId,'rev',.5);puffs(car,7);await sleep(500);rumble.cancel();
  await drive(car,300,1500,'cubic-bezier(.6,0,.9,.5)');
 }else{await sleep(900);}
 await sleep(200);await fadeTo(1,500);
}
function slam(o){
 const p=el('slam',`<span>${esc(o.name)}</span>`,null,{background:classColor(o.cls)});
 anim(p,[{transform:'translateX(-280px) skewX(-12deg)',opacity:0},{transform:'translateX(0) skewX(-12deg)',opacity:1,offset:.25},{transform:'translateX(0) skewX(-12deg)',opacity:1,offset:.75},{transform:'translateX(280px) skewX(-12deg)',opacity:0}],900,{easing:'ease-out'}).then(()=>p.remove());
}
// FL-A07: a GENERIC Oga is drawn as the frozen full-body template (pose: walking / boarding / standing / wounded / carried), feet on the bust box's base.
// The six named Ogas use their approved P-D identities, with contact (40,88) in each lossless cell.
function place(im,size,pose,id){im.style.left=Math.round(size/2-(oNamed(id)?40:39))+'px';im.style.top=Math.round(size-A.ogaContact(pose,id))+'px';}
const oNamed=id=>['tunde','dre','half_pint','sunday_best','young_mazi','auntie_grit'].includes(id);
export function setPose(b,pose){const im=b&&b.querySelector('.ogs');if(im){im.src=A.ogaSprite(pose,b.dataset.oga);place(im,parseFloat(b.style.width)||34,pose,b.dataset.oga);b.dataset.pose=pose;}}
export function bust(o,size=34,st={}){
 if(A.hasSprite(o)){
  const b=el('bust sprite','');b.dataset.oga=o.id;b.style.width=b.style.height=size+'px';
  const im=document.createElement('img');im.className='ogs';im.alt='';b.appendChild(im);im.src=A.ogaSprite(st.pose||'standing',o.id);place(im,size,st.pose||'standing',o.id);b.dataset.pose=st.pose||'standing';
  return b;
 }
 const b=el('bust',faceOf(o,st));b.dataset.oga=o.id;b.style.width=b.style.height=size+'px';
 const g=o.gun&&o.gun!=='hands'?A.gunView(o.gun):null;
 if(g&&g.img&&!st.noGun){const im=document.createElement('img');im.className='wp';im.src=g.img;im.style.cssText=`width:${size*.85}px;height:${size*.42}px;left:${size*.42}px;top:${size*.62}px`;b.appendChild(im);}
 return b;
}
export function makeCar(id,x,y){
 const {w,h}=A.carSize(id);const car=el('car',`<div class="body">${A.carHTML(id)}</div><div class="hl"></div>`,null,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});car.dataset.car=id;
 car._sh=el('shadow','',null,{left:x+6+'px',top:y+h-6+'px',width:(w-12)+'px',height:'10px'});car._w=w;return car;
}
function puffs(car,n=6){
 const x=parseFloat(car.style.left)-2,y=parseFloat(car.style.top)+(parseFloat(car.style.height)||50)-14;
 for(let i=0;i<n;i++){const p=el('puff','',null,{left:x+'px',top:y+'px'});setTimeout(()=>anim(p,[{transform:'translate(0,0) scale(.6)',opacity:.7},{transform:`translate(${-(10+Math.random()*20)}px,${-(4+Math.random()*12)}px) scale(2.2)`,opacity:0}],900).then(()=>p.remove()),i*90/K.SPEED);}
}
async function drive(car,to,ms,easing){
 const from=parseFloat(car.style.left);
 await Promise.all([anim(car,[{left:from+'px'},{left:to+'px'}],ms,{easing}),car._sh?anim(car._sh,[{left:from+6+'px'},{left:to+6+'px'}],ms,{easing}):null]);
 car.style.left=to+'px';
}

// ------------------------------------------------------------------------------------------------ 4. ARRIVAL — "they actually went in there."
// FL-A05: one frozen exterior per offense job. DOOR = where the crew's feet end up (270x480 stage px): the door / gate / bay of THAT exterior.
const DOOR={boba_backroom:[68,280],tupperware:[177,242],vampire_dentist:[184,292],dock_restock:[232,300],car_wash_stickup:[124,264],quiet_lift:[139,280],vampire_gala:[131,264],smack_crib:[156,294],counting_house:[134,314]};
export async function arriveScene({slide,crewObjs,carId,defense,job}){
 const ext=!defense&&A.FL_ART.exterior[job&&job.id];const door=!defense&&DOOR[job&&job.id]||[153,300];
 clear();bg(defense?BG.castle:ext||BG.museum);
 const seatsOrder=(slide.seats||[]).map(s=>crewObjs.find(o=>o.id===s.id)).filter(Boolean);
 el('cap',esc((slide.job&&slide.job.name||job.name||'').toUpperCase()),null,{top:'16px'});
 await fadeTo(0,700);
 if(defense){ // the house is the target: headlights swing across the gate, the crew takes the door
  for(let i=0;i<3;i++){const g=el('hbeam','',null,{left:(-70)+'px',top:(345+i*9)+'px'});anim(g,[{transform:'translateX(0)',opacity:0},{transform:'translateX(190px)',opacity:.9,offset:.6},{transform:'translateX(260px)',opacity:.6}],1800+i*400,{easing:'ease-out'});}
  S.engine('URUS','idle',.35);
  for(let i=0;i<seatsOrder.length;i++){const b=bust(seatsOrder[i],30,{pose:'walking'});pos(b,60+i*34,420);await anim(b,[{top:'420px',left:60+i*34+'px',opacity:1},{top:'268px',left:132+i*4+'px',transform:'scale(.55)',opacity:0}],900,{easing:'ease-in'});b.remove();S.door();await sleep(150);}
  await sleep(700);await fadeTo(1,600);return;
 }
 const car=makeCar(carId,-160,330);car.classList.add('on');
 S.engine(carId,'idle',.35);
 await drive(car,128,1500,'cubic-bezier(.1,.7,.3,1)');puffs(car,4);await sleep(600);car.classList.remove('on');S.thud();await sleep(350);
 for(let i=0;i<seatsOrder.length;i++){
  // QA REPAIR 001: the crew step out onto the pavement at the car's near side (feet ~392 = 15px below the car body's bottom edge, clear of its ground shadow), not onto its roof (feet were ~357)
  const b=bust(seatsOrder[i],30,{pose:'standing'});pos(b,172-i*4,361);
  await anim(b,[{top:'361px',opacity:0},{top:'367px',opacity:1}],250);
  setPose(b,'walking');
  await anim(b,[{left:172-i*4+'px',top:'367px',transform:'scale(1)',opacity:1},{left:door[0]-15+i*3+'px',top:door[1]-30+'px',transform:'scale(.55)',opacity:1}],900,{easing:'ease-in'});
  await anim(b,[{opacity:1},{opacity:0}],240);b.remove();S.door();await sleep(110);
 }
 await sleep(800);await fadeTo(1,700);
}

// ------------------------------------------------------------------------------------------------ 5. LIVE FEED — "what the hell is happening?"
// Rich is in bed at home, hand on the phone. The room stays behind it. The group chat is the ONLY live combat UI.
const CLS_COL={MUSCLE:'#e0603a',SHOOTER:'#e8c14a',WHEELS:'#3fd0e0',TALKER:'#b07ae8',GHOST:'#7f8cff',DOC:'#5fe08a'};
export async function roomScene({crewObjs,defense,objective='THE PLAY'}){
 clear();
 // RC3: the frozen base already contains a hand. A second moving hand above it produced a ghost during jolt.
 // Draw a hard-pixel quilt behind the single frozen idle hand; never modify the frozen PNGs.
 el('bedwrap quilt');
 const flash=el('flash');
 // the RIG = phone DOM + FL-A01 idle layer + thumb overlay. JOLT shakes the rig in code; the idle layer's screen is transparent so the live chat shows through.
 const rig=el('rig');
 const phone=el('phone',`<div class="ph-head"><span class="t">THE PLAY</span><span class="s">● LIVE</span><div class="ph-crew">${crewObjs.map(o=>`<div class="av" data-crew="${esc(o.id)}" title="${esc(o.name)}">${faceOf(o)}</div>`).join('')}<span>CREW CHAT</span></div></div>`,rig);
 const msgs=el('msgs','',phone);
 el('operation-objective',esc(objective.toUpperCase()),rig);
 const op=el('operation-state','ENTRY · CREW MOVING',phone);op.setAttribute('aria-live','polite');op.title=objective;
 const scroll=()=>{msgs.scrollTop=msgs.scrollHeight;};
 const crewStrip=el('operation-crew','',phone);let previous=null;
 const ctlState=(snap,phase)=>{crewStrip.innerHTML='';for(const c of snap.crew){const o=byId(c.id)||{name:c.name,short:c.short};const prior=previous?.crew.find(x=>x.id===c.id);const changed=prior&&(prior.hp!==c.hp||prior.state!==c.state);const pose=c.hp<c.maxhp?'wounded':'standing';const sprite=A.hasSprite(o)?`<span class="op-pose"><img alt="" src="${A.ogaSprite(pose,o.id)}"></span>`:'';const b=el('operation-unit'+(changed?' changed':''),`${sprite}<span>${esc(o.short||o.name)}</span><b>${c.state==='UP'?c.hp+'/'+c.maxhp+' HP':esc(c.state)}</b>`,crewStrip);b.setAttribute('role','button');b.tabIndex=0;b.setAttribute('aria-label',o.name+' '+c.state+' '+c.hp+' HP; inspect');const inspect=()=>{if(phone.querySelector('.decide'))return;phone.querySelector('.crew-inspect')?.remove();const info=el('crew-inspect',`<b>${esc(o.name)}</b><p>${esc(c.state)} · ${c.hp}/${c.maxhp} HP</p><p>${esc(c.zone)} · ${esc(c.lane||'CREW')} LINE</p><button>CLOSE</button>`,phone);info.querySelector('button').onclick=()=>info.remove();};b.onclick=inspect;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect();}};}msgs.style.top=(64+crewStrip.offsetHeight+4)+'px';previous=snap;op.textContent=phase.replaceAll('_',' ')+' · '+snap.crew.filter(c=>c.state==='UP').length+'/'+snap.crew.length+' UP';for(const c of snap.crew){const n=phone.querySelector('[data-crew="'+c.id+'"]');if(n){n.dataset.state=c.state;n.title=c.name+' · '+c.hp+'/'+c.maxhp+' HP · '+c.zone;}}};
 rig.insertAdjacentHTML('beforeend',A.handIdle()+A.thumbOverlay());
 const thumb=rig.querySelector('.thumbpov');
 let alive=true,typingNode=null;
 const byId=id=>crewObjs.find(o=>o.id===id);
 const heart=setInterval(()=>{if(alive)S.heart();},1300/K.SPEED);
 const amb=S.room();
 const fade=()=>{[...msgs.children].reverse().forEach((c,i)=>{c.style.opacity=i<4?1:Math.max(.7,1-(i-3)*.1);});};
 const vib=()=>{rig.classList.remove('vib');void rig.offsetWidth;rig.classList.add('vib');};
 const label=id=>{const o=byId(id);return o?`<span class="fr" style="color:${CLS_COL[o.cls]||'#9aa0b8'}">${esc(o.name)}</span>`:'';};
 const showTyping=async(who,ms)=>{clearTyping();typingNode=el('bub typing',`${label(who)}<span class="dots"><span></span><span></span><span></span></span>`,msgs);fade();scroll();await sleep(ms);clearTyping();};
 const clearTyping=()=>{if(typingNode){typingNode.remove();typingNode=null;fade();}};
 const ctl={
  phone,rig,thumb,msgs,flash,state:ctlState,
  async say(step){
   if(step.typing){await showTyping(step.who,step.typing);if(step.interrupted){await sleep(650);await showTyping(step.who,Math.max(400,step.typing*.6));}}
   const b=el('bub'+(step.kind==='EVENT'?' ev':'')+(step.call?' call':''),`${label(step.who)}${esc(step.text)}`,msgs);fade();vib();
   scroll();
   (step.shake>=2?S.ko:step.shake?S.hit:S.text)();
   if(step.shake)shake(step.shake,world);
   else if(step.red)K.pulse(1);
   await sleep(step.pause||1500);
  },
  async cut(step){
   clearTyping();
   const b=el('bub ev',`${label(step.who)}${esc(step.text)}`,msgs);fade();shake(2,world);S.ko();
   if(step.oba){const sh=el('obashade',A.obaSprite(),rig);rig.insertBefore(sh,rig.querySelector('.handpov'));anim(sh,[{opacity:0},{opacity:.85,offset:.3},{opacity:.85,offset:.7},{opacity:0}],1500).then(()=>sh.remove());} // FL-A04 frozen native sprite
   await sleep(step.pause||500);
   alive=false;K.duck(true);       // the sudden sound drop: the room goes dead
  },
  async typing(step){await showTyping(step.who,step.ms);},
  async rich(step){
   thumb.classList.add('on');const tap=reduced()?null:thumb.animate([{transform:'translateY(0)'},{transform:'translateY(2px)'},{transform:'translateY(0)'}],{duration:220/K.SPEED,iterations:Infinity});
   el('bub me',esc(step.text),msgs);fade();S.rich();await sleep(1600);
   if(tap)tap.cancel();thumb.classList.remove('on');
  },
  async silence(ms){alive=false;K.duck(true);await sleep(ms);},
  async dial(){
   const d=el('dial','<div class="dn">CALLING…</div><div class="ds"></div>',phone);S.buzz();await sleep(1200);S.buzz();await sleep(1200);S.buzz();await sleep(1200);
   d.querySelector('.dn').textContent='NO ANSWER';await sleep(1400);d.remove();
  },
  async black(){await fadeTo(1,1600);},
  resume(){alive=true;K.duck(false);},
  async run(steps){
   for(const s of steps){
    if(s.t==='say'){if(!alive){ctl.resume();}await ctl.say(s);}
    else if(s.t==='cut')await ctl.cut(s);
    else if(s.t==='silence')await ctl.silence(s.ms);
    else if(s.t==='rich')await ctl.rich(s);
    else if(s.t==='typing')await ctl.typing(s);
    else if(s.t==='dial')await ctl.dial();
    else if(s.t==='black')await ctl.black();
   }
  },
  // A TIMED CALL: fiction line, two buttons at most, a shrinking bar (never digits). Resolves with the button id or 'TIMEOUT' (the crew decides).
  async call(view,{bubble=true}={}){
   if(!alive)ctl.resume();
   await ctl.say({t:'say',who:view.who,text:view.line||'',kind:'EVENT',shake:view.shake||1,red:2,typing:0,pause:350,call:true});
   return ctl.decide({...view,kind:'CALL'});
  },
  async climb(view){
   if(!alive)ctl.resume();
   const us=[];
   if(view.read)us.push({t:'say',who:view.who,text:view.read,kind:'CHAT',shake:0,red:1,typing:0,pause:900,call:true});
   for(const s of us)await ctl.say(s);
   if(view.lit)await ctl.say({t:'say',who:view.who2,text:view.lit,kind:'CHAT',shake:0,red:2,typing:0,pause:350,call:true});
   return ctl.decide({...view,kind:'CLIMB'});
  },
  async decide(view){
   const ms=view.ms; // the crew's own view already doubles the bar when MORE TIME is on
   msgs.style.paddingBottom='';
   const d=el('decide',`<div class="decision-context">${esc(view.context||'CREW NEEDS YOUR CALL')}</div><div class="row">${view.buttons.map(b=>`<button data-id="${esc(b.id)}" class="${/KEEP|PUSH|FLOOR|BUST|TURN/.test(b.id+b.label)?'d-go':'d-out'}">${b.faceName?`<span class="actor">${esc(b.faceName)}</span>`:''}${esc(b.label)}${b.detail?`<small>${esc(b.detail)}</small>`:''}</button>`).join('')}</div><div class="clock-note"><span class="seconds" aria-hidden="true"></span>${esc(view.timeout||'BAR EMPTY: CREW DECIDES')}</div><div class="bar"><i></i></div>`,phone);
   d.dataset.kind=view.kind||'CALL';crewStrip.setAttribute('aria-label','Decision live: crew inspection resumes after the call');crewStrip.inert=true;const gear=document.getElementById('gear');if(gear)gear.disabled=true;rig.querySelector('.crew-inspect')?.remove();msgs.style.bottom=(d.offsetHeight+10)+'px';scroll();
   const bar=d.querySelector('.bar i');const started=performance.now();const seconds=d.querySelector('.seconds');const tick=()=>{seconds.textContent=Math.max(0,Math.ceil((ms/K.SPEED-(performance.now()-started))/1000))+'s · ';};tick();const clock=setInterval(tick,200);d.querySelector('button')?.focus({preventScroll:true});
   const anim1=bar.animate([{width:'100%'},{width:'0%'}],{duration:ms/K.SPEED,fill:'forwards',easing:'linear'});
   S.buzz();shake(1,world);
   const pick=await new Promise(r=>{
    d.querySelectorAll('button').forEach(b=>b.onclick=()=>{K.unlock();r(b.dataset.id);});
    anim1.finished.then(()=>r('TIMEOUT')).catch(()=>{});
   });
   clearInterval(clock);anim1.cancel();d.remove();crewStrip.inert=false;if(gear)gear.disabled=false;crewStrip.removeAttribute('aria-label');msgs.style.bottom='';msgs.style.paddingBottom='';const picked=view.buttons.find(b=>b.id===pick);await ctl.say({who:null,text:pick==='TIMEOUT'?'CREW MAKES THE CALL':(picked?.label||pick),kind:'EVENT',pause:500});
   if(pick==='TIMEOUT'){K.pulse(1);}
   return pick;
  },
  // WHO GETS IT? — acquiring a gun IS assigning it: one tap on a face (no timer).
  async gunChoice({line,faces}){
   if(!alive)ctl.resume();
   await ctl.say({t:'say',who:faces[0]&&faces[0].id,text:line,kind:'EVENT',shake:0,red:0,typing:0,pause:300,call:true});
   msgs.style.paddingBottom='';
   const d=el('decide',`<div class="who">WHO GETS IT?</div><div class="row faces">${faces.map(o=>`<button data-id="${esc(o.id)}" class="fb"><span class="f">${faceOf(o)}</span>${esc(o.short)}</button>`).join('')}</div>`,phone);
   msgs.style.bottom=(d.offsetHeight+10)+'px';scroll();d.querySelector('button')?.focus({preventScroll:true});const pick=await new Promise(r=>d.querySelectorAll('button').forEach(b=>b.onclick=()=>{K.unlock();S.confirm();r(b.dataset.id);}));
   d.remove();msgs.style.bottom='';msgs.style.paddingBottom='';return pick;
  },
  async turnChoice(view){
   if(!alive)ctl.resume();
   await ctl.say({t:'say',who:view.who,text:view.text,kind:'CHAT',shake:0,red:1,typing:0,pause:300,call:true});
   msgs.style.paddingBottom='';
   const d=el('decide',`<div class="row">${view.buttons.map(b=>`<button data-id="${b.id}" class="${b.id==='TURN'?'d-go':'d-out'}">${esc(b.label)}</button>`).join('')}</div>`,phone);
   msgs.style.bottom=(d.offsetHeight+10)+'px';scroll();d.querySelector('button')?.focus({preventScroll:true});const pick=await new Promise(r=>d.querySelectorAll('button').forEach(b=>b.onclick=()=>{K.unlock();S.confirm();r(b.dataset.id);}));
   d.remove();msgs.style.bottom='';msgs.style.paddingBottom='';return pick;
  },
  stop(){alive=false;clearInterval(heart);if(amb)try{amb.pause();}catch(e){}}
 };
 await fadeTo(0,900);await sleep(1300);
 return ctl;
}

// ------------------------------------------------------------------------------------------------ 6. RETURN / AFTERMATH — "who came back and what did we get?"
// Fade to black, then the base. The car pulls in (if there is a car), the ACTUAL survivors step out, physical CASH BAGS sized to the score,
// Rich COUNTS while the total rolls upward, then the trunk reveals ONE ITEM AT A TIME — everything shown is what was really awarded (M6).
export async function returnScene({rec,crewObjs,w,bankBefore}){
 const RR=W.returnRoster(rec);
 clear();bg(RR.alone?A.FL_ART.base.empty:A.FL_ART.base.home);   // FL-A02: the base curb/driveway; the empty variant is Rich alone
 const rich=richEl({left:'206px',top:'354px',transform:'scale(1.2)'});
 await fadeTo(0,900);await sleep(1100);
 const back=crewObjs.filter(o=>RR.back.includes(o.id));
 const carLost=!RR.car&&rec.shape!=='HOLD THE HOUSE';
 const defense=rec.shape==='HOLD THE HOUSE';
 const nothing=RR.alone;
 S.curb();
 if(nothing){ // RICH IS ALONE. No crew, no car, no bags. The emptiness is the message.
  rich.style.transform='scale(1.2) scaleX(-1)';
  await sleep(6500);return {alone:true};
 }
 let car=null;
 if(!defense&&!carLost){car=makeCar(rec.car,-170,318);car.classList.add('on');S.engine(rec.car,'idle',.35);await drive(car,4,1500,'cubic-bezier(.1,.7,.3,1)');car.classList.remove('on');puffs(car,4);S.thud();await sleep(600);}
 const slots=crewObjs.map((o,i)=>92+i*Math.min(34,140/Math.max(1,crewObjs.length-1)));
 const holders={};
 for(let i=0;i<crewObjs.length;i++){
  const o=crewObjs[i];const st=rec.finalStatus[o.id];
  if(!back.some(b=>b.id===o.id)){const g=el('missing','',null,{left:slots[i]+'px',top:'288px',opacity:0});anim(g,[{opacity:0},{opacity:1}],900);continue;}
  const gunNow=(rec.gunGifts||[]).find(g=>g.to===o.id);
  const oo={...o,gun:gunNow?gunNow.gun:(rec.lost&&rec.lost.guns||[]).some(g=>g.from===o.id)?'hands':o.gun};
  const b=bust(oo,32,{hurt:st!=='READY',zone:st==='READY'?'STEADY':'SHAKY',pose:st==='SHOT'?'carried':st==='READY'?'standing':'wounded'});pos(b,car?110:-40,322);b.style.opacity=0;if(st==='SHOT'&&!A.hasSprite(oo))b.style.transform='rotate(-12deg)';
  anim(b,[{opacity:0,left:(car?110:-40)+'px',top:'322px'},{opacity:1,left:slots[i]+'px',top:'290px'}],car?600:1300,{easing:'ease-out'});holders[o.id]=b;
  S.thud();await sleep(car?420:520);
 }
 await sleep(1000);
 const cashK=rec.received&&rec.win?rec.received.cash:0;
 const items=(rec.received&&rec.received.items)||[];
 if(cashK<=0&&!items.length){await sleep(1800);return {alone:false,empty:true};}
 // ---- bags
 // FL-A03: the tier IS the haul (1 duffel / 2-3 bags / a stacked pile). bagCount() still sets the beat count, so the drop keeps its old length and thuds.
 const n=A.bagCount(cashK),tier=A.bagTier(cashK);
 const HAUL={1:{cx:63,top:43,bot:70},2:{cx:60,top:29,bot:70},3:{cx:67,top:28,bot:79}}[tier];   // content box inside the 128x96 canvas
 const hx=Math.round(104-HAUL.cx),hy=426-HAUL.bot;
 const bag=el('bag',`<img src="${A.cashHaul(tier,false)}" alt="" width="128" height="96">`,null,{left:hx+'px',top:hy+'px',width:'128px',height:'96px',opacity:0});bag.dataset.tier=tier;
 const bagImg=bag.querySelector('img');new Image().src=A.cashHaul(tier,true);
 await anim(bag,[{opacity:1,transform:'translateY(-70px)'},{opacity:1,transform:'translateY(0)'}],360,{easing:'cubic-bezier(.5,0,1,.6)'});S.thud();await sleep(200);
 for(let i=1;i<n;i++){S.thud();await sleep(560);}
 // ---- Rich counts
 if(cashK>0){
  await sleep(700);
  const cnt=el('count','<div class="amt"></div><div class="sub"></div>');const amt=cnt.querySelector('.amt'),sub=cnt.querySelector('.sub');
  bagImg.src=A.cashHaul(tier,true);     // the haul is opened to be counted; Rich's frozen counting-hands overlay works over it
  const hands=el('counthands',`<img src="${A.FL_ART.counting}" alt="" width="128" height="96">`,null,{left:hx+'px',top:hy+HAUL.top-50+'px'});
  const handsBob=reduced()?null:hands.animate([{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}],{duration:220/K.SPEED,iterations:Infinity});
  const bob=reduced()?null:rich.animate([{transform:'scale(1.2) translateY(0) rotate(0)'},{transform:'scale(1.2) translateY(3px) rotate(-2deg)'},{transform:'scale(1.2) translateY(0) rotate(2deg)'}],{duration:260/K.SPEED,iterations:Infinity});
  let flick=null;const startFlick=()=>{flick=setInterval(()=>{const b=el('bill','',null,{left:130+(Math.random()*60-30)+'px',top:'405px'});anim(b,[{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${20+Math.random()*30}px,${-(35+Math.random()*35)}px) rotate(${Math.random()*240-120}deg)`,opacity:0}],700,{easing:'ease-out'}).then(()=>b.remove());S.tick();},110/K.SPEED);};
  const stopFlick=()=>{clearInterval(flick);flick=null;};
  const total=Math.round(cashK*1000/100)*100;const marks=[.12,.43,.79].map(f=>Math.round(total*f/100)*100);let cur=0;
  const roll=async(to,ms)=>{const t0=performance.now(),from=cur;await new Promise(res=>{const step=()=>{const p=Math.min(1,(performance.now()-t0)*K.SPEED/ms);cur=Math.round((from+(to-from)*p)/100)*100;amt.textContent='$'+cur.toLocaleString('en-US');p<1?requestAnimationFrame(step):res();};step();});};
  startFlick();
  for(const m of marks){await roll(m,1400);stopFlick();sub.textContent='. . .';await sleep(1000);sub.textContent='';startFlick();}
  await roll(total,1200);stopFlick();if(bob)bob.cancel();if(handsBob)handsBob.cancel();hands.remove();
  amt.classList.add('final');amt.textContent='TAKE: $'+total.toLocaleString('en-US');S.cashIn();
  await sleep(1400);
 }
 // ---- the trunk: one item at a time, physically dropped beside the bags (kicker last). Spots fit the 48px FL-A10 pieces inside the 270px stage.
 // QA REPAIR 001: the five spots keep clear of Rich (drawn body ~213-247 x 378-441), the cash haul (~47-162 x 375-427), the parked car (~8-137 x 325-364)
 // and the crew's feet (~323): three in the open courtyard above the car, two on the pavement between the car and Rich. The label sits in one caption lane
 // (`.lootlab.lane`, between the TAKE line and the crew's heads) so a long name can never run over Rich, the haul or another piece.
 const spots=[[4,256],[52,256],[100,256],[142,330],[196,330]];let prevLab=null;
 const shownList=[];
 for(let i=0;i<items.length;i++){
  const it=items[i],[x,y]=spots[i]||[30+i*24,352];
  // FL-A10: the frozen 48x48 piece for GUN / CASH / MOD / BLOOD_X / WEIRD (rarity reads as a glow + the label colour, the art itself is never recoloured).
  // RECRUIT / STORY / DISTRICT have no authored physical object yet (SOURCE_REQUIRED): they keep the labelled placeholder crate — nothing is invented for them.
  let inner,wd=48,ht=48;const piece=A.loot(it.cat);
  if(piece)inner=`<img class="lp lp-${String(it.rar||'COMMON').toLowerCase()}" src="${piece}" alt="" width="48" height="48">`;
  else{inner=crate({cat:it.cat==='RECRUIT'?'RECRUIT':it.cat,rar:it.rar},44);wd=ht=44;}
  const node=el('lootitem',inner,null,{left:x+'px',top:y+'px',width:wd+'px',height:ht+'px',opacity:0});
  el('shadow','',null,{left:x+'px',top:y+ht-3+'px',width:wd+'px',height:'7px'});
  await anim(node,[{opacity:1,transform:'translateY(-120px) rotate(-20deg)'},{opacity:1,transform:'translateY(0) rotate(0)'},{opacity:1,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}],620,{easing:'ease-in'});
  S.thud();
  if(it.rar==='RARE'){S.crateGlow();}else if(it.rar==='LEGENDARY'){S.gasp();S.stinger();}
  const col=({COMMON:'#cfd3e6',RARE:'#37d5e8',LEGENDARY:'#ffd23f'})[it.rar]||'#ffd23f';
  const short=String(it.name).replace(/^an? /i,'').toUpperCase().slice(0,26);
  const who=it.cat==='GUN'&&it.to?` → ${(crewObjs.find(o=>o.id===it.to)||{short:''}).short.toUpperCase()}`:'';
  if(prevLab)anim(prevLab,[{opacity:1},{opacity:0}],250);
  prevLab=el('lootlab lane',esc(short+who),null,{color:col,borderColor:col});
  {const r=prevLab.getBoundingClientRect(),sr=stage.getBoundingClientRect(),sc=sr.width/270;const L=(r.left-sr.left)/sc,R=(r.right-sr.left)/sc;if(R>266)prevLab.style.transform=`translateX(calc(-50% - ${Math.round(R-266)}px))`;else if(L<4)prevLab.style.transform=`translateX(calc(-50% + ${Math.round(4-L)}px))`;}
  node.dataset.loot=it.name;shownList.push({name:it.name,cat:it.cat,rar:it.rar});
  await sleep(1500);
 }
 await sleep(600);
 return {alone:false,shown:shownList,counted:cashK};
}
export function operationResult({rec,crewObjs,canonical,bankBefore,bankAfter,story}){
 const gain=canonical?.cash.gain??Math.round((rec.win?W.potBank(rec):0)*1000);
 const spent=canonical?.cash.spent??Math.max(0,Math.round((bankBefore+gain/1000-bankAfter)*1000));
 const crew=canonical?.crew||rec.crew.map(id=>({id,after:rec.finalStatus[id]}));
 const calls=(rec.callLog||[]).map(c=>({SAVE:'RESCUE',PUSH:'PUSH ON',FOLD:'FALL BACK',SNEAK:'SLIP PAST',TALK:'TALK',PAY:'PAY',BUST:'BREACH',TIMEOUT:'CREW DECIDED',DEFAULT:'CREW DECIDED'})[c.choice]||c.choice);
 const rows=crew.map(c=>{
  const o=crewObjs.find(o=>o.id===c.id)||{name:c.id};
  const status=c.after==='READY'?'HOME · READY':c.after==='WOUNDED'?'HOME · WOUNDED':c.after==='SHOT'?'HOME · DOWN':c.after;
  return `<li><span>${esc(o.name)}</span><b class="${esc(c.after)}">${esc(status)}</b></li>`;
 }).join('');
 const panel=el('operation-result',`<h2>${rec.win?'OPERATION COMPLETE':'OPERATION LOST'}</h2>
  <div class="result-money"><span>PLAY TAKE <b>${money(gain/1000)}</b></span><span>SPENT <b>${money(spent/1000)}</b></span></div>
  <div class="result-route">RESULT: ${esc(rec.klass)} · GETAWAY: ${esc(rec.getaway?.kind||rec.getaway||'NONE')}</div><div class="result-route">${!story&&canonical?'HEAT: '+(canonical.heat.delta>=0?'+':'')+canonical.heat.delta+' · ':''}${rec.shape==='HOLD THE HOUSE'?'HOUSE: '+esc(rec.getaway||rec.klass):'TRANSPORT: '+esc(canonical?.car.id||rec.car||'NONE')+' · '+(canonical?.car.lost?'LOST':'HOME')}</div>
  ${calls.length?`<div class="result-calls">YOUR CALLS: ${calls.map(esc).join(' · ')}</div>`:''}
  <ul>${rows}</ul>${(rec.lost?.cars||[]).length?'<p>TRANSPORT LOST</p>':''}
  ${(rec.lost?.guns||[]).length?'<p>'+rec.lost.guns.length+' WEAPON(S) LOST</p>':''}
  <small>${story?'MISSION REWARD AND HEAT SETTLE ON RETURN':'CREW AND TAKE RECORDED · RETURN TO CONTINUE'}</small>`);
 panel.setAttribute('role','status');const toggle=el('report-toggle','SHOW THE HAUL');toggle.setAttribute('role','button');toggle.tabIndex=0;const flip=()=>{panel.hidden=!panel.hidden;toggle.textContent=panel.hidden?'SHOW REPORT':'SHOW THE HAUL';};toggle.onclick=flip;toggle.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip();}};return panel;
}
export function againButton(label='RUN ANOTHER PLAY'){
 const b=document.createElement('button');b.className='again';b.textContent=label;world.appendChild(b);
 return new Promise(r=>{b.onclick=async()=>{K.unlock();S.tap();await fadeTo(1,500);r();};});
}

// ------------------------------------------------------------------------------------------------ settings (a discreet ⚙ in the corner)
export function settingsButton({onNewCareer,onDev}){
 const b=document.createElement('button');b.id='gear';b.setAttribute('aria-label','settings');b.textContent='⚙';stage.appendChild(b);
 b.onclick=()=>{
  K.unlock();const old=document.getElementById('setpanel');if(old){old.remove();return;}
  const s=settings.get();
  const p=el('setpanel',`<div class="sh">SETTINGS</div>
   <label><input type="checkbox" data-k="sound" ${s.sound?'checked':''}> SOUND</label>
   <label><input type="checkbox" data-k="moreTime" ${s.moreTime?'checked':''}> MORE TIME on calls</label>
   <label><input type="checkbox" data-k="reduceMotion" ${s.reduceMotion?'checked':''}> REDUCE MOTION</label>
   ${onNewCareer?'<button data-new>NEW CAREER</button>':''}<button data-close>CLOSE</button>`,stage);p.id='setpanel';
  p.querySelectorAll('input').forEach(i=>i.onchange=()=>settings.set({[i.dataset.k]:i.checked}));
  if(onNewCareer)p.querySelector('[data-new]').onclick=()=>{if(confirm('Start a new career? This clears the save.'))onNewCareer();};
  p.querySelector('[data-close]').onclick=()=>p.remove();
 };
 return b;
}
