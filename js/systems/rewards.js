(function(){
 // Applies minigame/adventure reward bundles to the life record in one place.
 function apply(result,{adventure=null}={}){
  const r=result?.rewards||{};if(!r||typeof r!=='object')return;
  if(r.money)RALife.addMoney(r.money);
  if(r.followers)RALife.addFollowers(r.followers);
  if(r.clout)RALife.addPoints('clout',r.clout);
  if(r.rep)RALife.addPoints('rep',r.rep);
  for(const [id,n] of Object.entries(r.items||{}))RALife.addItem(id,n);
  if(!r.dragonActions?.length)for(const [id,n] of Object.entries(r.consumed||{}))RALife.addItem(id,-n);
  for(const [flag,v] of Object.entries(r.flags||{}))RALife.setFlag(flag,v);
  for(const m of r.memories||[])RALife.remember({text:m,lane:result.minigame||adventure,type:'minigame'});
  if(r.hooks?.length){const music={...RAState.get().life.creativeLife.music};music.hooks=[...(music.hooks||[]),...r.hooks.map(h=>({...h,day:RALife.today().day}))];RAState.patch('life.creativeLife.music',music);}
  if(r.parts&&result.data?.car)window.RACars?.installParts?.(result.data.car,r.parts);
  if(r.dragonActions?.length)window.RADragon?.applyActions?.(r.dragonActions);
  if(r.hpLost)RALife.setFlag('hpBruise',(Number(RALife.flag('hpBruise'))||0)+r.hpLost);
  if(r.lessons?.length){const seen=new Set(RALife.flag('garageLessons')||[]);r.lessons.forEach(l=>seen.add(l));RALife.setFlag('garageLessons',[...seen]);}
 }
 window.RALifeRewards={apply};
})();

// The PLAY owner emits this only after a new canonical F04 credit settles.
// This listener acknowledges that credit; it never grants or changes money.
(function(){
 // Durable duplicate/reload guards stay with the owning receipt consumer.
 // Keep this document's cue guard transient so a new career can reuse request IDs.
 const presented=new Set();
 let active=null;
 function stop(){active?.();active=null;}
 function styles(){
  if(document.getElementById('play-credit-style'))return;
  const sheet=document.createElement('style');sheet.id='play-credit-style';
  sheet.textContent=[
   '.play-cash-credit{position:absolute;right:8px;top:164px;z-index:111;max-width:calc(100% - 16px);padding:7px 10px;background:#120c1cf5;border:2px solid #b6d3a3;box-shadow:3px 3px #080710;color:#ffd23f;pointer-events:none;text-shadow:1px 1px #080710}',
   '.play-cash-credit small{display:block;color:#b6d3a3;font:12px/1 Tiny5,var(--font-system,monospace);letter-spacing:1px}',
   '.play-cash-credit b{display:block;font:27px/1 Monogram,var(--font-system,monospace);white-space:nowrap}',
   '.play-cash-credit span{display:block;color:#c7c9b8;font:12px/1 Tiny5,var(--font-system,monospace)}',
   '.play-cash-credit.on{animation:play-cash-hit 240ms steps(4,end)}',
   '@keyframes play-cash-hit{0%{transform:translateY(4px);border-color:#ffd23f}100%{transform:translateY(0);border-color:#b6d3a3}}',
   '@media(prefers-reduced-motion:reduce){.play-cash-credit.on{animation:none}}'
  ].join('');
  document.head.append(sheet);
 }
 document.addEventListener('ra:play-cash-credited',event=>{
  const d=event.detail||{},amount=d.amount,balance=d.balance,id=d.requestId;
  if(d.source!=='war_room:play'||typeof id!=='string'||!id||presented.has(id)||!Number.isSafeInteger(amount)||amount<=0||!Number.isSafeInteger(balance)||balance!==window.RALife?.money?.())return;
  const adventure=window.RAState?.get?.()?.life?.adventures?.active?.id;
  if(['G5','G3','G7','G7-SET'].includes(adventure))return;
  const host=document.querySelector('#screen');if(!host)return;
  presented.add(id);
  stop();styles();
  const cue=document.createElement('div');cue.className='play-cash-credit on';cue.dataset.requestId=id;cue.setAttribute('role','status');
  const label=document.createElement('small');label.textContent='CREDITED';
  const gain=document.createElement('b');gain.textContent='+$'+amount.toLocaleString('en-US');
  const total=document.createElement('span');total.textContent='BALANCE $'+balance.toLocaleString('en-US');
  cue.append(label,gain,total);host.append(cue);
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const timer=setTimeout(stop,reduced?1100:1800);
  active=()=>{clearTimeout(timer);cue.remove();document.removeEventListener('ra:scene',stop);};
  document.addEventListener('ra:scene',stop,{once:true});
 });
 window.addEventListener('pagehide',stop);
})();
