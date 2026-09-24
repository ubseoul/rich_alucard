(function(){
 // Canonical presentation metrics shared by the Director's live lint and the census tool (which injects this file
 // into legacy pages so before/after are measured with the same yardstick).
 //
 // DEAD SPACE: share of the visible world that shows low-detail environment and no focal body.
 // The environment is cut into square tiles of 8 units on a 270-wide grid (so a 765-wide composed room and a
 // 270×480 environment are measured at the same physical granularity). A tile is "dead" when fewer than 15% of
 // its source pixels differ from the tile's median luminance by more than 12 (0–255). Tiles are weighted by the
 // part of them that is visible (inside `clip`, outside `exclude` rects); tiles touching a focal body count as
 // content. Result: 0 (all detail) … 1 (all empty).
 const box=(x,y,w,h)=>({x,y,w,h}),area=b=>Math.max(0,b.w)*Math.max(0,b.h);
 function intersect(a,b){const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y);return box(x,y,Math.min(a.x+a.w,b.x+b.w)-x,Math.min(a.y+a.h,b.y+b.h)-y)}
 const DEAD={grid:270,tile:8,deviation:12,busy:.15};
 function deadSpace({pixels,envRect,clip,exclude=[],focal=[]}){
  const {width,height,data}=pixels,step=Math.max(1,Math.round(DEAD.tile*width/DEAD.grid)),kx=envRect.w/width,ky=envRect.h/height;
  let dead=0,total=0;
  for(let ty=0;ty<height;ty+=step)for(let tx=0;tx<width;tx+=step){
   const tile=box(envRect.x+tx*kx,envRect.y+ty*ky,step*kx,step*ky),a=area(tile);if(!a)continue;
   let w=area(intersect(tile,clip))/a;if(w<=0)continue;
   for(const r of exclude)w-=area(intersect(intersect(tile,clip),r))/a;if(w<=0)continue;
   total+=w;if(focal.some(b=>area(intersect(tile,b))>0))continue;
   const lum=[];for(let y=ty;y<Math.min(height,ty+step);y++)for(let x=tx;x<Math.min(width,tx+step);x++){const o=(y*width+x)*4;lum.push(.3*data[o]+.59*data[o+1]+.11*data[o+2])}
   const sorted=[...lum].sort((p,q)=>p-q),median=sorted[sorted.length>>1];
   if(lum.filter(v=>Math.abs(v-median)>DEAD.deviation).length/lum.length<DEAD.busy)dead+=w;
  }
  return total?Math.round(dead/total*1000)/1000:0;
 }
 window.RAPresentationMetrics={deadSpace,DEAD};
})();
