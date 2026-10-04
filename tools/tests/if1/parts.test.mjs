// IF-1 4D / 4O / 4P — phone app registry (dark reserved apps), art-registry parts, audio-manifest parts.
import assert from 'node:assert/strict';
import {readdir} from 'node:fs/promises';
import path from 'node:path';
import {sandbox,run,read,throwsCode,same} from './_lib.mjs';

export async function test(root){
 process.env.RA_FLAGS_DARK='1';   // RC2 (OL-063): proves the reserved-and-dark contract on a build with no promoted flags
 try{await body(root);}finally{delete process.env.RA_FLAGS_DARK;}
}
async function body(root){
  await phone(root);await art(root);await audio(root);await partFolders(root);
  console.log('PASS IF-1 phone/art/audio registries (reserved apps stay dark, additive art+audio parts, frozen-asset collision refused, part folders clean)');
}

async function phone(root){
  const apps=new Map();
  const RAPhoneApps={register:a=>apps.set(a.id,{canon:false,order:50,...a}),unregister:id=>apps.delete(id),get:id=>apps.get(id)||null,list:()=>[...apps.values()],label:id=>id,isUnlocked:()=>true};
  const unlocked=[];const c=sandbox({extra:{RAPhoneApps,RALife:{unlockApp:(id)=>{unlocked.push(id);return true;}}}});
  c.RAFlagDefaults=Object.freeze({});   // RC2 (OL-063): no promoted flags, so the reserved apps are proven dark
  await run(root,c,['js/if1/features.js','js/if1/phone_registry.js']);
  RAPhoneApps.register({id:'texts',label:'TEXTS'});const before=JSON.stringify(RAPhoneApps.list());
  const R=c.RAPhoneRegistry;same(R.reserved().map(r=>[r.id,r.fragment,r.flag,r.declared,r.enabled]),[['warRoom','F04','F04.war_room',false,false],['trap','F05','F05.trap',false,false],['armory','F02','F02.armory',false,false],['rainmaker','F06','F06.rainmaker',false,false]],'War Room, Trap/Counting, Armory, RAINMAKER reserved and dark');
  const render=()=>'<h1>X</h1>';
  R.declare('F04',{id:'warRoom',render});R.declare('F05',{id:'trap',render});R.declare('F02',{id:'armory',render});R.declare('F06',{id:'rainmaker',render});
  assert.equal(JSON.stringify(RAPhoneApps.list()),before,'flags OFF: the phone registry is byte-identical to before (no reserved app is registered)');
  assert.equal(R.unlock('warRoom'),false,'dark app cannot be unlocked');assert.equal(unlocked.length,0);
  c.RAFeatures.set('F04.war_room',true);assert(RAPhoneApps.get('warRoom'),'flag ON: the declared app appears');assert.equal(RAPhoneApps.get('warRoom').section,'now');assert.equal(RAPhoneApps.get('trap'),null,'other reserved apps stay dark');
  assert.equal(R.unlock('warRoom'),true);same(unlocked,['warRoom']);
  c.RAFeatures.set('F04.war_room',false);assert.equal(RAPhoneApps.get('warRoom'),null,'flag OFF retracts the app');assert(RAPhoneApps.get('texts'),'accepted apps untouched');
  assert(throwsCode(()=>R.declare('F03',{id:'warRoom',render}),/already declared|reserved for F04/));
  assert(throwsCode(()=>R.declare('F03',{id:'texts',render,flag:'F03.new_oga_ladder_close'}),/accepted phone app/));
  assert(throwsCode(()=>R.declare('F03',{id:'noflag',render}),/feature flag is required/));
  assert(throwsCode(()=>R.declare('F03',{id:'badflag',render,flag:'F03.unregistered'}),/not registered/));
  assert(throwsCode(()=>R.declare('F03',{id:'norender',flag:'F03.new_oga_ladder_close'}),/render/));
}

async function art(root){
  const c=sandbox();await run(root,c,['js/data/art_registry.js','js/data/art/registry_parts.js']);const R=c.RAArtRegistry,P=c.RAArtParts;
  const frozenBefore=JSON.stringify(R);
  assert.equal(P.register('F91',{ui:{apps:{f91_icon:'assets/f91/icon.png'}},items:{f91:{sword:{asset:'assets/f91/sword.png'}}}}),2);
  assert.equal(R.ui.apps.f91_icon,'assets/f91/icon.png');assert.equal(R.items.f91.sword.asset,'assets/f91/sword.png');
  // existing resolution unchanged: everything that was there is still there, byte-for-byte
  const strip=JSON.parse(JSON.stringify(R));delete strip.ui.apps.f91_icon;delete strip.items.f91;assert.equal(JSON.stringify(strip),frozenBefore,'parts only ADD; existing art resolution is unchanged');
  // collisions: overwriting an existing entry — above all a FROZEN asset — is refused and nothing is half-merged
  const someAsset=Object.keys(R.assets)[0];
  const err=(()=>{try{P.register('F92',{ui:{apps:{texts:'assets/hijack.png'},f92_ok:{x:1}},assets:{[someAsset]:{sha256:'x',status:'FROZEN'}}});}catch(e){return e;}return null;})();
  assert(err&&err.code==='FROZEN_ASSET_COLLISION','overwriting an existing/frozen entry throws FROZEN_ASSET_COLLISION');assert(err.paths.some(p=>p.includes(someAsset)),'the frozen asset is named');
  assert.equal(R.ui.apps.texts!=='assets/hijack.png',true);assert(!R.ui.f92_ok,'a rejected part is not half-merged');
  assert.equal(P.register('F92',{assets:{'assets/f92/new.png':{sha256:'y',status:'PENDING',width:1,height:1}}}),1,'new asset entries may be added');
  same(P.fragments(),['F91','F92']);assert(throwsCode(()=>P.register('',{}),/required/));
}

async function audio(root){
  const c=sandbox();await run(root,c,['js/data/audio_manifest.js','js/data/audio/manifest_parts.js']);const M=c.RAAudioManifest,P=c.RAAudioParts;
  const baseIds=[...M.ids],baseCount=M.list().length;const ui=JSON.stringify(M.get('UI_TAP'));const no1=JSON.stringify(M.get('NO_01'));
  assert.equal(P.register('F91',{entries:[{id:'F91_HIT',bus:'SFX',type:'one-shot',category:'f91',registered:false,file:null,expectedPath:'assets/audio/sfx/f91/F91_HIT.mp3'},{id:'F91_HUM',bus:'AMBIENCE',type:'loop',category:'f91',registered:false,file:null}],scenes:{f91_scene:{ambience:'F91_HUM',preload:['F91_HIT']},battle:{preload:['F91_HIT','TELEGRAPH']}}}),2);
  assert.equal(M.list().length,baseCount+2);assert(M.has('F91_HIT'));assert.equal(M.get('F91_HIT').registered,false,'inert hooks stay inert');assert.equal(M.ids.length,baseIds.length+2);same(M.ids.slice(0,baseIds.length),baseIds,'base id order untouched');
  assert.equal(JSON.stringify(M.get('UI_TAP')),ui,'existing F1 audio entries unchanged');assert.equal(JSON.stringify(M.get('NO_01')),no1,'inert NEW OGA hooks unchanged');
  same(M.scenes.f91_scene,{ambience:'F91_HUM',preload:['F91_HIT']});assert(M.scenes.battle.preload.includes('F91_HIT'),'existing scene may gain preload ids');assert.equal(M.scenes.battle.preload.filter(x=>x==='TELEGRAPH').length,1,'no duplicate preload');
  assert.equal(M.scenes.battle.ambience,'AMB_THRONE','existing scene ambience untouched');
  assert(throwsCode(()=>P.register('F92',{entries:[{id:'UI_TAP',bus:'UI',type:'one-shot',category:'x'}]}),/already exists/),'a part cannot redefine an existing id');
  assert(throwsCode(()=>P.register('F92',{entries:[{id:'F91_HIT',bus:'SFX',type:'one-shot',category:'x'}]}),/already exists/),'nor another part\'s id');
  assert(throwsCode(()=>P.register('F92',{entries:[{id:'F92_X',bus:'NOPE',type:'one-shot',category:'x'}]}),/unknown bus/));
  assert(throwsCode(()=>P.register('F92',{entries:[{id:'F92_Y',bus:'SFX',type:'one-shot',category:'x',registered:true}]}),/registered:true but has no file/));
  assert(throwsCode(()=>P.register('F92',{entries:[{bus:'SFX'}]}),/missing id/));assert(throwsCode(()=>P.register('F92',{scenes:{bedroom:{ambience:'X'}}}),/ambience is owned/));
  same(P.fragments(),['F91']);same(P.idsFor('F91'),['F91_HIT','F91_HUM']);
}

// Shipped part folders: files must be named <FRAGMENT>_*.js, and must register only for their own fragment.
async function partFolders(root){
  for(const dir of ['js/data/art/parts','js/data/audio/parts']){
    const abs=path.join(root,dir);let files=[];try{files=(await readdir(abs)).filter(f=>f.endsWith('.js'));}catch(e){}
    for(const f of files){assert(/^F\d{2}_[A-Za-z0-9_-]+\.js$/.test(f),`${dir}/${f} must be named <FRAGMENT>_<name>.js`);const frag=f.split('_')[0];const text=await read(root,`${dir}/${f}`);
      for(const m of text.matchAll(/(?:RAArtParts|RAAudioParts)\.register\(\s*['"]([^'"]+)['"]/g))assert.equal(m[1],frag,`${dir}/${f} registers for ${m[1]}, not its own fragment ${frag}`);}
  }
}
