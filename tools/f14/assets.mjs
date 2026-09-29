// F14-A — GENERIC ASSET VALIDATION.
//
// Checks referenced files exist, image/audio bytes actually decode (magic-byte sniff), placeholder sentinels have not
// survived into a build, and id collections are duplicate-free. It does NOT require final assets that are not yet
// authorized: a declared-but-pending asset is reported by audio.mjs/registry layer as PENDING, not FAIL.
import {readFile,readdir,stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {IMAGE_EXT,AUDIO_EXT,SCAN_TEXT_EXT,PLACEHOLDER_MARKERS} from './config.mjs';

const posix=p=>p.split(path.sep).join('/');
export const extOf=f=>path.extname(f).toLowerCase();
export const isImage=f=>IMAGE_EXT.includes(extOf(f));
export const isAudio=f=>AUDIO_EXT.includes(extOf(f));

// ---- magic-byte sniffing -------------------------------------------------
function startsWith(buf,bytes){if(buf.length<bytes.length)return false;for(let i=0;i<bytes.length;i++)if(buf[i]!==bytes[i])return false;return true;}
const ascii=(buf,at,len)=>buf.length>=at+len?buf.slice(at,at+len).toString('latin1'):'';
export function sniff(buf){
  if(!buf||!buf.length)return 'empty';
  if(startsWith(buf,[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))return 'png';
  if(startsWith(buf,[0xff,0xd8,0xff]))return 'jpeg';
  if(ascii(buf,0,3)==='GIF')return 'gif';
  if(ascii(buf,0,4)==='RIFF'&&ascii(buf,8,4)==='WEBP')return 'webp';
  if(ascii(buf,0,4)==='RIFF'&&ascii(buf,8,4)==='WAVE')return 'wav';
  if(ascii(buf,0,4)==='OggS')return 'ogg';
  if(ascii(buf,0,3)==='ID3')return 'mp3';
  if(ascii(buf,4,4)==='ftyp')return 'm4a';
  if(buf.length>=2&&buf[0]===0xff&&(buf[1]&0xe0)===0xe0)return 'mp3'; // MPEG frame sync (no ID3 tag)
  return 'unknown';
}
// Decode check by extension family. Returns {ok, reason}. `unknown` is a failure — bytes are not the declared format.
export function decodeCheck(buf,ext){
  const kind=sniff(buf);
  if(kind==='empty')return {ok:false,reason:'empty-file'};
  const want=IMAGE_EXT.includes(ext)?'image':AUDIO_EXT.includes(ext)?'audio':null;
  if(!want)return {ok:true,reason:null};
  if(kind==='unknown')return {ok:false,reason:'not-decodable'};
  const imageKinds=['png','jpeg','gif','webp'];
  const audioKinds=['wav','ogg','mp3','m4a'];
  if(want==='image'&&!imageKinds.includes(kind))return {ok:false,reason:`declared image but bytes are ${kind}`};
  if(want==='audio'&&!audioKinds.includes(kind))return {ok:false,reason:`declared audio but bytes are ${kind}`};
  return {ok:true,reason:null};
}

// ---- placeholder sentinels ----------------------------------------------
export function findMarkers(text,markers=PLACEHOLDER_MARKERS){
  const out=[];
  const lines=String(text).split('\n');
  for(let i=0;i<lines.length;i++)for(const marker of markers){const at=lines[i].indexOf(marker);if(at>=0)out.push({marker,line:i+1,column:at+1});}
  return out;
}

// ---- duplicate ids -------------------------------------------------------
export function duplicateIds(list,key='id'){
  const seen=new Set(),dupes=[];
  for(const item of list||[]){const id=item?.[key];if(id==null)continue;const k=String(id);if(seen.has(k)&&!dupes.includes(k))dupes.push(k);seen.add(k);}
  return dupes;
}

// ---- file tree -----------------------------------------------------------
export const DEFAULT_SKIP=new Set(['.git','node_modules','.claude','.github','work','reports','dist','dist-private','private_overlay','sealed_overlay','overlay','art_department','tools','docs']);
async function walk(dir,base,skip,out=[]){
  if(!existsSync(dir))return out;
  for(const e of await readdir(dir,{withFileTypes:true})){
    if(e.isDirectory()&&skip.has(e.name))continue;
    const full=path.join(dir,e.name);
    if(e.isDirectory()){await walk(full,base,skip,out);}
    else out.push(posix(path.relative(base,full)));
  }
  return out;
}
export function listFiles(dir,{skip=DEFAULT_SKIP}={}){return walk(dir,dir,skip);}
// The runtime surface of the repo (used when no built artifact exists, so tooling/docs are never scanned).
export const RUNTIME_SCOPE=['index.html','party-dev.html','rave-review.html','minigame-lab.html','game.js','style.css','js','assets'];

// ---- reference extraction ------------------------------------------------
// Audio is owned by audio.mjs (the manifest distinguishes inert hooks from delivery gaps); the generic scanner covers
// images/fonts/data. Dynamic template fragments (`${i+1}`) are not file references.
const LOCAL_EXT=/\.(?:png|jpe?g|gif|webp|ttf|woff2?|json)\b/i;
const ASSET_LITERAL=/["'`]([^"'`\n]+?\.(?:png|jpe?g|gif|webp|ttf|woff2?|json))(?:\?[^"'`]*)?["'`]/gi;
const CSS_URL=/url\(\s*['"]?([^'")]+?)['"]?\s*\)/gi;
const ATTR=/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;
function isDynamic(ref){return ref.includes('${')||ref.includes('%')||/\+|\*|\bsrcset\b/.test(ref)||/\s/.test(ref);}
function normalizeRef(ref){
  let r=String(ref).trim();
  if(!r||isDynamic(r))return null;
  if(r.startsWith('http:')||r.startsWith('https:')||r.startsWith('data:')||r.startsWith('//')||r.startsWith('#'))return null;
  r=r.split('?')[0].split('#')[0];
  if(r.startsWith('/'))r=r.slice(1);
  if(!r||r.includes('\0')||r.startsWith('..'))return null;
  return r;
}
// Extract local asset references from one text file. Only paths under assets/ (or explicit relative asset files) count,
// so template fragments and generated names do not create noise.
export function extractRefs(text){
  const refs=new Set();
  for(const re of [ASSET_LITERAL,CSS_URL,ATTR]){
    re.lastIndex=0;let m;
    while((m=re.exec(text))){
      const ref=normalizeRef(m[1]);
      if(ref&&LOCAL_EXT.test(ref)&&ref.startsWith('assets/'))refs.add(ref);
    }
  }
  return [...refs];
}

// ---- the scan ------------------------------------------------------------
// scanAssets({dir}) — `dir` is a built artifact (dist/) or the repo root. Returns findings + a summary. Findings are
// REPORTED, never auto-fixed.
export async function scanAssets({dir,markers=PLACEHOLDER_MARKERS,scope=null}={}){
  const findings=[];
  const add=(kind,file,detail)=>findings.push({kind,file,detail});
  let files=await listFiles(dir);
  if(scope&&scope.length)files=files.filter(f=>scope.some(s=>f===s||f.startsWith(`${s}/`)));
  const textFiles=files.filter(f=>SCAN_TEXT_EXT.includes(extOf(f)));
  const refs=new Map(); // ref -> first referrer
  const markerHits=[];
  for(const f of textFiles){
    let text;try{text=await readFile(path.join(dir,f),'utf8');}catch(e){continue;}
    for(const ref of extractRefs(text))if(!refs.has(ref))refs.set(ref,f);
    for(const hit of findMarkers(text,markers))markerHits.push({file:f,...hit});
  }
  // referenced file missing
  const checked=new Set();
  for(const [ref,from] of refs){
    if(checked.has(ref))continue;checked.add(ref);
    const full=path.join(dir,ref);
    if(!existsSync(full)){add('referenced-file-missing',ref,`referenced by ${from}`);}
  }
  // decode failures on every image/audio file present
  let decoded=0;
  for(const f of files){
    if(!isImage(f)&&!isAudio(f))continue;
    let buf;try{buf=await readFile(path.join(dir,f));}catch(e){continue;}
    const result=decodeCheck(buf,extOf(f));
    if(!result.ok)add(isAudio(f)?'audio-decode-failure':'image-decode-failure',f,result.reason);
    else decoded++;
  }
  for(const hit of markerHits)add('placeholder-marker',hit.file,`${hit.marker} at ${hit.line}:${hit.column}`);
  // marker in a file NAME also counts (an asset shipped as __PLACEHOLDER__.png)
  for(const f of files)for(const marker of markers)if(f.includes(marker))add('placeholder-marker-name',f,marker);
  return {findings,files:files.length,refs:refs.size,decoded,markerHits,images:files.filter(isImage).length,audio:files.filter(isAudio).length};
}

// A convenience for callers that already hold buffers (tests, artifact inspection).
export async function decodeFile(file){const buf=await readFile(file);return decodeCheck(buf,extOf(file));}
export async function fileSize(file){try{return (await stat(file)).size;}catch(e){return null;}}
