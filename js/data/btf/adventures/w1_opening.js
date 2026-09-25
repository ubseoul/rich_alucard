(function(){
 const {R,RC,S,N,E}=RAContent;const D=RAAdventures.define;
 // A00 — THE GOLDFISH YEARS (prologue). Max 3 player climbs; compression, not repetition.
 const climb=(n,cal)=>({env:'ocean_floor',actors:{mid:'rich',farLeft:{id:'soul',look:{top:'#1c2c44',bottom:'#1c2c44',hair:'#1c2c44',skin:'#2a3a54'}},farRight:{id:'soul',look:{top:'#22344c',bottom:'#22344c',hair:'#22344c',skin:'#2a3a54'}}},
  lines:[N(cal)],choices:[{label:'CLIMB',next:`fall${n}`}]});
 D({id:'A00',title:'THE GOLDFISH YEARS',lane:'home',scope:'MUST',memory:'the ladder at the bottom of the ocean',start:'dream',nodes:{
  dream:{env:'bedroom',actors:null,lines:[N('rich is asleep.'),N('remember?')],next:'floor'},
  floor:{env:'ocean_floor',title:'THE BOTTOM OF THE OCEAN',actors:{mid:'rich',farLeft:{id:'soul',look:{top:'#1c2c44',bottom:'#1c2c44',hair:'#1c2c44',skin:'#2a3a54'}},farRight:{id:'soul',look:{top:'#22344c',bottom:'#22344c',hair:'#22344c',skin:'#2a3a54'}}},
   lines:[N('drowned souls climb a driftwood ladder toward the light.'),N('everybody climbs the same ladder.')],choices:[{label:'CLIMB',next:'fall1'}]},
  fall1:{env:'ocean_floor_collapsed',lines:[N('near the top, it collapses.'),N('MONTH 7.')],next:'try2'},
  try2:climb(2,'the ladder is back. like nothing happened.'),
  fall2:{env:'ocean_floor_collapsed',lines:[N('it collapses again.'),N('MONTH 19.')],next:'try3'},
  try3:climb(3,'again.'),
  fall3:{env:'ocean_floor_collapsed',lines:[N('YEAR 2.'),R("shi. at least it's something.")],next:'sensei'},
  // ART SHIP 004 staging: Sensei neutral while arriving/listening, `point` only for the instruction line, then neutral.
  sensei:{env:'ocean_floor',actors:{left:'rich',right:'octopus_sensei'},lines:[E('octopus_sensei','…'),N('something old drifts in. it has been watching.')],next:'sensei_point'},
  sensei_point:{actors:{left:'rich',right:{id:'octopus_sensei',state:'point'}},lines:[S('octopus_sensei','USE YOUR HEAD.')],next:'sensei_listen'},
  sensei_listen:{actors:{left:'rich',right:'octopus_sensei'},lines:[R('use my head.')],next:'merge'},
  merge:{lines:[N('rich does it literally.'),N('eight tentacles. bubbles. his head is full of ocean.'),R("…oh. there's other ways out.")],next:'fork'},
  fork:{choices:[{label:'CLIMB AGAIN',next:'out_climb'},{label:'SWIM',next:'out_swim'},{label:'ASK THE OCTOPUS WHERE THE EXIT IS',octopus:true,next:'out_ask'}]},
  out_climb:{lines:[N('he climbs. this time he uses the tentacles. the ladder is irrelevant.')],next:'out'},
  out_swim:{lines:[N('he just swims up. nobody ever tried that.')],next:'out'},
  out_ask:{lines:[S('octopus_sensei','…up.'),N('it points up. it was always up.')],next:'out'},
  out:{lines:[N("he's out.")],end:{outcome:'out',location:'battle',memory:{text:'the ladder at the bottom of the ocean',lane:'home'},receipt:{id:'ladder',caption:'the ladder. never again.'}}}
 }});
 // WAKE-time helpers for the life clock's first days.
 RAClock.onWake('btf-day-flags',15,({info})=>{
  if(info.day>=2)RALife.setFlag('ogunInviteWindow',true);
 });
 // FAMILY THREAD (VOL 5 §1.3, §9.6): ~weekly at WAKE. Day 1 (Oct 1, Nigerian Independence Day) is the first notification of the game.
 const FAMILY=[
  {from:'MOM',text:'happy independence day!! 🇳🇬 have you eaten',choices:[{label:'yes ma',say:'yes ma',tendency:'solid'},{label:'about to',say:'about to 🙏'}]},
  {from:'DAD',text:'how is the music thing',choices:[{label:'cooking',say:'cooking something'},{label:'leave on read',text:false,tendency:'messy'}]},
  {from:'SISTER',text:'why is your last post like that',choices:[{label:'like what',say:'like what'},{label:'🙄',say:'🙄'}]},
  {from:'BIG BRO',text:'lil bro said the falcons are better than the hawks. tell him',choices:[{label:'side with big bro',say:'he right'},{label:'stay out of it',text:false}]},
  {from:'MOM',text:'[prayer image] 🙏🏾 God is working. have you eaten',choices:[{label:'amen. yes',say:'amen. yes i ate',tendency:'solid'},{label:'❤️',say:'❤️'}]},
  {from:'LIL BRO',text:'bro is it true u got a castle',choices:[{label:'yeah',say:'yeah'},{label:'no comment',say:'no comment'}]},
  {from:'DAD',text:'call your mother',choices:[{label:'calling',say:'calling her now',tendency:'solid'},{label:'👍',say:'👍'}]},
  {from:'SISTER',text:'saw your vampgram. who is she',choices:[{label:'nobody',say:'nobody'},{label:'mind yours',say:'mind yours',tendency:'messy'}]}
 ];
 RAClock.onWake('family-thread',55,({info})=>{
  const due=info.day===1||(info.sunday&&info.day>1);if(!due)return;
  const idx=info.day===1?0:1+Math.floor((info.day-1)/7)%(FAMILY.length-1);const m=FAMILY[idx];
  if(RALife.text('family',m.from,m.text,{id:`family:${info.day}`,choices:m.choices})){RALife.unlockApp('texts',{silent:true});RALife.mail({id:`family:${info.day}`,kind:'family',title:'FAMILY 🇳🇬',body:`${m.from}: ${m.text}`,app:'texts'});}
 });
 // Day-one want (A02): "you hungry?"
 RATemptations.define([
  {id:'day1_hungry',source:'vampgpt',line:'you hungry?',priority:100,minDay:1,maxDay:3,life:[2,3],action:'hungry'},
 ]);
 RAPlaces.define([{id:'hungry',hidden:true,go:api=>{api.go('somewhere');return true;}}]);
})();
