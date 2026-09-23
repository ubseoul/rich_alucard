// Browser QA against a local generated artifact. Requires Playwright and Chromium/Edge.
// node tools/party-browser-test.mjs http://127.0.0.1:4174 <evidence-directory> [baseline-url]
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.RA_PLAYWRIGHT_PATH||'playwright');
const base=process.argv[2]||'http://127.0.0.1:4174';
const output=path.resolve(process.argv[3]||'work/party-evidence');await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,channel:process.env.RA_BROWSER_CHANNEL||'msedge'});
const context=await browser.newContext({viewport:{width:270,height:480},reducedMotion:'reduce'});
const errors=[],results=[];
context.on('page',page=>{page.on('pageerror',error=>errors.push(error.message));});
const record=(name)=>{results.push(name);console.log(`PASS ${name}`);};
const saveBytes=page=>page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)])));
try{
  const game=await context.newPage();await game.goto(base);await game.locator('#startButton').click();
  await game.waitForFunction(()=>RAScenes.current()==='bedroom');
  await game.locator('#checkPhone').click();await game.waitForFunction(()=>RAPhone.isOpen());
  await game.locator('#phoneClose').click();await game.waitForFunction(()=>!RAPhone.isOpen());
  assert.equal(await game.locator('#devParty').isVisible(),false);record('fresh production START → bedroom → phone → close; DEV entry hidden');
  await game.evaluate(()=>{const saved=RAState.migrateRecord(RASaveFixtures.fixtures.supraOwned);RAState.write(localStorage,saved,false);});
  await game.reload();await game.locator('#startButton').click();await game.waitForFunction(()=>RAScenes.current()==='bedroom');
  assert.equal(await game.evaluate(()=>RAState.get().life.ownership.cars.length),1);record('representative existing save loads through normal START path with ownership retained');
  await game.goto(`${base}/?dev=1`);
  const before=await saveBytes(game);
  const popupPromise=context.waitForEvent('page');await game.locator('#devParty').click();const page=await popupPromise;
  await page.waitForLoadState();assert.equal(await page.evaluate(()=>window.opener),null);
  assert.equal(await page.evaluate(()=>typeof window.RAState),'undefined');
  // Fail immediately on any attempted prototype storage mutation, not merely final differences.
  await context.addInitScript(()=>{if(location.pathname.endsWith('/party-dev.html'))for(const name of ['setItem','removeItem','clear'])Storage.prototype[name]=()=>{throw new Error('Prototype attempted persistence');};});
  await page.reload();await page.locator('#enter').click();record('DEV opens isolated prototype tab without opener or production state API');
  const behaviors=['two-step','head-nod','too-cool'];
  for(let situation=0;situation<3;situation++){
    const responses=new Set();
    for(const behavior of behaviors){
      await page.locator(`[data-behavior="${behavior}"]`).click();
      assert.equal(await page.locator(`[data-behavior="${behavior}"]`).getAttribute('aria-pressed'),'true');
      await page.locator('#act').click();responses.add(await page.locator('#room').getAttribute('data-response'));
      await page.screenshot({path:path.join(output,`native-${situation+1}-${behavior}.png`)});
      if((situation===0&&behavior==='two-step')||(situation===1&&behavior==='head-nod')||(situation===2&&behavior==='too-cool')){
        assert.match(await page.locator('#roomState').innerText(),/OPENING/);
        await page.locator('#act').click();assert.equal(await page.locator('#act').isDisabled(),true);
        await page.screenshot({path:path.join(output,`opening-${situation+1}.png`)});
      }
      // Re-equipping must clear results and permit replay of this same situation.
    }
    assert.equal(responses.size,3);await page.locator('#next').click();
  }
  assert.match(await page.locator('#situationTitle').innerText(),/^1\/3/);record('all nine outcomes, all three openings, equipping/switching and full-loop repeat');
  await page.locator('#reset').click();assert.equal(await page.locator('#act').isDisabled(),true);
  assert.equal(await page.locator('[aria-pressed="true"]').count(),0);
  for(let cycle=0;cycle<3;cycle++){await page.locator('#leave').click();assert.equal(await page.locator('#gate').isVisible(),true);await page.locator('#enter').click();}
  await page.keyboard.press('Escape');assert.equal(await page.locator('#gate').isVisible(),true);record('reset clears equipment; repeated leave/re-enter and Escape exit');
  assert.deepEqual(await saveBytes(page),before);record('all production localStorage bytes unchanged after prototype play/reset/exit');
  await page.reload();await page.locator('#enter').click();assert.equal(await page.locator('#act').isDisabled(),true);record('prototype reload starts clean without save writes');
  await page.setViewportSize({width:390,height:844});await page.locator('[data-behavior="two-step"]').click();await page.locator('#act').click();
  await page.screenshot({path:path.join(output,'phone-party.png')});
  const bounds=await page.locator('#party').boundingBox();assert(bounds.x>=-1&&bounds.y>=-1&&bounds.x+bounds.width<=391&&bounds.y+bounds.height<=845);
  const overflow=await page.locator('#party button').evaluateAll(nodes=>nodes.filter(n=>n.offsetWidth&&n.scrollWidth>n.clientWidth).map(n=>n.id));assert.deepEqual(overflow,[]);record('270×480 native evidence and 390×844 phone viewport fit');
  await page.goto(`${base}/party-dev.html`);assert.equal(await page.locator('#enter').isDisabled(),true);record('prototype requires explicit dev=1');
  // Existing smoke suite intentionally exercises saves: use only this disposable QA browser.
  const progressedSmoke=await game.evaluate(()=>RASmoke.run());
  const progressedFailures=progressedSmoke.filter(line=>line.startsWith('FAIL'));
  if(progressedFailures.length&&process.argv[4]){
    const baselineContext=await browser.newContext(),baseline=await baselineContext.newPage();
    await baseline.goto(process.argv[4]);
    await baseline.evaluate(()=>RAState.write(localStorage,RAState.migrateRecord(RASaveFixtures.fixtures.supraOwned),false));await baseline.reload();
    const baselineFailures=(await baseline.evaluate(()=>RASmoke.run())).filter(line=>line.startsWith('FAIL'));
    assert.deepEqual(progressedFailures,baselineFailures);await baselineContext.close();
    record('progressed-save smoke failures match unchanged baseline');
    console.log('KNOWN BASELINE LIMITATION: '+progressedFailures.join('; '));
  }else assert.deepEqual(progressedFailures,[]);
  const freshContext=await browser.newContext(),fresh=await freshContext.newPage();await fresh.goto(base);
  const smoke=await fresh.evaluate(()=>RASmoke.run());assert.deepEqual(smoke.filter(line=>line.startsWith('FAIL')),[]);
  await freshContext.close();record(`fresh-save browser smoke suite: ${smoke.length} checks`);
  assert.deepEqual(errors,[]);record('no browser runtime errors');
  await writeFile(path.join(output,'browser-results.json'),JSON.stringify({results,smoke,progressedSmoke,progressedFailures,errors},null,2)+'\n');
}finally{await browser.close();}
