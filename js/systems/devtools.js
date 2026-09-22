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
    const scene=s.scene||window.RAScenes?.current?.()||'battle';const richState=scene==='bedroom'?(s.bedroomRichState||'lounge_idle'):(s.richState||'idle');
    const lines=[`SCENE: ${scene}`,`RICH: ${richState}`,...(scene==='bedroom'?[`CLOUDS: ${window.RABedroom?.cloudCount?.()??0}`]:[]),`CEO DEFEATED: ${!!save.encounters?.ceo_prince?.defeated}`,`ASSISTANT: ${JSON.stringify(save.characters?.ceo_assistant_001||{})}`,`AUDIO: ${audio?audio.currentTime.toFixed(2):'--'}`,`REVENGE STORED: ${s.revengeStoredDamage??0}`,`FONT: ${document.documentElement.dataset.devFont||'control'}`,`TINT: ${document.querySelector('#screen')?.classList.contains('cartridge-tint')?'ON':'OFF'}`];
    if(readout())readout().textContent=lines.join('\n');
  }
  function setEnabled(value){enabled=value;document.body.classList.toggle('dev-enabled',enabled);if(enabled){applyFont(document.documentElement.dataset.devFont||'control');refresh();}else panel()?.classList.remove('show');}
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelector('#devFont')?.addEventListener('change',e=>{applyFont(e.target.value);refresh();});
    document.querySelector('#devTint')?.addEventListener('change',e=>{applyTint(e.target.checked);refresh();});
    document.querySelector('#devSmoke')?.addEventListener('click',()=>window.RASmoke?.run?.());
    setEnabled(enabled);if(enabled)panel()?.classList.add('show');
    setInterval(refresh,250);
  });
  window.addEventListener('keydown',e=>{if(e.key==='F2'){e.preventDefault();setEnabled(!enabled);panel()?.classList.toggle('show',enabled);}});
  window.RADev={enable:()=>setEnabled(true),disable:()=>setEnabled(false),refresh};
})();
