(function(){
 function get(id='soundtrack'){return document.getElementById(id);}
 async function play(id='soundtrack'){const a=get(id);if(a)try{await a.play();}catch(e){} }
 function pause(id='soundtrack'){const a=get(id);if(a)a.pause();}
 window.RAAudio={get,play,pause};
})();
