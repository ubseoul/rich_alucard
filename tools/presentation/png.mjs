// Minimal dependency-free PNG decoder/encoder for presentation tooling (8-bit gray, RGB, RGBA; non-interlaced).
import zlib from 'node:zlib';

const SIGNATURE=Buffer.from([137,80,78,71,13,10,26,10]);

export function decodePng(buffer){
 if(!buffer.subarray(0,8).equals(SIGNATURE))throw new Error('not a PNG');
 let offset=8,width=0,height=0,depth=0,type=0,interlace=0;const idat=[];
 while(offset<buffer.length){
  const length=buffer.readUInt32BE(offset),kind=buffer.toString('ascii',offset+4,offset+8),data=buffer.subarray(offset+8,offset+8+length);
  if(kind==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);depth=data[8];type=data[9];interlace=data[12];}
  else if(kind==='IDAT')idat.push(data);
  else if(kind==='IEND')break;
  offset+=12+length;
 }
 const channels={0:1,2:3,4:2,6:4}[type];
 if(depth!==8||!channels||interlace)throw new Error(`unsupported PNG (depth ${depth}, type ${type}, interlace ${interlace})`);
 const raw=zlib.inflateSync(Buffer.concat(idat)),stride=width*channels,out=Buffer.alloc(width*height*4),prev=Buffer.alloc(stride),line=Buffer.alloc(stride);
 for(let y=0;y<height;y++){
  const filter=raw[y*(stride+1)],src=raw.subarray(y*(stride+1)+1,(y+1)*(stride+1));
  for(let i=0;i<stride;i++){
   const a=i>=channels?line[i-channels]:0,b=prev[i],c=i>=channels?prev[i-channels]:0;let v=src[i];
   if(filter===1)v+=a;else if(filter===2)v+=b;else if(filter===3)v+=(a+b)>>1;
   else if(filter===4){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);v+=pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
   line[i]=v&255;
  }
  for(let x=0;x<width;x++){
   const o=(y*width+x)*4,s=x*channels;
   if(channels===1){out[o]=out[o+1]=out[o+2]=line[s];out[o+3]=255}
   else if(channels===2){out[o]=out[o+1]=out[o+2]=line[s];out[o+3]=line[s+1]}
   else{out[o]=line[s];out[o+1]=line[s+1];out[o+2]=line[s+2];out[o+3]=channels===4?line[s+3]:255}
  }
  line.copy(prev);
 }
 return {width,height,data:out};
}

function crc32(buf){let c,crc=0xffffffff;for(let n=0;n<buf.length;n++){c=(crc^buf[n])&255;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;crc=(crc>>>8)^c}return (crc^0xffffffff)>>>0}
function chunk(kind,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const body=Buffer.concat([Buffer.from(kind,'ascii'),data]);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(body));return Buffer.concat([len,body,crc])}
export function encodePng({width,height,data}){
 const header=Buffer.alloc(13);header.writeUInt32BE(width,0);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
 const raw=Buffer.alloc((width*4+1)*height);for(let y=0;y<height;y++){raw[y*(width*4+1)]=0;data.copy(raw,y*(width*4+1)+1,y*width*4,(y+1)*width*4)}
 return Buffer.concat([SIGNATURE,chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}

export function alphaBox({width,height,data},threshold=1){
 let x0=width,y0=height,x1=-1,y1=-1;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>=threshold){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 return x1<0?null:[x0,y0,x1-x0+1,y1-y0+1];
}
