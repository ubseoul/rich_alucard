// OPEN runtime definitions only. Function text is diagnostic gate provenance, not a reachability measurement.
import {writeFile} from 'node:fs/promises';
import {careerBoot} from './_career.mjs';
const {c}=await careerBoot(process.cwd()),source=x=>typeof x==='function'?String(x):x??null;
const adventures=c.RAAdventures.all().map(a=>({id:a.id,title:source(a.title),lane:a.lane,scope:a.scope,repeatable:!!a.repeatable,cooldown:a.cooldown??null,available:source(a.available)}));
const wants=c.RATemptations.defs().map(t=>({id:t.id,adventure:source(t.adventure),action:t.action??null,thread:source(t.thread),minDay:t.minDay??null,maxDay:t.maxDay??null,cooldown:t.cooldown??null,life:t.life,weight:source(t.weight),priority:t.priority??null,when:source(t.when)}));
const wake=c.RAWakeTriggers.list().map(t=>({adventure:t.adventure,priority:t.priority??null,when:source(t.when)}));
const rooms=c.RACastle.ROOMS.map(r=>({id:r.id,price:r.price,go:r.go,needs:source(r.needs)}));
const cars=Object.entries(c.RACars.CATALOG).map(([id,a])=>({id,price:a.price,store:a.store,needsRep:a.needsRep??null}));
const places=c.RAPlaces.all().map(p=>({id:p.id,label:source(p.label),hidden:!!p.hidden,adventure:source(p.adventure),when:source(p.when),go:source(p.go)}));
const chainEntries=[];
for(const a of c.RAAdventures.all())for(const [node,n] of Object.entries(a.nodes||{})){
 if(typeof n.end?.chain==='string')chainEntries.push({target:n.end.chain,from:a.id,node,choice:null,producer:source(n.end.chain)});
 if(typeof n.end?.chain==='function')for(const child of adventures)if(new RegExp('(?:[\'"`])'+child.id+'(?:[\'"`])').test(String(n.end.chain)))chainEntries.push({target:child.id,from:a.id,node,choice:null,producer:String(n.end.chain)});
 if(typeof n.choices==='function'&&/['"]chain['"]/.test(String(n.choices)))for(const child of adventures)if(new RegExp('(?:[\'"`])'+child.id+'(?:[\'"`])').test(String(n.choices)))chainEntries.push({target:child.id,from:a.id,node,choice:null,producer:String(n.choices)});
 for(const choice of (Array.isArray(n.choices)?n.choices:[]))if(typeof choice.fx==='function'&&/['"]chain['"]/.test(String(choice.fx)))for(const child of adventures)if(new RegExp('(?:[\'"`])'+child.id+'(?:[\'"`])').test(String(choice.fx)))chainEntries.push({target:child.id,from:a.id,node,choice:source(choice.label),producer:String(choice.fx)});
 if(typeof n.enter==='function'&&/['"]chain['"]/.test(String(n.enter)))for(const child of adventures)if(new RegExp('(?:[\'"`])'+child.id+'(?:[\'"`])').test(String(n.enter)))chainEntries.push({target:child.id,from:a.id,node,choice:null,producer:String(n.enter)});
}
await writeFile('docs/evidence/final_a/stage5/open-gate-inventory.json',JSON.stringify({method:'OPEN runtime metadata read only; exact gate function provenance, not seeded availability or player observations',adventures,wants,wake,rooms,cars,places,chainEntries},null,1)+'\n');
console.log(JSON.stringify({adventures:adventures.length,wants:wants.length,wake:wake.length,rooms:rooms.length,cars:cars.length}));process.exit();
