(function(){
 'use strict';
 // OL-043, explicit Ube choice: “that's it the smg burst” = GN_01. Reuse ingested recording and its license.
 // Fill the existing pending logical ID via the manifest's supported register API; no generated file/asset edited.
 const M=window.RAAudioManifest,pick=M.get('GN_01');
 if(!pick?.registered)throw new Error('MAGIC_SEANCE pick GN_01 must be ingested first');
 M.register({...pick,id:'MAGIC_SEANCE',category:'combat',bus:'SFX',selectedFrom:'GN_01',selectionAuthority:'Ube / OL-043'});
})();
