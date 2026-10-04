#!/usr/bin/env node
// usage: node tools/rc2/dump.mjs <file-suffix>   — prints every N/S/R/RC/E box: line|fn|text
import {collect} from './text-audit.mjs';
const f=process.argv[2];
for(const r of (await collect()).filter(r=>r.file.endsWith(f)))console.log(`${r.line}|${r.fn}|${r.text}`);
