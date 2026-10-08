// Legendary Pass P5: actual spatial Detroit operation. No reward or strategic save owner lives here.
export const MINIGAME_ID = 'LEGENDARY-P5-DETROIT';
export const LOT = Object.freeze({
  width:9,height:9,tile:26,start:{x:1,y:7},source:{x:7,y:1},exit:{x:7,y:7},limit:24,
  walls:[[3,1],[3,2],[3,3],[1,4],[2,4],[5,5],[5,6],[7,4],[8,4]].map(([x,y])=>Object.freeze({x,y})),
  patrol:[[4,7],[4,6],[4,5],[4,4],[4,3],[4,2],[4,3],[4,4],[4,5],[4,6]].map(([x,y])=>Object.freeze({x,y}))
});
const same=(a,b)=>a.x===b.x&&a.y===b.y;
const copy=v=>structuredClone(v);
const vectors={N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]};
export function passable(p,lot=LOT){
  return Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.y>=0&&p.x<lot.width&&p.y<lot.height&&!lot.walls.some(w=>same(w,p));
}
export function newRun(){return {position:{...LOT.start},carrying:false,phase:'outbound',moves:0,alerts:0,log:[]};}
export function traceMove(state,dir,length,lot=LOT){
  const v=vectors[dir],path=[];let p={...state.position},blocked=false,slide=false;
  if(!v||!Number.isInteger(length)||length<1||length>8||['win','lose'].includes(state.phase))return {path,blocked:false,slide:false,invalid:true};
  for(let i=0;i<length;i++){
    const n={x:p.x+v[0],y:p.y+v[1]};
    if(!passable(n,lot)){blocked=true;break;}
    path.push(n);p=n;
  }
  // A long actual move attempts ONE extra tile. The slide cannot recurse, skip an obstacle, or leave the lot.
  if(path.length>3){
    slide=true;const n={x:p.x+v[0],y:p.y+v[1]};
    if(passable(n,lot)){path.push(n);p=n;}else blocked=true;
  }
  return {path,position:p,blocked,slide,invalid:false};
}
export function move(state,dir,length,lot=LOT){
  const t=traceMove(state,dir,length,lot);
  if(t.invalid||!t.path.length)return {state:copy(state),trace:t,changed:false};
  const next=copy(state),patrol=lot.patrol[state.moves%lot.patrol.length];
  next.position={...t.position};next.moves++;
  const spotted=t.path.some(p=>same(p,patrol));
  if(spotted)next.alerts++;
  if(!next.carrying&&same(next.position,lot.source)){next.carrying=true;next.phase='return';}
  if(next.carrying&&same(next.position,lot.exit))next.phase='win';
  else if(next.alerts>=3||next.moves>=lot.limit)next.phase='lose';
  next.log.push({dir,length,path:t.path.map(p=>({...p})),slide:t.slide,blocked:t.blocked,spotted});
  return {state:next,trace:t,changed:true};
}

// The crew/car, loadout, seats, approach and plays counter come from the native carStage.
// Spatial failure is a clean withdrawal; this authored operation invents no wounds, deaths, cash or guns.
export function spatialRecord(P,run){
  const win=run.phase==='win';
  if(!win&&run.phase!=='lose')throw Error('Detroit has no completed outcome');
  return {
    seed:P.seed,night:P.night,job:'P5',jobName:'THE DETROIT RUN',shape:P.job.shape,car:P.carId,
    approach:P.approach,crew:P.crew.map(o=>o.id),seats:{...P.seat},
    klass:win?'CLEAN':'WITHDRAWN',win,final:win?'SOURCE SECURED':'CREW WITHDREW',steps:run.moves,
    folded:false,bailed:false,fellBack:false,oba:false,getaway:win?'CLEAN':'WITHDRAWAL',
    finalStatus:Object.fromEntries(P.crew.map(o=>[o.id,'READY'])),
    lost:{cars:[],guns:[]},pot:{cash:0,crates:[]},heatDelta:0,spent:0,pocketLoss:0,crash:false,
    storyFlags:[],rescued:[],captives:[],newCombos:[],firedCombos:[],gunGifts:[],lineLog:[],
    nerveEnd:P.crew.map(o=>[o.id,o.nerve]),answers:[...P.answers,{t:'DETROIT',a:copy(run.log)}],
    stateOut:{roster:P.roster,bonds:P.bonds,known:P.known,cars:P.cars,garage:P.garage,weirdSeen:P.weirdSeen,armory:P.armory},
    build3Seam:{cards:['P5-spatial'],pullSaved:[],identityTalks:[]},
    detroit:{v:1,moves:run.moves,alerts:run.alerts,carrying:run.carrying,log:copy(run.log)}
  };
}

// One-shot transport. The existing RAShowdown/RAWarRoomPlay owner validates and consumes its receipt.
export function detroitTransport(req,{signal,document:doc=globalThis.document,url='assets/sealed/play/detroit.html'}={}){
  return new Promise(resolve=>{
    const origin=globalThis.location.origin,frame=doc.createElement('iframe');
    frame.id='legendary-detroit-frame';frame.title='THE DETROIT RUN';
    frame.src=url+'?embed=1'+String(globalThis.location.search||'').replace(/^\?/,'&');
    frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483000;background:#000';
    let done=false,ready=false;
    const decline=()=>({schema:'F01.play_result',version:1,requestId:req.requestId,status:'DECLINED',cash:{gain:0,spent:0}});
    const finish=res=>{if(done)return;done=true;clearTimeout(timer);globalThis.removeEventListener('message',listen);signal?.removeEventListener('abort',abort);frame.remove();resolve(res);};
    const abort=()=>finish(decline());
    const listen=e=>{
      if(e.origin!==origin||e.source!==frame.contentWindow||!e.data)return;
      if(e.data.type==='F01.play_ready'&&!ready){ready=true;clearTimeout(timer);frame.contentWindow.postMessage({type:'F04.play_request',request:{...req,build3P5:true,build3S11:{...req.build3S11,detroit:true}}},origin);}
      if(e.data.type==='F01.play_result'&&e.data.result?.requestId===req.requestId)finish(e.data.result);
    };
    const timer=setTimeout(()=>finish({schema:'F01.play_result',version:1,requestId:req.requestId,status:'REFUSED',code:'PLAY_UNAVAILABLE',cash:{gain:0,spent:0}}),20000);
    globalThis.addEventListener('message',listen);signal?.addEventListener('abort',abort,{once:true});
    if(signal?.aborted){abort();return;}doc.body.append(frame);
  });
}

export function installDetroit({B,eligible=()=>B.S11.detroitEligible(),minigames=globalThis.RAMinigames,event=(name,data)=>globalThis.RALegendary.event(name,data),transport=detroitTransport}={}){
  if(!B||!minigames)throw Error('Detroit requires the private stage and native minigame registry');
  minigames.register(MINIGAME_ID,{title:'THE DETROIT RUN',mount(root,ctx){
    let disposed=false,receiptId=null;const aborter=new AbortController();
    const run=async()=>{
      const pending=globalThis.RAWarRoomPlay.pending();
      if(pending&&!String(pending.jobMeta?.id||'').startsWith('P5:')){ctx.finish({quit:true,outcome:'refused',data:{code:'OTHER_PLAY_PENDING'}});return;}
      if(!eligible()&&!pending){ctx.finish({quit:true,outcome:'refused'});return;}
      B.S11.update({detroitRunning:true});
      const send=req=>{receiptId=req.requestId;return transport(req,{signal:aborter.signal});};
      let out;
      try{
        if(pending)out=await globalThis.RAWarRoomPlay.resume({transport:send});
        else{
          const card=globalThis.RAWarRoomJobs.buildJobCard({type:'TAKE_THE_BLOCK',district:null});
          card.id='P5:'+globalThis.RALife.today().day;
          out=await globalThis.RAWarRoomPlay.launch(card,{transport:send});
        }
      }finally{B.S11.update({detroitRunning:false});}
      const accepted=out?.ok&&out.summary?.status==='COMPLETE'&&!out.errors?.length;
      const win=!!accepted&&out.summary.win===true;
      if(win)event('december.detroit',{receiptId,completed:true,win:true});
      if(disposed)return;
      ctx.finish({quit:out?.summary?.status==='DECLINED'||!accepted,outcome:win?'win':accepted?'lose':'refused',data:{requestId:receiptId}});
    };
    run().catch(e=>{if(!disposed)ctx.finish({quit:true,outcome:'refused',data:{code:String(e.message||e)}});});
    return {dispose(){if(disposed)return;disposed=true;aborter.abort();}};
  }});
  return {id:MINIGAME_ID};
}

const css = [
'@font-face{font-family:DetroitPixel;src:url(../../fonts/press-start-2p.ttf)}',
'.detroit{position:absolute;inset:0;background:#15151d;color:#e7e1ce;font-family:DetroitPixel,monospace;font-size:7px}',
'.detroit h1{font-size:10px;line-height:1.5;letter-spacing:0;color:#edc18c;position:absolute;top:12px;left:14px;margin:0}',
'.detroit [data-crew]{display:block;font-size:5px}.detroit [data-meter]{display:block}',
'.detroit .meta{position:absolute;top:32px;left:14px;width:242px;margin:0;font-size:6px;line-height:1.8;color:#b7b4b0}',
'.detroit .objective{position:absolute;top:66px;left:18px;width:234px;margin:0;height:10px;line-height:1.6;color:#f1e6c7;font-size:6px}',
'.detroit canvas{position:absolute;left:18px;top:78px;width:234px;height:234px;touch-action:none;border:1px solid #b09665;outline:none}',
'.detroit canvas:focus-visible{outline:2px solid #f1d37b;outline-offset:2px}',
'.detroit .status{position:absolute;top:317px;left:18px;width:234px;font-size:6px;line-height:1.6;min-height:18px}',
'.detroit button{font-family:inherit;font-size:7px;background:#29232d;border:1px solid #7c7066;border-radius:0;color:#f0e5c9;min-height:32px}',
'.detroit button:focus-visible{outline:2px solid #f1d37b}',
'.detroit .lengths{position:absolute;top:343px;left:18px;display:flex;gap:4px}',
'.detroit .lengths button{width:43px;height:32px}',
'.detroit .lengths button[aria-pressed=true]{background:#f1d37b;color:#16131c;border-color:#f1d37b}',
'.detroit .move{position:absolute;width:43px;height:34px;font-size:15px}',
'.detroit .north{top:382px;left:114px}.detroit .west{top:420px;left:66px}.detroit .east{top:420px;left:162px}.detroit .south{top:420px;left:114px}',
'.detroit .exit{position:absolute;top:383px;left:18px;width:83px;font-size:6px}',
'.detroit .help{position:absolute;top:461px;left:18px;font-size:5px;line-height:1.6}',
'.detroit .end{position:absolute;inset:0;background:#101019ef;padding:125px 22px 16px;display:flex;align-items:center;flex-direction:column;text-align:center;gap:16px;z-index:4;font-size:8px;line-height:1.8}',
'.detroit .end h2{font-size:12px;color:#f1d37b;line-height:1.8}.detroit .end button{width:210px;padding:14px}',
'.detroit .end p{font-size:7px}',
'.detroit-quit{position:absolute;top:78px;right:8px;min-height:34px;z-index:80;background:#23202b;border:1px solid #817366;color:#e6dbc8;padding:10px;font-size:8px}'
].join('\n');

export function mountBoard(root,{run=newRun(),sprite=null,reduced=false,onComplete=()=>{},onFinish=()=>{},onCancel=()=>{}}={}){
  let state=copy(run),length=1,busy=false,dead=false,hover=null,raf=null,last=null,pointer=null;
  const style=document.createElement('style');style.textContent=css;root.append(style);
  const panel=document.createElement('section');panel.className='detroit';panel.setAttribute('aria-label','Detroit parking lot operation');
  panel.innerHTML='<h1>THE DETROIT RUN</h1><p class="meta">DETROIT / SODIUM LIGHTS / SNOW<br><span data-crew></span><span data-meter></span></p><p class="objective"></p><canvas width="234" height="234" tabindex="0" role="application" aria-label="Parking lot. Tap a tile in your row or column to move. Long moves slide one extra tile."></canvas><p class="status" role="status" aria-live="polite"></p><div class="lengths" aria-label="Move distance">'+[1,2,3,4,5].map(n=>'<button data-length="'+n+'" aria-pressed="'+(n===1)+'">'+n+'</button>').join('')+'</div><button class="move north" data-dir="N" aria-label="Move north">↑</button><button class="move west" data-dir="W" aria-label="Move west">←</button><button class="move east" data-dir="E" aria-label="Move east">→</button><button class="move south" data-dir="S" aria-label="Move south">↓</button><button class="exit" data-quit>WITHDRAW</button><p class="help">1–5 DISTANCE · ARROWS / WASD MOVE<br>+ EXTRA SLIDE · RED LOOKOUT · ESC QUIT</p>';
  root.append(panel);
  const canvas=panel.querySelector('canvas'),g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
  const status=panel.querySelector('.status'),meter=panel.querySelector('[data-meter]'),objective=panel.querySelector('.objective');
  let visual={...state.position};
  function cell(p){return {x:p.x*26,y:p.y*26};}
  function car(p,i){
    const c=cell(p);g.fillStyle='#14151d';g.fillRect(c.x+3,c.y+3,20,22);g.fillStyle=i%2?'#55545d':'#453b46';g.fillRect(c.x+5,c.y+3,16,21);g.fillStyle='#a6a7b5';g.fillRect(c.x+6,c.y+4,14,3);g.fillStyle='#232732';g.fillRect(c.x+7,c.y+8,12,5);g.fillRect(c.x+7,c.y+18,12,4);g.fillStyle='#e6dcbf';g.fillRect(c.x+5,c.y+3,3,2);g.fillRect(c.x+18,c.y+3,3,2);
  }
  function render(){
    if(dead)return;
    g.fillStyle='#333442';g.fillRect(0,0,234,234);
    for(let y=0;y<9;y++)for(let x=0;x<9;x++){
      g.fillStyle=(x+y)%2?'#363844':'#31333e';g.fillRect(x*26+1,y*26+1,24,24);
      g.fillStyle='#aaa79c';g.fillRect(x*26+2,y*26+22,21,1);
      if((x*17+y*11)%7===0){g.fillStyle='#b0b3bc';g.fillRect(x*26+4,y*26+7,7,2);g.fillRect(x*26+15,y*26+4,3,2);}
    }
    // Sodium pools are hard pixel clusters; no bloom, filters or invented character art.
    for(const p of [{x:0,y:0},{x:8,y:2},{x:0,y:8}]){
      const c=cell(p);g.fillStyle='#77604a';g.fillRect(c.x,c.y,26,26);g.fillStyle='#ab8956';g.fillRect(c.x+4,c.y+4,18,18);g.fillStyle='#2b242c';g.fillRect(c.x+11,c.y+9,4,14);g.fillStyle='#f1bc64';g.fillRect(c.x+8,c.y+5,10,5);g.fillStyle='#ffda8a';g.fillRect(c.x+10,c.y+6,6,2);
    }
    const source=cell(LOT.source),exit=cell(LOT.exit);
    g.fillStyle='#b6b4af';g.fillRect(source.x+2,source.y+2,22,22);g.fillStyle='#372637';g.fillRect(source.x+4,source.y+6,18,14);g.fillStyle='#dcdbc9';g.fillRect(source.x+4,source.y+4,18,4);g.fillStyle='#bf5c55';g.fillRect(source.x+11,source.y+8,4,8);g.fillRect(source.x+8,source.y+11,10,3);
    g.fillStyle='#526955';g.fillRect(exit.x+1,exit.y+1,24,24);g.strokeStyle='#d6d0aa';g.strokeRect(exit.x+3.5,exit.y+3.5,19,19);g.fillStyle='#e3d59f';g.font='bold 6px monospace';g.fillText('EXIT',exit.x+3,exit.y+15);
    LOT.walls.forEach(car);
    const guard=LOT.patrol[state.moves%LOT.patrol.length],c=cell(guard);
    g.fillStyle='#704550';g.fillRect(c.x+2,c.y+2,22,22);g.strokeStyle='#dc8d82';g.strokeRect(c.x+2.5,c.y+2.5,21,21);
    g.fillStyle='#e6a497';g.fillRect(c.x+11,c.y+6,4,7);g.fillRect(c.x+11,c.y+17,4,3);
    if(hover){
      const preview=traceMove(state,hover.dir,hover.length);
      preview.path.forEach((p,i)=>{
        const c=cell(p);g.fillStyle=preview.slide&&i===preview.path.length-1&&preview.path.length>hover.length?'#ead69b':'#748b99';
        g.fillRect(c.x+10,c.y+11,7,3);g.fillRect(c.x+12,c.y+9,3,7);
      });
    }
    const a=cell(visual);
    g.fillStyle='#16131b';g.fillRect(a.x+5,a.y+18,17,4);
    if(sprite?.complete&&sprite.naturalWidth){
      // Approved Oga contact (40,88) sits exactly on the tile's ground point, including animation.
      const scale=.29;g.drawImage(sprite,Math.round(a.x+13-40*scale),Math.round(a.y+20-88*scale),Math.round(80*scale),Math.round(96*scale));
    }else{g.fillStyle='#ede3c6';g.fillRect(a.x+10,a.y+7,7,7);g.fillStyle='#a35661';g.fillRect(a.x+7,a.y+14,13,7);}
    if(state.carrying){g.fillStyle='#dedcc8';g.fillRect(a.x+19,a.y+13,5,6);g.fillStyle='#ad454b';g.fillRect(a.x+21,a.y+15,2,3);}
    meter.textContent='MOVES '+state.moves+'/'+LOT.limit+' · ALERT '+state.alerts+'/3';
    objective.textContent=state.carrying?'SOURCE ABOARD → GREEN EXIT':'STOP ON THE COOLER · THEN EXIT';
    panel.dataset.phase=state.phase;panel.dataset.position=state.position.x+','+state.position.y;panel.dataset.moves=state.moves;panel.dataset.alerts=state.alerts;
  }
  function disable(on){panel.querySelectorAll('[data-dir],[data-length]').forEach(b=>b.disabled=on);}
  function showEnd(){
    const win=state.phase==='win',end=document.createElement('div');end.className='end';end.setAttribute('role','dialog');
    end.innerHTML='<h2>'+ (win?'SOURCE SECURED':'CREW WITHDREW')+'</h2><p>'+ (win?'THE DECEMBER<br>BLACK 1970s MUSCLE CAR':'Everybody gets out.<br>The Detroit job can be tried again.')+'</p><button data-return>RETURN TO RICH</button>';
    panel.append(end);const button=end.querySelector('button');button.focus();
    button.addEventListener('click',()=>{if(dead)return;dead=true;cleanup();onFinish(copy(state));},{once:true});
  }
  function animate(path){
    return new Promise(resolve=>{
      let i=0,start=performance.now(),done=false;
      const finish=()=>{if(done)return;done=true;last=null;resolve();};last=finish;
      const tick=now=>{
        if(dead){finish();return;}
        const elapsed=now-start,step=reduced?0:85;
        while(i<path.length&&(step===0||elapsed>=step*(i+1))){visual={...path[i++]};render();}
        if(i>=path.length){raf=null;finish();return;}raf=requestAnimationFrame(tick);
      };
      raf=requestAnimationFrame(tick);
    });
  }
  async function command(dir,n=length){
    if(dead||busy||['win','lose'].includes(state.phase))return;
    hover=null;const outcome=move(state,dir,n);
    if(!outcome.changed){status.textContent='BLOCKED · CHOOSE A CLEAR TILE';render();return;}
    busy=true;disable(true);await animate(outcome.trace.path);
    if(dead)return;
    state=outcome.state;busy=false;disable(false);
    status.textContent=outcome.trace.slide?(outcome.trace.blocked?'SLIDE STOPPED SAFELY AT THE OBSTACLE':'ICE · ONE EXTRA TILE'):outcome.trace.blocked?'STOPPED AT THE OBSTACLE':state.carrying?'SOURCE ABOARD · GET TO THE EXIT':'STEADY · STOP AT THE SOURCE';
    if(outcome.trace.spotted)status.textContent='LOOKOUT SPOTTED THE CREW · '+state.alerts+'/3';
    render();if(['win','lose'].includes(state.phase)){onComplete(copy(state));if(!dead)showEnd();}
  }
  const dirAt=p=>{
    if(p.x===state.position.x&&p.y!==state.position.y)return {dir:p.y<state.position.y?'N':'S',length:Math.abs(p.y-state.position.y)};
    if(p.y===state.position.y&&p.x!==state.position.x)return {dir:p.x<state.position.x?'W':'E',length:Math.abs(p.x-state.position.x)};
    return null;
  };
  const tileAt=e=>{const r=canvas.getBoundingClientRect();return {x:Math.floor((e.clientX-r.left)/r.width*9),y:Math.floor((e.clientY-r.top)/r.height*9)};};
  canvas.addEventListener('pointerdown',e=>{if(busy||dead||e.isPrimary===false||e.button!==0)return;pointer=e.pointerId;hover=dirAt(tileAt(e));try{canvas.setPointerCapture(e.pointerId);}catch{}render();});
  canvas.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;hover=dirAt(tileAt(e));render();});
  canvas.addEventListener('pointerup',e=>{if(pointer!==e.pointerId)return;pointer=null;const intent=dirAt(tileAt(e));hover=null;if(intent)command(intent.dir,intent.length);else{status.textContent='MOVE IN YOUR ROW OR COLUMN';render();}});
  canvas.addEventListener('pointercancel',()=>{pointer=null;hover=null;render();});
  panel.querySelectorAll('[data-length]').forEach(b=>b.addEventListener('click',()=>{if(busy||dead)return;length=+b.dataset.length;panel.querySelectorAll('[data-length]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));status.textContent=length>3?'LONG MOVE · ONE EXTRA TILE ON ICE':'MOVE '+length+' TILE'+(length>1?'S':'');}));
  panel.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>command(b.dataset.dir)));
  function cancel(){if(dead||['win','lose'].includes(state.phase))return;dead=true;cleanup();onCancel();}
  panel.querySelector('[data-quit]').addEventListener('click',cancel);
  const key=e=>{
    if(dead||e.repeat)return;
    const dir={ArrowUp:'N',ArrowRight:'E',ArrowDown:'S',ArrowLeft:'W',w:'N',d:'E',s:'S',a:'W'}[e.key];
    if(dir){e.preventDefault();command(dir);}
    if(/^[1-5]$/.test(e.key)){e.preventDefault();panel.querySelector('[data-length="'+e.key+'"]').click();}
    if(e.key==='Escape'){e.preventDefault();cancel();}
  };
  document.addEventListener('keydown',key);
  sprite?.addEventListener('load',render,{once:true});
  function cleanup(){sprite?.removeEventListener('load',render);document.removeEventListener('keydown',key);if(raf!=null)cancelAnimationFrame(raf);last?.();last=null;}
  status.textContent='OVER 3 TILES: +1 SLIDE · TAP A TILE';
  render();canvas.focus();
  return {get state(){return copy(state);},command,dispose(){dead=true;cleanup();style.remove();panel.remove();}};
}

export async function bootDetroit(){
  const [E,W,AD,K,V,A,U]=await Promise.all([
    import('./engine.mjs'),import('../../frag/F01/play/world.mjs'),import('./adapter.mjs'),
    import('../../../assets/f01/play/feel-core.mjs'),import('../../../assets/f01/play/feel-scenes.mjs'),
    import('../../../assets/f01/play/feel-art.mjs'),import('../../../assets/f01/play/ui-core.mjs')
  ]);
  const q=new URLSearchParams(location.search);if(q.get('mute')==='1')K.settings.set({sound:false});
  if(q.get('reduce')==='1')K.settings.set({reduceMotion:true});
  K.applySettings();
  const bootStyle=document.createElement('style');bootStyle.textContent=css;document.head.append(bootStyle);
  const store=U.store,active=new Map(),RESULTS='legendary_detroit_results';
  async function run(req){
    const cached=store.get(RESULTS,{})[req?.requestId];if(cached)return cached;
    if(active.has(req?.requestId))return active.get(req.requestId);
    if(active.size)return AD.refusedResult(req,'PLAY_BUSY','Detroit is already running');
    const task=runOnce(req).finally(()=>active.delete(req.requestId));active.set(req.requestId,task);return task;
  }
  async function runOnce(req){
    const valid=globalThis.RAPlayContract.validateRequest(req);
    if(!valid.ok)return AD.refusedResult(req,'BAD_REQUEST','Invalid PLAY request',valid.errors);
    if(!(req.build3P5===true||req.build3S11?.detroit===true))return AD.refusedResult(req,'NOT_DETROIT','This transport is Detroit only');
    const w=AD.prepareWorld(req,store.get('world_f04',null)),cash0=w.cash,before=Object.fromEntries(req.roster.map(o=>[o.id,o.status]));
    let picked=AD.pitchFor(w,req);
    if(AD.needsRecovery(w,picked)){for(const c of AD.recoverableCars(w))W.recoverCar(w,c.id,{fee:0});picked=AD.pitchFor(w,req);}
    if(picked.refuse)return AD.refusedResult(req,picked.refuse.code,picked.refuse.reason);
    const cfg={seed:AD.seedFor(req,false),job:{...picked.pitch.job,band:[0,0]},night:w.night,state:w,nameIdx:0,pitcher:picked.pitch.pitcher};
    if(typeof E.crewSelection!=='function')return AD.refusedResult(req,'DETROIT_ADAPTER_MISSING','Native crew adapter unavailable');
    A.bindGunViews(w.iron);K.bindGunAudio(w.iron);
    let cancel;const cancelled=new Promise(resolve=>{cancel=resolve;});
    const quit=document.createElement('button');quit.className='detroit-quit';quit.textContent='WITHDRAW';document.getElementById('stage').append(quit);
    const decline=()=>AD.declinedResult(req,{cash0,w});
    quit.onclick=()=>cancel({quit:true});
    try{
      const pr=E.crewSelection(cfg);
      const selecting=V.crewScene({pr,w,job:{...cfg.job,name:'THE DETROIT RUN'},hints:[],pitcher:picked.pitch.pitcher,big:false,defense:false,lastCar:store.get('lastCar',null)});
      const nativeHeader=K.world.querySelector('.pre-top .m');if(nativeHeader)nativeHeader.textContent='SOURCE JOB · '+pr.minCrew+' OGA MIN.';
      const choice=await Promise.race([selecting,cancelled]);
      if(choice.quit){K.clear();return decline();}
      const P=E.crewSelection(cfg,choice.answer);if(P.carId)store.set('lastCar',P.carId);
      quit.remove();K.clear();K.fadeEl.style.opacity='0';
      const sprite=new Image();sprite.src=A.ogaSprite('standing',P.crew[0]?.id);
      const result=await new Promise(resolve=>{
        let completedReceipt=null;
        const board=mountBoard(K.world,{sprite,reduced:K.reduced(),onCancel:()=>{board.dispose();resolve(decline());},onComplete:run=>{try{
          const rec=spatialRecord(P,run);W.applyResult(w,rec,cfg.job);
          const res={...AD.buildResult(req,{rec,w,before,cash0}),detroit:rec.detroit};
          const validation=globalThis.RAPlayContract.validateResult(res);
          if(!validation.ok){board.dispose();resolve(AD.refusedResult(req,'BAD_RESULT',validation.errors.join(';')));return;}
          // Commit the actual result before RETURN can tear down the iframe. Same receipt survives a host reload.
          const cache=store.get(RESULTS,{});cache[req.requestId]=res;const keys=Object.keys(cache);keys.slice(0,Math.max(0,keys.length-32)).forEach(k=>delete cache[k]);
          store.set(RESULTS,cache);store.set('world_f04',w);U.counter.bump();completedReceipt=res;}catch(e){board.dispose();resolve(AD.refusedResult(req,'PLAY_ERROR',String(e.message||e)));}
        },onFinish:()=>{board.dispose();resolve(completedReceipt);}});
        K.world.querySelector('[data-crew]').textContent=P.crew.map(o=>o.short).join(' / ')+'\n';
      });
      return result;
    }catch(e){console.error(e);return AD.refusedResult(req,'PLAY_ERROR',String(e.message||e));}
    finally{quit.remove();}
  }
  globalThis.__raDetroit={run,LOT};
  const origin=location.origin,host=window.parent!==window?window.parent:null;
  if(host){
    window.addEventListener('message',async e=>{
      if(e.origin!==origin||e.source!==host||e.data?.type!=='F04.play_request')return;
      const result=await run(e.data.request);host.postMessage({type:'F01.play_result',result},origin);
    });
    host.postMessage({type:'F01.play_ready'},origin);
  }
}
