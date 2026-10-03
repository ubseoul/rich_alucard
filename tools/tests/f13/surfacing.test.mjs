import assert from 'node:assert/strict';
import {full} from '../if1/_lib.mjs';
export async function test(root){
 const c=await full(root);
 c.RAClock.wake({first:true});
 const def=id=>({id,title:id,lane:'home',start:'done',nodes:{done:{end:{outcome:'done'}}}});
 c.RAAdventures.define(def('FINAL_FIRST_VISIT'));
 c.RAAdventures.define({...def('FINAL_REPEAT'),repeatable:true});
 c.RATemptations.define([{id:'final:first',line:'first',adventure:'FINAL_FIRST_VISIT'},{id:'final:repeat',line:'repeat',adventure:'FINAL_REPEAT',repeatable:true},{id:'final:spine',line:'spine',priority:999}]);
 c.RAState.patch('life.temptations.live',[{id:'final:first',line:'first',adventure:'FINAL_FIRST_VISIT',expiresDay:9},...Array.from({length:6},(_,i)=>({id:'repeat:'+i,line:'repeat',adventure:'FINAL_REPEAT',expiresDay:9})),{id:'final:spine',line:'spine',expiresDay:9}]);
 const lines=c.RATemptations.whatWeOn();assert.equal(lines.length,6);assert.equal(lines[0].id,'final:spine');assert.equal(lines[1].id,'final:first','unvisited authored invite remains above repeatable noise');
 c.RAVampGPT.defineLane('money',Array.from({length:6},(_,i)=>({id:'final:lane:'+i,label:'entry '+i,go:()=>true})));
 const surfaced=new Set();for(let day=1;day<=12;day++){c.RAState.patch('life.world.day',day);const lane=c.RAVampGPT.lane('money');assert(lane.length<=4);for(const x of lane)surfaced.add(x.go);}
 for(let i=0;i<6;i++)assert(surfaced.has('final:lane:'+i),'later eligible lane entries must surface across days');
 c.RAPlaces.define([{id:'final:locked',label:'locked',adventure:'FINAL_FIRST_VISIT',when:()=>false},{id:'final:unvisited',label:'unvisited',adventure:'FINAL_FIRST_VISIT',order:9999}]);
 assert(!c.RAPlaces.visible().find(x=>x.id==='final:locked'),'surfacing cannot bypass eligibility');
 assert(c.RAPlaces.visible().find(x=>x.id==='final:unvisited'));
 assert.deepEqual(JSON.parse(JSON.stringify([1,15,35].map(c.RATemptations.cadence))),[{min:1,max:3,cap:4},{min:3,max:5,cap:8},{min:5,max:8,cap:12}]);
 console.log('PASS FINAL-A surfacing (first visits, story priority, four-card rotation, locked eligibility, unchanged cadence)');
}
