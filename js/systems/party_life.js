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
 // Attendable parties this week (used by VampGPT MEET PEOPLE → FIND A PARTY).
 const listeners=[];function register(fn){listeners.push(fn);}
 function next(L){for(const fn of listeners){try{const id=fn(L);if(id&&RAAdventures.available(id))return id;}catch(e){}}return null;}
 function attended(kind='human'){RALife.addPoints('clout',5);if(kind==='vampire')RALife.addPoints('rep',5);RALife.light('connection',1,`party:${RALife.today().day}`);}
 window.RAParties={BASE,EARNED,owned,earn,choices,register,next,attended};
})();
