(function(){
 'use strict';
 // F02 THE ARMORY — the phone app (IF-1 4D RAPhoneRegistry). Declared DARK: with F02.armory OFF the app is simply not
 // registered with the phone, so every accepted app/grid/order is byte-identical. Section/placement is provisional
 // (OL-001: phone placement is reviewed after F4). Range Day is reached from here (F02.range_day).
 // Phone dispatch contract: content buttons navigate with `app:armory:<sub>` and act with `do:armory:<act>:<arg>`
 // (js/scenes/phone.js action()); onAction(act,arg,api) receives the decoded pieces.
 const R=window.RAIronAndGrace,C=window.RAIronCatalog,Reg=window.RAPhoneRegistry;
 if(!R||!C)throw new Error('F02 armory must load after catalog + registry');
 const fmt=n=>window.RALife?.fmt?window.RALife.fmt(n):`${n}`;
 const low=s=>String(s??'').toLowerCase();
 const btn=(label,action,cls='')=>`<button type="button" class="phone-button ${cls}" data-phone-action="${action}">${label}</button>`;
 const nav=(sub,label,cls='')=>btn(label,`app:armory${sub?`:${sub}`:''}`,cls);
 const act=(action,label,cls='')=>btn(label,`do:armory:${action}`,cls);

 function modList(gunId){
  return R.mods().map(m=>{const equipped=R.hasMod(gunId,m.id),owned=R.modsOwned().includes(m.id);
   const label=owned?(equipped?'REMOVE':'ATTACH'):`BUY ${fmt(m.price)}`;
   const action=owned?(equipped?`detach:${gunId}|${m.id}`:`attach:${gunId}|${m.id}`):`buyMod:${m.id}`;
   return `<div class="ia-mod"><b>${m.label}</b><small>${m.effect}</small>${act(action,label,'ia-small')}</div>`;}).join('');
 }
 function gunCard(g){
  const owned=R.owns(g.id);const mods=R.modsFor(g.id);
  const tags=mods.length?` <small>${mods.map(id=>low(C.MODS[id]?.label||id)).join(' · ')}</small>`:'';
  if(!owned){
   const buyable=!g.dev&&g.price!=null&&['armory','armory_glass_case','tandem_then_armory','jollof_wars_then_armory','naija_mart'].includes(g.acquisition.kind);
   const sub=g.dev?'UBE ONLY':buyable?`${fmt(g.price)} · ${g.type}`:`${g.type} · ${g.acquisition.note}`;
   return `<div class="ia-gun"><b>${g.label}</b><small>${sub}</small>${g.special?`<small>${g.special}</small>`:''}${buyable?act(`buy:${g.id}`,`BUY · ${fmt(g.price)}`,'ia-small'):''}</div>`;
  }
  const equipped=R.equipped()===g.id?' · EQUIPPED':'';
  const ammo=R.effectiveAmmo(g.id);
  return `<div class="ia-gun ia-owned"><b>${R.displayName(g.id)}</b><small>AMMO ${ammo===Infinity?'∞':ammo} · ${g.type}${equipped}</small>${tags}
   ${R.equipped()===g.id?'':act(`equip:${g.id}`,'EQUIP','ia-small')}
   ${nav(`gun:${g.id}`,window.RARC3?'GUN STORY':'MODS','ia-small')}
   ${!window.RARC3&&R.hasMod(g.id,'custom_engraving')?act(`engrave:${g.id}`,'ENGRAVE','ia-small'):''}
   ${window.RAMinigames?act(`range:${g.id}`,'RANGE DAY','ia-small'):''}</div>`;
 }
 function home(){
  const owned=R.ownedGuns();const sale=C.armoryGuns().filter(g=>!R.owns(g.id));
  const medals=R.medalCount(),tokens=window.RARC3?0:R.discountTokens();
  return `<h1>THE ARMORY</h1>
   <p class="phone-small">DEACON BRASS · GUNS AND GRACE · ${fmt(window.RALife.money())}${tokens?` · ${tokens} MOD DISCOUNT`:''}${medals?` · ${medals} RANGE MEDAL${medals>1?'S':''}`:''}</p>
   <p class="phone-speaker">ON THE WALL</p>${owned.map(gunCard).join('')||'<p class="phone-small">nothing yet.</p>'}
   ${window.RARC3?'':`<p class="phone-speaker">DEACON'S WORKBENCH</p>${nav('bench','MODS','ia-wide')}`}
   ${sale.length?`<p class="phone-speaker">FOR SALE</p>${sale.map(gunCard).join('')}`:''}
   <p class="phone-small">RANGE/PRICE TUNING: ${C.TUNABLES.owner}</p>`;
 }
 function bench(){
  const tokens=R.discountTokens();
  return `<h1>WORKBENCH</h1>${tokens?`<p class="phone-small">${tokens} RANGE MEDAL DISCOUNT READY (${Math.round(C.TUNABLES.range.medalDiscount*100)}% off one mod)</p>`:''}
   ${R.mods().map(m=>{const owned=R.modsOwned().includes(m.id);
    return `<div class="ia-mod"><b>${m.label}</b><small>${m.effect} · ${fmt(m.price)}</small>${owned?'<small>OWNED</small>':act(`buyMod:${m.id}${tokens?'|d':''}`,`BUY${tokens?` (−${Math.round(C.TUNABLES.range.medalDiscount*100)}%)`:''}`,'ia-small')}</div>`;}).join('')}
   <p class="phone-small">MAX ${C.TUNABLES.maxModsPerGun} MODS PER GUN.</p>`;
 }
 function gunPage(id){
  const g=R.gun(id);if(!g||!R.owns(id))return '<h1>THE ARMORY</h1><p class="phone-small">not on the wall.</p>';
  const range=window.RAFrag?.read?.('F02',`range.${id}`)||null;
  return `<h1>${R.displayName(id)}</h1>
   <div class="phone-card"><b>${g.label}</b>${R.engravedName(id)?`<small>ENGRAVED: “${R.engravedName(id)}”</small>`:''}<small>${g.type} · ${g.special}</small>
   ${range?`<small>RANGE BEST ${range.best||0}${range.story?` · ${R.storyTitle(id)}`:''}</small>`:''}</div>
   ${R.hasMod(id,'custom_engraving')?act(`engrave:${id}`,'ENGRAVE A NAME','ia-wide'):''}
   ${nav('','BACK TO WALL','ia-small')}
   ${window.RARC3?'':`<p class="phone-speaker">MODS (MAX ${C.TUNABLES.maxModsPerGun})</p>${modList(id)}`}`;
 }

 const app={id:'armory',flag:'F02.armory',render(sub){
  const s=String(sub||'');
  if(s==='bench')return window.RARC3?home():bench();
  if(s.startsWith('gun:'))return gunPage(s.slice(4));
  return home();
 },onAction(actName,arg,api){
  if(window.RARC3&&['buyMod','attach','detach','engrave'].includes(actName))return;
  if(actName==='buy'){const r=R.buy(arg);api.message?.(r.ok?`BOUGHT ${R.gun(arg).label}`:`CAN'T — ${r.reason}`);api.refresh();return;}
  if(actName==='equip'){const r=R.equip(arg);api.message?.(r.ok?'EQUIPPED.':`CAN'T — ${r.reason}`);api.refresh();return;}
  if(actName==='buyMod'){const [modId,flag]=String(arg).split('|');const r=R.buyMod(modId,{useDiscount:flag==='d'});api.message?.(r.ok?`${C.MODS[modId].label} — ${fmt(r.price)}${r.discount?' (MEDAL DISCOUNT)':''}`:`CAN'T — ${r.reason}`);api.refresh();return;}
  if(actName==='attach'||actName==='detach'){const [gid,mid]=String(arg).split('|');const r=actName==='attach'?R.attachMod(gid,mid):R.detachMod(gid,mid);api.message?.(r.ok?`${mid} ${actName==='attach'?'ATTACHED':'REMOVED'}`:`CAN'T — ${r.reason}`);api.refresh();return;}
  if(actName==='engrave'){const name=typeof window.prompt==='function'?window.prompt('NAME THE GUN',R.engravedName(arg)||''):null;const r=R.engrave(arg,name);api.message?.(r.ok?`ENGRAVED: “${r.name}”`:`CAN'T — ${r.reason}`);api.refresh();return;}
  if(actName==='range'){if(window.RARC3&&!window.RARC3.attemptAllowed('range_day','range')){api.message?.('RETRY TOMORROW');return;}Promise.resolve(api.close?.()).then(()=>window.RAMinigames?.launch?.('range_day',{gunId:arg})).then(result=>{if(result?.quit)window.RAPhone?.openApp?.('armory');});return;}
 }};

 if(Reg)Reg.declare('F02',app);
 window.RAIronArmory={declared:!!Reg,app:()=>app,home,bench,gunPage};
})();
