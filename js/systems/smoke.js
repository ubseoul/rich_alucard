(function(){
  const checks=[
    ['core battle nodes',()=>['#startButton','#battleUI','#moves','#soundtrack'].every(sel=>document.querySelector(sel))],
    ['all move buttons',()=>document.querySelectorAll('[data-move]').length===4],
    ['conversion scene',()=>!!document.querySelector('#revealOverlay')],
    ['authored portrait room',()=>getComputedStyle(document.querySelector('.room')).backgroundImage.includes('throne_room_scene_portrait')],
    ['state foundation',()=>!!window.RAState&&!!window.RACharacterSystem]
  ];
  async function run(){
    const results=[];for(const [name,test] of checks){let pass=false;try{pass=!!(await test());}catch(e){}results.push(`${pass?'PASS':'FAIL'} — ${name}`);}
    const summary=results.join('\n');console.log('[RA smoke]\n'+summary);const toast=document.querySelector('#toast');if(toast){toast.textContent=summary;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600);}return results;
  }
  window.RASmoke={run,checks};
})();
