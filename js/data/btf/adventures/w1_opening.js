(function(){
 const {R,RC,S,N,E}=RAContent;const D=RAAdventures.define;
 // A00: remembered real encounter replayed from bed (delegated Q1), not a new identity or dream-created power.
 const climb=(n,cal)=>({env:'ocean_floor',actors:{mid:'rich',farLeft:{id:'soul',look:{top:'#1c2c44',bottom:'#1c2c44',hair:'#1c2c44',skin:'#2a3a54'}},farRight:{id:'soul',look:{top:'#22344c',bottom:'#22344c',hair:'#22344c',skin:'#2a3a54'}}},
  lines:[N(cal)],choices:[{label:'CLIMB',next:`fall${n}`}]});
 D({id:'A00',title:'THE GOLDFISH YEARS',lane:'home',scope:'MUST',memory:'the ladder at the bottom of the ocean',start:'dream',nodes:{
  dream:{env:'bedroom',actors:null,props:[{src:'assets/rich_bedroom_sleeping.png',x:78,y:346}],lines:[N("rich knocked out"),N("back in his LA bedroom. music can wait till morning."),N("in his sleep, the breakup comes back. the ocean was real. this is the memory.")],next:'floor'},
  floor:{env:'ocean_floor',title:'THE BOTTOM OF THE OCEAN',actors:{mid:'rich',farLeft:{id:'soul',look:{top:'#1c2c44',bottom:'#1c2c44',hair:'#1c2c44',skin:'#2a3a54'}},farRight:{id:'soul',look:{top:'#22344c',bottom:'#22344c',hair:'#22344c',skin:'#2a3a54'}}},
   lines:[N("his ex left him down here after the breakup. took his heart and his brain with her."),N("the souls wait on the floor. rich keeps trying the same ladder."),N("one ladder for all these broke souls")],choices:[{label:'CLIMB',next:'fall1'}]},
  fall1:{env:'ocean_floor',openingAction:'fall',lines:[N("ladder folds right before the top"),N("month 7. thats how long it felt.")],next:'try2'},
  try2:climb(2,'the ladder is back. like nothing happened.'),
  fall2:{env:'ocean_floor',openingAction:'fall',lines:[N("ladder folds again damn"),N("month 19 somebody call maintenance")],next:'try3'},
  try3:climb(3,'again.'),
  fall3:{env:'ocean_floor',openingAction:'fall',lines:[N("two years for this shit. every bad day feels like another fall."),R("still better than linkedin")],next:'sensei'},
  // ART SHIP 004 staging: Sensei neutral while arriving/listening, `point` only for the instruction line, then neutral.
  sensei:{env:'ocean_floor',actors:{left:'rich',right:'octopus_sensei'},lines:[null,N("old octopus pulls up like he knows the landlord")],next:'sensei_point'},
  sensei_point:{actors:{left:'rich',right:{id:'octopus_sensei',state:'point'}},lines:[S('octopus_sensei',"use your head bro"),S('octopus_sensei',"different lanes. different tentacles. try a different brain.")],next:'sensei_listen'},
  sensei_listen:{actors:{left:'rich',right:'octopus_sensei'},lines:[R("my head got us here")],next:'brain'},
  // The literal misunderstanding is shared, but each offer retains its own consent/tone.
  brain:{actors:{left:'rich',right:{id:'octopus_sensei',state:'point'}},lines:[R("take what big bro"),N("rich reaches toward the octopus head. he took that advice literally."),S('octopus_sensei',"THIS OGA IS DUMB AS HELL!"),S('octopus_sensei',"wait. if you taking advice like that, take it properly.")],next:'brain_offer'},
  brain_offer:{actors:{left:'rich',right:'octopus_sensei'},lines:[S('octopus_sensei',"my brain eight parts one per arm"),S('octopus_sensei',"seventh part just snacks dont judge")],
   choices:[{label:'TAKE THE WHOLE BRAIN',next:'brain_all'},{label:'TAKE ONE PART. BE POLITE.',next:'brain_one'},{label:'ASK IF IT HURTS',next:'brain_ask'}]},
  brain_all:{lines:[S('octopus_sensei',"whole thing? greedy. alright."),N("rich gets both hands ready.")],enter:A=>A.set('brainOffer','whole'),next:'brain_done'},
  brain_one:{lines:[S('octopus_sensei',"manners? damn thats rare"),N("the sensei offers one part. rich waits for it.")],enter:A=>A.set('brainOffer','polite'),next:'brain_done'},
  brain_ask:{lines:[S('octopus_sensei',"hurts like hell"),N("rich waits. the sensei nods before handing it over.")],enter:A=>A.set('brainOffer','asked'),next:'brain_done'},
  brain_done:{lines:[S('octopus_sensei',"use it or eat it your business")],next:'merge'},
  merge:{openingAction:'brain',lines:[N("purple brain. little tentacles. straight into his head."),N("eight thoughts all about food")],next:A=>A.vars.brainTransferSeen?'brain_acquired':'merge'},
  brain_acquired:{enter:A=>{if(!RALife.flag('octopusBrain'))RALife.setFlag('octopusBrain',A.vars.brainOffer||['whole','polite','asked'][A.vars.picks?.brain_offer]||'whole');},lines:[N("one borrowed brain. still no plan."),R("damn its warm"),N("rich grows eight tentacles real subtle"),R("oh i could just leave")],next:'fork'},
  fork:{choices:[{label:'CLIMB AGAIN',next:'out_climb'},{label:'SWIM',next:'out_swim'},{label:'ASK THE OCTOPUS WHERE THE EXIT IS',octopus:true,next:'out_ask'}]},
  out_climb:{lines:[N("tentacles carry him up ladder unemployed")],next:'out'},
  out_swim:{lines:[N("rich swims up nobody thought of that shit")],next:'out'},
  out_ask:{lines:[S('octopus_sensei',"up bro"),null],next:'out'},
  out:{env:'throne',actors:{mid:'rich'},lines:[N("finally out"),N("the memory carries on. back at his castle, the borrowed brain came with him."),R("ugh my head hurts"),N("in the throne room, the CEO zombie prince is already throwing his weight around. and his briefcase."),N("rich wants a quiet life making music. somebody always brings a fight to his house.")],end:{outcome:'out',location:'battle',memory:{text:'the ladder at the bottom of the ocean',lane:'home'},receipt:{id:'ladder',caption:'the ladder. never again.'}}}
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
