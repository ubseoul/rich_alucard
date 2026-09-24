(function(){
 // LANE 4 — DATING & INSTAHOE, the date loop (VOL 1 §9.4, VOL 3 §6.1). DM → pick a spot from her LIKES →
 // ARRIVAL → CONVERSATION (2 choices + Octopus Brain) → MOMENT → she posts or doesn't. No meter shown.
 // Per-woman conversation/moment content lives in js/data/btf/dates.js (RADateContent).
 const SPOTS={
  boba:{label:'BOBA AT THE GRAVE',env:'boba_shop',cost:14},
  peking_naija:{label:'PEKING NAIJA',env:'peking_naija',cost:76},
  grave_mall:{label:'SHOPPING AT THE GRAVE',env:'grave',cost:120},
  pier:{label:'SANTA MONICA PIER',env:'pier',cost:20},
  crest:{label:'A DRIVE UP ANGELES CREST',env:'crest',cost:30,needs:L=>RALife.ownedCars().length>0},
  cafe:{label:'BEAN THERE DEAD THAT',env:'cafe',cost:16,needs:L=>L.done('A16')},
  onsen:{label:'YU & ME ONSEN (PRIVATE ROOM)',env:'onsen',cost:90,needs:L=>L.done('A45')},
  food_court:{label:'THE FOOD COURT',env:'food_court',cost:24},
  catacomb:{label:'A SHOW AT THE CATACOMB',env:'catacomb',cost:40,needs:L=>L.done('A14')},
  taco_truck:{label:"DON CHUY'S TRUCK",env:'taco_truck',cost:18},
  brunch:{label:'EGGS BENEDEAD',env:'brunch',cost:68},
  venice:{label:'VENICE COURTS',env:'venice',cost:0},
  movie_room:{label:'MOVIE NIGHT (CASTLE)',env:'movie_room',cost:0,needs:L=>L.hasRoom('movie_room')},
  dragon_ride:{label:'A DRAGON RIDE',env:'la_sky',cost:0,needs:L=>L.dragon?.stage==='majestic'},
  rain_walk:{label:'A WALK IN THE RAIN',env:'street_night',cost:0,needs:L=>L.info.rain},
  kitchen:{label:'COOK FOR HER (CASTLE KITCHEN)',env:'kitchen',cost:25,needs:L=>L.hasRoom('kitchen')},
  gallery:{label:"ROOKOKO'S GALLERY",env:'gallery',cost:0,needs:L=>L.done('A49')},
  duchess_dinner:{label:'A DUCHESS-TIER DINNER',env:'duchess_castle',cost:1200,needs:L=>L.done('A33')},
  ballroom:{label:'THE EMPTY BALLROOM',env:'ballroom',cost:0,needs:L=>L.done('A25')},
  salon:{label:'AFTER HOURS AT TWIST & SHOUT',env:'salon',cost:0,needs:L=>L.done('A48')},
  little_tokyo:{label:'LITTLE TOKYO AT NIGHT',env:'little_tokyo',cost:60},
  naija_mart:{label:'NAIJA MART (MALT ON THE CURB)',env:'naija_lot',cost:6,needs:L=>L.done('A43')},
  waffle_haven:{label:'WAFFLE HAVEN (ATL)',env:'waffle_haven',cost:420,needs:L=>L.done('A44')},
  lennox:{label:'LENNOX SCARE (ATL)',env:'lennox',cost:900,needs:L=>L.done('A44')},
  atl_curb:{label:'THE CURB (POWDER SPRINGS)',env:'curb',cost:420},
  fish_tank:{label:'THE FISH TANK ROOM',env:'fish_tank',cost:0,needs:L=>L.hasRoom('fish_tank')},
  rave:{label:'A RAVE',env:'rave_interior',cost:100,needs:L=>L.flag('ogunsRaveCompleted')}
 };
 const person=id=>RABtfPeople.get(id);
 const spotLabel=id=>SPOTS[id]?.label||id;
 function availableSpots(id){const L=RALife.L();const p=person(id);const liked=new Set(p?.likes||[]);
  const list=Object.entries(SPOTS).filter(([sid,s])=>{try{return !s.needs||s.needs(L)}catch(e){return false}}).map(([sid,s])=>({id:sid,...s,liked:liked.has(sid)}));
  // Her likes first (they are on her profile), then 3 generic options. Keep the choice legible.
  return [...list.filter(s=>s.liked),...list.filter(s=>!s.liked&&['boba','peking_naija','taco_truck','grave_mall','pier','little_tokyo'].includes(s.id))].slice(0,5);}
 function whyNot(id){const r=RARelations.get(id);if(!r)return 'you have not met.';if(!RARelations.canDate(id))return 'you just saw her. give it a night.';if(r.flags?.away)return 'she is out of town.';return '';}
 const canAsk=id=>!!RARelations.get(id)&&RARelations.canDate(id)&&!RAAdventures.active();
 async function plan(id){if(!canAsk(id))return false;return RAAdventureScene.begin('DATE',{from:'instahoe',vars:{person:id}});}
 // Conversation read: her profile says what lands. Returns {readRight, line} for a choice id.
 function read(id,choice){const c=window.RADateContent?.get?.(id);const right=c?.reads?.[choice];return right===true;}
 window.RADating={SPOTS,spotLabel,availableSpots,plan,canAsk,whyNot,read};
})();
