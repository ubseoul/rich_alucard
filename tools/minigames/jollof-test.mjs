import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

export async function test(root){
 const context={};context.window=context;context.document={createElement:()=>({style:{},append(){},addEventListener(){},removeEventListener(){},getContext:()=>({}),getBoundingClientRect:()=>({left:0,top:0,width:270,height:480})}),querySelector:()=>null};
 context.performance=typeof performance!=='undefined'?performance:{now:()=>Date.now()};
 context.requestAnimationFrame=()=>0;context.cancelAnimationFrame=()=>{};
 vm.createContext(context);
 for(const file of ['js/engine/pixel.js','js/engine/minigames.js','js/minigames/jollof.js']){
  vm.runInContext(await readFile(path.join(root,file),'utf8'),context,{filename:file});
 }
 const logic=context.window.RAMinigameLogic.jollof;
 assert.ok(logic,'logic API registered');
 assert.ok(context.window.RAMinigames.get('jollof'),'jollof minigame registered');

 // blendQuality
 assert.equal(logic.blendQuality(0.1).texture,'chunky');
 assert.equal(logic.blendQuality(0.5).texture,'smooth');
 assert.equal(logic.blendQuality(0.9).texture,'watery');
 assert.ok(logic.blendQuality(0.5).textureScore>logic.blendQuality(0.1).textureScore);

 // fryResult
 const raw=logic.fryResult(0.1,false);
 const burnt=logic.fryResult(0.95,false);
 const perfect=logic.fryResult(0.6,true);
 assert.ok(perfect.flavor>raw.flavor&&perfect.flavor>burnt.flavor,'oil-floats stop scores best');
 assert.equal(perfect.tag.includes('oil floats'),true);

 // steamResult
 const under=logic.steamResult(0.1,false);
 const good=logic.steamResult(0.5,false);
 const crustBonus=logic.steamResult(0.8,true);
 assert.ok(good.textureAdj>under.textureAdj);
 assert.ok(crustBonus.smoke>good.smoke,'bottom-pot crust raises smoke score');

 // judges present with weights
 for(const id of ['nneka','uncle_sunday','bunmi','mom','lil_smack']){
  assert.ok(logic.judges[id],`judge ${id} present`);
  assert.ok(logic.judges[id].weights,`judge ${id} has weights`);
 }

 // scoreDish shape + ranges
 const stages={blend:0.5,fry:{darkness:0.6,stoppedAtSheen:true},season:{thyme:.5,curry:.5,bayleaf:.5,salt:.5,cubes:.5},steam:{liftTime:0.5,crust:false}};
 const dish=logic.scoreDish(stages,'nneka');
 for(const k of ['flavor','texture','color','smoke']){
  assert.ok(dish[k]>=1&&dish[k]<=10,`${k} in range`);
 }
 assert.equal(dish.total,dish.flavor+dish.texture+dish.color+dish.smoke);
 assert.ok(typeof dish.reaction==='string'&&dish.reaction.length>0);

 // dragon maggi crumble guarantees flavor 10
 const dragonStages={...stages,season:{...stages.season,dragon:true}};
 assert.equal(logic.scoreDish(dragonStages,'bunmi').flavor,10);

 // mom capped at 9/10 of max (36/40)
 const highStages={blend:0.5,fry:{darkness:0.6,stoppedAtSheen:true},season:{thyme:.8,curry:.5,bayleaf:.7,salt:.4,cubes:.3,dragon:true},steam:{liftTime:0.5,crust:true}};
 const momScore=logic.scoreDish(highStages,'mom');
 assert.ok(momScore.total<=36,'mom capped at 9/10 of 40');

 // lil_smack marked meaningless
 assert.equal(logic.scoreDish(stages,'lil_smack').meaningless,true);

 // total() aggregates judges
 const t=logic.total(stages,['nneka','bunmi']);
 assert.equal(Object.keys(t.judgeScores).length,2);
 assert.ok(t.average>0&&t.average<=40);
 assert.ok(t.breakdown.flavor>=1&&t.breakdown.flavor<=10);

 console.log('PASS jollof (blend/fry/steam stages, 5 judges, dragon crumble, mom cap, scoreDish/total shapes)');
}
