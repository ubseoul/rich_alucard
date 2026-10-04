#!/usr/bin/env node
// RC2 B3 wide audit: every long string literal in player-facing JS (excludes sealed/art/audio/test data).
// usage: node tools/rc2/wide-audit.mjs [--max=3]
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export function sentences(t){
 const s=String(t).replace(/\\(['"`])/g,'$1').replace(/\b(mr|mrs|ms|dr|st|vs|no)\./gi,'$1').replace(/\.{2,}|…/g,'…').replace(/\be\.g\./gi,'eg');
 return s.split(/(?<=[.!?…])["')\]]*\s+(?=[^\s])/).filter(x=>/[A-Za-z0-9]/.test(x.trim())).length;
}
const skip=/ogun_rave_content|property_content|art_registry|presentation_assets|audio_manifest|data[\\/]art[\\/]|sealed|save_fixtures|art_integration|art_surfaces|presentation_locks/;
export function scan(max=3){
 const out=[];
 const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
  if(e.isDirectory())walk(p);
  else if(/\.(js|mjs)$/.test(e.name)&&!skip.test(p)){
   fs.readFileSync(p,'utf8').split('\n').forEach((ln,i)=>{
    const re=/(['"`])((?:\\.|(?!\1).){40,})\1/g;let m;
    while((m=re.exec(ln))){const n=sentences(m[2]);if(n>max&&/ /.test(m[2])&&!/[{}]|=>|function|\$\{|\\u/.test(m[2]))out.push({file:path.relative(root,p).replace(/\\/g,'/'),line:i+1,n,text:m[2]});}
   });}}};
 walk(path.join(root,'js'));return out;
}
if(process.argv[1]?.endsWith('wide-audit.mjs')){
 const max=Number((process.argv.find(a=>a.startsWith('--max='))||'--max=3').slice(6));
 const o=scan(max);console.log(`literals over ${max} sentences: ${o.length}`);for(const r of o)console.log(`${r.file}:${r.line} [${r.n}] ${r.text.slice(0,150)}`);
}
