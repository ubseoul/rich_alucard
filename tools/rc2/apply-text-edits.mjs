#!/usr/bin/env node
// Applies tools/rc2/text-edits.mjs to the source tree. Idempotent. usage: node tools/rc2/apply-text-edits.mjs
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {EDITS} from './text-edits.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const counts={split:0,shorten:0,simplify:0,already:0};let bad=0;
for(const [file,oldS,newS,kind] of EDITS){
 const p=path.join(root,file);let src=fs.readFileSync(p,'utf8');
 const n=src.split(oldS).length-1;
 if(n===1){src=src.replace(oldS,()=>newS);fs.writeFileSync(p,src);counts[kind]++;}
 else if(n===0&&src.includes(newS)){counts.already++;}
 else{bad++;console.error(`EDIT PROBLEM (${n} matches): ${file}: ${oldS.slice(0,80)}`);}
}
console.log(JSON.stringify(counts),bad?`${bad} problems`:'ok');
process.exit(bad?1:0);
