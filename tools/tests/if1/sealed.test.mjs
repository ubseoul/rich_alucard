// §2 SEALED MIRROR ARCHITECTURE: leak protection for OPEN trees/artifacts, and the private-overlay builder with an EMPTY pack.
// Nothing sealed is imported: every "sealed" payload here is a synthetic neutral placeholder created inside a temp directory.
import assert from 'node:assert/strict';
import {cp,mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {game,load,same} from './_lib.mjs';

const write=async(file,text)=>{await mkdir(path.dirname(file),{recursive:true});await writeFile(file,text);};
export async function test(root){
  const leak=await load(root,'tools/leak-check.mjs'),overlay=await load(root,'tools/overlay.mjs');
  // ---- the real OPEN tree is clean, and the OPEN game runs with the sealed pack EMPTY
  const rules=await leak.loadRules(root);const real=await leak.checkTree({root});assert(real.ok,`real tree leak: ${JSON.stringify(real.violations)}`);
  {const c=await game(root);assert.equal(c.RASealed.installed(),false,'OPEN build: sealed pack is empty');assert.equal(c.RASealed.fire('S01',{}),null,'sealed hooks are safe no-ops');assert.equal(typeof c.RASealed.tuning('pressure').visible,'number','provisional engineering defaults keep OPEN lanes running');
   assert.equal(c.RAHeat.subscribePrivate(()=>{}),false,'private HEAT hook is inert in OPEN');}
  // ---- leak detection on a synthetic OPEN tree
  const tmp=await mkdtemp(path.join(os.tmpdir(),'raleak-'));
  try{
    const mk=async name=>{const dir=path.join(tmp,name);await mkdir(path.join(dir,'tools','if1'),{recursive:true});await cp(path.join(root,'tools','if1','leak-rules.json'),path.join(dir,'tools','if1','leak-rules.json'));
      await write(path.join(dir,'js','sealed','pack.js'),await readFile(path.join(root,'js','sealed','pack.js'),'utf8'));await write(path.join(dir,'js','systems','sealed.js'),'function install(){}window.RASealed={install};');
      await write(path.join(dir,'index.html'),'<!doctype html><!-- SEALED:OVERLAY:BEGIN -->\n<!-- SEALED:OVERLAY:END -->');await write(path.join(dir,'js','ok.js'),'window.x=1;');return dir;};
    const clean=await mk('clean');assert((await leak.checkTree({root:clean})).ok,'synthetic clean tree passes');
    const cases=[
      ['forbidden-path',async d=>write(path.join(d,'private_overlay','overlay.json'),'{}')],
      ['forbidden-path',async d=>write(path.join(d,'assets','sealed','a.png'),'x')],
      ['forbidden-path',async d=>write(path.join(d,'js','sealed','extra.js'),'x')],
      ['sealed-slot-not-empty',async d=>write(path.join(d,'js','sealed','pack.js'),'window.RASealed.install({tuning:{}});')],
      ['sealed-install-call',async d=>write(path.join(d,'js','leaky.js'),'RASealed.install({adventures:[]});')],
      ['overlay-slot-not-empty',async d=>write(path.join(d,'index.html'),'<!-- SEALED:OVERLAY:BEGIN -->\n<script src="js/x.js"></script>\n<!-- SEALED:OVERLAY:END -->')]
    ];
    for(const [rule,mutate] of cases){const d=await mk(`case-${rule}-${Math.random().toString(36).slice(2,7)}`);await mutate(d);const r=await leak.checkTree({root:d});assert(!r.ok&&r.violations.some(v=>v.rule===rule),`leak check must catch ${rule}`);}
    // HQ-private mode permits ONLY the private_overlay/ directory (never on artifacts, never the sealed slot / assets/sealed)
    {const d=await mk('hq');await write(path.join(d,'private_overlay','overlay.json'),'{}');assert(!(await leak.checkTree({root:d,hqPrivate:false})).ok,'public: overlay dir forbidden');assert((await leak.checkTree({root:d,hqPrivate:true})).ok,'HQ-private: overlay dir allowed');
     await write(path.join(d,'assets','sealed','a.png'),'x');assert(!(await leak.checkTree({root:d,hqPrivate:true})).ok,'HQ-private still forbids assets/sealed in the source tree');}
    // private denylist: hits are reported WITHOUT echoing the matched text (so a log can't itself leak)
    const secret='zx-neutral-canary-4471';const d=await mk('deny');await write(path.join(d,'js','doc.js'),`// ${secret} appears here\nwindow.y=2;`);
    const denied=await leak.checkTree({root:d,denylist:{literals:[secret],regex:['canary-\\d+'],sha256Tokens:[leak.sha256(secret)]}});
    assert(!denied.ok);same([...new Set(denied.violations.map(v=>v.detail))].sort(),['literal#0','regex#0','token']);assert(!JSON.stringify(denied.violations).includes(secret),'a denylist hit never echoes the matched text');
    assert((await leak.checkTree({root:clean,denylist:{literals:[secret]}})).ok,'no hit -> clean');
    // ---- overlay builder on a synthetic OPEN artifact
    const dist=path.join(tmp,'dist');await write(path.join(dist,'index.html'),'<!doctype html>\r\n<script src="js/a.js?v=ra-1"></script>\r\n<!-- SEALED:OVERLAY:BEGIN -->\r\n<!-- SEALED:OVERLAY:END -->\r\n');
    await write(path.join(dist,'js','a.js'),'a');await write(path.join(dist,'js','sealed','pack.js'),await readFile(path.join(root,'js','sealed','pack.js'),'utf8'));await write(path.join(dist,'build.json'),JSON.stringify({schemaVersion:1,releaseId:'ra-1',commit:'c0ffee',assetVersion:'ra-1'}));await write(path.join(dist,'assets','b.png'),'png');
    const empty=path.join(tmp,'ov-empty');await write(path.join(empty,'overlay.json'),JSON.stringify({schema:1,id:'t',files:[],scripts:[]}));
    const out=path.join(tmp,'dist-private');const m=await overlay.buildOverlay({overlayDir:empty,dist,out});
    assert.equal(m.empty,true);const v=await overlay.verifyOverlay({dist,out});assert(v.ok,`empty pack build must equal OPEN: ${v.problems.join('; ')}`);
    assert.equal(await readFile(path.join(out,'index.html'),'utf8'),await readFile(path.join(dist,'index.html'),'utf8'),'EMPTY overlay leaves index.html byte-identical');
    assert.equal(JSON.parse(await readFile(path.join(out,'overlay-build.json'),'utf8')).empty,true);
    // a synthetic non-empty overlay: payload lands under the allowed roots, slot filled, OPEN files untouched, log names nothing
    const full=path.join(tmp,'ov-full');await write(path.join(full,'files','x.js'),'window.__payload=1;');await write(path.join(full,'files','pack.js'),'window.__slot=1;');await write(path.join(full,'files','s.png'),'img');
    await write(path.join(full,'overlay.json'),JSON.stringify({schema:1,id:'t2',files:[{from:'files/x.js',to:'js/sealed/x.js'},{from:'files/pack.js',to:'js/sealed/pack.js'},{from:'files/s.png',to:'assets/sealed/s.png'}],scripts:['js/sealed/x.js']}));
    const m2=await overlay.buildOverlay({overlayDir:full,dist,out});assert.equal(m2.fileCount,3);const v2=await overlay.verifyOverlay({dist,out});assert(v2.ok,v2.problems.join('; '));
    const idx=await readFile(path.join(out,'index.html'),'utf8');assert(idx.includes('<script src="js/sealed/x.js?v=ra-1"></script>'));assert.equal(await readFile(path.join(out,'js','sealed','pack.js'),'utf8'),'window.__slot=1;','the empty slot may be replaced');
    assert.equal(await readFile(path.join(dist,'js','sealed','pack.js'),'utf8'),await readFile(path.join(root,'js','sealed','pack.js'),'utf8'),'the OPEN dist is never modified');
    // ...and the private artifact is (correctly) NOT an OPEN artifact: the leak check flags it, the OPEN artifact stays clean
    assert((await leak.checkTree({root:tmp,dist:'dist',rules})).ok,'OPEN artifact is clean');assert(!(await leak.checkTree({root:tmp,dist:'dist-private',rules})).ok,'a private artifact is detected if it is ever mistaken for OPEN');
    // tamper detection
    await writeFile(path.join(out,'js','a.js'),'tampered');assert(!(await overlay.verifyOverlay({dist,out})).ok,'altered OPEN file detected');
    // overlay validation
    const bad=o=>overlay.validateOverlay({schema:1,id:'x',files:[],scripts:[],...o});
    assert(bad({files:[{from:'../x',to:'js/sealed/x.js'}]}).some(p=>/traversal/.test(p)));assert(bad({files:[{from:'a',to:'js/game.js'}]}).some(p=>/outside/.test(p)));assert(bad({files:[{from:'a',to:'js/sealed/../game.js'}]}).some(p=>/traversal/.test(p)));
    assert(bad({files:[{from:'a',to:'js/sealed/a.js'},{from:'b',to:'js/sealed/a.js'}]}).some(p=>/duplicate/.test(p)));assert(bad({scripts:['js/sealed/none.js']}).some(p=>/script #0/.test(p)));assert(overlay.validateOverlay({schema:2}).length>0);
    {const d=path.join(tmp,'ov-clobber');await write(path.join(d,'files','x'),'x');await write(path.join(dist,'assets','sealed','keep.png'),'keep');await write(path.join(d,'overlay.json'),JSON.stringify({schema:1,id:'c',files:[{from:'files/x',to:'assets/sealed/keep.png'}],scripts:[]}));
     await assert.rejects(()=>overlay.buildOverlay({overlayDir:d,dist,out:path.join(tmp,'out-clobber')}),/may not replace an existing OPEN artifact file/);}
  }finally{await rm(tmp,{recursive:true,force:true});}
  console.log('PASS IF-1 sealed architecture (OPEN runs with empty pack; leak check catches forbidden paths/dirty slot/install calls/overlay slot/denylist without echo; overlay builder: empty pack == OPEN, payload confined to sealed roots, OPEN dist untouched, tamper + traversal rejected)');
}
