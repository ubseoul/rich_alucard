#!/usr/bin/env node
// Representative MID-LIFE v12 save fixtures (Engineering 06), produced by real simulated lives (tools/pilot/coverage-sim.mjs:
// real route surfaces, declared legacy seeds only) — never hand-assembled. Regenerate after content changes that alter
// save shape; the gate (tools/pilot/fixtures-test.mjs) proves every fixture migrates idempotently and keeps living.
import {writeFile,mkdir} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {live} from './coverage-sim.mjs';
const dir=path.join(path.dirname(fileURLToPath(import.meta.url)),'fixtures');await mkdir(dir,{recursive:true});
const PLAN=[['midlife-explorer-day12','explorer',12,1],['midlife-host-day24','host',24,2],['latelife-landlord-day33','landlord',33,1],['latelife-party-day34','party',34,2]];
for(const [name,persona,days,seed] of PLAN){const r=await live(persona,{days,seed,keepState:true});
 await writeFile(path.join(dir,`${name}.json`),JSON.stringify({about:`${persona} life, seed ${seed}, ${days} days through real route surfaces (declared seeds: ${r.seeds.map(s=>s.seed).join(', ')||'none'})`,generatedFrom:'tools/pilot/make-fixtures.mjs',save:r.state})+'\n');
 console.log(name,`day ${r.state.life.world.day}`,`${JSON.stringify(r.state).length} bytes`,`${Object.keys(r.completed).length} adventures`);}
