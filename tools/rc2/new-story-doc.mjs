#!/usr/bin/env node
// Generates docs/rc2/NEW_STORY.md and docs/rc2/BARKS.md from the game data, so the private step reads exactly what ships.
// usage: node tools/rc2/new-story-doc.mjs
import {writeFile,mkdir} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const {loadBtf}=await import(pathToFileURL(path.join(root,'tools','btf-test.mjs')).href);
const ctx=await loadBtf(root);const W=ctx.RAWriting;
const NEW=[['YAM','a yam, an auntie, a seatbelt'],['FUFU','one rule: you do not chew'],['AUNTIES','three folding chairs and a file on you'],['ASOEBI','gold cloth + the DANCE FLOOR minigame, sprayed with money'],['PLATES','mom sent plates; everyone gets a plate'],['CLUB_FIRST','first night: half off, half your cash, the rest stays home']];
const sp=(who,text)=>`- **${who==='rich'?'RICH [VP]':who===null?'(narration)':String(who).toUpperCase()}**: ${text}`;
function fakeA(vars={}){const A={vars:{...vars},set(k,v){A.vars[k]=v;},get:k=>A.vars[k],L:ctx.RALife.L(),life:ctx.RALife,rel:ctx.RARelations,flag:ctx.RALife.flag,setFlag(){},id:null};return A;}
function linesOf(node,variants){
 const l=node.lines;if(!l)return [];
 if(typeof l!=='function')return [l];
 return variants.map(v=>{try{return l(fakeA(v))}catch(e){return []}});
}
function renderNodes(def,{variants}={}){
 let md='';
 for(const [id,node] of Object.entries(def.nodes)){
  const vs=variants?.[id]||[{}];const sets=linesOf(node,vs);if(!sets.length&&!node.choices&&!node.minigame)continue;
  md+=`\n**\`${id}\`**${node.env?` · env \`${node.env}\``:''}${node.title?` · card "${typeof node.title==='function'?'':node.title}"`:''}\n`;
  sets.forEach((lines,i)=>{if(sets.length>1)md+=`  _variant ${i+1}_\n`;for(const [who,text] of lines||[])md+=`${sp(who,text)}\n`;});
  const ch=typeof node.choices==='function'?(()=>{try{return node.choices(fakeA(vs[0]))}catch(e){return []}})():node.choices;
  if(ch?.length)md+=`- _choices:_ ${ch.map(c=>`[${c.label}${c.octopus?' · OCTOPUS':''}]`).join(' · ')}\n`;
  if(node.minigame)md+=`- _minigame:_ \`${node.minigame.id}\`\n`;
 }
 return md;
}
let md=`# NEW STORY — RC2 · BUILD 3 · OL-063\n\nAll of this is NEW content written under Ube's creator authorization ("I only want you to cook those story lines more"). It sits inside existing canon: existing characters, existing environments, no authored line contradicted. Rich lines are marked **[VP]** (voice pass required). Every box is <= 3 sentences. Generated from the game data by \`node tools/rc2/new-story-doc.mjs\` — this is exactly what ships.\n\n## Contents (titles)\n\n1. THE BRAIN (octopus brain scene, inside A00 · THE GOLDFISH YEARS)\n`;
NEW.forEach(([id],i)=>{md+=`${i+2}. ${ctx.RAAdventures.get(id).title}\n`;});
md+=`${NEW.length+2}. CHEAP-BUY ENCOUNTERS (tacos, malt, boba, coffee, gas station, thrift)\n${NEW.length+3}. STRIP CLUB · FIRST-VISIT PROTECTION LINE (the door scene is "THE CLUB · FIRST NIGHT")\n${NEW.length+4}. ENEMY BARKS (see BARKS.md)\n\n## Needs art / not final\n\n- **THE DOORMAN** (CLUB_FIRST) is a neutral placeholder figure, no frozen art yet.\n- ASO EBI, THE AUNTIE COUNCIL, FUFU FRIDAY, THE FOIL PLATES reuse existing environments (\`carson_owambe\`, \`naija_lot\`, \`kitchen\`, \`castle_exterior\`, \`naija_mart\`) and existing characters (Uncle Sunday, the Auntie, Tunde, Mom, Coffe, Dre, Lil Smack). The cousin with the cooler in THE FOIL PLATES is narration only.\n- Uncle Sunday's \`melted\`/\`offended\` states are not used here; he stays on his neutral state.\n\n## 1. THE BRAIN (octopus brain scene)\n\nTied to the OCTOPUS BRAIN move. Plays inside the prologue, between "use my head." and the existing "rich does it literally." beat. Flag set: \`octopusBrain\` = whole / polite / asked.\n`;
const a00=ctx.RAAdventures.get('A00');
for(const id of ['brain','brain_offer','brain_all','brain_one','brain_ask','brain_done'])md+=renderNodes({nodes:{[id]:a00.nodes[id]}});
md+=`\nAfter-the-scene lines for presentation (Build 2): ${W.octopusBrain.firstUse.map(t=>`"${t}"`).join(' · ')}\n`;
let n=2;
for(const [id,tag] of NEW){
 const def=ctx.RAAdventures.get(id);const want=ctx.RATemptations.defs().find(t=>t.adventure===id);
 md+=`\n## ${n++}. ${def.title}\n\n_${tag}._ Id \`${id}\`. Route: ${want?`VampGPT/${want.source} want, day ${want.minDay||1}+: "${want.line}"`:'place'}\n`;
 md+=renderNodes(def,{variants:{verdict:[{score:5},{score:2}],after:[{dance:{outcome:'win'}},{dance:{outcome:'lose'}},{dance:{quit:true}}],hub:[{done:[]},{done:['tunde']}]}});
}
md+=`\n## ${n++}. CHEAP-BUY ENCOUNTERS\n\nA small buy ($2–$20) sometimes opens a 2-box moment with a person. TACOS is wired (about half of visits, deterministic per day); the rest are ready for Build 1's hook via \`RAWriting.cheapBuyPick(kind)\`.\n`;
for(const [k,list] of Object.entries(W.cheapBuy)){md+=`\n**${k}**\n`;for(const e of list)md+=`- ${e.meet?`(meets ${e.meet}) `:''}${e.lines.map(t=>`"${t}"`).join(' / ')} — tip: ${e.tip}\n`;}
const sc=W.stripClub;
md+=`\n## ${n++}. STRIP CLUB · FIRST VISIT\n\nBuild 2/1 wire the money. Words: \n\n${sc.firstVisit.door.map(t=>`- DOORMAN: ${t}`).join('\n')}\n${sc.firstVisit.rich.map(t=>`- RICH [VP]: ${t}`).join('\n')}\n- Deal tag: ${sc.firstVisit.deal}\n${sc.firstVisit.leaving.map(t=>`- LEAVING: ${t}`).join('\n')}\n- Return visits: ${sc.returnVisit.join(' / ')}\n\nThe door scene itself (CLUB_FIRST) sets the flags Build 1 reads: \`clubFirstNight\`, \`clubBudgetCap\` (half the bankroll, or $20 on the cautious option), \`clubCoverDiscount\` (0.5).\n`;
await mkdir(path.join(root,'docs/rc2'),{recursive:true});await writeFile(path.join(root,'docs/rc2/NEW_STORY.md'),md);
// BARKS.md
const kinds=W.barks.kinds;const tx=x=>typeof x==='string'?x:x.text+(x.creator?'  ← **Ube, verbatim**':'');
let bk=`# ENEMY BARKS — RC2 · BUILD 3\n\nA pool for Build 2 to present during fights. Data: \`js/data/rc2_lines.js\` → \`RAWriting.bark(enemyId, kind, rng)\`. About 12% of the time ANY enemy says something from the **wild** pool instead (the most random enemy says the wildest thing). Every line is under 3 sentences; most are one. Ube's two examples are verbatim and flagged \`creator:true\`.\n\nKinds: ${kinds.join(' · ')}.\n\n## WILD (any enemy, any time)\n\n${W.barks.wild.map(t=>`- ${tx(t)}`).join('\n')}\n\n## GENERIC\n`;
for(const k of kinds)bk+=`\n**${k}**\n${(W.barks.generic[k]||[]).map(t=>`- ${tx(t)}`).join('\n')}\n`;
bk+=`\n## PER ENEMY\n`;
for(const [id,pool] of Object.entries(W.barks.enemy)){bk+=`\n### ${id}\n`;for(const k of kinds)if(pool[k]?.length)bk+=`- **${k}:** ${pool[k].map(tx).map(t=>`"${t}"`).join(' · ')}\n`;}
bk+=`\n_Total unique lines: ${new Set(W.allBarks()).size}._\n`;
await writeFile(path.join(root,'docs/rc2/BARKS.md'),bk);
console.log(`wrote docs/rc2/NEW_STORY.md and BARKS.md (${new Set(W.allBarks()).size} unique barks)`);
