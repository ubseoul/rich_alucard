#!/usr/bin/env node
// IF-1 (4Q) test auto-discovery. Every folder tools/tests/<fragment>/ holds that fragment's regression suites as
// *.test.mjs files exporting `async function test(root)` (throw / assert to fail; console.log a PASS line). Files and
// folders are discovered and run in sorted order, so a fragment adds tests by adding files — no shared list to edit.
// Folders/files starting with "_" are helpers and are never run.
//   node tools/run-tests.mjs                     run every fragment's tests
//   node tools/run-tests.mjs --fragment if1      run one fragment
//   node tools/run-tests.mjs --list              print what would run
import {readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
export const defaultRoot=path.resolve(here,'..');

export async function discover(root=defaultRoot,{fragment=null}={}){
  const base=path.join(root,'tools','tests');if(!existsSync(base))return [];
  const found=[];
  for(const dir of (await readdir(base,{withFileTypes:true})).filter(d=>d.isDirectory()&&!d.name.startsWith('_')).sort((a,b)=>a.name<b.name?-1:1)){
    if(fragment&&dir.name.toLowerCase()!==String(fragment).toLowerCase())continue;
    for(const file of (await readdir(path.join(base,dir.name))).filter(f=>f.endsWith('.test.mjs')&&!f.startsWith('_')).sort())found.push({fragment:dir.name,file,path:path.join(base,dir.name,file)});
  }
  return found;
}
export async function runFragmentTests(root=defaultRoot,{fragment=null}={}){
  const suites=await discover(root,{fragment});
  if(fragment&&!suites.length)throw new Error(`no tests discovered for fragment ${fragment}`);
  for(const suite of suites){
    const mod=await import(pathToFileURL(suite.path).href);
    if(typeof mod.test!=='function')throw new Error(`${suite.fragment}/${suite.file} must export async function test(root)`);
    try{await mod.test(root);}catch(error){error.message=`[${suite.fragment}/${suite.file}] ${error.message}`;throw error;}
  }
  return suites.length;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const i=process.argv.indexOf('--fragment'),fragment=i===-1?null:process.argv[i+1];
  try{
    if(process.argv.includes('--list')){for(const s of await discover(defaultRoot,{fragment}))console.log(`${s.fragment}/${s.file}`);}
    else{const n=await runFragmentTests(defaultRoot,{fragment});console.log(`PASS fragment test discovery (${n} suites${fragment?` for ${fragment}`:''})`);}
  }catch(error){console.error(`FAIL ${error.message}`);process.exitCode=1;}
}
