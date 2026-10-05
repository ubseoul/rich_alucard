import {open} from './harness.mjs';import fs from 'node:fs';
const out='C:/ra/shots/hp';fs.mkdirSync(out,{recursive:true});
const h=await open({width:390});const {page}=h;await page.waitForTimeout(1000);
const files=['assets/build4/p_d/p_d_gbenga_house_dining.png','assets/f07/backgrounds/warehouse_owambe_party_270x480.png','assets/f15/environments/boxing_gym_270x480.png','assets/f15/environments/shrine_auditorium_270x480.png'];
for(const f of files){const url=await page.evaluate(async f=>{const img=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=f;});const c=RAHardPixel.process(img,{colors:40,dither:7});const t=document.createElement('canvas');t.width=270;t.height=480;t.getContext('2d').drawImage(c,0,0,270,480);return t.toDataURL();},f);
 fs.writeFileSync(`${out}/${f.split('/').pop()}`,Buffer.from(url.split(',')[1],'base64'));}
// dancer: frame 0 of wolf, before/after
const d=await page.evaluate(async()=>{const m=await (await fetch('assets/f15/dancers/manifest.json')).json();const k=Object.keys(m.dancers)[0];const e=m.dancers[k];const img=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='assets/f15/dancers/'+e.file;});
 const p=RAHardPixel.process(img,{cell:e.cell,block:2,colors:28,outline:true});const W=e.cell[0],H=e.cell[1];const t=document.createElement('canvas');t.width=W*4;t.height=H*2;const x=t.getContext('2d');x.fillStyle='#3a2a50';x.fillRect(0,0,t.width,t.height);x.imageSmoothingEnabled=false;
 for(let i=0;i<2;i++){const fr=i*20;const sx=(fr%e.cols)*W,sy=Math.floor(fr/e.cols)*H;x.drawImage(img,sx,sy,W,H,i*2*W,0,W,H);x.drawImage(p,sx,sy,W,H,(i*2+1)*W,0,W,H);x.drawImage(img,sx,sy,W,H,i*2*W,H,W,H);x.drawImage(p,sx,sy,W,H,(i*2+1)*W,H,W,H)}
 return t.toDataURL();});
fs.writeFileSync(`${out}/dancer.png`,Buffer.from(d.split(',')[1],'base64'));
console.log(h.errors.join('\n')||'ok');await h.close();
