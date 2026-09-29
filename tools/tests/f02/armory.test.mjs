// F02 — Armory phone app (dark declaration, catalogue render, buy/equip/mod actions) and the Range Day minigame core
// (deterministic scoring, medal thresholds, one-mod-discount reward, gun story).
import assert from 'node:assert/strict';
import {game,ALL_F02,clearFlags,same} from './_lib.mjs';

export async function test(root){
 const c=await game(root);const R=c.RAIronAndGrace,Reg=c.RAPhoneRegistry,A=c.RAIronArmory,RD=c.RARangeDayCore;

 // dark declaration: reserved app never reaches the phone while OFF
 assert.equal(c.RAPhoneApps.get('armory'),null,'F02.armory OFF: the Armory app is not registered');
 same(Reg.reserved().find(r=>r.id==='armory'),{id:'armory',label:'ARMORY',fragment:'F02',flag:'F02.armory',section:'life',declared:true,enabled:false});

 c.RAFeatures.set('F02.armory',true);c.RAFeatures.set('F02.range_day',true);
 assert(c.RAPhoneApps.get('armory'),'flag ON: the app appears');assert.equal(c.RAPhoneApps.get('armory').section,'life');

 c.RALife.addMoney(1e6);
 const stub={go(){},refresh(){},close(){return Promise.resolve();},message(){}};
 const app=c.RAIronAndGrace.armory.app();
 assert.match(app.render('',stub),/THE ARMORY/);
 app.onAction('buy','mac_and_cheese',stub);assert.equal(R.owns('mac_and_cheese'),true);
 assert.match(app.render('',stub),/MAC & CHEESE/);
 app.onAction('equip','mac_and_cheese',stub);assert.equal(R.equipped(),'mac_and_cheese');
 app.onAction('buyMod','drum_mag',stub);assert.equal(R.modsOwned().includes('drum_mag'),true);
 app.onAction('attach','mac_and_cheese|drum_mag',stub);assert.equal(R.hasMod('mac_and_cheese','drum_mag'),true);
 assert.match(app.render('gun:mac_and_cheese',stub),/DRUM MAG/);
 app.onAction('detach','mac_and_cheese|drum_mag',stub);assert.equal(R.hasMod('mac_and_cheese','drum_mag'),false);

 // ---- Range Day core: deterministic, DOM-free ----
 same(RD.thresholds(),{bronze:400,silver:900,gold:1600});
 const steps=Array.from({length:620},(_,i)=>[i%3,0.1]);
 const a=RD.simulate({gunId:'mac_and_cheese',seed:99,steps});
 const b=RD.simulate({gunId:'mac_and_cheese',seed:99,steps});
 same(a,b,'same seed + same inputs ⇒ identical Range Day result');
 const different=RD.simulate({gunId:'mac_and_cheese',seed:7,steps});
 assert.notEqual(JSON.stringify(a.targets),JSON.stringify(different.targets),'a different seed changes the target sequence');
 assert.equal(a.over,true,'50 seconds elapse');
 assert(Number.isFinite(a.score),'score is a number');
 assert.equal(RD.medalFor(100),null);assert.equal(RD.medalFor(500),'bronze');assert.equal(RD.medalFor(1000),'silver');assert.equal(RD.medalFor(2000),'gold');

 // medal + one-mod-discount + gun story rewards
 const before=R.discountTokens();
 const gold=R.awardRange('mac_and_cheese',1800);
 assert.equal(gold.medal,'gold');assert.equal(gold.newMedal,true);assert.equal(gold.story,true);
 assert.equal(R.storyTitle('mac_and_cheese'),'CLEANED THE RANGE WITH THE MAC & CHEESE');
 assert.equal(R.discountTokens(),before+1,'a medal unlocks one mod discount');
 // a second medal on the same gun does not grant a second discount
 R.awardRange('mac_and_cheese',1900);assert.equal(R.discountTokens(),before+1);
 const silver=R.awardRange('tommy_tony',950);assert.equal(silver.medal,'silver');assert.equal(R.discountTokens(),before+2);

 // the medal discount is applied at mod purchase (provisional F13 rate) and consumed once
 c.RALife.addMoney(1e6);const full=c.RAIronCatalog.MODS.scope.price;
 const discounted=R.buyMod('scope',{useDiscount:true});
 assert.equal(discounted.discount,.15);assert(discounted.price<full);
 assert.equal(R.discountTokens(),before+1,'the discount token was consumed');

 // invalid/absent guns are refused, and Range Day does not invent a gun
 assert.equal(R.awardRange('nope',100).reason,'unknown');
 const empty=RD.create({gunId:'auntie_slipper',seed:1});assert.equal(empty.status().ammo,Infinity,'slipper needs no reload');

 clearFlags(c,ALL_F02);
 console.log('PASS F02 Armory + Range Day (dark declaration, app actions, deterministic range, medal/discount/story rewards)');
}
