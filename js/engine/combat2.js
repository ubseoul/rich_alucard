(function(){
 // COMBAT 2.0 rules (VOL 1 §9.13, VOL 3). Pure: no DOM, injectable RNG. Menu-only, no timing.
 // Enemies TELEGRAPH next intent one turn early; preparation (fits, items, companions, guns, rooms) beats grinding.
 const D=()=>window.RACombatData;
 const clampHp=(v,max)=>Math.max(0,Math.min(max,Math.round(v)));
 function loadout(){
  const life=window.RAState?.get?.().life;const L=window.RALife;if(!life)return {maxHp:100,moves:['blood','octopus','bite','revenge'],items:{},guns:[],fits:[],rooms:[],companions:[]};
  const fits=Object.values(life.ownership.fits?.equipped||{}).map(id=>D().FITS[id]).filter(Boolean);
  const rooms=(life.ownership.castleRooms||[]).map(r=>r.id);
  const slots=1+(rooms.includes('armory_wall')?1:0);
  const guns=(life.ownership.guns||[]).map(g=>g.id).filter(id=>D().GUNS[id]&&(!D().GUNS[id].dev||L?.flag?.('devKratos'))).slice(-slots);
  let maxHp=100+(rooms.includes('coffin_upgrade')?20:0)+fits.reduce((s,f)=>s+(f.maxhp||0),0);
  return {maxHp,moves:[...(life.combat.equippedMoves||['blood','octopus','bite','revenge'])].slice(0,4),items:{...life.ownership.items},guns,fits,rooms,companions:window.RARelations?.companions?.()||[]};
 }
 function create(enemyId,params={},lo=loadout(),rng=Math.random){
  const e=D().ENEMIES[enemyId];if(!e)throw new Error(`unknown enemy ${enemyId}`);
  const def=Math.min(.4,lo.fits.reduce((s,f)=>s+(f.def||0),0));
  const s={enemyId,params,rng,turn:1,over:false,outcome:null,log:[],
   enemy:{name:params.name||e.name,hp:params.hp||e.hp,max:params.hp||e.hp,step:0,queue:[],charge:0,skip:0,stun:0,weaken:null,guard:0,dot:[],enraged:0,gossip:1,intel:0,reflect:false,evade:false,boss:!!e.boss,below50Used:false,minions:e.minions||0,invincible:!!params.invincible},
   rich:{hp:lo.maxHp,max:lo.maxHp,def,crit:.08+lo.fits.reduce((a,f)=>a+(f.crit||0),0),acc:.95+lo.fits.reduce((a,f)=>a+(f.acc||0),0),accDown:null,weak:null,block:0,stun:0,buffNext:1,doubleNext:false,sureNext:false,guardHits:0,shield:0,revenge:lo.rooms.includes('hookah_roof')?10:0,revengeDouble:false,extraTurn:false,
    pp:Object.fromEntries(lo.moves.map(id=>[id,D().MOVES[id]?.pp||8])),charismaFree:lo.fits.some(f=>f.charisma),gunBonus:lo.fits.reduce((a,f)=>a+(f.gun||0),0)},
   moves:lo.moves.filter(id=>D().MOVES[id]),items:{...lo.items},guns:lo.guns.map(id=>({id,ammo:D().GUNS[id].ammo})),companions:lo.companions,hoesUsed:{},itemsUsed:{},octopusUsed:false,companionHurt:[]};
  s.telegraph=telegraphFor(s);return s;
 }
 const E=s=>D().ENEMIES[s.enemyId];
 function say(s,text,kind='info',extra={}){s.log.push({text,kind,...extra});}
 function nextMoveId(s){const e=E(s);if(s.enemy.queue.length)return s.enemy.queue[0];return e.pattern[s.enemy.step%e.pattern.length];}
 function telegraphFor(s){const e=E(s);if(e.noTelegraph)return null;const mv=e.moves[nextMoveId(s)];if(s.enemy.intel>0)return `${e.name} WILL USE ${mv.label}.`;return mv.telegraph||null;}
 function roll(s,p){return s.rng()<p;}
 function damageToEnemy(s,base,{pierce=false,hits=1,label='',crit=true}={}){
  let total=0;const e=s.enemy;
  for(let h=0;h<hits;h++){
   let dmg=base*s.rich.buffNext*(s.rich.weak?.mult||1)*e.gossip;if(!pierce&&e.guard)dmg*=1-e.guard;
   let isCrit=crit&&roll(s,s.rich.crit);if(isCrit)dmg*=1.5;dmg+=Math.floor(s.rng()*5)-2;dmg=Math.max(1,Math.round(dmg));
   if(e.invincible){say(s,`${e.name} IS INVINCIBLE WHILE CHARGING.`,'block');return 0;}
   e.hp=clampHp(e.hp-dmg,e.max);total+=dmg;say(s,`${label?label+': ':''}${dmg} DAMAGE${isCrit?' (CRIT)':''}.`,'hit',{target:'enemy',amount:dmg,heavy:dmg>=e.max*.2});
  }
  s.rich.buffNext=1;return total;
 }
 function rollHit(s){const acc=s.rich.acc-(s.rich.accDown?.amt||0);if(s.rich.sureNext){s.rich.sureNext=false;return true;}return roll(s,acc);}
 // ---- player actions ----
 function act(s,action){
  if(s.over)return s;s.log=[];
  if(s.rich.stun>0){s.rich.stun--;say(s,'RICH IS PINNED. HE LOSES THE TURN.','block');return endPlayer(s);}
  const t=action.type;
  if(t==='move'){
   const mv=D().MOVES[action.id];if(!mv||!(s.rich.pp[action.id]>0)){say(s,'NO PP LEFT.','block');return s;}
   s.rich.pp[action.id]--;
   if(action.id==='octopus'){say(s,'OCTOPUS BRAIN.','weird');s.awaitingOctopus=true;return s;}
   if(action.id==='revenge'){let amt=s.rich.revenge*(s.rich.revengeDouble?2:1);s.rich.revenge=0;s.rich.revengeDouble=false;if(!amt){say(s,'NOTHING TO RETURN.','info');}else{s.enemy.hp=clampHp(s.enemy.hp-amt,s.enemy.max);say(s,`REVENGE: ${amt} DAMAGE REFLECTED.`,'hit',{target:'enemy',amount:amt,heavy:amt>=s.enemy.max*.2,fx:'revenge'});}return endPlayer(s);}
   if(mv.effect){applyMagic(s,mv);return endPlayer(s);}
   const times=s.rich.doubleNext?2:1;s.rich.doubleNext=false;
   for(let i=0;i<times;i++){
    if(!rollHit(s)){say(s,`${mv.label} MISSED.`,'miss');continue;}
    let base=mv.base;if(action.id==='blood'&&s.enemy.minions>1)base=mv.base; // aoe flavor: minion swarms take full hits
    damageToEnemy(s,base,{pierce:!!mv.pierce,label:mv.label,crit:true});
    if(mv.heal){s.rich.hp=clampHp(s.rich.hp+mv.heal,s.rich.max);say(s,`+${mv.heal} HP.`,'heal',{target:'rich',amount:mv.heal});}
   }
   return endPlayer(s,{fx:action.id});
  }
  if(t==='octopus'){
   const opt=E(s).octopus?.[action.option];s.awaitingOctopus=false;if(!opt)return endPlayer(s);
   let success=true;
   if(opt.requires&&!(s.items[opt.requires]>0)){success=false;say(s,`YOU NEED ${opt.requires.toUpperCase()} FOR THAT.`,'block');}
   else if(opt.below&&s.enemy.hp>s.enemy.max*opt.below){success=false;say(s,'HE IS NOT READY TO HEAR IT.','block');}
   else if(action.option==='charisma'&&s.rich.charismaFree){s.rich.charismaFree=false;}
   else if(opt.result==='spared'&&!opt.requires){const r=1+Math.floor(s.rng()*20);success=r>=9;say(s,`${action.option.toUpperCase()} CHECK · NEED 9 · ROLLED ${r}`,'roll');}
   if(!success){say(s,'IT DID NOT LAND.','miss');return endPlayer(s);}
   say(s,opt.text,'weird');s.octopusUsed=action.option;
   if(opt.requires)s.items[opt.requires]--;
   if(opt.learn)s.learned=opt.learn;if(opt.recruit)s.recruited=true;
   if(opt.result==='spared'||opt.result==='tame'){s.over=true;s.outcome='spared';return s;}
   if(opt.result==='skip')s.enemy.skip+=opt.turns||1;
   if(opt.result==='damage'){s.enemy.hp=clampHp(s.enemy.hp-(opt.amount||20),s.enemy.max);if(s.enemy.minions)s.enemy.minions=Math.max(1,s.enemy.minions-10);say(s,`${opt.amount} DAMAGE.`,'hit',{target:'enemy',amount:opt.amount});}
   if(opt.result==='enrage'){s.enemy.enraged=1.25;}
   return endPlayer(s);
  }
  if(t==='gun'){
   const g=s.guns.find(x=>x.id===action.id)||s.guns[0];if(!g||g.ammo<=0){say(s,'OUT OF AMMO.','block');return s;}
   const G=D().GUNS[g.id];g.ammo--;say(s,`GUN WEAVING: ${G.label}.`,'weird',{fx:'gun'});
   let base=G.dmg*(1+s.rich.gunBonus);if(G.vsUndead&&E(s).undead)base*=G.vsUndead;if(G.turn1Crit&&s.turn===1)base*=G.turn1Crit;
   if(!G.sure&&!rollHit(s)){say(s,'MISSED.','miss');return endPlayer(s);}
   damageToEnemy(s,base,{hits:G.hits||1,label:G.label,crit:!G.sure});
   if(G.healPerShot){s.rich.hp=clampHp(s.rich.hp+G.healPerShot,s.rich.max);say(s,`+${G.healPerShot} HP.`,'heal',{target:'rich'});}
   if(G.splash){s.rich.hp=clampHp(s.rich.hp-G.splash,s.rich.max);say(s,`RICH TAKES ${G.splash} SPLASH.`,'hurt',{target:'rich'});}
   return endPlayer(s,{fx:'gun'});
  }
  if(t==='item'){
   const it=D().ITEMS[action.id];if(!it||!(s.items[action.id]>0)){say(s,'NONE LEFT.','block');return s;}
   if(it.oncePerFight&&s.itemsUsed[action.id]){say(s,'ONCE PER FIGHT.','block');return s;}
   s.items[action.id]--;s.itemsUsed[action.id]=(s.itemsUsed[action.id]||0)+1;say(s,`RICH USES ${it.label}.`,'item');
   if(it.healFull){s.rich.hp=s.rich.max;say(s,'FULL HEAL.','heal',{target:'rich'});}
   if(it.heal){s.rich.hp=clampHp(s.rich.hp+it.heal,s.rich.max);say(s,`+${it.heal} HP.`,'heal',{target:'rich'});}
   if(it.accDown)s.rich.accDown={amt:it.accDown,turns:1};
   if(it.pp)for(const k of Object.keys(s.rich.pp))s.rich.pp[k]+=it.pp;
   if(it.cleanse){s.rich.accDown=null;s.rich.weak=null;s.rich.stun=0;say(s,'DEBUFFS CLEARED.','heal');}
   if(it.vsVampire){if(E(s).vampire){damageToEnemy(s,it.vsVampire,{label:'GARLIC',crit:false});}else say(s,"IT'S JUST BREAD. HE EATS IT.",'info');}
   if(it.roostFire){if(s.companions.some(c=>c.id==='mazda_dragon')){damageToEnemy(s,it.roostFire,{label:'MAZDA FIRE PASS',crit:false});}else say(s,'MAZDA IS NOT ON THE ROOST.','info');}
   if(it.double)s.rich.doubleNext=true;
   if(it.feedsEaters&&E(s).eats){say(s,`${E(s).name} SMELLS HOME. KEEP FIGHTING, OR SIT DOWN AND EAT?`,'weird');if(roll(s,.7)){say(s,'THEY SIT DOWN AND EAT.','weird');s.over=true;s.outcome='spared';return s;}say(s,'THEY KEEP FIGHTING. RESPECT.','info');}
   return endPlayer(s);
  }
  if(t==='hoe'){
   const c=s.companions.find(x=>x.id===action.companion);const mv=c?.moves.find(m=>m.id===action.move);
   if(!c||!mv){return s;}if((s.hoesUsed[c.id]||0)>=2){say(s,`${c.name} ALREADY DID TWO THINGS.`,'block');return s;}
   s.hoesUsed[c.id]=(s.hoesUsed[c.id]||0)+1;say(s,`${c.name}: ${mv.label}!`,'hoe',{companion:c.id});applyHoe(s,c,mv);return endPlayer(s);
  }
  if(t==='run'){
   if(E(s).noRun||s.enemy.boss||s.params.noRun){say(s,"CAN'T RUN FROM THIS ONE.",'block');return endPlayer(s);}
   if(roll(s,.8)){say(s,'RICH LEAVES. CALMLY.','info');s.over=true;s.outcome='run';return s;}
   say(s,"DIDN'T GET AWAY.",'miss');return endPlayer(s);
  }
  return s;
 }
 function applyMagic(s,mv){const f=mv.effect,e=s.enemy;
  if(f.weaken){e.weaken={mult:f.weaken,turns:f.turns};say(s,`${mv.label}: ENEMY DEALS LESS DAMAGE.`,'weird');}
  if(f.block){s.rich.block+=f.block;say(s,`${mv.label}: THE NEXT HIT IS BLOCKED.`,'weird');}
  if(f.dot){e.dot.push({amt:f.dot,turns:f.turns,label:'A GHOST'});say(s,`${mv.label}: A GHOST JOINS THE FIGHT.`,'weird');}
  if(f.stun){if(e.boss&&!roll(s,f.bossChance)){say(s,`${mv.label}: IT DID NOT HOLD.`,'miss');}else{e.stun+=f.stun;say(s,`${mv.label}: STUNNED.`,'weird');}}
 }
 function applyHoe(s,c,mv){const e=s.enemy,r=s.rich;
  switch(mv.kind){
   case 'heal':r.hp=clampHp(r.hp+mv.amount,r.max);say(s,`+${mv.amount} HP.`,'heal',{target:'rich'});break;
   case 'heal_full':r.hp=r.max;say(s,'FULL HEAL.','heal',{target:'rich'});break;
   case 'heal_cleanse':r.hp=clampHp(r.hp+mv.amount,r.max);r.accDown=null;r.weak=null;say(s,`+${mv.amount} HP. CLEANSED.`,'heal',{target:'rich'});break;
   case 'regen':e.dot.push({amt:-mv.amount,turns:mv.turns,label:'IV DRIP'});break;
   case 'debuff':e.gossip=mv.mult||1.1;say(s,'THE ENEMY TAKES MORE DAMAGE NOW.','weird');break;
   case 'buff':r.buffNext=mv.mult||1.2;say(s,'RICH HITS HARDER NEXT TURN.','weird');break;
   case 'stun':damageToEnemy(s,mv.amount,{label:mv.label,crit:false});if(!e.boss&&roll(s,.95))e.stun++;break;
   case 'skip':if(e.boss&&!roll(s,.5))say(s,'IT DID NOT WORK ON A BOSS.','miss');else{e.skip++;say(s,'THE ENEMY WILL SKIP A TURN.','weird');}break;
   case 'skip_nonboss':if(e.boss)say(s,'BOSSES ARE IMMUNE.','miss');else e.skip++;break;
   case 'damage':damageToEnemy(s,mv.amount,{label:mv.label,crit:!!mv.crit});break;
   case 'damage_all':damageToEnemy(s,mv.amount,{label:mv.label,crit:false});break;
   case 'multi':damageToEnemy(s,mv.amount,{label:mv.label,hits:mv.hits||3,crit:false});break;
   case 'dot':damageToEnemy(s,mv.amount,{label:mv.label,crit:false});e.dot.push({amt:mv.dot,turns:mv.turns,label:mv.label});break;
   case 'double':r.doubleNext=true;say(s,"RICH'S NEXT MOVE HITS TWICE.",'weird');break;
   case 'guard':r.guardHits+=mv.hits||2;say(s,`${c.name} WILL TAKE THE NEXT ${mv.hits||2} HITS.`,'weird');break;
   case 'blind':e.blind={amt:.3,turns:2};say(s,'THE ENEMY CAN BARELY SEE.','weird');break;
   case 'weaken':e.weaken={mult:mv.mult||.8,turns:mv.turns||3};say(s,'THE ENEMY IS WEAKER.','weird');break;
   case 'cleanse_enemy':e.guard=0;e.enraged=0;say(s,'ENEMY BUFFS REMOVED.','weird');break;
   case 'cleanse':r.accDown=null;r.weak=null;r.stun=0;say(s,'DEBUFFS CLEARED.','heal');break;
   case 'drain':damageToEnemy(s,mv.amount,{label:mv.label,crit:false});r.hp=clampHp(r.hp+mv.amount,r.max);break;
   case 'reflect':e.reflect=true;say(s,"THE ENEMY'S NEXT MOVE WILL HIT ITSELF.",'weird');break;
   case 'maxhp':r.max+=mv.amount;r.hp+=mv.amount;say(s,`+${mv.amount} MAX HP THIS FIGHT.`,'heal');break;
   case 'shield':r.shield+=mv.amount;say(s,`${mv.amount} DAMAGE WILL BE ABSORBED.`,'weird');break;
   case 'evade':e.evade=true;say(s,'THE ENEMY WILL TARGET NOBODY.','weird');break;
   case 'dodge':r.block+=1;say(s,'RICH WILL DODGE THE NEXT HIT.','weird');break;
   case 'intel':e.intel=2;say(s,'INTEL: NEXT TWO MOVES REVEALED.','weird');break;
   case 'sure_hit':r.sureNext=true;say(s,"RICH'S NEXT MOVE CAN'T MISS.",'weird');break;
   case 'revenge_double':r.revengeDouble=true;say(s,'STORED REVENGE WILL DOUBLE.','weird');break;
   case 'armor_break':e.gossip=Math.max(e.gossip,1/(mv.mult||.85));say(s,'ENEMY DEFENSE DOWN.','weird');break;
   case 'followers':s.filming=(s.filming||0)+(mv.amount||40);say(s,'SHE IS FILMING.','weird');break;
   case 'money':s.subscribe=(s.subscribe||0)+(mv.amount||500);say(s,'SHE SENT A LINK.','weird');break;
   case 'extra_turn':r.extraTurn=true;say(s,'ONE MORE TURN.','weird');break;
   case 'xcom':if(roll(s,.5))damageToEnemy(s,mv.amount,{label:'XCOM SHOT',crit:false});else say(s,'95% CHANCE. MISSED. HE KNEW.','miss');break;
   default:say(s,'SOMETHING HAPPENED.','info');
  }
 }
 function endPlayer(s,extra={}){
  if(s.enemy.hp<=0){s.over=true;s.outcome='win';say(s,`${s.enemy.name} IS DOWN.`,'win');return s;}
  if(s.rich.extraTurn){s.rich.extraTurn=false;return s;}
  return enemyTurn(s);
 }
 function hurtRich(s,dmg,label){
  const r=s.rich;if(r.block>0){r.block--;say(s,'BLOCKED.','block');return 0;}
  if(r.guardHits>0){r.guardHits--;const c=s.companions.find(x=>x.moves.some(m=>m.kind==='guard'));if(c)s.companionHurt.push(c.id);say(s,`${c?.name||'SOMEONE'} TAKES IT.`,'block');return 0;}
  let d=dmg*(1-r.def)*(s.enemy.weaken?.mult||1)*(s.enemy.enraged||1)*(s.enemy.blind&&roll(s,s.enemy.blind.amt)?0:1);
  if(r.shield>0){const a=Math.min(r.shield,d);r.shield-=a;d-=a;}
  d=Math.max(0,Math.round(d));if(!d){say(s,`${label} MISSED.`,'miss');return 0;}
  const actual=Math.min(r.hp,d);r.hp-=actual;r.revenge+=actual;say(s,`RICH TOOK ${actual} DAMAGE.`,'hurt',{target:'rich',amount:actual,heavy:actual>=r.max*.2});return actual;
 }
 function enemyTurn(s){
  const e=s.enemy,def=E(s);
  // damage-over-time ticks
  for(const d of e.dot){if(d.amt<0){s.rich.hp=clampHp(s.rich.hp-d.amt,s.rich.max);say(s,`${d.label}: +${-d.amt} HP.`,'heal',{target:'rich'});}else{e.hp=clampHp(e.hp-d.amt,e.max);say(s,`${d.label}: ${d.amt} DAMAGE.`,'hit',{target:'enemy'});}d.turns--;}
  e.dot=e.dot.filter(d=>d.turns>0);
  if(e.hp<=0){s.over=true;s.outcome='win';say(s,`${e.name} IS DOWN.`,'win');return s;}
  if(!e.below50Used&&def.below50&&e.hp<=e.max*.5){e.below50Used=true;e.queue.push(...def.below50);}
  if(e.skip>0||e.stun>0){if(e.skip>0)e.skip--;else e.stun--;say(s,`${e.name} LOSES THE TURN.`,'info');return afterEnemy(s);}
  if(e.evade){e.evade=false;say(s,`${e.name} SWINGS AT NOBODY.`,'miss');advance(s);return afterEnemy(s);}
  const id=nextMoveId(s),mv=def.moves[id];
  if(mv.charge&&e.charge<mv.charge){e.charge++;say(s,`${e.name} IS CHARGING…`,'telegraph');if(e.charge>=mv.charge)e.readyCharge=true;return afterEnemy(s);}
  e.charge=0;advance(s);
  say(s,`${e.name}: ${mv.label}!`,'enemy',{move:id});
  if(e.reflect&&mv.dmg){e.reflect=false;e.hp=clampHp(e.hp-mv.dmg,e.max);say(s,`IT HITS ${e.name} INSTEAD. ${mv.dmg} DAMAGE.`,'hit',{target:'enemy'});return afterEnemy(s);}
  if(mv.heal){e.hp=clampHp(e.hp+mv.heal,e.max);say(s,`${e.name} RECOVERS ${mv.heal}.`,'heal',{target:'enemy'});}
  if(mv.healAlly){e.hp=clampHp(e.hp+mv.healAlly,e.max);say(s,`+${mv.healAlly} HP.`,'heal',{target:'enemy'});}
  if(mv.dmg){const hits=mv.hits||1;let minionScale=e.minions?Math.max(.2,e.minions/40):1;if(mv.id!=='poke')minionScale=1;for(let h=0;h<hits;h++)hurtRich(s,Math.max(1,Math.round(mv.dmg*minionScale)),mv.label);}
  const f=mv.effect||{};
  if(f.accDown){s.rich.accDown={amt:f.accDown,turns:f.turns||1};say(s,'RICH IS THROWN OFF. ACCURACY DOWN.','debuff');}
  if(f.selfBuff){s.rich.weak=null;e.enraged=1+f.selfBuff;}
  if(f.guard){e.guard=f.guard;say(s,`${e.name} RAISES A SHIELD.`,'info');}
  if(f.richWeak){s.rich.weak={mult:f.richWeak,turns:f.turns};say(s,"RICH IS DEMORALIZED. HE HITS SOFTER.",'debuff');}
  if(f.stunRich){s.rich.stun+=f.stunRich;say(s,'RICH IS PINNED.','debuff');}
  return afterEnemy(s);
 }
 function advance(s){if(s.enemy.queue.length)s.enemy.queue.shift();else s.enemy.step++;}
 function afterEnemy(s){
  const r=s.rich,e=s.enemy;
  if(r.hp<=0){s.over=true;s.outcome='lose';say(s,'RICH IS DOWN.','lose');return s;}
  if(e.hp<=0){s.over=true;s.outcome='win';return s;}
  for(const k of ['accDown','weak']){if(r[k]){r[k].turns--;if(r[k].turns<=0)r[k]=null;}}
  if(e.weaken){e.weaken.turns--;if(e.weaken.turns<=0)e.weaken=null;}if(e.blind){e.blind.turns--;if(e.blind.turns<=0)e.blind=null;}
  if(e.guard&&E(s).moves[nextMoveId(s)]?.effect?.guard==null)e.guard=Math.max(0,e.guard-.5);
  if(e.intel>0)e.intel--;
  s.turn++;s.telegraph=telegraphFor(s);if(s.telegraph)say(s,s.telegraph,'telegraph');
  return s;
 }
 function forceEnd(s,outcome){s.over=true;s.outcome=outcome;return s;}
 window.RACombat2Rules={create,act,loadout,forceEnd};
})();
