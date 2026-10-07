(function(){
  const FRAME_ASSETS={
    human:'assets/assistant_idle.png',
    bite:'assets/assistant_bite_reaction.png',
    transformation1:'assets/assistant_transformation_01.png',
    transformation2:'assets/assistant_transformation_02.png',
    vampire:'assets/assistant_vampire_reveal.png',
    bat1:'assets/assistant_bat_01.png',
    bat2:'assets/assistant_bat_02.png',
    bat3:'assets/assistant_bat_03.png'
  };
  let active=false, actionScope=null;
  function beginAction(){
    if(!active||actionScope)return null;
    const parent=window.RAScenes?.currentScope?.();
    return actionScope=parent?.child('conversion')||window.RAScenes?.createScope('conversion');
  }
  function endAction(scope){if(actionScope===scope){scope?.cancel();actionScope=null;}}

  function el(id){return document.getElementById(id);}
  function data(){return RACharacterSystem.data('ceo_assistant_001');}
  function runtime(){return RACharacterSystem.runtime('ceo_assistant_001');}
  function moveNames(){return (data().moves||[]).map(id=>RAMoves[id]?.name||id);}
  function setFrame(name){const sprite=el('revealAssistantSprite');if(sprite)sprite.style.backgroundImage=`url('${FRAME_ASSETS[name]}')`;}
  function setText(id,value){const node=el(id);if(node)node.textContent=value;}
  function renderProfile(){
    const character=data(), state=runtime()||{};
    setText('revealClass',character.class);
    setText('revealLikes',(character.likes||[]).join('\n'));
    setText('revealMoves',moveNames().join('\n'));
    setText('revealShopping',(character.shops||[]).join('\n'));
    setText('revealDating',character.datingPreference);
    setText('revealBust',state.vampire?character.bust.vampire:character.bust.human);
  }
  function show(mode){if(window.RAPresentationDirector&&!window.__pdLegacy&&!RAPresentationDirector.current())RAPresentationDirector.enterUi({mode:'cinematic'});
    const overlay=el('revealOverlay');
    if(!overlay)return;
    overlay.classList.add('on');
    overlay.dataset.mode=mode;
    el('revealProfile')?.classList.add('on');
    el('revealBitePrompt')?.classList.toggle('on',mode==='bite');
    el('revealAftercare')?.classList.toggle('on',mode==='converted');
    el('revealFlyButton')?.toggleAttribute('disabled',mode!=='converted');
    el('revealBiteButton')?.toggleAttribute('disabled',mode!=='bite');
    const sprite=el('revealAssistantSprite');if(sprite){sprite.style.display='';sprite.classList.remove('fly');}
    setFrame(mode==='converted'?'vampire':'human');
    renderProfile();
  }
  async function convert(){
    const scope=beginAction();if(!scope)return;
    try{
    const biteButton=el('revealBiteButton');
    if(biteButton)biteButton.disabled=true;
    setFrame('bite');
    if(!await scope.delay(420))return;
    setFrame('transformation1');
    if(!await scope.delay(420))return;
    setFrame('transformation2');
    if(!await scope.delay(420))return;
    setFrame('vampire');
    RACharacterSystem.mark('ceo_assistant_001','vampire',true);window.RAPeople?.meetPerson('ceo_assistant_001');window.RAPeople?.setConversionState('ceo_assistant_001','converted');window.RAPeople?.rememberPersonEvent('ceo_assistant_001','ceo_assistant_converted');
    renderProfile();
    show('converted');
    }finally{endAction(scope);}
  }
  async function convertEncounterCharacter(id,assets={}){
    if(active||RACharacterSystem.runtime(id)?.vampire)return false;
    active=true;const overlay=el('revealOverlay'),sprite=el('revealAssistantSprite'),profile=el('revealProfile'),title=el('revealTitle');
    if(window.RAScenes)await RAScenes.go('jdmConversion');else RAState.patch('life.world.scene','jdmConversion');
    if(window.RAScenes&&RAScenes.current()!=='jdmConversion')return false;
    active=true;
    const scope=beginAction();if(!scope){active=false;return false;}
    try{
    overlay?.classList.add('on','external-conversion');overlay.dataset.mode='external';
    if(title)title.textContent='VAMPIRE CONVERSION';
    profile?.classList.remove('on');el('revealBitePrompt')?.classList.remove('on');el('revealAftercare')?.classList.remove('on');
    if(sprite){sprite.classList.remove('fly');sprite.style.display='block';sprite.style.backgroundImage=`url('${assets.human||''}')`;}
    if(!await scope.delay(420))return false;sprite?.classList.add('conversion-bite');if(!await scope.delay(420))return false;sprite?.classList.remove('conversion-bite');sprite?.classList.add('conversion-first');if(!await scope.delay(420))return false;sprite?.classList.remove('conversion-first');sprite?.classList.add('conversion-second');
    RACharacterSystem.mark(id,'vampire',true);window.RAPeople?.meetPerson(id,'jdm_imports_docks');window.RAPeople?.setConversionState(id,'converted');window.RAPeople?.rememberPersonEvent(id,'jdm_daughter_converted');if(!await scope.delay(420))return false;sprite?.classList.remove('conversion-second');if(sprite)sprite.style.backgroundImage=`url('${assets.vampire||assets.human||''}')`;if(!await scope.delay(650))return false;
    return true;
    }finally{endAction(scope);overlay?.classList.remove('on','external-conversion');if(overlay)overlay.dataset.mode='';sprite?.classList.remove('conversion-bite','conversion-first','conversion-second');if(title)title.textContent='CEO ASSISTANT #001';profile?.classList.add('on');active=false;}
  }
  async function fly(){
    const scope=beginAction();if(!scope||!runtime()?.vampire){endAction(scope);return;}
    try{
    const button=el('revealFlyButton');
    if(button)button.disabled=true;
    const sprite=el('revealAssistantSprite');
    setFrame('bat1');if(!await scope.delay(220))return;setFrame('bat2');if(!await scope.delay(220))return;setFrame('bat3');if(!await scope.delay(220))return;
    if(sprite){sprite.classList.add('fly');if(!await scope.delay(950))return;sprite.classList.remove('fly');sprite.style.display='none';}
    RAState.patch('encounters.ceo_prince.completed',true);
    RAState.patch('life.world.scene','throne_room');
    el('revealOverlay')._finishReveal?.();
    }finally{endAction(scope);}
  }
  async function open(){
    if(active)return;
    active=true;
    if(window.RADevState)window.RADevState.scene='character_reveal';
    if(window.RAScenes)await RAScenes.go('character_reveal');
    else RAState.patch('life.world.scene','character_reveal');
    if(window.RAScenes&&RAScenes.current()!=='character_reveal')return;
    active=true;
    show(runtime()?.vampire?'converted':'bite');
    return new Promise(resolve=>{
      el('revealOverlay')._finishReveal=()=>{active=false;resolve();};
      el('revealOverlay')._closeReveal=()=>{active=false;resolve();};
    });
  }
  function close(){if(RAPresentationDirector?.current?.()?.stage==='ui')RAPresentationDirector.exit();
    actionScope?.cancel();actionScope=null;active=false;
    const overlay=el('revealOverlay');
    if(overlay){overlay.classList.remove('on');overlay._closeReveal?.();}
    RAState.patch('life.world.scene','throne_room');
    if(window.RADevState)window.RADevState.scene='battle';
  }
  document.addEventListener('DOMContentLoaded',()=>{
    el('revealBiteButton')?.addEventListener('click',convert);
    el('revealFlyButton')?.addEventListener('click',fly);
  });
  if(window.RAScenes)RAScenes.register('character_reveal',{enter:()=>show(runtime()?.vampire?'converted':'bite'),exit:close});
  window.RACharacterReveal={open,close,convert,convertEncounterCharacter,fly,renderProfile};
})();
