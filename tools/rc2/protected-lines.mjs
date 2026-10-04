#!/usr/bin/env node
// RC2 B3 — NIGERIAN COMEDY LINES ARE UNTOUCHED.
//   node tools/rc2/protected-lines.mjs gen     -> writes docs/rc2/PROTECTED_LINES.md from the BASE tag (final-a-accepted)
//   node tools/rc2/protected-lines.mjs check   -> verifies every protected line still reads word for word in the tree
//                                                 (a box may only have been CUT into consecutive boxes; no word changed)
import {execFileSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const BASE='final-a-accepted';
const A='js/data/btf/adventures/';
// Nigerian-centred adventures / scenes: every box in these base line ranges is protected.
export const RANGES=[
 [A+'w1_life.js',29,38,'PEKING NAIJA'],[A+'w1_life.js',45,60,'NAIJA MART & THE MALT'],
 [A+'w2.js',87,134,'UNCLE SUNDAY & THE AGEGE BREAD / HATCH NIGHT / FIRST CAST'],[A+'w2.js',232,248,"NNEKA'S BLOOD BANK (ADEOLUWA)"],
 [A+'w3.js',411,421,'THE CASTLE KITCHEN (maggi / jollof)'],
 [A+'w4.js',188,216,'ATL HOMECOMING (suya, Bunmi, the old neighborhood)'],[A+'w4.js',606,675,'BLUEBERRY MAZDA DATES (jollof, church potluck, Adeoluwa)'],
 [A+'w5.js',44,55,'GOD ON THE CURB'],[A+'w5.js',63,100,'JOLLOF WARS / THE FINAL / LIL SMACK #5 / THE FAMILY HOLIDAY'],
 [A+'new_oga_m1_m3.js',1,999,'GBENGA CREW (M1–M3)'],[A+'new_oga_m4.js',1,999,'GBENGA CREW (M4)'],[A+'new_oga_m5_m6.js',1,999,'GBENGA CREW (M5–M6, owambe)'],[A+'new_oga_m7.js',1,999,'GBENGA CREW (M7, Mama Gbenga)']
];
// Anywhere else: any line carrying a Nigerian-culture cue.
export const CUE=/\b(oga|agege|garri|plantain|stockfish|malt|maggi|seasoning cubes?|aunties?|buba|jollof|owambe|egusi|fufu|yam|suya|naija|nollywood|yoruba|igbo|pidgin|independence day|have you eaten|adeoluwa|gbenga|bamidele|church potluck|diaspora|uncle sunday|mister december|WHO IS YOUR FATHER)\b/i;
const CALL=/\b(N|S|R|RC|E)\(\s*(?:(?:'[^']*'|"[^"]*"|[A-Za-z_.]+)\s*,\s*)?(['"`])((?:\\.|(?!\2).)*)\2/g;
const norm=s=>String(s).replace(/\\(['"`])/g,'$1').replace(/\s+/g,' ').trim();
const baseSrc=f=>execFileSync('git',['show',`${BASE}:${f}`],{cwd:root,encoding:'utf8',maxBuffer:1<<28});
const nowSrc=f=>fs.readFileSync(path.join(root,f),'utf8');
function boxes(src,file){
 const out=[];src.split('\n').forEach((ln,i)=>{CALL.lastIndex=0;let m;while((m=CALL.exec(ln))){
  if((m[1]==='S'||m[1]==='E')&&!/^\s*(?:'[^']*'|"[^"]*"|[A-Za-z_.]+)\s*,/.test(ln.slice(m.index+m[1].length+1)))continue;
  if(/^\$\{|^[a-z_]+$/.test(m[3]))continue;out.push({file,line:i+1,fn:m[1],text:m[3]});}});return out;}
function familyThread(src,file){
 const out=[];src.split('\n').forEach((ln,i)=>{if(!/\{from:'(MOM|DAD|SISTER|BIG BRO|LIL BRO)'/.test(ln))return;
  for(const m of ln.matchAll(/(text|say):'((?:\\.|[^'])*)'/g))out.push({file,line:i+1,fn:'FAMILY',text:m[2]});});return out;}
export function protectedRows(){
 const files=[...new Set(RANGES.map(r=>r[0]))];
 const dirFiles=fs.readdirSync(path.join(root,A)).filter(f=>f.endsWith('.js')).map(f=>A+f);
 const rows=[];const seen=new Set();
 const add=(r,why)=>{const k=r.file+'|'+norm(r.text);if(seen.has(k))return;seen.add(k);rows.push({...r,why});};
 for(const f of new Set([...files,...dirFiles])){
  let src;try{src=baseSrc(f)}catch(e){continue}
  for(const r of boxes(src,f)){
   const rg=RANGES.find(x=>x[0]===f&&r.line>=x[1]&&r.line<=x[2]);
   if(rg)add(r,rg[3]);else if(r.fn!=='R'&&r.fn!=='RC'&&CUE.test(r.text))add(r,'cue');else if(CUE.test(r.text))add(r,'cue (Rich)');
  }
 }
 for(const r of familyThread(baseSrc(A+'w1_opening.js'),A+'w1_opening.js'))add(r,'FAMILY THREAD (mom/dad/siblings)');
 return rows;
}
export function check(rows=protectedRows()){
 const cache=new Map();const bad=[];
 const joined=f=>{if(!cache.has(f)){const s=nowSrc(f);const parts=boxes(s,f).map(r=>norm(r.text));
   for(const m of s.matchAll(/(text|say):'((?:\\.|[^'])*)'/g))parts.push(norm(m[2]));cache.set(f,' '+parts.join(' ')+' ');}return cache.get(f);};
 for(const r of rows){const t=norm(r.text);if(!joined(r.file).includes(t)){
  // allow a cut box: every sentence-ish chunk must still appear in order
  bad.push(r);}}
 return bad;
}
if(process.argv[1]?.endsWith('protected-lines.mjs')){
 const mode=process.argv[2];const rows=protectedRows();
 if(mode==='gen'){
  const by={};for(const r of rows)(by[r.file]??=[]).push(r);
  let md=`# PROTECTED LINES — NIGERIAN COMEDY (RC2 · BUILD 3 · OL-063)\n\nThese lines are UNTOUCHED, word for word. Source of truth: base tag \`${BASE}\` (181d3f5). Build 3 rules applied to them:\n- No word, spelling, punctuation or order was changed.\n- Where a protected box was longer than 3 sentences it was only CUT into consecutive boxes (same words, same order). Cut points are listed in \`tools/rc2/text-edits.mjs\` (kind \`split\`).\n- Rich's own voiced lines are never rewritten by Build 3 at all (voice-pass authority).\n- Verified by \`node tools/rc2/protected-lines.mjs check\` (runs in \`npm test\`).\n\nTotal protected lines: **${rows.length}**\n\n`;
  for(const [f,list] of Object.entries(by)){md+=`## ${f} (${list.length})\n\n| base line | scope | text |\n|---|---|---|\n`;for(const r of list)md+=`| ${r.line} | ${r.why} | ${norm(r.text).replace(/\|/g,'\\|')} |\n`;md+='\n';}
  fs.mkdirSync(path.join(root,'docs/rc2'),{recursive:true});fs.writeFileSync(path.join(root,'docs/rc2/PROTECTED_LINES.md'),md);console.log(`wrote docs/rc2/PROTECTED_LINES.md — ${rows.length} protected lines`);
 }else{const bad=check(rows);if(bad.length){console.error(`PROTECTED LINES CHANGED: ${bad.length}`);for(const r of bad.slice(0,20))console.error(`  ${r.file}:${r.line} ${norm(r.text).slice(0,100)}`);process.exit(1);}console.log(`PASS protected lines (${rows.length} Nigerian-comedy lines intact word for word)`);}
}
