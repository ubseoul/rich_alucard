(function(){
 // LANE 1 — HOME: THE CASTLE (VOL 1 §9.1, VOL 5 §9.4). Each room is a place with a verb, never a +2 decoration.
 // Bought from RealMoneyRealEstate → YOUR CASTLE; usable within one tap of the bedroom (⌂ CASTLE).
 const ROOMS=[
  {id:'maid_quarters',label:'MAID QUARTERS',price:40000,verb:'MARISOL LIVES IN. SHE JUDGES EVERYTHING.',go:'castle:maid'},
  {id:'armory_wall',label:'ARMORY WALL',price:60000,verb:'DISPLAYS YOUR GUNS. +1 GUN SLOT.',go:'castle:armory'},
  {id:'hookah_roof',label:'HOOKAH ROOF',price:75000,verb:'BLLAD33 HANG SPOT. START FIGHTS WITH 10 STORED REVENGE.',go:'castle:roof'},
  {id:'kitchen',label:'KITCHEN',price:85000,verb:'JOLLOF WARS PRACTICE. DRAGON MAGGI CUBES. COOK FOR A DATE.',go:'castle:kitchen'},
  {id:'dragon_roost',label:'DRAGON ROOST',price:90000,verb:'MAZDA LIVES ON THE ROOF. JUST FLY AWAY. LATE-FIGHT ASSIST.',go:'castle:roost',needs:L=>!!L.dragon},
  {id:'movie_room',label:'MOVIE ROOM',price:110000,verb:'MOVIE-NIGHT DATES. WATCH PARTIES. A HOOP IN THE COURTYARD.',go:'castle:movie'},
  {id:'music_room',label:'MUSIC ROOM',price:120000,verb:'COOK SONGS AT HOME. SET THE CASTLE SONG.',go:'castle:music'},
  {id:'garage',label:'GARAGE',price:150000,verb:'EVERY CAR ON DISPLAY. TOUGE FROM HOME. PARTS BAY.',go:'castle:garage'},
  {id:'coffin_upgrade',label:'COFFIN UPGRADE',price:200000,verb:'+20 MAX HP. YOU ONLY SLEEP IN IT WHEN HUNGOVER.',go:'castle:coffin'},
  {id:'party_hall',label:'PARTY HALL',price:250000,verb:'HOST CASTLE PARTIES.',go:'castle:party',needs:L=>!!L.flag('castlePartyHostingUnlocked')},
  {id:'fish_tank',label:'FISH TANK ROOM',price:400000,verb:'PURE FLEX. RARE FISH. RICH CANNOT GO IN. GUESTS LOVE IT.',go:'castle:fishtank'}
 ];
 function buy(id){const r=ROOMS.find(x=>x.id===id);if(!r||RALife.hasRoom(id))return false;if(r.needs&&!r.needs(RALife.L()))return false;if(!RALife.spend(r.price))return false;RALife.addRoom({id,price:r.price});RALife.light('ownership',1,`room:${id}`);RALife.remember({text:`built the ${r.label.toLowerCase()}`,lane:'home'});RALife.receipt({id:`room:${id}`,caption:`new room: ${r.label.toLowerCase()}.`,lane:'home'});return true;}
 function markup(){return `<p class="phone-speaker">YOUR CASTLE</p>${ROOMS.map(r=>{const own=RALife.hasRoom(r.id);const lock=r.needs&&!r.needs(RALife.L());return `<div class="phone-card"><b>${r.label}${own?' · OWNED':''}</b>${r.verb}${own?'':`<br>${RALife.fmt(r.price)}<button type="button" class="phone-button" data-phone-action="do:castle:buy:${r.id}" ${lock||RALife.money()<r.price?'disabled':''}>${lock?'NOT YET':RALife.money()<r.price?'NOT ENOUGH CASH':'BUILD IT'}</button>`}</div>`;}).join('')}`;}
 window.RAPhoneApps?.register({id:'castle',label:'CASTLE',hidden:true,onAction(act,arg,api){if(act==='buy'){if(buy(arg)){api.message('done. go look.');api.refresh();}else api.message('not yet.');}}});
 // ⌂ CASTLE menu (one tap from the bedroom).
 function open(){
  const layer=document.querySelector('.bedroom-life-layer');if(!layer||layer.querySelector('.castle-menu'))return;
  const menu=document.createElement('div');menu.className='morning-mail castle-menu';menu.style.pointerEvents='auto';
  const owned=ROOMS.filter(r=>RALife.hasRoom(r.id));
  const always=[{label:'THE THRONE ROOM',go:'castle:throne',verb:RALife.life().clock.hungover?'you are hungover. the throne is calling.':'sit on it. be the boss.'},{label:'OUTSIDE (DON CHUY\'S)',go:'tacos',verb:'tacos. $3 each. canciones until 3 a.m.'}];
  menu.innerHTML=`<h2>THE CASTLE</h2>${[...always,...owned].map(r=>`<button type="button" class="mail-card" data-castle="${r.go}"><b>${r.label}</b>${r.verb}</button>`).join('')}${owned.length?'':'<div class="mail-card" style="cursor:default"><b>MORE ROOMS</b>buy rooms in RealMoneyRealEstate → YOUR CASTLE.</div>'}<button type="button" class="mail-done" data-castle="close">BACK TO BED</button>`;
  menu.addEventListener('click',e=>{const b=e.target.closest('[data-castle]');if(!b)return;menu.remove();if(b.dataset.castle!=='close')RAPlaces.go(b.dataset.castle,window.RAPhone?.api);});
  layer.append(menu);
 }
 window.RACastle={ROOMS,buy,markup,open};
})();
