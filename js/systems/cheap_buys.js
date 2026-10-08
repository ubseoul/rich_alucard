(function(){
 'use strict';
 // CHEAP BUYS PAY OFF — RC2 · BUILD 1 (OL-063). A small purchase (tacos, a plate, a snack: RAEcon.cheapBuys.maxPrice or less) has a chance,
 // once a day, to put an EXISTING want in front of the player ahead of its authored day: a character to meet or an adventure to start.
 // The want is the authored temptation itself (its own line, its own adventure), pushed through RATemptations.push, so nothing new is
 // written here; the one toast is a Build 3 hook (RAEconLines 'cheap.meet' / 'cheap.unlock'). Pool and odds: RAEcon.cheapBuys.
 const E=()=>window.RAEcon?.cheapBuys||{maxPrice:60,chance:0,cooldownDays:1,pool:[]};
 const POOL=['w2_tristan','w2_boba','w2_za','w2_cafe'];     // existing wants gated to Days 8-10 by their authored minDay; w2_tristan is a person to meet
 const MEET=new Set(['w2_tristan']);
 const flag=k=>window.RALife.flag(k);
 function candidates(){
  const day=window.RALife.today().day,live=window.RALife.life().temptations.live||[],hist=window.RALife.life().temptations.history||[];
  const defs=new Map(window.RATemptations.defs().map(d=>[d.id,d]));
  return POOL.filter(id=>{
   const d=defs.get(id);if(!d||live.some(t=>t.id===id)||hist.some(h=>h.id===id))return false;
   if(d.minDay&&day>=d.minDay)return false;               // already due: the normal cadence delivers it, nothing to unlock early
   const adv=typeof d.adventure==='function'?d.adventure(window.RALife.L()):d.adventure;
   return !adv||window.RAAdventures.available(adv,{ignoreActive:true});   // the purchase happens INSIDE an adventure, so the active-run guard must not hide the others
  });
 }
 function toast(text){
  try{
   if(!text||typeof document==='undefined'||!document.body||!document.createElement)return;
   const el=document.createElement('div');el.className='ra-toast';el.setAttribute('role','status');el.textContent=text;document.body.appendChild(el);
   setTimeout(()=>el.remove&&el.remove(),3600);
  }catch(e){}
 }
 // Roll after a cheap purchase. The roll is fixed by (this life's salt, day, purchase count): a reload cannot re-roll it, two lives differ.
 function afterPurchase(price){
  const e=E();if(!(price>0&&price<=e.maxPrice))return null;
  const day=window.RALife.today().day;if(window.RALife.life().clock?.started!==true)return null;
  const last=Number(flag('cheapBuyDay'))||0;if(last&&day-last<(e.cooldownDays||1))return null;
  const n=(Number(flag('cheapBuyRolls'))||0)+1;window.RALife.setFlag('cheapBuyRolls',n);window.RALife.setFlag('cheapBuyDay',day);
  // real browsers vary per life; headless runs stay deterministic
  let salt=Number(flag('cheapBuySalt'));if(!salt){salt=(typeof navigator!=='undefined'&&navigator.userAgent)?1+Math.floor(Math.random()*1e9):1;window.RALife.setFlag('cheapBuySalt',salt);}
  if((window.RALife.hash(salt+day*131+n*17)%1000)/1000>=e.chance)return null;
  const list=candidates();if(!list.length)return null;
  const id=list[window.RALife.hash(salt+day*37+n)%list.length];
  const pushed=window.RATemptations.push(id,{quiet:true});if(!pushed)return null;
  const kind=MEET.has(id)?'meet':'unlock';
  const line=window.RAEconLines?.get(kind==='meet'?'cheap.meet':'cheap.unlock')||'';
  window.RAState.recordEvent({id:`cheap-buy:${day}:${n}`,type:'cheap_buy_payoff',day,want:id,kind});
  toast(line);
  try{document.dispatchEvent(new CustomEvent('ra:cheap-buy',{detail:{id,kind,line}}));}catch(err){}
  return {id,kind,line};
 }
 // The seam: every RALife.spend that goes through is a purchase. Wrapped once.
 if(window.RALife&&!window.RALife.__cheapBuys){
  const spend=window.RALife.spend;
  window.RALife.spend=function(n){const ok=spend.apply(this,arguments);if(ok)try{afterPurchase(Number(n))}catch(e){console.error('cheap buys',e)}return ok;};
  window.RALife.__cheapBuys=true;
 }
 window.RACheapBuys={afterPurchase,candidates,POOL};
})();
