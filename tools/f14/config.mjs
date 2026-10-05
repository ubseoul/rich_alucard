// F14-A — FCPB WHOLE-GAME QA HARNESS (infrastructure only). Shared constants and helpers.
//
// This tree is QA INFRASTRUCTURE. It reads the game (dist/ or a served URL), never edits it, and never owns UX/UI.
// It distinguishes three kinds of checklist item:
//   AUTOMATED          the harness can decide PASS/FAIL itself
//   MANUAL             a human must sign it off (the harness records the requirement)
//   PENDING_FRAGMENT   the route/content is not merged yet — reported, never a failure
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const SCHEMA=1;

// The status vocabulary used across the harness. Prefixed strings are deliberate: a missing route is PENDING_FRAGMENT,
// which is NOT the same as a failure and must never be counted as one.
export const STATUS=Object.freeze({
  AUTOMATED:'AUTOMATED',
  MANUAL:'MANUAL',
  PENDING_FRAGMENT:'PENDING_FRAGMENT'
});

export const RESULT=Object.freeze({
  PASS:'PASS',
  FAIL:'FAIL',
  PASSED:'PASSED',
  FAILED:'FAILED',
  PENDING_FRAGMENT:'PENDING_FRAGMENT',
  MANUAL:'MANUAL',
  SKIPPED:'SKIPPED'
});

// Campaign fragments whose routes the registry expects. A fragment that has not merged yet contributes only
// PENDING_FRAGMENT rows.
export const FRAGMENTS=Object.freeze(['F01','F02','F03','F04','F05','F06','F07']);

// Viewport matrix (mission minimum: 360/390/430 + a desktop sanity viewport). These are EVALUATION viewports: the
// harness reports clipping/overflow/inaccessible controls. It never changes presentation — Claude owns final UX/UI.
export const VIEWPORTS=Object.freeze([
  Object.freeze({id:'mobile-360',width:360,height:740,mobile:true}),
  Object.freeze({id:'mobile-390',width:390,height:844,mobile:true}),
  Object.freeze({id:'mobile-430',width:430,height:932,mobile:true}),
  Object.freeze({id:'desktop',width:1280,height:800,mobile:false})
]);

// Placeholder sentinels. These are deliberate machine markers, not the word "placeholder" in prose — a comment such as
// "RAPixel placeholders" must not trip the scan.
export const PLACEHOLDER_MARKERS=Object.freeze([
  '__PLACEHOLDER__','PLACEHOLDER_ASSET','PLACEHOLDER_ART','PLACEHOLDER_AUDIO','TODO_ASSET','FIXME_ASSET','MISSING_ASSET','RA_PLACEHOLDER'
]);

// File extensions the asset scanner treats as images/audio/document and probes for magic-byte decode.
export const IMAGE_EXT=Object.freeze(['.png','.jpg','.jpeg','.gif','.webp']);
export const AUDIO_EXT=Object.freeze(['.mp3','.ogg','.wav','.m4a']);
export const SCAN_TEXT_EXT=Object.freeze(['.js','.mjs','.html','.css','.json']);

export const sha256=text=>createHash('sha256').update(text).digest('hex');
// Canonical JSON with stable key order, so a bundle fingerprint is reproducible across runs.
export function stableStringify(value){
  const walk=value=>{
    if(Array.isArray(value))return value.map(walk);
    if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,walk(value[k])]));
    return value;
  };
  return JSON.stringify(walk(value));
}
export function gitCommit(root){
  try{return execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();}catch(e){return 'unknown';}
}
export function gitBranch(root){
  try{return execFileSync('git',['rev-parse','--abbrev-ref','HEAD'],{cwd:root,encoding:'utf8'}).trim();}catch(e){return 'unknown';}
}
export const nowIso=()=>new Date().toISOString();
// A short, human-readable id for a finding.
export const findingId=(kind,seed='')=>`${kind}${seed?`-${sha256(String(seed)).slice(0,8)}`:''}`;
