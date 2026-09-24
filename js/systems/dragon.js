(function(){
 // LANE 8 — DRAGONS (VOL 1 §9.9, VOL 3 §7.4, VOL 5 §5.3). Mazda grows one stage per N sleeps only if cared
 // for that day. Neglect never kills; she sulks on the roof facing away.
 const STAGES=['egg','hatchling','young','majestic'];const NEED={egg:3,hatchling:6,young:8};
 const d=()=>RALife.dragon();
 function adoptEgg(){if(d())return false;RAState.patch('life.ownership.dragon',{name:'BLUEBERRY MAZDA',stage:'egg',sleepsAtStage:0,fedDay:0,playedDay:0,warmDay:0,streak:0,bond:0,food:{fish:0,treats:0,play:0},sulking:false,form:'dragon',agegeUsed:false,lastCubeDay:0,hatched:false});RALife.unlockApp('hatch');return true;}
 function personality(dr){const f=dr.food||{};const top=Object.entries(f).sort((a,b)=>b[1]-a[1])[0];if(!top||top[1]<3)return null;return {fish:'ocean-proud',treats:'spoiled',play:'clingy'}[top[0]];}
 function applyActions(actions=[]){
  const dr=d();if(!dr)return;const today=RALife.today().day;const next={...dr,food:{...(dr.food||{})}};
  for(const a of actions){
   if(a.type==='keepWarm'){next.warmDay=today;next.bond=Math.min(100,next.bond+1);}
   if(a.type==='feed'){const f=a.food;if(!RALife.consume(f)){continue;}next.fedDay=today;next.sulking=false;next.bond=Math.min(100,next.bond+2);
    if(f.startsWith('fish'))next.food.fish=(next.food.fish||0)+1;else if(f==='treats'||f==='dragon_keef')next.food.treats=(next.food.treats||0)+1;
    if(f==='agege_bread'&&!next.agegeUsed){next.agegeUsed=true;next.sleepsAtStage+=4;next.trick='bread flip';RALife.remember({text:'mazda ate the agege bread',lane:'dragons'});}
    if(f==='maggi_dragon_crumble'){next.sleepsAtStage+=1;next.bond=Math.min(100,next.bond+5);}}
   if(a.type==='play'){next.playedDay=today;next.food.play=(next.food.play||0)+1;next.bond=Math.min(100,next.bond+2);}
   if(a.type==='talk')next.bond=Math.min(100,next.bond+1);
   if(a.type==='feedCat'&&next.fedDay!==today){next.sulking=true;}
  }
  next.personality=personality(next);RAState.patch('life.ownership.dragon',next);
  RALife.light('ownership',1,'owns:dragon');
 }
 function grow(next,info){const i=STAGES.indexOf(next.stage);if(i<0||i>=STAGES.length-1)return next;const need=NEED[next.stage];if(next.sleepsAtStage>=need){next.stage=STAGES[i+1];next.sleepsAtStage=0;RALife.mail({id:`mazda-stage:${info.day}`,kind:'dragon',title:'HATCH',body:`${next.name.toLowerCase()} is ${next.stage} now.`,app:'hatch'});RALife.remember({text:`mazda grew up (${next.stage})`,lane:'dragons'});}return next;}
 RAClock.onWake('dragon',35,({info})=>{
  const dr=d();if(!dr)return;const next={...dr};const yesterday=info.day-1;
  if(dr.stage==='egg'){next.sleepsAtStage=(dr.sleepsAtStage||0)+1;RAState.patch('life.ownership.dragon',next);return;} // hatch night (A11) is a wake trigger
  const fed=dr.fedDay===yesterday;const needsPlay=dr.stage==='young';const played=!needsPlay||info.day-(dr.playedDay||0)<=3;
  if(fed&&played){next.sleepsAtStage=(dr.sleepsAtStage||0)+1;next.streak=(dr.streak||0)+1;next.sulking=false;grow(next,info);}
  else{next.streak=0;if(!fed){next.sulking=true;RALife.mail({id:`mazda-sulk:${info.day}`,kind:'dragon',title:'HATCH',body:`${next.name.toLowerCase()} is on the roof. facing away.`,app:'hatch'});}}
  RAState.patch('life.ownership.dragon',next);
 });
 // The HATCH app — the game inside the game.
 window.RAPhoneApps?.register({id:'hatch',label:'HATCH',order:12,badge:()=>{const dr=d();return dr&&dr.stage!=='egg'&&dr.fedDay!==RALife.today().day?1:0;},
  render(){const dr=d();if(!dr)return '<h1>HATCH</h1><p class="phone-small">no egg.</p>';
   const hungry=dr.stage!=='egg'&&dr.fedDay!==RALife.today().day;
   return `<h1>HATCH</h1><div class="phone-card"><b>${dr.name}</b>${dr.stage.toUpperCase()}${dr.personality?` · ${dr.personality.toUpperCase()}`:''}<br>${dr.stage==='egg'?'warm. quiet. waiting.':dr.sulking?'on the roof. facing away.':hungry?'looking at you. hungry.':'happy. full.'}</div><div class="phone-card"><b>BAG</b>FISH ${RALife.count('fish_common')} · TREATS ${RALife.count('treats')} · KEEF ${RALife.count('dragon_keef')}${RALife.count('agege_bread')?' · AGEGE BREAD':''}${RALife.count('maggi_dragon_crumble')?` · MAGGI CRUMBLE ${RALife.count('maggi_dragon_crumble')}`:''}</div><button type="button" class="phone-button" data-phone-action="do:hatch:open">OPEN HATCH</button>`;},
  async onAction(act,arg,api){if(act==='open'){const dr=d();const inv={fish_common:RALife.count('fish_common'),treats:RALife.count('treats'),dragon_keef:RALife.count('dragon_keef'),agege_bread:RALife.count('agege_bread'),maggi_dragon_crumble:RALife.count('maggi_dragon_crumble')};
   const cat=!!RALife.life().ownership.cat;await api.launch('hatch',{dragon:{...dr,fedToday:dr.fedDay===RALife.today().day,playedToday:dr.playedDay===RALife.today().day},inventory:inv,catOwned:cat});}}});
 window.RADragon={STAGES,adoptEgg,applyActions,get:d,personality};
})();
