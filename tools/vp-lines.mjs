#!/usr/bin/env node
// Extracts every Rich [VP] line (voice pass required) into docs/btf/VP_LINES.md for Ube's Voice Harvest.
import {readFile,writeFile,readdir} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dirs=['js/data/btf/adventures','js/data/btf'];const rows=[];
for(const d of dirs)for(const f of (await readdir(path.join(root,d))).filter(f=>f.endsWith('.js'))){const src=await readFile(path.join(root,d,f),'utf8');
 for(const m of src.matchAll(/\bR\((['"`])((?:\\.|(?!\1).)*)\1/g))rows.push([`${d}/${f}`,m[2]]);
 for(const m of src.matchAll(/\['rich',(['"`])((?:\\.|(?!\1).)*)\1,\{vp:true\}\]/g))rows.push([`${d}/${f}`,m[2]]);
 for(const key of ['richLine','homeLine'])for(const m of src.matchAll(new RegExp(`${key}:\\[([^\\]]*)\\]`,'g')))for(const q of m[1].matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g))rows.push([`${d}/${f} (${key})`,q[2]]);}
const body=['# RICH LINES — VOICE PASS REQUIRED','','Every line below is a drafted placeholder for Rich. Ube converts them to canon in a Voice Harvest. Engineering does not write final Rich dialogue.','',`Total: ${rows.length}`,'','| File | Draft line |','|---|---|',...rows.map(([f,l])=>`| ${f} | ${l.replace(/\|/g,'\\|')} |`)].join('\n');
await writeFile(path.join(root,'docs/btf/VP_LINES.md'),body+'\n');console.log(`VP lines: ${rows.length}`);
