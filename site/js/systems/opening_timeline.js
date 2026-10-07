(function(){
 'use strict';
 const actor=(root,id)=>root.querySelector(`.adv-actor[data-actor="${id}"]`)||root.querySelector(`#pdWorld [data-actor="${id}"]`);
 const base='assets/rc5/opening_v007/';
 // Exact sealed v007 bytes, locally reviewed state by state. This binding belongs only to A00 presentation.
 window.RAOpeningArt=window.RAOpeningArt||{
  rich:Object.fromEntries(['climb','reach','slip','tumble','impact','recover','recoil','headache','settled'].map(s=>[s,base+'rich/'+s+'.png']).concat([['grab',base+'rich/grasp.png'],['idle',base+'rich/settled.png']])),
  sensei:Object.fromEntries(['neutral','point','startled','recoil','exasperated'].map(s=>[s,base+'sensei/'+s+'.png'])),
  brain:Object.fromEntries(['reveal','reach','grab','travel','merge','settled'].map(s=>[s,base+'brain/'+s+'.png'])),
  headCenters:{"rich":{"climb":[39.5,50],"reach":[40.5,42],"slip":[37.5,52],"tumble":[34,64],"impact":[44.5,61],"recover":[45.5,62.7],"grab":[39.045,48.409],"recoil":[37.5,52],"headache":[41.5,52],"settled":[41.5,52],"idle":[41.5,52]},"octopus_sensei":{"neutral":[47,42],"point":[47,42],"startled":[47,43],"recoil":[46,42],"exasperated":[47,42]}}
 };
 const openingMeta=[{"src":"assets/rc5/opening_v007/rich/climb.png","width":80,"height":96,"anchor":[40,88],"visible":[26,34,32,54],"face":[30,43,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":88,"x1":28,"x2":52,"threshold":128}},{"src":"assets/rc5/opening_v007/rich/reach.png","width":80,"height":96,"anchor":[40,88],"visible":[26,21,35,67],"face":[31,35,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":88,"x1":28,"x2":52,"threshold":128}},{"src":"assets/rc5/opening_v007/rich/slip.png","width":80,"height":96,"anchor":[40,88],"visible":[23,36,37,52],"face":[28,45,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":88,"x1":28,"x2":52,"threshold":128}},{"src":"assets/rc5/opening_v007/rich/tumble.png","width":80,"height":96,"anchor":[40,88],"visible":[20,45,47,36],"face":[24.5,57,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":88,"x1":28,"x2":52,"threshold":128}},{"src":"assets/rc5/opening_v007/rich/impact.png","width":80,"height":96,"anchor":[40,88],"visible":[18,46,43,42],"face":[35,54,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":88,"x1":28,"x2":52,"threshold":128}},{"src":"assets/rc5/opening_v007/rich/recover.png","width":80,"height":96,"anchor":[40,88],"visible":[24,49,34,39],"face":[36,55.7,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":88,"x1":28,"x2":52,"threshold":128}},{"src":"assets/rc5/opening_v007/rich/grasp.png","width":80,"height":96,"anchor":[40,88],"visible":[25,30,35,58],"face":[29.545,41.409,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":88,"x1":28,"x2":52,"threshold":128}},{"src":"assets/rc5/opening_v007/rich/recoil.png","width":80,"height":96,"anchor":[40,88],"visible":[25,36,32,52],"face":[28,45,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":88,"x1":28,"x2":52,"threshold":128}},{"src":"assets/rc5/opening_v007/rich/headache.png","width":80,"height":96,"anchor":[40,88],"visible":[27,37,27,51],"face":[32,45,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":88,"x1":28,"x2":52,"threshold":128}},{"src":"assets/rc5/opening_v007/rich/settled.png","width":80,"height":96,"anchor":[40,88],"visible":[27,36,27,52],"face":[32,45,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":88,"x1":28,"x2":52,"threshold":128}},{"src":"assets/rc5/opening_v007/sensei/neutral.png","width":96,"height":96,"anchor":[48,84],"visible":[23,24,49,46],"face":[37.5,35,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":84,"x1":36,"x2":60,"threshold":128}},{"src":"assets/rc5/opening_v007/sensei/point.png","width":96,"height":96,"anchor":[48,84],"visible":[21,24,52,46],"face":[37.5,35,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":84,"x1":36,"x2":60,"threshold":128}},{"src":"assets/rc5/opening_v007/sensei/startled.png","width":96,"height":96,"anchor":[48,84],"visible":[24,25,48,45],"face":[37.5,36,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":84,"x1":36,"x2":60,"threshold":128}},{"src":"assets/rc5/opening_v007/sensei/recoil.png","width":96,"height":96,"anchor":[48,84],"visible":[22,23,50,51],"face":[36.5,35,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":84,"x1":36,"x2":60,"threshold":128}},{"src":"assets/rc5/opening_v007/sensei/exasperated.png","width":96,"height":96,"anchor":[48,84],"visible":[24,24,48,47],"face":[37.5,35,19,14],"faceSource":"artist-authored candidate head center","authority":"ASSISTANT REVIEWED CANDIDATE","support":{"y":84,"x1":36,"x2":60,"threshold":128}}];
 if(window.RAPresentationAssets)for(const {src,...meta} of openingMeta)RAPresentationAssets[src]=meta;
 // Candidate art may register exact per-state PNGs additively. Frozen references remain the fallback.
 const art=()=>window.RAOpeningArt||{};
 async function play(root,scope,node){
  const active=window.RAAdventures?.active?.();if(active?.id!=='A00'||!node.openingAction)return null;
  const rich=actor(root,'rich'),sensei=actor(root,'octopus_sensei');if(!rich)return {completed:false,cancelled:false,missingActor:true};
  const poses=art().rich||{},sp=art().sensei||{};
  if(node.openingAction==='fall'){
   const world=window.RAPresentationDirector?.worldRect?.()||{x:0,y:0,w:root.clientWidth},origin=root.getBoundingClientRect(),r=rich.getBoundingClientRect(),scale=world.w/270;
   // Dialogue zoom cannot be used for a full ladder traversal: it cropped the authored reach/slip above the stage.
   // Preserve the actual ground contact, stage native-sized motion at the ladder, and fit the rise to this viewport.
   const savedStyle=rich.getAttribute('style'),floor=r.top-origin.top+r.height*88/96,fallActor=rich.cloneNode(true);
   const rise=Math.min(290,Math.max(0,(floor-world.y)/scale-(88-21+8))),vertical=rise/290;
   // A scoped presentation clone prevents Director image-load relayout from restoring dialogue zoom mid-fall.
   fallActor.removeAttribute('id');fallActor.className='opening-fall-actor';fallActor.removeAttribute('data-slot');
   Object.assign(fallActor.style,{position:'absolute',left:(world.x+160*scale)+'px',top:(floor-88*scale)+'px',width:(80*scale)+'px',height:(96*scale)+'px',transform:'',zIndex:'4',imageRendering:'pixelated',pointerEvents:'none'});
   rich.style.visibility='hidden';root.append(fallActor);
   const positions=[[0,0,0,'climb'],[240,-54,0,'climb'],[480,-108,0,'climb'],[720,-162,0,'climb'],[960,-216,0,'reach'],[1200,-270,0,'reach'],[1380,-290,0,'slip'],[1530,-270,-22,'tumble'],[1690,-224,30,'tumble'],[1850,-150,-36,'tumble'],[2010,-40,42,'tumble'],[2100,0,0,'impact'],[2400,0,0,'recover'],[2700,0,0,'idle']];
   try{return await RABeatTimeline.play({root,scope,duration:2800,frames:positions.map(([at,dy,angle,state])=>({at,actors:[{el:fallActor,dy:dy*vertical,angle,src:poses[state]}]}))});}
   finally{fallActor.remove();if(savedStyle==null)rich.removeAttribute('style');else rich.setAttribute('style',savedStyle);}
  }
  if(node.openingAction==='brain'){
   const purple=document.createElement('canvas');purple.width=48;purple.height=48;const c=purple.getContext('2d');c.imageSmoothingEnabled=false;
   // Interim native pixel prop only; commissioned brain/body states replace it through RAOpeningArt.
   c.fillStyle='#503073';c.fillRect(12,9,24,22);c.fillStyle='#9460c0';c.fillRect(10,13,28,14);c.fillStyle='#c390e0';c.fillRect(14,10,7,6);c.fillRect(25,12,6,5);c.fillStyle='#73439a';for(let i=0;i<4;i++){c.fillRect(9+i*8,28,4,11);c.fillRect(7+i*8,37,6,3);}
   const offer=active.vars?.brainOffer||['whole','polite','asked'][active.vars?.picks?.brain_offer]||'whole';
   const wait=offer==='whole'?0:350;
   const world=RAPresentationDirector.worldRect()||{x:0,y:0,w:root.clientWidth,h:root.clientHeight}, origin=root.getBoundingClientRect(), rr=rich.getBoundingClientRect(), sr=sensei?.getBoundingClientRect()||rr, scale=world.w/270;
   const head=(el,r,state)=>{
    const staged=window.RAPresentationDirector?.actorBox?.(el?.dataset.slot),fallback=el?.dataset.actor==='octopus_sensei'?{width:96,height:96,face:[36,36,22,12]}:{width:80,height:96,face:[32,45,19,14]};
    const meta=staged?.meta||fallback,face=meta.face||fallback.face;
    const supplied=art().headCenters?.[el?.dataset.actor]?.[state],center=supplied||[face[0]+face[2]/2,face[1]+face[3]/2];
    const fx=staged?.flip?meta.width-center[0]:center[0];
    // Authored face coordinates exclude transparent cell padding and survive Director zoom.
    return {x:(r.left-origin.left-world.x+r.width*fx/meta.width)/scale-24,y:(r.top-origin.top-world.y+r.height*center[1]/meta.height)/scale-24};
   };
   const from=head(sensei,sr,'startled'),to=head(rich,rr,'headache'),point=t=>({x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t});
   const result=await RABeatTimeline.play({root,scope,duration:2050+wait,overlays:[{id:'brain',src:art().brain?.reveal,canvas:art().brain?.reveal?null:purple,x:from.x,y:from.y,w:48,h:48,hidden:true}],frames:[
    {at:0,actors:[{el:rich,src:poses.reach},{el:sensei,src:sp.point}]},
    {at:300+wait,actors:[{el:rich,dx:offer==='whole'?16:8,src:poses.grab},{el:sensei,src:sp.startled}],overlays:[{id:'brain',visible:true,src:art().brain?.reveal}]},
    {at:650+wait,overlays:[{id:'brain',...point(.25),src:art().brain?.reach}]},
    {at:900+wait,overlays:[{id:'brain',...point(.5),src:art().brain?.grab}]},
    {at:1150+wait,actors:[{el:rich,src:poses.recoil},{el:sensei,src:sp.recoil}],overlays:[{id:'brain',...point(.8),src:art().brain?.travel}]},
    {at:1400+wait,actors:[{el:rich,src:poses.headache},{el:sensei,src:sp.exasperated}],overlays:[{id:'brain',x:to.x,y:to.y,src:art().brain?.merge}]},
    {at:1750+wait,actors:[{el:rich,src:poses.settled},{el:sensei,src:sp.neutral}],overlays:[{id:'brain',src:art().brain?.settled}]},
    // Skip/reduced motion must still show the merged brain before the presentation receipt can unlock it.
    {at:2050+wait,actors:[{el:rich,src:poses.settled},{el:sensei,src:sp.neutral}],overlays:[{id:'brain',x:to.x,y:to.y,src:art().brain?.settled,visible:true}]}
   ]});
   // A cancelled scene never earns the acquisition. Reload replays this same named node safely.
   if(result.completed&&RAAdventures.active()?.id==='A00'&&RAAdventures.active()?.node==='merge')RAAdventures.context().set('brainTransferSeen',true);
   return result;
  }
 }
 window.RAOpeningTimeline={play};
})();
