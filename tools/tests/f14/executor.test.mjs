// F14-A harness self-test — route executor: steps, assertions, backout, screenshots, failure capture.
import assert from 'node:assert/strict';
import {executeRoute} from '../../f14/executor.mjs';
import {fakePage} from './_lib.mjs';

const evaluate=expr=>{
  if(typeof expr==='function')return 2; // choice() receives a clicker function
  const s=String(expr);
  if(s.includes('FALSE'))return false;
  if(s.includes('HELLO'))return 'hello world';
  if(s.includes('COUNT'))return 3;
  return true;
};

export async function test(root){
  const page=fakePage({evaluate});
  const route={id:'t',steps:[
    {action:'goto',url:'/'},
    {action:'reload'},
    {action:'wait',ms:5},
    {action:'waitFor',expression:'()=>window.x',timeout:1000},
    {action:'click',selector:'#start'},
    {action:'choice',prefer:'GO'},
    {action:'eval',script:'()=>window.x',saveAs:'x'},
    {action:'record',expression:'()=>window.y',as:'y'},
    {action:'snapshot',as:'state'},
    {action:'screenshot',name:'after'},
    {action:'expect',expression:'()=>TRUE',equals:true,message:'true is true'},
    {action:'expect',expression:'()=>HELLO',contains:'hello',message:'contains'},
    {action:'expect',expression:'()=>COUNT',truthy:true,message:'truthy'}
  ]};
  const run=await executeRoute(page,route,{shotsDir:'/tmp'});
  assert.equal(run.ok,true,`expected ok, failures: ${JSON.stringify(run.failures)}`);
  assert.deepEqual(run.screenshots,['after.png'],'screenshot generation is recorded');
  const actions=run.history.map(h=>h.action);
  for(const a of ['goto','reload','click','choice','eval','screenshot'])assert(actions.includes(a),`history is missing ${a}`);
  assert(run.history.some(h=>h.kind==='value'&&h.name==='x'),'eval saveAs records a value');
  assert(run.history.some(h=>h.kind==='snapshot'),'snapshot is recorded');
  // ---- a failing assertion is captured, with expected/actual, and stops cleanly
  const bad=await executeRoute(fakePage({evaluate}),{id:'bad',steps:[{action:'expect',expression:'()=>FALSE',equals:true,message:'this must fail'}]});
  assert.equal(bad.ok,false);
  assert.equal(bad.failures.length,1);
  assert.match(bad.failures[0].message,/this must fail/);
  // ---- unknown action is a captured failure, not a crash
  const unknown=await executeRoute(fakePage({evaluate}),{id:'u',steps:[{action:'teleport'}]});
  assert.equal(unknown.ok,false);assert.match(JSON.stringify(unknown.failures),/unknown action/);
  // ---- console errors from the page are surfaced to the caller
  const errs=await executeRoute(fakePage({evaluate,errors:{console:['boom'],page:['crash'],network404:['http 404: /x'],unhandled:['rejection']}}),{id:'e',steps:[{action:'goto',url:'/'}]});
  assert.equal(errs.ok,true,'the executor itself succeeds; the driver layer decides on captured errors');
  const captured=await errs.errors;
  assert.equal(captured.page[0],'crash');assert.equal(captured.network404[0],'http 404: /x');assert.equal(captured.unhandled[0],'rejection');
  // ---- backout validation runs and is recorded
  const withBackout=await executeRoute(fakePage({evaluate}),{id:'b',steps:[{action:'goto',url:'/'}],backout:{steps:[{action:'click',selector:'#leave'}],assertions:[{expression:'()=>TRUE',equals:true,message:'returned to bedroom'}]}});
  assert.equal(withBackout.ok,true);assert(withBackout.backout&&withBackout.backout.ok===true,'backout validation is recorded');
  assert(withBackout.history.some(h=>h.phase==='backout'),'backout steps are in the history');
  console.log('PASS f14 route executor (steps, assertions, screenshots, console capture, backout, failure records)');
}
