(function(){
 window.RAEngine={version:'0.23-foundation',state:RAState,scenes:RAScenes,audio:RAAudio,characters:RACharacterSystem,budget:RABudget};
 document.dispatchEvent(new CustomEvent('ra:ready',{detail:{version:RAEngine.version}}));
})();
