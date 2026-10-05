// IF-1 4A — RAFeatures contract: deterministic, safe defaults, dark integration, independent flags.
import assert from 'node:assert/strict';
import {sandbox,run as realRun,throwsCode} from './_lib.mjs';
// RC2 (OL-063): js/if1/flag_defaults.js now promotes four flags. This suite proves the registry contract with NONE promoted, so FILES loads features.js on an empty owner table.
const run=(root,ctx,files)=>{if(files===FILES){ctx.RAFlagDefaults=Object.freeze({});files=['js/if1/features.js'];}return realRun(root,ctx,files);};

const FILES=['js/if1/flag_defaults.js','js/if1/features.js'];
export async function test(root){
  // --- defaults: every reserved fragment flag exists and is OFF; unknown ids read OFF
  {const sb=sandbox();sb.RAFlagDefaults=Object.freeze({});const c=await run(root,sb,['js/if1/features.js']);const F=c.RAFeatures;   // RC2 (OL-063): the shipped flag_defaults.js now promotes four flags; the default-OFF contract is proven with none promoted
   assert.deepEqual([...F.reserved].sort(),['F01.showdown','F02.armory','F02.iron_and_grace','F03.new_oga_ladder_close','F04.war_room','F05.trap','F06.rainmaker','F07.m8_and_finale'],'reserved DARK flags');
   for(const id of F.reserved)assert.equal(F.enabled(id),false,`${id} must default OFF`);
   assert.equal(F.enabled('nope.unknown'),false);assert.equal(F.anyEnabled(),false);
   const snap=F.snapshot();assert.deepEqual(Object.keys(snap),[...Object.keys(snap)].sort(),'snapshot order is deterministic (sorted)');}
  // --- registration rules
  {const c=await run(root,sandbox(),FILES);const F=c.RAFeatures;
   assert.equal(F.register({id:'F09.thing',fragment:'F09'}),'F09.thing');
   assert.equal(F.register({id:'F09.thing',fragment:'F09'}),'F09.thing','re-register by the owner is idempotent');
   assert(throwsCode(()=>F.register({id:'F09.other',fragment:'F10'}),/outside fragment namespace/),'a fragment cannot register outside its namespace');
   assert(throwsCode(()=>F.register({id:'bad id'}),/invalid flag id/));
   assert(throwsCode(()=>F.register({id:'F09.on',fragment:'F09',default:true}),/may not default ON/),'a fragment cannot ship itself ON');
   F.register({id:'F09.child',fragment:'F09',requires:['F09.thing']});
   assert.equal(F.enabled('F09.thing'),false);}
  // --- independent enabling + requires + change events
  {const c=await run(root,sandbox(),FILES);const F=c.RAFeatures;F.register({id:'F09.a',fragment:'F09'});F.register({id:'F09.b',fragment:'F09',requires:['F09.a']});
   const seen=[];F.onChange(e=>seen.push(`${e.id}:${e.enabled}`));
   F.set('F09.b',true);assert.equal(F.enabled('F09.b'),false,'b needs a');
   F.set('F09.a',true);assert.equal(F.enabled('F09.b'),true);assert.equal(F.enabled('F04.war_room'),false,'other fragments unaffected');
   F.clear('F09.a');assert.equal(F.enabled('F09.b'),false);assert(seen.length>=3);}
  // --- diamond requires (a->b,c ; b,c->d) resolves; a dependency cycle reads OFF
  {const c=await run(root,sandbox(),FILES);const F=c.RAFeatures;for(const n of ['d','b','c','a','x','y'])F.register({id:'F09.'+n,fragment:'F09',requires:{d:[],b:['F09.d'],c:['F09.d'],a:['F09.b','F09.c'],x:['F09.y'],y:['F09.x']}[n]});
   for(const n of ['a','b','c','d','x','y'])F.set('F09.'+n,true);assert.equal(F.enabled('F09.a'),true,'diamond of requires is satisfied');assert.equal(F.enabled('F09.x'),false,'cycle reads OFF');F.set('F09.d',false);assert.equal(F.enabled('F09.a'),false);assert.deepEqual(['F09.d','F09.a'].map(F.enabled),[false,false],'enabled is safe to pass to Array.map');}
  // --- persistence only for persist:true, in its OWN storage key (never the save)
  {const c=await run(root,sandbox(),FILES);const F=c.RAFeatures;F.register({id:'F09.p',fragment:'F09',persist:true});F.register({id:'F09.q',fragment:'F09'});
   F.set('F09.p',true,{persist:true});F.set('F09.q',true,{persist:true});
   const stored=JSON.parse(c.localStorage.getItem(F.storageKey));assert.deepEqual(stored,{'F09.p':true},'only persist:true flags persist');
   assert.notEqual(F.storageKey,'rich_alucard_save_v1');
   const again=await run(root,sandbox({extra:{localStorage:c.localStorage}}),FILES);again.RAFeatures.register({id:'F09.p',fragment:'F09',persist:true});
   assert.equal(again.RAFeatures.enabled('F09.p'),true,'persisted flag restored');}
  // --- DEV session override only with ?dev=1; owner promotion is the only way to default ON
  {const dev=await run(root,sandbox({search:'?dev=1&ff=F01.showdown,-F04.war_room'}),FILES);assert.equal(dev.RAFeatures.enabled('F01.showdown'),true);
   const prod=await run(root,sandbox({search:'?ff=F01.showdown'}),FILES);assert.equal(prod.RAFeatures.enabled('F01.showdown'),false,'URL flags are ignored outside DEV');}
  {const c=sandbox();c.RAFlagDefaults=Object.freeze({'F09.promoted':true});await run(root,c,['js/if1/features.js']);
   c.RAFeatures.register({id:'F09.promoted',fragment:'F09'});assert.equal(c.RAFeatures.enabled('F09.promoted'),true,'owner-promoted default');}
  console.log('PASS IF-1 features (dark defaults, namespace guard, requires, persistence scope, DEV-only overrides, owner promotion)');
}
