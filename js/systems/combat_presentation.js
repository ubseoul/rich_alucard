(function(){
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const profiles={normal:{stop:55,recoil:2,shake:'light',fragments:5,flash:'white'},heavy:{stop:85,recoil:4,shake:'heavy',fragments:9,flash:'white'},lethal:{stop:105,recoil:6,shake:'heavy',fragments:13,flash:'silhouette'}};
  function targetNode(target){return typeof target==='string'?document.querySelector(target):target;}
  function burst(target,kind,count){
    const host=document.querySelector('#combatEffects')||document.querySelector('#attackLayer');
    if(!host)return;
    const rect=targetNode(target)?.getBoundingClientRect(), hostRect=host.getBoundingClientRect();
    const anchor=rect?{x:rect.left-hostRect.left+rect.width*.5,y:rect.top-hostRect.top+rect.height*.42}:{x:0,y:0};
    for(let i=0;i<count;i++){
      const bit=document.createElement('i'); bit.className=`contact-fragment ${kind||'blood'}`;
      bit.style.left=`${anchor.x}px`; bit.style.top=`${anchor.y}px`;
      bit.style.setProperty('--dx',`${Math.round((Math.random()-.5)*34)}px`); bit.style.setProperty('--dy',`${Math.round((Math.random()-.5)*28)}px`); bit.style.setProperty('--delay',`${i*12}ms`);
      host.appendChild(bit); setTimeout(()=>bit.remove(),380);
    }
  }
  async function play(spec={}){
    const profile=profiles[spec.severity||'normal']||profiles.normal, target=targetNode(spec.target), attacker=targetNode(spec.attacker), stage=document.querySelector('#screen'), kind=spec.kind||'blood';
    const RAA=window.RAAudio;
    if(RAA){const move={blood:'MOVE_BLOODBATH',bite:'MOVE_BITE',revenge:'MOVE_REVENGE',octopus:'MOVE_OCTOPUS','importer-shove':'EN_SHOVE',briefcase:'EN_BRIEFCASE'}[kind];if(move)RAA.sfx(move);}
    spec.onPhase?.('CONTACT'); target?.classList.add('combat-contact'); await wait(spec.contactMs??45);
    if(RAA)RAA.sfx(spec.severity==='lethal'?'KO':spec.severity==='heavy'?'HIT_HEAVY':'HIT_LIGHT');
    spec.onPhase?.('HIT-STOP'); stage?.classList.add('combat-hit-stop'); await wait(profile.stop); stage?.classList.remove('combat-hit-stop');
    spec.onPhase?.('WHITE/SILHOUETTE FLASH'); target?.classList.add(profile.flash==='silhouette'?'combat-silhouette-flash':'combat-white-flash'); await wait(70); target?.classList.remove('combat-white-flash','combat-silhouette-flash');
    spec.onPhase?.('CONTACT BURST'); burst(target,kind,profile.fragments);
    spec.onPhase?.('RECOIL'); target?.classList.add(`combat-recoil-${profile.shake}`); if(spec.authored)target?.classList.add(`combat-authored-${spec.authored}-${spec.severity||'normal'}`); attacker?.classList.add('combat-attacker-commit'); stage?.classList.add(`combat-shake-${profile.shake}`); await wait(150);
    target?.classList.remove('combat-recoil-light','combat-recoil-heavy'); if(spec.authored&&spec.severity!=='lethal')target?.classList.remove(`combat-authored-${spec.authored}-${spec.severity||'normal'}`); attacker?.classList.remove('combat-attacker-commit'); stage?.classList.remove('combat-shake-light','combat-shake-heavy');
    spec.onPhase?.('HP DRAIN'); await spec.drain?.(); spec.onPhase?.('RECOVERY'); await wait(spec.recoveryMs??90); if(spec.authored)target?.classList.remove(`combat-authored-${spec.authored}-${spec.severity||'normal'}`); target?.classList.remove('combat-contact');
  }
  // OL-045: menu combat consumes the same accepted reusable FX packages as the original encounter.
  // Presentation reads the action/log; it never alters rules, PP, damage, the four slots or F01 THE PLAY.
  function move({root,attacker,target,action,gun,events=[]}){
    const current=window.RACombatPixelFX?.move({root,attacker,target,action,gun,events});
    const id=action.type==='move'?action.id:gun?'gun':action.type;
    root.dataset.lastPresentation=gun?`gun:${gun}`:id;
    const art=window.RAArtRegistry?.combatMoves?.[id];
    if(!art&&!gun)return current;
    const box=root.getBoundingClientRect(),t=target.getBoundingClientRect(),r=attacker.getBoundingClientRect();
    const world=window.RAPresentationDirector?.worldRect?.()||{x:0,y:0,w:box.width,h:box.height},scale=world.w/270,H=world.h/scale;
    const point=(el,role)=>{const b=window.RAPresentationDirector?.actorBox?.(role);return b?{x:(b.visible.x+b.visible.w/2-world.x)/scale,y:(b.visible.y+b.visible.h*.42-world.y)/scale,floor:(b.contact.y-world.y)/scale}:{x:(el.left-box.left+el.width/2-world.x)/scale,y:(el.top-box.top+el.height*.42-world.y)/scale,floor:(el.bottom-box.top-world.y)/scale};};
    const enemy=point(t,'enemy'),rich=point(r,'rich'),{x,y,floor}=enemy;
    const layer=document.createElement('div');layer.className='c2-approved-fx';layer.dataset.move=id;
    Object.assign(layer.style,{position:'absolute',left:`${world.x}px`,top:`${world.y}px`,width:`${world.w}px`,height:`${world.h}px`,overflow:'hidden',pointerEvents:'none',zIndex:'4'});root.append(layer);
    const timers=[],started=performance.now();
    function img(src,px=0,py=0,w=270,h=H){const el=document.createElement('img');el.alt='';el.src=src;Object.assign(el.style,{position:'absolute',left:`${Math.round(px*scale)}px`,top:`${Math.round(py*scale)}px`,width:`${Math.round(w*scale)}px`,height:`${Math.round(h*scale)}px`,imageRendering:'pixelated'});layer.append(el);return el;}
    if(window.RACombatPixelFX?.reduced()){
      if(id==='blood')img(art.contact[0],x-48,y-48,96,96);
      if(id==='bite')img(art.contact,x-32,y-32,64,64);
      if(id==='revenge')img(art.crack[1],x-48,y-48,96,96);
      if(id==='octopus')img(art.frames[3],0,0,270,H);
      setTimeout(()=>layer.remove(),120);return current;
    }
    const at=(ms,fn)=>timers.push(setTimeout(()=>{if(layer.isConnected)fn();},Math.max(0,Math.round(ms*(current?.duration||720)/720)-(performance.now()-started))));
    if(id==='blood'){
      const rear=img(art.rear[0],0,floor-362,270,362);at(105,()=>rear.src=art.rear[1]);at(210,()=>rear.src=art.rear[2]);
      at(315,()=>{img(art.foreground,0,floor-362,270,362);const engulf=img(art.overlay[0],x-48,floor-88,96,96);at(405,()=>engulf.src=art.overlay[1]);});
      at(405,()=>{const contact=img(art.contact[0],x-48,y-48,96,96);at(480,()=>contact.src=art.contact[1]);});
      at(585,()=>{const impact=img(art.impact);at(640,()=>impact.remove());});
    }else if(id==='bite'){
      img(art.upper);img(art.lower);at(300,()=>{layer.replaceChildren();img(art.snap);});
      at(520,()=>{layer.replaceChildren();img(art.contact,x-32,y-32,64,64);art.life.forEach((src,i)=>img(src,rich.x-8+i*12,rich.y-8,16,16));});
    }else if(id==='revenge'){
      const rx=rich.x,ry=rich.y;
      art.extraction.forEach((src,i)=>{const wound=img(art.stored[i],rx-24+i*12,ry-8,16,16);at(90*i,()=>{wound.remove();const particle=img(src,rx-12,ry-12,24,24);at(90*i+90,()=>{particle.style.left=`${Math.round((x-12)*scale)}px`;particle.style.top=`${Math.round((y-12)*scale)}px`;});at(90*i+200,()=>particle.remove());});});
      const mass=img(art.mass[0],x-48,y-48,96,96);at(180,()=>mass.src=art.mass[1]);at(360,()=>mass.src=art.mass[2]);
      at(540,()=>{mass.remove();const crack=img(art.crack[0],x-48,y-48,96,96);at(580,()=>crack.src=art.crack[1]);at(620,()=>crack.src=art.crack[2]);});
      at(635,()=>{const impact=img(art.impact);at(690,()=>impact.remove());});
    }else if(id==='octopus'){
      const tentacles=root.querySelector('.c2-tentacles');if(tentacles){tentacles.src=art.frames[0];art.frames.slice(1).forEach((src,i)=>at(180*(i+1),()=>tentacles.src=src));}
    }else if(gun){
      const held=window.RAArtRegistry?.items?.guns?.[gun]?.held;
      // Accepted held art remains the identity; cosmetic code overlays stay visible above it.
      if(held){img(held.asset,rich.x+3,rich.y+14,...held.cell);root.querySelector('.c2-pixel-fx')?.style.setProperty('z-index','5');}
    }
    const close=()=>{layer.remove();timers.forEach(clearTimeout);};root.addEventListener('c2:close',close,{once:true});
    at(720,()=>{close();root.removeEventListener('c2:close',close);});return current;
  }
  window.RACombatPresentation={play,profiles,burst,move};
})();
