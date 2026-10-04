// RC2: how often does a Day-1 taco pay off? N fresh lives, one TACOS run each (the real adventure, $3 tacos / $9 plate).
import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const {boot,mulberry}=await import(pathToFileURL(path.join(root,'tools/tests/f13/_campaign.mjs')).href);
const {drive}=await import(pathToFileURL(path.join(root,'tools/pilot/headless.mjs')).href);
const N=Number(process.argv[2]||40);let hit=0;const by={};const real=Math.random;
for(let s=1;s<=N;s++){
 const rng=mulberry(1000+s);Math.random=rng;
 const c=await boot(root,{rng});c.RAClock.wake({first:true});for(const f of ['prologueDone','throneDone','firstWakeDone'])c.RALife.setFlag(f,true);
 const m0=c.RALife.money();drive(c,'TACOS',{});
 const ev=Object.values(c.RAState.get().life.events?.records||{}).filter(e=>e&&e.type==='cheap_buy_payoff');
 const live=(c.RALife.life().temptations.live||[]).map(t=>t.id);
 const got=live.filter(id=>c.RACheapBuys.POOL.includes(id));
 if(got.length){hit++;for(const g of got)by[g]=(by[g]||0)+1;}
 if(s===1)console.log('spent',m0-c.RALife.money(),'live',JSON.stringify(live));
}
Math.random=real;console.log(`day-1 taco payoff: ${hit}/${N} = ${(100*hit/N).toFixed(0)}%`,JSON.stringify(by));
