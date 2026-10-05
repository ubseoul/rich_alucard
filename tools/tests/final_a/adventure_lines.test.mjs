import assert from 'node:assert/strict';
import {boot} from '../f15/_lib.mjs';

export async function test(root){
 const c=await boot(root),A=c.RAAdventures;
 A.start('A29C');A.enter('fork');const next=A.choose('fork',0);assert.equal(next,'roast');A.enter(next);
 const lines=A.linesFor(next);
 assert.equal(lines.length,2,'real roast callback-only entry must not become a third dialogue wait');
 assert.equal(lines[0][0],'rich');assert.equal(lines[0][1],'get out. take the empty cup with you.');
 assert.equal(lines[1][1],'he posts sad content for weeks. bad lighting. captions nobody asked for.');
 assert.equal(A.complete(next).outcome,'roasted');assert.equal(A.active(),null);assert.equal(c.RALife.flag('coffeFate'),'exiled');
 assert.equal(A.record('A29C').status,'completed');assert.equal(c.RALife.life().clock.returnBeat.text,'that was necessary.');
 // Real authored text callbacks must resolve both branches, and node-line factories still work.
 A.start('A36',{vars:{leadWin:true,chaseWin:true}});
 assert.equal(A.linesFor('chase')[0][1],'not bad. my turn — you chase now.');
 assert.equal(A.linesFor('result')[0][1],'…yeah. you can run r34 lines now.');
 A.context().set('leadWin',false);
 assert.equal(A.linesFor('chase')[0][1],"you're dropping the gap. watch me lead.");
 assert.equal(A.linesFor('result')[0][1],'close. not there yet.');
 console.log('PASS authored A29C roast resolves two lines and completes; A36 dynamic text/node-line branches resolve');
}
