(function(){
 'use strict';
 // F05 - THE TRAP - minigame_counter.js
 // THE TRAP sec.5 COUNT THE MONEY: "at WAKE after a sales night, Rich feeds cash into a money counter ... tap-and-
 // hold as bills whir through; the counter's number climbs with a satisfying mechanical rattle; bands snap on every
 // $10K. Skippable, but players won't." Pure logic on RAF05.counterLogic; canvas binding registers at boot.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05;
 const BAND=R.AUTHORED.counter.bandSize;

 function bands(amount){const a=Math.max(0,Math.trunc(Number(amount)||0));return Math.floor(a/BAND);}
 function counted(fraction,total){return Math.min(Math.max(0,Math.trunc(Number(total)||0)),Math.round(R.util.clamp(Number(fraction)||0,0,1)*Math.max(0,Number(total)||0)));}
 R.counterLogic={BAND,bands,counted};

 R.counterMinigame={title:'COUNT THE MONEY',rule:'Press and hold to count the money, and let go when the stack looks right.',mount(root,ctx){
  const params=ctx.params||{};const total=Math.max(0,Math.trunc(Number(params.amount)||0));
  const speed=R.util.clamp(Number(params.speed)||1,0.25,4);
  const {canvas,ctx:g}=RAPixel.createCanvas(root);
  const pal=RAPixel.palette,rp=RAPixel;
  let dead=false,raf=null,holding=false,holdStart=0,fraction=0,finished=false,lastBand=0;
  const DURATION=Math.max(1200,Math.min(6000,total/Math.max(1,20000)*1500))/speed;

  function onDown(e){e.preventDefault();if(finished)return;holding=true;holdStart=performance.now()-fraction*DURATION;}
  function onUp(e){e.preventDefault?.();holding=false;}
  canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
  canvas.addEventListener('touchstart',onDown,{passive:false});canvas.addEventListener('touchend',onUp,{passive:false});

  function draw(){
   const now=performance.now();
   if(holding)fraction=R.util.clamp((now-holdStart)/DURATION,0,1);
   const amount=counted(fraction,total);const b=bands(amount);
   rp.paintEnvironment(g,{sky:'#141020',wall:'#20182e',floor:'#120e1c',horizon:340,seed:'f05-counter',props:[
    {type:'sign',x:15,y:14,w:240,h:22,text:'COUNT THE MONEY',size:7,color:'#120f1c',glow:pal.gold},
    {type:'counter',x:0,y:300,w:270,h:16}
   ]});
   rp.rect(g,45,190,180,80,'#0d0a16');rp.rect(g,49,194,172,72,'#1c1730');
   rp.text(g,`$${new Intl.NumberFormat('en-US').format(amount)}`,135,220,{size:10,align:'center',color:pal.green});
   rp.text(g,`BANDS ${b}`,135,246,{size:6,align:'center',color:pal.gold});
   if(b>lastBand){lastBand=b;try{window.RAAudio?.sfx?.('UI_CONFIRM');}catch(e){}}
   const width=Math.round((total?amount/total:0)*180);
   rp.rect(g,45,284,180,8,'#151321');rp.rect(g,45,284,width,8,pal.gold);
   if(!holding&&!finished)rp.text(g,'PRESS AND HOLD',135,330,{size:7,align:'center',color:pal.grey});
   if(fraction>=1&&!finished){finished=true;finishRun();}
   if(!dead)raf=requestAnimationFrame(draw);
  }
  function finishRun(){
   const best=ctx.progress();ctx.saveProgress({bestCount:Math.max(Number(best.bestCount)||0,total)});
   ctx.finish({outcome:'done',counted:total,bands:bands(total),data:{total,bands:bands(total)}});
  }
  raf=requestAnimationFrame(draw);
  return {dispose(){dead=true;if(raf)cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);canvas.removeEventListener('touchstart',onDown);canvas.removeEventListener('touchend',onUp);}};
 }};
})();
