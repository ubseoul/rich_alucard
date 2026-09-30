(function(){
 'use strict';
 // F01 SHOWDOWN_CORE — fragment audio part (IF-1 4P RAAudioParts). Vol 7 section 11 "SOUND ADDITIONS": the tactical codes F01 emits as
 // `sfx` tags on its events. They are NOT in RA_SFX_DELIVERY_v1, so they ship as INERT drop-in hooks (registered:false,
 // file:null) exactly like the accepted NO_01-NO_06 pattern; nothing plays until Audio supplies the files and flips `registered`.
 // BX_SLIDEIN_IDLE / BX_NAMECARD_SLAM are the presentation-director slide-in cues, registered here because F01 emits them for the
 // neutral Rich pull-up and result card. BX_GONE, BX_WARROOM and BX_CRATE belong to the strategic layer (F04) and are NOT registered here.
 // The sandbox uses synthesised placeholder sounds (js/frag/F01/sfx.js), never these ids.
 if(!window.RAAudioParts)throw new Error('F01 audio part must load after js/data/audio/manifest_parts.js');
 const hook=(id,type,priority,maxVoices,gain)=>({id,bus:'SFX',type,category:'showdown',gain,pitchJitter:0,maxVoices,priority,
  file:null,expectedPath:`assets/audio/sfx/showdown/${id}.mp3`,registered:false,reason:'inert-drop-in-hook',
  licenseClass:'PENDING',attributionRequired:false,license:'',credit:'',author:'',sourceSite:'',sourceUrl:'',restrictions:[]});
 const entries=[
  hook('BX_SLIDEIN_IDLE','one-shot',3,1,1),   // low engine idle under rain, car door thunk x4 (3-4s)
  hook('BX_NAMECARD_SLAM','one-shot',4,2,1),  // heavy fighting-game card slam with a bass hit (0.4-0.6s)
  hook('BX_POD_REVEAL','one-shot',4,1,1),     // sharp tension sting when enemies are spotted (0.8-1s)
  hook('BX_OVERWATCH','one-shot',3,2,.9),     // gun cock plus a held breath tone (0.6s)
  hook('BX_COVER_HIT','one-shot',3,3,1),      // bullet impact on car metal / brick, 2 variants (0.3s)
  hook('BX_DOWNED','one-shot',4,1,1)          // body fall and a heartbeat that starts (1.5-2s)
 ];
 window.RAAudioParts.register('F01',{entries});
})();
