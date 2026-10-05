(function(){
 // Central primary-character presentation scale (HQ Addendum §2, VOL 2 §0.1).
 // Primary gameplay characters display at ~185% of their historical on-screen scale, nearest-neighbor.
 // Source sprites never change; only this one multiplier does (1.70 / 2.00 later = one edit or the DEV control).
 const KEY='rich_alucard_display_scale_dev';
 const DEFAULT=1.85;
 let multiplier=DEFAULT;
 try{const dev=Number(sessionStorage.getItem(KEY));if(dev>0&&dev<=3)multiplier=dev;}catch(e){}
 const listeners=new Set();
 function set(value,{persist=true}={}){const v=Number(value);if(!(v>0&&v<=3))return multiplier;multiplier=v;if(persist){try{sessionStorage.setItem(KEY,String(v))}catch(e){}}for(const fn of listeners)try{fn(v)}catch(e){console.error(e)}return v;}
 // Historical base scale for a stage/scene × the primary multiplier.
 const scaled=(historical=1)=>historical*multiplier;
 // New BTF adventure stages were composed for the target directly; their historical base is 1.
 window.RADisplay={DEFAULT,get multiplier(){return multiplier},set,scaled,onChange:fn=>{listeners.add(fn);return()=>listeners.delete(fn)},options:[1,1.5,1.7,1.85,2]};
})();
