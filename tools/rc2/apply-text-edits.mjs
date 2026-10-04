#!/usr/bin/env node
// Applies tools/rc2/text-edits.mjs + text-edits-plain.mjs to the source tree. Idempotent. usage: node tools/rc2/apply-text-edits.mjs
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {EDITS} from './text-edits.mjs';
import {EDITS_PLAIN} from './text-edits-plain.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const counts={split:0,shorten:0,simplify:0,already:0};let bad=0;
const esc=s=>s.replace(/'/g,"\\'");
for(const [file,oldS,newS,kind] of [...EDITS,...EDITS_PLAIN]){
 const p=path.join(root,file);let src=fs.readFileSync(p,'utf8');
 // plain edits: the source literal is either single-quoted (apostrophes escaped) or double-quoted (plain)
 const tries=[[oldS,newS],[esc(oldS),esc(newS)]];
 let done=false,hits=0;
 for(const [o,n] of tries){const c=src.split(o).length-1;hits=Math.max(hits,c);if(c===1){let nn=n;if(o===oldS){const at=src.indexOf(o);const q=src[at-1];if(!/["`]/.test(q)&&!oldS.includes("'"))nn=n.replace(/(?<!\\)'/g,"\\'");}src=src.replace(o,()=>nn);fs.writeFileSync(p,src);counts[kind]++;done=true;break;}}
 if(done)continue;
 if(tries.some(([,n])=>src.includes(n)))counts.already++;
 else{bad++;console.error(`EDIT PROBLEM (${hits} matches): ${file}: ${oldS.slice(0,80)}`);}
}
console.log(JSON.stringify(counts),bad?`${bad} problems`:'ok');
process.exit(bad?1:0);
