#!/usr/bin/env node
// PRIVATE OVERLAY BUILDER (F00). OPEN trunk + private sealed overlay = complete private game build.
//
// This tool is public, neutral infrastructure: it knows HOW to lay an overlay onto an OPEN artifact, and nothing about what
// any overlay contains. The overlay itself lives ONLY in the private HQ repository (conventionally private_overlay/), and is
// applied to a COPY of the OPEN dist/ — the OPEN dist/ is never modified, so an OPEN build can never be contaminated.
//
//   overlay layout            <overlay>/overlay.json   {"schema":1,"id":"…","files":[{"from":"files/x.js","to":"js/sealed/x.js"}],"scripts":["js/sealed/x.js"]}
//                             <overlay>/files/…        the payload files
//   node tools/overlay.mjs init-empty --dir <overlay>                     write an EMPTY overlay (F00 ships only this)
//   node tools/overlay.mjs build --overlay <dir> [--dist dist] [--out dist-private]
//   node tools/overlay.mjs verify --out dist-private [--dist dist]        overlay applied correctly, OPEN files untouched
//
// Rules enforced (the tool refuses otherwise):
//   * payload targets must live under js/sealed/ or assets/sealed/ — no path traversal
//   * the ONLY existing artifact file an overlay may replace is the empty slot js/sealed/pack.js
//   * an EMPTY overlay (files:[]) must yield an artifact byte-identical to the OPEN dist/ except one neutral marker file
//   * output never logs payload file names — only counts and digests
import {cp,mkdir,readFile,rm,writeFile,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {OVERLAY_BEGIN,OVERLAY_END} from './loader.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ALLOWED_ROOTS=['js/sealed/','assets/sealed/'];const SLOT='js/sealed/pack.js';
const posix=p=>p.split(path.sep).join('/');
const sha=buf=>createHash('sha256').update(buf).digest('hex');

export function validateOverlay(overlay){
  const problems=[];
  if(!overlay||overlay.schema!==1)problems.push('overlay.json: schema must be 1');
  if(typeof overlay?.id!=='string'||!overlay.id)problems.push('overlay.json: id required');
  const files=overlay?.files,scripts=overlay?.scripts;
  if(!Array.isArray(files))problems.push('overlay.json: files must be an array');
  if(!Array.isArray(scripts))problems.push('overlay.json: scripts must be an array');
  if(problems.length)return problems;
  const targets=new Set();
  files.forEach((f,i)=>{
    if(typeof f?.from!=='string'||typeof f?.to!=='string'){problems.push(`file #${i}: {from,to} required`);return;}
    if(f.from.includes('..')||path.isAbsolute(f.from)||f.to.includes('..')||path.isAbsolute(f.to)||f.to.includes('\\'))problems.push(`file #${i}: path traversal`);
    if(!ALLOWED_ROOTS.some(r=>f.to.startsWith(r)))problems.push(`file #${i}: target outside ${ALLOWED_ROOTS.join(' | ')}`);
    if(targets.has(f.to))problems.push(`file #${i}: duplicate target`);targets.add(f.to);
  });
  scripts.forEach((s,i)=>{if(!targets.has(s)||!s.endsWith('.js'))problems.push(`script #${i}: must be a .js payload target`);});
  return problems;
}
async function listAll(dir,base=dir,out=[]){for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await listAll(p,base,out);else out.push(posix(path.relative(base,p)));}return out.sort();}

export async function buildOverlay({overlayDir,dist=path.join(root,'dist'),out=path.join(root,'dist-private')}){
  if(!existsSync(path.join(dist,'index.html')))throw new Error(`OPEN artifact missing at ${dist} — run npm run build first`);
  const overlayFile=path.join(overlayDir,'overlay.json');if(!existsSync(overlayFile))throw new Error('overlay.json not found in overlay directory');
  const overlay=JSON.parse(await readFile(overlayFile,'utf8'));const problems=validateOverlay(overlay);if(problems.length)throw new Error(`invalid overlay: ${problems.join('; ')}`);
  await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});await cp(dist,out,{recursive:true});
  const buildJson=JSON.parse(await readFile(path.join(dist,'build.json'),'utf8'));
  const digests=[];
  for(const f of overlay.files){
    const source=path.join(overlayDir,f.from);if(!existsSync(source))throw new Error('overlay payload file missing');
    const target=path.join(out,f.to);
    if(existsSync(target)&&posix(f.to)!==SLOT)throw new Error('overlay may not replace an existing OPEN artifact file');
    await mkdir(path.dirname(target),{recursive:true});const buf=await readFile(source);await writeFile(target,buf);digests.push(sha(buf));
  }
  // fill the overlay slot in index.html (between the loader markers) with the overlay's scripts, cache-busted like OPEN scripts
  const indexPath=path.join(out,'index.html');let index=await readFile(indexPath,'utf8');
  if(!index.includes(OVERLAY_BEGIN)||!index.includes(OVERLAY_END))throw new Error('index.html has no overlay slot markers');
  const eol=index.includes('\r\n')?'\r\n':'\n';
  const tags=overlay.scripts.map(s=>`<script src="${s}?v=${buildJson.assetVersion}"></script>`);
  index=index.replace(new RegExp(`${OVERLAY_BEGIN}[\\s\\S]*?${OVERLAY_END}`),()=>[OVERLAY_BEGIN,...tags,OVERLAY_END].join(eol));
  await writeFile(indexPath,index);
  const marker={schema:1,kind:'private-overlay-build',overlay:sha(overlay.id).slice(0,16),open:{releaseId:buildJson.releaseId,commit:buildJson.commit},fileCount:overlay.files.length,scriptCount:overlay.scripts.length,empty:overlay.files.length===0,payloadDigest:sha(digests.join(''))};
  await writeFile(path.join(out,'overlay-build.json'),`${JSON.stringify(marker,null,1)}\n`);
  return marker;
}
export async function verifyOverlay({dist=path.join(root,'dist'),out=path.join(root,'dist-private')}){
  const problems=[];const marker=JSON.parse(await readFile(path.join(out,'overlay-build.json'),'utf8'));
  const openFiles=await listAll(dist),privFiles=await listAll(out);
  const extra=privFiles.filter(f=>!openFiles.includes(f));
  for(const f of extra)if(f!=='overlay-build.json'&&!ALLOWED_ROOTS.some(r=>f.startsWith(r)))problems.push('overlay wrote outside its allowed roots');
  for(const f of openFiles){
    if(f==='index.html'||f===SLOT)continue;
    if(!privFiles.includes(f)){problems.push(`OPEN file missing from private build: ${f}`);continue;}
    if(sha(await readFile(path.join(dist,f)))!==sha(await readFile(path.join(out,f))))problems.push(`OPEN file altered in private build: ${f}`);
  }
  const openIndex=(await readFile(path.join(dist,'index.html'),'utf8')).replace(/\r\n/g,'\n'),privIndex=(await readFile(path.join(out,'index.html'),'utf8')).replace(/\r\n/g,'\n');
  const strip=t=>t.replace(new RegExp(`${OVERLAY_BEGIN}[\\s\\S]*?${OVERLAY_END}`),'');
  if(strip(openIndex)!==strip(privIndex))problems.push('index.html differs outside the overlay slot');
  if(marker.empty){
    if(extra.some(f=>f!=='overlay-build.json'))problems.push('empty overlay produced extra files');
    if(sha(await readFile(path.join(dist,SLOT)))!==sha(await readFile(path.join(out,SLOT))))problems.push('empty overlay altered the sealed slot');
    if(openIndex!==privIndex)problems.push('empty overlay changed index.html');
  }
  return {ok:problems.length===0,problems,marker};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const arg=n=>{const i=process.argv.indexOf(n);return i===-1?null:process.argv[i+1];};
  const cmd=process.argv[2];
  try{
    if(cmd==='init-empty'){const dir=path.resolve(arg('--dir')||'private_overlay');await mkdir(path.join(dir,'files'),{recursive:true});await writeFile(path.join(dir,'overlay.json'),`${JSON.stringify({schema:1,id:'hq-overlay',files:[],scripts:[]},null,1)}\n`);console.log('empty overlay written');}
    else if(cmd==='build'){const m=await buildOverlay({overlayDir:path.resolve(arg('--overlay')||'private_overlay'),dist:path.resolve(arg('--dist')||path.join(root,'dist')),out:path.resolve(arg('--out')||path.join(root,'dist-private'))});
      const v=await verifyOverlay({dist:path.resolve(arg('--dist')||path.join(root,'dist')),out:path.resolve(arg('--out')||path.join(root,'dist-private'))});if(!v.ok){for(const p of v.problems)console.error(`OVERLAY ${p}`);process.exitCode=1;}
      else console.log(`PASS private overlay build (${m.fileCount} payload files, ${m.scriptCount} scripts, ${m.empty?'EMPTY pack — identical to OPEN':'payload digest '+m.payloadDigest.slice(0,12)}; OPEN files untouched)`);}
    else if(cmd==='verify'){const v=await verifyOverlay({dist:path.resolve(arg('--dist')||path.join(root,'dist')),out:path.resolve(arg('--out')||path.join(root,'dist-private'))});if(!v.ok){for(const p of v.problems)console.error(`OVERLAY ${p}`);process.exitCode=1;}else console.log('PASS private overlay verify');}
    else{console.error('Usage: node tools/overlay.mjs <init-empty|build|verify> [--overlay dir] [--dist dist] [--out dist-private]');process.exitCode=2;}
  }catch(error){console.error(`FAIL ${error.message}`);process.exitCode=1;}
}
