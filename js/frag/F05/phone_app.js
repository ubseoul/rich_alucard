(function(){
 'use strict';
 // F05 - THE TRAP - phone_app.js
 // The TRAP / COUNTING phone app (THE TRAP sec.2/5/6). Player-facing management surface: listing, houses, the COOK,
 // ASSIGN SALES, the NIGHT REPORT, COUNT THE MONEY, upgrades, roles and the F01-pending raid board. Declared through
 // the frozen IF-1 RAPhoneRegistry so it only exists while the fragment flag is ON.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;
 const esc=U.esc;
 const btn=(label,action,cls='')=>`<button type="button" class="phone-button ${cls}" data-phone-action="${esc(action)}">${label}</button>`;
 const A=()=>R.AUTHORED;

 function moneyRow(){return `<div class="phone-status"><span>TRAP ${RALife.fmt(R.sales.pending())}</span><span>${A().levels[R.store.level()].name}</span></div>`;}
 function heatRow(){const e=R.heat.effects();return `<p class="phone-small">HEAT ${e.tier} (${e.value})${e.onFire?' - ON FIRE':''}</p>`;}

 function home(){
  const unlocked=R.read('unlocked',false);
  if(!unlocked){
   const e=R.unlock.eligibility();
   const line=(ok,label)=>`<br>${ok?'[x]':'[ ]'} ${esc(label)}`;
   return `<h1>TRAP</h1><div class="phone-card"><b>${esc(R.unlock.LISTING_TITLE)}</b><br><span class="phone-small">${esc(R.unlock.SHANNON_LINE)}</span></div>`+
    `<p class="phone-small">LOCKED${line(e.conditions.newOgaAssociate,'NEW OGA ASSOCIATE')}${line(e.conditions.offerAccepted,'MISTER DECEMBER OFFER')}${line(e.conditions.day14Jugged,'DAY 14 + JUGGED THE PLUG')}</p>`;
  }
  const houses=R.store.ownedHouses();
  return `${moneyRow()}${heatRow()}`+
   `<div class="phone-card"><b>${esc(A().levels[R.store.level()].name)}</b><br><span class="phone-small">${esc(A().levels[R.store.level()].visual)}</span></div>`+
   (houses.length?houses.map(h=>btn(`${esc(A().houses[h].label)}<br><small>${R.production.readyCases({houseId:h})} cases ready${R.production.hot(h)?' - HOT':''}</small>`,`app:trap:house:${h}`)).join(''):`<p class="phone-small">no traphouse yet.</p>`)+
   btn('BUY A TRAPHOUSE','app:trap:listing')+
   btn('ASSIGN SALES','app:trap:sales')+
   btn(R.sales.pending()>0?`COUNT THE MONEY (${RALife.fmt(R.sales.pending())})`:'COUNT THE MONEY','do:trap:count')+
   btn('NIGHT REPORT','app:trap:report')+
   btn('ROLES','app:trap:crew')+
   btn('UPGRADES','app:trap:upgrades')+
   btn('THE TRAP','app:trap:world');
 }
 function listing(){
  const L=R.unlock.listing();
  return `<h1>LISTING</h1><div class="phone-card"><b>${esc(L.title)}</b><br><span class="phone-small">${esc(L.shannon)}</span></div>`+
   L.houses.map(h=>`<div class="phone-card"><b>${esc(h.label)}</b><br><span class="phone-small">${esc(h.where)} - ${RALife.fmt(h.price)} - ${h.capacity} cases/night<br>${esc(h.flavor)}</span>`+
    (h.owned?'<br><span class="phone-small">OWNED</span>':(h.canBuy?btn('BUY',`do:trap:buyHouse:${h.id}`):`<br><span class="phone-small">${esc(h.blocked)}</span>`))+'</div>').join('');
 }
 function house(sub){
  const id=sub,h=A().houses[id];if(!h)return '<p>gone.</p>';
  const hot=R.production.hot(id);const grades=R.production.unlockedGrades();
  const stock=R.production.readyBatches().filter(b=>b.houseId===id);
  return `<h1>${esc(h.label)}</h1>${hot?'<p class="phone-small">HOT - no production 5 nights.</p>':''}`+
   `<p class="phone-small">${esc(h.where)} - ${h.capacity} cases/night</p>`+
   `<p class="phone-small">INGREDIENTS synth ${U.int(R.production.ingredients().synth)} std ${U.int(R.production.ingredients().standard)} good ${U.int(R.production.ingredients().good)} premium ${U.int(R.production.ingredients().premium)} rare ${U.int(R.production.ingredients().rare)}</p>`+
   (hot?'':grades.map(g=>btn(`COOK ${g} - ${esc(A().grades[g].street)}`,`do:trap:cook:${id}|${g}`)).join(''))+
   (stock.length?`<p class="phone-speaker">STOCK</p>${stock.map(b=>`<p class="phone-small">${esc(b.grade)} q${Math.round(b.quality)} x${b.cases}${b.readyDay>U.day()?' (aging)':''}</p>`).join('')}`:'<p class="phone-small">no stock.</p>');
 }
 function salesPage(){
  const houses=R.store.ownedHouses();const rows=[];
  for(const hid of houses){
   for(const grade of Object.keys(A().grades)){
    const ready=R.production.readyCases({houseId:hid,grade});if(!ready)continue;
    const enabled=R.sales.channels().filter(c=>c.available&&c.grades.includes(grade));
    rows.push(`<div class="phone-card"><b>${esc(A().houses[hid].label)} - ${grade} x${ready}</b><br>`+
     (enabled.length?enabled.map(c=>btn(`${esc(c.label)}`, `do:trap:assign:${hid}|${grade}|${c.id}`)).join(''):'<span class="phone-small">no channel available for this grade</span>')+'</div>');
   }
  }
  return `<h1>ASSIGN SALES</h1>${rows.join('')||'<p class="phone-small">nothing ready.</p>'}<p class="phone-small">sales resolve when you sleep.</p>`;
 }
 function reportPage(){
  const r=R.store.lastReport();if(!r)return '<h1>NIGHT REPORT</h1><p class="phone-small">no sales night yet.</p>';
  return `<h1>NIGHT REPORT</h1><div class="phone-card"><b>DAY ${r.day} - ${esc(r.channelLabel||r.channel)}</b><br>`+
   `${r.cases} x ${esc(r.grade)}<br>${RALife.fmt(r.revenue)}${r.stolen?` (light by ${RALife.fmt(r.stolen)})`:''}<br>HEAT ${r.heat>=0?'+':''}${r.heat}`+
   `${r.notes&&r.notes.length?'<br><span class="phone-small">'+esc(r.notes.join(' '))+'</span>':''}</div>`;
 }
 function crewPage(){
  const roles=R.store.roles();const slots=R.crew.slotSummary();
  const list=Object.keys(roles).map(id=>`<div class="phone-card"><b>${esc(id)}</b><br><span class="phone-small">${esc(roles[id].role)} - loyalty ${roles[id].loyalty}</span>`+
   (roles[id].role==='runner'?btn('TALK',`do:trap:confront:${id}|talk`)+btn('FIRE',`do:trap:confront:${id}|fire`)+btn('OCTOPUS BRAIN',`do:trap:confront:${id}|octopus`):'')+'</div>').join('');
  const open=Object.keys(slots).filter(role=>slots[role].open>0).map(role=>btn(`HIRE ${role.toUpperCase()} (${slots[role].open})`,`do:trap:crewRecruit:${role}`)).join('');
  return `<h1>ROLES</h1><p class="phone-small">cooks ${slots.cook.used}/${slots.cook.total} - runners ${slots.runner.used}/${slots.runner.total} - lookout ${slots.lookout.used}/${slots.lookout.total}</p>${open}${list||'<p class="phone-small">no crew.</p>'}<p class="phone-small">named crew reuse Ogas where possible (F04); visuals: artSourceRequired.</p>`;
 }
 function upgradesPage(){
  return `<h1>UPGRADES</h1>${R.levels.list().map(u=>`<div class="phone-card"><b>${esc(u.label)}</b><br><span class="phone-small">${esc(u.effect)}${u.owned?' - OWNED':''}</span>${u.owned?'':btn('BUY',`do:trap:buyUpgrade:${u.id}`)}</div>`).join('')}`;
 }
 function worldPage(){
  const lvl=R.levels.status();
  const seen=R.reactions.seen(),pend=R.reactions.pending();
  return `<h1>THE TRAP</h1>${heatRow()}`+
   `<div class="phone-card"><b>LEVEL ${lvl.level}${lvl.name?' - '+esc(lvl.name):''}</b><br><span class="phone-small">cases sold ${lvl.casesSold}${lvl.next?` / ${lvl.threshold} to ${esc(A().levels[lvl.next].name)}`:' (MAX)'}</span>`+
   (lvl.next?(lvl.eligible?btn('LEVEL UP',`do:trap:levelUp`):''):'')+
   (lvl.jobSourceRequired?'<br><span class="phone-small">level job content: contentSourceRequired</span>':'')+'</div>'+
   (R.read('robbery',null)&&R.read('robbery').notice&&!R.read('robbery').resolved?'<p class="phone-small">numbers look light.</p>':'')+
   `<p class="phone-speaker">PEOPLE</p><p class="phone-small">noticed: ${seen.map(s=>s.id.toUpperCase()).join(', ')||'nobody yet'}${pend.length?` - waiting: ${pend.map(p=>p.label).join(', ')}`:''}</p>`+
   raidSection();
 }
 function raidSection(){
  const p=R.raids.pending();
  if(!p)return '<p class="phone-speaker">RAIDS</p><p class="phone-small">none pending.</p>';
  // The launch control belongs to the shared HOLD host (RAHoldBridge, js/if1/hold_bridge.js): F05 only offers the surface and delegates.
  // Ignoring the raid costs nothing; it stays here, launchable, until it is answered.
  const host=window.RAHoldBridge&&window.RAHoldBridge.available();
  return `<p class="phone-speaker">RAIDS</p><div class="phone-card"><b>${esc(p.attacker.label)}</b><br><span class="phone-small">${esc(p.houseId)} - ${p.state==='handed'?'HOLD THE HOUSE under way':'incoming'}</span></div>`+
   (host?btn(p.state==='handed'?'BACK IN':'HOLD THE HOUSE','do:trap:holdRaid'):'');
 }

 function render(sub){
  try{
   if(!sub)return home();
   if(sub==='listing')return listing();
   if(sub.startsWith('house:'))return house(sub.slice(6));
   if(sub==='sales')return salesPage();
   if(sub==='report')return reportPage();
   if(sub==='crew')return crewPage();
   if(sub==='upgrades')return upgradesPage();
   if(sub==='world')return worldPage();
   return home();
  }catch(e){return `<h1>TRAP</h1><p class="phone-small">error</p>`;}
 }

 function onAction(act,arg,api){
  if(act==='buyHouse'){const r=R.unlock.buy(arg);api.refresh();return r;}
  if(act==='cook'){
   const [houseId,grade]=(arg||'').split('|');const h=A().houses[houseId];
   if(!h)return {ok:false,reason:'unknown-house'};
   const base=R.production.BASE_OF[grade];const avail=U.int(R.production.ingredients()[base]);
   const cases=Math.min(U.int(h.capacity),avail);
   if(cases<1){api.message&&api.message('no base ingredients.');return {ok:false,reason:'no-ingredients'};}
   api.launch('f05_cook',{houseId,grade,cases},result=>{
    if(!result||result.quit)return;
    R.production.cook({houseId,grade,cases,quality:result.quality});
   });
   return {ok:true};
  }
  if(act==='assign'){const [houseId,grade,channel]=(arg||'').split('|');const ready=R.production.readyCases({houseId,grade});const r=R.sales.assign({houseId,grade,cases:ready,channel});if(!r.ok&&api.message)api.message(r.reason||'cannot assign');api.refresh();return r;}
  if(act==='count'){const amount=R.sales.pending();if(amount<=0){if(api.message)api.message('nothing to count.');return {ok:false};}
   const speed=R.levels.hasUpgrade('money_counter')?1/U.num(R.PROVISIONAL.moneyCounterSpeedMult):1;
   api.launch('f05_counter',{amount,speed},()=>{R.sales.bank();});return {ok:true};}
  if(act==='buyUpgrade'){const r=R.levels.buyUpgrade(arg);api.refresh();return r;}
  if(act==='crewRecruit'){const r=R.crew.recruit(arg);api.refresh();return r;}
  if(act==='confront'){const [crewId,method]=(arg||'').split('|');const r=R.crew.confront(crewId,method);R.patch('robbery',{...R.read('robbery',{}),resolved:method});api.refresh();return r;}
  if(act==='levelUp'){const r=R.levels.levelUp();api.refresh();return r;}
  if(act==='holdRaid'){
   const host=window.RAHoldBridge;if(!host||!host.available())return {ok:false,reason:'no-hold-host'};
   return host.start({origin:{app:'trap',scene:window.RAScenes?.current?.()||null}}).then(r=>{if(api.refresh)api.refresh();if(!r.ok&&api.message)api.message('cannot hold the house right now.');return r;});
  }
  return {ok:false,reason:'unknown-action'};
 }

 R.phoneApp={id:'trap',render,onAction,home,listing,house,salesPage,reportPage,crewPage,upgradesPage,worldPage};
})();
