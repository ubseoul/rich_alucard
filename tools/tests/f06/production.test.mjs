import assert from 'node:assert/strict';
import {full,run,same} from '../if1/_lib.mjs';

const files=['js/frag/F06/migrations.js','js/frag/F06/make_it_rain_tunables.js','js/frag/F06/make_it_rain_core.js'];
async function setup(root,{seedState=null,on=false}={}) {
  const c=await full(root,{seedState});
  await run(root,c,files);
  c.RAFeatures.set('F06.rainmaker',on);
  // Renderer is verified separately by the original real-browser suite.
  // Here the real pure core generates costs/outcomes and real IF-1 services save them.
  c.RAMakeItRainSandbox={mount(canvas,options){
    const core=c.RAMakeItRainCore.create({seed:1});
    return {core,startRound:budget=>core.reset({budget}),getState:()=>core.state(),stop(){},destroy(){},
      flick(t=1000){core.beginDrag({x:.5,y:.9,t:t-250});core.dragTo({x:.5,y:.4,t:t-40});const result=core.release({x:.5,y:.2,t,vx:0,vy:-2});options.audio.onFlick(result);return result;},
      duplicate:()=>options.audio.onFlick(),end(){core.advance(30000);options.onRoundEnd(core.summary());}};
  }};
  await run(root,c,['js/frag/F06/production.js']);
  return c;
}
export async function test(root) {
  const dark=await setup(root);
  const before=JSON.stringify(dark.RAState.get());
  assert.throws(()=>dark.RAF06Rainmaker.mount({}),/F06_DISABLED/);
  assert(!dark.RAPhoneApps.get('rainmaker'));
  assert(!dark.RASalesChannels.enabled('rainmaker'));
  assert.equal(JSON.stringify(dark.RAState.get()),before,'flag OFF leaves shared save untouched');
  assert(!dark.RAFrag.has('F06'));
  const c=await setup(root,{on:true});
  assert(c.RAPhoneApps.get('rainmaker'));
  assert.equal(c.RASalesChannels.get('bing').fragment,'F06');
  const initial=JSON.parse(JSON.stringify(c.RAState.get()));
  const session=c.RAF06Rainmaker.mount({});
  assert.throws(()=>c.RAF06Rainmaker.mount({}),/ALREADY_MOUNTED/);
  assert(!session.start(50000),'port retains approved budget presets');
  assert(session.start(10000));
  const balance=c.RALife.money();
  const r=session.game.flick();
  assert(r.dollars>0);
  assert.equal(c.RALife.money(),balance-r.dollars,'immediate real bill expense');
  assert.equal(c.RAMoneyLedger.entries().at(-1).source,'rainmaker:flick');
  session.game.duplicate();
  assert.equal(c.RALife.money(),balance-r.dollars,'duplicate callback cannot debit twice');
  assert.equal(c.RAF06Rainmaker.state().spent,r.dollars);
  // Capture an actual persisted record, not a hand-constructed namespace.
  const key=c.RAState.keys.primary;
  const saved=JSON.parse(c.localStorage.getItem(key));
  const reload=await setup(root,{on:true,seedState:saved});
  assert.equal(reload.RAF06Rainmaker.state().active,null);
  assert.equal(reload.RAF06Rainmaker.state().completed,0);
  assert.equal(reload.RALife.money(),balance-r.dollars,'partial reload neither refunds nor replays expenses');
  session.game.end(); session.game.end();
  const result=c.RAF06Rainmaker.state();
  assert.equal(result.completed,1,'duplicate completion guarded');
  assert.equal(c.RALife.money(),balance-r.dollars,'no invented payout');
  const completed=JSON.parse(c.localStorage.getItem(key));
  for(let i=0;i<3;i++) {
    const reloaded=await setup(root,{on:true,seedState:completed});
    same(reloaded.RAF06Rainmaker.state(),result,'completed state stable across repeated reload');
    assert.equal(reloaded.RALife.money(),balance-r.dollars);
  }
  const expectedLife=initial.life; expectedLife.resources.money=balance-r.dollars;
  same(c.RAState.get().life,expectedLife,'other shared state/inventory untouched');
  session.dispose(); session.dispose();
  const again=c.RAF06Rainmaker.mount({});
  c.RAState.patch('life.resources.money',1);
  assert(!again.start(5000),'insufficient budget refused');
  c.RAFeatures.set('F06.rainmaker',false);
  assert(!again.start(5000));
  assert(!c.RAPhoneApps.get('rainmaker'));
  assert.equal(c.RAF06Rainmaker.state().completed,1);
  console.log('PASS F06 production: dark save invariant, ledger expense, duplicate charge/completion, persisted reload, no payout, shared state, budget, flag teardown');
}
