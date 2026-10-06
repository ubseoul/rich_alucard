// Each launch is a labelled state/entry fixture, followed by real pointer/key inputs; no debug result injection.
import {open} from '../../../../tools/rc2/harness.mjs';import fs from 'node:fs';import {fileURLToPath} from 'node:url';
const out=fileURLToPath(new URL('../stove-b/',import.meta.url)),h=await open({width:390,height:844}),p=h.page,log={width:390,mode:'direct entry fixtures / real inputs / ordinary durations unless explicitly named',runs:[],errors:h.errors};
const shot=async n=>p.screenshot({path:out+n+'.png'});const pause=ms=>p.waitForTimeout(ms);let run;
async function launch(id,params,name){await p.evaluate(async ({id,params})=>{RAMinigames.quitActive();RAAdventures.abandon();await RAScenes.go('bedroom');window.__bResult=null;RAMinigames.launch(id,params).then(r=>window.__bResult=r);},{id,params});run={name,id,params,inputs:[]};log.runs.push(run);await pause(250);run.rule=await p.locator('.ra-minigame-rule-text').allTextContents();if(await p.locator('.ra-minigame-start').count())await p.locator('.ra-minigame-start').click();await pause(500);}
async function point(x,y,touch=false){const b=await p.locator('.ra-minigame canvas').boundingBox();const xx=b.x+b.width*x/270,yy=b.y+b.height*y/480;if(touch)await p.touchscreen.tap(xx,yy);else await p.mouse.click(xx,yy);}
async function drag(x,y,xx,yy){const b=await p.locator('.ra-minigame canvas').boundingBox();await p.mouse.move(b.x+b.width*x/270,b.y+b.height*y/480);await p.mouse.down();await p.mouse.move(b.x+b.width*xx/270,b.y+b.height*yy/480,{steps:8});await p.mouse.up();await pause(60);}
async function result(){await pause(150);run.result=await p.evaluate(()=>window.__bResult);run.money=await p.evaluate(()=>RALife.money());console.log(run.name,JSON.stringify(run.result));}
async function quit(){if(await p.locator('.ra-minigame-quit').count())await p.locator('.ra-minigame-quit').click();await result();}
try{await p.waitForFunction(()=>window.RARC3);await p.evaluate(async()=>{RAState.reset();document.querySelector('#startOverlay')?.remove();RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);await RAScenes.go('bedroom');});
await launch('slurp',{firstShift:true,seed:'stove-b'},'ramen real first bowl and normal wrong ingredient');
const itemsets=[['SHOYU','TONKOTSU','MISO'],['THIN','THICK'],['CHASHU','CHICKEN','SHRIMP'],['EGG','NORI','SCALLION','CORN','JOLLOF']];
// Freeform tutorial accepts all four taps. On the next ticket, use the highlighted recipe dataset, with one wrong tap first.
for(let i=0;i<4;i++){await point(45,255);await pause(130);}await pause(650);await shot('ramen-first-bowl');
const before=await p.locator('.ra-minigame-stage').evaluate(e=>({...e.dataset}));run.inputs.push({tutorialServed:true,nextTicket:before});await point(180,255);await pause(250);run.afterWrong=await p.locator('.ra-minigame-stage').evaluate(e=>({...e.dataset}));
// Follow live displayed ticket, not an injected recipe.
for(let i=0;i<4;i++){const s=await p.locator('.ra-minigame-stage').evaluate(e=>({step:+e.dataset.step,need:e.dataset.need}));let items=itemsets[s.step],ix=items.indexOf(s.need);if(ix<0)ix=0;const cols=items.length<=3?items.length:2,w=(254-6*(cols-1))/cols;await point(8+(ix%cols)*(w+6)+w/2,226+Math.floor(ix/cols)*80+30);await pause(200);}
await p.getByRole('button',{name:'CLOCK OUT',exact:true}).click();await shot('ramen-receipt');await p.locator('.slurp-shift-result button').click();await result();
}catch(e){log.failure=String(e);console.error(e);await shot('minigame-failure');}finally{fs.writeFileSync(out+'ramen-orders.json',JSON.stringify(log,null,2));await h.close();}
