// F15 scene-art checks (real Chromium; imported by browser-check.mjs `art` section). Measures the REAL rendered scene: environment bytes as
// served, sprite loads, actor placement from the Presentation Director's own projected frame, and clearance of dialogue / combat UI.
import fs from 'node:fs';
import path from 'node:path';
import {root} from './_browser.mjs';

export const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/f15/scene_art_manifest.json'),'utf8'));
export const ENV_FILES={f15_bing:'the_bing',f15_gym:'boxing_gym',f15_roxy_apartment:'roxy_apartment',f15_plenitude:'plenitude',f15_convention:'convention_hall',
  f15_rosalyn_apartment:'rosalyn_apartment',f15_rosalyn_apartment_dark:'rosalyn_apartment',f15_shrine:'shrine_auditorium'};
export const hashOf=rel=>manifest.files.find(f=>f.path===rel)?.sha256;

// One in-page snapshot of whatever scene is on screen (adventure or Combat 2.0).
export const measure=()=>{
  const q=s=>document.querySelector(s),R=el=>{if(!el)return null;const b=el.getBoundingClientRect();return b.width||b.height?{x:b.left,y:b.top,w:b.width,h:b.height}:null;};
  const combat=document.body.classList.contains('combat2-mode');
  const scene=combat?q('.c2-scene'):q('#adventureScene');if(!scene)return null;
  const D=window.RAPresentationDirector,world=D.worldRect();
  const actors=[...scene.querySelectorAll(combat?'.c2-actor':'.adv-actor')].map(el=>{
    const slot=el.dataset.slot||(el.classList.contains('c2-rich')?'rich':el.classList.contains('c2-enemy')?'enemy':null),a=slot?D.actorBox(slot):null;
    return {slot,id:el.dataset.actor||null,tag:el.tagName,src:el.getAttribute('src'),ok:el.tagName==='IMG'?(el.complete&&el.naturalWidth>0):true,nw:el.naturalWidth||0,nh:el.naturalHeight||0,
      css:R(el),visible:a?.visible||null,sprite:a?.sprite||null,face:a?.face||null,contact:a?.contact||null,world:a?.world||null,k:a?.k||null,hidden:getComputedStyle(el).opacity==='0',
      rendering:getComputedStyle(el).imageRendering};});
  // True pixel bodies: rasterise each actor image at its on-screen rect (nearest-neighbour, honouring its flip) and overlap uses alpha > 40; bounds use any alpha.
  const W=Math.ceil(innerWidth),H=Math.ceil(innerHeight),masks=[];
  for(const a of actors){
    const el=[...scene.querySelectorAll(combat?'.c2-actor':'.adv-actor')].find(e=>(e.dataset.slot||(e.classList.contains('c2-rich')?'rich':'enemy'))===a.slot);
    if(!el||a.hidden||!a.css||(el.tagName==='IMG'&&!el.complete))continue;
    const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;
    const r=el.getBoundingClientRect(),flip=/^matrix\(-1/.test(getComputedStyle(el).transform);
    if(flip){g.translate(r.left+r.width,0);g.scale(-1,1);g.drawImage(el,0,r.top,r.width,r.height);}else g.drawImage(el,r.left,r.top,r.width,r.height);
    const d=g.getImageData(0,0,W,H).data,m=new Uint8Array(W*H);let x0=W,y0=H,x1=-1,y1=-1,n=0;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const al=d[(y*W+x)*4+3];if(al>40){m[y*W+x]=1;n++;}if(al>0){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}
    a.body=x1>=0?{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}:null;a.pixels=n;masks.push({a,m,n});
  }
  const pairs=[];
  for(let i=0;i<masks.length;i++)for(let j=i+1;j<masks.length;j++){let o=0;const A=masks[i].m,B=masks[j].m;for(let k=0;k<A.length;k++)if(A[k]&&B[k])o++;pairs.push({a:masks[i].a.id||masks[i].a.slot,b:masks[j].a.id||masks[j].a.slot,overlap:o,frac:o/Math.max(1,Math.min(masks[i].n,masks[j].n))});}
  const envId=combat?null:scene.dataset.env;
  return {combat,env:envId,world,actors,pairs,
    ui:{box:R(q('.adv-box:not([hidden])')),bubble:R(q('.adv-bubble:not([hidden])')),choices:[...document.querySelectorAll('.adv-choices:not([hidden]) .adv-choice')].map(R).filter(Boolean),
      hud:[...document.querySelectorAll('.c2-hud .c2-hp')].map(R).filter(Boolean),telegraph:R(q('.c2-telegraph:not([hidden])')),panel:R(q('.c2-panel')),title:R(q('.adv-title:not([hidden])')),location:R(q('.adv-location'))}};
};
const inter=(a,b)=>{if(!a||!b)return 0;const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),w=Math.min(a.x+a.w,b.x+b.w)-x,h=Math.min(a.y+a.h,b.y+b.h)-y;return w>0&&h>0?w*h:0;};
const area=r=>r?r.w*r.h:0;

// Pure checks over one measurement -> list of {ok,msg}.
export function evaluate(m,tag){
  const out=[],add=(ok,msg)=>out.push({ok:!!ok,msg:`${tag}: ${msg}`});
  const vis=m.actors.filter(a=>!a.hidden&&a.body);
  for(const a of m.actors){if(a.tag==='IMG')add(a.ok,`actor ${a.id||a.slot} sprite loaded (${a.src}, ${a.nw}x${a.nh})`);}
  for(const a of vis){
    const f=inter(a.body,m.world)/area(a.body);
    add(f>=0.999,`${a.id||a.slot} drawn pixels fully inside the world viewport (${(f*100).toFixed(1)}%)`);
    if(a.id==='granny_bing'||a.id==='spirit_of_uncle_bunmi'){
      const feet=a.body.y+a.body.h;
      add(Math.abs(feet-a.contact.y)<=2,`${a.id} stands on its contact line (drawn feet ${feet.toFixed(1)} vs contact ${a.contact.y.toFixed(1)})`);
      add(a.rendering==='pixelated'||a.rendering==='crisp-edges',`${a.id} is displayed nearest-neighbour (${a.rendering})`);
    }
  }
  for(const p of m.pairs)add(p.frac<=0.2,`${p.a} / ${p.b} drawn pixels overlap ${(p.frac*100).toFixed(1)}% of the smaller (limit 20%)`);
  const faces=vis.map(a=>a.face&&{id:a.id||a.slot,r:{x:a.face.x,y:a.face.y,w:a.face.w,h:a.face.h}}).filter(Boolean);
  const cs=m.ui.choices,choiceBox=cs.length?{x:Math.min(...cs.map(c=>c.x)),y:Math.min(...cs.map(c=>c.y)),w:Math.max(...cs.map(c=>c.x+c.w))-Math.min(...cs.map(c=>c.x)),h:Math.max(...cs.map(c=>c.y+c.h))-Math.min(...cs.map(c=>c.y))}:null;
  for(const [name,r] of [['dialogue box',m.ui.box],['bubble',m.ui.bubble],['choices',choiceBox]]){
    if(!r)continue;
    const hit=faces.filter(f=>inter(r,f.r)>0).map(f=>f.id);add(hit.length===0,`${name} covers no actor's face${hit.length?' ('+hit.join(', ')+')':''}`);
  }
  for(const [name,r] of [...m.ui.hud.map((r,i)=>[`combat HUD ${i+1}`,r]),['combat telegraph',m.ui.telegraph],['combat panel',m.ui.panel]]){
    if(!r)continue;const hit=vis.filter(a=>inter(r,a.body)>4).map(a=>a.id||a.slot);add(hit.length===0,`${name} clears every actor body${hit.length?' ('+hit.join(', ')+')':''}`);
  }
  return out;
}
