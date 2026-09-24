(function(){
 // DEV-only BTF controls (visible with ?dev=1 / F2). Neutral codes only; never exposes sealed content.
 function mount(){
  const panel=document.querySelector('#devPanel');if(!panel||panel.querySelector('.btf-dev'))return;
  const box=document.createElement('section');box.className='btf-dev';box.innerHTML=`<div class="dev-title">BEFORE THE FAME</div>
  <label>CHARACTER DISPLAY SCALE <select id="btfScale">${RADisplay.options.map(v=>`<option value="${v}" ${v===RADisplay.multiplier?'selected':''}>${v}×</option>`).join('')}</select></label>
  <button type="button" data-btf="sleep">SLEEP → NEXT DAY</button><button type="button" data-btf="week">SKIP 7 DAYS</button>
  <button type="button" data-btf="money">+$1,000,000</button><button type="button" data-btf="momentum">LOG MOMENTUM</button>
  <label>RUN ADVENTURE <select id="btfAdv"></select></label><button type="button" data-btf="run">RUN</button>
  <label>MINIGAME <select id="btfMini">${RAMinigames.list().map(m=>`<option value="${m.id}">${m.title}</option>`).join('')}</select></label><button type="button" data-btf="mini">PLAY</button>
  <pre id="btfOut" class="dev-readout"></pre>`;
  panel.append(box);
  const fill=()=>{box.querySelector('#btfAdv').innerHTML=RAAdventures.all().map(a=>`<option value="${a.id}">${a.id} · ${a.title}</option>`).join('');};fill();
  const out=t=>{box.querySelector('#btfOut').textContent=t;};
  box.querySelector('#btfScale').addEventListener('change',e=>{RADisplay.set(e.target.value);out(`scale ${RADisplay.multiplier}× (re-enter a scene to relayout)`);});
  box.addEventListener('click',async e=>{const b=e.target.closest('[data-btf]');if(!b)return;const a=b.dataset.btf;
   if(a==='sleep'||a==='week'){for(let i=0;i<(a==='week'?7:1);i++)RAClock.sleep();RABedroomLife.refresh();out(`day ${RALife.today().day}`);}
   if(a==='money'){RALife.addMoney(1e6);out('$'+RALife.money());}
   if(a==='momentum'){const m=RALife.life().momentum;out(JSON.stringify({exp:m.expression,con:m.connection,own:m.ownership,leg:m.legend,chaos:m.chaos,spark:m.sparkId,eligible:m.fameEligible},null,1));}
   if(a==='run'){fill();const id=box.querySelector('#btfAdv').value;if(RAAdventures.active())RAAdventures.abandon();RAAdventures.start(id,{from:'dev'});await RAScenes.go('adventure',{});}
   if(a==='mini'){const r=await RAMinigames.launch(box.querySelector('#btfMini').value,{lab:true});out(JSON.stringify({outcome:r.outcome,score:r.score}));}
  });
 }
 document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0));
})();
