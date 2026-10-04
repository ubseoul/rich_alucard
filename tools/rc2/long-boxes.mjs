#!/usr/bin/env node
// lists non-protected, non-Rich boxes of >= N words: candidates for plainer wording.  usage: node tools/rc2/long-boxes.mjs [N=13]
import {collect} from './text-audit.mjs';import {protectedRows} from './protected-lines.mjs';
const N=Number(process.argv[2]||13);
const norm=s=>String(s).replace(/\\(['"`])/g,'$1').replace(/\s+/g,' ').trim();
const prot=protectedRows();
const protText=prot.map(r=>[r.file,norm(r.text)]);
const isProt=r=>protText.some(([f,t])=>f===r.file&&t.includes(norm(r.text))&&norm(r.text).length>8);
for(const r of await collect()){if(r.fn==='R'||r.fn==='RC'||r.file.includes('rc2_story'))continue;const w=norm(r.text).split(' ').length;if(w>=N&&!isProt(r))console.log(`${r.file.split('/').pop()}:${r.line}|${r.fn}|${w}|${norm(r.text)}`);}
