(function(){
 'use strict';
 // OL-054 supersedes OL-043's SMG stand-in: accepted occult stinger fits summoning a ghost.
 // Fill the existing pending logical ID via the manifest's supported register API; no generated file/asset edited.
 const M=window.RAAudioManifest,pick=M.get('MAGIC_HEX');
 if(!pick?.registered)throw new Error('MAGIC_SEANCE pick MAGIC_HEX must be ingested first');
 M.register({...pick,id:'MAGIC_SEANCE',category:'combat',bus:'SFX',selectedFrom:'MAGIC_HEX',selectionAuthority:'Ube / OL-054 non-gun library replacement'});
})();
