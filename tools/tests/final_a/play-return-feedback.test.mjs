import fs from 'node:fs/promises';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';
export async function test(root){
 const code=await fs.readFile(path.join(root,'js/systems/play_return_feedback.js'),'utf8'),listeners=[],sounds=[],child={},frame={tagName:'IFRAME',contentWindow:child};let current=frame;
 const ctx={document:{getElementById:id=>id==='f01-play-frame'?current:null},location:{origin:'http://game'},addEventListener:(kind,fn)=>listeners.push({kind,fn}),RAAudio:{oneShot:(id,opts)=>{sounds.push({id,opts});return true;}}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx);
 const on=listeners.find(l=>l.kind==='message').fn,event={origin:'http://game',source:child,data:{type:'F01.play_result'}};
 on({...event,origin:'http://other'});on({...event,source:{}});on({...event,data:{type:'F01.play_ready'}});assert.equal(sounds.length,0);
 on(event);on(event);assert.equal(sounds.length,1,'duplicate result transport cannot repeat host feedback');assert.equal(sounds[0].id,'UI_BACK');assert.equal(sounds[0].opts.restartVoice,true);
 current=null;on(event);assert.equal(sounds.length,1,'removed frame is not a return');current={tagName:'IFRAME',contentWindow:{}};on({...event,source:current.contentWindow});assert.equal(sounds.length,2,'a new legitimate PLAY can return');
 console.log('PASS FINAL-A parent return feedback (actual current child/origin only; once per frame; no state or reward writes)');
}
