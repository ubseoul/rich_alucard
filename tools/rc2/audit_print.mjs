import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync(process.argv[2]||'C:/ra/shots/audit.json','utf8'));
console.log('ENVS');for(const e of d.envs)console.log(e.id.padEnd(26),(e.image?'IMG':'PAINT').padEnd(5),(e.approved?'appr':'    '),e.px?`${e.px.w}x${e.px.h} c=${e.px.colors} soft=${e.px.softEdgePct} semi=${e.px.semiAlphaPct}`:'',' used:',e.usedBy.length);
console.log('PEOPLE');for(const p of d.people)console.log(p.id.padEnd(26),p.px?`${p.px.w}x${p.px.h} c=${p.px.colors} soft=${p.px.softEdgePct} semi=${p.px.semiAlphaPct}`:'NOSPRITE',' states:',p.states.length,' used:',p.usedBy.length);
