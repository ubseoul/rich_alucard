(function(){
 'use strict';
 // F04 PLAYMAKERS / BLOOD X — fragment audio part (IF-1 4P RAAudioParts).
 // F11-A audio completion (frag/audio-completion/001): the BX_* showdown family is sourced from
 // PATCH_SOUND_FINDER_DELIVERY (source masters: CC0 1.0, original in-project synthesis) and encoded to the accepted
 // runtime MP3 convention by tools/audio-build.mjs. BX ids are new to the manifest (not in RA_SFX_DELIVERY_v1).
 // BLOOD X / PLAYMAKERS has no authored runtime hook on the frozen IF-1 base or the F04 branch (checked), so these
 // are REGISTERED — CONSUMER_PENDING. If the owner assigns BLOOD X to F07, rename this file/registration — no ids change.
 if(!window.RAAudioParts)throw new Error('F04 audio part must load after js/data/audio/manifest_parts.js');
 const LIC={licenseClass:'CC0',attributionRequired:false,license:'CC0 1.0 Universal',credit:'',author:'Antigravity',sourceSite:'Original work — synthesized in-project',sourceUrl:''};
 const oneShot=(id,bus,pj,mv,pri,variations=[])=>({id,bus,type:'one-shot',category:'showdown',gain:1,pitchJitter:pj,maxVoices:mv,priority:pri,file:`assets/audio/sfx/showdown/${id}.mp3`,expectedPath:`assets/audio/sfx/showdown/${id}.mp3`,registered:true,loopStart:null,loopEnd:null,variations,parts:[],...LIC});
 const loop=(id,bus,loopEnd,pri)=>({id,bus,type:'loop',category:'showdown',gain:1,pitchJitter:0,maxVoices:1,priority:pri,file:`assets/audio/sfx/showdown/${id}.mp3`,expectedPath:`assets/audio/sfx/showdown/${id}.mp3`,registered:true,loopStart:0,loopEnd,variations:[],parts:[],...LIC});
 window.RAAudioParts.register('F04',{entries:[
  oneShot('BX_SLIDEIN_IDLE','SFX',0.01,1,4),
  oneShot('BX_NAMECARD_SLAM','UI',0.02,2,4),
  oneShot('BX_POD_REVEAL','SFX',0.01,1,4),
  oneShot('BX_OVERWATCH','SFX',0.02,2,4),
  oneShot('BX_COVER_HIT','SFX',0.05,4,3,['assets/audio/sfx/showdown/BX_COVER_HIT__alt1.mp3']),
  oneShot('BX_DOWNED','SFX',0.01,1,4),
  oneShot('BX_GONE','SFX',0.00,1,4),
  loop('BX_WARROOM','AMBIENCE',59.199,2),
  oneShot('BX_CRATE','SFX',0.03,2,3)
 ]});
})();
