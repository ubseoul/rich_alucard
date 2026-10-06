import assert from 'node:assert/strict';
import {boot} from '../../rc3/policy-test.mjs';
import {run} from '../if1/_lib.mjs';
export async function test(root){
 const c=await boot(root);await run(root,c,['js/minigames/jollof.js']);const core=c.RARangeDayCore.create({gunId:'lil_oga',seed:1});
 core.state().targets=[{id:1,lane:0,kind:'hostage',progress:.9,hit:false},{id:2,lane:0,kind:'gold',progress:.2,hit:false}];
 core.aim(0);assert.equal(core.fire().kind,'hostage');assert.equal(core.status().hits,0);assert.equal(core.status().hostages,1);assert.equal(core.status().accuracy,0);
 assert.equal(core.fire().kind,'gold');assert.equal(core.status().hits,1);assert.equal(core.status().accuracy,.5);
 const dish={blend:.5,fry:{darkness:.6,stoppedAtSheen:true},season:{thyme:.6,curry:.4,bayleaf:.4,salt:.6,cubes:.4},steam:{liftTime:.75,crust:true}};
 const scored=c.RAMinigameLogic.jollof.total(dish,['nneka','bunmi']),withSpectator=c.RAMinigameLogic.jollof.total(dish,['nneka','bunmi','lil_smack']);
 assert.equal(withSpectator.average,scored.average);assert.deepEqual({...withSpectator.breakdown},{...scored.breakdown});assert.equal(withSpectator.judgeScores.lil_smack.meaningless,true);
 // Host cancellation contract: accumulated in-run rewards are not a settled payout.
 const element=()=>({className:'',dataset:{},style:{},classList:{add(){},remove(){}},setAttribute(){},append(){},addEventListener(){},remove(){}});
 c.document.createElement=element;c.document.body.classList={add(){},remove(){}};c.RAScenes.createScope=()=>({timeout(){},cancel(){}});
 let context;c.RAMinigames.register('contract_probe',{mount(_root,ctx){context=ctx;ctx.reward({money:99,memories:['probe']});return {dispose(){}};}});
 const quit=c.RAMinigames.launch('contract_probe',{skipRule:true},{host:element()});context.quit();assert.equal((await quit).quit,true);assert.deepEqual(JSON.parse(JSON.stringify((await quit).rewards)),{});
 const complete=c.RAMinigames.launch('contract_probe',{skipRule:true},{host:element()});context.finish({outcome:'done'});assert.equal((await complete).rewards.money,99);
 console.log('PASS minigame shipping: hostage accounting, spectator exclusion, cancellation reward boundary');
}
