(function(){
 'use strict';
 // F02 IRON & GRACE — weapon registry + ownership/equip/mod/use contracts (IF-1 4B/4E/4M facing).
 // Authority: Rich_Alucard_Patch_IRON_AND_GRACE_Guns.docx. Authored stats live in RAIronCatalog and are never scaled
 // here; only mods apply modifiers, and every non-authored number is in RAIronCatalog.TUNABLES (owner F13).
 //
 // Ownership rides the ACCEPTED life.ownership.guns record (RALife.hasGun/addGun) so the accepted Armory adventure and
 // Combat 2.0 loader keep working unchanged. Everything F02-only (equip, mods, engravings, Range Day, Trap, acquisition
 // metadata) lives lazily in save.frag.F02 and is never written while every F02 flag is OFF.
 const C=window.RAIronCatalog;
 if(!C)throw new Error('F02 registry must load after js/frag/F02/catalog.js');
 const F=()=>window.RAIronFlags;
 const T=C.TUNABLES;
 const clone=v=>JSON.parse(JSON.stringify(v));
 const frag=()=>window.RAFrag;
 const state=()=>frag().get('F02');
 const patch=(path,value)=>frag().patch('F02',path,value);
 const coreOn=()=>!!F()?.core();
 const life=()=>window.RALife?.life?.()||{ownership:{guns:[]}};
 const ownedIds=()=>(life().ownership?.guns||[]).map(g=>g.id);
 const money=()=>window.RALife?.money?.()??0;
 const day=()=>window.RALife?.today?.().day??0;

 // ---- catalog access ----
 const catalog=()=>C;
 const guns=()=>C.list();
 const gun=id=>C.byId(id);
 const mods=()=>C.mods();
 const mod=id=>C.MODS[id]||null;

 // ---- ownership ----
 const owns=id=>!!gun(id)&&window.RALife.hasGun(id);
 const ownedGuns=()=>ownedIds().map(id=>gun(id)).filter(Boolean);
 const acquisitionOf=id=>state().acquired?.[id]||null;
 function grant(id,{source='grant',free=false}={}){
  const def=gun(id);if(!def)throw new Error(`IRON & GRACE: unknown gun ${id}`);
  if(window.RALife.hasGun(id))return {ok:false,reason:'owned'};
  if(!free&&def.price!=null&&money()<def.price)return {ok:false,reason:'funds'};
  const spend=()=>{if(free||def.price==null)return true;return !!window.RALife.spend(def.price);};
  const tagged=window.RAMoneyLedger?.withSource?window.RAMoneyLedger.withSource(`iron_and_grace:${source}`,spend):spend();
  if(!tagged)return {ok:false,reason:'funds'};
  if(!window.RALife.addGun(id))return {ok:false,reason:'owned'};
  patch(`acquired.${id}`,{day:day(),source});
  return {ok:true,gun:def};
 }
 function buy(id){const def=gun(id);if(!def)throw new Error(`IRON & GRACE: unknown gun ${id}`);
  if(def.dev)return {ok:false,reason:'dev'};
  const kind=def.acquisition.kind;
  if(kind==='armory'||kind==='armory_glass_case'||kind==='tandem_then_armory'||kind==='jollof_wars_then_armory')return grant(id,{source:'armory'});
  if(kind==='naija_mart')return grant(id,{source:'naija_mart'});
  return {ok:false,reason:'acquisition-gated',fragment:def.acquisition.fragment||null};
 }

 // ---- equip / loadout ----
 function slots(){const rooms=life().ownership?.castleRooms||[];return rooms.some(r=>(r.id||r)==='armory_wall')?2:1;}
 const equipped=()=>state().equipped;
 const loadout=()=>{const l=(state().loadout||[]).filter(id=>owns(id));return l.length?l.slice(0,slots()):[].concat(equipped()&&owns(equipped())?[equipped()]:[],ownedIds().filter(id=>gun(id)&&!gun(id).native)).slice(0,slots());};
 function equip(id){
  if(!gun(id))return {ok:false,reason:'unknown'};
  if(!owns(id))return {ok:false,reason:'not-owned'};
  const prev=equipped();patch('equipped',id);patch('loadout',[id,...loadout().filter(x=>x!==id)].slice(0,slots()));
  const bonus=bonuses(id);
  if(bonus.clout&&prev!==id){window.RALife.addPoints('clout',bonus.clout);}
  if(hasMod(id,'gold_plating'))notifyGold(id);
  return {ok:true,equipped:id,bonus};
 }

 // ---- mods ----
 const modsOwned=()=>Object.keys(state().modsOwned||{}).filter(id=>state().modsOwned[id]);
 const modsFor=id=>(state().mods||{})[id]||[];
 const hasMod=(id,modId)=>modsFor(id).includes(modId);
 function canMod(id,modId){
  if(!gun(id)||!mod(modId))return {ok:false,reason:'unknown'};
  if(!owns(id))return {ok:false,reason:'not-owned'};
  if(hasMod(id,modId))return {ok:false,reason:'already-equipped'};
  if(modsFor(id).length>=T.maxModsPerGun)return {ok:false,reason:'max-mods'};
  return {ok:true};
 }
 function buyMod(modId,{useDiscount=false}={}){
  const m=mod(modId);if(!m)return {ok:false,reason:'unknown'};
  if(state().modsOwned?.[modId])return {ok:false,reason:'owned'};
  let price=m.price,usedDiscount=false;
  const tokens=discountTokens();
  if(useDiscount&&tokens>0){price=Math.max(0,Math.round(price*(1-T.range.medalDiscount)));usedDiscount=true;}
  if(money()<price)return {ok:false,reason:'funds',price};
  const spend=()=>!!window.RALife.spend(price);
  const ok=window.RAMoneyLedger?.withSource?window.RAMoneyLedger.withSource(`iron_grace:mod:${modId}`,spend):spend();
  if(!ok)return {ok:false,reason:'funds',price};
  if(usedDiscount)patch('stats.discountsUsed',(state().stats?.discountsUsed||0)+1);
  patch(`modsOwned.${modId}`,true);
  return {ok:true,price,discount:usedDiscount?T.range.medalDiscount:0};
 }
 function attachMod(gunId,modId){
  const check=canMod(gunId,modId);if(!check.ok)return check;
  if(!state().modsOwned?.[modId])return {ok:false,reason:'not-owned'};
  patch(`mods.${gunId}`,[...modsFor(gunId),modId]);
  if(modId==='gold_plating'&&equipped()===gunId)notifyGold(gunId);
  return {ok:true,gunId,mod:modId};
 }
 function detachMod(gunId,modId){
  const list=modsFor(gunId);if(!list.includes(modId))return {ok:false,reason:'not-equipped'};
  patch(`mods.${gunId}`,list.filter(x=>x!==modId));return {ok:true,gunId,mod:modId};
 }
 // One Range Day medal = one mod discount (authored: "a range medal per gun ... unlocks one mod discount").
 const discountTokens=()=>Math.max(0,medalCount()-(state().stats?.discountsUsed||0));
 const medalCount=()=>Object.values(state().medals||{}).filter(Boolean).length;
 function engrave(gunId,name){
  if(!owns(gunId))return {ok:false,reason:'not-owned'};
  if(!hasMod(gunId,'custom_engraving'))return {ok:false,reason:'no-engraving-mod'};
  const text=String(name||'').trim().slice(0,24);
  if(!text)return {ok:false,reason:'empty'};
  patch(`engravings.${gunId}`,text);return {ok:true,gunId,name:text};
 }
 const engravedName=gunId=>state().engravings?.[gunId]||null;

 // ---- resolution (authored stats + mod modifiers) ----
 function bonuses(gunId){
  const m=modsFor(gunId);const out={clout:0,ammo:0,vsVampireUndead:0,rangeAim:0,conceal:false,cosmetic:false,showdownOnly:[]};
  for(const id of m){const def=mod(id);if(!def)continue;
   if(def.clout)out.clout+=def.clout;
   if(def.ammoBonus)out.ammo+=def.ammoBonus;
   if(def.vsVampireUndead)out.vsVampireUndead+=def.vsVampireUndead;
   if(def.rangeAim)out.rangeAim+=def.rangeAim;
   if(def.conceal)out.conceal=true;
   if(def.cosmetic)out.cosmetic=true;
   if(def.showdownOnly)out.showdownOnly.push(id);}
  return out;
 }
 function effectiveAmmo(gunId){const g=gun(gunId);if(!g)return 0;if(g.menu?.infinite)return Infinity;
  let ammo=g.menu?.ammo;if(ammo==null&&g.menu?.provisionalAmmo)ammo=T.provisionalAmmo[gunId]??1;
  return (ammo??1)+bonuses(gunId).ammo;}
 function displayName(gunId){return engravedName(gunId)||gun(gunId)?.label||gunId;}
 function resolve(gunId){
  const g=gun(gunId);if(!g)return null;
  const b=bonuses(gunId);
  return {gun:g,bonuses:b,label:displayName(gunId),menu:{...g.menu},showdown:{...g.showdown},mods:modsFor(gunId)};
 }

 // ---- per-fight ammo (refills every fight: state is recreated by Combat 2.0 create) ----
 function ammoFor(s,gunId){if(!s)return effectiveAmmo(gunId);if(!s.__iagAmmo)s.__iagAmmo={};
  if(s.__iagAmmo[gunId]===undefined)s.__iagAmmo[gunId]=effectiveAmmo(gunId);return s.__iagAmmo[gunId];}
 function conditionOk(gunId){const c=gun(gunId)?.menu?.condition;if(!c)return true;
  if(c.flag)return !!window.RALife?.flag?.(c.flag);return true;}
 function canFire(s,gunId){if(!owns(gunId))return false;if(!conditionOk(gunId))return false;
  return gun(gunId)?.menu?.infinite?true:ammoFor(s,gunId)>0;}
 function consumeAmmo(s,gunId){if(gun(gunId)?.menu?.infinite)return;
  s.__iagAmmo=s.__iagAmmo||{};s.__iagAmmo[gunId]=Math.max(0,ammoFor(s,gunId)-1);}

 // fire(s,gunId,helpers) — the shared authored shot. `helpers` is RACombat2Ext's helper bag, or a test double.
 // Applies every menu-authored effect plus mods. Showdown-only mods (scope/silencer) are deliberately inert here.
 function fire(s,gunId,helpers){
  const r=resolve(gunId);if(!r)return {ok:false,reason:'unknown'};
  if(!canFire(s,gunId))return {ok:false,reason:conditionOk(gunId)?'out-of-ammo':'locked'};
  const menu=r.menu;consumeAmmo(s,gunId);
  if(r.gun.audio){window.RAAudio?.oneShot?.(r.gun.audio);
   const sound=window.RAAudioManifest?.get?.(r.gun.audio);
   if(sound?.type==='loop')setTimeout(()=>window.RAAudio?.stop?.(r.gun.audio,0),(sound.loopEnd||0)*1000);
  }
  const say=helpers?.say||(()=>{});
  say(s,`GUN WEAVING: ${r.label}.`,'weird',{fx:'gun',gun:gunId});
  let base=(menu.dmg||0)*(1+(s.rich?.gunBonus||0));
  const enemy=helpers?.E?helpers.E(s):null;
  if(menu.vsUndead&&enemy?.undead)base*=menu.vsUndead;
  if(r.bonuses.vsVampireUndead&&(enemy?.undead||enemy?.vampire))base*=1+r.bonuses.vsVampireUndead;
  if(menu.turn1Crit&&s.turn===1)base*=menu.turn1Crit;
  // +10% per consecutive turn fired (THE TOMMY TONY): tracked on the fight state.
  s.__iagStreak=(s.__iagStreak||{});const streak=(s.__iagStreak[gunId]||0)+1;s.__iagStreak[gunId]=streak;
  if(menu.consecutive&&streak>1)base*=1+menu.consecutive*(streak-1);
  const sure=!!menu.sure;
  let hit=true;
  if(!sure&&helpers?.rollHit)hit=helpers.rollHit(s);
  if(!hit){say(s,'MISSED.','miss');if(helpers?.endPlayer)helpers.endPlayer(s);return {ok:true,hit:false,spent:true,gunId};}
  const hits=menu.hits||1;
  let total=0;
  if(helpers?.damageToEnemy)total=helpers.damageToEnemy(s,base,{hits,label:r.label,crit:!sure})||0;
  if(menu.healPerShot&&s.rich){s.rich.hp=helpers?.clampHp?helpers.clampHp(s.rich.hp+menu.healPerShot,s.rich.max):s.rich.hp+menu.healPerShot;say(s,`+${menu.healPerShot} HP.`,'heal',{target:'rich'});}
  if(menu.splash&&s.rich){s.rich.hp=Math.max(0,s.rich.hp-menu.splash);say(s,`RICH TAKES ${menu.splash} SPLASH.`,'hurt',{target:'rich'});}
  if(menu.suppress&&s.enemy){s.enemy.blind={amt:menu.suppress.accDown,turns:menu.suppress.turns};say(s,'THE ENEMY IS PINNED DOWN.','debuff');}
  if(menu.blind&&s.enemy){s.enemy.blind={amt:menu.blind.accDown,turns:menu.blind.turns};say(s,'THE GOLD IS BLINDING.','debuff');}
  if(menu.burn&&s.enemy){const b=menu.burn;(s.enemy.dot=s.enemy.dot||[]).push({amt:b.dmg,turns:b.turns,label:'BURNING'});say(s,'THE TARGET IS BURNING.','weird');}
  if(menu.knockback&&s.enemy&&s.__iagShowdown)s.enemy.skip=(s.enemy.skip||0)+menu.knockback;
  if(menu.fear&&s.enemy&&s.__iagFearNaija)s.enemy.skip=(s.enemy.skip||0)+1;
  if(menu.heat)try{window.RAHeat?.add?.(menu.heat,{source:'iron_grace:rpg'});}catch(e){}
  if(helpers?.endPlayer)helpers.endPlayer(s,{fx:'gun'});
  return {ok:true,hit:true,spent:true,gunId,damage:total,effects:{suppress:!!menu.suppress,blind:!!menu.blind,burn:!!menu.burn,destroysCover:!!menu.destroysCover,heat:menu.heat||0}};
 }

 // ---- Range Day rewards ----
 function awardRange(gunId,score){
  if(!gun(gunId))return {ok:false,reason:'unknown'};
  const th=T.range.thresholds;
  const medal=score>=th.gold?'gold':score>=th.silver?'silver':score>=th.bronze?'bronze':null;
  const prev=state().range?.[gunId]||{best:0,attempts:0,cleared:false,story:false};
  const next={best:Math.max(prev.best,score),attempts:(prev.attempts||0)+1,cleared:prev.cleared||!!medal,story:prev.story||!!medal};
  patch(`range.${gunId}`,next);
  const newMedal=medal&&!state().medals?.[gunId];
  if(newMedal)patch(`medals.${gunId}`,medal);
  if(score>prev.best)patch(`stats.rangeBest`,score);
  return {ok:true,gunId,score,medal,newMedal,cleared:next.cleared,story:next.story,storyTitle:storyTitle(gunId),discounts:discountTokens()};
 }
 const storyTitle=gunId=>`CLEANED THE RANGE WITH THE ${(gun(gunId)?.label||gunId).replace(/\s*—.*/,'').toUpperCase()}`;
 // range story crit bonus is authored as "+10% crit"; exposed for the local combat resolution and F01.
 const storyCrit=gunId=>state().range?.[gunId]?.story?T.range.storyCritBonus:0;

 // ---- gold-plating notice (VampGram) ----
 function notifyGold(gunId){
  if(!hasMod(gunId,'gold_plating'))return;
  try{window.RAVampGram?.post?.({id:`iron_grace:gold:${gunId}:${day()}`,handle:'richalucard',text:`the ${displayName(gunId).toLowerCase()} came back gold. deacon brass said nothing. he did not have to.`,likes:12});}catch(e){}
  patch('seen.goldNotice',true);
 }

 // ---- TRAP-facing weapon API (assign guns to lookouts; F04/F05 bind later) ----
 const trap={
  assign(ownerId,gunId){if(!ownerId)return {ok:false,reason:'owner'};if(gunId!=null&&!gun(gunId))return {ok:false,reason:'unknown-gun'};
   patch(`trap.${ownerId}`,gunId);return {ok:true,owner:ownerId,gun:gunId||null};},
  owner:ownerId=>state().trap?.[ownerId]||null,
  clear(ownerId){const all={...(state().trap||{})};delete all[ownerId];patch('trap',all);return {ok:true};},
  list:()=>Object.entries(state().trap||{}).map(([owner,gunId])=>({owner,gun:gunId,resolved:resolve(gunId)})),
  // Door-holding turns are NOT simulated here (F04/F05): expose the authored rule as data only.
  holdTurns:()=>[1,2], pending:'F04/F05 — traphouse lookup door-hold is not simulated'
 };

 // ---- Showdown-facing data (F01_INTEGRATION_PENDING: no combat is implemented) ----
 const showdown={
  pending:'F01_INTEGRATION_PENDING — SHOWDOWN_CORE is not frozen; F02 ships data/contracts only',
  stats:gunId=>{const g=gun(gunId);return g?{...g.showdown,mods:modsFor(gunId),bonuses:bonuses(gunId)}:null;},
  // Per-gun class affinity is authored in prose; F02 does not invent a class table.
  classNote:gunId=>{const g=gun(gunId);return g?.showdown?.note||null;},
  roster:()=>guns().filter(g=>!g.dev).map(g=>({id:g.id,showdown:g.showdown})),
  enemies:()=>C.ENEMY_GUNS.map(e=>({...e}))
 };

 // ---- authored firearm feedback/FX hooks (caller binding is an integration seam) ----
 const FX_FAMILY={pocket_pistol:'small',double_barrel:'heavy',smg:'auto',rifle:'rifle','drum-mag_vintage_smg':'auto',hand_cannon:'heavy',
  flamethrower:'fire','dragon-fire_rifle':'fire',launcher:'explosive',thrown:'soft',legendary:'gold',dev:'dev'};
 const familyFor=g=>FX_FAMILY[String(g?.type||'').toLowerCase().replace(/\s+/g,'_')]||'small';
 function feedback(gunId,phase='fire'){
  const g=gun(gunId);if(!g)return null;
  const family=familyFor(g);
  return {gun:gunId,phase,audio:g.audio||null,family,
   recoil:phase==='fire',casings:phase==='fire'&&['small','auto','rifle'].includes(family),
   shake:['heavy','explosive','fire'].includes(family),muzzle:family,requiresCaller:true};
 }

 function describe(){return {version:this.version,core:coreOn(),owned:ownedIds().filter(id=>!!gun(id)),equipped:equipped(),
  loadout:loadout(),modsOwned:modsOwned(),guns:list_(),medals:{...state().medals},discountTokens:discountTokens(),
  trap:trap.list().length,showdownPending:showdown.pending};}
 const list_=()=>guns().map(g=>({id:g.id,label:g.label,owned:owns(g.id),rarity:g.rarity,native:!!g.native,mods:modsFor(g.id),ammo:effectiveAmmo(g.id)}));

 window.RAIronAndGrace={version:'1.0.0',catalog,guns,gunsList:list_,gun,mods,mod,owns,ownedGuns,grant,buy,
  equip,equipped,loadout,slots,modsOwned,modsFor,hasMod,canMod,buyMod,attachMod,detachMod,engrave,engravedName,displayName,
  bonuses,effectiveAmmo,resolve,ammoFor,consumeAmmo,canFire,conditionOk,fire,conditionOkFlag:conditionOk,
  awardRange,storyTitle,storyCrit,discountTokens,medalCount,acquisitionOf,
  trap,showdown,feedback,describe,flags:F};
})();
