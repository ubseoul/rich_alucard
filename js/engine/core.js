(function(){
 window.RABuild={version:'6b-hotfix3-build-id-20260922.1'};
 window.RAEngine={version:'0.23-foundation',state:window.RAState,scenes:window.RAScenes,audio:window.RAAudio,characters:window.RACharacterSystem,budget:window.RABudget};
 document.dispatchEvent(new CustomEvent('ra:ready',{detail:{version:window.RAEngine.version}}));
})();
