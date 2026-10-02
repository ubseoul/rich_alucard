import assert from 'node:assert/strict';
import {game} from './_lib.mjs';
export async function test(root){
 const c=await game(root);assert.equal(c.RAPhoneApps.get('moves'),null,'home move swapping is dark');
 c.RAScenes={current:()=> 'bedroom'};c.RAFeatures.set('F02.iron_and_grace',true);c.RAIronMoves.unlock();
 const M=c.RAIronMoves;assert.equal(M.equip(0,'hex'),false,'unknown moves cannot be equipped');
 c.RAState.patch('life.combat.learnedMoves',['petty','hex','veil','seance','ringer']);
 const known=JSON.stringify(M.known());assert.equal(M.equip(0,'hex'),true);assert.equal(M.equip(1,'hex'),true);
 const eq=c.RAState.get().life.combat.equippedMoves;assert.equal(eq.length,4);assert.equal(eq.filter(x=>x==='hex').length,1,'equipped move swaps slots instead of duplicating');assert.equal(JSON.stringify(M.known()),known,'canon and learned moves remain known');
 assert.equal(M.equip(4,'ringer'),false,'four slots stay fixed');c.RAScenes.current=()=> 'adventure';assert.equal(M.equip(0,'ringer'),false,'swapping stays at home');
 console.log('PASS source-authored MOVES receiver (dark, known-only, four slots, no duplicate/lost move, home-only)');
}
