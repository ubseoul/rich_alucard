// RC2: builds the data behind docs/rc2/UNFINISHED_AUDIT.md (placeholder backgrounds, placeholder/non-pixel characters, dancer pixel read).
import {open} from './harness.mjs';import fs from 'node:fs';
const out=process.argv[2]||'C:/ra/shots/audit.json';
const h=await open({width:390});const {page}=h;await page.waitForTimeout(1500);
const data=await page.evaluate(async()=>{
 const envs=RAEnvironments.all?RAEnvironments.all():[];const envList=(Array.isArray(envs)?envs:Object.values(envs)).map(e=>({id:e.id,name:e.name,approved:!!e.approved,placeholder:!!e.placeholder,image:e.image||null,layers:(e.layers||[]).length}));
 const people=(Array.isArray(RABtfPeople.list)?RABtfPeople.list:[...RABtfPeople.list()]).map(p=>({id:p.id,name:p.name,sprite:p.sprite||null,states:Object.keys(p.states||{}),hasLook:!!p.look,species:p.species||null}));
 // usage: scan adventure nodes
 const envUse={},peopleUse={};const allA=RAAdventures.all();const defs=Array.isArray(allA)?allA:Object.values(allA);
 const ids=defs.map(d=>d.id||d);
 for(const id of ids){const d=RAAdventures.get(id);if(!d)continue;for(const [nid,n] of Object.entries(d.nodes||{})){let e=n.env;if(typeof e==='string'){(envUse[e]||(envUse[e]=new Set())).add(id);}
   const acts=n.actors;if(acts&&typeof acts==='object')for(const a of Object.values(acts)){const pid=typeof a==='string'?a:a?.id;if(pid)(peopleUse[pid]||(peopleUse[pid]=new Set())).add(id);}}}
 const ser=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,[...v]]));
 // pixel analysis in canvas
 async function analyze(src){return await new Promise(res=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height).data;const set=new Set();let semi=0,opaque=0;for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;opaque++;if(d[i+3]<250)semi++;set.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);}
   // detect upscaled smoothing: horizontal neighbor delta histogram - count of pixels whose neighbors differ by small non-zero amounts
   let soft=0,edges=0;for(let y=0;y<c.height;y++)for(let xx=1;xx<c.width;xx++){const i=(y*c.width+xx)*4,j=i-4;if(d[i+3]===0||d[j+3]===0)continue;const dd=Math.abs(d[i]-d[j])+Math.abs(d[i+1]-d[j+1])+Math.abs(d[i+2]-d[j+2]);if(dd>0){edges++;if(dd<40)soft++;}}
   res({w:c.width,h:c.height,colors:set.size,semiAlphaPct:opaque?+(semi/opaque*100).toFixed(2):0,softEdgePct:edges?+(soft/edges*100).toFixed(1):0});};img.onerror=()=>res({error:true});img.src=src;});}
 const results={envs:[],people:[]};
 for(const e of envList){if(e.image)e.px=await analyze(e.image);results.envs.push({...e,usedBy:ser(envUse)[e.id]||[]});}
 for(const p of people){if(p.sprite)p.px=await analyze(p.sprite);results.people.push({...p,usedBy:ser(peopleUse)[p.id]||[]});}
 return results;});
fs.writeFileSync(out,JSON.stringify(data,null,1));
console.log('envs',data.envs.length,'placeholder',data.envs.filter(e=>e.placeholder).length,'| people',data.people.length,'no sprite',data.people.filter(p=>!p.sprite).length);
console.log(h.errors.join('\n')||'no errors');await h.close();
