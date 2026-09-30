(function(){
 'use strict';
 // F01 SHOWDOWN_CORE — fragment audio part (IF-1 4P RAAudioParts). FCPB CONVERGENCE: this part registers NOTHING.
 //
 // F01 used to register six INERT drop-in hooks (registered:false, file:null) for the tactical BX_* sfx tags it emits:
 // BX_SLIDEIN_IDLE, BX_NAMECARD_SLAM, BX_POD_REVEAL, BX_OVERWATCH, BX_COVER_HIT, BX_DOWNED. F11's real master family
 // (js/data/audio/parts/F04_blood_x.js, frag/audio-completion/001) registers the same ids with real files, and RAAudioParts refuses a
 // duplicate id ("parts may only add new ids"), so loading both throws (reproduced on the composed tree: "RAAudioParts(F04): audio
 // id BX_SLIDEIN_IDLE already exists"). The F11 master is canonical; this noncanonical inert duplicate was removed.
 // Call sites are unchanged: F01 still emits the `sfx` tags on its events (engine.js), and an unregistered id is inert.
 // BX_STEP (emitted on MOVE) has no registration anywhere: SOURCE_REQUIRED, safe fallback, no asset fabricated. BX_GONE / BX_WARROOM /
 // BX_CRATE belong to the strategic layer (F04) and come from the same F11 master.
 if(!window.RAAudioParts)throw new Error('F01 audio part must load after js/data/audio/manifest_parts.js');
})();
