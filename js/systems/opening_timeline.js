(function(){
 'use strict';
 const actor=(root,id)=>root.querySelector(`.adv-actor[data-actor="${id}"]`)||root.querySelector(`#pdWorld [data-actor="${id}"]`);
 // Candidate art may register exact per-state PNGs additively. Frozen references remain the fallback.
 const art=()=>window.RAOpeningArt||{};
 async function play(root,scope,node){
  const active=window.RAAdventures?.active?.();if(active?.id!=='A00'||!node.openingAction)return null;
  const rich=actor(root,'rich'),sensei=actor(root,'octopus_sensei');if(!rich)return {completed:false,cancelled:false,missingActor:true};
  const poses=art().rich||{},sp=art().sensei||{};
  if(node.openingAction==='fall'){
   const world=window.RAPresentationDirector?.worldRect?.()||{x:0,y:0,w:root.clientWidth},origin=root.getBoundingClientRect(),r=rich.getBoundingClientRect(),scale=world.w/270;
   const ladderDx=200-(r.left-origin.left-world.x+r.width/2)/scale;
   const positions=[[0,0,0,'climb'],[240,-54,0,'climb'],[480,-108,0,'climb'],[720,-162,0,'climb'],[960,-216,0,'reach'],[1200,-270,0,'reach'],[1380,-290,0,'slip'],[1530,-270,-22,'tumble'],[1690,-224,30,'tumble'],[1850,-150,-36,'tumble'],[2010,-40,42,'tumble'],[2100,0,0,'impact'],[2400,0,0,'recover'],[2700,0,0,'idle']];
   return RABeatTimeline.play({root,scope,duration:2800,frames:positions.map(([at,dy,angle,state])=>({at,actors:[{el:rich,dx:ladderDx,dy,angle,src:poses[state]}]}))});
  }
  if(node.openingAction==='brain'){
   const purple=document.createElement('canvas');purple.width=48;purple.height=48;const c=purple.getContext('2d');c.imageSmoothingEnabled=false;
   // Interim native pixel prop only; commissioned brain/body states replace it through RAOpeningArt.
   c.fillStyle='#503073';c.fillRect(12,9,24,22);c.fillStyle='#9460c0';c.fillRect(10,13,28,14);c.fillStyle='#c390e0';c.fillRect(14,10,7,6);c.fillRect(25,12,6,5);c.fillStyle='#73439a';for(let i=0;i<4;i++){c.fillRect(9+i*8,28,4,11);c.fillRect(7+i*8,37,6,3);}
   const offer=active.vars?.brainOffer||['whole','polite','asked'][active.vars?.picks?.brain_offer]||'whole';
   const wait=offer==='whole'?0:350;
   const world=RAPresentationDirector.worldRect()||{x:0,y:0,w:root.clientWidth,h:root.clientHeight}, origin=root.getBoundingClientRect(), rr=rich.getBoundingClientRect(), sr=sensei?.getBoundingClientRect()||rr, scale=world.w/270;
   const head=r=>({x:(r.left-origin.left-world.x)/scale+r.width/scale/2-24,y:(r.top-origin.top-world.y)/scale+8});
   const from=head(sr),to=head(rr),point=t=>({x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t});
   const result=await RABeatTimeline.play({root,scope,duration:2050+wait,overlays:[{id:'brain',src:art().brain?.reveal,canvas:art().brain?.reveal?null:purple,x:from.x,y:from.y,w:48,h:48,hidden:true}],frames:[
    {at:0,actors:[{el:rich,src:poses.reach},{el:sensei,src:sp.point}]},
    {at:300+wait,actors:[{el:rich,dx:offer==='whole'?16:8,src:poses.grab},{el:sensei,src:sp.startled}],overlays:[{id:'brain',visible:true,src:art().brain?.reveal}]},
    {at:650+wait,overlays:[{id:'brain',...point(.25),src:art().brain?.travel}]},
    {at:900+wait,overlays:[{id:'brain',...point(.5)}]},
    {at:1150+wait,actors:[{el:rich,src:poses.recoil},{el:sensei,src:sp.recoil}],overlays:[{id:'brain',...point(.8)}]},
    {at:1400+wait,actors:[{el:rich,src:poses.headache},{el:sensei,src:sp.exasperated}],overlays:[{id:'brain',x:to.x,y:to.y,src:art().brain?.merge}]},
    {at:1750+wait,actors:[{el:rich,src:poses.settled},{el:sensei,src:sp.neutral}],overlays:[{id:'brain',visible:false}]},
    {at:2050+wait,actors:[{el:rich,src:poses.settled},{el:sensei,src:sp.neutral}]}
   ]});
   // A cancelled scene never earns the acquisition. Reload replays this same named node safely.
   if(result.completed&&RAAdventures.active()?.id==='A00'&&RAAdventures.active()?.node==='merge')RAAdventures.context().set('brainTransferSeen',true);
   return result;
  }
 }
 window.RAOpeningTimeline={play};
})();
