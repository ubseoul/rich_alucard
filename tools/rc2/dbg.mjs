import {open} from './harness.mjs';
const h=await open({width:390});const {page}=h;await page.waitForTimeout(1000);
console.log(await page.evaluate(async()=>{RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);document.querySelector('#startOverlay').style.display='none';await RAScenes.go('bedroom',{});
 const r=RAAdventures.start('A02',{from:'dev'});await RAScenes.go('adventure',{});await new Promise(r=>setTimeout(r,1500));
 const a=document.querySelector('#adventureScene');return JSON.stringify({r:!!r,active:RAAdventures.active(),has:!!a,env:a?.dataset.env,cls:a?.className,html:a?.innerHTML.slice(0,300),scene:RAScenes.current()});}));
console.log(h.errors.join('\n'));await h.close();
