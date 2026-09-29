#!/usr/bin/env node
// INTEGRATION-OWNER ONLY. Records the IF-1 public surface into tools/tests/if1/contract-v1.0.json.
// The snapshot only ever GROWS: this tool merges new members in and never removes one, because after freeze IF-1 changes are
// additive-only. (Removing a member requires a deliberate manual edit that will fail review.)
import {readFile,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {full} from './_lib.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
const file=path.join(path.dirname(fileURLToPath(import.meta.url)),'contract-v1.0.json');
const ctx=await full(root);const live=ctx.RAIF1.describe();
const old=existsSync(file)?JSON.parse(await readFile(file,'utf8')):{modules:{}};
const modules={...old.modules};
for(const [name,m] of Object.entries(live.modules)){const prev=old.modules[name]?.api||[];modules[name]={api:[...new Set([...prev,...m.api])].sort()};}
await writeFile(file,`${JSON.stringify({contract:'IF-1',version:'1.0',note:'Frozen public surface. A member listed here must exist; new members may be added (additive-only).',modules},null,1)}\n`);
console.log(`contract snapshot: ${Object.keys(modules).length} modules, ${Object.values(modules).reduce((n,m)=>n+m.api.length,0)} members`);
