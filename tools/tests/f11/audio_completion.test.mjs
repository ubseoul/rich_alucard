// F11 — PATCH SOUND INGEST + ENGINEERING WIRING (frag/audio-completion/001).
// Verifies the accepted F11-A source masters became usable by the OPEN game: runtime derivatives exist and decode,
// every F11 id resolves, no id/runtime-path collision, the accepted F1 library is untouched, the two former legacy
// gaps are restored, MAGIC_SEANCE stays inert, and absent consumers / no user gesture never throw.
import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sandbox,run,same} from '../if1/_lib.mjs';

const NO=['NO_01','NO_02','NO_03','NO_04','NO_05','NO_06'];
const TR=['TR_01','TR_02','TR_03','TR_04','TR_05','TR_06'];
const GN=['GN_01','GN_02','GN_03','GN_04','GN_05','GN_06'];
const RM=['RM_01','RM_02','RM_03','RM_04','RM_05','RM_06','RM_07','RM_08'];
const BX=['BX_SLIDEIN_IDLE','BX_NAMECARD_SLAM','BX_POD_REVEAL','BX_OVERWATCH','BX_COVER_HIT','BX_DOWNED','BX_GONE','BX_WARROOM','BX_CRATE'];
const LEGACY=['DRAGON_WINGS','BARS_PUNCHLINE'];
const F11=[...NO,...TR,...GN,...RM,...BX,...LEGACY];
const LOOPS=new Set(['NO_01','NO_05','TR_01','TR_05','GN_03','RM_05','RM_07','BX_WARROOM']);
const VARIATIONS={NO_01:['NO_01__blip','NO_01__hum'],NO_04:['NO_04__pant'],BX_COVER_HIT:['BX_COVER_HIT__alt1']};
const catOf=id=>/^NO_/.test(id)?'new_oga':/^TR_/.test(id)?'trap':/^GN_/.test(id)?'iron_and_grace':/^RM_/.test(id)?'rainmaker':/^BX_/.test(id)?'showdown':'combat';
const rtPath=(id,leaf)=>`assets/audio/sfx/${catOf(id)}/${leaf||id}.mp3`;
const PART_FILES=['js/data/audio_manifest.js','js/data/audio/manifest_parts.js','js/data/audio/parts/F02_guns.js','js/data/audio/parts/F04_blood_x.js','js/data/audio/parts/F05_trap.js','js/data/audio/parts/F06_rainmaker.js'];

export async function test(root){
  await registrations(root);
  await assets(root);
  await collisions(root);
  await f1Untouched(root);
  await inert(root);
  await absenceSafe(root);
  await sourceProvenance(root);
  console.log('PASS F11 audio completion (37 ids registered, 41 runtime MP3s, no collisions, F1 untouched, legacy restored, MAGIC_SEANCE inert, no-gesture safe)');
}

async function manifest(root){
  const c=sandbox();await run(root,c,PART_FILES);
  return {ctx:c,M:c.RAAudioManifest,P:c.RAAudioParts};
}

function isMp3(file){
  const b=readFileSync(file);if(b.length<8)return false;
  if(b.slice(0,3).toString('latin1')==='ID3')return true;
  return b[0]===0xff&&(b[1]&0xe0)===0xe0; // MPEG audio frame sync
}

async function registrations(root){
  const {M,P}=await manifest(root);
  same(P.fragments(),['F02','F04','F05','F06'],'F11 registers exactly the four owning fragments');
  same(P.idsFor('F02'),GN);same(P.idsFor('F04'),BX);same(P.idsFor('F05'),TR);same(P.idsFor('F06'),RM);
  for(const id of F11){
    const e=M.get(id);assert(e,`${id} is not registered`);
    assert.equal(e.registered,true,`${id} must be registered`);
    assert.equal(e.file,rtPath(id),`${id} runtime path`);
    if(LOOPS.has(id)){assert.equal(e.type,'loop',`${id} is a loop`);assert(Number.isFinite(e.loopStart)&&Number.isFinite(e.loopEnd)&&e.loopEnd>0,`${id} has measured loop points`);}
    else assert.equal(e.type,'one-shot',`${id} is a one-shot`);
    same(e.variations||[],(VARIATIONS[id]||[]).map(l=>rtPath(id,l)),`${id} variations`);
  }
  // NO_05 / RM_07 / BX_NAMECARD_SLAM bus assignment follows the delivery manifest
  assert.equal(M.get('NO_05').bus,'AMBIENCE');assert.equal(M.get('NO_06').bus,'UI');
  assert.equal(M.get('RM_07').bus,'AMBIENCE');assert.equal(M.get('BX_NAMECARD_SLAM').bus,'UI');assert.equal(M.get('BX_WARROOM').bus,'AMBIENCE');
}

async function assets(root){
  const {M}=await manifest(root);
  // 1/2/3. every delivered source produced a runtime derivative that exists and decodes
  for(const id of F11){
    const e=M.get(id);const leaves=[id,...(e.variations||[]).map(v=>path.basename(v,'.mp3'))];
    for(const leaf of leaves){const f=path.join(root,rtPath(id,leaf));assert(existsSync(f),`missing runtime derivative ${rtPath(id,leaf)}`);assert(statSync(f).size>256,`runtime derivative too small: ${rtPath(id,leaf)}`);assert(isMp3(f),`not a decodable MP3: ${rtPath(id,leaf)}`);}
  }
  // 4. every registered id across the whole live registry resolves to a real file
  for(const e of M.list()){if(!e.registered)continue;for(const f of [e.file,...(e.variations||[]),...(e.parts||[]).map(p=>p.file)])if(f)assert(existsSync(path.join(root,f)),`registered entry ${e.id} points at a missing file: ${f}`);}
}

async function collisions(root){
  const {M,P}=await manifest(root);
  assert.equal(new Set(M.ids).size,M.ids.length,'duplicate logical id');
  const seen=new Map();
  for(const e of M.list())for(const f of [e.file,...(e.variations||[]),...(e.parts||[]).map(p=>p.file)])if(f){const k=f.toLowerCase();assert(!seen.has(k),`runtime-path collision ${f} (${e.id} vs ${seen.get(k)})`);seen.set(k,e.id);}
  const partIds=new Set(F11.filter(id=>!NO.includes(id)&&!LEGACY.includes(id)));
  for(const id of NO.concat(LEGACY))assert(!P.provenance().some(p=>p.ids.includes(id)),`${id} must be manifest-owned, not a fragment part`);
  assert(partIds.size===29);
}

async function f1Untouched(root){
  const {M}=await manifest(root);
  const f1=M.list().filter(e=>!/^NO_0[1-6]$/.test(e.id)&&!F11.includes(e.id)&&e.id!=='MAGIC_SEANCE');
  assert.equal(f1.length,241,'accepted F1 library is 241 ids');
  assert(f1.every(e=>e.registered),'every accepted F1 id still resolves');
  const tap=M.get('UI_TAP');assert.equal(tap.file,'assets/audio/sfx/ui_phone/UI_TAP.mp3');assert.equal(tap.registered,true);
  const car=M.get('CAR_I6_TURBO');assert.equal(car.type,'loop set');assert.equal(car.parts.length,3);assert(car.parts.every(p=>p.file));
}

async function inert(root){
  const {M}=await manifest(root);
  const e=M.get('MAGIC_SEANCE');assert(e,'MAGIC_SEANCE slot exists');assert.equal(e.registered,false);assert.equal(e.file,null);assert.equal(e.reason,'defective-render-do-not-wire');
}

async function absenceSafe(root){
  const {ctx,M}=await manifest(root);
  // No AudioContext / no user gesture in this sandbox: every playback call is a safe no-op, never a throw.
  ctx.document.getElementById=()=>null; // the engine's legacy <audio> element helpers expect a document lookup
  await run(root,ctx,['js/engine/audio.js']);
  const A=ctx.RAAudio;assert(A,'audio engine loaded');
  assert.equal(A.isUnlocked(),false,'never unlocks without a gesture');
  for(const id of [...F11,'MAGIC_SEANCE','NO_01','__NOT_A_REAL_ID__']){
    assert.equal(A.sfx(id),false,`sfx(${id}) is a safe no-op without a gesture`);
    assert.equal(A.loop(id),false,`loop(${id}) is a safe no-op without a gesture`);
  }
  // F11 part entries carry no flag gate: with every fragment flag OFF the registrations are still present and inert-safe.
  assert.equal(M.get('GN_01').file,rtPath('GN_01'));
}

async function sourceProvenance(root){
  const fixture=JSON.parse(await readFile(path.join(root,'tools/tests/f11/patch_sound_delivery.json'),'utf8'));
  assert.equal(fixture.count,41,'41 delivered source files inventoried');
  assert.equal(fixture.ids.length,37,'37 sourced ids');
  assert.equal(new Set(fixture.files.map(f=>f.file.toLowerCase())).size,41,'no accidental duplicate source filenames');
  for(const f of fixture.files){assert(/^[0-9a-f]{64}$/.test(f.sha256),`sha256 for ${f.file}`);assert(f.duration>0,`${f.file} has non-zero duration`);assert(f.channels===1||f.channels===2,`${f.file} channels`);assert(f.sampleRate===44100,`${f.file} sample rate`);}
  const src=process.env.PATCH_SOUND_FINDER_DELIVERY||'C:/Users/Ube/Downloads/PATCH_SOUND_FINDER_DELIVERY';
  if(existsSync(src))for(const f of fixture.files){const p=path.join(src,f.rel);assert(existsSync(p),`source master present: ${f.rel}`);assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),f.sha256,`source master hash unchanged: ${f.rel}`);}
}
