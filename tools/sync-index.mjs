#!/usr/bin/env node
// Regenerates the generated <script> region of index.html. Since IF-1 (F00) the ordered script list is owned by
// js/loader/manifest.json (tools/loader.mjs); the BTF content block inside it is still expanded from
// js/btf_content.js (single source of truth for BTF adventure/content files). This file keeps its historical API.
import {fileURLToPath} from 'node:url';
import {btfFiles,expectedIndex as loaderExpectedIndex,sync} from './loader.mjs';
export async function contentFiles(){return btfFiles('js/btf_content.js');}
export function block(files){return ['<!-- BTF:CONTENT:BEGIN -->',...files.map(f=>`<script src="${f}?v=__BUILD_ASSET_VERSION__"></script>`),'<!-- BTF:CONTENT:END -->'].join('\n');}
export async function expectedIndex(){return loaderExpectedIndex();}
if(process.argv[1]===fileURLToPath(import.meta.url)){await sync();console.log('index.html loader block synced');}
