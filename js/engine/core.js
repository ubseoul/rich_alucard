(function(){
 window.RABuild={version:'foundation-wave1-save-integrity-20260922.3'};
 window.RAEngine={version:'0.23-foundation',state:window.RAState,scenes:window.RAScenes,audio:window.RAAudio,characters:window.RACharacterSystem,budget:window.RABudget};
 document.dispatchEvent(new CustomEvent('ra:ready',{detail:{version:window.RAEngine.version}}));
})();
