(function(){
 'use strict';
 // F02 IRON & GRACE — fragment audio part (IF-1 4P RAAudioParts).
 // F11-A audio completion (frag/audio-completion/001): GN_01–GN_06 are now sourced from PATCH_SOUND_FINDER_DELIVERY
 // (source masters: CC0 1.0, original in-project synthesis — see docs/engineering/F11_AUDIO_COMPLETION_001.md) and
 // encoded to the accepted runtime MP3 convention by tools/audio-build.mjs. This supersedes the earlier inert
 // drop-in hook file of the same name: same ids, fragment, category and runtime paths — now registered:true.
 // Consumer seam: js/frag/F02/catalog.js (`audio:'GN_0X'`) authored on the F02 branch. No call site exists on the
 // frozen IF-1 base, so these are REGISTERED — CONSUMER_PENDING. No game mechanic is invented here.
 if(!window.RAAudioParts)throw new Error('F02 audio part must load after js/data/audio/manifest_parts.js');
 const LIC={licenseClass:'CC0',attributionRequired:false,license:'CC0 1.0 Universal',credit:'',author:'Antigravity',sourceSite:'Original work — synthesized in-project',sourceUrl:''};
 const oneShot=(id,pj,mv,pri)=>({id,bus:'SFX',type:'one-shot',category:'iron_and_grace',gain:1,pitchJitter:pj,maxVoices:mv,priority:pri,file:`assets/audio/sfx/iron_and_grace/${id}.mp3`,expectedPath:`assets/audio/sfx/iron_and_grace/${id}.mp3`,registered:true,loopStart:null,loopEnd:null,variations:[],parts:[],...LIC});
 const loop=(id,loopEnd,pri)=>({id,bus:'SFX',type:'loop',category:'iron_and_grace',gain:1,pitchJitter:0,maxVoices:1,priority:pri,file:`assets/audio/sfx/iron_and_grace/${id}.mp3`,expectedPath:`assets/audio/sfx/iron_and_grace/${id}.mp3`,registered:true,loopStart:0,loopEnd,variations:[],parts:[],...LIC});
 window.RAAudioParts.register('F02',{entries:[
  oneShot('GN_01',0.03,2,4),
  oneShot('GN_02',0.03,2,3),
  loop('GN_03',2.585,4),
  oneShot('GN_04',0.02,2,4),
  oneShot('GN_05',0.03,2,4),
  oneShot('GN_06',0.04,4,3)
 ]});
})();
