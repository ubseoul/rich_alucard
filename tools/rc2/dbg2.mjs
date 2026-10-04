import {serve,launch,open} from '../tests/f15/_browser.mjs';
const s=await serve(),browser=await launch();const {page}=await open(browser,s.url,{width:390,dpr:1});
console.log(await page.evaluate(()=>{RAState.reset();RAState.patch('life.clock.started',true);let err=null;try{RAAdventures.get('F15_ROSALYN_L4').testSetup(window)}catch(e){err=String(e)}return JSON.stringify({err,status:RAF15.status('F15_ROSALYN_L4')});}));
await browser.close();await s.close();
