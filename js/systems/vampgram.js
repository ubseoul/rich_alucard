(function(){
 // VampGram feed: Rich's posts + world posts written by adventures + ambient city posts that read the save
 // (vampire pressure headlines, Obas, elders who address Rich by his rep tier).
 const life=()=>RAState.get().life;
 const feedState=()=>{const f=life().phone.feed;return Array.isArray(f)?f:[];};
 function post(p){const list=[...feedState()];const id=p.id||`vg:${RALife.today().day}:${list.length}`;if(list.some(x=>x.id===id))return false;list.unshift({day:RALife.today().day,likes:0,...p,id,seen:false});RAState.patch('life.phone.feed',list.slice(0,80));return true;}
 function ambient(){
  const L=RALife.L(),d=L.day,out=[],pressure=life().ecology.pressure||0,t=RASealed.tuning('pressure');
  const heads=['BAT SIGHTINGS UP IN SILVER LAKE','HUNTER SEEN ON SUNSET','A CONVERTED GIRL STOPPED POSTING. NOBODY SAYS WHY.'];
  if(pressure>=t.visible)out.push({id:`head:${d}`,handle:'vampgram.news',text:heads[Math.min(heads.length-1,Math.floor((pressure-t.visible)/2))],day:d});
  if(d%4===0)out.push({id:`jcircle:${d}`,handle:'j.circle',text:['LA is mine tonight.','the soirée list is closed.','somebody new is making noise downtown. cute.'][Math.floor(d/4)%3],likes:9000+d*31,day:d});
  if(d%6===3)out.push({id:`dragoon:${d}`,handle:'dragoon_of_the_north',text:'…',likes:22000,day:d});
  if(L.flag('ogunsRaveCompleted')&&d%5===1)out.push({id:`ogun:${d}`,handle:'ogun',text:'next one soon. bring yourself.',likes:4100,day:d});
  if(L.followers>0&&d%3===0)out.push({id:`elder:${d}`,handle:'richalucard',text:'…still here.',likes:Math.floor(L.followers/12),elder:['cute','cute','go off young man','respect, Rich','Mr. Alucard.'][Math.min(4,L.rep+(L.rep>=3?1:0))],day:d});
  return out;
 }
 function feed(){return [...feedState(),...ambient()].sort((a,b)=>(b.day||0)-(a.day||0));}
 function unseen(){return feedState().filter(p=>!p.seen).length;}
 function markSeen(){const list=feedState();if(list.some(p=>!p.seen))RAState.patch('life.phone.feed',list.map(p=>({...p,seen:true})));}
 window.RAVampGram={post,feed,unseen,markSeen};
})();
