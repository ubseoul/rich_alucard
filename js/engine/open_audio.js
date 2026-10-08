(function(){
 'use strict';
 // OL-043: event routing for ingested OPEN recordings. No sound generation or simulation writes.
 function scope(owner,life){
  let live=true,token=0;const held=new Set(),edges=new Map(),generations=new Map();
  function sound(id,part,valid=()=>true){const visit=token,key=part?`${id}:${part}`:id,generation=generations.get(key)||0;return window.RAAudio.preload(id).then(()=>{
   if(!live||visit!==token||generation!==(generations.get(key)||0)||!owner.isConnected||!valid())return false;
   const e=window.RAAudioManifest.get(id);if(e?.type==='loop'||e?.type==='loop set')held.add(id);
   return part?window.RAAudio.part(id,part):window.RAAudio.oneShot(id);
  });}
  function stop(id,part){const key=part?`${id}:${part}`:id;generations.set(key,(generations.get(key)||0)+1);if(!part)held.delete(id);window.RAAudio.stop(key,0);}
  function edge(key,on,id,part){if(edges.get(key)===on)return;edges.set(key,on);if(on)sound(id,part,()=>edges.get(key)===true);else stop(id,part);}
  function clear(){token++;for(const id of held)stop(id);edges.clear();}
  life?.cleanup?.(()=>{clear();live=false;});
  return {sound,stop,edge,clear};
 }
 const environments={ocean_floor:'AMB_OCEAN_FLOOR',ocean_floor_collapsed:'AMB_OCEAN_FLOOR',docks:'AMB_DOCKS',curb:'AMB_CURB',rave_exterior:'AMB_RAVE_EXT',rave_interior:'AMB_RAVE_INT',grave:'AMB_MALL',grave_closed:'AMB_MALL',boba_shop:'AMB_BOBA',food_court:'AMB_FOODCOURT',pet_crypt:'AMB_PETSTORE',kush_crypt:'AMB_DISPENSARY',kush_back:'AMB_DISPENSARY',cafe:'AMB_CAFE_RAIN',catacomb:'AMB_CATACOMB',catacomb_dead:'AMB_CATACOMB',blood_bank:'AMB_BLOODBANK',armory:'AMB_ARMORY',ballroom:'AMB_BALLROOM',duchess_castle:'AMB_SOIREE',peking_naija:'AMB_RESTAURANT',naija_mart:'AMB_AFRICAN_STORE',naija_lot:'AMB_AFRICAN_STORE',brunch:'AMB_BRUNCH',onsen:'AMB_ONSEN',little_tokyo:'AMB_LITTLE_TOKYO',hollow_bowl:'AMB_CONCERT',taco_truck:'AMB_TACO_TRUCK',tristan_apt:'AMB_APARTMENT_LAN',lan_night:'AMB_APARTMENT_LAN',gallery:'AMB_GALLERY',waffle_haven:'AMB_DINER_ATL',atl_airport:'AMB_AIRPORT',lennox:'AMB_MALL_ATL',centennial:'AMB_PARK_FOUNTAIN',family_house:'AMB_FAMILY_HOUSE',salon:'AMB_SALON',portobello_office:'OFFICE_ROOM',portobello_porch:'SUBURB_MORNING',pier:'AMB_PIER',slurp:'AMB_RAMEN',garage:'AMB_GARAGE',venice:'AMB_COURTS'};
 function environment(a,id,rain){a.clear();if(environments[id])a.sound(environments[id]);if(rain)a.sound('AMB_RAIN');}
 const enemy={bonesworth:{cleave:'EN_SWORD',bash:'EN_SHIELD',rattle:'EN_BONES',death_charge:'EN_CHARGE'},paladin:{swing:'EN_SWORD',shield:'EN_SHIELD'},kevins:{poke:'EN_POOF',honor:'EN_POOF'},phil:{beam:'EN_SCREAM'},hilt:{jab:'EN_STAKE',lunch:'EN_LUNCHBOX'},hilt_rematch:{jab:'EN_STAKE',lunch:'EN_LUNCHBOX'},lil_smack:{chew:'EN_CHEW',crumb:'EN_CHEW'},bard:{cover:'EN_LUTE',strum:'EN_LUTE'},bruce_loose:{flurry:'EN_KIAI',kick:'EN_KIAI'},werewolf:{howl:'EN_HOWL',swipe:'EN_HOWL'}};
 function combat(a,enemyId,ev){if(ev.kind==='enemy'&&enemy[enemyId]?.[ev.move])a.sound(enemy[enemyId][ev.move]);if(ev.kind==='telegraph'&&enemyId==='phil')a.sound('EN_CHARGE');else if(ev.kind!=='telegraph')a.stop('EN_CHARGE');if(ev.kind!=='enemy')a.stop('EN_CHEW');}
 function action(a,action){if(action.type==='item')a.sound(action.id==='sapporo'?'ITEM_CAN':action.id==='boba'?'ITEM_SLURP':'ITEM_EAT');if(action.type==='hoe')a.sound('COMPANION_CALL');}
 function voice(a,speaker,opts={}){if(!speaker)return;const ghost=window.RABtfPeople?.get(speaker)?.species==='ghost'||['wispa','nightshade'].includes(speaker);const id=speaker==='rich'?'UI_TEXT_BLIP_RICH':ghost?'UI_TEXT_BLIP_GHOST':opts.voice==='low'||speaker==='octopus_sensei'?'UI_TEXT_BLIP_NPC_LOW':opts.voice==='high'||speaker.startsWith('portobello_kid')?'UI_TEXT_BLIP_NPC_HIGH':'UI_TEXT_BLIP_NPC_MID';a.sound(id);}
 // These keys name accepted OPEN story nodes; sealed hooks have no entry.
 const beats={
  'A00:floor':['LADDER_CREAK'],'A00:try2':['LADDER_CREAK'],'A00:try3':['LADDER_CREAK'],
  'A00:fall1':['LADDER_COLLAPSE'],'A00:fall2':['LADDER_COLLAPSE'],'A00:fall3':['LADDER_COLLAPSE'],'A00:sensei':['SENSEI_RUMBLE'],
  'A09:lower':['RECORD_SCRATCH'],'A09:back':['EGG_REVEAL'],'A11:crack':['EGG_CRACK'],'A11:sneeze':['DRAGON_FIRE_SMALL'],
  'A14:arrive':['MIC_FEEDBACK'],'A14:result':['CROWD_OOH'],'SHOW:result':['CROWD_OOH'],
  'A16:wispa2':['LAPTOP_TYPING'],'A16:end':['HOOK_COOKED'],'A18:arrive':['NINJA_CROWD'],
  'A23:arrive':['HEAVY_STEPS'],'A24:explain':['HOLY_CHOIR_COMEDIC'],
  'A28:turn':['MALL_GATE','EN_HOWL'],'A30:wake':['ALARM_CLOCK'],'A30:approve':['POLITE_APPLAUSE'],'A30:wakeup':['WAKE_SCREAM'],
  'A31:stars':['STARS_SHIMMER'],'A32:night':['TRANSFORM_BLOOM'],'A41:drive':['CAR_WINDOWS_DOWN'],
  'A47:arrive':['SNEEZE'],'A50:xcom':['XCOM_MISS'],'A52:trick':['KIDS_HALLOWEEN'],'A57:stop':['SIREN_CHIRP']
 };
 function beat(a,adventure,node){if(['A14','SHOW'].includes(adventure)&&node==='result'){const vars=window.RAAdventures?.active?.()?.vars;if(vars?.showOutcome!=='success'||!(Number(vars.pay)>0))return;}for(const id of beats[`${adventure}:${node}`]||[])a.sound(id);}
 // Only unavailable authored-scene hooks are routed by the review tour, per Ube's explicit ruling.
 const reserved=['GRILL_LAND','TONGS','SIZZLE_PERFECT','CHAR_CRACKLE','SMOKE_HISS','AMB_KBBQ','AMB_HOTSPRING_OUT'];
 window.RAOpenAudio={scope,environment,combat,action,voice,beat,environments,enemy,beats,reserved};
})();
