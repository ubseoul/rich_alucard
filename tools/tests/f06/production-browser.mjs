// Tests the integration-owner's projected loader response without changing owner files.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {expectedIndex} from '../../loader.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.RA_PLAYWRIGHT_PATH||'playwright-core');
const projected=await expectedIndex();
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.ttf':'font/ttf','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
  const rel=decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '')||'index.html';
  const file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)) {res.writeHead(403);res.end();return;}
  try {const body=rel==='index.html'?projected:await fs.readFile(file);res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);}
  catch {res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.RA_CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=`http://127.0.0.1:${server.address().port}/?dev=1&ff=F06.rainmaker`;
try {
  await page.goto(url); await page.waitForFunction(()=>window.RAF06Rainmaker&&window.RAPhone);
  await page.evaluate(async()=>{RAState.reset();await RAScenes.go('bedroom',{dev:true});RAPhoneRegistry.unlock('rainmaker');RAPhone.openApp('rainmaker');});
  await page.getByRole('button',{name:'MAKE IT RAIN',exact:true}).click();
  await page.getByRole('dialog',{name:'MAKE IT RAIN',exact:true}).waitFor();
  const before=await page.evaluate(()=>RALife.money());
  const canvas=page.locator('[role="dialog"] canvas');
  const box=await canvas.boundingBox(); assert(box.width>0&&box.height>0);
  const x=box.x+box.width*.5;
  await page.mouse.move(x,box.y+box.height*.9);await page.mouse.down();
  await page.mouse.move(x,box.y+box.height*.46,{steps:14});
  await page.mouse.move(x,box.y+box.height*.12,{steps:2});await page.mouse.up();
  const paid=await page.evaluate(()=>({money:RALife.money(),state:RAF06Rainmaker.state(),ledger:RAMoneyLedger.entries()}));
  assert(paid.money<before,'pointer gesture must spend real shared money');
  assert.equal(paid.state.spent,before-paid.money);
  assert.equal(paid.ledger.at(-1).source,'rainmaker:flick');
  await page.reload();await page.waitForFunction(()=>window.RAF06Rainmaker);
  const reloaded=await page.evaluate(()=>({money:RALife.money(),state:RAF06Rainmaker.state()}));
  assert.equal(reloaded.money,paid.money);assert.equal(reloaded.state.active,null);assert.equal(reloaded.state.completed,0);
  await page.evaluate(async()=>{await RAScenes.go('bedroom',{dev:true});RAPhone.openApp('rainmaker');});
  await page.getByRole('button',{name:'MAKE IT RAIN',exact:true}).click();
  await page.getByRole('button',{name:'BACK',exact:true}).click();
  assert.equal(await page.getByRole('dialog',{name:'MAKE IT RAIN',exact:true}).count(),0);
  assert.equal(await page.evaluate(()=>RAPhone.page()),'app:rainmaker');
  // Natural round: wait for visible result, then reload and assert no duplicate completion.
  await page.getByRole('button',{name:'MAKE IT RAIN',exact:true}).click();
  await page.getByRole('button',{name:'RUN IT BACK',exact:true}).waitFor({state:'visible',timeout:35000});
  const result=await page.evaluate(()=>RAF06Rainmaker.state());assert.equal(result.completed,1);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog',{name:'MAKE IT RAIN',exact:true}).count(),0);
  await page.reload();await page.waitForFunction(()=>window.RAF06Rainmaker);
  assert.deepEqual(await page.evaluate(()=>RAF06Rainmaker.state()),result);
  await page.evaluate(()=>{RAFeatures.set('F06.rainmaker',false);});
  assert.equal(await page.evaluate(()=>RAF06Rainmaker.launch()),false);
  assert.deepEqual(errors,[]);
  console.log('PASS projected production browser: phone route, real pointer ledger expense, reload, natural completion, BACK/Escape, flag OFF, no page errors');
} finally {await browser.close();await new Promise(r=>server.close(r));}

