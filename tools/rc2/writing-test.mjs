// RC2 · BUILD 3 · WRITING & MINIGAMES gate. Part of npm test (tools/release.mjs). Fails loudly, names the offender.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {collect,sentences} from './text-audit.mjs';
import {scan} from './wide-audit.mjs';
import {protectedRows,check as checkProtected} from './protected-lines.mjs';

// Feel-locked / non-prose literals the wide audit may flag (F01 feed arrays + HTML are not text boxes).
const WIDE_ALLOW=/F01[\\/]play[\\/]lines\.mjs|property_quest\.js/;

export async function test(root){
 // 1) TEXT RULES — no text box over 3 sentences (adventure boxes + every long literal outside the feel-locked F01 feed)
 const rows=await collect();const over=rows.filter(r=>r.n>3);
 assert.equal(over.length,0,`text boxes over 3 sentences:\n${over.slice(0,8).map(r=>`${r.file}:${r.line} ${r.text.slice(0,80)}`).join('\n')}`);
 const wide=scan(3).filter(r=>!WIDE_ALLOW.test(r.file));
 assert.equal(wide.length,0,`literals over 3 sentences:\n${wide.slice(0,8).map(r=>`${r.file}:${r.line} ${r.text.slice(0,80)}`).join('\n')}`);

 // 2) NIGERIAN COMEDY LINES UNTOUCHED, word for word
 const prot=protectedRows();assert.ok(prot.length>=200,`protected line list shrank (${prot.length})`);
 const bad=checkProtected(prot);assert.equal(bad.length,0,`protected Nigerian lines changed:\n${bad.slice(0,6).map(r=>`${r.file}:${r.line} ${String(r.text).slice(0,80)}`).join('\n')}`);
 const md=await readFile(path.join(root,'docs/rc2/PROTECTED_LINES.md'),'utf8');
 assert.match(md,new RegExp(`Total protected lines: \\*\\*${prot.length}\\*\\*`),'docs/rc2/PROTECTED_LINES.md is stale — run: node tools/rc2/protected-lines.mjs gen');

 // 3) BARKS + CHEAP-BUY + CLUB + OCTOPUS BRAIN lines (data) and NEW STORY (in game and in the doc)
 const {loadBtf}=await import(pathToFileURL(path.join(root,'tools','btf-test.mjs')).href);
 const ctx=await loadBtf(root);const W=ctx.RAWriting;assert.ok(W,'RAWriting must load');
 const all=W.allBarks();const uniq=new Set(all);
 assert.ok(uniq.size>=150,`bark pool too small (${uniq.size})`);
 for(const t of uniq){assert.ok(sentences(t)<=3&&t.length<=120,`bark too long: ${t}`);}
 assert.ok(uniq.has('oh shi this oga not playing'),'Ube bark #1 must be verbatim');
 assert.ok(uniq.has('damn this nigga is crazy'),'Ube bark #2 must be verbatim');
 const combat=await readFile(path.join(root,'js/data/btf/combat.js'),'utf8');
 const enemies=[...combat.matchAll(/^  ([a-z_0-9]+):\{name:'[^']+',hp:\d+/gm)].map(m=>m[1]).filter(id=>id!=='training'||true);
 for(const id of enemies)assert.ok(W.barks.enemy[id],`enemy ${id} has no bark pool`);
 for(const id of ['CHEWER','ENFORCER','HUNTER','LIEUTENANT','LIL_SMACK'])assert.ok(W.barks.enemy[id],`F01 oga ${id} has no bark pool`);
 for(const id of enemies)for(const k of W.barks.kinds){assert.ok((W.barks.enemy[id][k]||W.barks.generic[k]).length>0,`${id}.${k} has no line`);}
 let seq=0;const rng=()=>((seq=(seq*9301+49297)%233280)/233280);
 const seen=new Set();for(let i=0;i<400;i++)seen.add(W.bark('uncle_sunday','hurt',rng));
 assert.ok(seen.size>=6,'bark() varies');assert.ok([...seen].every(t=>typeof t==='string'&&t.length),'bark() always returns a line');
 assert.equal(W.bark('nobody_here','hurt',()=>.99).length>0,true,'unknown enemy falls back to the generic pool');
 for(const kind of Object.keys(W.cheapBuy)){const e=W.cheapBuyPick(kind,()=>0);assert.ok(e.lines.length>=2&&e.lines.length<=3&&e.lines.every(t=>sentences(t)<=3),`cheap-buy ${kind}`);}
 assert.ok(Object.keys(W.cheapBuy).length>=5);
 assert.ok(W.stripClub.firstVisit.door.length>=3&&W.stripClub.firstVisit.door.every(t=>sentences(t)<=3),'strip club first-visit protection line');
 assert.match(W.stripClub.firstVisit.door.join(' '),/half/i);
 assert.ok(W.octopusBrain.firstUse.length>=3);

 const story=await readFile(path.join(root,'docs/rc2/NEW_STORY.md'),'utf8');
 const NEW=['YAM','FUFU','AUNTIES','ASOEBI','PLATES','CLUB_FIRST'];
 for(const id of NEW){const d=ctx.RAAdventures.get(id);assert.ok(d,`new adventure ${id} must be defined`);assert.ok(story.includes(d.title),`NEW_STORY.md must list "${d.title}"`);
  const routed=ctx.RATemptations.defs().some(t=>t.adventure===id);assert.ok(routed,`${id} needs a player route (VampGPT want / invite)`);}
 const a00=ctx.RAAdventures.get('A00');for(const n of ['brain','brain_offer','brain_all','brain_one','brain_ask','brain_done'])assert.ok(a00.nodes[n],`A00 octopus brain node ${n}`);
 assert.ok(story.includes('THE BRAIN'),'NEW_STORY.md must list the octopus brain scene');
 // every new box <= 3 sentences (already covered by rule 1, but prove the new files are in the audited set)
 assert.ok(rows.some(r=>r.file.endsWith('rc2_story.js')),'rc2_story.js text is audited');

 // 4) MINIGAMES: one-sentence rule for each, ramen order card steps, Bruce one-sentence
 const files=['touge','owambe_collection','hatch','pier','bars','slurp','jollof','garage','hookah','pickup','dance'].map(n=>`js/minigames/${n}.js`).concat(['js/frag/F02/range.js','js/frag/F05/minigame_cook.js','js/frag/F05/minigame_counter.js']);
 for(const f of files){const src=await readFile(path.join(root,f),'utf8');
  const m=src.match(/rule:\s*(?:p=>[^?]*\?\s*)?'([^']+)'/);assert.ok(m,`${f} must declare a rule`);
  assert.equal(m[1].split(/[.!?]/).filter(Boolean).length,1,`${f} rule must be one sentence: ${m[1]}`);}
 const slurp=await readFile(path.join(root,'js/minigames/slurp.js'),'utf8');
 assert.match(slurp,/STEPS=\[\{id:'broth'.*\{id:'noodles'.*\{id:'meat'.*\{id:'topping'/s,'ramen steps are broth → noodles → meat → topping');
 assert.match(slurp,/drawOrderCard/);assert.match(slurp,/PATIENCE_MS/);assert.match(slurp,/mmss\(left\)/,'ramen shows a visible shift clock');
 const w3=await readFile(path.join(root,'js/data/btf/adventures/w3.js'),'utf8');
 const intro=w3.match(/enemy:'bruce_loose',params:\{env:'food_court',intro:'([^']+)'/)?.[1];
 assert.ok(intro&&sentences(intro)===1,`Bruce fight explains itself in one sentence: ${intro}`);
 const bl=ctx.RACombatData.ENEMIES.bruce_loose;assert.ok(bl.hp<=80,'Bruce Loose is easier (hp)');assert.ok(Math.max(...Object.values(bl.moves).map(m=>(m.dmg||0)*(m.hits||1)))<=14,'Bruce Loose hits softer');
 assert.deepEqual(Array.from(bl.pattern).slice(0,2),['noise','kick'],'Bruce: noise, then kick');
 console.log(`PASS rc2 writing (0 boxes over 3 sentences in ${rows.length} adventure boxes, ${prot.length} protected Nigerian lines intact, ${uniq.size} barks, ${NEW.length} new story adventures + octopus brain scene, ${files.length} minigame rules, ramen order card, Bruce in one sentence)`);
}
