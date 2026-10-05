// F15 scene art (STOVE Y): the approved seven backgrounds, the cockroach and Granny Bing are wired to real, byte-verified files.
// Headless; the rendered result (placement, clearance, no console errors) is covered by tools/tests/f15/browser-check.mjs `art`.
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {boot} from './_lib.mjs';

const sha=b=>createHash('sha256').update(b).digest('hex');
const PKG='art_department/production/f15-date-scene-assets';
export async function test(root){
 const rd=f=>readFile(path.join(root,f)),json=async f=>JSON.parse(await rd(f));
 const man=await json('assets/f15/scene_art_manifest.json'),add=await json(`${PKG}/APPROVAL_ADDENDUM.json`),pkg=await json(`${PKG}/manifest.json`);

 // ---- every runtime asset is exactly what the manifest records; backgrounds / Granny are byte copies of approved bytes ----------------------
 for(const f of man.files){const b=await rd(f.path);assert.equal(b.length,f.bytes,`${f.path} size`);assert.equal(sha(b),f.sha256,`${f.path} sha256`);}
 const approved=Object.fromEntries([...pkg.approved_production.map(p=>[p.path,p.sha256]),...add.approved_files.map(p=>[p.path,p.sha256])]);
 const bg=man.files.filter(f=>f.path.startsWith('assets/f15/environments/'));assert.equal(bg.length,7,'seven backgrounds');
 for(const f of bg){const src=`${PKG}/production/${path.basename(f.path)}`;assert.equal(approved[src.replace(`${PKG}/`,'')],f.sha256,`${f.path} equals the approved production hash`);assert.ok((await rd(src)).equals(await rd(f.path)),`${f.path} byte-identical to the art package`);}
 const granny=man.files.find(f=>f.path.includes('granny_bing_neutral_calling_numbers'));assert.equal(granny.sha256,'6f042de972f6fe7fa89178095829ac44e96650cf7b067ad0004f2ca208ddf4ee','Granny Bing equals the frozen CGA-F2-032 hash');
 assert.deepEqual([granny.dimensions,granny.mode],[[80,96],'RGBA']);
 for(const l of (await rd('art_department/visual_a/granny_bing_cga_f2_032/SHA256SUMS.txt')).toString().trim().split(/\r?\n/)){const [h,p]=l.split(/\s+/);if(p.startsWith('assets/'))assert.equal(sha(await rd(p)),h,'Granny freeze-record SHA256SUMS');}
 const roach=man.files.find(f=>f.path.endsWith('spirit_of_uncle_bunmi_444x222.png'));
 assert.equal(roach.master_sha256,'2c1589a8214c8f3eda935f416e1808a83aa71ec3be1d4c3f4b8d29a0333aa783');assert.equal(sha(await rd(`${PKG}/production/spirit_of_uncle_bunmi_candidate_original.png`)),roach.master_sha256,'the cockroach master in the art package is unchanged');
 assert.deepEqual([roach.dimensions,roach.mode],[[444,222],'RGBA']);assert.ok(roach.derivative_partial_alpha_pixels>0&&roach.derivative_alpha_extrema[0]===0,'partial alpha survives');
 assert.equal(roach.master_touches_canvas_edge,roach.derivative_touches_canvas_edge,'the derivative adds no edge contact (no clipping)');
 console.log(`PASS F15 scene art assets (${man.files.length} files re-hashed; 7 backgrounds byte-identical to the approved package; Granny = frozen CGA-F2-032; cockroach master unchanged, derivative has partial alpha and no added clipping)`);

 // ---- the scenes use them: each F15 environment id resolves; art ids are image envs, the two art-less rooms stay placeholders ---------------------
 const c=await boot(root),E=c.RAEnvironments;
 const used=new Set();for(const f of ['roxy','rosalyn','emerald','dates'])for(const m of (await rd(`js/frag/F15/${f}.js`)).toString().matchAll(/env:'(f15_[a-z_]+)'/g))used.add(m[1]);
 for(const id of used)assert.ok(E.get(id),`environment ${id} is registered`);
 const art={f15_bing:'the_bing',f15_gym:'boxing_gym',f15_roxy_apartment:'roxy_apartment',f15_plenitude:'plenitude',f15_convention:'convention_hall',f15_rosalyn_apartment:'rosalyn_apartment',f15_rosalyn_apartment_dark:'rosalyn_apartment',f15_shrine:'shrine_auditorium'};
 for(const [id,file] of Object.entries(art)){const e=E.get(id);assert.equal(e.image,`assets/f15/environments/${file}_270x480.png`,id);assert.ok(!e.placeholder&&e.approved,`${id} is approved art, not a placeholder`);await access(path.join(root,e.image));}
 assert.equal(JSON.stringify(E.get('f15_rosalyn_apartment_dark').layers),'["assets/f15/layers/lights_off_270x480.png"]');assert.equal(E.get('f15_rosalyn_apartment').layers,undefined);
 for(const id of ['f15_library','f15_exam_hall'])assert.ok(E.get(id).placeholder,`${id} still a named placeholder (no approved art)`);
 for(const id of used)assert.ok(art[id]||['f15_library','f15_exam_hall'].includes(id),`${id} is accounted for`);
 const P=c.RABtfPeople.byId;assert.equal(P.granny_bing.sprite,'assets/before_the_fame/characters/granny_bing/cga_f2_032/granny_bing_neutral_calling_numbers_anchor_80x96_v1.png');
 assert.equal(P.spirit_of_uncle_bunmi.sprite,'assets/f15/characters/spirit_of_uncle_bunmi_444x222.png');
 const line=(await rd('js/data/presentation_assets.js')).toString().split(/\r?\n/).find(l=>l.includes(`"${P.spirit_of_uncle_bunmi.sprite}"`)),A=JSON.parse(line.slice(line.indexOf(':{')+1).replace(/,\s*$/,''));
 assert.equal(JSON.stringify([A.width,A.height,A.anchor[1]]),'[444,222,222]','cockroach presentation metadata: bottom-centre contact');
 assert.equal(c.RACombatData.ENEMIES.f15_uncle_bunmi.stageScale,c.RAF15Dates.ROACH.scale);
 {const src=(await rd('js/engine/stage.js')).toString(),cs=(await rd('js/scenes/combat2.js')).toString();
  assert.match(src,/enemyScale=null/);assert.match(src,/enemyScale>0\?\{lineScale:enemyScale\}:\{\}/,'enemy scale only applied when set');assert.match(cs,/enemyScale:def\.stageScale/);}
 console.log('PASS F15 scene wiring (8 art environments image-backed and approved; library + exam hall stay placeholders; Granny + cockroach registered; combat scale seam present and inert when unset)');
}
