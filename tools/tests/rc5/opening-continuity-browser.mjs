import {open} from '../../rc2/harness.mjs';
import fs from 'node:fs';
const label=process.argv[2]||'before',out=`../continuity-${label}`;fs.mkdirSync(out,{recursive:true});
const h=await open({width:390,height:844,query:'?mute=1'}),p=h.page,e={kind:'fresh natural START, ordinary keyboard and UI choices',steps:[],errors:h.errors};
try{
 await p.locator('#startButton').click();await p.waitForFunction(()=>document.querySelector('#startOverlay')?.style.display==='none');
 for(let i=0;i<160;i++){
  const s=await p.evaluate(()=>({scene:RAScenes.current(),node:RAAdventures.active()?.node,money:RAState.get().life.resources.money,location:document.querySelector('.adv-location')?.textContent,text:document.querySelector('.adv-text')?.textContent,brain:RALife.flag('octopusBrain')}));
  if(!e.steps.length||e.steps.at(-1).node!==s.node){e.steps.push(s);if(s.node==='out'||s.scene==='battle')await p.screenshot({path:`${out}/${s.node||s.scene}.png`});}
  if(s.node==='out'&&s.text?.includes('throne room')){e.castle=s;await p.screenshot({path:`${out}/castle-narration.png`});}
  if(s.scene==='battle')break;
  const skip=p.getByRole('button',{name:'Skip animation',exact:true});
  if(await skip.isVisible())await skip.click();
  else {const choices=p.locator('.adv-choices button:visible');if(await choices.count())await choices.first().click();else await p.keyboard.press('Enter');}
  await p.waitForTimeout(180);
 }
 e.battle=await p.evaluate(()=>({snapshot:RACombat.snapshot(),money:RAState.get().life.resources.money}));
 for(let i=0;i<18;i++){
  const s=await p.evaluate(()=>RACombat.snapshot());if(s.battleOver)break;if(s.busy){await p.waitForTimeout(500);i--;continue;}
  const move=p.locator('[data-move="bite"]');if(await move.isVisible())await move.click();else {const fight=p.locator('[data-main="fight"]');if(await fight.isVisible())await fight.click();else await p.keyboard.press('Enter');}
  await p.waitForTimeout(800);
 }
 e.postCombat=await p.evaluate(()=>({snapshot:RACombat.snapshot(),money:RAState.get().life.resources.money}));
 await p.locator('#stealNo').waitFor({state:'visible',timeout:30000});await p.locator('#stealNo').click();await p.waitForFunction(()=>RAState.get().life.clock.started,null,{timeout:15000});
 e.firstWake=await p.evaluate(()=>({scene:RAScenes.current(),money:RAState.get().life.resources.money,flags:RAState.get().life.world.flags}));await p.screenshot({path:`${out}/first-wake.png`});
 await p.reload();await p.locator('#startButton').click();await p.waitForFunction(()=>document.querySelector('#startOverlay')?.style.display==='none');e.reload=await p.evaluate(()=>({money:RAState.get().life.resources.money,scene:RAScenes.current()}));
 e.visibleButtons=await p.locator('button:visible').allTextContents();
 fs.writeFileSync(`${out}/evidence.json`,JSON.stringify(e,null,2));console.log(JSON.stringify(e));
}catch(err){e.failure=err.stack;console.error(err.stack);process.exitCode=1;}finally{fs.writeFileSync(`${out}/evidence.json`,JSON.stringify(e,null,2));await h.close();}

