// F07 M8_AND_FINALE — GBENGA, OGA OF THE BLOCK (Patch 1 §4.2 Phase 2 THE OFFICE). Menu combat on the accepted Combat 2.0 rules:
// the enemy card is plain data (js/data/btf/combat.js shape); the scripted behaviours the card cannot express ride the IF-1 boss-script
// seam (RACombat2Ext.registerBossScript — inert unless F07.m8_and_finale is ON). No second combat engine.
//
// Authored (§4.2): HP 260 (320 if trust was high) · AGBADA SWEEP 24 to Rich and any companion (telegraphed) · VOICE NOTE: Rich skips
// his next turn (telegraphed; interruptible only with REVENGE or DEAD RINGER) · "MY SON": heals 30 and removes Rich's buffs ·
// THE GOLDEN DRACO after the first received damaging hit: 2 × 20 (telegraphed) · at 50% Mama Gbenga on the speaker, he loses a turn to shame ·
// OCTOPUS BRAIN: CHARISMA "RETIRE, UNCLE" (only if Rich ate Mama Gbenga's leftovers, M7), RECRUIT "WORK FOR ME" (if trust is high),
// ROAST (he loses two turns, the office goes silent).
// F07-TUNABLE (not authored): the move ORDER of his pattern, and that THE GOLDEN DRACO alternates with his pattern after its requested first-hit activation.
(function(){
 'use strict';
 const FLAG='F07.m8_and_finale';
 const T=()=>window.RAF07Tunables.finale;
 const m=(id,label,dmg,o={})=>({id,label,dmg,...o});
 const D=window.RACombatData;
 if(!D||D.ENEMIES.gbenga)return;
 D.ENEMIES.gbenga={name:'GBENGA',hp:T().HP,person:'gbenga',boss:true,noRun:true,
  moves:{
   phone:m('phone','HELLO HELLO RICH CAN YOU HEAR ME',T().SWEEP_DAMAGE),
   sweep:m('sweep','AGBADA SWEEP',T().SWEEP_DAMAGE,{telegraph:'HE IS ADJUSTING HIS SLEEVES'}),
   // telegraph text is not authored for the VOICE NOTE: the authored VOICE NOTE pose (Patch 1 §7: phone held flat in front of his mouth)
   voice:m('voice','VOICE NOTE',0,{telegraph:'HE IS HOLDING THE PHONE FLAT IN FRONT OF HIS MOUTH'}),
   my_son:m('my_son','"MY SON"',0,{heal:T().MY_SON_HEAL}),
   draco:m('draco','THE GOLDEN DRACO',T().DRACO_DAMAGE,{hits:T().DRACO_HITS,telegraph:'HE IS REACHING INTO THE COOLER'})
  },
  pattern:['phone','voice','my_son','sweep'],
  octopus:{
   charisma:{label:'RETIRE, UNCLE',requires:'leftovers',result:'spared',text:'GBENGA HANDS RICH HIS EARPIECE.'},
   recruit:{label:'WORK FOR ME',requires:'trust',result:'spared',text:'GBENGA BECOMES RICH’S CONSIGLIERE.'},
   roast:{label:'YOU PHOTOSHOPPED YOURSELF SHAKING YOUR OWN HAND.',result:'skip',turns:2,text:'THE OFFICE GOES SILENT.'}
  }};
 // HP is chosen by the finale from Gbenga's trust (params.hp); the card's own hp is the base value.
 const hpFor=trust=>trust>=window.RANewOgaTunables.trustThresholds.HIGH_MIN?T().HP_HIGH_TRUST:T().HP;

 const nextMove=(s,def)=>s.enemy.queue.length?s.enemy.queue[0]:def.pattern[s.enemy.step%def.pattern.length];
 const lastEnemyMove=s=>[...s.log].reverse().find(l=>l.kind==='enemy')?.move||null;
 const snap=s=>({revenge:s.rich.pp.revenge,ringer:s.rich.pp.ringer});

 const script={fragment:'F07',flag:FLAG,
  onCreate(s){
   const lane=window.RANewOga?.current?.()||{};
   // the octopus gates read these two pseudo-items (local to the fight; the scene only persists catalogued items)
   s.items.leftovers=lane.leftoversAte?1:0;
   s.items.trust=lane.trust>=window.RANewOgaTunables.trustThresholds.HIGH_MIN?1:0;
   s.f07={shamed:false,lastWasDraco:false,receivedPlayerHit:false,dracoEquipped:false,phoneUsed:false,pp:snap(s)};
  },
  beforeEnemyTurn(s,h){
   const e=s.enemy,def=window.RACombatData.ENEMIES.gbenga,f=s.f07;if(!f||s.over)return;
   // Requested first received player hit equips Draco. The giant-phone opener still gets its turn.
   if(!f.receivedPlayerHit&&s.log.some(l=>l.kind==='hit'&&l.target==='enemy'&&(l.amount||0)>0)){f.receivedPlayerHit=true;f.dracoEquipped=true;h.say(s,'','combat_beat',{barkKey:'gbenga.first_hit',speaker:'enemy',attacker:'enemy',target:'rich',move:'draco'});}
   if(f.dracoEquipped&&f.phoneUsed&&!e.queue.length&&!f.lastWasDraco)e.queue.unshift('draco');
   // phase trigger at 50%: Mama Gbenga on the speaker; he loses a turn to shame
   if(!f.shamed&&e.hp<=e.max*T().SHAME_AT&&e.hp>0){
    f.shamed=true;e.skip++;
    h.say(s,'MAMA GBENGA (ON THE PHONE SPEAKER): “Gbenga, are you fighting at your own party?”','weird');
    h.say(s,'HE LOSES A TURN TO SHAME.','weird');
   }
   // the VOICE NOTE is interruptible only with REVENGE or DEAD RINGER (a DEAD RINGER that held stuns him)
   if(nextMove(s,def)==='voice'){
    const now=snap(s),usedRevenge=now.revenge<f.pp.revenge,usedRinger=now.ringer<f.pp.ringer&&e.stun>0;
    if(usedRevenge||usedRinger){
     if(e.queue.length)e.queue.shift();else e.step++;
     if(e.skip===0&&e.stun===0)e.skip++;
     h.say(s,'THE VOICE NOTE IS INTERRUPTED.','weird');
    }
   }
  },
  afterEnemyTurn(s,h){
   const e=s.enemy,f=s.f07;if(!f)return;
   const move=lastEnemyMove(s);
   if(move==='phone')f.phoneUsed=true;
   if(move==='voice'){s.rich.stun+=1;h.say(s,window.RAAstraEditorial?.moveText?.('gbenga.voice_stun')||'RICH SKIPS HIS NEXT TURN LISTENING TO A 4-MINUTE VOICE NOTE.','debuff');}
   if(move==='my_son'){
    const r=s.rich;r.buffNext=1;r.doubleNext=false;r.sureNext=false;r.block=0;r.guardHits=0;r.shield=0;r.revengeDouble=false;r.extraTurn=false;
    h.say(s,'DISAPPOINTMENT REMOVES RICH’S BUFFS.','debuff');
   }
   if(move==='sweep'||move==='phone'){for(const c of s.companions||[])if((s.hoesUsed?.[c.id]||0)>0&&!s.companionHurt.includes(c.id))s.companionHurt.push(c.id);}  // "to Rich and any companion"
   // After the first received player hit: Draco is queued and telegraphed, alternating with the original pattern.
   if(e.hp>0&&f.dracoEquipped&&f.phoneUsed&&!e.queue.length&&move!=='draco')e.queue.unshift('draco');
   f.lastWasDraco=move==='draco';
   f.pp=snap(s);
  }
 };
 try{window.RACombat2Ext?.registerBossScript?.('gbenga',script);}catch(e){if(!/already scripted/.test(String(e.message)))console.error(e);}
 window.RAGbengaFight={hpFor,script};
})();
