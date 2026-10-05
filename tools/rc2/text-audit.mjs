#!/usr/bin/env node
// RC2 B3 text audit: finds dialogue/narration boxes (N/S/R/RC/E calls) and counts sentences.
// usage: node tools/rc2/text-audit.mjs [--json] [--max=3]
import {readFile,readdir} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const DIRS=['js/data/btf/adventures','js/data/btf'];
export function sentences(t){
 const s=String(t).replace(/\\(['"`])/g,'$1').replace(/\b(mr|mrs|ms|dr|st|vs|no)\./gi,'$1').replace(/\.{2,}|…/g,'…').replace(/\be\.g\./gi,'eg');
 const parts=s.split(/(?<=[.!?…])["')\]]*\s+(?=[^\s])/).map(x=>x.trim()).filter(x=>/[A-Za-z0-9]/.test(x));
 return parts.length;
}
const CALL=/\b(N|S|R|RC|E)\(\s*(?:(?:'[^']*'|"[^"]*"|[A-Za-z_.]+)\s*,\s*)?(['"`])((?:\\.|(?!\2).)*)\2/g;
export async function collect(){
 const rows=[];
 for(const d of DIRS){
  for(const f of (await readdir(path.join(root,d))).filter(f=>f.endsWith('.js'))){
   const src=await readFile(path.join(root,d,f),'utf8');
   const lines=src.split('\n');
   lines.forEach((ln,i)=>{
    CALL.lastIndex=0;let m;
    while((m=CALL.exec(ln))){
     const fn=m[1];
     // R/RC/N take text as first arg; S/E take (who,text). Regex tolerates both; skip S/E first-arg-only false hits.
     if((fn==='S'||fn==='E')&&!/^\s*(?:'[^']*'|"[^"]*"|[A-Za-z_.]+)\s*,/.test(ln.slice(m.index+fn.length+1)))continue;
     rows.push({file:`${d}/${f}`,line:i+1,fn,text:m[3],n:sentences(m[3])});
    }
   });
  }
 }
 return rows;
}
if(process.argv[1]?.endsWith('text-audit.mjs')){
 const max=Number((process.argv.find(a=>a.startsWith('--max='))||'--max=3').slice(6));
 const rows=await collect();const over=rows.filter(r=>r.n>max);
 if(process.argv.includes('--json'))console.log(JSON.stringify({total:rows.length,over},null,1));
 else{console.log(`boxes ${rows.length}; over ${max} sentences: ${over.length}`);for(const r of over)console.log(`${r.file}:${r.line} [${r.fn} ${r.n}] ${r.text}`);}
}
