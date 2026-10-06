import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {loadBtf} from '../../btf-test.mjs';
const root=process.cwd();
async function fixture(seedState){const c=await loadBtf(root,{seedState});for(const f of ['js/data/rc2_economy.js','js/systems/newgame.js'])vm.runInContext(await readFile(`${root}/${f}`,'utf8'),c);c.RAScenes.go=async()=>{};return c;}
const fresh=await fixture();await fresh.RANewGame.onStart();assert.equal(fresh.RALife.money(),40000);assert(fresh.RALife.flag('startCashSet'));
assert.equal(fresh.RAAdventures.get('A00').nodes.out.env,'throne');assert.deepEqual(Object.keys(fresh.RAAdventures.get('A00').nodes.out.actors),['mid']);
fresh.RALife.addMoney(5000);await fresh.RANewGame.onStart();assert.equal(fresh.RALife.money(),45000);
fresh.RAClock.wake({first:true});fresh.RAClock.wake({first:true});assert.equal(fresh.RALife.money(),45000);
const saved=await fixture(JSON.parse(JSON.stringify(fresh.RAState.get())));await saved.RANewGame.onStart();assert.equal(saved.RALife.money(),45000);
const resumed=await fixture();resumed.RAAdventures.start('A00',{from:'save'});resumed.RAState.patch('life.resources.money',73123);await resumed.RANewGame.onStart();assert.equal(resumed.RALife.money(),73123);
console.log('PASS authored fresh cash before A00, repeated START/wake/reload preserve balances and added settlement, resumed adventure cash preserved, explicit throne environment/cast. Synthetic state checks; browser evidence is separate.');
