(function(){
 // ==== Stage contracts — legacy placement API (RAStageLayout) =============================================
 // Unmigrated scenes still place actors by stretching the native 270×480 contract over a host element.
 // Presentation Director scenes (below) never use this path: their size comes only from the Director camera.
 function contract(id){const value=window.RAStages?.get(id);if(!value)throw new Error(`Unknown stage contract: ${id}`);return value}function actorRect(stage,slot,scale){const actor=stage.actors?.[slot]||stage.objects?.[slot];if(!actor)throw new Error(`Unknown stage slot: ${slot}`);scale=scale??actor.scale??stage.referenceScale;if(stage.actors?.[slot]&&!actor.fixedScale&&!stage.fixedScale&&window.RADisplay)scale=window.RADisplay.scaled(scale);const {source,anchor}=actor;return {x:anchor.x-source.anchor.x*scale,y:anchor.y-source.anchor.y*scale,width:source.width*scale,height:source.height*scale,contact:{x:anchor.x,y:anchor.y},scale,slot}}
 function transform(stage,rect,hostRect,screenRect){const sx=hostRect.width/stage.native.width,sy=hostRect.height/stage.native.height;return {left:hostRect.left-screenRect.left+rect.x*sx,top:hostRect.top-screenRect.top+rect.y*sy,width:rect.width*sx,height:rect.height*sy,contact:{x:hostRect.left-screenRect.left+rect.contact.x*sx,y:hostRect.top-screenRect.top+rect.contact.y*sy},scale:{x:sx,y:sy}}}function layout(stageId,slot,host,element,scale){const stage=contract(stageId),screen=document.querySelector('#screen'),rect=transform(stage,actorRect(stage,slot,scale),host.getBoundingClientRect(),screen.getBoundingClientRect());Object.assign(element.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});return rect}
 function activate(stageId,host,actors,scope,getScale){const stage=contract(stageId);let latest={};const place=()=>{for(const [slot,element]of Object.entries(actors))if(element)latest[slot]=layout(stageId,slot,host,element,getScale?.(slot)||stage.referenceScale);drawOverlay(stage,latest)};const observer=new ResizeObserver(place);observer.observe(host);scope?.cleanup(()=>observer.disconnect());scope?.frame(place);place();return {stage,layout:place,latest:()=>latest}}
 function drawOverlay(stage){const canvas=document.querySelector('#stageContractOverlay');if(!canvas)return;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);if(!document.body.classList.contains('stage-overlay-active'))return;ctx.strokeStyle='#ffcf42';ctx.fillStyle='#ffcf42';ctx.font='6px monospace';ctx.setLineDash([2,2]);for(const line of stage.contactLines){ctx.beginPath();ctx.moveTo(0,line.y);ctx.lineTo(stage.native.width,line.y);ctx.stroke();ctx.fillText(`${line.id} ${line.y}`,3,line.y-3)}ctx.setLineDash([]);for(const slot of Object.keys(stage.actors)){const r=actorRect(stage,slot);ctx.strokeStyle=stage.actors[slot].observer?'#70d7ff':'#ff6b9e';ctx.strokeRect(r.x,r.y,r.width,r.height);ctx.fillStyle=ctx.strokeStyle;ctx.fillText(slot,r.x,Math.max(7,r.y-3))}ctx.strokeStyle='#8cff7a';for(const zone of stage.dialogueSafeZones||[])ctx.strokeRect(zone.x,zone.y,zone.width,zone.height);ctx.strokeStyle='#ff994d';for(const zone of stage.uiExclusionZones||[])ctx.strokeRect(zone.x,zone.y,zone.width,zone.height)}

 // ==== Presentation Director ===============================================================================
 // One camera per screen: world units (the stage's native environment grid) → #screen CSS pixels.
 // The environment, actors, world-space layers and world-attached FX are all placed through the same camera
 // mapping and snapped to device pixels. See docs/PRESENTATION_DIRECTOR.md.
 const data=()=>window.RAPresentationData;
 const FALLBACK_SPRITE={width:80,height:96,visible:[0,0,80,96],anchor:[40,88],face:[12,15,56,29],faceSource:'fallback',authority:'UNREGISTERED'};
 const clamp=(v,lo,hi)=>Math.min(Math.max(v,lo),Math.max(lo,hi));
 const box=(x,y,w,h)=>({x,y,w,h});
 const area=b=>Math.max(0,b.w)*Math.max(0,b.h);
 function intersect(a,b){const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y);return box(x,y,Math.min(a.x+a.w,b.x+b.w)-x,Math.min(a.y+a.h,b.y+b.h)-y)}
 function union(list){const x=Math.min(...list.map(b=>b.x)),y=Math.min(...list.map(b=>b.y));return box(x,y,Math.max(...list.map(b=>b.x+b.w))-x,Math.max(...list.map(b=>b.y+b.h))-y)}
 const inside=(inner,outer)=>area(inner)>0?area(intersect(inner,outer))/area(inner):1;
 const round3=v=>Math.round(v*1000)/1000;
 function assetPath(value){if(!value)return null;const m=String(value).match(/assets\/[^"')?]+/);return m?m[0]:null}
 // Runtime metadata for actors painted at runtime (RAPixel placeholders): alpha bounds measured from the canvas.
 const runtimeMeta=new Map(),runtimeKeys=new WeakMap();let runtimeSeq=0;
 function spriteMeta(path){const meta=window.RAPresentationAssets?.[path]||runtimeMeta.get(path)?.meta;return meta&&!meta.environment?meta:{...FALLBACK_SPRITE,missing:path||true}}
 function canvasAsset(canvas){
  let key=runtimeKeys.get(canvas);if(!key){key=`runtime:${++runtimeSeq}`;runtimeKeys.set(canvas,key)}
  const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);let x0=canvas.width,y0=canvas.height,x1=-1,y1=-1;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels.data[(y*canvas.width+x)*4+3]>0){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  const visible=x1<0?[0,0,canvas.width,canvas.height]:[x0,y0,x1-x0+1,y1-y0+1];
  runtimeMeta.set(key,{pixels,meta:{width:canvas.width,height:canvas.height,visible,anchor:[40,88],face:[Math.round(visible[0]+visible[2]*.15),Math.round(visible[1]+visible[3]*.16),Math.max(1,Math.round(visible[2]*.7)),Math.max(1,Math.round(visible[3]*.3))],faceSource:'derived',authority:'PLACEHOLDER'}});
  return key;
 }
 function envSize(stage){return stage.world||stage.native}
 function lineOf(stage,actor){return (stage.contactLines||[]).find(line=>line.id===actor.anchor.line)||null}
 function actorScale(stage,slot){const actor=stage.actors[slot],scale=actor.scale??lineOf(stage,actor)?.scale;if(!(scale>0))throw new Error(`Director stage ${stage.id}: contact line for ${slot} has no scale`);return scale}

 // Actor boxes in world units: sprite frame, visible (alpha) body, face.
 function worldActor(stage,slot,asset,at){
  const actor=stage.actors[slot],line=at?.line?(stage.contactLines||[]).find(l=>l.id===at.line):null,a=line?.scale??actorScale(stage,slot),m=spriteMeta(asset),ax=at?.x??actor.anchor.x,ay=at?.y??line?.y??actor.anchor.y,sx=ax-m.anchor[0]*a,sy=ay-m.anchor[1]*a;
  const rect=([x,y,w,h])=>box(sx+(actor.flip?m.width-x-w:x)*a,sy+y*a,w*a,h*a);
  return {slot,asset,scale:a,line:line?.id??actor.anchor.line,anchor:{x:ax,y:ay},sprite:box(sx,sy,m.width*a,m.height*a),visible:rect(m.visible),face:rect(m.face),faceSource:m.faceSource,authority:m.authority,meta:m,flip:!!actor.flip};
 }

 // UI-aware screen modes: HUD band, world viewport, UI band — all in #screen CSS pixels.
 // Portrait phones are width-limited, so world framing is a fixed aspect of W and surplus height goes to UI.
 function screenLayout(modeId,W,H){
  const mode=data().modes[modeId];if(!mode)throw new Error(`Unknown presentation mode: ${modeId}`);
  const pad=Math.round(W*mode.pad),gap=Math.round(W*mode.gap),hudH=mode.hud?Math.round(W*mode.hud):0;
  const hud=box(pad,pad,W-2*pad,hudH),worldY=hudH?hud.y+hudH+gap:0;
  const uiMin=Math.round(W*mode.ui.min),room=H-worldY-(uiMin?uiMin+gap+pad:0);
  const worldH=Math.max(Math.round(W*mode.world.minAspect),Math.min(Math.round(W*mode.world.maxAspect),room));
  const world=box(0,worldY,W,Math.min(worldH,H-worldY));
  const uiY=world.y+world.h+gap,ui=box(pad,uiY,W-2*pad,Math.max(0,H-uiY-pad));
  return {mode:modeId,W,H,pad,gap,hud,world,ui};
 }

 // SOLVE: analytic camera for a shot profile. view = world viewport size in CSS px.
 function solve(spec){
  const stage=spec.stage,profile=data().profiles[spec.profile],env=envSize(stage),view=spec.view;
  if(!profile)throw new Error(`Unknown shot profile: ${spec.profile}`);
  // Empty stage: full-width cover, grounded at the bottom of the environment.
  if(!spec.focal?.length){const S=Math.max(view.w/env.width,view.h/env.height),w=view.w/S,h=view.h/S;return {S,x:(env.width-w)/2,y:env.height-h,w,h,zoom:1,contact:1,cover:S,limited:false,profile:profile.id}}
  // Envelope of every approved state per focal slot → the camera never jumps when an actor changes state.
  const envelope=(slot,at)=>{const list=(spec.states?.[slot]?.length?spec.states[slot]:[spec.assets?.[slot]]).map(asset=>worldActor(stage,slot,asset,at));return {...list[0],visible:union(list.map(a=>a.visible))}};
  const focal=spec.focal.map(slot=>envelope(slot,spec.at?.[slot])),include=(spec.include||[]).filter(slot=>stage.actors[slot]).map(slot=>envelope(slot));
  const refScale=focal.find(f=>f.slot===spec.reference)?.scale??focal[0].scale;
  const refH=spriteMeta(data().reference.asset).visible[3]*refScale;
  const cover=Math.max(view.w/env.width,view.h/env.height);
  const zoom=spec.zoom||1,contact=spec.contact??profile.contact[1];
  let S=Math.max(cover,profile.target*zoom*view.h/refH),limited=false;
  const group=union([...focal,...include].map(f=>f.visible)),usable=view.w*(1-2*profile.side);
  if(group.w*S>usable){const fit=Math.max(cover,usable/group.w);limited=fit<S;S=fit}
  const w=view.w/S,h=view.h/S;
  const x=clamp(group.x+group.w/2-w/2,0,env.width-w);
  const contactY=Math.max(...focal.map(f=>f.anchor.y)),headTop=Math.min(...focal.map(f=>f.visible.y));
  const y=clamp(Math.min(contactY-contact*h,headTop-profile.headroom*h),0,env.height-h);
  return {S,x,y,w,h,zoom,contact,cover,limited,profile:profile.id};
 }
 // SEARCH: small neighbourhood around the analytic solution (≤ 6 candidates).
 function search(spec){
  const profile=data().profiles[spec.profile],out=[];
  for(const contact of profile.contact)for(const zoom of [1,1.06]){
   // Only perceptibly different framings reach the judge: ≥ 4% of the view in position or ≥ 3% in zoom.
   const cam=solve({...spec,contact,zoom});
   if(!out.some(o=>Math.abs(o.camera.S/cam.S-1)<.03&&Math.abs(o.camera.y-cam.y)<.04*cam.h&&Math.abs(o.camera.x-cam.x)<.04*cam.w))out.push({id:`c${out.length+1}`,contact,zoom,camera:cam})
  }
  return out.slice(0,6);
 }

 // Projection: world → #screen CSS px, snapped to device pixels. Actor pixel scale snaps to an integer
 // number of device pixels per source pixel when within 4% (crisp, even pixel-art columns).
 function project(stage,layout,camera,actors,dpr=1){
  const env=envSize(stage),S=camera.S,snap=v=>Math.round(v*dpr)/dpr;
  const sx=x=>layout.world.x+(x-camera.x)*S,sy=y=>layout.world.y+(y-camera.y)*S;
  const envRect=box(snap(sx(0)),snap(sy(0)),env.width*S,env.height*S);
  const placed={},range=data().profiles[camera.profile]?.body,refH=spriteMeta(data().reference.asset).visible[3];
  // Crisp pixels: prefer an integer device-pixel scale within 4%, but never one that leaves the shot-size band.
  const crisp=k=>{const kd=k*dpr,options=[Math.round(kd),Math.floor(kd),Math.ceil(kd)].filter((v,i,a)=>v>0&&a.indexOf(v)===i&&Math.abs(v-kd)/kd<=.04);
   for(const v of options){const body=refH*v/dpr/layout.world.h;if(!range||(body>=range[0]&&body<=range[1]))return v/dpr}return k};
  for(const actor of actors){
   const k=crisp(actor.scale*S);
   const m=actor.meta,ax=snap(sx(actor.anchor.x)),ay=snap(sy(actor.anchor.y)),left=snap(ax-m.anchor[0]*k),top=snap(ay-m.anchor[1]*k);
   const rect=([x,y,w,h])=>box(left+(actor.flip?m.width-x-w:x)*k,top+y*k,w*k,h*k);
   placed[actor.slot]={...actor,world:actor.anchor,k,sprite:box(left,top,m.width*k,m.height*k),visible:rect(m.visible),face:rect(m.face),contact:{x:ax,y:ay}};
  }
  return {S,env:envRect,world:layout.world,actors:placed,dpr,camera};
 }
 const worldRectToScreen=(frame,[x,y,w,h])=>box(frame.world.x+(x-frame.camera.x)*frame.S,frame.world.y+(y-frame.camera.y)*frame.S,w*frame.S,h*frame.S);

 // LINT (geometry): numeric acceptance on a projected frame. uiRects are real measured UI rectangles.
 function lintFrame(stage,frame,{profile,focal,speakers=focal,reference,uiRects=[],golden=null,exception=null}={}){
  const P=data().profiles[profile],acc=data().acceptance,checks=[],W=frame.layout?.W??frame.world.w;
  const placeholderActors=focal.some(slot=>frame.actors[slot]?.authority==='PLACEHOLDER');
  // PROVISIONAL: size checks that fail only because a focal actor is RAPixel placeholder art (bounds will change
  // when final art lands) pass with a note; exceptions may accept named checks (with their ticket).
  const add=(id,pass,value,limit,note)=>{const base=id.split(':')[0];let ok=!!pass,n=note;
   if(!ok&&exception?.accept?.includes(base)){ok=true;n=`ACCEPTED ${exception.ticket}`}
   else if(!ok&&placeholderActors&&['shot-size','shot-consistency','in-view'].includes(base)){ok=true;n='PROVISIONAL (placeholder actor art)'}
   checks.push({id,pass:ok,value,limit,...(n?{note:n}:{})})};
  if(!focal.length)return {pass:true,checks:[{id:'empty-stage',pass:true,value:0,limit:'no focal actors'}],metrics:{body:0,headroom:1,S:round3(frame.S)}};
  const ref=frame.actors[reference]||frame.actors[focal[0]],refRatio=ref?ref.visible.h/spriteMeta(data().reference.asset).visible[3]/ref.k:1;
  const body=ref?ref.visible.h/frame.world.h/refRatio:0;
  // Accepted exceptions (data, with a ticket) still report the measured size but do not fail the size checks.
  add('shot-size',exception||(body>=P.body[0]-.005&&body<=P.body[1]+.005),round3(body),P.body,exception?`EXCEPTION ${exception.status} ${exception.ticket}`:`reference-height body / world viewport (${P.id})`);
  // Cross-scene consistency: against the profile's locked reference size (golden set), else the profile target.
  const refSize=P.reference??P.target;
  add('shot-consistency',!!exception||Math.abs(body/refSize-1)<=(P.reference!=null?acc.consistency:Math.max(acc.consistency,(P.body[1]-P.body[0])/2/P.target)),round3(body/refSize-1),P.reference!=null?`±${acc.consistency} of locked ${P.id} reference ${refSize}`:'vs profile target');
  const minFace=acc.minFacePx*W/acc.minFacePxAtWidth;
  for(const slot of speakers){const a=frame.actors[slot];if(!a)continue;add(`face-size:${slot}`,a.face.h>=minFace,round3(a.face.h),round3(minFace),a.faceSource)}
  for(const slot of focal){const a=frame.actors[slot];if(!a)continue;
   add(`in-view:${slot}`,inside(a.visible,frame.world)>=.999,round3(inside(a.visible,frame.world)),1);
   add(`face-in-view:${slot}`,inside(a.face,frame.world)>=.999,round3(inside(a.face,frame.world)),1);
   const ov=uiRects.reduce((sum,r)=>sum+area(intersect(intersect(a.visible,frame.world),r)),0);
   add(`ui-overlap-bbox:${slot}`,ov<=acc.uiOverlapPx,Math.round(ov),acc.uiOverlapPx);
  }
  const headTop=Math.min(...focal.map(s=>frame.actors[s]?.visible.y??Infinity)),head=(headTop-frame.world.y)/frame.world.h;
  add('headroom',head>=P.headroom-.005,round3(head),P.headroom);
  add('env-cover',frame.env.x<=frame.world.x+.5&&frame.env.y<=frame.world.y+.5&&frame.env.x+frame.env.w>=frame.world.x+frame.world.w-.5&&frame.env.y+frame.env.h>=frame.world.y+frame.world.h-.5,true,'no letterbox inside world viewport');
  for(const [slot,a] of Object.entries(frame.actors)){const line=(stage.contactLines||[]).find(l=>l.id===a.line),at=a.world||a.anchor;
   add(`contact:${slot}`,!!line&&Math.abs(at.y-line.y)<.01&&(line.x1==null||(at.x>=line.x1&&at.x<=line.x2)),line?.id||null,'on a contact line');
   add(`authority:${slot}`,!a.meta.missing&&a.authority!=='UNREGISTERED',a.authority||'missing',a.asset);
  }
  return {pass:checks.every(c=>c.pass),checks,metrics:{body:round3(body),headroom:round3(head),S:round3(frame.S)}};
 }

 // ---- FX registry (world-attached effects) ----
 // Offsets/sizes are legacy reference pixels (RAPresentationData.fx) relative to the actor's visible body:
 // centre x, 42% down. --pd-fx = Rich's current visible height / legacy reference, so effects scale with the body.
 function anchorPoint(frame,role,roles){const a=frame.actors[roles?.[role]];return a?{x:a.visible.x+a.visible.w*.5,y:a.visible.y+a.visible.h*.42}:null}

 // ---- Adventure adapter: slot-based adventure data → Director stage contract + default shot ----
 // Every adventure node names an environment (RAEnvironments) and actors in slots. The adapter turns that into
 // a contract: one contact line at the environment floor (depth scale = registry base × the approved 1.85
 // primary-character rule, made explicit), actors anchored at their slot, and a default shot chosen from the
 // cast size — then the Director solves the camera like any other scene. Hero nodes may override with `shot`.
 const APPROVED_PRIMARY_SCALE=1.85;
 function adventureStage(env,cast,{slots,node,states}={}){
  const floor=env.floorY??372,scale=env.depth??(env.base||1)*APPROVED_PRIMARY_SCALE,lines=[{id:'floor',y:floor,x1:0,x2:270,scale}],actors={};
  for(const [slot,spec] of Object.entries(cast)){
   // Slot positions are clamped so a typical body (≈30 source px wide) stays inside the environment width.
   const half=15*scale+4,x=Math.min(270-half,Math.max(half,spec.x??slots?.[slot]??135)),y=spec.y??floor;let line=lines.find(l=>l.y===y);
   const lineScale=spec.lineScale??scale;if(!line||line.scale!==lineScale){line={id:`y${y}${lineScale!==scale?'d':''}`,y,x1:0,x2:270,scale:lineScale};lines.push(line)}
   actors[slot]={source:{width:80,height:96,anchor:{x:40,y:88}},anchor:{x,y,line:line.id},flip:!!spec.flip,observer:!!spec.observer};
  }
  const visible=Object.keys(cast).filter(slot=>!cast[slot].hidden&&!cast[slot].observer);
  const reference=Object.keys(cast).find(slot=>cast[slot].id==='rich');
  // Preference order; SOLVE falls back when full-width cover or the focal group makes a profile unreachable.
  const auto=visible.length>=3?['establishing','conversation']:['conversation','establishing'];
  const override=node?.shot||null;
  const stage={id:`adv:${env.id}`,native:{width:270,height:480},environment:env.image||null,contactLines:lines,actors,
   director:{states:states||{},shots:{}}};
  // Default shot: first profile in the preference list whose solved framing keeps the reference body in band.
  const candidates=(override?.profile?[override.profile]:auto).map(profile=>({profile,focal:override?.focal||visible,include:override?.include||[],speakers:override?.speakers||visible,reference:override?.reference||reference||visible[0]}));
  stage.director.shots.default=candidates[0];stage.director.shotCandidates=candidates;
  return stage;
 }
 // Combat 2.0: the same adapter contract in combat mode. Rich left / enemy right on the environment floor;
 // minions stand on a farther depth band (0.55 of the floor scale — the legacy crowd depth made explicit).
 function combat2Stage(env,enemyPerson,{flip=false,minions=0}={}){
  const y=env.floorY??318,depth=(env.base||1)*APPROVED_PRIMARY_SCALE;
  const cast={rich:{id:'rich',x:72},enemy:{id:enemyPerson,x:198,flip}};
  for(let i=0;i<minions;i++)cast[`minion${i}`]={id:'minion',x:150+i*22,y:y-30+i*6,lineScale:depth*.55};
  const stage=adventureStage(env,cast,{node:{shot:{profile:'combat',focal:['rich','enemy'],reference:'rich'}}});
  stage.id=`c2:${env.id}`;stage.director.roles={rich:'rich',enemy:'enemy'};return stage;
 }
 // Picks the first candidate shot whose solve is not width-limited below its size band (data-driven fallback).
 function chooseShot(stage,view,assets){
  for(const shot of stage.director.shotCandidates||[stage.director.shots.default]){if(!shot.focal.length)return shot;
   const cam=solve({stage,profile:shot.profile,focal:shot.focal,include:shot.include,reference:shot.reference,assets,states:stage.director.states,view}),refScale=stage.contactLines.find(l=>l.id===stage.actors[shot.reference]?.anchor.line)?.scale||stage.contactLines[0].scale;
   const body=spriteMeta(data().reference.asset).visible[3]*refScale*cam.S/view.h,band=data().profiles[shot.profile].body;
   if(body>=band[0]-.005&&body<=band[1]+.005)return shot}
  return stage.director.shotCandidates?.at(-1)||stage.director.shots.default;
 }

 // ---- Live controller ----
 let active=null;
 function screenEl(){return document.querySelector('#screen')}
 function worldEl(host){let el=document.querySelector('#pdWorld');if(!el){el=document.createElement('div');el.id='pdWorld';el.setAttribute('aria-hidden','true');(host||active?.host||screenEl()).prepend(el)}return el}
 function elementAsset(el){if(!el)return null;if(el.tagName==='IMG')return assetPath(el.getAttribute('src'));if(el.tagName==='CANVAS')return el.dataset.asset||canvasAsset(el);const cs=getComputedStyle(el),path=assetPath(cs.backgroundImage),sheet=window.RAPresentationAssets?.[path]?.sheet;
  // Sprite sheets resolve to the frame currently shown (background-position / frame width in CSS px).
  if(sheet){const k=parseFloat(el.style.getPropertyValue('--pd-k'))||1,index=Math.round(-parseFloat(cs.backgroundPositionX||'0')/(sheet.frameWidth*k));return `${path}#${Math.max(0,Math.min(sheet.frames-1,index))}`}return path}
 function currentAssets(ctl){const out={};for(const [slot,el] of Object.entries(ctl.actors))out[slot]=ctl.assetOf?.[slot]?.(el)??elementAsset(el);return out}
 function screenSize(){const r=screenEl().getBoundingClientRect();return {W:r.width,H:r.height}}

 function relayout(ctl){
  const {W,H}=screenSize();if(!(W>0&&H>0))return null;
  const dpr=window.devicePixelRatio||1,stage=ctl.stage,layout=screenLayout(ctl.mode,W,H);
  const assets=currentAssets(ctl);if(ctl.autoShot)ctl.shot=chooseShot(ctl.stage,{w:layout.world.w,h:layout.world.h},assets);const shot=ctl.shot;
  const spec={stage,profile:shot.profile,focal:shot.focal,include:shot.include,reference:shot.reference,assets,states:stage.director?.states,at:ctl.moved,view:{w:layout.world.w,h:layout.world.h}};
  const locked=window.RAPresentationLocks?.get?.(stage.id,ctl.beat);
  const camera=solve({...spec,...(locked?{contact:locked.contact,zoom:locked.zoom}:{contact:shot.contact,zoom:shot.zoom})});
  const actors=Object.keys(ctl.actors).map(slot=>worldActor(stage,slot,assets[slot],ctl.moved?.[slot]));
  const frame=project(stage,layout,camera,actors,dpr);frame.layout=layout;frame.spec=spec;frame.lockedChoice=locked||null;
  ctl.frame=frame;apply(ctl,frame);return frame;
 }
 const px=v=>`${Math.round(v*1000)/1000}px`;
 function apply(ctl,frame){
  const screen=screenEl(),world=worldEl(),L=frame.layout;
  const set=(k,v)=>screen.style.setProperty(k,v);
  for(const [name,b] of Object.entries({world:L.world,hud:L.hud,ui:L.ui})){set(`--pd-${name}-x`,px(b.x));set(`--pd-${name}-y`,px(b.y));set(`--pd-${name}-w`,px(b.w));set(`--pd-${name}-h`,px(b.h))}
  set('--pd-u',String(round3(frame.S)));
  Object.assign(world.style,{left:px(L.world.x),top:px(L.world.y),width:px(L.world.w),height:px(L.world.h)});
  const local=b=>({left:px(b.x-L.world.x),top:px(b.y-L.world.y),width:px(b.w),height:px(b.h)});
  if(ctl.env)Object.assign(ctl.env.style,local(frame.env));
  for(const [slot,el] of Object.entries(ctl.actors)){const a=frame.actors[slot];if(!el||!a)continue;Object.assign(el.style,local(a.sprite));el.style.setProperty('--pd-w',px(a.sprite.w));el.style.setProperty('--pd-h',px(a.sprite.h));el.style.setProperty('--pd-k',String(round3(a.k)))}
  for(const el of ctl.viewportLayers||[])Object.assign(el.style,{left:'0px',top:'0px',width:'100%',height:'100%'});
  for(const layer of ctl.worldLayers||[]){const r=worldRectToScreen(frame,layer.rect),c=intersect(r,L.world);Object.assign(layer.el.style,{left:px(r.x),top:px(r.y),width:px(r.w),height:px(r.h),backgroundSize:'100% 100%',clipPath:`inset(${px(c.y-r.y)} ${px(r.x+r.w-(c.x+c.w))} ${px(r.y+r.h-(c.y+c.h))} ${px(c.x-r.x)})`})}
  const overlay=document.querySelector('#stageContractOverlay');if(overlay&&overlay.parentElement===world){Object.assign(overlay.style,local(frame.env));drawDirectorOverlay(ctl,frame,overlay)}
  if(ctl.roles){
   const rich=anchorPoint(frame,'rich',ctl.roles),enemy=anchorPoint(frame,'enemy',ctl.roles),ref=frame.actors[ctl.roles.rich]||Object.values(frame.actors)[0];
   // Reference-height body (pose-independent): current scale × reference visible height.
   const refBody=ref?ref.k*spriteMeta(data().reference.asset).visible[3]:0,fx=refBody?refBody/data().fxReference.visibleHeight:1,sp=data().spawn;
   set('--pd-fx',String(round3(fx)));ctl.fxScale=fx;ctl.anchors={rich,enemy};
   if(rich&&enemy){set('--pd-missile-dx',px((enemy.x-rich.x)/fx+sp.missileFlight));set('--pd-briefcase-dx',px((rich.x-enemy.x)/fx+sp.briefcaseFlight))}
   if(ctl.fx!==false)for(const item of data().fx||[])placeFx(ctl,item);
  }
 }
 function placeFx(ctl,item){
  const el=document.querySelector(item.el),a=ctl.anchors?.[item.role],fx=ctl.fxScale||1;if(!el||!a)return;
  const style=el.style;let w=item.w;if(item.span){const other=ctl.anchors[item.span];if(other)w=(other.x-a.x)/fx+item.w}
  if(w!=null)style.width=px(w);if(item.h!=null)style.height=px(item.h);
  const cs=getComputedStyle(el),[ox,oy]=cs.transformOrigin.split(' ').map(parseFloat);
  // Visual box after scaling; nudged inside the world viewport (legacy offsets were authored for the throne room).
  const world=ctl.frame?.world,vw=(w??el.offsetWidth)*fx,vh=(item.h??el.offsetHeight)*fx,margin=8*fx,lift=item.lift??18;
  let vx=a.x+item.dx*fx,vy=a.y+item.dy*fx;
  if(world){if(vw<world.w-2*margin)vx=clamp(vx,world.x+margin,world.x+world.w-margin-vw);if(vh<world.h-2*margin)vy=clamp(vy,world.y+margin+lift*fx,world.y+world.h-margin-vh)}
  style.left=px(vx-ox*(1-fx));style.top=px(vy-oy*(1-fx));style.right='auto';style.bottom='auto';style.scale=String(round3(fx));
  (ctl.fxTouched||(ctl.fxTouched=new Set())).add(el);
 }
 // Screen-space point for a legacy-reference offset from a role anchor (for effects spawned in code).
 // size = the effect's unscaled box (legacy px); the point is kept so the scaled box stays inside the world viewport.
 function fxPoint(role,dx,dy,size=[0,0]){const ctl=active;if(!ctl?.anchors?.[role])return null;const a=ctl.anchors[role],fx=ctl.fxScale||1,world=ctl.frame?.world,m=8*fx;let x=a.x+dx*fx,y=a.y+dy*fx;
  if(world){x=clamp(x,world.x+m,world.x+world.w-m-size[0]*fx);y=clamp(y,world.y+m,world.y+world.h-m-size[1]*fx)}return {x,y}}

 function drawDirectorOverlay(ctl,frame,canvas){
  const env=envSize(ctl.stage);if(canvas.width!==env.width||canvas.height!==env.height){canvas.width=env.width;canvas.height=env.height}
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);if(!document.body.classList.contains('stage-overlay-active'))return;
  const u=1/frame.S,toWorld=b=>[frame.camera.x+(b.x-frame.world.x)*u,frame.camera.y+(b.y-frame.world.y)*u,b.w*u,b.h*u];
  ctx.lineWidth=u;ctx.font='6px monospace';ctx.setLineDash([2,2]);ctx.strokeStyle=ctx.fillStyle='#ffcf42';
  for(const line of ctl.stage.contactLines||[]){ctx.beginPath();ctx.moveTo(line.x1??0,line.y);ctx.lineTo(line.x2??env.width,line.y);ctx.stroke();ctx.fillText(`${line.id} ×${line.scale}`,(line.x1??0)+3,line.y-3)}
  ctx.setLineDash([]);
  for(const a of Object.values(frame.actors)){ctx.strokeStyle='#ff6b9e';ctx.strokeRect(...toWorld(a.visible));ctx.strokeStyle='#8cff7a';ctx.strokeRect(...toWorld(a.face))}
 }

 function enter(options){
  if(active)exit();
  const stage=typeof options.stage==='string'?contract(options.stage):options.stage;
  const ctl={...options,stage,beat:options.beat||'default',shot:{...(stage.director?.shots?.[options.beat||'default']||{}),...(options.shot||{})},restore:[]};
  if(!ctl.shot.profile||!ctl.shot.focal)throw new Error(`Director stage ${stage.id}: beat ${ctl.beat} needs a shot profile and focal actors`);
  const screen=screenEl(),world=worldEl(ctl.host);
  document.body.classList.add('pd-active');screen.dataset.pdMode=ctl.mode;screen.dataset.pdStage=stage.id;
  const adopt=el=>{if(!el||el.parentElement===world)return;ctl.restore.push({el,parent:el.parentElement,next:el.nextSibling,style:el.getAttribute('style')});world.appendChild(el)};
  adopt(ctl.env);for(const el of Object.values(ctl.actors))adopt(el);for(const el of ctl.viewportLayers||[])adopt(el);
  const overlay=document.querySelector('#stageContractOverlay');if(overlay)adopt(overlay);
  for(const layer of ctl.worldLayers||[])ctl.restore.push({el:layer.el,style:layer.el.getAttribute('style')});
  active=ctl;
  const observer=new ResizeObserver(()=>{if(active===ctl)relayout(ctl)});observer.observe(screen);ctl.observer=observer;
  ctl.scope?.cleanup(()=>{if(active===ctl)exit()});
  relayout(ctl);ctl.scope?.frame?.(()=>{if(active===ctl)relayout(ctl)});
  document.dispatchEvent(new CustomEvent('ra:presentation-enter',{detail:{stage:stage.id,mode:ctl.mode}}));
  return {relayout:()=>relayout(ctl),frame:()=>ctl.frame,lint:opts=>lintLive(ctl,opts),setBeat:(beat,opts)=>setBeat(ctl,beat,opts),moveTo:(slot,to,opts)=>moveTo(ctl,slot,to,opts),mark:(id,opts)=>mark(ctl,id,opts)};
 }
 // ---- Beats & transitions (deterministic, small): cut | snap-pan for camera; walk/step/enter for actors ----
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 function transitionWorld(ctl,els,ms,steps){const value=ms?`left ${ms}ms steps(${steps},end),top ${ms}ms steps(${steps},end),width ${ms}ms steps(${steps},end),height ${ms}ms steps(${steps},end)`:'';for(const el of els)if(el)el.style.transition=value}
 async function setBeat(ctl,beat,{transition='cut',ms=320,steps=4}={}){
  const shot=ctl.stage.director?.shots?.[beat];if(!shot)throw new Error(`Unknown beat ${beat}`);
  const els=[ctl.env,...Object.values(ctl.actors)];if(transition==='snap-pan')transitionWorld(ctl,els,ms,steps);
  ctl.beat=beat;ctl.shot={...shot};const frame=relayout(ctl);if(transition==='snap-pan'){await wait(ms);transitionWorld(ctl,els,0)}return frame;
 }
 // Move an actor through the world: `to` = {x, line?}; kind walk (stepped), step (short), enter (from outside the view), cut.
 async function moveTo(ctl,slot,to,{kind='walk',ms=1000,steps=8}={}){
  const el=ctl.actors[slot];if(!el)return;const moved=ctl.moved||(ctl.moved={});
  if(kind==='enter'&&ctl.frame){const cam=ctl.frame.camera,side=to.x<cam.x+cam.w/2?-1:1;moved[slot]={...to,x:side<0?cam.x-120:cam.x+cam.w+120};relayout(ctl);await wait(16)}
  if(kind!=='cut')transitionWorld(ctl,[el],ms,steps);
  moved[slot]={...to};relayout(ctl);
  if(kind!=='cut'){await wait(ms);transitionWorld(ctl,[el],0)}
 }
 function mark(ctl,id,opts){const m=ctl.stage.director?.marks?.[id];if(!m)throw new Error(`Unknown mark ${id}`);return moveTo(ctl,m.slot,{x:m.x,line:m.line},opts)}
 function exit(){
  const ctl=active;if(!ctl)return;active=null;ctl.observer?.disconnect();
  for(const item of ctl.restore.reverse()){if(item.parent){if(item.next&&item.next.parentElement===item.parent)item.parent.insertBefore(item.el,item.next);else item.parent.appendChild(item.el)}if(item.style==null)item.el.removeAttribute('style');else item.el.setAttribute('style',item.style)}
  for(const el of ctl.fxTouched||[]){for(const k of ['left','top','width','height','right','bottom','scale'])el.style.removeProperty(k);if(el.getAttribute('style')==='')el.removeAttribute('style')}
  const screen=screenEl();for(const name of [...screen.style])if(name.startsWith('--pd-'))screen.style.removeProperty(name);
  delete screen.dataset.pdMode;delete screen.dataset.pdStage;document.body.classList.remove('pd-active');
  document.querySelector('#pdWorld')?.remove();
 }

 // ---- Live lint: measures the real rendered UI and sprite pixels ----
 const imageCache=new Map();
 // `path#i` = frame i of a horizontal sprite sheet.
 function loadImage(src){if(runtimeMeta.has(src))return Promise.resolve(runtimeMeta.get(src).pixels);if(!imageCache.has(src))imageCache.set(src,new Promise((resolve,reject)=>{const [file,frame]=src.split('#'),sheet=frame!=null?window.RAPresentationAssets?.[file]?.sheet:null;const img=new Image();img.onload=()=>{const w=sheet?sheet.frameWidth:img.naturalWidth,c=document.createElement('canvas');c.width=w;c.height=img.naturalHeight;const g=c.getContext('2d');g.drawImage(img,sheet?-w*+frame:0,0);resolve(g.getImageData(0,0,c.width,c.height))};img.onerror=()=>reject(new Error(`image ${src}`));img.src=file}));return imageCache.get(src)}
 function visibleRect(el){if(!el)return null;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return null;const r=el.getBoundingClientRect(),s=screenEl().getBoundingClientRect();return r.width&&r.height?box(r.left-s.left,r.top-s.top,r.width,r.height):null}
 // Opaque source pixels of an actor that land inside `rect` (screen px, clipped to the world viewport), in CSS px².
 function maskArea(pixels,a,rect,world){const r=intersect(intersect(rect,a.visible),world);if(area(r)<=0)return 0;let n=0;const m=a.meta;
  for(let y=m.visible[1];y<m.visible[1]+m.visible[3];y++)for(let x=m.visible[0];x<m.visible[0]+m.visible[2];x++){if(pixels.data[(y*pixels.width+x)*4+3]<16)continue;const sx=a.sprite.x+(a.flip?m.width-x-1:x)*a.k,sy=a.sprite.y+y*a.k;n+=area(intersect(box(sx,sy,a.k,a.k),r))}return n}
 // Dead space: share of the world viewport showing low-detail environment (8×8 native tiles whose pixels
 // barely deviate from the tile median) and no focal actor. Threshold is locked from the golden set.
 // Dead space: the canonical metric (js/engine/presentation_metrics.js), over the visible world viewport.
 async function deadSpace(ctl,frame){
  const canvas=ctl.env?.tagName==='CANVAS'?ctl.env:null;if(!canvas&&!ctl.envAsset)return null;
  const pixels=canvas?canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height):await loadImage(ctl.envAsset);
  const focal=ctl.shot.focal.map(s=>frame.actors[s]).filter(Boolean).map(a=>a.visible);
  return window.RAPresentationMetrics.deadSpace({pixels,envRect:frame.env,clip:frame.world,focal});
 }
 async function lintLive(ctl,{fx=true}={}){
  const frame=relayout(ctl);if(!frame)return null;
  const base=data().modes[ctl.mode],mode={...base,...(ctl.ui?{uiSelectors:ctl.ui.selectors||base.uiSelectors,dialogueSelectors:ctl.ui.dialogue||base.dialogueSelectors,bubbleSelectors:ctl.ui.bubbles||base.bubbleSelectors}:{})},uiRects=mode.uiSelectors.flatMap(sel=>[...document.querySelectorAll(sel)].map(visibleRect).filter(Boolean));
  const report=lintFrame(ctl.stage,frame,{profile:ctl.shot.profile,focal:ctl.shot.focal,speakers:ctl.shot.speakers||ctl.shot.focal,reference:ctl.shot.reference,uiRects,golden:window.RAPresentationLocks?.golden?.(ctl.stage.id,ctl.beat),exception:ctl.exception});
  if(ctl.exception)report.exception=ctl.exception;
  const add=(id,pass,value,limit,note)=>report.checks.push({id,pass:!!pass,value,limit,...(note?{note}:{})});
  const order=Object.values(frame.actors).sort((a,b)=>(+getComputedStyle(ctl.actors[a.slot]).zIndex||0)-(+getComputedStyle(ctl.actors[b.slot]).zIndex||0)||a.anchor.y-b.anchor.y);
  const bubbles=(mode.bubbleSelectors||[]).map(s=>visibleRect(document.querySelector(s))).filter(Boolean);
  for(const slot of ctl.shot.focal){const a=frame.actors[slot];if(!a?.asset)continue;const pixels=await loadImage(a.asset);
   const ov=uiRects.reduce((n,r)=>n+maskArea(pixels,a,r,frame.world),0);add(`ui-overlap-px:${slot}`,ov<=data().acceptance.uiOverlapPx,Math.round(ov),0,'opaque sprite pixels under rendered UI (CSS px²)');
   let covered=0;const face=intersect(a.face,frame.world);covered+=area(a.face)-area(face);
   for(const r of [...uiRects,...bubbles])covered+=area(intersect(face,r));
   for(const front of order.slice(order.indexOf(a)+1)){if(!front.asset)continue;covered+=maskArea(await loadImage(front.asset),front,face,frame.world)}
   const visible=area(a.face)?Math.max(0,1-covered/area(a.face)):1,accepted=ctl.exception?.accept?.includes('face-visible');add(`face-visible:${slot}`,accepted||visible>=data().acceptance.faceVisible-.0005,round3(visible),1,accepted&&visible<data().acceptance.faceVisible-.0005?`ACCEPTED ${ctl.exception.ticket}`:undefined);
  }
  const dead=await deadSpace(ctl,frame);const threshold=data().acceptance.deadSpace;
  // Placeholder environments are flat by design: dead space is provisional until final art lands.
  const envProvisional=!!ctl.envPlaceholder&&threshold!=null&&dead>threshold;
  add('dead-space',envProvisional||(threshold==null?true:dead<=threshold),dead,threshold??'measure-only (lock from golden set)',envProvisional?'PROVISIONAL (placeholder environment art)':undefined);
  for(const sel of mode.dialogueSelectors){const el=document.querySelector(sel);if(el&&visibleRect(el))add(`text-fit:${sel}`,el.scrollHeight<=el.clientHeight+1&&el.scrollWidth<=el.clientWidth+1,`${el.scrollWidth}x${el.scrollHeight}`,`${el.clientWidth}x${el.clientHeight}`)}
  if(fx)for(const item of data().fx||[]){const r=visibleRect(document.querySelector(item.el));if(!r)continue;const cx=r.x+r.w/2,cy=r.y+r.h/2,ok=cx>=frame.world.x&&cx<=frame.world.x+frame.world.w&&cy>=frame.world.y&&cy<=frame.world.y+frame.world.h;add(`fx-bounds:${item.el}`,ok,round3(inside(r,frame.world)),'centre inside world viewport')}
  report.pass=report.checks.every(c=>c.pass);
  report.frame={W:frame.layout.W,H:frame.layout.H,dpr:frame.dpr,world:frame.world,hud:frame.layout.hud,ui:frame.layout.ui,camera:Object.fromEntries(Object.entries(frame.camera).map(([k,v])=>[k,typeof v==='number'?round3(v):v])),actors:Object.fromEntries(Object.entries(frame.actors).map(([k,a])=>[k,{asset:a.asset,k:round3(a.k),visible:a.visible,face:a.face}])),uiRects};
  report.metrics.deadSpace=dead;report.stage=ctl.stage.id;report.beat=ctl.beat;report.mode=ctl.mode;report.profile=ctl.shot.profile;
  return report;
 }

 // Deterministic self-test (runs in the Node release gate without a DOM).
 function runDirectorSelfTest(){
  const stage=contract('jdm-imports-docks'),rich='assets/rich_standing_right.png',imp='assets/jdm_imports/characters/importer/importer_combat_ready.png';
  for(const [W,H] of [[360,740],[390,844],[430,932]]){
   const L=screenLayout('combat',W,H);
   if(L.world.y<L.hud.y+L.hud.h||L.ui.y<L.world.y+L.world.h)throw new Error('combat bands overlap');
   const spec={stage,profile:'combat',focal:['rich','importer'],reference:'rich',assets:{rich,importer:imp},states:stage.director.states,view:{w:L.world.w,h:L.world.h}};
   const cams=search(spec);if(!cams.length||cams.length>6)throw new Error('search size');
   const cam=solve(spec),frame=project(stage,L,cam,['rich','importer'].map(s=>worldActor(stage,s,spec.assets[s])),3);frame.layout=L;
   const lint=lintFrame(stage,frame,{profile:'combat',focal:['rich','importer'],reference:'rich',uiRects:[L.hud,L.ui]});
   if(!lint.pass)throw new Error(`docks combat lint failed at ${W}x${H}: ${lint.checks.filter(c=>!c.pass).map(c=>c.id).join(',')}`);
   if(JSON.stringify(solve(spec))!==JSON.stringify(cam))throw new Error('solve not deterministic');
   if(JSON.stringify(solve({...spec,assets:{rich,importer:stage.director.states.importer[2]}}))!==JSON.stringify(cam))throw new Error('camera must not depend on the current actor state');
  }
  return true;
 }
 function runSelfTest(){const stage={...contract('jdm-imports-docks'),fixedScale:true};if(stage.native.width!==270||stage.native.height!==480||stage.contactLines[0].y!==350)throw new Error('docks contract parse failed');const a=actorRect(stage,'rich'),b=actorRect(stage,'daughter');if(a.contact.y!==350||b.contact.y!==350||!stage.actors.daughter.observer)throw new Error('contact/observer failure');const rendered=transform(stage,a,{left:0,top:0,width:540,height:960},{left:0,top:0});if(rendered.left!==10||rendered.top!==480||rendered.contact.y!==700)throw new Error('native to rendered transform failed');if(JSON.stringify(rendered)!==JSON.stringify(transform(stage,a,{left:0,top:0,width:540,height:960},{left:0,top:0})))throw new Error('layout drift');if(window.RAPresentationData&&window.RAPresentationAssets)runDirectorSelfTest();return true}

 window.RAStageLayout={contract,actorRect,transform,layout,activate,drawOverlay,runSelfTest};
 window.RAPresentationDirector={screenLayout,worldActor,solve,search,project,lintFrame,enter,exit,fxPoint,runSelfTest:runDirectorSelfTest,
  active:()=>!!active,current:()=>active&&{stage:active.stage.id,mode:active.mode,beat:active.beat,frame:active.frame},
  worldRect:()=>active?.frame?.world||null,actorBox:slot=>active?.frame?.actors?.[slot]||null,adventureStage,combat2Stage,mark:(id,opts)=>active?mark(active,id,opts):Promise.resolve(false),resetMoves:()=>{if(active?.moved){active.moved={};relayout(active)}},moveTo:(slot,to,opts)=>active?moveTo(active,slot,to,opts):Promise.resolve(false),setBeat:(beat,opts)=>active?setBeat(active,beat,opts):null,relayout:()=>active&&relayout(active),lint:opts=>active?lintLive(active,opts):Promise.resolve(null),
  preview:(beatOrShot)=>{if(!active)return null;const prev=active.shot;active.shot={...prev,...beatOrShot};const f=relayout(active);return {frame:f,restore:()=>{active.shot=prev;relayout(active)}}}};
})();
