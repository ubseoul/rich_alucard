(function(){
 'use strict';
 // RACombat2Ext — IF-1 (4M). Extension points for the accepted Combat 2.0 rules (js/engine/combat2.js) and scene
 // (js/scenes/combat2.js). Three seams, all INERT until a fragment registers against them and its feature flag is ON:
 //   registerWeapon   a weapon slot/button in the main battle menu + its action handler        (IRON & GRACE)
 //   registerBossScript   per-enemy hooks: onCreate / beforeEnemyTurn / afterEnemyTurn / onEnd (boss scripts)
 //   registerItemHook     per-item hooks: before (may veto) / after                             (item hooks)
 //   registerAction       any other custom action type
 // The accepted rules call these through optional chaining, consume no RNG here and change nothing when the registry is
 // empty, so accepted Combat 2.0 fights are unchanged. NO weapon, boss script or item hook is implemented in F00.
 // Handlers get `helpers` from the rules module: {say,damageToEnemy,rollHit,hurtRich,endPlayer,clampHp,roll,E}.
 const weapons=new Map(),bosses=new Map(),items=new Map(),actions=new Map();
 const F=()=>window.RAFeatures;
 const live=spec=>!spec.flag||!!F()?.enabled(spec.flag);
 const need=(spec,what)=>{if(!spec?.fragment)throw new Error(`${what}: fragment required`);if(!spec.flag)throw new Error(`${what}: flag required — combat extensions integrate DARK`);if(!F()?.get(spec.flag))throw new Error(`${what}: flag ${spec.flag} is not registered in RAFeatures`);};
 function registerWeapon(spec){
  need(spec,`registerWeapon(${spec?.id})`);
  if(!/^[a-z][a-z0-9_]*$/.test(spec.id||'')||typeof spec.use!=='function')throw new Error('registerWeapon: {id,label,use(state,action,helpers)} required');
  if(weapons.has(spec.id))throw new Error(`registerWeapon: ${spec.id} already registered`);
  weapons.set(spec.id,Object.freeze({label:spec.id.toUpperCase(),available:()=>true,...spec}));return spec.id;
 }
 function registerBossScript(enemyId,spec){
  need(spec,`registerBossScript(${enemyId})`);
  if(bosses.has(enemyId))throw new Error(`registerBossScript: ${enemyId} already scripted by ${bosses.get(enemyId).fragment}`);
  bosses.set(enemyId,Object.freeze({...spec}));return enemyId;
 }
 function registerItemHook(itemId,spec){
  need(spec,`registerItemHook(${itemId})`);
  if(items.has(itemId))throw new Error(`registerItemHook: ${itemId} already hooked by ${items.get(itemId).fragment}`);
  items.set(itemId,Object.freeze({...spec}));return itemId;
 }
 function registerAction(type,spec){
  need(spec,`registerAction(${type})`);
  if(['move','octopus','gun','item','hoe','run','weapon'].includes(type)||actions.has(type))throw new Error(`registerAction: type ${type} is taken`);
  if(typeof spec.handle!=='function')throw new Error('registerAction: {handle(state,action,helpers)} required');
  actions.set(type,Object.freeze({...spec}));return type;
 }
 // ---- consumed by the rules (engine/combat2.js) ----
 const handles=type=>type==='weapon'?[...weapons.values()].some(live):actions.has(type)&&live(actions.get(type));
 function dispatch(s,action,helpers){
  if(action.type==='weapon'){const w=weapons.get(action.id);if(!w||!live(w)||!w.available(s)){helpers.say(s,'NOTHING HAPPENS.','block');return s;}return w.use(s,action,helpers)||s;}
  const a=actions.get(action.type);return a&&live(a)?(a.handle(s,action,helpers)||s):s;
 }
 function boss(s,phase,helpers){const b=bosses.get(s.enemyId);if(!b||!live(b)||typeof b[phase]!=='function')return;try{b[phase](s,helpers);}catch(e){console.error('boss script',s.enemyId,phase,e);}}
 // before(): return false to veto the item use (rules report NONE LEFT-style block); after(): runs once effects applied.
 function itemHook(s,itemId,phase,helpers){const h=items.get(itemId);if(!h||!live(h)||typeof h[phase]!=='function')return undefined;try{return h[phase](s,D().ITEMS[itemId],helpers);}catch(e){console.error('item hook',itemId,phase,e);return undefined;}}
 const D=()=>window.RACombatData;
 // ---- consumed by the scene (scenes/combat2.js) ----
 const menuButtons=s=>[...weapons.values()].filter(w=>live(w)&&w.available(s)).map(w=>({label:typeof w.label==='function'?w.label(s):w.label,act:`weapon:${w.id}`,cls:w.cls||'',...(w.gun?{gun:typeof w.gun==='function'?w.gun(s):w.gun}:{})}));
 const presentationFor=(s,action)=>{const w=action.type==='weapon'&&weapons.get(action.id);return w&&live(w)?{gun:typeof w.gun==='function'?w.gun(s):w.gun||null}:null;};
 const actionFromButton=(act,s)=>{const [kind,id]=String(act).split(':');if(kind==='weapon'&&weapons.has(id)&&live(weapons.get(id)))return {type:'weapon',id};return null;};
 window.RACombat2Ext={registerWeapon,registerBossScript,registerItemHook,registerAction,handles,dispatch,boss,itemHook,menuButtons,actionFromButton,presentationFor,registered:()=>({weapons:[...weapons.keys()],bosses:[...bosses.keys()],items:[...items.keys()],actions:[...actions.keys()]})};
})();
