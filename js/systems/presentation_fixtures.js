(function(){
 // DEV-ONLY Presentation Director fixtures. Non-canon, spoiler-free test content: Rich, generic placeholder
 // figures and neutral test text. Nothing here is registered unless DEV mode is on and a fixture is launched,
 // so the authored adventure set, save schema and player path are untouched.
 const dev=()=>document.body.classList.contains('dev-enabled');
 const extra={id:'pd_fixture_extra',look:{skin:'#8a6a5a',hair:'#2a2a2a',top:'#3a4a6a',bottom:'#2a2a30'}};
 const extra2={id:'pd_fixture_extra_2',look:{skin:'#c8a080',hair:'#6a3a2a',top:'#5a3a4a',bottom:'#2a2a30'}};
 const CURB={id:'PD_FIXTURE_CURB',title:'DEV · CURB FRAMING FIXTURE',lane:'life',repeatable:true,start:'solo',nodes:{
  solo:{env:'curb',actors:{mid:'rich'},lines:[[null,'[DEV FIXTURE] one actor on the curb.'],['rich','presentation check. one actor.']],next:'pair'},
  pair:{env:'curb',actors:{left:'rich',right:extra},lines:[['pd_fixture_extra','presentation check. second speaker, longest representative line for the dialogue box fit test.'],['rich','two actors. conversation framing.']],next:'seated'},
  seated:{env:'curb',actors:{mid:{id:'rich',src:'assets/rich_curb_eating.png'}},lines:[[null,'[DEV FIXTURE] approved seated curb pose.']],next:'trio'},
  trio:{env:'curb',actors:{farLeft:extra2,mid:'rich',farRight:extra},lines:[[null,'[DEV FIXTURE] three actors: establishing fallback.']],next:'pick'},
  pick:{env:'curb',actors:{left:'rich',right:extra},choices:[{label:'FIRST TEST CHOICE',next:'done'},{label:'SECOND TEST CHOICE',sub:'with a sub line',next:'done'},{label:'THIRD TEST CHOICE',next:'done'}]},
  done:{end:{outcome:'fixture',memory:null}}
 }};
 function define(def){if(!window.RAAdventures.get(def.id))window.RAAdventures.define(def)}
 async function curb(node='solo'){
  if(!dev())throw new Error('Presentation fixtures are DEV-only');
  define(CURB);const a=RAAdventures.active();if(a&&a.id!==CURB.id)RAAdventures.abandon?.(a.id);
  RAAdventures.start(CURB.id,{from:'dev'});RAAdventures.patchActive({node});await RAScenes.go('adventure',{node});return true;
 }
 // Combat 2.0 fixture: a non-canon test enemy (placeholder figure) on the approved docks environment.
 const DUMMY={name:'TEST DUMMY',hp:150,person:'pd_fixture_dummy',moves:{poke:{id:'poke',label:'TEST POKE',dmg:6},wind:{id:'wind',label:'TEST WIND-UP',dmg:14,telegraph:'TEST DUMMY IS WINDING UP A TEST ATTACK…'}},pattern:['poke','wind','poke']};
 // Real Combat 2.0 fights run from inside an adventure, never over the throne; the fixture starts from a neutral
 // scene so the throne Director scene is exited cleanly first.
 async function combat2({crowd=false,env='docks'}={}){
  if(!dev())throw new Error('Presentation fixtures are DEV-only');
  if(RAScenes.current()==='battle')await RAScenes.go('bedroom',{devFixture:true});
  const E=window.RACombatData.ENEMIES;E.pd_fixture_dummy=E.pd_fixture_dummy||DUMMY;E.pd_fixture_crowd=E.pd_fixture_crowd||{...DUMMY,name:'TEST CROWD',minions:40};
  return RACombat2.run(crowd?'pd_fixture_crowd':'pd_fixture_dummy',{env,director:!window.__pdLegacy,noPenalty:true,intro:'[DEV FIXTURE] COMBAT 2.0 FRAMING.'});
 }
 window.RAPresentationFixtures={curb,combat2,definitions:{curb:CURB,combat2:DUMMY}};
})();
