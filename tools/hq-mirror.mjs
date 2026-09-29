#!/usr/bin/env node
// PRIVATE HQ MIRROR helper (F00). Documents and checks the public/private branch structure. It only READS git state; every
// push is a deliberate manual step for the integration owner (commands printed by `plan`).
//
//   PUBLIC  (origin)   integration/ube-portal        OPEN content only; never receives private history or overlay files
//   PRIVATE (private)  integration/ube-portal        exact mirror of the public OPEN tip (fast-forward only)
//                      hq/integration                = integration/ube-portal + private commits (the sealed overlay dir)
//   Direction of flow: OPEN -> private mirror -> hq/integration (merge). NEVER private -> public.
//
//   node tools/hq-mirror.mjs status [--public origin] [--private private]
//   node tools/hq-mirror.mjs plan
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkTree} from './leak-check.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const git=(...args)=>{try{return execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch(e){return null;}};
const arg=(n,d)=>{const i=process.argv.indexOf(n);return i===-1?d:process.argv[i+1];};
export const BRANCHES={open:'integration/ube-portal',hq:'hq/integration'};
const PUBLIC=arg('--public','origin'),PRIVATE=arg('--private','private');

function status(){
  const out=[];let ok=true;const line=(pass,text)=>{out.push(`${pass?'PASS':'FAIL'} ${text}`);if(!pass)ok=false;};
  const remotes=Object.fromEntries((git('remote','-v')||'').split('\n').filter(l=>l.endsWith('(push)')).map(l=>{const [n,u]=l.split(/\s+/);return [n,u];}));
  line(!!remotes[PUBLIC],`public remote "${PUBLIC}" configured`);line(!!remotes[PRIVATE],`private remote "${PRIVATE}" configured`);
  if(remotes[PUBLIC]&&remotes[PRIVATE])line(remotes[PUBLIC]!==remotes[PRIVATE],'public and private remotes are different repositories');
  const openLocal=git('rev-parse','--verify',BRANCHES.open),openPublic=git('rev-parse','--verify',`${PUBLIC}/${BRANCHES.open}`),openPrivate=git('rev-parse','--verify',`${PRIVATE}/${BRANCHES.open}`),hq=git('rev-parse','--verify',`${PRIVATE}/${BRANCHES.hq}`);
  line(!!openLocal,`local ${BRANCHES.open} exists${openLocal?` (${openLocal.slice(0,8)})`:''}`);
  if(openLocal&&openPublic)line(openLocal===openPublic,`public ${BRANCHES.open} == local (${openPublic.slice(0,8)})`);
  if(openLocal&&openPrivate)line(openLocal===openPrivate,`private mirror ${BRANCHES.open} == public tip (${openPrivate.slice(0,8)})`);else if(remotes[PRIVATE])line(false,`private mirror ${BRANCHES.open} not pushed yet`);
  if(hq&&openLocal)line(git('merge-base','--is-ancestor',openLocal,hq)!==null&&git('merge-base',openLocal,hq)===openLocal,`${BRANCHES.hq} contains the OPEN tip (mirror up to date)`);else if(remotes[PRIVATE])line(false,`private ${BRANCHES.hq} not created yet`);
  // the PUBLIC branch must never contain the overlay or a non-empty sealed slot
  return checkTree({root}).then(r=>{line(r.ok,`OPEN tree leak check (${r.filesScanned} files)`);if(!r.ok)for(const v of r.violations)out.push(`     LEAK ${v.rule}: ${v.file}`);
    if(openPublic&&hq)line(git('merge-base','--is-ancestor',hq,openPublic)===null,'public tip does not contain hq/integration (private never flows to public)');
    console.log(out.join('\n'));return ok;});
}
const PLAN=`# PRIVATE HQ MIRROR — integration owner procedure (run from the F00/integration worktree)
git remote add private https://github.com/ubseoul/rich_alucard_private.git      # once
git push origin integration/ube-portal                                            # PUBLIC: OPEN only (leak check must PASS first)
git push private integration/ube-portal                                           # PRIVATE mirror: same SHA, fast-forward only
git push private --tags                                                           # lineage tags (legacy/*, if1-*)
# private HQ branch = OPEN tip + private commits (the overlay directory, conventionally private_overlay/)
git switch -c hq/integration integration/ube-portal                               # first time; afterwards: git switch hq/integration
git merge --no-ff integration/ube-portal                                          # every time OPEN advances
node tools/overlay.mjs init-empty --dir private_overlay && git add -f private_overlay && git commit -m "HQ: empty private overlay"
git push private hq/integration                                                   # NEVER push hq/integration to origin
# private build: OPEN trunk + overlay = complete private build
npm run build && node tools/overlay.mjs build --overlay private_overlay           # -> dist-private/ (git-ignored)
`;
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const cmd=process.argv[2];
  if(cmd==='plan')console.log(PLAN);
  else if(cmd==='status'){process.exitCode=(await status())?0:1;}
  else{console.error('Usage: node tools/hq-mirror.mjs <status|plan>');process.exitCode=2;}
}
