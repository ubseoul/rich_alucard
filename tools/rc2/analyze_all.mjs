// RC2: measures every PNG under assets/ (colour count, soft-edge %, semi-alpha %) to find non-hard-pixel art.
import {open} from './harness.mjs';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
function walk(d,o=[]){for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory())walk(p,o);else if(/\.png$/i.test(f.name))o.push(p);}return o;}
const files=walk(path.join(root,'assets')).map(p=>path.relative(root,p).split(path.sep).join('/'));
const h=await open({width:390});const {page}=h;await page.waitForTimeout(800);
const res=await page.evaluate(async files=>{const out=[];for(const f of files){const r=await new Promise(res=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height).data;const set=new Set();let semi=0,opaque=0;for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;opaque++;if(d[i+3]<250)semi++;set.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);if(set.size>60000)break;}res({w:c.width,h:c.height,colors:set.size,semi:opaque?+(semi/opaque*100).toFixed(1):0});};img.onerror=()=>res({error:1});img.src=f;});out.push({f,...r});}return out;},files);
fs.writeFileSync('C:/ra/shots/all_png.json',JSON.stringify(res));console.log(res.length,'analyzed');await h.close();
