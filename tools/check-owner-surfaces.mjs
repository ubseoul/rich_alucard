#!/usr/bin/env node
// Enforces the IF-1 single-owner surfaces (tools/if1/owner-surfaces.json) on a branch diff.
//   node tools/check-owner-surfaces.mjs --base <sha|branch> [--head HEAD] [--fragment F01] [--as-owner]
// Without --as-owner: any changed file matching an ownerOnly pattern fails. With --fragment F01: every changed file must
// also lie inside F01's owned surfaces (js/frag/F01/**, its art/audio parts, its tests, its docs/assets) or be a NEW file
// under a fragment-owned pattern of ANY id-less kind — anything else is reported as outside the fragment's surface.
// The integration owner runs with --as-owner (and is the only one who merges).
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function loadSurfaces(){return JSON.parse(await readFile(path.join(root,'tools','if1','owner-surfaces.json'),'utf8'));}
export function globToRegExp(glob){
  let re='';for(let i=0;i<glob.length;i++){const ch=glob[i];
    if(ch==='*'&&glob[i+1]==='*'){re+='.*';i++;}
    else if(ch==='*')re+='[^/]*';
    else re+=ch.replace(/[.+?^${}()|[\]\\]/g,'\\$&');}
  return new RegExp(`^${re}$`);
}
export const matches=(patterns,file)=>patterns.some(p=>globToRegExp(p).test(file));
export function fragmentPatterns(surfaces,id){return surfaces.fragmentOwned.map(p=>p.replaceAll('{ID}',id).replaceAll('{id}',id.toLowerCase()));}
export function classify(surfaces,files,{fragment=null,asOwner=false}={}){
  const violations=[];
  for(const file of files){
    if(!asOwner&&matches(surfaces.ownerOnly,file))violations.push({file,reason:'integration-owner-only surface'});
    else if(fragment&&!asOwner&&!matches(fragmentPatterns(surfaces,fragment),file))violations.push({file,reason:`outside ${fragment}'s owned surface`});
  }
  return violations;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const arg=n=>{const i=process.argv.indexOf(n);return i===-1?null:process.argv[i+1];};
  const base=arg('--base'),head=arg('--head')||'HEAD',fragment=arg('--fragment'),asOwner=process.argv.includes('--as-owner');
  if(!base){console.error('Usage: node tools/check-owner-surfaces.mjs --base <ref> [--head <ref>] [--fragment F01] [--as-owner]');process.exit(2);}
  const files=execFileSync('git',['diff','--name-only',`${base}...${head}`],{cwd:root,encoding:'utf8'}).split('\n').filter(Boolean);
  const bad=classify(await loadSurfaces(),files,{fragment,asOwner});
  if(bad.length){for(const v of bad)console.error(`OWNER-SURFACE ${v.file}: ${v.reason}`);process.exit(1);}
  console.log(`PASS owner surfaces (${files.length} changed files${asOwner?', as integration owner':fragment?`, fragment ${fragment}`:''})`);
}
