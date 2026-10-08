// Host return feedback survives an embedded PLAY closing immediately in reduced motion.
// This observes the existing transport only; it never consumes results or mutates state.
(function(){
 const handled=new WeakSet();
 window.addEventListener('message',event=>{
  const frame=document.getElementById('f01-play-frame');
  if(!frame||frame.tagName!=='IFRAME'||event.origin!==window.location.origin||event.source!==frame.contentWindow||event.data?.type!=='F01.play_result'||handled.has(frame))return;
  handled.add(frame);
  const audio=window.RAAudio;if(!audio)return;
  try{if(!audio.oneShot?.('UI_BACK',{restartVoice:true}))audio.preload?.('UI_BACK')?.then(()=>audio.oneShot?.('UI_BACK',{restartVoice:true})).catch(()=>{});}catch(_){}
 });
})();
