import assert from 'node:assert/strict';
import {sandbox,run} from '../if1/_lib.mjs';
export async function test(root){
 const sources=[];const node=()=>({gain:{value:1},connect(){return this;}});
 class AudioContext{constructor(){this.state='running';this.destination={};}createGain(){return node();}createBufferSource(){const s={...node(),start(){this.started=true;},stop(){this.stopped=true;}};sources.push(s);return s;}}
 const c=sandbox({extra:{AudioContext}});c.document.getElementById=()=>null;
 c.RAAudioManifest={resident:[],get:id=>({id,type:'one-shot',bus:'UI',gain:1,maxVoices:3,file:'fixture',registered:true})};
 await run(root,c,['js/engine/audio.js']);const A=c.RAAudio;A.unlock();A.installBuffer('UI_TAP',{});
 for(let i=0;i<3;i++)assert.equal(A.oneShot('UI_TAP'),true);
 assert.equal(A.oneShot('UI_TAP'),false,'ordinary playback still obeys the delivered cap');
 for(let i=0;i<20;i++)assert.equal(A.oneShot('UI_TAP',{restartVoice:true}),true,'a rapid UI tap always starts');
 assert.equal(A.describe().voices.UI_TAP,3,'the authored voice cap is preserved');
 assert.equal(sources.filter(s=>s.stopped).length,20,'only the oldest active voice is restarted');
 sources.filter(s=>!s.stopped).forEach(s=>s.onended());assert.equal(A.describe().voices.UI_TAP||0,0,'voice accounting clears after playback');
 console.log('PASS UI audio saturation (rapid taps restart oldest voice; authored cap and ordinary playback preserved)');
}
