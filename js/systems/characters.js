(function(){
 function data(id){return RACharacters[id]||null;}
 function runtime(id){return RAState.get().characters[id]||null;}
 function mark(id,key,value=true){RAState.patch(`characters.${id}.${key}`,value);}
 window.RACharacterSystem={data,runtime,mark};
})();
