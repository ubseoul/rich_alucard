(function(){
 // Party lane helpers (VOL 1 §9.3). The accepted Party Foundation grammar — equipped PARTY BEHAVIOR →
 // PARTY SITUATION → distinct social reaction — reused inside adventure choice nodes. The three accepted
 // behaviors stay as they are; new ones are EARNED from people (Kiki, Moonie, the Kevins, Bllad33).
 const BASE=[{id:'two-step',label:'TWO STEP'},{id:'head-nod',label:'HEAD NOD'},{id:'too-cool',label:'TOO COOL TO DANCE'}];
 const EARNED={shmoove:{id:'shmoove',label:'THE SHMOOVE',from:'kiki'},stomp:{id:'stomp',label:'WEREWOLF STOMP',from:'moonie'},clone:{id:'clone',label:'CLONE LINE',from:'kevin'},nod_harder:{id:'nod_harder',label:'NOD HARDER',from:'bllad33'}};
 const owned=()=>[...BASE,...(RALife.flag('partyBehaviors')||[]).map(id=>EARNED[id]).filter(Boolean)];
 function earn(id){const list=new Set(RALife.flag('partyBehaviors')||[]);if(!EARNED[id]||list.has(id))return false;list.add(id);RALife.setFlag('partyBehaviors',[...list]);RALife.mail({id:`behavior:${id}`,kind:'people',title:'NEW PARTY BEHAVIOR',body:`${EARNED[id].label} (from ${EARNED[id].from}).`});return true;}
 // situation = {results:{behaviorId:{reaction, score}}, fallback:{reaction,score}}; returns adventure choices.
 function choices(situation,next){return owned().map(b=>{const r=situation.results?.[b.id]||situation.fallback||{reaction:'the room shrugs.',score:0};return {label:b.label,sub:b.from?`FROM ${b.from.toUpperCase()}`:'',fx:A=>{A.set('lastReaction',r.reaction);A.set('partyScore',(A.vars.partyScore||0)+(r.score||0));if(r.fx)r.fx(A);},next};});}
 // RC2 B3: the party floor is the DANCE FLOOR rhythm minigame. Win = the room joins in; a miss is still a fine night.
 // Returns a node `minigame` spec: use `minigame:RAParties.dance({fallback:{reaction,score}},'nextNode')` where `choices:RAParties.choices(...)` was.
 function dance(situation,next,{song='party',rival=null}={}){
  return {id:'dance',params:A=>({song,rival,day:RALife.today().day,seed:`${song}-${RALife.today().day}-${A?.id||''}`}),
   next:(A,r)=>{const win=!r?.quit&&r?.outcome==='win',f=situation?.fallback||{reaction:'the room shrugs.',score:0};
    A.set('lastReaction',r?.quit?'rich sits this one out.':win?'the whole room is dancing with him.':f.reaction);
    A.set('partyScore',(A.vars.partyScore||0)+(win?Math.max(4,(f.score||0)+3):(f.score||0)));
    return next;}};
 }
 // Attendable parties this week (used by VampGPT MEET PEOPLE → FIND A PARTY).
 const listeners=[];function register(fn){listeners.push(fn);}
 // One-time story parties (Lo, Ogun's second rave) come first, in registration order; otherwise the week's repeatable
 // parties rotate by day so every attendable party surfaces (VOL 1 §9.3 lists four; "parties have dates").
 function next(L){const ids=[];for(const fn of listeners){try{const id=fn(L);if(id&&RAAdventures.available(id)&&!ids.includes(id))ids.push(id);}catch(e){}}
  const story=ids.find(id=>!RAAdventures.get(id)?.repeatable);if(story)return story;return ids.length?ids[(Number(L?.day)||0)%ids.length]:null;}
 function attended(kind='human'){RALife.addPoints('clout',5);if(kind==='vampire')RALife.addPoints('rep',5);RALife.light('connection',1,`party:${RALife.today().day}`);}
 window.RAParties={BASE,EARNED,owned,earn,choices,dance,register,next,attended};
})();
