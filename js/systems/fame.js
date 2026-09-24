(function(){
 // LIFE MOMENTUM → FAME (VOL 1 §5.3, A40). Hidden. Eligibility: Day ≥ 35 AND ≥3 of 5 dimensions lit AND one
 // SPARK has fired. The NEXT SLEEP after eligibility plays the protected ending. No warning. No meter.
 const L=()=>RALife.life();
 const DIMS=['expression','connection','ownership','legend','chaos'];
 function sparkFired(){return !!L().momentum.sparkId;}
 function checkSpark(){
  if(sparkFired())return;const m=L().momentum;
  const sealed=RASealed.fire('SPARK',{momentum:m,life:L()});
  if(sealed?.id){RAState.patch('life.momentum.sparkId',sealed.id);return;}
  // PROVISIONAL neutral spark: the strongest lived dimension reaching threshold. No content attached.
  const t=RASealed.tuning('spark').threshold;const top=DIMS.map(d=>[d,Number(m[d])||0]).sort((a,b)=>b[1]-a[1])[0];
  if(top[1]>=t)RAState.patch('life.momentum.sparkId',`neutral:${top[0]}`);
 }
 function eligible(){const day=RALife.today().day;if(day>=RASealed.tuning('fameSafetyDay')&&RALife.litDimensions().length>=1)return true;return day>=RASealed.tuning('fameMinDay')&&RALife.litDimensions().length>=3&&sparkFired();}
 // Night handler: evaluate at bedtime so the NEXT wake is the ending.
 RAClock.onWake('fame-night',-10,()=>{if(L().momentum.fameFired)return;checkSpark();if(eligible())RAState.patch('life.momentum.fameEligible',true);});
 function claimsWake(){return !!L().momentum.fameEligible&&!L().momentum.fameFired;}
 async function play(){
  RAState.patch('life.momentum.fameFired',true);RAState.recordEvent({id:'fame-night',type:'fame',day:RALife.today().day});
  const followers=Math.max(10000,(Number(L().resources.followers)||0)+10000);RAState.patch('life.resources.followers',followers);
  const screen=document.querySelector('#screen');const o=document.createElement('div');o.className='fame-ending';screen.append(o);
  const step=(html,ms)=>new Promise(r=>{o.innerHTML=html;setTimeout(r,ms);});
  window.RABedroom?.setRichState?.('sleeping');
  await step('<div class="fame-buzz">bzzt</div>',1400);
  await step('<div class="fame-buzz">bzzt bzzt bzzt</div>',1400);
  o.classList.add('clear');window.RABedroom?.setRichState?.('drowsy_wake');
  await step('<div class="fame-line">huh</div>',2200);
  window.RABedroom?.setRichState?.('phone_reaction');
  await step('<div class="fame-line">10,000 followers?</div>',2800);
  o.classList.remove('clear');
  await step('',900);
  await step('<div class="fame-title">RICH ALUCARD</div>',3400);
  const receipts=L().receipts||[];
  const credits=['BEFORE THE FAME','','a life, in receipts:',...receipts.map(r=>`DAY ${r.day} · ${r.caption}`),'','thank you for living here.'];
  await step(`<div class="fame-credits"><div class="fame-roll">${credits.map(c=>`<p>${String(c).replace(/</g,'&lt;')}</p>`).join('')}</div></div>`,Math.min(60000,9000+receipts.length*1400));
  o.innerHTML='<button type="button" class="fame-continue">THE NEXT MORNING</button>';
  o.querySelector('button').addEventListener('click',()=>{o.remove();RAClock.wake({first:true});window.RABedroomLife?.build?.();window.RABedroomLife?.showMail?.();},{once:true});
 }
 // LEGEND is lit by finishing authored weird adventures (VOL 1 §5.3: "4+ authored weird adventures").
 const LEGEND=['A00','A09','A10','A15','A18','A19','A20','A25','A27','A28','A30','A31','A32','A44','A47','A50','A51','A52','A56'];
 const CHAOS=['A23','A29','A28'];
 document.addEventListener('ra:adventure-complete',e=>{const id=e.detail?.id;if(LEGEND.includes(id))RALife.light('legend',1,`legend:${id}`);if(CHAOS.includes(id))RALife.light('chaos',1,`chaos:${id}`);});
 window.RAFame={eligible,claimsWake,play,checkSpark,dims:DIMS,LEGEND};
})();
