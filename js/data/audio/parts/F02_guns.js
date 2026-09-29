(function(){
 'use strict';
 // F02 IRON & GRACE — fragment audio part (IF-1 4P RAAudioParts). Adds the neutral GN_01–GN_06 firearm codes from the
 // OPEN patch. They are NOT in RA_SFX_DELIVERY_v1 (the F11-A audit confirms it), so they ship as INERT drop-in hooks —
 // registered:false, file:null, expectedPath set — exactly like the accepted NO_01–NO_06 pattern. Nothing is sourced or
 // played until Audio supplies the files and flips `registered`. Existing F1 ids and buses are untouched.
 if(!window.RAAudioParts)throw new Error('F02 audio part must load after js/data/audio/manifest_parts.js');
 const entries=[
  {id:'GN_01',bus:'SFX',type:'one-shot',category:'iron_and_grace',gain:1,pitchJitter:.02,maxVoices:3,priority:3,
   file:null,expectedPath:'assets/audio/sfx/iron_and_grace/GN_01.mp3',registered:false,reason:'inert-drop-in-hook',
   licenseClass:'PENDING',attributionRequired:false,license:'',credit:'',author:'',sourceSite:'',sourceUrl:'',restrictions:[]},
  {id:'GN_02',bus:'SFX',type:'one-shot',category:'iron_and_grace',gain:1,pitchJitter:.02,maxVoices:3,priority:3,
   file:null,expectedPath:'assets/audio/sfx/iron_and_grace/GN_02.mp3',registered:false,reason:'inert-drop-in-hook',
   licenseClass:'PENDING',attributionRequired:false,license:'',credit:'',author:'',sourceSite:'',sourceUrl:'',restrictions:[]},
  {id:'GN_03',bus:'SFX',type:'loop',category:'iron_and_grace',gain:.9,pitchJitter:0,maxVoices:1,priority:3,
   file:null,expectedPath:'assets/audio/sfx/iron_and_grace/GN_03.mp3',registered:false,reason:'inert-drop-in-hook',
   licenseClass:'PENDING',attributionRequired:false,license:'',credit:'',author:'',sourceSite:'',sourceUrl:'',restrictions:[]},
  {id:'GN_04',bus:'SFX',type:'one-shot',category:'iron_and_grace',gain:1,pitchJitter:.02,maxVoices:3,priority:3,
   file:null,expectedPath:'assets/audio/sfx/iron_and_grace/GN_04.mp3',registered:false,reason:'inert-drop-in-hook',
   licenseClass:'PENDING',attributionRequired:false,license:'',credit:'',author:'',sourceSite:'',sourceUrl:'',restrictions:[]},
  {id:'GN_05',bus:'SFX',type:'one-shot',category:'iron_and_grace',gain:1,pitchJitter:.02,maxVoices:3,priority:3,
   file:null,expectedPath:'assets/audio/sfx/iron_and_grace/GN_05.mp3',registered:false,reason:'inert-drop-in-hook',
   licenseClass:'PENDING',attributionRequired:false,license:'',credit:'',author:'',sourceSite:'',sourceUrl:'',restrictions:[]},
  {id:'GN_06',bus:'SFX',type:'one-shot',category:'iron_and_grace',gain:.9,pitchJitter:.03,maxVoices:2,priority:2,
   file:null,expectedPath:'assets/audio/sfx/iron_and_grace/GN_06.mp3',registered:false,reason:'inert-drop-in-hook',
   licenseClass:'PENDING',attributionRequired:false,license:'',credit:'',author:'',sourceSite:'',sourceUrl:'',restrictions:[]}
 ];
 window.RAAudioParts.register('F02',{entries});
})();
