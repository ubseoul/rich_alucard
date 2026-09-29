#!/usr/bin/env node
// IF-1 SCRIPT LOADER (N). The single, integration-owned script-load order for index.html.
//
//   js/loader/manifest.json   ordered entries: "file" | {glob} | {btf} | {fragments:[ids]} | {overlay:true}
//   index.html                the <script> block between <!-- LOADER:BEGIN --> and <!-- LOADER:END --> is GENERATED
//
// Static deployment is unchanged: the browser still receives plain ordered <script> tags. Only the integration
// owner edits js/loader/manifest.json and runs `node tools/loader.mjs sync`. Fragments never edit index.html:
//   - fragment files are listed in js/frag/<ID>/manifest.json ({"files":[...]}) — expanded in the fragment's slot
//   - art parts    js/data/art/parts/*.js   — expanded (sorted) right after the art registry
//   - audio parts  js/data/audio/parts/*.js — expanded (sorted) right after the audio manifest
//   - sealed overlay slot (empty in OPEN builds) — filled only by tools/overlay.mjs into dist-private/
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const VERSION_SUFFIX='?v=__BUILD_ASSET_VERSION__';
const BEGIN='<!-- LOADER:BEGIN -->',END='<!-- LOADER:END -->';
export const OVERLAY_BEGIN='<!-- SEALED:OVERLAY:BEGIN -->',OVERLAY_END='<!-- SEALED:OVERLAY:END -->';
const lf=text=>text.replace(/\r\n/g,'\n');
const posix=p=>p.split(path.sep).join('/');

export async function readManifest(){return JSON.parse(await readFile(path.join(root,'js','loader','manifest.json'),'utf8'));}
export async function btfFiles(entryFile='js/btf_content.js'){const ctx={window:{}};vm.createContext(ctx);vm.runInContext(await readFile(path.join(root,entryFile),'utf8'),ctx);return [...ctx.window.RABtfContentFiles];}

async function globFiles(pattern){
  // 'dir/*.js' (files in one dir) or 'dir/*/name.js' (one file per immediate sub-directory); results are sorted.
  const parts=pattern.split('/'),file=parts.at(-1);
  if(parts.includes('*')&&parts.indexOf('*')<parts.length-1){
    const at=parts.indexOf('*'),base=parts.slice(0,at).join('/');const abs=path.join(root,base);if(!existsSync(abs))return [];
    const out=[];for(const e of (await readdir(abs,{withFileTypes:true})).filter(d=>d.isDirectory()).sort((a,b)=>a.name<b.name?-1:1)){const rel=[base,e.name,...parts.slice(at+1)].join('/');if(existsSync(path.join(root,rel)))out.push(rel);}
    return out;
  }
  const dir=path.posix.dirname(pattern),ext=file.replace('*','');
  const abs=path.join(root,dir);if(!existsSync(abs))return [];
  return (await readdir(abs)).filter(name=>name.endsWith(ext)).sort().map(name=>`${dir}/${name}`);
}
async function fragmentManifest(id){const file=path.join(root,'js','frag',id,'manifest.json');return existsSync(file)?JSON.parse(await readFile(file,'utf8')):{files:[],css:[]};}
export async function cssList(manifest=null){
  manifest=manifest||await readManifest();const out=[];
  for(const entry of manifest.entries)if(entry&&entry.fragments)for(const id of entry.fragments)for(const f of (await fragmentManifest(id)).css||[]){if(!f.startsWith(`js/frag/${id}/`)||f.includes('..'))throw new Error(`fragment ${id} may only list css under js/frag/${id}/ (got ${f})`);out.push(f);}
  return out;
}
async function fragmentFiles(id){
  const file=path.join(root,'js','frag',id,'manifest.json');if(!existsSync(file))return [];
  const {files=[]}=JSON.parse(await readFile(file,'utf8'));
  for(const f of files)if(!f.startsWith(`js/frag/${id}/`)||f.includes('..'))throw new Error(`fragment ${id} may only list files under js/frag/${id}/ (got ${f})`);
  return files;
}
const tag=src=>`<script src="${src}${VERSION_SUFFIX}"></script>`;

// Flat, ordered expansion: [{kind:'script',src,via}|{kind:'raw',text}]
export async function expand(manifest=null){
  manifest=manifest||await readManifest();const out=[];
  for(const entry of manifest.entries){
    if(typeof entry==='string')out.push({kind:'script',src:entry,via:'manifest'});
    else if(entry.glob)for(const f of await globFiles(entry.glob))out.push({kind:'script',src:f,via:`glob:${entry.glob}`});
    else if(entry.btf){out.push({kind:'raw',text:'<!-- BTF:CONTENT:BEGIN -->'});for(const f of await btfFiles(entry.btf))out.push({kind:'script',src:f,via:'btf'});out.push({kind:'raw',text:'<!-- BTF:CONTENT:END -->'});}
    else if(entry.fragments)for(const id of entry.fragments)for(const f of await fragmentFiles(id))out.push({kind:'script',src:f,via:`fragment:${id}`});
    else if(entry.overlay){out.push({kind:'raw',text:OVERLAY_BEGIN});out.push({kind:'raw',text:OVERLAY_END});}
    else throw new Error(`unknown loader entry ${JSON.stringify(entry)}`);
  }
  return out;
}
export const scriptList=async manifest=>(await expand(manifest)).filter(item=>item.kind==='script').map(item=>item.src);
export const renderCss=list=>['<!-- LOADER:CSS:BEGIN -->',...list.map(f=>`<link rel="stylesheet" href="${f}${VERSION_SUFFIX}" />`),'<!-- LOADER:CSS:END -->'].join('\n');
export function render(items){return [BEGIN,...items.map(item=>item.kind==='raw'?item.text:tag(item.src)),END].join('\n');}

// index.html between the first <script src="js/build-info.js…> and the last <script src="game.js…> is owned by the loader.
const SCRIPT_REGION=/(<script src="js\/build-info\.js\?v=__BUILD_ASSET_VERSION__"><\/script>[\s\S]*?<script src="game\.js\?v=__BUILD_ASSET_VERSION__"><\/script>)|(<!-- LOADER:BEGIN -->[\s\S]*<!-- LOADER:END -->)/;
const CSS_REGION=/<!-- LOADER:CSS:BEGIN -->[\s\S]*?<!-- LOADER:CSS:END -->/;
export async function expectedIndex(items=null){
  items=items||await expand();
  const index=lf(await readFile(path.join(root,'index.html'),'utf8'));
  if(!SCRIPT_REGION.test(index))throw new Error('index.html has no loader region');
  const css=await cssList();
  return index.replace(CSS_REGION,()=>renderCss(css)).replace(SCRIPT_REGION,()=>render(items));
}

// ---- verification ("loader-order verification") ----
// Pure structural analysis of an expansion: duplicates, missing files, owner-maintained [before, after] order rules.
export function analyze(manifest,items,{exists=f=>existsSync(path.join(root,f))}={}){
  const problems=[],scripts=items.filter(i=>i.kind==='script'),seen=new Map();
  for(const [i,item] of scripts.entries()){
    if(seen.has(item.src))problems.push(`duplicate script ${item.src} (positions ${seen.get(item.src)} and ${i})`);seen.set(item.src,i);
    if(!exists(item.src))problems.push(`missing script file ${item.src} (${item.via})`);
  }
  for(const [a,b] of manifest.order||[]){if(!seen.has(a)||!seen.has(b))problems.push(`order rule references unloaded file: ${a} / ${b}`);else if(seen.get(a)>=seen.get(b))problems.push(`${a} must load before ${b}`);}
  return {problems,seen};
}
export async function verify({quiet=false}={}){
  const manifest=await readManifest();const items=await expand(manifest);const scripts=items.filter(i=>i.kind==='script');
  const {problems,seen}=analyze(manifest,items);
  // generated index.html must match
  const actual=lf(await readFile(path.join(root,'index.html'),'utf8'));
  const expected=await expectedIndex(items);
  if(actual!==expected)problems.push('index.html loader block is stale — run: node tools/loader.mjs sync');
  // every js file must be loaded somewhere or explicitly allow-listed
  const loaded=new Set(seen.keys());
  for(const page of ['party-dev.html','rave-review.html','minigame-lab.html']){const html=await readFile(path.join(root,page),'utf8');for(const m of html.matchAll(/src="([^"?]+\.js)/g))loaded.add(m[1]);}
  const all=await walk(path.join(root,'js'));
  const allow=new Set(manifest.unloadedAllowed||[]);
  const dynamic=f=>f.startsWith('js/minigames/');
  for(const f of all)if(!loaded.has(f)&&!allow.has(f)&&!dynamic(f))problems.push(`js file is not loaded by any page and not allow-listed: ${f}`);
  for(const f of allow)if(loaded.has(f))problems.push(`unloadedAllowed lists a file that IS loaded: ${f}`);
  if(!quiet&&problems.length)for(const p of problems)console.error(`LOADER ${p}`);
  return {ok:problems.length===0,problems,scripts:scripts.map(s=>s.src)};
}
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else if(e.name.endsWith('.js'))out.push(posix(path.relative(root,p)));}return out.sort();}

export async function sync(){
  const next=await expectedIndex();
  const current=await readFile(path.join(root,'index.html'),'utf8');const eol=current.includes('\r\n')?'\r\n':'\n';
  await writeFile(path.join(root,'index.html'),eol==='\r\n'?next.replace(/\n/g,'\r\n'):next);
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const cmd=process.argv[2]||'verify';
  if(cmd==='sync'){await sync();console.log('index.html loader block synced');}
  else if(cmd==='list'){for(const s of await scriptList())console.log(s);}
  else if(cmd==='verify'){const r=await verify();if(!r.ok)process.exit(1);console.log(`PASS loader (${r.scripts.length} scripts, deterministic order, index.html in sync)`);}
  else{console.error('Usage: node tools/loader.mjs <sync|verify|list>');process.exit(2);}
}
