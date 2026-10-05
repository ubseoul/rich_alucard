// Isolated before/after display-cap fixtures; these are not player careers or added canon.
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {full} from '../if1/_lib.mjs';
const repo=process.cwd(),out=path.join(repo,'docs/evidence/final_a/stage4-world');
async function capture(root){
 const c=await full(root);c.RAClock.wake({first:true});
 const def=id=>({id,title:id,lane:'home',start:'done',nodes:{done:{end:{outcome:'done'}}}});
 c.RAAdventures.define(def('FINAL_FIRST_VISIT'));
 c.RAAdventures.define({...def('FINAL_REPEAT'),repeatable:true});
 c.RATemptations.define([{id:'final:first',line:'fixture',adventure:'FINAL_FIRST_VISIT'},{id:'final:repeat',line:'fixture',adventure:'FINAL_REPEAT',repeatable:true},{id:'final:spine',line:'fixture',priority:999}]);
 c.RAState.patch('life.temptations.live',[{id:'final:first',line:'fixture',adventure:'FINAL_FIRST_VISIT',createdDay:1,expiresDay:9},...Array.from({length:6},(_,i)=>({id:'repeat:'+i,line:'fixture',adventure:'FINAL_REPEAT',createdDay:1,expiresDay:9})),{id:'final:spine',line:'fixture',createdDay:1,expiresDay:9}]);
 const wants=c.RATemptations.whatWeOn().map(x=>x.id);
 c.RAVampGPT.defineLane('money',Array.from({length:6},(_,i)=>({id:'final:lane:'+i,label:'fixture',go:()=>true})));
 const laneDays=[];for(let day=1;day<=12;day++){c.RAState.patch('life.world.day',day);laneDays.push(c.RAVampGPT.lane('money').map(x=>x.go));}
 c.RAPlaces.define([{id:'final:visited',label:'fixture',adventure:'FINAL_REPEAT',order:1},{id:'final:unvisited',label:'fixture',adventure:'FINAL_FIRST_VISIT',order:9999},{id:'final:locked',label:'fixture',adventure:'FINAL_FIRST_VISIT',when:()=>false}]);
 const visible=c.RAPlaces.visible().map(x=>x.id);
 return {method:'identical isolated fixture state/definitions; not career exposure or added product content',wants,wantsCap:wants.length,firstVisitVisible:wants.includes('final:first'),storyFirst:wants[0]==='final:spine',laneDays,laneUnique:[...new Set(laneDays.flat())].length,laneMax:Math.max(...laneDays.map(x=>x.length)),unvisitedPlaceIndex:visible.indexOf('final:unvisited'),visitedPlaceIndex:visible.indexOf('final:visited'),lockedVisible:visible.includes('final:locked'),cadence:[1,15,35].map(c.RATemptations.cadence)};
}
await mkdir(out,{recursive:true});const before=await capture(path.join(repo,'work/final_a/base')),after=await capture(repo);
await writeFile(path.join(out,'surfacing-before-after.json'),JSON.stringify({before,after},null,1)+'\n');
console.log(JSON.stringify({before:{first:before.firstVisitVisible,laneUnique:before.laneUnique,unvisitedIndex:before.unvisitedPlaceIndex},after:{first:after.firstVisitVisible,laneUnique:after.laneUnique,unvisitedIndex:after.unvisitedPlaceIndex},caps:[before.wantsCap,after.wantsCap,before.laneMax,after.laneMax],sameCadence:JSON.stringify(before.cadence)===JSON.stringify(after.cadence)}));process.exit();
