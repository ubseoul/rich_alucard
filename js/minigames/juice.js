// RC2 B3 — shared minigame JUICE: screen shake, hard-pixel particle bursts, floating text, flashes, pop rings.
// No dependencies beyond RAPixel. Usage per minigame:
//   const J=RAJuice.create(g);  J.burst(x,y,color);  J.float('PERFECT',x,y,{color});  J.shake(3);  J.flash('#fff');
//   each frame:  J.update(dtSeconds); J.begin(); ...draw game...; J.end();  (end() also draws particles/floaters/flash)
(function(){
 'use strict';
 function create(g,{reduced=false}={}){
  const parts=[],floats=[],rings=[];let shakeAmt=0,flashColor=null,flashLeft=0,flashTotal=1;
  const rnd=Math.random;
  const api={
   burst(x,y,color='#f6efd9',n=10,speed=70){for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,s=speed*(.35+rnd());parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-25,t:0,life:.45+rnd()*.35,c:Array.isArray(color)?color[i%color.length]:color,s:rnd()<.5?2:3});}},
   float(text,x,y,{color='#f6efd9',size=7,life=.85,rise=26}={}){floats.push({text,x,y,t:0,life,color,size,rise});},
   ring(x,y,color='#f6efd9',max=26){rings.push({x,y,t:0,life:.35,max,c:color});},
   shake(amount=3){if(!reduced)shakeAmt=Math.max(shakeAmt,amount);},
   flash(color='#ffffff',ms=110){if(reduced)return;flashColor=color;flashLeft=ms/1000;flashTotal=ms/1000;},
   update(dt){
    dt=Math.min(.05,Math.max(0,dt||0));
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;p.vy+=160*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.t>=p.life)parts.splice(i,1);}
    for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.t+=dt;if(f.t>=f.life)floats.splice(i,1);}
    for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.t+=dt;if(r.t>=r.life)rings.splice(i,1);}
    shakeAmt=Math.max(0,shakeAmt-dt*14);if(flashLeft>0)flashLeft=Math.max(0,flashLeft-dt);
   },
   begin(){g.save();if(shakeAmt>.2)g.translate(Math.round((rnd()-.5)*shakeAmt*2),Math.round((rnd()-.5)*shakeAmt*2));},
   end(){
    for(const r of rings){const k=r.t/r.life;g.strokeStyle=r.c;g.globalAlpha=1-k;g.lineWidth=2;g.strokeRect(Math.round(r.x-r.max*k),Math.round(r.y-r.max*k),Math.round(r.max*2*k),Math.round(r.max*2*k));g.globalAlpha=1;}
    for(const p of parts){g.globalAlpha=Math.max(0,1-p.t/p.life);g.fillStyle=p.c;g.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s);}
    g.globalAlpha=1;
    for(const f of floats){const k=f.t/f.life;g.globalAlpha=k<.7?1:Math.max(0,1-(k-.7)/.3);window.RAPixel.text(g,f.text,f.x,f.y-f.rise*k,{size:f.size,color:f.color,align:'center',baseline:'middle'});}
    g.globalAlpha=1;
    if(flashLeft>0){g.globalAlpha=.35*(flashLeft/flashTotal);g.fillStyle=flashColor;g.fillRect(0,0,270,480);g.globalAlpha=1;}
    g.restore();
   },
   clear(){parts.length=floats.length=rings.length=0;shakeAmt=0;flashLeft=0;}
  };
  return api;
 }
 // Respect the player's reduced-motion setting: no shake/flash, bursts stay (they are small).
 const reducedMotion=()=>{try{return !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches}catch(e){return false}};
 window.RAJuice={create:(g,o={})=>create(g,{reduced:reducedMotion(),...o})};
})();
