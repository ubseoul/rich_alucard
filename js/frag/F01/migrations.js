(function(){
 'use strict';
 // F01 SHOWDOWN_CORE — save namespace declaration ONLY (IF-1 4B). No schema version is claimed here: the integration owner
 // assigns it in js/if1/migration_ledger.js when F01 is merged. The namespace is created lazily, so with the flag OFF a save
 // is byte-identical to a save without F01.
 if(window.RAMigrations)window.RAMigrations.namespace('F01',{active:null});
})();
