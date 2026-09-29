// IF-1 4N — script loader architecture: one ordered manifest, deterministic generated index.html region, dependency-order
// rules, fragment slots / art+audio part folders / fragment migrations expand in the right place, and bad integrations fail.
import assert from 'node:assert/strict';
import {cp,mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {load,same} from './_lib.mjs';

export async function test(root){
  const L=await load(root,'tools/loader.mjs');
  // ---- the real tree
  const real=await L.verify({quiet:true});assert(real.ok,`real loader must verify: ${real.problems.join('; ')}`);
  const list=await L.scriptList();assert.equal(new Set(list).size,list.length,'no script loads twice');
  const at=f=>list.indexOf(f);
  for(const [a,b] of [['js/if1/migrations.js','js/engine/state.js'],['js/engine/state.js','js/if1/wake_bus.js'],['js/systems/life_clock.js','js/if1/wake_bus.js'],['js/if1/combat2_ext.js','js/engine/combat2.js'],['js/data/art_registry.js','js/data/art/registry_parts.js'],['js/data/audio_manifest.js','js/data/audio/manifest_parts.js'],['js/if1/if1.js','js/engine/core.js'],['js/engine/core.js','game.js']])assert(at(a)>=0&&at(a)<at(b),`${a} before ${b}`);
  // every accepted script from the pre-F00 index.html still loads, in its original relative order
  const html=await readFile(path.join(root,'index.html'),'utf8').then(t=>t.replace(/\r\n/g,'\n'));
  const generated=[...html.matchAll(/<script src="([^"?]+)\?v=__BUILD_ASSET_VERSION__"><\/script>/g)].map(m=>m[1]);same(generated,list,'index.html script order == manifest expansion');
  const legacy=(await readFile(path.join(root,'tools','if1','legacy-script-order.json'),'utf8').then(JSON.parse));
  same(list.filter(f=>legacy.includes(f)),legacy,'accepted pre-F00 scripts keep their exact relative load order');
  // ---- analyze(): pure structural checks with synthetic manifests
  {const items=[{kind:'script',src:'a.js'},{kind:'script',src:'b.js'},{kind:'script',src:'a.js'}];
   const r=L.analyze({order:[['b.js','a.js'],['x.js','a.js']]},items,{exists:f=>f!=='b.js'});
   assert(r.problems.some(p=>/duplicate script a\.js/.test(p)));assert(r.problems.some(p=>/missing script file b\.js/.test(p)));assert(r.problems.some(p=>/references unloaded file/.test(p)));
   const ok=L.analyze({order:[['a.js','b.js']]},[{kind:'script',src:'a.js'},{kind:'script',src:'b.js'}],{exists:()=>true});assert.equal(ok.problems.length,0);
   assert(L.analyze({order:[['b.js','a.js']]},[{kind:'script',src:'a.js'},{kind:'script',src:'b.js'}],{exists:()=>true}).problems.some(p=>/must load before/.test(p)),'order rule violation detected');}
  // ---- a sandbox copy: fragment slot, fragment css, migrations glob, art/audio parts, overlay slot; then break it
  const tmp=await mkdtemp(path.join(os.tmpdir(),'raloader-'));
  try{
    await mkdir(path.join(tmp,'tools'),{recursive:true});await cp(path.join(root,'js'),path.join(tmp,'js'),{recursive:true});
    for(const f of ['index.html','party-dev.html','rave-review.html','minigame-lab.html','game.js'])await cp(path.join(root,f),path.join(tmp,f));
    await cp(path.join(root,'tools','loader.mjs'),path.join(tmp,'tools','loader.mjs'));
    const T=await import(`${pathToFileURL(path.join(tmp,'tools','loader.mjs')).href}?t=${Date.now()}`);
    const baseline=await T.scriptList();
    await mkdir(path.join(tmp,'js','frag','F02'),{recursive:true});await mkdir(path.join(tmp,'js','frag','F01'),{recursive:true});
    await writeFile(path.join(tmp,'js','frag','F01','a.js'),'/*a*/');await writeFile(path.join(tmp,'js','frag','F01','b.js'),'/*b*/');await writeFile(path.join(tmp,'js','frag','F01','migrations.js'),'/*m*/');await writeFile(path.join(tmp,'js','frag','F01','f.css'),'/*c*/');
    await writeFile(path.join(tmp,'js','frag','F01','manifest.json'),JSON.stringify({files:['js/frag/F01/a.js','js/frag/F01/b.js'],css:['js/frag/F01/f.css']}));
    await writeFile(path.join(tmp,'js','frag','F02','x.js'),'/*x*/');await writeFile(path.join(tmp,'js','frag','F02','manifest.json'),JSON.stringify({files:['js/frag/F02/x.js']}));
    await writeFile(path.join(tmp,'js','data','art','parts','F01_art.js'),'/*art*/');await writeFile(path.join(tmp,'js','data','audio','parts','F01_audio.js'),'/*audio*/');await writeFile(path.join(tmp,'js','data','audio','parts','F02_audio.js'),'/*audio2*/');
    const list2=await T.scriptList();const at2=f=>list2.indexOf(f);
    same(list2.filter(f=>!baseline.includes(f)),['js/frag/F01/migrations.js','js/data/art/parts/F01_art.js','js/data/audio/parts/F01_audio.js','js/data/audio/parts/F02_audio.js','js/frag/F01/a.js','js/frag/F01/b.js','js/frag/F02/x.js'].sort((a,b)=>at2(a)-at2(b)),'new files land in their slots');
    assert(at2('js/frag/F01/migrations.js')<at2('js/engine/state.js'),'fragment migrations load BEFORE state.js (they must be registered before the save loads)');
    assert(at2('js/data/art/parts/F01_art.js')>at2('js/data/art/registry_parts.js')&&at2('js/data/art/parts/F01_art.js')<at2('js/data/art_integration.js'),'art parts merge before dependants read the registry');
    assert(at2('js/data/audio/parts/F01_audio.js')<at2('js/data/audio/parts/F02_audio.js')&&at2('js/data/audio/parts/F01_audio.js')>at2('js/data/audio/manifest_parts.js'),'audio parts sorted, after the parts API');
    assert(at2('js/frag/F01/a.js')<at2('js/frag/F01/b.js')&&at2('js/frag/F01/b.js')<at2('js/frag/F02/x.js')&&at2('js/frag/F02/x.js')<at2('js/engine/core.js')&&at2('js/if1/if1.js')<at2('js/frag/F01/a.js'),'fragments: IF-1 first, fragment order F01<F02, before core');
    assert.equal((await T.verify({quiet:true})).ok,false,'a stale index.html is reported');
    await T.sync();const synced=await T.verify({quiet:true});assert(synced.ok,`after sync: ${synced.problems.join('; ')}`);
    const html2=await readFile(path.join(tmp,'index.html'),'utf8');assert(html2.includes('js/frag/F01/f.css?v=__BUILD_ASSET_VERSION__'),'fragment css lands in the head region');assert(html2.includes('<!-- SEALED:OVERLAY:BEGIN -->')&&html2.includes('<!-- SEALED:OVERLAY:END -->'),'overlay slot markers present');
    // a fragment may only list its own files
    await writeFile(path.join(tmp,'js','frag','F02','manifest.json'),JSON.stringify({files:['js/engine/state.js']}));await assert.rejects(()=>T.scriptList(),/may only list files under js\/frag\/F02/);
    await writeFile(path.join(tmp,'js','frag','F02','manifest.json'),JSON.stringify({files:['js/frag/F02/x.js']}));
    // an unregistered js file (a fragment that forgot its manifest) is caught
    await writeFile(path.join(tmp,'js','frag','F02','orphan.js'),'/*o*/');const orphan=await T.verify({quiet:true});assert(orphan.problems.some(p=>/not loaded by any page.*orphan\.js/.test(p)),'unlisted js files are flagged');
    await rm(path.join(tmp,'js','frag','F02','orphan.js'));
    // a bad manifest edit (duplicate) is caught
    const mf=JSON.parse(await readFile(path.join(tmp,'js','loader','manifest.json'),'utf8'));mf.entries.push('js/engine/state.js');await writeFile(path.join(tmp,'js','loader','manifest.json'),JSON.stringify(mf));
    assert((await T.verify({quiet:true})).problems.some(p=>/duplicate script js\/engine\/state\.js/.test(p)),'duplicate manifest entry caught');
  }finally{await rm(tmp,{recursive:true,force:true});}
  console.log(`PASS IF-1 loader (${list.length} scripts, manifest==index.html, legacy order preserved, slots/globs/css/overlay markers, dependency rules, duplicate/orphan/stale detection)`);
}
