(function(){
 'use strict';
 // RC2 BUILD 2 · RUNTIME RE-PIXELATION. Frozen art files are never altered; this is a display transform that pulls
 // soft, painterly, high-colour pictures (AI-generated backgrounds, smoothly downsampled dance frames) back onto the
 // game's hard-pixel look: a small median-cut palette, ordered (Bayer) dithering instead of gradients, no semi-transparent
 // edges, optional 1px ink outline and block mosaic for animated sprites. Results are cached per source + options.
 const cache=new Map();
 const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
 const clamp=v=>v<0?0:v>255?255:v;
 function medianCut(px,n){
  let boxes=[px.slice()];
  while(boxes.length<n){
   let bi=-1,best=-1,ch=0;
   boxes.forEach((b,i)=>{if(b.length<2)return;let mn=[255,255,255],mx=[0,0,0];for(const p of b)for(let c=0;c<3;c++){if(p[c]<mn[c])mn[c]=p[c];if(p[c]>mx[c])mx[c]=p[c];}
    for(let c=0;c<3;c++){const score=(mx[c]-mn[c])*Math.sqrt(b.length);if(score>best){best=score;bi=i;ch=c;}}});
   if(bi<0)break;const b=boxes[bi];b.sort((a,c)=>a[ch]-c[ch]);const mid=b.length>>1;boxes.splice(bi,1,b.slice(0,mid),b.slice(mid));
  }
  return boxes.filter(b=>b.length).map(b=>{let r=0,g=0,bl=0;for(const p of b){r+=p[0];g+=p[1];bl+=p[2];}const k=b.length;return [Math.round(r/k),Math.round(g/k),Math.round(bl/k)];});
 }
 function palette(data,n,stride=7){const px=[];for(let i=0;i<data.length;i+=4*stride)if(data[i+3]>=128)px.push([data[i],data[i+1],data[i+2]]);return px.length?medianCut(px,n):[[0,0,0]];}
 function lookupFactory(pal){const memo=new Int16Array(32768).fill(-1);return(r,g,b)=>{const k=((r>>3)<<10)|((g>>3)<<5)|(b>>3);let v=memo[k];if(v>=0)return v;let bi=0,bd=1e9;for(let i=0;i<pal.length;i++){const p=pal[i],dr=p[0]-r,dg=p[1]-g,db=p[2]-b,d=dr*dr*3+dg*dg*4+db*db*2;if(d<bd){bd=d;bi=i;}}memo[k]=bi;return bi;};}
 function toCanvas(img){const c=document.createElement('canvas');c.width=img.naturalWidth||img.width;c.height=img.naturalHeight||img.height;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;x.drawImage(img,0,0);return c;}
 // process(img,{colors,dither,block,cell,outline,alphaCut,inkColor}) -> HTMLCanvasElement (same pixel dimensions as the source)
 function process(img,opts={}){
  const o={colors:32,dither:6,block:1,cell:null,outline:false,alphaCut:128,ink:[23,19,30],...opts};
  const key=`${img.src||''}|${o.colors}|${o.dither}|${o.block}|${o.outline}|${o.cell?o.cell.join('x'):''}`;if(img.src&&cache.has(key))return cache.get(key);
  const c=toCanvas(img),x=c.getContext('2d',{willReadFrequently:true}),W=c.width,H=c.height,id=x.getImageData(0,0,W,H),d=id.data;
  // 1. block mosaic (average each block, aligned to the cell origin so frames never bleed) — this makes the pixel grid coarser
  if(o.block>1){const B=o.block,cw=o.cell?o.cell[0]:W,ch=o.cell?o.cell[1]:H;for(let by=0;by<H;by+=B)for(let bx=0;bx<W;bx+=B){const x0=Math.floor(bx/cw)*cw,y0=Math.floor(by/ch)*ch;let r=0,g=0,b=0,a=0,n=0;const xe=Math.min(bx+B,x0+cw,W),ye=Math.min(by+B,y0+ch,H);
    for(let yy=by;yy<ye;yy++)for(let xx=bx;xx<xe;xx++){const i=(yy*W+xx)*4,al=d[i+3];r+=d[i]*al;g+=d[i+1]*al;b+=d[i+2]*al;a+=al;n++;}
    const av=n?a/n:0,rr=a?r/a:0,gg=a?g/a:0,bb=a?b/a:0;for(let yy=by;yy<ye;yy++)for(let xx=bx;xx<xe;xx++){const i=(yy*W+xx)*4;d[i]=rr;d[i+1]=gg;d[i+2]=bb;d[i+3]=av;}}}
  // 2. palette + ordered dither + hard alpha
  const pal=palette(d,o.colors),look=lookupFactory(pal);
  for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){const i=(yy*W+xx)*4;if(d[i+3]<o.alphaCut){d[i+3]=0;continue;}const t=(BAYER[((yy%4)<<2)|(xx%4)]-7.5)*o.dither*(o.block>1?0:1);const p=pal[look(clamp(d[i]+t),clamp(d[i+1]+t),clamp(d[i+2]+t))];d[i]=p[0];d[i+1]=p[1];d[i+2]=p[2];d[i+3]=255;}
  // 3. optional 1px ink outline on the silhouette, inside the frame cell
  if(o.outline){const cw=o.cell?o.cell[0]:W,ch=o.cell?o.cell[1]:H,src=new Uint8ClampedArray(d);const opaque=(px,py)=>{if(px<0||py<0||px>=W||py>=H)return false;return src[(py*W+px)*4+3]===255;};
   for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){const i=(yy*W+xx)*4;if(src[i+3]!==0)continue;const cx=Math.floor(xx/cw)*cw,cy=Math.floor(yy/ch)*ch;
    const n=(dx,dy)=>{const px=xx+dx,py=yy+dy;return px>=cx&&px<cx+cw&&py>=cy&&py<cy+ch&&opaque(px,py);};if(n(1,0)||n(-1,0)||n(0,1)||n(0,-1)){d[i]=o.ink[0];d[i+1]=o.ink[1];d[i+2]=o.ink[2];d[i+3]=255;}}}
  x.putImageData(id,0,0);if(img.src)cache.set(key,c);return c;
 }
 // Environments flagged for re-pixelation: soft/painterly pictures, detected by measured colour count (see
 // docs/rc2/UNFINISHED_AUDIT.md). Hand-pixeled masters (<= ~40 colours) are never touched.
 const SOFT_ENV=new Set(['gbenga_rentals','gbenga_house_dining','gbenga_house_patio','carson_owambe','catacomb_dead','halloween','ocean_night_flight','f07_warehouse_exterior','f07_warehouse_party','f15_the_bing','f15_gym','f15_plenitude','f15_convention','f15_roxy_apartment','f15_rosalyn_apartment','f15_rosalyn_apartment_dark','f15_shrine','f15_library','f15_exam_hall','property_exterior']);
 const SOFT_PATH=/(assets\/build4\/p_d\/|assets\/f07\/backgrounds\/|assets\/f15\/environments\/)/;
 function forEnv(img,env){if(!env?.image||!img?.src||!img.complete||!img.naturalWidth)return null;if(!(SOFT_ENV.has(env.id)||SOFT_PATH.test(env.image)))return null;if(!img.src.endsWith(env.image.replace(/^\.?\//,'')))return null;
  if(window.RA_NO_HARD_PIXEL)return null;return process(img,{colors:64,dither:3});}
 // ---- auto detection: boards (270x480 minigame backdrops) and runtime sprites ----
 const softMemo=new Map(),urlMemo=new Map();
 function measure(img){const c=toCanvas(img),d=c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,c.width,c.height).data,set=new Set();let semi=0,opaque=0;for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;opaque++;if(d[i+3]<250)semi++;set.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);if(set.size>4000)break;}return {colors:set.size,semi:opaque?semi/opaque*100:0};}
 function isSoft(img,{colors=1200,semi=100}={}){if(!img?.complete||!img.naturalWidth)return false;const k=`${img.src}|${colors}`;if(softMemo.has(k))return softMemo.get(k);const m=measure(img),r=m.colors>colors||m.semi>semi;softMemo.set(k,r);return r;}
 // boards: soft 270x480 backdrops used by minigames are returned re-pixelated; hand-pixeled boards come back unchanged
 function board(img){if(window.RA_NO_HARD_PIXEL||!isSoft(img,{colors:1200}))return img;return process(img,{colors:64,dither:3});}
 // sprites: runtime 80x96-class characters that are soft (hundreds of colours / anti-aliased edges) get hard alpha, a 24-colour
 // palette and a 1px ink outline. Hand-pixeled sprites (<~400 colours, no semi-alpha) are never touched.
 function hardenImg(el){
  if(!el||el.tagName!=='IMG'||window.RA_NO_HARD_PIXEL||el.dataset.rc2Hp)return;
  const run=()=>{if(el.dataset.rc2Hp||!el.naturalWidth||el.naturalWidth>260||/^data:/.test(el.src))return;
   // Approved masters render their exact pixels. Re-pixelation must not recolor a frozen identity or
   // replace its path with an unregistered data URL (which also loses the Director's crop/contact metadata).
   const path=el.getAttribute('src')?.match(/assets\/[^?]+/)?.[0];
   if(window.RAArtRegistry?.assets?.[path]?.status==='FROZEN')return;
   const key=el.src;let url=urlMemo.get(key);
   if(url===undefined){url=isSoft(el,{colors:400,semi:3})?process(el,{colors:24,dither:0,outline:true}).toDataURL():false;urlMemo.set(key,url);}
   if(url){el.dataset.rc2Hp='1';el.dataset.rc2Src=key;el.src=url;}};
  if(el.complete)run();else el.addEventListener('load',run,{once:true});
 }
 const SPRITE_SEL='img.adv-actor,img.c2-actor,img.property-actor,img.rave-actor,img[data-actor]';
 function scan(n){if(n.nodeType!==1)return;if(n.matches?.(SPRITE_SEL))hardenImg(n);n.querySelectorAll?.(SPRITE_SEL).forEach(hardenImg);}
 if(typeof MutationObserver!=='undefined')new MutationObserver(ms=>{for(const m of ms)m.addedNodes.forEach(scan);}).observe(document.documentElement,{childList:true,subtree:true});
 window.RAHardPixel={process,forEnv,board,hardenImg,isSoft,palette,SOFT_ENV,cache};
})();
