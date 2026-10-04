import {open} from './harness.mjs';
const h=await open({width:390});const {page}=h;await page.waitForTimeout(1000);
await page.evaluate(()=>{RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);document.querySelector('#startOverlay').style.display='none';});
await page.evaluate(async()=>{await RAScenes.go('bedroom',{});RACombat2.run('bruce_loose',{});});await page.waitForTimeout(700);
const r=await page.evaluate(async()=>{const root=document.querySelector('.c2-scene');const p=RAEnemyFX.attack({root,enemyId:'bruce_loose',moveId:'kick',dmg:20,attacker:document.querySelector('.c2-enemy'),target:document.querySelector('.c2-rich')});
 await new Promise(r=>setTimeout(r,300));const c=document.querySelector('.rc2-enemy-fx');const out={root:!!root,canvas:!!c};if(c){const b=c.getBoundingClientRect();out.rect=[b.x,b.y,b.width,b.height];out.z=getComputedStyle(c).zIndex;out.frame=c.dataset.frame;const d=c.getContext('2d').getImageData(0,0,270,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;out.px=n;}
 out.V=JSON.stringify(RACombatPixelFX.helpers.view(root,document.querySelector('.c2-rich'),document.querySelector('.c2-enemy')).enemy);await p;return out;});
console.log(JSON.stringify(r));console.log(h.errors.join('\n'));await h.close();
