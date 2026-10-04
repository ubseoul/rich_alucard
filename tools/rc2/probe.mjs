import {open} from './harness.mjs';
const h=await open({width:390});const {page}=h;await page.waitForTimeout(1200);
const r=await page.evaluate(()=>{const out={};
 out.peopleApi=Object.keys(window.RABtfPeople||{});out.envApi=Object.keys(window.RAEnvironments||{});out.artKeys=Object.keys(window.RAArtRegistry||{});
 out.danceish=Object.keys(window).filter(k=>/dance|stage|rave|party/i.test(k)).slice(0,40);
 return out;});
console.log(JSON.stringify(r,null,1));await h.close();
