(function(){
 'use strict';
 // RC2 BUILD 2 · COMBAT-UI-DURING-CONVERSATION FIX. The base layer of the stage is the throne-room battle (HUD,
 // command panel, moves, fighters). Any non-battle scene (adventure dialogue, property, rave, character reveal,
 // stargazing, bedroom) must never show it — not even for a frame while a scene is transitioning, and not when a
 // scene leaves a stale *-mode class on <body>. Spoken lines inside the battle scene itself (JDM importer bubbles,
 // CEO banter) hide the command panel while someone is talking so the beat reads as a conversation.
 const body=document.body;
 function set(id){if(id)body.dataset.raScene=id;}
 if(window.RAScenes&&!window.RAScenes.__rc2guard){
  const go=window.RAScenes.go;
  window.RAScenes.go=function(id,payload){body.dataset.raSceneNext=id;const p=go.call(this,id,payload);Promise.resolve(p).finally(()=>{delete body.dataset.raSceneNext;set(window.RAScenes.current());});return p;};
  window.RAScenes.__rc2guard=true;
 }
 document.addEventListener('ra:scene',e=>set(e.detail?.id));
 set(window.RAScenes?.current?.()||'battle');
 // talking inside the battle scene
 const toast=document.querySelector('#toast');
 if(toast){
  const sync=()=>{const talk=toast.classList.contains('show')&&toast.classList.contains('jdm-speaker-bubble');body.classList.toggle('rc2-talking',talk);};
  new MutationObserver(sync).observe(toast,{attributes:true,attributeFilter:['class']});sync();
 }
 window.RASceneGuard={set,talking:()=>body.classList.contains('rc2-talking')};
})();
