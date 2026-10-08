// Scoped PLAY payout presentation. Never writes wallet, receipt, rewards or world.
import {el,world,S,reduced,SPEED} from './feel-core.mjs';
import * as A from './feel-art.mjs';
function styles(){
 if(document.getElementById('play-cash-style'))return;
 const link=document.createElement('link');link.id='play-cash-style';link.rel='stylesheet';
 link.href=new URL('./feel-cash.css',import.meta.url).href;document.head.append(link);
}
styles();
export function cashPayout({cashK,amount=null}){
 styles();
 const value=Number.isFinite(amount)?amount:cashK*1000;
 const total=Number.isFinite(value)?Math.max(0,Math.round(value)):0;
 if(!total)return Promise.resolve({counted:0,cancelled:false});
 const tier=A.bagTier(total/1000),box={1:{cx:63,bot:70},2:{cx:60,bot:70},3:{cx:67,bot:79}}[tier];
 const hx=Math.round(104-box.cx),hy=426-box.bot;
 const bag=el('bag cash-haul',null,null,{left:hx+'px',top:hy+'px',width:'128px',height:'96px'});
 const bagImg=new Image();bagImg.src=A.cashHaul(tier,false);bagImg.width=128;bagImg.height=96;bagImg.alt='';bag.append(bagImg);bag.dataset.tier=tier;
 const open=A.cashHaul(tier,true);new Image().src=open;
 const panel=el('count cash-reward','<div class="cash-label">PLAY TAKE</div><div class="amt">$0</div><div class="cash-meter" aria-hidden="true"><i></i></div>');
 panel.setAttribute('role','status');panel.setAttribute('aria-label','PLAY take: $'+total.toLocaleString('en-US'));
 panel.dataset.total=total;
 const amt=panel.querySelector('.amt'),meter=panel.querySelector('.cash-meter i');
 const button=document.createElement('button');button.className='cash-skip';button.dataset.cashSkip='';button.type='button';button.textContent='SKIP CASH';
 world.append(button);
 const notes=[],duration=1540,hold=560,quiet=reduced();let raf=0,timer=0,done=false,final=false,nextNote=0,tick=-1,start=performance.now();
 const fixed=[[-26,-58],[-10,-72],[16,-64],[30,-52],[-20,-66],[24,-70],[-6,-55],[12,-74]];
 return new Promise(resolve=>{
  const cleanup=()=>{
   cancelAnimationFrame(raf);clearTimeout(timer);observer.disconnect();
   document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',cancel);
   button.remove();notes.forEach(n=>n.node.remove());notes.length=0;
  };
  const finish=cancelled=>{if(done)return;done=true;cleanup();resolve({counted:total/1000,total,cancelled});};
  const cancel=()=>finish(true);
  const settle=(silent=false,skipped=false)=>{
   if(done||final)return;final=true;cancelAnimationFrame(raf);
   bag.style.transform='';bagImg.src=open;panel.classList.add('cash-final');meter.style.width='100%';
   amt.textContent='$'+total.toLocaleString('en-US');button.remove();notes.forEach(n=>n.node.remove());notes.length=0;
   panel.dataset.phase='complete';if(!silent)S.cashIn();
   timer=setTimeout(()=>finish(false),Math.max(1,(skipped?320:hold)/SPEED));
  };
  const key=e=>{if(e.key==='Escape'){e.preventDefault();settle(false,true);}};
  const visibility=()=>{if(document.hidden)settle(true,true);};
  button.onclick=()=>settle(false,true);
  document.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',cancel,{once:true});
  const observer=new MutationObserver(()=>{if(!panel.isConnected||!bag.isConnected)cancel();});
  observer.observe(world,{childList:true});
  const note=(i,t)=>{
   const n=el('cash-note','<img alt="" width="48" height="48">',null,{left:'80px',top:'380px'});
   n.querySelector('img').src=A.loot('CASH');n.setAttribute('aria-hidden','true');notes.push({node:n,t,aim:fixed[i%fixed.length]});
  };
  const draw=now=>{
   if(done||final)return;if(!panel.isConnected){cancel();return;}
   if(reduced()){settle(true,true);return;}
   const t=(now-start)*SPEED;
   const frame=Math.floor(t/80);panel.dataset.frame=frame;
   if(t<240){bag.style.transform='translateY('+[-22,-12,-4,0][Math.min(3,Math.floor(t/60))]+'px)';}
   else {bag.style.transform='';bagImg.src=open;}
   const p=Math.max(0,Math.min(1,(t-240)/(duration-240)));
   const eased=1-Math.pow(1-p,3),value=Math.min(total,Math.round(total*eased));
   amt.textContent='$'+value.toLocaleString('en-US');meter.style.width=(Math.round(p*12)/12*100)+'%';panel.dataset.phase=p?'counting':'drop';
   if(t>=240&&nextNote<8&&t>=240+nextNote*130){note(nextNote++,t);}
   for(let i=notes.length-1;i>=0;i--){
    const n=notes[i],u=Math.floor((t-n.t)/80)/7;
    if(u>=1){n.node.remove();notes.splice(i,1);continue;}
    n.node.style.transform='translate('+Math.round(n.aim[0]*u)+'px,'+Math.round(n.aim[1]*u)+'px)';
    n.node.style.opacity=u>=.85?'0':u>=.65?'.5':'1';
   }
   const beat=Math.floor(p*5);if(p>0&&beat!==tick){tick=beat;S.tick();}
   if(t>=duration){settle();return;}raf=requestAnimationFrame(draw);
  };
  if(quiet){bagImg.src=open;settle(true);}
  else {S.thud();raf=requestAnimationFrame(draw);}
 });
}
