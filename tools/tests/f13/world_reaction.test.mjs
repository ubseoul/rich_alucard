import assert from 'node:assert/strict';
import {careerBoot} from './_career.mjs';
export async function test(root){
 const {c}=await careerBoot(root,{persona:'trap_committed'});
 // Organic offer handshake: all other authored prerequisites hold, no accepted offer seeded.
 c.RAState.patch('life.world.day',15);c.RAState.patch('life.clock.lastWakeDay',15);
 c.RALife.setFlag('ogunsRaveCompleted',true);c.RALife.addCar({id:'toyota_supra_mk4_001',price:78000});
 c.RAState.patch('life.resources.clout','MID');c.RAState.patch('life.resources.cloutPoints',30);
 for(const id of ['tunde','dre']){c.RARelations.meet(id);c.RARelations.add(id,20);}
 c.RAClock.sleep();assert.equal(c.RAFrag.read('F04','offer.status'),'available','canonical rave completion must open the Day16 offer');
 c.RAPhoneApps.get('warRoom').onAction('accept','',{refresh(){},message(){}});
 c.RAFrag.patch('F04','reportCards',[{id:'test-night',day:16,district:'inglewood',districtLabel:'Inglewood',success:false,tally:{cash:-50},squad:[{id:'tunde',status:'ACTIVE'},{id:'dre',status:'DOWNED'}]}]);
 c.RAClock.sleep();const mail=c.RALife.life().clock.mail.filter(x=>x.app==='warRoom');
 assert.equal(mail.length,1);assert.equal(mail[0].body,'Inglewood: rough night. Cash $-50.');
 assert(!c.RALife.life().clock.mail.find(x=>x.kind==='weekday').title.includes('NOTHING GOING ON'));
 assert.equal(c.RALife.flag('bedroomCompany')?.id,'tunde','only a returned active homie uses the frozen asleep-floor pose');
 c.RAClock.wake({first:true});assert.equal(c.RALife.life().clock.mail.filter(x=>x.app==='warRoom').length,1,'wake replay cannot duplicate mail');
 c.RAClock.sleep();assert.equal(c.RALife.life().clock.mail.filter(x=>x.app==='warRoom').length,0,'idle night must not repeat the stale PLAY report');
 // Eligibility alone is not fame arrival. Only the actual accepted ending marker closes the route.
 c.RAState.patch('life.momentum.fameEligible',true);c.RAClock.sleep();assert.equal(c.RAFrag.read('F04','offer.status'),'accepted');
 c.RAState.patch('life.momentum.fameFired',true);c.RAClock.sleep();assert.equal(c.RAFrag.read('F04','offer.status'),'closed_fame');assert.equal(c.RAFrag.read('F04','active'),false);
 console.log('PASS FINAL-A world reaction (canonical rave/fame seams, existing report mail, current-night-only, replay-safe, returned crew)');
}
