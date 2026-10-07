(function(){
 'use strict';
 // F05 THE TRAP / COUNTING — fragment audio part (IF-1 4P RAAudioParts).
 // F11-A audio completion (frag/audio-completion/001): TR_01–TR_06 are sourced from PATCH_SOUND_FINDER_DELIVERY
 // (source masters: CC0 1.0, original in-project synthesis) and encoded to the accepted runtime MP3 convention by
 // tools/audio-build.mjs. TR ids are new to the manifest (they were not in RA_SFX_DELIVERY_v1). The F05 consumer
 // branch is not present on the frozen IF-1 base, so these are REGISTERED — CONSUMER_PENDING; no call site is invented.
 if(!window.RAAudioParts)throw new Error('F05 audio part must load after js/data/audio/manifest_parts.js');
 const LIC={licenseClass:'CC0',attributionRequired:false,license:'CC0 1.0 Universal',credit:'',author:'Antigravity',sourceSite:'Original work — synthesized in-project',sourceUrl:''};
 const oneShot=(id,pj,mv,pri)=>({id,bus:'SFX',type:'one-shot',category:'trap',gain:1,pitchJitter:pj,maxVoices:mv,priority:pri,file:`assets/audio/sfx/trap/${id}.mp3`,expectedPath:`assets/audio/sfx/trap/${id}.mp3`,registered:true,loopStart:null,loopEnd:null,variations:[],parts:[],...LIC});
 const loop=(id,loopEnd,pri)=>({id,bus:'AMBIENCE',type:'loop',category:'trap',gain:1,pitchJitter:0,maxVoices:1,priority:pri,file:`assets/audio/sfx/trap/${id}.mp3`,expectedPath:`assets/audio/sfx/trap/${id}.mp3`,registered:true,loopStart:0,loopEnd,variations:[],parts:[],...LIC});
 window.RAAudioParts.register('F05',{entries:[
  loop('TR_01',3.477,3),
  oneShot('TR_02',0.03,2,3),
  oneShot('TR_03',0.04,3,3),
  oneShot('TR_04',0.02,2,4),
  loop('TR_05',2.632,3),
  oneShot('TR_06',0.04,3,3)
 ],scenes:{the_trap:{ambience:'TR_01',preload:['TR_02','TR_03','TR_04','TR_05','TR_06']}}});
})();
