(function(){
 'use strict';
 // F01 SHOWDOWN_CORE — IF-1 registration. DARK by default: the flag is registered OFF (only the integration owner may flip it in
 // js/if1/flag_defaults.js). Nothing is added to the phone, WAKE, the save or Combat 2.0 by F01: it is a system other fragments
 // call. In the game this file only registers the flag and reports readiness; in the standalone sandbox page RAFeatures is absent.
 if(!window.RAFeatures)return;
 window.RAFeatures.register({id:'F01.showdown_core',fragment:'F01',description:'SHOWDOWN_CORE: reusable 6x9 XCOM-style tactical combat (Vol 7 section 5)'});
})();
