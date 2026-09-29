(function(){
 'use strict';
 // F05 - THE TRAP - audio manifest part.
 // THE TRAP sec.10: "Sound (append to Sound Finder, neutral codes TR_01-TR_06)". The masters are NOT delivered, so
 // each id is registered as an INERT drop-in hook (file:null, registered:false) exactly like the accepted NEW OGA
 // NO_01-NO_06 hooks. Nothing plays until a master lands at the expected path; the global audio manifest is not
 // edited. The fragment scene gets the loop as its ambience and preloads (inert hooks no-op).
 if(!window.RAAudioParts)return;
 var P='assets/audio/sfx/the_trap/';
 window.RAAudioParts.register('F05',{entries:[
  {id:'TR_01',bus:'AMBIENCE',type:'loop',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_01.mp3',reason:'inert-drop-in-hook'},
  {id:'TR_02',bus:'SFX',type:'one-shot',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_02.mp3',reason:'inert-drop-in-hook'},
  {id:'TR_03',bus:'SFX',type:'one-shot',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_03.mp3',reason:'inert-drop-in-hook'},
  {id:'TR_04',bus:'SFX',type:'one-shot',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_04.mp3',reason:'inert-drop-in-hook'},
  {id:'TR_05',bus:'AMBIENCE',type:'loop',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_05.mp3',reason:'inert-drop-in-hook'},
  {id:'TR_06',bus:'SFX',type:'one-shot',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_06.mp3',reason:'inert-drop-in-hook'}
 ],scenes:{the_trap:{ambience:'TR_01',preload:['TR_02','TR_03','TR_04','TR_05','TR_06']}}});
})();
