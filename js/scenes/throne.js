(function(){
 // Throne-room CEO fight — Presentation Director scene. The legacy 'battle' state had no scene hooks (it is the
 // boot default), so its framing lived in accumulated CSS. The Director now owns room framing, actor size and
 // world-attached FX; combat rules and flow stay in game.js unchanged.
 const q=selector=>document.querySelector(selector);
 function enterThrone(scope){
  const director=window.RAPresentationDirector,stage=window.RAStages?.get('throne-room');if(!director||!stage)return;
  director.enter({stage:'throne-room',mode:'combat',beat:'combat',scope,env:q('.room'),envAsset:stage.environment,
   actors:{rich:q('#geminiRich'),ceo:q('#productionCEO'),assistant:q('#productionAssistant')},roles:stage.director.roles,
   viewportLayers:[q('#ambienceLayer')].filter(Boolean),
   worldLayers:['#bloodBathRear','#bloodBathForeground'].map(sel=>({el:q(sel),rect:stage.director.worldLayers.bloodBath})).filter(layer=>layer.el)});
 }
 RAScenes.register('battle',{enter:({scope})=>enterThrone(scope),exit:()=>window.RAPresentationDirector?.exit()});
 // 'battle' is the boot scene and is never entered through RAScenes.go at load.
 document.addEventListener('DOMContentLoaded',()=>{if(RAScenes.current()==='battle')enterThrone(RAScenes.createScope('battle-boot'))},{once:true});
})();
