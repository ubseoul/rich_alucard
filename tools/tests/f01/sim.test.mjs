// F01 soak: many full fights driven by bots, invariants checked after EVERY action; outcome sanity.
import assert from 'node:assert/strict';
import {core,playOut,invariants} from './_lib.mjs';

export async function test(root){
  const c=await core(root);const E=c.RAShowdownEngine,M=c.RAShowdownMaps;
  const guns={MUSCLE:'sapporo_shotgun',SHOOTER:'chopstick_sniper',WHEELS:'pistol',TALKER:'pistol',GHOST:'pistol',DOC:'lil_oga'};
  const cfg=(m,seed,classes)=>({seed,map:M.get(m.map),squad:classes.map((cls,k)=>({id:cls.toLowerCase(),name:cls,cls,weapon:(m.loadout&&m.loadout[cls])||guns[cls],bonds:k===1?[classes[0].toLowerCase()]:[]})),enemies:m.enemies,objective:m.objective,turnLimit:m.turnLimit||null,revealedPods:m.revealedPods});
  const squads=[['MUSCLE','SHOOTER','GHOST','DOC'],['WHEELS','TALKER','MUSCLE','DOC'],['SHOOTER','GHOST','TALKER']];
  const tally={smart:{V:0,R:0,F:0,n:0},random:{V:0,R:0,F:0,n:0}};let actions=0,downs=0;const t0=Date.now();
  for(const m of M.SANDBOX_MISSIONS){
    for(const policy of ['smart','random']){
      for(let i=0;i<8;i++){
        const out=playOut(c,E.create(cfg(m,`${m.id}-${policy}-${i}`,squads[i%3])),{policy,seed:`${m.id}${i}`,maxActions:500});
        const res=out.state.result;assert(res,`${m.id}/${policy}/${i} ended`);assert(['VICTORY','RETREAT','FAILURE'].includes(res.outcome));
        assert.equal(res.schema,'F01.result/1');assert.equal(res.ogaResults.length,squads[i%3].length);
        invariants(c,out.state,'final');
        const t=tally[policy];t.n++;t[res.outcome[0]]++;actions+=out.actions;downs+=out.events.filter(e=>e.t==='DOWNED').length;
        // a VICTORY means the objective was truly met
        if(res.outcome==='VICTORY'){if(m.objective.kind==='ELIMINATE')assert.equal(res.enemiesRemaining,0);else assert.equal(res.captive.extracted,true);}
      }
    }
  }
  // outcome sanity: skill matters (a careful player beats a flailing one) and fights are neither instant nor endless
  assert(tally.smart.V>tally.random.V+8,`a sensible player must beat random play (smart wins ${tally.smart.V}/${tally.smart.n}, random ${tally.random.V}/${tally.random.n})`);
  assert(downs>0,'fights produce downed Ogas');
  console.log(`PASS F01 soak (${tally.smart.n+tally.random.n} full fights, ${actions} actions, invariants after every action; smart V/R/F ${tally.smart.V}/${tally.smart.R}/${tally.smart.F}, random ${tally.random.V}/${tally.random.R}/${tally.random.F}; ${Date.now()-t0}ms)`);
}
