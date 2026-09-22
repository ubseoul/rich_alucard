(function(){
 const registry=new Map();let current='battle',currentScope=null,queued=Promise.resolve(),sequence=0;
 function createScope(label='scene',parent=null){
  let active=true,suspended=false;const cleanups=new Set(),children=new Set();
  const scope={label,id:`${label}:${++sequence}`,get active(){return active},get suspended(){return suspended},isActive:()=>active&&!suspended,
   cleanup(fn){if(typeof fn!=='function')return()=>{};if(!active){fn();return()=>{}}cleanups.add(fn);return()=>cleanups.delete(fn)},
   timeout(fn,ms){let id=setTimeout(()=>{cleanups.delete(cancel);if(active&&!suspended)fn()},ms);const cancel=()=>{if(id!==null){clearTimeout(id);id=null}};scope.cleanup(cancel);return cancel},
   interval(fn,ms){let id=setInterval(()=>{if(active&&!suspended)fn()},ms);const cancel=()=>{if(id!==null){clearInterval(id);id=null}};scope.cleanup(cancel);return cancel},
   frame(fn){let id=requestAnimationFrame(t=>{cleanups.delete(cancel);if(active&&!suspended)fn(t)});const cancel=()=>{if(id!==null){cancelAnimationFrame(id);id=null}};scope.cleanup(cancel);return cancel},
   listen(target,type,fn,options){target?.addEventListener?.(type,fn,options);return scope.cleanup(()=>target?.removeEventListener?.(type,fn,options))},
   delay(ms){return new Promise(resolve=>{let settled=false;const finish=value=>{if(!settled){settled=true;resolve(value)}};const cancel=scope.timeout(()=>finish(true),ms);scope.cleanup(()=>{cancel();finish(false)})})},
   child(name){const child=createScope(name,scope);children.add(child);child.cleanup(()=>children.delete(child));return child},
   suspend(){suspended=true},resume(){if(active)suspended=false},
   cancel(){if(!active)return;active=false;for(const child of [...children])child.cancel();for(const fn of [...cleanups]){try{fn()}catch(e){console.error(e)}}cleanups.clear()}
  };if(parent)parent.cleanup(()=>scope.cancel());return scope;
 }
 async function transition(id,payload){const previousId=current,previousScope=currentScope,previous=registry.get(previousId);previousScope?.cancel();if(previous?.exit)await previous.exit({id:previousId,nextId:id,payload,scope:previousScope,reason:'transition'});current=id;const scope=currentScope=createScope(`scene:${id}`);RAState.patch('life.world.scene',id);const next=registry.get(id);if(next?.enter)await next.enter({id,payload,scope,previousId});if(currentScope===scope)document.dispatchEvent(new CustomEvent('ra:scene',{detail:{id,payload,previousId}}));}
 function register(id,hooks={}){registry.set(id,hooks)}function go(id,payload={}){queued=queued.then(()=>transition(id,payload));return queued}function pause(){currentScope?.suspend();registry.get(current)?.pause?.({id:current,scope:currentScope})}function resume(){currentScope?.resume();registry.get(current)?.resume?.({id:current,scope:currentScope})}
 async function runSelfTest(){let fired=0;const stale=createScope('stale-scene');stale.timeout(()=>fired++,12);stale.cancel();await new Promise(resolve=>setTimeout(resolve,20));if(fired!==0)throw new Error('inactive scene timeout fired');let listeners=0;const target={addEventListener(){listeners++},removeEventListener(){listeners--}};const s=createScope('listener-test');s.listen(target,'x',()=>{});s.cancel();if(listeners!==0)throw new Error('scene listener was not cleaned');return true}
 window.RAScenes={register,go,current:()=>current,currentScope:()=>currentScope,createScope,pause,resume,runSelfTest};
})();
