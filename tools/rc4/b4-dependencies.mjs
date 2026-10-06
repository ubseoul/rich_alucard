// Static inventory of retained story consumers requiring B1 decisions; never changes those beats.
import {boot} from '../rc3/policy-test.mjs';
const c=await boot(process.cwd());for(const d of c.RAAdventures.all().filter(d=>c.RARC3.allowed(d.id)))for(const [node,n] of Object.entries(d.nodes||{})){const g=n.minigame;if(g&&!['slurp','dance','range_day'].includes(g.id))console.log(`${d.id}:${node} -> ${g.id}`);else if(g?.id==='slurp'&&String(g.params).includes('canopyDuty'))console.log(`${d.id}:${node} -> slurp(canopyDuty)`);}
