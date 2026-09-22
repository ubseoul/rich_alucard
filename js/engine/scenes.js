(function(){
 const registry=new Map();let current='battle';
 function register(id,hooks={}){registry.set(id,hooks);}
 async function go(id,payload={}){const prev=registry.get(current);if(prev&&prev.exit)await prev.exit(payload);current=id;RAState.patch('life.world.scene',id);const next=registry.get(id);if(next&&next.enter)await next.enter(payload);document.dispatchEvent(new CustomEvent('ra:scene',{detail:{id,payload}}));}
 window.RAScenes={register,go,current:()=>current};
})();
