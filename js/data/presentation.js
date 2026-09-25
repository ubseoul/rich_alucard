(function(){
 // Presentation Director data: screen modes (UI-aware world viewport) and shot profiles.
 // All numbers here are Director-owned presentation policy. Scenes never set sprite sizes directly:
 // they name a mode + shot profile and the Director solves the camera (docs/PRESENTATION_DIRECTOR.md).
 //
 // Screen-mode lengths are fractions of the screen width W (portrait phones are width-limited),
 // so every phone gets the same world framing and surplus tall-phone height goes to the UI band.
 const modes={
  combat:{
   id:'combat',
   // status band (HP panels) above the world, command band below it; the world viewport never sits under UI.
   pad:.022,hud:.15,gap:.012,
   world:{maxAspect:1.36,minAspect:1.05},
   ui:{min:.44},
   uiSelectors:['.combat-hud .hpbox','#battleUI'],
   dialogueSelectors:['#dialogue'],
   bubbleSelectors:['#toast.jdm-speaker-bubble','#richLyricBubble.on']
  },
  dialogue:{
   id:'dialogue',
   pad:.022,hud:0,gap:.012,
   world:{maxAspect:1.3,minAspect:1.0},
   ui:{min:.46},
   uiSelectors:['.adv-box','.adv-choices'],
   dialogueSelectors:['.adv-box'],
   bubbleSelectors:['.adv-bubble']
  },
  exploration:{id:'exploration',pad:.022,hud:.1,gap:.012,world:{maxAspect:1.5,minAspect:1.1},ui:{min:.3},uiSelectors:[],dialogueSelectors:[]},
  cinematic:{id:'cinematic',pad:0,hud:0,gap:0,world:{maxAspect:1.78,minAspect:1.2},ui:{min:.18},uiSelectors:[],dialogueSelectors:[]},
  phone:{id:'phone',pad:0,hud:0,gap:0,world:{maxAspect:1.78,minAspect:1.2},ui:{min:0},uiSelectors:['#phoneOverlay'],dialogueSelectors:[]},
  minigame:{id:'minigame',pad:0,hud:0,gap:0,world:{maxAspect:1.78,minAspect:1.2},ui:{min:0},uiSelectors:['.ra-minigame'],dialogueSelectors:[]}
 };
 // Shot profiles. `body` = visible-body height of the reference character (Rich, standing) as a fraction
 // of the world viewport height. `contact` = candidate positions of the focal contact line inside the
 // viewport (0 = top, 1 = bottom). `headroom` = minimum clear space above the tallest focal head,
 // reserved for speech bubbles. HQ initial targets; locked from the pilot's golden set.
 // `reference` = the locked cross-scene size for the profile (pilot golden set); same character + same profile
 // must render within ±acceptance.consistency of it in every scene.
 const profiles={
  establishing:{id:'establishing',body:[.20,.25],target:.225,contact:[.78,.84,.9],headroom:.12,side:.03},
  combat:{id:'combat',body:[.30,.35],target:.325,reference:.325,contact:[.8,.85,.9],headroom:.16,side:.025},
  conversation:{id:'conversation',body:[.35,.45],target:.40,reference:.392,contact:[.82,.88,.93],headroom:.14,side:.03},
  close:{id:'close',body:[.50,.60],target:.55,contact:[.9,.96,1.02],headroom:.08,side:.02}
 };
 // Reference character: profile body targets are expressed against Rich's standing visible height so that
 // "same character + same shot profile" renders at the same fraction everywhere.
 const reference={asset:'assets/rich_standing_right.png'};
 // Acceptance thresholds (HQ Amendment §6). deadSpace threshold is locked from the pilot golden set.
 // deadSpace locked from the pilot golden set (approved screens measured .39–.78; see docs/presentation/PILOT_REPORT.md).
 const acceptance={uiOverlapPx:0,faceVisible:1,minFacePx:24,minFacePxAtWidth:360,consistency:.05,deadSpace:.8,fxInsideWorld:1};
 // Live review rubric (HQ Amendment §8) — the same criteria the automated judge will use.
 const rubric=['focal hierarchy','readability','environment readability','UI coexistence','dramatic/story intent','Rich Alucard presentation consistency'];
 // World-attached combat FX, authored in BODY UNITS: pixels at a reference visible body height of 124.67 px
 // (the accepted throne-room Rich), relative to the role anchor = the actor's visible body (alpha bounds),
 // centre x, 42% down (chest). --pd-fx = Rich's current reference-height body / 124.67, so effects stay on the
 // body whatever the sprite padding, pose, camera zoom or phone. Placement is Director presentation policy
 // (pilot decision: impacts on the chest, auras around the body, labels above the head); legacy unmigrated
 // scenes keep their original screen-percentage CSS. `span` stretches the width to reach the other role.
 // Screen-space overlays (flashes, bite jaws, octopus, fullscreen impacts) are intentionally not listed.
 const fxReference={visibleHeight:124.67};
 const fx=[
  {el:'#richCast',role:'rich',dx:-48.8,dy:-55.9,w:97.5,h:131.7},
  {el:'#bloodBurst',role:'enemy',dx:-35.1,dy:-72.8,w:70.2,h:145.5},
  {el:'#damageNumber',role:'enemy',dx:-16,dy:-84},
  {el:'#bloodCurtain',role:'rich',span:'enemy',dx:-20,dy:-110,w:40,h:235.6},
  {el:'#impactCore',role:'enemy',dx:-27.3,dy:-62.4,w:54.6,h:124.7},
  {el:'#ceoRecoil',role:'enemy',dx:-35.1,dy:-70,w:70.2,h:152.5},
  {el:'#briefcaseProjectile',role:'enemy',dx:-40,dy:-30,w:64,h:48},
  {el:'#briefcaseImpact',role:'rich',dx:-32,dy:-32,w:64,h:64},
  {el:'#revengeStoredText',role:'rich',dx:-58,dy:-92,w:116.9},
  {el:'#revengeMass',role:'rich',dx:-6,dy:-26,w:52,h:52},
  {el:'#revengeImpact',role:'enemy',dx:-38,dy:-38,w:76,h:76},
  {el:'#richBiteSprite',role:'enemy',dx:-110,dy:-75,w:120,h:144},
  {el:'#biteTrail',role:'rich',span:'enemy',dx:0,dy:-9,w:-20,h:18},
  {el:'#biteImpact',role:'enemy',dx:-29,dy:-45,w:58,h:58},
  {el:'#healFloat',role:'rich',dx:-16,dy:-84},
  {el:'#revengeMassAuthored',role:'rich',dx:-30,dy:-110,w:96,h:96}
 ];
 // Code-spawned effects (game.js in Director mode), same body units. Missiles leave Rich's chest in a spread and
 // travel the anchor-to-anchor distance plus missileFlight; impacts land on the enemy chest.
 const spawn={missileStarts:[[20,-50],[14,-30],[24,-10],[10,-40],[18,-20],[26,0]],impact:{dx:-32,dy:-53,step:14},missileFlight:-60,briefcaseFlight:18};
 // Adventure adapter (js/scenes/adventure.js). Wave 1: every adventure environment is Director-staged.
 // `exceptions` = screens (environment|slot:person …) that cannot meet a shot band with the generic default; the
 // Director still frames them best-effort (full-width cover) and lint records the accepted exception. Each has a
 // ticket in docs/presentation/NEEDS_CREATIVE.md. The release gate requires this list to match the dry run exactly.
 const adventure={environments:'all',exceptions:{
  'ocean_floor|farLeft:soul,farRight:soul,mid:rich':{status:'EXCEPTION-LAYOUT',ticket:'PD-W1-01'},
  'ocean_floor_collapsed|farLeft:soul,farRight:soul,mid:rich':{status:'EXCEPTION-LAYOUT',ticket:'PD-W1-01'},
  'slurp|farRight:hina,left:rich,right:okada':{status:'EXCEPTION-LAYOUT',ticket:'PD-W1-02',accept:['face-visible']},
  'pet_crypt|farRight:uncle_sunday,left:rich':{status:'EXCEPTION-LAYOUT',ticket:'PD-W1-03'},
  'portobello_bedroom|farRight:portobello_kid2,left:portobello_wife,mid:rich_portobello,right:portobello_kid1':{status:'EXCEPTION-LAYOUT',ticket:'PD-W1-04'}
 }};
 // Canonical screen key for the adapter (shared by runtime, dry run and census).
 const screenKey=(envId,cast)=>`${envId}|${Object.entries(cast).filter(([,c])=>c).map(([slot,c])=>`${slot}:${typeof c==='string'?c:c.id}`).sort().join(',')}`;
 window.RAPresentationData={modes,profiles,reference,acceptance,rubric,fx,fxReference,spawn,adventure,screenKey};
})();
