// Real Chromium render sweep for existing adventure casts affected by the preserved Gbenga/Carlos registration.
// Review-only fixture labels identify the original screen key; no production story or dialogue is authored.
import {serve,launch,open,root} from '../tests/f15/_browser.mjs';
import {dryRun} from '../presentation-adventure-dryrun.mjs';
import {measure,evaluate} from '../tests/f15/_art.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const rows=(await dryRun()).rows.filter(r=>Object.values(r.castSpecs).some(a=>['gbenga','carlos'].includes(typeof a==='string'?a:a?.id)));
const arg=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];};
const out=path.resolve(root,arg('out')||'docs/evidence/build4/screens/character-widths');await mkdir(out,{recursive:true});
const s=await serve(),b=await launch(),results=[];
try{
 for(const [w,h] of [[360,740],[390,844],[430,932]]){
  const {page,ctx,errors,failed}=await open(b,s.url,{width:w,height:h});
  await page.evaluate(()=>{document.querySelector('#startOverlay')?.remove();document.querySelector('#devPanel')?.remove();});
  for(let i=0;i<rows.length;i++){
   const r=rows[i];
   await page.evaluate(async ({r,i,w})=>{
    RAAdventures.abandon();
    const id=`BUILD4_REVIEW_${w}_${i}`;
    RAAdventures.define({id,title:'BUILD-4 VISUAL REVIEW',lane:'review',start:'frame',available:()=>true,nodes:{frame:{env:r.env,actors:r.castSpecs,lines:[RAContent.N(r.env)],end:{outcome:'review'}}}});
    await RAAdventureScene.begin(id,{from:'qa'});
   },{r,i,w});
   await page.waitForSelector('#adventureScene');
   for(let j=0;j<10&&await page.locator('.adv-title:not([hidden])').count();j++){await page.mouse.click(w/2,70);await page.waitForTimeout(80);}
   await page.waitForTimeout(400);
   const m=await page.evaluate(measure);
   if(!m)throw new Error(`missing frame ${r.key}`);
   const checks=evaluate(m,`${w} ${r.key}`);
   results.push({width:w,key:r.key,refs:r.refs,reviewFixture:true,checks});
   const bad=checks.filter(c=>!c.ok);if(bad.length)throw new Error(bad.map(c=>c.msg).join('; '));
   await page.screenshot({path:path.join(out,`${w}_${String(i).padStart(2,'0')}_${r.env}.png`)});
  }
  if(errors.length||failed.length)throw new Error([...errors,...failed].join('\n'));
  await ctx.close();
 }
 console.log(`PASS character width sweep: ${rows.length} existing screen casts × 360/390/430; ${results.reduce((n,r)=>n+r.checks.length,0)} checks`);
}catch(e){console.error('FAIL',e.message);process.exitCode=1;}
finally{await b.close();await s.close();await writeFile(arg('out')?path.join(out,'results.json'):path.join(root,'docs/evidence/build4/character-widths.json'),JSON.stringify(results,null,2)+'\n');}
