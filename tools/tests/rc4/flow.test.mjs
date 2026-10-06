import assert from 'node:assert/strict';
import {boot} from '../../rc3/policy-test.mjs';
const plain=x=>JSON.parse(JSON.stringify(x));
export async function test(root){
 const c=await boot(root),g=c.RARC3,l=c.RALife,a=c.RAAdventures;
 // Restored voluntary music is reachable without reopening unrelated cuts or story quotas.
 assert.equal(g.apps.length,9);
 for(const id of ['COOK','A14','SHOW','A15','A16','IMANI_BOBA'])assert.equal(g.allowed(id),true,id);
 assert.equal(g.allowed('PIER'),false);
 assert.equal(a.get('A00').nodes.fall1.next,'try2','routing cannot skip requested repeated falls');
 assert.equal(a.get('A00').nodes.brain_done.next,'merge','visible acquisition/merge remains authored');
 assert.equal(g.canStart('A14','wake'),false,'music never becomes mandatory wake dispatch');
 const musicAvailable=a.available;a.available=()=>false;
 assert.equal(g.canStart('COOK','phone'),false,'existing music availability stays authoritative');
 a.available=musicAvailable;
 assert.equal(g.canStart('A14','phone'),a.available('A14'));
 const pitch=a.get('NEW_OGA_M1').nodes.pitch.lines();
 assert.equal(pitch[0][1],'Rich came to Los Angeles for music. He needs money to live while he works on that.');
 assert(pitch.some(x=>x[0]==='rich'&&x[1]==='…brother. why would I jug the plug.'),'semantic adapter preserves normalized Rich brother line');
 assert(pitch.some(x=>x[0]==='vampgpt'&&x[1]==='oga. you need funds.'));
 assert(pitch.some(x=>x[0]==='vampgpt'&&x[1]==='cash first. what you do with it is your business.'));
 assert.equal(c.RABtfPeople.get('smallie_cousin_girlfriend').dateable,false);
 assert.equal(c.RABtfPeople.get('smallie_cousin_girlfriend').age,25);
 assert.equal(g.canStart('IMANI_BOBA','rc3-maps'),a.available('IMANI_BOBA'));
 for(const id of ['A14','SHOW']){
  assert.equal(g.settleAttempt(id,'perform',{quit:true,outcome:'quit'}),'settled','optional set can quit honestly');
  for(let i=0;i<3;i++)g.settleAttempt(id,'perform',{outcome:'lose'});
  assert.equal(g.attemptAllowed(id,'perform'),true,'optional music has no mandatory retry-day lock');
 }
 l.setFlag('throneDone',true);l.setFlag('ogunsRaveCompleted',true);
 c.RAState.patch('life.world.day',4);g.patch({story:false,action:false,paid:false,earnedIncome:0});
 const cash=l.money();assert.equal(g.canSleep(),true,'quiet rest needs no attendance');
 assert.equal(g.prepareSleep(),true);assert.equal(l.money(),cash,'no free floor for skipped work');
 assert.equal(a.available('RC3_FIGHT'),false,'generic Cousin never automatically offered');
 const available=a.available;a.available=()=>false;
 const markup=g.activityMarkup({esc:String,button:(text,action)=>text+' '+action});
 assert.equal(markup.includes('RAMEN SHIFT'),false,'suggestions never advertise unavailable work');
 a.available=available;
 g.patch({story:true,action:true});l.addMoney(9000);l.spend(8000);
 assert.equal(g.next().kind,'rest');assert.equal(g.canSleep(),true,'club not required');
 g.prepareSleep();assert.equal(g.read().cash,19000,'spending does not lower gross earnings');
 const settled=l.money();g.prepareSleep();assert.equal(l.money(),settled);
 const again=await boot(root,{seedState:plain(c.RAState.get())});
 again.RARC3.prepareSleep();assert.equal(again.RALife.money(),settled,'reload never duplicates settlement');
 assert.equal(again.RALife.life().history.filter(x=>x.id==='rc3:cash:4').length,1);
 const lostMarker=plain(c.RAState.get());delete lostMarker.life.world.flags.rc3Day;
 lostMarker.life.newOga.lastMissionDay=4;
 const recovered=await boot(root,{seedState:lostMarker});recovered.RARC3.prepareSleep();
 assert.equal(recovered.RALife.money(),settled,'existing receipt beats missing day marker');
 assert.equal(recovered.RARC3.read().paid,true);
 const old=plain(c.RAState.get());old.life.world.flags.rc3Day={...g.read(),action:false,paid:true};
 delete old.life.world.flags.stripClubLastDay;
 const migrated=await boot(root,{seedState:old});assert.equal(migrated.RARC3.read().action,true);
 assert.equal(migrated.RARC3.canSleep(),true);assert.equal(migrated.RALife.money(),settled);
 const before=l.money();g.patch({action:false});assert.equal(g.creditActivity('slurp',{quit:true}),false);
 assert.equal(g.read().action,false);assert.equal(g.creditActivity('slurp',{outcome:'done'}),true);
 assert.equal(l.money(),before,'credit never compensates economically');
 c.RAState.patch('life.world.day',5);assert.equal(g.read().story,false);
 assert.equal(g.read().paid,false);g.prepareSleep();assert.equal(l.money(),before);
 // A completed finale cannot regenerate the daily story floor on later quiet days.
 c.RANewOga.patch({finaleDone:true,lastMissionDay:4});assert.equal(g.read().story,false);
 console.log('PASS campaign flow: optional club/rest, no filler encounter, gross floor, atomic/reload/legacy recovery, no post-finale floor farming');
}
