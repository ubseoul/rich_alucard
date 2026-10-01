(function(){
 'use strict';
 // F05 - THE TRAP - audio manifest part.
 // THE TRAP sec.10: "Sound (append to Sound Finder, neutral codes TR_01-TR_06)". The masters are NOT delivered on
 // this branch, so each id stays an INERT drop-in hook (file:null, registered:false) exactly like the accepted NEW
 // OGA NO_01-NO_06 hooks. Nothing plays until a master lands at the expected path.
 //
 // F11 READINESS (frag/audio-completion/001, docs/engineering/F11_AUDIO_COMPLETION_001.md): F11 registers TR_01-TR_06
 // as REAL audio at `assets/audio/sfx/trap/TR_0X.mp3` (categories `trap`) and supersedes this same-path file on
 // merge. The expectedPath below is corrected to that delivered runtime location so a dropped-in master resolves
 // without a second edit. The masters themselves are F11-owned: SOURCE_REQUIRED until F11 is merged.
 if(!window.RAAudioParts)return;
 var P='assets/audio/sfx/trap/';
 window.RAAudioParts.register('F05',{entries:[
  {id:'TR_01',bus:'AMBIENCE',type:'loop',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_01.mp3',reason:'inert-drop-in-hook'},
  {id:'TR_02',bus:'SFX',type:'one-shot',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_02.mp3',reason:'inert-drop-in-hook'},
  {id:'TR_03',bus:'SFX',type:'one-shot',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_03.mp3',reason:'inert-drop-in-hook'},
  {id:'TR_04',bus:'SFX',type:'one-shot',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_04.mp3',reason:'inert-drop-in-hook'},
  {id:'TR_05',bus:'AMBIENCE',type:'loop',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_05.mp3',reason:'inert-drop-in-hook'},
  {id:'TR_06',bus:'SFX',type:'one-shot',category:'the_trap',file:null,registered:false,expectedPath:P+'TR_06.mp3',reason:'inert-drop-in-hook'}
 ],scenes:{the_trap:{ambience:'TR_01',preload:['TR_02','TR_03','TR_04','TR_05','TR_06']}}});
})();
