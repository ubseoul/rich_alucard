#!/usr/bin/env node
// OPEN-BUILD SEALED-LEAK CHECK (F00). The public repository and every OPEN artifact must operate correctly with the sealed
// pack EMPTY and must never carry sealed implementation content. This check fails an OPEN tree/artifact when:
//   1. a forbidden path exists (private overlay folders, assets/sealed, js/sealed/* other than the empty slot, …)
//   2. js/sealed/pack.js is anything but the committed EMPTY slot (byte-identical after LF normalization)
//   3. the sealed pack install entry point is invoked anywhere except the sealed API itself
//   4. the overlay slot in index.html is non-empty
//   5. (optional) a private denylist matches — supplied with --denylist <file> from the PRIVATE repository.
// Reports NEVER echo matched text: a denylist hit prints only the rule kind/index and file:line, so a leak in a log can't
// itself expose the sealed string.
//
//   node tools/leak-check.mjs                          check the source tree (default)
//   node tools/leak-check.mjs --dist dist              check a built OPEN artifact
//   node tools/leak-check.mjs --denylist path.json     add the private denylist ({literals,regex,sha256Tokens})
//   node tools/leak-check.mjs --range base..head       also scan a commit range (added paths + added lines) — for PR gates
//   node tools/leak-check.mjs --print-empty-slot-hash  print the expected empty-slot digest
import {readFile,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {globToRegExp} from './check-owner-surfaces.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
export const defaultRoot=path.resolve(here,'..');
const lf=text=>text.replace(/\r\n/g,'\n');
export const sha256=text=>createHash('sha256').update(text).digest('hex');
export async function loadRules(root=defaultRoot){return JSON.parse(await readFile(path.join(root,'tools','if1','leak-rules.json'),'utf8'));}
const posix=p=>p.split(path.sep).join('/');
async function walk(dir,base,skip,out=[]){
  for(const e of await readdir(dir,{withFileTypes:true})){
    const rel=posix(path.relative(base,path.join(dir,e.name)));
    if(e.isDirectory()){if(!skip.has(e.name))await walk(path.join(dir,e.name),base,skip,out);}
    else out.push(rel);
  }
  return out;
}
export async function listFiles(root,{rules,dist=false}){
  const skip=new Set(dist?[]:rules.skipDirs);
  try{if(!dist){const out=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8',maxBuffer:1<<28,stdio:['ignore','pipe','ignore']});const tracked=out.split('\0').filter(Boolean);if(tracked.length)return tracked;}}catch(e){}
  return walk(root,root,skip);
}
function compileDenylist(list){
  if(!list)return null;
  return {literals:(list.literals||[]).map(s=>String(s).toLowerCase()),regex:(list.regex||[]).map(r=>new RegExp(r,'i')),tokens:new Set((list.sha256Tokens||[]).map(s=>String(s).toLowerCase()))};
}
function scanText(text,deny,report){
  const lines=lf(text).split('\n');
  for(let n=0;n<lines.length;n++){
    const line=lines[n],lower=line.toLowerCase();
    for(const [i,lit] of deny.literals.entries())if(lit&&lower.includes(lit))report(n+1,`literal#${i}`);
    for(const [i,re] of deny.regex.entries())if(re.test(line))report(n+1,`regex#${i}`);
    if(deny.tokens.size)for(const tok of lower.match(/[a-z0-9_.'-]{3,}/g)||[])if(deny.tokens.has(sha256(tok)))report(n+1,'token');
  }
}
// hqPrivate (env RA_HQ_PRIVATE=1 / --hq-private): ONLY for the private HQ repository's own tests — permits the private_overlay/ directory
// on hq/integration and nothing else (sealed slot, assets/sealed, install calls and artifacts are still enforced). Never set in the public repo.
export async function checkTree({root=defaultRoot,dist=null,denylist=null,rules=null,hqPrivate=process.env.RA_HQ_PRIVATE==='1'}={}){
  rules=rules||await loadRules(root);const violations=[];const bad=(rule,file,extra)=>violations.push({rule,file,...(extra?{detail:extra}:{})});
  const target=dist?path.resolve(root,dist):root;
  const files=await listFiles(target,{rules,dist:!!dist});
  const forbidden=rules.forbiddenPaths.filter(p=>!(hqPrivate&&!dist&&p==='private_overlay/**')).map(globToRegExp),allowed=rules.allowedPaths.map(globToRegExp);
  for(const f of files)if(forbidden.some(re=>re.test(f))&&!allowed.some(re=>re.test(f)))bad('forbidden-path',f);
  // empty slot must be pristine
  const slot=path.join(target,rules.emptySlot.path);
  if(existsSync(slot)){const digest=sha256(lf(await readFile(slot,'utf8')));if(digest!==rules.emptySlot.sha256)bad('sealed-slot-not-empty',rules.emptySlot.path);}
  else if(!dist)bad('sealed-slot-missing',rules.emptySlot.path);
  // install calls + denylist + overlay slot
  const deny=compileDenylist(denylist);const ext=new Set(rules.scanExtensions);
  for(const f of files){
    if(f===rules.emptySlot.path||f.startsWith('tools/if1/leak-rules'))continue;
    if(!ext.has(path.extname(f)))continue;
    let text;try{text=await readFile(path.join(target,f),'utf8');}catch(e){continue;}
    if(/RASealed\s*\.\s*install\s*\(/.test(text)&&!rules.installCallAllowedIn.includes(f)&&!f.startsWith('tools/tests/')&&!f.startsWith('docs/'))bad('sealed-install-call',f);
    if(f==='index.html'||f.endsWith('/index.html')){const m=/<!-- SEALED:OVERLAY:BEGIN -->([\s\S]*?)<!-- SEALED:OVERLAY:END -->/.exec(text);if(m&&m[1].trim())bad('overlay-slot-not-empty',f);}
    if(deny)scanText(text,deny,(line,kind)=>bad('denylist',`${f}:${line}`,kind));
  }
  return {ok:violations.length===0,violations,filesScanned:files.length,denylist:!!deny};
}
// Commit-range gate: forbidden paths added, and denylist matches on ADDED lines (never printing the text).
export async function checkRange({root=defaultRoot,range,denylist=null,rules=null}){
  rules=rules||await loadRules(root);const violations=[];
  const forbidden=rules.forbiddenPaths.map(globToRegExp),allowed=rules.allowedPaths.map(globToRegExp);
  const names=execFileSync('git',['log','--name-only','--format=',range],{cwd:root,encoding:'utf8',maxBuffer:1<<28}).split('\n').filter(Boolean);
  for(const f of new Set(names))if(forbidden.some(re=>re.test(f))&&!allowed.some(re=>re.test(f)))violations.push({rule:'forbidden-path-in-history',file:f});
  const deny=compileDenylist(denylist);
  if(deny){const diff=execFileSync('git',['log','-p','--format=commit %h','-U0',range],{cwd:root,encoding:'utf8',maxBuffer:1<<29});let commit='?';
    for(const line of diff.split('\n')){if(line.startsWith('commit '))commit=line.slice(7);else if(line.startsWith('+')&&!line.startsWith('+++'))scanText(line.slice(1),deny,(_,kind)=>violations.push({rule:'denylist-in-history',file:`commit ${commit}`,detail:kind}));}}
  return {ok:violations.length===0,violations};
}
function report(result,label){
  if(result.ok){console.log(`PASS leak check ${label} (${result.filesScanned??'range'} ${result.filesScanned!==undefined?'files, ':''}no sealed implementation content${result.denylist?', private denylist clean':''})`);return;}
  for(const v of result.violations)console.error(`LEAK ${v.rule}: ${v.file}${v.detail?` [${v.detail}]`:''}`);
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const arg=n=>{const i=process.argv.indexOf(n);return i===-1?null:process.argv[i+1];};
  try{
    if(process.argv.includes('--print-empty-slot-hash')){console.log(sha256(lf(await readFile(path.join(defaultRoot,'js/sealed/pack.js'),'utf8'))));process.exit(0);}
    const denyFile=arg('--denylist'),denylist=denyFile?JSON.parse(await readFile(denyFile,'utf8')):null;
    const dist=arg('--dist'),range=arg('--range');let ok=true;
    const tree=await checkTree({dist,denylist,hqPrivate:process.argv.includes('--hq-private')||process.env.RA_HQ_PRIVATE==='1'});report(tree,dist?`artifact ${dist}`:'source tree');ok=ok&&tree.ok;
    if(range){const r=await checkRange({range,denylist});report(r,`range ${range}`);ok=ok&&r.ok;}
    process.exitCode=ok?0:1;
  }catch(error){console.error(`FAIL ${error.message}`);process.exitCode=1;}
}
