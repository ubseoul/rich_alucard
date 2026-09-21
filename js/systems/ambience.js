(function(){
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function spawn(){
    const layer=document.querySelector('#ambienceLayer');
    if(!layer||reduced)return;
    const count=1+Math.floor(Math.random()*3);
    for(let i=0;i<count;i++){
      const bat=document.createElement('span');bat.className='ambience-bat';
      bat.style.top=`${18+Math.random()*42}%`;
      bat.style.setProperty('--bat-duration',`${1.7+Math.random()*1.8}s`);
      bat.style.setProperty('--bat-delay',`${i*90}ms`);
      bat.style.setProperty('--bat-scale',`${.65+Math.random()*.45}`);
      layer.appendChild(bat);setTimeout(()=>bat.remove(),4200);
    }
    schedule();
  }
  function schedule(){setTimeout(spawn,7000+Math.random()*9000);}
  document.addEventListener('DOMContentLoaded',schedule,{once:true});
  window.RAAmbience={spawn};
})();
