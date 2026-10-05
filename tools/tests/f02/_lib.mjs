// Shared helpers for the F02 IRON & GRACE suites (leading underscore: never run as a test).
// The headless game (tools/btf-test.mjs loadBtf) does not load fragment files; these helpers load the game with IF-1
// present, then run the F02 fragment files in the SAME order as js/frag/F02/manifest.json, exactly as index.html does.
import {full as if1Full, run, same} from '../if1/_lib.mjs';
export {same};

// Mirrors js/frag/F02/manifest.json (js/frag/F02/migrations.js is loaded earlier, at the state anchor, by btf-test).
export const F02_FILES=[
 'js/frag/F02/flags.js',
 'js/frag/F02/catalog.js',
 'js/frag/F02/registry.js',
 'js/frag/F02/combat.js',
 'js/frag/F02/range.js',
 'js/frag/F02/armory.js',
 'js/frag/F02/moves.js',
 'js/frag/F02/showdown.js',
 'js/frag/F02/iron_and_grace.js'
];

// Production-ish context: accepted game + IF-1 + phone registry + audio manifest, then the F02 fragment.
export async function game(root,{flags=[]}={}){
 const ctx=await if1Full(root);
 // migrations.js loads at the state anchor in production (js/loader/manifest.json glob); the headless harness loads
 // state.js itself, so run the fragment's migration/namespace declaration first here, then the rest in order.
 await run(root,ctx,['js/frag/F02/migrations.js',...F02_FILES]);
 for(const id of flags)ctx.RAFeatures.set(id,true);
 return ctx;
}

export const clearFlags=(ctx,flags)=>{for(const id of flags)ctx.RAFeatures.set(id,false);};
export const ALL_F02=['F02.iron_and_grace','F02.armory','F02.range_day'];

// A combat helper bag that captures what F02's fire() asks the rules to do — no RNG, deterministic.
export function spyHelpers(state,{undead=false,vampire=false,rollHit=true}={}){
 const calls={damage:[],said:[],ended:0};
 return {calls,
  say:(s,text,kind,extra)=>calls.said.push({text,kind,...(extra||{})}),
  damageToEnemy:(s,base,opts={})=>{calls.damage.push({base,opts});return base*(opts.hits||1);},
  rollHit:()=>rollHit,
  hurtRich:()=>0,clampHp:(v,max)=>Math.max(0,Math.min(max,v)),
  endPlayer:(s)=>{calls.ended++;return s;},
  E:()=>({undead,vampire})};
}
