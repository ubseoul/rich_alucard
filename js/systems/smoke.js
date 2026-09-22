(function(){
  const checks=[
    ['core battle nodes',()=>['#startButton','#battleUI','#moves','#soundtrack'].every(sel=>document.querySelector(sel))],
    ['all move buttons',()=>document.querySelectorAll('[data-move]').length===4],
    ['conversion scene',()=>!!document.querySelector('#revealOverlay')],
    ['authored portrait room',()=>getComputedStyle(document.querySelector('.room')).backgroundImage.includes('throne_room_scene_portrait')],
    ['bedroom scene layers',()=>!!document.querySelector('#bedroomScene .bedroom-base')&&!!document.querySelector('#bedroomCloudCanvas')&&!!document.querySelector('#bedroomRich')],
    ['phone access and exact authored apps',()=>!!document.querySelector('#checkPhone')&&!!document.querySelector('#phoneOverlay')&&JSON.stringify(window.RAPhone?.apps)===JSON.stringify(['VampGPT','VampGram','InstaHoe','RealMoneyRealEstate','JDMIMPORTS','RICHBOIMPORTS','ONLYVAMPS'])],
    ['phone state defaults',()=>RAState.get().rich.budget===100000&&RAState.get().rich.location==='LA'&&RAState.get().rich.clout==='LOW'&&typeof RAState.get().phone.learned==='boolean'],
    ['desire trip scene and state foundation',()=>!!window.RADesireTrips&&['planned','traveling','arrived','completed'].every(x=>RADesireTrips.statuses.includes(x))&&!!document.querySelector('#tripTravel')&&!!document.querySelector('#powderSpringsCurb')&&!!document.querySelector('#stargazingScene')&&Object.prototype.hasOwnProperty.call(RAState.get(),'activeTrip')],
    ['native bedroom cloud canvas',()=>{const c=document.querySelector('#bedroomCloudCanvas');return c?.width===270&&c?.height===480&&getComputedStyle(c).imageRendering==='pixelated'}],
    ['bedroom authored state controls',()=>document.querySelectorAll('[data-bedroom-state]').length===6],
    ['bedroom source assets load at authored sizes',async()=>{const specs=[['rich_bedroom_environment_270x480.png',270,480],...['lounge_idle','phone_scroll','small_idle','phone_reaction','sleeping','drowsy_wake'].map(n=>[`rich_bedroom_${n}.png`,128,64]),['bedroom_cloud_large.png',136,40],['bedroom_cloud_medium.png',88,44],['bedroom_cloud_small.png',52,24]];const loaded=await Promise.all(specs.map(([file,w,h])=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.naturalWidth===w&&i.naturalHeight===h);i.onerror=()=>resolve(false);i.src=`assets/${file}`})));return loaded.every(Boolean)}],
    ['state foundation',()=>!!window.RAState&&!!window.RACharacterSystem]
  ];
  async function run(){
    const results=[];for(const [name,test] of checks){let pass=false;try{pass=!!(await test());}catch(e){}results.push(`${pass?'PASS':'FAIL'} — ${name}`);}
    const summary=results.join('\n');console.log('[RA smoke]\n'+summary);const toast=document.querySelector('#toast');if(toast){toast.textContent=summary;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600);}return results;
  }
  window.RASmoke={run,checks};
})();
