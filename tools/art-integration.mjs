#!/usr/bin/env node
// Frozen-art integration matrix + release-gate checks.
// The matrix is GENERATED from the live runtime (RAEnvironments, RABtfPeople, adventure content, Combat 2.0 data,
// runtime code references) against the generated Art Registry, plus the authored reviewer record in
// tools/art-integration/review.json. Spoiler-safe: ids, screen keys, statuses and generic notes only.
// Usage: node tools/art-integration.mjs            (write docs/art_integration/INTEGRATION_MATRIX.json)
//        import {test} for the release gate
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {expectedRegistry} from './art-registry.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const MATRIX='docs/art_integration/INTEGRATION_MATRIX.json';
const eol=text=>text.replace(/\r\n/g,'\n');
// Same role mapping as js/scenes/combat2.js (approved frozen combat states by fight event).
const COMBAT_STATES={telegraph:['telegraph'],strike:['strike','attack'],hit:['hit'],defeated:['defeated','poof']};

async function runtimeSources(dir){const out=[];for(const e of await readdir(path.join(root,dir),{withFileTypes:true})){const rel=path.posix.join(dir,e.name);
 if(e.isDirectory()){if(e.name!=='sealed')out.push(...await runtimeSources(rel))}else if(/\.(js|css|html)$/.test(e.name)&&!/presentation_assets\.js|art_registry\.js/.test(e.name))out.push(rel)}return out}

export async function buildMatrix(){
 const {loadBtf}=await import('./btf-test.mjs'),{dryRun,combatDryRun}=await import('./presentation-adventure-dryrun.mjs');
 const ctx=await loadBtf(root);
 const R=ctx.RAArtRegistry,review=JSON.parse(await readFile(path.join(root,'tools/art-integration/review.json'),'utf8'));
 const register=Object.fromEntries(JSON.parse(await readFile(path.join(root,'art_department/ASSET_REGISTER.json'),'utf8')).assets.map(a=>[a.path,a]));
 const code=(await Promise.all([...await runtimeSources('js'),'game.js','style.css','index.html'].map(f=>readFile(path.join(root,f),'utf8')))).join('\n');
 const envs=ctx.RAEnvironments.all(),people=[ctx.RABtfPeople.rich,...ctx.RABtfPeople.list];
 const content=(await Promise.all((await readdir(path.join(root,'js/data/btf/adventures'))).map(f=>readFile(path.join(root,'js/data/btf/adventures',f),'utf8')))).join('\n');
 const usedStates=new Set([...content.matchAll(/\{id:'([a-z_0-9]+)',state:'([a-z_0-9]+)'\}/g)].map(m=>`${m[1]}.${m[2]}`));
 for(const e of Object.values(ctx.RACombatData?.ENEMIES||{})){const p=ctx.RABtfPeople.get(e.person);for(const names of Object.values(COMBAT_STATES)){const n=names.find(x=>p?.states?.[x]);if(n)usedStates.add(`${e.person}.${n}`)}}
 const assets=[];const row=(pathName,kind,id,status,where=[],note=null)=>assets.push({path:pathName,kind,id,status,runtime:where,...(note?{note}:{})});
 for(const file of Object.keys(R.assets)){
  const reviewed=review.assets[file];
  const env=Object.entries(R.environments).find(([,e])=>e.asset===file||Object.values(e.layers||{}).includes(file));
  if(env){const users=envs.filter(e=>e.image===file||(e.layers||[]).includes(file)).map(e=>e.id);row(file,env[1].asset===file?'environment':'environment-layer',env[0],users.length?'FROZEN + ALREADY INTEGRATED':'FROZEN + READY TO INTEGRATE',users);continue}
  const sheet=Object.entries(R.sheets).find(([,p])=>p===file);if(sheet){row(file,'handoff-sheet',sheet[0],'HANDOFF SHEET (placement uses individual masters)');continue}
  const ch=Object.entries(R.characters).find(([,c])=>Object.values(c.states).includes(file));
  if(ch){const [cid,c]=ch,state=Object.entries(c.states).find(([,p])=>p===file)[0],person=people.find(p=>p.id===cid),isAnchor=c.anchor===file;
   if(isAnchor){row(file,'character-anchor',cid,person?.sprite===file?'FROZEN + ALREADY INTEGRATED':'FROZEN + READY TO INTEGRATE',person?.sprite===file?[`person:${cid}`]:[]);continue}
   const key=`${cid}.${state}`,r=review.states[key];
   row(file,'character-state',key,usedStates.has(key)?'FROZEN + ALREADY INTEGRATED':(r?.status||'FROZEN STATE AVAILABLE'),usedStates.has(key)?[`state:${key}`]:[],usedStates.has(key)?null:r?.note||null);continue}
  const cr=Object.entries(R.creatures).find(([,c])=>c.anchor===file);if(cr){const person=people.find(p=>p.id===cr[0]);row(file,'creature',cr[0],person?.sprite===file?'FROZEN + ALREADY INTEGRATED':'FROZEN + READY TO INTEGRATE',person?.sprite===file?[`person:${cr[0]}`]:[]);continue}
  const kind=file.includes('/vehicles/')?'vehicle':file.includes('/ui/')?'ui-icon':file.includes('/props/')?'prop':'other';
  row(file,kind,path.basename(file,'.png'),code.includes(file)?'FROZEN + ALREADY INTEGRATED':(reviewed?.status||'FROZEN + READY TO INTEGRATE'),code.includes(file)?['code']:[],reviewed?.note||null);
 }
 // Runtime demand without frozen art (derived) + reviewer classification.
 const demand=[];
 for(const e of envs)if(e.placeholder)demand.push({kind:'environment',id:e.id,status:'NO APPROVED ART YET'});
 for(const p of people)if(!p.sprite)demand.push({kind:'person',id:p.id,status:review.people[p.id]?.status||'NO APPROVED ART YET',...(review.people[p.id]?.note?{note:review.people[p.id].note}:{})});
 // Screens: every adventure screen and Combat 2.0 fight, with final-art status.
 const dr=await dryRun(),cr=await combatDryRun(),screens={};
 const placeholderEnv=id=>!!ctx.RAEnvironments.get(id)?.placeholder;
 const hasArt=spec=>{const id=typeof spec==='string'?spec:spec?.id;if(!id)return true;const p=id==='rich'?ctx.RABtfPeople.rich:ctx.RABtfPeople.get(id);return !!p?.sprite};
 for(const r of dr.rows){const missing=Object.values(r.castSpecs).filter(s=>s&&!hasArt(s)).length,a=review.screens[r.key];
  const status=placeholderEnv(r.env)?'HOLD (placeholder environment)':missing?'HOLD (mixed: unresolved cast art)':a?.status||(r.exception?'HOLD':'PASS (final art)');
  screens[r.key]={status,profile:r.profile,lint:r.pass?'pass':r.exception?`exception ${r.exception}`:'fail',...(a?.ticket||r.exception?{ticket:a?.ticket||r.exception}:{})}}
 for(const r of cr.rows){const key=`combat:${r.key}`,a=review.screens[key],env=placeholderEnv(r.env);
  screens[key]={status:env?'HOLD (placeholder environment)':r.placeholderEnemy?'HOLD (mixed: unresolved cast art)':a?.status||'PASS (final art)',profile:'combat',lint:r.pass?'pass':'fail',states:r.states,...(a?.ticket?{ticket:a.ticket}:{})}}
 for(const key of Object.keys(review.screens))assert.ok(screens[key],`review.json names unknown screen ${key}`);
 const count=(list,f)=>list.reduce((m,x)=>{const k=f(x);m[k]=(m[k]||0)+1;return m},{});
 const bucket=s=>s.startsWith('PASS')?'PASS':s.startsWith('HOLD')?'HOLD':s;
 return {about:'GENERATED by tools/art-integration.mjs — frozen ART SHIP 004–007 corpus vs the live runtime. Do not edit by hand; reviewer decisions live in tools/art-integration/review.json.',
  summary:{frozenFiles:assets.length,assets:count(assets,a=>a.status),demand:count(demand,d=>`${d.kind}: ${d.status}`),screens:count(Object.values(screens),s=>bucket(s.status))},
  assets:assets.sort((a,b)=>a.path.localeCompare(b.path)),demand,screens:Object.fromEntries(Object.entries(screens).sort(([a],[b])=>a.localeCompare(b)))};
}
export async function expectedMatrix(){return JSON.stringify(await buildMatrix(),null,1)+'\n'}

export async function test(){
 assert.equal(eol(await readFile(path.join(root,'js/data/art_registry.js'),'utf8')),eol(await expectedRegistry()),'js/data/art_registry.js is stale — run node tools/art-registry.mjs');
 const {loadBtf}=await import('./btf-test.mjs'),ctx=await loadBtf(root),R=ctx.RAArtRegistry;
 const register=Object.fromEntries(JSON.parse(await readFile(path.join(root,'art_department/ASSET_REGISTER.json'),'utf8')).assets.map(a=>[a.path,a]));
 // Every runtime environment/actor path resolves to a registered asset; registry-resolved art must be FROZEN.
 const paths=[...ctx.RAEnvironments.all().flatMap(e=>[e.image,...(e.layers||[])]),...[ctx.RABtfPeople.rich,...ctx.RABtfPeople.list].flatMap(p=>[p.sprite,p.spriteVampire,...Object.values(p.states||{})])].filter(Boolean);
 for(const p of paths){assert.ok(register[p],`runtime art ${p} is not in ASSET_REGISTER.json`);assert.ok(!/REJECTED/.test(register[p].status),`runtime art ${p} is rejected`);if(R.assets[p])assert.equal(register[p].status,'FROZEN',`${p} must be FROZEN`)}
 for(const e of ctx.RAEnvironments.all())if(e.frozen)assert.ok(R.environments[e.art]?.asset===e.image,`${e.id} frozen art does not come from the registry`);
 for(const p of paths)assert.ok(!/sealed|hq_only/i.test(p),`runtime art ${p} crosses the SEALED/HQ-only boundary`);
 // No handoff sheet is ever a runtime source.
 const sheets=new Set(Object.values(R.sheets));for(const p of paths)assert.ok(!sheets.has(p),`${p} is a handoff sheet, not a runtime source`);
 // Every state named by content exists as an approved frozen state.
 const content=(await Promise.all((await readdir(path.join(root,'js/data/btf/adventures'))).map(f=>readFile(path.join(root,'js/data/btf/adventures',f),'utf8')))).join('\n');
 for(const m of content.matchAll(/\{id:'([a-z_0-9]+)',state:'([a-z_0-9]+)'\}/g)){if(m[2]==='vampire')continue;const p=m[1]==='rich'?ctx.RABtfPeople.rich:ctx.RABtfPeople.get(m[1]);assert.ok(p?.states?.[m[2]],`content asks for ${m[1]}@${m[2]}, which has no approved frozen state`)}
 assert.equal(eol(await readFile(path.join(root,MATRIX),'utf8')),eol(await expectedMatrix()),`${MATRIX} is stale — run node tools/art-integration.mjs`);
 const m=JSON.parse(await readFile(path.join(root,MATRIX),'utf8'));
 console.log(`PASS art integration (registry ${Object.keys(R.assets).length} frozen files, ${paths.length} runtime art refs resolve to the register, matrix: ${JSON.stringify(m.summary.screens)})`);
}

if(process.argv[1]===fileURLToPath(import.meta.url)){await mkdir(path.join(root,'docs/art_integration'),{recursive:true});await writeFile(path.join(root,MATRIX),await expectedMatrix());const m=JSON.parse(await readFile(path.join(root,MATRIX),'utf8'));console.log(JSON.stringify(m.summary,null,1));}
