// F14-A — ROUTE EXECUTOR.
//
// Executes the declarative steps a fragment submits (or the accepted baseline uses). It depends only on a tiny page
// adapter — goto/reload/evaluate/waitForFunction/waitTimeout/click/screenshot/viewport/errors/snapshot — so the same
// executor runs against Playwright in the browser and against a fake in the harness self-tests.
//
// A step is a small object; a route is {steps:[...], assertions:[...], backout:{steps,assertions}}.
const toRegex=value=>value instanceof RegExp?value:new RegExp(value,'i');

function assertResults(assertions,page,history){
  return (async()=>{
    const failures=[];
    for(const a of assertions||[]){
      let actual;
      try{actual=await page.evaluate(a.expression);}catch(error){failures.push({message:a.message||a.expression,error:String(error.message||error),expression:a.expression});continue;}
      let ok=true,expected;
      if('equals' in a){expected=a.equals;ok=JSON.stringify(actual)===JSON.stringify(expected);}
      else if('contains' in a){expected=a.contains;ok=String(actual).includes(String(expected));}
      else if('truthy' in a){expected=!!a.truthy;ok=!!actual===expected;}
      else{expected=true;ok=!!actual;}
      history.push({kind:'assert',message:a.message||a.expression,ok,actual:summarize(actual)});
      if(!ok)failures.push({message:a.message||a.expression,expression:a.expression,expected,actual:summarize(actual)});
    }
    return failures;
  })();
}

// Keep bundle/history values small and JSON-safe; never echo author text at length.
function summarize(value){
  if(value===undefined)return null;
  try{const text=JSON.stringify(value);return text&&text.length>400?`${text.slice(0,400)}…`:JSON.parse(text??'null');}catch(e){return String(value).slice(0,200);}
}

export async function executeRoute(page,route,{shotsDir=null,historyLimit=400}={}){
  const history=[];const screenshots=[];let failures=[];
  const step=async(s,phase)=>{
    const record={phase,action:s.action};
    try{
      if(s.action==='goto'){await page.goto(s.url);record.url=s.url;}
      else if(s.action==='reload'){await page.reload();}
      else if(s.action==='wait'){await page.waitTimeout(s.ms??150);}
      else if(s.action==='waitFor'){await page.waitForFunction(s.expression,{timeout:s.timeout??15000});record.expression=s.expression;}
      else if(s.action==='click'){await page.click(s.selector,{position:s.position});record.selector=s.selector;}
      else if(s.action==='tap'){await page.click(s.selector,{position:{x:s.x,y:s.y}});record.selector=s.selector;record.x=s.x;record.y=s.y;}
      else if(s.action==='choice'){
        const picked=await page.evaluate(idx=>{
          const els=[...document.querySelectorAll('.adv-choice')].filter(b=>!b.disabled);if(!els.length)return null;
          const at=idx<0?els.length-1:Math.min(idx,els.length-1);els[at].click();return at;
        },s.index??-1);
        record.picked=picked;
      }
      else if(s.action==='eval'){const value=await page.evaluate(s.script,s.arg);record.value=summarize(value);record.saveAs=s.saveAs||null;if(s.saveAs)history.push({kind:'value',name:s.saveAs,value:summarize(value)});}
      else if(s.action==='record'){const value=await page.evaluate(s.expression);record.value=summarize(value);history.push({kind:'record',name:s.as||'value',value:summarize(value)});}
      else if(s.action==='snapshot'){const value=await page.snapshot();record.bytes=JSON.stringify(value||null).length;history.push({kind:'snapshot',name:s.as||'state',value:summarize(value)});}
      else if(s.action==='screenshot'){const file=shotsDir?await page.screenshot(s.name||'shot'):null;record.name=s.name||'shot';if(file)screenshots.push(file);}
      else if(s.action==='expect'){failures=failures.concat(await assertResults([s],page,history));record.result=failures.length?'FAIL':'ok';}
      else throw new Error(`unknown action ${JSON.stringify(s.action)}`);
    }catch(error){record.error=String(error.message||error);failures.push({message:`step ${s.action} failed`,expression:s.selector||s.expression||s.url||'',actual:record.error});}
    if(history.length<historyLimit)history.push(record);
  };
  for(const s of route.steps||[])await step(s,'run');
  if(!failures.length)failures=failures.concat(await assertResults(route.assertions,page,history));
  // Backout / retry validation, when the route declares it.
  let backout=null;
  if(route.backout&&!failures.length){
    const before=await page.snapshot();
    for(const s of route.backout.steps||[])await step(s,'backout');
    let extra=failures.concat(await assertResults(route.backout.assertions,page,history));
    if(!extra.length)failures=extra,backout={ok:true,before:summarize(before),after:summarize(await page.snapshot())};
    else{backout={ok:false,before:summarize(before),failures:extra};failures=extra;}
  }
  const errors=page.errors?await page.errors():{};
  return {ok:failures.length===0,failures,history,screenshots,backout,errors};
}
