// Read the contact-bearing alpha, never the transparent canvas padding. A source-pixel bottom edge is
// the baseline. 16/255 keeps accepted partial-alpha art while excluding almost invisible resampling noise.
export function alphaSupport({width,height,data},{box=[0,0,width,height],threshold=16}={}){
 const [bx,by,bw,bh]=box,x0=Math.max(0,bx),x1=Math.min(width,bx+bw),y0=Math.max(0,by),y1=Math.min(height,by+bh);
 let bottom=-1;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*width+x)*4+3]>=threshold)bottom=y;
 if(bottom<0)return null;
 let left=width,right=-1;
 for(let y=Math.max(y0,bottom-2);y<=bottom;y++)for(let x=x0;x<x1;x++)if(data[(y*width+x)*4+3]>=threshold){left=Math.min(left,x);right=Math.max(right,x)}
 return {y:bottom+1,x1:left,x2:right+1,threshold,...(bx||by||bw!==width||bh!==height?{box}: {})};
}
