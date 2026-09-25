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
  let active=false;

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
    setFrame(mode==='converted'?'vampire':'human');
    renderProfile();
  }
  function pause(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
  async function convert(){
    const biteButton=el('revealBiteButton');
    if(biteButton)biteButton.disabled=true;
    setFrame('bite');
    await pause(420);
    setFrame('transformation1');
    await pause(420);
    setFrame('transformation2');
    await pause(420);
    setFrame('vampire');
    RACharacterSystem.mark('ceo_assistant_001','vampire',true);window.RAPeople?.meetPerson('ceo_assistant_001');window.RAPeople?.setConversionState('ceo_assistant_001','converted');window.RAPeople?.rememberPersonEvent('ceo_assistant_001','ceo_assistant_converted');
    renderProfile();
    show('converted');
  }
  async function convertEncounterCharacter(id,assets={}){
    if(active||RACharacterSystem.runtime(id)?.vampire)return false;
    active=true;const overlay=el('revealOverlay'),sprite=el('revealAssistantSprite'),profile=el('revealProfile'),title=el('revealTitle');
    if(window.RAScenes)await RAScenes.go('jdmConversion');else RAState.patch('life.world.scene','jdmConversion');
    overlay?.classList.add('on','external-conversion');overlay.dataset.mode='external';
    if(title)title.textContent='VAMPIRE CONVERSION';
    profile?.classList.remove('on');el('revealBitePrompt')?.classList.remove('on');el('revealAftercare')?.classList.remove('on');
    if(sprite){sprite.classList.remove('fly');sprite.style.display='block';sprite.style.backgroundImage=`url('${assets.human||''}')`;}
    await pause(420);sprite?.classList.add('conversion-bite');await pause(420);sprite?.classList.remove('conversion-bite');sprite?.classList.add('conversion-first');await pause(420);sprite?.classList.remove('conversion-first');sprite?.classList.add('conversion-second');
    RACharacterSystem.mark(id,'vampire',true);window.RAPeople?.meetPerson(id,'jdm_imports_docks');window.RAPeople?.setConversionState(id,'converted');window.RAPeople?.rememberPersonEvent(id,'jdm_daughter_converted');await pause(420);sprite?.classList.remove('conversion-second');if(sprite)sprite.style.backgroundImage=`url('${assets.vampire||assets.human||''}')`;await pause(650);
    overlay?.classList.remove('on','external-conversion');overlay.dataset.mode='';if(title)title.textContent='CEO ASSISTANT #001';profile?.classList.add('on');active=false;return true;
  }
  async function fly(){
    const button=el('revealFlyButton');
    if(button)button.disabled=true;
    const sprite=el('revealAssistantSprite');
    setFrame('bat1');await pause(220);setFrame('bat2');await pause(220);setFrame('bat3');await pause(220);
    if(sprite){sprite.classList.add('fly');await pause(950);sprite.classList.remove('fly');sprite.style.display='none';}
    RAState.patch('encounters.ceo_prince.completed',true);
    RAState.patch('life.world.scene','throne_room');
    el('revealOverlay')._finishReveal?.();
  }
  async function open(){
    if(active)return;
    active=true;
    if(window.RADevState)window.RADevState.scene='character_reveal';
    if(window.RAScenes)await RAScenes.go('character_reveal');
    else RAState.patch('life.world.scene','character_reveal');
    show(runtime()?.vampire?'converted':'bite');
    return new Promise(resolve=>{
      el('revealOverlay')._finishReveal=()=>{active=false;resolve();};
      el('revealOverlay')._closeReveal=()=>{active=false;resolve();};
    });
  }
  function close(){if(RAPresentationDirector?.current?.()?.stage==='ui')RAPresentationDirector.exit();
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
