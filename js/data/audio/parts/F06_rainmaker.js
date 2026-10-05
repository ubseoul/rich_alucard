(function(){
 'use strict';
 // F06 RAINMAKER — fragment audio part (IF-1 4P RAAudioParts).
 // F11-A audio completion (frag/audio-completion/001): RM_01–RM_08 are sourced from PATCH_SOUND_FINDER_DELIVERY
 // (source masters: CC0 1.0, original in-project synthesis) and encoded to the accepted runtime MP3 convention by
 // tools/audio-build.mjs. RM ids are new to the manifest (not in RA_SFX_DELIVERY_v1). The F06 consumer branch is not
 // present on the frozen IF-1 base, so these are REGISTERED — CONSUMER_PENDING; no call site is invented.
 if(!window.RAAudioParts)throw new Error('F06 audio part must load after js/data/audio/manifest_parts.js');
 const LIC={licenseClass:'CC0',attributionRequired:false,license:'CC0 1.0 Universal',credit:'',author:'Antigravity',sourceSite:'Original work — synthesized in-project',sourceUrl:''};
 const oneShot=(id,pj,mv,pri)=>({id,bus:'SFX',type:'one-shot',category:'rainmaker',gain:1,pitchJitter:pj,maxVoices:mv,priority:pri,file:`assets/audio/sfx/rainmaker/${id}.mp3`,expectedPath:`assets/audio/sfx/rainmaker/${id}.mp3`,registered:true,loopStart:null,loopEnd:null,variations:[],parts:[],...LIC});
 const loop=(id,bus,loopEnd,pri)=>({id,bus,type:'loop',category:'rainmaker',gain:1,pitchJitter:0,maxVoices:1,priority:pri,file:`assets/audio/sfx/rainmaker/${id}.mp3`,expectedPath:`assets/audio/sfx/rainmaker/${id}.mp3`,registered:true,loopStart:0,loopEnd,variations:[],parts:[],...LIC});
 window.RAAudioParts.register('F06',{entries:[
  oneShot('RM_01',0.03,3,4),
  oneShot('RM_02',0.04,4,4),
  oneShot('RM_03',0.03,2,3),
  oneShot('RM_04',0.03,2,4),
  loop('RM_05','SFX',1.739,4),
  oneShot('RM_06',0.02,2,3),
  loop('RM_07','AMBIENCE',59.199,2),
  oneShot('RM_08',0.01,1,4)
 ]});
})();
