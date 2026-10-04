// A fresh ordinary OPEN entry isolates the observed hoarder policy loop; original rows stay immutable.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {careerBoot} from './_career.mjs';
import {walk} from '../../btf-test.mjs';
const {c}=await careerBoot(process.cwd());c.RAClock.wake({first:true});
const A=c.RAAdventures,started=A.start('A45',{from:'go-somewhere'});let node=started.node,steps=0;
for(;node&&steps<180;steps++){
 const n=A.enter(node).node;if(n.end)break;
 if(n.choices){const list=A.choicesFor(node).filter(x=>!x.locked);node=A.choose(node,list[0].index);}
 else node=A.nextOf(node);
}
assert.equal(node,'soak');assert.equal(steps,180);
const visibleChoices=A.choicesFor('soak').map(x=>({label:x.label,locked:x.locked,next:A.get('A45').nodes.soak.choices[x.index].next}));
assert(visibleChoices.some(x=>x.label==='GET OUT'&&x.next==='end'&&!x.locked));A.abandon();
walk(c,'A45',{pick:choices=>{const getOut=choices.findIndex(x=>x.label==='GET OUT');return getOut>=0?getOut:0;}});
assert(A.isDone('A45'));
const result={method:'Supplemental ordinary fresh-save OPEN A45 graph reproduction; no cash/eligibility/ownership fixtures. The original post18 hoarder1 Day25 observation remains unchanged. This proves the same first-choice policy loop and the actual available player exit, rather than replaying the entire Day25 career or claiming browser input coverage.',observedPopulation:{persona:'hoarder',seed:1,day:25,id:'A45',error:'bounded walker at soak',cash:81832},policyLoop:{firstChoiceOnly:true,steps,node},visibleChoices,actualGetOutCompleted:A.isDone('A45'),classification:'Harness-only first-choice policy remains in STAY LONGER indefinitely; original loop-exit keyword list omits GET OUT. The production graph exposes a working GET OUT choice.'};
await writeFile('docs/evidence/final_a/stage5/soak-walker-repro.json',JSON.stringify(result,null,1)+'\n');console.log(JSON.stringify({steps,node,actualGetOutCompleted:result.actualGetOutCompleted,classification:'harness-only policy loop'}));process.exit();
