// Shared helpers for the F14 harness self-tests (leading underscore => not run as a test).
import {mkdtemp,writeFile,mkdir,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

// A minimal page adapter matching the executor/browser contract. Everything is observable through `events`.
export function fakePage({evaluate,click,errors,snapshot,screenshot,screenshotDir,viewport}={}){
  const events=[];
  return {
    events,
    async goto(url){events.push({t:'goto',url});},
    async reload(){events.push({t:'reload'});},
    async evaluate(expr,arg){events.push({t:'evaluate',expr:typeof expr==='string'?expr:'(fn)',arg});return evaluate?evaluate(expr,arg):undefined;},
    async waitForFunction(expr,opts){events.push({t:'waitForFunction',expr,opts});},
    async waitTimeout(ms){events.push({t:'wait',ms});},
    async click(selector,opts){events.push({t:'click',selector,opts});return click?click(selector,opts):undefined;},
    async screenshot(name){events.push({t:'screenshot',name});if(screenshotDir){await mkdir(screenshotDir,{recursive:true});await writeFile(path.join(screenshotDir,`${name}.png`),'');}return screenshot?await screenshot(name):`${name}.png`;},
    viewport(){return viewport||{width:390,height:844};},
    async errors(){return errors||{console:[],page:[],network404:[],unhandled:[]};},
    async snapshot(){return snapshot?snapshot():{version:16,life:{world:{day:9},resources:{money:0}}};},
    async features(){return {};},
    async close(){events.push({t:'close'});}
  };
}
// Dispatch an evaluate expression to a canned value by substring. `rules` is [needle, value|fn].
export const scriptedEvaluate=rules=>(expr,arg)=>{
  const s=typeof expr==='string'?expr:'';
  for(const [needle,value] of rules)if(s.includes(needle))return typeof value==='function'?value(arg,expr):value;
  return true;
};
// A driver factory: every page(viewport,flags) call gets a fresh fake page (executor closes pages).
export function fakeDriver(factory){
  const pages=[];
  return {pages,page:async(viewport,flags)=>{const p=factory(viewport,flags);p.vpArg=viewport;p.viewport=()=>viewport;p.flags=flags;pages.push(p);return p;},close:async()=>{pages.closed=true;}};
}
export async function tmpDir(prefix='f14-'){return mkdtemp(path.join(os.tmpdir(),prefix));}
export async function writeJson(file,value){await mkdir(path.dirname(file),{recursive:true});await writeFile(file,JSON.stringify(value,null,1));return file;}
export {rm};
