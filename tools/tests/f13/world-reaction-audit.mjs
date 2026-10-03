// Fixture comparison of existing authored wire seams; these seeded prerequisites are not career evidence.
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {careerBoot} from './_career.mjs';
const repo=process.cwd(),out=path.join(repo,'docs/evidence/final_a/stage4-world');
async function capture(root){
 const {c}=await careerBoot(root,{persona:'trap_committed'});
 c.RAState.patch('life.world.day',15);c.RAState.patch('life.clock.lastWakeDay',15);c.RALife.setFlag('ogunsRaveCompleted',true);
 c.RALife.addCar({id:'toyota_supra_mk4_001',price:78000});c.RAState.patch('life.resources.clout','MID');c.RAState.patch('life.resources.cloutPoints',30);
 for(const id of ['tunde','dre']){c.RARelations.meet(id);c.RARelations.add(id,20);}
 c.RAClock.sleep();const offer=c.RAFrag.read('F04','offer.status');
 // Hold offer acceptance constant to isolate the report wire, even when the baseline handshake failed.
 c.RAFrag.patch('F04','offer.status','accepted');c.RAFrag.patch('F04','active',true);
 c.RAFrag.patch('F04','reportCards',[{id:'fixture-night',day:16,district:'inglewood',districtLabel:'Inglewood',success:false,tally:{cash:-50},squad:[{id:'tunde',status:'ACTIVE'},{id:'dre',status:'DOWNED'}]}]);
 c.RAClock.sleep();const report=c.RAWakeBus.nightReport.last(),mail=c.RALife.life().clock.mail.filter(x=>x.app==='warRoom'),company=c.RALife.flag('bedroomCompany');
 c.RAClock.wake({first:true});const replayMail=c.RALife.life().clock.mail.filter(x=>x.app==='warRoom').length;
 c.RAClock.sleep();const idleReport=c.RAWakeBus.nightReport.last(),idleMail=c.RALife.life().clock.mail.filter(x=>x.app==='warRoom').length;
 c.RAState.patch('life.momentum.fameEligible',true);c.RAClock.sleep();const eligibleStatus=c.RAFrag.read('F04','offer.status');
 c.RAState.patch('life.momentum.fameFired',true);c.RAClock.sleep();
 return {fixture:'same canonical rave/car/clout/relationships; same stored authored report; acceptance seeded after offer observation',offer,report,mail,company,replayMail,idleReport,idleMail,eligibleStatus,arrivedStatus:c.RAFrag.read('F04','offer.status'),activeAfterFame:c.RAFrag.read('F04','active')};
}
await mkdir(out,{recursive:true});
const before=await capture(path.join(repo,'work/final_a/base')),after=await capture(repo);
await writeFile(path.join(out,'reaction-before-after.json'),JSON.stringify({before,after},null,1)+'\n');
console.log(JSON.stringify({before:{offer:before.offer,mail:before.mail.length,company:before.company,afterFame:before.arrivedStatus},after:{offer:after.offer,mail:after.mail.length,company:after.company,afterFame:after.arrivedStatus}}));
process.exit();
