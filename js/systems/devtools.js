(function(){
  const params=new URLSearchParams(location.search);
  let enabled=params.get('dev')==='1';
  const panel=()=>document.querySelector('#devPanel');
  const readout=()=>document.querySelector('#devReadout');
  function applyFont(name){document.documentElement.dataset.devFont=name;const select=document.querySelector('#devFont');if(select)select.value=name;}
  function applyTint(on){document.querySelector('#screen')?.classList.toggle('cartridge-tint',on);const input=document.querySelector('#devTint');if(input)input.checked=on;}
  function refresh(){
    if(!enabled)return;
    const s=window.RADevState||{};const save=window.RAState?.get?.()||{};const audio=document.querySelector('#soundtrack');
    const scene=window.RAScenes?.current?.()||s.scene||'battle';const richState=scene==='bedroom'?(s.bedroomRichState||'lounge_idle'):scene==='battle'?(s.richState||'idle'):'--';
    const life=save.life||{},trip=life.desires?.activeTrip;const tripLine=trip?`${trip.id} / ${trip.status} / ${trip.destination?.name||'--'}`:'NONE';
    const lines=[`BUILD: ${window.RABuild?.version||'loading'}`,`SCENE: ${scene}`,`RICH: ${richState}`,...(scene==='bedroom'?[`CLOUDS: ${window.RABedroom?.cloudCount?.()??0}`]:[]),`CASH: $${life.resources?.money??0}`,`LOCATION: ${life.world?.location??'--'}`,`CLOUT: ${life.resources?.clout??'--'}`,`PHONE LEARNED: ${!!life.phone?.learned}`,`ACTIVE TRIP: ${tripLine}`,`CEO DEFEATED: ${!!save.encounters?.ceo_prince?.defeated}`,`ASSISTANT: ${JSON.stringify(save.characters?.ceo_assistant_001||{})}`,`AUDIO: ${audio?audio.currentTime.toFixed(2):'--'}`,`REVENGE STORED: ${s.revengeStoredDamage??0}`,`FONT: ${document.documentElement.dataset.devFont||'control'}`,`TINT: ${document.querySelector('#screen')?.classList.contains('cartridge-tint')?'ON':'OFF'}`];
    if(readout())readout().textContent=lines.join('\n');
    const form={money:life.resources?.money??100000,location:life.world?.location??'LA',clout:life.resources?.clout??'LOW',vampireRep:life.resources?.vampireReputation??'LOW'};
    for(const [id,value] of [['devLifeMoney',form.money],['devLifeLocation',form.location],['devLifeClout',form.clout],['devLifeVampireRep',form.vampireRep]]){const input=document.querySelector(`#${id}`);if(input&&document.activeElement!==input)input.value=String(value);}
    const preview=!!document.querySelector('#devTokyoPreview')?.checked;
    const rules=window.RAOpportunities?.list()||[];let previewTokyo=null;
    if(preview&&window.RAOpportunities){const simulated=JSON.parse(JSON.stringify(life));simulated.world.flags.tokyoAccess=true;previewTokyo=window.RAOpportunities.evaluate(window.RAOpportunities.definitions.find(x=>x.id==='tokyo'),simulated);}
    const inspector={identity:life.identity,world:life.world,resources:life.resources,ownership:life.ownership,people:life.people,creativeLife:life.creativeLife,phone:life.phone,desires:life.desires,opportunities:{rules:rules.map(({id,category,label,available,requirements,failures,lockedMessage,resultScene,action})=>({id,category,label,available,requirements,failures,lockedMessage,resultScene,action})),tokyoSessionPreview:previewTokyo},history:life.history};
    const lifeReadout=document.querySelector('#devLifeReadout');if(lifeReadout)lifeReadout.textContent=JSON.stringify(inspector,null,2);
  }
  function setEnabled(value){enabled=value;document.body.classList.toggle('dev-enabled',enabled);if(enabled){applyFont(document.documentElement.dataset.devFont||'control');refresh();}else panel()?.classList.remove('show');}
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelector('#devFont')?.addEventListener('change',e=>{applyFont(e.target.value);refresh();});
    document.querySelector('#devTint')?.addEventListener('change',e=>{applyTint(e.target.checked);refresh();});
    document.querySelector('#devLifeApply')?.addEventListener('click',()=>{const value=id=>document.querySelector(`#${id}`)?.value;const money=Number(value('devLifeMoney'));if(Number.isFinite(money))window.RAState.patch('life.resources.money',money);window.RAState.patch('life.world.location',String(value('devLifeLocation')||'LA'));window.RAState.patch('life.resources.clout',String(value('devLifeClout')||'LOW').toUpperCase());window.RAState.patch('life.resources.vampireReputation',String(value('devLifeVampireRep')||'LOW').toUpperCase());refresh();});
    document.querySelector('#devTokyoPreview')?.addEventListener('change',refresh);
    document.querySelector('#devSmoke')?.addEventListener('click',()=>window.RASmoke?.run?.());
    setEnabled(enabled);if(enabled)panel()?.classList.add('show');
    setInterval(refresh,250);
  });
  window.addEventListener('keydown',e=>{if(e.key==='F2'){e.preventDefault();setEnabled(!enabled);panel()?.classList.toggle('show',enabled);}});
  window.RADev={enable:()=>setEnabled(true),disable:()=>setEnabled(false),refresh};
})();
