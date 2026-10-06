import assert from 'node:assert/strict';
import {boot} from '../../rc3/policy-test.mjs';
import {run} from '../if1/_lib.mjs';
export async function test(root){
 const c=await boot(root);await run(root,c,['js/data/rc2_economy.js','js/systems/strip_club.js']);
 const t=c.RAStripClub.terms();assert.equal(t.discount,.5);assert.equal(c.RAStripClub.price(t,1000),500);
 c.RAStripClub.markFirstVisit();assert.equal(c.RAStripClub.terms().discount,0);
 const reload=await boot(root,{seedState:JSON.parse(JSON.stringify(c.RAState.get()))});await run(root,reload,['js/data/rc2_economy.js','js/systems/strip_club.js']);assert.equal(reload.RAStripClub.firstVisitDone(),true);
 const gun='lil_oga';
 const core=c.RARangeDayCore.create({gunId:gun,seed:7}),max=core.status().ammo;
 assert.ok(Number.isFinite(max)&&max>0);core.aim(0);for(let i=0;i<max;i++)core.fire();assert.equal(core.status().ammo,0);
 assert.equal(core.fire().reason,'reloading');for(let i=0;i<30;i++)core.update(.1);assert.equal(core.status().ammo,max);assert.equal(core.fire().ok,true);
 const lo={maxHp:100,moves:['bite'],fits:[],rooms:[],items:{},guns:[],companions:[]};
 const win=c.RACombat2Rules.create('f15_roxy_spar',{spar:true},lo,()=>0);
 c.RACombat2Rules.act(win,{type:'gun',id:'draco'});assert.equal(win.enemy.hp,win.enemy.max);
 for(let i=0;i<5;i++)c.RACombat2Rules.act(win,{type:'spar',id:'jab'});assert.equal(win.outcome,'win');assert.equal(win.enemy.hp,1);assert.ok(win.rich.hp>=1);
 const lose=c.RACombat2Rules.create('f15_roxy_spar',{spar:true},lo,()=>.5);
 for(let i=0;i<5;i++){lose.rng=()=>.95;c.RACombat2Rules.act(lose,{type:'spar',id:'cross'});lose.rng=()=>0;c.RACombat2Rules.act(lose,{type:'spar',id:'guard'});}assert.equal(lose.outcome,'lose');assert.equal(lose.rich.hp,1);
 const quit=c.RACombat2Rules.create('f15_roxy_spar',{spar:true},lo);c.RACombat2Rules.act(quit,{type:'run'});assert.equal(quit.outcome,'quit');
 assert.equal(c.RARC3.settleAttempt('spar','bout',{quit:true,outcome:'quit'}),'paused');assert.equal(c.RARC3.attemptAllowed('spar','bout'),true);
 console.log('PASS RC4 B4: literal half-off, reload-safe consumption, finite-magazine refill/fire, safe spar win/loss/quit');
}
