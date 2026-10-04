(function(){
 'use strict';
 // RC2 BUILD 2 · BUY / SELL / CASH sound set. Synthesized with Web Audio (no new asset files), routed through the
 // same player settings as the rest of the game (sfx volume + mute). Safe no-op if Web Audio is unavailable.
 let ctx=null;
 const settings=()=>{try{return window.RAState?.get?.()?.life?.settings?.audio||{};}catch(e){return {};}};
 const level=()=>{const a=settings();return a.muted?0:Math.max(0,Math.min(1,a.sfx??1));};
 function ac(){if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;try{ctx=new AC();}catch(e){return null;}}if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx;}
 function tone(c,out,{f,t=0,d=.2,type='square',g=.14,to=null,attack=.004}){
  const o=c.createOscillator(),v=c.createGain(),now=c.currentTime+t;o.type=type;o.frequency.setValueAtTime(f,now);if(to)o.frequency.exponentialRampToValueAtTime(to,now+d);
  v.gain.setValueAtTime(0,now);v.gain.linearRampToValueAtTime(g,now+attack);v.gain.exponentialRampToValueAtTime(.0001,now+d);o.connect(v);v.connect(out);o.start(now);o.stop(now+d+.02);}
 function noise(c,out,{t=0,d=.1,g=.2,type='highpass',freq=2000,to=null,q=1}){
  const len=Math.max(1,Math.floor(c.sampleRate*d)),buf=c.createBuffer(1,len,c.sampleRate),data=buf.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);
  const s=c.createBufferSource(),f=c.createBiquadFilter(),v=c.createGain(),now=c.currentTime+t;s.buffer=buf;f.type=type;f.frequency.setValueAtTime(freq,now);f.Q.value=q;if(to)f.frequency.exponentialRampToValueAtTime(to,now+d);
  v.gain.setValueAtTime(g,now);v.gain.exponentialRampToValueAtTime(.0001,now+d);s.connect(f);f.connect(v);v.connect(out);s.start(now);}
 function play(build){const lv=level();if(!lv)return false;const c=ac();if(!c)return false;const out=c.createGain();out.gain.value=lv;out.connect(c.destination);try{build(c,out);}catch(e){console.error('feel sfx',e);}return true;}
 const SFX={
  // the register drawer: thunk, then two bright bells that ring out
  chaching:()=>play((c,o)=>{noise(c,o,{d:.07,g:.5,type:'lowpass',freq:900});tone(c,o,{f:196,d:.08,type:'square',g:.2,to:110});
   tone(c,o,{f:1568,t:.09,d:.55,type:'triangle',g:.2});tone(c,o,{f:2093,t:.17,d:.7,type:'triangle',g:.22});tone(c,o,{f:3136,t:.17,d:.4,type:'sine',g:.08});}),
  coin:()=>play((c,o)=>{tone(c,o,{f:988,d:.07,g:.12});tone(c,o,{f:1319,t:.06,d:.22,g:.12});}),
  // sell: ka-ching, then coins spill
  sell:()=>play((c,o)=>{noise(c,o,{d:.06,g:.4,type:'lowpass',freq:900});tone(c,o,{f:1319,t:.06,d:.4,type:'triangle',g:.2});tone(c,o,{f:1760,t:.13,d:.5,type:'triangle',g:.2});
   for(let i=0;i<5;i++)tone(c,o,{f:1480-i*110+((i*37)%5)*20,t:.28+i*.065,d:.12,g:.09});}),
  loss:()=>play((c,o)=>{tone(c,o,{f:330,d:.16,type:'sawtooth',g:.12});tone(c,o,{f:247,t:.14,d:.16,type:'sawtooth',g:.12});tone(c,o,{f:165,t:.28,d:.34,type:'sawtooth',g:.12});}),
  bag:()=>play((c,o)=>{noise(c,o,{d:.22,g:.35,type:'bandpass',freq:500,to:3200,q:1.4});tone(c,o,{f:420,d:.18,type:'sine',g:.08,to:900});}),
  rip:()=>play((c,o)=>{for(let i=0;i<4;i++)noise(c,o,{t:i*.035,d:.05,g:.45,type:'highpass',freq:3500+i*400});}),
  pop:()=>play((c,o)=>{tone(c,o,{f:520,d:.09,type:'square',g:.12,to:900});}),
  tally:()=>play((c,o)=>{tone(c,o,{f:660,d:.05,g:.07});}),
  // purchase = bag whoosh, drawer + bells, then the tag rips
  purchase:()=>{SFX.bag();setTimeout(()=>SFX.chaching(),180);setTimeout(()=>SFX.rip(),780);}
 };
 window.RAFeelSfx=SFX;
})();
