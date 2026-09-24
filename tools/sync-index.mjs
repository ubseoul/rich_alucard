#!/usr/bin/env node
// Regenerates the BTF content <script> block in index.html from js/btf_content.js (single source of truth).
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function contentFiles(){const ctx={window:{}};vm.createContext(ctx);vm.runInContext(await readFile(path.join(root,'js/btf_content.js'),'utf8'),ctx);return [...ctx.window.RABtfContentFiles];}
export function block(files){return ['<!-- BTF:CONTENT:BEGIN -->',...files.map(f=>`<script src="${f}?v=__BUILD_ASSET_VERSION__"></script>`),'<!-- BTF:CONTENT:END -->'].join('\n');}
export async function expectedIndex(){const index=await readFile(path.join(root,'index.html'),'utf8');return index.replace(/<!-- BTF:CONTENT:BEGIN -->[\s\S]*<!-- BTF:CONTENT:END -->/,block(await contentFiles()));}
if(process.argv[1]===fileURLToPath(import.meta.url)){await writeFile(path.join(root,'index.html'),await expectedIndex());console.log('index.html BTF block synced');}
