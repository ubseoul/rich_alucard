// Eleven deterministic canonical mission settlements, not a giant simulation
// and not a natural campaign. Nominal $5K club spend per completed story day.
import {boot} from '../rc3/policy-test.mjs';import fs from 'node:fs';
const output=[];
for(const buyS15 of [false,true]){
 const c=await boot(process.cwd()),G=c.RARC3,L=c.RALife;
 L.setFlag('throneDone',true);L.setFlag('ogunsRaveCompleted',true);
 G.patch({story:true,action:true,paid:false,earnedIncome:0});G.claimCash();L.spend(5000);L.setFlag('stripClubLastDay',1);c.RAClock.sleep();if(buyS15)c.RACars.buy('s15');
 const finish=[()=>c.RANewOga.completeM1('STICK_UP'),()=>c.RANewOga.workOffM2(),()=>c.RANewOga.completeM3('complete'),()=>c.RANewOga.completeM4('walk_in'),()=>c.RANewOga.completeM5({outcome:'SUCCESS',amountCaught:30000}),()=>c.RANewOga.completeM6({walked:true}),()=>c.RANewOga.completeM7('take'),()=>c.RAF07.completeM8('win'),()=>c.RANewOgaLadder.completeM9('nah'),()=>c.RANewOgaLadder.completeM10(),()=>c.RANewOgaLadder.completeVampgpt('say_less')];
 const rows=[];for(const complete of finish){const before=L.money(),mission=G.pendingMission();complete();G.patch({story:true,action:true});G.claimCash();const after=L.money(),supplement=G.read().cash;L.spend(5000);L.setFlag('stripClubLastDay',L.today().day);rows.push({day:L.today().day,mission,before,afterCash:after,supplement,afterClub:L.money()});c.RAClock.sleep();}
 output.push({kind:'seeded canonical settlements, not natural play',buyS15,clubSpendPerStoryDay:5000,rows,hallPrice:250000,requiredWithReserve:255000,finalCash:L.money(),canBuyHall:L.money()>=255000});
}
fs.mkdirSync('docs/rc4/evidence/B2',{recursive:true});fs.writeFileSync('docs/rc4/evidence/B2/economy.json',JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output.map(x=>({buyS15:x.buyS15,finalCash:x.finalCash,canBuyHall:x.canBuyHall})),null,2));
