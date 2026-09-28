#!/usr/bin/env node
// PACKET UL-L2-002 — SFX library build + registration.
// Reads the approved RA_SFX_DELIVERY_v1 (WAV masters + MANIFEST.csv), produces runtime MP3 copies under
// assets/audio/sfx/<category>/, normalizes variation/loop-set IDs, and regenerates js/data/audio_manifest.js.
// Does not source new audio, does not touch main, does not wire story meaning for sealed IDs.
//
// Usage: node tools/audio-build.mjs [--src DIR] [--dry] [--only ID,ID] [--limit N]
//   --dry   generate the manifest only (no audio processing)
import {readFileSync,writeFileSync,mkdirSync,existsSync,statSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=Object.fromEntries(process.argv.slice(2).reduce((acc,a,i,all)=>{if(a.startsWith('--')){const n=all[i+1];acc.push([a.slice(2),n&&!n.startsWith('--')?n:true])}return acc},[]));
const SRC=path.resolve(args.src||process.env.RA_SFX_SRC||'C:/Users/Ube/OneDrive/Desktop/RA_SFX_DELIVERY_v1');
const OUT=path.join(root,'assets','audio','sfx');
const MANIFEST=path.resolve(args.manifest||path.join(root,'js','data','audio_manifest.js'));
const REPORT=path.resolve(args.report||path.join(root,'work','audio_build_report.json'));
const DRY=!!args.dry;
const ONLY=args.only?String(args.only).split(','):null;
const LIMIT=args.limit?Number(args.limit):0;

// ---- plan-derived metadata ----
const BUS_DEFAULTS={MUSIC:.70,SFX:.90,UI:.60,VOICE:.80,AMBIENCE:.45};
const CATEGORY_BUS={ui_phone:'UI',bars:'UI',locations:'AMBIENCE',home_castle:'SFX',combat:'SFX',touge:'SFX',pier:'SFX',slurp:'SFX',hatch:'SFX',jollof:'SFX',garage:'SFX',hookah_pickup_kbbq:'SFX',story:'SFX',reserved:'SFX'};
const VOICE_IDS=new Set(['UI_TEXT_BLIP_RICH','UI_TEXT_BLIP_NPC_LOW','UI_TEXT_BLIP_NPC_MID','UI_TEXT_BLIP_NPC_HIGH','UI_TEXT_BLIP_GHOST','SNEEZE','EN_SCREAM','EN_KIAI','EXHALE','WAKE_SCREAM']);
const MUSIC_IDS=new Set(['REWARD_STINGER','VICTORY','DEFEAT','HOOK_COOKED']);
const UI_IDS=new Set(['CLIP_DING','COMBO_UP','COUNTDOWN']);
// The plan's own bus table puts AMB_PIER on SFX (not AMBIENCE); everything else AMB_* is a bed.
const AMBIENCE_EXCEPTIONS=new Set(['AMB_PIER']);
const DEFAULT_META={
  UI:{gain:1,pitchJitter:.03,maxVoices:3,priority:3},
  SFX:{gain:1,pitchJitter:.02,maxVoices:3,priority:3},
  VOICE:{gain:1,pitchJitter:0,maxVoices:1,priority:1},
  MUSIC:{gain:1,pitchJitter:0,maxVoices:1,priority:4},
  AMBIENCE:{gain:1,pitchJitter:0,maxVoices:1,priority:2}
};
// Plan §3.3 concurrency examples worth preserving per-ID.
const META_OVERRIDES={
  UI_TAP:{pitchJitter:.03,maxVoices:3,priority:2},
  UI_MOVE:{pitchJitter:.03,maxVoices:2,priority:2},
  UI_CONFIRM:{maxVoices:2,priority:3},
  UI_BACK:{maxVoices:2,priority:2},
  UI_ERROR:{maxVoices:2,priority:3},
  UI_DIALOG_ADVANCE:{maxVoices:2,priority:1},
  PHONE_OPEN:{maxVoices:1,priority:4},
  PHONE_CLOSE:{maxVoices:1,priority:4},
  PHONE_APP_OPEN:{pitchJitter:.02,maxVoices:2,priority:3},
  NOTIF_GENERIC:{pitchJitter:.02,maxVoices:4,priority:3},
  NOTIF_TEXT:{pitchJitter:.02,maxVoices:4,priority:4},
  NOTIF_VAMPGRAM:{pitchJitter:.02,maxVoices:4,priority:4},
  NOTIF_INSTAHOE:{pitchJitter:.02,maxVoices:4,priority:4},
  NOTIF_FAMILY:{pitchJitter:.02,maxVoices:4,priority:4},
  NOTIF_STORM:{maxVoices:8,priority:5},
  APP_UNLOCK:{maxVoices:1,priority:5},
  CONTACT_ADDED:{maxVoices:2,priority:4},
  REWARD_STINGER:{maxVoices:1,priority:5,ducksMusic:true},
  HIT_LIGHT:{pitchJitter:.05,maxVoices:3,priority:3},
  HIT_HEAVY:{pitchJitter:.03,maxVoices:3,priority:4},
  KO:{maxVoices:1,priority:5}
};
const RESIDENT=['UI_TAP','UI_MOVE','UI_CONFIRM','UI_BACK','UI_ERROR','PHONE_OPEN','PHONE_CLOSE','PHONE_APP_OPEN','NOTIF_GENERIC'];
const SCENES={
  bedroom:{ambience:'AMB_BEDROOM',preload:['BED_RUSTLE','WAKE_STRETCH','CAT_MEOW']},
  battle:{ambience:'AMB_THRONE',preload:['BATTLE_START','TELEGRAPH','HIT_LIGHT','HIT_HEAVY','CRIT','KO','VICTORY','DEFEAT','MOVE_BLOODBATH','MOVE_BITE','MOVE_OCTOPUS','MOVE_REVENGE']},
  adventure:{ambience:null,preload:['UI_DIALOG_ADVANCE','UI_TEXT_BLIP_RICH','UI_TEXT_BLIP_NPC_MID']},
  tripTravel:{ambience:null,preload:['TRAVEL_WHOOSH']}
};
// Non-wireable planned IDs (present-but-defective or genuinely missing). Never auto-played.
const EXCLUDED={
  MAGIC_SEANCE:{reason:'defective-render-do-not-wire',file:false},
  DRAGON_WINGS:{reason:'missing-from-delivery',file:false},
  BARS_PUNCHLINE:{reason:'missing-from-delivery',file:false}
};
const INERT_HOOKS=['NO_01','NO_02','NO_03','NO_04','NO_05','NO_06'];
// Split-part IDs the audit says are really one runtime id (loop sets).
const MERGE={DRIBBLE:{from:['DRIBBLE__loop','DRIBBLE__bounce']},GRILL_LAND:{from:['GRILL_LAND__loop','GRILL_LAND__land']}};
const PLAN_LABELS={}; // neutral: no per-ID content text is stored for sealed IDs

function licenseClass(license){
  const l=String(license||'');
  if(/^CC0|CC0 \//.test(l))return 'CC0';
  if(/CC BY 4|CC-BY 4/.test(l))return 'CC-BY-4.0';
  if(/CC-BY 3|CC BY 3/.test(l))return 'CC-BY-3.0';
  if(/OGA-BY/.test(l))return 'OGA-BY-3.0';
  if(/Mixkit/.test(l))return 'MIXKIT';
  if(/Pixabay/.test(l))return 'PIXABAY';
  if(/Sonniss/i.test(l))return 'SONNISS';
  if(/Public domain/i.test(l))return 'PUBLIC-DOMAIN';
  if(/original|no third-party source/i.test(l))return 'ORIGINAL';
  if(/Attribution-required/i.test(l))return 'CUSTOM-ATTRIBUTION';
  return 'UNKNOWN';
}
function restrictionsFor(license){
  const l=String(license||''),out=[];
  if(/Sonniss|GDC/i.test(l)){out.push('no standalone resale');out.push('no AI/ML training');}
  if(/Mixkit/i.test(l)&&!out.includes('must ship as part of a game, not as a standalone library'))out.push('must ship as part of a game, not as a standalone library');
  return out;
}
function attributionRequiredFor(license){return /CC[-\s]?BY|OGA-BY|Attribution-required/i.test(String(license||''));}

function parseCsv(text){
  const rows=[];let cur='',field=[],q=false;
  const push=()=>{field.push(cur);cur='';};
  for(let i=0;i<text.length;i++){const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=c;}
    else if(c==='"')q=true;else if(c===',')push();else if(c==='\n'){push();rows.push(field);field=[];}else if(c!=='\r')cur+=c;}
  if(cur.length||field.length){push();rows.push(field);}
  return rows.filter(r=>r.some(v=>String(v).trim()!==''));
}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null;}

// ---- read + group ----
const csvPath=path.join(SRC,'MANIFEST.csv');
if(!existsSync(csvPath))throw new Error(`MANIFEST.csv not found at ${csvPath}`);
const table=parseCsv(readFileSync(csvPath,'utf8'));
const header=table[0].map(h=>h.trim());
const col=Object.fromEntries(header.map((h,i)=>[h,i]));
const rawRows=table.slice(1).map(r=>({id:String(r[col.id]).trim(),filename:String(r[col.filename]).trim(),category:String(r[col.category]).trim(),sourceSite:String(r[col.source_site]||'').trim(),sourceUrl:String(r[col.source_url]||'').trim(),author:String(r[col.author]||'').trim(),license:String(r[col.license]||'').trim(),attribution:String(r[col.attribution_line]||'').trim(),loop:String(r[col.loop]||'').trim()==='yes',notes:String(r[col.notes]||'').trim()}));
if(rawRows.length!==262)console.warn(`WARN expected 262 rows, found ${rawRows.length}`);

// Apply MERGE: replace split ids with their parent once.
const mergedIds=new Set();
for(const [parent,def] of Object.entries(MERGE))for(const id of def.from)mergedIds.add(id);
const rows=rawRows.filter(r=>!mergedIds.has(r.id));

const byId=new Map();
for(const [parent,def] of Object.entries(MERGE)){
  const parts=def.from.map(id=>rawRows.find(r=>r.id===id)).filter(Boolean);
  byId.set(parent,parts.map(p=>({...p,id:parent,part:p.id})));
}
for(const r of rows){if(!byId.has(r.id))byId.set(r.id,[]);byId.get(r.id).push(r);}

function busFor(id,category){if(VOICE_IDS.has(id))return 'VOICE';if(MUSIC_IDS.has(id))return 'MUSIC';if(UI_IDS.has(id))return 'UI';if(id.startsWith('AMB_')&&!AMBIENCE_EXCEPTIONS.has(id))return 'AMBIENCE';if(category==='locations')return 'AMBIENCE';if(/_(AMB|ROOM|MORNING)$/.test(id)&&category==='story')return 'AMBIENCE';if(id==='KITCHEN_AMB'||id==='TV_ROOM')return 'AMBIENCE';if(id==='CAR_WINDOWS_DOWN'||id==='SUBURB_MORNING'||id==='OFFICE_ROOM')return 'AMBIENCE';return CATEGORY_BUS[category]||'SFX';}

function relPath(file){const category=rawRows.find(r=>r.filename===file)?.category||'misc';return `assets/audio/sfx/${category}/${path.basename(file).replace(/\.wav$/i,'.mp3')}`;}

const entries=[];
for(const [id,group] of byId){
  const excluded=EXCLUDED[id];
  const first=group[0];
  const allLoop=group.every(g=>g.loop),anyLoop=group.some(g=>g.loop),mixed=anyLoop&&!allLoop;
  let type=first.loop?'loop':'one-shot';
  if(group.length>1)type=mixed?'loop set':(allLoop?'loop':'one-shot');
  const bus=busFor(id,first.category);
  const meta={...DEFAULT_META[bus],...(META_OVERRIDES[id]||{})};
  const entry={id,bus,type,category:first.category,gain:meta.gain,pitchJitter:meta.pitchJitter,maxVoices:meta.maxVoices,priority:meta.priority,loopStart:null,loopEnd:null,variations:[],parts:[],file:null,expectedPath:`assets/audio/sfx/${first.category}/${id}.mp3`,registered:false,licenseClass:licenseClass(first.license),attributionRequired:attributionRequiredFor(first.license),license:first.license,credit:first.attribution||'',author:first.author||'',sourceSite:first.sourceSite||'',sourceUrl:first.sourceUrl||'',restrictions:restrictionsFor(first.license)};
  if(excluded){entry.reason=excluded.reason;entry.expectedPath=null;}
  else if(type==='loop set'){
    entry.parts=group.map(g=>({id:g.part||g.id,file:(DRY?`assets/audio/sfx/${g.category}/${path.basename(g.filename).replace(/\.wav$/i,'.mp3')}`:null),type:g.loop?'loop':'one-shot',sourceFile:g.filename,category:g.category}));
  }else if(group.length>1){
    entry.file=DRY?`assets/audio/sfx/${first.category}/${path.basename(first.filename).replace(/\.wav$/i,'.mp3')}`:null;
    entry.variations=group.slice(1).map(g=>DRY?`assets/audio/sfx/${g.category}/${path.basename(g.filename).replace(/\.wav$/i,'.mp3')}`:null);
  }else{
    entry.file=DRY?`assets/audio/sfx/${first.category}/${path.basename(first.filename).replace(/\.wav$/i,'.mp3')}`:null;
  }
  entry._sources=group.map(g=>({file:g.filename,category:g.category,loop:g.loop}));
  entries.push(entry);
}
// Add planned-but-absent IDs as inert slots.
for(const id of Object.keys(EXCLUDED))if(!byId.has(id)){const e=EXCLUDED[id];entries.push({id,bus:busFor(id,'combat'),type:'one-shot',category:'combat',gain:1,pitchJitter:0,maxVoices:3,priority:3,loopStart:null,loopEnd:null,variations:[],parts:[],file:null,expectedPath:null,registered:false,reason:e.reason,licenseClass:'N/A',attributionRequired:false,license:'',credit:'',author:'',sourceSite:'',sourceUrl:'',restrictions:[],_sources:[]});}
for(const id of INERT_HOOKS)if(!byId.has(id))entries.push({id,bus:'SFX',type:'one-shot',category:'new_oga',gain:1,pitchJitter:0,maxVoices:1,priority:3,loopStart:null,loopEnd:null,variations:[],parts:[],file:null,expectedPath:`assets/audio/sfx/new_oga/${id}.mp3`,registered:false,reason:'inert-drop-in-hook',licenseClass:'PENDING',attributionRequired:false,license:'',credit:'',author:'',sourceSite:'',sourceUrl:'',restrictions:[],_sources:[]});
entries.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);

// ---- audio processing ----
const ff=(a)=>spawnSync('ffmpeg',a,{encoding:'utf8',maxBuffer:1<<28});
const ffBin=(a)=>spawnSync('ffmpeg',a,{maxBuffer:1<<28});
function ffprobe(file){const r=spawnSync('ffprobe',['-v','error','-select_streams','a:0','-show_entries','stream=channels,sample_rate,duration','-of','json',file],{encoding:'utf8'});try{const s=JSON.parse(r.stdout).streams[0];return {channels:Number(s.channels)||1,sampleRate:Number(s.sample_rate)||44100,duration:Number(s.duration)||0};}catch(e){return null;}}
function processOneShot(srcFile,outFile){
  mkdirSync(path.dirname(outFile),{recursive:true});
  const chain='silenceremove=start_periods=1:start_threshold=-50dB,highpass=f=20,afade=t=in:st=0:d=0.005,areverse,afade=t=in:st=0:d=0.005,areverse';
  let r=ff(['-v','error','-y','-i',srcFile,'-af',chain,'-ac','1','-c:a','libmp3lame','-b:a','96k',outFile]);
  if(r.status!==0||!existsSync(outFile)||statSync(outFile).size===0){r=ff(['-v','error','-y','-i',srcFile,'-ac','1','-c:a','libmp3lame','-b:a','96k',outFile]);}
  return r.status===0&&existsSync(outFile)&&statSync(outFile).size>0;
}
function processLoop(srcFile,outFile,probe){
  mkdirSync(path.dirname(outFile),{recursive:true});
  const dec=ffBin(['-v','error','-i',srcFile,'-af','silenceremove=start_periods=1:start_threshold=-50dB','-f','f32le','-ac',String(probe.channels),'-ar',String(probe.sampleRate),'-']);
  if(dec.status!==0||!dec.stdout)return null;
  const ab=new ArrayBuffer(dec.stdout.length-(dec.stdout.length%4));new Uint8Array(ab).set(dec.stdout.subarray(0,ab.byteLength));
  const pcm=new Float32Array(ab);
  const frames=Math.floor(pcm.length/probe.channels);
  if(frames<64){const enc=ff(['-v','error','-y','-f','f32le','-ar',String(probe.sampleRate),'-ac',String(probe.channels),'-i','-','-c:a','libmp3lame','-b:a','128k',outFile]);return enc.status===0?frames/probe.sampleRate:null;}
  const dur=frames/probe.sampleRate;
  let N=Math.round(Math.min(0.30,Math.max(0.05,dur*0.06))*probe.sampleRate);
  N=Math.max(1,Math.min(N,Math.floor(frames*0.25)));
  const outFrames=frames-N,out=new Float32Array(outFrames*probe.channels);
  for(let f=0;f<outFrames;f++)for(let c=0;c<probe.channels;c++){
    const cur=pcm[f*probe.channels+c];
    if(f<N){const g=f/N,fin=Math.sin(g*Math.PI/2),fout=Math.cos(g*Math.PI/2),tail=pcm[(frames-N+f)*probe.channels+c];out[f*probe.channels+c]=cur*fin+tail*fout;}
    else out[f*probe.channels+c]=cur;
  }
  const raw=Buffer.from(out.buffer,out.byteOffset,out.byteLength);
  const enc=spawnSync('ffmpeg',['-v','error','-y','-f','f32le','-ar',String(probe.sampleRate),'-ac',String(probe.channels),'-i','pipe:0','-c:a','libmp3lame','-b:a','128k',outFile],{input:raw,maxBuffer:1<<28});
  if(enc.status!==0||!existsSync(outFile)||statSync(outFile).size===0)return null;
  return outFrames/probe.sampleRate;
}

const report={src:SRC,generatedAt:new Date().toISOString(),entries:entries.length,processed:0,failed:[],excluded:Object.keys(EXCLUDED),loops:0,oneShots:0,loopSets:0,sealed:0,attributionRequired:[],restricted:[],totalRuntimeBytes:0,maxLoopSeconds:0};
if(!DRY){
  for(const entry of entries){
    if(entry.reason)continue;
    const jobs=[];
    if(entry.type==='loop set'){
      for(const part of entry.parts)jobs.push({srcFile:part.sourceFile,category:part.category,out:`assets/audio/sfx/${part.category}/${path.basename(part.sourceFile).replace(/\.wav$/i,'.mp3')}`,loop:part.type==='loop',part});
    }else{
      entry._sources.forEach((s,i)=>{jobs.push({srcFile:s.file,category:s.category,out:`assets/audio/sfx/${s.category}/${path.basename(s.file).replace(/\.wav$/i,'.mp3')}`,loop:entry.type==='loop',primary:i===0});});
    }
    let ok=true;const measured=[];
    for(const job of jobs){
      if(ONLY&&!ONLY.some(x=>job.out.includes(x)||job.srcFile.includes(x)))continue;
      const srcPath=path.join(SRC,job.category,job.srcFile);
      const probe=ffprobe(srcPath);
      if(!probe){report.failed.push({id:entry.id,file:job.srcFile,error:'probe-failed'});ok=false;continue;}
      if(job.loop){const seconds=processLoop(srcPath,path.join(root,job.out),probe);if(seconds==null){report.failed.push({id:entry.id,file:job.srcFile,error:'loop-encode-failed'});ok=false;}else{report.loops++;measured.push({...job,seconds});if(seconds>report.maxLoopSeconds)report.maxLoopSeconds=seconds;}}
      else{if(!processOneShot(srcPath,path.join(root,job.out))){report.failed.push({id:entry.id,file:job.srcFile,error:'oneshot-encode-failed'});ok=false;}else{report.oneShots++;measured.push({...job,loop:false});}}
    }
    if(!ok)continue;
    if(entry.type==='loop set'){
      entry.parts=entry.parts.map(part=>{const m=measured.find(x=>x.part===part);const o={id:part.id,file:m?m.out:null,type:part.type};if(part.type==='loop'&&m){o.loopStart=0;o.loopEnd=Math.round(m.seconds*1000)/1000;}return o;});
      entry.registered=entry.parts.every(p=>p.file);report.loopSets++;
    }else{
      entry.file=measured.find(m=>m.primary)?.out||null;
      entry.variations=measured.filter(m=>!m.primary).map(m=>m.out);
      if(entry.type==='loop'){const loopEnds=measured.filter(m=>m.loop).map(m=>m.seconds);entry.loopStart=0;entry.loopEnd=loopEnds.length?Math.round(Math.min(...loopEnds)*1000)/1000:null;}
      entry.registered=!!entry.file;report.processed++;
    }
  }
}
for(const e of entries){if(e.attributionRequired)report.attributionRequired.push(e.id);if(e.restrictions.length)report.restricted.push(e.id);if(/^SEAL_/.test(e.id))report.sealed++;if(!DRY&&e.registered)try{report.totalRuntimeBytes+=statSync(path.join(root,e.file)).size;}catch{}}
for(const e of entries){delete e._sources;}

// ---- emit manifest ----
const clean=entries.map(e=>{const o={id:e.id,bus:e.bus,type:e.type,category:e.category,gain:e.gain,pitchJitter:e.pitchJitter,maxVoices:e.maxVoices,priority:e.priority,loopStart:e.loopStart,loopEnd:e.loopEnd,variations:e.variations,parts:e.parts,file:e.file,expectedPath:e.expectedPath,registered:e.registered};if(e.reason)o.reason=e.reason;o.licenseClass=e.licenseClass;o.attributionRequired=!!e.attributionRequired;o.license=e.license;o.credit=e.credit;o.author=e.author;o.sourceSite=e.sourceSite;o.sourceUrl=e.sourceUrl;if(e.restrictions.length)o.restrictions=e.restrictions;return o;});
const src=`(function(){
  // RA AUDIO MANIFEST — schema 2.1. GENERATED by tools/audio-build.mjs from the approved RA_SFX_DELIVERY_v1.
  // Do not hand-edit: re-run the tool to regenerate. Callers use IDs only (docs/RA_Sound_Deployment_Plan_HQ.md).
  // \`file\`/\`parts\`/\`variations\` are runtime MP3 paths; unregistered entries (missing/defective) stay file:null and no-op.
  // License provenance is preserved per entry (license/licenseClass/credit/author/sourceSite/sourceUrl/restrictions).
  const BUS_DEFAULTS=${JSON.stringify(BUS_DEFAULTS)};
  const SCHEMA='2.1';
  const resident=${JSON.stringify(RESIDENT)};
  const scenes=${JSON.stringify(SCENES)};
  const rows=${JSON.stringify(clean,null,1)};
  const index=new Map(rows.map(entry=>[entry.id,entry]));
  function get(id){return index.get(id)||null}
  function list(){return rows.map(entry=>({...entry}))}
  function register(entry){if(!entry||!entry.id)return null;const existing=index.get(entry.id);const merged=existing?Object.assign(existing,entry):{...entry};if(!existing)index.set(merged.id,merged);return merged;}
  window.RAAudioManifest={schema:SCHEMA,busDefaults:{...BUS_DEFAULTS},resident:[...resident],scenes:JSON.parse(JSON.stringify(scenes)),ids:rows.map(entry=>entry.id),get,has:id=>index.has(id),list,register};
})();
`;
mkdirSync(path.dirname(MANIFEST),{recursive:true});
writeFileSync(MANIFEST,src,'utf8');
mkdirSync(path.dirname(REPORT),{recursive:true});
writeFileSync(REPORT,JSON.stringify(report,null,2),'utf8');
console.log(JSON.stringify({dry:DRY,entries:entries.length,processed:report.processed,loops:report.loops,oneShots:report.oneShots,loopSets:report.loopSets,sealed:report.sealed,failed:report.failed.length,runtimeMB:Math.round(report.totalRuntimeBytes/1e6*10)/10,maxLoopSeconds:Math.round(report.maxLoopSeconds*10)/10,attributionRequired:report.attributionRequired.length,restricted:report.restricted.length},null,2));
if(report.failed.length)console.log('FAILED:',JSON.stringify(report.failed.slice(0,20),null,1));
