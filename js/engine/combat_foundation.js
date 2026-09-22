(function(){
 const defs=()=>window.RACombatDefinitions;
 const clone=value=>JSON.parse(JSON.stringify(value));
 function encounter(id){return defs().getEncounter(id)}
 function createBattleState(id){const definition=encounter(id),player=defs().combatants[definition.player],enemy=defs().combatants[definition.enemy];return {encounterId:definition.id,definition,player:{id:player.id,hp:player.maxHP,maxHP:player.maxHP},enemy:{id:enemy.id,hp:enemy.maxHP,maxHP:enemy.maxHP},revengeStored:0,phase:'player',over:false};}
 function emit(state,type,detail={}){const event={type,encounterId:state.encounterId,...detail};document.dispatchEvent(new CustomEvent('ra:battle-event',{detail:event}));return event}
 function selectEnemyMove(state,random=Math.random){const policy=state.definition.enemySelection,options=policy?.moves||[];const total=options.reduce((sum,item)=>sum+Math.max(0,Number(item.weight)||0),0);let roll=random()*total;for(const item of options){roll-=Math.max(0,Number(item.weight)||0);if(roll<=0)return defs().moves[item.move]}return defs().moves[options.at(-1)?.move]||null}
 function applyDamage(state,target,amount,{storeRevenge=false}={}){const actor=state[target],actual=Math.max(0,Math.min(actor.hp,Number(amount)||0));actor.hp-=actual;if(storeRevenge)state.revengeStored+=actual;emit(state,'damage',{target,amount:actual,revengeStored:state.revengeStored});return actual}
 function consumeRevenge(state){const amount=state.revengeStored;state.revengeStored=0;emit(state,'revenge-consumed',{amount});return amount}
 function route(state,result){const key=result==='victory'?state.definition.victoryRoute:state.definition.defeatRoute;emit(state,'route',{result,route:key});return key}
 function runSelfTest(){const state=createBattleState('jdm'),move=selectEnemyMove(state,()=>0);if(move?.id!=='importer_shove')throw new Error('weighted enemy selection failed');if(applyDamage(state,'player',16,{storeRevenge:true})!==16||state.revengeStored!==16)throw new Error('revenge storage failed');if(consumeRevenge(state)!==16||state.revengeStored!==0)throw new Error('revenge reset failed');if(route(state,'defeat')!=='jdm-defeat')throw new Error('defeat hook failed');return true}
 window.RACombatFoundation={encounter,createBattleState,emit,selectEnemyMove,applyDamage,consumeRevenge,route,runSelfTest,clone};
})();
