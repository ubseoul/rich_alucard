import {runPlay as oldRun} from './sim_v1.mjs';
import {runPlay as newRun} from './driver.mjs';
import {JOBS} from './content.mjs';
const cfg={seed:3,job:JOBS[0],policy:'careful'};
const a=oldRun(cfg),b=newRun(cfg);
for(let i=0;i<Math.max(a.script.length,b.script.length);i++){if(JSON.stringify(a.script[i])!==JSON.stringify(b.script[i])){console.log('first diff at',i,'\nOLD',JSON.stringify(a.script[i]),'\nNEW',JSON.stringify(b.script[i]));break;}}
