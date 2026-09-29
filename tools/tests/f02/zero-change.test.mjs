// F02 — zero existing regression. With the fragment's files LOADED but every flag OFF, the accepted game behaves
// exactly like the IF-1-only baseline: identical save (no `frag` namespace), money, calendar and WAKE handler roster,
// an empty combat seam and no reserved phone app. This is the fragment-level companion to IF-1's zero-change replay.
import assert from 'node:assert/strict';
import {loadBtf} from '../../btf-test.mjs';
import {game,ALL_F02} from './_lib.mjs';

function stable(value){
 const strip=v=>{if(Array.isArray(v))return v.map(strip);if(v&&typeof v==='object'){const out={};for(const k of Object.keys(v)){if(k==='at'||/(?:At|savedAt|updatedAt)$/.test(k))continue;out[k]=strip(v[k]);}return out;}return v;};
 return JSON.stringify(strip(JSON.parse(JSON.stringify(value))));
}
function play(ctx){
 ctx.RAClock.wake({first:true});
 ctx.RAState.patch('life.world.day',4);
 for(let i=0;i<3;i++)ctx.RAClock.sleep();
 return {save:stable(ctx.RAState.get()),money:ctx.RALife.money(),day:ctx.RALife.today().day,
  handlers:ctx.RAClock.handlers().filter(id=>id!=='night-report'&&id!=='if1.crew-timers')};
}

export async function test(root){
 const base=await loadBtf(root,{if1:true});          // IF-1 present, no fragment files
 const withF02=await game(root);                    // IF-1 + the whole F02 fragment, all flags OFF

 assert.equal(withF02.RAFeatures.anyEnabled(),false,'every F02 flag is dark');
 assert.equal(withF02.RAIronAndGrace.selfCheck().ok,true,withF02.RAIronAndGrace.selfCheck().problems.join('; '));

 const a=play(base),b=play(withF02);
 assert.equal(b.save,a.save,'F02 loaded but dark ⇒ the save is byte-identical to the IF-1-only baseline');
 assert.equal(b.money,a.money,'economy untouched');
 assert.equal(b.day,a.day,'calendar untouched');
 assert.equal(b.handlers.join(),a.handlers.join(),'no WAKE handler added while dark');
 assert(!JSON.parse(b.save).frag,'no save.frag namespace is created while dark');

 // the seams are present but inert
 const s=withF02.RACombat2Rules.create('bruce_loose',{},undefined,()=>.5);
 assert.equal(withF02.RACombat2Ext.menuButtons(s).length,0,'empty main-menu while dark');
 assert.equal(withF02.RAPhoneApps.get('armory'),null,'the reserved Armory app stays absent');
 assert.equal(withF02.RAIronCatalog.list().length,13,'the catalog exists as data without being active');

 for(const id of ALL_F02)assert.equal(withF02.RAFeatures.enabled(id),false);
 console.log('PASS F02 zero-change (dark fragment is fully inert: save/wake/economy/calendar byte-identical to IF-1 baseline)');
}
