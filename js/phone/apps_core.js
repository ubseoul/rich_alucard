(function(){
 // Core Life OS apps. Every app is connected to the world; nothing here is a dead icon.
 const A=window.RAPhoneApps;const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const life=()=>RAState.get().life;
 const btn=(label,action,cls='')=>`<button type="button" class="phone-button ${cls}" data-phone-action="${esc(action)}">${label}</button>`;
 const threads=()=>life().phone.threads||{};
 function markRead(id){const all={...threads()};if(!all[id])return;all[id]=all[id].map(m=>({...m,read:true}));RAState.patch('life.phone.threads',all);window.RAPhone?.updateEntry?.();}
 function threadName(id){if(id==='family')return 'FAMILY 🇳🇬';const p=RABtfPeople.get(id);return p?p.name:id.toUpperCase();}
 function unread(filter){let n=0;for(const [id,t] of Object.entries(threads()))if(filter(id))n+=t.filter(m=>!m.read&&m.from!=='RICH').length;return n;}
 const isDM=id=>!!RABtfPeople.get(id)?.dateable;
 function threadMarkup(id,appId){
  const t=threads()[id]||[];markRead(id);
  const body=t.slice(-24).map(m=>`${m.from!=='RICH'&&id==='family'?`<p class="who">${esc(m.from)}</p>`:''}<p class="msg ${m.from==='RICH'?'me':''}">${esc(m.text)}</p>`).join('');
  const last=[...t].reverse().find(m=>m.choices&&!m.answered);
  const choices=last?last.choices.map((c,i)=>btn(esc(c.label),`do:${appId}:reply:${id}|${last.id}|${i}`)).join(''):'';
  return `<h1>${esc(threadName(id))}</h1><div class="phone-thread">${body||'<p class="phone-small">no messages.</p>'}</div>${choices?`<div class="phone-option-list">${choices}</div>`:''}`;
 }
 function reply(arg,api){
  const [id,msgId,i]=arg.split('|');const all={...threads()};const t=[...(all[id]||[])];const idx=t.findIndex(m=>m.id===msgId);if(idx<0)return;
  const msg=t[idx],choice=msg.choices?.[Number(i)];if(!choice)return;t[idx]={...msg,answered:true};
  if(choice.text!==false)t.push({id:`${msgId}:r`,from:'RICH',text:choice.say||choice.label.toLowerCase(),day:RALife.today().day,read:true});
  all[id]=t;RAState.patch('life.phone.threads',all);
  if(choice.tendency)RALife.tendency(choice.tendency);
  if(choice.points&&RABtfPeople.get(id))RARelations.add(id,choice.points,{reason:'text'});
  if(choice.fx)window.RAReplyFx?.[choice.fx]?.(id,choice);
  if(choice.temptation){window.RATemptations?.act?.(choice.temptation);return;}
  api.refresh();
 }
 // TEXTS — homies, family thread, everyone who isn't an InstaHoe DM.
 A.register({id:'texts',label:'TEXTS',order:5,badge:()=>unread(id=>!isDM(id)),
  render(sub){if(sub)return threadMarkup(sub,'texts');const list=Object.entries(threads()).filter(([id])=>!isDM(id)).sort((a,b)=>(b[1].at(-1)?.day||0)-(a[1].at(-1)?.day||0));
   return `<h1>TEXTS</h1>${list.map(([id,t])=>{const u=t.filter(m=>!m.read&&m.from!=='RICH').length;return btn(`${esc(threadName(id))}${u?` <i class="phone-badge">${u}</i>`:''}<br><small>${esc(t.at(-1)?.text||'')}</small>`,`app:texts:${id}`);}).join('')||'<p class="phone-small">nobody yet.</p>'}`;},
  onAction(act,arg,api){if(act==='reply')reply(arg,api);}});
 // INSTAHOE — contacts, profiles (her LIKES are on her profile), DMs, date requests.
 A.register({id:'instahoe',label:'InstaHoe',canon:true,badge:()=>unread(isDM),
  render(sub){
   if(sub?.startsWith('dm:'))return threadMarkup(sub.slice(3),'instahoe')+btn('PROFILE',`app:instahoe:p:${sub.slice(3)}`);
   if(sub?.startsWith('p:')){const id=sub.slice(2),p=RABtfPeople.get(id),r=RARelations.get(id);if(!p||!r)return '<p>gone.</p>';
    const likes=(p.likes||[]).map(l=>window.RADating?.spotLabel?.(l)||l).join(' · ');
    const date=window.RADating?.canAsk?.(id);
    return `<h1>${esc(p.name)}</h1><div class="phone-card"><b>${esc(p.species.toUpperCase())}</b>LIKES: ${esc(likes)}<br>${r.flags?.onlyvamps?'ALSO ON ONLYVAMPS.<br>':''}${p.scope==='FULL'||r.datesCount<1?'':''}</div>${date?btn('ASK HER OUT',`do:instahoe:date:${id}`):`<p class="phone-small">${esc(window.RADating?.whyNot?.(id)||'not tonight.')}</p>`}${btn('DMS',`app:instahoe:dm:${id}`)}`;}
   const known=RARelations.known({dateable:true}).sort((a,b)=>(b.lastSeenDay||0)-(a.lastSeenDay||0));
   return `<h1>INSTAHOE</h1><p class="phone-small">FOLLOWERS ${new Intl.NumberFormat('en-US').format(life().resources.followers||0)}</p>${known.map(p=>{const u=(threads()[p.id]||[]).filter(m=>!m.read&&m.from!=='RICH').length;return btn(`${esc(p.catalog.name)}${u?` <i class="phone-badge">${u}</i>`:''}<br><small>${esc(p.catalog.species)}</small>`,`app:instahoe:p:${p.id}`);}).join('')||'<p class="phone-small">nobody yet.</p>'}`;
  },
  async onAction(act,arg,api){if(act==='reply')reply(arg,api);if(act==='date'){await api.close();window.RADating?.plan?.(arg);}}});
 // VAMPGRAM — red/black vampire feed; headlines reflect the world; Obas post; Rich's drops land here.
 A.register({id:'vampgram',label:'VampGram',canon:true,badge:()=>window.RAVampGram?.unseen?.()||0,
  render(sub){const feed=window.RAVampGram?.feed?.()||[];window.RAVampGram?.markSeen?.();
   return `<h1>VAMPGRAM</h1><p class="phone-small">@richalucard · ${new Intl.NumberFormat('en-US').format(life().resources.followers||0)} followers</p>${feed.slice(0,24).map(p=>`<div class="phone-card vg-post"><b>@${esc(p.handle)}</b>${esc(p.text)}${p.likes?`<br><span class="phone-small">♥ ${p.likes}${p.elder?' · an elder commented "'+esc(p.elder)+'"':''}</span>`:''}${p.action?btn(esc(p.action.label),p.action.go):''}</div>`).join('')||'<p class="phone-small">quiet night.</p>'}`;}});
 // RECEIPTS — the memoir app (VOL 5 §9.3). Automatic photo-cards; share one to VampGram.
 A.register({id:'receipts',label:'RECEIPTS',order:40,
  render(sub){const list=[...(life().receipts||[])].reverse();const byMonth={};for(const r of list){const m=`MONTH ${Math.floor((r.day-1)/28)+1}`;(byMonth[m]=byMonth[m]||[]).push(r);}
   return `<h1>RECEIPTS</h1>${Object.entries(byMonth).map(([m,rs])=>`<p class="phone-speaker">${m}</p>${rs.map(r=>`<div class="phone-card receipt-card"><b>DAY ${r.day} · ${esc(r.dateLabel||'')}</b>${esc(r.caption)}${r.shared?'<br><span class="phone-small">SHARED</span>':btn('SHARE TO VAMPGRAM',`do:receipts:share:${r.id}`)}</div>`).join('')}`).join('')||'<p class="phone-small">nothing yet. go live.</p>'}`;},
  onAction(act,arg,api){if(act==='share'){const list=life().receipts.map(r=>r.id===arg?{...r,shared:true}:r);RAState.patch('life.receipts',list);const r=list.find(x=>x.id===arg);RALife.addFollowers(5+Math.floor(RALife.hash(RALife.today().day)%10));window.RAVampGram?.post?.({handle:'richalucard',text:r.caption,likes:12});api.refresh();}}});
 // ONLYVAMPS / RICHBOIMPORTS registered by their lanes; canon placeholders keep in-world locked lines.
 A.register({id:'onlyvamps',label:'ONLYVAMPS',canon:true,render:()=>window.RAOnlyVamps?.markup?.()||'<h1>ONLYVAMPS</h1><p class="phone-small">invite only.</p>',onAction:(a,arg,api)=>window.RAOnlyVamps?.action?.(a,arg,api)});
 A.register({id:'richboi',label:'RICHBOIMPORTS',canon:true,render:()=>window.RACars?.richboiMarkup?.()||'<h1>RICHBOIMPORTS</h1>',onAction:(a,arg,api)=>window.RACars?.richboiAction?.(a,arg,api)});
 window.RAPhoneThreads={markRead,reply,threadName};
})();
