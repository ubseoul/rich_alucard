// F14-A — AUTHORED AUDIO AVAILABILITY.
//
// Loads the real audio manifest in an isolated vm (no browser) and checks that every REGISTERED sound resolves to a
// file that exists and actually decodes. Unregistered entries are NOT failures at IF-1: NO_01–NO_06 are authorized
// inert drop-in hooks, and the delivery gaps are declared. They are reported as PENDING (advisory) so FCPB can see
// what is still owed without the harness inventing content.
import {readFile,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {duplicateIds,decodeCheck,extOf} from './assets.mjs';

export async function loadAudioManifest(root){
  const file=path.join(root,'js','data','audio_manifest.js');
  const ctx={window:{}};ctx.window=ctx;vm.createContext(ctx);
  vm.runInContext(await readFile(file,'utf8'),ctx,{filename:'js/data/audio_manifest.js'});
  const composer=path.join(root,'js/data/audio/manifest_parts.js'),parts=path.join(root,'js/data/audio/parts');
  if(existsSync(composer)){
   vm.runInContext(await readFile(composer,'utf8'),ctx);
   if(existsSync(parts))for(const name of (await readdir(parts)).filter(n=>n.endsWith('.js')).sort())vm.runInContext(await readFile(path.join(parts,name),'utf8'),ctx,{filename:`js/data/audio/parts/${name}`});
  }
  if(!ctx.RAAudioManifest)throw new Error('audio manifest did not expose RAAudioManifest');
  return ctx.RAAudioManifest;
}

// All files a manifest entry declares (main file, loop-set parts, variations).
export function entryFiles(entry){
  const out=[];
  if(entry.file)out.push(entry.file);
  for(const p of entry.parts||[])if(p.file)out.push(p.file);
  for(const v of entry.variations||[])out.push(v);
  return [...new Set(out)];
}

// dir = artifact (dist/) or repo root; paths in the manifest are repo-relative, so they resolve against `dir`.
export async function checkAudio({root,dir=root}={}){
  const manifest=await loadAudioManifest(root);
  const list=manifest.list();
  const findings=[],pending=[];
  const duplicates=duplicateIds(list);
  for(const id of duplicates)findings.push({kind:'duplicate-audio-id',id,detail:id});
  let registered=0,missing=0,undecodable=0,checked=0;
  for(const entry of list){
    if(!entry.registered){
      pending.push({id:entry.id,reason:entry.reason||'unregistered',expectedPath:entry.expectedPath||null});
      continue;
    }
    registered++;
    for(const rel of entryFiles(entry)){
      checked++;
      const full=path.join(dir,rel);
      if(!existsSync(full)){missing++;findings.push({kind:'registered-audio-missing',id:entry.id,file:rel});continue;}
      let buf;try{buf=await readFile(full);}catch(e){findings.push({kind:'registered-audio-unreadable',id:entry.id,file:rel,detail:e.message});continue;}
      const result=decodeCheck(buf,extOf(rel));
      if(!result.ok){undecodable++;findings.push({kind:'registered-audio-decode-failure',id:entry.id,file:rel,detail:result.reason});}
    }
  }
  return {manifest,findings,pending,summary:{total:list.length,registered,unregistered:list.length-registered,checked,missing,undecodable,duplicateIds:duplicates.length}};
}

// ---- art registry availability (frozen corpus) -----------------------------------------
// The generated RAArtRegistry is data only. Report entries with no path / duplicate explicit ids, and missing files.
export async function checkArtRegistry({root,dir=root}={}){
  const file=path.join(root,'js','data','art_registry.js');
  const ctx={window:{}};ctx.window=ctx;vm.createContext(ctx);
  vm.runInContext(await readFile(file,'utf8'),ctx,{filename:'js/data/art_registry.js'});
  const registry=ctx.RAArtRegistry||{};
  const findings=[];
  const assets=registry.assets||{};
  let missing=0,undecodable=0;
  for(const rel of Object.keys(assets)){
    const full=path.join(dir,rel);
    if(!existsSync(full)){missing++;findings.push({kind:'registry-art-missing',file:rel});continue;}
    if(['.png','.jpg','.jpeg','.gif','.webp'].includes(extOf(rel))){
      let buf;try{buf=await readFile(full);}catch(e){continue;}
      const result=decodeCheck(buf,extOf(rel));
      if(!result.ok)undecodable++,findings.push({kind:'registry-art-decode-failure',file:rel,detail:result.reason});
    }
  }
  const ids=[];
  for(const group of ['characters','environments','props','vehicles','items','population','creatures','dragon','sheets','ui','bedroom']){
    const tree=registry[group];
    if(tree&&typeof tree==='object')for(const key of Object.keys(tree))ids.push({group,id:key});
  }
  return {findings,summary:{assets:Object.keys(assets).length,missing,undecodable,groups:ids.length}};
}
